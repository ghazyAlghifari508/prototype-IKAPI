{{--
  Public footer. Source: <footer> in user/beranda_desktop.html (4.650 chars).
  Identical (after link normalisation) in beranda, katalog, keranjang, bantuan, perpustakaan, riwayat_ulasan;
  the account pages differ only by one HTML comment. Content, order and classes are copied verbatim.

  Links point to named routes from the P01 route matrix. A link whose route is not registered yet renders
  as href="#" so nothing 404s; the registry in App\Support\Navigation tells shells which routes are ready.
--}}
@php
    $link = static fn (string $name): string => \Illuminate\Support\Facades\Route::has($name) ? route($name) : '#';
    $catalog = $link('catalog');
    $help = $link('chatbot');
    $community = $link('community');
    $agenda = $link('agenda');
@endphp

<footer class="w-full bg-[#111111] text-white pt-16 pb-12 border-t border-[#2a2a2a]">
  <div class="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
      <!-- Kolom 1 -->
      <div class="flex flex-col gap-3">
        <span class="text-[16px] text-white font-bold tracking-tight">Jelajahi</span>
        <ul class="flex flex-col gap-2.5 text-[14px] text-[#b8b8bd]">
          <li><a class="hover:text-white transition-colors" href="{{ $catalog }}">Katalog Buku</a></li>
          <li><a class="hover:text-white transition-colors" href="{{ $catalog }}">Kategori Pilihan</a></li>
          <li><a class="hover:text-white transition-colors" href="{{ $catalog }}">Buku Rilis Terbaru</a></li>
          <li><a class="hover:text-white transition-colors" href="{{ $catalog }}">Buku Terlaris</a></li>
        </ul>
      </div>

      <!-- Kolom 2 -->
      <div class="flex flex-col gap-3">
        <span class="text-[16px] text-white font-bold tracking-tight">Informasi Pembelian</span>
        <ul class="flex flex-col gap-2.5 text-[14px] text-[#b8b8bd]">
          <li><a class="hover:text-white transition-colors" href="{{ $help }}">Cara Pembelian</a></li>
          <li><a class="hover:text-white transition-colors" href="{{ $help }}">Metode Pembayaran</a></li>
          <li><a class="hover:text-white transition-colors" href="{{ $help }}">Panduan Web Reader</a></li>
          <li><a class="hover:text-white transition-colors" href="{{ $help }}">Bantuan &amp; FAQ</a></li>
        </ul>
      </div>

      <!-- Kolom 3 -->
      <div class="flex flex-col gap-3">
        <span class="text-[16px] text-white font-bold tracking-tight">Tentang IKAPI</span>
        <ul class="flex flex-col gap-2.5 text-[14px] text-[#b8b8bd]">
          <li><a class="hover:text-white transition-colors" href="{{ $community }}">Tentang Kami</a></li>
          <li><a class="hover:text-white transition-colors" href="{{ $community }}">Anggota Penerbit</a></li>
          <li><a class="hover:text-white transition-colors" href="{{ $community }}">Kemitraan Perpustakaan</a></li>
          <li><a class="hover:text-white transition-colors" href="{{ $community }}">Hubungi Kami</a></li>
        </ul>
      </div>

      <!-- Kolom 4 -->
      <div class="flex flex-col gap-3">
        <span class="text-[16px] text-white font-bold tracking-tight">Lainnya</span>
        <ul class="flex flex-col gap-2.5 text-[14px] text-[#b8b8bd]">
          <li><a class="hover:text-white transition-colors" href="{{ $agenda }}">Agenda Literasi</a></li>
          <li><a class="hover:text-white transition-colors" href="{{ $help }}">Syarat &amp; Ketentuan</a></li>
          <li><a class="hover:text-white transition-colors" href="{{ $help }}">Kebijakan Privasi</a></li>
        </ul>
      </div>
    </div>

    <div class="pt-8 border-t border-[#ffffff1a] flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-[#b8b8bd]">
      <p>© 2026 IKAPI Jawa Barat. Seluruh hak cipta dilindungi undang-undang.</p>
      <div class="flex flex-wrap items-center gap-4">
        <span class="text-[#ffffff99]">Media Sosial:</span>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors" aria-label="Instagram IKAPI Jabar">Instagram</a>
        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors" aria-label="YouTube IKAPI Jabar">YouTube</a>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors" aria-label="Facebook IKAPI Jabar">Facebook</a>
        <a href="https://x.com" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors" aria-label="X Twitter IKAPI Jabar">X</a>
      </div>
    </div>
  </div>
</footer>
