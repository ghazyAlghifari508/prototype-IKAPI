import { useState, useEffect } from 'react';
import { MOCK_BOOKS, INITIAL_REVIEWS, Book, ReviewComment, Bookmark } from './mockData';
import { filterCommentContent, FilterResult } from './smartFilter';

export interface CartItem {
    book: Book;
    quantity: number;
    format: 'E-Book (Digital EPUB/PDF)';
}

export interface ReaderSettings {
    fontSize: 'sm' | 'base' | 'lg' | 'xl';
    fontFamily: 'sans' | 'serif';
    theme: 'paper' | 'light' | 'sepia' | 'dark';
}

const STORAGE_KEYS = {
    CART: 'ikapi_prototype_falih_cart',
    PROGRESS: 'ikapi_prototype_falih_progress',
    BOOKMARKS: 'ikapi_prototype_falih_bookmarks',
    REVIEWS: 'ikapi_prototype_falih_reviews',
    SETTINGS: 'ikapi_prototype_falih_reader_settings',
    PROMO: 'ikapi_prototype_falih_promo'
};

// Initial state helpers
function getStored<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch {
        return fallback;
    }
}

function setStored<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
        notifyListeners();
    } catch (e) {
        console.error('Failed to save to localStorage', e);
    }
}

// Global subscribers for reactivity
type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
    listeners.forEach(fn => fn());
}

export function subscribeToStore(listener: Listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

// ==========================================
// CART ACTIONS (UC-09 & UC-10)
// ==========================================

export function getCartItems(): CartItem[] {
    return getStored<CartItem[]>(STORAGE_KEYS.CART, [
        { book: MOCK_BOOKS[0], quantity: 1, format: 'E-Book (Digital EPUB/PDF)' },
        { book: MOCK_BOOKS[4], quantity: 1, format: 'E-Book (Digital EPUB/PDF)' }
    ]);
}

export function addToCart(book: Book, quantity: number = 1): { success: boolean; message: string; totalItems: number } {
    const items = getCartItems();
    const existingIndex = items.findIndex(item => item.book.id === book.id);

    if (existingIndex > -1) {
        items[existingIndex].quantity += quantity;
    } else {
        items.push({
            book,
            quantity,
            format: 'E-Book (Digital EPUB/PDF)'
        });
    }

    setStored(STORAGE_KEYS.CART, items);
    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
        success: true,
        message: `Buku "${book.title}" berhasil ditambahkan ke keranjang belanja.`,
        totalItems: totalCount
    };
}

export function updateCartQuantity(bookId: string, delta: number): void {
    const items = getCartItems();
    const index = items.findIndex(item => item.book.id === bookId);

    if (index > -1) {
        items[index].quantity += delta;
        if (items[index].quantity <= 0) {
            items.splice(index, 1);
        }
        setStored(STORAGE_KEYS.CART, items);
    }
}

export function removeFromCart(bookId: string): void {
    const items = getCartItems().filter(item => item.book.id !== bookId);
    setStored(STORAGE_KEYS.CART, items);
}

export function clearCart(): void {
    setStored(STORAGE_KEYS.CART, []);
}

export function getPromoCode(): string {
    return getStored<string>(STORAGE_KEYS.PROMO, '');
}

export function applyPromoCode(code: string): { success: boolean; message: string; discountPercent: number } {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'IKAPIJABAR' || cleanCode === 'DISINIADA') {
        setStored(STORAGE_KEYS.PROMO, cleanCode);
        return {
            success: true,
            message: 'Kode promo berhasil digunakan! Diskon 15% diterapkan.',
            discountPercent: 15
        };
    }
    return {
        success: false,
        message: 'Kode promo tidak valid atau telah kedaluwarsa.',
        discountPercent: 0
    };
}

export function removePromoCode(): void {
    setStored(STORAGE_KEYS.PROMO, '');
}

