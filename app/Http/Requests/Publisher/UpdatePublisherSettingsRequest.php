<?php

namespace App\Http\Requests\Publisher;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePublisherSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canAccessPublisherPortal() ?? false;
    }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'publisher_name' => ['required', 'string', 'max:255'],
            'responsible_person' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:32', 'regex:/^\\+?[0-9\\s().-]+$/'],
            'address' => ['required', 'string', 'max:1000'],
            'ikapi_member_number' => ['required', 'string', 'max:64'],
            'bank_code' => ['nullable', 'string', 'max:32', 'required_with:bank_name,account_number,account_holder'],
            'bank_name' => ['nullable', 'string', 'max:100', 'required_with:bank_code,account_number,account_holder'],
            'account_number' => ['nullable', 'string', 'max:32', 'regex:/^[0-9]+$/', 'required_with:bank_code,bank_name,account_holder'],
            'account_holder' => ['nullable', 'string', 'max:255', 'required_with:bank_code,bank_name,account_number'],
        ];
    }

    public function messages(): array
    {
        return [
            'publisher_name.required' => 'Nama penerbit wajib diisi.',
            'responsible_person.required' => 'Penanggung jawab wajib diisi.',
            'phone.regex' => 'Masukkan nomor telepon yang valid.',
            'bank_code.required_with' => 'Pilih bank yang digunakan.',
            'bank_name.required_with' => 'Nama bank wajib diisi.',
            'account_number.required_with' => 'Nomor rekening wajib diisi.',
            'account_number.regex' => 'Nomor rekening hanya boleh berisi angka.',
            'account_holder.required_with' => 'Nama pemilik rekening wajib diisi.',
        ];
    }
}
