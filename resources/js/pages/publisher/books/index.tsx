import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookOpen, FilePenLine, Plus, Search } from 'lucide-react';
import { useState } from 'react';

type Book = {
    id: number;
    title: string;
    edition: string | null;
    genre: string | null;
    category: string | null;
    authors: string[];
    publication_status: 'draft' | 'published';
    original_price_rupiah: number;
    final_price_rupiah: number;
    discount_percentage: number;
    cover_url: string | null;
    updated_at: string | null;
};

type PageProps = {
    books: {
        data: Book[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: { search: string; status: string };
    flash?: { status?: string | null };
};

function formatRupiah(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

export default function PublisherBooks() {
    const { books, filters, flash } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);

    const applyFilters = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(
            '/publisher/books',
            { search, status },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Kelola Buku" />
            <div className="space-y-8">
                {flash?.status ? (
                    <div
                        role="status"
                        className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                    >
                        {flash.status}
                    </div>
                ) : null}

                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.16em] text-[#0075de] uppercase">
                            Katalog penerbit
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#111111]">
                            Kelola buku
                        </h1>
                        <p className="mt-2 max-w-2xl text-base leading-7 text-[#615d59]">
                            Simpan metadata, materi PDF privat, dan status
                            publikasi buku Anda.
                        </p>
                    </div>
                    <Link
                        href="/publisher/books/create"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0075de] px-4 text-sm font-medium text-white transition hover:bg-[#0066c2] focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                        <Plus className="size-4" aria-hidden="true" /> Tambah
                        buku
                    </Link>
                </header>

                <form
                    onSubmit={applyFilters}
                    className="flex flex-col gap-3 border border-black/10 bg-white p-4 sm:flex-row sm:items-end"
                    role="search"
                >
                    <div className="min-w-0 flex-1 space-y-2">
                        <label
                            htmlFor="book-search"
                            className="text-sm font-medium"
                        >
                            Cari judul
                        </label>
                        <div className="relative">
                            <Search
                                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#757575]"
                                aria-hidden="true"
                            />
                            <input
                                id="book-search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Contoh: Pengantar Kota Cerdas"
                                className="min-h-11 w-full rounded-lg border border-black/15 bg-white pr-3 pl-10 text-sm outline-none focus:border-[#0075de] focus:ring-2 focus:ring-[#e6f3fe]"
                            />
                        </div>
                    </div>
                    <div className="space-y-2 sm:w-48">
                        <label
                            htmlFor="book-status"
                            className="text-sm font-medium"
                        >
                            Status
                        </label>
                        <select
                            id="book-status"
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className="min-h-11 w-full rounded-lg border border-black/15 bg-white px-3 text-sm outline-none focus:border-[#0075de] focus:ring-2 focus:ring-[#e6f3fe]"
                        >
                            <option value="">Semua status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="min-h-11 rounded-lg border border-[#0075de] px-4 text-sm font-medium text-[#0075de] transition hover:bg-[#e6f3fe] focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:outline-none"
                    >
                        Terapkan
                    </button>
                </form>

                <section
                    className="border border-black/10 bg-white"
                    aria-labelledby="books-heading"
                >
                    <div className="flex items-center gap-3 border-b border-black/10 px-5 py-4 sm:px-6">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-[#e6f3fe] text-[#0075de]">
                            <BookOpen className="size-4" aria-hidden="true" />
                        </span>
                        <div>
                            <h2 id="books-heading" className="font-semibold">
                                Buku saya
                            </h2>
                            <p className="text-sm text-[#757575]">
                                {books.data.length} buku di halaman ini
                            </p>
                        </div>
                    </div>

                    {books.data.length === 0 ? (
                        <div className="px-6 py-14 text-center">
                            <p className="font-medium text-[#111111]">
                                Belum ada buku
                            </p>
                            <p className="mt-1 text-sm text-[#615d59]">
                                Mulai dengan mengisi metadata dan mengunggah PDF
                                pertama Anda.
                            </p>
                            <Link
                                href="/publisher/books/create"
                                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#0075de] px-4 text-sm font-medium text-white focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:ring-offset-2 focus-visible:outline-none"
                            >
                                <Plus className="size-4" aria-hidden="true" />{' '}
                                Tambah buku
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[820px] text-left text-sm">
                                <thead className="border-b border-black/10 bg-[#f6f5f4] text-xs text-[#757575]">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">
                                            Buku
                                        </th>
                                        <th className="px-3 py-3 font-medium">
                                            Kategori
                                        </th>
                                        <th className="px-3 py-3 font-medium">
                                            Harga
                                        </th>
                                        <th className="px-3 py-3 font-medium">
                                            Status
                                        </th>
                                        <th className="px-5 py-3 text-right font-medium">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {books.data.map((book) => (
                                        <tr
                                            key={book.id}
                                            className="border-b border-black/5 last:border-0"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/10 bg-[#f6f5f4]">
                                                        {book.cover_url ? (
                                                            <img
                                                                src={
                                                                    book.cover_url
                                                                }
                                                                alt={`Sampul ${book.title}`}
                                                                className="size-full object-cover"
                                                            />
                                                        ) : (
                                                            <BookOpen
                                                                className="size-5 text-[#757575]"
                                                                aria-hidden="true"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="max-w-[300px] truncate font-medium text-[#111111]">
                                                            {book.title}
                                                        </p>
                                                        <p className="mt-1 text-xs text-[#757575]">
                                                            {book.authors.join(
                                                                ', ',
                                                            ) ||
                                                                'Penulis belum diisi'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 text-[#615d59]">
                                                {book.category ?? '—'}
                                            </td>
                                            <td className="px-3 py-4">
                                                <span className="font-medium">
                                                    {formatRupiah(
                                                        book.final_price_rupiah,
                                                    )}
                                                </span>
                                                {book.discount_percentage >
                                                0 ? (
                                                    <span className="mt-1 block text-xs text-[#757575] line-through">
                                                        {formatRupiah(
                                                            book.original_price_rupiah,
                                                        )}
                                                    </span>
                                                ) : null}
                                            </td>
                                            <td className="px-3 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${book.publication_status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-[#f6f5f4] text-[#615d59]'}`}
                                                >
                                                    {book.publication_status ===
                                                    'published'
                                                        ? 'Published'
                                                        : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    href={`/publisher/books/${book.id}/edit`}
                                                    className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-[#0075de] hover:bg-[#e6f3fe] focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:outline-none"
                                                >
                                                    <FilePenLine
                                                        className="size-4"
                                                        aria-hidden="true"
                                                    />{' '}
                                                    Ubah
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {books.links.length > 3 ? (
                    <nav
                        className="flex flex-wrap gap-2"
                        aria-label="Halaman buku"
                    >
                        {books.links.map((link) => (
                            <Link
                                key={link.label}
                                href={link.url ?? '#'}
                                preserveScroll
                                className={`inline-flex min-h-11 items-center justify-center rounded-lg border px-3 text-sm ${link.active ? 'border-[#0075de] bg-[#0075de] text-white' : 'border-black/10 text-[#615d59] hover:bg-white'} ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </nav>
                ) : null}
            </div>
        </>
    );
}
