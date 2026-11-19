{{--
  Comment action menu + the two report dialogs. Markup copied verbatim from user/detail_buku_desktop.html
  (the comment menu popover, "Laporkan Komentar" dialog z-90 and "Laporkan Buku" dialog z-95).
  Only inline onclick handlers were replaced by data hooks (see resources/js/ikapi/buyer/detail.js) and the
  book-cover placeholder src was cleared, since the script fills it from the book being reported.
--}}
<div id="comment-menu" role="menu" aria-label="Aksi komentar" class="fixed z-[80] hidden w-[190px] rounded-xl border border-border-subtle bg-white p-1.5 shadow-[0_12px_32px_rgba(34,34,37,0.14)]">
    <button type="button" role="menuitemcheckbox" aria-checked="false" data-action="like" class="comment-menu-item flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13.5px] font-medium text-ink-body transition-colors hover:bg-surface-neutral focus-visible:outline-none focus-visible:bg-surface-neutral">
      <span class="material-symbols-outlined text-[18px] text-ink-muted" data-icon="" aria-hidden="true">thumb_up</span>
      <span>Suka</span>
      <span class="material-symbols-outlined ml-auto hidden text-[16px] text-primary" data-check="" aria-hidden="true">check</span>
    </button>
    <button type="button" role="menuitemcheckbox" aria-checked="false" data-action="dislike" class="comment-menu-item flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13.5px] font-medium text-ink-body transition-colors hover:bg-surface-neutral focus-visible:outline-none focus-visible:bg-surface-neutral">
      <span class="material-symbols-outlined text-[18px] text-ink-muted" data-icon="" aria-hidden="true">thumb_down</span>
      <span>Tidak Suka</span>
      <span class="material-symbols-outlined ml-auto hidden text-[16px] text-primary" data-check="" aria-hidden="true">check</span>
    </button>
    <div class="my-1 h-px bg-border-subtle"></div>
    <button type="button" role="menuitem" data-action="report" class="comment-menu-item flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13.5px] font-medium text-ink-body transition-colors hover:bg-surface-neutral focus-visible:outline-none focus-visible:bg-surface-neutral">
      <span class="material-symbols-outlined text-[18px] text-ink-muted" data-icon="" aria-hidden="true">flag</span>
      <span>Laporkan</span>
    </button>
  </div>

