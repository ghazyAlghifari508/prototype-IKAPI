import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    ShoppingCart, BookOpen, MessageSquare, 
    ArrowRight, CheckCircle2, Bookmark, Flame, BookCheck 
} from 'lucide-react';
import { BuyerLayout, PageHeading } from '../components/BuyerLayout';
import { useFalihStore } from '../store';
import '@/prototype/publisher/styles.css';

export default function HubScreen() {
    const { cartSummary, getBookmarks, getReviews, readingStreak, favoriteBookIds, completedBookIds } = useFalihStore();
    const bookmarks = getBookmarks();
    const reviews = getReviews();

    return (
        <>
            <Head title="Ruang Pembaca Digital - IKAPI Jawa Barat" />
            <BuyerLayout active="katalog">
                <PageHeading
                    eyebrow="Marketplace E-Book IKAPI Jawa Barat"
                    title="Ruang pembaca digital"
                    description="Pusat layanan pembaca buku digital berlisensi resmi: kelola keranjang belanja, baca naskah langsung di web reader, beri ulasan komunitas, dan isi evaluasi mutu terbitan."
                    action={
                        <Link
                            href="/prototype/katalog"
                            className="ikapi-button ikapi-button-primary flex items-center gap-2 cursor-pointer"
                        >
                            <BookOpen size={16} />
                            <span>Buka Katalog Buku</span>
                        </Link>
                    }
                />

                {/* 3 Main Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Card 1: Keranjang Belanja */}
                    <div className="ikapi-panel ikapi-panel-pad flex flex-col justify-between">
                        <div>
                            <div 
                                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                style={{ background: 'var(--coral-wash)', color: 'var(--wine)' }}
                            >
                                <ShoppingCart size={22} />
                            </div>
                            <span 
                                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-block mb-2"
                                style={{ background: 'var(--coral-wash)', color: 'var(--wine)', borderColor: 'var(--line)' }}
                            >
                                UC-09 & UC-10
                            </span>
                            <h2 className="font-serif font-bold text-lg text-[var(--ink)] mb-2">
                                Keranjang Belanja
                            </h2>
                            <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                                Pengelolaan item e-book dalam keranjang belanja, penambahan kuantitas lisensi, kalkulasi subtotal dan pajak PPN 11%, serta penerapan voucher promo.
                            </p>

                            <div className="p-3 bg-[var(--surface-quiet)] rounded-lg border border-[var(--line)] text-xs space-y-1 mb-4">
                                <div className="flex justify-between text-[var(--muted)]">
                                    <span>Item di keranjang:</span>
                                    <span className="font-bold text-[var(--ink)]">{cartSummary.totalItems} Buku</span>
                                </div>
                                <div className="flex justify-between text-[var(--muted)]">
                                    <span>Subtotal tagihan:</span>
                                    <span className="font-bold text-[#a33b46]">Rp {cartSummary.total.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/prototype/keranjang"
                            className="ikapi-button ikapi-button-secondary text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <span>Buka Keranjang Belanja</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>

                    {/* Card 2: E-Reader & Bookmarks */}
                    <div className="ikapi-panel ikapi-panel-pad flex flex-col justify-between">
                        <div>
                            <div 
                                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                style={{ background: 'var(--green-wash)', color: 'var(--green)' }}
                            >
                                <BookOpen size={22} />
                            </div>
                            <span 
                                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-block mb-2"
                                style={{ background: 'var(--green-wash)', color: 'var(--green)', borderColor: 'var(--line)' }}
                            >
                                UC-18 & UC-19
                            </span>
                            <h2 className="font-serif font-bold text-lg text-[var(--ink)] mb-2">
                                Web E-Reader & Bookmark
                            </h2>
                            <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                                Antarmuka pembaca naskah digital berestetika warm paper, navigasi lembar halaman, fitur auto-resume posisi terakhir, dan penanda bookmark cerdas.
                            </p>

                            <div className="p-3 bg-[var(--surface-quiet)] rounded-lg border border-[var(--line)] text-xs space-y-1 mb-4">
                                <div className="flex justify-between text-[var(--muted)]">
                                    <span>Bookmark tersimpan:</span>
                                    <span className="font-bold text-[var(--ink)]">{bookmarks.length} Penanda</span>
                                </div>
                                <div className="flex justify-between text-[var(--muted)]">
                                    <span>Mode Baca:</span>
                                    <span className="font-bold text-[var(--green)]">Warm Paper (Notion)</span>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/prototype/reader"
                            className="ikapi-button ikapi-button-secondary text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <span>Buka Web E-Reader</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>

                    {/* Card 3: Ulasan & Evaluasi */}
                    <div className="ikapi-panel ikapi-panel-pad flex flex-col justify-between">
                        <div>
                            <div 
                                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                style={{ background: 'var(--amber-wash)', color: 'var(--amber)' }}
                            >
                                <MessageSquare size={22} />
                            </div>
                            <span 
                                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-block mb-2"
                                style={{ background: 'var(--amber-wash)', color: 'var(--amber)', borderColor: 'var(--line)' }}
                            >
                                UC-07 & UC-20
                            </span>
                            <h2 className="font-serif font-bold text-lg text-[var(--ink)] mb-2">
                                Ulasan & Evaluasi Mutu
                            </h2>
                            <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                                Ulasan pembeli dengan Smart Content Filter (pencegahan kata kasar), verifikasi pelunasan transaksi, dan kuesioner evaluasi mutu penerbit skala Likert.
                            </p>

                            <div className="p-3 bg-[var(--surface-quiet)] rounded-lg border border-[var(--line)] text-xs space-y-1 mb-4">
                                <div className="flex justify-between text-[var(--muted)]">
                                    <span>Total ulasan terbit:</span>
                                    <span className="font-bold text-[var(--ink)]">{reviews.length} Ulasan</span>
                                </div>
                                <div className="flex justify-between text-[var(--muted)]">
                                    <span>Content Filter:</span>
                                    <span className="font-bold text-[var(--green)]">Aktif & Siaga</span>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/prototype/ulasan"
                            className="ikapi-button ikapi-button-secondary text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <span>Buka Ulasan & Evaluasi</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

                {/* Revisi Rapat 22 Oktober 2026 Summary */}
                <div className="ikapi-panel ikapi-panel-pad mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)] mb-6">
                        <div>
                            <span 
                                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-block mb-1"
                                style={{ background: 'var(--amber-wash)', color: 'var(--amber)', borderColor: 'var(--line)' }}
                            >
                                Catatan Pembaruan Rapat 22 Oktober 2026
                            </span>
                            <h2 className="font-serif text-xl font-bold text-[var(--ink)]">
                                Fitur Pembaruan Interaktif Ruang Pembeli
                            </h2>
                            <p className="text-xs text-[var(--muted)] mt-0.5">
                                Penyesuaian fitur pembeli sesuai arahan review mingguan tanpa mengubah use case modul lain.
                            </p>
                        </div>

                        {/* Live Quick Metrics */}
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-[var(--surface-quiet)] rounded-xl border border-[var(--line)] text-center min-w-[90px]">
                                <span className="block font-serif text-lg font-bold text-[var(--amber)]">{readingStreak.days} Hari</span>
                                <span className="text-[10px] font-bold text-[var(--muted)] uppercase">Streak Baca</span>
                            </div>
                            <div className="p-3 bg-[var(--surface-quiet)] rounded-xl border border-[var(--line)] text-center min-w-[90px]">
                                <span className="block font-serif text-lg font-bold text-[#a33b46]">{favoriteBookIds.length} Buku</span>
                                <span className="text-[10px] font-bold text-[var(--muted)] uppercase">Favorit ❤️</span>
                            </div>
                            <div className="p-3 bg-[var(--surface-quiet)] rounded-xl border border-[var(--line)] text-center min-w-[90px]">
                                <span className="block font-serif text-lg font-bold text-[var(--green)]">{completedBookIds.length} Buku</span>
                                <span className="text-[10px] font-bold text-[var(--muted)] uppercase">Sudah Dibaca 🎓</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                        <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-quiet)]">
                            <div className="text-sm font-bold text-[var(--ink)] mb-1.5 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#a33b46]"></span>
                                <span>Ulasan Pembeli Lunas</span>
                            </div>
                            <p className="text-[var(--muted)] leading-relaxed mb-3">
                                <em>"Yang penting udah bayar udah boleh ngulas"</em> — Gatekeeping verifikasi status pembayaran sebelum form ulasan dapat diakses (tersedia tombol simulasi untuk demo).
                            </p>
                            <Link href="/prototype/ulasan" className="text-[#a33b46] font-bold hover:underline flex items-center gap-1">
                                <span>Uji Coba di Ulasan</span>
                                <ArrowRight size={12} />
                            </Link>
                        </div>

                        <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-quiet)]">
                            <div className="text-sm font-bold text-[var(--ink)] mb-1.5 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                                <span>Ikon Love Favorit</span>
                            </div>
                            <p className="text-[var(--muted)] leading-relaxed mb-3">
                                Tombol hati interaktif pada sudut sampul buku untuk menandai buku favorit serta tab filter <strong>❤️ Favorit Saya</strong> di katalog.
                            </p>
                            <Link href="/prototype/katalog" className="text-[#a33b46] font-bold hover:underline flex items-center gap-1">
                                <span>Lihat di Katalog</span>
                                <ArrowRight size={12} />
                            </Link>
                        </div>

                        <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-quiet)]">
                            <div className="text-sm font-bold text-[var(--ink)] mb-1.5 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[var(--green)]"></span>
                                <span>Status 'Sudah Dibaca'</span>
                            </div>
                            <p className="text-[var(--muted)] leading-relaxed mb-3">
                                Lencana visual pada sampul buku dan tombol <em>Tandai Selesai</em> di E-Reader untuk menandai buku yang telah dituntaskan pembaca.
                            </p>
                            <Link href="/prototype/reader" className="text-[#a33b46] font-bold hover:underline flex items-center gap-1">
                                <span>Buka Reader</span>
                                <ArrowRight size={12} />
                            </Link>
                        </div>

                        <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-quiet)]">
                            <div className="text-sm font-bold text-[var(--ink)] mb-1.5 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[var(--amber)]"></span>
                                <span>Dark Mode & Streak</span>
                            </div>
                            <p className="text-[var(--muted)] leading-relaxed mb-3">
                                Toggle cepat 1-klik Mode Gelap/Terang pada bilah navigasi reader dan counter konsistensi membaca harian (Streak).
                            </p>
                            <Link href="/prototype/reader" className="text-[#a33b46] font-bold hover:underline flex items-center gap-1">
                                <span>Coba Dark Mode</span>
                                <ArrowRight size={12} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Skenario Use Case Matrix */}
                <div className="ikapi-panel ikapi-panel-pad">
                    <h2 className="font-serif text-lg font-bold text-[var(--ink)] mb-4 pb-3 border-b border-[var(--line)] flex items-center gap-2">
                        <BookCheck size={18} className="text-[#a33b46]" />
                        <span>Matriks Verifikasi Skenario Use Case Pembaca</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                        <div className="p-3.5 rounded-lg border border-[var(--line)] bg-[var(--surface-quiet)]">
                            <div className="flex items-center gap-2 font-bold text-[var(--ink)] mb-1">
                                <CheckCircle2 size={15} className="text-[var(--green)]" />
                                <span>UC-07: Memberikan Komentar</span>
                            </div>
                            <p className="text-[var(--muted)] leading-relaxed">
                                Form real-time, tombol hanya aktif jika ada teks, & Smart Filter mendeteksi kata kasar (Alternative 4.a).
                            </p>
                        </div>

                        <div className="p-3.5 rounded-lg border border-[var(--line)] bg-[var(--surface-quiet)]">
                            <div className="flex items-center gap-2 font-bold text-[var(--ink)] mb-1">
                                <CheckCircle2 size={15} className="text-[var(--green)]" />
                                <span>UC-09: Tambah ke Keranjang</span>
                            </div>
                            <p className="text-[var(--muted)] leading-relaxed">
                                Tombol tambah item buku, penambahan counter badge pada sidebar navbar, dan notifikasi sukses.
                            </p>
                        </div>

                        <div className="p-3.5 rounded-lg border border-[var(--line)] bg-[var(--surface-quiet)]">
                            <div className="flex items-center gap-2 font-bold text-[var(--ink)] mb-1">
                                <CheckCircle2 size={15} className="text-[var(--green)]" />
                                <span>UC-10: Kelola Keranjang Belanja</span>
                            </div>
                            <p className="text-[var(--muted)] leading-relaxed">
                                Edit kuantitas, hapus item, perhitungan subtotal/pajak PPN, dan handling keranjang kosong (Alternative 2.a).
                            </p>
                        </div>

                        <div className="p-3.5 rounded-lg border border-[var(--line)] bg-[var(--surface-quiet)]">
                            <div className="flex items-center gap-2 font-bold text-[var(--ink)] mb-1">
                                <CheckCircle2 size={15} className="text-[var(--green)]" />
                                <span>UC-18: Membaca E-Book</span>
                            </div>
                            <p className="text-[var(--muted)] leading-relaxed">
                                Web reader terintegrasi, navigasi halaman, slider, dan fitur auto-resume posisi halaman terakhir.
                            </p>
                        </div>

                        <div className="p-3.5 rounded-lg border border-[var(--line)] bg-[var(--surface-quiet)]">
                            <div className="flex items-center gap-2 font-bold text-[var(--ink)] mb-1">
                                <CheckCircle2 size={15} className="text-[var(--green)]" />
                                <span>UC-19: Menambahkan Bookmark</span>
                            </div>
                            <p className="text-[var(--muted)] leading-relaxed">
                                Penanda halaman aktif, drawer daftar bookmark, dan deteksi duplikasi halaman (Alternative 2.a).
                            </p>
                        </div>

                        <div className="p-3.5 rounded-lg border border-[var(--line)] bg-[var(--surface-quiet)]">
                            <div className="flex items-center gap-2 font-bold text-[var(--ink)] mb-1">
                                <CheckCircle2 size={15} className="text-[var(--green)]" />
                                <span>UC-20: Ulasan & Evaluasi Buku</span>
                            </div>
                            <p className="text-[var(--muted)] leading-relaxed">
                                Kuesioner evaluasi 4 aspek (1-5), testimoni teks, dan validasi kelengkapan kuesioner (Alternative 2.a).
                            </p>
                        </div>
                    </div>
                </div>
            </BuyerLayout>
        </>
    );
}
