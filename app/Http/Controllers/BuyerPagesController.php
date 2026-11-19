<?php

namespace App\Http\Controllers;

use App\Support\Fixtures;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;

/**
 * P06 groups B-E: buyer account, checkout simulation, library/reader, agenda and help.
 *
 * Frontend-only. Every screen is a migrated prototype page; page state (cart, orders, library, reading progress,
 * profile) lives in localStorage through resources/js/ikapi/demo and the per-page modules. Nothing here writes to a
 * database, calls a payment gateway, sends mail or reads authenticated users.
 */
class BuyerPagesController extends Controller
{
    public function profile(): View
    {
        return view('buyer.account.profile');
    }

    public function settings(): View
    {
        return view('buyer.account.settings');
    }

    public function help(): View
    {
        return view('buyer.account.help', [
            'faqs' => Fixtures::get('faq')['faqs'],
        ]);
    }

    public function chatbot(): View
    {
        return view('buyer.help.chatbot');
    }

    public function cart(): View
    {
        return view('buyer.checkout.cart');
    }

    public function orders(): View
    {
        return view('buyer.orders.index', [
            'orders' => Fixtures::get('orders-p6')['orders'],
        ]);
    }

    public function library(): View
    {
        return view('buyer.library.index');
    }

    /**
     * Web reader for one book. The prototype only ships a reader for the reference book; any other slug is a 404
     * rather than a silently reused page, and the licence modal (no purchase -> no access) is part of the page.
     */
    public function reader(string $book): View
    {
        $row = Fixtures::book($book);

        abort_if($row === null, 404);

        return view('buyer.reader.show', [
            'book' => $row,
            'reader' => Fixtures::get('reader'),
        ]);
    }

    public function reviews(): View
    {
        return view('buyer.reviews.index', [
            'reviews' => Fixtures::get('reviews')['reviews'],
        ]);
    }

    public function agenda(): View
    {
        return view('buyer.agenda.index', [
            'agenda' => Fixtures::get('agenda'),
        ]);
    }

    /**
     * Agenda detail. `{event}` is one of the three prototype ids (ev-1..ev-3); anything else is a 404 - the
     * prototype itself falls back to ev-1, which would show the wrong event for a stale link.
     */
    public function agendaShow(Request $request, string $event): View
    {
        $events = Fixtures::get('agenda-detail')['events'];

        abort_unless(isset($events[$event]), 404);

        return view('buyer.agenda.show', [
            'event' => $events[$event],
            'eventId' => $event,
            'events' => $events,
            'agenda' => Fixtures::get('agenda'),
        ]);
    }
}
