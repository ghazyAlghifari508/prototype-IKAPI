<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\PasswordResetResponse as PasswordResetResponseContract;
use Symfony\Component\HttpFoundation\Response;

class SuccessfulPasswordResetResponse implements PasswordResetResponseContract
{
    public function toResponse($request): Response
    {
        $message = 'Kata sandi berhasil diperbarui. Silakan masuk kembali.';

        return $request->wantsJson()
            ? new JsonResponse(['message' => $message])
            : redirect()->route('login')->with('status', $message);
    }
}
