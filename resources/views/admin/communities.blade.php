{{--
  Kelola komunitas: tabel komunitas (state buyer), drawer tambah/ubah, visibilitas (simulasi admin).
  Source: docs/design/prototype-copy/admin/kelola_komunitas_desktop.html (workspace markup verbatim; shell from layouts.admin).
--}}

@extends('layouts.admin')

@section('title', 'Kelola Komunitas - Portal Administrator IKAPI Jawa Barat')

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
  #community-drawer { transform: translateX(100%); transition: transform .24s ease; }
  #community-drawer.is-open { transform: translateX(0); }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-thumb { background: #DCDCE2; border-radius: 9999px; }
}
</style>
@endpush

@section('content')
  <div class="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
    <div class="min-w-0">
      <h1 class="text-[26px] font-bold leading-tight tracking-tight text-ink lg:text-[30px]">Kelola Komunitas</h1>
      <p class="mt-1 text-[14px] text-muted">Atur komunitas yang tersedia di direktori IKAPI Store.</p>
    </div>
    <div class="flex items-center gap-2">
      <div class="relative">
        <button type="button" id="demo-toggle" aria-expanded="false" aria-haspopup="true" class="focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl border border-dashed border-border px-3 text-[13px] font-semibold text-muted transition-colors hover:bg-neutral hover:text-ink">
          <span class="material-symbols-outlined text-[17px]">tune</span>
          <span>Mode Demo</span>
          <span class="material-symbols-outlined text-[17px]">expand_more</span>
        </button>
        <div id="demo-menu" class="absolute right-0 top-12 z-30 hidden w-72 rounded-2xl border border-border bg-white p-1.5 shadow-[0_16px_40px_rgba(34,34,37,0.12)]" role="menu" aria-label="Pilih skenario demo">
          <button type="button" data-demo="reset" role="menuitem" class="focus-ring flex w-full items-center rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-neutral">Kembalikan data komunitas awal</button>
          <p class="px-3 pb-1.5 pt-2 text-[11px] leading-relaxed text-muted">Data komunitas disimpan di browser ini untuk keperluan prototype.</p>
        </div>
      </div>
      <button type="button" id="btn-add" class="focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-[13.5px] font-semibold text-white hover:bg-primary-hover">
        <span class="material-symbols-outlined text-[18px]">add</span>
        <span>Tambah Komunitas</span>
      </button>
    </div>
  </div>

  <p id="page-note" role="status" class="mb-3 hidden text-[12.5px] text-muted"></p>

  <div class="mb-3 flex flex-wrap items-center gap-2">
    <div class="relative min-w-[220px] flex-1">
      <label for="community-search" class="sr-only">Cari komunitas</label>
      <span class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-muted">search</span>
      <input id="community-search" type="search" placeholder="Cari nama komunitas..." class="h-10 w-full rounded-xl border border-border bg-white pl-9 pr-3 text-[13.5px] text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
    </div>
    <label for="status-filter" class="sr-only">Filter status komunitas</label>
    <select id="status-filter" class="h-10 rounded-xl border border-border bg-white px-3 text-[13.5px] font-medium text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
      <option value="all">Semua Status</option>
      <option value="active">Aktif</option>
      <option value="inactive">Nonaktif</option>
    </select>
  </div>

  <div class="overflow-x-auto rounded-2xl border border-border bg-white">
    <table class="w-full min-w-[720px] border-collapse text-left">
      <thead>
        <tr class="border-b border-divider bg-white text-[11px] uppercase tracking-[0.06em] text-muted">
          <th scope="col" class="px-4 py-3 font-bold">Komunitas</th>
          <th scope="col" class="px-4 py-3 font-bold">Fokus</th>
          <th scope="col" class="px-4 py-3 font-bold">Wilayah</th>
          <th scope="col" class="px-4 py-3 font-bold">Status</th>
          <th scope="col" class="px-4 py-3 pr-5 text-right font-bold">Aksi</th>
        </tr>
      </thead>
      <tbody id="community-rows" class="text-[13px]"></tbody>
    </table>
  </div>

  <p id="table-summary" class="mt-3 text-[12.5px] text-muted"></p>

  <div id="state-empty" class="mt-3 hidden rounded-2xl border border-border bg-white px-5 py-14 text-center">
    <p class="text-[15px] font-semibold text-ink">Tidak Ada Komunitas</p>
    <p class="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">Belum ada komunitas yang cocok dengan pencarian atau filter ini.</p>
  </div>
@endsection

