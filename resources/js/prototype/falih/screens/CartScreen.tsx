import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { 
    Trash2, Plus, Minus, ShoppingBag, ArrowRight, 
    ShieldCheck, Tag, CheckCircle2, AlertCircle, Sparkles, BookOpen 
} from 'lucide-react';
import { FalihNavbar } from '../components/FalihNavbar';
import { 
    useFalihStore, updateCartQuantity, removeFromCart, 
    clearCart, applyPromoCode, removePromoCode 
} from '../store';
import { toast } from 'sonner';
import '../styles.css';

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
        <div className="falih-layout flex flex-col min-h-screen">
            <FalihNavbar activeTab="cart" />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e3e2e0] pb-5">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="falih-pill bg-blue-100 text-[#0075de]">
                                UC-09 & UC-10
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                                Pengelolaan Keranjang Belanja Pelanggan
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
                            Keranjang Belanja
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/prototype/falih/katalog"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0075de] hover:underline"
                        >
                            <span>+ Tambah buku dari katalog</span>
                        </Link>
                    </div>
                </div>

                {orderSuccess ? (
                    <div className="falih-card max-w-xl mx-auto p-8 text-center my-12 fade-in-slide">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-9 h-9" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pemesanan Berhasil Disimulasikan!</h2>
                        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                            Order digital Anda telah dicatat ke dalam database. Pada skenario lengkap, pesanan akan diteruskan ke gerbang pembayaran digital Midtrans (PIC Ghazy / F06).
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <Link
                                href="/prototype/falih/reader"
                                className="falih-btn-primary px-5 py-2.5 text-sm inline-flex items-center justify-center gap-2"
                            >
                                <BookOpen className="w-4 h-4" />
                                <span>Buka Buku di E-Reader</span>
                            </Link>
                            <button
                                onClick={() => setOrderSuccess(false)}
                                className="px-5 py-2.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                            >
                                Kembali ke Keranjang
                            </button>
                        </div>
                    </div>
                ) : cartItems.length === 0 ? (
                    /* UC-10 Alternative Scenario 2.a: Keranjang Kosong */
                    <div className="falih-card p-12 text-center my-8 max-w-lg mx-auto">
                        <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4 border border-amber-200">
                            <ShoppingBag className="w-10 h-10" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                            Keranjang Belanja Anda Masih Kosong
                        </h3>
                        <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto leading-relaxed">
                            Belum ada e-book yang Anda pilih. Jelajahi katalog buku karya penerbit anggota IKAPI Jawa Barat untuk mulai membaca.
                        </p>
                        <Link
                            href="/prototype/falih/katalog"
                            className="falih-btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2 shadow-xs"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>Jelajahi Katalog Buku Sekarang</span>
                        </Link>
                    </div>
                ) : (
                    /* Active Cart Items & Summary Layout */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left: Item List */}
                        <div className="lg:col-span-8 space-y-4">
                            <div className="flex items-center justify-between text-xs text-gray-500 px-1 font-medium">
                                <span>Item E-Book ({cartSummary.totalItems} Buku)</span>
                                <button 
                                    onClick={() => {
                                        if (confirm('Kosongkan seluruh isi keranjang?')) {
                                            clearCart();
                                            toast.info('Keranjang berhasil dikosongkan.');
                                        }
                                    }}
                                    className="text-red-600 hover:underline flex items-center gap-1"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Hapus Semua</span>
                                </button>
                            </div>

                            <div className="space-y-3">
                                {cartItems.map(({ book, quantity, format }) => (
                                    <div
                                        key={book.id}
                                        className="falih-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-xs transition"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Book Cover */}
                                            <img
                                                src={book.coverImage}
                                                alt={book.title}
                                                className="w-16 h-22 sm:w-20 sm:h-28 object-cover rounded-md shadow-xs border border-gray-200 shrink-0"
                                            />
                                            {/* Details */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[11px] font-semibold text-[#0075de] uppercase tracking-wider">
                                                        {book.category}
                                                    </span>
                                                    <span className="text-gray-300">•</span>
                                                    <span className="text-[11px] text-gray-500 font-medium">
                                                        {book.publisher}
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold text-gray-900 text-base leading-snug">
                                                    {book.title}
                                                </h3>
                                                <p className="text-xs text-gray-600 mb-2">
                                                    Penulis: {book.author}
                                                </p>
                                                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    {format}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions & Price */}
                                        <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                            <div className="text-right">
                                                <div className="text-base font-bold text-gray-900">
                                                    {formatRupiah(book.price * quantity)}
                                                </div>
                                                {quantity > 1 && (
                                                    <div className="text-[11px] text-gray-500">
                                                        {formatRupiah(book.price)} / lisensi
                                                    </div>
                                                )}
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-2">
                                                <div className="inline-flex items-center border border-gray-200 rounded-md bg-gray-50">
                                                    <button
                                                        onClick={() => updateCartQuantity(book.id, -1)}
                                                        className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-l-md transition"
                                                        title="Kurangi kuantitas"
                                                    >
                                                        <Minus className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span className="px-2.5 text-xs font-bold text-gray-800">
                                                        {quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateCartQuantity(book.id, 1)}
                                                        className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-r-md transition"
                                                        title="Tambah kuantitas"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        removeFromCart(book.id);
                                                        toast.info(`Buku "${book.title}" dihapus dari keranjang.`);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-md transition"
                                                    title="Hapus buku"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Trust Badge */}
                            <div className="p-3.5 bg-white rounded-lg border border-[#e3e2e0] flex items-center gap-3 text-xs text-gray-600">
                                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                                <span>
                                    Setiap pembelian e-book resmi di IKAPI Jawa Barat menjamin hak lisensi baca seumur hidup dan mendukung langsung royalti penulis lokal.
                                </span>
                            </div>
                        </div>

                        {/* Right: Order Summary */}
                        <div className="lg:col-span-4">
                            <div className="falih-card p-6 sticky top-24">
                                <h2 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                                    Ringkasan Belanja
                                </h2>

                                {/* Promo Code Form */}
                                <form onSubmit={handleApplyPromo} className="mb-5">
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                        Punya Kode Promo / Voucher?
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                                            <input
                                                type="text"
                                                placeholder="Contoh: IKAPIJABAR"
                                                value={promoInput}
                                                onChange={e => setPromoInput(e.target.value)}
                                                className="w-full text-xs pl-8 pr-2 py-2 rounded-md border border-gray-200 focus:outline-hidden focus:border-[#0075de] uppercase font-mono"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="px-3 py-2 text-xs font-semibold bg-gray-900 text-white rounded-md hover:bg-gray-800 transition"
                                        >
                                            Terapkan
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        Tips prototype: Coba gunakan kode <span className="font-mono text-blue-600 font-bold">IKAPIJABAR</span>
                                    </p>
                                </form>

                                {cartSummary.promoCode && (
                                    <div className="mb-4 p-2.5 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between text-xs text-blue-900">
                                        <div className="flex items-center gap-1.5 font-medium">
                                            <Tag className="w-3.5 h-3.5 text-[#0075de]" />
                                            <span>Voucher: {cartSummary.promoCode} (-{cartSummary.discountPercent}%)</span>
                                        </div>
                                        <button
                                            onClick={handleRemovePromo}
                                            className="text-red-600 hover:underline font-semibold text-[11px]"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                )}

                                {/* Pricing Breakdown */}
                                <div className="space-y-2.5 text-xs pb-4 border-b border-gray-100">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Total Harga ({cartSummary.totalItems} item)</span>
                                        <span className="font-medium text-gray-900">{formatRupiah(cartSummary.subtotal)}</span>
                                    </div>

                                    {cartSummary.discountAmount > 0 && (
                                        <div className="flex justify-between text-emerald-600 font-medium">
                                            <span>Diskon Voucher</span>
                                            <span>-{formatRupiah(cartSummary.discountAmount)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-gray-600">
                                        <span className="flex items-center gap-1">
                                            PPN (11%)
                                            <span title="Pajak Pertambahan Nilai resmi">
                                                <AlertCircle className="w-3 h-3 text-gray-400" />
                                            </span>
                                        </span>
                                        <span className="font-medium text-gray-900">{formatRupiah(cartSummary.tax)}</span>
                                    </div>

                                    <div className="flex justify-between text-gray-600">
                                        <span>Biaya Layanan Platform</span>
                                        <span className="font-medium text-gray-900">{formatRupiah(cartSummary.adminFee)}</span>
                                    </div>
                                </div>

                                {/* Total Due */}
                                <div className="flex justify-between items-baseline py-4 mb-5">
                                    <div>
                                        <span className="text-xs text-gray-500 block">Total Pembayaran</span>
                                        <span className="text-xl font-bold text-gray-900">
                                            {formatRupiah(cartSummary.total)}
                                        </span>
                                    </div>
                                    <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                                        Akses Digital Instan
                                    </span>
                                </div>

                                {/* Checkout Button */}
                                <button
                                    onClick={handleCheckout}
                                    disabled={isCheckingOut}
                                    className="falih-btn-primary w-full py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                                >
                                    {isCheckingOut ? (
                                        <span>Memproses Pesanan...</span>
                                    ) : (
                                        <>
                                            <span>Lanjut ke Pembayaran</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-[11px] text-gray-400 mt-2.5">
                                    Simulasi pemesanan untuk evaluasi prototype frontend
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
