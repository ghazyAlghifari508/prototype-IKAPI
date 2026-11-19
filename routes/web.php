<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\Publisher\PublisherDashboardController;
use App\Http\Controllers\Publisher\StatusController;
use App\Http\Controllers\User\ProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public Home
Route::get('/', function () {
    return view('welcome');
})->name('home');

// Guest Authentication Routes (Buyer & Publisher)
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [LoginController::class, 'login']);

    Route::get('/register', [RegisterController::class, 'showRegistrationForm'])->name('register');
    Route::post('/register', function (Request $request, RegisterController $controller) {
        if ($request->input('role') === 'publisher') {
            return $controller->registerPublisher($request);
        }
        return $controller->registerBuyer($request);
    })->name('register.submit');
    Route::post('/register/buyer', [RegisterController::class, 'registerBuyer'])->name('register.buyer');
    Route::post('/register/publisher', [RegisterController::class, 'registerPublisher'])->name('register.publisher');

    Route::get('/forgot-password', [ForgotPasswordController::class, 'showLinkRequestForm'])->name('password.request');
    Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail'])->name('password.email');

    Route::get('/reset-password/{token}', [ResetPasswordController::class, 'showResetForm'])->name('password.reset');
    Route::post('/reset-password', [ResetPasswordController::class, 'reset'])->name('password.update');

    // Administrator Auth
    Route::get('/admin/login', [AdminAuthController::class, 'showLoginForm'])->name('admin.login');
    Route::post('/admin/login', [AdminAuthController::class, 'login'])->name('admin.login.submit');
});

// Authenticated Routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout'])->name('logout');
    Route::post('/admin/logout', [AdminAuthController::class, 'logout'])->name('admin.logout');

    // User Profile
    Route::get('/profil', [ProfileController::class, 'index'])->name('profile.index');
    Route::post('/profil', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profil/avatar/hapus', [ProfileController::class, 'deleteAvatar'])->name('profile.avatar.delete');

    // Publisher Area
    Route::get('/penerbit/status', [StatusController::class, 'index'])->name('publisher.status');
    Route::get('/penerbit/dashboard', [PublisherDashboardController::class, 'index'])->name('publisher.dashboard');

    // Administrator Area
    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
});

// Public alias for status if accessed with session/guest demo
Route::get('/status-pendaftaran', [StatusController::class, 'index'])->name('publisher.status.public');
