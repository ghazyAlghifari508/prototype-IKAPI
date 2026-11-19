<?php

namespace App\Http\Controllers;

use App\Support\Fixtures;
use Illuminate\Contracts\View\View;

/**
 * P09 - Portal Administrator, frontend-only.
 *
 * No real administrator auth, no role middleware, no database write and no business endpoint: the screens are the
 * migrated prototype pages and every row comes from resources/data/ikapi/admin.json plus the shared browser demo
 * state (community topics/replies/reports from P07). Nothing here reads or mutates production data.
 */
class AdminController extends Controller
{
    public function dashboard(): View
    {
        return view('admin.dashboard', $this->shared());
    }

    public function users(): View
    {
        return view('admin.users', $this->shared());
    }

    public function catalog(): View
    {
        return view('admin.catalog', $this->shared());
    }

    public function reviewModeration(): View
    {
        return view('admin.review-moderation', $this->shared());
    }

    public function monitoring(): View
    {
        return view('admin.monitoring', $this->shared());
    }

    public function payouts(): View
    {
        return view('admin.payouts', $this->shared());
    }

    public function communities(): View
    {
        return view('admin.communities', $this->shared());
    }

    public function discussionModeration(): View
    {
        return view('admin.discussion-moderation', $this->shared());
    }

    /**
     * Administrator sign-in preview. Explicitly a demo: the page validates in the browser and stores an
     * `ikapi_admin_session_demo` marker; there is no Laravel Auth and no security claim.
     */
    public function login(): View
    {
        return view('admin.login');
    }

    /**
     * @return array<string, mixed>
     */
    private function shared(): array
    {
        return [
            'admin' => Fixtures::get('admin'),
        ];
    }
}
