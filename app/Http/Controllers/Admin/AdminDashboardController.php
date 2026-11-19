<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\View\View;

class AdminDashboardController extends Controller
{
    /**
     * Display administrator dashboard.
     */
    public function index(Request $request): View
    {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            abort(403, 'Akses khusus administrator IKAPI.');
        }

        return view('admin.dashboard');
    }
}
