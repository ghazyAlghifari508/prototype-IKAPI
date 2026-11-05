<?php

use Illuminate\Support\Facades\Route;

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
