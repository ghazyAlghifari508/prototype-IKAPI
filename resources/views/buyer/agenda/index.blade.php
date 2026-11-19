{{--
  Agenda & berita literasi: calendar, event filters, ICS export, article preview and event modals.
  Source: docs/design/prototype-copy/user/agenda_berita_literasi_desktop.html (1199 lines). Markup, classes, ids and copy are verbatim; only links,
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

@section('title', 'Agenda & Berita Literasi — IKAPI Store Jawa Barat')

@section('header_z', 'z-40')

@section('account', 'guest')

@section('current_route', 'agenda')

@section('cart_count', '2')

@section('search_placeholder', 'Cari judul buku, lokakarya, atau artikel...')

@section('nav_active_sm', '0')

@section('account_pill', '0')

@section('footer_variant', 'agenda')

@section('main_pt', 'pt-28')

@section('main_class', 'min-h-[calc(100vh-16rem)]')
@section('chatbot', '1')

@section('content')
  <div class="flex flex-col w-full">
    <div class="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 w-full flex flex-col gap-10">

      <!-- Top Row: Collapsible Reviewer Simulator Panel (Zero Breadcrumb) -->
      <div class="flex justify-end">
        <!-- Collapsible Compact Reviewer Panel (Preserved in Same HTML) -->
        <details id="qa-simulation-panel" class="group bg-surface-neutral border border-border-subtle rounded-xl text-[12px] select-none transition-all">
          <summary class="px-3.5 py-1.5 cursor-pointer font-medium text-ink-muted hover:text-ink-body flex items-center gap-2 list-none">
            <span class="material-symbols-outlined text-[16px] text-primary">tune</span>
            <span>Panel Simulasi QA (4 Mode)</span>
            <span class="material-symbols-outlined text-[16px] text-ink-muted transition-transform group-open:rotate-180">expand_more</span>
          </summary>
          <div class="p-2.5 pt-1.5 flex flex-wrap items-center gap-1.5 border-t border-border-subtle bg-white rounded-b-xl">
            <button id="btn-state-normal" type="button" class="px-3 py-1 rounded-lg bg-primary text-white font-medium transition-all shadow-xs" onclick="setViewState('normal')">
              Tampilan Normal
            </button>
            <button id="btn-state-nov18" type="button" class="px-3 py-1 rounded-lg bg-surface-neutral text-ink-body hover:bg-surface-soft hover:text-primary font-medium transition-all border border-border-subtle" onclick="setViewState('nov18')">
              Pilih Tgl 18 Nov
            </button>
            <button id="btn-state-empty-events" type="button" class="px-3 py-1 rounded-lg bg-surface-neutral text-ink-body hover:bg-surface-soft hover:text-primary font-medium transition-all border border-border-subtle" onclick="setViewState('empty-events')">
              Mode Jadwal Kosong
            </button>
            <button id="btn-state-empty-news" type="button" class="px-3 py-1 rounded-lg bg-surface-neutral text-ink-body hover:bg-surface-soft hover:text-primary font-medium transition-all border border-border-subtle" onclick="setViewState('empty-news')">
              Mode Berita Kosong
            </button>
          </div>
        </details>
      </div>

      <!-- FEATURED HERO PROMOTIONAL CARD (Hostinger-inspired Bold Rounded Composition) -->
      <section class="w-full rounded-3xl bg-gradient-to-br from-[#2f1c6a] via-[#28175d] to-[#1e1047] text-white overflow-hidden shadow-xl border border-[#2f1c6a66]">
        <div class="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[420px]">

          <!-- Left Editorial Text Content (Column 7 / 12) -->
          <div class="lg:col-span-7 p-6 sm:p-8 lg:p-12 flex flex-col justify-between gap-6">
            <div class="space-y-4">
              <h2 class="text-[26px] sm:text-[32px] lg:text-[36px] font-bold text-white tracking-tight leading-[1.2]">
                Pekan Literasi Priangan 2026: Merawat Naskah Kuno di Era Digital
              </h2>

              <!-- Metadata Row -->
              <div class="flex flex-col sm:flex-row sm:items-center flex-wrap gap-3 sm:gap-6 text-[#ffffffcc] text-[14px]">
                <div class="flex items-center gap-1.5 text-primary-accent font-semibold">
                  <span class="material-symbols-outlined text-[18px]">calendar_month</span>
                  <span>18 – 20 November 2026</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[18px] text-primary-accent">schedule</span>
                  <span>09:00 – 17:00 WIB</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[18px] text-primary-accent">location_on</span>
                  <span>Gedung Indonesia Menggugat, Bandung</span>
                </div>
              </div>

              <p class="text-[15px] text-[#ffffffd9] leading-relaxed max-w-xl">
                Festival literasi dan pameran naskah bersejarah Jawa Barat menghadirkan sarasehan penulis, bedah buku kurasi, serta workshop digitalisasi naskah terbuka untuk umum.
              </p>
            </div>

            <!-- Interactive Actions -->
            <div class="pt-2 flex flex-wrap items-center gap-3">
              <button type="button" onclick="openFeaturedEventModal()" class="h-11 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-colors shadow-sm">
                <span>Lihat Detail Acara</span>
                <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
              <button type="button" class="h-11 px-5 rounded-xl border border-[#ffffff40] bg-[#ffffff1a] hover:bg-[#ffffff33] text-white font-semibold text-[14px] flex items-center justify-center gap-2 transition-colors" onclick="downloadIcsFile('Pekan Literasi Priangan 2026', '20261118T090000', '20261120T170000', 'Gedung Indonesia Menggugat, Bandung', 'Festival literasi dan pameran naskah bersejarah Jawa Barat.')">
                <span class="material-symbols-outlined text-[18px]">event_available</span>
                <span>Simpan ke Kalender</span>
              </button>
            </div>
          </div>

          <!-- Right Visual Dominant Area (Column 5 / 12) -->
          <div class="lg:col-span-5 relative p-4 lg:p-6 flex items-center justify-center bg-[#00000033]">
            <div class="w-full h-full min-h-[260px] sm:min-h-[320px] rounded-2xl overflow-hidden relative shadow-lg border border-[#ffffff26]">
              <img src="{{ asset('assets/ikapi/events/event-book-fair.jpg') }}" alt="Pekan Literasi Priangan 2026" class="w-full h-full object-cover">
            </div>
          </div>

        </div>
      </section>

      <!-- SECTION 1: AGENDA KEGIATAN & KALENDER INTERAKTIF -->
      <section class="flex flex-col gap-6">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 class="text-[24px] md:text-[28px] font-bold text-ink-body tracking-tight">
              Agenda Mendatang
            </h2>
            <p class="text-[14px] text-ink-muted mt-1">Pilih tanggal pada kalender untuk melihat kegiatan terjadwal.</p>
          </div>
        </div>

        <!-- Two-Column Calendar Layout (Calendar 4 Cols, Event Listing 8 Cols) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <!-- Left Column: Modern Editorial Calendar (4 Cols) -->
          <div class="lg:col-span-4 bg-white rounded-2xl p-5 border border-border-subtle shadow-sm flex flex-col gap-4">
            <!-- Calendar Header -->
            <div class="flex items-center justify-between pb-1 border-b border-border-subtle">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
                <span id="calendar-month-label" class="text-[16px] font-bold text-ink-body">November 2026</span>
              </div>
              <div class="flex items-center gap-1">
                <button type="button" aria-label="Bulan Sebelumnya" class="w-8 h-8 rounded-lg hover:bg-surface-neutral text-ink-body flex items-center justify-center transition-colors" onclick="prevCalendarMonth()">
                  <span class="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button type="button" aria-label="Bulan Berikutnya" class="w-8 h-8 rounded-lg hover:bg-surface-neutral text-ink-body flex items-center justify-center transition-colors" onclick="nextCalendarMonth()">
                  <span class="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>

            <!-- Weekdays -->
            <div class="grid grid-cols-7 text-center text-[12px] font-bold text-ink-muted">
              <div class="py-1 text-red-600">Min</div>
              <div class="py-1">Sen</div>
              <div class="py-1">Sel</div>
              <div class="py-1">Rab</div>
              <div class="py-1">Kam</div>
              <div class="py-1">Jum</div>
              <div class="py-1">Sab</div>
            </div>

            <!-- Calendar Days Grid -->
            <div id="calendar-days-grid" class="grid grid-cols-7 gap-1 text-center text-[13px]">
              <!-- Dynamically populated by renderCalendar() -->
            </div>
          </div>

          <!-- Right Column: Active Events List (8 Cols) -->
          <div class="lg:col-span-8 flex flex-col gap-4">

            <!-- Filter Header Bar -->
            <div class="flex items-center justify-between pb-2 border-b border-border-subtle">
              <div class="flex items-center gap-2.5">
                <h3 id="event-list-headline" class="text-[18px] font-bold text-ink-body">
                  Agenda November 2026
                </h3>
              </div>
              <span class="text-[12px] text-ink-muted">Waktu Terdekat</span>
            </div>

            <!-- Events Container (List of Modern Editorial Items) -->
            <div id="events-container" class="flex flex-col gap-4">

              <!-- Event 1 (18 Nov) -->
              <article class="event-card group relative bg-white hover:bg-[#f5f6ff66] rounded-2xl p-4 sm:p-5 border border-border-subtle hover:border-[#673de666] transition-all shadow-xs flex flex-col sm:flex-row gap-5 items-start sm:items-center" data-event-id="ev-1" data-date="2026-11-18">
                <a href="#" class="absolute inset-0 z-0 rounded-2xl" aria-label="Lihat detail agenda: Lokakarya Filologi Populer: Mengalihaksarakan Naskah Sunda Kuno"></a>
                <div class="w-full sm:w-48 h-36 rounded-xl overflow-hidden shrink-0 relative bg-surface-neutral border border-border-subtle">
                  <img src="{{ asset('assets/ikapi/events/event-community.jpg') }}" alt="Lokakarya Filologi Populer" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
                  <span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-[#222225]/85 backdrop-blur-xs text-white text-[11px] font-bold">
                    18 NOV
                  </span>
                </div>
                <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <div class="flex items-center gap-2 text-[12px] text-ink-muted mb-1.5">
                      <span class="text-primary font-bold">Lokakarya</span>
                      <span>•</span>
                      <span>10:00 – 12:30 WIB</span>
                    </div>
                    <h4 class="text-[17px] font-bold text-ink-body leading-snug group-hover:text-primary transition-colors">
                      Lokakarya Filologi Populer: Mengalihaksarakan Naskah Sunda Kuno
                    </h4>
                    <p class="text-[13px] text-ink-muted mt-1.5 flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-[16px] text-primary">location_on</span>
                      <span>Ruang Seminar Graha IKAPI Jabar, Bandung</span>
                    </p>
                  </div>
                  <div class="mt-4 pt-2.5 border-t border-border-subtle flex items-center justify-between">
                    <span class="text-[12px] text-ink-muted">Penyelenggara: <strong class="text-ink-body font-semibold">Kiblat Buku</strong></span>
                    <button type="button" class="relative z-10 h-8 px-3.5 rounded-lg bg-surface-soft hover:bg-primary text-primary hover:text-white font-semibold text-[13px] flex items-center gap-1.5 transition-colors border border-[#673de633] hover:border-transparent" onclick="downloadIcsFile('Lokakarya Filologi Populer', '20261118T100000', '20261118T123000', 'Graha IKAPI Jabar, Bandung', 'Lokakarya Filologi Populer.')">
                      <span class="material-symbols-outlined text-[16px]">calendar_add_on</span>
                      <span>Simpan</span>
                    </button>
                  </div>
                </div>
              </article>

              <!-- Event 2 (22 Nov) -->
              <article class="event-card group relative bg-white hover:bg-[#f5f6ff66] rounded-2xl p-4 sm:p-5 border border-border-subtle hover:border-[#673de666] transition-all shadow-xs flex flex-col sm:flex-row gap-5 items-start sm:items-center" data-event-id="ev-2" data-date="2026-11-22">
                <a href="#" class="absolute inset-0 z-0 rounded-2xl" aria-label="Lihat detail agenda: Bedah Buku &amp; Diskusi Publik: Pendidikan Karakter Berbasis Kearifan Lokal"></a>
                <div class="w-full sm:w-48 h-36 rounded-xl overflow-hidden shrink-0 relative bg-surface-neutral border border-border-subtle">
                  <img src="{{ asset('assets/ikapi/events/event-children-story.jpg') }}" alt="Bedah Buku &amp; Diskusi Publik" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
                  <span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-[#222225]/85 backdrop-blur-xs text-white text-[11px] font-bold">
                    22 NOV
                  </span>
                </div>
                <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <div class="flex items-center gap-2 text-[12px] text-ink-muted mb-1.5">
                      <span class="text-primary font-bold">Diskusi Publik</span>
                      <span>•</span>
                      <span>13:30 – 16:00 WIB</span>
                    </div>
                    <h4 class="text-[17px] font-bold text-ink-body leading-snug group-hover:text-primary transition-colors">
                      Bedah Buku &amp; Diskusi Publik: Pendidikan Karakter Berbasis Kearifan Lokal
                    </h4>
                    <p class="text-[13px] text-ink-muted mt-1.5 flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-[16px] text-primary">location_on</span>
                      <span>Aula Pusat Studi Sunda, Bandung</span>
                    </p>
                  </div>
                  <div class="mt-4 pt-2.5 border-t border-border-subtle flex items-center justify-between">
                    <span class="text-[12px] text-ink-muted">Penyelenggara: <strong class="text-ink-body font-semibold">UPI Press</strong></span>
                    <button type="button" class="relative z-10 h-8 px-3.5 rounded-lg bg-surface-soft hover:bg-primary text-primary hover:text-white font-semibold text-[13px] flex items-center gap-1.5 transition-colors border border-[#673de633] hover:border-transparent" onclick="downloadIcsFile('Bedah Buku Pendidikan Karakter Sunda', '20261122T133000', '20261122T160000', 'Aula Pusat Studi Sunda, Bandung', 'Bedah Buku.')">
                      <span class="material-symbols-outlined text-[16px]">calendar_add_on</span>
                      <span>Simpan</span>
                    </button>
                  </div>
                </div>
              </article>

              <!-- Event 3 (28 Nov) -->
              <article class="event-card group relative bg-white hover:bg-[#f5f6ff66] rounded-2xl p-4 sm:p-5 border border-border-subtle hover:border-[#673de666] transition-all shadow-xs flex flex-col sm:flex-row gap-5 items-start sm:items-center" data-event-id="ev-3" data-date="2026-11-28">
                <a href="#" class="absolute inset-0 z-0 rounded-2xl" aria-label="Lihat detail agenda: Sarasehan Editor &amp; Penulis: Standarisasi E-Book Berlisensi"></a>
                <div class="w-full sm:w-48 h-36 rounded-xl overflow-hidden shrink-0 relative bg-surface-neutral border border-border-subtle">
                  <img src="{{ asset('assets/ikapi/events/event-webinar.jpg') }}" alt="Sarasehan Editor &amp; Penulis" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
                  <span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-[#222225]/85 backdrop-blur-xs text-white text-[11px] font-bold">
                    28 NOV
                  </span>
                </div>
                <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <div class="flex items-center gap-2 text-[12px] text-ink-muted mb-1.5">
                      <span class="text-primary font-bold">Webinar</span>
                      <span>•</span>
                      <span>09:00 – 12:00 WIB</span>
                    </div>
                    <h4 class="text-[17px] font-bold text-ink-body leading-snug group-hover:text-primary transition-colors">
                      Sarasehan Editor &amp; Penulis: Standarisasi E-Book Berlisensi
                    </h4>
                    <p class="text-[13px] text-ink-muted mt-1.5 flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-[16px] text-primary">language</span>
                      <span>Daring via Zoom / Hybrid IKAPI Jabar</span>
                    </p>
                  </div>
                  <div class="mt-4 pt-2.5 border-t border-border-subtle flex items-center justify-between">
                    <span class="text-[12px] text-ink-muted">Penyelenggara: <strong class="text-ink-body font-semibold">IKAPI Jabar</strong></span>
                    <button type="button" class="relative z-10 h-8 px-3.5 rounded-lg bg-surface-soft hover:bg-primary text-primary hover:text-white font-semibold text-[13px] flex items-center gap-1.5 transition-colors border border-[#673de633] hover:border-transparent" onclick="downloadIcsFile('Sarasehan Editor &amp; Penulis', '20261128T090000', '20261128T120000', 'Daring Zoom / Hybrid', 'Sarasehan Editor.')">
                      <span class="material-symbols-outlined text-[16px]">calendar_add_on</span>
                      <span>Simpan</span>
                    </button>
                  </div>
                </div>
              </article>

            </div>

            <!-- Empty State for Events (Filtered or Simulated) -->
            <div id="events-empty-state" class="hidden p-8 sm:p-12 rounded-2xl bg-white border border-border-subtle shadow-sm text-center flex-col items-center justify-center gap-3">
              <div class="w-36 sm:w-44 aspect-square flex items-center justify-center mb-1">
                <img src="{{ asset('assets/ikapi/ilustration/notfoundil.png') }}" alt="Tidak Ada Kegiatan" class="w-full h-full object-contain">
              </div>
              <h4 class="text-[20px] font-bold text-ink-body tracking-tight">
                Tidak Ada Kegiatan
              </h4>
              <p id="events-empty-desc" class="text-[14px] text-ink-muted max-w-sm">
                Tidak ada kegiatan pada tanggal ini.
              </p>
              <button type="button" class="mt-2 h-10 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white text-[13px] font-bold transition-colors shadow-xs" onclick="resetCalendarSelection()">
                Lihat Semua Agenda
              </button>
            </div>

          </div>

        </div>
      </section>

      <!-- SECTION 2: KABAR & ARTIKEL LITERASI (Modern Editorial Magazine Layout) -->
      <section id="section-berita" class="flex flex-col gap-6 pt-10">
        <div class="flex items-center justify-between pb-2 border-b border-border-subtle">
          <div>
            <h2 class="text-[24px] md:text-[28px] font-bold text-ink-body tracking-tight">
              Kabar &amp; Artikel
            </h2>
            <p class="text-[14px] text-ink-muted mt-1">Warta penerbit, ulasan naskah, dan kabar ekosistem literasi Jawa Barat.</p>
          </div>
          <a href="#section-berita" class="text-[14px] text-primary hover:text-primary-hover font-bold flex items-center gap-1 transition-colors">
            <span>Semua Artikel</span>
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </a>
        </div>

        <!-- Articles Grid (7 Cols Leading Feature, 5 Cols Secondary Articles) -->
        <div id="articles-container" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          <!-- Leading Featured Article (7 Cols) -->
          <article class="lg:col-span-7 bg-white rounded-2xl overflow-hidden border border-border-subtle shadow-sm flex flex-col justify-between group hover:border-[#673de666] transition-colors">
            <div class="w-full h-64 sm:h-80 relative overflow-hidden bg-surface-neutral">
              <img src="{{ asset('assets/ikapi/events/article-digital-classic.jpg') }}" alt="Transformasi Digital Buku Klasik Sunda" class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500">
            </div>
            <div class="p-6 sm:p-8 flex flex-col justify-between flex-1 gap-4">
              <div class="space-y-2.5">
                <div class="flex items-center gap-2 text-[12px] text-ink-muted">
                  <span class="px-2.5 py-0.5 rounded-md bg-surface-soft text-primary font-bold uppercase tracking-wider text-[11px]">Warta Utama</span>
                  <span>•</span>
                  <span>12 November 2026</span>
                  <span>•</span>
                  <span>Redaksi IKAPI Jabar</span>
                </div>
                <h3 class="text-[20px] sm:text-[24px] font-bold text-ink-body leading-snug group-hover:text-primary transition-colors cursor-pointer" onclick="openArticleModal('art-1')">
                  Transformasi Digital Buku Klasik Sunda: Menjangkau Generasi Muda Lewat Web Reader
                </h3>
                <p class="text-[14px] sm:text-[15px] text-ink-muted leading-relaxed line-clamp-3">
                  Upaya digitalisasi naskah dan buku sejarah tatar Sunda kini mulai menuai apresiasi luas. Penerbit anggota IKAPI Jawa Barat memperkuat akses baca interaktif tanpa mengorbankan perlindungan hak cipta pengarang.
                </p>
              </div>
              <div class="pt-4 flex items-center justify-between border-t border-border-subtle">
                <button type="button" onclick="openArticleModal('art-1')" class="text-[14px] text-primary hover:text-primary-hover font-bold flex items-center gap-1.5 transition-colors">
                  <span>Baca Artikel</span>
                  <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
                <button type="button" aria-label="Bagikan Artikel" class="w-9 h-9 rounded-xl hover:bg-surface-soft text-ink-muted hover:text-primary flex items-center justify-center transition-colors border border-transparent hover:border-border-subtle" onclick="shareArticle('Transformasi Digital Buku Klasik Sunda')">
                  <span class="material-symbols-outlined text-[18px]">share</span>
                </button>
              </div>
            </div>
          </article>

          <!-- Secondary Articles Stack (5 Cols) -->
          <div class="lg:col-span-5 flex flex-col gap-4">

            <!-- Secondary Article 1 (Interview Author) -->
            <article class="p-4 sm:p-5 rounded-2xl bg-white border border-border-subtle shadow-sm hover:border-[#673de666] hover:bg-[#f5f6ff4c] transition-all flex gap-4 group">
              <div class="w-24 sm:w-28 aspect-square rounded-xl overflow-hidden bg-surface-neutral shrink-0 border border-border-subtle">
                <img src="{{ asset('assets/ikapi/events/article-interview-author.jpg') }}" alt="Wawancara Ayi R. Kurnia" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
              </div>
              <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <span class="text-[12px] text-ink-muted block mb-1">10 November 2026 • Wawancara Khusus</span>
                  <h4 class="text-[15px] sm:text-[16px] font-bold text-ink-body leading-snug line-clamp-2 group-hover:text-primary transition-colors cursor-pointer" onclick="openArticleModal('art-2')">
                    Wawancara Ayi R. Kurnia: Dari Naskah Kuno Cimanuk Menuju Novel Sejarah
                  </h4>
                </div>
                <div class="pt-2 flex items-center justify-between">
                  <button type="button" onclick="openArticleModal('art-2')" class="text-[13px] text-primary hover:text-primary-hover font-semibold flex items-center gap-1">
                    <span>Baca Selengkapnya</span>
                    <span class="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                  <button type="button" aria-label="Bagikan Artikel" class="w-7 h-7 rounded-lg text-ink-muted hover:text-primary hover:bg-white flex items-center justify-center transition-colors" onclick="shareArticle('Wawancara Ayi R. Kurnia')">
                    <span class="material-symbols-outlined text-[16px]">share</span>
                  </button>
                </div>
              </div>
            </article>

            <!-- Secondary Article 2 (School Literacy) -->
            <article class="p-4 sm:p-5 rounded-2xl bg-white border border-border-subtle shadow-sm hover:border-[#673de666] hover:bg-[#f5f6ff4c] transition-all flex gap-4 group">
              <div class="w-24 sm:w-28 aspect-square rounded-xl overflow-hidden bg-surface-neutral shrink-0 border border-border-subtle">
                <img src="{{ asset('assets/ikapi/events/article-school-literacy.jpg') }}" alt="Literasi Aksara Nusantara" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
              </div>
              <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <span class="text-[12px] text-ink-muted block mb-1">08 November 2026 • Edukasi &amp; Budaya</span>
                  <h4 class="text-[15px] sm:text-[16px] font-bold text-ink-body leading-snug line-clamp-2 group-hover:text-primary transition-colors cursor-pointer" onclick="openArticleModal('art-3')">
                    Pentingnya Pembiasaan Literasi Aksara Nusantara di Sekolah Menengah
                  </h4>
                </div>
                <div class="pt-2 flex items-center justify-between">
                  <button type="button" onclick="openArticleModal('art-3')" class="text-[13px] text-primary hover:text-primary-hover font-semibold flex items-center gap-1">
                    <span>Baca Selengkapnya</span>
                    <span class="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                  <button type="button" aria-label="Bagikan Artikel" class="w-7 h-7 rounded-lg text-ink-muted hover:text-primary hover:bg-white flex items-center justify-center transition-colors" onclick="shareArticle('Literasi Aksara Nusantara')">
                    <span class="material-symbols-outlined text-[16px]">share</span>
                  </button>
                </div>
              </div>
            </article>

          </div>

        </div>

        <!-- Empty State for Articles (Hidden by default, shown in empty-news simulation) -->
        <div id="articles-empty-state" class="hidden p-8 sm:p-12 rounded-2xl bg-white border border-border-subtle shadow-sm text-center flex-col items-center justify-center gap-3">
          <div class="w-36 sm:w-44 aspect-square flex items-center justify-center mb-1">
            <img src="{{ asset('assets/ikapi/ilustration/notfoundil.png') }}" alt="Belum Ada Artikel" class="w-full h-full object-contain">
          </div>
          <h4 class="text-[20px] font-bold text-ink-body tracking-tight">
            Belum Ada Artikel
          </h4>
          <p class="text-[14px] text-ink-muted max-w-sm">
            Belum ada artikel terbaru untuk kategori ini.
          </p>
        </div>

      </section>

    </div>
  </div>
@endsection

@push('overlays')
  <div id="modal-featured-detail" class="fixed inset-0 z-50 hidden items-center justify-center p-4 bg-[#00000099] backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="featured-modal-title">
      <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border-subtle flex flex-col animate-in fade-in zoom-in-95 duration-200">

        <!-- Modal Header Banner -->
        <div class="relative h-52 sm:h-60 w-full overflow-hidden bg-primary-deep rounded-t-3xl shrink-0">
          <img src="{{ asset('assets/ikapi/events/event-book-fair.jpg') }}" alt="Pekan Literasi Priangan 2026" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-[#000000cc] via-[#00000066] to-transparent"></div>
          <button type="button" onclick="closeFeaturedEventModal()" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#00000080] hover:bg-[#000000cc] text-white flex items-center justify-center transition-colors" aria-label="Tutup Detail">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
          <div class="absolute bottom-4 left-6 right-6 text-white">
            <span class="inline-block px-2.5 py-0.5 rounded-full bg-primary text-white text-[11px] font-bold uppercase tracking-wider mb-1.5">
              Agenda Utama IKAPI
            </span>
            <h3 id="featured-modal-title" class="text-[20px] sm:text-[24px] font-bold leading-tight">
              Pekan Literasi Priangan 2026: Merawat Naskah Kuno di Era Digital
            </h3>
          </div>
        </div>

        <!-- Modal Body Content -->
        <div class="p-6 sm:p-8 space-y-6">
          <!-- Schedule & Venue Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-neutral p-4 rounded-2xl border border-border-subtle text-[14px]">
            <div class="space-y-1">
              <span class="text-ink-muted text-[12px] font-semibold block uppercase tracking-wider">Waktu Pelaksanaan</span>
              <div class="font-bold text-ink-body flex items-center gap-1.5">
                <span class="material-symbols-outlined text-primary text-[18px]">calendar_month</span>
                <span>18 – 20 November 2026</span>
              </div>
              <p class="text-ink-muted text-[13px]">Pukul 09:00 – 17:00 WIB</p>
            </div>
            <div class="space-y-1">
              <span class="text-ink-muted text-[12px] font-semibold block uppercase tracking-wider">Lokasi Acara</span>
              <div class="font-bold text-ink-body flex items-center gap-1.5">
                <span class="material-symbols-outlined text-primary text-[18px]">location_on</span>
                <span>Gedung Indonesia Menggugat</span>
              </div>
              <p class="text-ink-muted text-[13px]">Jl. Perintis Kemerdekaan No.5, Babakan Ciamis, Bandung</p>
            </div>
          </div>

          <!-- Description & Rundown -->
          <div class="space-y-3">
            <h4 class="text-[16px] font-bold text-ink-body">Deskripsi Kegiatan</h4>
            <p class="text-[14px] text-ink-muted leading-relaxed">
              Pekan Literasi Priangan 2026 merupakan helatan akbar perbukuan Jawa Barat yang mempertemukan kurator naskah kuno nusantara, akademisi filologi, penulis sastra, dan penggiat digitalisasi literasi daerah. Kegiatan terbuka bagi pelajar, mahasiswa, peneliti, dan masyarakat umum secara gratis.
            </p>
          </div>

          <div class="space-y-3">
            <h4 class="text-[16px] font-bold text-ink-body">Rangkaian Acara</h4>
            <ul class="space-y-2 text-[14px] text-ink-muted">
              <li class="flex items-start gap-2">
                <span class="w-5 h-5 rounded-full bg-surface-soft text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span><strong>18 Nov:</strong> Pembukaan, Pameran Naskah Kuno Cirebon &amp; Galuh, dan Sarasehan Naskah Daun Lontar.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="w-5 h-5 rounded-full bg-surface-soft text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span><strong>19 Nov:</strong> Lokakarya Alih Aksara Sunda Kuno &amp; Workshop Digitalisasi E-Book Berstandar EPUB3.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="w-5 h-5 rounded-full bg-surface-soft text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span><strong>20 Nov:</strong> Bedah Buku Sejarah Pasundan, Temu Wicara Komunitas Literasi Jabar, &amp; Penutupan.</span>
              </li>
            </ul>
          </div>

          <!-- Footer Actions -->
          <div class="pt-4 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3">
            <div class="text-[13px] text-ink-muted">
              Status: <span class="text-green-700 font-semibold">Pendaftaran Terbuka (Gratis)</span>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" class="h-10 px-4 rounded-xl bg-surface-neutral hover:bg-border-subtle text-ink-body font-semibold text-[13px] transition-colors" onclick="closeFeaturedEventModal()">
                Tutup
              </button>
              <button type="button" class="h-10 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-[13px] flex items-center gap-1.5 transition-colors shadow-xs" onclick="downloadIcsFile('Pekan Literasi Priangan 2026', '20261118T090000', '20261120T170000', 'Gedung Indonesia Menggugat, Bandung', 'Festival literasi dan pameran naskah bersejarah Jawa Barat.')">
                <span class="material-symbols-outlined text-[18px]">event_available</span>
                <span>Simpan ke Kalender</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>

  <div id="modal-article-preview" class="fixed inset-0 z-50 hidden items-center justify-center p-4 bg-[#00000099] backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="article-modal-title">
      <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border-subtle flex flex-col animate-in fade-in zoom-in-95 duration-200">

        <!-- Article Header -->
        <div class="p-6 sm:p-8 border-b border-border-subtle flex items-start justify-between gap-4">
          <div>
            <span id="article-modal-category" class="px-2.5 py-0.5 rounded-md bg-surface-soft text-primary font-bold text-[11px] uppercase tracking-wider">
              Warta
            </span>
            <h3 id="article-modal-title" class="text-[20px] sm:text-[24px] font-bold text-ink-body mt-2 leading-snug">
              Judul Artikel
            </h3>
            <p id="article-modal-meta" class="text-[13px] text-ink-muted mt-1.5">
              Tanggal • Penulis
            </p>
          </div>
          <button type="button" onclick="closeArticleModal()" class="w-9 h-9 rounded-full bg-surface-neutral hover:bg-border-subtle text-ink-body flex items-center justify-center transition-colors shrink-0" aria-label="Tutup Artikel">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <!-- Article Image -->
        <div class="w-full h-56 sm:h-64 overflow-hidden bg-surface-neutral shrink-0">
          <img id="article-modal-image" src="{{ asset('assets/ikapi/events/article-digital-classic.jpg') }}" alt="Thumbnail Artikel" class="w-full h-full object-cover">
        </div>

        <!-- Article Editorial Content -->
        <div id="article-modal-body" class="p-6 sm:p-8 space-y-4 text-[15px] text-ink-body leading-relaxed">
          <!-- Injected via openArticleModal() -->
        </div>

        <!-- Article Modal Footer -->
        <div class="p-4 sm:p-6 border-t border-border-subtle bg-[#f5f5f680] rounded-b-3xl flex items-center justify-between">
          <button type="button" id="article-modal-share-btn" class="h-9 px-4 rounded-xl border border-border-subtle bg-white hover:bg-surface-soft text-primary font-semibold text-[13px] flex items-center gap-1.5 transition-colors">
            <span class="material-symbols-outlined text-[16px]">share</span>
            <span>Bagikan Artikel</span>
          </button>
          <button type="button" onclick="closeArticleModal()" class="h-9 px-5 rounded-xl bg-ink-body text-white font-medium text-[13px] hover:bg-black transition-colors">
            Selesai Membaca
          </button>
        </div>

      </div>
    </div>

  <div id="toastNotification" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-ink-body text-white shadow-xl text-[14px] font-medium border border-[#ffffff1a]">
      <span id="toastIcon" class="material-symbols-outlined text-primary-accent text-[20px]">check_circle</span>
      <span id="toastMessage">Tindakan berhasil dilakukan.</span>
    </div>
@endpush

@push('head')
<script>
window.IKAPI_P6_DATA = @json(['eventsData' => $agenda['events'], 'articlesData' => $agenda['articles']],);
</script>
@endpush
