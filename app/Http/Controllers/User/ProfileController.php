<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\View\View;

class ProfileController extends Controller
{
    /**
     * All available reading categories for selection.
     */
    public const AVAILABLE_CATEGORIES = [
        'Sastra & Fiksi',
        'Budaya & Tradisi',
        'Pendidikan',
        'Bisnis & Ekonomi',
        'Anak & Remaja',
    ];

    /**
     * Display the user's profile edit page.
     */
    public function index(): View
    {
        $user = Auth::user();

        // Default categories if none selected yet
        $selectedCategories = $user->favorite_categories ?? ['Sastra & Fiksi', 'Budaya & Tradisi', 'Pendidikan'];

        return view('user.profile', [
            'user' => $user,
            'availableCategories' => self::AVAILABLE_CATEGORIES,
            'selectedCategories' => $selectedCategories,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'fullName' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:1000'],
            'categories' => ['nullable', 'array'],
            'categories.*' => ['string', 'max:100'],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ], [
            'fullName.required' => 'Nama lengkap wajib diisi.',
            'avatar.image' => 'Berkas harus berupa gambar.',
            'avatar.mimes' => 'Format foto profil harus JPG, PNG, atau WebP.',
            'avatar.max' => 'Ukuran foto profil tidak boleh melebihi 2.0 MB.',
        ]);

        // Handle Avatar File Upload
        if ($request->hasFile('avatar')) {
            $avatarFile = $request->file('avatar');
            $uploadDir = public_path('uploads/avatars');

            if (! File::exists($uploadDir)) {
                File::makeDirectory($uploadDir, 0755, true);
            }

            // Remove old uploaded avatar if exists
            if ($user->avatar_path && File::exists(public_path($user->avatar_path))) {
                @File::delete(public_path($user->avatar_path));
            }

            $fileName = 'avatar_' . $user->id . '_' . time() . '.' . $avatarFile->getClientOriginalExtension();
            $avatarFile->move($uploadDir, $fileName);

            $user->avatar_path = 'uploads/avatars/' . $fileName;
        }

        $categories = $request->input('categories', []);
        if (is_string($categories)) {
            $decoded = json_decode($categories, true);
            $categories = is_array($decoded) ? $decoded : array_filter(explode(',', $categories));
        }

        $user->name = $validated['fullName'];
        $user->phone = $validated['phone'] ?? null;
        $user->address = $validated['address'] ?? null;
        $user->favorite_categories = is_array($categories) ? array_values($categories) : [];
        $user->save();

        return back()->with('status', 'Profil berhasil diperbarui.');
    }

    /**
     * Delete the user's avatar.
     */
    public function deleteAvatar(): RedirectResponse
    {
        $user = Auth::user();

        if ($user->avatar_path && File::exists(public_path($user->avatar_path))) {
            @File::delete(public_path($user->avatar_path));
        }

        $user->avatar_path = null;
        $user->save();

        return back()->with('status', 'Foto profil berhasil dihapus.');
    }
}
