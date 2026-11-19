<?php

namespace App\Http\Controllers;

use App\Support\Fixtures;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;

/**
 * P08 - Portal Penerbit, frontend-only.
 *
 * No publisher authentication, approval workflow, payout, payment gateway or database: the screens are the
 * migrated prototype pages and every number comes from resources/data/ikapi/publisher.json (the same demo dataset
 * the prototype ships). Mutations live in the browser, so nothing here writes state.
 */
class PublisherController extends Controller
{
    public function dashboard(): View
    {
        return view('publisher.dashboard', $this->shared());
    }

    public function books(): View
    {
        return view('publisher.books', $this->shared());
    }

    public function orders(): View
    {
        return view('publisher.orders', $this->shared());
    }

    public function finance(): View
    {
        return view('publisher.finance', $this->shared());
    }

    public function reviews(): View
    {
        return view('publisher.reviews', $this->shared());
    }

    public function settings(): View
    {
        return view('publisher.settings', $this->shared());
    }

    /**
     * Invoice preview. The prototype ships exactly one invoice layout, so the page renders that sheet; the demo
     * order id is echoed in the URL only for the "back to orders" link and never changes the numbers.
     */
    public function invoice(?string $order = null): View
    {
        return view('publisher.invoice', $this->shared() + ['orderId' => $order]);
    }

    /**
     * Legacy publisher login/registration pages are redirects in the prototype (single unified auth with a
     * publisher role context). The alias is kept so old links keep working; no second, different form is created.
     */
    public function loginAlias(): RedirectResponse
    {
        return redirect()->route('login', ['role' => 'publisher']);
    }

    public function registerAlias(): RedirectResponse
    {
        return redirect()->route('register', ['role' => 'publisher']);
    }

    /**
     * @return array<string, mixed>
     */
    private function shared(): array
    {
        return [
            'publisher' => Fixtures::get('publisher'),
            'profile' => Fixtures::get('publisher')['SAVED_PROFILE'],
        ];
    }
}