<div id="report-modal" class="fixed inset-0 z-[90] hidden" role="dialog" aria-modal="true" aria-labelledby="report-title" aria-describedby="report-desc">
    <div id="report-scrim" class="absolute inset-0 bg-[#222225]/50"></div>
    <div class="relative flex h-full items-end justify-center sm:items-center sm:p-4">
      <div class="flex h-full w-full flex-col overflow-hidden bg-white sm:h-auto sm:max-h-[calc(100vh-48px)] sm:max-w-[500px] sm:rounded-2xl sm:border sm:border-border-subtle sm:shadow-[0_24px_64px_rgba(34,34,37,0.22)]">
        <header class="flex items-start justify-between gap-4 border-b border-border-subtle px-5 py-4">
          <div class="min-w-0">
            <h2 id="report-title" class="text-[17px] font-bold tracking-tight text-ink-body">Laporkan Komentar</h2>
            <p id="report-desc" class="mt-0.5 text-[13px] text-ink-muted">Mengapa kamu melaporkan komentar ini?</p>
          </div>
          <button type="button" id="report-close" aria-label="Tutup" class="-mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-surface-neutral hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </header>

        <div class="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <div class="rounded-xl border border-border-subtle bg-surface-neutral px-3.5 py-3">
            <p class="text-[13px] font-bold text-ink-body" id="report-author">-</p>
            <p class="mt-1 line-clamp-3 text-[13px] leading-relaxed text-ink-muted" id="report-preview">-</p>
            <p class="mt-2 text-[12px] text-ink-muted" id="report-book">-</p>
          </div>

          <fieldset>
            <legend class="text-[13px] font-bold text-ink-body">Pilih alasan</legend>
            <div class="mt-1.5 -ml-2 space-y-0.5" id="report-reasons"><label class="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-surface-neutral"><input type="radio" name="report-reason" value="spam" class="mt-0.5 h-4 w-4 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"><span class="text-[13.5px] leading-snug text-ink-body">Spam atau promosi</span></label><label class="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-surface-neutral"><input type="radio" name="report-reason" value="abuse" class="mt-0.5 h-4 w-4 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"><span class="text-[13.5px] leading-snug text-ink-body">Kata kasar atau pelecehan</span></label><label class="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-surface-neutral"><input type="radio" name="report-reason" value="hate" class="mt-0.5 h-4 w-4 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"><span class="text-[13.5px] leading-snug text-ink-body">Ujaran kebencian atau diskriminasi</span></label><label class="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-surface-neutral"><input type="radio" name="report-reason" value="privacy" class="mt-0.5 h-4 w-4 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"><span class="text-[13.5px] leading-snug text-ink-body">Membagikan informasi pribadi</span></label><label class="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-surface-neutral"><input type="radio" name="report-reason" value="other" class="mt-0.5 h-4 w-4 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"><span class="text-[13.5px] leading-snug text-ink-body">Alasan lainnya</span></label></div>
          </fieldset>

          <div>
            <div class="flex items-baseline justify-between gap-3">
              <label for="report-details" id="report-details-label" class="text-[13px] font-bold text-ink-body">Keterangan tambahan (opsional)</label>
              <span id="report-counter" class="text-[12px] tabular-nums text-ink-muted">0/500</span>
            </div>
            <textarea id="report-details" rows="3" maxlength="500" class="mt-1.5 w-full resize-none rounded-xl border border-border-subtle bg-white p-3 text-[13.5px] leading-relaxed text-ink-body placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Jelaskan masalah pada komentar ini..."></textarea>
            <p id="report-error" role="alert" class="mt-1.5 hidden text-[12.5px] font-medium text-[#B42318]"></p>
          </div>
        </div>

        <footer class="flex items-center justify-end gap-2 border-t border-border-subtle px-5 py-3.5">
          <button type="button" id="report-cancel" class="h-10 rounded-xl border border-border-subtle px-4 text-[13.5px] font-semibold text-ink-body transition-colors hover:bg-surface-neutral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">Batal</button>
          <button type="button" id="report-submit" disabled="" class="h-10 rounded-xl bg-primary px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2">Kirim Laporan</button>
        </footer>
      </div>
    </div>
  </div>

