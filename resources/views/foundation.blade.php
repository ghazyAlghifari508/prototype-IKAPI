<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fondasi P03 - IKAPI Store Jawa Barat</title>

  {{-- Same webfont sources as the prototype pages, so font metrics match the golden screenshots. --}}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;0,7..72,700;1,7..72,400&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
  @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-h-screen bg-canvas text-ink-body font-sans antialiased">
  <main class="mx-auto flex w-full max-w-[1360px] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">

    <header class="border-b border-border-subtle pb-6">
      <p class="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-muted">P03 - bukti pipeline</p>
      <h1 class="mt-1 text-[34px] font-bold leading-tight tracking-tight text-ink-body">Fondasi Laravel Blade + Tailwind 4 + aset</h1>
      <p class="mt-2 max-w-[70ch] text-[15px] leading-relaxed text-ink-muted">
        Halaman uji terisolasi untuk membuktikan token, font, aset, dan layer demo state sudah benar sebelum
        halaman prototype dikonversi. Bukan halaman produk: rute ini tidak muncul di navigasi mana pun.
      </p>
      <p class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-muted">
        <span class="inline-flex items-center gap-1"><span class="material-symbols-outlined text-[17px]">palette</span> token terukur dari prototype</span>
        <span class="inline-flex items-center gap-1"><span class="material-symbols-outlined text-[17px]">image</span> {{ count($assetSample) }} aset contoh dari public/assets/ikapi</span>
        <span class="inline-flex items-center gap-1"><span class="material-symbols-outlined text-[17px]">database</span> fixture dibaca dari resources/data/ikapi</span>
      </p>
    </header>

    <section class="grid gap-6 lg:grid-cols-2">
      <div class="rounded-2xl border border-border-subtle bg-surface p-5">
        <h2 class="text-[18px] font-bold text-ink-body">Token warna</h2>
        <ul class="mt-4 grid grid-cols-2 gap-3 text-[12px] text-ink-muted">
          @foreach ($swatches as $class => $hex)
            <li class="flex items-center gap-2">
              <span class="h-6 w-6 shrink-0 rounded-lg border border-border-subtle {{ $class }}"></span>
              <span class="font-mono">{{ $class }}</span>
              <span class="text-ink-subtle">{{ $hex }}</span>
            </li>
          @endforeach
        </ul>
      </div>

      <div class="rounded-2xl border border-border-subtle bg-surface p-5">
        <h2 class="text-[18px] font-bold text-ink-body">Tipografi & radius</h2>
        <p class="mt-3 text-[16px] leading-relaxed">Body 16px DM Sans, line-height 1.5, warna <code class="font-mono text-[13px]">#222225</code>.</p>
        <p class="mt-2 text-[40px] font-bold leading-[1.2] tracking-tight">Judul komunitas 40px</p>
        <p class="mt-2 text-[34px] font-bold leading-[1.25] tracking-tight">Judul katalog 34px</p>
        <p class="mt-2 text-[30px] font-bold leading-[1.25] tracking-tight">Judul portal 30px</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <span class="rounded-xl border border-border-subtle bg-surface-neutral px-3 py-1.5 text-[13px] font-semibold">radius-xl 12px</span>
          <span class="rounded-2xl border border-border-subtle bg-surface-soft px-3 py-1.5 text-[13px] font-semibold">radius-2xl 16px</span>
          <span class="rounded-3xl border border-border-subtle bg-surface-neutral px-3 py-1.5 text-[13px] font-semibold">radius-3xl 24px</span>
          <span class="rounded-full border border-border-subtle bg-surface-soft px-3 py-1.5 text-[13px] font-semibold">pill 9999px</span>
        </div>
      </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-2" id="preflight-parity">
      <div class="rounded-2xl border border-border-subtle bg-surface p-5">
        <h2 class="text-[18px] font-bold text-ink-body">Parity preflight</h2>
        <ul class="mt-4 space-y-3 text-[13px]">
          <li class="rounded-xl border bg-surface-soft p-3">
            <span class="font-semibold">border tanpa warna</span>
            <span class="block text-ink-muted">harus memakai <code class="font-mono">#e5e7eb</code> (perilaku Tailwind 3 CDN)</span>
          </li>
          <li class="rounded-xl border border-border-subtle bg-surface shadow-sm p-3">
            <span class="font-semibold">shadow-sm</span>
            <span class="block text-ink-muted">nilai v3 <code class="font-mono">0 1px 2px rgb(0 0 0 / .05)</code> dipulihkan lewat <code class="font-mono">--shadow-sm</code></span>
          </li>
          <li class="rounded-xl border border-border-subtle bg-surface shadow-xs p-3">
            <span class="font-semibold">shadow-xs</span>
            <span class="block text-ink-muted">dinolkan agar sama dengan prototype (kelas tidak ada di v3)</span>
          </li>
          <li class="border-t border-border-subtle pt-3">
            <span class="font-semibold">placeholder</span>
            <input type="text" placeholder="Warna placeholder #9ca3af" class="mt-2 h-11 w-full rounded-xl border border-border-subtle bg-surface-neutral px-4 text-[14px] outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-[#673de633]">
          </li>
          <li class="border-t border-border-subtle pt-3">
            <span class="font-semibold">fokus</span>
            <button type="button" class="focus-ring mt-2 h-10 rounded-xl bg-primary px-4 text-[13px] font-bold text-white">Tombol focus-ring</button>
          </li>
        </ul>
      </div>

      <div class="rounded-2xl border border-border-subtle bg-surface p-5">
        <h2 class="text-[18px] font-bold text-ink-body">Aset & ikon</h2>
        <div class="mt-4 grid grid-cols-2 gap-3">
          @foreach ($assetSample as $asset)
            <figure class="overflow-hidden rounded-xl border border-border-subtle bg-surface-neutral">
              <img src="{{ asset($asset['url']) }}" alt="{{ $asset['alt'] }}" class="h-32 w-full object-cover">
              <figcaption class="truncate px-2 py-1.5 text-[11px] text-ink-muted" title="{{ $asset['url'] }}">{{ $asset['url'] }}</figcaption>
            </figure>
          @endforeach
        </div>
        <p class="mt-3 flex items-center gap-1 text-[12px] text-ink-muted">
          <span class="material-symbols-outlined text-[16px]">check_circle</span>
          76 berkas disalin byte-identik (md5 cocok) ke <code class="font-mono">public/assets/ikapi</code>
        </p>
        <div class="mt-3 border-t border-border-subtle pt-3">
          <span class="text-[13px] font-semibold">scrollbar-none (region gulir)</span>
          <div class="scrollbar-none mt-2 flex gap-2 overflow-x-auto">
            @foreach (range(1, 10) as $i)
              <span class="shrink-0 rounded-xl border border-border-subtle bg-surface-soft px-3 py-1.5 text-[12px]">Item {{ $i }}</span>
            @endforeach
          </div>
        </div>
      </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-2">
      <div class="rounded-2xl border border-border-subtle bg-surface p-5">
        <h2 class="text-[18px] font-bold text-ink-body">Fixture buku ({{ count($books) }} item)</h2>
        <p class="mt-1 text-[13px] text-ink-muted">Dibaca dari <code class="font-mono">resources/data/ikapi/books.json</code> - hasil ekstraksi prototype, bukan data baru.</p>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          @foreach (array_slice($books, 0, 2) as $book)
            <article class="overflow-hidden rounded-2xl border border-border-subtle">
              <img src="{{ asset('assets/ikapi/covers/'.basename($book['cover'])) }}" alt="Sampul {{ $book['title'] }}" class="h-40 w-full object-cover">
              <div class="p-3">
                <h3 class="truncate text-[15px] font-bold text-ink-body">{{ $book['title'] }}</h3>
                <p class="mt-0.5 text-[12.5px] text-ink-muted">{{ $book['author'] }}</p>
                <p class="mt-2 text-[15px] font-bold text-primary">Rp {{ number_format($book['price'], 0, ',', '.') }}</p>
                <p class="mt-1 text-[11.5px] text-ink-subtle">{{ $book['id'] }} · {{ $book['category'] }} · {{ $book['year'] }}</p>
              </div>
            </article>
          @endforeach
        </div>
      </div>

      <div class="rounded-2xl border border-border-subtle bg-surface p-5">
        <h2 class="text-[18px] font-bold text-ink-body">Layer demo state</h2>
        <p class="mt-1 text-[13px] text-ink-muted">Satu pemilik untuk 21 kunci <code class="font-mono">ikapi_*</code>; halaman tidak menyentuh localStorage langsung.</p>
        <dl class="mt-4 space-y-2 text-[13px]">
          <div class="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-soft px-3 py-2">
            <dt>localStorage tersedia</dt>
            <dd class="font-mono" id="demo-available">-</dd>
          </div>
          <div class="flex items-center justify-between gap-3 rounded-xl border border-border-subtle px-3 py-2">
            <dt>kunci sesi pembeli</dt>
            <dd class="font-mono text-[12px]" id="demo-key">-</dd>
          </div>
          <div class="flex items-center justify-between gap-3 rounded-xl border border-border-subtle px-3 py-2">
            <dt>guard portal admin/penerbit</dt>
            <dd class="font-mono text-[12px]" id="demo-guards">-</dd>
          </div>
        </dl>
        <div class="mt-4 flex flex-wrap gap-2">
          <button type="button" id="demo-write" class="focus-ring h-10 rounded-xl bg-primary px-4 text-[13px] font-bold text-white hover:bg-primary-hover">Tulis state uji</button>
          <button type="button" id="demo-read" class="focus-ring h-10 rounded-xl border border-border-subtle px-4 text-[13px] font-semibold hover:bg-surface-neutral">Baca state uji</button>
          <button type="button" id="demo-clear" class="focus-ring h-10 rounded-xl border border-border-subtle px-4 text-[13px] font-semibold hover:bg-surface-neutral">Bersihkan</button>
          <button type="button" id="demo-notice" class="focus-ring h-10 rounded-xl border border-border-subtle px-4 text-[13px] font-semibold hover:bg-surface-neutral">Notifikasi demo</button>
        </div>
        <pre id="demo-out" class="mt-3 max-h-40 overflow-auto rounded-xl bg-surface-neutral p-3 text-[12px] leading-relaxed text-ink-muted">belum ada aksi</pre>
      </div>
    </section>

    <section class="rounded-2xl border border-border-subtle bg-surface p-5" id="nav-helper">
      <h2 class="text-[18px] font-bold text-ink-body">Navigation helper</h2>
      <p class="mt-1 text-[13px] text-ink-muted">
        Label dan ikon diambil dari menu prototype (P01). Item dengan rute yang belum terdaftar ditandai
        <span class="font-mono">belum ada</span>, jadi halaman tidak pernah menautkan ke rute kosong.
      </p>
      <div class="mt-4 grid gap-4 sm:grid-cols-3">
        @foreach ($nav as $persona => $items)
          <div class="rounded-xl border border-border-subtle bg-surface-soft p-3">
            <p class="text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{{ $persona }}</p>
            <ul class="mt-2 space-y-1">
              @foreach ($items as $item)
                <li class="flex items-center justify-between gap-2 text-[13px]">
                  <span class="flex items-center gap-1.5 {{ $item['active'] ? 'font-bold text-primary' : 'text-ink-body' }}">
                    <span class="material-symbols-outlined text-[16px]">{{ $item['icon'] }}</span>{{ $item['label'] }}
                  </span>
                  @if ($item['ready'])
                    <span class="font-mono text-[11px] text-status-success">aktif</span>
                  @else
                    <span class="font-mono text-[11px] text-ink-subtle">belum ada</span>
                  @endif
                </li>
              @endforeach
            </ul>
          </div>
        @endforeach
      </div>
      <p class="mt-3 text-[12.5px] text-ink-muted">
        Rute uji ini sendiri memakai named route: <code class="font-mono">{{ route('ui.foundation') }}</code>
      </p>
    </section>

    <footer class="border-t border-border-subtle pt-5 text-[12.5px] text-ink-muted">
      Fase P03 hanya menyiapkan fondasi. Halaman produk (beranda, katalog, portal) dikonversi pada fase berikutnya;
      seluruh perbedaan yang diketahui dari golden PNG P02 dicatat di <code class="font-mono">docs/migration/p3-foundation.md</code>.
    </footer>
  </main>

  <script>
    // Vite ships app.js as a deferred module, so the demo API exists only after DOMContentLoaded.
    document.addEventListener('DOMContentLoaded', function () {
      var D = window.IkapiDemo;
      var S = window.IkapiSession;
      var out = document.getElementById('demo-out');
      document.getElementById('demo-available').textContent = D.available() ? 'ya' : 'tidak (mode privat)';
      document.getElementById('demo-key').textContent = D.keys.buyerSession;
      document.getElementById('demo-guards').textContent =
        'admin:' + (S.adminPortalBlocked() ? 'blokir' : 'lolos') + ' · penerbit:' + (S.publisherPortalBlocked() ? 'blokir' : 'lolos');
      function show(value) { out.textContent = JSON.stringify(value, null, 1); }
      document.getElementById('demo-write').addEventListener('click', function () {
        var ok = S.setSession('buyer', { id: 'USR-PMB-0042', email: 'pembeli@demo.ikapi.id', name: 'Pembeli Demo' });
        show({ written: ok, guards: { admin: S.adminPortalBlocked(), publisher: S.publisherPortalBlocked() } });
      });
      document.getElementById('demo-read').addEventListener('click', function () {
        show({ buyerSession: S.session('buyer'), safeNext: S.safeNext('perpustakaan_saya_desktop.html?tab=reading'), unsafeNext: S.safeNext('https://example.com/x') });
      });
      document.getElementById('demo-notice').addEventListener('click', function () {
        window.IkapiNotice.show('Notifikasi demo dari resources/js/ikapi/demo/notice.js', 'success');
        show({ notice: 'rendered', classes: 'literal (tanpa perangkaian runtime)' });
      });
      document.getElementById('demo-clear').addEventListener('click', function () {
        D.clearAll();
        show({ cleared: true, buyerSession: S.session('buyer') });
      });
    });
  </script>
</body>
</html>
