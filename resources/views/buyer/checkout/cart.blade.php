{{--
  Cart and simulated checkout (payment selector, status states, invoice drawer). No payment gateway.
  Source: docs/design/prototype-copy/user/keranjang_pembayaran_terpadu_desktop.html (910 lines). Markup, classes, ids and copy are verbatim; only links,
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

@section('title', 'Keranjang Belanja — IKAPI Store Jawa Barat')

@section('header_z', 'z-40')

@section('account', 'guest')

@section('current_route', 'cart')

@section('cart_count', '2')

@section('search_placeholder', 'Cari judul, penulis, atau topik buku...')

@section('main_pt', 'pt-28')

@section('main_class', 'min-h-[calc(100vh-16rem)]')

@section('content')
  <div class="flex flex-col w-full">
    <div class="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 w-full">

      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-border-subtle mb-8">
        <div class="flex flex-col gap-1">
          <h1 class="text-[28px] sm:text-[34px] font-bold text-ink-body tracking-tight leading-tight">
            Keranjang Belanja
          </h1>
          <p id="cart-item-count" class="text-[14px] sm:text-[15px] text-ink-muted">
            2 buku
          </p>
        </div>
      </div>

      <!-- VIEW 1: ACTIVE FILLED CART (Grid Layout) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="cart-filled-view">

        <!-- LEFT COLUMN: Book List (8 Cols) -->
        <div class="lg:col-span-8 flex flex-col gap-4">
          <h2 class="text-[18px] font-bold text-ink-body">
            Buku di Keranjang
          </h2>

          <!-- BOOK ITEM 1 -->
          <article class="cart-item bg-white rounded-3xl p-5 border border-border-subtle shadow-xs hover:border-[#673de666] transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center" id="cart-item-1" data-id="1" data-price="45000" data-title="Laskar Aksara Pasundan" data-cover="../../assets/covers/laskar-aksara-pasundan.jpg">
            <div class="w-20 sm:w-24 aspect-[2/3] rounded-2xl overflow-hidden bg-surface-neutral border border-border-subtle shrink-0 shadow-xs">
              <img src="{{ asset('assets/ikapi/covers/laskar-aksara-pasundan.jpg') }}" alt="Sampul Laskar Aksara Pasundan" class="w-full h-full object-cover">
            </div>
            <div class="flex-1 min-w-0 flex flex-col justify-between py-1 w-full sm:w-auto">
              <div>
                <h3 class="text-[16px] font-bold text-ink-body leading-snug truncate">
                  Laskar Aksara Pasundan
                </h3>
                <p class="text-[13px] text-ink-muted mt-0.5">
                  Ayi R. Kurnia • E-Book
                </p>
              </div>
              <div class="mt-4 pt-2.5 border-t border-border-subtle flex items-center justify-between">
                <span class="text-[18px] font-bold text-ink-body font-sans">
                  Rp 45.000
                </span>
                <div class="flex items-center gap-2">
                  <button type="button" aria-label="Hapus dari Keranjang" class="h-9 px-3 rounded-xl text-red-600 hover:bg-red-50 text-[13px] font-semibold flex items-center gap-1 transition-colors cursor-pointer" onclick="removeCartItem(1)">
                    <span class="material-symbols-outlined text-[17px]">delete</span>
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          </article>

          <!-- BOOK ITEM 2 -->
          <article class="cart-item bg-white rounded-3xl p-5 border border-border-subtle shadow-xs hover:border-[#673de666] transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center" id="cart-item-2" data-id="2" data-price="58000" data-title="Pendidikan Karakter Sunda" data-cover="../../assets/covers/B02.jpg">
            <div class="w-20 sm:w-24 aspect-[2/3] rounded-2xl overflow-hidden bg-surface-neutral border border-border-subtle shrink-0 shadow-xs">
              <img src="{{ asset('assets/ikapi/covers/B02.jpg') }}" alt="Sampul Pendidikan Karakter Sunda" class="w-full h-full object-cover">
            </div>
            <div class="flex-1 min-w-0 flex flex-col justify-between py-1 w-full sm:w-auto">
              <div>
                <h3 class="text-[16px] font-bold text-ink-body leading-snug truncate">
                  Pendidikan Karakter Sunda
                </h3>
                <p class="text-[13px] text-ink-muted mt-0.5">
                  Dr. Cecep Hidayat, M.Pd. • E-Book
                </p>
              </div>
              <div class="mt-4 pt-2.5 border-t border-border-subtle flex items-center justify-between">
                <span class="text-[18px] font-bold text-ink-body font-sans">
                  Rp 58.000
                </span>
                <div class="flex items-center gap-2">
                  <button type="button" aria-label="Hapus dari Keranjang" class="h-9 px-3 rounded-xl text-red-600 hover:bg-red-50 text-[13px] font-semibold flex items-center gap-1 transition-colors cursor-pointer" onclick="removeCartItem(2)">
                    <span class="material-symbols-outlined text-[17px]">delete</span>
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          </article>

        </div>

        <!-- RIGHT COLUMN: Order Summary (4 Cols, Sticky on Desktop) -->
        <aside class="lg:col-span-4 lg:sticky lg:top-36 w-full">
          <div class="bg-white rounded-3xl p-6 border border-border-subtle shadow-sm flex flex-col gap-5">
            <h2 class="text-[18px] font-bold text-ink-body pb-3 border-b border-border-subtle">
              Ringkasan Pesanan
            </h2>

            <div class="flex flex-col gap-3 text-[14px]">
              <div class="flex items-center justify-between">
                <span class="text-ink-muted">Subtotal</span>
                <span id="summary-subtotal" class="font-bold text-ink-body font-sans">Rp 103.000</span>
              </div>
              <div class="flex items-center justify-between text-ink-muted">
                <span>Biaya Layanan &amp; Lisensi</span>
                <span class="text-emerald-700 font-bold">Gratis</span>
              </div>
            </div>

            <div class="pt-3 border-t border-border-subtle flex items-baseline justify-between">
              <span class="text-[15px] font-bold text-ink-body">Total Pembayaran</span>
              <span id="summary-total" class="text-[24px] font-bold text-primary font-sans leading-none">
                Rp 103.000
              </span>
            </div>

            <!-- Directly opens Custom Midtrans Snap Modal (Redundant confirmation modal eliminated!) -->
            <button id="btn-checkout" type="button" class="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover text-white text-[15px] font-bold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99] cursor-pointer" onclick="triggerDirectPaymentModal()">
              <span>Lanjut ke Pembayaran</span>
              <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </aside>

      </div>

      <!-- VIEW 2: EMPTY CART STATE (Directly on canvas, zero box/border) -->
      <div class="w-full max-w-xl mx-auto py-12 text-center flex flex-col items-center gap-4 hidden" id="cart-empty-view">
        <div class="w-44 sm:w-52 aspect-square flex items-center justify-center">
          <img src="{{ asset('assets/ikapi/ilustration/cart_empty_state.svg') }}" alt="Keranjang Belanja Kosong" class="w-full h-full object-contain">
        </div>
        <div class="space-y-1">
          <h2 class="text-[22px] sm:text-[24px] font-bold text-ink-body tracking-tight">
            Keranjang Belanja Kosong
          </h2>
          <p class="text-[14px] sm:text-[15px] text-ink-muted">
            Belum ada e-book di keranjang belanja Anda.
          </p>
        </div>
        <a href="{{ $links('books.index') }}" data-path="katalog-buku" class="mt-2 inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white text-[14px] font-bold transition-colors shadow-xs">
          <span class="material-symbols-outlined text-[18px]">explore</span>
          <span>Lihat Katalog Buku</span>
        </a>
      </div>

    </div>
  </div>
@endsection

@push('overlays')
  <div id="snap-overlay" role="dialog" aria-modal="true" class="fixed inset-0 z-50 bg-[#00000099] backdrop-blur-xs hidden items-center justify-center p-4">
      <div id="snap-modal-box" class="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-border-subtle flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">

        <!-- Modal Top Header: Merchant Logo & Close Button -->
        <div class="bg-white px-6 py-4 border-b border-border-subtle flex items-center justify-between shrink-0">
          <div class="flex items-center">
            <img src="{{ asset('assets/ikapi/logo-ikapi-jabar.png') }}" alt="Logo IKAPI" class="h-6 w-auto object-contain">
          </div>
          <button type="button" aria-label="Tutup Pembayaran" class="w-8 h-8 rounded-full hover:bg-surface-neutral text-ink-muted hover:text-ink-body flex items-center justify-center transition-colors cursor-pointer" onclick="closeSnapOverlay()">
            <span class="material-symbols-outlined text-[19px]">close</span>
          </button>
        </div>

        <!-- Amount & Order Details Header (Midtrans Photo 8 Component) -->
        <div class="bg-surface-neutral px-6 py-4 border-b border-border-subtle shrink-0 space-y-2">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-[11px] text-ink-muted block uppercase font-bold tracking-wider">Total Pembayaran</span>
              <span id="snap-total-display" class="text-[26px] font-bold text-ink-body font-sans leading-tight">Rp 103.000</span>
            </div>
            <button type="button" id="btn-toggle-order-details" class="text-[13px] font-bold text-primary hover:text-primary-hover flex items-center gap-1 cursor-pointer select-none" onclick="toggleOrderDetailsDrawer()">
              <span>Detail</span>
              <span id="detail-chevron" class="material-symbols-outlined text-[18px] transition-transform">expand_more</span>
            </button>
          </div>

          <div class="flex items-center justify-between text-[12px] text-ink-muted">
            <span id="snap-order-id-label" class="font-mono">Order ID #IKP-20261116-081</span>
            <span class="flex items-center gap-1 text-amber-700 font-semibold">
              <span class="material-symbols-outlined text-[15px]">schedule</span>
              <span id="snap-countdown-timer">Selesaikan dalam 23:59:58</span>
            </span>
          </div>

          <!-- Expandable Order Items Breakdown Drawer -->
          <div id="order-details-drawer" class="hidden pt-3 border-t border-border-subtle space-y-2 text-[13px]">
            <div id="order-details-items-list" class="space-y-1.5">
              <!-- Dynamically populated from active cart -->
            </div>
            <div class="pt-2 border-t border-border-subtle flex justify-between font-bold text-ink-body">
              <span>Total Tagihan</span>
              <span id="order-details-total" class="text-primary font-sans">Rp 103.000</span>
            </div>
          </div>
        </div>

        <!-- Modal Body Container (Scrollable) -->
        <div class="p-6 overflow-y-auto flex-1 space-y-4">

          <!-- SUBVIEW 1: VERTICAL PAYMENT METHOD LIST (Foto 8 Benchmark) -->
          <div id="snap-selection-view" class="space-y-4">
            <span class="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">
              PILIH METODE PEMBAYARAN
            </span>

            <!-- Payment Methods Vertical List with dividers -->
            <div class="rounded-2xl border border-border-subtle bg-white overflow-hidden divide-y divide-border-subtle">

              <!-- Method 1: GoPay / QRIS -->
              <button type="button" class="w-full p-4 flex items-center justify-between hover:bg-surface-neutral text-left transition-colors cursor-pointer group" onclick="selectPaymentMethod('qris', 'GoPay / QRIS')">
                <div class="flex items-center gap-3.5 min-w-0">
                  <div class="w-10 h-10 rounded-xl bg-surface-soft text-primary flex items-center justify-center shrink-0 border border-[#673de633]">
                    <span class="material-symbols-outlined text-[22px]">qr_code_2</span>
                  </div>
                  <div class="min-w-0">
                    <p class="text-[14px] font-bold text-ink-body group-hover:text-primary transition-colors">GoPay / QRIS</p>
                    <p class="text-[12px] text-ink-muted truncate">Pindai QR dengan GoPay, OVO, Dana, ShopeePay</p>
                  </div>
                </div>
                <span class="material-symbols-outlined text-[20px] text-ink-muted group-hover:text-primary transition-transform group-hover:translate-x-1 shrink-0">chevron_right</span>
              </button>

              <!-- Method 2: Virtual Account (Expandable Accordion) -->
              <div>
                <button type="button" class="w-full p-4 flex items-center justify-between hover:bg-surface-neutral text-left transition-colors cursor-pointer group" onclick="toggleVaAccordion()">
                  <div class="flex items-center gap-3.5 min-w-0">
                    <div class="w-10 h-10 rounded-xl bg-surface-soft text-primary flex items-center justify-center shrink-0 border border-[#673de633]">
                      <span class="material-symbols-outlined text-[22px]">account_balance</span>
                    </div>
                    <div class="min-w-0">
                      <p class="text-[14px] font-bold text-ink-body group-hover:text-primary transition-colors">Virtual Account</p>
                      <p class="text-[12px] text-ink-muted truncate">BCA, Mandiri, BNI, BRI, Permata</p>
                    </div>
                  </div>
                  <span id="va-chevron" class="material-symbols-outlined text-[20px] text-ink-muted group-hover:text-primary transition-transform">expand_more</span>
                </button>

                <!-- VA Banks Sublist Accordion -->
                <div id="va-sublist" class="hidden bg-[#f5f5f699] px-4 py-2 border-t border-border-subtle divide-y divide-[#e5e7ebb2] text-[13.5px]">
                  <button type="button" class="w-full py-2.5 px-2 flex items-center justify-between hover:text-primary text-ink-body font-medium transition-colors text-left" onclick="selectPaymentMethod('va-bca', 'BCA Virtual Account')">
                    <span>BCA Virtual Account</span>
                    <span class="material-symbols-outlined text-[17px] text-ink-muted">chevron_right</span>
                  </button>
                  <button type="button" class="w-full py-2.5 px-2 flex items-center justify-between hover:text-primary text-ink-body font-medium transition-colors text-left" onclick="selectPaymentMethod('va-mandiri', 'Mandiri Bill Payment')">
                    <span>Mandiri Bill Payment</span>
                    <span class="material-symbols-outlined text-[17px] text-ink-muted">chevron_right</span>
                  </button>
                  <button type="button" class="w-full py-2.5 px-2 flex items-center justify-between hover:text-primary text-ink-body font-medium transition-colors text-left" onclick="selectPaymentMethod('va-bni', 'BNI Virtual Account')">
                    <span>BNI Virtual Account</span>
                    <span class="material-symbols-outlined text-[17px] text-ink-muted">chevron_right</span>
                  </button>
                  <button type="button" class="w-full py-2.5 px-2 flex items-center justify-between hover:text-primary text-ink-body font-medium transition-colors text-left" onclick="selectPaymentMethod('va-bri', 'BRI Virtual Account')">
                    <span>BRI Virtual Account</span>
                    <span class="material-symbols-outlined text-[17px] text-ink-muted">chevron_right</span>
                  </button>
                </div>
              </div>

              <!-- Method 3: ShopeePay -->
              <button type="button" class="w-full p-4 flex items-center justify-between hover:bg-surface-neutral text-left transition-colors cursor-pointer group" onclick="selectPaymentMethod('shopeepay', 'ShopeePay')">
                <div class="flex items-center gap-3.5 min-w-0">
                  <div class="w-10 h-10 rounded-xl bg-surface-soft text-primary flex items-center justify-center shrink-0 border border-[#673de633]">
                    <span class="material-symbols-outlined text-[22px]">payments</span>
                  </div>
                  <div class="min-w-0">
                    <p class="text-[14px] font-bold text-ink-body group-hover:text-primary transition-colors">ShopeePay</p>
                    <p class="text-[12px] text-ink-muted truncate">Bayar langsung dengan saldo ShopeePay</p>
                  </div>
                </div>
                <span class="material-symbols-outlined text-[20px] text-ink-muted group-hover:text-primary transition-transform group-hover:translate-x-1 shrink-0">chevron_right</span>
              </button>

              <!-- Method 4: Kartu Kredit / Debit -->
              <button type="button" class="w-full p-4 flex items-center justify-between hover:bg-surface-neutral text-left transition-colors cursor-pointer group" onclick="selectPaymentMethod('credit_card', 'Kartu Kredit / Debit')">
                <div class="flex items-center gap-3.5 min-w-0">
                  <div class="w-10 h-10 rounded-xl bg-surface-soft text-primary flex items-center justify-center shrink-0 border border-[#673de633]">
                    <span class="material-symbols-outlined text-[22px]">credit_card</span>
                  </div>
                  <div class="min-w-0">
                    <p class="text-[14px] font-bold text-ink-body group-hover:text-primary transition-colors">Kartu Kredit / Debit</p>
                    <p class="text-[12px] text-ink-muted truncate">Visa, Mastercard, JCB</p>
                  </div>
                </div>
                <span class="material-symbols-outlined text-[20px] text-ink-muted group-hover:text-primary transition-transform group-hover:translate-x-1 shrink-0">chevron_right</span>
              </button>

            </div>

            <!-- Compact Reviewer Simulator Disclosure Bar (Discreet for Testing 4 States) -->
            <details class="group bg-surface-neutral rounded-2xl border border-border-subtle text-[12px] select-none">
              <summary class="px-3.5 py-2 cursor-pointer font-semibold text-ink-muted hover:text-ink-body flex items-center justify-between list-none">
                <span class="flex items-center gap-1.5 text-primary">
                  <span class="material-symbols-outlined text-[16px]">tune</span>
                  <span>Mode Pengujian Status (QA)</span>
                </span>
                <span class="material-symbols-outlined text-[16px] transition-transform group-open:rotate-180">expand_more</span>
              </summary>
              <div class="p-3 pt-1 border-t border-border-subtle flex flex-wrap gap-1.5 bg-white rounded-b-2xl">
                <button type="button" class="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors" onclick="setDemoPaymentStatus('berhasil')">
                  ✓ Berhasil
                </button>
                <button type="button" class="px-3 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold border border-amber-200 hover:bg-amber-100 transition-colors" onclick="setDemoPaymentStatus('menunggu')">
                  ⏳ Menunggu
                </button>
                <button type="button" class="px-3 py-1 rounded-lg bg-red-50 text-red-700 font-bold border border-red-200 hover:bg-red-100 transition-colors" onclick="setDemoPaymentStatus('gagal')">
                  ✕ Gagal
                </button>
                <button type="button" class="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 font-bold border border-gray-200 hover:bg-gray-200 transition-colors" onclick="setDemoPaymentStatus('kedaluwarsa')">
                  ⏰ Kedaluwarsa
                </button>
              </div>
            </details>

          </div>

          <!-- SUBVIEW 2: STATUS BERHASIL -->
          <div id="status-berhasil" class="hidden flex flex-col items-center text-center gap-4 py-4">
            <div class="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-xs">
              <span class="material-symbols-outlined text-[32px]">check_circle</span>
            </div>
            <div class="space-y-1">
              <h4 class="text-[20px] font-bold text-ink-body tracking-tight">Pembayaran Berhasil</h4>
              <p class="text-[14px] text-ink-muted max-w-sm">
                Pembayaran simulasi telah terkonfirmasi. Buku otomatis aktif di akun Anda.
              </p>
            </div>
            <div class="w-full bg-surface-neutral p-4 rounded-2xl border border-border-subtle text-left text-[13.5px] space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-ink-muted">Nomor Pesanan</span>
                <span id="status-success-order-id" class="font-mono font-bold text-ink-body">#IKP-20261116-081</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-ink-muted">Total Transaksi</span>
                <span class="font-bold text-primary font-sans" id="status-berhasil-total">Rp 103.000</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-ink-muted">Status</span>
                <span class="font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[11.5px]">Lunas</span>
              </div>
            </div>
            <div class="w-full flex flex-col gap-2.5 pt-2">
              <a href="{{ $links('library') }}" data-path="perpustakaan-saya" class="w-full h-11 rounded-xl bg-primary hover:bg-primary-hover text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-all shadow-xs">
                <span class="material-symbols-outlined text-[18px]">local_library</span>
                <span>Buka Perpustakaan Saya</span>
              </a>
              <button type="button" class="w-full h-10 rounded-xl border border-border-subtle bg-white hover:bg-surface-neutral text-ink-body text-[13px] font-semibold transition-colors" onclick="backToSnapSelector()">
                Kembali ke Pilihan Metode
              </button>
            </div>
          </div>

          <!-- SUBVIEW 3: STATUS MENUNGGU -->
          <div id="status-menunggu" class="hidden flex flex-col items-center text-center gap-4 py-4">
            <div class="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-xs">
              <span class="material-symbols-outlined text-[32px]">schedule</span>
            </div>
            <div class="space-y-1">
              <h4 class="text-[20px] font-bold text-ink-body tracking-tight">Menunggu Pembayaran</h4>
              <p class="text-[14px] text-ink-muted max-w-sm">
                Selesaikan simulasi pembayaran sebelum batas waktu berakhir.
              </p>
            </div>
            <div class="w-full bg-amber-50/60 p-4 rounded-2xl border border-amber-200 text-left text-[13.5px] space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-ink-muted">Nomor Pesanan</span>
                <span id="status-pending-order-id" class="font-mono font-bold text-ink-body">#IKP-20261116-081</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-ink-muted">Metode Dipilih</span>
                <span id="status-pending-method" class="font-bold text-ink-body">GoPay / QRIS</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-ink-muted">Total Pembayaran</span>
                <span class="font-bold text-primary font-sans" id="status-menunggu-total">Rp 103.000</span>
              </div>
            </div>
            <div class="w-full flex flex-col gap-2.5 pt-2">
              <button type="button" class="w-full h-11 rounded-xl bg-primary hover:bg-primary-hover text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer" onclick="checkPaymentStatus()">
                <span class="material-symbols-outlined text-[18px]">sync</span>
                <span>Cek Status Transaksi</span>
              </button>
              <button type="button" class="w-full h-10 rounded-xl border border-border-subtle bg-white hover:bg-surface-neutral text-ink-body text-[13px] font-semibold transition-colors" onclick="backToSnapSelector()">
                Ganti Metode Pembayaran
              </button>
            </div>
          </div>

          <!-- SUBVIEW 4: STATUS GAGAL -->
          <div id="status-gagal" class="hidden flex flex-col items-center text-center gap-4 py-4">
            <div class="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-200 shadow-xs">
              <span class="material-symbols-outlined text-[32px]">error</span>
            </div>
            <div class="space-y-1">
              <h4 class="text-[20px] font-bold text-ink-body tracking-tight">Pembayaran Gagal</h4>
              <p class="text-[14px] text-ink-muted max-w-sm">
                Pembayaran simulasi tidak berhasil diproses. Silakan coba metode lain.
              </p>
            </div>
            <div class="w-full bg-surface-neutral p-4 rounded-2xl border border-border-subtle text-left text-[13.5px] space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-ink-muted">Nomor Pesanan</span>
                <span id="status-failed-order-id" class="font-mono font-bold text-ink-body">#IKP-20261116-081</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-ink-muted">Status</span>
                <span class="font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full text-[11.5px]">Gagal</span>
              </div>
            </div>
            <div class="w-full flex flex-col gap-2.5 pt-2">
              <button type="button" class="w-full h-11 rounded-xl bg-primary hover:bg-primary-hover text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer" onclick="backToSnapSelector()">
                <span class="material-symbols-outlined text-[18px]">replay</span>
                <span>Coba Bayar Lagi</span>
              </button>
              <button type="button" class="w-full h-10 rounded-xl border border-border-subtle bg-white hover:bg-surface-neutral text-ink-body text-[13px] font-semibold transition-colors" onclick="closeSnapOverlay()">
                Tutup
              </button>
            </div>
          </div>

          <!-- SUBVIEW 5: STATUS KEDALUWARSA -->
          <div id="status-kedaluwarsa" class="hidden flex flex-col items-center text-center gap-4 py-4">
            <div class="w-14 h-14 rounded-full bg-surface-neutral text-ink-muted flex items-center justify-center border border-border-subtle shadow-xs">
              <span class="material-symbols-outlined text-[32px]">timer_off</span>
            </div>
            <div class="space-y-1">
              <h4 class="text-[20px] font-bold text-ink-body tracking-tight">Pembayaran Kedaluwarsa</h4>
              <p class="text-[14px] text-ink-muted max-w-sm">
                Waktu simulasi pembayaran untuk pesanan ini telah berakhir.
              </p>
            </div>
            <div class="w-full bg-surface-neutral p-4 rounded-2xl border border-border-subtle text-left text-[13.5px] space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-ink-muted">Nomor Pesanan</span>
                <span id="status-expired-order-id" class="font-mono font-bold text-ink-body">#IKP-20261116-081</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-ink-muted">Status</span>
                <span class="font-bold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full text-[11.5px]">Kedaluwarsa</span>
              </div>
            </div>
            <div class="w-full flex flex-col gap-2.5 pt-2">
              <button type="button" class="w-full h-11 rounded-xl bg-primary hover:bg-primary-hover text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer" onclick="closeSnapOverlay()">
                <span class="material-symbols-outlined text-[18px]">shopping_bag</span>
                <span>Kembali ke Keranjang</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>

  <div id="cart-toast" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-ink-body text-white shadow-xl text-[14px] font-medium border border-[#ffffff1a]">
      <span id="toast-icon" class="material-symbols-outlined text-primary-accent text-[20px]">check_circle</span>
      <span id="toast-msg">Item berhasil diperbarui</span>
    </div>
@endpush
