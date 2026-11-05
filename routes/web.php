<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

// Isolated, frontend-only F01 prototype routes.
Route::inertia('/prototype', 'prototype/index')->name('prototype.index');
Route::inertia('/prototype/auth/login-buyer', 'prototype/login-buyer')->name('prototype.login-buyer');
Route::inertia('/prototype/auth/login-publisher', 'prototype/login-publisher')->name('prototype.login-publisher');
Route::inertia('/prototype/auth/register-buyer', 'prototype/register-buyer')->name('prototype.register-buyer');
Route::inertia('/prototype/auth/register-publisher', 'prototype/register-publisher')->name('prototype.register-publisher');
Route::inertia('/prototype/auth/forgot-password', 'prototype/forgot-password')->name('prototype.forgot-password');
Route::inertia('/prototype/auth/reset-password', 'prototype/reset-password')->name('prototype.reset-password');
Route::inertia('/prototype/profile/buyer', 'prototype/profile-buyer')->name('prototype.profile-buyer');
Route::inertia('/prototype/ikapi-internal/login', 'prototype/admin/login')->name('prototype.admin.login');
Route::inertia('/prototype/ikapi-internal/dashboard', 'prototype/admin/dashboard')->name('prototype.admin.dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';

if (app()->environment('local')) {
    Route::prefix('prototype')->name('prototype.')->group(function () {
        Route::inertia('/', 'prototype/publisher/index')->name('index');

        Route::prefix('penerbit')->name('publisher.')->group(function () {
            Route::inertia('dashboard', 'prototype/publisher/dashboard')->name('dashboard');
            Route::inertia('profil', 'prototype/publisher/profile')->name('profile');
            Route::inertia('buku', 'prototype/publisher/books/index')->name('books.index');
            Route::inertia('buku/baru', 'prototype/publisher/books/form')->name('books.create');
            Route::get('buku/{book}/edit', function (string $book) {
                return Inertia::render('prototype/publisher/books/form', ['bookId' => $book]);
            })->where('book', '[A-Za-z0-9_-]+')->name('books.edit');
            Route::inertia('pesanan', 'prototype/publisher/sales/index')->name('sales.index');
            Route::get('pesanan/{order}', function (string $order) {
                return Inertia::render('prototype/publisher/sales/show', ['orderId' => $order]);
            })->where('order', '[A-Za-z0-9_-]+')->name('sales.show');
            Route::inertia('pencairan', 'prototype/publisher/payouts/index')->name('payouts.index');
            Route::get('pencairan/{payout}', function (string $payout) {
                return Inertia::render('prototype/publisher/payouts/show', ['payoutId' => $payout]);
            })->where('payout', '[A-Za-z0-9_-]+')->name('payouts.show');
            Route::inertia('ulasan', 'prototype/publisher/reviews/index')->name('reviews.index');
        });

        // Buyer / Pembaca Portal Routes (UC-07, 09, 10, 18, 19, 20)
        Route::inertia('katalog', 'prototype/katalog/index')->name('buyer.katalog');
        Route::inertia('keranjang', 'prototype/cart/index')->name('buyer.cart');
        Route::inertia('reader', 'prototype/reader/index')->name('buyer.reader');
        Route::inertia('ulasan', 'prototype/reviews/index')->name('buyer.reviews');
        Route::inertia('ulasan-buku', 'prototype/reviews/index')->name('buyer.reviews-alias');
        Route::inertia('pembeli', 'prototype/falih/index')->name('buyer.hub');

        // Backward compatibility redirects (eliminate /falih from URLs)
        Route::redirect('falih/ulasan', '/prototype/ulasan');
        Route::redirect('falih/katalog', '/prototype/katalog');
        Route::redirect('falih/keranjang', '/prototype/keranjang');
        Route::redirect('falih/reader', '/prototype/reader');
        Route::redirect('falih', '/prototype/katalog');
    });
}
