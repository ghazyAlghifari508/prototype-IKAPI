<?php

namespace App\Http\Controllers\Publisher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\View\View;

class StatusController extends Controller
{
    /**
     * Display publisher registration status.
     */
    public function index(Request $request): View
    {
        $user = $request->user();

        return view('publisher.status', [
            'registration' => $user?->publisherRegistration,
        ]);
    }
}
