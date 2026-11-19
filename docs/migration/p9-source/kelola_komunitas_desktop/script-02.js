(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  var COMMUNITY_KEY = 'ikapi_communities_demo';
  var TOPIC_KEY = 'ikapi_community_topics_demo';

  /* Default directory data, mirrored from the public community page. */
  var DEFAULTS = [
    {
      id: 'community-filologi', name: 'Komunitas Filologi Pasundan', focus: 'filologi',
      focusLabel: 'Filologi & Aksara Kuno', location: 'Bandung, Jawa Barat',
      shortDesc: 'Komunitas yang mempelajari dan melestarikan naskah serta aksara Sunda kuno.',
      fullDesc: 'Komunitas Filologi Pasundan berakar dari lingkaran pegiat manuskrip, peneliti sastra daerah, dan generasi muda yang berikhtiar menyelamatkan lembaran naskah lontar dan daluwang di Jawa Barat agar dapat dipelajari secara luas.',
      photo: '../../assets/events/event-community.jpg',
      photoAlt: 'Foto ilustrasi kegiatan membaca dan menelaah naskah bersama',
      status: 'active'
    },
    {
      id: 'community-klub-buku', name: 'Klub Buku Priangan (KBP)', focus: 'fiksi',
      focusLabel: 'Klub Baca Fiksi', location: 'Bandung & Cimahi, Jawa Barat',
      shortDesc: 'Komunitas pembaca yang membahas novel dan karya sastra.',
      fullDesc: 'Klub Buku Priangan adalah lingkar pembaca independen yang rutin mengadakan pertemuan diskusi karya sastra fiksi, bedah buku kurasi IKAPI, dan ruang bertukar bacaan di berbagai ruang publik terbuka.',
      photo: '../../assets/events/event-children-story.jpg',
      photoAlt: 'Foto ilustrasi diskusi buku bersama sekelompok pembaca',
      status: 'active'
    },
    {
      id: 'community-sejarah', name: 'Masyarakat Sejarah & Budaya Sunda', focus: 'sejarah',
      focusLabel: 'Sejarah Priangan', location: 'Sumedang & Garut, Jawa Barat',
      shortDesc: 'Komunitas yang mempelajari sejarah dan kebudayaan Sunda melalui diskusi serta kegiatan literasi.',
      fullDesc: 'Masyarakat Sejarah & Budaya Sunda mengkaji babad, sejarah geomorfologi Priangan, dan buku-buku kearifan lokal bersama para peneliti, pengarang daerah, serta pendidik dari berbagai institusi.',
      photo: '../../assets/events/event-book-fair.jpg',
      photoAlt: 'Foto ilustrasi kunjungan pameran buku dan literasi daerah',
      status: 'active'
    }
  ];

  var PHOTOS = [
    { value: '../../assets/events/event-community.jpg', label: 'Kegiatan membaca dan menelaah naskah' },
    { value: '../../assets/events/event-children-story.jpg', label: 'Diskusi buku bersama pembaca' },
    { value: '../../assets/events/event-book-fair.jpg', label: 'Pameran buku dan literasi daerah' },
    { value: '../../assets/events/event-webinar.jpg', label: 'Kegiatan daring literasi' }
  ];

  var FOCUS_LABEL = {
    filologi: 'Filologi & Aksara Kuno',
    fiksi: 'Klub Baca Fiksi',
    sejarah: 'Sejarah Priangan'
  };

  var ui = { query: '', status: 'all', mode: 'view', selectedId: null, lastTrigger: null };

  function readJSON(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch (e) { return fallback; }
  }

  function writeJSON(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }

  function communities() {
    var stored = readJSON(COMMUNITY_KEY, null);
    if (Array.isArray(stored) && stored.length) return stored;
    writeJSON(COMMUNITY_KEY, DEFAULTS);
    return DEFAULTS.slice();
  }

  function saveCommunities(list) { return writeJSON(COMMUNITY_KEY, list); }

  function topicCount(communityId) {
    var topics = readJSON(TOPIC_KEY, []);
    if (!Array.isArray(topics)) return 0;
    return topics.filter(function (t) { return t.communityId === communityId && !t.removed; }).length;
  }

  function statusLabel(status) { return status === 'inactive' ? 'Nonaktif' : 'Aktif'; }

  function note(text) {
    var el = $('page-note');
    el.textContent = text || '';
    el.classList.toggle('hidden', !text);
  }

  function toast(text) {
    $('toast-text').textContent = text;
    $('toast').classList.remove('hidden');
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(function () { $('toast').classList.add('hidden'); }, 2600);
  }

  function filtered() {
    var list = communities();
    if (ui.status !== 'all') list = list.filter(function (c) { return (c.status || 'active') === ui.status; });
    var q = ui.query.trim().toLowerCase();
    if (q) {
      list = list.filter(function (c) {
        return (c.name + ' ' + c.location + ' ' + c.focusLabel).toLowerCase().indexOf(q) !== -1;
      });
    }
    return list.sort(function (a, b) { return a.name.localeCompare(b.name); });
  }

  function render() {
    var tbody = $('community-rows');
    var list = filtered();
    tbody.textContent = '';

    $('table-summary').textContent = list.length + ' komunitas ditampilkan';
    $('state-empty').classList.toggle('hidden', list.length > 0);

    list.forEach(function (c) {
      var tr = document.createElement('tr');
      tr.className = 'border-b border-divider transition-colors hover:bg-soft';

      var nameCell = document.createElement('td');
      nameCell.className = 'px-4 py-3';
      var wrap = document.createElement('div');
      wrap.className = 'flex items-center gap-3';
      var img = document.createElement('img');
      img.src = c.photo;
      img.alt = '';
      img.className = 'h-10 w-14 shrink-0 rounded border border-border object-cover';
      var text = document.createElement('div');
      text.className = 'min-w-0';
      var name = document.createElement('p');
      name.className = 'truncate text-[13.5px] font-semibold text-ink';
      name.textContent = c.name;
      var sub = document.createElement('p');
      sub.className = 'num mt-0.5 text-[11.5px] text-muted';
      sub.textContent = c.id;
      text.appendChild(name);
      text.appendChild(sub);
      wrap.appendChild(img);
      wrap.appendChild(text);
      nameCell.appendChild(wrap);

      var focusCell = document.createElement('td');
      focusCell.className = 'px-4 py-3 text-[13px] text-ink';
      focusCell.textContent = c.focusLabel;

      var locationCell = document.createElement('td');
      locationCell.className = 'px-4 py-3 text-[13px] text-muted';
      locationCell.textContent = c.location;

      var statusCell = document.createElement('td');
      statusCell.className = 'px-4 py-3';
      var status = document.createElement('span');
      status.className = (c.status || 'active') === 'inactive'
        ? 'text-[12px] font-semibold text-[#B42318]'
        : 'text-[12px] font-semibold text-[#0F7B4F]';
      status.textContent = statusLabel(c.status);
      statusCell.appendChild(status);

      var actionCell = document.createElement('td');
      actionCell.className = 'px-4 py-3 pr-5 text-right';
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'focus-ring inline-flex h-8 items-center rounded-lg border border-border px-3 text-[12.5px] font-semibold text-ink hover:bg-neutral';
      button.textContent = 'Tinjau';
      button.addEventListener('click', function () { openDrawer(c.id, button); });
      actionCell.appendChild(button);

      tr.appendChild(nameCell);
      tr.appendChild(focusCell);
      tr.appendChild(locationCell);
      tr.appendChild(statusCell);
      tr.appendChild(actionCell);
      tbody.appendChild(tr);
    });
  }

  /* ---------- drawer ---------- */
  function openDrawer(id, trigger) {
    var list = communities();
    var record = id ? list.filter(function (c) { return c.id === id; })[0] : null;
    if (!record) return;

    ui.selectedId = record.id;
    ui.lastTrigger = trigger || null;
    ui.mode = 'view';

    $('drawer-title').textContent = 'Detail Komunitas';
    $('drawer-id').textContent = record.id;
    $('view-photo').src = record.photo;
    $('view-photo').alt = record.photoAlt || '';
    $('view-name').textContent = record.name;
    $('view-focus').textContent = record.focusLabel;
    $('view-location').textContent = record.location;
    $('view-status').textContent = statusLabel(record.status);
    $('view-topics').textContent = topicCount(record.id);
    $('view-short').textContent = record.shortDesc;
    $('view-full').textContent = record.fullDesc || 'Belum ada deskripsi lengkap.';

    var toggle = $('btn-toggle-status');
    toggle.textContent = (record.status || 'active') === 'active' ? 'Nonaktifkan' : 'Aktifkan';

    paintMode();
    openDrawerPanel();
  }

  function openDrawerPanel() {
    $('community-drawer').classList.add('is-open');
    $('community-drawer').setAttribute('aria-hidden', 'false');
    $('drawer-scrim').classList.remove('hidden');
    $('drawer-close').focus();
  }

  function closeDrawer() {
    var drawer = $('community-drawer');
    if (!drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    $('drawer-scrim').classList.add('hidden');
    if (ui.lastTrigger) ui.lastTrigger.focus();
  }

  function paintMode() {
    var view = ui.mode === 'view';
    $('drawer-view').classList.toggle('hidden', !view);
    $('drawer-form').classList.toggle('hidden', view);
    $('btn-edit').classList.toggle('hidden', !view || ui.mode === 'create');
    $('btn-edit').classList.toggle('items-center', !view);
    $('btn-edit').classList.toggle('inline-flex', !view);
    $('btn-toggle-status').classList.toggle('hidden', !view);
    $('btn-toggle-status').classList.toggle('items-center', !view);
    $('btn-toggle-status').classList.toggle('inline-flex', !view);
    $('btn-cancel-form').classList.toggle('hidden', view);
    $('btn-cancel-form').classList.toggle('items-center', !view);
    $('btn-cancel-form').classList.toggle('inline-flex', !view);
    $('btn-save').classList.toggle('hidden', view);
    $('btn-save').classList.toggle('items-center', !view);
    $('btn-save').classList.toggle('inline-flex', !view);
  }

  function fillForm(record) {
    $('form-name').value = record ? record.name : '';
    $('form-focus').value = record ? record.focus : 'filologi';
    $('form-location').value = record ? record.location : '';
    $('form-short').value = record ? record.shortDesc : '';
    $('form-full').value = record ? (record.fullDesc || '') : '';
    $('form-status').value = record ? (record.status || 'active') : 'active';

    var select = $('form-photo');
    select.textContent = '';
    PHOTOS.forEach(function (photo) {
      var option = document.createElement('option');
      option.value = photo.value;
      option.textContent = photo.label;
      select.appendChild(option);
    });
    select.value = record && record.photo ? record.photo : PHOTOS[0].value;
    $('form-photo-preview').src = select.value;

    ['err-name', 'err-location', 'err-short'].forEach(function (id) { $(id).classList.add('hidden'); });
    $('form-error').classList.add('hidden');
  }

  function startCreate() {
    ui.mode = 'create';
    ui.selectedId = null;
    ui.lastTrigger = document.activeElement;
    $('drawer-title').textContent = 'Tambah Komunitas';
    $('drawer-id').textContent = 'Komunitas baru';
    fillForm(null);
    paintMode();
    openDrawerPanel();
    $('form-name').focus();
  }

  function startEdit() {
    var record = communities().filter(function (c) { return c.id === ui.selectedId; })[0];
    if (!record) return;
    ui.mode = 'edit';
    $('drawer-title').textContent = 'Edit Komunitas';
    fillForm(record);
    paintMode();
    $('form-name').focus();
  }

  function saveForm() {
    var name = $('form-name').value.trim();
    var location = $('form-location').value.trim();
    var shortDesc = $('form-short').value.trim();
    var focus = $('form-focus').value;
    var status = $('form-status').value;
    var photo = $('form-photo').value;

    var invalid = false;
    $('err-name').classList.toggle('hidden', !!name);
    $('err-location').classList.toggle('hidden', !!location);
    $('err-short').classList.toggle('hidden', !!shortDesc);
    if (!name || !location || !shortDesc) invalid = true;
    if (invalid) {
      $('form-error').textContent = 'Lengkapi nama, wilayah, dan deskripsi singkat.';
      $('form-error').classList.remove('hidden');
      return;
    }

    var list = communities();
    var photoMeta = PHOTOS.filter(function (p) { return p.value === photo; })[0];

    if (ui.mode === 'create') {
      var newRecord = {
        id: 'community-' + Date.now().toString(36),
        name: name,
        focus: focus,
        focusLabel: FOCUS_LABEL[focus],
        location: location,
        shortDesc: shortDesc,
        fullDesc: $('form-full').value.trim(),
        photo: photo,
        photoAlt: 'Foto ilustrasi ' + (photoMeta ? photoMeta.label.toLowerCase() : 'kegiatan komunitas'),
        status: status
      };
      list.push(newRecord);

      if (!saveCommunities(list)) {
        $('form-error').textContent = 'Komunitas belum tersimpan. Coba lagi.';
        $('form-error').classList.remove('hidden');
        return;
      }

      ui.selectedId = newRecord.id;
      toast('Komunitas ditambahkan.');
    } else {
      var target = list.filter(function (c) { return c.id === ui.selectedId; })[0];
      if (!target) return;
      target.name = name;
      target.focus = focus;
      target.focusLabel = FOCUS_LABEL[focus];
      target.location = location;
      target.shortDesc = shortDesc;
      target.fullDesc = $('form-full').value.trim();
      target.photo = photo;
      target.photoAlt = 'Foto ilustrasi ' + (photoMeta ? photoMeta.label.toLowerCase() : 'kegiatan komunitas');
      target.status = status;

      if (!saveCommunities(list)) {
        $('form-error').textContent = 'Perubahan belum tersimpan. Coba lagi.';
        $('form-error').classList.remove('hidden');
        return;
      }

      toast('Perubahan komunitas disimpan.');
    }

    ui.mode = 'view';
    render();
    openDrawer(ui.selectedId, ui.lastTrigger);
  }

  function toggleStatus() {
    var list = communities();
    var record = list.filter(function (c) { return c.id === ui.selectedId; })[0];
    if (!record) return;

    var next = (record.status || 'active') === 'active' ? 'inactive' : 'active';
    record.status = next;

    if (!saveCommunities(list)) {
      toast('Status belum tersimpan. Coba lagi.');
      return;
    }

    note(next === 'inactive'
      ? 'Komunitas dinonaktifkan. Profil dan diskusinya tidak lagi tampil di direktori publik.'
      : 'Komunitas diaktifkan kembali.');
    toast(next === 'inactive' ? 'Komunitas dinonaktifkan.' : 'Komunitas diaktifkan.');
    render();
    openDrawer(record.id, ui.lastTrigger);
  }

  /* ---------- demo menu ---------- */
  var demoToggle = $('demo-toggle'), demoMenu = $('demo-menu');
  function closeDemo() {
    demoMenu.classList.add('hidden');
    demoToggle.setAttribute('aria-expanded', 'false');
  }
  demoToggle.addEventListener('click', function () {
    var open = demoMenu.classList.contains('hidden');
    demoMenu.classList.toggle('hidden', !open);
    demoToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  demoMenu.addEventListener('click', function (e) {
    var item = e.target.closest('[data-demo]');
    if (!item) return;
    closeDemo();
    if (!saveCommunities(DEFAULTS.slice())) { toast('Data demo tidak dapat dipulihkan.'); return; }
    note('Data komunitas dikembalikan ke kondisi awal.');
    toast('Data komunitas dipulihkan.');
    render();
  });

  $('community-search').addEventListener('input', function (e) { ui.query = e.target.value; render(); });
  $('status-filter').addEventListener('change', function (e) { ui.status = e.target.value; render(); });
  $('btn-add').addEventListener('click', startCreate);
  $('btn-edit').addEventListener('click', startEdit);
  $('btn-toggle-status').addEventListener('click', toggleStatus);
  $('btn-save').addEventListener('click', saveForm);
  $('btn-cancel-form').addEventListener('click', function () {
    if (ui.mode === 'create') { closeDrawer(); render(); return; }
    ui.mode = 'view';
    paintMode();
  });
  $('drawer-close').addEventListener('click', closeDrawer);
  $('drawer-scrim').addEventListener('click', closeDrawer);
  $('form-photo').addEventListener('change', function (e) { $('form-photo-preview').src = e.target.value; });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!$('demo-menu').classList.contains('hidden')) { closeDemo(); return; }
    closeDrawer();
  });
  document.addEventListener('click', function (e) {
    if (!demoMenu.contains(e.target) && !demoToggle.contains(e.target)) closeDemo();
  });

  render();
})();
