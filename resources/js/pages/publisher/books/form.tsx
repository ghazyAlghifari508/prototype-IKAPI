import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, FileText, ImagePlus, UploadCloud } from 'lucide-react';
import { useState } from 'react';

type Option = { id: number; name: string };

type BookForm = {
    id: number;
    title: string;
    edition: string | null;
    genre: string | null;
    synopsis: string;
    page_count: number;
    category_id: number;
    author_id: number | null;
    original_price_rupiah: number;
    discount_percentage: number;
    publication_status: 'draft' | 'published';
    cover_url: string | null;
    pdf_name: string | null;
};

type FormData = {
    title: string;
    edition: string;
    genre: string;
    synopsis: string;
    page_count: number | string;
    category_id: number | string;
    author_id: number | string;
    author_name: string;
    original_price_rupiah: number | string;
    discount_percentage: number | string;
    publication_status: 'draft' | 'published';
    cover: File | null;
    book_pdf: File | null;
};

type PageProps = {
    book?: BookForm;
    authors: Option[];
    categories: Option[];
};

function FieldError({ message }: { message?: string }) {
    return message ? <p className="text-xs text-[#b42318]">{message}</p> : null;
}

export default function PublisherBookForm() {
    const { book, authors, categories } = usePage<PageProps>().props;
    const [newAuthor, setNewAuthor] = useState(false);
    const [coverPreview, setCoverPreview] = useState<string | null>(
        book?.cover_url ?? null,
    );
    const form = useForm<FormData>({
        title: book?.title ?? '',
        edition: book?.edition ?? '',
        genre: book?.genre ?? '',
        synopsis: book?.synopsis ?? '',
        page_count: book?.page_count ?? '',
        category_id: book?.category_id ?? '',
        author_id: book?.author_id ?? '',
        author_name: '',
        original_price_rupiah: book?.original_price_rupiah ?? '',
        discount_percentage: book?.discount_percentage ?? 0,
        publication_status: book?.publication_status ?? 'draft',
        cover: null,
        book_pdf: null,
    });

    const setValue = <K extends keyof FormData>(field: K, value: FormData[K]) =>
        form.setData((data) => ({ ...data, [field]: value }));

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (book) {
            form.transform(
                (data) =>
                    ({ ...data, _method: 'put' }) as FormData & {
                        _method: string;
                    },
            );
            form.post(`/publisher/books/${book.id}`, {
                forceFormData: true,
                preserveScroll: true,
            });
            return;
        }

        form.post('/publisher/books', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const chooseCover = (file: File | null) => {
        setValue('cover', file);
        if (coverPreview) URL.revokeObjectURL(coverPreview);
        setCoverPreview(
            file ? URL.createObjectURL(file) : (book?.cover_url ?? null),
        );
    };

    return (
        <>
            <Head title={book ? 'Ubah Buku' : 'Tambah Buku'} />
            <div className="mx-auto max-w-4xl space-y-8">
                <header>
                    <Link
                        href="/publisher/books"
                        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#0075de] hover:underline focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:outline-none"
                    >
                        <ArrowLeft className="size-4" aria-hidden="true" />{' '}
                        Kembali ke buku saya
                    </Link>
                    <p className="mt-6 text-xs font-semibold tracking-[0.16em] text-[#0075de] uppercase">
                        Metadata buku
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#111111]">
                        {book ? 'Ubah buku' : 'Tambah buku baru'}
                    </h1>
                    <p className="mt-2 max-w-2xl text-base leading-7 text-[#615d59]">
                        Lengkapi informasi buku, sampul, dan materi PDF sebelum
                        menyimpannya.
                    </p>
                </header>

                <form
                    onSubmit={submit}
                    className="space-y-6"
                    encType="multipart/form-data"
                    noValidate
                >
                    <section
                        className="border border-black/10 bg-white p-5 sm:p-6"
                        aria-labelledby="book-info-heading"
                    >
                        <h2
                            id="book-info-heading"
                            className="text-lg font-semibold"
                        >
                            Informasi buku
                        </h2>
                        <div className="mt-6 grid gap-5 sm:grid-cols-2">
                            <LabeledInput
                                label="Judul buku"
                                name="title"
                                value={String(form.data.title)}
                                onChange={(value) => setValue('title', value)}
                                error={form.errors.title}
                                wide
                            />
                            <LabeledInput
                                label="Edisi"
                                name="edition"
                                value={String(form.data.edition)}
                                onChange={(value) => setValue('edition', value)}
                                error={form.errors.edition}
                            />
                            <LabeledInput
                                label="Genre"
                                name="genre"
                                value={String(form.data.genre)}
                                onChange={(value) => setValue('genre', value)}
                                error={form.errors.genre}
                            />
                            <LabeledInput
                                label="Jumlah halaman"
                                name="page_count"
                                type="number"
                                min={1}
                                value={String(form.data.page_count)}
                                onChange={(value) =>
                                    setValue('page_count', value)
                                }
                                error={form.errors.page_count}
                            />
                            <div className="space-y-2">
                                <label
                                    htmlFor="category_id"
                                    className="text-sm font-medium"
                                >
                                    Kategori
                                </label>
                                <select
                                    id="category_id"
                                    value={String(form.data.category_id)}
                                    onChange={(event) =>
                                        setValue(
                                            'category_id',
                                            event.target.value,
                                        )
                                    }
                                    className="min-h-11 w-full rounded-lg border border-black/15 bg-white px-3 text-sm outline-none focus:border-[#0075de] focus:ring-2 focus:ring-[#e6f3fe]"
                                >
                                    <option value="">Pilih kategori</option>
                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                <FieldError message={form.errors.category_id} />
                            </div>
                            <div className="space-y-2">
                                <label
                                    htmlFor="author_id"
                                    className="text-sm font-medium"
                                >
                                    Penulis
                                </label>
                                {!newAuthor ? (
                                    <select
                                        id="author_id"
                                        value={String(form.data.author_id)}
                                        onChange={(event) =>
                                            setValue(
                                                'author_id',
                                                event.target.value,
                                            )
                                        }
                                        className="min-h-11 w-full rounded-lg border border-black/15 bg-white px-3 text-sm outline-none focus:border-[#0075de] focus:ring-2 focus:ring-[#e6f3fe]"
                                    >
                                        <option value="">Pilih penulis</option>
                                        {authors.map((author) => (
                                            <option
                                                key={author.id}
                                                value={author.id}
                                            >
                                                {author.name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        id="author_id"
                                        value={form.data.author_name}
                                        onChange={(event) =>
                                            setValue(
                                                'author_name',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Nama penulis baru"
                                        className="min-h-11 w-full rounded-lg border border-black/15 bg-white px-3 text-sm outline-none focus:border-[#0075de] focus:ring-2 focus:ring-[#e6f3fe]"
                                    />
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNewAuthor((value) => !value);
                                        setValue('author_id', '');
                                        setValue('author_name', '');
                                    }}
                                    className="text-xs font-medium text-[#0075de] hover:underline focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:outline-none"
                                >
                                    {newAuthor
                                        ? 'Pilih penulis yang sudah ada'
                                        : '+ Tambah penulis baru'}
                                </button>
                                <FieldError
                                    message={
                                        form.errors.author_id ??
                                        form.errors.author_name
                                    }
                                />
                            </div>
                            <LabeledInput
                                label="Sinopsis"
                                name="synopsis"
                                value={String(form.data.synopsis)}
                                onChange={(value) =>
                                    setValue('synopsis', value)
                                }
                                error={form.errors.synopsis}
                                textarea
                                wide
                                hint={`${String(form.data.synopsis).length}/10.000 karakter`}
                            />
                        </div>
                    </section>

                    <section
                        className="border border-black/10 bg-white p-5 sm:p-6"
                        aria-labelledby="price-heading"
                    >
                        <h2
                            id="price-heading"
                            className="text-lg font-semibold"
                        >
                            Harga dan publikasi
                        </h2>
                        <div className="mt-6 grid gap-5 sm:grid-cols-3">
                            <LabeledInput
                                label="Harga jual asli (rupiah)"
                                name="original_price_rupiah"
                                type="number"
                                min={0}
                                value={String(form.data.original_price_rupiah)}
                                onChange={(value) =>
                                    setValue('original_price_rupiah', value)
                                }
                                error={form.errors.original_price_rupiah}
                            />
                            <LabeledInput
                                label="Diskon (%)"
                                name="discount_percentage"
                                type="number"
                                min={0}
                                max={100}
                                value={String(form.data.discount_percentage)}
                                onChange={(value) =>
                                    setValue('discount_percentage', value)
                                }
                                error={form.errors.discount_percentage}
                            />
                            <div className="space-y-2">
                                <label
                                    htmlFor="publication_status"
                                    className="text-sm font-medium"
                                >
                                    Status publikasi
                                </label>
                                <select
                                    id="publication_status"
                                    value={form.data.publication_status}
                                    onChange={(event) =>
                                        setValue(
                                            'publication_status',
                                            event.target
                                                .value as FormData['publication_status'],
                                        )
                                    }
                                    className="min-h-11 w-full rounded-lg border border-black/15 bg-white px-3 text-sm outline-none focus:border-[#0075de] focus:ring-2 focus:ring-[#e6f3fe]"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                                <p className="text-xs leading-5 text-[#757575]">
                                    Published akan terlihat sebagai buku aktif
                                    saat katalog publik tersedia.
                                </p>
                                <FieldError
                                    message={form.errors.publication_status}
                                />
                            </div>
                        </div>
                    </section>

                    <section
                        className="grid gap-6 lg:grid-cols-2"
                        aria-labelledby="assets-heading"
                    >
                        <h2 id="assets-heading" className="sr-only">
                            Berkas buku
                        </h2>
                        <UploadField
                            label="Sampul buku"
                            hint="JPG, PNG, atau WebP. Maksimal 2 MB."
                            error={form.errors.cover}
                        >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                <div className="flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/10 bg-[#f6f5f4]">
                                    {coverPreview ? (
                                        <img
                                            src={coverPreview}
                                            alt="Pratinjau sampul buku"
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <ImagePlus
                                            className="size-7 text-[#757575]"
                                            aria-hidden="true"
                                        />
                                    )}
                                </div>
                                <label
                                    htmlFor="cover"
                                    className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#0075de] px-4 text-sm font-medium text-[#0075de] focus-within:ring-2 focus-within:ring-[#0075de] hover:bg-[#e6f3fe]"
                                >
                                    <UploadCloud
                                        className="size-4"
                                        aria-hidden="true"
                                    />{' '}
                                    Pilih sampul
                                    <input
                                        id="cover"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="sr-only"
                                        onChange={(event) =>
                                            chooseCover(
                                                event.target.files?.[0] ?? null,
                                            )
                                        }
                                    />
                                </label>
                            </div>
                        </UploadField>
                        <UploadField
                            label="Materi e-book"
                            hint="PDF privat. Maksimal 50 MB."
                            error={form.errors.book_pdf}
                        >
                            <label
                                htmlFor="book_pdf"
                                className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-black/20 bg-[#f6f5f4] px-4 text-center focus-within:ring-2 focus-within:ring-[#0075de] hover:border-[#0075de]"
                            >
                                <FileText
                                    className="size-7 text-[#0075de]"
                                    aria-hidden="true"
                                />
                                <span className="text-sm font-medium text-[#111111]">
                                    {form.data.book_pdf?.name ??
                                        book?.pdf_name ??
                                        'Pilih berkas PDF'}
                                </span>
                                <span className="text-xs text-[#757575]">
                                    Berkas disimpan privat oleh server.
                                </span>
                                <input
                                    id="book_pdf"
                                    type="file"
                                    accept="application/pdf"
                                    className="sr-only"
                                    onChange={(event) =>
                                        setValue(
                                            'book_pdf',
                                            event.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                            </label>
                        </UploadField>
                    </section>

                    {form.progress ? (
                        <div
                            className="border border-[#e6f3fe] bg-[#e6f3fe] px-4 py-3 text-sm text-[#111111]"
                            role="status"
                        >
                            Mengunggah berkas… {form.progress.percentage}%
                        </div>
                    ) : null}
                    {form.hasErrors ? (
                        <div
                            className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#b42318]"
                            role="alert"
                        >
                            Periksa kembali kolom yang ditandai sebelum
                            menyimpan.
                        </div>
                    ) : null}
                    <div className="flex flex-col-reverse gap-3 border-t border-black/10 pt-5 sm:flex-row sm:justify-end">
                        <Link
                            href="/publisher/books"
                            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-black/15 px-4 text-sm font-medium text-[#615d59] hover:border-black/30 focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:outline-none"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0075de] px-4 text-sm font-medium text-white hover:bg-[#0066c2] focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {form.processing
                                ? 'Menyimpan…'
                                : book
                                  ? 'Simpan perubahan'
                                  : 'Simpan buku'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

function UploadField({
    label,
    hint,
    error,
    children,
}: {
    label: string;
    hint: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="border border-black/10 bg-white p-5 sm:p-6">
            <h2 className="text-base font-semibold">{label}</h2>
            <p className="mt-1 text-sm text-[#757575]">{hint}</p>
            <div className="mt-5">{children}</div>
            <FieldError message={error} />
        </div>
    );
}

function LabeledInput({
    label,
    name,
    value,
    onChange,
    error,
    type = 'text',
    min,
    max,
    textarea = false,
    wide = false,
    hint,
}: {
    label: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
    min?: number;
    max?: number;
    textarea?: boolean;
    wide?: boolean;
    hint?: string;
}) {
    return (
        <div className={`space-y-2 ${wide ? 'sm:col-span-2' : ''}`}>
            <label htmlFor={name} className="text-sm font-medium">
                {label}
            </label>
            {textarea ? (
                <textarea
                    id={name}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    rows={5}
                    className="w-full resize-y rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm leading-6 outline-none focus:border-[#0075de] focus:ring-2 focus:ring-[#e6f3fe]"
                />
            ) : (
                <input
                    id={name}
                    type={type}
                    min={min}
                    max={max}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="min-h-11 w-full rounded-lg border border-black/15 bg-white px-3 text-sm outline-none focus:border-[#0075de] focus:ring-2 focus:ring-[#e6f3fe]"
                />
            )}
            {hint ? <p className="text-xs text-[#757575]">{hint}</p> : null}
            <FieldError message={error} />
        </div>
    );
}
