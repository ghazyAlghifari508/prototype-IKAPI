<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta content="width=device-width, initial-scale=1.0" name="viewport">
  <title>Profil Saya — IKAPI Store Jawa Barat</title>
  <link href="https://fonts.googleapis.com" rel="preconnect">
  <link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
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
    body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; overflow-x: clip; }
    .scrollbar-none::-webkit-scrollbar { display: none; }
    .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
    .focus-ring:focus-visible { outline: 2px solid #673de6; outline-offset: 2px; }
  </style>
</head>
<body class="bg-white font-sans text-ink-body antialiased selection:bg-surface-soft selection:text-primary-deep">

  <!-- GLOBAL HEADER (Consistent with Prototype) -->
  <header class="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-border-subtle shadow-[0_1px_4px_rgba(34,34,37,0.04)]">
    <div class="h-28 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div class="h-16 flex items-center justify-between gap-4">
        <!-- Logo -->
        <div class="flex items-center gap-4 shrink-0">
          <a href="{{ route('home') }}" class="flex items-center gap-2" aria-label="Beranda IKAPI Jawa Barat">
            <img alt="Logo IKAPI Jawa Barat" class="h-7 sm:h-8 w-auto object-contain" src="{{ asset('assets/logo-ikapi-jabar.png') }}" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline'">
            <span class="text-xl font-bold tracking-tight text-primary hidden">IKAPI Store</span>
          </a>
        </div>
        <!-- Search Bar -->
        <div class="flex-1 max-w-xl mx-2 hidden sm:flex items-center">
          <div class="relative w-full">
            <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted text-[20px]">search</span>
            <input class="w-full h-10 pl-10 pr-4 rounded-xl bg-surface-neutral text-[14px] text-ink-body placeholder:text-ink-muted outline-none ring-1 ring-border-subtle focus:ring-2 focus:ring-primary focus:bg-white transition-all" placeholder="Cari judul buku, penulis, atau topik..." type="text">
          </div>
        </div>
        <!-- Right Actions & Dropdown -->
        <div class="flex items-center gap-3 sm:gap-4 shrink-0">
          <a class="relative p-2 rounded-xl text-ink-body hover:text-primary hover:bg-surface-soft transition-colors" href="#" aria-label="Keranjang Belanja">
            <span class="material-symbols-outlined text-[24px]">shopping_bag</span>
            <span class="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">2</span>
          </a>
          <div class="h-6 w-px bg-border-subtle"></div>
          
          <!-- User Profile & Dropdown Trigger -->
          <div class="relative">
            <button id="toggle-dropdown-btn" type="button" aria-expanded="false" aria-haspopup="true" class="flex items-center gap-2.5 p-1.5 pl-2 rounded-full hover:bg-surface-neutral transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
              <div class="w-8 h-8 rounded-full bg-primary text-white font-bold text-[13px] flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                @if ($user->avatar_url)
                  <img src="{{ $user->avatar_url }}" alt="{{ $user->name }}" class="w-full h-full object-cover">
                @else
                  <span>{{ $user->initials }}</span>
                @endif
              </div>
              <span class="hidden md:inline text-[14px] text-ink-body font-semibold max-w-[140px] truncate">{{ $user->name }}</span>
              <span class="material-symbols-outlined text-[18px] text-ink-muted">expand_more</span>
            </button>

            <!-- Dropdown Menu -->
            <div id="header-user-dropdown" class="hidden absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-border-subtle py-2 z-50 transition-all">
              <div class="px-4 py-3 border-b border-border-subtle">
                <p class="text-[14px] font-bold text-ink-body truncate">{{ $user->name }}</p>
                <p class="text-[12px] text-ink-muted truncate">{{ $user->email }}</p>
              </div>
              <div class="py-1 text-[13px]">
                <a href="{{ route('profile.index') }}" class="flex items-center gap-2.5 px-4 py-2 font-bold text-primary bg-surface-soft transition-colors">
                  <span class="material-symbols-outlined text-[18px]">person</span>
                  <span>Profil Saya</span>
                </a>
                <a href="#" class="flex items-center gap-2.5 px-4 py-2 text-ink-body hover:text-primary hover:bg-surface-neutral transition-colors font-medium">
                  <span class="material-symbols-outlined text-[18px]">receipt_long</span>
                  <span>Riwayat Pesanan</span>
                </a>
                <a href="#" class="flex items-center gap-2.5 px-4 py-2 text-ink-body hover:text-primary hover:bg-surface-neutral transition-colors font-medium">
                  <span class="material-symbols-outlined text-[18px]">local_library</span>
                  <span>Perpustakaan Saya</span>
                </a>
                <a href="#" class="flex items-center gap-2.5 px-4 py-2 text-ink-body hover:text-primary hover:bg-surface-neutral transition-colors font-medium">
                  <span class="material-symbols-outlined text-[18px]">rate_review</span>
                  <span>Riwayat Ulasan</span>
                </a>
                <a href="{{ route('profile.index') }}" class="flex items-center gap-2.5 px-4 py-2 text-ink-body hover:text-primary hover:bg-surface-neutral transition-colors font-medium">
                  <span class="material-symbols-outlined text-[18px]">settings</span>
                  <span>Pengaturan Akun</span>
                </a>
              </div>
              <div class="pt-1 border-t border-border-subtle">
                <form method="POST" action="{{ route('logout') }}">
                  @csrf
                  <button type="submit" class="w-full text-left flex items-center gap-2.5 px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors font-semibold">
                    <span class="material-symbols-outlined text-[18px]">logout</span>
                    <span>Keluar Akun</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Primary Nav Tabs -->
      <nav class="h-12 flex items-center gap-6 overflow-x-auto scrollbar-none max-w-full">
        <a class="h-full flex items-center text-[14px] text-ink-muted hover:text-primary transition-colors whitespace-nowrap" href="{{ route('home') }}">Beranda</a>
        <a class="h-full flex items-center text-[14px] text-ink-muted hover:text-primary transition-colors whitespace-nowrap" href="#">Katalog Buku</a>
        <a class="h-full flex items-center text-[14px] text-ink-muted hover:text-primary transition-colors whitespace-nowrap" href="#">Agenda Literasi</a>
        <a class="h-full flex items-center text-[14px] text-ink-muted hover:text-primary transition-colors whitespace-nowrap" href="#">Komunitas Literasi</a>
      </nav>
    </div>
  </header>

  <!-- MAIN ACCOUNT WORKSPACE -->
  <main class="w-full pt-28 bg-white min-h-[calc(100vh-16rem)]">
    <div class="flex flex-col w-full">
      <div class="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 w-full flex flex-col gap-6">

        <!-- Mobile Compact Account Navigation Menu -->
        <details class="lg:hidden group bg-white border border-border-subtle rounded-2xl text-[14px] overflow-hidden shadow-xs">
          <summary class="px-4 py-3 cursor-pointer font-semibold text-ink-body flex items-center justify-between list-none select-none">
            <div class="flex items-center gap-2.5 text-primary">
              <span class="material-symbols-outlined text-[20px]">person</span>
              <span>Menu Akun: Profil Saya</span>
            </div>
            <span class="material-symbols-outlined text-[20px] text-ink-muted transition-transform group-open:rotate-180">expand_more</span>
          </summary>
          <div class="p-3 border-t border-border-subtle bg-surface-neutral flex flex-col gap-1">
            <a href="{{ route('profile.index') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-soft text-primary font-bold">Profil Saya</a>
            <a href="#" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-muted hover:text-ink-body font-medium">Riwayat Pesanan</a>
            <a href="#" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-muted hover:text-ink-body font-medium">Perpustakaan Saya</a>
            <a href="#" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-muted hover:text-ink-body font-medium">Riwayat Ulasan</a>
            <div class="h-px bg-border-subtle my-1"></div>
            <form method="POST" action="{{ route('logout') }}">
              @csrf
              <button type="submit" class="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 font-semibold">Keluar Akun</button>
            </form>
          </div>
        </details>

        <!-- Page Header -->
        <div class="pb-2 border-b border-border-subtle">
          <h1 class="text-[30px] md:text-[34px] font-bold text-ink-body tracking-tight leading-tight">
            Profil Saya
          </h1>
          <p class="text-[15px] text-ink-muted mt-1">
            Kelola informasi pribadi dan preferensi bacaanmu.
          </p>
        </div>

        <!-- 2-COLUMN WORKSPACE: Google Stitch Floating Sidebar + Main Content -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- LEFT FLOATING SIDEBAR -->
          <aside class="hidden lg:block lg:col-span-4 xl:col-span-3">
            <div class="lg:sticky lg:top-36 bg-white rounded-3xl border border-border-subtle shadow-sm p-6 flex flex-col gap-6">
              
              <!-- Mini Profile Identity Header -->
              <div class="flex items-center gap-3.5 pb-5 border-b border-border-subtle">
                <div id="sidebar-avatar" class="w-12 h-12 rounded-full bg-primary text-white font-bold text-[18px] flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                  @if ($user->avatar_url)
                    <img src="{{ $user->avatar_url }}" alt="{{ $user->name }}" class="w-full h-full object-cover">
                  @else
                    <span id="sidebar-avatar-initials">{{ $user->initials }}</span>
                  @endif
                </div>
                <div class="flex flex-col min-w-0">
                  <span id="sidebar-user-name" class="font-bold text-[15px] text-ink-body truncate">{{ $user->name }}</span>
                  <span id="sidebar-user-email" class="text-[12px] text-ink-muted truncate">{{ $user->email }}</span>
                </div>
              </div>

              <!-- Navigation Menu Links -->
              <nav class="flex flex-col gap-1.5 text-[14px]">
                <a href="{{ route('profile.index') }}" class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-surface-soft text-primary font-bold shadow-xs transition-colors">
                  <span class="material-symbols-outlined text-[20px]">person</span>
                  <span>Profil Saya</span>
                </a>
                <a href="#" class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-ink-muted hover:text-ink-body hover:bg-surface-neutral font-medium transition-colors">
                  <span class="material-symbols-outlined text-[20px]">receipt_long</span>
                  <span>Riwayat Pesanan</span>
                </a>
                <a href="#" class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-ink-muted hover:text-ink-body hover:bg-surface-neutral font-medium transition-colors">
                  <span class="material-symbols-outlined text-[20px]">local_library</span>
                  <span>Perpustakaan Saya</span>
                </a>
                <a href="#" class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-ink-muted hover:text-ink-body hover:bg-surface-neutral font-medium transition-colors">
                  <span class="material-symbols-outlined text-[20px]">rate_review</span>
                  <span>Riwayat Ulasan</span>
                </a>
                <a href="{{ route('profile.index') }}" class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-ink-muted hover:text-ink-body hover:bg-surface-neutral font-medium transition-colors">
                  <span class="material-symbols-outlined text-[20px]">settings</span>
                  <span>Pengaturan Akun</span>
                </a>
                <a href="#" class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-ink-muted hover:text-ink-body hover:bg-surface-neutral font-medium transition-colors">
                  <span class="material-symbols-outlined text-[20px]">help</span>
                  <span>Bantuan</span>
                </a>

                <div class="h-px bg-border-subtle my-2"></div>

                <form method="POST" action="{{ route('logout') }}">
                  @csrf
                  <button type="submit" class="w-full text-left flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-red-600 hover:bg-red-50 transition-colors font-semibold">
                    <span class="material-symbols-outlined text-[20px]">logout</span>
                    <span>Keluar Akun</span>
                  </button>
                </form>
              </nav>

            </div>
          </aside>

          <!-- RIGHT MAIN: Profile Form Workspace -->
          <section class="lg:col-span-8 xl:col-span-9 bg-white rounded-3xl border border-border-subtle shadow-sm p-6 sm:p-8 lg:p-10 flex flex-col gap-8">
            
            <!-- Section Header -->
            <div class="pb-3 border-b border-border-subtle">
              <h2 class="text-[22px] sm:text-[24px] font-bold text-ink-body tracking-tight">
                Informasi Profil
              </h2>
              <p class="text-[14px] text-ink-muted mt-1">
                Perbarui nama, foto profil, dan preferensi bacaanmu.
              </p>
            </div>

            <!-- Feedback Notice (Success or Error) -->
            @if (session('status'))
              <div class="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 text-[13.5px]">
                <span class="material-symbols-outlined text-[20px] text-emerald-600 shrink-0 mt-0.5">check_circle</span>
                <span class="font-semibold">{{ session('status') }}</span>
              </div>
            @endif

            @if ($errors->any())
              <div class="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 text-[13.5px]">
                <span class="material-symbols-outlined text-[20px] text-red-600 shrink-0 mt-0.5">error</span>
                <div class="flex-1">
                  <span class="font-bold">Gagal memperbarui profil:</span>
                  <ul class="list-disc list-inside mt-1 space-y-0.5 text-[13px]">
                    @foreach ($errors->all() as $err)
                      <li>{{ $err }}</li>
                    @endforeach
                  </ul>
                </div>
              </div>
            @endif

            <form id="profile-form" method="POST" action="{{ route('profile.update') }}" enctype="multipart/form-data" class="space-y-6">
              @csrf

              <!-- Avatar Upload / Management Block -->
              <div class="flex flex-col sm:flex-row sm:items-center gap-6 p-5 rounded-2xl bg-surface-neutral border border-border-subtle">
                <div class="relative shrink-0 flex items-center justify-center">
                  <div id="form-avatar" class="w-20 h-20 rounded-full bg-primary text-white text-[24px] font-bold flex items-center justify-center shadow-xs overflow-hidden">
                    @if ($user->avatar_url)
                      <img id="form-avatar-image" src="{{ $user->avatar_url }}" alt="{{ $user->name }}" class="w-full h-full object-cover">
                    @else
                      <span id="form-avatar-initials">{{ $user->initials }}</span>
                      <img id="form-avatar-image" src="" alt="{{ $user->name }}" class="w-full h-full object-cover hidden">
                    @endif
                  </div>
                </div>
                <div class="flex flex-col gap-1.5 flex-1">
                  <span class="text-[14px] font-bold text-ink-body">Foto Profil</span>
                  <p class="text-[13px] text-ink-muted">
                    Format berkas: JPG, PNG, atau WebP. Ukuran maksimal 2.0 MB.
                  </p>
                  <div class="flex items-center gap-3 mt-1.5">
                    <label class="cursor-pointer h-9 px-4 rounded-xl bg-white hover:bg-surface-soft border border-border-subtle text-primary font-bold text-[13px] shadow-xs transition-colors flex items-center justify-center gap-1.5">
                      <span class="material-symbols-outlined text-[18px]">upload</span>
                      <span>Ubah Foto</span>
                      <input id="photo-input" name="avatar" type="file" accept="image/png, image/jpeg, image/webp" class="hidden" onchange="previewAvatar(event)">
                    </label>

                    @if ($user->avatar_path)
                      <button id="btn-delete-photo" type="submit" form="delete-avatar-form" class="h-9 px-3 text-ink-muted hover:text-red-600 font-medium text-[13px] transition-colors">
                        Hapus Foto
                      </button>
                    @endif
                  </div>
                </div>
              </div>

              <!-- Profile Fields Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                <!-- Nama Lengkap (Full Width) -->
                <div class="space-y-1.5 md:col-span-2">
                  <label for="full-name" class="block text-[13px] font-bold text-ink-body">
                    Nama Lengkap <span class="text-red-500">*</span>
                  </label>
                  <input id="full-name" name="fullName" type="text" required
                    class="w-full h-11 px-4 bg-surface-neutral rounded-xl text-ink-body text-[14px] outline-none border border-border-subtle focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all"
                    value="{{ old('fullName', $user->name) }}">
                </div>

                <!-- Email (Read-Only Info Display) -->
                <div class="space-y-1.5">
                  <label for="email" class="block text-[13px] font-bold text-ink-body">
                    Alamat Email
                  </label>
                  <input id="email" type="email" readonly
                    class="w-full h-11 px-4 bg-surface-neutral text-ink-muted text-[14px] rounded-xl outline-none border border-border-subtle cursor-not-allowed select-all"
                    value="{{ $user->email }}">
                </div>

                <!-- Nomor WhatsApp / HP -->
                <div class="space-y-1.5">
                  <label for="phone" class="block text-[13px] font-bold text-ink-body">
                    Nomor WhatsApp / HP
                  </label>
                  <input id="phone" name="phone" type="tel"
                    class="w-full h-11 px-4 bg-surface-neutral rounded-xl text-ink-body text-[14px] outline-none border border-border-subtle focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all"
                    value="{{ old('phone', $user->phone) }}" placeholder="Contoh: 081234567890">
                </div>

                <!-- Alamat Pengguna (UC-03 requirement) -->
                <div class="space-y-1.5 md:col-span-2">
                  <label for="address" class="block text-[13px] font-bold text-ink-body">
                    Alamat Lengkap
                  </label>
                  <textarea id="address" name="address" rows="3"
                    class="w-full px-4 py-2.5 bg-surface-neutral rounded-xl text-ink-body text-[14px] outline-none border border-border-subtle focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Contoh: Jl. Braga No. 100, Bandung, Jawa Barat">{{ old('address', $user->address) }}</textarea>
                </div>

                <!-- Kategori Bacaan Favorit (Interactive Selectable Tags) -->
                <div class="space-y-2 md:col-span-2 pt-2">
                  <span class="block text-[13px] font-bold text-ink-body">
                    Kategori Bacaan Favorit
                  </span>
                  <div id="category-chips-container" class="flex flex-wrap gap-2">
                    @foreach ($availableCategories as $cat)
                      @php
                        $isSelected = in_array($cat, (array) old('categories', $selectedCategories));
                      @endphp
                      <button type="button"
                        class="category-chip px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer {{ $isSelected ? 'bg-primary text-white shadow-xs' : 'bg-surface-neutral text-ink-body hover:bg-surface-soft border border-border-subtle' }}"
                        data-category="{{ $cat }}"
                        onclick="toggleCategoryChip(this)">
                        {{ $cat }}
                      </button>
                    @endforeach
                  </div>
                  <!-- Hidden inputs container for selected categories -->
                  <div id="hidden-categories-container">
                    @foreach ((array) old('categories', $selectedCategories) as $cat)
                      <input type="hidden" name="categories[]" value="{{ $cat }}" id="cat-input-{{ Str::slug($cat) }}">
                    @endforeach
                  </div>
                </div>

              </div>

              <!-- Form Action Buttons -->
              <div class="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 pt-4 border-t border-border-subtle">
                <button type="button" class="h-11 px-5 rounded-xl border border-border-subtle bg-white hover:bg-surface-neutral text-ink-body text-[14px] font-semibold transition-colors" onclick="resetForm()">
                  Batal
                </button>
                <button id="btn-save-profile" type="submit" class="h-11 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99] cursor-pointer">
                  <span class="material-symbols-outlined text-[18px]">save</span>
                  <span>Simpan Perubahan</span>
                </button>
              </div>

            </form>

            <!-- Separate delete avatar form -->
            <form id="delete-avatar-form" method="POST" action="{{ route('profile.avatar.delete') }}" class="hidden">
              @csrf
            </form>

          </section>

        </div>

      </div>
    </div>
  </main>

  <!-- TOAST NOTIFICATION -->
  <div id="toast-notification" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-ink-body text-white shadow-xl text-[14px] font-medium border border-white/10">
    <span id="toastIcon" class="material-symbols-outlined text-primary text-[20px]">check_circle</span>
    <span id="toastMessage">Perubahan berhasil disimpan.</span>
  </div>

  <!-- FOOTER -->
  <footer class="w-full bg-[#111111] text-white pt-16 pb-12 border-t border-[#2a2a2a]">
    <div class="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <div class="flex flex-col gap-3">
          <span class="text-[16px] text-white font-bold tracking-tight">Jelajahi</span>
          <ul class="flex flex-col gap-2.5 text-[14px] text-[#b8b8bd]">
            <li><a class="hover:text-white transition-colors" href="#">Katalog Buku</a></li>
            <li><a class="hover:text-white transition-colors" href="#">Kategori Pilihan</a></li>
            <li><a class="hover:text-white transition-colors" href="#">Buku Rilis Terbaru</a></li>
          </ul>
        </div>
        <div class="flex flex-col gap-3">
          <span class="text-[16px] text-white font-bold tracking-tight">Informasi</span>
          <ul class="flex flex-col gap-2.5 text-[14px] text-[#b8b8bd]">
            <li><a class="hover:text-white transition-colors" href="#">Cara Pembelian</a></li>
            <li><a class="hover:text-white transition-colors" href="#">Metode Pembayaran</a></li>
            <li><a class="hover:text-white transition-colors" href="#">Bantuan &amp; FAQ</a></li>
          </ul>
        </div>
        <div class="flex flex-col gap-3">
          <span class="text-[16px] text-white font-bold tracking-tight">Tentang IKAPI</span>
          <ul class="flex flex-col gap-2.5 text-[14px] text-[#b8b8bd]">
            <li><a class="hover:text-white transition-colors" href="#">Tentang Kami</a></li>
            <li><a class="hover:text-white transition-colors" href="#">Anggota Penerbit</a></li>
            <li><a class="hover:text-white transition-colors" href="#">Hubungi Kami</a></li>
          </ul>
        </div>
        <div class="flex flex-col gap-3">
          <span class="text-[16px] text-white font-bold tracking-tight">Lainnya</span>
          <ul class="flex flex-col gap-2.5 text-[14px] text-[#b8b8bd]">
            <li><a class="hover:text-white transition-colors" href="#">Agenda Literasi</a></li>
            <li><a class="hover:text-white transition-colors" href="#">Syarat &amp; Ketentuan</a></li>
            <li><a class="hover:text-white transition-colors" href="#">Kebijakan Privasi</a></li>
          </ul>
        </div>
      </div>

      <div class="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-[#b8b8bd]">
        <p>© 2026 IKAPI Jawa Barat. Seluruh hak cipta dilindungi undang-undang.</p>
        <div class="flex flex-wrap items-center gap-4">
          <span class="text-white/60">Media Sosial:</span>
          <a href="#" class="hover:text-white transition-colors">Instagram</a>
          <a href="#" class="hover:text-white transition-colors">YouTube</a>
          <a href="#" class="hover:text-white transition-colors">Facebook</a>
        </div>
      </div>
    </div>
  </footer>

  <!-- CLIENT SCRIPTS -->
  <script>
    // Header Dropdown Toggle
    const dropdownBtn = document.getElementById('toggle-dropdown-btn');
    const dropdownMenu = document.getElementById('header-user-dropdown');
    if (dropdownBtn && dropdownMenu) {
      dropdownBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('hidden');
      });
      document.addEventListener('click', function() {
        dropdownMenu.classList.add('hidden');
      });
    }

    // Category Chips Toggle
    function slugify(text) {
      return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
    }

    function toggleCategoryChip(button) {
      const category = button.getAttribute('data-category');
      const container = document.getElementById('hidden-categories-container');
      const slug = slugify(category);
      const existingInput = document.getElementById('cat-input-' + slug);

      if (existingInput) {
        // Deselect
        existingInput.remove();
        button.className = "category-chip px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer bg-surface-neutral text-ink-body hover:bg-surface-soft border border-border-subtle";
      } else {
        // Select
        const newInput = document.createElement('input');
        newInput.type = 'hidden';
        newInput.name = 'categories[]';
        newInput.value = category;
        newInput.id = 'cat-input-' + slug;
        container.appendChild(newInput);
        button.className = "category-chip px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer bg-primary text-white shadow-xs";
      }
    }

    // Avatar Preview
    function previewAvatar(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran berkas melebihi 2.0 MB.');
        event.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = function(e) {
        const img = document.getElementById('form-avatar-image');
        const initials = document.getElementById('form-avatar-initials');
        if (img) {
          img.src = e.target.result;
          img.classList.remove('hidden');
        }
        if (initials) {
          initials.classList.add('hidden');
        }
      };
      reader.readAsDataURL(file);
    }

    // Reset Form
    function resetForm() {
      document.getElementById('profile-form').reset();
      window.location.reload();
    }

    // Show toast if session('status') is set
    @if (session('status'))
      (function() {
        const toast = document.getElementById('toast-notification');
        const msg = document.getElementById('toastMessage');
        if (toast && msg) {
          msg.textContent = "{{ session('status') }}";
          toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
          toast.classList.add('translate-y-0', 'opacity-100');
          setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
          }, 3000);
        }
      })();
    @endif
  </script>
</body>
</html>
