<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

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
    });
}
