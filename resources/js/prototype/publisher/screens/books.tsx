import { useMemo, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, BookPlus, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    BookCover,
    Currency,
    EmptyState,
    PageHeading,
    PublisherLayout,
    StatusBadge,
    bookCategories,
} from '@/prototype/publisher/components';
import {
    formatDate,
    usePublisherData,
    type BookStatus,
} from '@/prototype/publisher/store';

const filters: { label: string; value: BookStatus | 'Semua' }[] = [
    { label: 'Semua', value: 'Semua' },
    { label: 'Aktif', value: 'Aktif' },
    { label: 'Menunggu Approval', value: 'Menunggu Approval' },
    { label: 'Ditolak/Revisi', value: 'Ditolak/Revisi' },
];

export default function PublisherBooks() {
    const [data] = usePublisherData();
    const { url } = usePage();
    const params = new URL('http://ikapi.local' + url).searchParams;
    const requestedStatus = params.get('status');
    const initialStatus = filters.some((item) => item.value === requestedStatus)
        ? (requestedStatus as BookStatus | 'Semua')
        : 'Semua';
    const [filter, setFilter] = useState<BookStatus | 'Semua'>(initialStatus);
    const [search, setSearch] = useState(params.get('q') ?? '');
    const [category, setCategory] = useState(() =>
        bookCategories.includes(params.get('kategori') ?? '')
            ? (params.get('kategori') as string)
            : 'Semua',
    );
    const [fromDate, setFromDate] = useState(params.get('dari') ?? '');
    const [throughDate, setThroughDate] = useState(params.get('sampai') ?? '');
    const books = useMemo(
        () =>
            data.books.filter((book) => {
                const matchesStatus =
                    filter === 'Semua' || book.status === filter;
                const matchesCategory =
                    category === 'Semua' || book.category === category;
                const query = search.trim().toLocaleLowerCase('id-ID');
                const matchesText =
                    !query ||
                    (book.title + ' ' + book.author)
                        .toLocaleLowerCase('id-ID')
                        .includes(query);
                const matchesFrom = !fromDate || book.updatedAt >= fromDate;
                const matchesThrough =
                    !throughDate || book.updatedAt <= throughDate;
                return (
                    matchesStatus &&
                    matchesCategory &&
                    matchesText &&
                    matchesFrom &&
                    matchesThrough
                );
            }),
        [data.books, category, filter, fromDate, search, throughDate],
    );
    const hasActiveFilters = Boolean(
        search ||
        filter !== 'Semua' ||
        category !== 'Semua' ||
        fromDate ||
        throughDate,
    );

    function resetFilters() {
        setSearch('');
        setFilter('Semua');
        setCategory('Semua');
        setFromDate('');
        setThroughDate('');
    }

    const detailParams = new URLSearchParams({
        q: search,
        status: filter,
        kategori: category,
        dari: fromDate,
        sampai: throughDate,
    });
    const detailQuery = detailParams.toString();

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
                        <div className="ikapi-books-refinements">
                            <div className="ikapi-field">
                                <label htmlFor="book-category-filter">
                                    Filter kategori
                                </label>
                                <select
                                    id="book-category-filter"
                                    value={category}
                                    onChange={(event) =>
                                        setCategory(event.target.value)
                                    }
                                >
                                    <option value="Semua">
                                        Semua kategori
                                    </option>
                                    {bookCategories.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="ikapi-field">
                                <label htmlFor="book-date-from">
                                    Diperbarui sejak
                                </label>
                                <input
                                    id="book-date-from"
                                    type="date"
                                    value={fromDate}
                                    max={throughDate || undefined}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        setFromDate(value);
                                        if (throughDate && value > throughDate)
                                            setThroughDate('');
                                    }}
                                />
                            </div>
                            <div className="ikapi-field">
                                <label htmlFor="book-date-through">
                                    Diperbarui sampai
                                </label>
                                <input
                                    id="book-date-through"
                                    type="date"
                                    value={throughDate}
                                    min={fromDate || undefined}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        setThroughDate(value);
                                        if (fromDate && value < fromDate)
                                            setFromDate('');
                                    }}
                                />
                            </div>
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
                                        <span>
                                            Diperbarui{' '}
                                            {formatDate(book.updatedAt)}
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
                                                        '/edit?' +
                                                        detailQuery
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
                                                        '/edit?' +
                                                        detailQuery
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
                                hasActiveFilters
                                    ? 'Buku tidak ditemukan'
                                    : 'Belum ada buku pada filter ini'
                            }
                            description={
                                hasActiveFilters
                                    ? 'Coba ubah kata kunci, kategori, status, atau rentang tanggal.'
                                    : 'Buku dengan status ini akan muncul di sini setelah tersedia.'
                            }
                            action={
                                hasActiveFilters ? (
                                    <Button
                                        variant="outline"
                                        className="ikapi-button ikapi-button-secondary"
                                        onClick={resetFilters}
                                    >
                                        Hapus semua filter
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
