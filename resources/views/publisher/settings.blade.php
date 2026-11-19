{{--
  Pengaturan profil penerbit: identitas, rekening, modal konfirmasi dan peringatan perubahan belum disimpan.
  Source: docs/design/prototype-copy/penerbit/pengaturan_profil_desktop.html (workspace markup verbatim; shell from layouts.publisher).
  Routing/handlers: resources/js/ikapi/p8/settings.js
--}}

@extends('layouts.publisher')

@section('title', 'Pengaturan Profil — Portal Penerbit IKAPI Jawa Barat')

@section('manual_shell', '1')

@push('head')
<style>
@layer utilities {
:root { --topbar-h: 64px; --sidebar-w: 248px; }
  html, body { margin: 0; padding: 0; }
  body { font-family: 'DM Sans', system-ui, sans-serif; background: #FFFFFF; color: #222225; }
  .shell-main { margin-left: 0; }
  @media (min-width: 1024px) { .shell-main { margin-left: var(--sidebar-w); } }
  .banner-bleed { margin-left: 0; }
  @media (min-width: 1024px) { .banner-bleed { margin-left: calc(-1 * var(--sidebar-w)); } }
  #publisher-sidebar { top: var(--topbar-h); }
  .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .num { font-variant-numeric: tabular-nums; }
  .focus-ring:focus-visible { outline: 2px solid #673DE6; outline-offset: 2px; }
  .focus-ring-light:focus-visible { outline: 2px solid #FFFFFF; outline-offset: 2px; }
  #publisher-sidebar { transform: translateX(-100%); transition: transform .22s ease; }
  #publisher-sidebar.is-open { transform: translateX(0); }
  @media (min-width: 1024px) { #publisher-sidebar { transform: none; transition: none; } }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-thumb { background: #DCDCE2; border-radius: 9999px; }
}
</style>
@endpush

@section('content')
  <!-- Heading -->
  <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
    <div class="min-w-0">
      <h1 class="text-[26px] font-bold leading-tight tracking-tight text-ink lg:text-[30px]">Pengaturan Profil</h1>
      <p class="mt-1 text-[14px] text-muted">Kelola informasi penerbit dan rekening pencairan.</p>
    </div>
    <div class="relative">
      <button type="button" id="demo-toggle" aria-expanded="false" aria-haspopup="true" class="focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl border border-dashed border-border px-3 text-[13px] font-semibold text-muted transition-colors hover:bg-neutral hover:text-ink">
        <span class="material-symbols-outlined text-[17px]">tune</span>
        <span>Mode Demo</span>
        <span class="material-symbols-outlined text-[17px]">expand_more</span>
      </button>
      <div id="demo-menu" class="absolute right-0 top-12 z-30 hidden w-64 rounded-2xl border border-border bg-white p-1.5 shadow-[0_16px_40px_rgba(34,34,37,0.12)]" role="menu" aria-label="Pilih skenario demo">
        <button type="button" data-demo="A" role="menuitemradio" aria-checked="true" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl bg-soft px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Terisi Lengkap</span><span class="material-symbols-outlined demo-check text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="B" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Rekening Belum Ada</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="C" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Tambah / Ubah Rekening</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="D" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Validasi Error</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="E" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Sedang Menyimpan</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="F" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Sukses Tersimpan</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="G" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Belum Disimpan</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="H" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Gagal Memuat</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <p class="px-3 pb-1.5 pt-2 text-[11px] leading-relaxed text-muted">Peralihan status hanya simulasi prototype.</p>
      </div>
    </div>
  </div>

  <!-- Error state H -->
  <div id="view-error" class="hidden rounded-2xl border border-border p-6">
    <div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-start gap-3">
        <span class="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-neutral text-ink">
          <span class="material-symbols-outlined text-[18px]">cloud_off</span>
        </span>
        <div>
          <h2 class="text-[16px] font-bold text-ink">Data Pengaturan Belum Dapat Dimuat</h2>
          <p class="mt-1 max-w-xl text-[13px] leading-relaxed text-muted">Terjadi kendala saat memuat informasi akun. Coba lagi.</p>
        </div>
      </div>
      <button type="button" id="btn-retry" class="focus-ring inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-[14px] font-semibold text-white hover:bg-primary-hover">
        <span class="material-symbols-outlined text-[18px]">refresh</span><span>Coba Lagi</span>
      </button>
    </div>
  </div>

  <div id="view-main" class="space-y-4">

    <!-- ===== A. PROFIL PENERBIT ===== -->
    <section aria-labelledby="profile-title" class="rounded-2xl border border-border bg-white p-5 lg:p-6">
      <div class="mb-4">
        <h2 id="profile-title" class="text-[17px] font-bold tracking-tight text-ink">Informasi Penerbit</h2>
        <p class="mt-0.5 text-[13px] text-muted">Perbarui informasi dan kontak penerbit.</p>
      </div>

      <form id="profile-form" novalidate="" class="space-y-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label for="p-name" class="mb-1.5 block text-[12.5px] font-semibold text-ink">Nama Penerbit</label>
            <input id="p-name" name="name" type="text" autocomplete="organization" class="h-11 w-full rounded-xl border border-border bg-white px-3.5 text-[14px] text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15">
            <p class="mt-1 hidden text-[12px] text-[#B42318]" data-err="name">Nama penerbit wajib diisi.</p>
          </div>
          <div>
            <label for="p-pic" class="mb-1.5 block text-[12.5px] font-semibold text-ink">Penanggung Jawab</label>
            <input id="p-pic" name="pic" type="text" autocomplete="name" class="h-11 w-full rounded-xl border border-border bg-white px-3.5 text-[14px] text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15">
            <p class="mt-1 hidden text-[12px] text-[#B42318]" data-err="pic">Nama penanggung jawab wajib diisi.</p>
          </div>
          <div>
            <label for="p-email" class="mb-1.5 block text-[12.5px] font-semibold text-ink">Email Resmi Akun</label>
            <input id="p-email" name="email" type="email" readonly="" aria-readonly="true" class="num h-11 w-full cursor-not-allowed rounded-xl border border-border bg-neutral px-3.5 text-[14px] text-muted outline-none">
          </div>
          <div>
            <label for="p-phone" class="mb-1.5 block text-[12.5px] font-semibold text-ink">Nomor Telepon Kantor / WhatsApp</label>
            <input id="p-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" class="num h-11 w-full rounded-xl border border-border bg-white px-3.5 text-[14px] text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15">
            <p class="mt-1 hidden text-[12px] text-[#B42318]" data-err="phone">Masukkan nomor telepon yang valid (8–16 digit).</p>
          </div>
        </div>

        <div>
          <label for="p-address" class="mb-1.5 block text-[12.5px] font-semibold text-ink">Alamat Kantor Penerbit</label>
          <textarea id="p-address" name="address" rows="3" class="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"></textarea>
          <p class="mt-1 hidden text-[12px] text-[#B42318]" data-err="address">Alamat kantor wajib diisi.</p>
        </div>

        <div class="rounded-xl border border-border px-3.5 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Nomor Anggota IKAPI</p>
          <p class="num mt-1 text-[13.5px] font-semibold text-ink" id="p-member">041/JBA/2020</p>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-2 border-t border-divider pt-4">
          <p class="mr-auto hidden text-[12.5px] text-muted" id="profile-dirty-note">Ada perubahan belum disimpan.</p>
          <button type="button" id="btn-profile-cancel" disabled="" class="focus-ring inline-flex h-10 items-center rounded-xl border border-border px-4 text-[13.5px] font-semibold text-ink transition-colors hover:bg-neutral disabled:cursor-not-allowed disabled:opacity-40">Batal</button>
          <button type="submit" id="btn-profile-save" disabled="" class="focus-ring inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50">
            <span id="profile-save-label">Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </section>

    <!-- ===== B. REKENING PENCAIRAN ===== -->
    <section aria-labelledby="bank-title" class="rounded-2xl border border-border bg-white p-5 lg:p-6">
      <div class="mb-4">
        <h2 id="bank-title" class="text-[17px] font-bold tracking-tight text-ink">Rekening Pencairan</h2>
        <p class="mt-0.5 text-[13px] text-muted">Rekening tujuan penerimaan dana penerbit.</p>
      </div>

      <!-- Summary -->
      <div id="bank-summary">
        <dl class="space-y-1">
          <div><dt class="sr-only">Bank</dt><dd class="text-[13.5px] font-semibold text-ink" id="bank-name">Bank Central Asia (BCA)</dd></div>
          <div><dt class="sr-only">Nama pemilik</dt><dd class="text-[13px] text-muted" id="bank-holder">PT Kiblat Buku Utama</dd></div>
          <div><dt class="sr-only">Nomor rekening</dt><dd class="num text-[13px] text-muted" id="bank-masked">•••• 4892</dd></div>
        </dl>
        <button type="button" id="btn-bank-edit" class="focus-ring mt-4 inline-flex h-10 items-center rounded-xl border border-border px-4 text-[13.5px] font-semibold text-ink transition-colors hover:bg-neutral">Ubah Rekening</button>
      </div>

      <!-- Empty state -->
      <div id="bank-empty" class="hidden">
        <p class="text-[13.5px] font-semibold text-ink">Belum Ada Rekening Bank</p>
        <p class="mt-1 max-w-md text-[13px] leading-relaxed text-muted">Tambahkan rekening tujuan sebelum mengajukan pencairan dana.</p>
        <button type="button" id="btn-bank-add" class="focus-ring mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-[13.5px] font-semibold text-white hover:bg-primary-hover">
          <span class="material-symbols-outlined text-[18px]">add</span><span>Tambah Rekening</span>
        </button>
      </div>

      <!-- Inline form -->
      <form id="bank-form" novalidate="" class="mt-4 hidden border-t border-divider pt-4">
        <p class="mb-3 text-[13px] font-semibold text-ink" id="bank-form-title">Ubah Rekening Bank</p>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label for="b-bank" class="mb-1.5 block text-[12.5px] font-semibold text-ink">Nama Bank</label>
            <select id="b-bank" class="h-11 w-full rounded-xl border border-border bg-white px-3 text-[14px] text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
              <option value="">Pilih bank</option>
              <option>Bank Central Asia (BCA)</option>
              <option>Bank Mandiri</option>
              <option>Bank Rakyat Indonesia (BRI)</option>
              <option>Bank Negara Indonesia (BNI)</option>
              <option>Bank BJB (Bank Pembangunan Daerah Jabar Banten)</option>
            </select>
            <p class="mt-1 hidden text-[12px] text-[#B42318]" data-berr="bank">Nama bank wajib dipilih.</p>
          </div>
          <div>
            <label for="b-holder" class="mb-1.5 block text-[12.5px] font-semibold text-ink">Nama Pemilik Rekening</label>
            <input id="b-holder" type="text" placeholder="Nama lengkap sesuai buku tabungan" class="h-11 w-full rounded-xl border border-border bg-white px-3.5 text-[14px] text-ink outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15">
            <p class="mt-1 hidden text-[12px] text-[#B42318]" data-berr="holder">Nama pemilik rekening wajib diisi.</p>
          </div>
          <div class="sm:col-span-2">
            <label for="b-number" class="mb-1.5 block text-[12.5px] font-semibold text-ink">Nomor Rekening</label>
            <input id="b-number" type="text" inputmode="numeric" autocomplete="off" placeholder="Masukkan nomor rekening" class="num h-11 w-full rounded-xl border border-border bg-white px-3.5 text-[14px] text-ink outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15">
            <p class="mt-1 hidden text-[12px] text-[#B42318]" data-berr="number">Nomor rekening wajib diisi (minimal 8 digit).</p>
          </div>
        </div>
        <div class="mt-4 flex flex-wrap items-center justify-end gap-2">
          <button type="button" id="btn-bank-cancel" class="focus-ring inline-flex h-10 items-center rounded-xl border border-border px-4 text-[13.5px] font-semibold text-ink hover:bg-neutral">Batal</button>
          <button type="submit" id="btn-bank-review" class="focus-ring inline-flex h-10 items-center rounded-xl bg-primary px-4 text-[13.5px] font-semibold text-white hover:bg-primary-hover">Tinjau Perubahan</button>
        </div>
      </form>
    </section>

  </div>
@endsection

@push('overlays')
  <div id="modal-bank-confirm" class="fixed inset-0 z-[70] hidden">
    <div class="absolute inset-0 bg-[#222225]/45" data-close-bank-confirm=""></div>
    <div class="relative mx-auto mt-20 max-h-[calc(100vh-4rem)] w-[calc(100%-2rem)] max-w-[460px] overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-[0_24px_60px_rgba(34,34,37,0.18)] sm:p-6" role="dialog" aria-modal="true" aria-labelledby="bank-confirm-title">
      <div class="mb-3 flex items-start justify-between gap-4">
        <h2 id="bank-confirm-title" class="text-[18px] font-bold tracking-tight text-ink">Konfirmasi Perubahan Rekening</h2>
        <button type="button" data-close-bank-confirm="" aria-label="Tutup" class="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-neutral hover:text-ink">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
      <p class="text-[13px] leading-relaxed text-muted">Periksa kembali rekening tujuan pencairan.</p>
      <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div class="rounded-xl border border-border p-3.5">
          <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Rekening sebelumnya</p>
          <p class="mt-1 text-[13px] font-semibold text-ink" id="confirm-old-bank">-</p>
          <p class="num text-[12.5px] text-muted" id="confirm-old-account">-</p>
        </div>
        <div class="rounded-xl border border-border p-3.5">
          <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Rekening baru</p>
          <p class="mt-1 text-[13px] font-semibold text-ink" id="confirm-new-bank">-</p>
          <p class="num text-[12.5px] text-muted" id="confirm-new-account">-</p>
        </div>
      </div>
      <p class="mt-3 text-[12px] leading-relaxed text-muted">Perubahan disimpan pada prototype ini dan tidak mengubah data rekening sungguhan.</p>
      <div class="mt-5 flex items-center justify-end gap-2 border-t border-divider pt-4">
        <button type="button" data-close-bank-confirm="" class="focus-ring inline-flex h-10 items-center rounded-xl border border-border px-4 text-[14px] font-semibold text-ink hover:bg-neutral">Kembali</button>
        <button type="button" id="btn-bank-confirm" class="focus-ring inline-flex h-10 items-center rounded-xl bg-primary px-4 text-[14px] font-semibold text-white hover:bg-primary-hover">Konfirmasi Perubahan</button>
      </div>
    </div>
  </div>

  <div id="modal-unsaved" class="fixed inset-0 z-[70] hidden">
    <div class="absolute inset-0 bg-[#222225]/45" data-close-unsaved=""></div>
    <div class="relative mx-auto mt-24 w-[calc(100%-2rem)] max-w-[420px] rounded-2xl border border-border bg-white p-5 shadow-[0_24px_60px_rgba(34,34,37,0.18)] sm:p-6" role="dialog" aria-modal="true" aria-labelledby="unsaved-title">
      <h2 id="unsaved-title" class="text-[18px] font-bold tracking-tight text-ink">Buang Perubahan?</h2>
      <p class="mt-1 text-[13px] leading-relaxed text-muted">Perubahan yang belum disimpan akan hilang.</p>
      <div class="mt-5 flex items-center justify-end gap-2 border-t border-divider pt-4">
        <button type="button" data-close-unsaved="" class="focus-ring inline-flex h-10 items-center rounded-xl border border-border px-4 text-[14px] font-semibold text-ink hover:bg-neutral">Tetap di Halaman</button>
        <button type="button" id="btn-discard" class="focus-ring inline-flex h-10 items-center rounded-xl bg-[#B42318] px-4 text-[14px] font-semibold text-white hover:bg-[#971B13]">Buang</button>
      </div>
    </div>
  </div>

  <div id="toast" role="status" class="pointer-events-none fixed bottom-6 left-1/2 z-[80] hidden -translate-x-1/2 rounded-xl border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-ink shadow-[0_12px_32px_rgba(34,34,37,0.14)]">
    <span id="toast-text"></span>
  </div>
@endpush

@push('head')
<script>
  window.IKAPI_P8 = { page: 'settings' };
</script>
@endpush
