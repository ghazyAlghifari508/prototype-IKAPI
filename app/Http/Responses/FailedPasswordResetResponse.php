<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\FailedPasswordResetResponse as FailedPasswordResetResponseContract;
use Symfony\Component\HttpFoundation\Response;

class FailedPasswordResetResponse implements FailedPasswordResetResponseContract
{
    public function toResponse($request): Response
    {
        $message = 'Tautan reset tidak valid atau sudah kedaluwarsa. Silakan minta tautan baru.';

        return $request->wantsJson()
            ? new JsonResponse(['message' => $message], Response::HTTP_UNPROCESSABLE_ENTITY)
            : back()->withErrors(['email' => $message]);
    }
}
