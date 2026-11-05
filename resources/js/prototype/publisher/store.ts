import { useEffect, useSyncExternalStore } from 'react';

export type BookStatus = 'Aktif' | 'Menunggu Approval' | 'Ditolak/Revisi';
export type PayoutStatus = 'Dalam Proses' | 'Selesai' | 'Ditolak';

export interface PublisherProfile {
    publisherName: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
    memberId: string;
}

export interface BankAccount {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
}

export interface PublisherBook {
    id: string;
    title: string;
    author: string;
    category: string;
    edition?: string;
    genre?: string;
    synopsis: string;
    endorsementBy?: string;
    endorsementText?: string;
    pages: number;
    price: number;
    sales: number;
    status: BookStatus;
    revisionNote?: string;
    coverName?: string;
    pdfName?: string;
    pdfSizeBytes?: number;
    sampleName?: string;
    updatedAt: string;
}

export interface SalesOrderItem {
    bookId: string;
    title: string;
    price: number;
    quantity: number;
}

export interface PublisherOrder {
    id: string;
    date: string;
    buyerLabel: string;
    items: SalesOrderItem[];
    bookTotal: number;
    publisherNet: number;
    paymentStatus: 'Lunas';
}

export interface PayoutRecord {
    id: string;
    date: string;
    amount: number;
    status: PayoutStatus;
    account: BankAccount;
    reason?: string;
    proof?: {
        fileName: string;
        mimeType: string;
        url: string;
    };
}

export interface PublisherReview {
    id: string;
    bookId: string;
    bookTitle: string;
    displayName: string;
    date: string;
    rating: 1 | 2 | 3 | 4 | 5;
    comment: string;
    reply?: string;
}

export interface PublisherData {
    profile: PublisherProfile;
    bankAccount: BankAccount;
    authors: string[];
    books: PublisherBook[];
    orders: PublisherOrder[];
    payouts: PayoutRecord[];
    reviews: PublisherReview[];
    metrics: {
        totalSold: number;
        netEarnings: number;
        availableBalance: number;
        processingBalance: number;
        averageRating: number;
        reviewCount: number;
        monthlyRevenue: { label: string; value: number }[];
    };
}

const account = {
    bankName: 'Bank BJB',
    accountNumber: '001234567890',
    accountHolder: 'Penerbit Aksara Priangan',
};

