import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { 
    Search, ShoppingCart, BookOpen, Star, Sparkles, 
    Check, Filter, ShieldCheck, ArrowRight, MessageSquare,
    Heart, Flame, CheckCircle2
} from 'lucide-react';
import { FalihNavbar } from '../components/FalihNavbar';
import { 
    useFalihStore, addToCart, toggleFavoriteBook, 
    isBookFavorite, isBookCompleted 
} from '../store';
import { Book } from '../mockData';
import { toast } from 'sonner';
import '../styles.css';

export default function CatalogScreen() {
    const { books, readingStreak, favoriteBookIds } = useFalihStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

    const categories = ['Semua', '❤️ Favorit Saya', 'Sastra & Fiksi Klasik', 'Budaya Sunda & Sejarah', 'Misteri & Detektif', 'Filsafat & Sains Matematika', 'Teknologi & Komputer'];

    const filteredBooks = books.filter(b => {
        let matchesCategory = true;
        if (selectedCategory === '❤️ Favorit Saya') {
            matchesCategory = isBookFavorite(b.id);
        } else if (selectedCategory !== 'Semua') {
            matchesCategory = b.category === selectedCategory;
        }

        const matchesQuery = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             b.publisher.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesQuery;
    });

    const handleAddToCart = (book: Book) => {
        const res = addToCart(book, 1);
        toast.success(res.message, {
            description: 'Item berhasil ditambahkan ke keranjang belanja Anda.',
            action: {
                label: 'Buka Keranjang',
                onClick: () => {
                    window.location.href = '/prototype/falih/keranjang';
                }
            }
        });
    };

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="falih-layout flex flex-col min-h-screen">
            <FalihNavbar activeTab="katalog" />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Banner */}
                <div className="falih-card p-6 sm:p-8 mb-8 bg-gradient-to-r from-white via-white to-blue-50/40 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-2xl relative z-10">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="falih-pill bg-blue-100 text-[#0075de]">
                                Etalase E-Book Digital
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                                Penerbit Anggota IKAPI Jawa Barat
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight mb-2">
                            Katalog Buku & Eksplorasi Bacaan
                        </h1>
                        <p className="text-sm text-gray-600 leading-relaxed mb-6">
                            Temukan naskah digital berlisensi resmi dari penerbit Jawa Barat. Uji coba langsung fitur <strong>Tambah ke Keranjang (UC-09)</strong>, <strong>Buka di Web Reader (UC-18)</strong>, dan <strong>Beri Evaluasi & Ulasan (UC-07/20)</strong>.
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-lg">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                            <input
                                type="text"
                                placeholder="Cari judul buku, nama pengarang, atau penerbit..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white shadow-xs focus:outline-hidden focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]"
                            />
                        </div>
                    </div>

                    {/* Reading Streak Widget (22 Okt Revision) */}
                    <div className="shrink-0 bg-white/90 backdrop-blur-xs p-4 rounded-xl border border-amber-200/80 shadow-xs max-w-xs w-full flex flex-col gap-2 relative">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                Streak Baca Harian
                            </span>
                            <span className="falih-pill bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5">
                                Aktif 🔥
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-xs">
                                <Flame className="w-7 h-7 fill-current animate-pulse" />
                            </div>
                            <div>
                                <div className="text-xl font-extrabold text-gray-900 leading-none">
                                    {readingStreak.days} Hari
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Target hari ini: <strong>{readingStreak.todayMinutes}/{readingStreak.goalMinutes} mnt</strong>
                                </div>
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, (readingStreak.todayMinutes / readingStreak.goalMinutes) * 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Category Pills Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
                    <Filter className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`falih-pill px-3 py-1.5 text-xs font-semibold shrink-0 transition ${
                                selectedCategory === cat
                                    ? 'bg-[#0075de] text-white'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Books Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredBooks.map(book => (
                        <div
                            key={book.id}
                            className="falih-card flex flex-col justify-between overflow-hidden group hover:shadow-md transition"
                        >
                            <div className="p-4">
                                {/* Book Cover with Aspect Ratio */}
                                <div className="relative mb-3 aspect-3/4 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-xs">
                                    <img
                                        src={book.coverImage}
                                        alt={book.title}
                                        className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                                    />
                                    <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-bold">
                                        {book.category}
                                    </div>

                                    {/* Favorite Heart Icon Button (22 Okt Revision) */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const res = toggleFavoriteBook(book.id);
                                            toast(res.isFavorite ? 'Buku ditambahkan ke Favorit ❤️' : 'Buku dihapus dari Favorit', {
                                                description: book.title
                                            });
                                        }}
                                        className={`absolute top-2 left-2 p-1.5 rounded-full backdrop-blur-md transition z-10 ${
                                            isBookFavorite(book.id)
                                                ? 'bg-rose-500 text-white shadow-xs scale-110'
                                                : 'bg-black/40 text-white hover:bg-black/60 hover:scale-105'
                                        }`}
                                        title={isBookFavorite(book.id) ? 'Hapus dari Favorit' : 'Jadikan Favorit'}
                                    >
                                        <Heart className={`w-3.5 h-3.5 ${isBookFavorite(book.id) ? 'fill-current' : ''}`} />
                                    </button>

                                    {/* Sudah Dibaca Badge (22 Okt Revision) */}
                                    {isBookCompleted(book.id) && (
                                        <div className="absolute bottom-2 left-2 bg-emerald-600/95 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-xs z-10">
                                            <CheckCircle2 className="w-3 h-3" />
                                            <span>Sudah Dibaca</span>
                                        </div>
                                    )}
                                </div>

                                {/* Meta & Title */}
                                <div className="text-[11px] text-gray-500 font-medium mb-1">
                                    {book.publisher}
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">
                                    {book.title}
                                </h3>
                                <p className="text-xs text-gray-600 mb-2">
                                    {book.author}
                                </p>

                                {/* Rating */}
                                <div className="flex items-center gap-1.5 mb-3 text-xs">
                                    <div className="flex items-center text-amber-400">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        <span className="font-bold text-gray-900 ml-1">{book.rating}</span>
                                    </div>
                                    <span className="text-gray-400 text-[11px]">
                                        ({book.reviewCount} ulasan)
                                    </span>
                                </div>

                                <div className="text-base font-extrabold text-[#111111]">
                                    {formatRupiah(book.price)}
                                </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="p-4 pt-0 border-t border-gray-100 mt-2 space-y-2">
                                <button
                                    onClick={() => handleAddToCart(book)}
                                    className="falih-btn-primary w-full py-2 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
                                >
                                    <ShoppingCart className="w-3.5 h-3.5" />
                                    <span>+ Keranjang (UC-09)</span>
                                </button>

                                <div className="grid grid-cols-2 gap-1.5">
                                    <Link
                                        href={`/prototype/falih/reader?book=${book.id}`}
                                        className="py-1.5 px-2 rounded-md border border-gray-200 hover:bg-gray-50 text-[11px] font-medium text-gray-700 flex items-center justify-center gap-1 transition"
                                        title="Buka naskah di web reader"
                                    >
                                        <BookOpen className="w-3 h-3 text-[#0075de]" />
                                        <span>E-Reader (UC-18)</span>
                                    </Link>

                                    <Link
                                        href="/prototype/falih/ulasan"
                                        className="py-1.5 px-2 rounded-md border border-gray-200 hover:bg-gray-50 text-[11px] font-medium text-gray-700 flex items-center justify-center gap-1 transition"
                                        title="Beri komentar atau evaluasi kuesioner"
                                    >
                                        <MessageSquare className="w-3 h-3 text-amber-500" />
                                        <span>Ulasan (UC-20)</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
