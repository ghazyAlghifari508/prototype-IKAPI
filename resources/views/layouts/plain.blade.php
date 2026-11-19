{{--
  Bare shell for screens the prototype renders outside the public header/footer:
  onboarding_preferensi_bacaan (wizard), status_pendaftaran_penerbit (own mini header),
  web_reader (theme-canvas with its own chrome). No injection of a header or footer here -
  each of those pages draws its own chrome in its own fragment.
--}}
<!DOCTYPE html>
<html lang="id">
<head>
  <x-ikapi.head :title="trim($__env->yieldContent('title', 'IKAPI Store Jawa Barat'))" icons="buyer" :serif="trim($__env->yieldContent('serif')) === '1'" />
  @stack('head')
</head>
<body class="@yield('body_class', 'min-h-screen bg-white font-sans text-ink-body antialiased')">

  @yield('content')

  @stack('overlays')

  @stack('scripts')
</body>
</html>