<div id="book-report-modal" class="fixed inset-0 z-[95] hidden" role="dialog" aria-modal="true" aria-labelledby="book-report-title" aria-describedby="book-report-desc">
    <div id="book-report-scrim" class="absolute inset-0 bg-[#222225]/50"></div>
    <div class="relative flex h-full items-end justify-center sm:items-center sm:p-4">
      <div class="flex h-full w-full flex-col overflow-hidden bg-white sm:h-auto sm:max-h-[calc(100vh-48px)] sm:max-w-[520px] sm:rounded-2xl sm:border sm:border-border-subtle sm:shadow-[0_24px_64px_rgba(34,34,37,0.22)]">
        <header class="flex items-start justify-between gap-4 border-b border-border-subtle px-5 py-4">
          <div class="min-w-0">
            <h2 id="book-report-title" class="text-[17px] font-bold tracking-tight text-ink-body">Laporkan Buku</h2>
            <p id="book-report-desc" class="mt-0.5 text-[13px] text-ink-muted">Apa masalah yang kamu temukan pada buku ini?</p>
          </div>
          <button type="button" id="book-report-close" aria-label="Tutup" class="-mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-surface-neutral hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
            <span class="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
          </button>
        </header>

        <div class="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <div class="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface-neutral px-3 py-3">
            <img id="book-report-cover" src="" alt="" class="h-[74px] w-[50px] shrink-0 rounded border border-border-subtle object-cover">
            <div class="min-w-0">
              <p id="book-report-book-title" class="line-clamp-2 text-[13.5px] font-bold leading-snug text-ink-body"></p>
              <p id="book-report-book-author" class="mt-0.5 text-[12.5px] text-ink-muted"></p>
              <p id="book-report-book-publisher" class="mt-0.5 text-[12.5px] text-ink-muted"></p>
            </div>
          </div>

          <fieldset>
            <legend class="text-[13px] font-bold text-ink-body">Jenis masalah</legend>
            <div class="mt-1.5 -ml-2 space-y-0.5" id="book-report-types"><label class="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-surface-neutral"><input type="radio" name="book-report-type" value="file" class="mt-0.5 h-4 w-4 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"><span class="min-w-0"><span class="block text-[13.5px] font-semibold leading-snug text-ink-body">File e-book bermasalah</span><span class="mt-0.5 block text-[12.5px] leading-snug text-ink-muted">Buku sulit dibuka atau tampilannya bermasalah.</span></span></label><label class="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-surface-neutral"><input type="radio" name="book-report-type" value="metadata" class="mt-0.5 h-4 w-4 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"><span class="min-w-0"><span class="block text-[13.5px] font-semibold leading-snug text-ink-body">Informasi buku tidak sesuai</span><span class="mt-0.5 block text-[12.5px] leading-snug text-ink-muted">Judul, penulis, sampul, atau deskripsi keliru.</span></span></label><label class="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-surface-neutral"><input type="radio" name="book-report-type" value="copyright" class="mt-0.5 h-4 w-4 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"><span class="min-w-0"><span class="block text-[13.5px] font-semibold leading-snug text-ink-body">Dugaan pelanggaran hak cipta</span><span class="mt-0.5 block text-[12.5px] leading-snug text-ink-muted">Ada dugaan buku diterbitkan tanpa izin yang sesuai.</span></span></label><label class="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-surface-neutral"><input type="radio" name="book-report-type" value="other" class="mt-0.5 h-4 w-4 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"><span class="min-w-0"><span class="block text-[13.5px] font-semibold leading-snug text-ink-body">Masalah lainnya</span><span class="mt-0.5 block text-[12.5px] leading-snug text-ink-muted">Masalah buku yang tidak termasuk pilihan di atas.</span></span></label></div>
          </fieldset>

          <div id="book-report-section-field" class="hidden">
            <label for="book-report-section" class="block text-[13px] font-bold text-ink-body">Bagian atau halaman yang bermasalah (opsional)</label>
            <input id="book-report-section" type="text" maxlength="80" placeholder="Contoh: Halaman 42-48 atau Bab 4" class="mt-1.5 h-10 w-full rounded-xl border border-border-subtle bg-white px-3 text-[13.5px] text-ink-body placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
          </div>

          <div id="book-report-details-field">
            <div class="flex items-baseline justify-between gap-3">
              <label for="book-report-details" id="book-report-details-label" class="text-[13px] font-bold text-ink-body">Jelaskan kendalanya (opsional)</label>
              <span id="book-report-counter" class="text-[12px] tabular-nums text-ink-muted">0/500</span>
            </div>
            <textarea id="book-report-details" rows="3" maxlength="500" placeholder="Contoh: Halaman 42 tidak bisa dibuka di Web Reader." class="mt-1.5 w-full resize-none rounded-xl border border-border-subtle bg-white p-3 text-[13.5px] leading-relaxed text-ink-body placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"></textarea>
          </div>

          <p id="book-report-notice" class="hidden text-[12.5px] font-medium text-ink-muted"></p>
          <div id="book-report-error" role="alert" class="hidden">
            <p id="book-report-error-title" class="hidden text-[12.5px] font-bold text-[#B42318]"></p>
            <p id="book-report-error-text" class="mt-0.5 text-[12.5px] leading-relaxed text-[#B42318]"></p>
          </div>
        </div>

        <footer class="flex items-center justify-end gap-2 border-t border-border-subtle px-5 py-3.5">
          <button type="button" id="book-report-cancel" class="h-10 rounded-xl border border-border-subtle px-4 text-[13.5px] font-semibold text-ink-body transition-colors hover:bg-surface-neutral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">Batal</button>
          <button type="button" id="book-report-submit" disabled="" class="h-10 rounded-xl bg-primary px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2">Kirim Laporan</button>
        </footer>
      </div>
    </div>
  </div>
