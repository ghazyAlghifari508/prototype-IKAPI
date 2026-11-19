<?php

namespace App\Support;

use RuntimeException;

/**
 * Reads the dummy fixtures extracted from the prototype (docs/design/prototype-copy).
 * Frontend-only: no database, no Eloquent, no business queries. Fixtures are immutable source data;
 * mutable browser state lives in localStorage through resources/js/ikapi/demo.
 *
 * Single source of truth for P05: books.json holds every book (catalog + home shelves + the reference
 * book with its detail block), so catalog cards, home shelves, detail pages and preview all read the same rows.
 */
class Fixtures
{
    /** @var array<string, array<mixed>> */
    private static array $cache = [];

    /**
     * @return array<mixed>
     */
    public static function get(string $name): array
    {
        if (! isset(self::$cache[$name])) {
            $path = resource_path("data/ikapi/{$name}.json");

            if (! is_file($path)) {
                throw new RuntimeException("Fixture [{$name}] not found at {$path}");
            }

            /** @var array<mixed> $decoded */
            $decoded = json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
            self::$cache[$name] = $decoded;
        }

        return self::$cache[$name];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public static function books(): array
    {
        /** @var array<int, array<string, mixed>> $books */
        $books = self::get('books');

        return $books;
    }

    /**
     * @return array<string, mixed>|null
     */
    public static function book(string $slug): ?array
    {
        foreach (self::books() as $book) {
            if ($book['slug'] === $slug) {
                return $book;
            }
        }

        return null;
    }

    /**
     * @param  array<int, string>  $slugs
     * @return array<int, array<string, mixed>>
     */
    public static function booksBySlugs(array $slugs): array
    {
        $bySlug = [];

        foreach (self::books() as $book) {
            $bySlug[$book['slug']] = $book;
        }

        $out = [];

        foreach ($slugs as $slug) {
            if (isset($bySlug[$slug])) {
                $out[] = $bySlug[$slug];
            }
        }

        return $out;
    }

    /**
     * Home page payload: hero slides, category tiles, shelves (as book rows), agenda cards.
     *
     * @return array<string, mixed>
     */
    public static function home(): array
    {
        /** @var array<string, mixed> $home */
        $home = self::get('home');

        $home['shelves'] = array_map(static function (array $shelf): array {
            return [
                'title' => $shelf['title'],
                'books' => self::booksBySlugs($shelf['bookSlugs']),
            ];
        }, $home['shelves']);

        return $home;
    }

    /**
     * Catalog payload: facets, defaults and the catalog subset of books.
     *
     * @return array<string, mixed>
     */
    public static function catalog(): array
    {
        /** @var array<string, mixed> $catalog */
        $catalog = self::get('catalog');

        $catalog['books'] = array_values(array_filter(
            self::books(),
            static fn (array $book): bool => in_array('catalog', $book['sources'], true),
        ));

        return $catalog;
    }

    /**
     * @return array<string, mixed>
     */
    public static function preview(): array
    {
        /** @var array<string, mixed> $preview */
        $preview = self::get('preview');

        return $preview;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public static function communities(): array
    {
        /** @var array<int, array<string, mixed>> $rows */
        $rows = self::get('communities');

        return $rows;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public static function orders(): array
    {
        /** @var array<int, array<string, mixed>> $rows */
        $rows = self::get('orders');

        return $rows;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public static function users(): array
    {
        /** @var array<int, array<string, mixed>> $rows */
        $rows = self::get('users');

        return $rows;
    }
}
