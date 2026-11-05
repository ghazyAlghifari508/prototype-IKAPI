import React, { useState, type ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    ShoppingCart,
    BookMarked,
    MessageSquareText,
    CircleHelp,
    Menu,
    ChevronDown,
    Flame,
    RotateCcw
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
import { useFalihStore, resetAllFalihData } from '../store';
import { toast } from 'sonner';
import '@/prototype/publisher/styles.css';

const buyerNavItems = [
    {
        label: 'Katalog buku',
        href: '/prototype/katalog',
        icon: BookOpen,
        section: 'katalog',
    },
    {
        label: 'Keranjang belanja',
        href: '/prototype/keranjang',
        icon: ShoppingCart,
        section: 'cart',
        showBadge: true,
    },
    {
        label: 'Web E-Reader',
        href: '/prototype/reader',
        icon: BookMarked,
        section: 'reader',
    },
    {
        label: 'Ulasan & evaluasi',
        href: '/prototype/ulasan',
        icon: MessageSquareText,
        section: 'reviews',
    },
] as const;

export type BuyerSection = (typeof buyerNavItems)[number]['section'];

function Brand() {
    return (
        <Link
            href="/prototype/katalog"
            className="ikapi-brand"
            aria-label="IKAPI Jawa Barat, rak buku digital"
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
    cartCount,
}: {
    active?: BuyerSection;
    onNavigate?: () => void;
    cartCount: number;
}) {
    return (
        <nav className="ikapi-nav" aria-label="Navigasi pembaca">
            <p className="ikapi-nav-label">Ruang pembaca</p>
            {buyerNavItems.map(({ label, href, icon: Icon, section, ...rest }) => (
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
                    <span className="flex-1">{label}</span>
                    {'showBadge' in rest && cartCount > 0 && (
                        <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#a33b46] text-white">
                            {cartCount}
                        </span>
                    )}
                </Link>
            ))}
        </nav>
    );
}

export function BuyerLayout({
    active,
    children,
}: {
    active?: BuyerSection;
    children: ReactNode;
}) {
    const { cartSummary, readingStreak } = useFalihStore();
    const [menuOpen, setMenuOpen] = useState(false);
    const [resetOpen, setResetOpen] = useState(false);

    function resetData() {
        resetAllFalihData();
        setResetOpen(false);
        toast.success('Data simulasi pembeli berhasil dipulihkan ke kondisi awal.');
    }

    const currentNav = buyerNavItems.find((item) => item.section === active);

    return (
        <div className="ikapi-app">
            {/* Fixed Left Sidebar matching Publisher layout */}
            <aside className="ikapi-sidebar">
                <Brand />
                <NavLinks
                    active={active}
                    cartCount={cartSummary.totalItems}
                />
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
                    <p className="ikapi-sidebar-foot">Pembaca · Jawa Barat</p>
                </div>
            </aside>

            {/* Main Content Column */}
            <div className="ikapi-main-column">
                <header className="ikapi-topbar">
                    <div className="flex items-center gap-3">
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
                            <span>Ruang pembaca</span>
                            <span aria-hidden="true">/</span>
                            <strong>{currentNav?.label ?? 'Katalog buku'}</strong>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Reading Streak Indicator (22 Okt meeting note) */}
                        <div 
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
                            style={{ 
                                background: 'var(--amber-wash)', 
                                borderColor: 'var(--line)',
                                color: 'var(--amber)' 
                            }}
                            title={`Streak membaca Anda: ${readingStreak.days} hari berturut-turut`}
                        >
                            <Flame size={15} className="text-[#a33b46] fill-current animate-pulse" />
                            <span>{readingStreak.days} Hari Streak</span>
                        </div>

                        {/* Account Menu */}
                        <details className="ikapi-account-menu">
                            <summary aria-label="Menu akun pembeli">
                                <span
                                    className="ikapi-account-avatar"
                                    aria-hidden="true"
                                >
                                    AB
                                </span>
                                <span className="ikapi-account-name">
                                    <strong>Ahmad Budiman</strong>
                                    <small>Akun pembeli</small>
                                </span>
                                <ChevronDown size={16} aria-hidden="true" />
                            </summary>
                            <div className="ikapi-account-popover">
                                <p>Data akun pembaca</p>
                                <Link href="/prototype/katalog">
                                    Katalog buku digital
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
                    </div>
                </header>

                <main className="ikapi-page-content">{children}</main>
            </div>

            {/* Mobile Drawer */}
            <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
                <DialogContent
                    className="ikapi-drawer"
                    aria-describedby="buyer-nav-description"
                >
                    <DialogHeader className="ikapi-drawer-header">
                        <Brand />
                        <DialogDescription id="buyer-nav-description">
                            Pilih bagian yang ingin dibuka.
                        </DialogDescription>
                    </DialogHeader>
                    <NavLinks
                        active={active}
                        onNavigate={() => setMenuOpen(false)}
                        cartCount={cartSummary.totalItems}
                    />
                    <div className="ikapi-drawer-footer">
                        Pembaca · Jawa Barat
                    </div>
                </DialogContent>
            </Dialog>

            {/* Reset Modal */}
            <Dialog open={resetOpen} onOpenChange={setResetOpen}>
                <DialogContent className="ikapi-dialog">
                    <DialogHeader>
                        <DialogTitle>Pulihkan data awal?</DialogTitle>
                        <DialogDescription>
                            Data keranjang belanja, bookmark halaman buku, riwayat ulasan, dan preferensi akan dikembalikan ke kondisi awal.
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
    eyebrow = 'Ruang Pembaca IKAPI Jawa Barat',
    description,
    action,
}: {
    title: string;
    eyebrow?: string;
    description?: string;
    action?: ReactNode;
}) {
    return (
        <div className="ikapi-page-heading">
            <div>
                <p className="ikapi-eyebrow">{eyebrow}</p>
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
