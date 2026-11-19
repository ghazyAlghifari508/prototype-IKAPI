<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthDemoController;
use App\Http\Controllers\BuyerPagesController;
use App\Http\Controllers\CommunityController;
use App\Http\Controllers\PublisherController;
use App\Support\Fixtures;
use App\Support\Navigation;
use Illuminate\Support\Facades\Route;

/*
| P05 - four core buyer pages. The prototype's `welcome` placeholder is replaced by the migrated Beranda.
| Route names follow the P01 blueprint; the catalog is `books.index` (aliased `catalog` for the menu registry).
*/
Route::get('/', function () {
    return view('buyer.home', [
        'home' => Fixtures::home(),
    ]);
})->name('home');

Route::get('/katalog', function () {
    return view('buyer.catalog.index', [
        'catalog' => Fixtures::catalog(),
    ]);
})->name('books.index');

Route::get('/buku/{book:slug}', function (string $book) {
    $row = Fixtures::book($book);

    abort_if($row === null, 404);

    return view('buyer.books.show', [
        'book' => $row,
    ]);
})->name('books.show');

Route::get('/buku/{book:slug}/cuplikan', function (string $book) {
    $row = Fixtures::book($book);

    abort_if($row === null, 404);

    return view('buyer.books.preview', [
        'book' => $row,
        'preview' => Fixtures::preview(),
    ]);
})->name('books.preview');

/*
| P06 group A - simulated auth screens. Routes are named for the buyer header/menu registry (Navigation.php)
| and never touch Laravel Auth: the prototype validates in the browser and stores an explicit demo session.
*/
Route::controller(AuthDemoController::class)->group(function () {
    Route::get('/masuk', 'login')->name('login');
    Route::get('/daftar', 'register')->name('register');
    Route::get('/lupa-kata-sandi', 'forgotPassword')->name('password.request');
    Route::get('/verifikasi-email', 'verifyEmail')->name('verification.notice');
    Route::get('/onboarding', 'onboarding')->name('onboarding');
    Route::get('/status-pendaftaran-penerbit', 'publisherStatus')->name('publisher.status');
});

/*
| P06 groups B-E - account, checkout simulation, library/reader, agenda and help. Named routes are the ones the
| buyer header, account sidebar and Navigation.php already point at; the prototype's own pages link to each other.
*/
Route::controller(BuyerPagesController::class)->group(function () {
    Route::get('/akun/profil', 'profile')->name('profile.show');
    Route::get('/akun/pengaturan', 'settings')->name('profile.settings');
    Route::get('/akun/bantuan', 'help')->name('help');
    Route::get('/akun/bantuan/chatbot', 'chatbot')->name('help.chatbot');
    Route::get('/keranjang', 'cart')->name('cart');
    Route::get('/akun/pesanan', 'orders')->name('orders');
    Route::get('/akun/perpustakaan', 'library')->name('library');
    Route::get('/akun/perpustakaan/{book}/baca', 'reader')->name('reader');
    Route::get('/akun/ulasan', 'reviews')->name('reviews');
    Route::get('/agenda', 'agenda')->name('agenda');
    Route::get('/agenda/{event}', 'agendaShow')->name('agenda.show');
});

/*
| P07 - Community Literasi. One URL per screen (directory, profile, room, topic, reply-to-comment); the prototype
| switched views in place, so the ids in the path are what the ported core renders. Unknown/mismatched ids -> 404.
*/
Route::prefix('komunitas')->name('community')->group(function () {
    Route::get('/', [CommunityController::class, 'index']);
    Route::get('/{community}', [CommunityController::class, 'show'])->name('.show');
    Route::get('/{community}/diskusi', [CommunityController::class, 'discussion'])->name('.discussion');
    Route::get('/{community}/diskusi/{topic}', [CommunityController::class, 'topic'])->name('.topic');
    Route::get('/{community}/diskusi/{topic}/balas/{reply?}', [CommunityController::class, 'reply'])->name('.reply');
});

