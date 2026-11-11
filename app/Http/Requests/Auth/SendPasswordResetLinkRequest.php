<?php

namespace App\Http\Requests\Auth;

use Laravel\Fortify\Http\Requests\SendPasswordResetLinkRequest as FortifyRequest;

class SendPasswordResetLinkRequest extends FortifyRequest
{
    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'email' => ['bail', 'required', 'string', 'email', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.required' => 'Email wajib diisi.',
            'email.string' => 'Email harus berupa teks.',
            'email.email' => 'Masukkan alamat email yang valid.',
            'email.max' => 'Email maksimal 255 karakter.',
        ];
    }
}
