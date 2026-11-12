import { Link } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
    bookAction,
    libraryEmptyMessage,
    libraryTabs,
    safeLibraryHref,
    visibleBooks,
} from './library-state';
import type {
    LibraryBook,
    LibraryCollection,
    LibraryTab,
} from './library-state';

function BookCover({ book }: { book: LibraryBook }) {
    const [failed, setFailed] = useState(false);
    const cover = safeLibraryHref(book.coverHref);
    return (
        <div className="flex aspect-[2/3] items-center justify-center overflow-hidden rounded border border-black/10 bg-white">
            {cover && !failed ? (
                <img
                    src={cover}
                    alt={`Sampul ${book.title}`}
                    loading="lazy"
                    onError={() => setFailed(true)}
                    className="h-full w-full object-contain"
                />
            ) : (
                <span className="flex flex-col items-center gap-2 px-3 text-center text-sm text-[#615d59]">
                    <BookOpen aria-hidden="true" className="size-8" />
                    Sampul belum tersedia
                </span>
            )}
        </div>
    );
}

/** Unrouted UI: mount only after an authenticated server collection adapter is available. */
export default function PersonalLibrary({
    collection,
}: {
    collection: LibraryCollection;
}) {
    const [tab, setTab] = useState<LibraryTab>('all');
    const instance = useId();
    const buttons = useRef<(HTMLButtonElement | null)[]>([]);
    const books = visibleBooks(collection, tab);
    const catalog = safeLibraryHref(collection.catalogHref);

    function navigateTabs(
        event: KeyboardEvent<HTMLButtonElement>,
        index: number,
    ) {
        let next: number;
        if (event.key === 'ArrowRight') next = (index + 1) % libraryTabs.length;
        else if (event.key === 'ArrowLeft')
            next = (index - 1 + libraryTabs.length) % libraryTabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = libraryTabs.length - 1;
        else return;
        event.preventDefault();
        setTab(libraryTabs[next].id);
        buttons.current[next]?.focus();
    }

    return (
        <section
            className="min-h-full bg-[#f6f5f4] px-4 py-8 text-[#111111] sm:px-8"
            aria-labelledby={`${instance}-heading`}
        >
            <div className="mx-auto max-w-5xl">
                <h1
                    id={`${instance}-heading`}
                    className="text-2xl font-semibold tracking-tight"
                >
                    Perpustakaan Saya
                </h1>
                <p className="mt-2 text-sm text-[#615d59]">
                    Koleksi buku digital dan favorit Anda.
                </p>
                <div
                    role="tablist"
                    aria-label="Koleksi perpustakaan"
                    className="mt-8 grid grid-cols-2 gap-1 border-b border-black/10 sm:grid-cols-4"
                >
                    {libraryTabs.map((item, index) => (
                        <button
                            key={item.id}
                            ref={(element) => {
                                buttons.current[index] = element;
                            }}
                            type="button"
                            role="tab"
                            id={`${instance}-tab-${item.id}`}
                            aria-controls={`${instance}-panel-${item.id}`}
                            aria-selected={tab === item.id}
                            tabIndex={tab === item.id ? 0 : -1}
                            onClick={() => setTab(item.id)}
                            onKeyDown={(event) => navigateTabs(event, index)}
                            className={`min-h-12 border-b-2 px-2 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0075de] ${tab === item.id ? 'border-[#0075de] text-[#0075de]' : 'border-transparent text-[#615d59] hover:text-black'}`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
                {libraryTabs.map((item) => (
                    <div
                        key={item.id}
                        role="tabpanel"
                        id={`${instance}-panel-${item.id}`}
                        aria-labelledby={`${instance}-tab-${item.id}`}
                        hidden={tab !== item.id}
                        tabIndex={0}
                        className="py-8 focus-visible:outline-2 focus-visible:outline-[#0075de]"
                    >
                        {tab === item.id &&
                            (books.length > 0 ? (
                                <ul className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                                    {books.map((book) => {
                                        const action = bookAction(
                                            collection,
                                            book,
                                        );
                                        return (
                                            <li
                                                key={book.id}
                                                className="min-w-0"
                                            >
                                                <BookCover
                                                    key={`${book.id}-${book.coverHref}`}
                                                    book={book}
                                                />
                                                <h2 className="mt-3 text-sm font-semibold break-words">
                                                    {book.title}
                                                </h2>
                                                {book.author && (
                                                    <p className="mt-1 text-sm break-words text-[#615d59]">
                                                        {book.author}
                                                    </p>
                                                )}
                                                {book.publisher && (
                                                    <p className="mt-1 text-xs break-words text-[#615d59]">
                                                        {book.publisher}
                                                    </p>
                                                )}
                                                {action && (
                                                    <Button
                                                        asChild
                                                        variant="link"
                                                        className="mt-2 h-auto max-w-full px-0 text-left whitespace-normal text-[#0075de]"
                                                    >
                                                        <Link
                                                            href={action.href}
                                                        >
                                                            {action.label}
                                                            <span className="sr-only">
                                                                : {book.title}
                                                            </span>
                                                        </Link>
                                                    </Button>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <div className="py-8">
                                    <h2 className="text-base font-medium">
                                        {libraryEmptyMessage(collection, tab)}
                                    </h2>
                                    {catalog && (
                                        <>
                                            <p className="mt-2 text-sm text-[#615d59]">
                                                Temukan buku yang ingin Anda
                                                baca di katalog IKAPI.
                                            </p>
                                            <Button
                                                asChild
                                                className="mt-5 bg-[#0075de] text-white hover:bg-[#0066c2]"
                                            >
                                                <Link href={catalog}>
                                                    Jelajahi Katalog
                                                </Link>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            ))}
                    </div>
                ))}
            </div>
        </section>
    );
}
