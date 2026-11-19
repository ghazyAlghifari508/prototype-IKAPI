{{--
  Public (buyer) layout. Source: user/beranda_desktop.html, katalog, detail, keranjang, komunitas, agenda, chatbot, akun.

  Measured structure (P04 audit):
    <body class="bg-white font-sans text-ink-body antialiased selection:bg-surface-soft selection:text-primary-deep">
    <header fixed 112px> -> <main class="w-full pt-28 bg-white [min-h-[calc(100vh-16rem)]]"> -> <footer black>
  Variants kept as sections, not as new design:
    - main padding-top   pt-28 (all) | pt-32 (komunitas)
    - main min-height    none (beranda, detail) | min-h-[calc(100vh-16rem)] (katalog, keranjang, agenda, chatbot, akun, komunitas)
    - selection colour   selection:bg-surface-soft | selection:bg-primary-soft (agenda, akun pages)

  Usage
    @extends('layouts.public')
    @section('title', 'IKAPI Store Jawa Barat')
    @section('content') ... @endsection
  Optional sections: header_z ('z-40'), header_container ('narrow'), account ('member'), cart_count, cart_active ('1'),
  current_route, search_placeholder, main_pt ('pt-32'), main_class ('min-h-[calc(100vh-16rem)]'), body_class, no_footer.
--}}
<!DOCTYPE html>
<html lang="id">
<head>
  <x-ikapi.head :title="trim($__env->yieldContent('title', 'IKAPI Store Jawa Barat'))" icons="buyer" :serif="trim($__env->yieldContent('serif')) === '1'" />
  @stack('head')
</head>
<body class="bg-white font-sans text-ink-body antialiased selection:bg-surface-soft selection:text-primary-deep @yield('body_class')">

  @hasSection('no_header')
  @else
  @include('partials.public.header', [
      'z' => trim($__env->yieldContent('header_z', 'z-50')),
      'container' => trim($__env->yieldContent('header_container', 'wide')),
      'account' => trim($__env->yieldContent('account', 'guest')),
      'cartCount' => $__env->yieldContent('cart_count') === '' ? null : (int) trim($__env->yieldContent('cart_count')),
      'cartActive' => trim($__env->yieldContent('cart_active')) === '1',
      'currentRoute' => trim($__env->yieldContent('current_route')) ?: null,
      'searchPlaceholder' => trim($__env->yieldContent('search_placeholder', 'Cari judul, penulis, atau topik buku...')),
      'identityIds' => trim($__env->yieldContent('identity_ids')) === '1',
      'cartBadgeEmpty' => trim($__env->yieldContent('cart_badge_empty')) === '1',
      'accountPill' => trim($__env->yieldContent('account_pill', '1')) === '1',
      'navActiveSm' => trim($__env->yieldContent('nav_active_sm', '1')) === '1',
  ])
  @endif

  <main class="w-full {{ trim($__env->yieldContent('main_pt', 'pt-28')) }} bg-white @yield('main_class')">
    @yield('content')
  </main>

  @hasSection('no_footer')
  @elseif (trim($__env->yieldContent('footer_variant')) !== '')
    @include('partials.public.footer-' . trim($__env->yieldContent('footer_variant')))
  @else
    @include('partials.public.footer')
  @endif

  {{-- pushed from pages via @push('overlays'): toast + modals --}}
  @stack('overlays')

  {{-- Floating chatbot: the prototype loads chatbot-widget.js on beranda, katalog, agenda, detail agenda,
       komunitas and the chatbot page only. Pages opt in with @section('chatbot', '1'). --}}
  @hasSection('chatbot')
    @vite('resources/js/ikapi/buyer/chatbot-widget.js')
  @endif

  @stack('scripts')
</body>
</html>
