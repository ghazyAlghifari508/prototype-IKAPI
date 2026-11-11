<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Spatie\Permission\Models\Role;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        $input['email'] = is_string($input['email'] ?? null)
            ? mb_strtolower(trim($input['email']))
            : ($input['email'] ?? null);

        $validated = Validator::make($input, [
            ...$this->profileRules(),
            'phone' => [
                'bail', 'required', 'string', 'max:32', 'regex:/^\\+?[0-9\\s().-]+$/',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $digits = preg_replace('/\\D/', '', (string) $value);

                    if (strlen($digits) < 8 || strlen($digits) > 15) {
                        $fail('Masukkan nomor telepon yang valid.');
                    }
                },
            ],
            'password' => $this->passwordRules(confirmed: false),
            'password_confirmation' => ['bail', 'required', 'string', 'same:password'],
            'terms_accepted' => ['accepted'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Masukkan alamat email yang valid.',
            'email.unique' => 'Email sudah terdaftar.',
            'email.string' => 'Email harus berupa teks.',
            'email.max' => 'Email maksimal 255 karakter.',
            'name.string' => 'Nama lengkap tidak valid.',
            'name.max' => 'Nama lengkap maksimal 255 karakter.',
            'phone.required' => 'Nomor HP wajib diisi.',
            'phone.regex' => 'Masukkan nomor telepon yang valid.',
            'phone.string' => 'Masukkan nomor telepon yang valid.',
            'phone.max' => 'Masukkan nomor telepon yang valid.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.string' => 'Kata sandi tidak valid.',
            'password.min' => 'Kata sandi minimal :min karakter.',
            'password.password.mixed' => 'Gunakan huruf besar dan huruf kecil pada kata sandi.',
            'password.password.letters' => 'Kata sandi harus mengandung huruf.',
            'password.password.numbers' => 'Kata sandi harus mengandung angka.',
            'password.password.symbols' => 'Kata sandi harus mengandung simbol.',
            'password.password.uncompromised' => 'Kata sandi pernah terlibat dalam kebocoran data. Pilih kata sandi lain.',
            'password_confirmation.required' => 'Konfirmasi kata sandi wajib diisi.',
            'password_confirmation.same' => 'Konfirmasi kata sandi tidak cocok.',
            'terms_accepted.accepted' => 'Anda harus menyetujui syarat penggunaan dan kebijakan privasi.',
        ])->validate();

        $digits = preg_replace('/\\D/', '', $validated['phone']);
        $phone = str_starts_with($digits, '0')
            ? '+62'.substr($digits, 1)
            : (str_starts_with($digits, '62') ? '+'.$digits : (str_starts_with($digits, '8') ? '+62'.$digits : (str_starts_with($validated['phone'], '+') ? '+'.$digits : $digits)));

        try {
            return DB::transaction(function () use ($validated, $phone): User {
                $buyerRole = Role::query()
                    ->where('name', 'buyer')
                    ->where('guard_name', 'web')
                    ->first();

                if (! $buyerRole) {
                    throw ValidationException::withMessages([
                        'email' => 'Registrasi belum dapat dilakukan. Silakan hubungi administrator.',
                    ]);
                }

                $user = User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'phone' => $phone,
                    'password' => Hash::make($validated['password']),
                ]);

                $user->assignRole($buyerRole);

                return $user;
            });
        } catch (QueryException $exception) {
            if (User::query()->where('email', $validated['email'])->exists()) {
                throw ValidationException::withMessages(['email' => 'Email sudah terdaftar.']);
            }

            throw $exception;
        }
    }
}
