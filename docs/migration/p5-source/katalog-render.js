function renderCatalogDOM(filteredBooks) {
      const container = document.getElementById('catalog-products-container');
      const emptyState = document.getElementById('catalog-empty-state');
      const paginationBar = document.getElementById('catalog-pagination-bar');
      const countBadge = document.getElementById('catalog-count-badge');
      const summaryText = document.getElementById('pagination-summary-text');

      if (!container || !emptyState) return;

      const totalCount = filteredBooks.length;
      if (countBadge) countBadge.textContent = `Menampilkan ${totalCount} Buku`;

      if (totalCount === 0) {
        container.classList.add('hidden');
        if (paginationBar) paginationBar.classList.add('hidden');
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
        return;
      }

      emptyState.classList.add('hidden');
      emptyState.classList.remove('flex');
      container.classList.remove('hidden');
      if (paginationBar) paginationBar.classList.remove('hidden');

      if (summaryText) {
        summaryText.innerHTML = `Menampilkan <strong class="text-ink-body font-bold">1 – ${totalCount}</strong> dari <strong class="text-ink-body font-bold">${totalCount}</strong> buku`;
      }

      if (catalogState.viewMode === 'grid') {
        container.className = 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6';
        container.innerHTML = filteredBooks.map(book => `
          <article class="group bg-white rounded-2xl p-4 border border-border-subtle shadow-xs hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between">
            <div>
              <a href="${book.detailUrl}" data-path="detail-buku" class="block">
                <div class="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-surface-neutral mb-3 border border-border-subtle shadow-xs">
                  <img src="${book.cover}" alt="Sampul ${book.title}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy">
                  <div class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-ink-body text-[10px] font-bold tracking-wide uppercase shadow-xs">
                    E-Book
                  </div>
                </div>
              </a>
              <div class="flex items-center justify-between gap-2 mb-1.5">
                <span class="px-2 py-0.5 rounded-md bg-surface-soft text-primary font-bold text-[11px] truncate">
                  ${book.category}
                </span>
                <span class="text-[12px] text-ink-muted truncate font-medium">
                  ${book.publisher}
                </span>
              </div>
              <a href="${book.detailUrl}" data-path="detail-buku" class="block">
                <h3 class="text-[15px] font-bold text-ink-body leading-snug line-clamp-2 min-h-[2.6em] group-hover:text-primary transition-colors">
                  ${book.title}
                </h3>
              </a>
              <p class="text-[13px] text-ink-muted line-clamp-1 mt-0.5">${book.author}</p>
            </div>
            <div class="mt-4 pt-2.5 border-t border-border-subtle flex items-center justify-between">
              <div>
                <span class="block text-[10px] text-ink-muted uppercase font-bold tracking-wider">Harga Lisensi</span>
                <span class="text-[17px] text-ink-body font-bold font-sans">${formatRupiah(book.price)}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <button class="w-9 h-9 rounded-xl bg-surface-neutral hover:bg-surface-soft text-ink-muted hover:text-primary flex items-center justify-center transition-colors border border-border-subtle cursor-pointer" title="Tambah ke Keranjang" type="button" onclick="handleAddToCart('${book.title}')">
                  <span class="material-symbols-outlined text-[18px]">shopping_bag</span>
                </button>
                <a href="${book.detailUrl}" data-path="detail-buku" class="h-9 px-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-[13px] font-bold flex items-center transition-colors shadow-xs">
                  Detail
                </a>
              </div>
            </div>
          </article>
        `).join('');
      } else {
        // List View: Sleek horizontal row layout
        container.className = 'flex flex-col gap-4';
        container.innerHTML = filteredBooks.map(book => `
          <article class="group bg-white rounded-2xl p-4 border border-border-subtle shadow-xs hover:shadow-md hover:border-primary/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div class="flex items-center gap-4 min-w-0 flex-1">
              <a href="${book.detailUrl}" data-path="detail-buku" class="shrink-0">
                <div class="w-20 aspect-[2/3] rounded-xl overflow-hidden bg-surface-neutral border border-border-subtle shadow-xs">
                  <img src="${book.cover}" alt="Sampul ${book.title}" class="w-full h-full object-cover">
                </div>
              </a>
              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2 py-0.5 rounded-md bg-surface-soft text-primary font-bold text-[11px]">
                    ${book.category}
                  </span>
                  <span class="text-[12px] text-ink-muted truncate">
                    ${book.publisher} • Terbit ${book.year}
                  </span>
                </div>
                <a href="${book.detailUrl}" data-path="detail-buku" class="block">
                  <h3 class="text-[16px] font-bold text-ink-body leading-snug group-hover:text-primary transition-colors truncate">
                    ${book.title}
                  </h3>
                </a>
                <p class="text-[13px] text-ink-muted mt-0.5">${book.author}</p>
              </div>
            </div>
            <div class="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle shrink-0">
              <span class="text-[17px] text-ink-body font-bold font-sans">${formatRupiah(book.price)}</span>
              <div class="flex items-center gap-2 mt-1">
                <button class="w-9 h-9 rounded-xl bg-surface-neutral hover:bg-surface-soft text-ink-muted hover:text-primary flex items-center justify-center transition-colors border border-border-subtle cursor-pointer" title="Tambah ke Keranjang" type="button" onclick="handleAddToCart('${book.title}')">
                  <span class="material-symbols-outlined text-[18px]">shopping_bag</span>
                </button>
                <a href="${book.detailUrl}" data-path="detail-buku" class="h-9 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-[13px] font-bold flex items-center transition-colors shadow-xs">
                  Detail
                </a>
              </div>
            </div>
          </article>
        `).join('');
      }
    }