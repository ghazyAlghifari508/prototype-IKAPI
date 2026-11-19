{{--
  Discussion room: heading, sort tabs, disabled create-topic UI for non-members and the topic list.
  Source: docs/design/prototype-copy/user/komunitas_literasi_desktop.html (view markup `section-chrome.html, view-view-room.html`, 3084-line SPA split into pages in P07).
  Markup, classes, ids and copy are verbatim; routing/handlers live in resources/js/ikapi/p7/community-core.js.
--}}

@php
    /** Links to screens of later phases resolve to '#' until their route exists: no dead route errors, no fake pages. */
    $links = fn (string $name, array $params = []) => \Illuminate\Support\Facades\Route::has($name) ? route($name, $params) : '#';
    $ikapiP7 = [
        'page' => 'room',
        'directoryUrl' => route('community'),
        'communityId' => $communityId ?? null,
        'topicId' => $topicId ?? null,
        'replyId' => $replyId ?? null,
    ];
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

    /* ---------- Threaded replies (avatar rail + connectors) ---------- */
    .thread-list { --thread-indent: 36px; --thread-border: #e5e7eb; }
    @media (max-width: 639px) {
      .thread-list { --thread-indent: 24px; }
    }

    .thread-node { position: relative; }
    .thread-list > .thread-node + .thread-node {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--thread-border);
    }

    .thread-row {
      display: grid;
      grid-template-columns: 36px minmax(0, 1fr);
      column-gap: 12px;
      align-items: start;
    }

    .thread-rail {
      position: relative;
      display: flex;
      justify-content: center;
      height: 100%;
    }

    /* vertical connector from below the parent avatar down to the last child */
    .thread-rail-line {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: 44px;
      bottom: -20px;
      width: 1px;
      background: var(--thread-border);
      pointer-events: none;
    }

    .thread-children {
      margin-left: var(--thread-indent);
    }

    /* elbow that turns from the parent connector into the child avatar */
    .thread-children > .thread-node {
      position: relative;
      padding-top: 20px;
    }
    .thread-children > .thread-node::before {
      content: "";
      position: absolute;
      left: calc(18px - var(--thread-indent));
      top: 0;
      width: calc(var(--thread-indent) - 18px);
      height: 38px;
      border-left: 1px solid var(--thread-border);
      border-bottom: 1px solid var(--thread-border);
      border-bottom-left-radius: 12px;
      pointer-events: none;
    }

    .thread-content { min-width: 0; }

    .thread-context {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 4px;
      font-size: 11.5px;
      font-weight: 600;
      color: var(--color-text-secondary);
    }
    .thread-context .material-symbols-outlined { font-size: 14px; }
}
</style>
@endpush


@section('title', 'Ruang Diskusi — IKAPI Store Jawa Barat')

@section('header_z', 'z-40')
@section('account', 'guest')
@section('cart_count', '2')
@section('current_route', 'community')
@section('search_placeholder', 'Cari judul buku, penulis, atau komunitas...')
@section('main_pt', 'pt-32')
@section('chatbot', '1')
@section('main_class', 'min-h-[calc(100vh-16rem)]')

