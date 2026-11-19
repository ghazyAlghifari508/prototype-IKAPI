// monitoring - Portal Administrator
// Ported verbatim from docs/design/prototype-copy/admin/monitoring_global_desktop.html (inline <script>, 443 lines).
// Only this wrapper is new: module scope and the app route names.
import { onReady } from '../shared.js';

onReady(function () {
    if (!document.querySelector('#revenue-chart')) return;

    (function () {
      'use strict';

      var $ = function (id) { return document.getElementById(id); };
      var rupiah = function (n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); };

      /* Demo dataset: the six transactions available in the existing page.
         Snapshot figures (books, publishers) are marked as snapshot in the UI. */
      var BASE_TX = [
        { id: 'ORD-2026-0891', at: '2026-11-14T14:22:00+07:00', date: '2026-11-14', dateText: '14 Nov 2026, 14:22 WIB', book: 'Sang Pemimpi', publisher: 'PT Mizan Pustaka Utama', method: 'QRIS Gopay', amount: 145000, status: 'Berhasil' },
        { id: 'ORD-2026-0890', at: '2026-11-14T13:40:00+07:00', date: '2026-11-14', dateText: '14 Nov 2026, 13:40 WIB', book: 'Laskar Pelangi', publisher: 'PT Bentang Pustaka', method: 'BCA Virtual Account', amount: 85000, status: 'Berhasil' },
        { id: 'ORD-2026-0889', at: '2026-11-14T11:15:00+07:00', date: '2026-11-14', dateText: '14 Nov 2026, 11:15 WIB', book: 'Aroma Karsa', publisher: 'CV Angkasa Publishing', method: 'Mandiri Bill', amount: 120000, status: 'Berhasil' },
        { id: 'ORD-2026-0888', at: '2026-11-14T09:30:00+07:00', date: '2026-11-14', dateText: '14 Nov 2026, 09:30 WIB', book: 'Hujan di Bulan Juni', publisher: 'PT Mizan Pustaka Utama', method: 'BNI Virtual Account', amount: 95000, status: 'Berhasil' },
        { id: 'ORD-2026-0887', at: '2026-11-13T21:05:00+07:00', date: '2026-11-13', dateText: '13 Nov 2026, 21:05 WIB', book: 'Bumi Manusia', publisher: 'PT Bentang Pustaka', method: 'ShopeePay', amount: 110000, status: 'Berhasil' },
        { id: 'ORD-2026-0886', at: '2026-11-13T18:40:00+07:00', date: '2026-11-13', dateText: '13 Nov 2026, 18:40 WIB', book: 'Cantik Itu Luka', publisher: 'CV Pelangi Aksara', method: 'BRI Virtual Account', amount: 135000, status: 'Berhasil' },
        { id: 'ORD-2026-0879', at: '2026-11-12T10:05:00+07:00', date: '2026-11-12', dateText: '12 Nov 2026, 10:05 WIB', book: 'Laskar Aksara Pasundan', publisher: 'PT Kiblat Buku Utama', method: 'BCA Virtual Account', amount: 118000, status: 'Berhasil' },
        { id: 'ORD-2026-0863', at: '2026-11-06T16:20:00+07:00', date: '2026-11-06', dateText: '06 Nov 2026, 16:20 WIB', book: 'Pendidikan Karakter Sunda', publisher: 'UPI Press', method: 'Mandiri Bill', amount: 96000, status: 'Berhasil' },
        { id: 'ORD-2026-0852', at: '2026-11-05T09:48:00+07:00', date: '2026-11-05', dateText: '05 Nov 2026, 09:48 WIB', book: 'Flora Priangan: Arsip Hayati', publisher: 'Bumi Aksara', method: 'BNI Virtual Account', amount: 88000, status: 'Berhasil' },
        { id: 'ORD-2026-0841', at: '2026-11-03T13:12:00+07:00', date: '2026-11-03', dateText: '03 Nov 2026, 13:12 WIB', book: 'Bumi Parahyangan: Jejak Purba', publisher: 'ITB Press', method: 'QRIS Gopay', amount: 132000, status: 'Berhasil' }
      ];

      var SNAPSHOT_END = '2026-11-14';   /* last date covered by the demo dataset */
      var SNAPSHOT_BOOKS = 56;
      var SNAPSHOT_PUBLISHERS = 12;
      var PAGE_SIZE = 5;

      var tx = BASE_TX.slice();
      var ui = { preset: '14', publisher: 'all', page: 1, demo: 'A' };
      var applied = { preset: '14', publisher: 'all' };

      function note(t) { var el = $('page-note'); el.textContent = t || ''; el.classList.toggle('hidden', !t); }

      function presetRange(preset) {
        var end = new Date(SNAPSHOT_END + 'T00:00:00+07:00');
        var start = new Date(end.getTime());
        if (preset === '7') start.setDate(end.getDate() - 6);
        else if (preset === '14') start.setDate(end.getDate() - 13);
        else if (preset === '30') start.setDate(end.getDate() - 29);
        else start = new Date('2026-11-01T00:00:00+07:00');
        return { start: start, end: end };
      }

      function fmtShort(d) {
        return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(d);
      }

      function scopedRows() {
        if (!tx.length) return [];
        var r = presetRange(applied.preset);
        return tx.filter(function (t) {
          var d = new Date(t.date + 'T00:00:00+07:00');
          var inRange = d >= r.start && d <= r.end;
          var inPub = applied.publisher === 'all' || t.publisher === applied.publisher;
          return inRange && inPub;
        }).sort(function (a, b) { return new Date(b.at) - new Date(a.at); });
      }

      function series(rows) {
        var map = {};
        rows.forEach(function (t) {
          if (!map[t.date]) map[t.date] = { date: t.date, revenue: 0, count: 0 };
          map[t.date].revenue += t.amount;
          map[t.date].count += 1;
        });
        return Object.keys(map).sort().map(function (k) { return map[k]; });
      }

      /* ---------- chart ---------- */
      var activePoint = null;

      function renderChart(points) {
        var svg = $('revenue-chart');
        svg.innerHTML = '';
        $('chart-tooltip').classList.add('hidden');
        $('chart-peak').textContent = '';

        if (!points.length) {
          $('chart-empty').classList.remove('hidden');
          $('chart-empty').classList.add('grid');
          return;
        }
        $('chart-empty').classList.add('hidden');
        $('chart-empty').classList.remove('grid');

        var W = 720, H = 260, padL = 64, padR = 20, padT = 20, padB = 42;
        var maxV = Math.max.apply(null, points.map(function (p) { return p.revenue; }));
        var top = maxV * 1.15;
        var innerW = W - padL - padR;
        var innerH = H - padT - padB;
        var stepX = points.length > 1 ? innerW / (points.length - 1) : 0;

        var xOf = function (i) { return points.length > 1 ? padL + stepX * i : padL + innerW / 2; };
        var yOf = function (v) { return padT + innerH * (1 - v / top); };

        var NS = 'http://www.w3.org/2000/svg';
        function add(tag, attrs, text) {
          var el = document.createElementNS(NS, tag);
          Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
          if (text !== undefined) el.textContent = text;
          svg.appendChild(el);
          return el;
        }

        /* grid + y labels */
        [0, 0.5, 1].forEach(function (f) {
          var v = top * f;
          var y = yOf(v);
          add('line', { x1: padL, x2: W - padR, y1: y, y2: y, stroke: '#EFEFF2', 'stroke-width': 1 });
          add('text', { x: padL - 10, y: y + 4, 'font-size': 11, fill: '#62636B', 'text-anchor': 'end' },
            'Rp ' + Math.round(v).toLocaleString('id-ID'));
        });

        /* area + line */
        var linePts = points.map(function (p, i) { return xOf(i) + ',' + yOf(p.revenue); }).join(' ');
        var areaPts = padL + ',' + yOf(0) + ' ' + linePts + ' ' + xOf(points.length - 1) + ',' + yOf(0);
        add('polygon', { points: areaPts, fill: '#673DE6', 'fill-opacity': 0.10 });
        add('polyline', { points: linePts, fill: 'none', stroke: '#673DE6', 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });

        /* x labels */
        points.forEach(function (p, i) {
          add('text', { x: xOf(i), y: H - 14, 'font-size': 11, fill: '#62636B', 'text-anchor': 'middle' },
            new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(p.date + 'T00:00:00+07:00')));
        });

        /* points (keyboard focusable) */
        points.forEach(function (p, i) {
          var g = document.createElementNS(NS, 'g');
          g.setAttribute('tabindex', '0');
          g.setAttribute('role', 'button');
          g.setAttribute('aria-label', fmtShort(new Date(p.date + 'T00:00:00+07:00')) + ', omzet ' + rupiah(p.revenue) + ', ' + p.count + ' transaksi');
          g.setAttribute('data-point', String(i));
          g.style.cursor = 'pointer';

          var dot = document.createElementNS(NS, 'circle');
          dot.setAttribute('cx', xOf(i)); dot.setAttribute('cy', yOf(p.revenue)); dot.setAttribute('r', 4);
          dot.setAttribute('fill', '#FFFFFF'); dot.setAttribute('stroke', '#673DE6'); dot.setAttribute('stroke-width', 2);
          g.appendChild(dot);
          svg.appendChild(g);

          function show() { showTip(p, xOf(i), yOf(p.revenue)); activePoint = i; }
          g.addEventListener('mouseenter', show);
          g.addEventListener('focus', show);
          g.addEventListener('click', show);
          g.addEventListener('mouseleave', function () { if (activePoint !== i) hideTip(); });
          g.addEventListener('blur', hideTip);
        });

        /* dynamic peak */
        var peak = points.reduce(function (a, b) { return b.revenue > a.revenue ? b : a; }, points[0]);
        $('chart-peak').textContent = 'Puncak ' + fmtShort(new Date(peak.date + 'T00:00:00+07:00')) + ', ' + rupiah(peak.revenue);
      }

      function showTip(p, x, y) {
        var tip = $('chart-tooltip');
        $('tip-date').textContent = fmtShort(new Date(p.date + 'T00:00:00+07:00'));
        $('tip-revenue').textContent = rupiah(p.revenue);
        $('tip-count').textContent = String(p.count);
        tip.classList.remove('hidden');
        var svg = $('revenue-chart');
        var ratio = svg.clientWidth / 720 || 1;
        tip.style.left = Math.min(Math.max(x * ratio - 60, 0), (svg.clientWidth - 170)) + 'px';
        tip.style.top = Math.max(y * ratio - 76, 0) + 'px';
      }
      function hideTip() { $('chart-tooltip').classList.add('hidden'); activePoint = null; }

      /* ---------- table ---------- */
      function render() {
        var rows = scopedRows();
        var points = series(rows);

        var revenue = rows.reduce(function (a, t) { return a + t.amount; }, 0);
        $('kpi-revenue').textContent = rupiah(revenue);
        $('kpi-count').textContent = String(rows.length);
        $('kpi-revenue-sub').textContent = applied.publisher === 'all'
          ? 'Dari transaksi demo terfilter'
          : 'Dari transaksi ' + applied.publisher;
        $('kpi-books').textContent = String(SNAPSHOT_BOOKS);
        $('kpi-publishers').textContent = String(SNAPSHOT_PUBLISHERS);

        renderChart(points);

        var pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
        if (ui.page > pages) ui.page = pages;
        var start = (ui.page - 1) * PAGE_SIZE;
        var visible = rows.slice(start, start + PAGE_SIZE);

        var tbody = $('tx-rows');
        tbody.innerHTML = '';
        visible.forEach(function (t) {
          var tr = document.createElement('tr');
          tr.className = 'border-b border-divider align-middle transition-colors hover:bg-soft';

          var tdWhen = document.createElement('td');
          tdWhen.className = 'num whitespace-nowrap px-5 py-3.5 text-muted lg:px-6';
          tdWhen.textContent = t.dateText;

          var tdId = document.createElement('td');
          tdId.className = 'num whitespace-nowrap px-4 py-3.5 font-semibold text-ink';
          tdId.textContent = '#' + t.id;

          var tdBook = document.createElement('td');
          tdBook.className = 'px-4 py-3.5';
          var b = document.createElement('p');
          b.className = 'font-semibold text-ink';
          b.textContent = t.book;
          var p = document.createElement('p');
          p.className = 'mt-0.5 text-[12px] text-muted';
          p.textContent = t.publisher;
          tdBook.appendChild(b);
          tdBook.appendChild(p);

          var tdMethod = document.createElement('td');
          tdMethod.className = 'px-4 py-3.5 text-ink';
          tdMethod.textContent = t.method;

          var tdAmount = document.createElement('td');
          tdAmount.className = 'num whitespace-nowrap px-4 py-3.5 text-right font-semibold text-ink';
          tdAmount.textContent = rupiah(t.amount);

          var tdStatus = document.createElement('td');
          tdStatus.className = 'px-4 py-3.5 pr-5 lg:pr-6';
          var chip = document.createElement('span');
          chip.className = 'text-[12px] font-semibold text-[#0F7B4F]';
          chip.textContent = t.status;
          tdStatus.appendChild(chip);

          tr.appendChild(tdWhen); tr.appendChild(tdId); tr.appendChild(tdBook);
          tr.appendChild(tdMethod); tr.appendChild(tdAmount); tr.appendChild(tdStatus);
          tbody.appendChild(tr);
        });

        var empty = rows.length === 0;
        tbody.closest('table').classList.toggle('hidden', empty);
        $('state-empty').classList.toggle('hidden', !empty);
        $('btn-export').disabled = empty;
        $('btn-export').classList.toggle('opacity-40', empty);
        $('btn-export').classList.toggle('cursor-not-allowed', empty);

        $('table-count').textContent = 'Menampilkan ' + visible.length + ' dari ' + rows.length + ' transaksi';
        $('table-sub').textContent = applied.publisher === 'all'
          ? 'Transaksi demo pada periode terpilih'
          : 'Transaksi ' + applied.publisher + ' pada periode terpilih';
        $('page-current').textContent = String(ui.page);
        $('page-prev').disabled = ui.page <= 1;
        $('page-next').disabled = ui.page >= pages;

        var r = presetRange(applied.preset);
        $('date-range').textContent = fmtShort(r.start) + ' - ' + fmtShort(r.end);
        paintPresets();
        syncDemoMenu();
      }

      function paintPresets() {
        document.querySelectorAll('.preset-btn').forEach(function (b) {
          var on = b.getAttribute('data-preset') === ui.preset;
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
          b.className = 'preset-btn focus-ring rounded-lg px-3 py-1.5 text-[12.5px] ' +
            (on ? 'bg-white font-bold text-primary shadow-sm' : 'font-semibold text-muted hover:text-ink');
        });
      }

      /* ---------- filters ---------- */
      document.querySelectorAll('.preset-btn').forEach(function (b) {
        b.addEventListener('click', function () {
          ui.preset = b.getAttribute('data-preset');
          paintPresets();
        });
      });

      function paintPublishers() {
        var sel = $('publisher-filter');
        var list = [];
        tx.forEach(function (t) { if (list.indexOf(t.publisher) === -1) list.push(t.publisher); });
        sel.innerHTML = '';
        var all = document.createElement('option');
        all.value = 'all'; all.textContent = 'Semua Penerbit';
        sel.appendChild(all);
        list.forEach(function (p) {
          var o = document.createElement('option');
          o.value = p; o.textContent = p;
          sel.appendChild(o);
        });
        sel.value = list.indexOf(ui.publisher) !== -1 ? ui.publisher : 'all';
        ui.publisher = sel.value;
      }

      $('publisher-filter').addEventListener('change', function (e) {
        ui.publisher = e.target.value;
      });

      function doReset() {
        ui.preset = '14'; ui.publisher = 'all';
        applied.preset = '14'; applied.publisher = 'all';
        ui.page = 1;
        tx = BASE_TX.slice();
        paintPublishers();
        note('');
        render();
      }
      $('btn-reset').addEventListener('click', doReset);
      $('btn-reset-empty').addEventListener('click', doReset);

      $('page-prev').addEventListener('click', function () { if (ui.page > 1) { ui.page--; render(); } });
      $('page-next').addEventListener('click', function () { ui.page++; render(); });

      /* ---------- CSV export ---------- */
      $('btn-export').addEventListener('click', function () {
        var rows = scopedRows();
        if (!rows.length) return;
        var out = [['Tanggal', 'ID Transaksi', 'Buku', 'Penerbit', 'Metode Bayar', 'Nominal', 'Status']];
        rows.forEach(function (t) { out.push([t.dateText, t.id, t.book, t.publisher, t.method, t.amount, t.status]); });
        out.push([]);
        out.push(['Total omzet', '', '', '', '', rows.reduce(function (a, t) { return a + t.amount; }, 0), '']);
        var csv = out.map(function (r) { return r.join(';'); }).join('\r\n');
        var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'monitoring-transaksi-ikapi.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        note('CSV dibuat dari ' + rows.length + ' transaksi yang tampil saat ini.');
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

      function applyDemo(s) {
        ui.demo = s;
        $('view-error').classList.add('hidden');
        $('view-data').classList.remove('hidden');
        $('retry-note').classList.add('hidden');
        note('');

        tx = BASE_TX.slice();
        ui.publisher = 'all';
        ui.page = 1;

        if (s === 'B') { ui.preset = '7'; }
        else if (s === 'C') { ui.preset = '14'; ui.publisher = 'PT Mizan Pustaka Utama'; }
        else if (s === 'D') { tx = []; ui.preset = '14'; }
        else if (s === 'E') {
          $('view-data').classList.add('hidden');
          $('view-error').classList.remove('hidden');
        } else { ui.preset = '14'; }

        applied.preset = ui.preset;
        applied.publisher = ui.publisher;
        paintPublishers();
        render();
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
        window.setTimeout(function () {
          btn.disabled = false;
          $('view-error').classList.add('hidden');
          $('view-data').classList.remove('hidden');
          $('retry-note').classList.remove('hidden');
          applyDemo('A');
          note('Data ditampilkan kembali menggunakan dataset demo prototype.');
        }, 700);
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

      window.addEventListener('resize', function () { hideTip(); });

      /* ---------- init ---------- */
      paintPublishers();
      render();
    })();});
