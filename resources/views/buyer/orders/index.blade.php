{{--
  Order history with status tabs and an order-detail modal fed by the prototype order seed.
  Source: docs/design/prototype-copy/user/riwayat_pesanan_desktop.html (887 lines). Markup, classes, ids and copy are verbatim; only links,
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
}
</style>
@endpush

@section('title', 'Riwayat Pesanan — IKAPI Store Jawa Barat')

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
            <span class="material-symbols-outlined text-[20px]">receipt_long</span>
            <span>Menu Akun: Riwayat Pesanan</span>
          </div>
          <span class="material-symbols-outlined text-[20px] text-ink-muted transition-transform group-open:rotate-180">expand_more</span>
        </summary>
        <div class="p-3 border-t border-border-subtle bg-surface-neutral flex flex-col gap-1">
          <a href="{{ $links('profile.show') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-muted hover:text-ink-body font-medium">Profil Saya</a>
          <a href="{{ $links('orders') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-soft text-primary font-bold">Riwayat Pesanan</a>
          <a href="{{ $links('library') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-muted hover:text-ink-body font-medium">Perpustakaan Saya</a>
          <a href="{{ $links('reviews') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-muted hover:text-ink-body font-medium">Riwayat Ulasan</a>
          <a href="{{ $links('profile.settings') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-muted hover:text-ink-body font-medium">Pengaturan Akun</a>
          <a href="{{ $links('help') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-muted hover:text-ink-body font-medium">Bantuan</a>
          <div class="h-px bg-border-subtle my-1"></div>
          <a href="{{ $links('login') }}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 font-semibold">Keluar Akun</a>
        </div>
      </details>

      <!-- Page Header -->
      <div class="pb-2 border-b border-border-subtle">
        <h1 class="text-[30px] md:text-[34px] font-bold text-ink-body tracking-tight leading-tight">
          Riwayat Pesanan
        </h1>
        <p class="text-[15px] text-ink-muted mt-1">
          Lihat status dan rincian pembelian e-book kamu.
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

            <!-- Navigation Menu Links -->
            <nav class="flex flex-col gap-1.5 text-[14px]">
              <a href="{{ $links('profile.show') }}" class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-ink-muted hover:text-ink-body hover:bg-surface-neutral font-medium transition-colors">
                <span class="material-symbols-outlined text-[20px]">person</span>
                <span>Profil Saya</span>
              </a>
              <a href="{{ $links('orders') }}" class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-surface-soft text-primary font-bold shadow-xs transition-colors">
                <span class="material-symbols-outlined text-[20px]">receipt_long</span>
                <span>Riwayat Pesanan</span>
              </a>
              <a href="{{ $links('library') }}" class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-ink-muted hover:text-ink-body hover:bg-surface-neutral font-medium transition-colors">
                <span class="material-symbols-outlined text-[20px]">local_library</span>
                <span>Perpustakaan Saya</span>
              </a>
              <a href="{{ $links('reviews') }}" class="nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-ink-muted hover:text-ink-body hover:bg-surface-neutral font-medium transition-colors">
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

        <!-- RIGHT MAIN: Order History Workspace -->
        <section class="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">

          <!-- Filter Tabs Bar -->
          <div class="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 border-b border-border-subtle text-[13px] font-semibold">
            <button id="tab-filter-all" type="button" class="tab-filter-btn px-4 py-2 rounded-xl bg-primary text-white shadow-xs transition-all" onclick="filterOrders('all')">
              Semua (5)
            </button>
            <button id="tab-filter-success" type="button" class="tab-filter-btn px-4 py-2 rounded-xl bg-surface-neutral text-ink-muted hover:text-ink-body hover:bg-surface-soft transition-all" onclick="filterOrders('success')">
              Berhasil (2)
            </button>
            <button id="tab-filter-pending" type="button" class="tab-filter-btn px-4 py-2 rounded-xl bg-surface-neutral text-ink-muted hover:text-ink-body hover:bg-surface-soft transition-all" onclick="filterOrders('pending')">
              Menunggu (1)
            </button>
            <button id="tab-filter-failed" type="button" class="tab-filter-btn px-4 py-2 rounded-xl bg-surface-neutral text-ink-muted hover:text-ink-body hover:bg-surface-soft transition-all" onclick="filterOrders('failed')">
              Gagal (1)
            </button>
            <button id="tab-filter-expired" type="button" class="tab-filter-btn px-4 py-2 rounded-xl bg-surface-neutral text-ink-muted hover:text-ink-body hover:bg-surface-soft transition-all" onclick="filterOrders('expired')">
              Kedaluwarsa (1)
            </button>
          </div>

          <!-- Orders Container -->
          <div id="orders-container" class="flex flex-col gap-4">
            <!-- Rendered dynamically by renderOrders() -->
          </div>

          <!-- Empty State for Orders -->
          <div id="orders-empty-state" class="hidden p-8 sm:p-14 rounded-3xl bg-white border border-border-subtle shadow-sm text-center flex-col items-center justify-center gap-3">
            <div class="w-36 sm:w-44 aspect-square flex items-center justify-center mb-1">
              <img src="{{ asset('assets/ikapi/ilustration/cart_empty_state.svg') }}" alt="Belum Ada Pesanan" class="w-full h-full object-contain">
            </div>
            <h3 class="text-[20px] font-bold text-ink-body tracking-tight">
              Belum Ada Pesanan
            </h3>
            <p id="orders-empty-desc" class="text-[14px] text-ink-muted max-w-sm">
              Kamu belum melakukan pembelian e-book dengan kriteria status ini.
            </p>
            <a href="{{ $links('books.index') }}" class="mt-2 h-11 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white text-[14px] font-bold flex items-center gap-2 transition-colors shadow-xs">
              <span>Jelajahi Katalog Buku</span>
              <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
          </div>

        </section>

      </div>

    </div>
  </div>
@endsection

@push('overlays')
  <div id="modal-order-detail" class="fixed inset-0 z-50 hidden items-center justify-center p-4 bg-[#00000099] backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="order-modal-title">
      <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border-subtle flex flex-col animate-in fade-in zoom-in-95 duration-200">

        <!-- Modal Header -->
        <div class="p-6 sm:p-8 border-b border-border-subtle flex items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-2.5">
              <span id="modal-order-id" class="text-[18px] sm:text-[20px] font-bold text-ink-body font-mono">
                #IKP-20261115-081
              </span>
              <span id="modal-order-badge" class="px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                Pembayaran Berhasil
              </span>
            </div>
            <p id="modal-order-date" class="text-[13px] text-ink-muted mt-1">
              15 November 2026, 14:20 WIB
            </p>
          </div>
          <button type="button" onclick="closeOrderDetailModal()" class="w-9 h-9 rounded-full bg-surface-neutral hover:bg-border-subtle text-ink-body flex items-center justify-center transition-colors shrink-0" aria-label="Tutup Rincian">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 sm:p-8 space-y-6">

          <!-- Payment & Delivery Info -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-surface-neutral border border-border-subtle text-[13px]">
            <div>
              <span class="text-ink-muted block text-[11px] font-bold uppercase tracking-wider mb-1">Metode Pembayaran</span>
              <span id="modal-order-payment" class="font-bold text-ink-body text-[14px]">GoPay / QRIS</span>
            </div>
            <div>
              <span class="text-ink-muted block text-[11px] font-bold uppercase tracking-wider mb-1">Format Pembelian</span>
              <span class="font-bold text-ink-body text-[14px]">E-Book Digital (Web Reader)</span>
            </div>
          </div>

          <!-- Purchased Book Items -->
          <div class="space-y-3">
            <h4 class="text-[15px] font-bold text-ink-body">Buku yang Dibeli</h4>
            <div id="modal-order-items" class="space-y-3">
              <!-- Injected dynamically -->
            </div>
          </div>

          <!-- Price Breakdown -->
          <div class="pt-4 border-t border-border-subtle space-y-2 text-[14px]">
            <div class="flex justify-between text-ink-muted">
              <span>Subtotal Buku</span>
              <span id="modal-order-subtotal" class="text-ink-body font-medium">Rp45.000</span>
            </div>
            <div class="flex justify-between text-ink-muted">
              <span>Biaya Layanan &amp; Transaksi</span>
              <span class="text-emerald-700 font-medium">Gratis</span>
            </div>
            <div class="flex justify-between text-ink-body font-bold text-[16px] pt-2 border-t border-border-subtle">
              <span>Total Pembayaran</span>
              <span id="modal-order-total" class="text-primary font-bold">Rp45.000</span>
            </div>
          </div>

          <!-- Note -->
          <div class="p-4 rounded-2xl bg-surface-soft border border-[#673de633] text-[13px] text-ink-muted flex items-start gap-2.5">
            <span class="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">menu_book</span>
            <p class="leading-relaxed">
              E-book berlisensi resmi langsung aktif di akunmu dan dapat dibaca kapan saja melalui Web Reader di halaman <strong>Perpustakaan Saya</strong> tanpa perlu mengunduh berkas.
            </p>
          </div>

        </div>

        <!-- Modal Footer Actions -->
        <div class="p-4 sm:p-6 border-t border-border-subtle bg-[#f5f5f699] rounded-b-3xl flex flex-wrap items-center justify-between gap-3">
          <button type="button" onclick="closeOrderDetailModal()" class="h-10 px-5 rounded-xl border border-border-subtle bg-white hover:bg-surface-neutral text-ink-body font-semibold text-[13px] transition-colors">
            Tutup
          </button>
          <div id="modal-order-actions" class="flex items-center gap-2">
            <!-- Dynamic CTA injected based on status -->
          </div>
        </div>

      </div>
    </div>

  <div id="toast-notification" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-ink-body text-white shadow-xl text-[14px] font-medium border border-[#ffffff1a]">
      <span id="toastIcon" class="material-symbols-outlined text-primary-accent text-[20px]">check_circle</span>
      <span id="toastMessage">Tindakan berhasil dilakukan.</span>
    </div>
@endpush

@push('head')
<script>
window.IKAPI_P6_DATA = @json(['ordersData' => $orders]);
</script>
@endpush
