#!/usr/bin/env python
# P06 groups B-E: accounts, checkout, library/reader/reviews, agenda and help/chatbot.
import io, os, sys
exec(io.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'p6-build-lib.py'), encoding='utf-8').read())

MAIN_PT = 'pt-28'
MAIN_CLASS = 'min-h-[calc(100vh-16rem)]'

PAGES = {
    # ---------------- B: account & settings ----------------
    'akun_saya_profil_dropdown_navigasi_desktop': {
        'note': 'Profile page with the account sidebar and the in-page profile editor (demo localStorage profile).',
        'view': 'buyer/account/profile', 'layout': 'public',
        'header': {'z': 'z-40', 'account': 'member', 'identityIds': True, 'cart': '2', 'search': 'Cari judul buku, penulis, atau topik...'},
        'main_pt': MAIN_PT, 'main_class': MAIN_CLASS,
        'content': lambda: inner_main(frag('akun_saya_profil_dropdown_navigasi_desktop', 'child-main'))[0],
        'overlays': ['child-toast'], 'root': '#profile-form', 'js': 'account/profile.js',
    },
    'pengaturan_akun_desktop': {
        'note': 'Account settings: notification preferences, password modal (demo, nothing is saved server-side).',
        'view': 'buyer/account/settings', 'layout': 'public',
        'header': {'z': 'z-40', 'account': 'member', 'identityIds': True, 'cart': '2', 'search': 'Cari judul buku, penulis, atau topik...'},
        'main_pt': MAIN_PT, 'main_class': MAIN_CLASS,
        'content': lambda: inner_main(frag('pengaturan_akun_desktop', 'child-main'))[0],
        'overlays': ['child-modal-change-password', 'child-toast'], 'root': '#password-last-updated', 'js': 'account/settings.js',
    },
    'bantuan_akun_desktop': {
        'note': 'Help centre: FAQ accordion, topics and search over the prototype FAQ data.',
        'view': 'buyer/account/help', 'layout': 'public',
        'header': {'z': 'z-40', 'account': 'member', 'identityIds': True, 'cart': '2', 'search': 'Cari judul buku, penulis, atau topik...'},
        'main_pt': MAIN_PT, 'main_class': MAIN_CLASS,
        'content': lambda: inner_main(frag('bantuan_akun_desktop', 'child-main'))[0],
        'root': '#faq-search-input', 'js': 'account/help.js',
        'data': {'faqData': 'faqData'}, 'data_push': "['faqData' => $faqs]",
    },
    # ---------------- C: cart & checkout ----------------
    'keranjang_pembayaran_terpadu_desktop': {
        'note': 'Cart and simulated checkout (payment selector, status states, invoice drawer). No payment gateway.',
        'view': 'buyer/checkout/cart', 'layout': 'public',
        'header': {'z': 'z-40', 'account': 'guest', 'current': 'cart', 'cart': '2',
                   'search': 'Cari judul, penulis, atau topik buku...'},
        'main_pt': MAIN_PT, 'main_class': MAIN_CLASS,
        'content': lambda: inner_main(frag('keranjang_pembayaran_terpadu_desktop', 'child-main'))[0],
        'overlays': ['child-snap-overlay', 'child-cart-toast'], 'root': '#cart-filled-view', 'js': 'checkout/cart.js',
    },
    'riwayat_pesanan_desktop': {
        'note': 'Order history with status tabs and an order-detail modal fed by the prototype order seed.',
        'view': 'buyer/orders/index', 'layout': 'public',
        'header': {'z': 'z-40', 'account': 'member', 'identityIds': True, 'cart': '2', 'search': 'Cari judul buku, penulis, atau topik...'},
        'main_pt': MAIN_PT, 'main_class': MAIN_CLASS,
        'content': lambda: inner_main(frag('riwayat_pesanan_desktop', 'child-main'))[0],
        'overlays': ['child-modal-order-detail', 'child-toast'], 'root': '#tab-filter-all', 'js': 'orders/index.js',
        'data': {'ordersData': 'ordersData'}, 'data_push': "['ordersData' => $orders]",
    },
    # ---------------- D: library, reader, reviews ----------------
    'perpustakaan_saya_desktop': {
        'note': 'Personal library: tabs, search, sort, favourite/finished state (demo localStorage only).',
        'view': 'buyer/library/index', 'layout': 'public',
        'header': {'z': 'z-50', 'account': 'member', 'identityIds': True, 'cart': '2', 'search': 'Cari judul, penulis, atau topik buku...'},
        'main_pt': MAIN_PT, 'main_class': MAIN_CLASS,
        'content': lambda: inner_main(frag('perpustakaan_saya_desktop', 'child-main'))[0],
        'overlays': ['child-toastNotification'], 'root': '#librarySearch', 'js': 'library/index.js',
    },
    'web_reader_desktop': {
        'note': 'Browser-only web reader: chapter paging, themes, type settings, bookmarks, TOC. No download, no PDF.',
        'view': 'buyer/reader/show', 'layout': 'plain', 'serif': True,
        'body_class': 'theme-canvas antialiased min-h-screen flex flex-col justify-between transition-colors duration-300',
        'content': lambda: '\n'.join([
            frag('web_reader_desktop', 'child-header'),
            frag('web_reader_desktop', 'child-main'),
            frag('web_reader_desktop', 'child-footer'),
        ]),
        'overlays': ['child-drawer-backdrop', 'child-drawer-bookmarks', 'child-drawer-settings', 'child-drawer-toc', 'child-modal-unlicensed'],
        'root': '#book-page', 'js': 'reader/reader.js',
        'data': {'bookPagesData': 'bookPagesData', 'bookmarksData': 'bookmarksData'},
        'data_push': "['bookPagesData' => $reader['pages'], 'bookmarksData' => $reader['bookmarks']],",
    },
    'riwayat_ulasan_desktop': {
        'note': 'Review history: list, sort, edit modal, delete confirmation (demo localStorage reviews).',
        'view': 'buyer/reviews/index', 'layout': 'public',
        'header': {'z': 'z-40', 'account': 'member', 'identityIds': True, 'cart': '2', 'search': 'Cari judul buku, penulis, atau topik...'},
        'main_pt': MAIN_PT, 'main_class': MAIN_CLASS,
        'content': lambda: inner_main(frag('riwayat_ulasan_desktop', 'child-main'))[0],
        'overlays': ['child-modal-edit-review', 'child-modal-delete-confirm', 'child-toast'], 'root': '#review-total-count', 'js': 'reviews/index.js',
        'data': {'initialUserReviews': 'initialUserReviews'}, 'data_push': "['initialUserReviews' => $reviews]",
    },
    # ---------------- E: agenda, agenda detail, chatbot ----------------
    'agenda_berita_literasi_desktop': {
        'note': 'Agenda & berita literasi: calendar, event filters, ICS export, article preview and event modals.',
        'view': 'buyer/agenda/index', 'layout': 'public',
        'header': {'z': 'z-40', 'account': 'guest', 'current': 'agenda', 'cart': '2', 'navActiveSm': False, 'pill': False,
                   'search': 'Cari judul buku, lokakarya, atau artikel...'},
        'main_pt': MAIN_PT, 'main_class': MAIN_CLASS, 'footer_variant': 'agenda',
        'content': lambda: inner_main(frag('agenda_berita_literasi_desktop', 'child-main'))[0],
        'overlays': ['child-modal-featured-detail', 'child-modal-article-preview', 'child-toastNotification'],
        'root': '#btn-state-nov18', 'js': 'agenda/index.js',
        'data': {'eventsData': 'eventsData', 'articlesData': 'articlesData'},
        'data_push': "['eventsData' => $agenda['events'], 'articlesData' => $agenda['articles']],",
    },
    'detail_agenda_desktop': {
        'note': 'Agenda detail for ?id=ev-1..3 (prototype: three events mirrored from the agenda listing).',
        'view': 'buyer/agenda/show', 'layout': 'public',
        'header': {'z': 'z-40', 'account': 'guest', 'current': 'agenda', 'cart': '2', 'navActiveSm': False, 'pill': False,
                   'search': 'Cari judul buku, lokakarya, atau artikel...'},
        'main_pt': MAIN_PT, 'main_class': MAIN_CLASS, 'footer_variant': 'agenda',
        'content': lambda: inner_main(frag('detail_agenda_desktop', 'child-main'))[0],
        'root': '#event-cover', 'js': 'agenda/show.js',
        'data': {'EVENTS': 'EVENTS'}, 'data_push': "['EVENTS' => $events]",
        'js_patch': [("var key = params.get('id');", "var key = window.IKAPI_P6_EVENT_ID || params.get('id');")],
        'scripts_extra': "window.IKAPI_P6_EVENT_ID = '{{ $eventId }}';",
    },
    'chatbot_bantuan_rekomendasi_desktop': {
        'note': 'Help chatbot page: scripted demo conversation, no AI backend, no network request.',
        'view': 'buyer/help/chatbot', 'layout': 'public',
        'header': {'z': 'z-40', 'account': 'guest', 'container': 'narrow', 'cart': '2',
                   'search': 'Cari judul, penulis, atau topik buku...'},
        'main_pt': MAIN_PT, 'main_class': MAIN_CLASS, 'footer_variant': 'chatbot',
        'content': lambda: inner_main(frag('chatbot_bantuan_rekomendasi_desktop', 'child-main'))[0],
        'overlays': ['child-ikapi-chat-widget-wrapper', 'child-toast-notification'],
        'root': '#btn-state-rekomendasi', 'js': 'help/chatbot.js',
    },
}

only = sys.argv[1:] or list(PAGES)
for page in only:
    cfg = PAGES[page]
    view(page, cfg)
    js_module(page, cfg)