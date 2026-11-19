<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta content="width=device-width, initial-scale=1.0" name="viewport">
  <meta content="web_standard" name="shell-type">
  <title>@yield('title', 'IKAPI Jawa Barat')</title>
  <link href="https://fonts.googleapis.com" rel="preconnect">
  <link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: { DEFAULT: '#673de6', hover: '#5025d1', deep: '#2f1c6a' },
            surface: { DEFAULT: '#ffffff', soft: '#f5f6ff', neutral: '#f5f5f6' },
            ink: { body: '#222225', muted: '#62636b' },
            'border-subtle': '#e5e7eb'
          },
          fontFamily: { sans: ["'DM Sans'", 'sans-serif'] }
        }
      }
    };
  </script>
  <style>
    html, body { margin: 0; padding: 0; }
    body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; overflow-x: clip; }
    .focus-ring:focus-visible { outline: 2px solid #673de6; outline-offset: 2px; }
    .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
  </style>
  @stack('styles')
</head>
<body class="min-h-screen bg-surface-neutral text-ink-body antialiased flex items-center justify-center p-4 sm:p-6">

  @yield('content')

  @stack('scripts')
</body>
</html>
