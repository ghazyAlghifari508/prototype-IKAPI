<?php

use App\Http\Controllers\Publisher\BookController;
use App\Http\Controllers\Publisher\PublisherDashboardController;
use App\Http\Controllers\Publisher\PublisherLoginController;
use App\Http\Controllers\Publisher\PublisherRegistrationController;
use App\Http\Controllers\Publisher\PublisherSettingsController;
use App\Http\Controllers\Publisher\PublisherVerificationDocumentController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::get('/admin/publisher-registrations/{registration}/document', PublisherVerificationDocumentController::class)
    ->middleware(['auth:web', 'verified'])
    ->name('admin.publisher-registration.document');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::middleware('guest')->group(function () {
    Route::get('/publisher/register', [PublisherRegistrationController::class, 'create'])->name('publisher.register');
    Route::post('/publisher/register', [PublisherRegistrationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('publisher.register.store');

    Route::get('/publisher/login', [PublisherLoginController::class, 'create'])->name('publisher.login');
    Route::post('/publisher/login', [PublisherLoginController::class, 'store'])
        ->middleware('throttle:login')
        ->name('publisher.login.store');
});

Route::middleware(['auth', 'verified', 'publisher.approved'])->group(function () {
    Route::get('/publisher/dashboard', PublisherDashboardController::class)->name('publisher.dashboard');
    Route::get('/publisher/settings', [PublisherSettingsController::class, 'edit'])->name('publisher.settings.edit');
    Route::put('/publisher/settings', [PublisherSettingsController::class, 'update'])->name('publisher.settings.update');

    Route::get('/publisher/books', [BookController::class, 'index'])->name('publisher.books.index');
    Route::get('/publisher/books/create', [BookController::class, 'create'])->name('publisher.books.create');
    Route::post('/publisher/books', [BookController::class, 'store'])->name('publisher.books.store');
    Route::get('/publisher/books/{book}/edit', [BookController::class, 'edit'])->name('publisher.books.edit');
    Route::put('/publisher/books/{book}', [BookController::class, 'update'])->name('publisher.books.update');
});

require __DIR__.'/settings.php';
