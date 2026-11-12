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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pageLayout = (children as any)?.type?.layout;
    const resolvedTitle =
        title ||
        (typeof pageLayout?.title === 'string' ? pageLayout.title : '');
    const resolvedDescription =
        description ||
        (typeof pageLayout?.description === 'string'
            ? pageLayout.description
            : '');

    return (
        <main className="flex min-h-svh items-center justify-center bg-[#f8fafc] px-4 py-8 text-[#17233b] [--background:#ffffff] [--border:#dbe5f2] [--card-foreground:#17233b] [--card:#ffffff] [--foreground:#17233b] [--input:#dbe5f2] [--muted-foreground:#64748b] [--muted:#f1f6fc] [--primary-foreground:#ffffff] [--primary:#0075de] [--ring:#0075de] sm:px-6 sm:py-12">
            <div className="w-full max-w-2xl rounded-2xl border border-[#dce8f7] bg-white p-6 shadow-[0_16px_50px_-24px_rgba(0,117,222,0.12)] sm:p-10">
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-2.5 rounded-lg bg-[#eff6ff] px-3.5 py-2 text-sm font-semibold tracking-wide text-[#15224b] transition hover:bg-[#e0effe]"
                    >
                        <span className="text-base font-bold text-[#0075de]">
                            IKAPI
                        </span>
                        <span className="text-xs font-semibold tracking-[0.16em] text-[#615d59]">
                            JAWA BARAT
                        </span>
                    </Link>
                </div>
                {(resolvedTitle || resolvedDescription) && (
                    <header className="mb-6 space-y-1.5">
                        {resolvedTitle && (
                            <h1 className="text-2xl font-bold tracking-tight text-[#151923] sm:text-3xl">
                                {resolvedTitle}
                            </h1>
                        )}
                        {resolvedDescription && (
                            <p className="text-sm leading-6 text-muted-foreground">
                                {resolvedDescription}
                            </p>
                        )}
                    </header>
                )}
                {children}
            </div>
        </main>
    );
}
