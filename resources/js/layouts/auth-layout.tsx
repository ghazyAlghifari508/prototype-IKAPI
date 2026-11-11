import { Link } from '@inertiajs/react';
import { home } from '@/routes';

export default function AuthLayout({
    title = '',
    description = '',
    children,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <main className="flex min-h-svh items-center justify-center bg-[#f2f7ff] px-4 py-6 text-[#17233b] [--background:#ffffff] [--border:#dbe5f2] [--card-foreground:#17233b] [--card:#ffffff] [--foreground:#17233b] [--input:#dbe5f2] [--muted-foreground:#64748b] [--muted:#f1f6fc] [--primary-foreground:#ffffff] [--primary:#0878df] [--ring:#0878df] sm:px-6 sm:py-10">
            <div className="w-full max-w-3xl rounded-2xl border border-[#dce8f7] bg-white px-5 py-7 shadow-[0_24px_80px_-48px_rgba(17,72,133,0.4)] sm:px-10 sm:py-10">
                <Link
                    href={home()}
                    className="mb-8 inline-flex w-fit items-center gap-2 rounded-lg bg-[#eff6ff] px-3 py-2 text-sm font-semibold tracking-wide text-[#15224b]"
                >
                    <span className="text-base font-semibold text-[#0075de]">
                        IKAPI
                    </span>
                    <span className="text-xs tracking-[0.14em] text-[#615d59]">
                        JAWA BARAT
                    </span>
                </Link>
                {(title || description) && (
                    <header className="mb-7 space-y-2">
                        {title && (
                            <h1 className="text-3xl font-semibold text-[#151923] sm:text-4xl">
                                {title}
                            </h1>
                        )}
                        {description && (
                            <p className="text-sm leading-6 text-[#6c7280]">
                                {description}
                            </p>
                        )}
                    </header>
                )}
                {children}
            </div>
        </main>
    );
}
