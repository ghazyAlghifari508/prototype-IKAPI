<?php

namespace App\Http\Controllers\Publisher;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublisherDashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user instanceof User, 403);

        $registration = $user->publisherRegistration()->firstOrFail();
        $activeBooks = Book::query()
            ->where('publisher_registration_id', $registration->id)
            ->where('publication_status', 'published')
            ->count();

        return Inertia::render('publisher/dashboard', [
            'publisher' => [
                'name' => $registration->publisher_name,
            ],
            'metrics' => [
                'active_books' => $activeBooks,
                'sold_books' => null,
                'net_revenue' => null,
                'available_balance' => null,
            ],
            'salesTrend' => [],
            'evaluation' => null,
            'recentTransactions' => [],
            'dataAvailability' => [
                'sales' => false,
                'financials' => false,
                'reviews' => false,
            ],
        ]);
    }
}
