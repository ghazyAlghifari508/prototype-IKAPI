{{--
  Kelola pengguna: tabel akun, filter peran/status, drawer detail, aksi setujui/tolak/nonaktifkan (simulasi).
  Source: docs/design/prototype-copy/admin/kelola_pengguna_desktop.html (workspace markup verbatim; shell from layouts.admin).
--}}

@extends('layouts.admin')

@section('title', 'Kelola Pengguna - Portal Administrator IKAPI Jawa Barat')

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
  .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  #publisher-sidebar { transform: translateX(-100%); transition: transform .22s ease; }
  #publisher-sidebar.is-open { transform: translateX(0); }
  @media (min-width: 1024px) { #publisher-sidebar { transform: none; transition: none; } }
  #user-drawer { transform: translateX(100%); transition: transform .24s ease; }
  #user-drawer.is-open { transform: translateX(0); }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-thumb { background: #DCDCE2; border-radius: 9999px; }
}
</style>
@endpush

@section('content')
  <!-- Heading -->
  <div class="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
    <div class="min-w-0">
      <h1 class="text-[26px] font-bold leading-tight tracking-tight text-ink lg:text-[30px]">Kelola Pengguna</h1>
      <p class="mt-1 text-[14px] text-muted">Tinjau pendaftaran penerbit dan kelola akun pengguna.</p>
    </div>
    <div class="relative">
      <button type="button" id="demo-toggle" aria-expanded="false" aria-haspopup="true" class="focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl border border-dashed border-border px-3 text-[13px] font-semibold text-muted transition-colors hover:bg-neutral hover:text-ink">
        <span class="material-symbols-outlined text-[17px]">tune</span>
        <span>Mode Demo</span>
        <span class="material-symbols-outlined text-[17px]">expand_more</span>
      </button>
      <div id="demo-menu" class="absolute right-0 top-12 z-30 hidden w-64 rounded-2xl border border-border bg-white p-1.5 shadow-[0_16px_40px_rgba(34,34,37,0.12)]" role="menu" aria-label="Pilih skenario demo">
        <button type="button" data-demo="A" role="menuitemradio" aria-checked="true" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl bg-soft px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Menunggu Persetujuan</span><span class="material-symbols-outlined demo-check text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="B" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Semua Pengguna</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="C" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Detail Penerbit</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="D" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Konfirmasi Persetujuan</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="E" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Konfirmasi Penolakan</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="F" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Konfirmasi Nonaktifkan</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <button type="button" data-demo="G" role="menuitemradio" aria-checked="false" class="demo-item focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral"><span>Notifikasi Sukses</span><span class="material-symbols-outlined demo-check hidden text-[17px] text-primary">check</span></button>
        <p class="px-3 pb-1.5 pt-2 text-[11px] leading-relaxed text-muted">Peralihan status hanya simulasi prototype.</p>
      </div>
    </div>
  </div>

  <p id="page-note" role="status" class="mb-3 hidden text-[12.5px] text-muted"></p>

  <!-- Tabs -->
  <div role="tablist" aria-label="Kategori pengguna" class="mb-3 flex w-fit items-center gap-1 rounded-xl border border-border bg-neutral p-1">
    <button type="button" role="tab" data-tab="pending" aria-selected="true" class="tab-btn focus-ring rounded-lg bg-white px-3 py-1.5 text-[12.5px] font-bold text-primary shadow-sm">
      Menunggu Persetujuan <span class="tab-count num ml-0.5 font-semibold text-muted">(2)</span>
    </button>
    <button type="button" role="tab" data-tab="all" aria-selected="false" class="tab-btn focus-ring rounded-lg px-3 py-1.5 text-[12.5px] font-semibold text-muted hover:text-ink">
      Semua Pengguna <span class="tab-count num ml-0.5 font-semibold">(4)</span>
    </button>
  </div>

  <!-- Toolbar -->
  <div class="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center">
    <div class="relative w-full lg:max-w-[320px]">
      <span class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[19px] text-muted">search</span>
      <label for="user-search" class="sr-only">Cari nama penerbit, penanggung jawab, atau email</label>
      <input id="user-search" type="search" autocomplete="off" placeholder="Cari penerbit, penanggung jawab, atau email..." class="h-10 w-full rounded-xl border border-border bg-white pl-10 pr-9 text-[14px] text-ink outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15">
      <button type="button" id="btn-clear-search" aria-label="Bersihkan pencarian" class="focus-ring absolute right-1.5 top-1/2 hidden h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-neutral hover:text-ink">
        <span class="material-symbols-outlined text-[17px]">close</span>
      </button>
    </div>
    <label for="role-filter" class="sr-only">Filter peran</label>
    <select id="role-filter" class="h-10 rounded-xl border border-border bg-white px-3 text-[13.5px] font-medium text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
      <option value="all">Semua Peran</option>
      <option value="penerbit">Penerbit</option>
      <option value="pembeli" disabled="">Pembeli (belum tersedia)</option>
    </select>
    <label for="status-filter" class="sr-only">Filter status</label>
    <select id="status-filter" class="h-10 rounded-xl border border-border bg-white px-3 text-[13.5px] font-medium text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
      <option value="all">Semua Status</option>
      <option value="pending">Menunggu Persetujuan</option>
      <option value="approved">Disetujui</option>
      <option value="rejected">Ditolak</option>
    </select>
  </div>
  <p id="filter-hint" class="mb-3 hidden text-[12px] leading-relaxed text-muted">Pada tab Menunggu Persetujuan, daftar hanya memuat pendaftaran yang belum ditinjau.</p>

  <!-- Table -->
  <div class="overflow-hidden rounded-2xl border border-border">
    <div class="overflow-x-auto">
      <table class="w-full min-w-[900px] border-collapse text-left">
        <caption class="sr-only">Daftar pengguna dan pendaftaran penerbit</caption>
        <thead>
          <tr class="border-b border-border bg-white text-[11px] uppercase tracking-[0.1em] text-muted">
            <th scope="col" class="px-5 py-3 font-bold lg:px-6">Penerbit</th>
            <th scope="col" class="w-56 px-4 py-3 font-bold">Penanggung Jawab</th>
            <th scope="col" class="w-36 px-4 py-3 font-bold">Tanggal Daftar</th>
            <th scope="col" class="w-40 px-4 py-3 font-bold">Status</th>
            <th scope="col" class="w-32 px-4 py-3 pr-5 text-right font-bold lg:pr-6">Aksi</th>
          </tr>
        </thead>
        <tbody id="user-rows" class="text-[13px]"></tbody>
      </table>
    </div>

    <div id="state-empty" class="hidden px-5 py-14 text-center">
      <p class="text-[15px] font-semibold text-ink" id="state-empty-title">Tidak Ada Pendaftaran Menunggu</p>
      <p class="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted" id="state-empty-desc">Belum ada pengajuan penerbit yang perlu ditinjau.</p>
    </div>

    <div id="state-noresults" class="hidden px-5 py-12 text-center">
      <img src="{{ asset('assets/ikapi/ilustration/notfoundil.png') }}" alt="" aria-hidden="true" class="mx-auto h-28 w-auto">
      <p class="mt-3 text-[15px] font-semibold text-ink">Pengguna Tidak Ditemukan</p>
      <p class="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">Tidak ada pengguna yang cocok dengan pencarian atau filter.</p>
      <button type="button" id="btn-reset-filter" class="focus-ring mt-4 inline-flex h-10 items-center rounded-xl border border-border px-4 text-[13.5px] font-semibold text-ink hover:bg-neutral">Bersihkan Filter</button>
    </div>

    <div class="flex flex-col gap-3 border-t border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-6">
      <p class="text-[12.5px] text-muted" id="result-summary">Menampilkan 0 dari 0 pengguna</p>
      <div class="flex items-center gap-1.5">
        <button type="button" id="page-prev" aria-label="Halaman sebelumnya" class="focus-ring grid h-8 w-8 place-items-center rounded-lg border border-border text-ink hover:bg-neutral disabled:cursor-not-allowed disabled:opacity-40">
          <span class="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>
        <span class="num min-w-8 rounded-lg bg-primary px-2 py-1 text-center text-[12.5px] font-bold text-white" id="page-current">1</span>
        <button type="button" id="page-next" aria-label="Halaman berikutnya" class="focus-ring grid h-8 w-8 place-items-center rounded-lg border border-border text-ink hover:bg-neutral disabled:cursor-not-allowed disabled:opacity-40">
          <span class="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
    </div>
  </div>
