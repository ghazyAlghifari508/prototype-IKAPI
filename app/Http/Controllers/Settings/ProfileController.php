<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Throwable;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        if (array_key_exists('phone', $validated) && $validated['phone'] !== null && $validated['phone'] !== '') {
            $digits = preg_replace('/\D/', '', $validated['phone']);
            $validated['phone'] = str_starts_with($digits, '0')
                ? '+62'.substr($digits, 1)
                : (str_starts_with($digits, '62') ? '+'.$digits : (str_starts_with($digits, '8') ? '+62'.$digits : (str_starts_with($validated['phone'], '+') ? '+'.$digits : $digits)));
        } elseif (array_key_exists('phone', $validated)) {
            $validated['phone'] = null;
        }
        $previousAvatarPath = $user->avatar_path;
        $newAvatarPath = null;
        $hasAvatarPreset = array_key_exists('avatar_preset', $validated);
        $avatarPreset = $validated['avatar_preset'] ?? null;

        try {
            if ($request->hasFile('avatar')) {
                $newAvatarPath = $request->file('avatar')->store('avatars', 'public');

                if (! $newAvatarPath) {
                    throw new RuntimeException('The profile avatar could not be stored.');
                }

            }

            unset($validated['avatar']);
            unset($validated['avatar_preset']);

            $user->fill($validated);

            if ($newAvatarPath) {
                $user->avatar_path = $newAvatarPath;
                $user->avatar_preset = null;
            } elseif ($hasAvatarPreset) {
                $user->avatar_preset = $avatarPreset;

                if ($avatarPreset !== null) {
                    $user->avatar_path = null;
                }
            }

            $emailChanged = $user->isDirty('email');

            if ($emailChanged) {
                $user->email_verified_at = null;
            }

            $user->save();
            if ($emailChanged) {
                $user->sendEmailVerificationNotification();
            }
        } catch (Throwable $exception) {
            if ($newAvatarPath) {
                Storage::disk('public')->delete($newAvatarPath);
            }

            throw $exception;
        }

        if ($previousAvatarPath && ($newAvatarPath || $avatarPreset !== null)) {
            Storage::disk('public')->delete($previousAvatarPath);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Profil berhasil diperbarui.']);

        return to_route('profile.edit');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
