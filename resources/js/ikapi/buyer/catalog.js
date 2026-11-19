/*
| Catalog pipeline. Port of the prototype's katalog_buku_desktop.html script:
|   runCatalogPipeline() -> search, category, publisher, price filter, sort -> renderCatalogDOM()
|   handleCategoryCheckbox / handlePublisherCheckbox / applyPriceFilter / handleSortChange /
|   setViewMode / resetAllFilters / changeCatalogPage (no-op in the prototype: 12 books fit one page)
|
| Differences from the prototype, both deliberate and documented in docs/migration/p5-buyer-core.md:
|   1. card links use the app route /buku/<slug> (the prototype linked every card to the same page without an id)
|   2. interpolated text is escaped (the prototype injects titles straight into innerHTML)
|   3. translucent utility classes use the literal hex-alpha form so Tailwind 4 does not route them through
|      color-mix(in oklab, ...) (P04 finding P4-2)
| Everything else - class strings, DOM structure, ordering and messages - is copied from the reference.
*/
import { onReady, showToast, bumpCartBadge } from './shared.js';

onReady(function () {
    var dataEl = document.getElementById('catalog-data');
    if (!dataEl) return;

    var data = JSON.parse(dataEl.textContent);
    var defaults = data.defaults;
    // fixtures store covers relative to the published asset root (covers/B02.jpg)
    var books = data.books.map(function (b) {
        return Object.assign({}, b, { coverUrl: '/assets/ikapi/' + b.cover });
    });

    var state = {
        searchQuery: '',
        selectedCategories: [],
        selectedPublishers: [],
        minPrice: defaults.minPrice,
        maxPrice: defaults.maxPrice,
        sortBy: defaults.sort,
        viewMode: defaults.viewMode,
        pageSize: defaults.pageSize,
    };

    var container = document.getElementById('catalog-products-container');
    var emptyState = document.getElementById('catalog-empty-state');
    var paginationBar = document.getElementById('catalog-pagination-bar');
    var summaryText = document.getElementById('pagination-summary-text');

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function formatRupiah(number) {
        return 'Rp ' + Number(number).toLocaleString('id-ID');
    }

    function detailUrl(book) {
        return '/buku/' + book.slug;
    }

    function gridCard(book) {
        return `
          <article class="group bg-white rounded-2xl p-4 border border-border-subtle shadow-xs hover:shadow-md hover:border-[#673de666] transition-all flex flex-col justify-between">
            <div>
              <a href="${detailUrl(book)}" data-path="detail-buku" class="block">
                <div class="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-surface-neutral mb-3 border border-border-subtle shadow-xs">
                  <img src="${escapeHtml(book.coverUrl)}" alt="Sampul ${escapeHtml(book.title)}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy">
                  <div class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-[#ffffffe6] backdrop-blur-xs text-ink-body text-[10px] font-bold tracking-wide uppercase shadow-xs">
                    E-Book
                  </div>
                </div>
              </a>
              <div class="flex items-center justify-between gap-2 mb-1.5">
                <span class="px-2 py-0.5 rounded-md bg-surface-soft text-primary font-bold text-[11px] truncate">
                  ${escapeHtml(book.category)}
                </span>
                <span class="text-[12px] text-ink-muted truncate font-medium">
                  ${escapeHtml(book.publisher)}
                </span>
              </div>
              <a href="${detailUrl(book)}" data-path="detail-buku" class="block">
                <h3 class="text-[15px] font-bold text-ink-body leading-snug line-clamp-2 min-h-[2.6em] group-hover:text-primary transition-colors">
                  ${escapeHtml(book.title)}
                </h3>
              </a>
              <p class="text-[13px] text-ink-muted line-clamp-1 mt-0.5">${escapeHtml(book.author)}</p>
            </div>
            <div class="mt-4 pt-2.5 border-t border-border-subtle flex items-center justify-between">
              <div>
                <span class="block text-[10px] text-ink-muted uppercase font-bold tracking-wider">Harga Lisensi</span>
                <span class="text-[17px] text-ink-body font-bold font-sans">${formatRupiah(book.price)}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <button class="btn-add-to-cart w-9 h-9 rounded-xl bg-surface-neutral hover:bg-surface-soft text-ink-muted hover:text-primary flex items-center justify-center transition-colors border border-border-subtle cursor-pointer" title="Tambah ke Keranjang" type="button" data-book-id="${escapeHtml(book.id)}" data-book-title="${escapeHtml(book.title)}" data-book-price="${book.price}">
                  <span class="material-symbols-outlined text-[18px]">shopping_bag</span>
                </button>
                <a href="${detailUrl(book)}" data-path="detail-buku" class="h-9 px-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-[13px] font-bold flex items-center transition-colors shadow-xs">
                  Detail
                </a>
              </div>
            </div>
          </article>`;
    }

    function listCard(book) {
        return `
          <article class="group bg-white rounded-2xl p-4 border border-border-subtle shadow-xs hover:shadow-md hover:border-[#673de666] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div class="flex items-center gap-4 min-w-0 flex-1">
              <a href="${detailUrl(book)}" data-path="detail-buku" class="shrink-0">
                <div class="w-20 aspect-[2/3] rounded-xl overflow-hidden bg-surface-neutral border border-border-subtle shadow-xs">
                  <img src="${escapeHtml(book.coverUrl)}" alt="Sampul ${escapeHtml(book.title)}" class="w-full h-full object-cover">
                </div>
              </a>
              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2 py-0.5 rounded-md bg-surface-soft text-primary font-bold text-[11px]">
                    ${escapeHtml(book.category)}
                  </span>
                  <span class="text-[12px] text-ink-muted truncate">
                    ${escapeHtml(book.publisher)} &middot; Terbit ${escapeHtml(book.year)}
                  </span>
                </div>
                <a href="${detailUrl(book)}" data-path="detail-buku" class="block">
                  <h3 class="text-[16px] font-bold text-ink-body leading-snug group-hover:text-primary transition-colors truncate">
                    ${escapeHtml(book.title)}
                  </h3>
                </a>
                <p class="text-[13px] text-ink-muted mt-0.5">${escapeHtml(book.author)}</p>
              </div>
            </div>
            <div class="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle shrink-0">
              <span class="text-[17px] text-ink-body font-bold font-sans">${formatRupiah(book.price)}</span>
              <div class="flex items-center gap-2 mt-1">
                <button class="btn-add-to-cart w-9 h-9 rounded-xl bg-surface-neutral hover:bg-surface-soft text-ink-muted hover:text-primary flex items-center justify-center transition-colors border border-border-subtle cursor-pointer" title="Tambah ke Keranjang" type="button" data-book-title="${escapeHtml(book.title)}">
                  <span class="material-symbols-outlined text-[18px]">shopping_bag</span>
                </button>
                <a href="${detailUrl(book)}" data-path="detail-buku" class="h-9 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-[13px] font-bold flex items-center transition-colors shadow-xs">
                  Detail
                </a>
              </div>
            </div>
          </article>`;
    }

    var menu = { grid: gridCard, list: listCard };

    function render(filteredBooks) {
        if (!container || !emptyState) return;

        var totalCount = filteredBooks.length;

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
            summaryText.innerHTML = 'Menampilkan <strong class="text-ink-body font-bold">1 – ' + totalCount + '</strong> dari <strong class="text-ink-body font-bold">' + totalCount + '</strong> buku';
        }

        if (state.viewMode === 'grid') {
            container.className = 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6';
        } else {
            container.className = 'flex flex-col gap-4';
        }
        container.innerHTML = filteredBooks.map(menu[state.viewMode]).join('');
        wireCartButtons();
    }

    function pipeline() {
        var result = books.slice();

        if (state.searchQuery) {
            var q = state.searchQuery.toLowerCase();
            result = result.filter(function (b) {
                return b.title.toLowerCase().indexOf(q) !== -1 || b.author.toLowerCase().indexOf(q) !== -1;
            });
        }

        if (state.selectedCategories.length > 0) {
            result = result.filter(function (b) { return state.selectedCategories.indexOf(b.category) !== -1; });
        }

        if (state.selectedPublishers.length > 0) {
            result = result.filter(function (b) { return state.selectedPublishers.indexOf(b.publisher) !== -1; });
        }

        result = result.filter(function (b) { return b.price >= state.minPrice && b.price <= state.maxPrice; });

        result.sort(function (a, b) {
            if (state.sortBy === 'az') return a.title.localeCompare(b.title);
            if (state.sortBy === 'za') return b.title.localeCompare(a.title);
            if (state.sortBy === 'newest') return b.year - a.year;
            if (state.sortBy === 'price_low') return a.price - b.price;
            if (state.sortBy === 'price_high') return b.price - a.price;
            return 0;
        });

        render(result);
    }

    /* ---------------- cart ---------------- */
    function wireCartButtons() {
        container.querySelectorAll('.btn-add-to-cart').forEach(function (btn) {
            btn.addEventListener('click', function (event) {
                event.preventDefault();
                var title = btn.getAttribute('data-book-title') || 'Buku';
                bumpCartBadge();
                showToast('"' + title + '" berhasil ditambahkan ke keranjang');
            });
        });
    }

    /* ---------------- filters ---------------- */
    var allCb = document.getElementById('cat-all');
    var catCbs = Array.prototype.slice.call(document.querySelectorAll('.cat-filter-checkbox'));
    var pubCbs = Array.prototype.slice.call(document.querySelectorAll('.pub-filter-checkbox'));

    function handleCategoryCheckbox(type) {
        if (type === 'all') {
            if (allCb && allCb.checked) {
                catCbs.forEach(function (cb) { cb.checked = false; });
                state.selectedCategories = [];
            }
        } else {
            var checked = catCbs.filter(function (cb) { return cb.checked; }).map(function (cb) { return cb.getAttribute('data-category'); });
            if (checked.length > 0) {
                if (allCb) allCb.checked = false;
                state.selectedCategories = checked;
            } else {
                if (allCb) allCb.checked = true;
                state.selectedCategories = [];
            }
        }
        pipeline();
    }

    function handlePublisherCheckbox() {
        state.selectedPublishers = pubCbs.filter(function (cb) { return cb.checked; }).map(function (cb) { return cb.getAttribute('data-publisher'); });
        pipeline();
    }

    function applyPriceFilter() {
        var minInput = document.getElementById('price-min-input');
        var maxInput = document.getElementById('price-max-input');
        var minVal = parseInt(minInput ? minInput.value : '0', 10) || 0;
        var maxVal = parseInt(maxInput ? maxInput.value : '100000', 10) || 100000;

        if (minVal < 0 || maxVal < minVal) {
            showToast('Rentang harga tidak valid. Periksa nilai minimum dan maksimum.');
            return;
        }

        state.minPrice = minVal;
        state.maxPrice = maxVal;
        pipeline();
        showToast('Rentang harga ' + formatRupiah(minVal) + ' – ' + formatRupiah(maxVal) + ' diterapkan');
    }

    function setViewMode(mode) {
        state.viewMode = mode;
        var btnGrid = document.getElementById('btn-view-grid');
        var btnList = document.getElementById('btn-view-list');
        if (btnGrid) btnGrid.className = 'w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer ' + (mode === 'grid' ? 'bg-primary text-white shadow-xs' : 'text-ink-muted hover:text-ink-body hover:bg-white');
        if (btnList) btnList.className = 'w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer ' + (mode === 'list' ? 'bg-primary text-white shadow-xs' : 'text-ink-muted hover:text-ink-body hover:bg-white');
        pipeline();
    }

    function resetAllFilters() {
        state.searchQuery = '';
        state.selectedCategories = [];
        state.selectedPublishers = [];
        state.minPrice = 20000;
        state.maxPrice = 100000;
        state.sortBy = 'az';

        var searchInput = document.getElementById('catalog-search-input');
        var headerSearchInput = document.querySelector('header input[type="text"]');
        if (searchInput) searchInput.value = '';
        if (headerSearchInput) headerSearchInput.value = '';

        if (allCb) allCb.checked = true;
        catCbs.forEach(function (cb) { cb.checked = false; });
        pubCbs.forEach(function (cb) { cb.checked = false; });

        var minInput = document.getElementById('price-min-input');
        var maxInput = document.getElementById('price-max-input');
        if (minInput) minInput.value = '20000';
        if (maxInput) maxInput.value = '100000';

        var sortSelect = document.getElementById('catalog-sort-select');
        if (sortSelect) sortSelect.value = 'az';

        pipeline();
        showToast('Seluruh filter katalog dikembalikan ke awal');
    }

    /* ---------------- wiring ---------------- */
    if (allCb) allCb.addEventListener('change', function () { handleCategoryCheckbox('all'); });
    catCbs.forEach(function (cb) { cb.addEventListener('change', function () { handleCategoryCheckbox('specific'); }); });
    pubCbs.forEach(function (cb) { cb.addEventListener('change', handlePublisherCheckbox); });

    document.querySelectorAll('[data-catalog-apply-price]').forEach(function (btn) { btn.addEventListener('click', applyPriceFilter); });
    document.querySelectorAll('[data-catalog-reset]').forEach(function (btn) { btn.addEventListener('click', resetAllFilters); });

    var sortSelect = document.getElementById('catalog-sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            state.sortBy = sortSelect.value;
            pipeline();
        });
    }

    document.querySelectorAll('[data-catalog-view]').forEach(function (btn) {
        btn.addEventListener('click', function () { setViewMode(btn.getAttribute('data-catalog-view')); });
    });

    var searchInput = document.getElementById('catalog-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            state.searchQuery = e.target.value.trim();
            pipeline();
        });
    }

    // The catalog page's header search feeds the same state. The prototype gives that input an id; the shared
    // header (P04) does not carry one, so it is addressed by position to avoid changing every page's DOM.
    var headerSearch = document.querySelector('header input[type="text"]');
    if (headerSearch) {
        headerSearch.addEventListener('input', function (e) {
            state.searchQuery = e.target.value.trim();
            if (searchInput) searchInput.value = state.searchQuery;
            pipeline();
        });
    }

    // Pagination is a no-op in the prototype (12 books fit the single page), so the buttons stay disabled.
    // Kept here so the DOM/behaviour matches the reference and P11 can swap in real paging.
    document.querySelectorAll('[data-catalog-page]').forEach(function (btn) {
        btn.addEventListener('click', function () { /* changeCatalogPage(step): nothing to page through */ });
    });

    // The prototype runs runCatalogPipeline() on DOMContentLoaded, so the first paint is the A-Z sorted view
    // (and the default price range is applied). Blade renders the unsorted fixture order as the no-JS fallback.
    pipeline();
});
