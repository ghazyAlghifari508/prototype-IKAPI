{{--
  Ulasan Pembaca: interactive rating card + review list. Source: <section id="section-rating"> in
  user/detail_buku_desktop.html. Star buttons keep the prototype ids/classes and the ARIA radio pattern.
  Reviews come from the fixture (3 rows for the reference book) and keep data-comment-id, which the comment menu
  and report dialog read.
--}}
@php($reviews = $book['detail']['reviews'] ?? [])

<section id="section-rating" class="w-full py-12 bg-white border-t border-border-subtle">
  <div class="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

    <div class="flex items-center justify-between pb-1">
      <h2 class="text-[22px] md:text-[24px] font-bold text-ink-body tracking-tight">Ulasan Pembaca</h2>
      <span id="review-count-badge" class="text-[14px] text-ink-muted font-medium">{{ count($reviews) }} ulasan</span>
    </div>

    <!-- Interactive Rating & Review Submission Card -->
    <div class="bg-white rounded-3xl p-6 sm:p-8 border border-border-subtle shadow-sm space-y-5">
      <div class="space-y-1">
        <h3 class="text-[18px] font-bold text-ink-body tracking-tight">Beri Penilaian</h3>
        <p class="text-[14px] text-ink-muted">Bagaimana pendapatmu tentang buku ini?</p>
      </div>

      <!-- 5-Star Interactive Rating Controls -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-4">
        <div id="star-rating-container" class="flex items-center gap-1" role="radiogroup" aria-label="Penilaian bintang 1 sampai 5">
          @foreach ([1, 2, 3, 4, 5] as $star)
            <button type="button" role="radio" aria-checked="false" aria-label="{{ $star }} bintang" class="star-btn p-1 cursor-pointer" data-rating="{{ $star }}">
              <span class="material-symbols-outlined text-[32px]">star</span>
            </button>
          @endforeach
        </div>

        <!-- Rating Label Feedback -->
        <span id="star-rating-label" class="text-[13px] font-semibold text-ink-muted">
          Rating kamu: Belum dipilih
        </span>
      </div>

      <!-- Optional Review Text Input -->
      <div class="space-y-1.5 pt-1">
        <label for="user-review-text" class="block text-[13px] font-bold text-ink-body">
          Tulis Ulasan (Opsional)
        </label>
        <textarea id="user-review-text" rows="2" class="w-full p-3.5 rounded-xl bg-surface-neutral border border-border-subtle text-ink-body text-[14px] placeholder:text-ink-muted focus:outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-[#673de633] transition-all resize-none" placeholder="Tuliskan pengalaman atau kesan membaca buku ini..."></textarea>
      </div>

      <!-- Submit Button -->
      <div class="flex items-center gap-3 pt-1">
        <button id="btn-submit-rating" type="button" class="h-10 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white text-[13px] font-bold transition-all shadow-xs cursor-pointer">
          Kirim Penilaian
        </button>
        <button id="btn-cancel-rating" type="button" class="hidden h-10 px-4 rounded-xl border border-border-subtle bg-white hover:bg-surface-neutral text-ink-muted text-[13px] font-medium transition-colors">
          Hapus Penilaian
        </button>
      </div>
    </div>

    <!-- Existing Reviews List -->
    <div class="bg-white rounded-3xl p-6 sm:p-8 border border-border-subtle shadow-sm divide-y divide-border-subtle" id="reviews-list-container">
      @forelse ($reviews as $review)
        <article class="review-item py-4 first:pt-0 last:pb-0 flex flex-col gap-2" data-comment-id="{{ $review['commentId'] }}">
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 flex-col gap-0.5">
              <span class="review-author text-[14px] font-bold text-ink-body">{{ $review['author'] }}</span>
              <time class="text-[12px] text-ink-muted" datetime="{{ $review['datetime'] }}">{{ $review['date'] }}</time>
            </div>
            <button type="button" class="comment-menu-btn -mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-surface-neutral hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#673de666]" aria-label="Aksi untuk komentar {{ $review['author'] }}" aria-haspopup="menu" aria-expanded="false">
              <span class="material-symbols-outlined text-[20px]" aria-hidden="true">more_horiz</span>
            </button>
          </div>
          <p class="review-body text-[14px] text-ink-body leading-relaxed">{{ $review['body'] }}</p>
          <span class="review-reaction hidden items-center gap-1 text-[12px] font-semibold text-primary" role="status">
            <span class="material-symbols-outlined text-[15px]" data-reaction-icon aria-hidden="true">thumb_up</span>
            <span data-reaction-label>Suka</span>
          </span>
        </article>
      @empty
        <p class="py-4 text-[14px] text-ink-muted">Ulasan pembaca untuk buku ini belum tersedia di prototipe.</p>
      @endforelse
    </div>

  </div>
</section>