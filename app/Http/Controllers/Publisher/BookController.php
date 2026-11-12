<?php

namespace App\Http\Controllers\Publisher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Publisher\SaveBookRequest;
use App\Models\Author;
use App\Models\Book;
use App\Models\Category;
use App\Models\PublisherRegistration;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Throwable;

class BookController extends Controller
{
    public function index(Request $request): Response
    {
        $publisher = $this->publisherRegistration($request);
        $status = $request->string('status')->toString();
        $search = trim($request->string('search')->toString());

        $books = Book::query()
            ->where('publisher_registration_id', $publisher->id)
            ->with(['category', 'authors'])
            ->when(in_array($status, ['draft', 'published'], true), fn ($query) => $query->where('publication_status', $status))
            ->when($search !== '', fn ($query) => $query->whereRaw('title ILIKE ?', ["%{$search}%"]))
            ->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Book $book): array => $this->bookPayload($book));

        return Inertia::render('publisher/books/index', [
            'books' => $books,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('publisher/books/form', $this->formOptions());
    }

    public function store(SaveBookRequest $request): RedirectResponse
    {
        $publisher = $this->publisherRegistration($request);
        Gate::authorize('create', Book::class);

        $paths = [];

        try {
            $validated = $request->validated();
            $pdf = $request->file('book_pdf');
            $cover = $request->file('cover');
            if (! $pdf instanceof UploadedFile || ! $cover instanceof UploadedFile) {
                throw new RuntimeException('Berkas buku belum lengkap.');
            }
            $pdfPath = $this->storeUpload($pdf, 'publisher-books', 'local');
            $paths[$pdfPath] = 'local';
            $coverPath = $this->storeUpload($cover, 'publisher-covers', 'public');
            $paths[$coverPath] = 'public';

            DB::transaction(function () use ($publisher, $validated, $pdf, $pdfPath, $coverPath): void {
                $book = Book::query()->create([
                    'publisher_registration_id' => $publisher->id,
                    'category_id' => $validated['category_id'],
                    'title' => trim($validated['title']),
                    'edition' => filled($validated['edition'] ?? null) ? trim((string) $validated['edition']) : null,
                    'genre' => filled($validated['genre'] ?? null) ? trim((string) $validated['genre']) : null,
                    'synopsis' => trim($validated['synopsis']),
                    'page_count' => $validated['page_count'],
                    'original_price_rupiah' => $validated['original_price_rupiah'],
                    'discount_percentage' => $validated['discount_percentage'],
                    'publication_status' => $validated['publication_status'],
                    'cover_path' => $coverPath,
                    'pdf_path' => $pdfPath,
                    'pdf_size_bytes' => $pdf->getSize(),
                    'pdf_checksum' => hash_file('sha256', $pdf->getRealPath()),
                ]);

                $book->authors()->sync([$this->resolveAuthor($validated)->id]);
            });
        } catch (Throwable $exception) {
            $this->deleteStoredFiles($paths);

            throw $exception;
        }

        return to_route('publisher.books.index')->with('status', 'Buku berhasil disimpan.');
    }

    public function edit(Request $request, int $book): Response
    {
        $ownedBook = $this->ownedBook($request, $book);

        return Inertia::render('publisher/books/form', [
            ...$this->formOptions(),
            'book' => $this->bookFormPayload($ownedBook),
        ]);
    }

    public function update(SaveBookRequest $request, int $book): RedirectResponse
    {
        $ownedBook = $this->ownedBook($request, $book);
        Gate::authorize('update', $ownedBook);
        $validated = $request->validated();
        $newPaths = [];

        $oldPdfPath = $ownedBook->pdf_path;
        $oldCoverPath = $ownedBook->cover_path;

        try {
            $pdf = $request->file('book_pdf');
            $cover = $request->file('cover');
            if ($pdf !== null && ! $pdf instanceof UploadedFile) {
                throw new RuntimeException('Berkas PDF tidak valid.');
            }
            if ($cover !== null && ! $cover instanceof UploadedFile) {
                throw new RuntimeException('Berkas sampul tidak valid.');
            }
            $newPdfPath = $pdf ? $this->storeUpload($pdf, 'publisher-books', 'local') : null;
            $newCoverPath = $cover ? $this->storeUpload($cover, 'publisher-covers', 'public') : null;

            if ($newPdfPath) {
                $newPaths[$newPdfPath] = 'local';
            }
            if ($newCoverPath) {
                $newPaths[$newCoverPath] = 'public';
            }

            DB::transaction(function () use ($ownedBook, $validated, $pdf, $newPdfPath, $newCoverPath): void {
                $ownedBook->update([
                    'category_id' => $validated['category_id'],
                    'title' => trim($validated['title']),
                    'edition' => filled($validated['edition'] ?? null) ? trim((string) $validated['edition']) : null,
                    'genre' => filled($validated['genre'] ?? null) ? trim((string) $validated['genre']) : null,
                    'synopsis' => trim($validated['synopsis']),
                    'page_count' => $validated['page_count'],
                    'original_price_rupiah' => $validated['original_price_rupiah'],
                    'discount_percentage' => $validated['discount_percentage'],
                    'publication_status' => $validated['publication_status'],
                    ...($newCoverPath ? ['cover_path' => $newCoverPath] : []),
                    ...($newPdfPath ? [
                        'pdf_path' => $newPdfPath,
                        'pdf_size_bytes' => $pdf->getSize(),
                        'pdf_checksum' => hash_file('sha256', $pdf->getRealPath()),
                    ] : []),
                ]);

                $ownedBook->authors()->sync([$this->resolveAuthor($validated)->id]);
            });

            if ($newPdfPath && $oldPdfPath) {
                Storage::disk('local')->delete($oldPdfPath);
            }
            if ($newCoverPath && $oldCoverPath) {
                Storage::disk('public')->delete($oldCoverPath);
            }
        } catch (Throwable $exception) {
            $this->deleteStoredFiles($newPaths);

            throw $exception;
        }

        return to_route('publisher.books.index')->with('status', 'Perubahan buku berhasil disimpan.');
    }

    /** @return array<string, mixed> */
    private function formOptions(): array
    {
        return [
            'authors' => Author::query()->orderBy('name')->get(['id', 'name']),
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
        ];
    }

    /** @return array<string, mixed> */
    private function bookPayload(Book $book): array
    {
        return [
            'id' => $book->id,
            'title' => $book->title,
            'edition' => $book->edition,
            'genre' => $book->genre,
            'category' => $book->category?->name,
            'authors' => $book->authors->pluck('name')->values()->all(),
            'publication_status' => $book->publication_status,
            'original_price_rupiah' => $book->original_price_rupiah,
            'final_price_rupiah' => $book->final_price_rupiah,
            'discount_percentage' => $book->discount_percentage,
            'cover_url' => $book->cover_url,
            'updated_at' => $book->updated_at?->toIso8601String(),
        ];
    }

    /** @return array<string, mixed> */
    private function bookFormPayload(Book $book): array
    {
        return [
            'id' => $book->id,
            'title' => $book->title,
            'edition' => $book->edition,
            'genre' => $book->genre,
            'synopsis' => $book->synopsis,
            'page_count' => $book->page_count,
            'category_id' => $book->category_id,
            'author_id' => $book->authors->first()?->id,
            'original_price_rupiah' => $book->original_price_rupiah,
            'discount_percentage' => $book->discount_percentage,
            'publication_status' => $book->publication_status,
            'cover_url' => $book->cover_url,
            'pdf_name' => $book->pdf_path ? basename($book->pdf_path) : null,
        ];
    }

    /** @param array<string, mixed> $validated */
    private function resolveAuthor(array $validated): Author
    {
        if (filled($validated['author_id'] ?? null)) {
            return Author::query()->whereKey($validated['author_id'])->firstOrFail();
        }

        return Author::query()->firstOrCreate([
            'name' => trim((string) $validated['author_name']),
        ]);
    }

    private function storeUpload(?UploadedFile $file, string $directory, string $disk): string
    {
        if (! $file) {
            throw new RuntimeException('Berkas wajib belum tersedia.');
        }

        $extension = strtolower((string) $file->getClientOriginalExtension());
        $path = $file->storeAs($directory, Str::uuid()->toString().'.'.$extension, $disk);

        if (! is_string($path)) {
            throw new RuntimeException('Berkas gagal disimpan.');
        }

        return $path;
    }

    /** @param array<string, string> $paths */
    private function deleteStoredFiles(array $paths): void
    {
        foreach ($paths as $path => $disk) {
            Storage::disk($disk)->delete($path);
        }
    }

    private function publisherRegistration(Request $request): PublisherRegistration
    {
        $user = $request->user();
        abort_unless($user instanceof User, 403);

        return $user->publisherRegistration()->firstOrFail();
    }

    private function ownedBook(Request $request, int $book): Book
    {
        $publisher = $this->publisherRegistration($request);

        return Book::query()
            ->where('publisher_registration_id', $publisher->id)
            ->with(['category', 'authors'])
            ->findOrFail($book);
    }
}
