import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    ChartNoAxesCombined,
    FileText,
    Star,
    Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Currency,
    PageHeading,
    PublisherLayout,
    SectionHeading,
    StatusBadge,
} from '@/prototype/publisher/components';
import { formatDateTime, usePublisherData } from '@/prototype/publisher/store';

function RevenueChart({ rows }: { rows: { label: string; value: number }[] }) {
    const maximum = Math.max(...rows.map((row) => row.value), 1);
    const coordinates = rows.map((row, index) => {
        const x = 35 + index * (330 / Math.max(rows.length - 1, 1));
        const y = 166 - (row.value / maximum) * 126;
        return { ...row, x, y };
    });
    const path = coordinates
        .map(
            (point, index) =>
                (index === 0 ? 'M ' : 'L ') + point.x + ' ' + point.y,
        )
        .join(' ');
    const area = path + ' L 365 180 L 35 180 Z';

    return (
        <>
            <svg
                className="ikapi-chart"
                viewBox="0 0 400 208"
                role="img"
                aria-labelledby="revenue-chart-title revenue-chart-desc"
            >
                <title id="revenue-chart-title">Grafik pendapatan bersih</title>
                <desc id="revenue-chart-desc">
                    Tren empat bulan terakhir. Rincian nilai dapat dibuka pada
                    tabel di bawah grafik.
                </desc>
                {[40, 86, 132, 178].map((y) => (
                    <line
                        key={y}
                        className="ikapi-chart-grid"
                        x1="35"
                        x2="365"
                        y1={y}
                        y2={y}
                    />
                ))}
                <path className="ikapi-chart-fill" d={area} />
                <path className="ikapi-chart-line" d={path} />
                {coordinates.map((point) => (
                    <g key={point.label}>
                        <circle
                            className="ikapi-chart-point"
                            cx={point.x}
                            cy={point.y}
                            r="5"
                        />
                        <text
                            className="ikapi-chart-label"
                            x={point.x}
                            y="201"
                            textAnchor="middle"
                        >
                            {point.label}
                        </text>
                    </g>
                ))}
            </svg>
            <details className="ikapi-chart-table">
                <summary>Lihat nilai pendapatan dalam tabel</summary>
                <table>
                    <caption className="sr-only">
                        Pendapatan bersih per bulan
                    </caption>
                    <thead>
                        <tr>
                            <th>Bulan</th>
                            <th className="is-numeric">Pendapatan bersih</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.label}>
                                <td>{row.label} 2026</td>
                                <td className="is-numeric">
                                    <Currency value={row.value} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </details>
        </>
    );
}

