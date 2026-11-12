import assert from 'node:assert/strict';
import test from 'node:test';
import {
    bookAction,
    libraryEmptyMessage,
    safeLibraryHref,
    visibleBooks,
} from '../../resources/js/features/library/library-state.ts';

// Test-only display records. These do not represent production ownership or routes.
const book = (id, readingStatus = null) => ({
    id,
    title: `Judul ${id}`,
    author: null,
    publisher: null,
    coverHref: null,
    detailHref: `/test-catalog/${id}`,
    readerHref: `/test-reader/${id}`,
    readingStatus,
});

await test('owned collection never includes an unowned favorite', () => {
    const collection = {
        owned: [book('owned')],
        favorites: [book('favorite')],
        catalogHref: null,
    };
    assert.deepEqual(
        visibleBooks(collection, 'all').map((item) => item.id),
        ['owned'],
    );
    assert.deepEqual(
        visibleBooks(collection, 'favorites').map((item) => item.id),
        ['favorite'],
    );
    assert.equal(
        bookAction(collection, collection.favorites[0]).label,
        'Lihat Buku',
    );
});

await test('unknown progress is never classified as unread or reading', () => {
    const collection = {
        owned: [
            book('unknown'),
            book('reading', 'reading'),
            book('unread', 'unread'),
            book('finished', 'finished'),
        ],
        favorites: [],
        catalogHref: null,
    };
    assert.deepEqual(
        visibleBooks(collection, 'reading').map((item) => item.id),
        ['reading'],
    );
    assert.deepEqual(
        visibleBooks(collection, 'unread').map((item) => item.id),
        ['unread'],
    );
    assert.equal(visibleBooks(collection, 'all').length, 4);
});

await test('duplicate display records do not create duplicate collection cards', () => {
    const collection = {
        owned: [book('one'), book('one')],
        favorites: [book('two'), book('two')],
        catalogHref: null,
    };
    assert.equal(visibleBooks(collection, 'all').length, 1);
    assert.equal(visibleBooks(collection, 'favorites').length, 1);
    assert.equal(collection.owned.length, 2);
});

await test('favorite links cannot override an owned books authorized reader destination', () => {
    const owned = book('owned', 'reading');
    const favorite = { ...owned, readerHref: '/untrusted-destination' };
    const action = bookAction(
        { owned: [owned], favorites: [favorite], catalogHref: null },
        favorite,
    );
    assert.deepEqual(action, {
        href: '/test-reader/owned',
        label: 'Lanjutkan Membaca',
    });
});

await test('missing reader does not create a fabricated read link', () => {
    const owned = { ...book('one'), readerHref: null, detailHref: null };
    assert.equal(
        bookAction({ owned: [owned], favorites: [], catalogHref: null }, owned),
        null,
    );
});

await test('unsafe external javascript protocol relative and PDF URLs are rejected', () => {
    for (const href of [
        'javascript:alert(1)',
        'https://example.test/book',
        '//example.test/book',
        '/\\example.test',
        '/private/source.pdf',
        '/private/source%2Epdf',
        '/private/source%252Epdf',
        '/bad%zz',
        '/new\nline',
    ]) {
        assert.equal(safeLibraryHref(href), null, href);
    }
    assert.equal(safeLibraryHref('/test-reader/42'), '/test-reader/42');
    assert.equal(safeLibraryHref(null), null);
});

await test('global empty state appears only when both lists are empty', () => {
    const empty = { owned: [], favorites: [], catalogHref: null };
    assert.equal(
        libraryEmptyMessage(empty, 'all'),
        'Perpustakaan Anda masih kosong.',
    );
    const favoritesOnly = { ...empty, favorites: [book('favorite')] };
    assert.notEqual(
        libraryEmptyMessage(favoritesOnly, 'all'),
        'Perpustakaan Anda masih kosong.',
    );
    const ownedOnly = { ...empty, owned: [book('owned')] };
    assert.equal(
        libraryEmptyMessage(ownedOnly, 'favorites'),
        'Belum ada buku favorit.',
    );
    assert.equal(
        libraryEmptyMessage(ownedOnly, 'reading'),
        'Status membaca belum tersedia.',
    );
});
