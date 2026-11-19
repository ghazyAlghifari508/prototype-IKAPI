(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  /* Moderation dataset carried over from the existing page.
     No book cover asset exists in the repository for these titles, so a neutral
     placeholder is rendered instead of borrowing another book's cover. */
  var BASE_RECORDS = [
    {
      key: 'rian', id: 'MOD-2026-089', user: 'Rian Pratama', handle: '@rian_pratama',
      book: 'Laskar Aksara Pasundan', author: 'Ayi R. Kurnia', publisher: 'PT Kiblat Buku Utama', rating: 1,
      cover: '../../assets/covers/laskar-aksara-pasundan.jpg',
      category: 'Kata Kasar & Provokasi', reporters: 3,
      reportedAt: '2026-11-16T08:00:00+07:00', timeText: '2 jam lalu',
      comment: 'E-book ini mengecewakan! Penerbit dan penulisnya tolol, susunan babnya berantakan dan web reader sering gagal dimuat di tengah bacaan. Buang-buang uang beli sampah begini!',
      reply: { publisher: 'PT Kiblat Buku Utama', text: 'Halo Kak Rian, mohon maaf atas ketidaknyamanannya. Kendala pemuatan Web Reader dan tata letak bab sudah kami perbaiki pada berkas e-book terbaru. Silakan muat ulang perpustakaan Anda.' },
      notes: '', decision: 'new'
    },
    {
      key: 'promo', id: 'MOD-2026-088', user: 'PromoBookOnline99', handle: '@bot_diskon',
      book: 'Pendidikan Karakter Sunda', author: 'Dr. Cecep Hidayat', publisher: 'UPI Press', rating: 5,
      cover: '../../assets/covers/B02.jpg',
      category: 'Spam & Promosi Eksternal', reporters: 1,
      reportedAt: '2026-11-16T06:00:00+07:00', timeText: '4 jam lalu',
      comment: 'PROMO GILA! Klaim e-book gratis dan saldo jutaan rupiah tiap hari, klik bit.ly/uang-gratis-ikapi sekarang juga! Terbukti membayar 100% no hoax!!',
      reply: null, notes: '', decision: 'new'
    },
    {
      key: 'dewi', id: 'MOD-2026-087', user: 'Dewi Sartika', handle: '@dewi.sartika',
      book: 'Bumi Parahyangan: Jejak Purba', author: 'T. Bachtiar', publisher: 'ITB Press', rating: 1,
      cover: '../../assets/covers/B03.jpg',
      category: 'Ujaran Kebencian', reporters: 5,
      reportedAt: '2026-11-15T20:00:00+07:00', timeText: 'kemarin',
      comment: 'Isi e-book ini menyebarkan kebencian terhadap suku tertentu dan sengaja merusak moral generasi muda. Penerbit seperti ini tidak layak ada di katalog dan harus diblokir permanen!',
      reply: null, notes: '', decision: 'new'
    }
  ];

  var records = BASE_RECORDS.map(function (r) { return Object.assign({}, r); });
  var ui = { tab: 'reported', query: '', category: 'all', sort: 'newest', demo: 'A' };
  var selectedKey = null;
  var lastTrigger = null;
  var deleting = false;

  function note(t) { var el = $('page-note'); el.textContent = t || ''; el.classList.toggle('hidden', !t); }
  function toast(t) {
    $('toast-text').textContent = t;
    $('toast').classList.remove('hidden');
    window.clearTimeout(toast.t);
    toast.t = window.setTimeout(function () { $('toast').classList.add('hidden'); }, 2800);
  }
  function byKey(k) { return records.filter(function (r) { return r.key === k; })[0]; }
  function pending() { return records.filter(function (r) { return r.decision === 'new'; }); }

  /* ---------- filtering ---------- */
  function inTab(r) { return ui.tab === 'all' ? true : r.decision === 'new'; }

  function filtered() {
    var q = ui.query.trim().toLowerCase();
    var list = records.filter(function (r) {
      if (!inTab(r)) return false;
      if (ui.category !== 'all' && r.category !== ui.category) return false;
      if (!q) return true;
      return (r.user + ' ' + r.handle + ' ' + r.comment + ' ' + r.book + ' ' + r.category).toLowerCase().indexOf(q) !== -1;
    });
    return list.sort(function (a, b) {
      if (ui.sort === 'reporters') return b.reporters - a.reporters;
      var aT = new Date(a.reportedAt).getTime(), bT = new Date(b.reportedAt).getTime();
      return ui.sort === 'oldest' ? aT - bT : bT - aT;
    });
  }

  function paintTabs() {
    var reported = pending().length;
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
      var t = btn.getAttribute('data-tab');
      btn.querySelector('.tab-count').textContent = '(' + (t === 'reported' ? reported : records.length) + ')';
      var on = t === ui.tab;
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
      btn.className = 'tab-btn focus-ring rounded-lg px-3 py-1.5 text-[12.5px] ' +
        (on ? 'bg-white font-bold text-primary shadow-sm' : 'font-semibold text-muted hover:text-ink');
    });
    $('queue-summary').textContent = reported + ' laporan menunggu peninjauan';
  }

  /* Canonical report categories. Buyer reports (detail_buku_desktop.html) map their
     reasons onto these values, so the filter also lists categories that have no
     record yet instead of hiding them. */
  var CANONICAL_CATEGORIES = [
    'Spam & Promosi Eksternal',
    'Kata Kasar & Provokasi',
    'Ujaran Kebencian',
    'Informasi Pribadi',
    'Lainnya'
  ];

  function paintCategories() {
    var sel = $('category-filter');
    var cats = [];
    records.forEach(function (r) { if (cats.indexOf(r.category) === -1) cats.push(r.category); });
    CANONICAL_CATEGORIES.forEach(function (c) { if (cats.indexOf(c) === -1) cats.push(c); });
    sel.innerHTML = '';
    var all = document.createElement('option');
    all.value = 'all'; all.textContent = 'Semua Kategori';
    sel.appendChild(all);
    cats.forEach(function (c) {
      var o = document.createElement('option');
      o.value = c; o.textContent = c;
      sel.appendChild(o);
    });
    sel.value = cats.indexOf(ui.category) !== -1 ? ui.category : 'all';
    if (sel.value !== ui.category) ui.category = 'all';
  }

  /* ---------- queue render ---------- */
  function render() {
    var list = filtered();
    var queue = $('queue');
    queue.innerHTML = '';

    list.forEach(function (r) {
      var card = document.createElement('article');
      card.className = 'rounded-2xl border border-border bg-white p-5 transition-colors hover:bg-soft';
      card.setAttribute('data-record', r.key);

      /* header */
      var head = document.createElement('div');
      head.className = 'flex flex-wrap items-start justify-between gap-3';
      var who = document.createElement('div');
      who.className = 'min-w-0';
      var name = document.createElement('p');
      name.className = 'text-[14.5px] font-semibold text-ink';
      name.textContent = r.user;
      var handle = document.createElement('p');
      handle.className = 'mt-0.5 text-[12px] text-muted';
      handle.textContent = r.handle;
      who.appendChild(name);
      who.appendChild(handle);

      var meta = document.createElement('div');
      meta.className = 'flex items-center gap-2';
      var cat = document.createElement('span');
      cat.className = 'text-[12px] font-semibold text-[#B42318]';
      cat.textContent = r.category;
      var rep = document.createElement('span');
      rep.className = 'num text-[12px] font-semibold text-muted';
      rep.textContent = r.reporters + ' laporan';
      meta.appendChild(cat);
      meta.appendChild(rep);

      head.appendChild(who);
      head.appendChild(meta);

      /* book context */
      var book = document.createElement('p');
      book.className = 'mt-3 text-[13px] text-ink';
      var bookTitle = document.createElement('span');
      bookTitle.className = 'font-semibold';
      bookTitle.textContent = r.book;
      var bookDiv = document.createElement('span');
      bookDiv.className = 'mx-1.5 inline-block h-3 w-px bg-border';
      var bookRating = document.createElement('span');
      bookRating.className = 'num text-muted';
      bookRating.textContent = 'Rating ' + r.rating + '/5';
      book.appendChild(bookTitle);
      book.appendChild(bookDiv);
      book.appendChild(bookRating);

      /* comment preview */
      var preview = document.createElement('p');
      preview.className = 'line-clamp-3 mt-2 text-[14px] leading-relaxed text-ink';
      preview.textContent = r.comment;

      /* footer */
      var foot = document.createElement('div');
      foot.className = 'mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-divider pt-3';
      var when = document.createElement('span');
      when.className = 'num text-[12px] text-muted';
      when.textContent = 'Dilaporkan ' + r.timeText;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'focus-ring inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-primary transition-colors hover:bg-soft';
      btn.textContent = 'Tinjau';
      btn.setAttribute('data-open', r.key);
      var icon = document.createElement('span');
      icon.className = 'material-symbols-outlined text-[16px]';
      icon.textContent = 'arrow_forward';
      btn.appendChild(icon);
      foot.appendChild(when);
      foot.appendChild(btn);

      card.appendChild(head);
      card.appendChild(book);
      card.appendChild(preview);
      card.appendChild(foot);
      queue.appendChild(card);
    });

    var noData = records.length === 0;
    var queueEmpty = !noData && ui.tab === 'reported' && pending().length === 0 && !ui.query && ui.category === 'all';
    var noResults = !noData && list.length === 0 && !queueEmpty;

    $('state-nodata').classList.toggle('hidden', !noData);
    $('state-queue-empty').classList.toggle('hidden', !queueEmpty);
    $('state-noresults').classList.toggle('hidden', !noResults);
    queue.classList.toggle('hidden', list.length === 0);

    $('btn-clear-search').classList.toggle('hidden', !ui.query);
    $('btn-clear-search').classList.toggle('grid', !!ui.query);

    paintTabs();
    syncDemoMenu();
  }

  /* ---------- drawer ---------- */
  function openDrawer(r, trigger) {
    selectedKey = r.key;
    lastTrigger = trigger || null;

    $('drawer-id').textContent = r.id;
    $('drawer-user').textContent = r.user + ' (' + r.handle + ')';
    $('drawer-time').textContent = 'Dilaporkan ' + r.timeText;
    $('drawer-comment').textContent = r.comment;

    $('drawer-cover').src = r.cover;
    $('drawer-cover').alt = 'Sampul ' + r.book;
    $('drawer-book').textContent = r.book;
    $('drawer-author').textContent = r.author;
    $('drawer-publisher').textContent = r.publisher;
    $('drawer-rating').textContent = 'Rating ' + r.rating + '/5';

    $('drawer-category').textContent = r.category;
    $('drawer-reporters').textContent = r.reporters + ' pengguna';
    $('drawer-reported-at').textContent = r.timeText;
    $('drawer-notes').textContent = r.notes ? r.notes : 'Tidak ada catatan pelapor.';

    var hasReply = !!(r.reply && r.reply.text);
    $('drawer-reply').classList.toggle('hidden', !hasReply);
    $('drawer-reply-publisher').classList.toggle('hidden', !hasReply);
    $('drawer-reply-empty').classList.toggle('hidden', hasReply);
    if (hasReply) {
      $('drawer-reply-publisher').textContent = r.reply.publisher;
      $('drawer-reply').textContent = r.reply.text;
    }

    var decided = r.decision !== 'new';
    $('drawer-decision').classList.toggle('hidden', !decided);
    if (decided) {
      $('drawer-decision').textContent = r.decision === 'kept'
        ? 'Komentar dipertahankan. Laporan ditandai selesai pada prototype ini.'
        : 'Komentar ditandai dihapus pada state prototype ini.';
    }
    $('btn-keep').disabled = decided;
    $('btn-delete').disabled = decided;

    $('drawer-scrim').classList.remove('hidden');
    $('mod-drawer').classList.add('is-open');
    $('mod-drawer').setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('drawer-close').focus();
  }

  function closeDrawer() {
    $('mod-drawer').classList.remove('is-open');
    $('mod-drawer').setAttribute('aria-hidden', 'true');
    $('drawer-scrim').classList.add('hidden');
    document.body.style.overflow = '';
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
    lastTrigger = null;
  }

  $('drawer-close').addEventListener('click', closeDrawer);
  $('drawer-scrim').addEventListener('click', closeDrawer);

  document.addEventListener('click', function (e) {
    var open = e.target.closest('[data-open]');
    if (!open) return;
    var r = byKey(open.getAttribute('data-open'));
    if (r) openDrawer(r, open);
  });

  /* ---------- decisions ---------- */
  $('btn-keep').addEventListener('click', function () {
    var r = byKey(selectedKey);
    if (!r || r.decision !== 'new') return;
    r.decision = 'kept';
    render();
    if (inTab(r)) openDrawer(r, null); else closeDrawer();
    toast('Laporan ditandai selesai. Komentar dipertahankan (state prototype).');
  });

  $('btn-delete').addEventListener('click', function () {
    var r = byKey(selectedKey);
    if (!r || r.decision !== 'new') return;
    $('delete-user').textContent = r.user;
    $('delete-book').textContent = r.book;
    $('modal-delete').classList.remove('hidden');
  });

  document.querySelectorAll('[data-close-delete]').forEach(function (el) {
    el.addEventListener('click', function () { $('modal-delete').classList.add('hidden'); });
  });

  $('btn-confirm-delete').addEventListener('click', function () {
    if (deleting) return;
    var r = byKey(selectedKey);
    if (!r) { $('modal-delete').classList.add('hidden'); return; }

    deleting = true;
    var btn = $('btn-confirm-delete');
    btn.disabled = true;
    $('delete-label').textContent = 'Menghapus...';

    window.setTimeout(function () {
      deleting = false;
      btn.disabled = false;
      $('delete-label').textContent = 'Hapus Komentar';
      r.decision = 'removed';
      $('modal-delete').classList.add('hidden');
      render();
      if (inTab(r)) openDrawer(r, null); else closeDrawer();
      toast('Komentar ditandai dihapus pada state prototype ini.');
    }, 600);
  });

  /* ---------- toolbar ---------- */
  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      ui.tab = btn.getAttribute('data-tab');
      render();
    });
  });
  $('mod-search').addEventListener('input', function (e) {
    ui.query = e.target.value;
    render();
  });
  $('btn-clear-search').addEventListener('click', function () {
    ui.query = '';
    $('mod-search').value = '';
    render();
  });
  $('category-filter').addEventListener('change', function (e) {
    ui.category = e.target.value;
    render();
  });
  $('sort-order').addEventListener('change', function (e) {
    ui.sort = e.target.value;
    render();
  });
  $('btn-reset-filter').addEventListener('click', function () {
    ui.query = ''; ui.category = 'all'; ui.sort = 'newest';
    $('mod-search').value = ''; $('category-filter').value = 'all'; $('sort-order').value = 'newest';
    render();
  });

  /* ---------- demo scenarios ---------- */
  var demoToggle = $('demo-toggle'), demoMenu = $('demo-menu');
  function closeDemo() { demoMenu.classList.add('hidden'); demoToggle.setAttribute('aria-expanded', 'false'); }
  function syncDemoMenu() {
    document.querySelectorAll('.demo-item').forEach(function (b) {
      var on = b.getAttribute('data-demo') === ui.demo;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.classList.toggle('bg-soft', on);
      var c = b.querySelector('.demo-check');
      if (c) c.classList.toggle('hidden', !on);
    });
  }

  function resetAll() {
    closeDrawer();
    $('modal-delete').classList.add('hidden');
    $('toast').classList.add('hidden');
    note('');
    records = BASE_RECORDS.map(function (r) { return Object.assign({}, r); });
    ui.query = ''; ui.category = 'all'; ui.sort = 'newest';
    $('mod-search').value = ''; $('sort-order').value = 'newest';
    paintCategories();
  }

  function applyDemo(s) {
    ui.demo = s;
    resetAll();

    if (s === 'A') { ui.tab = 'reported'; render(); }
    else if (s === 'B') { ui.tab = 'all'; render(); }
    else if (s === 'C') { ui.tab = 'reported'; render(); openDrawer(byKey('rian'), $('demo-toggle')); }
    else if (s === 'D') {
      ui.tab = 'reported'; render();
      openDrawer(byKey('rian'), $('demo-toggle'));
      $('delete-user').textContent = 'Rian Pratama';
      $('delete-book').textContent = 'Laskar Aksara Pasundan';
      $('modal-delete').classList.remove('hidden');
    } else if (s === 'E') {
      ui.tab = 'reported'; render();
      var r = byKey('rian');
      if (r) { r.decision = 'kept'; }
      render();
      toast('Laporan ditandai selesai. Komentar dipertahankan (state prototype).');
    } else if (s === 'F') {
      ui.tab = 'reported';
      var target = byKey('rian');
      if (target) target.decision = 'removed';
      render();
      toast('Komentar ditandai dihapus pada state prototype ini.');
    } else if (s === 'G') {
      records.forEach(function (r) { r.decision = 'kept'; });
      ui.tab = 'reported';
      render();
    }
  }

  demoToggle.addEventListener('click', function () {
    var open = demoMenu.classList.contains('hidden');
    demoMenu.classList.toggle('hidden', !open);
    demoToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  demoMenu.addEventListener('click', function (e) {
    var btn = e.target.closest('.demo-item');
    if (!btn) return;
    closeDemo();
    applyDemo(btn.getAttribute('data-demo'));
  });

  /* ---------- notifications / sidebar / keyboard ---------- */
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
    if (!$('modal-delete').classList.contains('hidden')) { $('modal-delete').classList.add('hidden'); return; }
    if ($('mod-drawer').classList.contains('is-open')) { closeDrawer(); return; }
    closeDemo();
    notifPanel.classList.add('hidden');
    notifBtn.setAttribute('aria-expanded', 'false');
    closeSidebar();
  });

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

  /* ---------- init ---------- */
  paintCategories();
  render();
})();
