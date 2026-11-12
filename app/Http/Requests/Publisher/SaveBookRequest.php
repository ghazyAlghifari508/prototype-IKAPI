<?php

namespace App\Http\Requests\Publisher;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class SaveBookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canAccessPublisherPortal() ?? false;
    }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        $isUpdate = $this->route('book') !== null;

        return [
            'title' => ['required', 'string', 'min:2', 'max:255'],
            'edition' => ['nullable', 'string', 'max:100'],
            'genre' => ['nullable', 'string', 'max:100'],
            'synopsis' => ['required', 'string', 'min:20', 'max:10000'],
            'page_count' => ['required', 'integer', 'min:1', 'max:100000'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'author_id' => ['nullable', 'integer', 'exists:authors,id'],
            'author_name' => ['nullable', 'string', 'max:255'],
            'original_price_rupiah' => ['required', 'integer', 'min:0', 'max:9223372036854775807'],
            'discount_percentage' => ['required', 'integer', 'min:0', 'max:100'],
            'publication_status' => ['required', 'in:draft,published'],
            'cover' => [$isUpdate ? 'nullable' : 'required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'book_pdf' => [$isUpdate ? 'nullable' : 'required', 'file', 'mimes:pdf', 'max:51200'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if (! $this->filled('author_id') && ! $this->filled('author_name')) {
                $validator->errors()->add('author_id', 'Pilih penulis atau tambahkan penulis baru.');
            }

            $file = $this->file('book_pdf');
            if (! $file || ! $file->isValid()) {
                return;
            }

            $header = file_get_contents($file->getRealPath(), false, null, 0, 5);
            if ($header !== '%PDF-') {
                $validator->errors()->add('book_pdf', 'Berkas harus merupakan PDF yang dapat dibaca.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Judul buku wajib diisi.',
            'title.max' => 'Judul buku maksimal 255 karakter.',
            'synopsis.required' => 'Sinopsis wajib diisi.',
            'synopsis.min' => 'Sinopsis minimal 20 karakter.',
            'page_count.required' => 'Jumlah halaman wajib diisi.',
            'category_id.required' => 'Kategori wajib dipilih.',
            'original_price_rupiah.required' => 'Harga jual wajib diisi.',
            'discount_percentage.max' => 'Diskon maksimal 100 persen.',
            'cover.image' => 'Sampul harus berupa gambar.',
            'cover.max' => 'Ukuran sampul maksimal 2 MB.',
            'book_pdf.mimes' => 'Materi e-book harus berupa PDF.',
            'book_pdf.max' => 'Ukuran PDF maksimal 50 MB.',
        ];
    }
}
