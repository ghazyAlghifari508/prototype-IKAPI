(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  /* Review dataset (seeded demo data, e-book relevant). */
  var BASE_REVIEWS = [
    {
      id: 1,
      book: 'Laskar Aksara Pasundan',
      bookAuthor: 'Ayi R. Kurnia',
      cover: '../../assets/covers/laskar-aksara-pasundan.jpg',
      reviewer: 'Dian Nugraha',
      date: '14 November 2026',
      content: 'Uraian sejarah aksara dan kearifan Sunda disajikan sangat hidup dan mudah dipahami. Namun di bab 4 terkait aksara rarangken rasanya butuh glosarium tambahan agar pembaca pemula tidak tersendat.',
      reply: null
    },
    {
      id: 2,
      book: 'Pendidikan Karakter Sunda',
      bookAuthor: 'Dr. Cecep Hidayat',
      cover: '../../assets/covers/B02.jpg',
      reviewer: 'Siti Rahmawati',
      date: '12 November 2026',
      content: 'Buku yang sangat komprehensif untuk pengajaran nilai budi pekerti di sekolah. Format e-book di web reader sangat nyaman dibaca, baik di laptop maupun saat dibuka dari ponsel.',
      reply: { content: 'Terima kasih Ibu Siti atas apresiasi dan masukannya. Kami berkomitmen menghadirkan karya literasi pendidikan yang mendalam bagi generasi muda Jawa Barat.', date: '13 November 2026' }
    },
    {
      id: 3,
      book: 'Bumi Parahyangan: Jejak Purba',
      bookAuthor: 'T. Bachtiar',
      cover: '../../assets/covers/B03.jpg',
      reviewer: 'Hendra Wijaya',
      date: '10 November 2026',
      content: 'Ilustrasi geologi purba yang disertakan sangat informatif dan tajam saat dibuka di web reader. Sangat membuka wawasan tentang Bandung purba dan pembentukan bentang alam Priangan.',
      reply: null
    },
    {
      id: 4,
      book: 'Flora Priangan: Arsip Hayati',
      bookAuthor: 'Dr. Encep Kosasih',
      cover: '../../assets/covers/B05.jpg',
      reviewer: 'Maya Lestari',
      date: '08 November 2026',
      content: 'Dokumentasi taksonomi tanaman endemik yang sangat langka dan berharga. Penyajian gambar digitalnya jernih, dan struktur babnya memudahkan saya menelusuri spesies tertentu.',
      reply: { content: 'Terima kasih banyak atas dukungannya! Suplemen botani pegunungan sedang kami siapkan untuk edisi digital berikutnya.', date: '09 November 2026' }
    }
  ];

  var reviews = BASE_REVIEWS.map(function (r) { return Object.assign({}, r); });
  var ui = { query: '', filter: 'all', demo: 'A' };
  var editorOpenFor = null;
  var draftReply = {};
  var sendingFor = null;
  var requestId = 0;
  var lastTrigger = null;

  /* ---------- helpers ---------- */
  function hasReply(r) { return !!(r.reply && r.reply.content); }
  function counts() {
    var replied = reviews.filter(hasReply).length;
    var total = reviews.length;
    return {
      total: total,
      replied: replied,
      unreplied: total - replied,
      rate: total ? Math.round((replied / total) * 100) : null
    };
  }
  function showToast(msg) {
    $('toast-text').textContent = msg;
    $('toast').classList.remove('hidden');
    window.clearTimeout(showToast.t);
    showToast.t = window.setTimeout(function () { $('toast').classList.add('hidden'); }, 2800);
  }
  function note(text) { var el = $('page-note'); el.textContent = text || ''; el.classList.toggle('hidden', !text); }

  function paintSummary() {
    var c = counts();
    var rateText = c.rate === null ? 'belum ada data' : c.rate + '% respons';
    $('review-summary').textContent = c.total + ' ulasan, ' + c.unreplied + ' belum dibalas, ' + rateText;

    document.querySelectorAll('.filter-btn').forEach(function (btn) {
      var f = btn.getAttribute('data-filter');
      var n = f === 'all' ? c.total : (f === 'replied' ? c.replied : c.unreplied);
      btn.querySelector('.filter-count').textContent = '(' + n + ')';
      var on = f === ui.filter;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.className = 'filter-btn focus-ring rounded-lg px-3 py-1.5 text-[12.5px] ' +
        (on ? 'bg-white font-bold text-primary shadow-sm' : 'font-semibold text-muted hover:text-ink');
    });
  }

  function visibleReviews() {
    var q = ui.query.trim().toLowerCase();
    return reviews.filter(function (r) {
      var okSearch = !q || r.book.toLowerCase().indexOf(q) !== -1 ||
        r.reviewer.toLowerCase().indexOf(q) !== -1 ||
        r.content.toLowerCase().indexOf(q) !== -1;
      var okStatus = ui.filter === 'all' ||
        (ui.filter === 'replied' ? hasReply(r) : !hasReply(r));
      return okSearch && okStatus;
    });
  }

  /* ---------- rendering ---------- */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function statusChip(r) {
    var span = el('span', hasReply(r)
      ? 'text-[12px] font-semibold text-[#0F7B4F]'
      : 'text-[12px] font-semibold text-muted',
      hasReply(r) ? 'Sudah Dibalas' : 'Belum Dibalas');
    return span;
  }

  function buildCard(r) {
    var article = el('article', 'rounded-2xl border border-border bg-white p-5');
    article.setAttribute('data-review-id', String(r.id));
    article.setAttribute('data-status', hasReply(r) ? 'replied' : 'unreplied');

    /* book identity */
    var head = el('div', 'flex items-start gap-3');
    var cover = el('img', 'h-14 w-10 shrink-0 rounded border border-border object-cover');
    cover.src = r.cover;
    cover.alt = 'Sampul ' + r.book;
    var bookBox = el('div', 'min-w-0 flex-1');
    bookBox.appendChild(el('p', 'line-clamp-2 text-[15px] font-semibold leading-snug text-ink', r.book));
    bookBox.appendChild(el('p', 'mt-0.5 text-[12.5px] text-muted', r.bookAuthor));
    head.appendChild(cover);
    head.appendChild(bookBox);
    article.appendChild(head);

    /* reviewer + status */
    var body = el('div', 'mt-4 border-t border-divider pt-4');
    var meta = el('div', 'flex flex-wrap items-start justify-between gap-2');
    var metaLeft = el('div', 'min-w-0');
    metaLeft.appendChild(el('p', 'text-[13.5px] font-semibold text-ink', r.reviewer));
    metaLeft.appendChild(el('p', 'mt-0.5 text-[12px] text-muted', r.date));
    meta.appendChild(metaLeft);
    meta.appendChild(statusChip(r));
    body.appendChild(meta);

    var text = el('p', 'review-text mt-3 text-[14px] leading-relaxed text-ink', r.content);
    body.appendChild(text);

    /* reply block */
    if (hasReply(r)) {
      var replyBox = el('div', 'mt-4 rounded-xl border border-border bg-neutral/60 p-3.5');
      replyBox.appendChild(el('p', 'text-[11px] font-bold uppercase tracking-[0.08em] text-muted', 'Balasan Penerbit'));
      replyBox.appendChild(el('p', 'mt-0.5 text-[12px] text-muted', r.reply.date));
      replyBox.appendChild(el('p', 'review-text mt-2 text-[13.5px] leading-relaxed text-ink', r.reply.content));
      body.appendChild(replyBox);
    }

    /* actions */
    var actions = el('div', 'mt-3 flex items-center justify-end gap-2');
    if (!hasReply(r)) {
      var replyBtn = el('button', 'focus-ring inline-flex h-9 items-center rounded-xl border border-border px-3.5 text-[13px] font-semibold text-ink transition-colors hover:bg-neutral', 'Balas Ulasan');
      replyBtn.type = 'button';
      replyBtn.setAttribute('data-reply', String(r.id));
      actions.appendChild(replyBtn);
    }
    if (actions.childElementCount) body.appendChild(actions);

    /* inline editor */
    var editor = el('div', 'mt-4 hidden rounded-xl border border-border p-3.5');
    editor.setAttribute('data-editor', String(r.id));
    editor.appendChild(el('p', 'text-[13px] font-semibold text-ink', 'Balasan Penerbit'));
    var ta = el('textarea', 'mt-2 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[13.5px] leading-relaxed text-ink outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/15');
    ta.rows = 3;
    ta.placeholder = 'Tulis tanggapan kepada pembaca...';
    ta.setAttribute('data-textarea', String(r.id));
    ta.setAttribute('aria-label', 'Balasan untuk ulasan ' + r.book);
    editor.appendChild(ta);
    var err = el('p', 'mt-1 hidden text-[12px] text-[#B42318]', 'Balasan tidak boleh kosong.');
    err.setAttribute('data-error', String(r.id));
    editor.appendChild(err);
    var editActions = el('div', 'mt-3 flex items-center justify-end gap-2');
    var cancel = el('button', 'focus-ring inline-flex h-9 items-center rounded-xl border border-border px-3.5 text-[13px] font-semibold text-ink hover:bg-neutral', 'Batal');
    cancel.type = 'button';
    cancel.setAttribute('data-cancel', String(r.id));
    var send = el('button', 'focus-ring inline-flex h-9 items-center rounded-xl bg-primary px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60', 'Kirim Balasan');
    send.type = 'button';
    send.setAttribute('data-send', String(r.id));
    editActions.appendChild(cancel);
    editActions.appendChild(send);
    editor.appendChild(editActions);
    body.appendChild(editor);

    article.appendChild(body);
    return article;
  }

  function render() {
    var list = visibleReviews();
    var container = $('review-list');
    container.innerHTML = '';

    list.forEach(function (r) { container.appendChild(buildCard(r)); });

    var datasetEmpty = reviews.length === 0;
    $('state-empty').classList.toggle('hidden', !datasetEmpty);
    $('state-noresults').classList.toggle('hidden', !(!datasetEmpty && list.length === 0));
    $('btn-clear-search').classList.toggle('hidden', !ui.query);
    $('btn-clear-search').classList.toggle('grid', !!ui.query);

    paintSummary();

    /* restore open editor / pending state after re-render */
    if (editorOpenFor) {
      var ed = container.querySelector('[data-editor="' + editorOpenFor + '"]');
      if (ed) {
        ed.classList.remove('hidden');
        var ta = ed.querySelector('[data-textarea]');
        if (ta) {
          ta.value = draftReply[editorOpenFor] || '';
          if (ui.demo === 'C') ed.querySelector('[data-error]').classList.remove('hidden');
          if (sendingFor === editorOpenFor) {
            var sendBtn = ed.querySelector('[data-send]');
            sendBtn.disabled = true;
            sendBtn.textContent = 'Mengirim...';
          }
        }
      }
    }
    syncDemoMenu();
  }

  /* ---------- interactions ---------- */
  document.addEventListener('click', function (e) {
    var reply = e.target.closest('[data-reply]');
    if (reply) {
      var id = Number(reply.getAttribute('data-reply'));
      editorOpenFor = (editorOpenFor === id) ? null : id;
      lastTrigger = reply;
      if (!editorOpenFor) draftReply = {};
      render();
      var ta = document.querySelector('[data-textarea="' + id + '"]');
      if (ta && editorOpenFor) ta.focus();
      return;
    }

    var cancel = e.target.closest('[data-cancel]');
    if (cancel) {
      var cid = Number(cancel.getAttribute('data-cancel'));
      editorOpenFor = null;
      delete draftReply[cid];
      render();
      var trigger = document.querySelector('[data-reply="' + cid + '"]');
      if (trigger) trigger.focus();
      return;
    }

    var send = e.target.closest('[data-send]');
    if (send) { submitReply(Number(send.getAttribute('data-send'))); return; }

    if (!e.target.closest('#demo-menu') && !e.target.closest('#demo-toggle')) closeDemo();
  });

  document.addEventListener('input', function (e) {
    var ta = e.target.closest('[data-textarea]');
    if (!ta) return;
    var id = Number(ta.getAttribute('data-textarea'));
    draftReply[id] = ta.value;
    var err = document.querySelector('[data-error="' + id + '"]');
    if (err && ta.value.trim()) err.classList.add('hidden');
  });

  function submitReply(id) {
    if (sendingFor !== null) return;
    var review = reviews.filter(function (r) { return r.id === id; })[0];
    if (!review) return;

    var ta = document.querySelector('[data-textarea="' + id + '"]');
    var value = ta ? ta.value.trim() : '';
    var err = document.querySelector('[data-error="' + id + '"]');

    if (!value) {
      if (err) { err.classList.remove('hidden'); err.textContent = 'Balasan tidak boleh kosong.'; }
      if (ta) ta.focus();
      return;
    }
    if (err) err.classList.add('hidden');

    sendingFor = id;
    editorOpenFor = id;
    var myRequest = ++requestId;
    render();

    window.setTimeout(function () {
      if (myRequest !== requestId) return;   /* demo state changed meanwhile */
      sendingFor = null;

      var target = reviews.filter(function (r) { return r.id === id; })[0];
      if (target) {
        target.reply = { content: value, date: '16 November 2026' };
      }
      delete draftReply[id];
      editorOpenFor = null;
      render();
      showToast('Balasan tersimpan dalam simulasi prototype ini.');
    }, 700);
  }

  $('btn-clear-search').addEventListener('click', function () {
    ui.query = '';
    $('review-search').value = '';
    render();
  });
  $('review-search').addEventListener('input', function (e) {
    ui.query = e.target.value;
    render();
  });
  document.querySelectorAll('.filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      ui.filter = btn.getAttribute('data-filter');
      render();
    });
  });
  $('btn-reset-filter').addEventListener('click', function () {
    ui.query = '';
    ui.filter = 'all';
    $('review-search').value = '';
    ui.demo = 'A';
    render();
  });

  /* ---------- demo states A–G ---------- */
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
    requestId++;              /* invalidate any in-flight submission */
    sendingFor = null;
    editorOpenFor = null;
    draftReply = {};
    ui.filter = 'all';
    ui.query = '';
    $('review-search').value = '';
    note('');
    $('toast').classList.add('hidden');
    reviews = BASE_REVIEWS.map(function (r) { return Object.assign({}, r); });

    if (s === 'B') {
      editorOpenFor = 1;
    } else if (s === 'C') {
      editorOpenFor = 1;
    } else if (s === 'D') {
      editorOpenFor = 1;
      draftReply[1] = 'Terima kasih atas masukannya, glosarium akan kami tambahkan.';
      sendingFor = 1;
    } else if (s === 'E') {
      reviews[0].reply = { content: 'Terima kasih atas masukannya, glosarium akan kami tambahkan pada pembaruan berikutnya.', date: '16 November 2026' };
      showToast('Balasan tersimpan dalam simulasi prototype ini.');
    } else if (s === 'F') {
      reviews = [];
    } else if (s === 'G') {
      ui.query = 'Babad Tanah Siluman';
      $('review-search').value = ui.query;
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
    if (editorOpenFor) {
      var id = editorOpenFor;
      editorOpenFor = null;
      delete draftReply[id];
      render();
      return;
    }
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

  /* ---------- init (State A always) ---------- */
  render();
})();
