/** Presentation data only. A server adapter must scope records to the signed-in user. */
export type LibraryBook = {
    id: string;
    title: string;
    author: string | null;
    publisher: string | null;
    coverHref: string | null;
    detailHref: string | null;
};

export type OwnedLibraryBook = LibraryBook & {
    readingStatus: 'unread' | 'reading' | 'finished' | null;
    /** Authorized app route, never the source PDF URL. */
    readerHref: string | null;
};

export type LibraryCollection = {
    owned: readonly OwnedLibraryBook[];
    favorites: readonly LibraryBook[];
    catalogHref: string | null;
};

export const libraryTabs = [
    { id: 'all', label: 'Semua Buku' },
    { id: 'reading', label: 'Sedang Dibaca' },
    { id: 'unread', label: 'Belum Dibaca' },
    { id: 'favorites', label: 'Buku Favorit' },
] as const;

export type LibraryTab = (typeof libraryTabs)[number]['id'];

export function visibleBooks(
    collection: LibraryCollection,
    tab: LibraryTab,
): LibraryBook[] {
    const source =
        tab === 'favorites' ? collection.favorites : collection.owned;
    const unique = [...new Map(source.map((book) => [book.id, book])).values()];
    if (tab === 'all' || tab === 'favorites') return unique;
    return unique.filter((book) => {
        const owned = collection.owned.find((item) => item.id === book.id);
        return (
            owned?.readingStatus === (tab === 'reading' ? 'reading' : 'unread')
        );
    });
}

/** Defense in depth for presentation URLs; this does not authorize a backend route. */
export function safeLibraryHref(href: string | null): string | null {
    if (
        !href ||
        !href.startsWith('/') ||
        href.startsWith('//') ||
        /[\\\s]/.test(href)
    )
        return null;
    try {
        const url = new URL(href, 'https://library.invalid');
        let decoded = url.pathname;
        for (let count = 0; count < 3; count++)
            decoded = decodeURIComponent(decoded);
        if (
            url.origin !== 'https://library.invalid' ||
            /\.pdf(?:$|\/)/i.test(decoded)
        )
            return null;
        return href;
    } catch {
        return null;
    }
}

export function bookAction(
    collection: LibraryCollection,
    book: LibraryBook,
): { href: string; label: string } | null {
    const owned = collection.owned.find((item) => item.id === book.id);
    const reader = safeLibraryHref(owned?.readerHref ?? null);
    if (owned && reader) {
        return {
            href: reader,
            label:
                owned.readingStatus === 'reading'
                    ? 'Lanjutkan Membaca'
                    : 'Baca Buku',
        };
    }
    const detail = safeLibraryHref(book.detailHref);
    return detail ? { href: detail, label: 'Lihat Buku' } : null;
}

export function libraryEmptyMessage(
    collection: LibraryCollection,
    tab: LibraryTab,
): string {
    if (collection.owned.length === 0 && collection.favorites.length === 0)
        return 'Perpustakaan Anda masih kosong.';
    if (
        (tab === 'reading' || tab === 'unread') &&
        collection.owned.length > 0 &&
        collection.owned.every((book) => book.readingStatus === null)
    )
        return 'Status membaca belum tersedia.';
    if (tab === 'reading') return 'Belum ada buku yang sedang dibaca.';
    if (tab === 'unread') return 'Belum ada buku yang ditandai belum dibaca.';
    if (tab === 'favorites') return 'Belum ada buku favorit.';
    return 'Belum ada buku dalam koleksi Anda.';
}