export function getCartSummary() {
    const items = getCartItems();
    const promo = getPromoCode();
    const subtotal = items.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);
    const discountRate = (promo === 'IKAPIJABAR' || promo === 'DISINIADA') ? 0.15 : 0;
    const discountAmount = Math.round(subtotal * discountRate);
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const tax = Math.round(taxableAmount * 0.11); // PPN 11%
    const adminFee = subtotal > 0 ? 2500 : 0;
    const total = taxableAmount + tax + adminFee;
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
        subtotal,
        promoCode: promo,
        discountPercent: discountRate * 100,
        discountAmount,
        tax,
        adminFee,
        total,
        totalItems
    };
}

// ==========================================
// E-READER & BOOKMARKS (UC-18 & UC-19)
// ==========================================

export function getReadingProgress(bookId: string): { currentPage: number; lastReadAt: string } {
    const all = getStored<Record<string, { currentPage: number; lastReadAt: string }>>(STORAGE_KEYS.PROGRESS, {
        'B01': { currentPage: 7, lastReadAt: 'Kemarin, 14:20' }
    });
    return all[bookId] || { currentPage: 1, lastReadAt: 'Baru Membaca' };
}

export function saveReadingProgress(bookId: string, pageNumber: number): void {
    const all = getStored<Record<string, { currentPage: number; lastReadAt: string }>>(STORAGE_KEYS.PROGRESS, {});
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    all[bookId] = {
        currentPage: pageNumber,
        lastReadAt: `Hari ini, ${timeStr}`
    };
    setStored(STORAGE_KEYS.PROGRESS, all);
}

export function getBookmarks(bookId?: string): Bookmark[] {
    const all = getStored<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, [
        {
            id: 'BM-1',
            bookId: 'B01',
            pageNumber: 7,
            chapterTitle: 'Bab II: Kunjungan Tak Terduga',
            excerpt: 'Mr. Bennet termasuk orang pertama yang mengunjungi Mr. Bingley...',
            createdAt: '3 Nov 2026, 10:15'
        }
    ]);
    if (bookId) {
        return all.filter(bm => bm.bookId === bookId);
    }
    return all;
}

