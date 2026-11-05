import React from 'react';
import { Link } from '@inertiajs/react';
import { 
    ShoppingCart, BookOpen, MessageSquare, Award, 
    ArrowRight, CheckCircle2, ShieldCheck, Bookmark, Sparkles, BookCheck 
} from 'lucide-react';
import { FalihNavbar } from '../components/FalihNavbar';
import { useFalihStore } from '../store';
import '../styles.css';

export default function HubScreen() {
    const { cartSummary, getBookmarks, getReviews } = useFalihStore();
    const bookmarks = getBookmarks();
    const reviews = getReviews();

    return (
        <div className="falih-layout flex flex-col min-h-screen">
            <FalihNavbar activeTab="hub" />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Hero Header */}
                <div className="mb-10 text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0075de] text-xs font-semibold mb-3">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Interactive Prototype Module • Falih Afnan Fauzi</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight mb-3">
                        Marketplace E-Book IKAPI Jawa Barat
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        Implementasi frontend prototype untuk 6 use case penugasan mandiri: Pengelolaan Keranjang Belanja, Pembaca Digital Web E-Reader, Penanda Halaman (Bookmark), serta Komentar Berfilter Cerdas & Kuesioner Evaluasi Mutu Penerbit.
                    </p>
                </div>

                {/* 3 Main Feature Modules Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Card 1: Keranjang Belanja */}
                    <div className="falih-card p-6 flex flex-col justify-between hover:shadow-lg hover:border-[#0075de] transition">
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0075de] flex items-center justify-center mb-4">
                                <ShoppingCart className="w-6 h-6" />
                            </div>
                            <span className="falih-pill bg-blue-100 text-[#0075de] mb-2">
                                UC-09 & UC-10
                            </span>
                            <h2 className="text-lg font-bold text-gray-900 mb-2">
                                Keranjang Belanja & Checkout
                            </h2>
                            <p className="text-xs text-gray-600 leading-relaxed mb-4">
                                Pengelolaan item e-book dalam keranjang belanja, penambahan kuantitas, kalkulasi subtotal dan pajak PPN 11%, kode voucher promo, dan validasi keranjang kosong.
                            </p>

                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs space-y-1 mb-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Item di keranjang:</span>
                                    <span className="font-bold text-gray-900">{cartSummary.totalItems} Buku</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal:</span>
                                    <span className="font-bold text-[#0075de]">Rp {cartSummary.total.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/prototype/falih/keranjang"
                            className="falih-btn-primary py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
                        >
                            <span>Buka Keranjang Belanja</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {/* Card 2: E-Reader & Bookmarks */}
                    <div className="falih-card p-6 flex flex-col justify-between hover:shadow-lg hover:border-[#0075de] transition">
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <span className="falih-pill bg-emerald-100 text-emerald-700 mb-2">
                                UC-18 & UC-19
                            </span>
                            <h2 className="text-lg font-bold text-gray-900 mb-2">
                                E-Reader & Bookmark Pintar
                            </h2>
                            <p className="text-xs text-gray-600 leading-relaxed mb-4">
                                Antarmuka pembaca naskah digital berestetika warm paper, navigasi lembar halaman, fitur auto-resume posisi terakhir, penanda halaman dengan deteksi duplikat, dan proteksi hak cipta.
                            </p>

                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs space-y-1 mb-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Bookmark tersimpan:</span>
                                    <span className="font-bold text-gray-900">{bookmarks.length} Penanda</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Mode Kanvas:</span>
                                    <span className="font-bold text-emerald-700">Warm Paper (Notion)</span>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/prototype/falih/reader"
                            className="falih-btn-primary py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
                        >
                            <span>Buka Web E-Reader</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {/* Card 3: Ulasan & Evaluasi */}
                    <div className="falih-card p-6 flex flex-col justify-between hover:shadow-lg hover:border-[#0075de] transition">
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <span className="falih-pill bg-amber-100 text-amber-800 mb-2">
                                UC-07 & UC-20
                            </span>
                            <h2 className="text-lg font-bold text-gray-900 mb-2">
                                Ulasan & Evaluasi Mutu
                            </h2>
                            <p className="text-xs text-gray-600 leading-relaxed mb-4">
                                Formulir komentar pembeli dengan validasi Smart Content Filter (pencegahan kata kasar), kuesioner evaluasi mutu penerbit 4 aspek skala Likert 1-5, serta feed ulasan terverifikasi.
                            </p>

                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs space-y-1 mb-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Total ulasan publik:</span>
                                    <span className="font-bold text-gray-900">{reviews.length} Ulasan</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Smart Content Filter:</span>
                                    <span className="font-bold text-emerald-600">Aktif & Siaga</span>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/prototype/falih/ulasan"
                            className="falih-btn-primary py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
                        >
                            <span>Buka Ulasan & Evaluasi</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* Checklist Kebutuhan Skenario Use Case */}
                <div className="falih-card p-6 sm:p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
                        <BookCheck className="w-5 h-5 text-[#0075de]" />
                        <span>Matriks Verifikasi Skenario Use Case (Falih Afnan Fauzi)</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                        <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200">
                            <div className="flex items-center gap-2 font-bold text-gray-900 mb-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>UC-07: Memberikan Komentar</span>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                Form real-time, tombol hanya aktif jika ada teks, & Smart Filter mendeteksi kata kasar (Alternative 4.a).
                            </p>
                        </div>

                        <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200">
                            <div className="flex items-center gap-2 font-bold text-gray-900 mb-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>UC-09: Tambah ke Keranjang</span>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                Tombol tambah item buku, penambahan counter badge pada navbar, dan notifikasi sukses.
                            </p>
                        </div>

                        <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200">
                            <div className="flex items-center gap-2 font-bold text-gray-900 mb-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>UC-10: Kelola Keranjang Belanja</span>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                Edit kuantitas, hapus item, perhitungan subtotal/pajak PPN, dan handling keranjang kosong (Alternative 2.a).
                            </p>
                        </div>

                        <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200">
                            <div className="flex items-center gap-2 font-bold text-gray-900 mb-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>UC-18: Membaca E-Book</span>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                Web reader terintegrasi, navigasi halaman, slider, dan fitur auto-resume posisi halaman terakhir.
                            </p>
                        </div>

                        <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200">
                            <div className="flex items-center gap-2 font-bold text-gray-900 mb-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>UC-19: Menambahkan Bookmark</span>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                Penanda halaman aktif, drawer daftar bookmark, dan deteksi duplikasi halaman (Alternative 2.a).
                            </p>
                        </div>

                        <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200">
                            <div className="flex items-center gap-2 font-bold text-gray-900 mb-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>UC-20: Ulasan & Evaluasi Buku</span>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                Kuesioner evaluasi 4 aspek (1-5), testimoni teks, dan validasi kelengkapan kuesioner (Alternative 2.a).
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