@push('overlays')
  <div id="drawer-scrim" class="fixed inset-0 z-[60] hidden bg-[#222225]/45"></div>

  <aside id="community-drawer" class="fixed right-0 top-0 z-[70] flex h-full w-full max-w-full flex-col border-l border-border bg-white shadow-[-16px_0_40px_rgba(34,34,37,0.12)] sm:max-w-[520px]" role="dialog" aria-modal="true" aria-labelledby="drawer-title" aria-hidden="true">
    <header class="flex items-start justify-between gap-4 border-b border-divider px-5 py-4">
      <div class="min-w-0">
        <h2 id="drawer-title" class="text-[17px] font-bold tracking-tight text-ink">Detail Komunitas</h2>
        <p class="num mt-0.5 text-[12.5px] text-muted" id="drawer-id">-</p>
      </div>
      <button type="button" id="drawer-close" aria-label="Tutup detail" class="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-neutral hover:text-ink">
        <span class="material-symbols-outlined text-[18px]">close</span>
      </button>
    </header>

    <div class="flex-1 space-y-5 overflow-y-auto px-5 py-4">
      <!-- view mode -->
      <div id="drawer-view" class="space-y-5">
        <section>
          <h3 class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Identitas</h3>
          <div class="mt-2 flex items-start gap-3">
            <img id="view-photo" src="" alt="" class="h-16 w-24 shrink-0 rounded-lg border border-border object-cover">
            <div class="min-w-0">
              <p class="text-[15px] font-semibold leading-snug text-ink" id="view-name">-</p>
              <p class="mt-0.5 text-[12.5px] text-muted" id="view-focus">-</p>
            </div>
          </div>
        </section>

        <section class="border-t border-divider pt-4">
          <dl class="space-y-2 text-[13px]">
            <div class="flex justify-between gap-3"><dt class="text-muted">Wilayah</dt><dd class="text-right font-medium text-ink" id="view-location">-</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-muted">Status</dt><dd class="text-right font-semibold text-ink" id="view-status">-</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-muted">Jumlah topik</dt><dd class="num text-ink" id="view-topics">-</dd></div>
          </dl>
        </section>

        <section class="border-t border-divider pt-4">
          <h3 class="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Deskripsi singkat</h3>
          <p class="mt-1.5 text-[13.5px] leading-relaxed text-ink" id="view-short">-</p>
          <h3 class="mt-4 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Deskripsi lengkap</h3>
          <p class="mt-1.5 text-[13.5px] leading-relaxed text-ink" id="view-full">-</p>
        </section>
      </div>

      <!-- form mode -->
      <form id="drawer-form" class="hidden space-y-4" novalidate="">
        <div>
          <label for="form-name" class="text-[12.5px] font-semibold text-ink">Nama komunitas</label>
          <input id="form-name" type="text" maxlength="80" class="mt-1 h-10 w-full rounded-xl border border-border px-3 text-[13.5px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
          <p class="mt-1 hidden text-[12px] text-[#B42318]" id="err-name">Nama komunitas wajib diisi.</p>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="form-focus" class="text-[12.5px] font-semibold text-ink">Fokus</label>
            <select id="form-focus" class="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-[13.5px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
              <option value="filologi">Filologi &amp; Aksara Kuno</option>
              <option value="fiksi">Klub Baca Fiksi</option>
              <option value="sejarah">Sejarah Priangan</option>
            </select>
          </div>
          <div>
            <label for="form-status" class="text-[12.5px] font-semibold text-ink">Status</label>
            <select id="form-status" class="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-[13.5px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        </div>
        <div>
          <label for="form-location" class="text-[12.5px] font-semibold text-ink">Wilayah</label>
          <input id="form-location" type="text" maxlength="80" class="mt-1 h-10 w-full rounded-xl border border-border px-3 text-[13.5px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
          <p class="mt-1 hidden text-[12px] text-[#B42318]" id="err-location">Wilayah wajib diisi.</p>
        </div>
        <div>
          <label for="form-short" class="text-[12.5px] font-semibold text-ink">Deskripsi singkat</label>
          <textarea id="form-short" rows="2" maxlength="180" class="mt-1 w-full resize-none rounded-xl border border-border p-3 text-[13.5px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"></textarea>
          <p class="mt-1 hidden text-[12px] text-[#B42318]" id="err-short">Deskripsi singkat wajib diisi.</p>
        </div>
        <div>
          <label for="form-full" class="text-[12.5px] font-semibold text-ink">Deskripsi lengkap</label>
          <textarea id="form-full" rows="4" maxlength="600" class="mt-1 w-full resize-none rounded-xl border border-border p-3 text-[13.5px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"></textarea>
        </div>
        <div>
          <label for="form-photo" class="text-[12.5px] font-semibold text-ink">Foto komunitas</label>
          <select id="form-photo" class="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-[13.5px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"></select>
          <img id="form-photo-preview" src="" alt="" class="mt-2 h-24 w-36 rounded-lg border border-border object-cover">
          <p class="mt-1 text-[11.5px] leading-relaxed text-muted">Pilih dari aset ilustrasi yang tersedia. Unggah berkas belum didukung pada prototype ini.</p>
        </div>
        <p id="form-error" role="alert" class="hidden text-[12.5px] font-medium text-[#B42318]"></p>
      </form>
    </div>

    <footer class="flex items-center justify-between gap-2 border-t border-divider px-5 py-3.5">
      <button type="button" id="btn-toggle-status" class="focus-ring hidden h-10 items-center rounded-xl border border-border px-4 text-[13.5px] font-semibold text-ink hover:bg-neutral">Nonaktifkan</button>
      <div class="ml-auto flex items-center gap-2">
        <button type="button" id="btn-edit" class="focus-ring hidden h-10 items-center rounded-xl border border-border px-4 text-[13.5px] font-semibold text-ink hover:bg-neutral">Edit</button>
        <button type="button" id="btn-cancel-form" class="focus-ring hidden h-10 items-center rounded-xl border border-border px-4 text-[13.5px] font-semibold text-ink hover:bg-neutral">Batal</button>
        <button type="button" id="btn-save" class="focus-ring hidden h-10 items-center rounded-xl bg-primary px-4 text-[13.5px] font-semibold text-white hover:bg-primary-hover">Simpan</button>
      </div>
    </footer>
  </aside>

  <div id="toast" role="status" class="pointer-events-none fixed bottom-6 left-1/2 z-[95] hidden -translate-x-1/2 rounded-xl border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-ink shadow-[0_12px_32px_rgba(34,34,37,0.14)]">
    <span id="toast-text"></span>
  </div>
@endpush

@push('head')
<script>
  window.IKAPI_P9 = { page: 'communities' };
</script>
@endpush
