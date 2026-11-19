// orders - Portal Penerbit
// Ported verbatim from docs/design/prototype-copy/penerbit/pesanan_masuk_desktop.html (inline <script>, 407 lines).
// Only this wrapper is new: module scope, the demo fixture injection and the app route names.
import { onReady } from '../shared.js';

onReady(function () {
    if (!document.querySelector('#detail-invoice')) return;

    (function () {
      'use strict';

      var $ = function (id) { return document.getElementById(id); };
      var rupiah = function (n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); };

      /* Orders dataset (existing demo data). Dates are ISO for real date filtering. */
      var BASE_ORDERS = [
        {
          id: 'ORD-2026-11082', date: '2026-11-14', qty: 5, net: 241200, status: 'lunas',
          book: 'Laskar Aksara Pasundan', author: 'Ayi R. Kurnia',
          cover: '/assets/ikapi/covers/laskar-aksara-pasundan.jpg',
          items: [
            { title: 'Laskar Aksara Pasundan', author: 'Ayi R. Kurnia' },
            { title: 'Pendidikan Karakter Sunda', author: 'Dr. Cecep Hidayat' },
            { title: 'Bumi Parahyangan: Jejak Purba', author: 'T. Bachtiar' },
            { title: 'Flora Priangan: Arsip Hayati', author: 'Dr. Encep Kosasih' },
            { title: 'Tata Bahasa & Morfologi Sunda Modern', author: 'Prof. Dr. Iskandar' }
          ]
        },
        {
          id: 'ORD-2026-11045', date: '2026-11-13', qty: 1, net: 52000, status: 'lunas',
          book: 'Pendidikan Karakter Sunda', author: 'Dr. Cecep Hidayat',
          cover: '/assets/ikapi/covers/B02.jpg', items: null
        },
        {
          id: 'ORD-2026-10991', date: '2026-11-11', qty: 1, net: 58500, status: 'lunas',
          book: 'Bumi Parahyangan: Jejak Purba', author: 'T. Bachtiar',
          cover: '/assets/ikapi/covers/B03.jpg', items: null
        },
        {
          id: 'ORD-2026-10820', date: '2026-11-09', qty: 1, net: 48000, status: 'lunas',
          book: 'Flora Priangan: Arsip Hayati', author: 'Dr. Encep Kosasih',
          cover: '/assets/ikapi/covers/B05.jpg', items: null
        },
        {
          id: 'ORD-2026-10764', date: '2026-11-07', qty: 1, net: 40500, status: 'lunas',
          book: 'Laskar Aksara Pasundan', author: 'Ayi R. Kurnia',
          cover: '/assets/ikapi/covers/laskar-aksara-pasundan.jpg', items: null
        }
      ];

      /* Demo "today" anchor so relative filters stay stable. */
      var TODAY = new Date('2026-11-16T00:00:00+07:00');

      var orders = BASE_ORDERS.slice();
      var ui = { query: '', range: 'all', page: 1, pageSize: 5, demo: 'A' };
      var lastTrigger = null;
      var invoiceBusyFor = null;

      /* ---------- helpers ---------- */
      function fmtDate(iso) {
        var d = new Date(iso + 'T00:00:00+07:00');
        return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(d);
      }
      function note(text) { var el = $('page-note'); el.textContent = text || ''; el.classList.toggle('hidden', !text); }
      function statusChip() {
        var s = document.createElement('span');
        s.className = 'text-[12px] font-semibold text-[#0F7B4F]';
        s.textContent = 'Lunas';
        return s;
      }

      function inRange(order) {
        if (ui.range === 'all') return true;
        var d = new Date(order.date + 'T00:00:00+07:00');
        if (ui.range === '30d') {
          var from = new Date(TODAY.getTime() - 30 * 24 * 3600 * 1000);
          return d >= from && d <= TODAY;
        }
        return d.getFullYear() === TODAY.getFullYear() && d.getMonth() === TODAY.getMonth();
      }

      function matches(order) {
        var q = ui.query.trim().toLowerCase();
        var hay = [order.id, order.book, order.author];
        if (order.items) order.items.forEach(function (it) { hay.push(it.title, it.author); });
        var okSearch = !q || hay.join(' ').toLowerCase().indexOf(q) !== -1;
        return okSearch && inRange(order);
      }

      /* ---------- table ---------- */
      function render() {
        var list = orders.filter(matches);
        var pages = Math.max(1, Math.ceil(list.length / ui.pageSize));
        if (ui.page > pages) ui.page = pages;
        var start = (ui.page - 1) * ui.pageSize;
        var visible = list.slice(start, start + ui.pageSize);

        var tbody = $('order-rows');
        tbody.innerHTML = '';

        visible.forEach(function (o) {
          var tr = document.createElement('tr');
          tr.className = 'border-b border-divider align-middle transition-colors hover:bg-soft';
          tr.setAttribute('data-order-id', o.id);

          var tdOrder = document.createElement('td');
          tdOrder.className = 'px-5 py-3.5 lg:px-6';
          var idEl = document.createElement('span');
          idEl.className = 'num block whitespace-nowrap font-semibold text-ink';
          idEl.textContent = o.id;
          var dateEl = document.createElement('span');
          dateEl.className = 'mt-0.5 block text-[12px] text-muted';
          dateEl.textContent = fmtDate(o.date);
          tdOrder.appendChild(idEl);
          tdOrder.appendChild(dateEl);

          var tdBook = document.createElement('td');
          tdBook.className = 'px-4 py-3.5';
          var bookWrap = document.createElement('div');
          bookWrap.className = 'flex items-start gap-3';
          var img = document.createElement('img');
          img.className = 'h-14 w-10 shrink-0 rounded border border-border object-cover';
          img.src = o.cover;
          img.alt = 'Sampul ' + o.book;
          var bookBox = document.createElement('div');
          bookBox.className = 'min-w-0';
          var t = document.createElement('p');
          t.className = 'line-clamp-2 text-[13.5px] font-semibold leading-snug text-ink';
          t.textContent = o.book;
          var a = document.createElement('p');
          a.className = 'mt-0.5 text-[12px] text-muted';
          a.textContent = o.author;
          bookBox.appendChild(t);
          bookBox.appendChild(a);
          if (o.items && o.items.length > 1) {
            var more = document.createElement('p');
            more.className = 'mt-0.5 text-[12px] text-muted';
            more.textContent = '+' + (o.items.length - 1) + ' judul lainnya';
            bookBox.appendChild(more);
          }
          bookWrap.appendChild(img);
          bookWrap.appendChild(bookBox);
          tdBook.appendChild(bookWrap);

          var tdQty = document.createElement('td');
          tdQty.className = 'num px-4 py-3.5 text-right text-ink';
          tdQty.textContent = String(o.qty);

          var tdNet = document.createElement('td');
          tdNet.className = 'num whitespace-nowrap px-4 py-3.5 text-right font-semibold text-ink';
          tdNet.textContent = rupiah(o.net);

          var tdStatus = document.createElement('td');
          tdStatus.className = 'px-4 py-3.5';
          tdStatus.appendChild(statusChip());

          var tdActions = document.createElement('td');
          tdActions.className = 'px-4 py-3.5 pr-5 text-right lg:pr-6';
          var wrap = document.createElement('div');
          wrap.className = 'flex items-center justify-end gap-1.5';

          var detail = document.createElement('button');
          detail.type = 'button';
          detail.className = 'focus-ring rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-ink transition-colors hover:bg-neutral';
          detail.textContent = 'Detail';
          detail.setAttribute('data-detail', o.id);
          wrap.appendChild(detail);

          var inv = document.createElement('a');
          inv.className = 'focus-ring rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-primary transition-colors hover:bg-soft';
          inv.textContent = 'Invoice';
          inv.href = '/penerbit/invoice';
          inv.target = '_blank';
          inv.rel = 'noopener';
          inv.setAttribute('data-invoice', o.id);
          if (invoiceBusyFor === o.id) {
            inv.textContent = 'Menyiapkan...';
            inv.setAttribute('aria-disabled', 'true');
            inv.className = 'pointer-events-none rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-muted opacity-60';
          }
          wrap.appendChild(inv);

          tdActions.appendChild(wrap);

          tr.appendChild(tdOrder);
          tr.appendChild(tdBook);
          tr.appendChild(tdQty);
          tr.appendChild(tdNet);
          tr.appendChild(tdStatus);
          tr.appendChild(tdActions);
          tbody.appendChild(tr);
        });

        var datasetEmpty = orders.length === 0;
        var filteredEmpty = !datasetEmpty && list.length === 0;

        $('view-table').classList.toggle('hidden', ui.demo === 'F');
        $('view-loading').classList.toggle('hidden', ui.demo !== 'F');
        tbody.closest('table').classList.toggle('hidden', datasetEmpty || filteredEmpty);
        $('state-empty').classList.toggle('hidden', !datasetEmpty);
        $('state-noresults').classList.toggle('hidden', !filteredEmpty);
        $('table-footer').classList.toggle('hidden', datasetEmpty || filteredEmpty);

        $('result-summary').textContent = 'Menampilkan ' + visible.length + ' dari ' + list.length + ' pesanan';
        $('page-current').textContent = String(ui.page);
        $('page-prev').disabled = ui.page <= 1;
        $('page-next').disabled = ui.page >= pages;

        $('btn-clear-search').classList.toggle('hidden', !ui.query);
        $('btn-clear-search').classList.toggle('grid', !!ui.query);

        /* State E: invoice error preview for the first visible order */
        if (ui.demo === 'E' && visible.length) {
          note('Invoice Belum Dapat Dibuka untuk ' + visible[0].id + '. Terjadi kendala saat menyiapkan invoice. Coba lagi.');
        }

        syncDemoMenu();
      }

      /* ---------- detail modal ---------- */
      function openDetail(order, trigger) {
        lastTrigger = trigger || null;
        $('detail-order').textContent = order.id;
        $('detail-date').textContent = fmtDate(order.date);
        $('detail-qty').textContent = String(order.qty);
        $('detail-net').textContent = rupiah(order.net);
        $('detail-status').textContent = 'Lunas';
        $('detail-invoice').setAttribute('href', '/penerbit/invoice');

        var list = $('detail-items');
        list.innerHTML = '';
        if (order.items && order.items.length) {
          $('detail-items-note').classList.add('hidden');
          order.items.forEach(function (it) {
            var li = document.createElement('li');
            li.className = 'flex items-start gap-2 text-[13px]';
            var ic = document.createElement('span');
            ic.className = 'material-symbols-outlined mt-0.5 text-[16px] text-muted';
            ic.textContent = 'menu_book';
            var box = document.createElement('div');
            box.className = 'min-w-0';
            var p1 = document.createElement('p');
            p1.className = 'font-medium text-ink';
            p1.textContent = it.title;
            var p2 = document.createElement('p');
            p2.className = 'text-[12px] text-muted';
            p2.textContent = it.author;
            box.appendChild(p1);
            box.appendChild(p2);
            li.appendChild(ic);
            li.appendChild(box);
            list.appendChild(li);
          });
        } else {
          $('detail-items-note').classList.remove('hidden');
          var li = document.createElement('li');
          li.className = 'text-[13px] font-medium text-ink';
          li.textContent = order.book;
          list.appendChild(li);
        }

        $('modal-detail').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        var focusable = $('modal-detail').querySelector('button');
        if (focusable) focusable.focus();
      }

      function closeDetail() {
        $('modal-detail').classList.add('hidden');
        document.body.style.overflow = '';
        if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
        lastTrigger = null;
      }

      document.querySelectorAll('[data-close-detail]').forEach(function (el) {
        el.addEventListener('click', function () { closeDetail(); });
      });

      document.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-detail]');
        if (!btn) return;
        var id = btn.getAttribute('data-detail');
        var order = orders.filter(function (o) { return o.id === id; })[0];
        if (order) openDetail(order, btn);
      });

      /* ---------- search / date filter / pagination ---------- */
      $('order-search').addEventListener('input', function (e) {
        ui.query = e.target.value;
        ui.page = 1;
        render();
      });
      $('btn-clear-search').addEventListener('click', function () {
        ui.query = '';
        $('order-search').value = '';
        ui.page = 1;
        render();
      });
      $('date-filter').addEventListener('change', function (e) {
        ui.range = e.target.value;
        ui.page = 1;
        render();
      });
      $('btn-reset-filter').addEventListener('click', function () {
        ui.query = '';
        ui.range = 'all';
        ui.page = 1;
        $('order-search').value = '';
        $('date-filter').value = 'all';
        render();
      });
      $('page-prev').addEventListener('click', function () { if (ui.page > 1) { ui.page--; render(); } });
      $('page-next').addEventListener('click', function () { ui.page++; render(); });

      /* ---------- demo states A–F ---------- */
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
        invoiceBusyFor = null;
        note('');
        ui.query = '';
        ui.range = 'all';
        ui.page = 1;
        $('order-search').value = '';
        $('date-filter').value = 'all';
        orders = BASE_ORDERS.slice();

        if (s === 'B') {
          orders = [];
        } else if (s === 'C') {
          ui.query = 'ZZ-0000';
          $('order-search').value = ui.query;
        } else if (s === 'D') {
          invoiceBusyFor = orders[0] ? orders[0].id : null;
          note('Menyiapkan invoice untuk ' + (orders[0] ? orders[0].id : '-') + ' (simulasi prototype).');
        }

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
        if (!$('modal-detail').classList.contains('hidden')) { closeDetail(); return; }
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
    })();});
