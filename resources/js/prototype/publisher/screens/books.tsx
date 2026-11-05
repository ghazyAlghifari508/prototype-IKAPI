import { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BookPlus, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    BookCover,
    Currency,
    EmptyState,
    PageHeading,
    PublisherLayout,
    StatusBadge,
} from '@/prototype/publisher/components';
import { usePublisherData, type BookStatus } from '@/prototype/publisher/store';

const filters: { label: string; value: BookStatus | 'Semua' }[] = [
    { label: 'Semua', value: 'Semua' },
    { label: 'Aktif', value: 'Aktif' },
    { label: 'Menunggu Approval', value: 'Menunggu Approval' },
    { label: 'Ditolak/Revisi', value: 'Ditolak/Revisi' },
];

export default function PublisherBooks() {
    const [data] = usePublisherData();
    const [filter, setFilter] = useState<BookStatus | 'Semua'>('Semua');
    const [search, setSearch] = useState('');
    const books = useMemo(
        () =>
            data.books.filter((book) => {
                const matchesStatus =
                    filter === 'Semua' || book.status === filter;
                const query = search.trim().toLocaleLowerCase('id-ID');
                const matchesText =
                    !query ||
                    (book.title + ' ' + book.author)
                        .toLocaleLowerCase('id-ID')
                        .includes(query);
                return matchesStatus && matchesText;
            }),
        [data.books, filter, search],
    );

    return (
        <>
            <Head title="Kelola buku" />
            <PublisherLayout active="books">
                <PageHeading
                    title="Kelola buku"
                    description="Tinjau daftar buku dan status persetujuannya."
                    action={
                        <Button
                            asChild
                            className="ikapi-button ikapi-button-primary"
                        >
                            <Link href="/prototype/penerbit/buku/baru">
                                <BookPlus size={17} aria-hidden="true" />
                                Tambah buku
                            </Link>
                        </Button>
                    }
                />
                <section className="ikapi-panel ikapi-books-panel">
                    <div className="ikapi-panel-pad ikapi-books-toolbar">
                        <div
                            className="ikapi-filter-tabs"
                            role="group"
                            aria-label="Filter status buku"
                        >
                            {filters.map((item) => (
                                <Button
                                    key={item.value}
                                    type="button"
                                    variant="ghost"
                                    className={
                                        filter === item.value
                                            ? 'ikapi-filter-tab is-selected'
                                            : 'ikapi-filter-tab'
                                    }
                                    aria-pressed={filter === item.value}
                                    onClick={() => setFilter(item.value)}
                                >
                                    {item.label}
                                    <span>
                                        {item.value === 'Semua'
                                            ? data.books.length
                                            : data.books.filter(
                                                  (book) =>
                                                      book.status ===
                                                      item.value,
                                              ).length}
                                    </span>
                                </Button>
                            ))}
                        </div>
                        <div className="ikapi-field ikapi-book-search">
                            <label htmlFor="book-search">
                                <Search size={15} aria-hidden="true" />
                                Cari buku atau penulis
                            </label>
                            <input
                                id="book-search"
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Judul atau nama penulis"
                            />
                        </div>
                    </div>
                    {books.length ? (
                        <div
                            className="ikapi-book-table"
                            role="list"
                            aria-label="Daftar buku penerbit"
                        >
                            {books.map((book) => (
                                <article
                                    className="ikapi-book-entry"
                                    role="listitem"
                                    key={book.id}
                                >
                                    <BookCover title={book.title} />
                                    <div className="ikapi-book-entry-info">
                                        <strong>{book.title}</strong>
                                        <span>{book.author}</span>
                                        <span>
                                            {book.category} · {book.pages}{' '}
                                            halaman
                                        </span>
                                        {book.revisionNote &&
                                        book.status === 'Ditolak/Revisi' ? (
                                            <span className="ikapi-revision-inline">
                                                Catatan revisi tersedia
                                            </span>
                                        ) : null}
                                    </div>
                                    <div className="ikapi-book-entry-data">
                                        <small>Harga</small>
                                        <strong>
                                            <Currency value={book.price} />
                                        </strong>
                                    </div>
                                    <div className="ikapi-book-entry-data">
                                        <small>Terjual</small>
                                        <strong>
                                            {book.sales.toLocaleString('id-ID')}{' '}
                                            buku
                                        </strong>
                                    </div>
                                    <div className="ikapi-book-entry-status">
                                        <StatusBadge status={book.status} />
                                    </div>
                                    <div className="ikapi-book-entry-action">
                                        {book.status === 'Aktif' ? (
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="ikapi-button ikapi-button-secondary"
                                            >
                                                <Link
                                                    href={
                                                        '/prototype/penerbit/buku/' +
                                                        book.id +
                                                        '/edit'
                                                    }
                                                >
                                                    Lihat detail
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="ikapi-button ikapi-button-secondary"
                                            >
                                                <Link
                                                    href={
                                                        '/prototype/penerbit/buku/' +
                                                        book.id +
                                                        '/edit'
                                                    }
                                                >
                                                    {book.status ===
                                                    'Ditolak/Revisi'
                                                        ? 'Perbaiki'
                                                        : 'Edit'}
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title={
                                search
                                    ? 'Buku tidak ditemukan'
                                    : 'Belum ada buku pada filter ini'
                            }
                            description={
                                search
                                    ? 'Coba kata kunci lain atau hapus pencarian untuk melihat daftar.'
                                    : 'Buku dengan status ini akan muncul di sini setelah tersedia.'
                            }
                            action={
                                search ? (
                                    <Button
                                        variant="outline"
                                        className="ikapi-button ikapi-button-secondary"
                                        onClick={() => {
                                            setSearch('');
                                            setFilter('Semua');
                                        }}
                                    >
                                        Hapus pencarian
                                    </Button>
                                ) : filter !== 'Semua' ? (
                                    <Button
                                        variant="outline"
                                        className="ikapi-button ikapi-button-secondary"
                                        onClick={() => setFilter('Semua')}
                                    >
                                        Lihat semua buku
                                    </Button>
                                ) : (
                                    <Button
                                        asChild
                                        className="ikapi-button ikapi-button-primary"
                                    >
                                        <Link href="/prototype/penerbit/buku/baru">
                                            Tambah buku{' '}
                                            <ArrowRight
                                                size={16}
                                                aria-hidden="true"
                                            />
                                        </Link>
                                    </Button>
                                )
                            }
                        />
                    )}
                </section>
                <p className="ikapi-footer-note">
                    <SlidersHorizontal size={14} aria-hidden="true" />
                    Buku yang menunggu persetujuan belum tampil di katalog
                    pembeli.
                </p>
            </PublisherLayout>
        </>
    );
}
