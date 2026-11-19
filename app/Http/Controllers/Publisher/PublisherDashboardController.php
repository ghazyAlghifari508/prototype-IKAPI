<?php

namespace App\Http\Controllers\Publisher;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class PublisherDashboardController extends Controller
{
    /**
     * Display publisher dashboard.
     */
    public function index(Request $request): View|RedirectResponse
    {
        $user = $request->user();

        if (! $user || ! $user->isPublisher()) {
            abort(403, 'Akses khusus mitra penerbit IKAPI.');
        }

        if (! $user->canAccessPublisherPortal()) {
            return redirect()->route('publisher.status');
        }

        return view('publisher.dashboard', [
            'registration' => $user->publisherRegistration,
        ]);
    }
}
