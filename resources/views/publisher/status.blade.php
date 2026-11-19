@extends('layouts.auth')

@section('title', 'Status Pendaftaran Penerbit — IKAPI Jawa Barat')

@section('content')
<div class="min-h-screen bg-surface-neutral">

  {{-- Simple header --}}
  <header class="border-b border-border-subtle bg-white">
    <div class="mx-auto flex h-16 w-full max-w-[1080px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <a href="{{ route('home') }}" class="flex items-center gap-3" aria-label="Beranda IKAPI Jawa Barat">
        <span class="text-[14px] font-semibold text-ink-body">IKAPI Store</span>
      </a>
      <span class="text-[13px] font-semibold text-ink-muted">Status Pendaftaran</span>
    </div>
  </header>

  <main class="mx-auto w-full max-w-[1080px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
    <div class="mx-auto w-full max-w-[640px]">

      {{-- Success status banner --}}
      @if (session('status'))
        <div class="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-emerald-800" role="status">
          <span class="material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-emerald-600">check_circle</span>
          <p class="flex-1 text-[13px] font-semibold">{{ session('status') }}</p>
        </div>
      @endif

      <section class="rounded-2xl border border-border-subtle bg-white px-5 py-7 sm:px-8 sm:py-9" aria-labelledby="status-heading">

        @if (auth()->check() && auth()->user()->isPublisher())
          @php
            $reg = auth()->user()->publisherRegistration;
            $status = $reg ? $reg->status : 'pending';
          @endphp

          {{-- Status indicator --}}
          <p class="flex items-center gap-2 text-[13px] font-semibold
            {{ $status === 'approved' ? 'text-emerald-700' : ($status === 'rejected' ? 'text-red-600' : 'text-ink-muted') }}"
            role="status" aria-live="polite">
            <span class="material-symbols-outlined text-[18px]" aria-hidden="true">
              {{ $status === 'approved' ? 'check_circle' : ($status === 'rejected' ? 'cancel' : 'hourglass_top') }}
            </span>
            <span>
              {{ $status === 'approved' ? 'Pendaftaran disetujui' : ($status === 'rejected' ? 'Pendaftaran ditolak' : 'Menunggu persetujuan') }}
            </span>
          </p>

          <h1 id="status-heading" class="mt-3 text-[22px] font-bold leading-snug tracking-tight text-ink-body sm:text-[24px]">
            @if ($status === 'approved')
              Akun penerbit Anda telah disetujui
            @elseif ($status === 'rejected')
              Pendaftaran penerbit ditolak
            @else
              Pendaftaran penerbit sedang ditinjau
            @endif
          </h1>
          <p class="mt-2 text-[14px] leading-relaxed text-ink-muted">
            @if ($status === 'approved')
              Selamat! Anda kini dapat mengakses Dashboard Penerbit dan mulai mengelola buku di IKAPI Store.
            @elseif ($status === 'rejected')
              Mohon maaf, pengajuan pendaftaran penerbit Anda tidak memenuhi persyaratan. Anda dapat menghubungi administrator untuk informasi lebih lanjut.
            @else
              Data pendaftaranmu sudah diterima. Tim IKAPI sedang memeriksa pengajuan sebelum akun penerbit dapat digunakan.
            @endif
          </p>

          {{-- Detail pengajuan --}}
          @if ($reg)
            <div class="mt-7 border-t border-border-subtle pt-6">
              <h2 class="text-[12.5px] font-bold uppercase tracking-[0.06em] text-ink-muted">Detail pengajuan</h2>
              <dl class="mt-3 space-y-3 text-[14px]">
                <div class="flex items-start justify-between gap-4">
                  <dt class="text-ink-muted">Nama penerbit</dt>
                  <dd class="max-w-[62%] break-words text-right font-semibold text-ink-body">{{ $reg->publisher_name }}</dd>
                </div>
                <div class="flex items-start justify-between gap-4">
                  <dt class="text-ink-muted">Tanggal pengajuan</dt>
                  <dd class="text-right font-semibold text-ink-body">{{ $reg->created_at->format('d M Y') }}</dd>
                </div>
                <div class="flex items-start justify-between gap-4">
                  <dt class="text-ink-muted">Status</dt>
                  <dd class="text-right font-semibold
                    {{ $status === 'approved' ? 'text-emerald-700' : ($status === 'rejected' ? 'text-red-600' : 'text-amber-600') }}">
                    {{ $status === 'approved' ? 'Disetujui' : ($status === 'rejected' ? 'Ditolak' : 'Menunggu Verifikasi') }}
                  </dd>
                </div>
              </dl>
            </div>

            {{-- Alasan penolakan --}}
            @if ($status === 'rejected' && $reg->rejection_reason)
              <div class="mt-7 border-t border-border-subtle pt-6">
                <h2 class="text-[12.5px] font-bold uppercase tracking-[0.06em] text-ink-muted">Alasan penolakan</h2>
                <p class="mt-2 text-[14px] leading-relaxed text-ink-body">{{ $reg->rejection_reason }}</p>
              </div>
            @endif
          @endif

          {{-- Langkah selanjutnya --}}
          <div class="mt-7 border-t border-border-subtle pt-6">
            <h2 class="text-[14px] font-bold text-ink-body">Apa selanjutnya?</h2>
            <p class="mt-1.5 text-[14px] leading-relaxed text-ink-muted">
              @if ($status === 'approved')
                Masuk ke Dashboard Penerbit untuk mulai mengelola katalog buku, memantau penjualan, dan mengatur profil penerbit Anda.
              @elseif ($status === 'rejected')
                Hubungi tim IKAPI Jawa Barat untuk mendiskusikan langkah selanjutnya atau mengajukan pendaftaran ulang.
              @else
                Proses verifikasi biasanya membutuhkan 2-5 hari kerja. Anda akan menerima notifikasi melalui email terdaftar setelah keputusan diambil.
              @endif
            </p>
          </div>

          {{-- Notice block --}}
          <div class="mt-6 rounded-xl border border-border-subtle bg-surface-neutral px-4 py-3.5">
            @if ($status === 'approved')
              <p class="text-[13.5px] font-bold text-ink-body">Dashboard sudah bisa diakses</p>
              <p class="mt-1 text-[13px] leading-relaxed text-ink-muted">Gunakan email dan kata sandi yang didaftarkan untuk masuk ke Portal Penerbit.</p>
            @elseif ($status === 'rejected')
              <p class="text-[13.5px] font-bold text-ink-body">Butuh bantuan?</p>
              <p class="mt-1 text-[13px] leading-relaxed text-ink-muted">Hubungi Sekretariat IKAPI Jawa Barat di <span class="font-semibold text-ink-body">ikapi.jabar@gmail.com</span> untuk informasi lebih lanjut.</p>
            @else
              <p class="text-[13.5px] font-bold text-ink-body">Belum bisa mengakses Dashboard Penerbit</p>
              <p class="mt-1 text-[13px] leading-relaxed text-ink-muted">Akses akan tersedia otomatis setelah pendaftaran disetujui oleh tim IKAPI Jawa Barat.</p>
            @endif
          </div>

          {{-- Action buttons --}}
          <div class="mt-7 flex flex-col gap-2.5 sm:flex-row-reverse sm:justify-start">
            @if ($status === 'approved')
              <a href="{{ route('publisher.dashboard') }}"
                class="focus-ring flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-[14px] font-bold text-white hover:bg-primary-hover">
                <span>Buka Dashboard Penerbit</span>
                <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
              </a>
            @else
              <a href="{{ route('home') }}"
                class="focus-ring flex h-11 items-center justify-center gap-2 rounded-xl border border-border-subtle bg-white px-5 text-[14px] font-semibold text-ink-body hover:bg-surface-neutral">
                Kembali ke Beranda
              </a>
            @endif

            <form method="POST" action="{{ route('logout') }}">
              @csrf
              <button type="submit"
                class="focus-ring flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border-subtle bg-white px-5 text-[14px] font-semibold text-ink-body hover:bg-surface-neutral sm:w-auto">
                <span class="material-symbols-outlined text-[18px]">logout</span>
                Keluar
              </button>
            </form>
          </div>

        @else
          {{-- Not logged in / not publisher --}}
          <div class="text-center space-y-4">
            <span class="material-symbols-outlined text-[48px] text-ink-muted">lock</span>
            <h1 id="status-heading" class="text-[22px] font-bold text-ink-body">Akses Terbatas</h1>
            <p class="text-[14px] text-ink-muted">Halaman ini hanya dapat diakses oleh penerbit yang terdaftar.</p>
            <a href="{{ route('login', ['role' => 'publisher']) }}"
              class="focus-ring inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-[14px] font-bold text-white hover:bg-primary-hover">
              <span>Masuk sebagai Penerbit</span>
              <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
          </div>
        @endif

      </section>
    </div>
  </main>
</div>
@endsection
