<?php

namespace App\Support;

use Illuminate\Support\Facades\Route;

/**
 * Navigation registry for the shared shells.
 *
 * Every label, icon and grouping below is copied from the prototype menus (P04 audit of
 * docs/design/prototype-copy). The registry is the single place that maps a menu item to a named route
 * (route matrix in docs/migration/p1-architecture-blueprint.md). Items whose route is not registered yet
 * are returned with `ready = false`, so a shell can render them as non-links instead of linking to a
 * page that does not exist. Active state is derived from the current route name, never hardcoded.
 */
class Navigation
{
    /**
     * `$current` lets a page state which menu route it represents (showcases, or pages served under a different
     * route name than their menu entry). When null the active item is derived from the current route name,
     * never hardcoded.
     *
     * @return array<int, array{type: string, label: string, route: string|null, icon: string|null, ready: bool, active: bool, href: string|null}>
     */
    public static function items(string $persona, ?string $current = null): array
    {
        $out = [];

        foreach (self::planned($persona) as $item) {
            if ($item['type'] === 'heading') {
                $out[] = [
                    'type' => 'heading',
                    'label' => $item['label'],
                    'route' => null,
                    'icon' => null,
                    'ready' => false,
                    'active' => false,
                    'href' => null,
                ];

                continue;
            }

            $route = $item['route'];
            $ready = Route::has($route);

            $out[] = [
                'type' => 'link',
                'label' => $item['label'],
                'route' => $route,
                'icon' => $item['icon'],
                'ready' => $ready,
                'active' => $ready && ($current !== null ? $current === $route : self::isActive($route, $item['match'] ?? [$route])),
                'href' => $ready ? route($route) : null,
            ];
        }

        return $out;
    }

    /**
     * URL for a named route, or null when the phase for that page has not landed yet.
     * Views use it to render a non-link instead of a fake `href="#"` (see P04 report R3).
     */
    public static function href(string $route): ?string
    {
        return Route::has($route) ? route($route) : null;
    }

    /**
     * @param  array<int, string>  $patterns
     */
    private static function isActive(string $route, array $patterns): bool
    {
        return request()->routeIs(...$patterns);
    }

    /**
     * Labels/icons exactly as in the prototype.
     *   buyer     : header primary nav (user/beranda_desktop.html), 4 tabs
     *   account   : profile dropdown (user/akun_saya_profil_dropdown_navigasi_desktop.html)
     *   publisher : sidebar (penerbit/dashboard_penerbit_desktop.html), no section headings
     *   admin     : sidebar (admin/dashboard_administrasi_utama_desktop.html), 2 section headings
     *
     * @return array<int, array<string, mixed>>
     */
    private static function planned(string $persona): array
    {
        return match ($persona) {
            'buyer' => [
                ['type' => 'link', 'route' => 'home', 'label' => 'Beranda', 'icon' => null],
                ['type' => 'link', 'route' => 'books.index', 'label' => 'Katalog Buku', 'icon' => null],
                ['type' => 'link', 'route' => 'agenda', 'label' => 'Agenda Literasi', 'icon' => null],
                ['type' => 'link', 'route' => 'community', 'label' => 'Komunitas Literasi', 'icon' => null],
            ],
            'account' => [
                ['type' => 'link', 'route' => 'profile.show', 'label' => 'Profil Saya', 'icon' => 'person'],
                ['type' => 'link', 'route' => 'orders', 'label' => 'Riwayat Pesanan', 'icon' => 'receipt_long'],
                ['type' => 'link', 'route' => 'library', 'label' => 'Perpustakaan Saya', 'icon' => 'local_library'],
                ['type' => 'link', 'route' => 'reviews', 'label' => 'Riwayat Ulasan', 'icon' => 'rate_review'],
                ['type' => 'link', 'route' => 'profile.settings', 'label' => 'Pengaturan Akun', 'icon' => 'settings'],
                ['type' => 'link', 'route' => 'help', 'label' => 'Bantuan', 'icon' => 'help'],
            ],
            'publisher' => [
                ['type' => 'link', 'route' => 'publisher.dashboard', 'label' => 'Dashboard', 'icon' => 'space_dashboard'],
                ['type' => 'link', 'route' => 'publisher.books', 'label' => 'Kelola Buku', 'icon' => 'menu_book'],
                ['type' => 'link', 'route' => 'publisher.orders', 'label' => 'Pesanan Masuk', 'icon' => 'inbox'],
                ['type' => 'link', 'route' => 'publisher.payouts', 'label' => 'Pendapatan & Pencairan', 'icon' => 'payments'],
                ['type' => 'link', 'route' => 'publisher.reviews', 'label' => 'Ulasan Pembeli', 'icon' => 'reviews'],
                ['type' => 'link', 'route' => 'publisher.settings', 'label' => 'Pengaturan Profil', 'icon' => 'tune'],
            ],
            'admin' => [
                ['type' => 'link', 'route' => 'admin.dashboard', 'label' => 'Dashboard', 'icon' => 'space_dashboard'],
                ['type' => 'heading', 'label' => 'Manajemen'],
                ['type' => 'link', 'route' => 'admin.users', 'label' => 'Kelola Pengguna', 'icon' => 'group'],
                ['type' => 'link', 'route' => 'admin.catalog', 'label' => 'Pengawasan Katalog', 'icon' => 'menu_book'],
                ['type' => 'link', 'route' => 'admin.review-moderation', 'label' => 'Moderasi Ulasan', 'icon' => 'reviews'],
                ['type' => 'link', 'route' => 'admin.communities', 'label' => 'Kelola Komunitas', 'icon' => 'groups'],
                ['type' => 'link', 'route' => 'admin.discussion-moderation', 'label' => 'Moderasi Diskusi', 'icon' => 'forum'],
                ['type' => 'heading', 'label' => 'Keuangan & Monitoring'],
                ['type' => 'link', 'route' => 'admin.monitoring', 'label' => 'Monitoring Global', 'icon' => 'monitoring'],
                ['type' => 'link', 'route' => 'admin.payouts', 'label' => 'Kelola Pencairan Dana', 'icon' => 'payments'],
            ],
            default => [],
        };
    }
}
