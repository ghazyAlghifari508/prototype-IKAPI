import { useMemo, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, CalendarDays, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Currency,
    EmptyState,
    PageHeading,
    PublisherLayout,
    SectionHeading,
    StatusBadge,
} from '@/prototype/publisher/components';
import { InvoiceDownloadButton } from '@/prototype/publisher/invoice-download';
import { formatDateTime, usePublisherData } from '@/prototype/publisher/store';

export default function PublisherSales() {
    const [data] = usePublisherData();
    const { url } = usePage();
    const searchParams = new URL('http://ikapi.local' + url).searchParams;
    const [query, setQuery] = useState(searchParams.get('q') ?? '');
    const [fromDate, setFromDate] = useState(searchParams.get('dari') ?? '');
    const [toDate, setToDate] = useState(searchParams.get('sampai') ?? '');
    const orders = useMemo(
        () =>
            [...data.orders]
                .filter((order) => {
                    const text = query.trim().toLocaleLowerCase('id-ID');
                    const matchesText =
                        !text ||
                        (
                            order.id +
                            ' ' +
                            order.items.map((item) => item.title).join(' ')
                        )
                            .toLocaleLowerCase('id-ID')
                            .includes(text);
                    const date = order.date.slice(0, 10);
                    const matchesFrom = !fromDate || date >= fromDate;
                    const matchesTo = !toDate || date <= toDate;
                    return matchesText && matchesFrom && matchesTo;
                })
                .sort((a, b) => b.date.localeCompare(a.date)),
        [data.orders, fromDate, query, toDate],
    );

    return (
        <>
            <Head title="Pesanan masuk" />
            <PublisherLayout active="sales">
                <PageHeading
                    title="Pesanan masuk"
                    description="Penjualan buku Anda yang pembayarannya sudah lunas."
                />
                <section className="ikapi-panel ikapi-panel-pad ikapi-sales-filter">
                    <SectionHeading
                        title="Riwayat penjualan"
                        detail={orders.length + ' transaksi ditampilkan'}
                    />
                    <div className="ikapi-sales-filters">
                        <div className="ikapi-field">
                            <label htmlFor="sales-search">
                                <Search size={15} aria-hidden="true" />
                                Cari pesanan atau judul buku
                            </label>
                            <Input
                                id="sales-search"
                                type="search"
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                placeholder="Nomor pesanan atau judul"
                            />
                        </div>
                        <div className="ikapi-field">
                            <label htmlFor="date-from">
                                <CalendarDays size={15} aria-hidden="true" />
                                Dari tanggal
                            </label>
                            <Input
                                id="date-from"
                                type="date"
                                value={fromDate}
                                onChange={(event) =>
                                    setFromDate(event.target.value)
                                }
                            />
                        </div>
                        <div className="ikapi-field">
                            <label htmlFor="date-to">Sampai tanggal</label>
                            <Input
                                id="date-to"
                                type="date"
                                value={toDate}
                                onChange={(event) =>
                                    setToDate(event.target.value)
                                }
                            />
                        </div>
                    </div>
                </section>
                <section className="ikapi-panel ikapi-panel-pad ikapi-sales-list">
                    {orders.length ? (
                        <div className="ikapi-record-list">
                            {orders.map((order) => (
                                <article
                                    className="ikapi-sales-record"
                                    key={order.id}
                                >
                                    <Link
                                        className="ikapi-sales-record-link"
                                        href={
                                            '/prototype/penerbit/pesanan/' +
                                            order.id +
                                            '?' +
                                            new URLSearchParams({
                                                q: query,
                                                dari: fromDate,
                                                sampai: toDate,
                                            }).toString()
                                        }
                                    >
                                        <span className="ikapi-sales-record-title">
                                            <strong>
                                                {order.items
                                                    .map((item) => item.title)
                                                    .join(', ')}
                                            </strong>
                                            <small>
                                                {order.id} ·{' '}
                                                {formatDateTime(order.date)}
                                            </small>
                                        </span>
                                        <span className="ikapi-sales-record-meta">
                                            <span>
                                                {order.items.reduce(
                                                    (sum, item) =>
                                                        sum + item.quantity,
                                                    0,
                                                )}{' '}
                                                buku
                                            </span>
                                            <span className="ikapi-sales-net">
                                                <small>Pendapatan bersih</small>
                                                <strong>
                                                    <Currency
                                                        value={
                                                            order.publisherNet
                                                        }
                                                    />
                                                </strong>
                                            </span>
                                            <StatusBadge
                                                status={order.paymentStatus}
                                            />
                                            <ArrowRight
                                                size={17}
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </Link>
                                    <div className="ikapi-sales-download">
                                        <InvoiceDownloadButton
                                            order={order}
                                            compact
                                        />
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title={
                                data.orders.length
                                    ? 'Tidak ada hasil pada rentang ini'
                                    : 'Belum ada pesanan masuk saat ini'
                            }
                            description={
                                data.orders.length
                                    ? 'Ubah kata kunci atau tanggal untuk melihat penjualan lain.'
                                    : 'Transaksi buku Anda akan muncul setelah pembayaran lunas.'
                            }
                            action={
                                data.orders.length ? (
                                    <button
                                        className="ikapi-text-action"
                                        type="button"
                                        onClick={() => {
                                            setQuery('');
                                            setFromDate('');
                                            setToDate('');
                                        }}
                                    >
                                        Hapus filter
                                    </button>
                                ) : undefined
                            }
                        />
                    )}
                </section>
            </PublisherLayout>
        </>
    );
}
