@extends('layouts.admin')

@section('title', 'Showcase shell administrator - IKAPI Jawa Barat')

@section('content')
  <div class="mb-6">
    <p class="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">P04 - showcase shell administrator</p>
    <h1 class="mt-1 text-[26px] font-bold leading-tight tracking-tight text-ink lg:text-[30px]">Shell Portal Administrator</h1>
    <p class="mt-1 text-[14px] text-muted">Shell yang sama, menu berbeda: dua heading, 8 item admin, tanpa item penerbit.</p>
  </div>

  <div class="flex flex-wrap gap-2">
    <button type="button" data-ikapi-modal-open="demo-modal" class="focus-ring inline-flex h-10 items-center rounded-xl bg-primary px-4 text-[14px] font-semibold text-white hover:bg-primary-hover">Buka modal</button>
  </div>

@endsection

@section('overlays')
  <x-ikapi.modal id="demo-modal" title="Setujui Pendaftaran?" :width="440" :z="80">
    <p class="mt-1 text-[13px] leading-relaxed text-muted">Frame yang sama dengan modal admin di prototype (z-80).</p>
    <x-slot:footer>
      <button type="button" data-ikapi-modal-close class="focus-ring inline-flex h-10 items-center rounded-xl border border-border px-4 text-[14px] font-semibold text-ink hover:bg-neutral">Batal</button>
    </x-slot:footer>
  </x-ikapi.modal>
@endsection
