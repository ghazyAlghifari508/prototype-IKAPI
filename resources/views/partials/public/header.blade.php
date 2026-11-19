{{--
  Public (buyer) header. Source: <header> in user/beranda_desktop.html (3.788 chars, 2 tiers, 112px).
  Markup, classes and DOM order are copied verbatim; only data (links, active state, cart count, account
  state) is variable. It is intentionally NOT a generic navbar.

  Variants measured in the P04 audit (diff vs beranda):
    - z-index        z-50 (beranda, katalog, detail, komunitas) | z-40 (keranjang, agenda, chatbot, akun pages)
    - container      max-w-[1360px] px-4 sm:px-6 lg:px-8 (all) | max-w-[1240px] px-4 md:px-8 (chatbot only)
    - account slot   guest: Masuk + Daftar + round "Akun Saya" | member: avatar dropdown (6 pages)
    - cart button    idle (hover:text-primary hover:bg-surface-soft) | current page (text-primary)
  Those four axes are the props below. Anything else is identical in the source.

  Variables (pass with @include('partials.public.header', [...]); all optional)
    $z         'z-50'|'z-40'
    $container 'wide' (1360) | 'narrow' (1240)
    $account   'guest' | 'member'
    $cartCount int|null     fixture/demo state, never a made-up statistic
    $cartActive bool        marks the cart link as the current page
    $currentRoute       optional menu route this page stands for (default: derived from the current route name)
    $searchPlaceholder  copy differs per page in the prototype (3 texts: books | community | agenda/news)
    $accountName, $accountInitials, $accountEmail   member dropdown identity (demo fixture)
    $identityIds bool       emit the ids the account/publisher page scripts sync (P06): header-avatar,
                            header-avatar-initials, header-user-name, dropdown-user-name, dropdown-user-email,
                            header-cart-badge, toggle-dropdown-btn, header-user-dropdown. Default false keeps the
                            P05 markup byte-identical; the data-ikapi-* hooks are omitted when ids are used so the
                            page script and shell.js never both drive the dropdown.
--}}
@php
    $z = $z ?? 'z-50';
    $container = $container ?? 'wide';
    $account = $account ?? 'guest';
    $cartCount = $cartCount ?? null;
    $cartActive = $cartActive ?? false;
    $searchPlaceholder = $searchPlaceholder ?? 'Cari judul, penulis, atau topik buku...';
    $currentRoute = $currentRoute ?? null;
    $identityIds = $identityIds ?? false;
    $cartBadgeEmpty = $cartBadgeEmpty ?? false;
    $accountPill = $accountPill ?? true;
    // The prototype is inconsistent here: beranda styles the current tab `text-[14px]`, agenda does not (it
    // inherits 16px and is 15px wider). Both variants are reproduced instead of "cleaning up" one of them.
    $navActiveSm = $navActiveSm ?? true;
    $buyerNav = \App\Support\Navigation::items('buyer', $currentRoute);
    $accountNav = \App\Support\Navigation::items('account', $currentRoute);
    $cartReady = \Illuminate\Support\Facades\Route::has('cart');
    $containerClass = $container === 'narrow'
        ? 'h-28 max-w-[1240px] mx-auto px-4 md:px-8 flex flex-col justify-between'
        : 'h-28 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between';
    $zClass = $z === 'z-40' ? 'z-40' : 'z-50';
@endphp