const initialData: PublisherData = {
    profile: {
        publisherName: 'Penerbit Aksara Priangan',
        contactName: 'Nadia Puspita',
        email: 'redaksi@aksarapriangan.id',
        phone: '0812 3456 7800',
        address: 'Jl. Cikutra No. 18, Kota Bandung, Jawa Barat',
        memberId: 'IKAPI-JBR-0421',
    },
    bankAccount: account,
    authors: ['Rama Nugraha', 'Siti A. Pranoto', 'Nabila Rahayu', 'R. Anwar'],
    books: [
        {
            id: 'bk-kota',
            title: 'Membaca Kota lewat Arsip',
            author: 'Rama Nugraha',
            category: 'Budaya',
            synopsis:
                'Catatan tentang ingatan kota yang tersimpan di dalam arsip dan percakapan warganya.',
            pages: 184,
            price: 49000,
            sales: 14,
            status: 'Aktif',
            pdfName: 'membaca-kota.pdf',
            pdfSizeBytes: 5043650,
            updatedAt: '2026-10-29',
        },
        {
            id: 'bk-hutan',
            title: 'Belajar Mengelola Hutan',
            author: 'Siti A. Pranoto',
            category: 'Pendidikan',
            synopsis:
                'Pengantar pengelolaan hutan berbasis pengetahuan lokal dan pemulihan ekosistem.',
            pages: 236,
            price: 59000,
            sales: 9,
            status: 'Aktif',
            pdfName: 'mengelola-hutan.pdf',
            pdfSizeBytes: 6291456,
            updatedAt: '2026-10-18',
        },
        {
            id: 'bk-priangan',
            title: 'Cerita dari Priangan',
            author: 'Nabila Rahayu',
            category: 'Sastra',
            synopsis:
                'Kumpulan cerita pendek tentang perjalanan, keluarga, dan rumah yang selalu berubah.',
            pages: 128,
            price: 39000,
            sales: 4,
            status: 'Menunggu Approval',
            pdfName: 'cerita-priangan.pdf',
            pdfSizeBytes: 3538944,
            updatedAt: '2026-11-03',
        },
        {
            id: 'bk-aksara',
            title: 'Catatan tentang Aksara Sunda',
            author: 'R. Anwar',
            category: 'Budaya',
            synopsis:
                'Pengenalan singkat terhadap perkembangan aksara Sunda di ruang publik.',
            pages: 96,
            price: 45000,
            sales: 0,
            status: 'Ditolak/Revisi',
            revisionNote:
                'Lengkapi kembali ringkasan dan halaman judul sebelum diajukan ulang.',
            pdfName: 'catatan-aksara.pdf',
            pdfSizeBytes: 2949120,
            updatedAt: '2026-10-30',
        },
    ],
    orders: [
        {
            id: 'INV-P-2026-0142',
            date: '2026-11-03T10:24:00+07:00',
            buyerLabel: 'R. Sari',
            items: [
                {
                    bookId: 'bk-kota',
                    title: 'Membaca Kota lewat Arsip',
                    price: 49000,
                    quantity: 1,
                },
            ],
            bookTotal: 49000,
            publisherNet: 49000,
            paymentStatus: 'Lunas',
        },
        {
            id: 'INV-P-2026-0141',
            date: '2026-11-02T16:42:00+07:00',
            buyerLabel: 'A. Rahman',
            items: [
                {
                    bookId: 'bk-kota',
                    title: 'Membaca Kota lewat Arsip',
                    price: 49000,
                    quantity: 1,
                },
                {
                    bookId: 'bk-hutan',
                    title: 'Belajar Mengelola Hutan',
                    price: 59000,
                    quantity: 1,
                },
            ],
            bookTotal: 108000,
            publisherNet: 108000,
            paymentStatus: 'Lunas',
        },
        {
            id: 'INV-P-2026-0139',
            date: '2026-10-27T09:18:00+07:00',
            buyerLabel: 'D. Putra',
            items: [
                {
                    bookId: 'bk-hutan',
                    title: 'Belajar Mengelola Hutan',
                    price: 59000,
                    quantity: 2,
                },
            ],
            bookTotal: 118000,
            publisherNet: 118000,
            paymentStatus: 'Lunas',
        },
        {
            id: 'INV-P-2026-0136',
            date: '2026-10-22T13:06:00+07:00',
            buyerLabel: 'M. Amelia',
            items: [
                {
                    bookId: 'bk-kota',
                    title: 'Membaca Kota lewat Arsip',
                    price: 49000,
                    quantity: 2,
                },
            ],
            bookTotal: 98000,
            publisherNet: 98000,
            paymentStatus: 'Lunas',
        },
    ],
    payouts: [
        {
            id: 'PY-2026-0038',
            date: '2026-11-04T08:15:00+07:00',
            amount: 120000,
            status: 'Dalam Proses',
            account,
        },
        {
            id: 'PY-2026-0034',
            date: '2026-10-18T11:00:00+07:00',
            amount: 250000,
            status: 'Ditolak',
            account,
            reason: 'Data rekening tujuan perlu diperiksa kembali. Saldo telah dikembalikan.',
        },
    ],
    reviews: [
        {
            id: 'rv-1001',
            bookId: 'bk-kota',
            bookTitle: 'Membaca Kota lewat Arsip',
            displayName: 'R. Sari',
            date: '2026-11-03',
            rating: 5,
            comment:
                'Bahasanya mengalir dan arsipnya dibahas dengan cara yang dekat dengan kehidupan sehari-hari.',
        },
        {
            id: 'rv-1002',
            bookId: 'bk-hutan',
            bookTitle: 'Belajar Mengelola Hutan',
            displayName: 'A. Rahman',
            date: '2026-11-02',
            rating: 4,
            comment:
                'Penjelasannya runtut. Bagian praktik lapangannya paling membantu.',
            reply: 'Terima kasih sudah membaca. Catatan tentang praktik lapangan kami sampaikan kepada penulis.',
        },
        {
            id: 'rv-1003',
            bookId: 'bk-hutan',
            bookTitle: 'Belajar Mengelola Hutan',
            displayName: 'D. Putra',
            date: '2026-10-27',
            rating: 4,
            comment:
                'Penjelasannya runtut dan contoh lapangannya membuat topik lebih mudah dipahami.',
        },
    ],
    metrics: {
        totalSold: 27,
        netEarnings: 920000,
        availableBalance: 800000,
        processingBalance: 120000,
        averageRating: 4.7,
        reviewCount: 36,
        monthlyRevenue: [
            { label: 'Jun', value: 150000 },
            { label: 'Jul', value: 210000 },
            { label: 'Agu', value: 245000 },
            { label: 'Sep', value: 315000 },
        ],
    },
};

const storageKey = 'ikapi.publisher.prototype.v1';
let current = initialData;
let hydrated = false;
const listeners = new Set<() => void>();

function publish(
    next: PublisherData | ((current: PublisherData) => PublisherData),
) {
    current = typeof next === 'function' ? next(current) : next;
    if (typeof window !== 'undefined') {
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(current));
        } catch {
            // The in-memory prototype still works when browser storage is unavailable.
        }
    }
    listeners.forEach((listener) => listener());
}

function hydrate() {
    if (hydrated || typeof window === 'undefined') return;
    hydrated = true;
    try {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) {
            const parsed = JSON.parse(saved) as PublisherData;
            if (
                parsed &&
                Array.isArray(parsed.books) &&
                parsed.profile &&
                parsed.bankAccount
            ) {
                current = {
                    ...parsed,
                    authors: Array.isArray(parsed.authors)
                        ? parsed.authors
                        : [...new Set(parsed.books.map((book) => book.author))],
                };
            }
        }
    } catch {
        current = initialData;
    }
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function usePublisherData() {
    const data = useSyncExternalStore(
        subscribe,
        () => current,
        () => initialData,
    );
    useEffect(hydrate, []);
    return [data, publish] as const;
}

export function resetPublisherData() {
    hydrated = true;
    if (typeof window !== 'undefined') {
        try {
            window.localStorage.removeItem(storageKey);
        } catch {
            // Reset the in-memory prototype even when storage is unavailable.
        }
    }
    current = initialData;
    listeners.forEach((listener) => listener());
}

export function formatRupiah(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

export function formatDate(
    value: string,
    options?: Intl.DateTimeFormatOptions,
) {
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        ...options,
    }).format(new Date(value));
}

export function formatDateTime(value: string) {
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

export function maskAccountNumber(value: string) {
    if (value.length < 6) return value;
    return value.slice(0, 3) + '••••' + value.slice(-3);
}
