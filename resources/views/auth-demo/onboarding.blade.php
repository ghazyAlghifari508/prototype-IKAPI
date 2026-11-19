{{--
  Reading-preferences onboarding wizard (4 steps, localStorage).
  Source: docs/design/prototype-copy/user/onboarding_preferensi_bacaan_desktop.html (381 lines). Markup, classes, ids and copy are verbatim; only links,
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
html, body { margin: 0; padding: 0; }
  body { font-family: 'DM Sans', system-ui, sans-serif; background: #F5F5F6; color: #222225; }
  .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .focus-ring:focus-visible { outline: 2px solid #673DE6; outline-offset: 2px; }
  .step-panel { animation: fade .18s ease-out; }
  .checklist-ring { stroke-dasharray: 145; stroke-dashoffset: 145; animation: ring .45s ease-out forwards; }
  .checklist-check { stroke-dasharray: 40; stroke-dashoffset: 40; animation: check .35s ease-out .35s forwards; }
  @keyframes ring { to { stroke-dashoffset: 0; } }
  @keyframes check { to { stroke-dashoffset: 0; } }
  @keyframes fade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) {
    .step-panel, .checklist-ring, .checklist-check { animation: none !important; stroke-dashoffset: 0 !important; }
    *, *::before, *::after { transition: none !important; }
  }
}
</style>
@endpush

@section('title', 'Preferensi Bacaan - IKAPI Store Jawa Barat')

@section('body_class', 'min-h-screen antialiased')

@section('content')
  <main class="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col px-4 py-6 sm:px-6">
    <div class="grid flex-1 grid-cols-1 overflow-hidden rounded-3xl border border-border bg-white lg:grid-cols-12">

      <!-- Illustration panel -->
      <div class="relative flex items-center justify-center bg-white px-6 py-8 lg:col-span-5 lg:px-10">
        <img src="{{ asset('assets/ikapi/ilustration/back-to-back-reading-companions-transparent.png') }}" alt="Dua pembaca duduk saling membelakangi sambil membaca buku" class="mx-auto h-auto w-full max-w-[400px] object-contain select-none">
      </div>

      <!-- Wizard panel -->
      <div class="col-span-1 flex flex-col justify-center bg-white p-6 sm:p-9 lg:col-span-7 lg:p-12">
        <div class="mx-auto w-full max-w-[460px]">

          <!-- Progress -->
          <div id="progress-block" class="mb-8">
            <p class="text-[12px] font-semibold text-muted" id="step-label">Langkah 1 dari 4</p>
            <div class="mt-2 flex items-center gap-1.5" role="progressbar" aria-valuemin="1" aria-valuemax="4" aria-valuenow="1" aria-label="Kemajuan onboarding" id="step-progress">
              <span class="h-1.5 flex-1 rounded-full bg-primary" data-bar="1"></span>
              <span class="h-1.5 flex-1 rounded-full bg-neutral" data-bar="2"></span>
              <span class="h-1.5 flex-1 rounded-full bg-neutral" data-bar="3"></span>
              <span class="h-1.5 flex-1 rounded-full bg-neutral" data-bar="4"></span>
            </div>
          </div>

          <!-- STEP 1 -->
          <section class="step-panel" data-step="1">
            <h1 class="text-[24px] font-bold leading-snug tracking-tight text-ink sm:text-[26px]">Kategori buku apa yang kamu sukai?</h1>
            <p class="mt-1.5 text-[14px] text-muted">Pilih kategori yang menarik buatmu. Bisa lebih dari satu.</p>

            <div class="mt-5 flex flex-wrap gap-2" role="group" aria-label="Kategori buku">
              <button type="button" class="option-card focus-ring inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[13.5px] font-medium text-ink transition-colors hover:border-primary hover:text-primary" data-category="sastra" aria-pressed="false">
                <span>Sastra &amp; Fiksi</span>
                <span class="material-symbols-outlined hidden text-[16px] text-primary option-check">check_circle</span>
              </button>
              <button type="button" class="option-card focus-ring inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[13.5px] font-medium text-ink transition-colors hover:border-primary hover:text-primary" data-category="pendidikan" aria-pressed="false">
                <span>Pendidikan</span>
                <span class="material-symbols-outlined hidden text-[16px] text-primary option-check">check_circle</span>
              </button>
              <button type="button" class="option-card focus-ring inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[13.5px] font-medium text-ink transition-colors hover:border-primary hover:text-primary" data-category="budaya" aria-pressed="false">
                <span>Budaya &amp; Tradisi</span>
                <span class="material-symbols-outlined hidden text-[16px] text-primary option-check">check_circle</span>
              </button>
              <button type="button" class="option-card focus-ring inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[13.5px] font-medium text-ink transition-colors hover:border-primary hover:text-primary" data-category="bisnis" aria-pressed="false">
                <span>Bisnis &amp; Ekonomi</span>
                <span class="material-symbols-outlined hidden text-[16px] text-primary option-check">check_circle</span>
              </button>
              <button type="button" class="option-card focus-ring inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[13.5px] font-medium text-ink transition-colors hover:border-primary hover:text-primary" data-category="anak" aria-pressed="false">
                <span>Anak &amp; Remaja</span>
                <span class="material-symbols-outlined hidden text-[16px] text-primary option-check">check_circle</span>
              </button>
              <button type="button" class="option-card focus-ring inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[13.5px] font-medium text-ink transition-colors hover:border-primary hover:text-primary" data-category="sejarah" aria-pressed="false">
                <span>Sejarah &amp; Biografi</span>
                <span class="material-symbols-outlined hidden text-[16px] text-primary option-check">check_circle</span>
              </button>
              <button type="button" class="option-card focus-ring inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[13.5px] font-medium text-ink transition-colors hover:border-primary hover:text-primary" data-category="sains" aria-pressed="false">
                <span>Sains &amp; Teknologi</span>
                <span class="material-symbols-outlined hidden text-[16px] text-primary option-check">check_circle</span>
              </button>
              <button type="button" class="option-card focus-ring inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[13.5px] font-medium text-ink transition-colors hover:border-primary hover:text-primary" data-category="agama" aria-pressed="false">
                <span>Agama &amp; Filsafat</span>
                <span class="material-symbols-outlined hidden text-[16px] text-primary option-check">check_circle</span>
              </button>
              <button type="button" class="option-card focus-ring inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[13.5px] font-medium text-ink transition-colors hover:border-primary hover:text-primary" data-category="kesehatan" aria-pressed="false">
                <span>Kesehatan &amp; Gaya Hidup</span>
                <span class="material-symbols-outlined hidden text-[16px] text-primary option-check">check_circle</span>
              </button>
              <button type="button" class="option-card focus-ring inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[13.5px] font-medium text-ink transition-colors hover:border-primary hover:text-primary" data-category="seni" aria-pressed="false">
                <span>Seni &amp; Desain</span>
                <span class="material-symbols-outlined hidden text-[16px] text-primary option-check">check_circle</span>
              </button>
              <button type="button" class="option-card focus-ring inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[13.5px] font-medium text-ink transition-colors hover:border-primary hover:text-primary" data-category="bahasa" aria-pressed="false">
                <span>Bahasa &amp; Sastra Daerah</span>
                <span class="material-symbols-outlined hidden text-[16px] text-primary option-check">check_circle</span>
              </button>
              <button type="button" class="option-card focus-ring inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[13.5px] font-medium text-ink transition-colors hover:border-primary hover:text-primary" data-category="lainnya" aria-pressed="false">
                <span>Lainnya</span>
                <span class="material-symbols-outlined hidden text-[16px] text-primary option-check">check_circle</span>
              </button>
            </div>

            <div class="mt-6 flex items-center justify-between gap-3">
              <button type="button" id="btn-skip" class="focus-ring rounded-lg px-1 py-1 text-[13px] font-semibold text-muted transition-colors hover:text-ink">Lewati untuk Sekarang</button>
              <button type="button" class="next-btn focus-ring inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-[14px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50" data-next="2" disabled="">
                <span>Lanjutkan</span>
                <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </section>

          <!-- STEP 2 -->
          <section class="step-panel hidden" data-step="2">
            <h1 class="text-[24px] font-bold leading-snug tracking-tight text-ink sm:text-[26px]">Kamu lebih suka gaya bacaan seperti apa?</h1>
            <p class="mt-1.5 text-[14px] text-muted">Pilih cara penyampaian yang paling nyaman buatmu.</p>

            <div class="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2" role="group" aria-label="Gaya bacaan">
              <button type="button" class="option-card focus-ring flex items-start justify-between gap-3 rounded-xl border border-border px-4 py-3.5 text-left transition-colors hover:bg-neutral" data-style="ringan" aria-pressed="false">
                <span>
                  <span class="block text-[13.5px] font-semibold text-ink">Ringan &amp; mudah diikuti</span>
                  <span class="mt-0.5 block text-[12.5px] leading-relaxed text-muted">Bahasanya sederhana dan mudah dipahami.</span>
                </span>
                <span class="material-symbols-outlined hidden text-[18px] text-primary option-check">check_circle</span>
              </button>
              <button type="button" class="option-card focus-ring flex items-start justify-between gap-3 rounded-xl border border-border px-4 py-3.5 text-left transition-colors hover:bg-neutral" data-style="mendalam" aria-pressed="false">
                <span>
                  <span class="block text-[13.5px] font-semibold text-ink">Mendalam &amp; detail</span>
                  <span class="mt-0.5 block text-[12.5px] leading-relaxed text-muted">Pembahasannya lengkap dan terperinci.</span>
                </span>
                <span class="material-symbols-outlined hidden text-[18px] text-primary option-check">check_circle</span>
              </button>
              <button type="button" class="option-card focus-ring flex items-start justify-between gap-3 rounded-xl border border-border px-4 py-3.5 text-left transition-colors hover:bg-neutral" data-style="naratif" aria-pressed="false">
                <span>
                  <span class="block text-[13.5px] font-semibold text-ink">Naratif &amp; bercerita</span>
                  <span class="mt-0.5 block text-[12.5px] leading-relaxed text-muted">Disampaikan lewat alur cerita yang mengalir.</span>
                </span>
                <span class="material-symbols-outlined hidden text-[18px] text-primary option-check">check_circle</span>
              </button>
                                      <button type="button" class="option-card focus-ring flex items-start justify-between gap-3 rounded-xl border border-border px-4 py-3.5 text-left transition-colors hover:bg-neutral" data-style="inspiratif" aria-pressed="false">
                <span>
                  <span class="block text-[13.5px] font-semibold text-ink">Inspiratif &amp; reflektif</span>
                  <span class="mt-0.5 block text-[12.5px] leading-relaxed text-muted">Mengajak merenung dan menambah wawasan.</span>
                </span>
                <span class="material-symbols-outlined hidden text-[18px] text-primary option-check">check_circle</span>
              </button>
            </div>

            <div class="mt-6 flex items-center justify-between gap-3">
              <button type="button" class="back-btn focus-ring inline-flex h-11 items-center gap-1.5 rounded-xl border border-border px-4 text-[14px] font-semibold text-ink transition-colors hover:bg-neutral" data-back="1">
                <span class="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Kembali</span>
              </button>
              <button type="button" class="next-btn focus-ring inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-[14px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50" data-next="3" disabled="">
                <span>Lanjutkan</span>
                <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </section>

          <!-- STEP 3 -->
          <section class="step-panel hidden" data-step="3">
            <h1 class="text-[24px] font-bold leading-snug tracking-tight text-ink sm:text-[26px]">Berapa lama kamu biasanya membaca dalam sehari?</h1>
            <p class="mt-1.5 text-[14px] text-muted">Tidak masalah kalau cuma sebentar, ini hanya untuk menyesuaikan rekomendasi.</p>

            <div class="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="Durasi membaca harian">
              <label class="focus-ring flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border px-4 py-3.5 transition-colors hover:bg-neutral">
                <span class="text-[14px] font-medium text-ink">Kurang dari 15 menit</span>
                <input type="radio" name="duration" value="lt15" class="h-4 w-4 accent-primary">
              </label>
              <label class="focus-ring flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border px-4 py-3.5 transition-colors hover:bg-neutral">
                <span class="text-[14px] font-medium text-ink">15 - 30 menit</span>
                <input type="radio" name="duration" value="15-30" class="h-4 w-4 accent-primary">
              </label>
              <label class="focus-ring flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border px-4 py-3.5 transition-colors hover:bg-neutral">
                <span class="text-[14px] font-medium text-ink">30 - 60 menit</span>
                <input type="radio" name="duration" value="30-60" class="h-4 w-4 accent-primary">
              </label>
              <label class="focus-ring flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border px-4 py-3.5 transition-colors hover:bg-neutral">
                <span class="text-[14px] font-medium text-ink">1 - 2 jam</span>
                <input type="radio" name="duration" value="1-2" class="h-4 w-4 accent-primary">
              </label>
              <label class="focus-ring flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border px-4 py-3.5 transition-colors hover:bg-neutral">
                <span class="text-[14px] font-medium text-ink">Lebih dari 2 jam</span>
                <input type="radio" name="duration" value="gt2" class="h-4 w-4 accent-primary">
              </label>
            </div>

            <div class="mt-6 flex items-center justify-between gap-3">
              <button type="button" class="back-btn focus-ring inline-flex h-11 items-center gap-1.5 rounded-xl border border-border px-4 text-[14px] font-semibold text-ink transition-colors hover:bg-neutral" data-back="2">
                <span class="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Kembali</span>
              </button>
              <button type="button" id="btn-finish" class="focus-ring inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-[14px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50" disabled="">
                <span>Lanjutkan</span>
                <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </section>

          <!-- COMPLETION -->
          <section class="step-panel hidden text-center" data-step="4">
            <div class="mx-auto grid h-20 w-20 place-items-center">
              <svg viewBox="0 0 52 52" class="h-20 w-20" role="img" aria-label="Preferensi bacaan tersimpan">
                <circle class="checklist-ring" cx="26" cy="26" r="23" fill="none" stroke="#673DE6" stroke-width="2.5" stroke-linecap="round"></circle>
                <path class="checklist-check" d="M15 27.5 L23 35 L38 18" fill="none" stroke="#0F7B4F" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"></path>
              </svg>
            </div>
            <h1 class="mt-7 text-[24px] font-bold leading-snug tracking-tight text-ink">Preferensi bacaan tersimpan</h1>
            <p class="mx-auto mt-2.5 max-w-[24rem] text-[14px] leading-relaxed text-muted">Kamu bisa langsung menelusuri katalog buku yang tersedia.</p>
            <a href="{{ $links('books.index') }}" class="focus-ring mt-9 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-[14px] font-semibold text-white transition-colors hover:bg-primary-hover">
              <span>Jelajahi Katalog</span>
              <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
          </section>
        </div>
      </div>
    </div>
  </main>
@endsection