<header class="fixed top-0 left-0 right-0 {{ $zClass }} bg-[#fffffff2] backdrop-blur-md border-b border-border-subtle shadow-[0_1px_4px_rgba(34,34,37,0.04)]">
  <div class="{{ $containerClass }}">
    <div class="h-16 flex items-center justify-between gap-4">
      <!-- Logo -->
      <div class="flex items-center gap-4 shrink-0">
        <a href="{{ \Illuminate\Support\Facades\Route::has('home') ? route('home') : '#' }}" class="flex items-center" aria-label="Beranda IKAPI Jawa Barat">
          <img alt="Logo IKAPI Jawa Barat" class="h-7 sm:h-8 w-auto object-contain" src="{{ asset('assets/ikapi/logo-ikapi-jabar.png') }}">
        </a>
      </div>
      <!-- Search Bar -->
      <div class="flex-1 max-w-xl mx-2 hidden sm:flex items-center">
        <div class="relative w-full">
          <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted text-[20px]">search</span>
          <input class="w-full h-10 pl-10 pr-4 rounded-xl bg-surface-neutral text-[14px] text-ink-body placeholder:text-ink-muted outline-none ring-1 ring-border-subtle focus:ring-2 focus:ring-primary focus:bg-white transition-all" placeholder="{{ $searchPlaceholder }}" type="text">
        </div>
      </div>
      <!-- Right Actions -->
      <div class="flex items-center gap-3 sm:gap-4 shrink-0">
        <a class="relative p-2 rounded-xl {{ $cartActive ? 'text-primary transition-colors' : 'text-ink-body hover:text-primary hover:bg-surface-soft transition-colors' }}" href="{{ $cartReady ? route('cart') : '#' }}" aria-label="Keranjang Belanja" @if ($cartActive) aria-current="page" @endif>
          <span class="material-symbols-outlined text-[24px]">shopping_bag</span>
          @if ($cartCount !== null || $cartBadgeEmpty)
            <span @if ($identityIds) id="header-cart-badge" @endif class="ikapi-cart-badge absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">{{ $cartCount }}</span>
          @endif
        </a>
        <div class="h-6 w-px bg-border-subtle"></div>

        @if ($account === 'member')
          <!-- User Profile & Dropdown Trigger -->
          <div class="relative" @if ($identityIds) @else data-ikapi-dropdown @endif>
            <button type="button" aria-expanded="false" aria-haspopup="true" @if ($identityIds) id="toggle-dropdown-btn" @else data-ikapi-dropdown-toggle @endif class="flex items-center gap-2.5 p-1.5 pl-2 rounded-full hover:bg-surface-neutral transition-colors focus:outline-none focus:ring-2 focus:ring-[#673de64d]">
              <div @if ($identityIds) id="header-avatar" @endif class="w-8 h-8 rounded-full bg-primary text-white font-bold text-[13px] flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                <span @if ($identityIds) id="header-avatar-initials" @endif>{{ $accountInitials ?? 'AH' }}</span>
              </div>
              <span @if ($identityIds) id="header-user-name" @endif class="hidden md:inline text-[14px] text-ink-body font-semibold">{{ $accountName ?? 'Ahmad Hidayat' }}</span>
              <span class="material-symbols-outlined text-[18px] text-ink-muted">expand_more</span>
            </button>

            <!-- Dropdown Menu -->
            <div @if ($identityIds) id="header-user-dropdown" @else data-ikapi-dropdown-menu @endif class="hidden absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-border-subtle py-2 z-50 transition-all">
              <div class="px-4 py-3 border-b border-border-subtle">
                <p @if ($identityIds) id="dropdown-user-name" @endif class="text-[14px] font-bold text-ink-body truncate">{{ $accountName ?? 'Ahmad Hidayat' }}</p>
                <p @if ($identityIds) id="dropdown-user-email" @endif class="text-[12px] text-ink-muted truncate">{{ $accountEmail ?? 'ahmad.hidayat@literasi.id' }}</p>
              </div>
              <div class="py-1 text-[13px]">
                @foreach ($accountNav as $item)
                  <a href="{{ $item['href'] ?? '#' }}" @if ($item['active']) aria-current="page" @endif class="flex items-center gap-2.5 px-4 py-2 transition-colors {{ $item['active'] ? 'font-bold text-primary bg-surface-soft' : 'text-ink-body hover:text-primary hover:bg-surface-neutral font-medium' }}">
                    <span class="material-symbols-outlined text-[18px]">{{ $item['icon'] }}</span>
                    <span>{{ $item['label'] }}</span>
                  </a>
                @endforeach
              </div>
              <div class="pt-1 border-t border-border-subtle">
                <a href="{{ \Illuminate\Support\Facades\Route::has('login') ? route('login') : '#' }}" class="flex items-center gap-2.5 px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors font-semibold">
                  <span class="material-symbols-outlined text-[18px]">logout</span>
                  <span>Keluar Akun</span>
                </a>
              </div>
            </div>
          </div>
        @else
          <a class="hidden h-10 items-center rounded-xl px-3 text-[14px] font-semibold text-ink-body transition-colors hover:bg-surface-soft sm:flex" href="{{ \Illuminate\Support\Facades\Route::has('login') ? route('login') : '#' }}">
            <span>Masuk</span>
          </a>
          <a class="hidden h-10 items-center rounded-xl bg-primary px-5 text-[14px] font-semibold text-white shadow-xs transition-colors hover:bg-primary-hover sm:flex" href="{{ \Illuminate\Support\Facades\Route::has('register') ? route('register') : '#' }}">
            <span>Daftar</span>
          </a>
          @if ($accountPill)
            <a href="{{ \Illuminate\Support\Facades\Route::has('profile.show') ? route('profile.show') : '#' }}" class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-xs" aria-label="Akun Saya">
              <span class="material-symbols-outlined text-[18px]">person</span>
            </a>
          @endif
        @endif
      </div>
    </div>
    <!-- Primary Nav Tabs -->
    <nav class="h-12 flex items-center gap-6 overflow-x-auto scrollbar-none max-w-full">
      @foreach ($buyerNav as $item)
        @if ($item['ready'])
          <a href="{{ $item['href'] }}" @if ($item['active']) aria-current="page" @endif class="h-full flex items-center transition-colors whitespace-nowrap {{ $item['active'] ? 'text-primary font-bold border-b-2 border-primary ' . ($navActiveSm ? 'text-[14px]' : '') : 'text-[14px] text-ink-muted hover:text-primary' }}">{{ $item['label'] }}</a>
        @else
          <span class="h-full flex items-center whitespace-nowrap text-[14px] text-ink-muted" aria-disabled="true" title="Halaman ini belum dimigrasi">{{ $item['label'] }}</span>
        @endif
      @endforeach
    </nav>
  </div>
</header>
