{{--
  Review history: list, sort, edit modal, delete confirmation (demo localStorage reviews).
  Source: docs/design/prototype-copy/user/riwayat_ulasan_desktop.html (819 lines). Markup, classes, ids and copy are verbatim; only links,
  asset URLs and the shell come from the app. See docs/migration/p6-buyer-flows.md.
--}}

@php
    /** Links to screens of later phases resolve to '#' until their route exists: no dead route errors, no fake pages. */
    $links = fn (string $name, array $params = []) => \Illuminate\Support\Facades\Route::has($name) ? route($name, $params) : '#';
@endphp

@extends('layouts.public')

@push('head')
<style>
@layer utilities {
:root {
      --color-primary: #673de6;
      --color-primary-hover: #5025d1;
      --color-primary-deep: #2f1c6a;
      --color-canvas: #ffffff;
      --color-surface-soft: #f5f6ff;
      --color-surface-neutral: #f5f5f6;
      --color-text-primary: #222225;
      --color-text-secondary: #62636b;
      --color-border: #e5e7eb;
    }
    @layer base {
      html, body {
        margin: 0;
        padding: 0;
        background-color: #ffffff;
        color: #222225;
        font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      body {
        overflow-x: clip;
      }
      main > :first-child {
        margin-top: 0 !important;
      }
      main > :last-child {
        margin-bottom: 0 !important;
      }
    }
    .scrollbar-none::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-none {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    /* Star rating interactive styling */
    .edit-star-btn {
      color: #d1d5db;
      transition: color 0.15s ease, transform 0.15s ease;
    }
    .edit-star-btn.is-active {
      color: #f59e0b;
    }
}
</style>
@endpush

@section('title', 'Riwayat Ulasan — IKAPI Store Jawa Barat')

@section('header_z', 'z-40')

@section('account', 'member')

@section('cart_count', '2')

@section('search_placeholder', 'Cari judul buku, penulis, atau topik...')

@section('identity_ids', '1')

@section('main_pt', 'pt-28')

@section('main_class', 'min-h-[calc(100vh-16rem)]')

@section('content')
  <div class="flex flex-col w-full">
    <div class="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 w-full flex flex-col gap-6">

      <!-- Mobile Compact Account Navigation Menu -->
      <details class="lg:hidden group bg-white border border-border-subtle rounded-2xl text-[14px] overflow-hidden shadow-xs">
        <summary class="px-4 py-3 cursor-pointer font-semibold text-ink-body flex items-center justify-between list-none select-none">
          <div class="flex items-center gap-2.5 text-primary">
            <span class="material-symbols-outlined text-[20px]">rate_review</span>
            <span>Menu Akun: Riwayat Ulasan</span>
          </div>
          <span class="material-symbols-outlined text-[20px] text-ink-muted transition-transform group-open:rotate-180">expand_more</span>
        </summary>
        <div class="p-3 border-t border-border-subtle bg-surface-neutral flex flex-col gap-1">
          <a href="{{ $links('profile.show') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-muted hover:text-ink-body font-medium">Profil Saya</a>
          <a href="{{ $links('orders') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-muted hover:text-ink-body font-medium">Riwayat Pesanan</a>
          <a href="{{ $links('library') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-muted hover:text-ink-body font-medium">Perpustakaan Saya</a>
          <a href="{{ $links('reviews') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-soft text-primary font-bold">Riwayat Ulasan</a>
          <a href="{{ $links('profile.settings') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-muted hover:text-ink-body font-medium">Pengaturan Akun</a>
          <a href="{{ $links('help') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-muted hover:text-ink-body font-medium">Bantuan</a>
          <div class="h-px bg-border-subtle my-1"></div>
          <a href="{{ $links('login') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 font-semibold">Keluar Akun</a>
        </div>
      </details>

      <!-- Page Header -->
      <div class="pb-2 border-b border-border-subtle">
        <h1 class="text-[30px] md:text-[34px] font-bold text-ink-body tracking-tight leading-tight">
          Riwayat Ulasan
        </h1>
        <p class="text-[14px] sm:text-[15px] text-ink-muted mt-1">
          Lihat dan kelola penilaian serta ulasan buku yang pernah kamu tulis.
        </p>
      </div>

      <!-- 2-COLUMN WORKSPACE: Google Stitch Floating Sidebar + Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        <!-- LEFT FLOATING SIDEBAR (Independent Rounded Panel) -->
        <aside class="hidden lg:block lg:col-span-4 xl:col-span-3">
          <div class="lg:sticky lg:top-36 bg-white rounded-3xl border border-border-subtle shadow-sm p-6 flex flex-col gap-6">

            <!-- Mini Profile Identity Header -->
            <div class="flex items-center gap-3.5 pb-5 border-b border-border-subtle">
              <div id="sidebar-avatar" class="w-12 h-12 rounded-full bg-primary text-white font-bold text-[18px] flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                <span id="sidebar-avatar-initials">AH</span>
              </div>
              <div class="flex flex-col min-w-0">
                <span id="sidebar-user-name" class="font-bold text-[15px] text-ink-body truncate">Ahmad Hidayat</span>
                <span id="sidebar-user-email" class="text-[12px] text-ink-muted truncate">ahmad.hidayat@literasi.id</span>
              </div>
            </div>

            <!-- Navigation Menu Links (Updated: Buku Favorit removed, Riwayat Ulasan & Bantuan present) -->
            <nav class="flex flex-col gap-1.5 text-[14px]">
              <a href="{{ $links('profile.show') }}" class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-ink-muted hover:text-ink-body hover:bg-surface-neutral font-medium transition-colors">
                <span class="material-symbols-outlined text-[20px]">person</span>
                <span>Profil Saya</span>
              </a>
              <a href="{{ $links('orders') }}" class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-ink-muted hover:text-ink-body hover:bg-surface-neutral font-medium transition-colors">
                <span class="material-symbols-outlined text-[20px]">receipt_long</span>
                <span>Riwayat Pesanan</span>
              </a>
              <a href="{{ $links('library') }}" class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-ink-muted hover:text-ink-body hover:bg-surface-neutral font-medium transition-colors">
                <span class="material-symbols-outlined text-[20px]">local_library</span>
                <span>Perpustakaan Saya</span>
              </a>
              <a href="{{ $links('reviews') }}" class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-surface-soft text-primary font-bold shadow-xs transition-colors">
                <span class="material-symbols-outlined text-[20px]">rate_review</span>
                <span>Riwayat Ulasan</span>
              </a>
              <a href="{{ $links('profile.settings') }}" class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-ink-muted hover:text-ink-body hover:bg-surface-neutral font-medium transition-colors">
                <span class="material-symbols-outlined text-[20px]">settings</span>
                <span>Pengaturan Akun</span>
              </a>
              <a href="{{ $links('help') }}" class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-ink-muted hover:text-ink-body hover:bg-surface-neutral font-medium transition-colors">
                <span class="material-symbols-outlined text-[20px]">help</span>
                <span>Bantuan</span>
              </a>

              <div class="h-px bg-border-subtle my-2"></div>

              <a href="{{ $links('login') }}" class="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-red-600 hover:bg-red-50 transition-colors font-semibold">
                <span class="material-symbols-outlined text-[20px]">logout</span>
                <span>Keluar Akun</span>
              </a>
            </nav>

          </div>
        </aside>

        <!-- RIGHT MAIN: Review History Workspace -->
        <section class="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">

          <!-- Controls Bar: Count and Sorting -->
          <div class="flex items-center justify-between pb-2 border-b border-border-subtle">
            <span id="review-total-count" class="text-[14px] font-bold text-ink-body">
              2 Ulasan Ditulis
            </span>
            <div class="flex items-center gap-2 text-[13px] text-ink-muted">
              <span>Urutkan:</span>
              <select id="review-sort-select" class="bg-surface-neutral text-ink-body text-[13px] font-semibold rounded-xl py-1.5 px-3 border border-border-subtle focus:border-primary focus:bg-white focus:outline-none cursor-pointer" onchange="handleSortReviews()">
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="rating_high">Rating Tertinggi</option>
                <option value="rating_low">Rating Terendah</option>
              </select>
            </div>
          </div>

          <!-- Review Cards List Container -->
          <div id="reviews-list-container" class="flex flex-col gap-4">
            <!-- Rendered dynamically by renderReviewList() -->
          </div>

          <!-- Empty State for Reviews -->
          <div id="reviews-empty-state" class="hidden p-10 sm:p-14 rounded-3xl bg-white border border-border-subtle shadow-xs text-center flex-col items-center justify-center gap-3">
            <div class="w-36 aspect-square flex items-center justify-center mb-1">
              <img src="{{ asset('assets/ikapi/ilustration/notfoundil.png') }}" alt="Belum Ada Ulasan" class="w-full h-full object-contain">
            </div>
            <h3 class="text-[19px] font-bold text-ink-body">Belum Ada Ulasan</h3>
            <p class="text-[13.5px] text-ink-muted max-w-sm">
              Ulasan dan penilaian bintang buku yang kamu tulis akan muncul di sini.
            </p>
            <a href="{{ $links('library') }}" class="mt-2 inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white text-[13.5px] font-bold transition-all shadow-xs">
              <span>Lihat Koleksi Buku</span>
              <span class="material-symbols-outlined text-[17px]">arrow_forward</span>
            </a>
          </div>

        </section>

      </div>

    </div>
  </div>
@endsection

@push('overlays')
  <div id="modal-edit-review" class="fixed inset-0 z-50 hidden items-center justify-center p-4 bg-[#00000099] backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="edit-review-modal-title">
      <div class="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-border-subtle flex flex-col animate-in fade-in zoom-in-95 duration-200">

        <!-- Modal Header -->
        <div class="p-5 sm:p-6 border-b border-border-subtle flex items-center justify-between">
          <div>
            <h3 id="edit-review-modal-title" class="text-[17px] font-bold text-ink-body">
              Edit Ulasan Buku
            </h3>
            <p id="edit-modal-book-title" class="text-[13px] text-ink-muted mt-0.5">
              Laskar Aksara Pasundan
            </p>
          </div>
          <button type="button" onclick="closeEditModal()" class="w-8 h-8 rounded-full bg-surface-neutral hover:bg-border-subtle text-ink-body flex items-center justify-center transition-colors cursor-pointer" aria-label="Tutup">
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <!-- Modal Form -->
        <form class="p-5 sm:p-6 space-y-5" onsubmit="handleSaveEditedReview(event)">
          <!-- Star Rating Input -->
          <div class="space-y-1.5">
            <label class="block text-[13px] font-bold text-ink-body">Penilaian Bintang</label>
            <div id="edit-stars-container" class="flex items-center gap-1.5">
              <button type="button" class="edit-star-btn p-1 cursor-pointer" data-star="1" onclick="selectEditRating(1)">
                <span class="material-symbols-outlined text-[28px]">star</span>
              </button>
              <button type="button" class="edit-star-btn p-1 cursor-pointer" data-star="2" onclick="selectEditRating(2)">
                <span class="material-symbols-outlined text-[28px]">star</span>
              </button>
              <button type="button" class="edit-star-btn p-1 cursor-pointer" data-star="3" onclick="selectEditRating(3)">
                <span class="material-symbols-outlined text-[28px]">star</span>
              </button>
              <button type="button" class="edit-star-btn p-1 cursor-pointer" data-star="4" onclick="selectEditRating(4)">
                <span class="material-symbols-outlined text-[28px]">star</span>
              </button>
              <button type="button" class="edit-star-btn p-1 cursor-pointer" data-star="5" onclick="selectEditRating(5)">
                <span class="material-symbols-outlined text-[28px]">star</span>
              </button>
              <span id="edit-stars-label" class="text-[13px] font-bold text-ink-body ml-2">5 Bintang</span>
            </div>
          </div>

          <!-- Review Comment Text -->
          <div class="space-y-1.5">
            <label for="edit-comment-input" class="block text-[13px] font-bold text-ink-body">Isi Ulasan</label>
            <textarea id="edit-comment-input" rows="4" class="w-full p-3.5 rounded-2xl bg-surface-neutral border border-border-subtle text-ink-body text-[14px] placeholder:text-ink-muted focus:outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-[#673de633] transition-all resize-none leading-relaxed" placeholder="Tuliskan pengalaman atau ulasan membacamu..."></textarea>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-border-subtle">
            <button type="button" class="h-10 px-4 rounded-xl border border-border-subtle bg-white hover:bg-surface-neutral text-ink-body text-[13px] font-semibold transition-colors" onclick="closeEditModal()">
              Batal
            </button>
            <button type="submit" class="h-10 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white text-[13px] font-bold transition-all shadow-xs cursor-pointer">
              Simpan Ulasan
            </button>
          </div>
        </form>

      </div>
    </div>

  <div id="modal-delete-confirm" class="fixed inset-0 z-50 hidden items-center justify-center p-4 bg-[#00000099] backdrop-blur-sm" role="dialog" aria-modal="true">
      <div class="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-border-subtle animate-in fade-in zoom-in-95 duration-200">
        <div class="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <span class="material-symbols-outlined text-[26px]">delete</span>
        </div>
        <div class="space-y-1">
          <h3 class="text-[17px] font-bold text-ink-body">Hapus Ulasan?</h3>
          <p class="text-[13px] text-ink-muted max-w-xs mx-auto">
            Penilaian dan ulasan untuk buku ini akan dihapus dari riwayat akun Anda.
          </p>
        </div>
        <div class="flex items-center justify-center gap-2 pt-2">
          <button type="button" class="flex-1 h-10 px-4 rounded-xl border border-border-subtle bg-white hover:bg-surface-neutral text-ink-body text-[13px] font-semibold transition-colors" onclick="closeDeleteModal()">
            Batal
          </button>
          <button id="btn-confirm-delete" type="button" class="flex-1 h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[13px] font-bold transition-colors cursor-pointer">
            Hapus Ulasan
          </button>
        </div>
      </div>
    </div>

  <div id="toast" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-ink-body text-white shadow-xl text-[14px] font-medium border border-[#ffffff1a]">
      <span id="toast-icon" class="material-symbols-outlined text-primary-accent text-[20px]">check_circle</span>
      <span id="toast-message">Tindakan berhasil dilakukan</span>
    </div>
@endpush

@push('head')
<script>
window.IKAPI_P6_DATA = @json(['initialUserReviews' => $reviews]);
</script>
@endpush
