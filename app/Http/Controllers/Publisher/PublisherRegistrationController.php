<?php

namespace App\Http\Controllers\Publisher;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class PublisherRegistrationController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('publisher/register');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'publisher_name' => ['required', 'string', 'max:255'],
            'responsible_person' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:32', 'regex:/^\\+?[0-9\\s().-]+$/', function (string $attribute, mixed $value, \Closure $fail): void {
                $digits = preg_replace('/\\D/', '', (string) $value);

                if (strlen($digits) < 8 || strlen($digits) > 15) {
                    $fail('Masukkan nomor telepon yang valid.');
                }
            }],
            'password' => ['required', 'confirmed', Password::defaults()],
            'address' => ['required', 'string', 'max:1000'],
            'ikapi_member_number' => ['required', 'string', 'max:64'],
            'legal_number' => ['required', 'string', 'max:100'],
            'verification_document' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ], [
            'publisher_name.required' => 'Nama penerbit wajib diisi.',
            'responsible_person.required' => 'Nama penanggung jawab wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Masukkan alamat email yang valid.',
            'email.unique' => 'Email sudah terdaftar.',
            'phone.required' => 'Nomor telepon wajib diisi.',
            'phone.regex' => 'Masukkan nomor telepon yang valid.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
            'address.required' => 'Alamat kantor wajib diisi.',
            'ikapi_member_number.required' => 'Nomor anggota IKAPI wajib diisi.',
            'legal_number.required' => 'Nomor SK atau legalitas wajib diisi.',
            'verification_document.required' => 'Dokumen legalitas wajib diunggah.',
            'verification_document.file' => 'Dokumen legalitas tidak valid.',
            'verification_document.mimes' => 'Dokumen harus berformat PDF, JPG, atau PNG.',
            'verification_document.max' => 'Ukuran dokumen maksimal 5 MB.',
        ]);

        $normalizedPhone = $this->normalizePhone($validated['phone']);
        $documentPath = $request->file('verification_document')->store('publisher-verifications', 'local');

        if (! $documentPath) {
            return back()->withErrors(['verification_document' => 'Dokumen gagal disimpan. Silakan coba lagi.'])->withInput();
        }

        try {
            DB::transaction(function () use ($validated, $normalizedPhone, $documentPath): void {
                $publisherRole = Role::findOrCreate('publisher', 'web');

                $user = User::query()->create([
                    'name' => $validated['responsible_person'],
                    'email' => mb_strtolower(trim($validated['email'])),
                    'phone' => $normalizedPhone,
                    'password' => Hash::make($validated['password']),
                ]);

                $user->assignRole($publisherRole);

                $user->publisherRegistration()->create([
                    'publisher_name' => $validated['publisher_name'],
                    'responsible_person' => $validated['responsible_person'],
                    'phone' => $normalizedPhone,
                    'address' => $validated['address'],
                    'ikapi_member_number' => $validated['ikapi_member_number'],
                    'legal_number' => $validated['legal_number'],
                    'verification_document_path' => $documentPath,
                    'approval_status' => 'pending',
                ]);
            });
        } catch (\Throwable $exception) {
            Storage::disk('local')->delete($documentPath);

            throw $exception;
        }

        return redirect()->route('publisher.login')->with('status', 'Pendaftaran berhasil dikirim. Akun Anda sedang menunggu persetujuan administrator.');
    }

    protected function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone);

        if ($digits === '') {
            return $phone;
        }

        if (str_starts_with($digits, '0')) {
            return '+62'.substr($digits, 1);
        }

        if (str_starts_with($digits, '62')) {
            return '+'.$digits;
        }

        if (str_starts_with($digits, '8')) {
            return '+62'.$digits;
        }

        return '+'.$digits;
    }
}