@section('content')
  <div class="flex w-full flex-col" id="community-root" data-page="room" data-community="{{ $communityId ?? '' }}" data-topic="{{ $topicId ?? '' }}" data-reply="{{ $replyId ?? '' }}">
  <section class="w-full border-b border-border-subtle bg-white pt-4 pb-3">
          <div class="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between gap-3">

              <div class="min-w-0">
                <div id="top-back-profile" class="hidden">
                  <button type="button" id="btn-back-to-directory" class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border-subtle bg-white px-3.5 py-2 text-[13px] font-semibold text-ink-body transition-colors hover:bg-surface-neutral">
                    <span class="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_back</span>
                    <span>Kembali ke Direktori</span>
                  </button>
                </div>
                <div id="top-back-room" class="hidden">
                  <button type="button" id="btn-room-back" class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border-subtle bg-white px-3.5 py-2 text-[13px] font-semibold text-ink-body transition-colors hover:bg-surface-neutral">
                    <span class="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_back</span>
                    <span>Kembali ke Profil Komunitas</span>
                  </button>
                </div>
                <div id="top-back-reply" class="hidden">
                  <button type="button" id="btn-reply-back" class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border-subtle bg-white px-3.5 py-2 text-[13px] font-semibold text-ink-body transition-colors hover:bg-surface-neutral">
                    <span class="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_back</span>
                    <span>Kembali ke Diskusi</span>
                  </button>
                </div>
                <div id="top-back-topic" class="hidden">
                  <button type="button" id="btn-topic-back" class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border-subtle bg-white px-3.5 py-2 text-[13px] font-semibold text-ink-body transition-colors hover:bg-surface-neutral">
                    <span class="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_back</span>
                    <span>Kembali ke Ruang Diskusi</span>
                  </button>
                </div>
              </div>

              <details id="qa-simulation-panel" class="group shrink-0 rounded-xl border border-border-subtle bg-surface-neutral text-[12px] select-none transition-all">
                <summary class="flex cursor-pointer list-none items-center gap-2 px-3.5 py-1.5 font-medium text-ink-muted hover:text-ink-body">
                  <span class="material-symbols-outlined text-[16px] text-primary">tune</span>
                  <span>Mode Simulasi (4 State)</span>
                  <span class="material-symbols-outlined text-[16px] text-ink-muted transition-transform group-open:rotate-180">expand_more</span>
                </summary>
                <div class="absolute right-4 z-20 mt-1 flex w-[min(92vw,420px)] flex-wrap items-center gap-1.5 rounded-xl border border-border-subtle bg-white p-2.5 shadow-[0_16px_40px_rgba(34,34,37,0.12)]" role="toolbar">
                  <button id="sim-normal" type="button" class="px-3 py-1 rounded-lg bg-primary text-white font-medium transition-all shadow-xs" onclick="setSimState('normal')">
                    Direktori Normal
                  </button>
                  <button id="sim-detail" type="button" class="px-3 py-1 rounded-lg bg-surface-neutral text-ink-body hover:bg-surface-soft hover:text-primary font-medium transition-all border border-border-subtle" onclick="setSimState('detail', 'community-filologi')">
                    Mode Detail Komunitas
                  </button>
                  <button id="sim-noresults" type="button" class="px-3 py-1 rounded-lg bg-surface-neutral text-ink-body hover:bg-surface-soft hover:text-primary font-medium transition-all border border-border-subtle" onclick="setSimState('noresults')">
                    Pencarian Nihil
                  </button>
                  <button id="sim-empty" type="button" class="px-3 py-1 rounded-lg bg-surface-neutral text-ink-body hover:bg-surface-soft hover:text-primary font-medium transition-all border border-border-subtle" onclick="setSimState('empty')">
                    Data Kosong
                  </button>
                  <span aria-hidden="true" class="mx-0.5 h-4 w-px bg-border-subtle"></span>
                  <button id="demo-session-toggle" type="button" class="px-3 py-1 rounded-lg bg-surface-neutral text-ink-body hover:bg-surface-soft hover:text-primary font-medium transition-all border border-border-subtle" onclick="toggleDemoSession()">
                    Keluar sesi pembeli demo
                  </button>
                </div>
              </details>
            </div>
          </div>
        </section>

        <!-- DYNAMIC CONTENT CONTAINER (1360px Container) -->

  <div class="max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-4">
    <section id="view-room" class="hidden flex-col gap-6">

              <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div class="min-w-0">
                  <p id="room-community" class="text-[12.5px] font-semibold text-ink-muted"></p>
                  <h2 class="mt-0.5 text-[22px] font-bold tracking-tight text-ink-body sm:text-[26px]">Ruang Diskusi</h2>
                  <p class="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-ink-muted">Diskusikan buku, bagikan rekomendasi, dan bertukar pendapat dengan anggota lainnya.</p>
                </div>
                <div class="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
                  <button type="button" id="btn-new-topic" class="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 text-[13.5px] font-bold text-white transition-colors hover:bg-primary-hover">
                    <span class="material-symbols-outlined text-[18px]" aria-hidden="true">add</span>
                    <span>Buat Topik</span>
                  </button>
                  <p id="room-permission-note" class="text-[12px] text-ink-muted"></p>
                </div>
              </div>

              <div class="flex items-center gap-2" role="tablist" aria-label="Urutan diskusi">
                <button type="button" id="sort-newest" role="tab" aria-selected="true" class="sort-tab rounded-lg bg-surface-neutral px-3 py-1.5 text-[12.5px] font-bold text-primary">Terbaru</button>
                <button type="button" id="sort-last-activity" role="tab" aria-selected="false" class="sort-tab rounded-lg px-3 py-1.5 text-[12.5px] font-semibold text-ink-muted hover:text-ink-body">Aktivitas Terakhir</button>
              </div>

              <div id="topic-list" class="divide-y divide-border-subtle border-y border-border-subtle"></div>

              <div id="room-empty" class="hidden flex-col items-center justify-center rounded-2xl border border-border-subtle bg-white px-4 py-12 text-center">
                <img src="{{ asset('assets/ikapi/ilustration/community_reading.svg') }}" alt="" aria-hidden="true" class="mb-3 h-32 w-auto sm:h-40">
                <h3 class="text-[18px] font-bold tracking-tight text-ink-body">Belum ada topik diskusi</h3>
                <p class="mt-1.5 max-w-sm text-[14px] text-ink-muted">Belum ada pembahasan di komunitas ini.</p>
                <button type="button" id="btn-empty-new-topic" class="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-border-subtle bg-surface-neutral px-4 text-[13.5px] font-bold text-ink-muted" disabled="">
                  <span class="material-symbols-outlined text-[18px]" aria-hidden="true">add</span>
                  <span>Buat Topik</span>
                </button>
              </div>
            </section>
  </div>
  </div>