export function addBookmark(bookId: string, pageNumber: number, chapterTitle: string, excerpt: string): {
    success: boolean;
    isDuplicate: boolean;
    message: string;
    bookmark?: Bookmark;
} {
    const bookmarks = getBookmarks();
    const duplicate = bookmarks.find(bm => bm.bookId === bookId && bm.pageNumber === pageNumber);

    if (duplicate) {
        // Alternative Scenario 2.a: Halaman aktif sudah pernah ditandai sebelumnya
        return {
            success: false,
            isDuplicate: true,
            message: `Halaman ${pageNumber} sudah ditandai ke daftar bookmark sebelumnya.`
        };
    }

    const now = new Date();
    const timeStr = `${now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newBookmark: Bookmark = {
        id: `BM-${Date.now()}`,
        bookId,
        pageNumber,
        chapterTitle,
        excerpt: excerpt.slice(0, 90) + (excerpt.length > 90 ? '...' : ''),
        createdAt: timeStr
    };

    bookmarks.push(newBookmark);
    setStored(STORAGE_KEYS.BOOKMARKS, bookmarks);

    return {
        success: true,
        isDuplicate: false,
        message: `Halaman ${pageNumber} (${chapterTitle}) berhasil ditandai!`,
        bookmark: newBookmark
    };
}

export function removeBookmark(bookmarkId: string): void {
    const bookmarks = getBookmarks().filter(bm => bm.id !== bookmarkId);
    setStored(STORAGE_KEYS.BOOKMARKS, bookmarks);
}

export function getReaderSettings(): ReaderSettings {
    return getStored<ReaderSettings>(STORAGE_KEYS.SETTINGS, {
        fontSize: 'base',
        fontFamily: 'serif',
        theme: 'paper'
    });
}

export function saveReaderSettings(settings: Partial<ReaderSettings>): void {
    const current = getReaderSettings();
    setStored(STORAGE_KEYS.SETTINGS, { ...current, ...settings });
}

// ==========================================
// REVIEWS & EVALUATIONS (UC-07 & UC-20)
// ==========================================

export function getReviews(bookId?: string): ReviewComment[] {
    const all = getStored<ReviewComment[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    if (bookId) {
        return all.filter(r => r.bookId === bookId);
    }
    return all;
}

export function submitComment(bookId: string, text: string, userName: string = 'Falih Afnan Fauzi'): {
    success: boolean;
    message: string;
    filterResult: FilterResult;
} {
    // Jalankan Smart Content Filter (UC-07 Main & Alternative Flow 4.a)
    const filter = filterCommentContent(text);
    if (!filter.isValid) {
        return {
            success: false,
            message: filter.errorMessage || 'Komentar tidak valid.',
            filterResult: filter
        };
    }

    const reviews = getReviews();
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    const newComment: ReviewComment = {
        id: `REV-${Date.now()}`,
        bookId,
        userName,
        date: dateStr,
        rating: 5,
        commentText: text.trim(),
        isVerifiedBuyer: true
    };

    reviews.unshift(newComment);
    setStored(STORAGE_KEYS.REVIEWS, reviews);

    return {
        success: true,
        message: 'Komentar berhasil dipublikasikan dan tersimpan di database!',
        filterResult: filter
    };
}

export interface EvaluationInput {
    expectation: number;
    usefulness: number;
    priceValue: number;
    repeatBuy: number;
    testimonialText: string;
    overallRating: number;
    userName?: string;
}

export function submitEvaluation(bookId: string, input: EvaluationInput): {
    success: boolean;
    message: string;
    filterResult?: FilterResult;
} {
    // Validasi kelengkapan kuesioner evaluasi (UC-20 Alternative Scenario 2.a)
    if (!input.expectation || !input.usefulness || !input.priceValue || !input.repeatBuy) {
        return {
            success: false,
            message: 'Silakan lengkapi seluruh 4 poin kuesioner evaluasi mutu penerbit sebelum mengirim!'
        };
    }

    if (!input.testimonialText.trim()) {
        return {
            success: false,
            message: 'Kolom ulasan testimoni pengalaman membaca tidak boleh kosong!'
        };
    }

    // Jalankan filter kata kasar pada teks testimoni
    const filter = filterCommentContent(input.testimonialText);
    if (!filter.isValid) {
        return {
            success: false,
            message: filter.errorMessage || 'Ulasan mengandung kata tidak pantas.',
            filterResult: filter
        };
    }

    const reviews = getReviews();
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    const newEval: ReviewComment = {
        id: `EVAL-${Date.now()}`,
        bookId,
        userName: input.userName || 'Falih Afnan Fauzi',
        date: dateStr,
        rating: input.overallRating || 5,
        commentText: input.testimonialText.trim(),
        isVerifiedBuyer: true,
        evaluationScores: {
            expectation: input.expectation,
            usefulness: input.usefulness,
            priceValue: input.priceValue,
            repeatBuy: input.repeatBuy
        }
    };

    reviews.unshift(newEval);
    setStored(STORAGE_KEYS.REVIEWS, reviews);

    return {
        success: true,
        message: 'Evaluasi mutu penerbit dan ulasan buku berhasil terkirim. Terima kasih atas partisipasi Anda membangun kualitas literasi Jawa Barat!'
    };
}

export function resetAllFalihData(): void {
    localStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.PROMO);
    notifyListeners();
}

// React Hook for dynamic reactivity
export function useFalihStore() {
    const [, setTick] = useState(0);

    useEffect(() => {
        return subscribeToStore(() => setTick(t => t + 1));
    }, []);

    return {
        books: MOCK_BOOKS,
        cartItems: getCartItems(),
        cartSummary: getCartSummary(),
        readerSettings: getReaderSettings(),
        getBookmarks,
        getReadingProgress,
        getReviews
    };
}
