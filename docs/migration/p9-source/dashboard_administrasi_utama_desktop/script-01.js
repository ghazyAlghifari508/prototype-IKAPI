(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var rupiah = function (n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); };

  var BASE = {
    kpi: { revenue: 18450000, paid: 142, books: 56, publishers: 12 },
    queue: [
      { category: 'Pendaftaran Penerbit', count: 2, unit: 'menunggu', detail: 'PT Mizan Pustaka Utama, CV Angkasa Bandung', cta: 'Tinjau Akun', href: 'kelola_pengguna_desktop.html' },
      { category: 'Pengajuan Pencairan', count: 1, unit: 'pengajuan', detail: 'PT Kiblat Buku Utama, Rp 645.000', cta: 'Tinjau Pencairan', href: 'kelola_pencairan_dana_desktop.html' },
      { category: 'Laporan Buku', count: 1, unit: 'laporan', detail: 'Sang Pemimpi, E-book tidak dapat dibuka', cta: 'Periksa Buku', href: 'pengawasan_katalog_buku_global_desktop.html' },
      { category: 'Laporan Komentar & Ulasan', count: 1, unit: 'laporan', detail: 'Ulasan yang menunggu pemeriksaan', cta: 'Tinjau Laporan', href: 'moderasi_ulasan_dan_komentar_desktop.html' }
    ],
    activity: [
      { id: 'ORD-2026-0891', buyer: 'Alghifari Ghazy', qty: 2, amount: 145000, at: '14 Nov 2026, 14:22 WIB' },
      { id: 'ORD-2026-0890', buyer: 'Siti Nurhaliza', qty: 1, amount: 85000, at: '14 Nov 2026, 13:40 WIB' },
      { id: 'ORD-2026-0889', buyer: 'Dwi Raharjo', qty: 1, amount: 120000, at: '14 Nov 2026, 11:15 WIB' },
      { id: 'ORD-2026-0888', buyer: 'Anita Wulandari', qty: 1, amount: 95000, at: '14 Nov 2026, 09:30 WIB' }
    ]
  };

  var ui = { demo: 'A' };
  var data = { kpi: BASE.kpi, queue: BASE.queue, activity: BASE.activity };

  function note(text) { var el = $('page-note'); el.textContent = text || ''; el.classList.toggle('hidden', !text); }

  function paintKpi(kpi) {
    $('kpi-revenue').textContent = rupiah(kpi.revenue);
    $('kpi-paid').textContent = String(kpi.paid);
    $('kpi-books').textContent = String(kpi.books);
    $('kpi-publishers').textContent = String(kpi.publishers);
  }

  function paintQueue(queue, variant) {
    var list = $('queue-list');
    list.innerHTML = '';

    var categoryCount = queue.length;
    var itemCount = queue.reduce(function (a, q) { return a + q.count; }, 0);
    var countEl = $('queue-count');
    countEl.textContent = '';
    countEl.className = 'flex flex-wrap items-center gap-2 num text-[12.5px] text-muted';
    ['<x> kategori', '<y> item menunggu'].forEach(function (tpl, i) {
      if (i) {
        var dv = document.createElement('span');
        dv.className = 'inline-block h-3 w-px bg-border';
        countEl.appendChild(dv);
      }
      var sp = document.createElement('span');
      sp.textContent = tpl.replace('<x>', String(categoryCount)).replace('<y>', String(itemCount));
      countEl.appendChild(sp);
    });

    if (!queue.length) {
      $('queue-empty').classList.remove('hidden');
      $('queue-empty-title').textContent = variant === 'empty-dataset' ? 'Belum Ada Aktivitas yang Perlu Ditangani' : 'Tidak Ada Pekerjaan Menunggu';
      $('queue-empty-desc').textContent = variant === 'empty-dataset'
        ? 'Belum ada pekerjaan operasional yang masuk.'
        : 'Semua pekerjaan dalam antrean saat ini telah ditangani.';
      return;
    }
    $('queue-empty').classList.add('hidden');

    queue.forEach(function (q) {
      var li = document.createElement('li');
      li.className = 'px-5 py-4';

      var top = document.createElement('div');
      top.className = 'flex flex-wrap items-baseline justify-between gap-2';
      var name = document.createElement('p');
      name.className = 'text-[13.5px] font-semibold text-ink';
      name.textContent = q.category;
      var count = document.createElement('p');
      count.className = 'num text-[12.5px] text-muted';
      count.textContent = q.count + ' ' + q.unit;
      top.appendChild(name);
      top.appendChild(count);

      var detail = document.createElement('p');
      detail.className = 'mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] leading-relaxed text-muted';
      q.detail.split(', ').forEach(function (part, i) {
        if (i) {
          var dv = document.createElement('span');
          dv.className = 'inline-block h-3 w-px bg-border';
          detail.appendChild(dv);
        }
        var sp = document.createElement('span');
        sp.textContent = part;
        detail.appendChild(sp);
      });

      var actions = document.createElement('div');
      actions.className = 'mt-2.5 flex items-center justify-end';
      var link = document.createElement('a');
      link.className = 'focus-ring inline-flex items-center gap-1 rounded text-[12.5px] font-semibold text-primary hover:text-primary-hover';
      link.href = q.href;
      var label = document.createElement('span');
      label.textContent = q.cta;
      var icon = document.createElement('span');
      icon.className = 'material-symbols-outlined text-[16px]';
      icon.textContent = 'arrow_forward';
      link.appendChild(label);
      link.appendChild(icon);
      actions.appendChild(link);

      li.appendChild(top);
      li.appendChild(detail);
      li.appendChild(actions);
      list.appendChild(li);
    });
  }

  function paintActivity(rows) {
    var list = $('activity-list');
    list.innerHTML = '';

    if (!rows.length) {
      $('activity-empty').classList.remove('hidden');
      return;
    }
    $('activity-empty').classList.add('hidden');

    rows.forEach(function (r, i) {
      var li = document.createElement('li');
      li.className = (i === 0 ? '' : '') + 'px-5 py-3.5';

      var top = document.createElement('div');
      top.className = 'flex items-baseline justify-between gap-3';
      var id = document.createElement('p');
      id.className = 'num text-[13px] font-semibold text-ink';
      id.textContent = r.id;
      var amount = document.createElement('p');
      amount.className = 'num whitespace-nowrap text-[13px] font-semibold text-ink';
      amount.textContent = rupiah(r.amount);
      top.appendChild(id);
      top.appendChild(amount);

      var buyer = document.createElement('p');
      buyer.className = 'mt-1 flex flex-wrap items-center gap-x-2 text-[12.5px] text-ink';
      var buyerName = document.createElement('span');
      buyerName.textContent = r.buyer;
      var buyerDivider = document.createElement('span');
      buyerDivider.className = 'inline-block h-3 w-px bg-border';
      var buyerQty = document.createElement('span');
      buyerQty.className = 'num text-muted';
      buyerQty.textContent = r.qty + ' e-book';
      buyer.appendChild(buyerName);
      buyer.appendChild(buyerDivider);
      buyer.appendChild(buyerQty);

      var at = document.createElement('p');
      at.className = 'mt-0.5 num text-[12px] text-muted';
      at.textContent = r.at;

      li.appendChild(top);
      li.appendChild(buyer);
      li.appendChild(at);
      list.appendChild(li);
    });
  }

  function render() {
    paintKpi(data.kpi);
    paintQueue(data.queue, ui.demo === 'C' ? 'empty-dataset' : 'normal');
    paintActivity(data.activity);
  }

  /* ---------- demo states A–D ---------- */
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

  function applyDemo(s) {
    ui.demo = s;
    $('view-error').classList.add('hidden');
    $('view-loading').classList.add('hidden');
    $('view-data').classList.remove('hidden');
    note('');

    if (s === 'B') {
      data = { kpi: BASE.kpi, queue: [], activity: BASE.activity };
    } else if (s === 'C') {
      data = { kpi: { revenue: 0, paid: 0, books: 0, publishers: 0 }, queue: [], activity: [] };
    } else if (s === 'D') {
      /* Whole data area becomes the error state — no stale queue/feed left visible. */
      $('view-data').classList.add('hidden');
      $('view-error').classList.remove('hidden');
      $('retry-note').classList.add('hidden');
      data = { kpi: BASE.kpi, queue: BASE.queue, activity: BASE.activity };
    } else {
      data = { kpi: BASE.kpi, queue: BASE.queue, activity: BASE.activity };
    }

    render();
    syncDemoMenu();
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

  $('btn-retry').addEventListener('click', function () {
    var btn = $('btn-retry');
    btn.disabled = true;
    $('view-error').classList.add('hidden');
    $('view-loading').classList.remove('hidden');
    window.setTimeout(function () {
      btn.disabled = false;
      $('view-loading').classList.add('hidden');
      $('view-data').classList.remove('hidden');
      ui.demo = 'A';
      data = { kpi: BASE.kpi, queue: BASE.queue, activity: BASE.activity };
      render();
      syncDemoMenu();
      note('Data ditampilkan kembali menggunakan data demo prototype.');
    }, 800);
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

  /* ---------- init (State A) ---------- */
  render();
  syncDemoMenu();
})();
