<!DOCTYPE html>
<html lang="id" class="h-full bg-[#f5f5f6]">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>IKAPI Jawa Barat — Marketplace & Portal Penerbit Buku</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
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
</head>
<body class="min-h-full flex flex-col font-sans antialiased text-ink-body bg-surface-neutral">

  <header class="border-b border-border-subtle bg-white">
    <div class="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <div class="flex items-center gap-3">
        <span class="text-2xl font-bold tracking-tight text-primary">IKAPI</span>
        <span class="text-[14px] font-semibold text-ink-muted">Jawa Barat</span>
      </div>
      <nav class="flex items-center gap-3">
        @auth
          <span class="text-[13px] font-semibold text-ink-body">Halo, {{ auth()->user()->name }}</span>
          @if (auth()->user()->isPublisher())
            <a href="{{ route('publisher.dashboard') }}" class="rounded-xl bg-primary px-4 py-2 text-[13px] font-bold text-white hover:bg-primary-hover">Dashboard Penerbit</a>
          @elseif (auth()->user()->isAdmin())
            <a href="{{ route('admin.dashboard') }}" class="rounded-xl bg-primary-deep px-4 py-2 text-[13px] font-bold text-white hover:bg-black">Dashboard Admin</a>
          @endif
          <form method="POST" action="{{ route('logout') }}" class="inline">
            @csrf
            <button type="submit" class="rounded-xl border border-border-subtle px-3.5 py-2 text-[13px] font-semibold text-ink-muted hover:bg-surface-neutral hover:text-red-600">Keluar</button>
          </form>
        @else
          <a href="{{ route('login') }}" class="rounded-xl border border-border-subtle px-4 py-2 text-[13px] font-bold text-ink-body hover:bg-surface-neutral">Masuk</a>
          <a href="{{ route('register') }}" class="rounded-xl bg-primary px-4 py-2 text-[13px] font-bold text-white hover:bg-primary-hover">Daftar Akun</a>
        @endauth
      </nav>
    </div>
  </header>

  <main class="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-2xl bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-border-subtle text-center space-y-6">
      
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-soft text-primary shadow-sm mb-2">
        <span class="material-symbols-outlined text-[36px]">auto_stories</span>
      </div>

      <div class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight text-ink-body">Platform Autentikasi IKAPI Store</h1>
        <p class="text-sm text-ink-muted max-w-md mx-auto">
          Sistem autentikasi terpadu untuk Pembeli, Mitra Penerbit, dan Administrator berbasis Laravel Blade & PostgreSQL.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
        <a href="{{ route('login', ['role' => 'buyer']) }}" class="flex flex-col items-center justify-center p-5 rounded-2xl border border-border-subtle bg-surface-neutral hover:border-primary hover:bg-surface-soft transition-colors">
          <span class="material-symbols-outlined text-[28px] text-primary mb-2">person</span>
          <span class="text-[14px] font-bold text-ink-body">Portal Pembeli</span>
          <span class="text-[12px] text-ink-muted mt-1">Masuk & Baca Buku</span>
        </a>

        <a href="{{ route('login', ['role' => 'publisher']) }}" class="flex flex-col items-center justify-center p-5 rounded-2xl border border-border-subtle bg-surface-neutral hover:border-primary hover:bg-surface-soft transition-colors">
          <span class="material-symbols-outlined text-[28px] text-primary mb-2">menu_book</span>
          <span class="text-[14px] font-bold text-ink-body">Portal Penerbit</span>
          <span class="text-[12px] text-ink-muted mt-1">Kelola & Terbitkan</span>
        </a>

        <a href="{{ route('admin.login') }}" class="flex flex-col items-center justify-center p-5 rounded-2xl border border-border-subtle bg-surface-neutral hover:border-primary-deep hover:bg-surface-soft transition-colors">
          <span class="material-symbols-outlined text-[28px] text-primary-deep mb-2">admin_panel_settings</span>
          <span class="text-[14px] font-bold text-ink-body">Administrator</span>
          <span class="text-[12px] text-ink-muted mt-1">Manajemen Sistem</span>
        </a>
      </div>

      <div class="border-t border-border-subtle pt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-ink-muted">
        <a href="{{ route('register', ['role' => 'buyer']) }}" class="hover:text-primary underline">Pendaftaran Pembeli</a>
        <span>•</span>
        <a href="{{ route('register', ['role' => 'publisher']) }}" class="hover:text-primary underline">Pendaftaran Penerbit (3 Langkah)</a>
        <span>•</span>
        <a href="{{ route('password.request') }}" class="hover:text-primary underline">Lupa Kata Sandi</a>
      </div>

    </div>
  </main>

</body>
</html>
