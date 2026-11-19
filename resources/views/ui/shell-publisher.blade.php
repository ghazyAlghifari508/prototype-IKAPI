@extends('layouts.publisher')

@section('title', 'Showcase shell penerbit - IKAPI Jawa Barat')

@section('content')
  <div class="mb-6">
    <p class="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">P04 - showcase shell penerbit</p>
    <h1 class="mt-1 text-[26px] font-bold leading-tight tracking-tight text-ink lg:text-[30px]">Shell Portal Penerbit</h1>
    <p class="mt-1 text-[14px] text-muted">Topbar, banner geometris, sidebar 248px, dan workspace. Menu hanya milik penerbit.</p>
  </div>

  <div class="flex flex-wrap gap-2">
    <button type="button" data-ikapi-modal-open="demo-modal" class="focus-ring inline-flex h-10 items-center rounded-xl bg-primary px-4 text-[14px] font-semibold text-white hover:bg-primary-hover">Buka modal</button>
    <button type="button" id="demo-toast" class="focus-ring inline-flex h-10 items-center rounded-xl border border-border px-4 text-[14px] font-semibold text-ink hover:bg-neutral">Tampilkan toast</button>
  </div>


@endsection

@section('overlays')
  <x-ikapi.modal id="demo-modal" title="Contoh modal portal" :width="440" :z="70">
    <p class="mt-1 text-[13px] leading-relaxed text-muted">Fokus masuk ke panel, scroll dikunci, Escape dan klik latar menutup.</p>
    <x-slot:footer>
      <button type="button" data-ikapi-modal-close class="focus-ring inline-flex h-10 items-center rounded-xl border border-border px-4 text-[14px] font-semibold text-ink hover:bg-neutral">Tutup</button>
    </x-slot:footer>
  </x-ikapi.modal>
  <x-ikapi.toast />
@endsection

@push('scripts')
<script>
  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('demo-toast').addEventListener('click', function () {
      window.IkapiToast.show('Toast portal ditampilkan 2,8 detik.');
    });
  });
</script>
@endpush
