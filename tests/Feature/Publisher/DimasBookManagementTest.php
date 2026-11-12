<?php

use App\Models\Author;
use App\Models\Book;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

function dimasBookPublisher(string $email): User
{
    $user = User::factory()->create(['email' => $email]);
    $user->assignRole(Role::findOrCreate('publisher', 'web'));
    $user->publisherRegistration()->create([
        'publisher_name' => 'Penerbit Buku Uji',
        'responsible_person' => 'Penanggung Jawab',
        'phone' => '+6281234567890',
        'address' => 'Bandung',
        'ikapi_member_number' => 'IKAPI-BOOK-001',
        'legal_number' => 'AHU-BOOK-001',
        'approval_status' => 'approved',
    ]);

    return $user->fresh();
}

test('publisher can create a book with a private pdf and cover', function () {
    Storage::fake('local');
    Storage::fake('public');
    $publisher = dimasBookPublisher('books@example.test');
    $category = Category::query()->create(['name' => 'Teknologi']);
    $author = Author::query()->create(['name' => 'Penulis Uji']);

    $response = $this->actingAs($publisher)->post(route('publisher.books.store'), [
        'title' => 'Pengantar Sistem Kota Cerdas',
        'edition' => 'Edisi Pertama',
        'genre' => 'Teknologi',
        'synopsis' => 'Buku ini membahas dasar pengembangan sistem informasi kota cerdas.',
        'page_count' => 120,
        'category_id' => $category->id,
        'author_id' => $author->id,
        'original_price_rupiah' => 75000,
        'discount_percentage' => 10,
        'publication_status' => 'published',
        'cover' => UploadedFile::fake()->image('cover.png', 400, 600),
        'book_pdf' => UploadedFile::fake()->createWithContent('book.pdf', '%PDF-1.7 test content'),
    ]);

    $response->assertRedirect(route('publisher.books.index'));
    $book = Book::query()->firstOrFail();
    expect($book->title)->toBe('Pengantar Sistem Kota Cerdas')
        ->and($book->final_price_rupiah)->toBe(67500)
        ->and($book->publication_status)->toBe('published');
    Storage::disk('local')->assertExists($book->pdf_path);
    Storage::disk('public')->assertExists($book->cover_path);
});

test('publisher cannot update another publisher book', function () {
    $owner = dimasBookPublisher('owner@example.test');
    $other = dimasBookPublisher('other@example.test');
    $category = Category::query()->create(['name' => 'Bisnis']);
    $author = Author::query()->create(['name' => 'Penulis Lain']);
    $book = Book::query()->create([
        'publisher_registration_id' => $owner->publisherRegistration->id,
        'category_id' => $category->id,
        'title' => 'Buku Pemilik',
        'synopsis' => 'Sinopsis buku pemilik yang cukup panjang untuk validasi.',
        'page_count' => 80,
        'original_price_rupiah' => 50000,
        'discount_percentage' => 0,
        'publication_status' => 'draft',
        'pdf_path' => 'publisher-books/book.pdf',
    ]);
    $book->authors()->attach($author);

    $this->actingAs($other)
        ->get(route('publisher.books.edit', $book))
        ->assertNotFound();
});
