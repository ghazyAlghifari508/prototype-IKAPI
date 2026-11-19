{{--
  Publisher application status (demo states via ?sesi=).
  Source: docs/design/prototype-copy/user/status_pendaftaran_penerbit_desktop.html (419 lines). Markup, classes, ids and copy are verbatim; only links,
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
    body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; overflow-x: clip; }
    .focus-ring:focus-visible { outline: 2px solid #673de6; outline-offset: 2px; }
    .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
}
</style>
@endpush

@section('title', 'Status Pendaftaran Penerbit — IKAPI Jawa Barat')

@section('body_class', 'min-h-screen bg-surface-neutral text-ink-body antialiased')

@section('content')
  <header class="border-b border-border-subtle bg-white">
      <div class="mx-auto flex h-16 w-full max-w-[1080px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="{{ $links('home') }}" class="flex items-center gap-3" aria-label="Beranda IKAPI Jawa Barat">
          <img src="{{ asset('assets/ikapi/logo-ikapi-jabar.png') }}" alt="Logo IKAPI Jawa Barat" class="h-7 w-auto object-contain">
          <span class="text-[14px] font-semibold text-ink-muted">IKAPI Store</span>
        </a>
        <span class="text-[13px] font-semibold text-ink-muted">Status Pendaftaran</span>
      </div>
    </header>
  <main class="mx-auto w-full max-w-[1080px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

      <div class="mx-auto w-full max-w-[640px]">

        <!-- Shown only when the dashboard guard sent the visitor here -->
        <p id="access-blocked" class="mb-4 hidden rounded-xl border border-border-subtle bg-white px-4 py-3 text-[13px] leading-relaxed text-ink-muted" role="status"></p>

        <section class="rounded-2xl border border-border-subtle bg-white px-5 py-7 sm:px-8 sm:py-9" aria-labelledby="status-heading">

          <!-- Status -->
          <p id="status-line" class="flex items-center gap-2 text-[13px] font-semibold text-ink-muted" role="status" aria-live="polite">
            <span class="material-symbols-outlined text-[18px]" id="status-icon" aria-hidden="true">hourglass_top</span>
            <span id="status-label">Menunggu persetujuan</span>
          </p>

          <h1 id="status-heading" class="mt-3 text-[22px] font-bold leading-snug tracking-tight text-ink-body sm:text-[24px]">
            Pendaftaran penerbit sedang ditinjau
          </h1>
          <p id="status-description" class="mt-2 text-[14px] leading-relaxed text-ink-muted">
            Data pendaftaranmu sudah diterima. Tim IKAPI sedang memeriksa pengajuan sebelum akun penerbit dapat digunakan.
          </p>

          <!-- Detail pengajuan -->
          <div id="detail-block" class="mt-7 border-t border-border-subtle pt-6">
            <h2 class="text-[12.5px] font-bold uppercase tracking-[0.06em] text-ink-muted">Detail pengajuan</h2>
            <dl class="mt-3 space-y-3 text-[14px]" id="detail-rows">
              <div class="flex items-start justify-between gap-4">
                <dt class="text-ink-muted">Nama penerbit</dt>
                <dd id="detail-name" class="max-w-[62%] break-words text-right font-semibold text-ink-body">-</dd>
              </div>
              <div class="flex items-start justify-between gap-4">
                <dt class="text-ink-muted">Tanggal pengajuan</dt>
                <dd id="detail-date" class="text-right font-semibold text-ink-body">-</dd>
              </div>
              <div class="flex items-start justify-between gap-4">
                <dt class="text-ink-muted">Status</dt>
                <dd id="detail-status" class="text-right font-semibold text-ink-body">-</dd>
              </div>
            </dl>
            <p id="detail-empty" class="mt-3 hidden text-[13px] leading-relaxed text-ink-muted">
              Data pengajuan belum tersedia pada prototype ini.
            </p>
          </div>

          <!-- Alasan penolakan (only when the administrator recorded one) -->
          <div id="reason-block" class="mt-7 hidden border-t border-border-subtle pt-6">
            <h2 class="text-[12.5px] font-bold uppercase tracking-[0.06em] text-ink-muted">Alasan penolakan</h2>
            <p id="reason-text" class="mt-2 text-[14px] leading-relaxed text-ink-body"></p>
          </div>

          <!-- Next steps -->
          <div class="mt-7 border-t border-border-subtle pt-6">
            <h2 id="next-heading" class="text-[14px] font-bold text-ink-body">Apa selanjutnya?</h2>
            <p id="next-text" class="mt-1.5 text-[14px] leading-relaxed text-ink-muted"></p>
          </div>

          <!-- Access notice -->
          <div id="notice-block" class="mt-6 rounded-xl border border-border-subtle bg-surface-neutral px-4 py-3.5">
            <p id="notice-heading" class="text-[13.5px] font-bold text-ink-body"></p>
            <p id="notice-text" class="mt-1 text-[13px] leading-relaxed text-ink-muted"></p>
          </div>

          <!-- Actions for the current status and authentication condition -->
          <div class="mt-7 flex flex-col gap-2.5 sm:flex-row-reverse sm:justify-start" id="action-block"></div>
        </section>

        <!-- Demo preview control: separated from the status hierarchy -->
        <details id="demo-block" class="mt-6 rounded-xl border border-border-subtle bg-white px-4 py-3 text-[12.5px]">
          <summary class="cursor-pointer font-semibold text-ink-muted">Mode Demo - Status Pengajuan</summary>
          <div class="mt-3 space-y-3">
            <p class="text-ink-muted">Pratinjau tampilan tiap status. Pilihan ini hanya mengubah tampilan simulasi dan tidak mengubah status akun atau keputusan Administrator.</p>
            <div class="flex flex-wrap gap-1.5" id="demo-chips" role="group" aria-label="Skenario demo status pengajuan"></div>
            <p class="text-ink-muted">Pada prototype ini pengajuan tidak dikirim ke sistem administrasi IKAPI yang sesungguhnya.</p>
          </div>
        </details>

      </div>
    </main>
@endsection

@push('overlays')
  <div id="toast" class="pointer-events-none fixed bottom-6 left-1/2 z-50 hidden -translate-x-1/2 rounded-xl border border-border-subtle bg-white px-4 py-2.5 text-[13px] font-semibold text-ink-body shadow-[0_12px_32px_rgba(34,34,37,0.14)]">
      <span id="toast-text"></span>
    </div>
@endpush
