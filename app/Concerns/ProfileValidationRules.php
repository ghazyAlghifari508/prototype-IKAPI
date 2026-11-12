<?php

namespace App\Concerns;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;

trait ProfileValidationRules
{
    /**
     * Get the validation rules used to validate user profiles.
     *
     * @return array<string, array<int, \Closure|Unique|ValidationRule|array<mixed>|string>>
     */
    protected function profileRules(?int $userId = null): array
    {
        return [
            'name' => $this->nameRules(),
            'email' => $this->emailRules($userId),
            'phone' => $this->phoneRules(),
            'address' => $this->addressRules(),
            'avatar' => $this->avatarRules(),
            'avatar_preset' => ['nullable', 'string', 'in:cat,dog,panda,frog,rabbit,owl,bear,koala'],
        ];
    }

    /**
     * Get the validation rules used to validate user names.
     *
     * @return array<int, Unique|ValidationRule|array<mixed>|string>
     */
    protected function nameRules(): array
    {
        return ['bail', 'required', 'string', 'max:255'];
    }

    /**
     * Get the validation rules used to validate user emails.
     *
     * @return array<int, Unique|ValidationRule|array<mixed>|string>
     */
    protected function emailRules(?int $userId = null): array
    {
        return [
            'bail',
            'required',
            'string',
            'email',
            'max:255',
            $userId === null
                ? Rule::unique(User::class)
                : Rule::unique(User::class)->ignore($userId),
        ];
    }

    /**
     * @return array<int, string>
     */
    protected function addressRules(): array
    {
        return ['nullable', 'string', 'max:1000'];
    }

    /**
     * @return array<int, string|\Closure>
     */
    protected function phoneRules(): array
    {
        return [
            'nullable', 'string', 'max:32', 'regex:/^\\+?[0-9\\s().-]+$/',
            function (string $attribute, mixed $value, \Closure $fail): void {
                if ($value === null || $value === '') {
                    return;
                }

                $digits = preg_replace('/\\D/', '', (string) $value);

                if (strlen($digits) < 8 || strlen($digits) > 15) {
                    $fail('Masukkan nomor telepon yang valid.');
                }
            },
        ];
    }

    /**
     * @return array<int, string>
     */
    protected function avatarRules(): array
    {
        return ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'];
    }
}
