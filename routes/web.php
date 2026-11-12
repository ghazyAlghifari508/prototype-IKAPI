<?php

use App\Http\Controllers\Publisher\PublisherLoginController;
use App\Http\Controllers\Publisher\PublisherRegistrationController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

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
    Route::inertia('/publisher/dashboard', 'publisher/dashboard')->name('publisher.dashboard');
});

require __DIR__.'/settings.php';
