<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\ResetsUserPasswords;

class ResetUserPassword implements ResetsUserPasswords
{
    use PasswordValidationRules;

    /**
     * Validate and reset the user's forgotten password.
     *
     * @param  array<string, string>  $input
     */
    public function reset(User $user, array $input): void
    {
        Validator::make($input, [
            'password' => $this->passwordRules(),
        ], [
            'password.required' => 'Kata sandi wajib diisi.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
            'password.min' => 'Kata sandi minimal :min karakter.',
            'password.password.mixed' => 'Gunakan huruf besar dan huruf kecil pada kata sandi.',
            'password.password.letters' => 'Kata sandi harus mengandung huruf.',
            'password.password.numbers' => 'Kata sandi harus mengandung angka.',
            'password.password.symbols' => 'Kata sandi harus mengandung simbol.',
            'password.password.uncompromised' => 'Kata sandi pernah terlibat dalam kebocoran data. Pilih kata sandi lain.',
        ])->validate();

        $user->forceFill([
            'password' => $input['password'],
        ])->save();
    }
}
