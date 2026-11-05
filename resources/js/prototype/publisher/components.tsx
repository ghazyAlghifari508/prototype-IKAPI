import { useState, type ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    ChevronDown,
    CircleHelp,
    FileText,
    LayoutDashboard,
    Menu,
    MessageSquareText,
    PanelLeftClose,
    Settings2,
    Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { resetPublisherData } from './store';
import { toast } from 'sonner';
import './styles.css';

const navigation = [
    {
        label: 'Ringkasan',
        href: '/prototype/penerbit/dashboard',
        icon: LayoutDashboard,
        section: 'dashboard',
    },
    {
        label: 'Kelola buku',
        href: '/prototype/penerbit/buku',
        icon: BookOpen,
        section: 'books',
    },
    {
        label: 'Pesanan masuk',
        href: '/prototype/penerbit/pesanan',
        icon: FileText,
        section: 'sales',
    },
    {
        label: 'Pendapatan & pencairan',
        href: '/prototype/penerbit/pencairan',
        icon: Wallet,
        section: 'payouts',
    },
    {
        label: 'Ulasan',
        href: '/prototype/penerbit/ulasan',
        icon: MessageSquareText,
        section: 'reviews',
    },
    {
        label: 'Profil & rekening',
        href: '/prototype/penerbit/profil',
        icon: Settings2,
        section: 'profile',
    },
] as const;

export type PublisherSection = (typeof navigation)[number]['section'];

function Brand() {
    return (
        <Link
            href="/prototype"
            className="ikapi-brand"
            aria-label="IKAPI Jawa Barat, halaman awal prototype"
        >
            <span className="ikapi-brand-mark" aria-hidden="true">
                <BookOpen size={21} strokeWidth={1.7} />
            </span>
            <span className="ikapi-brand-copy">
                <strong>IKAPI Jawa Barat</strong>
                <small>Rak buku digital</small>
            </span>
        </Link>
    );
}

function NavLinks({
    active,
    onNavigate,
}: {
    active?: PublisherSection;
    onNavigate?: () => void;
}) {
    return (
        <nav className="ikapi-nav" aria-label="Navigasi penerbit">
            <p className="ikapi-nav-label">Ruang penerbit</p>
            {navigation.map(({ label, href, icon: Icon, section }) => (
                <Link
                    key={section}
                    href={href}
                    onClick={onNavigate}
                    className={
                        active === section
                            ? 'ikapi-nav-link is-active'
                            : 'ikapi-nav-link'
                    }
                    aria-current={active === section ? 'page' : undefined}
                >
                    <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                    <span>{label}</span>
                </Link>
            ))}
        </nav>
    );
}

export function PublisherLayout({
    active,
    children,
}: {
    active?: PublisherSection;
    children: ReactNode;
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [resetOpen, setResetOpen] = useState(false);

    function resetData() {
        resetPublisherData();
        setResetOpen(false);
        toast.success('Data awal berhasil dipulihkan.');
    }

    return (
        <div className="ikapi-app">
            <aside className="ikapi-sidebar">
                <Brand />
                <NavLinks active={active} />
                <div className="ikapi-sidebar-bottom">
                    <div className="ikapi-help-note">
                        <span className="ikapi-help-icon">
                            <CircleHelp size={17} aria-hidden="true" />
                        </span>
                        <p>
                            <strong>Butuh bantuan?</strong>
                            <span>Hubungi sekretariat IKAPI Jawa Barat.</span>
                        </p>
                    </div>
                    <p className="ikapi-sidebar-foot">Penerbit · Jawa Barat</p>
                </div>
            </aside>

            <div className="ikapi-main-column">
                <header className="ikapi-topbar">
                    <Button
                        className="ikapi-icon-button ikapi-menu-trigger"
                        variant="ghost"
                        size="icon"
                        aria-label="Buka navigasi"
                        onClick={() => setMenuOpen(true)}
                    >
                        <Menu size={20} aria-hidden="true" />
                    </Button>
                    <div className="ikapi-topbar-context">
                        <span>Ruang penerbit</span>
                        <span aria-hidden="true">/</span>
                        <strong>
                            {navigation.find((item) => item.section === active)
                                ?.label ?? 'Halaman awal'}
                        </strong>
                    </div>
                    <details className="ikapi-account-menu">
                        <summary aria-label="Menu akun penerbit">
                            <span
                                className="ikapi-account-avatar"
                                aria-hidden="true"
                            >
                                AP
                            </span>
                            <span className="ikapi-account-name">
                                <strong>Aksara Priangan</strong>
                                <small>Akun penerbit</small>
                            </span>
                            <ChevronDown size={16} aria-hidden="true" />
                        </summary>
                        <div className="ikapi-account-popover">
                            <p>Data profil dan rekening</p>
                            <Link href="/prototype/penerbit/profil">
                                Buka profil penerbit
                            </Link>
                            <Button
                                variant="ghost"
                                className="ikapi-reset-link"
                                onClick={() => setResetOpen(true)}
                            >
                                Pulihkan data awal
                            </Button>
                        </div>
                    </details>
                </header>
                <main className="ikapi-page-content">{children}</main>
            </div>

            <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
                <DialogContent
                    className="ikapi-drawer"
                    aria-describedby="publisher-nav-description"
                >
                    <DialogHeader className="ikapi-drawer-header">
                        <Brand />
                        <DialogDescription id="publisher-nav-description">
                            Pilih bagian yang ingin dibuka.
                        </DialogDescription>
                    </DialogHeader>
                    <NavLinks
                        active={active}
                        onNavigate={() => setMenuOpen(false)}
                    />
                    <div className="ikapi-drawer-footer">
                        Penerbit · Jawa Barat
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={resetOpen} onOpenChange={setResetOpen}>
                <DialogContent className="ikapi-dialog">
                    <DialogHeader>
                        <DialogTitle>Pulihkan data awal?</DialogTitle>
                        <DialogDescription>
                            Perubahan pada profil, buku, balasan ulasan, dan
                            pencairan akan dihapus dari perangkat ini.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="ikapi-dialog-actions">
                        <Button
                            variant="outline"
                            className="ikapi-button ikapi-button-secondary"
                            onClick={() => setResetOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            className="ikapi-button ikapi-button-primary"
                            onClick={resetData}
                        >
                            Pulihkan data
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export function PageHeading({
    title,
    description,
    action,
}: {
    title: string;
    description?: string;
    action?: ReactNode;
}) {
    return (
        <div className="ikapi-page-heading">
            <div>
                <p className="ikapi-eyebrow">Penerbit Aksara Priangan</p>
                <h1>{title}</h1>
                {description ? (
                    <p className="ikapi-page-description">{description}</p>
                ) : null}
            </div>
            {action ? (
                <div className="ikapi-heading-action">{action}</div>
            ) : null}
        </div>
    );
}

export function StatusBadge({ status }: { status: string }) {
    const tone =
        status === 'Aktif' || status === 'Selesai' || status === 'Lunas'
            ? 'success'
            : status === 'Ditolak' || status === 'Ditolak/Revisi'
              ? 'danger'
              : status === 'Menunggu Approval' || status === 'Dalam Proses'
                ? 'pending'
                : 'neutral';
    return (
        <span className={'ikapi-status ikapi-status-' + tone}>
            <span className="ikapi-status-dot" aria-hidden="true" />
            {status}
        </span>
    );
}

export function SectionHeading({
    title,
    detail,
    action,
}: {
    title: string;
    detail?: string;
    action?: ReactNode;
}) {
    return (
        <div className="ikapi-section-heading">
            <div>
                <h2>{title}</h2>
                {detail ? <p>{detail}</p> : null}
            </div>
            {action}
        </div>
    );
}

export function EmptyState({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="ikapi-empty-state">
            <span className="ikapi-empty-icon" aria-hidden="true">
                <PanelLeftClose size={20} />
            </span>
            <h3>{title}</h3>
            <p>{description}</p>
            {action ? <div className="ikapi-empty-action">{action}</div> : null}
        </div>
    );
}

export function BookCover({
    title,
    compact = false,
}: {
    title: string;
    compact?: boolean;
}) {
    return (
        <div
            className={compact ? 'ikapi-cover is-compact' : 'ikapi-cover'}
            role="img"
            aria-label={'Sampul belum tersedia untuk ' + title}
        >
            <span className="ikapi-cover-spine" />
            <span className="ikapi-cover-label">Sampul belum tersedia</span>
        </div>
    );
}

export function Currency({ value }: { value: number }) {
    return (
        <span className="ikapi-currency">
            {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
            }).format(value)}
        </span>
    );
}

export function formatBytes(bytes: number) {
    if (bytes >= 1024 * 1024)
        return (bytes / (1024 * 1024)).toFixed(1).replace('.', ',') + ' MB';
    return Math.max(1, Math.round(bytes / 1024)) + ' KB';
}

export const bookCategories = [
    'Pendidikan',
    'Teknologi',
    'Bisnis',
    'Sastra',
    'Budaya',
];