@endsection

@push('overlays')
  <div id="drawer-scrim" class="fixed inset-0 z-[60] hidden bg-[#222225]/45"></div>

  <aside id="user-drawer" class="fixed right-0 top-0 z-[70] flex h-full w-full max-w-full flex-col border-l border-border bg-white shadow-[-16px_0_40px_rgba(34,34,37,0.12)] sm:max-w-[520px]" role="dialog" aria-modal="true" aria-labelledby="drawer-title" aria-hidden="true">
    <header class="flex items-start justify-between gap-4 border-b border-divider px-5 py-4">
      <div class="min-w-0">
        <h2 id="drawer-title" class="text-[17px] font-bold tracking-tight text-ink">Detail Pendaftaran</h2>
        <p class="num mt-0.5 text-[12.5px] text-muted" id="drawer-reg">-</p>
      </div>
      <button type="button" id="drawer-close" aria-label="Tutup detail" class="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-neutral hover:text-ink">
        <span class="material-symbols-outlined text-[18px]">close</span>
      </button>
    </header>

    <div class="flex-1 space-y-5 overflow-y-auto px-5 py-4">
      <section>
        <p class="text-[15px] font-semibold leading-snug text-ink" id="drawer-name">-</p>
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <span id="drawer-status" class="text-[12px] font-semibold text-muted">-</span>
          <span id="drawer-account" class="text-[12px] font-semibold text-muted">-</span>
        </div>
        <p class="mt-2 text-[12.5px] text-muted">Diajukan <span id="drawer-date">-</span></p>
      </section>

      <section class="border-t border-divider pt-4">
        <h3 class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Informasi Penerbit</h3>
        <dl class="mt-2 space-y-2 text-[13px]">
          <div class="flex flex-wrap justify-between gap-2"><dt class="text-muted">Penanggung jawab</dt><dd class="text-right font-medium text-ink" id="drawer-pj">-</dd></div>
          <div class="flex flex-wrap justify-between gap-2"><dt class="text-muted">Email</dt><dd class="text-right text-ink" id="drawer-email">-</dd></div>
          <div class="flex flex-wrap justify-between gap-2"><dt class="text-muted">Telepon</dt><dd class="num text-right text-ink" id="drawer-phone">-</dd></div>
          <div class="flex flex-wrap justify-between gap-2"><dt class="text-muted">Alamat</dt><dd class="max-w-[62%] text-right text-ink" id="drawer-address">-</dd></div>
          <div class="flex flex-wrap justify-between gap-2"><dt class="text-muted">Nomor anggota IKAPI</dt><dd class="num text-right text-ink" id="drawer-ikapi">-</dd></div>
        </dl>
        <p class="mt-2 text-[12px] leading-relaxed text-muted">Nomor anggota tercatat pada formulir pendaftaran dan belum diverifikasi otomatis.</p>
      </section>

      <section class="border-t border-divider pt-4">
        <h3 class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Hasil Pemeriksaan</h3>
        <p class="mt-1.5 text-[13px] leading-relaxed text-muted">Periksa kesesuaian identitas penanggung jawab dan nomor keanggotaan IKAPI sebelum menyetujui pendaftaran.</p>
      </section>

      <section id="reject-reason-block" class="hidden border-t border-divider pt-4">
        <h3 class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Alasan Penolakan</h3>
        <p class="mt-1 text-[13px] leading-relaxed text-ink" id="drawer-reason">-</p>
      </section>
    </div>

    <footer class="border-t border-divider px-5 py-3">
      <div id="drawer-actions" class="flex flex-wrap items-center justify-end gap-2"></div>
    </footer>
  </aside>

  <div id="modal-approve" class="fixed inset-0 z-[80] hidden">
    <div class="absolute inset-0 bg-[#222225]/45" data-close-approve=""></div>
    <div class="relative mx-auto mt-20 max-h-[calc(100vh-4rem)] w-[calc(100%-2rem)] max-w-[440px] overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-[0_24px_60px_rgba(34,34,37,0.18)] sm:p-6" role="dialog" aria-modal="true" aria-labelledby="approve-title">
      <h2 id="approve-title" class="text-[18px] font-bold tracking-tight text-ink">Setujui Pendaftaran?</h2>
      <p class="mt-1 text-[13px] leading-relaxed text-muted">Pastikan informasi penerbit telah diperiksa sebelum menyetujui pengajuan.</p>
      <dl class="mt-3 space-y-2 text-[13px]">
        <div class="flex justify-between gap-3"><dt class="text-muted">Penerbit</dt><dd class="text-right font-semibold text-ink" id="approve-name">-</dd></div>
        <div class="flex justify-between gap-3"><dt class="text-muted">No. pendaftaran</dt><dd class="num text-ink" id="approve-reg">-</dd></div>
      </dl>
      <p class="mt-3 text-[12px] leading-relaxed text-muted">Status diperbarui pada state prototype ini saja, tanpa pengiriman email atau aktivasi akun nyata.</p>
      <div class="mt-5 flex items-center justify-end gap-2 border-t border-divider pt-4">
        <button type="button" data-close-approve="" class="focus-ring inline-flex h-10 items-center rounded-xl border border-border px-4 text-[14px] font-semibold text-ink hover:bg-neutral">Batal</button>
        <button type="button" id="btn-confirm-approve" class="focus-ring inline-flex h-10 items-center rounded-xl bg-primary px-4 text-[14px] font-semibold text-white hover:bg-primary-hover">Setujui</button>
      </div>
    </div>
  </div>

  <div id="modal-reject" class="fixed inset-0 z-[80] hidden">
    <div class="absolute inset-0 bg-[#222225]/45" data-close-reject=""></div>
    <div class="relative mx-auto mt-20 max-h-[calc(100vh-4rem)] w-[calc(100%-2rem)] max-w-[460px] overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-[0_24px_60px_rgba(34,34,37,0.18)] sm:p-6" role="dialog" aria-modal="true" aria-labelledby="reject-title">
      <h2 id="reject-title" class="text-[18px] font-bold tracking-tight text-ink">Tolak Pendaftaran</h2>
      <p class="mt-1 text-[13px] text-ink" id="reject-name">-</p>
      <p class="num text-[12.5px] text-muted" id="reject-reg">-</p>
      <label for="reject-reason" class="mt-3 block text-[12.5px] font-semibold text-ink">Alasan Penolakan <span class="text-red-500">*</span></label>
      <textarea id="reject-reason" rows="3" placeholder="Jelaskan alasan penolakan..." class="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[13.5px] leading-relaxed text-ink outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15"></textarea>
      <p id="reject-error" class="mt-1 hidden text-[12px] text-[#B42318]">Alasan penolakan wajib diisi.</p>
      <div class="mt-5 flex items-center justify-end gap-2 border-t border-divider pt-4">
        <button type="button" data-close-reject="" class="focus-ring inline-flex h-10 items-center rounded-xl border border-border px-4 text-[14px] font-semibold text-ink hover:bg-neutral">Batal</button>
        <button type="button" id="btn-confirm-reject" class="focus-ring inline-flex h-10 items-center rounded-xl bg-[#B42318] px-4 text-[14px] font-semibold text-white hover:bg-[#971B13]">Tolak Pendaftaran</button>
      </div>
    </div>
  </div>

  <div id="modal-deactivate" class="fixed inset-0 z-[80] hidden">
    <div class="absolute inset-0 bg-[#222225]/45" data-close-deactivate=""></div>
    <div class="relative mx-auto mt-24 max-h-[calc(100vh-4rem)] w-[calc(100%-2rem)] max-w-[440px] overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-[0_24px_60px_rgba(34,34,37,0.18)] sm:p-6" role="dialog" aria-modal="true" aria-labelledby="deactivate-title">
      <h2 id="deactivate-title" class="text-[18px] font-bold tracking-tight text-ink">Nonaktifkan Akun?</h2>
      <p class="mt-1 text-[13px] leading-relaxed text-muted">Akun tidak dapat mengakses portal sampai diaktifkan kembali.</p>
      <p class="mt-2 text-[13px] font-semibold text-ink" id="deactivate-name">-</p>
      <div class="mt-5 flex items-center justify-end gap-2 border-t border-divider pt-4">
        <button type="button" data-close-deactivate="" class="focus-ring inline-flex h-10 items-center rounded-xl border border-border px-4 text-[14px] font-semibold text-ink hover:bg-neutral">Batal</button>
        <button type="button" id="btn-confirm-deactivate" class="focus-ring inline-flex h-10 items-center rounded-xl bg-[#B42318] px-4 text-[14px] font-semibold text-white hover:bg-[#971B13]">Nonaktifkan</button>
      </div>
    </div>
  </div>

  <div id="toast" role="status" class="pointer-events-none fixed bottom-6 left-1/2 z-[95] hidden -translate-x-1/2 rounded-xl border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-ink shadow-[0_12px_32px_rgba(34,34,37,0.14)]">
    <span id="toast-text"></span>
  </div>
@endpush

@push('head')
<script>
  window.IKAPI_P9 = { page: 'users' };
</script>
@endpush
