(function () {
  'use strict';

  var state = { query: '', filter: 'all', page: 1, pageSize: 5, demo: 'filled' };
  var demoQuery = '';
  var pendingUnpublishId = null;
  var editingId = null;
  var lastTrigger = null;

  var $ = function (id) { return document.getElementById(id); };
  var rupiah = function (n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); };
  var allRows = function () { return Array.prototype.slice.call(document.querySelectorAll('#book-rows tr[data-id]')); };
  var findRow = function (id) { return document.querySelector('#book-rows tr[data-id="' + id + '"]'); };

  var CHIP = {
    published: 'text-[12px] font-semibold text-[#0F7B4F]',
    draft: 'text-[12px] font-semibold text-muted'
  };
  var BTN_ICON = 'focus-ring grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-neutral hover:text-ink';

  function data(tr) {
    return {
      id: tr.getAttribute('data-id'),
      title: tr.getAttribute('data-title'),
      author: tr.getAttribute('data-author'),
      price: Number(tr.getAttribute('data-price')),
      discount: Number(tr.getAttribute('data-discount')),
      sold: Number(tr.getAttribute('data-sold')),
      status: tr.getAttribute('data-status'),
      cover: tr.getAttribute('data-cover')
    };
  }

  function cell(tr, name) { return tr.querySelector('[data-cell="' + name + '"]'); }

  function paintRow(tr) {
    var d = data(tr);
    cell(tr, 'title').textContent = d.title;
    cell(tr, 'author').textContent = d.author;
    cell(tr, 'price').textContent = rupiah(d.price);
    cell(tr, 'discount').textContent = d.discount > 0 ? d.discount + '%' : '\u2014';
    cell(tr, 'sold').textContent = String(d.sold);

    var statusCell = cell(tr, 'status');
    statusCell.innerHTML = '';
    var chip = document.createElement('span');
    chip.className = CHIP[d.status] || CHIP.draft;
    chip.textContent = d.status === 'published' ? 'Terbit' : 'Draft';
    statusCell.appendChild(chip);

    var wrap = cell(tr, 'actions').firstElementChild;
    wrap.innerHTML = '';

    var more = document.createElement('button');
    more.type = 'button';
    more.className = BTN_ICON;
    more.setAttribute('aria-label', 'Aksi untuk ' + d.title);
    more.setAttribute('aria-haspopup', 'menu');
    more.setAttribute('aria-expanded', 'false');
    more.setAttribute('data-more', d.id);
    more.innerHTML = '<span class="material-symbols-outlined text-[18px]">more_vert</span>';
    wrap.appendChild(more);
  }

  function buildRow(d) {
    var tr = document.createElement('tr');
    tr.className = 'border-b border-divider align-middle transition-colors hover:bg-soft';
    tr.setAttribute('data-id', d.id);
    tr.setAttribute('data-title', d.title);
    tr.setAttribute('data-author', d.author);
    tr.setAttribute('data-price', d.price);
    tr.setAttribute('data-discount', d.discount);
    tr.setAttribute('data-sold', d.sold);
    tr.setAttribute('data-status', d.status);
    tr.setAttribute('data-cover', d.cover);
    tr.innerHTML =
      '<td class="px-4 py-3 lg:px-5">' +
        '<div class="flex items-start gap-3">' +
          '<img src="' + d.cover + '" alt="Sampul buku" class="h-14 w-10 shrink-0 rounded border border-border object-cover">' +
          '<div class="min-w-0">' +
            '<p data-cell="title" class="line-clamp-2 text-[13.5px] font-semibold leading-snug text-ink"></p>' +
            '<p data-cell="author" class="mt-0.5 text-[12px] text-muted"></p>' +
          '</div>' +
        '</div>' +
      '</td>' +
      '<td data-cell="price" class="num px-4 py-3 text-right font-medium text-ink"></td>' +
      '<td data-cell="discount" class="num px-4 py-3 text-right text-muted"></td>' +
      '<td data-cell="sold" class="num px-4 py-3 text-right text-ink"></td>' +
      '<td data-cell="status" class="px-4 py-3"></td>' +
      '<td data-cell="actions" class="px-4 py-3 pr-5 text-right lg:pr-6">' +
        '<div class="flex items-center justify-end gap-1.5"></div>' +
      '</td>';
    paintRow(tr);
    return tr;
  }

  function syncDemoMenu() {
    document.querySelectorAll('.demo-item').forEach(function (b) {
      var on = b.getAttribute('data-demo') === state.demo;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.classList.toggle('bg-soft', on);
      var check = b.querySelector('.demo-check');
      if (check) check.classList.toggle('hidden', !on);
    });
  }

  function note(text) {
    var el = $('page-note');
    el.textContent = text;
    el.classList.toggle('hidden', !text);
  }

  function render() {
    var rows = allRows();
    var catalogEmpty = state.demo === 'empty' || rows.length === 0;
    var query = (state.demo === 'noresults' ? demoQuery : state.query).trim().toLowerCase();

    var matches = catalogEmpty ? [] : rows.filter(function (tr) {
      var d = data(tr);
      var okSearch = !query || d.title.toLowerCase().indexOf(query) !== -1 || d.author.toLowerCase().indexOf(query) !== -1;
      var okStatus = state.filter === 'all' || d.status === state.filter;
      return okSearch && okStatus;
    });

    var total = matches.length;
    var pages = Math.max(1, Math.ceil(total / state.pageSize));
    if (state.page > pages) state.page = pages;
    var start = (state.page - 1) * state.pageSize;
    var visible = matches.slice(start, start + state.pageSize);

    rows.forEach(function (tr) { tr.classList.add('hidden'); });
    visible.forEach(function (tr) { tr.classList.remove('hidden'); });
    rows.forEach(paintRow);

    var counts = { all: catalogEmpty ? 0 : rows.length, published: 0, draft: 0 };
    if (!catalogEmpty) rows.forEach(function (tr) { counts[data(tr).status]++; });
    document.querySelectorAll('.filter-btn').forEach(function (btn) {
      var f = btn.getAttribute('data-filter');
      btn.querySelector('.filter-count').textContent = '(' + counts[f] + ')';
      var on = f === state.filter;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.className = 'filter-btn focus-ring rounded-lg px-3 py-1.5 text-[12.5px] ' +
        (on ? 'bg-white font-bold text-primary shadow-sm' : 'font-semibold text-muted hover:text-ink');
    });

    var isDraftFilter = state.filter === 'draft' && !query;
    var showDraftEmpty = !catalogEmpty && isDraftFilter && total === 0;
    var showNoResults = !catalogEmpty && !showDraftEmpty && total === 0;

    $('view-table').classList.toggle('hidden', state.demo === 'loading');
    $('view-loading').classList.toggle('hidden', state.demo !== 'loading');
    $('state-empty').classList.toggle('hidden', !catalogEmpty);
    $('state-draft-empty').classList.toggle('hidden', !showDraftEmpty);
    $('state-noresults').classList.toggle('hidden', !showNoResults);
    $('table-footer').classList.toggle('hidden', catalogEmpty);

    $('result-summary').textContent = 'Menampilkan ' + visible.length + ' dari ' + total + ' buku';
    $('page-current').textContent = String(state.page);
    $('page-prev').disabled = state.page <= 1;
    $('page-next').disabled = state.page >= pages;

    $('btn-clear-search').classList.toggle('hidden', !state.query);
    $('btn-clear-search').classList.toggle('grid', !!state.query);

    syncDemoMenu();
  }

  /* ---------------- Search & filter ---------------- */
  $('book-search').addEventListener('input', function (e) {
    state.query = e.target.value;
    if (state.demo === 'noresults') state.demo = 'filled';
    state.page = 1;
    render();
  });

  $('btn-clear-search').addEventListener('click', function () {
    state.query = '';
    $('book-search').value = '';
    state.page = 1;
    render();
  });

  $('btn-clear-all').addEventListener('click', function () {
    state.query = '';
    state.filter = 'all';
    state.demo = 'filled';
    $('book-search').value = '';
    state.page = 1;
    render();
  });

  document.querySelectorAll('.filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.filter = btn.getAttribute('data-filter');
      state.page = 1;
      render();
    });
  });

  /* ---------------- Pagination ---------------- */
  $('page-prev').addEventListener('click', function () { if (state.page > 1) { state.page--; render(); } });
  $('page-next').addEventListener('click', function () { state.page++; render(); });

  /* ---------------- Row action menu (fixed positioning) ---------------- */
  var rowMenu = $('row-menu');
  var menuBookId = null;

  function closeRowMenu() {
    rowMenu.classList.add('hidden');
    document.querySelectorAll('[data-more]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
  }

  document.addEventListener('click', function (e) {
    var more = e.target.closest('[data-more]');
    if (more) {
      e.preventDefault();
      var id = more.getAttribute('data-more');
      if (menuBookId === id && !rowMenu.classList.contains('hidden')) { closeRowMenu(); return; }
      menuBookId = id;
      var r = more.getBoundingClientRect();
      rowMenu.classList.remove('hidden');
      var menuW = 224, menuH = 44;
      rowMenu.style.left = Math.min(window.innerWidth - menuW - 12, Math.max(12, r.right - menuW)) + 'px';
      rowMenu.style.top = (r.bottom + menuH + 16 > window.innerHeight ? r.top - menuH - 8 : r.bottom + 6) + 'px';
      more.setAttribute('aria-expanded', 'true');
      var row = findRow(id);
      var draft = row && row.getAttribute('data-status') === 'draft';
      $('menu-publish').classList.toggle('hidden', !draft);
      $('menu-unpublish').classList.toggle('hidden', !!draft);
      return;
    }

    var addBtn = e.target.closest('[data-action="add"]');
    if (addBtn) { openBookModal(null); return; }

    if (!rowMenu.contains(e.target)) closeRowMenu();
  });

  function currentMenuRow() { return findRow(menuBookId); }

  $('menu-detail').addEventListener('click', function () {
    var tr = currentMenuRow();
    closeRowMenu();
    if (!tr) return;
    openDetail(tr);
  });

  $('menu-edit').addEventListener('click', function () {
    var id = menuBookId;
    closeRowMenu();
    if (id) openBookModal(id);
  });

  $('menu-publish').addEventListener('click', function () {
    var tr = currentMenuRow();
    closeRowMenu();
    if (!tr) return;
    tr.setAttribute('data-status', 'published');
    note('\u201c' + data(tr).title + '\u201d sekarang berstatus Terbit.');
    render();
  });

  $('menu-unpublish').addEventListener('click', function () {
    var tr = currentMenuRow();
    closeRowMenu();
    if (!tr) return;
    pendingUnpublishId = menuBookId;
    lastTrigger = document.querySelector('[data-more="' + menuBookId + '"]');
    $('unpublish-body').textContent = data(tr).title + ' tidak akan ditampilkan dalam katalog publik.';
    openModal('modal-unpublish');
  });

  /* ---------------- Book detail ---------------- */
  function openDetail(tr) {
    var d = data(tr);
    var final = d.discount > 0 ? Math.round(d.price * (1 - d.discount / 100)) : d.price;
    $('det-cover').src = d.cover;
    $('det-cover').alt = 'Sampul ' + d.title;
    $('det-title').textContent = d.title;
    $('det-author').textContent = d.author;
    $('det-status').className = d.status === 'published'
      ? 'mt-2 text-[12px] font-semibold text-[#0F7B4F]'
      : 'mt-2 text-[12px] font-semibold text-muted';
    $('det-status').textContent = d.status === 'published' ? 'Terbit' : 'Draft';
    $('det-id').textContent = d.id;
    $('det-sold').textContent = d.sold + ' eks';
    $('det-price').textContent = rupiah(d.price);
    $('det-discount').textContent = d.discount > 0 ? d.discount + '%' : '\u2014';
    $('det-final').textContent = rupiah(final);
    lastTrigger = document.querySelector('[data-more="' + d.id + '"]');
    editingId = d.id;
    openModal('modal-detail');
  }

  document.querySelectorAll('[data-close-detail]').forEach(function (el) {
    el.addEventListener('click', function () { closeModal('modal-detail'); });
  });

  $('det-edit').addEventListener('click', function () {
    var id = editingId;
    closeModal('modal-detail');
    if (id) openBookModal(id);
  });

  /* ---------------- Modals ---------------- */
  function openModal(id) {
    var m = $(id);
    m.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    var focusable = m.querySelector('input:not([type="hidden"]), button');
    if (focusable) focusable.focus();
  }

  function closeModal(id) {
    $(id).classList.add('hidden');
    document.body.style.overflow = '';
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
    lastTrigger = null;
  }

  document.querySelectorAll('[data-close-unpublish]').forEach(function (el) {
    el.addEventListener('click', function () { closeModal('modal-unpublish'); pendingUnpublishId = null; });
  });

  $('btn-confirm-unpublish').addEventListener('click', function () {
    var tr = findRow(pendingUnpublishId);
    if (tr) {
      tr.setAttribute('data-status', 'draft');
      note('\u201c' + data(tr).title + '\u201d dihentikan dari publikasi dan sekarang berstatus Draft.');
    }
    pendingUnpublishId = null;
    closeModal('modal-unpublish');
    render();
  });

  var form = $('book-form');

  function openBookModal(id) {
    editingId = id;
    lastTrigger = id ? document.querySelector('[data-more="' + id + '"]') : $('btn-add');
    var tr = id ? findRow(id) : null;
    var d = tr ? data(tr) : null;
    $('modal-book-title').textContent = d ? 'Edit Buku' : 'Tambah Buku Baru';
    $('f-title').value = d ? d.title : '';
    $('f-author').value = d ? d.author : '';
    $('f-price').value = d ? d.price : '';
    $('f-discount').value = d ? d.discount : 0;
    $('f-published').checked = d ? d.status === 'published' : false;
    form.querySelectorAll('[data-error]').forEach(function (p) { p.classList.add('hidden'); });
    openModal('modal-book');
    $('f-title').focus();
  }

  document.querySelectorAll('[data-close-book]').forEach(function (el) {
    el.addEventListener('click', function () { closeModal('modal-book'); });
  });

  $('btn-add').addEventListener('click', function () { openBookModal(null); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var title = $('f-title').value.trim();
    var author = $('f-author').value.trim();
    var price = Number($('f-price').value);
    var discount = Math.min(90, Math.max(0, Number($('f-discount').value) || 0));
    var published = $('f-published').checked;

    var ok = true;
    form.querySelectorAll('[data-error]').forEach(function (p) { p.classList.add('hidden'); });
    if (!title) { form.querySelector('[data-error="title"]').classList.remove('hidden'); ok = false; }
    if (!author) { form.querySelector('[data-error="author"]').classList.remove('hidden'); ok = false; }
    if (!price || price < 1000) { form.querySelector('[data-error="price"]').classList.remove('hidden'); ok = false; }
    if (!ok) return;

    if (editingId) {
      var tr = findRow(editingId);
      if (tr) {
        tr.setAttribute('data-title', title);
        tr.setAttribute('data-author', author);
        tr.setAttribute('data-price', price);
        tr.setAttribute('data-discount', discount);
        tr.setAttribute('data-status', published ? 'published' : 'draft');
      }
      note('Perubahan \u201c' + title + '\u201d disimpan pada prototype ini.');
    } else {
      $('book-rows').appendChild(buildRow({
        id: 'BK-NEW-' + Date.now().toString().slice(-4),
        title: title, author: author, price: price, discount: discount, sold: 0,
        status: published ? 'published' : 'draft',
        cover: '../../assets/covers/B04.jpg'
      }));
      note('\u201c' + title + '\u201d ditambahkan ke katalog prototype.');
      state.query = '';
      state.filter = 'all';
      $('book-search').value = '';
      state.page = 1;
    }
    closeModal('modal-book');
    render();
  });

  /* ---------------- Mode Demo ---------------- */
  var demoToggle = $('demo-toggle'), demoMenu = $('demo-menu');

  function closeDemo() { demoMenu.classList.add('hidden'); demoToggle.setAttribute('aria-expanded', 'false'); }

  demoToggle.addEventListener('click', function () {
    var open = demoMenu.classList.contains('hidden');
    demoMenu.classList.toggle('hidden', !open);
    demoToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  demoMenu.addEventListener('click', function (e) {
    var btn = e.target.closest('.demo-item');
    if (!btn) return;
    var scenario = btn.getAttribute('data-demo');
    state.demo = scenario;
    state.page = 1;

    if (scenario === 'noresults') { demoQuery = 'zz'; state.query = 'zz'; $('book-search').value = 'zz'; state.filter = 'all'; }
    if (scenario === 'draft') { state.filter = 'draft'; state.query = ''; $('book-search').value = ''; }
    if (scenario === 'filled' || scenario === 'empty' || scenario === 'loading') { state.filter = 'all'; state.query = ''; $('book-search').value = ''; }

    closeDemo();
    render();

    if (scenario === 'unpublish') {
      var target = null;
      allRows().forEach(function (tr) { if (!target && data(tr).status === 'published') target = tr; });
      if (target) {
        pendingUnpublishId = target.getAttribute('data-id');
        lastTrigger = document.querySelector('[data-more="' + pendingUnpublishId + '"]');
        $('unpublish-body').textContent = data(target).title + ' tidak akan ditampilkan dalam katalog publik.';
        openModal('modal-unpublish');
      }
    }
  });

  /* ---------------- Notifications & sidebar ---------------- */
  var notifBtn = $('btn-notif'), notifPanel = $('notif-panel');
  notifBtn.addEventListener('click', function () {
    var open = notifPanel.classList.contains('hidden');
    notifPanel.classList.toggle('hidden', !open);
    notifBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  document.addEventListener('click', function (e) {
    if (!demoMenu.contains(e.target) && !demoToggle.contains(e.target)) closeDemo();
    if (!notifPanel.contains(e.target) && !notifBtn.contains(e.target)) {
      notifPanel.classList.add('hidden');
      notifBtn.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeDemo();
    closeRowMenu();
    notifPanel.classList.add('hidden');
    notifBtn.setAttribute('aria-expanded', 'false');
    if (!$('modal-unpublish').classList.contains('hidden')) { closeModal('modal-unpublish'); pendingUnpublishId = null; }
    if (!$('modal-book').classList.contains('hidden')) closeModal('modal-book');
    if (!$('modal-detail').classList.contains('hidden')) closeModal('modal-detail');
    closeSidebar();
  });

  window.addEventListener('resize', closeRowMenu);
  window.addEventListener('scroll', closeRowMenu, { passive: true });

  var sidebar = $('publisher-sidebar'), scrim = $('sidebar-scrim'), toggle = $('sidebar-toggle');

  function openSidebar() {
    sidebar.classList.add('is-open');
    scrim.classList.remove('hidden');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    var first = sidebar.querySelector('a');
    if (first) first.focus();
  }
  function closeSidebar() {
    if (!sidebar.classList.contains('is-open')) return;
    sidebar.classList.remove('is-open');
    scrim.classList.add('hidden');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    toggle.focus();
  }
  toggle.addEventListener('click', function () {
    sidebar.classList.contains('is-open') ? closeSidebar() : openSidebar();
  });
  scrim.addEventListener('click', closeSidebar);
  sidebar.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeSidebar); });

  render();
})();
