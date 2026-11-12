import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, BookOpen, CheckCircle2, LogOut } from 'lucide-react';
import { home, logout } from '@/routes';

type AuthUser = {
    id: number;
    name: string;
    email: string;
};

type PageProps = {
    auth?: {
        user?: AuthUser | null;
    };
};

export default function PublisherDashboardPage() {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Portal Penerbit" />

            <div className="mx-auto max-w-4xl px-4 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" /> Beranda IKAPI
                    </Link>
                    <Link
                        href={logout()}
                        as="button"
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        <LogOut className="size-4" /> Keluar
                    </Link>
                </div>

                <div className="space-y-6 rounded-2xl border border-[#dce8f7] bg-white p-6 shadow-[0_16px_50px_-24px_rgba(0,117,222,0.12)] sm:p-10">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="flex size-9 items-center justify-center rounded-lg bg-[#e6f3fe] text-[#0075de]">
                                    <BookOpen className="size-5" />
                                </span>
                                <span className="text-xs font-semibold tracking-[0.2em] text-[#0075de] uppercase">
                                    Portal Penerbit IKAPI Jabar
                                </span>
                            </div>
                            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                                Selamat datang,{' '}
                                {auth?.user?.name ?? 'Mitra Penerbit'}
                            </h1>
                            <p className="text-sm text-slate-600">
                                Akun Anda aktif dan telah memperoleh izin penuh
                                dari administrator.
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                            <CheckCircle2 className="size-3.5 text-emerald-600" />
                            AKUN DISETUJUI
                        </span>
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-[#f7faff] p-5">
                        <h2 className="text-sm font-semibold text-slate-800">
                            Langkah Selanjutnya
                        </h2>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600">
                            Modul pengelolaan katalog buku digital dan laporan
                            penjualan dapat diakses melalui portal ini segera
                            setelah integrasi modul katalog PIC Dimas aktif.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

PublisherDashboardPage.layout = {
    title: '',
    description: '',
};
