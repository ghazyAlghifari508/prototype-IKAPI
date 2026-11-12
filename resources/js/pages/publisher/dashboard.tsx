import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    CircleHelp,
    FileText,
    Wallet,
} from 'lucide-react';

type MetricValue = number | string | null;

type DashboardProps = {
    publisher: { name: string };
    metrics: {
        active_books: number;
        sold_books: MetricValue;
        net_revenue: MetricValue;
        available_balance: MetricValue;
    };
    salesTrend: Array<{ label: string; value: number }>;
    evaluation: { average: number; count: number } | null;
    recentTransactions: Array<{
        order_number: string;
        date: string;
        title: string;
        amount: string | null;
        status: string;
    }>;
    dataAvailability: {
        sales: boolean;
        financials: boolean;
        reviews: boolean;
    };
    flash?: { status?: string | null };
};

function formatRupiah(value: MetricValue): string {
    if (value === null) {
        return 'Belum tersedia';
    }

    if (typeof value === 'number') {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(value);
    }

    return value;
}

function MetricCard({
    label,
    value,
    note,
    icon: Icon,
}: {
    label: string;
    value: MetricValue;
    note: string;
    icon: typeof BookOpen;
}) {
    return (
        <article className="border border-black/10 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm text-[#757575]">{label}</p>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-[#111111]">
                        {formatRupiah(value)}
                    </p>
                </div>
                <span className="flex size-10 items-center justify-center rounded-lg bg-[#e6f3fe] text-[#0075de]">
                    <Icon className="size-5" aria-hidden="true" />
                </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#615d59]">{note}</p>
        </article>
    );
}

export default function PublisherDashboard() {
    const {
        publisher,
        metrics,
        salesTrend,
        evaluation,
        recentTransactions,
        dataAvailability,
        flash,
    } = usePage<DashboardProps>().props;

    return (
        <>
            <Head title="Ringkasan Penerbit" />

            <div className="space-y-8">
                {flash?.status ? (
                    <div
                        role="status"
                        className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                    >
                        {flash.status}
                    </div>
                ) : null}

                <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.16em] text-[#0075de] uppercase">
                            Ringkasan penerbit
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#111111] sm:text-4xl">
                            Halo, {publisher.name}.
                        </h1>
                        <p className="mt-2 max-w-2xl text-base leading-7 text-[#615d59]">
                            Pantau katalog dan kesiapan data penjualan Anda dari
                            satu tempat.
                        </p>
                    </div>
                    <Link
                        href="/publisher/books/create"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0075de] px-4 text-sm font-medium text-white transition hover:bg-[#0066c2] focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                        <BookOpen className="size-4" aria-hidden="true" />
                        Tambah buku
                    </Link>
                </header>

                <section aria-labelledby="metric-heading">
                    <div className="mb-3 flex items-center justify-between gap-4">
                        <h2
                            id="metric-heading"
                            className="text-lg font-semibold text-[#111111]"
                        >
                            Ringkasan utama
                        </h2>
                        <span className="text-xs text-[#757575]">
                            Data berbasis akun Anda
                        </span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <MetricCard
                            label="Buku aktif"
                            value={metrics.active_books}
                            note="Buku dengan status published."
                            icon={BookOpen}
                        />
                        <MetricCard
                            label="Buku terjual"
                            value={metrics.sold_books}
                            note={
                                dataAvailability.sales
                                    ? 'Dari pembayaran terverifikasi.'
                                    : 'Menunggu modul transaksi terhubung.'
                            }
                            icon={FileText}
                        />
                        <MetricCard
                            label="Pendapatan bersih"
                            value={metrics.net_revenue}
                            note={
                                dataAvailability.financials
                                    ? 'Mengikuti ledger penerbit.'
                                    : 'Belum dihitung tanpa kontrak finansial.'
                            }
                            icon={Wallet}
                        />
                        <MetricCard
                            label="Saldo tersedia"
                            value={metrics.available_balance}
                            note={
                                dataAvailability.financials
                                    ? 'Siap mengikuti aturan payout.'
                                    : 'Belum tersedia tanpa ledger payout.'
                            }
                            icon={CircleHelp}
                        />
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
                    <article className="border border-black/10 bg-white p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-[#111111]">
                                    Tren penjualan
                                </h2>
                                <p className="mt-1 text-sm text-[#757575]">
                                    Periode bulanan dari transaksi
                                    terverifikasi.
                                </p>
                            </div>
                            <span className="rounded-full bg-[#f6f5f4] px-3 py-1 text-xs text-[#615d59]">
                                Belum ada periode
                            </span>
                        </div>
                        {salesTrend.length === 0 ? (
                            <div className="mt-8 flex min-h-44 items-center justify-center border border-dashed border-black/15 bg-[#f6f5f4] px-6 text-center">
                                <div>
                                    <p className="font-medium text-[#111111]">
                                        Belum ada data penjualan
                                    </p>
                                    <p className="mt-1 max-w-md text-sm leading-6 text-[#615d59]">
                                        Grafik akan terisi setelah modul pesanan
                                        dan pembayaran terverifikasi tersedia.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="mt-6 space-y-3"
                                aria-label="Grafik tren penjualan"
                            >
                                {salesTrend.map((point) => (
                                    <div
                                        key={point.label}
                                        className="grid grid-cols-[3rem_1fr_4rem] items-center gap-3 text-sm"
                                    >
                                        <span className="text-[#615d59]">
                                            {point.label}
                                        </span>
                                        <div className="h-3 bg-[#e6f3fe]">
                                            <div
                                                className="h-full bg-[#0075de]"
                                                style={{
                                                    width: `${Math.min(100, point.value)}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-right font-medium">
                                            {point.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </article>

                    <article className="border border-black/10 bg-[#02093a] p-5 text-white sm:p-6">
                        <h2 className="text-lg font-semibold">
                            Evaluasi pembeli
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-white/70">
                            Rating hanya tampil dari ulasan pembeli yang sah.
                        </p>
                        <div className="mt-8 border-t border-white/20 pt-6">
                            {evaluation ? (
                                <>
                                    <p className="text-4xl font-semibold">
                                        {evaluation.average.toFixed(1)} / 5
                                    </p>
                                    <p className="mt-2 text-sm text-white/70">
                                        {evaluation.count} ulasan
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm leading-6 text-white/75">
                                    Belum ada ulasan yang dapat dirangkum.
                                </p>
                            )}
                        </div>
                    </article>
                </section>

                <section
                    className="border border-black/10 bg-white p-5 sm:p-6"
                    aria-labelledby="recent-heading"
                >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2
                                id="recent-heading"
                                className="text-lg font-semibold text-[#111111]"
                            >
                                Transaksi terbaru
                            </h2>
                            <p className="mt-1 text-sm text-[#757575]">
                                Ringkasan transaksi yang terkait dengan buku
                                Anda.
                            </p>
                        </div>
                        <span className="text-xs text-[#757575]">
                            Daftar lengkap mengikuti modul pesanan penerbit.
                        </span>
                    </div>
                    {recentTransactions.length === 0 ? (
                        <div className="mt-5 border border-dashed border-black/15 bg-[#f6f5f4] px-5 py-8 text-center text-sm text-[#615d59]">
                            Belum ada transaksi terbaru untuk ditampilkan.
                        </div>
                    ) : (
                        <div className="mt-5 overflow-x-auto">
                            <table className="w-full min-w-[680px] text-left text-sm">
                                <thead className="border-b border-black/10 text-xs text-[#757575]">
                                    <tr>
                                        <th className="px-3 py-3 font-medium">
                                            Nomor
                                        </th>
                                        <th className="px-3 py-3 font-medium">
                                            Tanggal
                                        </th>
                                        <th className="px-3 py-3 font-medium">
                                            Buku
                                        </th>
                                        <th className="px-3 py-3 text-right font-medium">
                                            Pendapatan
                                        </th>
                                        <th className="px-3 py-3 font-medium">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentTransactions.map((transaction) => (
                                        <tr
                                            key={`${transaction.order_number}-${transaction.title}`}
                                            className="border-b border-black/5 last:border-0"
                                        >
                                            <td className="px-3 py-4 font-medium">
                                                {transaction.order_number}
                                            </td>
                                            <td className="px-3 py-4 text-[#615d59]">
                                                {transaction.date}
                                            </td>
                                            <td className="px-3 py-4">
                                                {transaction.title}
                                            </td>
                                            <td className="px-3 py-4 text-right">
                                                {transaction.amount ??
                                                    'Belum tersedia'}
                                            </td>
                                            <td className="px-3 py-4 text-[#615d59]">
                                                {transaction.status}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <div className="flex items-center gap-2 text-sm text-[#615d59]">
                    <span>Butuh memperbarui data penerbit?</span>
                    <Link
                        href="/publisher/settings"
                        className="inline-flex items-center gap-1 font-medium text-[#0075de] hover:underline focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:outline-none"
                    >
                        Buka profil & rekening{' '}
                        <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </>
    );
}
