{{--
  Footer variant for this page only. Source: docs/design/prototype-copy/user/chatbot_bantuan_rekomendasi_desktop.html.
  The prototype ships 4 footer compositions (beranda/account pages, help/cart/library/reviews, agenda pages,
  chatbot). partials/public/footer.blade.php covers the first two byte-for-byte; these two pages need their own
  column order / container padding, so the source fragment is migrated as its own partial instead of branching
  the shared one with conditionals.
--}}
<footer class="w-full bg-[#111111] text-white pt-16 pb-12 border-t border-[#2a2a2a]">
    <div class="max-w-[1240px] mx-auto px-4 md:px-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <!-- Kolom 1 -->
        <div class="flex flex-col gap-3">
          <span class="text-[16px] text-white font-bold tracking-tight">Jelajahi</span>
          <ul class="flex flex-col gap-2.5 text-[14px] text-[#b8b8bd]">
            <li><a class="hover:text-white transition-colors" data-path="katalog-buku" href="{{ $links('books.index') }}">Katalog Buku</a></li>
            <li><a class="hover:text-white transition-colors" data-path="kategori" href="{{ $links('books.index') }}">Kategori Pilihan</a></li>
            <li><a class="hover:text-white transition-colors" data-path="katalog-buku" href="{{ $links('books.index') }}">Buku Rilis Terbaru</a></li>
            <li><a class="hover:text-white transition-colors" data-path="katalog-buku" href="{{ $links('books.index') }}">Buku Terlaris</a></li>
          </ul>
        </div>

        <!-- Kolom 2 -->
        <div class="flex flex-col gap-3">
          <span class="text-[16px] text-white font-bold tracking-tight">Informasi Pembelian</span>
          <ul class="flex flex-col gap-2.5 text-[14px] text-[#b8b8bd]">
            <li><a class="hover:text-white transition-colors" data-path="bantuan" href="{{ $links('help.chatbot') }}">Cara Pembelian</a></li>
            <li><a class="hover:text-white transition-colors" data-path="bantuan" href="{{ $links('help.chatbot') }}">Metode Pembayaran</a></li>
            <li><a class="hover:text-white transition-colors" data-path="bantuan" href="{{ $links('help.chatbot') }}">Panduan Web Reader</a></li>
            <li><a class="hover:text-white transition-colors" data-path="bantuan" href="{{ $links('help.chatbot') }}">Bantuan &amp; FAQ</a></li>
          </ul>
        </div>

        <!-- Kolom 3 -->
        <div class="flex flex-col gap-3">
          <span class="text-[16px] text-white font-bold tracking-tight">Tentang IKAPI</span>
          <ul class="flex flex-col gap-2.5 text-[14px] text-[#b8b8bd]">
            <li><a class="hover:text-white transition-colors" data-path="komunitas-literasi" href="{{ $links('community') }}">Tentang Kami</a></li>
            <li><a class="hover:text-white transition-colors" data-path="komunitas-literasi" href="{{ $links('community') }}">Anggota Penerbit</a></li>
            <li><a class="hover:text-white transition-colors" data-path="komunitas-literasi" href="{{ $links('community') }}">Kemitraan Perpustakaan</a></li>
            <li><a class="hover:text-white transition-colors" data-path="komunitas-literasi" href="{{ $links('community') }}">Hubungi Kami</a></li>
          </ul>
        </div>

        <!-- Kolom 4 -->
        <div class="flex flex-col gap-3">
          <span class="text-[16px] text-white font-bold tracking-tight">Lainnya</span>
          <ul class="flex flex-col gap-2.5 text-[14px] text-[#b8b8bd]">
            <li><a class="hover:text-white transition-colors" data-path="agenda-literasi" href="{{ $links('agenda') }}">Agenda Literasi</a></li>
            <li><a class="hover:text-white transition-colors" data-path="bantuan" href="{{ $links('help.chatbot') }}">Syarat &amp; Ketentuan</a></li>
            <li><a class="hover:text-white transition-colors" data-path="bantuan" href="{{ $links('help.chatbot') }}">Kebijakan Privasi</a></li>
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
