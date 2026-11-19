// users - Portal Administrator
// Ported verbatim from docs/design/prototype-copy/admin/kelola_pengguna_desktop.html (inline <script>, 488 lines).
// Only this wrapper is new: module scope and the app route names.
import { onReady } from '../shared.js';

onReady(function () {
    if (!document.querySelector('#user-search')) return;

    (function () {
      'use strict';

      var $ = function (id) { return document.getElementById(id); };

      /* Demo dataset carried over from the existing page. No buyer accounts exist in the repo. */
      var BASE_USERS = [
        {
          key: 'mizan', reg: 'REG-2026-088', name: 'PT Mizan Pustaka Utama', role: 'penerbit',
          pj: 'Ahmad Fuadi, M.Hum', email: 'ahmad.fuadi@mizan.co.id', phone: '+62 22 7834 1120',
          address: 'Jl. Cinambo No. 135, Cisaranten Wetan, Bandung, Jawa Barat 40294',
          ikapi: '042/JBA/2018', date: '2026-11-14', dateText: '14 Nov 2026, 09:30 WIB',
          registration: 'pending', account: 'active', reason: ''
        },
        {
          key: 'angkasa', reg: 'REG-2026-087', name: 'CV Angkasa Bandung', role: 'penerbit',
          pj: 'Dra. Ratna Juwita', email: 'ratna.j@angkasabandung.com', phone: '+62 22 420 5450',
          address: 'Jl. Merdeka No. 42, Babakan Ciamis, Sumur Bandung, Bandung 40117',
          ikapi: '018/JBA/2012', date: '2026-11-13', dateText: '13 Nov 2026, 16:15 WIB',
          registration: 'pending', account: 'active', reason: ''
        },
        {
          key: 'kautsar', reg: 'REG-2026-079', name: 'Penerbit Al-Kautsar Grafika', role: 'penerbit',
          pj: 'Ir. H. Syarif Hidayat', email: 'syarif@alkautsar.id', phone: '+62 21 8591 2244',
          address: 'Jl. Cipinang Muara III No. 49, Jatinegara, Jakarta Timur 13420',
          ikapi: '105/DKI/2005', date: '2026-11-11', dateText: '11 Nov 2026, 11:20 WIB',
          registration: 'approved', account: 'active', reason: ''
        },
        {
          key: 'pelangi', reg: 'REG-2026-064', name: 'CV Pelangi Aksara Digital', role: 'penerbit',
          pj: 'Dedi Kurniawan', email: 'dedi@pelangiaksara.com', phone: '+62 274 553 118',
          address: 'Jl. Gejayan No. 12A, Sleman, DI Yogyakarta 55281',
          ikapi: '091/DIY/2021', date: '2026-11-08', dateText: '08 Nov 2026, 14:00 WIB',
          registration: 'rejected', account: 'inactive', reason: 'Nomor anggota IKAPI belum sesuai dengan data keanggotaan.'
        }
      ];

      var users = BASE_USERS.map(function (u) { return Object.assign({}, u); });
      var ui = { tab: 'pending', query: '', role: 'all', status: 'all', page: 1, pageSize: 10, demo: 'A' };
      var selectedKey = null;
      var lastTrigger = null;

      var REG_LABEL = { pending: 'Menunggu Persetujuan', approved: 'Disetujui', rejected: 'Ditolak' };
      var ACC_LABEL = { active: 'Akun Aktif', inactive: 'Akun Nonaktif', none: 'Akun Belum Aktif' };

      function regClass(r) {
        if (r === 'approved') return 'text-[12px] font-semibold text-[#0F7B4F]';
        if (r === 'rejected') return 'text-[12px] font-semibold text-[#B42318]';
        return 'text-[12px] font-semibold text-muted';
      }

      function note(t) { var el = $('page-note'); el.textContent = t || ''; el.classList.toggle('hidden', !t); }
      function toast(t) {
        $('toast-text').textContent = t;
        $('toast').classList.remove('hidden');
        window.clearTimeout(toast.t);
        toast.t = window.setTimeout(function () { $('toast').classList.add('hidden'); }, 2800);
      }
      function paintRejectMeta(name, reg) {
        $('reject-name').textContent = name;
        $('reject-reg').textContent = reg;
      }

      /* ---------- filtering ---------- */
      function inTab(u) { return ui.tab === 'pending' ? u.registration === 'pending' : true; }

      function filtered() {
        var q = ui.query.trim().toLowerCase();
        return users.filter(function (u) {
          if (!inTab(u)) return false;
          if (ui.role !== 'all' && u.role !== ui.role) return false;
          if (ui.status !== 'all' && u.registration !== ui.status) return false;
          if (!q) return true;
          return (u.name + ' ' + u.pj + ' ' + u.email + ' ' + u.reg).toLowerCase().indexOf(q) !== -1;
        });
      }

      /* ---------- actions matrix ---------- */
      function actionsFor(u) {
        var actions = [];
        if (u.registration === 'pending') {
          actions.push({ id: 'approve', label: 'Setujui', kind: 'primary' });
          actions.push({ id: 'reject', label: 'Tolak', kind: 'ghost' });
        } else if (u.registration === 'approved' && u.account === 'active') {
          actions.push({ id: 'deactivate', label: 'Nonaktifkan', kind: 'ghost' });
        }
        /* Rejected and inactive accounts only expose their detail information. */
        return actions;
      }

      function paintTabs() {
        var pending = users.filter(function (u) { return u.registration === 'pending'; }).length;
        document.querySelectorAll('.tab-btn').forEach(function (btn) {
          var t = btn.getAttribute('data-tab');
          var n = t === 'pending' ? pending : users.length;
          btn.querySelector('.tab-count').textContent = '(' + n + ')';
          var on = t === ui.tab;
          btn.setAttribute('aria-selected', on ? 'true' : 'false');
          btn.className = 'tab-btn focus-ring rounded-lg px-3 py-1.5 text-[12.5px] ' +
            (on ? 'bg-white font-bold text-primary shadow-sm' : 'font-semibold text-muted hover:text-ink');
        });
        $('filter-hint').classList.toggle('hidden', ui.tab !== 'pending');
      }

      /* ---------- table ---------- */
      function render() {
        var list = filtered();
        var pages = Math.max(1, Math.ceil(list.length / ui.pageSize));
        if (ui.page > pages) ui.page = pages;
        var start = (ui.page - 1) * ui.pageSize;
        var visible = list.slice(start, start + ui.pageSize);

        var tbody = $('user-rows');
        tbody.innerHTML = '';

        visible.forEach(function (u) {
          var tr = document.createElement('tr');
          tr.className = 'border-b border-divider align-middle transition-colors hover:bg-soft';
          tr.setAttribute('data-user', u.key);

          var tdPub = document.createElement('td');
          tdPub.className = 'px-5 py-3.5 lg:px-6';
          var name = document.createElement('p');
          name.className = 'line-clamp-2 text-[13.5px] font-semibold leading-snug text-ink';
          name.textContent = u.name;
          var mail = document.createElement('p');
          mail.className = 'mt-0.5 break-words text-[12px] text-muted';
          mail.textContent = u.email;
          tdPub.appendChild(name);
          tdPub.appendChild(mail);

          var tdPj = document.createElement('td');
          tdPj.className = 'px-4 py-3.5 text-ink';
          tdPj.textContent = u.pj;

          var tdDate = document.createElement('td');
          tdDate.className = 'num px-4 py-3.5 text-muted';
          tdDate.textContent = u.dateText.replace(', ' + u.dateText.split(', ')[1], '');

          var tdStatus = document.createElement('td');
          tdStatus.className = 'px-4 py-3.5';
          var chip = document.createElement('span');
          chip.className = regClass(u.registration);
          chip.textContent = REG_LABEL[u.registration];
          tdStatus.appendChild(chip);

          var tdAction = document.createElement('td');
          tdAction.className = 'px-4 py-3.5 pr-5 text-right lg:pr-6';
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'focus-ring rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-primary transition-colors hover:bg-soft';
          btn.textContent = u.registration === 'pending' ? 'Tinjau' : 'Lihat Detail';
          btn.setAttribute('data-open', u.key);
          tdAction.appendChild(btn);

          tr.appendChild(tdPub); tr.appendChild(tdPj); tr.appendChild(tdDate);
          tr.appendChild(tdStatus); tr.appendChild(tdAction);
          tbody.appendChild(tr);
        });

        var datasetEmpty = list.length === 0 && !ui.query && ui.role === 'all' && ui.status === 'all';
        var noResults = !datasetEmpty && list.length === 0;

        tbody.closest('table').classList.toggle('hidden', list.length === 0);
        $('state-empty').classList.toggle('hidden', !datasetEmpty);
        $('state-noresults').classList.toggle('hidden', !noResults);
        $('state-empty-title').textContent = ui.tab === 'pending' ? 'Tidak Ada Pendaftaran Menunggu' : 'Belum Ada Data Pengguna';
        $('state-empty-desc').textContent = ui.tab === 'pending'
          ? 'Belum ada pengajuan penerbit yang perlu ditinjau.'
          : 'Belum ada data pengguna pada dataset prototype ini.';

        $('result-summary').textContent = 'Menampilkan ' + visible.length + ' dari ' + list.length + ' pengguna';
        $('page-current').textContent = String(ui.page);
        $('page-prev').disabled = ui.page <= 1;
        $('page-next').disabled = ui.page >= pages;

        $('btn-clear-search').classList.toggle('hidden', !ui.query);
        $('btn-clear-search').classList.toggle('grid', !!ui.query);

        paintTabs();
        syncDemoMenu();
      }

      /* ---------- drawer ---------- */
      function byKey(k) { return users.filter(function (u) { return u.key === k; })[0]; }

      function openDrawer(u, trigger) {
        selectedKey = u.key;
        lastTrigger = trigger || null;

        $('drawer-reg').textContent = u.reg;
        $('drawer-name').textContent = u.name;
        $('drawer-status').textContent = REG_LABEL[u.registration];
        $('drawer-status').className = regClass(u.registration);
        $('drawer-account').textContent = u.registration === 'pending' ? ACC_LABEL.none : ACC_LABEL[u.account];
        $('drawer-date').textContent = u.dateText;
        $('drawer-pj').textContent = u.pj;
        $('drawer-email').textContent = u.email;
        $('drawer-phone').textContent = u.phone;
        $('drawer-address').textContent = u.address;
        $('drawer-ikapi').textContent = u.ikapi;

        var rejected = u.registration === 'rejected';
        $('reject-reason-block').classList.toggle('hidden', !rejected);
        if (rejected) $('drawer-reason').textContent = u.reason || 'Tidak ada alasan tercatat.';

        var wrap = $('drawer-actions');
        wrap.innerHTML = '';
        actionsFor(u).forEach(function (a) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = a.kind === 'primary'
            ? 'focus-ring inline-flex h-10 items-center rounded-xl bg-primary px-4 text-[13.5px] font-semibold text-white hover:bg-primary-hover'
            : 'focus-ring inline-flex h-10 items-center rounded-xl border border-border px-4 text-[13.5px] font-semibold text-ink hover:bg-neutral';
          b.textContent = a.label;
          b.setAttribute('data-action', a.id);
          wrap.appendChild(b);
        });
        if (!wrap.childElementCount) {
          var info = document.createElement('p');
          info.className = 'text-[12.5px] text-muted';
          info.textContent = rejected ? 'Pendaftaran ditolak. Tidak ada tindakan lanjutan yang tersedia.' : 'Tidak ada tindakan tersedia untuk akun ini.';
          wrap.appendChild(info);
        }

        $('drawer-scrim').classList.remove('hidden');
        $('user-drawer').classList.add('is-open');
        $('user-drawer').setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        $('drawer-close').focus();
      }

      function closeDrawer() {
        $('user-drawer').classList.remove('is-open');
        $('user-drawer').setAttribute('aria-hidden', 'true');
        $('drawer-scrim').classList.add('hidden');
        document.body.style.overflow = '';
        if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
        lastTrigger = null;
      }

      $('drawer-close').addEventListener('click', closeDrawer);
      $('drawer-scrim').addEventListener('click', closeDrawer);

      document.addEventListener('click', function (e) {
        var open = e.target.closest('[data-open]');
        if (open) {
          var u = byKey(open.getAttribute('data-open'));
          if (u) openDrawer(u, open);
          return;
        }
        var act = e.target.closest('[data-action]');
        if (!act) return;
        var kind = act.getAttribute('data-action');
        var sel = byKey(selectedKey);
        if (!sel) return;
        if (kind === 'approve') {
          $('approve-name').textContent = sel.name;
          $('approve-reg').textContent = sel.reg;
          $('modal-approve').classList.remove('hidden');
        } else if (kind === 'reject') {
          paintRejectMeta(sel.name, sel.reg);
          $('reject-reason').value = '';
          $('reject-error').classList.add('hidden');
          $('modal-reject').classList.remove('hidden');
          $('reject-reason').focus();
        } else if (kind === 'deactivate') {
          $('deactivate-name').textContent = sel.name;
          $('modal-deactivate').classList.remove('hidden');
        }
      });

      /* ---------- modals ---------- */
      document.querySelectorAll('[data-close-approve]').forEach(function (el) {
        el.addEventListener('click', function () { $('modal-approve').classList.add('hidden'); });
      });
      document.querySelectorAll('[data-close-reject]').forEach(function (el) {
        el.addEventListener('click', function () { $('modal-reject').classList.add('hidden'); });
      });
      document.querySelectorAll('[data-close-deactivate]').forEach(function (el) {
        el.addEventListener('click', function () { $('modal-deactivate').classList.add('hidden'); });
      });

      $('btn-confirm-approve').addEventListener('click', function () {
        var u = byKey(selectedKey);
        if (!u) return;
        u.registration = 'approved';
        u.account = 'active';
        $('modal-approve').classList.add('hidden');
        refreshSelectedAndList(u);
        toast('Pendaftaran disetujui pada state prototype ini.');
      });

      $('btn-confirm-reject').addEventListener('click', function () {
        var reason = $('reject-reason').value.trim();
        if (!reason) {
          $('reject-error').classList.remove('hidden');
          $('reject-reason').focus();
          return;
        }
        $('reject-error').classList.add('hidden');
        var u = byKey(selectedKey);
        if (!u) return;
        u.registration = 'rejected';
        u.account = 'inactive';
        u.reason = reason;
        $('modal-reject').classList.add('hidden');
        refreshSelectedAndList(u);
        toast('Pendaftaran ditolak pada state prototype ini.');
      });

      $('btn-confirm-deactivate').addEventListener('click', function () {
        var u = byKey(selectedKey);
        if (!u) return;
        u.account = 'inactive';
        $('modal-deactivate').classList.add('hidden');
        refreshSelectedAndList(u);
        toast('Akun dinonaktifkan pada state prototype ini.');
      });

      function refreshSelectedAndList(u) {
        render();
        /* Keep the drawer in sync only if the record is still inside the active view. */
        var stillVisible = filtered().some(function (x) { return x.key === u.key; });
        if (stillVisible) openDrawer(u, null);
        else closeDrawer();
      }

      /* ---------- toolbar ---------- */
      document.querySelectorAll('.tab-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          ui.tab = btn.getAttribute('data-tab');
          ui.page = 1;
          if (ui.tab === 'pending') { ui.status = 'all'; $('status-filter').value = 'all'; }
          render();
        });
      });
      $('user-search').addEventListener('input', function (e) {
        ui.query = e.target.value;
        ui.page = 1;
        render();
      });
      $('btn-clear-search').addEventListener('click', function () {
        ui.query = '';
        $('user-search').value = '';
        ui.page = 1;
        render();
      });
      $('role-filter').addEventListener('change', function (e) {
        ui.role = e.target.value;
        ui.page = 1;
        render();
      });
      $('status-filter').addEventListener('change', function (e) {
        ui.status = e.target.value;
        ui.page = 1;
        render();
      });
      $('btn-reset-filter').addEventListener('click', function () {
        ui.query = ''; ui.role = 'all'; ui.status = 'all'; ui.page = 1;
        $('user-search').value = ''; $('role-filter').value = 'all'; $('status-filter').value = 'all';
        render();
      });
      $('page-prev').addEventListener('click', function () { if (ui.page > 1) { ui.page--; render(); } });
      $('page-next').addEventListener('click', function () { ui.page++; render(); });

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
        ['modal-approve', 'modal-reject', 'modal-deactivate'].forEach(function (id) { $(id).classList.add('hidden'); });
        $('toast').classList.add('hidden');
        note('');
        users = BASE_USERS.map(function (u) { return Object.assign({}, u); });
        ui.query = ''; ui.role = 'all'; ui.status = 'all'; ui.page = 1;
        $('user-search').value = ''; $('role-filter').value = 'all'; $('status-filter').value = 'all';
      }

      function applyDemo(s) {
        ui.demo = s;
        resetAll();

        if (s === 'A') { ui.tab = 'pending'; render(); }
        else if (s === 'B') { ui.tab = 'all'; render(); }
        else if (s === 'C') { ui.tab = 'all'; render(); openDrawer(byKey('kautsar'), $('demo-toggle')); }
        else if (s === 'D') {
          ui.tab = 'pending'; render();
          openDrawer(byKey('mizan'), $('demo-toggle'));
          $('approve-name').textContent = 'PT Mizan Pustaka Utama';
          $('approve-reg').textContent = 'REG-2026-088';
          $('modal-approve').classList.remove('hidden');
        } else if (s === 'E') {
          ui.tab = 'pending'; render();
          openDrawer(byKey('angkasa'), $('demo-toggle'));
          paintRejectMeta('CV Angkasa Bandung', 'REG-2026-087');
          $('reject-reason').value = '';
          $('reject-error').classList.add('hidden');
          $('modal-reject').classList.remove('hidden');
          $('reject-reason').focus();
        } else if (s === 'F') {
          ui.tab = 'all'; render();
          openDrawer(byKey('kautsar'), $('demo-toggle'));
          $('deactivate-name').textContent = 'Penerbit Al-Kautsar Grafika';
          $('modal-deactivate').classList.remove('hidden');
        } else if (s === 'G') {
          ui.tab = 'pending'; render();
          toast('Pendaftaran disetujui pada state prototype ini.');
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
        if (!$('modal-deactivate').classList.contains('hidden')) { $('modal-deactivate').classList.add('hidden'); return; }
        if (!$('modal-reject').classList.contains('hidden')) { $('modal-reject').classList.add('hidden'); return; }
        if (!$('modal-approve').classList.contains('hidden')) { $('modal-approve').classList.add('hidden'); return; }
        if ($('user-drawer').classList.contains('is-open')) { closeDrawer(); return; }
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

      /* ---------- init (tab Menunggu Persetujuan) ---------- */
      render();
    })();});