export default function PublisherDashboard() {
    const [data] = usePublisherData();
    const activeBooks = data.books.filter(
        (book) => book.status === 'Aktif',
    ).length;
    const latestOrders = [...data.orders]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 3);
    const stats = [
        {
            label: 'Buku aktif',
            value: activeBooks.toString(),
            hint: 'Di katalog penerbit',
            icon: BookOpen,
        },
        {
            label: 'Buku terjual',
            value: data.metrics.totalSold.toLocaleString('id-ID'),
            hint: 'Total unit terjual',
            icon: FileText,
        },
        {
            label: 'Pendapatan bersih',
            value:
                'Rp' +
                new Intl.NumberFormat('id-ID', {
                    notation: 'compact',
                    maximumFractionDigits: 1,
                }).format(data.metrics.netEarnings),
            hint: 'Akumulasi penjualan',
            icon: ChartNoAxesCombined,
        },
        {
            label: 'Saldo tersedia',
            value:
                'Rp' +
                new Intl.NumberFormat('id-ID', {
                    notation: 'compact',
                    maximumFractionDigits: 1,
                }).format(data.metrics.availableBalance),
            hint: 'Siap diajukan',
            icon: Wallet,
        },
    ];

    return (
        <>
            <Head title="Ringkasan penerbit" />
            <PublisherLayout active="dashboard">
                <PageHeading
                    title="Ringkasan penjualan"
                    description="Pantau buku, pendapatan, dan respons pembaca Anda."
                    action={
                        <Button
                            asChild
                            className="ikapi-button ikapi-button-primary"
                        >
                            <Link href="/prototype/penerbit/buku/baru">
                                Ajukan buku{' '}
                                <ArrowRight size={16} aria-hidden="true" />
                            </Link>
                        </Button>
                    }
                />
                <section
                    className="ikapi-summary-strip"
                    aria-label="Ringkasan penerbit"
                >
                    {stats.map(({ label, value, hint, icon: Icon }) => (
                        <div className="ikapi-summary-item" key={label}>
                            <span className="ikapi-summary-label">
                                <Icon size={15} aria-hidden="true" />
                                {label}
                            </span>
                            <strong>{value}</strong>
                            <small>{hint}</small>
                        </div>
                    ))}
                </section>
                <div className="ikapi-grid ikapi-grid-2 ikapi-dashboard-main">
                    <section className="ikapi-panel ikapi-panel-pad">
                        <SectionHeading
                            title="Pendapatan bersih"
                            detail="Ringkasan per bulan"
                            action={
                                <span className="ikapi-period-label">
                                    Jun — Sep 2026
                                </span>
                            }
                        />
                        <div className="ikapi-chart-total">
                            <strong>
                                <Currency value={data.metrics.netEarnings} />
                            </strong>
                            <span>Empat bulan terakhir</span>
                        </div>
                        <RevenueChart rows={data.metrics.monthlyRevenue} />
                    </section>
                    <section className="ikapi-panel ikapi-panel-pad ikapi-rating-panel">
                        <SectionHeading
                            title="Ulasan pembaca"
                            detail="Buku terbitan Anda"
                            action={
                                <Link
                                    href="/prototype/penerbit/ulasan"
                                    className="ikapi-inline-link"
                                >
                                    Buka ulasan{' '}
                                    <ArrowRight size={15} aria-hidden="true" />
                                </Link>
                            }
                        />
                        <div className="ikapi-rating-overview">
                            <strong className="ikapi-rating-number">
                                {data.metrics.averageRating.toFixed(1)}
                            </strong>
                            <div>
                                <span
                                    className="ikapi-stars"
                                    role="img"
                                    aria-label={
                                        'Rata-rata ' +
                                        data.metrics.averageRating.toFixed(1) +
                                        ' dari 5 bintang'
                                    }
                                >
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={16}
                                            fill={
                                                star <=
                                                Math.round(
                                                    data.metrics.averageRating,
                                                )
                                                    ? 'currentColor'
                                                    : 'none'
                                            }
                                        />
                                    ))}
                                </span>
                                <span className="ikapi-muted">
                                    {data.metrics.reviewCount} ulasan
                                </span>
                            </div>
                        </div>
                        <div className="ikapi-review-sample">
                            <span>Rata-rata keseluruhan</span>
                            <div className="ikapi-progress">
                                <span
                                    style={{
                                        width:
                                            (data.metrics.averageRating / 5) *
                                                100 +
                                            '%',
                                    }}
                                />
                            </div>
                        </div>
                        <Link
                            href="/prototype/penerbit/ulasan"
                            className="ikapi-inline-link"
                        >
                            Lihat komentar yang perlu dibalas{' '}
                            <ArrowRight size={15} aria-hidden="true" />
                        </Link>
                    </section>
                </div>
                <section className="ikapi-panel ikapi-panel-pad ikapi-recent-sales">
                    <SectionHeading
                        title="Penjualan terbaru"
                        detail="Transaksi lunas untuk buku Anda"
                        action={
                            <Link
                                href="/prototype/penerbit/pesanan"
                                className="ikapi-inline-link"
                            >
                                Semua pesanan{' '}
                                <ArrowRight size={15} aria-hidden="true" />
                            </Link>
                        }
                    />
                    {latestOrders.length ? (
                        <div className="ikapi-record-list">
                            {latestOrders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={
                                        '/prototype/penerbit/pesanan/' +
                                        order.id
                                    }
                                    className="ikapi-record ikapi-order-record"
                                >
                                    <span className="ikapi-record-main">
                                        <span className="ikapi-record-title">
                                            <strong>
                                                {order.items
                                                    .map((item) => item.title)
                                                    .join(', ')}
                                            </strong>
                                            <span>
                                                {order.id} ·{' '}
                                                {formatDateTime(order.date)}
                                            </span>
                                        </span>
                                    </span>
                                    <span className="ikapi-record-side">
                                        <span className="ikapi-order-value">
                                            <strong>
                                                <Currency
                                                    value={order.publisherNet}
                                                />
                                            </strong>
                                            <StatusBadge
                                                status={order.paymentStatus}
                                            />
                                        </span>
                                        <ArrowRight
                                            size={17}
                                            aria-hidden="true"
                                        />
                                    </span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="ikapi-muted">
                            Belum ada transaksi untuk ditampilkan.
                        </p>
                    )}
                </section>
            </PublisherLayout>
        </>
    );
}
