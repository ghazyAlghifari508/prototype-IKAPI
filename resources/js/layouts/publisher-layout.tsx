import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, LayoutDashboard, LogOut, Settings2 } from 'lucide-react';
import type { ReactNode } from 'react';

type PublisherLayoutProps = {
    children: ReactNode;
};

type PageProps = {
    auth?: { user?: { name?: string | null } | null };
};

const navigation = [
    { href: '/publisher/dashboard', label: 'Ringkasan', icon: LayoutDashboard },
    { href: '/publisher/books', label: 'Kelola buku', icon: BookOpen },
    {
        href: '/publisher/settings',
        label: 'Profil & rekening',
        icon: Settings2,
    },
];

export default function PublisherLayout({ children }: PublisherLayoutProps) {
    const page = usePage<PageProps>();
    const { auth } = page.props;
    const currentPath = page.url;

    return (
        <div className="min-h-svh bg-[#f6f5f4] text-[#111111]">
            <Head title="Portal Penerbit" />
            <header className="border-b border-black/10 bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                    <Link
                        href="/publisher/dashboard"
                        className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:outline-none"
                    >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#e6f3fe] text-[#0075de]">
                            <BookOpen className="size-5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold tracking-tight">
                                IKAPI Jawa Barat
                            </span>
                            <span className="block text-xs text-[#757575]">
                                Portal penerbit
                            </span>
                        </span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <span className="hidden text-sm text-[#615d59] sm:inline">
                            {auth?.user?.name ?? 'Penerbit'}
                        </span>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-black/10 px-3 text-sm font-medium text-[#615d59] transition hover:border-black/20 hover:text-[#111111] focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:outline-none"
                        >
                            <LogOut className="size-4" aria-hidden="true" />
                            <span className="sr-only sm:not-sr-only">
                                Keluar
                            </span>
                        </Link>
                    </div>
                </div>
            </header>

            <nav
                className="border-b border-black/10 bg-white"
                aria-label="Portal penerbit"
            >
                <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
                    {navigation.map(({ href, label, icon: Icon }) => {
                        const active =
                            currentPath === href ||
                            currentPath.startsWith(`${href}/`);

                        return (
                            <Link
                                key={href}
                                href={href}
                                aria-current={active ? 'page' : undefined}
                                className={`inline-flex min-h-12 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:outline-none ${
                                    active
                                        ? 'border-[#0075de] text-[#0075de]'
                                        : 'border-transparent text-[#757575] hover:border-black/15 hover:text-[#111111]'
                                }`}
                            >
                                <Icon className="size-4" aria-hidden="true" />
                                {label}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                {children}
            </main>
        </div>
    );
}
