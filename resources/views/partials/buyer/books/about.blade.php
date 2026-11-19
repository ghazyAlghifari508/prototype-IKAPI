{{--
  Sinopsis + Detail Buku. Source: section 2 of user/detail_buku_desktop.html (grid 7/5, dl divide-y).
  For books other than the prototype's reference book there is no synopsis or detail table in the source, so the
  section renders an explicit unavailable state (same empty-state styling family used elsewhere) instead of copy
  that was never designed.
--}}
@php($hasDetail = isset($book['detail']))

<section class="w-full py-12 bg-white border-t border-border-subtle">
  <div class="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

      <!-- Sinopsis (7 cols) -->
      <div class="lg:col-span-7 flex flex-col gap-4">
        <h2 class="text-[22px] md:text-[24px] font-bold text-ink-body tracking-tight">Sinopsis</h2>
        @if ($hasDetail)
          <div class="flex flex-col gap-3.5 text-[15px] text-ink-body leading-relaxed">
            @foreach ($book['detail']['synopsis'] as $paragraph)
              <p>{{ $paragraph }}</p>
            @endforeach
          </div>
        @else
          <div class="rounded-2xl bg-surface-neutral border border-border-subtle p-5 text-[14px] leading-relaxed text-ink-muted">
            Sinopsis buku ini belum tersedia di prototipe. Halaman detail penuh hanya dibuat untuk
            <span class="font-semibold text-ink-body">Laskar Aksara Pasundan</span>; buku lain menampilkan data
            katalognya saja (judul, penulis, penerbit, tahun, harga).
          </div>
        @endif
      </div>

      <!-- Detail Buku (5 cols) -->
      <div class="lg:col-span-5 flex flex-col gap-4">
        <h2 class="text-[22px] md:text-[24px] font-bold text-ink-body tracking-tight">Detail Buku</h2>
        <div class="bg-surface-neutral rounded-2xl p-5 border border-border-subtle">
          @if ($hasDetail)
            <dl class="divide-y divide-border-subtle text-[14px]">
              @foreach ($book['detail']['rows'] as $row)
                <div class="py-2.5 flex justify-between gap-4">
                  <dt class="text-ink-muted">{{ $row['label'] }}</dt>
                  <dd class="font-bold {{ $row['label'] === 'Penerbit' ? 'text-primary' : 'text-ink-body' }} text-right">{{ $row['value'] }}</dd>
                </div>
              @endforeach
            </dl>
          @else
            <dl class="divide-y divide-border-subtle text-[14px]">
              <div class="py-2.5 flex justify-between gap-4">
                <dt class="text-ink-muted">Penulis</dt>
                <dd class="font-bold text-ink-body text-right">{{ $book['author'] }}</dd>
              </div>
              <div class="py-2.5 flex justify-between gap-4">
                <dt class="text-ink-muted">Penerbit</dt>
                <dd class="font-bold text-primary text-right">{{ $book['publisher'] }}</dd>
              </div>
              <div class="py-2.5 flex justify-between gap-4">
                <dt class="text-ink-muted">Tahun Terbit</dt>
                <dd class="font-bold text-ink-body text-right">{{ $book['year'] }}</dd>
              </div>
              <div class="py-2.5 flex justify-between gap-4">
                <dt class="text-ink-muted">Kategori</dt>
                <dd class="font-bold text-ink-body text-right">{{ $book['category'] }}</dd>
              </div>
            </dl>
          @endif
        </div>
      </div>

    </div>
  </div>
</section>