@endsection

@push('overlays')
  <div id="composer-modal" class="fixed inset-0 z-[85] hidden" role="dialog" aria-modal="true" aria-labelledby="composer-title" aria-describedby="composer-desc">
      <div id="composer-scrim" class="absolute inset-0 bg-[#222225]/45"></div>
      <div class="relative flex h-full items-end justify-center sm:items-center sm:p-4">
        <div class="flex max-h-full w-full flex-col overflow-hidden bg-white sm:max-w-[560px] sm:rounded-2xl sm:border sm:border-border-subtle sm:shadow-[0_20px_48px_rgba(34,34,37,0.18)]">
          <header class="border-b border-border-subtle px-5 py-4">
            <h2 id="composer-title" class="text-[17px] font-bold tracking-tight text-ink-body">Buat Topik Diskusi</h2>
            <p id="composer-desc" class="mt-0.5 text-[13px] text-ink-muted">Mulai pembahasan baru di komunitas ini.</p>
          </header>
          <div class="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <div>
              <label for="topic-title-input" class="block text-[13px] font-bold text-ink-body">Judul Topik</label>
              <input id="topic-title-input" type="text" maxlength="120" placeholder="Contoh: Novel apa yang menarik untuk dibahas bersama?" class="mt-1.5 h-11 w-full rounded-xl border border-border-subtle bg-white px-3 text-[14px] text-ink-body placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
              <p id="topic-title-error" role="alert" class="mt-1 hidden text-[12.5px] font-medium text-[#B42318]"></p>
            </div>
            <div>
              <div class="flex items-baseline justify-between gap-3">
                <label for="topic-body-input" class="block text-[13px] font-bold text-ink-body">Isi Diskusi</label>
                <span id="topic-body-counter" class="text-[12px] tabular-nums text-ink-muted">0/2000</span>
              </div>
              <textarea id="topic-body-input" rows="5" maxlength="2000" placeholder="Tulis pertanyaan atau pendapatmu agar anggota lain bisa ikut berdiskusi." class="mt-1.5 w-full resize-none rounded-xl border border-border-subtle bg-white p-3 text-[14px] leading-relaxed text-ink-body placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"></textarea>
              <p id="topic-body-error" role="alert" class="mt-1 hidden text-[12.5px] font-medium text-[#B42318]"></p>
            </div>
            <p id="composer-error" role="alert" class="hidden text-[12.5px] font-medium text-[#B42318]"></p>
          </div>
          <footer class="flex items-center justify-end gap-2 border-t border-border-subtle px-5 py-3.5">
            <button type="button" id="composer-cancel" class="h-10 cursor-pointer rounded-xl border border-border-subtle px-4 text-[13.5px] font-semibold text-ink-body transition-colors hover:bg-surface-neutral">Batal</button>
            <button type="button" id="composer-submit" class="h-10 cursor-pointer rounded-xl bg-primary px-4 text-[13.5px] font-bold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50">Terbitkan Topik</button>
          </footer>
        </div>
      </div>
    </div>

  <div id="discussion-report-modal" class="fixed inset-0 z-[86] hidden" role="dialog" aria-modal="true" aria-labelledby="discussion-report-title" aria-describedby="discussion-report-desc">
      <div id="discussion-report-scrim" class="absolute inset-0 bg-[#222225]/45"></div>
      <div class="relative flex h-full items-end justify-center sm:items-center sm:p-4">
        <div class="flex max-h-full w-full flex-col overflow-hidden bg-white sm:max-w-[480px] sm:rounded-2xl sm:border sm:border-border-subtle sm:shadow-[0_20px_48px_rgba(34,34,37,0.18)]">
          <header class="border-b border-border-subtle px-5 py-4">
            <h2 id="discussion-report-title" class="text-[17px] font-bold tracking-tight text-ink-body">Laporkan Konten</h2>
            <p id="discussion-report-desc" class="mt-0.5 text-[13px] text-ink-muted">Pilih alasan pelaporan.</p>
          </header>
          <div class="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <div class="rounded-xl border border-border-subtle bg-surface-neutral px-3.5 py-3">
              <p id="discussion-report-target" class="text-[13px] font-bold text-ink-body"></p>
              <p id="discussion-report-excerpt" class="mt-1 line-clamp-3 text-[13px] leading-relaxed text-ink-muted"></p>
            </div>
            <fieldset>
              <legend class="text-[13px] font-bold text-ink-body">Alasan</legend>
              <div id="discussion-report-reasons" class="mt-1.5 -ml-2 space-y-0.5"></div>
            </fieldset>
            <div>
              <div class="flex items-baseline justify-between gap-3">
                <label for="discussion-report-details" id="discussion-report-details-label" class="block text-[13px] font-bold text-ink-body">Keterangan tambahan (opsional)</label>
                <span id="discussion-report-counter" class="text-[12px] tabular-nums text-ink-muted">0/500</span>
              </div>
              <textarea id="discussion-report-details" rows="3" maxlength="500" placeholder="Jelaskan masalah pada konten ini..." class="mt-1.5 w-full resize-none rounded-xl border border-border-subtle bg-white p-3 text-[13.5px] leading-relaxed text-ink-body placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"></textarea>
              <p id="discussion-report-error" role="alert" class="mt-1.5 hidden text-[12.5px] font-medium text-[#B42318]"></p>
            </div>
          </div>
          <footer class="flex items-center justify-end gap-2 border-t border-border-subtle px-5 py-3.5">
            <button type="button" id="discussion-report-cancel" class="h-10 cursor-pointer rounded-xl border border-border-subtle px-4 text-[13.5px] font-semibold text-ink-body transition-colors hover:bg-surface-neutral">Batal</button>
            <button type="button" id="discussion-report-submit" class="h-10 cursor-pointer rounded-xl bg-primary px-4 text-[13.5px] font-bold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50">Kirim Laporan</button>
          </footer>
        </div>
      </div>
    </div>

  <div id="delete-modal" class="fixed inset-0 z-[86] hidden" role="dialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-desc">
      <div id="delete-scrim" class="absolute inset-0 bg-[#222225]/45"></div>
      <div class="relative flex h-full items-end justify-center sm:items-center sm:p-4">
        <div class="w-full bg-white p-5 sm:max-w-[440px] sm:rounded-2xl sm:border sm:border-border-subtle sm:shadow-[0_20px_48px_rgba(34,34,37,0.18)]">
          <h2 id="delete-title" class="text-[17px] font-bold tracking-tight text-ink-body">Hapus topik ini?</h2>
          <p id="delete-desc" class="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">Topik ini tidak lagi ditampilkan kepada anggota komunitas.</p>
          <div class="mt-5 flex items-center justify-end gap-2">
            <button type="button" id="delete-cancel" class="h-10 cursor-pointer rounded-xl border border-border-subtle px-4 text-[13.5px] font-semibold text-ink-body transition-colors hover:bg-surface-neutral">Batal</button>
            <button type="button" id="delete-confirm" class="h-10 cursor-pointer rounded-xl bg-[#B42318] px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#971B13]">Hapus</button>
          </div>
        </div>
      </div>
    </div>

  <div id="content-menu" role="menu" aria-label="Aksi konten" class="fixed z-[88] hidden w-[180px] rounded-xl border border-border-subtle bg-white p-1.5 shadow-[0_12px_32px_rgba(34,34,37,0.14)]"></div>

  <div id="leave-modal" class="fixed inset-0 z-[80] hidden" role="dialog" aria-modal="true" aria-labelledby="leave-title" aria-describedby="leave-desc">
      <div id="leave-scrim" class="absolute inset-0 bg-[#222225]/45"></div>
      <div class="relative flex h-full items-end justify-center sm:items-center sm:p-4">
        <div class="w-full bg-white p-5 sm:max-w-[440px] sm:rounded-2xl sm:border sm:border-border-subtle sm:shadow-[0_20px_48px_rgba(34,34,37,0.18)]">
          <h2 id="leave-title" class="text-[17px] font-bold tracking-tight text-ink-body">Keluar dari komunitas?</h2>
          <p id="leave-desc" class="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">Kamu tidak bisa membuat topik atau membalas diskusi setelah keluar. Topik dan balasan yang pernah kamu tulis tetap ada sesuai aturan moderasi.</p>
          <div class="mt-5 flex items-center justify-end gap-2">
            <button type="button" id="leave-cancel" class="h-10 cursor-pointer rounded-xl border border-border-subtle px-4 text-[13.5px] font-semibold text-ink-body transition-colors hover:bg-surface-neutral">Batal</button>
            <button type="button" id="leave-confirm" class="h-10 cursor-pointer rounded-xl bg-[#B42318] px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#971B13]">Keluar Komunitas</button>
          </div>
        </div>
      </div>
    </div>

  <p id="sr-announcer" role="status" aria-live="polite" class="sr-only"></p>
@endpush

@push('scripts')
<script>
  window.IKAPI_P7 = @json($ikapiP7);
</script>
@endpush
