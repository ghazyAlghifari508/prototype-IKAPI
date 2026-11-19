{{--
  Catalog filter sidebar. Source: <aside> in user/katalog_buku_desktop.html (9 checkboxes, 5 sort options,
  price range, reset). Facets come from the fixture (categories/publishers with their counts), so nothing is
  hardcoded and the counts stay truthful.
--}}
<aside class="lg:col-span-3 bg-white rounded-3xl p-6 border border-border-subtle shadow-sm flex flex-col gap-6 lg:sticky lg:top-36">
  <!-- Title & Reset -->
  <div class="flex items-center justify-between pb-3 border-b border-border-subtle">
    <div class="flex items-center gap-2">
      <span class="material-symbols-outlined text-primary text-[20px]">tune</span>
      <h2 class="text-[16px] font-bold text-ink-body">Filter Buku</h2>
    </div>
    <button type="button" data-catalog-reset class="text-[13px] font-semibold text-primary hover:text-primary-hover hover:underline cursor-pointer">
      Reset
    </button>
  </div>

  <!-- Section: Kategori -->
  <div class="flex flex-col gap-3">
    <span class="text-[13px] font-bold text-ink-body uppercase tracking-wider block">Kategori</span>
    <div class="flex flex-col gap-2.5 text-[13.5px]">
      <label class="flex items-center justify-between cursor-pointer group select-none">
        <span class="flex items-center gap-2.5">
          <input id="cat-all" checked class="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer" type="checkbox" data-category-all>
          <span class="text-ink-body group-hover:text-primary transition-colors font-medium">Semua Kategori</span>
        </span>
        <span class="text-[12px] text-ink-muted">({{ $catalog['facets']['allCount'] }})</span>
      </label>
      @foreach ($catalog['facets']['categories'] as $category)
        <label class="flex items-center justify-between cursor-pointer group select-none">
          <span class="flex items-center gap-2.5">
            <input class="cat-filter-checkbox w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer" data-category="{{ $category['label'] }}" type="checkbox" data-category-filter>
            <span class="text-ink-muted group-hover:text-ink-body transition-colors">{{ $category['label'] }}</span>
          </span>
          <span class="text-[12px] text-ink-muted">({{ $category['count'] }})</span>
        </label>
      @endforeach
    </div>
  </div>

  <!-- Section: Penerbit IKAPI Jabar -->
  <div class="flex flex-col gap-3 pt-3 border-t border-border-subtle">
    <span class="text-[13px] font-bold text-ink-body uppercase tracking-wider block">Penerbit IKAPI Jabar</span>
    <div class="flex flex-col gap-2.5 text-[13.5px]">
      @foreach ($catalog['facets']['publishers'] as $publisher)
        <label class="flex items-center justify-between cursor-pointer group select-none">
          <span class="flex items-center gap-2.5">
            <input class="pub-filter-checkbox w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer" data-publisher="{{ $publisher['label'] }}" type="checkbox" data-publisher-filter>
            <span class="text-ink-muted group-hover:text-ink-body transition-colors">{{ $publisher['label'] }}</span>
          </span>
          <span class="text-[12px] text-ink-muted">({{ $publisher['count'] }})</span>
        </label>
      @endforeach
    </div>
  </div>

  <!-- Section: Rentang Harga -->
  <div class="flex flex-col gap-3 pt-3 border-t border-border-subtle">
    <span class="text-[13px] font-bold text-ink-body uppercase tracking-wider block">Rentang Harga (Rp)</span>

    <!-- Price Inputs (Min & Max) -->
    <div class="grid grid-cols-2 gap-2 mt-1">
      <div class="space-y-1">
        <span class="text-[11px] text-ink-muted font-bold uppercase">Min</span>
        <input id="price-min-input" class="w-full h-10 px-2.5 rounded-xl bg-surface-neutral text-[13px] text-ink-body font-mono border border-border-subtle outline-none focus:border-primary focus:bg-white" type="number" placeholder="{{ $catalog['facets']['priceMin'] }}" value="{{ $catalog['facets']['priceMin'] }}">
      </div>
      <div class="space-y-1">
        <span class="text-[11px] text-ink-muted font-bold uppercase">Max</span>
        <input id="price-max-input" class="w-full h-10 px-2.5 rounded-xl bg-surface-neutral text-[13px] text-ink-body font-mono border border-border-subtle outline-none focus:border-primary focus:bg-white" type="number" placeholder="{{ $catalog['facets']['priceMax'] }}" value="{{ $catalog['facets']['priceMax'] }}">
      </div>
    </div>
    <button type="button" class="w-full h-10 rounded-xl bg-surface-neutral hover:bg-surface-soft hover:text-primary text-ink-body font-bold text-[13px] border border-border-subtle transition-colors cursor-pointer" data-catalog-apply-price>
      Terapkan Harga
    </button>
  </div>
</aside>