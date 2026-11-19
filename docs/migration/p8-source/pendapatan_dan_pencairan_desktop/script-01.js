(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var rupiah = function (n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); };
  var MIN_WITHDRAWAL = 100000;
  var VERIFY_THRESHOLD = 5000000;

  /* Baseline demo data preserved from the existing page. */
  var BASE = {
    net: 1485000,
    available: 840000,
    pending: 645000,
    bank: 'BCA',
    bankName: 'Bank Central Asia (BCA)',
    holder: 'PT Kiblat Buku Utama',
    masked: '•••• 4892',
    withdrawals: [
      { id: 'WDR-2026-0042', date: '2026-11-12', amount: 645000, status: 'proses' },
      { id: 'WDR-2026-0038', date: '2026-10-28', amount: 1250000, status: 'selesai' },
      { id: 'WDR-2026-0029', date: '2026-10-14', amount: 850000, status: 'selesai' }
    ]
  };

  var state = { net: BASE.net, available: BASE.available, pending: BASE.pending, hasBank: true };
  var withdrawals = BASE.withdrawals.slice();
  var ui = { query: '', filter: 'all', page: 1, pageSize: 5, demo: 'A' };
  var pendingAmount = 0;
  var submitting = false;
  var requestId = 0;
  var counter = 43;

  /* ---------- helpers ---------- */
  function fmtDate(iso) {
    var d = new Date(iso + 'T00:00:00+07:00');
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(d);
  }
  function note(text) { var el = $('page-note'); el.textContent = text || ''; el.classList.toggle('hidden', !text); }
  function parseAmount(str) { return Number(String(str).replace(/[^\d]/g, '')) || 0; }
  function formatInput(digits) { return digits ? Number(digits).toLocaleString('id-ID') : ''; }
  function statusLabel(s) { return s === 'selesai' ? 'Selesai' : (s === 'proses' ? 'Dalam Proses' : 'Gagal'); }
  function statusClass(s) {
    return s === 'selesai'
      ? 'text-[12px] font-semibold text-[#0F7B4F]'
      : 'text-[12px] font-semibold text-muted';
  }

  /* ---------- KPI + bank ---------- */
  function paintSummary() {
    $('kpi-net').textContent = rupiah(state.net);
    $('kpi-available').textContent = rupiah(state.available);
    $('kpi-pending').textContent = rupiah(state.pending);

    $('bank-card-active').classList.toggle('hidden', !state.hasBank);
    $('bank-card-empty').classList.toggle('hidden', state.hasBank);
    $('bank-summary').textContent = state.hasBank ? BASE.bankName + ', ' + BASE.holder + ', ' + BASE.masked : '';
    $('bank-empty').classList.toggle('hidden', state.hasBank);
    $('bank-summary').classList.toggle('hidden', !state.hasBank);

    /* Withdrawal is blocked while no bank account is registered. */
    var blocked = !state.hasBank;
    $('btn-review').disabled = blocked;
    $('btn-review').classList.toggle('opacity-60', blocked);
    $('btn-review').classList.toggle('cursor-not-allowed', blocked);
    $('input-nominal').disabled = blocked;
    $('input-nominal').classList.toggle('bg-neutral', blocked);
    $('confirm-check').disabled = blocked;
  }

  /* ---------- history ---------- */
  function filteredWithdrawals() {
    var q = ui.query.trim().toLowerCase();
    return withdrawals.filter(function (w) {
      var okSearch = !q || w.id.toLowerCase().indexOf(q) !== -1;
      var okStatus = ui.filter === 'all' || w.status === ui.filter;
      return okSearch && okStatus;
    });
  }

  function renderHistory() {
    var list = filteredWithdrawals();
    var pages = Math.max(1, Math.ceil(list.length / ui.pageSize));
    if (ui.page > pages) ui.page = pages;
    var start = (ui.page - 1) * ui.pageSize;
    var visible = list.slice(start, start + ui.pageSize);

    var tbody = $('history-rows');
    tbody.innerHTML = '';

    visible.forEach(function (w) {
      var tr = document.createElement('tr');
      tr.className = 'border-b border-divider transition-colors hover:bg-soft';

      var tdId = document.createElement('td');
      tdId.className = 'px-5 py-3.5 lg:px-6';
      var idEl = document.createElement('span');
      idEl.className = 'num block font-semibold text-ink';
      idEl.textContent = w.id;
      var dateEl = document.createElement('span');
      dateEl.className = 'block text-[12px] text-muted';
      dateEl.textContent = fmtDate(w.date);
      tdId.appendChild(idEl);
      tdId.appendChild(dateEl);

      var tdAmount = document.createElement('td');
      tdAmount.className = 'num whitespace-nowrap px-4 py-3.5 text-right font-semibold text-ink';
      tdAmount.textContent = rupiah(w.amount);

      var tdBank = document.createElement('td');
      tdBank.className = 'num px-4 py-3.5 text-muted';
      tdBank.textContent = state.hasBank ? BASE.masked : '—';

      var tdStatus = document.createElement('td');
      tdStatus.className = 'px-4 py-3.5';
      var chip = document.createElement('span');
      chip.className = statusClass(w.status);
      chip.textContent = statusLabel(w.status);
      tdStatus.appendChild(chip);

      var tdAction = document.createElement('td');
      tdAction.className = 'px-4 py-3.5 pr-5 text-right lg:pr-6';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'focus-ring grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-neutral hover:text-ink';
      btn.setAttribute('aria-label', 'Lihat detail pengajuan ' + w.id);
      btn.setAttribute('data-detail', w.id);
      btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">visibility</span>';
      tdAction.appendChild(btn);

      tr.appendChild(tdId); tr.appendChild(tdAmount); tr.appendChild(tdBank); tr.appendChild(tdStatus); tr.appendChild(tdAction);
      tbody.appendChild(tr);
    });

    var empty = list.length === 0;
    $('history-empty').classList.toggle('hidden', !empty);
    tbody.closest('table').classList.toggle('hidden', empty);
    $('history-count').textContent = 'Menampilkan ' + visible.length + ' dari ' + list.length + ' pengajuan';
    $('page-current').textContent = String(ui.page);
    $('page-prev').disabled = ui.page <= 1;
    $('page-next').disabled = ui.page >= pages;
  }

  /* ---------- validation ---------- */
  function showNominalError(msg) {
    var el = $('nominal-error');
    el.textContent = msg || '';
    el.classList.toggle('hidden', !msg);
    $('input-nominal').setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  function validate() {
    var amount = parseAmount($('input-nominal').value);
    showNominalError('');
    $('confirm-error').classList.add('hidden');

    if (!state.hasBank) { note('Rekening bank belum terdaftar. Tambahkan rekening pada Pengaturan Profil.'); return null; }
    if (!amount) { showNominalError('Nominal pencairan wajib diisi.'); $('input-nominal').focus(); return null; }
    if (amount < MIN_WITHDRAWAL) { showNominalError('Minimum pencairan ' + rupiah(MIN_WITHDRAWAL) + '.'); $('input-nominal').focus(); return null; }
    if (amount > state.available) { showNominalError('Nominal melebihi saldo tersedia.'); $('input-nominal').focus(); return null; }
    if (!$('confirm-check').checked) { $('confirm-error').classList.remove('hidden'); $('confirm-check').focus(); return null; }
    if (submitting) return null;

    if (amount > VERIFY_THRESHOLD) {
      note('Pengajuan di atas ' + rupiah(VERIFY_THRESHOLD) + ' memerlukan verifikasi tambahan (simulasi prototype).');
    } else {
      note('');
    }
    return amount;
  }

  /* ---------- modals ---------- */
  var lastTrigger = null;

  function openModal(id, trigger) {
    lastTrigger = trigger || null;
    $(id).classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    var focusable = $(id).querySelector('input, button');
    if (focusable) focusable.focus();
  }
  function closeModal(id) {
    $(id).classList.add('hidden');
    document.body.style.overflow = '';
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
    lastTrigger = null;
  }

  /* ---------- nominal input ---------- */
  $('input-nominal').addEventListener('input', function (e) {
    var digits = e.target.value.replace(/[^\d]/g, '');
    e.target.value = formatInput(digits);
    showNominalError('');
  });

  /* ---------- review -> confirm -> submit ---------- */
  $('withdraw-form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (submitting) return;
    var amount = validate();
    if (!amount) return;
    pendingAmount = amount;
    $('confirm-amount').textContent = rupiah(amount);
    $('confirm-bank').textContent = BASE.bankName + ' ' + BASE.masked;
    openModal('modal-confirm', $('btn-review'));
  });

  document.querySelectorAll('[data-close-confirm]').forEach(function (el) {
    el.addEventListener('click', function () { closeModal('modal-confirm'); });
  });

  $('btn-submit').addEventListener('click', function () {
    if (submitting) return;
    /* Re-validate at final submit: never trust the earlier pass. */
    var amount = parseAmount($('input-nominal').value);
    if (!amount || amount < MIN_WITHDRAWAL || amount > state.available || !state.hasBank) {
      closeModal('modal-confirm');
      showNominalError('Periksa kembali nominal pencairan.');
      return;
    }

    submitting = true;
    var myRequest = ++requestId;
    var btn = $('btn-submit');
    btn.disabled = true;
    $('submit-label').textContent = 'Memproses...';

    window.setTimeout(function () {
      if (myRequest !== requestId) return;   /* demo state changed meanwhile */
      submitting = false;
      btn.disabled = false;
      $('submit-label').textContent = 'Ajukan Pencairan';

      var id = 'WDR-2026-00' + (counter++);
      withdrawals.unshift({ id: id, date: '2026-11-16', amount: amount, status: 'proses' });
      state.available -= amount;
      state.pending += amount;
      ui.page = 1;

      closeModal('modal-confirm');
      $('success-number').textContent = id;
      $('success-amount').textContent = rupiah(amount);
      openModal('modal-success', $('btn-review'));

      $('input-nominal').value = '';
      $('confirm-check').checked = false;
      paintSummary();
      renderHistory();
    }, 900);
  });

  document.querySelectorAll('[data-close-success]').forEach(function (el) {
    el.addEventListener('click', function () { closeModal('modal-success'); });
  });

  /* ---------- detail ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-detail]');
    if (!btn) return;
    var id = btn.getAttribute('data-detail');
    var w = withdrawals.filter(function (x) { return x.id === id; })[0];
    if (!w) return;
    $('detail-number').textContent = w.id;
    $('detail-status').textContent = statusLabel(w.status);
    $('detail-date').textContent = fmtDate(w.date);
    $('detail-amount').textContent = rupiah(w.amount);
    $('detail-bank').textContent = state.hasBank ? BASE.bankName + ' ' + BASE.masked : '—';
    $('detail-proof').textContent = w.status === 'selesai'
      ? 'Belum tersedia dalam prototype ini.'
      : 'Belum tersedia selama pengajuan masih diproses.';
    openModal('modal-detail', btn);
  });

  document.querySelectorAll('[data-close-detail]').forEach(function (el) {
    el.addEventListener('click', function () { closeModal('modal-detail'); });
  });

  /* ---------- search / filter / pagination ---------- */
  $('history-search').addEventListener('input', function (e) {
    ui.query = e.target.value;
    ui.page = 1;
    renderHistory();
  });
  $('history-filter').addEventListener('change', function (e) {
    ui.filter = e.target.value;
    ui.page = 1;
    renderHistory();
  });
  $('btn-reset-filter').addEventListener('click', function () {
    ui.query = '';
    ui.filter = 'all';
    ui.page = 1;
    $('history-search').value = '';
    $('history-filter').value = 'all';
    renderHistory();
  });
  $('page-prev').addEventListener('click', function () { if (ui.page > 1) { ui.page--; renderHistory(); } });
  $('page-next').addEventListener('click', function () { ui.page++; renderHistory(); });

  /* ---------- export (real CSV from the data in this page) ---------- */
  $('btn-export').addEventListener('click', function () {
    var rows = [['No. Pengajuan', 'Tanggal', 'Nominal', 'Rekening', 'Status']];
    withdrawals.forEach(function (w) {
      rows.push([w.id, w.date, w.amount, state.hasBank ? BASE.masked : '-', statusLabel(w.status)]);
    });
    rows.push([]);
    rows.push(['Total Pendapatan Neto', '', state.net]);
    rows.push(['Saldo Tersedia', '', state.available]);
    rows.push(['Dalam Proses Transfer', '', state.pending]);

    var csv = rows.map(function (r) { return r.join(';'); }).join('\r\n');
    var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'rekap-royalti-ikapi.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    note('Rekap CSV dibuat dari data pada halaman ini.');
  });

  /* ---------- demo states A–I ---------- */
  var demoToggle = $('demo-toggle'), demoMenu = $('demo-menu');
  function closeDemo() { demoMenu.classList.add('hidden'); demoToggle.setAttribute('aria-expanded', 'false'); }

  function syncDemoMenu() {
    document.querySelectorAll('.demo-item').forEach(function (b) {
      var on = b.getAttribute('data-demo') === ui.demo;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.classList.toggle('bg-soft', on);
      var check = b.querySelector('.demo-check');
      if (check) check.classList.toggle('hidden', !on);
    });
  }

  function applyDemo(s) {
    ui.demo = s;
    /* Invalidate any in-flight submission so no stale timer can fire. */
    requestId++;
    submitting = false;
    $('btn-submit').disabled = false;
    $('submit-label').textContent = 'Ajukan Pencairan';

    closeModal('modal-confirm'); closeModal('modal-success'); closeModal('modal-detail');
    $('view-error').classList.add('hidden');
    $('view-loading').classList.add('hidden');
    $('view-main').classList.remove('hidden');
    note('');

    withdrawals = BASE.withdrawals.slice();
    state.net = BASE.net;
    state.pending = BASE.pending;
    state.available = BASE.available;
    state.hasBank = true;
    $('input-nominal').value = '';
    $('confirm-check').checked = false;
    showNominalError('');
    $('confirm-error').classList.add('hidden');

    if (s === 'B') {
      state.available = 0;
    } else if (s === 'C') {
      state.hasBank = false;
    } else if (s === 'D') {
      $('input-nominal').value = formatInput(String(BASE.available + 250000));
      showNominalError('Nominal melebihi saldo tersedia.');
    } else if (s === 'E') {
      $('input-nominal').value = '500.000';
      $('confirm-check').checked = true;
      $('confirm-amount').textContent = rupiah(500000);
      $('confirm-bank').textContent = BASE.bankName + ' ' + BASE.masked;
      submitting = true;
      $('btn-submit').disabled = true;
      $('submit-label').textContent = 'Memproses...';
      openModal('modal-confirm', $('btn-review'));
      submitting = false;
    } else if (s === 'F') {
      $('success-number').textContent = 'WDR-2026-00' + counter;
      $('success-amount').textContent = rupiah(500000);
      openModal('modal-success', $('btn-review'));
    } else if (s === 'G' || s === 'H') {
      var target = withdrawals.filter(function (w) {
        return w.status === (s === 'G' ? 'selesai' : 'proses');
      })[0];
      if (target) {
        $('detail-number').textContent = target.id;
        $('detail-status').textContent = statusLabel(target.status);
        $('detail-date').textContent = fmtDate(target.date);
        $('detail-amount').textContent = rupiah(target.amount);
        $('detail-bank').textContent = BASE.bankName + ' ' + BASE.masked;
        $('detail-proof').textContent = s === 'G'
          ? 'Belum tersedia dalam prototype ini.'
          : 'Belum tersedia selama pengajuan masih diproses.';
        openModal('modal-detail', $('demo-toggle'));
      }
    } else if (s === 'I') {
      $('view-main').classList.add('hidden');
      $('view-error').classList.remove('hidden');
      $('retry-note').classList.add('hidden');
    }

    paintSummary();
    renderHistory();
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
      $('view-main').classList.remove('hidden');
      $('retry-note').classList.add('hidden');
      note('Data ditampilkan kembali menggunakan data demo prototype.');
      ui.demo = 'A';
      paintSummary();
      renderHistory();
      syncDemoMenu();
    }, 900);
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
    if (!$('modal-confirm').classList.contains('hidden')) { closeModal('modal-confirm'); return; }
    if (!$('modal-success').classList.contains('hidden')) { closeModal('modal-success'); return; }
    if (!$('modal-detail').classList.contains('hidden')) { closeModal('modal-detail'); return; }
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
  paintSummary();
  renderHistory();
  syncDemoMenu();
})();
