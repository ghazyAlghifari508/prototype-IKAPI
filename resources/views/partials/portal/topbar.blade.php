{{--
  Portal topbar (publisher + admin). Source: "TOP UTILITY BAR" in penerbit/dashboard_penerbit_desktop.html and
  admin/dashboard_administrasi_utama_desktop.html. The markup is identical in the 14 portal pages (topbar hash
  64a8d2 in 13/14; the 14th differs only by the home link target and one extra notification sentence).
  Copied verbatim: logo drop-shadow, hamburger (lg:hidden), notification button + panel, focus-ring-light.

  Variables
    $homeRoute   named route for the logo link ('publisher.dashboard' | 'admin.dashboard')
    $notifExtra  optional second sentence in the notification panel (publisher pages)
--}}
@php
    $homeRoute = $homeRoute ?? 'home';
    $notifExtra = $notifExtra ?? null;
    // Pilot pages (P08 publisher) ship their own shell bindings copied from the prototype, which address the
    // original ids. In manual mode the partial emits those ids instead of the data-ikapi hooks, so shell.js stays
    // quiet and nothing toggles twice. P04 proof pages keep the hook mode.
    $manualShell = $manualShell ?? false;
    $homeHref = \Illuminate\Support\Facades\Route::has($homeRoute) ? route($homeRoute) : '#';
@endphp

<!-- TOP UTILITY BAR -->
<header class="absolute inset-x-0 top-0 z-50 h-16">
  <div class="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
    <div class="flex items-center gap-3">
      <button type="button" @if ($manualShell) id="sidebar-toggle" @else data-ikapi-sidebar-toggle @endif aria-label="Buka menu navigasi" aria-expanded="false" aria-controls="publisher-sidebar"
        class="focus-ring-light grid h-10 w-10 place-items-center rounded-xl text-white hover:bg-[#ffffff1a] lg:hidden">
        <span class="material-symbols-outlined text-[22px]">menu</span>
      </button>
      <a href="{{ $homeHref }}" class="focus-ring-light flex items-center rounded-xl">
        <img src="{{ asset('assets/ikapi/logo-ikapi-jabar.png') }}" alt="IKAPI Jawa Barat" class="h-7 w-auto object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]">
      </a>
    </div>
    <div class="flex items-center gap-1.5">
      <div class="relative">
        <button type="button" @if ($manualShell) id="btn-notif" @else data-ikapi-notif-toggle @endif aria-label="Notifikasi" aria-haspopup="true" aria-expanded="false"
          class="focus-ring-light relative grid h-10 w-10 place-items-center rounded-xl text-white hover:bg-[#ffffff1a]">
          <span class="material-symbols-outlined text-[22px]">notifications</span>
        </button>
        <div @if ($manualShell) id="notif-panel" @else data-ikapi-notif-panel @endif class="absolute right-0 top-12 hidden w-72 rounded-2xl border border-border bg-white p-4 shadow-[0_16px_40px_rgba(34,34,37,0.12)]">
          <div class="mb-1.5 text-[13px] font-bold text-ink">Notifikasi</div>
          <p class="text-[13px] leading-relaxed text-muted">Tidak ada notifikasi baru.</p>
          @if ($notifExtra)
            <p class="mt-2 text-[12px] leading-relaxed text-muted">{{ $notifExtra }}</p>
          @endif
        </div>
      </div>
    </div>
  </div>
</header>
