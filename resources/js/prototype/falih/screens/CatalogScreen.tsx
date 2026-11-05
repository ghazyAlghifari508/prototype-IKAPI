import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    Search, ShoppingCart, BookOpen, Star, 
    Filter, MessageSquare, Heart, Flame, CheckCircle2 
} from 'lucide-react';
import { BuyerLayout, PageHeading } from '../components/BuyerLayout';
import { 
    useFalihStore, addToCart, toggleFavoriteBook, 
    isBookFavorite, isBookCompleted 
} from '../store';
import { Book } from '../mockData';
import { toast } from 'sonner';
import '@/prototype/publisher/styles.css';

export default function CatalogScreen() {
    const { books, readingStreak } = useFalihStore();
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
                    window.location.href = '/prototype/keranjang';
                }
            }
        });
    };

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <>
            <Head title="Katalog Buku Digital - IKAPI Jawa Barat" />
            <BuyerLayout active="katalog">
                <PageHeading
                    eyebrow="Koleksi Digital IKAPI Jawa Barat"
                    title="Katalog buku & eksplorasi bacaan"
                    description="Temukan naskah digital berlisensi resmi dari penerbit se-Jawa Barat. Tambahkan ke keranjang, tandai buku favorit, atau baca langsung di Web Reader."
                    action={
                        <Link
                            href="/prototype/keranjang"
                            className="ikapi-button ikapi-button-primary flex items-center gap-2 cursor-pointer"
                        >
                            <ShoppingCart size={16} />
                            <span>Buka Keranjang Belanja</span>
                        </Link>
                    }
                />

                {/* Hero / Streak Banner & Search Bar */}
                <div className="ikapi-panel ikapi-panel-pad mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-xl">
                        <h2 className="font-serif text-xl font-bold text-[var(--ink)] mb-2">
                            Pencarian Koleksi Naskah Digital
                        </h2>
                        <p className="text-xs text-[var(--muted)] mb-4">
                            Cari judul buku, nama pengarang terdaftar, atau penerbit anggota IKAPI Jawa Barat.
                        </p>
                        <div className="relative">
                            <Search size={16} className="text-[var(--muted)] absolute left-3.5 top-3.5" />
                            <input
                                type="text"
                                placeholder="Cari naskah, pengarang, atau penerbit..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] focus:outline-hidden"
                            />
                        </div>
                    </div>

                    {/* Streak Membaca Widget (22 Okt Catatan Rapat) */}
                    <div 
                        className="shrink-0 p-4 rounded-xl border max-w-xs w-full flex flex-col gap-2"
                        style={{ background: 'var(--amber-wash)', borderColor: 'var(--line)' }}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--amber)]">
                                Streak Baca Harian
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#a33b46] text-white">
                                Aktif 🔥
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div 
                                className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-xs"
                                style={{ background: 'var(--wine)' }}
                            >
                                <Flame size={22} className="fill-current animate-pulse" />
                            </div>
                            <div>
                                <div className="text-xl font-serif font-bold text-[var(--ink)] leading-none">
                                    {readingStreak.days} Hari
                                </div>
                                <div className="text-[11px] text-[var(--muted)] mt-1">
                                    Target hari ini: <strong>{readingStreak.todayMinutes}/{readingStreak.goalMinutes} mnt</strong>
                                </div>
                            </div>
                        </div>
                        <div className="w-full bg-[var(--surface)] h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ 
                                    background: 'var(--wine)',
                                    width: `${Math.min(100, (readingStreak.todayMinutes / readingStreak.goalMinutes) * 100)}%` 
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Category Pills Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
                    <Filter size={15} className="text-[var(--muted)] shrink-0 ml-1" />
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition cursor-pointer ${
                                selectedCategory === cat
                                    ? 'bg-[#a33b46] text-white'
                                    : 'bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] hover:border-[var(--line-strong)]'
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
                            className="ikapi-panel overflow-hidden flex flex-col justify-between hover:shadow-md transition"
                        >
                            <div className="p-4">
                                {/* Book Cover with Aspect Ratio */}
                                <div className="relative mb-3 aspect-3/4 rounded-lg overflow-hidden bg-[var(--surface-quiet)] border border-[var(--line)] shadow-2xs">
                                    <img
                                        src={book.coverImage}
                                        alt={book.title}
                                        className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                                    />
                                    <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-bold">
                                        {book.category}
                                    </div>

                                    {/* Favorite Heart Icon Button (22 Okt Catatan Rapat) */}
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
                                        className={`absolute top-2 left-2 p-1.5 rounded-full backdrop-blur-md transition cursor-pointer z-10 ${
                                            isBookFavorite(book.id)
                                                ? 'bg-rose-600 text-white shadow-xs scale-110'
                                                : 'bg-black/40 text-white hover:bg-black/60 hover:scale-105'
                                        }`}
                                        title={isBookFavorite(book.id) ? 'Hapus dari Favorit' : 'Jadikan Favorit'}
                                    >
                                        <Heart size={14} className={isBookFavorite(book.id) ? 'fill-current' : ''} />
                                    </button>

                                    {/* Sudah Dibaca Badge (22 Okt Catatan Rapat) */}
                                    {isBookCompleted(book.id) && (
                                        <div 
                                            className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-xs z-10 text-white"
                                            style={{ background: 'var(--green)' }}
                                        >
                                            <CheckCircle2 size={12} />
                                            <span>Sudah Dibaca</span>
                                        </div>
                                    )}
                                </div>

                                {/* Meta & Title */}
                                <div className="text-[11px] text-[var(--muted)] font-medium mb-1">
                                    {book.publisher}
                                </div>
                                <h3 className="font-serif font-bold text-[var(--ink)] text-sm leading-snug line-clamp-2 mb-1">
                                    {book.title}
                                </h3>
                                <p className="text-xs text-[var(--muted)] mb-2">
                                    {book.author}
                                </p>

                                {/* Rating */}
                                <div className="flex items-center gap-1.5 mb-3 text-xs">
                                    <div className="flex items-center text-amber-500">
                                        <Star size={14} className="fill-current" />
                                        <span className="font-bold text-[var(--ink)] ml-1">{book.rating}</span>
                                    </div>
                                    <span className="text-[var(--muted)] text-[11px]">
                                        ({book.reviewCount} ulasan)
                                    </span>
                                </div>

                                <div className="text-base font-serif font-bold text-[var(--ink)]">
                                    {formatRupiah(book.price)}
                                </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="p-4 pt-0 border-t border-[var(--line)] mt-2 space-y-2">
                                <button
                                    onClick={() => handleAddToCart(book)}
                                    className="ikapi-button ikapi-button-primary w-full py-2 px-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <ShoppingCart size={14} />
                                    <span>+ Keranjang (UC-09)</span>
                                </button>

                                <div className="grid grid-cols-2 gap-1.5">
                                    <Link
                                        href={`/prototype/reader?book=${book.id}`}
                                        className="py-1.5 px-2 rounded-md border border-[var(--line)] hover:bg-[var(--surface-quiet)] text-[11px] font-medium text-[var(--ink)] flex items-center justify-center gap-1 transition"
                                        title="Buka naskah di web reader"
                                    >
                                        <BookOpen size={12} className="text-[#a33b46]" />
                                        <span>Baca (UC-18)</span>
                                    </Link>

                                    <Link
                                        href="/prototype/ulasan"
                                        className="py-1.5 px-2 rounded-md border border-[var(--line)] hover:bg-[var(--surface-quiet)] text-[11px] font-medium text-[var(--ink)] flex items-center justify-center gap-1 transition"
                                        title="Beri komentar atau evaluasi kuesioner"
                                    >
                                        <MessageSquare size={12} className="text-amber-600" />
                                        <span>Ulasan (UC-20)</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </BuyerLayout>
        </>
    );
}
