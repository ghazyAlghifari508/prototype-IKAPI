import { Head, usePage } from '@inertiajs/react';

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

            <div className="mx-auto max-w-5xl px-4 py-12">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <p className="text-sm font-medium tracking-[0.2em] text-[#0075de] uppercase">
                        Portal Penerbit
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                        Selamat datang, {auth?.user?.name ?? 'Penerbit'}
                    </h1>
                    <p className="mt-3 text-slate-600">
                        Akses portal diterima karena akun Anda sudah disetujui
                        oleh administrator.
                    </p>
                </div>
            </div>
        </>
    );
}

PublisherDashboardPage.layout = {
    title: 'Portal Penerbit',
    description: 'Area penerbit yang sudah disetujui.',
};
