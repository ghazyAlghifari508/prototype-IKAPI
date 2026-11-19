{{--
  Portal shell base (publisher + admin). Not used directly: layouts.publisher and layouts.admin extend it and
  only supply the persona-specific bits (nav list, labels, account block). The shell itself is shared because
  the P04 audit shows the topbar, banner, drawer behaviour and workspace frame are identical in both portals;
  everything that differs (menu items, aria-label, account block) comes from the persona, so nothing leaks.

  Body source: <body class="bg-canvas text-ink antialiased"> in the 14 portal pages; the extra `ikapi-portal`
  class only scopes the shell CSS ported in resources/css/app.css.

  Sections
    title        <title>
    content      workspace content (inside <main id="workspace"> > max-w-[1560px] frame)
    main_extra   optional classes appended to <main>
    overlays     modals / toasts. Rendered OUTSIDE <main id="workspace">: the workspace is `relative z-10`, which
                 creates a stacking context, so a modal placed inside it could never rise above the fixed sidebar
                 (z-40). The prototype puts its modals/toasts at the end of <body> for the same reason.
--}}
<!DOCTYPE html>
<html lang="id">
<head>
  <x-ikapi.head :title="trim($__env->yieldContent('title', 'Portal IKAPI Jawa Barat'))" icons="portal" />
  @stack('head')
</head>
<body class="ikapi-portal bg-canvas text-ink antialiased font-sans">

<a href="#workspace" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-white focus:text-sm focus:font-semibold">Lewati ke konten utama</a>

@include('partials.portal.topbar', [
    'homeRoute' => $homeRoute,
    'notifExtra' => $notifExtra ?? null,
    'manualShell' => trim($__env->yieldContent('manual_shell')) === '1',
])

@include('partials.portal.sidebar', [
    'manualShell' => trim($__env->yieldContent('manual_shell')) === '1',
    'persona' => $persona,
    'navLabel' => $navLabel,
    'accountHref' => $accountHref,
    'account' => $account,
    'logoutHref' => $logoutHref,
])

<!-- MAIN COLUMN -->
<div class="shell-main">
  @include('partials.portal.banner')

  <!-- WORKSPACE -->
  <main id="workspace" class="relative z-10 -mt-20 rounded-t-[20px] border-t border-border bg-white lg:ml-6 @yield('main_extra')">
    <div class="mx-auto w-full max-w-[1560px] px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-8">
      @yield('content')
    </div>
  </main>
</div>

{{-- Modals/toasts live outside <main id="workspace"> on purpose (see the note at the top of this file).
     P04 proof pages use @section('overlays'); pages that push the same content from a partial use @push. --}}
@yield('overlays')
@stack('overlays')

@stack('scripts')
</body>
</html>
