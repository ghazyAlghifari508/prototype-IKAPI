import React, { useState, useEffect } from 'react';
import { 
    BookOpen, Bookmark as BookmarkIcon, ChevronLeft, ChevronRight, 
    Settings, X, Trash2, CheckCircle2, AlertCircle, Sun, Moon, 
    Coffee, FileText, ArrowLeft, BookmarkCheck, Library, Flame 
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { FalihNavbar } from '../components/FalihNavbar';
import { 
    useFalihStore, saveReadingProgress, addBookmark, 
    removeBookmark, saveReaderSettings, ReaderSettings,
    toggleBookCompleted, isBookCompleted 
} from '../store';
import { toast } from 'sonner';
import '../styles.css';

interface ReaderScreenProps {
    initialBookId?: string;
}

export default function ReaderScreen({ initialBookId = 'B01' }: ReaderScreenProps) {
    const { books, getBookmarks, getReadingProgress, readerSettings, readingStreak } = useFalihStore();

    // Select active book
    const [selectedBookId, setSelectedBookId] = useState<string>(initialBookId);
    const activeBook = books.find(b => b.id === selectedBookId) || books[0];

    // Reading page state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [autoResumeNotice, setAutoResumeNotice] = useState<string | null>(null);

    // Drawers / Panels
    const [showBookmarksDrawer, setShowBookmarksDrawer] = useState(false);
    const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
    const [showBookSwitcher, setShowBookSwitcher] = useState(false);

    // Bookmarks for this book
    const currentBookmarks = getBookmarks(activeBook.id);

    // Load auto-resume on book change (UC-18 Main Flow 3)
    useEffect(() => {
        const progress = getReadingProgress(activeBook.id);
        const resumePage = progress.currentPage || 1;
        setCurrentPage(resumePage);

        if (resumePage > 1) {
            setAutoResumeNotice(`Melanjutkan membaca dari halaman ${resumePage} (${progress.lastReadAt})`);
            const timer = setTimeout(() => setAutoResumeNotice(null), 4000);
            return () => clearTimeout(timer);
        } else {
            setAutoResumeNotice(null);
        }
    }, [activeBook.id]);

    // Save reading progress automatically when page changes (UC-18 Main Flow 5)
    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > activeBook.totalPages) return;
        setCurrentPage(newPage);
        saveReadingProgress(activeBook.id, newPage);
    };

    // Calculate current chapter & content
    const currentChapter = [...activeBook.chapters].reverse().find(c => currentPage >= c.page) || activeBook.chapters[0];
    const pageIndexInChapter = (currentPage - currentChapter.page);
    const paragraphList = currentChapter.content;
    const currentParagraphs = paragraphList.slice(
        (pageIndexInChapter * 2) % paragraphList.length,
        ((pageIndexInChapter * 2) % paragraphList.length) + 3
    );

    // Bookmark Toggle (UC-19)
    const isCurrentPageBookmarked = currentBookmarks.some(bm => bm.pageNumber === currentPage);

    const handleToggleBookmark = () => {
        const firstSentence = currentParagraphs[0] || activeBook.title;
        const res = addBookmark(activeBook.id, currentPage, currentChapter.title, firstSentence);

        if (res.success) {
            toast.success(res.message, {
                icon: <BookmarkCheck className="w-4 h-4 text-emerald-500" />
            });
        } else if (res.isDuplicate) {
            // Alternative Scenario 2.a: Halaman aktif sudah pernah ditambahkan ke bookmark sebelumnya
            toast.warning(res.message, {
                description: 'Buka panel Bookmark untuk mengelola penanda halaman ini.',
                icon: <AlertCircle className="w-4 h-4 text-amber-500" />
            });
        }
    };

    // Reader styling classes based on settings
    const themeClasses = {
        paper: 'reader-canvas-paper',
        light: 'reader-canvas-light',
        sepia: 'reader-canvas-sepia',
        dark: 'reader-canvas-dark'
    }[readerSettings.theme];

    const fontClasses = readerSettings.fontFamily === 'serif' ? 'reader-font-serif' : 'reader-font-sans';

    const fontSizeClasses = {
        sm: 'text-sm sm:text-base leading-relaxed',
        base: 'text-base sm:text-lg leading-relaxed sm:leading-loose',
        lg: 'text-lg sm:text-xl leading-loose',
        xl: 'text-xl sm:text-2xl leading-loose'
    }[readerSettings.fontSize];

    return (
        <div className={`min-h-screen flex flex-col ${themeClasses} transition-colors duration-200`}>
            {/* Top Reader Navbar */}
            <header className="sticky top-0 z-30 border-b border-black/10 bg-inherit/95 backdrop-blur-md px-4 py-2.5">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
                    {/* Left: Back & Book Selector */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/prototype/falih/katalog"
                            className="p-1.5 rounded-md hover:bg-black/5 text-inherit transition"
                            title="Kembali ke Katalog"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>

                        <div>
                            <button
                                onClick={() => setShowBookSwitcher(true)}
                                className="flex items-center gap-1.5 font-bold text-sm hover:opacity-75 transition text-left"
                            >
                                <span className="truncate max-w-[180px] sm:max-w-xs">{activeBook.title}</span>
                                <Library className="w-3.5 h-3.5 opacity-60 shrink-0" />
                            </button>
                            <span className="text-[11px] opacity-60 block truncate max-w-[200px]">
                                {currentChapter.title}
                            </span>
                        </div>
                    </div>

                    {/* Center: Reading Progress Indicator & Streak */}
                    <div className="hidden sm:flex items-center gap-3 text-xs opacity-80 font-mono">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold">
                            <Flame className="w-3.5 h-3.5 fill-current animate-pulse text-amber-500" />
                            <span>Streak {readingStreak.days} Hari</span>
                        </div>
                        <span>Hal. {currentPage} / {activeBook.totalPages} ({Math.round((currentPage / activeBook.totalPages) * 100)}%)</span>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5">
                        {/* Tandai Selesai Dibaca Button (22 Okt Revision) */}
                        <button
                            onClick={() => {
                                const res = toggleBookCompleted(activeBook.id);
                                toast(res.isCompleted ? 'Selamat! Buku ditandai Selesai Dibaca 🎓' : 'Status buku diubah kembali ke sedang dibaca', {
                                    description: activeBook.title
                                });
                            }}
                            className={`p-2 rounded-md transition flex items-center gap-1 text-xs font-semibold ${
                                isBookCompleted(activeBook.id)
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'hover:bg-black/5 text-inherit border border-black/10'
                            }`}
                            title={isBookCompleted(activeBook.id) ? 'Buku sudah selesai dibaca (Klik untuk batalkan)' : 'Tandai buku sebagai Sudah Dibaca'}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="hidden md:inline">
                                {isBookCompleted(activeBook.id) ? 'Sudah Dibaca' : 'Tandai Selesai'}
                            </span>
                        </button>

                        {/* Quick Dark Mode / Light Mode Toggle (22 Okt Revision) */}
                        <button
                            onClick={() => {
                                const nextTheme = readerSettings.theme === 'dark' ? 'paper' : 'dark';
                                saveReaderSettings({ theme: nextTheme });
                                toast.info(nextTheme === 'dark' ? 'Mengaktifkan Mode Gelap 🌙' : 'Mengaktifkan Mode Terang (Warm Paper) ☀️');
                            }}
                            className="p-2 rounded-md hover:bg-black/5 text-inherit transition"
                            title={readerSettings.theme === 'dark' ? 'Ganti ke Mode Terang (Warm Paper)' : 'Ganti ke Mode Gelap (Dark Mode)'}
                        >
                            {readerSettings.theme === 'dark' ? (
                                <Sun className="w-4 h-4 text-amber-400" />
                            ) : (
                                <Moon className="w-4 h-4 text-gray-700" />
                            )}
                        </button>

                        {/* Bookmark Button (UC-19) */}
                        <button
                            onClick={handleToggleBookmark}
                            className={`p-2 rounded-md transition flex items-center gap-1 text-xs font-semibold ${
                                isCurrentPageBookmarked
                                    ? 'bg-[#0075de] text-white shadow-xs'
                                    : 'hover:bg-black/5 text-inherit'
                            }`}
                            title={isCurrentPageBookmarked ? 'Halaman ini sudah ditandai' : 'Tandai halaman ini (Bookmark)'}
                        >
                            <BookmarkIcon className={`w-4 h-4 ${isCurrentPageBookmarked ? 'fill-current' : ''}`} />
                            <span className="hidden md:inline">
                                {isCurrentPageBookmarked ? 'Ditandai' : 'Tandai'}
                            </span>
                        </button>

                        {/* Open Bookmarks List */}
                        <button
                            onClick={() => setShowBookmarksDrawer(true)}
                            className="p-2 rounded-md hover:bg-black/5 text-inherit relative transition"
                            title="Lihat Daftar Bookmark"
                        >
                            <BookmarkCheck className="w-4 h-4" />
                            {currentBookmarks.length > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#0075de]"></span>
                            )}
                        </button>

                        {/* Settings Button */}
                        <button
                            onClick={() => setShowSettingsDrawer(true)}
                            className="p-2 rounded-md hover:bg-black/5 text-inherit transition"
                            title="Pengaturan Tampilan Baca Lengkap"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Reading Progress Line */}
                <div className="w-full bg-black/5 h-1 mt-2.5 rounded-full overflow-hidden">
                    <div
                        className="bg-[#0075de] h-full transition-all duration-300"
                        style={{ width: `${(currentPage / activeBook.totalPages) * 100}%` }}
                    />
                </div>
            </header>

            {/* Auto-Resume Floating Toast Notification (UC-18 Main Flow 3) */}
            {autoResumeNotice && (
                <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 bg-gray-900 text-white px-4 py-2 rounded-full text-xs font-medium shadow-lg flex items-center gap-2 fade-in-slide border border-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{autoResumeNotice}</span>
                    <button onClick={() => setAutoResumeNotice(null)} className="opacity-60 hover:opacity-100">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Main Reading Canvas */}
            <main 
                className={`flex-1 max-w-3xl w-full mx-auto px-6 sm:px-12 py-10 reader-protected-area select-none ${fontClasses}`}
                onContextMenu={e => e.preventDefault()}
            >
                <div className="mb-8 text-center pb-6 border-b border-black/10">
                    <span className="text-xs uppercase tracking-widest opacity-60 font-sans block mb-1">
                        {currentChapter.title}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        {activeBook.title}
                    </h1>
                    <span className="text-xs opacity-60 font-sans block mt-1">
                        Oleh: {activeBook.author} • Penerbit: {activeBook.publisher}
                    </span>
                </div>

                {/* Content Paragraphs */}
                <article className={`space-y-6 ${fontSizeClasses} tracking-normal text-justify`}>
                    {currentParagraphs.map((paragraph, idx) => (
                        <p key={idx} className="indent-6">
                            {paragraph}
                        </p>
                    ))}

                    <p className="indent-6 opacity-90">
                        Halaman ini merupakan simulasi pembaca naskah digital berlisensi resmi IKAPI Jawa Barat. Navigasikan lembar halaman menggunakan tombol navigasi di bagian bawah atau gunakan tombol panah keyboard.
                    </p>
                </article>
            </main>

            {/* Bottom Floating Navigation Bar */}
            <footer className="sticky bottom-0 z-30 border-t border-black/10 bg-inherit/95 backdrop-blur-md px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="px-4 py-2 rounded-lg border border-black/10 hover:bg-black/5 disabled:opacity-30 disabled:pointer-events-none transition text-xs sm:text-sm font-semibold flex items-center gap-1.5"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Sebelumnya</span>
                    </button>

                    {/* Quick Page Slider */}
                    <div className="flex-1 flex items-center gap-3">
                        <input
                            type="range"
                            min={1}
                            max={activeBook.totalPages}
                            value={currentPage}
                            onChange={e => handlePageChange(Number(e.target.value))}
                            className="w-full accent-[#0075de] cursor-pointer"
                        />
                        <span className="text-xs font-mono opacity-70 shrink-0">
                            {currentPage}/{activeBook.totalPages}
                        </span>
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= activeBook.totalPages}
                        className="px-4 py-2 rounded-lg bg-[#0075de] text-white hover:bg-[#0060b9] disabled:opacity-30 disabled:pointer-events-none transition text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs"
                    >
                        <span>Selanjutnya</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </footer>

            {/* Drawer 1: Bookmarks Drawer (UC-19) */}
            {showBookmarksDrawer && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
                    <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col text-gray-900 fade-in-slide">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <BookmarkIcon className="w-5 h-5 text-[#0075de]" />
                                <h2 className="text-base font-bold">Daftar Bookmark ({currentBookmarks.length})</h2>
                            </div>
                            <button
                                onClick={() => setShowBookmarksDrawer(false)}
                                className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-4 space-y-3">
                            {currentBookmarks.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <BookmarkIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
                                    <p className="text-sm font-medium">Belum ada halaman yang ditandai</p>
                                    <p className="text-xs mt-1">Gunakan tombol 'Tandai' di pojok kanan atas saat membaca.</p>
                                </div>
                            ) : (
                                currentBookmarks.map(bm => (
                                    <div
                                        key={bm.id}
                                        className="p-3.5 rounded-lg border border-gray-200 hover:border-[#0075de] hover:bg-blue-50/40 transition group relative"
                                    >
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="font-bold text-[#0075de]">
                                                Halaman {bm.pageNumber}
                                            </span>
                                            <span className="text-[11px] text-gray-400">
                                                {bm.createdAt}
                                            </span>
                                        </div>
                                        <p className="text-xs font-semibold text-gray-800 mb-1">
                                            {bm.chapterTitle}
                                        </p>
                                        <p className="text-xs text-gray-600 italic line-clamp-2 mb-2">
                                            "{bm.excerpt}"
                                        </p>

                                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                                            <button
                                                onClick={() => {
                                                    handlePageChange(bm.pageNumber);
                                                    setShowBookmarksDrawer(false);
                                                    toast.info(`Melompat ke halaman ${bm.pageNumber}`);
                                                }}
                                                className="text-[#0075de] font-semibold hover:underline"
                                            >
                                                Lompat ke Halaman Ini →
                                            </button>

                                            <button
                                                onClick={() => {
                                                    removeBookmark(bm.id);
                                                    toast.info(`Bookmark halaman ${bm.pageNumber} dihapus.`);
                                                }}
                                                className="text-gray-400 hover:text-red-600 transition"
                                                title="Hapus bookmark"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Drawer 2: Settings Drawer */}
            {showSettingsDrawer && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
                    <div className="w-full max-w-sm bg-white h-full shadow-2xl p-6 flex flex-col text-gray-900 fade-in-slide">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <Settings className="w-5 h-5 text-gray-700" />
                                <h2 className="text-base font-bold">Kustomisasi Tampilan Baca</h2>
                            </div>
                            <button
                                onClick={() => setShowSettingsDrawer(false)}
                                className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="py-5 space-y-6">
                            {/* Theme Setting */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                                    Tema Kanvas Naskah
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'paper', label: 'Warm Paper', bg: 'bg-[#f7f4ed]', border: 'border-[#e0dcd1]', text: 'text-gray-800', icon: Coffee },
                                        { id: 'light', label: 'Pure White', bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-900', icon: Sun },
                                        { id: 'sepia', label: 'Sepia Antik', bg: 'bg-[#fbf0d9]', border: 'border-[#dfceab]', text: 'text-[#433422]', icon: FileText },
                                        { id: 'dark', label: 'Mode Gelap', bg: 'bg-[#1a1a1a]', border: 'border-gray-700', text: 'text-gray-200', icon: Moon }
                                    ].map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => saveReaderSettings({ theme: t.id as any })}
                                            className={`p-3 rounded-lg border flex items-center gap-2 text-xs font-semibold ${t.bg} ${t.text} ${
                                                readerSettings.theme === t.id
                                                    ? 'ring-2 ring-[#0075de] border-transparent'
                                                    : t.border
                                            }`}
                                        >
                                            <t.icon className="w-4 h-4" />
                                            <span>{t.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Font Family Setting */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                                    Jenis Huruf (Font)
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => saveReaderSettings({ fontFamily: 'serif' })}
                                        className={`p-3 rounded-lg border text-center font-serif text-sm ${
                                            readerSettings.fontFamily === 'serif'
                                                ? 'bg-[#e6f3fe] border-[#0075de] text-[#0075de] font-bold'
                                                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        Lyon Serif (Klasik)
                                    </button>
                                    <button
                                        onClick={() => saveReaderSettings({ fontFamily: 'sans' })}
                                        className={`p-3 rounded-lg border text-center font-sans text-sm ${
                                            readerSettings.fontFamily === 'sans'
                                                ? 'bg-[#e6f3fe] border-[#0075de] text-[#0075de] font-bold'
                                                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        Sans Modern
                                    </button>
                                </div>
                            </div>

                            {/* Font Size Setting */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                                    Ukuran Teks
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { id: 'sm', label: 'A-', desc: 'Kecil' },
                                        { id: 'base', label: 'A', desc: 'Normal' },
                                        { id: 'lg', label: 'A+', desc: 'Besar' },
                                        { id: 'xl', label: 'A++', desc: 'Ekstra' }
                                    ].map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => saveReaderSettings({ fontSize: s.id as any })}
                                            className={`py-2 rounded-lg border text-xs font-bold ${
                                                readerSettings.fontSize === s.id
                                                    ? 'bg-[#0075de] text-white border-[#0075de]'
                                                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setShowSettingsDrawer(false)}
                                className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition"
                            >
                                Tutup Pengaturan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Book Switcher */}
            {showBookSwitcher && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl text-gray-900 max-h-[85vh] flex flex-col fade-in-slide">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                            <h3 className="font-bold text-base flex items-center gap-2">
                                <Library className="w-5 h-5 text-[#0075de]" />
                                <span>Pilih Buku Koleksi Saya</span>
                            </h3>
                            <button onClick={() => setShowBookSwitcher(false)} className="text-gray-400 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                            {books.map(b => (
                                <button
                                    key={b.id}
                                    onClick={() => {
                                        setSelectedBookId(b.id);
                                        setShowBookSwitcher(false);
                                    }}
                                    className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 transition ${
                                        b.id === activeBook.id
                                            ? 'bg-blue-50 border-[#0075de]'
                                            : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <img src={b.coverImage} alt={b.title} className="w-10 h-14 object-cover rounded shadow-xs shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-gray-900 truncate">{b.title}</h4>
                                        <p className="text-xs text-gray-500 truncate">{b.author} • {b.publisher}</p>
                                    </div>
                                    {b.id === activeBook.id && (
                                        <CheckCircle2 className="w-5 h-5 text-[#0075de] shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