/*
| P08 - Portal Penerbit. Legacy /masuk and /daftar publisher pages are redirects in the prototype; the aliases are
| kept, no second form is introduced. All screens are frontend-only (fixtures + browser state, no payout backend).
*/
Route::prefix('penerbit')->name('publisher.')->group(function () {
    Route::get('/', [PublisherController::class, 'dashboard'])->name('dashboard');
    Route::get('/buku', [PublisherController::class, 'books'])->name('books');
    Route::get('/pesanan', [PublisherController::class, 'orders'])->name('orders');
    Route::get('/keuangan', [PublisherController::class, 'finance'])->name('payouts');
    Route::get('/ulasan', [PublisherController::class, 'reviews'])->name('reviews');
    Route::get('/pengaturan', [PublisherController::class, 'settings'])->name('settings');
    Route::get('/invoice/{order?}', [PublisherController::class, 'invoice'])->name('invoice');
    Route::get('/masuk', [PublisherController::class, 'loginAlias'])->name('login');
    Route::get('/daftar', [PublisherController::class, 'registerAlias'])->name('register');
});

/*
| P09 - Portal Administrator. Frontend-only: the sign-in page is a demo preview (no Laravel Auth, no middleware);
| the moderation screens read the same browser demo state the buyer community pages write (P07).
*/
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/pengguna', [AdminController::class, 'users'])->name('users');
    Route::get('/katalog', [AdminController::class, 'catalog'])->name('catalog');
    Route::get('/moderasi-ulasan', [AdminController::class, 'reviewModeration'])->name('review-moderation');
    Route::get('/monitoring', [AdminController::class, 'monitoring'])->name('monitoring');
    Route::get('/pencairan', [AdminController::class, 'payouts'])->name('payouts');
    Route::get('/komunitas', [AdminController::class, 'communities'])->name('communities');
    Route::get('/moderasi-diskusi', [AdminController::class, 'discussionModeration'])->name('discussion-moderation');
    Route::get('/masuk', [AdminController::class, 'login'])->name('login');
});

/*
| P03/P04 proof-of-pipeline routes. Isolated renders, not product pages, not linked from any navigation.
*/
Route::get('/ui/foundation', function () {
    return view('foundation', [
        'books' => Fixtures::books(),
        'swatches' => [
            'bg-primary' => '#673de6',
            'bg-primary-hover' => '#5025d1',
            'bg-primary-deep' => '#2f1c6a',
            'bg-surface-soft' => '#f5f6ff',
            'bg-surface-neutral' => '#f5f5f6',
            'bg-canvas' => '#ffffff',
            'bg-divider' => '#efeff2',
            'border-border-subtle' => '#e5e7eb',
        ],
        'assetSample' => [
            ['url' => 'assets/ikapi/covers/laskar-aksara-pasundan.jpg', 'alt' => 'Sampul Laskar Aksara Pasundan'],
            ['url' => 'assets/ikapi/events/event-community.jpg', 'alt' => 'Foto kegiatan komunitas'],
            ['url' => 'assets/ikapi/logo-ikapi-jabar.png', 'alt' => 'Logo IKAPI Jawa Barat'],
            ['url' => 'assets/ikapi/ilustration/hero_reading_book_lover.svg', 'alt' => 'Ilustrasi pembaca buku'],
        ],
        'nav' => [
            'buyer' => Navigation::items('buyer'),
            'publisher' => Navigation::items('publisher'),
            'admin' => Navigation::items('admin'),
        ],
    ]);
})->name('ui.foundation');

Route::prefix('ui/shell')->name('ui.shell.')->group(function () {
    Route::get('public', fn () => view('ui.shell-public', ['books' => array_slice(Fixtures::books(), 0, 12)]))->name('public');
    Route::get('auth', fn () => view('ui.shell-auth'))->name('auth');
    Route::get('parity', fn () => view('ui.shell-home-parity'))->name('parity');
    Route::get('publisher', fn () => view('ui.shell-publisher'))->name('publisher');
    Route::get('admin', fn () => view('ui.shell-admin'))->name('admin');
});
