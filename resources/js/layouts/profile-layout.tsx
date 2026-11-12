import { Link } from '@inertiajs/react';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { home } from '@/routes';

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-svh bg-[#f2f7ff] px-4 py-5 text-[#17233b] [--background:#ffffff] [--border:#dbe5f2] [--card-foreground:#17233b] [--card:#ffffff] [--foreground:#17233b] [--input:#dbe5f2] [--muted-foreground:#64748b] [--muted:#f1f6fc] [--primary-foreground:#ffffff] [--primary:#0878df] [--ring:#0878df] sm:px-6 sm:py-8">
            <div className="mx-auto w-full max-w-6xl">
                <header className="mb-6 flex items-center justify-between rounded-2xl border border-[#dce8f7] bg-white px-5 py-4 shadow-sm sm:px-7">
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-3"
                    >
                        <span className="flex size-10 items-center justify-center rounded-xl bg-[#0878df] text-white shadow-sm">
                            <BookOpen className="size-5" />
                        </span>
                        <span>
                            <span className="block text-sm font-bold tracking-wide text-[#173456]">
                                IKAPI JABAR
                            </span>
                            <span className="block text-xs text-slate-500">
                                Marketplace buku digital
                            </span>
                        </span>
                    </Link>
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[#416080] transition hover:bg-[#eff6ff] hover:text-[#0878df]"
                    >
                        Beranda <ArrowUpRight className="size-4" />
                    </Link>
                </header>
                {children}
                <footer className="py-6 text-center text-xs text-slate-500">
                    IKAPI Jawa Barat · Ruang akun pembaca
                </footer>
            </div>
        </main>
    );
}
