import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    Trash2, Plus, Minus, ShoppingBag, ArrowRight, 
    ShieldCheck, Tag, CheckCircle2, AlertCircle, BookOpen 
} from 'lucide-react';
import { BuyerLayout, PageHeading } from '../components/BuyerLayout';
import { 
    useFalihStore, updateCartQuantity, removeFromCart, 
    clearCart, applyPromoCode, removePromoCode 
} from '../store';
import { toast } from 'sonner';
import '@/prototype/publisher/styles.css';

export default function CartScreen() {
    const { cartItems, cartSummary } = useFalihStore();
    const [promoInput, setPromoInput] = useState('');
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    const handleApplyPromo = (e: React.FormEvent) => {
        e.preventDefault();
        if (!promoInput.trim()) return;
        const res = applyPromoCode(promoInput);
        if (res.success) {
            toast.success(res.message);
            setPromoInput('');
        } else {
            toast.error(res.message);
        }
    };

    const handleRemovePromo = () => {
        removePromoCode();
        toast.info('Kode promo dihapus.');
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            toast.error('Keranjang Anda kosong! Silakan pilih buku terlebih dahulu.');
            return;
        }

        setIsCheckingOut(true);
        setTimeout(() => {
            setIsCheckingOut(false);
            setOrderSuccess(true);
            clearCart();
            toast.success('Pesanan berhasil dibuat! Menuju simulasi konfirmasi pembayaran.');
        }, 1200);
    };

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <>
            <Head title="Keranjang Belanja - IKAPI Jawa Barat" />
            <BuyerLayout active="cart">
                <PageHeading
                    eyebrow="Pesanan & Checkout Pembeli"
                    title="Keranjang belanja"
                    description="Kelola item buku digital pilihan Anda, atur jumlah eksemplar lisensi, dan terapkan voucher potongan harga resmi."
                    action={
                        <Link
                            href="/prototype/katalog"
                            className="ikapi-button ikapi-button-secondary text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                            <BookOpen size={14} />
                            <span>+ Tambah dari Katalog</span>
                        </Link>
                    }
                />

                {orderSuccess ? (
                    <div className="ikapi-panel ikapi-panel-pad max-w-xl mx-auto text-center my-8">
                        <div 
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                            style={{ background: 'var(--green-wash)', color: 'var(--green)' }}
                        >
                            <CheckCircle2 size={36} />
                        </div>
                        <h2 className="font-serif text-2xl font-bold text-[var(--ink)] mb-2">
                            Pemesanan Berhasil Disimulasikan!
                        </h2>
                        <p className="text-[var(--muted)] text-sm mb-6 leading-relaxed">
                            Order naskah digital Anda telah dicatat ke dalam antrean pesanan. Naskah berlisensi akan langsung dapat dibuka di Web E-Reader setelah pelunasan pembayaran.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <Link
                                href="/prototype/reader"
                                className="ikapi-button ikapi-button-primary text-xs flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <BookOpen size={15} />
                                <span>Buka Web Reader</span>
                            </Link>
                            <Link
                                href="/prototype/katalog"
                                className="ikapi-button ikapi-button-secondary text-xs flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>Kembali ke Katalog</span>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Cart Items List */}
                        <div className="lg:col-span-8 space-y-4">
                            <div className="ikapi-panel ikapi-panel-pad">
                                <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] mb-4">
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag size={18} className="text-[#a33b46]" />
                                        <h2 className="font-serif font-bold text-base text-[var(--ink)]">
                                            Daftar Buku ({cartItems.length} Judul)
                                        </h2>
                                    </div>
                                    {cartItems.length > 0 && (
                                        <button
                                            onClick={() => {
                                                clearCart();
                                                toast.info('Seluruh isi keranjang belanja telah dikosongkan.');
                                            }}
                                            className="text-xs text-[var(--muted)] hover:text-red-600 transition flex items-center gap-1 cursor-pointer"
                                        >
                                            <Trash2 size={13} />
                                            <span>Kosongkan</span>
                                        </button>
                                    )}
                                </div>

                                {cartItems.length === 0 ? (
                                    <div className="ikapi-empty-state">
                                        <div className="ikapi-empty-icon">
                                            <ShoppingBag size={22} />
                                        </div>
                                        <h3>Keranjang belanja Anda masih kosong</h3>
                                        <p>
                                            Anda belum menambahkan naskah digital ke dalam keranjang belanja. Jelajahi katalog buku IKAPI Jawa Barat.
                                        </p>
                                        <div className="ikapi-empty-action">
                                            <Link
                                                href="/prototype/katalog"
                                                className="ikapi-button ikapi-button-primary text-xs inline-flex items-center gap-2"
                                            >
                                                <span>Eksplorasi Katalog Buku</span>
                                                <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-[var(--line)]">
                                        {cartItems.map((item) => (
                                            <div
                                                key={item.book.id}
                                                className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                                            >
                                                <div className="flex items-start gap-3.5 min-w-0">
                                                    <img
                                                        src={item.book.coverImage}
                                                        alt={item.book.title}
                                                        className="w-16 h-22 object-cover rounded-md border border-[var(--line)] shadow-2xs shrink-0"
                                                    />
                                                    <div className="min-w-0">
                                                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#a33b46] block truncate">
                                                            {item.book.category}
                                                        </span>
                                                        <h3 className="font-serif font-bold text-[var(--ink)] text-sm sm:text-base leading-snug line-clamp-2">
                                                            {item.book.title}
                                                        </h3>
                                                        <p className="text-xs text-[var(--muted)] mt-0.5">
                                                            {item.book.author}
                                                        </p>
                                                        <span className="inline-block mt-1 text-[11px] font-medium text-[var(--green)]">
                                                            Format: {item.format}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--line)]">
                                                    {/* Quantity Control */}
                                                    <div className="flex items-center border border-[var(--line)] rounded-lg bg-[var(--surface-quiet)]">
                                                        <button
                                                            onClick={() => updateCartQuantity(item.book.id, -1)}
                                                            className="p-1.5 text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                                                            title="Kurangi kuantitas"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="px-3 text-xs font-bold font-mono text-[var(--ink)]">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateCartQuantity(item.book.id, 1)}
                                                            className="p-1.5 text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                                                            title="Tambah kuantitas"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>

                                                    <div className="text-right min-w-[100px]">
                                                        <div className="text-sm font-serif font-bold text-[var(--ink)]">
                                                            {formatRupiah(item.book.price * item.quantity)}
                                                        </div>
                                                        <span className="text-[11px] text-[var(--muted)] block">
                                                            @{formatRupiah(item.book.price)}
                                                        </span>
                                                    </div>

                                                    <button
                                                        onClick={() => {
                                                            removeFromCart(item.book.id);
                                                            toast.info(`Buku "${item.book.title}" dihapus dari keranjang.`);
                                                        }}
                                                        className="text-[var(--muted)] hover:text-red-600 transition p-1 cursor-pointer"
                                                        title="Hapus buku"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cart Summary */}
                        <div className="lg:col-span-4 space-y-5">
                            {/* Promo Code Input */}
                            <div className="ikapi-panel ikapi-panel-pad">
                                <h3 className="font-serif font-bold text-sm text-[var(--ink)] mb-3 flex items-center gap-1.5">
                                    <Tag size={15} className="text-[#a33b46]" />
                                    <span>Voucher Promo Diskon</span>
                                </h3>

                                {cartSummary.promoCode ? (
                                    <div 
                                        className="p-2.5 rounded-lg border flex items-center justify-between text-xs"
                                        style={{ background: 'var(--green-wash)', borderColor: 'var(--line)', color: 'var(--green)' }}
                                    >
                                        <div>
                                            <span className="font-bold">{cartSummary.promoCode}</span>
                                            <span className="block text-[11px] opacity-80">Diskon 15% Diterapkan</span>
                                        </div>
                                        <button
                                            onClick={handleRemovePromo}
                                            className="text-[11px] underline hover:opacity-80 cursor-pointer"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleApplyPromo} className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Kode: IKAPIJABAR"
                                                value={promoInput}
                                                onChange={e => setPromoInput(e.target.value.toUpperCase())}
                                                className="w-full text-xs uppercase font-mono px-3 py-2 rounded-lg border border-[var(--line-strong)] bg-[var(--surface)]"
                                            />
                                            <button
                                                type="submit"
                                                className="ikapi-button ikapi-button-secondary text-xs px-4 cursor-pointer"
                                            >
                                                Gunakan
                                            </button>
                                        </div>
                                        <p className="text-[11px] text-[var(--muted)]">
                                            Gunakan kode promo <strong>IKAPIJABAR</strong> untuk diskon 15%.
                                        </p>
                                    </form>
                                )}
                            </div>

                            {/* Cost Breakdown */}
                            <div className="ikapi-panel ikapi-panel-pad space-y-3">
                                <h3 className="font-serif font-bold text-sm text-[var(--ink)] pb-2 border-b border-[var(--line)]">
                                    Ringkasan Pembayaran
                                </h3>

                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between text-[var(--muted)]">
                                        <span>Subtotal ({cartSummary.totalItems} unit lisensi):</span>
                                        <span className="font-bold text-[var(--ink)]">{formatRupiah(cartSummary.subtotal)}</span>
                                    </div>

                                    {cartSummary.discountAmount > 0 && (
                                        <div className="flex justify-between text-[var(--green)]">
                                            <span>Potongan Diskon ({cartSummary.discountPercent}%):</span>
                                            <span className="font-bold">- {formatRupiah(cartSummary.discountAmount)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-[var(--muted)]">
                                        <span className="flex items-center gap-1">
                                            <span>PPN (11%):</span>
                                            <span title="Pajak Pertambahan Nilai 11% sesuai perundang-undangan">
                                                <AlertCircle size={12} className="text-[var(--muted)]" />
                                            </span>
                                        </span>
                                        <span className="font-bold text-[var(--ink)]">{formatRupiah(cartSummary.tax)}</span>
                                    </div>

                                    <div className="flex justify-between text-[var(--muted)]">
                                        <span>Biaya Layanan Gerbang:</span>
                                        <span className="font-bold text-[var(--ink)]">{formatRupiah(cartSummary.adminFee)}</span>
                                    </div>

                                    <div className="pt-3 border-t border-[var(--line)] flex justify-between items-baseline">
                                        <span className="font-bold text-sm text-[var(--ink)]">Total Tagihan:</span>
                                        <span className="font-serif text-xl font-bold text-[#a33b46]">
                                            {formatRupiah(cartSummary.total)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={cartItems.length === 0 || isCheckingOut}
                                    className="ikapi-button ikapi-button-primary w-full py-2.5 text-xs flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                                >
                                    {isCheckingOut ? (
                                        <span>Memproses Checkout...</span>
                                    ) : (
                                        <>
                                            <span>Lanjut ke Pembayaran</span>
                                            <ArrowRight size={14} />
                                        </>
                                    )}
                                </button>

                                <div className="text-[11px] text-[var(--muted)] text-center flex items-center justify-center gap-1 pt-1">
                                    <ShieldCheck size={13} className="text-[var(--green)]" />
                                    <span>Transaksi aman berlisensi resmi IKAPI Jabar</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </BuyerLayout>
        </>
    );
}
