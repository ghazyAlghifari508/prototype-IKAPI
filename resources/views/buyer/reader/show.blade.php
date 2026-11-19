{{--
  Browser-only web reader: chapter paging, themes, type settings, bookmarks, TOC. No download, no PDF.
  Source: docs/design/prototype-copy/user/web_reader_desktop.html (917 lines). Markup, classes, ids and copy are verbatim; only links,
  asset URLs and the shell come from the app. See docs/migration/p6-buyer-flows.md.
--}}

@php
    /** Links to screens of later phases resolve to '#' until their route exists: no dead route errors, no fake pages. */
    $links = fn (string $name, array $params = []) => \Illuminate\Support\Facades\Route::has($name) ? route($name, $params) : '#';
@endphp

@extends('layouts.plain')

@push('head')
<style>
@layer utilities {
:root, [data-reader-theme="light"] {
      --reader-canvas: #ffffff;
      --reader-paper: #ffffff;
      --reader-text: #222225;
      --reader-body-text: #222225;
      --reader-muted: #62636b;
      --reader-chrome: #ffffff;
      --reader-border: #e5e7eb;
      --reader-accent: #673de6;
      --reader-hover: #f5f6ff;
      --reader-pill-bg: #f5f6ff;
    }

    [data-reader-theme="sepia"] {
      --reader-canvas: #e8e2d6;
      --reader-paper: #f5eedd;
      --reader-text: #382f29;
      --reader-body-text: #382f29;
      --reader-muted: #62574c;
      --reader-chrome: #faf7ee;
      --reader-border: #d8d0c0;
      --reader-accent: #673de6;
      --reader-hover: #ece4d0;
      --reader-pill-bg: #eaddc2;
    }

    [data-reader-theme="dark"] {
      --reader-canvas: #121316;
      --reader-paper: #1b1c22;
      --reader-text: #f0f0f2;
      --reader-body-text: #e3e3e8;
      --reader-muted: #9d9ea4;
      --reader-chrome: #16171d;
      --reader-border: #2a2c35;
      --reader-accent: #9d99ff;
      --reader-hover: #262832;
      --reader-pill-bg: #2b2d3b;
    }

    @layer base {
      html, body {
        margin: 0;
        padding: 0;
      }
      body {
        overflow-x: clip;
        font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
    }

    .font-reading-serif {
      font-family: 'Literata', Georgia, serif;
    }

    .font-reading-sans {
      font-family: 'DM Sans', 'Plus Jakarta Sans', sans-serif;
    }

    .theme-canvas {
      background-color: var(--reader-canvas);
      color: var(--reader-text);
    }

    .theme-paper {
      background-color: var(--reader-paper);
      color: var(--reader-body-text);
      border-color: var(--reader-border);
    }

    .theme-chrome {
      background-color: var(--reader-chrome);
      color: var(--reader-text);
      border-color: var(--reader-border);
    }

    .theme-border {
      border-color: var(--reader-border);
    }

    .theme-text {
      color: var(--reader-text);
    }

    .theme-muted {
      color: var(--reader-muted);
    }

    .scrollbar-none::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-none {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
}
</style>
@endpush

@section('title', 'Laskar Aksara Pasundan — Web Reader IKAPI Store')

@section('body_class', 'theme-canvas antialiased min-h-screen flex flex-col justify-between transition-colors duration-300')

@section('serif', '1')

@section('content')
  <header class="fixed top-0 left-0 w-full z-40 theme-chrome border-b transition-colors duration-300 shadow-xs">
      <div class="h-16 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 font-sans">

        <!-- Back to Library -->
        <div class="flex items-center gap-3 shrink-0">
          <a href="{{ $links('library') }}" data-path="reader-library" class="inline-flex items-center gap-1.5 text-[13.5px] font-semibold theme-text hover:text-primary transition-colors">
            <span class="material-symbols-outlined text-[20px]">arrow_back</span>
            <span class="hidden sm:inline">Perpustakaan Saya</span>
          </a>
        </div>

        <!-- Center Title and Author -->
        <div class="flex flex-col items-center justify-center text-center min-w-0 flex-1 truncate px-2">
          <h1 class="font-bold text-[14px] sm:text-[15px] theme-text truncate max-w-xs md:max-w-md">
            Laskar Aksara Pasundan
          </h1>
          <span class="text-[12px] theme-muted truncate">Ayi R. Kurnia • E-Book Berlisensi</span>
        </div>

        <!-- Controls: TOC, Bookmark, Settings, Fullscreen -->
        <div class="flex items-center gap-1.5 shrink-0">
          <button id="btn-open-toc" type="button" data-path="reader-toc" aria-label="Daftar Isi" class="w-9 h-9 rounded-xl flex items-center justify-center theme-muted hover:theme-text hover:bg-[#0000000d] dark:hover:bg-[#ffffff0d] transition-colors cursor-pointer" title="Daftar Isi" onclick="openDrawer('drawer-toc')">
            <span class="material-symbols-outlined text-[20px]">menu_book</span>
          </button>
          <button id="btn-open-bookmarks" type="button" data-path="reader-bookmarks" aria-label="Penanda Buku" class="w-9 h-9 rounded-xl flex items-center justify-center theme-muted hover:theme-text hover:bg-[#0000000d] dark:hover:bg-[#ffffff0d] transition-colors cursor-pointer" title="Penanda Buku" onclick="openDrawer('drawer-bookmarks')">
            <span class="material-symbols-outlined text-[20px]">bookmarks</span>
          </button>
          <button id="btn-open-settings" type="button" data-path="reader-settings" aria-label="Pengaturan Tampilan" class="w-9 h-9 rounded-xl flex items-center justify-center theme-muted hover:theme-text hover:bg-[#0000000d] dark:hover:bg-[#ffffff0d] transition-colors cursor-pointer" title="Pengaturan Tampilan" onclick="openDrawer('drawer-settings')">
            <span class="material-symbols-outlined text-[20px]">tune</span>
          </button>
          <button id="btn-toggle-fullscreen" type="button" aria-label="Layar Penuh" class="w-9 h-9 rounded-xl flex items-center justify-center theme-muted hover:theme-text hover:bg-[#0000000d] dark:hover:bg-[#ffffff0d] transition-colors cursor-pointer" title="Layar Penuh" onclick="toggleFullscreen()">
            <span id="fullscreen-icon" class="material-symbols-outlined text-[20px]">fullscreen</span>
          </button>
        </div>

      </div>
    </header>
  <main class="w-full min-h-screen pt-28 pb-28 flex-1 flex flex-col items-center justify-start px-4 sm:px-6 md:px-8">

      <!-- Floating Toast Notification -->
      <div id="reader-toast" class="fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 transform -translate-y-6 opacity-0 pointer-events-none font-sans">
        <div id="toast-inner" class="flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-xl bg-ink-body text-white text-[13px] font-medium border border-[#ffffff1a]">
          <span id="toast-icon" class="material-symbols-outlined text-primary-accent text-[18px]">info</span>
          <span id="toast-message">Halaman berhasil ditandai.</span>
        </div>
      </div>

      <!-- BOOK PAGE / PAPER CONTAINER (Unwrapped, directly on white canvas) -->
      <article id="book-page" class="w-full max-w-3xl theme-paper transition-all duration-300 py-2">

        <!-- Top Running Header -->
        <div class="flex items-center justify-between border-b theme-border pb-3 mb-8 text-[12.5px] theme-muted font-sans tracking-wide">
          <span class="truncate">Laskar Aksara Pasundan</span>
          <span id="running-chapter-label" class="shrink-0 ml-2 font-bold text-primary">Bab 3</span>
        </div>

        <!-- Dynamic Chapter Content Area -->
        <div id="prose-content" class="space-y-6 text-[18px] leading-[1.8] text-left transition-all duration-200 font-reading-serif">
          <!-- Content injected by JavaScript -->
        </div>

        <!-- Page Bottom Indicator in Paper -->
        <div class="mt-10 pt-4 border-t theme-border flex items-center justify-between text-[12.5px] theme-muted font-sans">
          <span id="footer-chapter-name">Bab 3: Hulu Cimanuk</span>
          <span id="footer-page-number" class="font-mono font-bold theme-text">Hal 41</span>
        </div>

      </article>
    </main>
  <footer aria-label="Kontrol Membaca &amp; Navigasi Halaman" class="fixed bottom-0 left-0 w-full theme-chrome border-t px-4 sm:px-6 py-2.5 z-40 transition-colors duration-300 shadow-xs font-sans">
      <div class="max-w-3xl mx-auto flex flex-col gap-1.5">

        <!-- Navigation Row -->
        <div class="flex items-center justify-between gap-4">
          <!-- Prev Button -->
          <button id="btn-prev-page" type="button" class="inline-flex items-center gap-1 text-[13px] font-bold theme-text hover:text-primary transition-colors py-1.5 px-3 rounded-xl hover:bg-[#0000000d] dark:hover:bg-[#ffffff0d] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer" onclick="changePage(-1)">
            <span class="material-symbols-outlined text-[18px]">chevron_left</span>
            <span class="hidden sm:inline">Sebelumnya</span>
          </button>

          <!-- Center Counter Status -->
          <div class="flex items-center gap-2 text-center">
            <span id="page-indicator" class="font-bold text-[13px] sm:text-[14px] theme-text">
              Halaman 41 dari 44
            </span>
            <span id="progress-percent" class="text-[12px] font-bold text-primary">
              (16% dari buku)
            </span>
          </div>

          <!-- Next Button -->
          <button id="btn-next-page" type="button" class="inline-flex items-center gap-1 text-[13px] font-bold theme-text hover:text-primary transition-colors py-1.5 px-3 rounded-xl hover:bg-[#0000000d] dark:hover:bg-[#ffffff0d] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer" onclick="changePage(1)">
            <span class="hidden sm:inline">Berikutnya</span>
            <span class="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>

        <!-- Scrubbable Progress Bar -->
        <div class="w-full flex items-center gap-2.5 pt-0.5">
          <span id="progress-min-label" class="text-[11px] font-mono theme-muted">41</span>
          <div class="relative flex-1 h-2 bg-[#0000001a] dark:bg-[#ffffff1a] rounded-full overflow-hidden cursor-pointer" onclick="handleScrub(event)">
            <div id="progress-bar-fill" class="h-full bg-primary rounded-full transition-all duration-300" style="width: 25%;"></div>
          </div>
          <span id="progress-max-label" class="text-[11px] font-mono theme-muted">44</span>
        </div>

      </div>
    </footer>
@endsection

@push('overlays')
  <div id="drawer-backdrop" class="fixed inset-0 bg-[#00000080] z-40 transition-opacity hidden" onclick="closeAllDrawers()"></div>

  <div id="drawer-bookmarks" class="fixed inset-y-0 right-0 w-full sm:w-96 theme-chrome border-l shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col translate-x-full hidden font-sans">
      <!-- Header -->
      <div class="p-4 border-b theme-border flex items-center justify-between">
        <div class="flex items-center gap-2 theme-text">
          <span class="material-symbols-outlined text-[20px] text-primary">bookmarks</span>
          <h2 class="font-bold text-[16px]">Penanda Buku</h2>
        </div>
        <button type="button" aria-label="Tutup Penanda Buku" class="w-8 h-8 rounded-xl flex items-center justify-center theme-muted hover:theme-text hover:bg-[#0000000d] dark:hover:bg-[#ffffff0d] transition-colors cursor-pointer" onclick="closeAllDrawers()">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <!-- Quick Action to Bookmark Current Page -->
      <div class="p-4 border-b theme-border flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
        <div>
          <p class="text-[13px] theme-text font-semibold">Halaman <span id="bm-current-page" class="text-primary font-bold">41</span></p>
          <p class="text-[11px] theme-muted" id="bm-current-chapter">Bab 3: Hulu Cimanuk</p>
        </div>
        <button type="button" class="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-[12px] font-bold flex items-center gap-1 transition-colors shadow-xs cursor-pointer" onclick="addCurrentBookmark()">
          <span class="material-symbols-outlined text-[16px]">bookmark_add</span>
          <span>+ Tandai</span>
        </button>
      </div>

      <!-- Bookmark Items List -->
      <div class="flex-1 overflow-y-auto p-4 space-y-2.5">
        <p id="bm-count-heading" class="text-[11px] theme-muted uppercase tracking-wider font-semibold">
          2 penanda tersimpan
        </p>
        <div id="bookmarks-list-container" class="space-y-2">
          <!-- Rendered by JS -->
        </div>
      </div>
    </div>

  <div id="drawer-settings" class="fixed inset-y-0 right-0 w-full sm:w-96 theme-chrome border-l shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col translate-x-full hidden font-sans">
      <div class="p-4 border-b theme-border flex items-center justify-between">
        <div class="flex items-center gap-2 theme-text">
          <span class="material-symbols-outlined text-[20px] text-primary">tune</span>
          <h2 class="font-bold text-[16px]">Pengaturan Tampilan</h2>
        </div>
        <button type="button" aria-label="Tutup Pengaturan" class="w-8 h-8 rounded-xl flex items-center justify-center theme-muted hover:theme-text hover:bg-[#0000000d] dark:hover:bg-[#ffffff0d] transition-colors cursor-pointer" onclick="closeAllDrawers()">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <div class="p-5 space-y-6 flex-1 overflow-y-auto">

        <!-- Theme Color Selector -->
        <div>
          <label class="font-bold text-[13px] theme-text block mb-2">Tema Kertas</label>
          <div class="grid grid-cols-3 gap-2">
            <!-- Light (Default) -->
            <button id="theme-btn-light" type="button" class="flex flex-col items-center gap-1 p-2.5 rounded-xl border border-primary bg-white text-gray-900 transition-all shadow-xs cursor-pointer" onclick="setReaderTheme('light')">
              <span class="w-5 h-5 rounded-full bg-white border border-gray-300"></span>
              <span class="text-[12px] font-bold">Putih (Terang)</span>
            </button>
            <!-- Sepia -->
            <button id="theme-btn-sepia" type="button" class="flex flex-col items-center gap-1 p-2.5 rounded-xl border border-transparent bg-[#F5EEDD] text-[#382F29] transition-all hover:border-[#D5CDBC] cursor-pointer" onclick="setReaderTheme('sepia')">
              <span class="w-5 h-5 rounded-full bg-[#F5EEDD] border border-[#D5CDBC]"></span>
              <span class="text-[12px] font-medium">Sepia</span>
            </button>
            <!-- Dark -->
            <button id="theme-btn-dark" type="button" class="flex flex-col items-center gap-1 p-2.5 rounded-xl border border-transparent bg-[#1B1C22] text-gray-100 transition-all hover:border-gray-600 cursor-pointer" onclick="setReaderTheme('dark')">
              <span class="w-5 h-5 rounded-full bg-[#1B1C22] border border-gray-600"></span>
              <span class="text-[12px] font-medium">Malam (Gelap)</span>
            </button>
          </div>
        </div>

        <!-- Font Type (Serif vs Sans) -->
        <div>
          <label class="font-bold text-[13px] theme-text block mb-2">Jenis Huruf</label>
          <div class="grid grid-cols-2 gap-2">
            <button id="font-family-serif" type="button" class="py-2.5 px-3 rounded-xl border border-primary bg-[#673de61a] text-primary font-bold text-[13px] font-reading-serif cursor-pointer" onclick="setFontFamily('serif')">
              Literata (Serif)
            </button>
            <button id="font-family-sans" type="button" class="py-2.5 px-3 rounded-xl border theme-border text-ink-muted hover:theme-text font-semibold text-[13px] font-sans cursor-pointer" onclick="setFontFamily('sans')">
              DM Sans
            </button>
          </div>
        </div>

        <!-- Font Size Selector -->
        <div>
          <label class="font-bold text-[13px] theme-text block mb-2">Ukuran Huruf</label>
          <div class="grid grid-cols-3 gap-2">
            <button id="btn-font-sm" type="button" class="py-2 px-2.5 rounded-xl border theme-border text-[12px] font-medium theme-text hover:bg-[#0000000d] dark:hover:bg-[#ffffff0d] transition-colors cursor-pointer" onclick="setTextSize('16px')">
              A− Kecil
            </button>
            <button id="btn-font-md" type="button" class="py-2 px-2.5 rounded-xl border border-primary bg-primary text-white text-[12px] font-bold shadow-xs cursor-pointer" onclick="setTextSize('18px')">
              A Sedang
            </button>
            <button id="btn-font-lg" type="button" class="py-2 px-2.5 rounded-xl border theme-border text-[12px] font-medium theme-text hover:bg-[#0000000d] dark:hover:bg-[#ffffff0d] transition-colors cursor-pointer" onclick="setTextSize('22px')">
              A+ Besar
            </button>
          </div>
        </div>

        <!-- Line Height Selector -->
        <div>
          <label class="font-bold text-[13px] theme-text block mb-2">Jarak Antarbaris</label>
          <div class="grid grid-cols-3 gap-2">
            <button id="btn-line-normal" type="button" class="py-2 px-2 rounded-xl border theme-border text-[12px] font-medium theme-text hover:bg-[#0000000d] dark:hover:bg-[#ffffff0d] transition-colors cursor-pointer" onclick="setLineHeight('1.6')">
              Normal (1.6)
            </button>
            <button id="btn-line-relaxed" type="button" class="py-2 px-2 rounded-xl border border-primary bg-primary text-white text-[12px] font-bold shadow-xs cursor-pointer" onclick="setLineHeight('1.8')">
              Nyaman (1.8)
            </button>
            <button id="btn-line-loose" type="button" class="py-2 px-2 rounded-xl border theme-border text-[12px] font-medium theme-text hover:bg-[#0000000d] dark:hover:bg-[#ffffff0d] transition-colors cursor-pointer" onclick="setLineHeight('2.0')">
              Renggang (2.0)
            </button>
          </div>
        </div>

      </div>
    </div>

  <div id="drawer-toc" class="fixed inset-y-0 left-0 w-full sm:w-96 theme-chrome border-r shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col -translate-x-full hidden font-sans">
      <div class="p-4 border-b theme-border flex items-center justify-between">
        <div class="flex items-center gap-2 theme-text">
          <span class="material-symbols-outlined text-[20px] text-primary">menu_book</span>
          <h2 class="font-bold text-[16px]">Daftar Isi Buku</h2>
        </div>
        <button type="button" aria-label="Tutup Daftar Isi" class="w-8 h-8 rounded-xl flex items-center justify-center theme-muted hover:theme-text hover:bg-[#0000000d] dark:hover:bg-[#ffffff0d] transition-colors cursor-pointer" onclick="closeAllDrawers()">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-2">
        <button type="button" class="toc-item w-full text-left p-3.5 rounded-2xl bg-surface-soft border border-[#673de633] flex items-center justify-between cursor-pointer" onclick="navigateToChapter(41)">
          <div>
            <p class="text-[11px] text-primary font-bold uppercase">Bab 3 (Aktif)</p>
            <p class="text-[13px] theme-text font-bold leading-tight mt-0.5">Menelusuri Jejak Aksara Kuno di Hulu Cimanuk</p>
          </div>
          <span class="text-[12px] font-mono text-primary font-bold">Hal 41</span>
        </button>
        <button type="button" class="toc-item w-full text-left p-3.5 rounded-2xl hover:bg-[#0000000d] dark:hover:bg-[#ffffff0d] transition-colors flex items-center justify-between cursor-pointer border border-transparent" onclick="navigateToChapter(43)">
          <div>
            <p class="text-[11px] theme-muted font-bold uppercase">Bab 3 — Bagian 2</p>
            <p class="text-[13px] theme-text font-bold leading-tight mt-0.5">Malam di Pondok Ki Warsa</p>
          </div>
          <span class="text-[12px] font-mono theme-muted">Hal 43</span>
        </button>
      </div>
    </div>

  <div id="modal-unlicensed" role="dialog" aria-modal="true" class="fixed inset-0 bg-[#00000099] backdrop-blur-xs z-50 flex items-center justify-center p-4 hidden font-sans">
      <div class="w-full max-w-md theme-chrome rounded-3xl shadow-2xl p-6 sm:p-8 text-center space-y-4 border theme-border">
        <div class="w-14 h-14 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center">
          <span class="material-symbols-outlined text-[32px]">lock</span>
        </div>
        <div class="space-y-1">
          <h3 class="text-[20px] font-bold theme-text">Buku Tidak Dapat Dibuka</h3>
          <p class="text-[14px] theme-muted leading-relaxed max-w-xs mx-auto">
            Akun ini belum memiliki akses untuk membaca buku tersebut.
          </p>
        </div>
        <div class="flex flex-col gap-2.5 pt-2">
          <a href="{{ $links('books.show', ['book' => 'laskar-aksara-pasundan']) }}" class="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-[14px] transition-colors shadow-xs">
            Lihat Buku di Katalog
          </a>
          <a href="{{ $links('library') }}" class="w-full py-2 px-4 rounded-xl border theme-border theme-text hover:bg-[#0000000d] dark:hover:bg-[#ffffff0d] font-semibold text-[13px] transition-colors">
            Kembali ke Perpustakaan
          </a>
        </div>
      </div>
    </div>
@endpush

@push('head')
<script>
window.IKAPI_P6_DATA = @json(['bookPagesData' => $reader['pages'], 'bookmarksData' => $reader['bookmarks']],);
</script>
@endpush
