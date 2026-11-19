{{--
  Help chatbot page: scripted demo conversation, no AI backend, no network request.
  Source: docs/design/prototype-copy/user/chatbot_bantuan_rekomendasi_desktop.html (944 lines). Markup, classes, ids and copy are verbatim; only links,
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

    /* Z.ai Inspired User Message Bubble: Sharp bottom-right corner */
    .ikapi-user-message {
      width: fit-content;
      max-width: 85%;
      padding: 10px 14px;
      background-color: #673de6;
      color: #ffffff;
      border-radius: 18px 18px 2px 18px;
      font-size: 14px;
      line-height: 1.5;
      word-break: break-word;
      overflow-wrap: anywhere;
    }
}
</style>
@endpush

@section('title', 'Bantuan & Rekomendasi Buku — IKAPI Store Jawa Barat')

@section('header_z', 'z-40')

@section('account', 'guest')

@section('header_container', 'narrow')

@section('cart_count', '2')

@section('search_placeholder', 'Cari judul, penulis, atau topik buku...')

@section('footer_variant', 'chatbot')

@section('main_pt', 'pt-28')

@section('main_class', 'min-h-[calc(100vh-16rem)]')

@section('content')
  <div class="flex flex-col w-full">

    <!-- BACKGROUND CATALOG CONTEXT SHELF -->
    <div class="max-w-[1240px] w-full mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">

      <!-- Breadcrumb & Compact Collapsible Reviewer Panel -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-[13px] text-ink-muted">
          <a class="hover:text-primary transition-colors" data-path="beranda" href="{{ $links('home') }}">Beranda</a>
          <span class="text-ink-subtle">/</span>
          <span class="text-ink-body font-semibold">Katalog Buku Digital</span>
        </nav>

        <!-- Collapsible Compact Reviewer Panel (Preserved in Same HTML) -->
        <details id="qa-simulation-panel" class="group bg-surface-neutral border border-border-subtle rounded-xl text-[12px] select-none transition-all">
          <summary class="px-3.5 py-1.5 cursor-pointer font-medium text-ink-muted hover:text-ink-body flex items-center gap-2 list-none">
            <span class="material-symbols-outlined text-[16px] text-primary">smart_toy</span>
            <span>Panel Simulasi Chatbot (4 Mode)</span>
            <span class="material-symbols-outlined text-[16px] text-ink-muted transition-transform group-open:rotate-180">expand_more</span>
          </summary>
          <div class="p-2.5 pt-1.5 flex flex-wrap items-center gap-1.5 border-t border-border-subtle bg-white rounded-b-xl">
            <button id="btn-state-rekomendasi" type="button" class="px-3 py-1 rounded-lg bg-primary text-white font-medium transition-all shadow-xs" onclick="setDemoScenario('rekomendasi')">
              Rekomendasi Buku
            </button>
            <button id="btn-state-pembayaran" type="button" class="px-3 py-1 rounded-lg bg-surface-neutral text-ink-body hover:bg-surface-soft hover:text-primary font-medium transition-all border border-border-subtle" onclick="setDemoScenario('pembayaran')">
              Bantuan Pembayaran &amp; Reader
            </button>
            <button id="btn-state-eskalasi" type="button" class="px-3 py-1 rounded-lg bg-surface-neutral text-ink-body hover:bg-surface-soft hover:text-primary font-medium transition-all border border-border-subtle" onclick="setDemoScenario('eskalasi')">
              Layanan CS / Luar Lingkup
            </button>
            <button id="btn-state-loading" type="button" class="px-3 py-1 rounded-lg bg-surface-neutral text-ink-body hover:bg-surface-soft hover:text-primary font-medium transition-all border border-border-subtle" onclick="setDemoScenario('loading')">
              Status Memuat...
            </button>
            <button id="btn-state-toggle" type="button" class="px-3 py-1 rounded-lg bg-surface-soft text-primary font-bold hover:bg-surface-neutral transition-all flex items-center gap-1 border border-[#673de633]" onclick="toggleWidgetPanel()">
              <span class="material-symbols-outlined text-[15px]">visibility</span>
              <span id="toggle-label-text">Tutup Jendela Chat</span>
            </button>
          </div>
        </details>
      </div>

      <!-- Section Header -->
      <div class="pb-2 border-b border-border-subtle flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 class="text-[28px] md:text-[32px] font-bold text-ink-body tracking-tight leading-tight">
            Katalog Buku Digital
          </h1>
          <p class="text-[15px] text-ink-muted mt-1">
            Koleksi buku digital resmi dari penerbit anggota IKAPI Jawa Barat.
          </p>
        </div>
        <a href="{{ $links('books.index') }}" data-path="katalog-buku" class="text-[14px] text-primary hover:text-primary-hover font-bold flex items-center gap-1 transition-colors">
          <span>Buka Katalog Lengkap</span>
          <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
        </a>
      </div>

      <!-- Catalog Sample Grid (100% Local Images) -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
        <!-- Book 1 -->
        <article class="group flex flex-col bg-white rounded-2xl p-4 border border-border-subtle shadow-xs hover:shadow-md hover:border-[#673de666] transition-all">
          <div class="aspect-[2/3] w-full bg-surface-neutral rounded-xl overflow-hidden relative mb-3 border border-border-subtle shadow-xs">
            <img src="{{ asset('assets/ikapi/covers/laskar-aksara-pasundan.jpg') }}" alt="Sampul Laskar Aksara Pasundan" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
          </div>
          <div class="flex flex-col flex-1 justify-between">
            <div>
              <h3 class="text-[15px] font-bold text-ink-body line-clamp-1 group-hover:text-primary transition-colors">
                Laskar Aksara Pasundan
              </h3>
              <p class="text-[13px] text-ink-muted mt-0.5">Ayi R. Kurnia</p>
            </div>
            <div class="pt-3 mt-2 border-t border-border-subtle flex items-center justify-between">
              <span class="text-[15px] font-bold text-ink-body">Rp 45.000</span>
              <a href="{{ $links('books.show', ['book' => 'laskar-aksara-pasundan']) }}" data-path="detail-buku" class="h-8 px-3 rounded-lg bg-primary hover:bg-primary-hover text-white text-[12px] font-semibold flex items-center transition-colors shadow-xs">
                Detail
              </a>
            </div>
          </div>
        </article>

        <!-- Book 2 -->
        <article class="group flex flex-col bg-white rounded-2xl p-4 border border-border-subtle shadow-xs hover:shadow-md hover:border-[#673de666] transition-all">
          <div class="aspect-[2/3] w-full bg-surface-neutral rounded-xl overflow-hidden relative mb-3 border border-border-subtle shadow-xs">
            <img src="{{ asset('assets/ikapi/covers/B02.jpg') }}" alt="Sampul Pendidikan Karakter Sunda" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
          </div>
          <div class="flex flex-col flex-1 justify-between">
            <div>
              <h3 class="text-[15px] font-bold text-ink-body line-clamp-1 group-hover:text-primary transition-colors">
                Pendidikan Karakter Sunda
              </h3>
              <p class="text-[13px] text-ink-muted mt-0.5">Dr. Cecep Hidayat</p>
            </div>
            <div class="pt-3 mt-2 border-t border-border-subtle flex items-center justify-between">
              <span class="text-[15px] font-bold text-ink-body">Rp 58.000</span>
              <a href="{{ $links('books.show', ['book' => 'laskar-aksara-pasundan']) }}" data-path="detail-buku" class="h-8 px-3 rounded-lg bg-primary hover:bg-primary-hover text-white text-[12px] font-semibold flex items-center transition-colors shadow-xs">
                Detail
              </a>
            </div>
          </div>
        </article>

        <!-- Book 3 -->
        <article class="group flex flex-col bg-white rounded-2xl p-4 border border-border-subtle shadow-xs hover:shadow-md hover:border-[#673de666] transition-all">
          <div class="aspect-[2/3] w-full bg-surface-neutral rounded-xl overflow-hidden relative mb-3 border border-border-subtle shadow-xs">
            <img src="{{ asset('assets/ikapi/covers/B03.jpg') }}" alt="Sampul Bumi Parahyangan" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
          </div>
          <div class="flex flex-col flex-1 justify-between">
            <div>
              <h3 class="text-[15px] font-bold text-ink-body line-clamp-1 group-hover:text-primary transition-colors">
                Bumi Parahyangan: Narasi Alam
              </h3>
              <p class="text-[13px] text-ink-muted mt-0.5">Prof. Didi Supardi</p>
            </div>
            <div class="pt-3 mt-2 border-t border-border-subtle flex items-center justify-between">
              <span class="text-[15px] font-bold text-ink-body">Rp 74.000</span>
              <a href="{{ $links('books.show', ['book' => 'laskar-aksara-pasundan']) }}" data-path="detail-buku" class="h-8 px-3 rounded-lg bg-primary hover:bg-primary-hover text-white text-[12px] font-semibold flex items-center transition-colors shadow-xs">
                Detail
              </a>
            </div>
          </div>
        </article>

        <!-- Book 4 -->
        <article class="group flex flex-col bg-white rounded-2xl p-4 border border-border-subtle shadow-xs hover:shadow-md hover:border-[#673de666] transition-all">
          <div class="aspect-[2/3] w-full bg-surface-neutral rounded-xl overflow-hidden relative mb-3 border border-border-subtle shadow-xs">
            <img src="{{ asset('assets/ikapi/covers/B04.jpg') }}" alt="Sampul Antologi Puisi Lembayung" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
          </div>
          <div class="flex flex-col flex-1 justify-between">
            <div>
              <h3 class="text-[15px] font-bold text-ink-body line-clamp-1 group-hover:text-primary transition-colors">
                Antologi Puisi Lembayung
              </h3>
              <p class="text-[13px] text-ink-muted mt-0.5">Dewi Sartika Putri</p>
            </div>
            <div class="pt-3 mt-2 border-t border-border-subtle flex items-center justify-between">
              <span class="text-[15px] font-bold text-ink-body">Rp 38.000</span>
              <a href="{{ $links('books.show', ['book' => 'laskar-aksara-pasundan']) }}" data-path="detail-buku" class="h-8 px-3 rounded-lg bg-primary hover:bg-primary-hover text-white text-[12px] font-semibold flex items-center transition-colors shadow-xs">
                Detail
              </a>
            </div>
          </div>
        </article>
      </div>
    </div>

  </div>
@endsection

@push('overlays')
  <div id="ikapi-chat-widget-wrapper" class="fixed bottom-6 right-6 z-50 flex flex-col items-end">

      <!-- Chat Window Container -->
      <div id="ikapi-chat-window" class="w-[400px] h-[580px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-120px)] bg-white rounded-3xl shadow-2xl border border-border-subtle flex flex-col overflow-hidden mb-3 transition-all duration-300 origin-bottom-right" role="dialog" aria-labelledby="chat-header-title">

        <!-- Widget Header (Clean White Hostinger-style) -->
        <div class="bg-white px-5 py-3.5 border-b border-border-subtle flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-surface-soft border border-[#673de633] flex items-center justify-center text-primary font-bold text-[14px] shrink-0 shadow-xs">
              <span class="material-symbols-outlined text-[20px]">smart_toy</span>
            </div>
            <div>
              <h2 id="chat-header-title" class="text-[15px] font-bold text-ink-body tracking-tight leading-tight">
                Bantuan IKAPI
              </h2>
              <span class="text-[12px] text-ink-muted leading-tight block">
                Asisten buku dan pesanan
              </span>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button type="button" aria-label="Bersihkan Percakapan" class="w-8 h-8 rounded-xl flex items-center justify-center text-ink-muted hover:text-ink-body hover:bg-surface-neutral transition-colors" onclick="resetChatConversation()" title="Bersihkan Percakapan">
              <span class="material-symbols-outlined text-[18px]">refresh</span>
            </button>
            <button type="button" aria-label="Tutup Jendela Bantuan" class="w-8 h-8 rounded-xl flex items-center justify-center text-ink-muted hover:text-ink-body hover:bg-surface-neutral transition-colors" onclick="toggleWidgetPanel()" title="Tutup Jendela">
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        <!-- Chat Body (Scrollable Conversation Thread - Z.ai text-first layout) -->
        <div id="chat-body-scrollable" class="flex-1 overflow-y-auto p-5 space-y-4 bg-white" role="log" aria-live="polite">
          <!-- Messages rendered dynamically by JS -->
        </div>

        <!-- Quick Question Prompts Container (Hidden when initial screen is shown) -->
        <div id="quick-prompts-wrapper" class="hidden px-4 py-2 bg-white border-t border-border-subtle shrink-0">
          <span class="text-[11px] font-bold text-ink-muted uppercase tracking-wider block mb-1.5">
            Coba tanyakan:
          </span>
          <div class="flex flex-wrap gap-1.5">
            <button type="button" class="text-left text-[12px] font-medium px-3 py-1.5 rounded-xl bg-surface-neutral hover:bg-surface-soft hover:text-primary text-ink-body transition-colors border border-border-subtle" onclick="handleQuickPrompt('Cari buku sejarah Sunda')">
              Cari buku sejarah Sunda
            </button>
            <button type="button" class="text-left text-[12px] font-medium px-3 py-1.5 rounded-xl bg-surface-neutral hover:bg-surface-soft hover:text-primary text-ink-body transition-colors border border-border-subtle" onclick="handleQuickPrompt('Cara pembayaran')">
              Cara pembayaran
            </button>
            <button type="button" class="text-left text-[12px] font-medium px-3 py-1.5 rounded-xl bg-surface-neutral hover:bg-surface-soft hover:text-primary text-ink-body transition-colors border border-border-subtle" onclick="handleQuickPrompt('Cara membaca e-book')">
              Cara membaca e-book
            </button>
            <button type="button" class="text-left text-[12px] font-medium px-3 py-1.5 rounded-xl bg-surface-neutral hover:bg-surface-soft hover:text-primary text-ink-body transition-colors border border-border-subtle" onclick="handleQuickPrompt('Hubungi bantuan')">
              Hubungi bantuan
            </button>
          </div>
        </div>

        <!-- Composer / Bottom Input Area (Unified rounded pill with arrow upward submit) -->
        <div class="p-3 bg-white border-t border-border-subtle shrink-0">
          <form class="flex items-center gap-2 p-1.5 pl-4 rounded-full bg-surface-neutral border border-border-subtle focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-[#673de633] transition-all" onsubmit="handleChatSubmit(event)">
            <div class="relative flex-1">
              <textarea id="chat-input-field" rows="1" class="w-full resize-none py-1.5 bg-transparent border-0 outline-none text-ink-body text-[14px] placeholder:text-ink-muted leading-relaxed max-h-24" placeholder="Tulis pertanyaan..." onkeydown="handleTextareaKeydown(event)"></textarea>
            </div>
            <button id="chat-send-btn" type="submit" aria-label="Kirim Pesan" class="w-10 h-10 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center shrink-0 transition-colors shadow-xs cursor-pointer">
              <span class="material-symbols-outlined text-[20px]">arrow_upward</span>
            </button>
          </form>
        </div>

      </div>

      <!-- Floating Action Button Launcher -->
      <button id="launcher-button" type="button" aria-expanded="true" aria-controls="ikapi-chat-window" aria-label="Buka Bantuan IKAPI" class="w-14 h-14 rounded-full bg-primary hover:bg-primary-hover text-white shadow-xl flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#673de64c]" onclick="toggleWidgetPanel()">
        <span id="launcher-icon-chat" class="material-symbols-outlined text-[26px] hidden">chat</span>
        <span id="launcher-icon-close" class="material-symbols-outlined text-[26px]">close</span>
      </button>

    </div>

  <div id="toast-notification" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-ink-body text-white shadow-xl text-[14px] font-medium border border-[#ffffff1a]">
      <span id="toastIcon" class="material-symbols-outlined text-primary-accent text-[20px]">check_circle</span>
      <span id="toastMessage">Tindakan berhasil dilakukan.</span>
    </div>
@endpush
