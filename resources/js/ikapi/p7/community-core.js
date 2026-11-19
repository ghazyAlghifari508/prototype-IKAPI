// Community core: ONE port of the prototype's two community <script> blocks (discovery/membership and
// discussion). The source is a single-page app that switches views in place; here each view is its own Blade page,
// so the only behavioural changes are (a) `showView` navigates for cross-page views and (b) the two boot handlers
// run once with a tolerant `getElementById`, because no page contains every control the SPA had.
//
// Ported from docs/design/prototype-copy/user/komunitas_literasi_desktop.html lines 1-3084. Nothing is retyped:
// the data layer (localStorage keys), the reply graph normaliser, the renderers and the permission paint are the
// prototype's own code, wrapped here.
import { onReady } from '../shared.js';

export function initCommunity(cfg) {
  // Boot once per page. The bundle carries one thin boot per community screen; a duplicated boot would
  // bind the reply/comment handlers twice (measured: five listeners on #reply-view-form -> five replies).
  if (window.__ikapiCommunityBooted) return;
  window.__ikapiCommunityBooted = true;

  var CORE = { page: cfg.page, booting: true, directoryUrl: cfg.directoryUrl };

  /* ---------- source: discovery + membership ---------- */

    /* Community discovery + membership (prototype).
       Boundary: the buyer session and the memberships live in localStorage for this
       browser only. Nothing is posted to a server, so a reviewer sees demo state, not
       a real account. Discussion publishing belongs to the next stage. */
    var SESSION_KEY = 'ikapi_buyer_session_demo';
    var MEMBERSHIP_KEY = 'ikapi_community_memberships_demo';
    var DEMO_BUYER = { id: 'USR-PMB-0042', email: 'pembeli@demo.ikapi.id', name: 'Pembeli Demo', role: 'buyer' };

    var communitiesData = [
      {
        id: 'community-filologi',
        name: 'Komunitas Filologi Pasundan',
        focus: 'filologi',
        focusLabel: 'Filologi & Aksara Kuno',
        location: 'Bandung, Jawa Barat',
        shortDesc: 'Komunitas yang mempelajari dan melestarikan naskah serta aksara Sunda kuno.',
        fullDesc: 'Komunitas Filologi Pasundan berakar dari lingkaran pegiat manuskrip, peneliti sastra daerah, dan generasi muda yang berikhtiar menyelamatkan lembaran naskah lontar dan daluwang di Jawa Barat agar dapat dipelajari secara luas.',
        photo: '/assets/ikapi/events/event-community.jpg',
        photoAlt: 'Foto kegiatan komunitas',
        focusPoints: [
          'Transliterasi naskah lontar dan aksara Sunda kuno',
          'Kajian filologi dan penelusuran sejarah manuskrip Pasundan',
          'Pelatihan pembacaan aksara kuno bagi pegiat literasi muda'
        ]
      },
      {
        id: 'community-klub-buku',
        name: 'Klub Buku Priangan (KBP)',
        focus: 'fiksi',
        focusLabel: 'Klub Baca Fiksi',
        location: 'Bandung & Cimahi, Jawa Barat',
        shortDesc: 'Komunitas pembaca yang membahas novel dan karya sastra.',
        fullDesc: 'Klub Buku Priangan adalah lingkar pembaca independen yang rutin mengadakan pertemuan diskusi karya sastra fiksi, bedah buku kurasi IKAPI, dan ruang bertukar bacaan di berbagai ruang publik terbuka.',
        photo: '/assets/ikapi/events/event-children-story.jpg',
        photoAlt: 'Foto kegiatan komunitas',
        focusPoints: [
          'Diskusi berkala novel dan antologi sastra Nusantara',
          'Kegiatan bertukar buku dan apresiasi karya penulis lokal',
          'Klub baca akhir pekan di taman literasi dan kedai buku'
        ]
      },
      {
        id: 'community-sejarah',
        name: 'Masyarakat Sejarah & Budaya Sunda',
        focus: 'sejarah',
        focusLabel: 'Sejarah Priangan',
        location: 'Sumedang & Garut, Jawa Barat',
        shortDesc: 'Komunitas yang mempelajari sejarah dan kebudayaan Sunda melalui diskusi serta kegiatan literasi.',
        fullDesc: 'Masyarakat Sejarah & Budaya Sunda mengkaji babad, sejarah geomorfologi Priangan, dan buku-buku kearifan lokal bersama para peneliti, pengarang daerah, serta pendidik dari berbagai institusi.',
        photo: '/assets/ikapi/events/event-book-fair.jpg',
        photoAlt: 'Foto kegiatan komunitas',
        focusPoints: [
          'Kajian sejarah lokal dan dokumentasi cerita rakyat',
          'Diskusi buku geomorfologi dan bentang alam Bandung Purba',
          'Penyelenggaraan ekspedisi literasi situs sejarah Pasundan'
        ]
      }
    ];

    /* Community records are shared with the administrator pages through
       localStorage. When nothing is stored yet, the built-in list below seeds it. */
    var COMMUNITY_KEY = 'ikapi_communities_demo';
  var SEED_VERSION_KEY = 'ikapi_community_seed_version';
  var SEED_VERSION = '3';

    var COMMUNITY_SEED = communitiesData.map(function (comm) {
      var copy = {};
      Object.keys(comm).forEach(function (key) { copy[key] = comm[key]; });
      copy.status = 'active';
      return copy;
    });

    function loadCommunityStore() {
      var stored = readJSON(COMMUNITY_KEY, null);
      if (Array.isArray(stored) && stored.length) return stored;
      writeJSON(COMMUNITY_KEY, COMMUNITY_SEED);
      return COMMUNITY_SEED.slice();
    }

    communitiesData = loadCommunityStore();

    function activeCommunities() {
      return communitiesData.filter(function (comm) { return (comm.status || 'active') === 'active'; });
    }

    var currentFilter = 'all';
    var searchQuery = '';
    var currentView = 'explore';   // 'explore' | 'mine' | 'profile'
    var currentMode = 'normal';    // 'normal' | 'detail' | 'noresults' | 'empty'
    var profileId = null;
    var pendingLeaveId = null;
    var lastFocusedBeforeModal = null;

    /* ---------------- storage ---------------- */

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

    function getSession() {
      var session = readJSON(SESSION_KEY, null);
      return session && session.role === 'buyer' && session.id ? session : null;
    }

    /* The prototype signs in a demo buyer automatically so every screen and action
       can be reviewed without a login detour. The demo toggle can still sign out. */
    function ensureDemoSession() {
      if (getSession()) return;
      writeJSON(SESSION_KEY, DEMO_BUYER);
    }

    function getMemberships() {
      var all = readJSON(MEMBERSHIP_KEY, {});
      return all && typeof all === 'object' ? all : {};
    }

    function myMemberships() {
      var session = getSession();
      if (!session) return [];
      var all = getMemberships();
      var mine = all[session.id];
      return Array.isArray(mine) ? mine.slice() : [];
    }

    function isMember(communityId) {
      return myMemberships().indexOf(communityId) !== -1;
    }

    function persistMembership(nextList) {
      var session = getSession();
      if (!session) return false;
      var all = getMemberships();
      all[session.id] = nextList;
      return writeJSON(MEMBERSHIP_KEY, all);
    }

    function announce(message) {
      var el = document.getElementById('sr-announcer');
      if (el) el.textContent = message;
    }

    function showNotice(text) {
      var notice = document.getElementById('directory-notice');
      if (!notice) return;
      notice.textContent = text || '';
      notice.classList.toggle('hidden', !text);
    }

    function communityById(id) {
      return communitiesData.find(function (item) { return item.id === id; }) || null;
    }

    /* ---------------- cards ---------------- */

    function buildCard(comm) {
      var article = document.createElement('article');
      article.className = 'community-card flex flex-col gap-4 rounded-2xl border border-border-subtle bg-white p-4 transition-colors hover:border-primary/40 sm:flex-row';
      article.setAttribute('data-id', comm.id);

      var media = document.createElement('div');
      media.className = 'aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl border border-border-subtle bg-surface-neutral sm:aspect-auto sm:h-[150px] sm:w-[190px]';
      var img = document.createElement('img');
      img.src = comm.photo;
      img.alt = comm.photoAlt;
      img.loading = 'lazy';
      img.className = 'h-full w-full object-cover';
      media.appendChild(img);

      var body = document.createElement('div');
      body.className = 'flex min-w-0 flex-1 flex-col';

      var head = document.createElement('div');
      head.className = 'flex items-start justify-between gap-3';
      var name = document.createElement('h3');
      name.className = 'text-[16px] font-bold leading-snug text-ink-body';
      name.textContent = comm.name;
      head.appendChild(name);

      if (isMember(comm.id)) {
        var joined = document.createElement('span');
        joined.className = 'shrink-0 text-[11px] font-bold uppercase tracking-wider text-primary';
        joined.textContent = 'Anggota';
        head.appendChild(joined);
      }

      var place = document.createElement('p');
      place.className = 'mt-1 flex items-center gap-1.5 text-[12.5px] text-ink-muted';
      var pin = document.createElement('span');
      pin.className = 'material-symbols-outlined text-[15px] text-primary';
      pin.setAttribute('aria-hidden', 'true');
      pin.textContent = 'location_on';
      var placeText = document.createElement('span');
      placeText.textContent = comm.location;
      place.appendChild(pin);
      place.appendChild(placeText);

      var focus = document.createElement('span');
      focus.className = 'mt-2 text-[11px] font-bold uppercase tracking-wider text-primary';
      focus.textContent = comm.focusLabel;

      var desc = document.createElement('p');
      desc.className = 'mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-muted';
      desc.textContent = comm.shortDesc;

      var actionWrap = document.createElement('div');
      actionWrap.className = 'mt-3 sm:mt-auto sm:pt-3';
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-bold text-primary transition-colors hover:text-primary-hover';
      button.textContent = 'Lihat Komunitas';
      var arrow = document.createElement('span');
      arrow.className = 'material-symbols-outlined text-[16px]';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = 'arrow_forward';
      button.appendChild(arrow);
      button.addEventListener('click', function () { openProfile(comm.id, button); });
      actionWrap.appendChild(button);

      body.appendChild(head);
      body.appendChild(place);
      body.appendChild(focus);
      body.appendChild(desc);
      body.appendChild(actionWrap);

      article.appendChild(media);
      article.appendChild(body);
      return article;
    }

    function emptyCard(container) {
      container.textContent = '';
      container.classList.add('hidden');
    }

    /* ---------------- directory ---------------- */

    function filteredCommunities(list) {
      var result = list.slice();
      if (currentFilter !== 'all') {
        result = result.filter(function (comm) { return comm.focus === currentFilter; });
      }
      if (searchQuery) {
        var q = searchQuery.toLowerCase();
        result = result.filter(function (comm) {
          return comm.name.toLowerCase().indexOf(q) !== -1 ||
            comm.shortDesc.toLowerCase().indexOf(q) !== -1 ||
            comm.focusLabel.toLowerCase().indexOf(q) !== -1 ||
            comm.location.toLowerCase().indexOf(q) !== -1;
        });
      }
      return result;
    }

    function renderDirectory() {
      var grid = document.getElementById('directory-grid');
      var countEl = document.getElementById('directory-count');
      var noResults = document.getElementById('view-noresults');
      var empty = document.getElementById('view-empty');
      if (!grid) return;

      if (currentMode === 'empty') {
        emptyCard(grid);
        if (countEl) countEl.textContent = '0 komunitas ditemukan';
        if (noResults) { noResults.classList.add('hidden'); noResults.classList.remove('flex'); }
        if (empty) { empty.classList.remove('hidden'); empty.classList.add('flex'); }
        return;
      }

      var list = filteredCommunities(activeCommunities());

      if (countEl) countEl.textContent = list.length + ' komunitas ditemukan';
      grid.textContent = '';

      if (!list.length) {
        grid.classList.add('hidden');
        if (empty) { empty.classList.add('hidden'); empty.classList.remove('flex'); }
        if (noResults) { noResults.classList.remove('hidden'); noResults.classList.add('flex'); }
        return;
      }

      grid.classList.remove('hidden');
      if (noResults) { noResults.classList.add('hidden'); noResults.classList.remove('flex'); }
      if (empty) { empty.classList.add('hidden'); empty.classList.remove('flex'); }
      list.forEach(function (comm) { grid.appendChild(buildCard(comm)); });
    }

    /* ---------------- profile ---------------- */

    function actionClass(kind) {
      return kind === 'primary'
        ? 'inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 text-[13.5px] font-bold text-white transition-colors hover:bg-primary-hover'
        : 'inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-border-subtle bg-white px-4 text-[13.5px] font-semibold text-ink-body transition-colors hover:bg-surface-neutral';
    }

    function renderProfileActions(comm) {
      var wrap = document.getElementById('profile-actions');
      wrap.textContent = '';

      var session = getSession();
      var member = isMember(comm.id);

      if (!session) {
        ensureDemoSession();
        session = getSession();
      }

      if (!session) {
        var joinGuest = document.createElement('button');
        joinGuest.type = 'button';
        joinGuest.className = actionClass('primary');
        joinGuest.textContent = 'Gabung Komunitas';
        joinGuest.addEventListener('click', requestJoin);
        wrap.appendChild(joinGuest);
        return;
      }

      if (!member) {
        var join = document.createElement('button');
        join.type = 'button';
        join.className = actionClass('primary');
        join.textContent = 'Gabung Komunitas';
        join.addEventListener('click', requestJoin);
        wrap.appendChild(join);
        return;
      }

      var open = document.createElement('button');
      open.type = 'button';
      open.className = actionClass('primary');
      open.textContent = 'Buka Ruang Diskusi';
      open.addEventListener('click', function () { openRoom(comm.id); });
      wrap.appendChild(open);

      var leave = document.createElement('button');
      leave.type = 'button';
      leave.className = actionClass('secondary');
      leave.textContent = 'Keluar Komunitas';
      leave.addEventListener('click', function () { openLeaveModal(comm.id, leave); });
      wrap.appendChild(leave);

    }

    function renderProfile(comm) {
      document.getElementById('profile-photo').src = comm.photo;
      document.getElementById('profile-photo').alt = comm.photoAlt;
      document.getElementById('profile-focus').textContent = comm.focusLabel;
      document.getElementById('profile-name').textContent = comm.name;
      document.getElementById('profile-location').textContent = comm.location;
      document.getElementById('profile-short').textContent = comm.shortDesc;
      document.getElementById('profile-about').textContent = comm.fullDesc;
      document.getElementById('profile-info-location').textContent = comm.location;
      document.getElementById('profile-info-focus').textContent = comm.focusLabel;
      document.getElementById('profile-info-status').textContent = isMember(comm.id) ? 'Anggota' : 'Belum bergabung';

      var list = document.getElementById('profile-focus-list');
      list.textContent = '';
      (comm.focusPoints || []).forEach(function (point) {
        var li = document.createElement('li');
        li.textContent = point;
        list.appendChild(li);
      });

      renderProfileActions(comm);
      renderProfilePreview(comm.id);
    }

    function showView(view) {
      currentView = view;

      var sections = { explore: 'view-explore', profile: 'view-profile', room: 'view-room', topic: 'view-topic', reply: 'view-reply' };
      Object.keys(sections).forEach(function (key) {
        var el = document.getElementById(sections[key]);
        if (!el) return;
        var active = key === view;
        el.classList.toggle('hidden', !active);
        el.classList.toggle('flex', active && key !== 'explore');
      });

      if (view === 'explore') renderDirectory();
      paintTopBack(view);
    }

    /* The navigation back-link lives in the top bar, aligned with the demo filter. */
    function paintTopBack(view) {
      var hero = document.getElementById('hero-section');
      if (hero) hero.classList.toggle('hidden', view !== 'explore');
      var profileBack = document.getElementById('top-back-profile');
      var roomBack = document.getElementById('top-back-room');
      var topicBack = document.getElementById('top-back-topic');
      var replyBack = document.getElementById('top-back-reply');
      if (replyBack) replyBack.classList.toggle('hidden', view !== 'reply');
      if (profileBack) profileBack.classList.toggle('hidden', view !== 'profile');
      if (roomBack) roomBack.classList.toggle('hidden', view !== 'room');
      if (topicBack) topicBack.classList.toggle('hidden', view !== 'topic');
    }

    function openProfile(communityId, trigger) {
      var comm = communityById(communityId);

      if (!comm) {
        showNotice('Komunitas yang kamu buka tidak ditemukan. Pilih komunitas lain dari direktori.');
        showView('explore');
        return;
      }

      if ((comm.status || 'active') !== 'active') {
        profileId = comm.id;
        renderProfileUnavailable(comm);
        showView('profile');
        window.scrollTo({ top: 0, behavior: 'auto' });
        return;
      }

      showNotice('');
      profileId = comm.id;
      resetProfilePanels();
      renderProfile(comm);
      showView('profile');

      var heading = document.getElementById('profile-name');
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'auto' });

      if (trigger) lastFocusedBeforeModal = trigger;
    }

    function closeProfile() {
      var id = profileId;
      showView('explore');

      var target = null;
      if (id) {
        target = document.querySelector('.community-card[data-id="' + id + '"] button');
      }
      if (!target) target = document.getElementById('community-search');
      if (target) target.focus();
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    function focusDiscussions() {
      var slot = document.getElementById('discussions');
      if (!slot) return;
      slot.scrollIntoView({ block: 'center' });
      slot.focus({ preventScroll: true });
    }

    /* ---------------- membership ---------------- */

    function loginUrlFor(communityId) {
      var next = 'komunitas_literasi_desktop.html' + (communityId ? '?komunitas=' + encodeURIComponent(communityId) : '');
      return 'masuk_login_desktop.html?role=buyer&next=' + encodeURIComponent(next);
    }

    function requestJoin() {
      var comm = communityById(profileId);
      if (!comm) return;

      var session = getSession();
      if (!session) {
        ensureDemoSession();
        session = getSession();
      }
      if (!session) return;

      if ((comm.status || 'active') !== 'active') {
        announce('Komunitas ini sedang tidak aktif.');
        return;
      }

      if (isMember(comm.id)) {
        announce('Kamu sudah menjadi anggota ' + comm.name + '.');
        return;
      }

      var next = myMemberships();
      if (next.indexOf(comm.id) === -1) next.push(comm.id);

      if (!persistMembership(next)) {
        announce('Keanggotaan belum tersimpan. Coba lagi.');
        return;
      }

      renderProfile(comm);
      announce('Kamu bergabung dengan ' + comm.name + '.');
    }

    function openLeaveModal(communityId, trigger) {
      var modal = document.getElementById('leave-modal');
      if (!modal) return;
      pendingLeaveId = communityId;
      lastFocusedBeforeModal = trigger || null;
      modal.classList.remove('hidden');
      document.getElementById('leave-cancel').focus();
    }

    function closeLeaveModal() {
      var modal = document.getElementById('leave-modal');
      if (!modal || modal.classList.contains('hidden')) return;
      modal.classList.add('hidden');
      pendingLeaveId = null;
      if (lastFocusedBeforeModal) lastFocusedBeforeModal.focus();
    }

    function confirmLeave() {
      var comm = communityById(pendingLeaveId);
      if (!comm) { closeLeaveModal(); return; }

      var next = myMemberships().filter(function (id) { return id !== comm.id; });
      if (!persistMembership(next)) {
        announce('Perubahan keanggotaan belum tersimpan. Coba lagi.');
        closeLeaveModal();
        return;
      }

      closeLeaveModal();
      renderProfile(comm);
      announce('Kamu keluar dari ' + comm.name + '.');
    }

    function toggleDemoSession() {
      var session = getSession();
      if (session) {
        try { window.localStorage.removeItem(SESSION_KEY); } catch (e) {}
        announce('Sesi pembeli demo dinonaktifkan.');
      } else {
        if (!writeJSON(SESSION_KEY, DEMO_BUYER)) {
          announce('Sesi demo tidak dapat disimpan pada browser ini.');
          return;
        }
        announce('Sesi pembeli demo aktif.');
      }
      paintSessionButton();
      if (currentView === 'profile' && profileId) renderProfile(communityById(profileId));
      if (currentView === 'explore') renderDirectory();
    }

    function paintSessionButton() {
      var btn = document.getElementById('demo-session-toggle');
      if (!btn) return;
      btn.textContent = getSession() ? 'Nonaktifkan sesi pembeli demo' : 'Aktifkan sesi pembeli demo';
    }

    /* ---------------- search / filter / simulator ---------------- */

    function handleSearchInput(event) {
      searchQuery = event.target.value.trim();
      currentMode = 'normal';
      showNotice('');
      if (currentView !== 'explore') showView('explore');
      renderDirectory();
    }

    function selectFilter(filterKey) {
      currentFilter = filterKey;
      currentMode = 'normal';
      showNotice('');

      document.querySelectorAll('.filter-chip').forEach(function (chip) {
        var active = chip.getAttribute('data-filter') === filterKey;
        chip.className = active
          ? 'filter-chip px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all bg-primary text-white shadow-xs shrink-0 cursor-pointer'
          : 'filter-chip px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all bg-surface-neutral text-ink-body hover:bg-surface-soft hover:text-primary border border-border-subtle shrink-0 cursor-pointer';
        chip.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      if (currentView !== 'explore') showView('explore');
      renderDirectory();
    }

    function resetSearchState() {
      searchQuery = '';
      currentFilter = 'all';
      currentMode = 'normal';
      var input = document.getElementById('community-search');
      if (input) input.value = '';
      selectFilter('all');
    }

    function setSimState(state, communityId) {
      currentMode = state;

      ['normal', 'detail', 'noresults', 'empty'].forEach(function (name) {
        var btn = document.getElementById('sim-' + name);
        if (!btn) return;
        btn.className = name === state
          ? 'px-3 py-1 rounded-lg bg-primary text-white font-medium transition-all shadow-xs'
          : 'px-3 py-1 rounded-lg bg-surface-neutral text-ink-body hover:bg-surface-soft hover:text-primary font-medium transition-all border border-border-subtle';
      });

      var input = document.getElementById('community-search');
      showNotice('');

      if (state === 'normal') {
        searchQuery = '';
        currentFilter = 'all';
        if (input) input.value = '';
        profileId = null;
        document.querySelectorAll('.filter-chip').forEach(function (chip) {
          var active = chip.getAttribute('data-filter') === 'all';
          chip.className = active
            ? 'filter-chip px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all bg-primary text-white shadow-xs shrink-0 cursor-pointer'
            : 'filter-chip px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all bg-surface-neutral text-ink-body hover:bg-surface-soft hover:text-primary border border-border-subtle shrink-0 cursor-pointer';
          chip.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        showView('explore');
        return;
      }

      if (state === 'detail') {
        openProfile(communityId || communitiesData[0].id);
        return;
      }

      if (state === 'noresults') {
        showView('explore');
        searchQuery = 'Komunitas XYZ Tidak Ada';
        if (input) input.value = searchQuery;
        renderDirectory();
        return;
      }

      if (state === 'empty') {
        showView('explore');
        renderDirectory();
      }
    }

    /* ---------------- wiring ---------------- */

    document.addEventListener('click', function (event) {
      var target = event.target;
      if (!target || !target.closest) return;
      if (target.closest('#leave-cancel') || target.closest('#leave-scrim')) closeLeaveModal();
      else if (target.closest('#leave-confirm')) confirmLeave();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeLeaveModal();
    });

    function bootDiscovery() {
      ensureDemoSession();

      document.getElementById('btn-back-to-directory').addEventListener('click', closeProfile);

      paintSessionButton();

      var params = new URLSearchParams(window.location.search);
      var requested = params.get('komunitas');
      if (requested) {
        openProfile(requested);
      } else {
        showView('explore');
      }
    }
  

  /* ---------- source: discussion (topics, replies, reports) ---------- */

  /* Discussion module: topics, replies, ownership actions, reporting.
     Prototype boundary: topics, replies and reports live in localStorage for this
     browser only. There is no server, so nothing is shared between devices or users
     and no moderator receives these reports yet (admin review is a later stage). */
  var TOPIC_KEY = 'ikapi_community_topics_demo';
  var REPLY_KEY = 'ikapi_community_replies_demo';
  var DISCUSSION_REPORT_KEY = 'ikapi_discussion_reports_demo';
  var TITLE_LIMIT = 120;
  var BODY_LIMIT = 2000;
  var REPLY_LIMIT = 1200;

  var DISCUSSION_REASONS = [
    { id: 'spam', label: 'Spam atau promosi' },
    { id: 'abuse', label: 'Kata kasar atau pelecehan' },
    { id: 'hate', label: 'Ujaran kebencian atau diskriminasi' },
    { id: 'privacy', label: 'Membagikan informasi pribadi' },
    { id: 'other', label: 'Alasan lainnya' }
  ];

  var topicSort = 'newest';
  var activeCommunityId = null;
  var activeTopicId = null;
  var composerMode = 'create';
  var composingTopicId = null;
  var reportTarget = null;
  var deleteTarget = null;
  var menuTarget = null;
  var discussionBusy = false;
  var composerLocked = false;
  var composerReturnFocus = null;

  /* ---------------- storage ---------------- */

  /* Demo seeds are restored whenever the stored list is missing or empty, so the
     directory never looks broken after a storage cleanup. */
  /* Older demo drafts stored in a reviewer's browser are replaced when the seed
     content changes, while topics created by the reviewer are kept. */
  function migrateDemoSeeds() {
    var storedVersion = null;
    try { storedVersion = window.localStorage.getItem(SEED_VERSION_KEY); } catch (e) {}
    if (storedVersion === SEED_VERSION) return;

    var topics = readJSON(TOPIC_KEY, []);
    if (Array.isArray(topics)) {
      writeJSON(TOPIC_KEY, topics.filter(function (topic) {
        return topic && String(topic.authorId || '').indexOf('USR-DEMO-') !== 0;
      }));
    }

    var replies = readJSON(REPLY_KEY, []);
    if (Array.isArray(replies)) {
      writeJSON(REPLY_KEY, replies.filter(function (reply) {
        return reply && String(reply.authorId || '').indexOf('USR-DEMO-') !== 0;
      }));
    }

    writeJSON(SEED_VERSION_KEY, SEED_VERSION);
  }

  function isDemoAuthor(record) {
    return String((record && record.authorId) || '').indexOf('USR-DEMO-') === 0;
  }

  /* Seeds are merged in whenever the store holds no demo topic, so the demo
     discussions always exist while content created by the reviewer is kept. */
  function withSeeds(list, seeds, alwaysMerge) {
    var base = Array.isArray(list) ? list : [];
    var hasDemo = base.some(isDemoAuthor);
    if (!hasDemo || alwaysMerge) {
      var ids = base.map(function (record) { return record.id; });
      seeds.forEach(function (seed) {
        if (ids.indexOf(seed.id) === -1) base.push(seed);
      });
    }
    return base;
  }

  function loadTopics() {
    migrateDemoSeeds();
    var list = withSeeds(readJSON(TOPIC_KEY, null), seedTopics());
    writeJSON(TOPIC_KEY, list);
    return list;
  }

  /* Normalises the reply graph: every reply carries parentReplyId, parents must exist
     in the same topic, and accidental cycles are broken. Idempotent. */
  function normalizeReplyGraph(list) {
    var byId = {};
    list.forEach(function (reply) { byId[reply.id] = reply; });

    var changed = false;

    list.forEach(function (reply) {
      if (reply.parentReplyId === undefined) { reply.parentReplyId = null; changed = true; }
      if (reply.parentReplyId) {
        var parent = byId[reply.parentReplyId];
        if (!parent || parent.topicId !== reply.topicId) { reply.parentReplyId = null; changed = true; }
      }
    });

    list.forEach(function (reply) {
      var seen = {};
      var cursor = reply;
      while (cursor && cursor.parentReplyId) {
        if (seen[cursor.id]) { cursor.parentReplyId = null; changed = true; break; }
        seen[cursor.id] = true;
        cursor = byId[cursor.parentReplyId];
      }
    });

    return changed;
  }

  function loadReplies() {
    var list = withSeeds(readJSON(REPLY_KEY, null), seedReplies(), true);
    normalizeReplyGraph(list);
    writeJSON(REPLY_KEY, list);
    return list;
  }

  function saveTopics(list) { return writeJSON(TOPIC_KEY, list); }
  function saveReplies(list) { return writeJSON(REPLY_KEY, list); }
  function loadReports() { return readJSON(DISCUSSION_REPORT_KEY, []) || []; }
  function saveReports(list) { return writeJSON(DISCUSSION_REPORT_KEY, list); }

  function hoursAgo(hours) {
    return new Date(Date.now() - hours * 3600 * 1000).toISOString();
  }

  /* Sample discussion content for the demo communities (fictional authors). */
  function seedTopics() {
    return [
      {
        id: 'TPC-2026-101', communityId: 'community-klub-buku',
        title: 'Novel apa yang menarik untuk dibahas bersama?',
        body: 'Lagi cari novel dengan karakter dan konflik menarik untuk diskusi klub baca bulan ini. Boleh bagikan satu judul beserta alasan singkatnya.',
        authorId: 'USR-DEMO-NADIA', authorName: 'Nadia', createdAt: hoursAgo(30), updatedAt: null, removed: false
      },
      {
        id: 'TPC-2026-102', communityId: 'community-klub-buku',
        title: 'Bagaimana kalian memilih buku berikutnya?',
        body: 'Penasaran bagaimana anggota klub baca menentukan bacaan untuk diskusi bulanan. Apakah lewat voting, giliran, atau usulan bebas?',
        authorId: 'USR-DEMO-RAKA', authorName: 'Raka', createdAt: hoursAgo(20), updatedAt: null, removed: false
      },
      {
        id: 'TPC-2026-103', communityId: 'community-filologi',
        title: 'E-book naskah kuno: versi digital atau cetak yang lebih nyaman?',
        body: 'Untuk menelaah naskah panjang, saya lebih nyaman membaca e-book karena bisa memperbesar bagian tulisan. Bagaimana pengalaman anggota lain?',
        authorId: 'USR-DEMO-DINA', authorName: 'Dina', createdAt: hoursAgo(70), updatedAt: null, removed: false
      },
      {
        id: 'TPC-2026-104', communityId: 'community-filologi',
        title: 'Rekomendasi buku pengantar filologi untuk pembaca baru',
        body: 'Ada yang punya rekomendasi buku pengantar yang bahasanya ramah untuk pembaca yang baru mulai menekuni naskah lama?',
        authorId: 'USR-DEMO-NADIA', authorName: 'Nadia', createdAt: hoursAgo(48), updatedAt: null, removed: false
      },
      {
        id: 'TPC-2026-105', communityId: 'community-sejarah',
        title: 'Buku sejarah lokal apa yang paling berkesan tahun ini?',
        body: 'Bagikan satu judul buku sejarah Priangan yang menurutmu paling berkesan, sekalian alasan singkatnya.',
        authorId: 'USR-DEMO-RAKA', authorName: 'Raka', createdAt: hoursAgo(26), updatedAt: null, removed: false
      },
      {
        id: 'TPC-2026-106', communityId: 'community-sejarah',
        title: 'Tips mengatur jadwal baca untuk buku yang tebal',
        body: 'Buku sejarah biasanya tebal. Ada tips membagi waktu baca harian supaya tetap selesai tanpa kehilangan alur ceritanya?',
        authorId: 'USR-DEMO-DINA', authorName: 'Dina', createdAt: hoursAgo(12), updatedAt: null, removed: false
      }
    ];
  }

  function seedReplies() {
    return [
      { id: 'RPL-2026-201', topicId: 'TPC-2026-101', communityId: 'community-klub-buku',
        body: 'Menurutku novel dengan banyak sudut pandang akan menarik untuk dibahas bersama, karena tiap pembaca bisa memilih tokoh yang paling meyakinkan.',
        authorId: 'USR-DEMO-DINA', authorName: 'Dina', createdAt: hoursAgo(28), updatedAt: null, removed: false },
      { id: 'RPL-2026-202', topicId: 'TPC-2026-101', communityId: 'community-klub-buku',
        body: 'Usulku novel yang latarnya dekat dengan kehidupan sehari-hari pembaca, supaya diskusinya tidak berhenti di ringkasan cerita.',
        authorId: 'USR-DEMO-RAKA', authorName: 'Raka', createdAt: hoursAgo(26), updatedAt: null, removed: false },
      { id: 'RPL-2026-203', topicId: 'TPC-2026-102', communityId: 'community-klub-buku',
        body: 'Di klub kami pakai voting sederhana: tiga usulan, lalu dipilih yang paling banyak disebut anggota.',
        authorId: 'USR-DEMO-NADIA', authorName: 'Nadia', createdAt: hoursAgo(14), updatedAt: null, removed: false },
      { id: 'RPL-2026-204', topicId: 'TPC-2026-103', communityId: 'community-filologi',
        body: 'Saya pakai e-book untuk membaca cepat, lalu versi cetak untuk mencatat. Kombinasi itu paling nyaman untuk naskah panjang.',
        authorId: 'USR-DEMO-RAKA', authorName: 'Raka', createdAt: hoursAgo(60), updatedAt: null, removed: false },
      { id: 'RPL-2026-205', topicId: 'TPC-2026-105', communityId: 'community-sejarah',
        body: 'Bumi Parahyangan: Jejak Purba cukup berkesan karena penjelasannya menghubungkan bentang alam dengan cerita warga setempat.',
        authorId: 'USR-DEMO-NADIA', authorName: 'Nadia', createdAt: hoursAgo(20), updatedAt: null, removed: false },
      { id: 'RPL-2026-206', topicId: 'TPC-2026-106', communityId: 'community-sejarah',
        body: 'Saya biasakan 20 halaman per hari sambil mencatat satu kutipan. Alurnya tetap terjaga walau bukunya tebal.',
        authorId: 'USR-DEMO-RAKA', authorName: 'Raka', createdAt: hoursAgo(8), updatedAt: null, removed: false },
      { id: 'RPL-2026-207', topicId: 'TPC-2026-101', communityId: 'community-klub-buku',
        parentReplyId: 'RPL-2026-201',
        body: 'Setuju soal sudut pandang. Novel dengan dua narator biasanya paling ramai dibahas di klub kami.',
        authorId: 'USR-DEMO-RAKA', authorName: 'Raka', createdAt: hoursAgo(24), updatedAt: null, removed: false },
      { id: 'RPL-2026-208', topicId: 'TPC-2026-101', communityId: 'community-klub-buku',
        parentReplyId: 'RPL-2026-207',
        body: 'Kalau dua narator, biasanya peserta terbelah jadi dua kubu. Itu yang bikin diskusinya hidup.',
        authorId: 'USR-DEMO-DINA', authorName: 'Dina', createdAt: hoursAgo(22), updatedAt: null, removed: false }
    ];
  }

  function topicById(id) {
    return loadTopics().filter(function (topic) { return topic.id === id; })[0] || null;
  }

  function topicsFor(communityId) {
    return loadTopics().filter(function (topic) {
      return topic.communityId === communityId && !topic.removed;
    });
  }

  function repliesOfTopic(topicId) {
    /* Removed replies stay in the graph so their children keep a parent. */
    return loadReplies().filter(function (reply) { return reply.topicId === topicId; });
  }

  function repliesFor(topicId) {
    return repliesOfTopic(topicId).filter(function (reply) { return !reply.removed; });
  }

  function visibleReplyCount(topicId) {
    return repliesFor(topicId).length;
  }

  function lastActivityFor(topic) {
    var list = repliesFor(topic.id);
    var latest = topic.createdAt;
    list.forEach(function (reply) {
      if (new Date(reply.createdAt) > new Date(latest)) latest = reply.createdAt;
    });
    return latest;
  }

  function canPostIn(communityId) {
    var comm = communityById(communityId);
    if (!comm || (comm.status || 'active') !== 'active') return false;
    return !!(getSession() && isMember(communityId));
  }

  function renderProfileUnavailable(comm) {
    var panel = document.getElementById('profile-unavailable');
    if (!panel) return;
    document.getElementById('profile-identity').classList.add('hidden');
    document.getElementById('profile-body').classList.add('hidden');
    panel.classList.remove('hidden');
    panel.querySelector('[data-unavailable-name]').textContent = comm.name;
  }

  function resetProfilePanels() {
    var panel = document.getElementById('profile-unavailable');
    if (panel) panel.classList.add('hidden');
    var identity = document.getElementById('profile-identity');
    if (identity) identity.classList.remove('hidden');
    var body = document.getElementById('profile-body');
    if (body) body.classList.remove('hidden');
  }

  function relativeTime(iso) {
    var then = new Date(iso).getTime();
    if (isNaN(then)) return '';
    var minutes = Math.round((Date.now() - then) / 60000);
    if (minutes < 1) return 'baru saja';
    if (minutes < 60) return minutes + ' menit lalu';
    var hours = Math.round(minutes / 60);
    if (hours < 24) return hours + ' jam lalu';
    var days = Math.round(hours / 24);
    if (days < 30) return days + ' hari lalu';
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  /* ---------------- profile preview ---------------- */

  function renderProfilePreview(communityId) {
    var list = document.getElementById('profile-discussion-preview');
    var empty = document.getElementById('profile-discussion-empty');
    if (!list) return;

    var topics = topicsFor(communityId).sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }).slice(0, 2);

    list.textContent = '';
    if (!topics.length) {
      list.classList.add('hidden');
      if (empty) empty.classList.remove('hidden');
      return;
    }

    list.classList.remove('hidden');
    if (empty) empty.classList.add('hidden');

    topics.forEach(function (topic) {
      var row = document.createElement('div');
      row.className = 'py-3';

      /* Title is regular semantic text, not a button and not clickable. */
      var title = document.createElement('h4');
      title.className = 'text-[14px] font-bold leading-snug text-ink-body';
      title.textContent = topic.title;

      /* Short text preview */
      var preview = document.createElement('p');
      preview.className = 'mt-1 line-clamp-2 text-[13px] leading-relaxed text-ink-muted';
      preview.textContent = topic.body;

      var footer = document.createElement('div');
      footer.className = 'mt-2 flex items-center justify-between gap-3';

      var meta = document.createElement('p');
      meta.className = 'text-[12px] text-ink-muted';
      meta.textContent = topic.authorName + '  ' + relativeTime(topic.createdAt);

      var replies = visibleReplyCount(topic.id);
      var replyLink = document.createElement('a');
      replyLink.href = '?topik=' + encodeURIComponent(topic.id);
      replyLink.className = 'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border-subtle bg-white px-2.5 py-1.5 text-[12px] font-semibold text-primary transition-colors hover:bg-surface-soft hover:border-primary/30 shrink-0';
      if (replies === 0) {
        replyLink.setAttribute('aria-label', 'Lihat diskusi ' + topic.title + ', belum ada balasan');
      } else {
        replyLink.setAttribute('aria-label', 'Lihat ' + replies + ' balasan pada topik ' + topic.title);
      }
      var countIcon = document.createElement('span');
      countIcon.className = 'material-symbols-outlined text-[15px]';
      countIcon.setAttribute('aria-hidden', 'true');
      countIcon.textContent = 'chat_bubble';
      var countLabel = document.createElement('span');
      countLabel.textContent = replies + ' balasan';
      replyLink.appendChild(countIcon);
      replyLink.appendChild(countLabel);
      replyLink.addEventListener('click', function (e) {
        e.preventDefault();
        openTopic(topic.id);
      });

      footer.appendChild(meta);
      footer.appendChild(replyLink);

      row.appendChild(title);
      row.appendChild(preview);
      row.appendChild(footer);
      list.appendChild(row);
    });
  }

  /* ---------------- discussion room ---------------- */

  function openRoom(communityId) {
    var comm = communityById(communityId);
    if (!comm) {
      showNotice('Komunitas yang kamu buka tidak ditemukan. Pilih komunitas lain dari direktori.');
      showView('explore');
      return;
    }

    if ((comm.status || 'active') !== 'active') {
      openProfile(comm.id);
      return;
    }

    activeCommunityId = comm.id;
    activeTopicId = null;
    showNotice('');
    document.getElementById('room-community').textContent = comm.name;

    paintRoomPermission();
    renderRoom();
    showView('room');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function paintRoomPermission() {
    var buttons = [
      document.getElementById('btn-new-topic'),
      document.getElementById('btn-empty-new-topic')
    ].filter(Boolean);
    var note = document.getElementById('room-permission-note');
    var comm = communityById(activeCommunityId);
    var session = getSession();
    var allowed = canPostIn(activeCommunityId);

    buttons.forEach(function (button) {
      button.disabled = !allowed;
      button.className = allowed
        ? 'inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-[13.5px] font-bold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2'
        : 'inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-xl border border-border-subtle bg-surface-neutral px-4 text-[13.5px] font-bold text-ink-muted';
    });

    var emptyBox = document.getElementById('room-empty');
    if (emptyBox) {
      var emptyHeading = emptyBox.querySelector('h3');
      var emptyDesc = emptyBox.querySelector('p');
      if (emptyHeading) emptyHeading.textContent = 'Belum ada topik diskusi';
      if (emptyDesc) emptyDesc.textContent = allowed
        ? 'Mulai pembahasan pertama di komunitas ini.'
        : 'Belum ada pembahasan di komunitas ini.';
    }

    if (!note) return;
    if (allowed) { note.textContent = ''; return; }

    if (comm && (comm.status || 'active') !== 'active') {
      note.textContent = 'Komunitas ini sedang tidak menerima diskusi baru.';
    } else if (!session) {
      note.textContent = 'Masuk dan gabung komunitas untuk membuat topik.';
    } else {
      note.textContent = 'Gabung komunitas untuk membuat topik.';
    }
  }

  /* ---- Balas Komentar subview ---- */
  var activeReplyParentId = null;

  function openReplyView(replyId) {
    var parent = loadReplies().filter(function (reply) { return reply.id === replyId; })[0] || null;
    var topic = topicById(activeTopicId);

    if (!parent || parent.removed || !topic || parent.topicId !== topic.id) {
      activeReplyParentId = null;
      document.getElementById('reply-parent-card').classList.add('hidden');
      document.getElementById('reply-parent-unavailable').classList.remove('hidden');
      document.getElementById('reply-view-form').classList.add('hidden');
      document.getElementById('reply-view-restricted').classList.add('hidden');
      showView('reply');
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    activeReplyParentId = parent.id;
    document.getElementById('reply-parent-unavailable').classList.add('hidden');
    document.getElementById('reply-parent-card').classList.remove('hidden');

    document.getElementById('reply-parent-name').textContent = parent.authorName;
    document.getElementById('reply-parent-author').textContent = parent.authorName;
    document.getElementById('reply-parent-time').textContent = relativeTime(parent.createdAt) + (parent.updatedAt ? '  (diedit)' : '');
    document.getElementById('reply-parent-avatar').textContent = (parent.authorName || '?').trim().charAt(0).toUpperCase();
    document.getElementById('reply-parent-body').textContent = parent.body;

    var input = document.getElementById('reply-view-input');
    input.value = '';
    document.getElementById('reply-view-counter').textContent = '0/' + REPLY_LIMIT;
    document.getElementById('reply-view-error').classList.add('hidden');
    paintReplyViewPermission(topic);

    showView('reply');
    window.scrollTo({ top: 0, behavior: 'auto' });

    if (canPostIn(topic.communityId)) input.focus();
  }

  function paintReplyViewPermission(topic) {
    var form = document.getElementById('reply-view-form');
    var restricted = document.getElementById('reply-view-restricted');
    var allowed = !!topic && canPostIn(topic.communityId);

    form.classList.toggle('hidden', !allowed);
    restricted.classList.toggle('hidden', allowed);
    restricted.textContent = 'Gabung komunitas ini untuk membalas komentar.';
  }

  function closeReplyView() {
    activeReplyParentId = null;
    if (activeTopicId) openTopic(activeTopicId);
    else if (activeCommunityId) openRoom(activeCommunityId);
    else showView('explore');
  }

  function submitReplyView(event) {
    if (event) event.preventDefault();
    if (discussionBusy) return;

    var topic = topicById(activeTopicId);
    var parent = activeReplyParentId
      ? loadReplies().filter(function (reply) { return reply.id === activeReplyParentId; })[0]
      : null;
    var input = document.getElementById('reply-view-input');
    var error = document.getElementById('reply-view-error');
    var text = input.value.trim();

    error.classList.add('hidden');

    if (!topic || !parent || parent.removed || parent.topicId !== topic.id) {
      error.textContent = 'Komentar yang dibalas sudah tidak tersedia.';
      error.classList.remove('hidden');
      return;
    }

    if (!canPostIn(topic.communityId)) {
      error.textContent = 'Kamu bukan anggota komunitas ini.';
      error.classList.remove('hidden');
      return;
    }

    if (!text) {
      error.textContent = 'Tulis balasan terlebih dahulu.';
      error.classList.remove('hidden');
      return;
    }

    var session = getSession();
    var list = loadReplies();
    var newReply = {
      id: 'RPL-' + Date.now().toString(36).toUpperCase(),
      topicId: topic.id,
      communityId: topic.communityId,
      parentReplyId: parent.id,
      body: text,
      authorId: session.id,
      authorName: session.name || (session.email ? session.email.split('@')[0] : 'Pembeli'),
      createdAt: new Date().toISOString(),
      updatedAt: null,
      removed: false
    };
    list.push(newReply);

    discussionBusy = true;
    document.getElementById('reply-view-submit').disabled = true;

    if (!saveReplies(list)) {
      discussionBusy = false;
      document.getElementById('reply-view-submit').disabled = false;
      error.textContent = 'Balasan belum tersimpan. Coba lagi.';
      error.classList.remove('hidden');
      return;
    }

    discussionBusy = false;
    document.getElementById('reply-view-submit').disabled = false;
    activeReplyParentId = null;

    openTopic(topic.id);
    renderRoom();
    renderProfilePreview(topic.communityId);

    var created = document.querySelector('[data-reply-id="' + newReply.id + '"]');
    if (created) {
      created.classList.add('rounded-xl', 'bg-surface-soft');
      created.scrollIntoView({ block: 'center' });
      window.setTimeout(function () {
        created.classList.remove('rounded-xl', 'bg-surface-soft');
      }, 2000);
    }
    announce('Balasan terkirim.');
  }

  function renderRoom() {
    var list = document.getElementById('topic-list');
    var empty = document.getElementById('room-empty');
    if (!list) return;

    var topics = topicsFor(activeCommunityId);

    if (topicSort === 'last-activity') {
      topics.sort(function (a, b) { return new Date(lastActivityFor(b)) - new Date(lastActivityFor(a)); });
    } else {
      topics.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    }

    paintSortTabs();
    list.textContent = '';

    if (!topics.length) {
      list.classList.add('hidden');
      if (empty) { empty.classList.remove('hidden'); empty.classList.add('flex'); }
      return;
    }

    list.classList.remove('hidden');
    if (empty) { empty.classList.add('hidden'); empty.classList.remove('flex'); }

    topics.forEach(function (topic) {
      list.appendChild(buildTopicRow(topic));
    });
  }

  function paintSortTabs() {
    var newest = document.getElementById('sort-newest');
    var activity = document.getElementById('sort-last-activity');
    if (!newest || !activity) return;

    var newestActive = topicSort === 'newest';
    newest.setAttribute('aria-selected', newestActive ? 'true' : 'false');
    newest.className = 'sort-tab rounded-lg px-3 py-1.5 text-[12.5px] ' +
      (newestActive ? 'bg-surface-neutral font-bold text-primary' : 'font-semibold text-ink-muted hover:text-ink-body');
    activity.setAttribute('aria-selected', newestActive ? 'false' : 'true');
    activity.className = 'sort-tab rounded-lg px-3 py-1.5 text-[12.5px] ' +
      (newestActive ? 'font-semibold text-ink-muted hover:text-ink-body' : 'bg-surface-neutral font-bold text-primary');
  }

  function avatarFor(name, sizeClass) {
    var avatar = document.createElement('span');
    avatar.className = 'grid shrink-0 place-items-center rounded-full bg-surface-soft font-bold text-primary ' + sizeClass;
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = (name || '?').trim().charAt(0).toUpperCase();
    return avatar;
  }

  function buildTopicRow(topic) {
    var row = document.createElement('article');
    row.className = 'flex gap-3 py-4';

    row.appendChild(avatarFor(topic.authorName, 'h-9 w-9 text-[13px]'));

    var main = document.createElement('div');
    main.className = 'min-w-0 flex-1';

    /* Title is prominent regular semantic text, not clickable. */
    var title = document.createElement('h3');
    title.className = 'text-[16px] font-bold leading-snug text-ink-body';
    title.textContent = topic.title;

    var preview = document.createElement('p');
    preview.className = 'mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-ink-muted';
    preview.textContent = topic.body;

    var footer = document.createElement('div');
    footer.className = 'mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2';

    var replies = visibleReplyCount(topic.id);
    var meta = document.createElement('p');
    meta.className = 'text-[12.5px] text-ink-muted';
    meta.textContent = topic.authorName + '  ' + relativeTime(topic.createdAt) + (topic.updatedAt ? '  (diedit)' : '');

    /* Icon + reply count is the explicit navigation link. */
    var replyLink = document.createElement('a');
    replyLink.href = '?topik=' + encodeURIComponent(topic.id);
    replyLink.className = 'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border-subtle bg-white px-2.5 py-1.5 text-[12.5px] font-semibold text-primary transition-colors hover:bg-surface-soft hover:border-primary/30 shrink-0';
    if (replies === 0) {
      replyLink.setAttribute('aria-label', 'Lihat diskusi ' + topic.title + ', belum ada balasan');
    } else {
      replyLink.setAttribute('aria-label', 'Lihat ' + replies + ' balasan pada topik ' + topic.title);
    }
    var countIcon = document.createElement('span');
    countIcon.className = 'material-symbols-outlined text-[16px]';
    countIcon.setAttribute('aria-hidden', 'true');
    countIcon.textContent = 'chat_bubble';
    var countLabel = document.createElement('span');
    countLabel.textContent = replies + ' balasan';
    replyLink.appendChild(countIcon);
    replyLink.appendChild(countLabel);
    replyLink.addEventListener('click', function (e) {
      e.preventDefault();
      openTopic(topic.id);
    });

    footer.appendChild(meta);
    footer.appendChild(replyLink);

    main.appendChild(title);
    main.appendChild(preview);
    main.appendChild(footer);
    row.appendChild(main);
    return row;
  }

  /* ---------------- topic detail ---------------- */

  function openTopic(topicId) {
    var topic = topicById(topicId);
    var previousTopicId = activeTopicId;
    activeTopicId = topicId;

    /* An unsent reply belongs to the topic it was typed in, so switching topics
       clears the composer instead of carrying the draft across. */
    if (previousTopicId !== topicId) {
      var draft = document.getElementById('reply-input');
      if (draft) draft.value = '';
      var draftError = document.getElementById('reply-error');
      if (draftError) draftError.classList.add('hidden');
      var draftCounter = document.getElementById('reply-counter');
      if (draftCounter) draftCounter.textContent = '0/' + REPLY_LIMIT;
    }

    if (!topic || topic.removed) {
      document.getElementById('topic-content').classList.add('hidden');
      document.getElementById('topic-unavailable').classList.remove('hidden');
      showView('topic');
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    if (!activeCommunityId) activeCommunityId = topic.communityId;

    document.getElementById('topic-unavailable').classList.add('hidden');
    document.getElementById('topic-content').classList.remove('hidden');
    document.getElementById('topic-content').classList.add('flex');

    renderTopic(topic);
    renderReplies(topic);
    paintReplyPermission(topic);
    showView('topic');
    window.scrollTo({ top: 0, behavior: 'auto' });

    var heading = document.getElementById('topic-title');
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }

  function renderTopic(topic) {
    var comm = communityById(topic.communityId);
    document.getElementById('topic-community').textContent = comm ? comm.name : '';
    document.getElementById('topic-title').textContent = topic.title;
    document.getElementById('topic-meta').textContent = 'Diposting ' + relativeTime(topic.createdAt) + ' oleh ' + topic.authorName +
      (topic.updatedAt ? ' (diedit ' + relativeTime(topic.updatedAt) + ')' : '');
    document.getElementById('topic-body').textContent = topic.body;

    var slot = document.getElementById('topic-menu-slot');
    slot.textContent = '';
    slot.appendChild(buildMenuButton(topic, 'topic'));
  }



  function renderReplies(topic) {
    var list = document.getElementById('reply-list');
    var empty = document.getElementById('reply-empty');
    var count = document.getElementById('reply-count');
    if (!list) return;

    var all = repliesOfTopic(topic.id);
    var byId = {};
    all.forEach(function (reply) { byId[reply.id] = reply; });

    var childrenOf = {};
    var roots = [];

    all.forEach(function (reply) {
      var parent = reply.parentReplyId ? byId[reply.parentReplyId] : null;
      if (parent) {
        childrenOf[parent.id] = childrenOf[parent.id] || [];
        childrenOf[parent.id].push(reply);
      } else {
        roots.push(reply);
      }
    });

    var byTime = function (a, b) { return new Date(a.createdAt) - new Date(b.createdAt); };
    roots.sort(byTime);
    Object.keys(childrenOf).forEach(function (key) { childrenOf[key].sort(byTime); });

    var visible = visibleReplyCount(topic.id);
    count.textContent = visible + ' balasan';
    list.textContent = '';

    if (!roots.length) {
      list.classList.add('hidden');
      if (empty) empty.classList.remove('hidden');
      return;
    }

    list.classList.remove('hidden');
    list.classList.add('thread-list');
    if (empty) empty.classList.add('hidden');

    var rendered = {};
    roots.forEach(function (root) {
      list.appendChild(buildReplyNode(root, 0, childrenOf, rendered, null));
    });
  }

  var THREAD_MAX_DEPTH = 2;

  /* Flattens every descendant of a node so a deep chain never squeezes the text
     column; each entry keeps its real parent for the "Membalas" context label. */
  function collectDescendants(replyId, childrenOf, rendered, out) {
    (childrenOf[replyId] || []).forEach(function (child) {
      if (rendered[child.id]) return;
      rendered[child.id] = true;
      out.push({ reply: child, parentId: replyId });
      collectDescendants(child.id, childrenOf, rendered, out);
    });
    return out;
  }

  function buildReplyNode(reply, depth, childrenOf, rendered, parentAuthor) {
    if (rendered[reply.id]) return document.createDocumentFragment();
    rendered[reply.id] = true;

    var children = (childrenOf[reply.id] || []).filter(function (child) { return !rendered[child.id]; });
    var node = document.createElement('div');
    node.className = 'thread-node';
    node.setAttribute('data-reply-id', reply.id);

    node.appendChild(reply.removed
      ? buildThreadRow(buildDeletedPlaceholder(reply), children.length > 0, parentAuthor)
      : buildThreadRow(buildReplyBody(reply), children.length > 0, parentAuthor));

    if (children.length) {
      var childrenWrap = document.createElement('div');
      childrenWrap.className = 'thread-children';

      if (depth >= THREAD_MAX_DEPTH) {
        /* Deeper levels keep their real parentReplyId but stay visually flat. */
        var flat = [];
        children.forEach(function (child) {
          if (rendered[child.id]) return;
          rendered[child.id] = true;
          flat.push({ reply: child, parentId: reply.id });
          collectDescendants(child.id, childrenOf, rendered, flat);
        });
        flat.sort(function (a, b) { return new Date(a.reply.createdAt) - new Date(b.reply.createdAt); });
        flat.forEach(function (entry) {
          var parentReply = entry.parentId === reply.id ? reply : null;
          var label = parentReply ? parentReply.authorName : parentAuthorOf(entry.parentId);
          childrenWrap.appendChild(buildFlatReply(entry.reply, label));
        });
      } else {
        children.forEach(function (child) {
          childrenWrap.appendChild(buildReplyNode(child, depth + 1, childrenOf, rendered, reply.authorName));
        });
      }

      if (childrenWrap.children.length) node.appendChild(childrenWrap);
    }

    return node;
  }

  function parentAuthorOf(replyId) {
    var found = repliesOfTopic(activeTopicId).filter(function (item) { return item.id === replyId; })[0];
    return found ? found.authorName : '';
  }

  /* One comment = avatar rail + content column. */
  function buildThreadRow(content, hasChildren, parentAuthor) {
    var row = document.createElement('div');
    row.className = 'thread-row';

    var rail = document.createElement('div');
    rail.className = 'thread-rail';

    if (content.getAttribute('data-neutral-avatar')) {
      var neutral = document.createElement('span');
      neutral.className = 'grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-neutral text-ink-muted';
      neutral.setAttribute('aria-hidden', 'true');
      var neutralIcon = document.createElement('span');
      neutralIcon.className = 'material-symbols-outlined text-[16px]';
      neutralIcon.textContent = 'speaker_notes_off';
      neutral.appendChild(neutralIcon);
      rail.appendChild(neutral);
    } else {
      rail.appendChild(avatarFor(content.getAttribute('data-author') || '', 'h-9 w-9 text-[12px]'));
    }

    if (hasChildren) {
      var line = document.createElement('span');
      line.className = 'thread-rail-line';
      line.setAttribute('aria-hidden', 'true');
      rail.appendChild(line);
    }

    var column = document.createElement('div');
    column.className = 'thread-content';

    if (parentAuthor) {
      var context = document.createElement('p');
      context.className = 'thread-context';
      var contextIcon = document.createElement('span');
      contextIcon.className = 'material-symbols-outlined';
      contextIcon.setAttribute('aria-hidden', 'true');
      contextIcon.textContent = 'subdirectory_arrow_right';
      var contextText = document.createElement('span');
      contextText.textContent = 'Membalas ' + parentAuthor;
      context.appendChild(contextIcon);
      context.appendChild(contextText);
      column.appendChild(context);
    }

    column.appendChild(content);

    row.appendChild(rail);
    row.appendChild(column);
    return row;
  }

  /* Deep descendants keep their connector-free compact form. */
  function buildFlatReply(reply, parentAuthor) {
    var node = document.createElement('div');
    node.className = 'thread-node';
    node.setAttribute('data-reply-id', reply.id);
    node.appendChild(buildThreadRow(
      reply.removed ? buildDeletedPlaceholder(reply) : buildReplyBody(reply),
      false,
      parentAuthor || null
    ));
    return node;
  }

  function buildDeletedPlaceholder(reply) {
    var row = document.createElement('div');
    row.className = 'flex items-center gap-2.5 text-[13px] italic text-ink-muted';
    row.setAttribute('data-neutral-avatar', '1');
/* The rail already shows a neutral icon for removed authors. */
    var label = document.createElement('span');
    label.textContent = 'Komentar telah dihapus';
    row.appendChild(label);
    return row;
  }

  function buildReplyBody(reply) {
    var row = document.createElement('article');
    row.setAttribute('data-author', reply.authorName || '');

    var head = document.createElement('div');
    head.className = 'flex items-start justify-between gap-3';

    var who = document.createElement('div');
    who.className = 'flex min-w-0 items-center gap-2.5';
    var whoText = document.createElement('div');
    var name = document.createElement('p');
    name.className = 'text-[13.5px] font-bold text-ink-body';
    name.textContent = reply.authorName;
    var time = document.createElement('p');
    time.className = 'text-[12px] text-ink-muted';
    time.textContent = relativeTime(reply.createdAt) + (reply.updatedAt ? '  (diedit)' : '');
    whoText.appendChild(name);
    whoText.appendChild(time);
    who.appendChild(whoText);

    var actions = document.createElement('div');
    actions.className = 'flex shrink-0 items-center gap-2';

    var canReply = canPostIn(reply.communityId);
    var replyButton = document.createElement('button');
    replyButton.type = 'button';
    replyButton.disabled = !canReply;
    replyButton.className = canReply
      ? 'inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-semibold text-ink-muted transition-colors hover:bg-surface-soft hover:text-primary'
      : 'inline-flex cursor-not-allowed items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-semibold text-ink-muted opacity-50';
    var replyIcon = document.createElement('span');
    replyIcon.className = 'material-symbols-outlined text-[15px]';
    replyIcon.setAttribute('aria-hidden', 'true');
    replyIcon.textContent = 'reply';
    var replyText = document.createElement('span');
    replyText.textContent = 'Balas';
    replyButton.appendChild(replyIcon);
    replyButton.appendChild(replyText);
    replyButton.addEventListener('click', function () {
      if (!canPostIn(reply.communityId)) return;
      openReplyView(reply.id);
    });

    actions.appendChild(replyButton);
    actions.appendChild(buildMenuButton(reply, 'reply'));

    head.appendChild(who);
    head.appendChild(actions);

    var body = document.createElement('p');
    body.className = 'mt-2 whitespace-pre-line text-[14px] leading-relaxed text-ink-body';
    body.textContent = reply.body;

    row.appendChild(head);
    row.appendChild(body);
    return row;
  }

  function paintReplyPermission(topic) {
    var form = document.getElementById('reply-form');
    var restricted = document.getElementById('reply-restricted');
    if (!form || !restricted) return;

    if (canPostIn(topic.communityId)) {
      form.classList.remove('hidden');
      form.classList.add('flex');
      restricted.classList.add('hidden');
      return;
    }

    form.classList.add('hidden');
    form.classList.remove('flex');
    restricted.classList.remove('hidden');

    var session = getSession();
    restricted.textContent = '';
    if (!session) {
      restricted.appendChild(document.createTextNode('Masuk sebagai pembeli dan gabung komunitas untuk membalas diskusi. '));
      var login = document.createElement('a');
      login.href = loginUrlFor(topic.communityId);
      login.className = 'font-semibold text-primary hover:underline';
      login.textContent = 'Masuk ke akun';
      restricted.appendChild(login);
    } else {
      restricted.appendChild(document.createTextNode('Gabung komunitas ini untuk membalas diskusi. '));
      var join = document.createElement('button');
      join.type = 'button';
      join.className = 'cursor-pointer font-semibold text-primary hover:underline';
      join.textContent = 'Buka profil komunitas';
      join.addEventListener('click', function () { openProfile(topic.communityId); });
      restricted.appendChild(join);
    }
  }

  /* ---------------- menu (owner / report) ---------------- */

  function buildMenuButton(item, kind) {
    var wrap = document.createElement('div');
    wrap.className = 'relative shrink-0';

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-ink-muted transition-colors hover:bg-surface-neutral hover:text-ink-body';
    button.setAttribute('aria-label', 'Aksi untuk ' + (kind === 'topic' ? 'topik' : 'balasan') + ' ini');
    button.setAttribute('aria-haspopup', 'menu');
    button.setAttribute('aria-expanded', 'false');
    var icon = document.createElement('span');
    icon.className = 'material-symbols-outlined text-[18px]';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = 'more_horiz';
    button.appendChild(icon);

    button.addEventListener('click', function (event) {
      event.stopPropagation();
      var alreadyOpen = !menuIsHidden() && menuTarget && menuTarget.item && menuTarget.item.id === item.id;
      if (alreadyOpen) { closeContentMenu(); return; }
      openContentMenu(button, item, kind);
    });

    function menuIsHidden() {
      var menu = document.getElementById('content-menu');
      return !menu || menu.classList.contains('hidden');
    }

    wrap.appendChild(button);
    return wrap;
  }

  function openContentMenu(anchor, item, kind) {
    var menu = document.getElementById('content-menu');
    var session = getSession();
    var isOwner = session && session.id === item.authorId;

    menu.textContent = '';
    menuTarget = { item: item, kind: kind };

    var actions = [];
    if (isOwner) {
      actions.push({ id: 'edit', icon: 'edit', label: kind === 'topic' ? 'Edit Topik' : 'Edit Balasan' });
      actions.push({ id: 'delete', icon: 'delete', label: kind === 'topic' ? 'Hapus Topik' : 'Hapus Balasan', danger: true });
    } else {
      actions.push({ id: 'report', icon: 'flag', label: 'Laporkan' });
    }

    actions.forEach(function (action) {
      var button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('role', 'menuitem');
      button.className = 'flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors hover:bg-surface-neutral ' +
        (action.danger ? 'text-[#B42318]' : 'text-ink-body');
      var actionIcon = document.createElement('span');
      actionIcon.className = 'material-symbols-outlined text-[17px]';
      actionIcon.setAttribute('aria-hidden', 'true');
      actionIcon.textContent = action.icon;
      var actionLabel = document.createElement('span');
      actionLabel.textContent = action.label;
      button.appendChild(actionIcon);
      button.appendChild(actionLabel);
      button.addEventListener('click', function () {
        closeContentMenu();
        if (action.id === 'edit') {
          if (kind === 'topic') openComposer('edit', item);
          else startEditReply(item);
        } else if (action.id === 'delete') {
          openDelete(item, kind);
        } else {
          openReport(item, kind);
        }
      });
      menu.appendChild(button);
    });

    menu.classList.remove('hidden');
    var rect = anchor.getBoundingClientRect();
    var width = menu.offsetWidth || 180;
    var height = menu.offsetHeight || 60;
    var left = Math.min(rect.right - width, window.innerWidth - width - 8);
    var top = rect.bottom + 6;
    if (top + height > window.innerHeight - 8) top = Math.max(8, rect.top - height - 6);
    menu.style.left = Math.max(8, left) + 'px';
    menu.style.top = top + 'px';
    anchor.setAttribute('aria-expanded', 'true');

    var first = menu.querySelector('button');
    if (first) first.focus();
  }

  function closeContentMenu() {
    var menu = document.getElementById('content-menu');
    if (!menu || menu.classList.contains('hidden')) return;
    menu.classList.add('hidden');
    menuTarget = null;
  }

  /* ---------------- composer ---------------- */

  function openComposer(mode, topic) {
    /* No demo login, no join, no navigation: an unauthorised click does nothing. */
    if (!canPostIn(activeCommunityId)) return;

    composerMode = mode;
    composingTopicId = topic ? topic.id : null;
    composerLocked = false;
    composerReturnFocus = document.activeElement && document.activeElement.focus ? document.activeElement : null;

    var comm = communityById(activeCommunityId);
    document.getElementById('composer-title').textContent = mode === 'edit' ? 'Edit Topik Diskusi' : 'Buat Topik Diskusi';
    document.getElementById('composer-desc').textContent = mode === 'edit'
      ? 'Perbarui isi topikmu di ' + (comm ? comm.name : 'komunitas ini') + '.'
      : 'Mulai pembahasan baru di ' + (comm ? comm.name : 'komunitas ini') + '.';
    document.getElementById('composer-submit').textContent = mode === 'edit' ? 'Simpan Perubahan' : 'Terbitkan Topik';

    document.getElementById('topic-title-input').value = topic ? topic.title : '';
    document.getElementById('topic-body-input').value = topic ? topic.body : '';
    document.getElementById('topic-title-error').classList.add('hidden');
    document.getElementById('topic-body-error').classList.add('hidden');
    document.getElementById('composer-error').classList.add('hidden');
    paintComposerCounter();
    discussionBusy = false;
    document.getElementById('composer-submit').disabled = false;

    document.getElementById('composer-modal').classList.remove('hidden');
    document.getElementById('topic-title-input').focus();
  }

  function closeComposer() {
    var modal = document.getElementById('composer-modal');
    if (!modal || modal.classList.contains('hidden')) return;
    modal.classList.add('hidden');
    composingTopicId = null;
    discussionBusy = false;

    /* Focus returns to the control that opened the composer. */
    if (composerReturnFocus) {
      composerReturnFocus.focus();
      composerReturnFocus = null;
    }
  }

  function paintComposerCounter() {
    var body = document.getElementById('topic-body-input');
    document.getElementById('topic-body-counter').textContent = body.value.length + '/' + BODY_LIMIT;
  }

  function submitComposer() {
    /* The composer stays locked after one submit so a double click cannot create
       two topics; it is released when the composer is opened again. */
    if (discussionBusy || composerLocked) return;

    var titleInput = document.getElementById('topic-title-input');
    var bodyInput = document.getElementById('topic-body-input');
    var title = titleInput.value.trim();
    var body = bodyInput.value.trim();
    var titleError = document.getElementById('topic-title-error');
    var bodyError = document.getElementById('topic-body-error');

    titleError.classList.add('hidden');
    bodyError.classList.add('hidden');
    document.getElementById('composer-error').classList.add('hidden');

    var invalid = false;
    if (!title) { titleError.textContent = 'Judul topik wajib diisi.'; titleError.classList.remove('hidden'); invalid = true; }
    if (!body) { bodyError.textContent = 'Isi diskusi wajib diisi.'; bodyError.classList.remove('hidden'); invalid = true; }
    if (invalid) return;

    composerLocked = true;

    if (!canPostIn(activeCommunityId)) {
      composerLocked = false;
      document.getElementById('composer-error').textContent = 'Kamu bukan anggota komunitas ini.';
      document.getElementById('composer-error').classList.remove('hidden');
      return;
    }

    var session = getSession();
    discussionBusy = true;
    document.getElementById('composer-submit').disabled = true;

    if (composerMode === 'edit') {
      var topics = loadTopics();
      var target = topics.filter(function (item) { return item.id === composingTopicId; })[0];
      if (!target || target.authorId !== session.id) {
        discussionBusy = false;
        composerLocked = false;
        document.getElementById('composer-submit').disabled = false;
        document.getElementById('composer-error').textContent = 'Topik ini tidak dapat diubah.';
        document.getElementById('composer-error').classList.remove('hidden');
        return;
      }
      target.title = title;
      target.body = body;
      target.updatedAt = new Date().toISOString();

      if (!saveTopics(topics)) {
        discussionBusy = false;
        composerLocked = false;
        document.getElementById('composer-submit').disabled = false;
        document.getElementById('composer-error').textContent = 'Perubahan belum tersimpan. Coba lagi.';
        document.getElementById('composer-error').classList.remove('hidden');
        return;
      }

      discussionBusy = false;
      document.getElementById('composer-submit').disabled = false;
      closeComposer();
      renderTopic(target);
      renderRoom();
      renderProfilePreview(activeCommunityId);
      announce('Topik diperbarui.');
      return;
    }

    var list = loadTopics();
    var newTopic = {
      id: 'TPC-' + Date.now().toString(36).toUpperCase(),
      communityId: activeCommunityId,
      title: title,
      body: body,
      authorId: session.id,
      authorName: session.name || (session.email ? session.email.split('@')[0] : 'Pembeli'),
      createdAt: new Date().toISOString(),
      updatedAt: null,
      removed: false
    };

    list.push(newTopic);

    if (!saveTopics(list)) {
      discussionBusy = false;
      composerLocked = false;
      document.getElementById('composer-submit').disabled = false;
      document.getElementById('composer-error').textContent = 'Topik belum tersimpan. Coba lagi.';
      document.getElementById('composer-error').classList.remove('hidden');
      return;
    }

    discussionBusy = false;
    document.getElementById('composer-submit').disabled = false;
    closeComposer();
    renderRoom();
    renderProfilePreview(activeCommunityId);
    announce('Topik baru diterbitkan.');
    openTopic(newTopic.id);
  }

  /* ---------------- replies ---------------- */

  function submitReply(event) {
    if (event) event.preventDefault();
    if (discussionBusy) return;

    var input = document.getElementById('reply-input');
    var error = document.getElementById('reply-error');
    var text = input.value.trim();
    error.classList.add('hidden');

    if (!text) {
      error.textContent = 'Tulis balasan terlebih dahulu.';
      error.classList.remove('hidden');
      return;
    }

    var topic = topicById(activeTopicId);
    if (!topic || !canPostIn(topic.communityId)) {
      error.textContent = 'Kamu tidak dapat membalas diskusi ini.';
      error.classList.remove('hidden');
      return;
    }

    var session = getSession();
    var list = loadReplies();
    var newReply = {
      id: 'RPL-' + Date.now().toString(36).toUpperCase(),
      topicId: topic.id,
      communityId: topic.communityId,
      parentReplyId: null,
      body: text,
      authorId: session.id,
      authorName: session.name || (session.email ? session.email.split('@')[0] : 'Pembeli'),
      createdAt: new Date().toISOString(),
      updatedAt: null,
      removed: false
    };
    list.push(newReply);

    discussionBusy = true;
    document.getElementById('reply-submit').disabled = true;

    if (!saveReplies(list)) {
      discussionBusy = false;
      document.getElementById('reply-submit').disabled = false;
      error.textContent = 'Balasan belum tersimpan. Coba lagi.';
      error.classList.remove('hidden');
      return;
    }

    discussionBusy = false;
    document.getElementById('reply-submit').disabled = false;
    input.value = '';
    document.getElementById('reply-counter').textContent = '0/' + REPLY_LIMIT;
    renderReplies(topic);
    renderRoom();
    renderProfilePreview(topic.communityId);
    announce('Balasan terkirim.');
  }

  function startEditReply(reply) {
    var row = document.querySelector('[data-reply-id="' + reply.id + '"]');
    if (!row || row.querySelector('textarea')) return;

    var body = row.querySelector('p.mt-2');
    if (body) body.classList.add('hidden');

    var form = document.createElement('div');
    form.className = 'mt-2 space-y-2';

    var textarea = document.createElement('textarea');
    textarea.rows = 3;
    textarea.maxLength = REPLY_LIMIT;
    textarea.className = 'w-full resize-none rounded-xl border border-border-subtle bg-white p-3 text-[14px] leading-relaxed text-ink-body focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
    textarea.value = reply.body;

    var error = document.createElement('p');
    error.className = 'hidden text-[12.5px] font-medium text-[#B42318]';
    error.setAttribute('role', 'alert');

    var actions = document.createElement('div');
    actions.className = 'flex items-center justify-end gap-2';

    var cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'h-9 cursor-pointer rounded-xl border border-border-subtle px-3 text-[13px] font-semibold text-ink-body hover:bg-surface-neutral';
    cancel.textContent = 'Batal';
    cancel.addEventListener('click', function () { form.remove(); if (body) body.classList.remove('hidden'); });

    var save = document.createElement('button');
    save.type = 'button';
    save.className = 'h-9 cursor-pointer rounded-xl bg-primary px-3 text-[13px] font-bold text-white hover:bg-primary-hover';
    save.textContent = 'Simpan';
    save.addEventListener('click', function () {
      var value = textarea.value.trim();
      error.classList.add('hidden');
      if (!value) {
        error.textContent = 'Balasan tidak boleh kosong.';
        error.classList.remove('hidden');
        return;
      }

      var session = getSession();
      var list = loadReplies();
      var target = list.filter(function (item) { return item.id === reply.id; })[0];
      if (!target || !session || target.authorId !== session.id) {
        error.textContent = 'Balasan ini tidak dapat diubah.';
        error.classList.remove('hidden');
        return;
      }

      target.body = value;
      target.updatedAt = new Date().toISOString();

      if (!saveReplies(list)) {
        error.textContent = 'Perubahan belum tersimpan. Coba lagi.';
        error.classList.remove('hidden');
        return;
      }

      var topic = topicById(target.topicId);
      if (topic) renderReplies(topic);
      announce('Balasan diperbarui.');
    });

    actions.appendChild(cancel);
    actions.appendChild(save);

    form.appendChild(textarea);
    form.appendChild(error);
    form.appendChild(actions);
    row.appendChild(form);
    textarea.focus();
  }

  /* ---------------- delete ---------------- */

  function openDelete(item, kind) {
    deleteTarget = { item: item, kind: kind };
    document.getElementById('delete-title').textContent = kind === 'topic' ? 'Hapus topik ini?' : 'Hapus balasan ini?';
    document.getElementById('delete-desc').textContent = kind === 'topic'
      ? 'Topik ini tidak lagi ditampilkan kepada anggota komunitas.'
      : 'Balasan ini tidak lagi ditampilkan pada topik diskusi.';
    document.getElementById('delete-confirm').textContent = kind === 'topic' ? 'Hapus Topik' : 'Hapus Balasan';
    document.getElementById('delete-modal').classList.remove('hidden');
    document.getElementById('delete-cancel').focus();
  }

  function closeDelete() {
    var modal = document.getElementById('delete-modal');
    if (!modal || modal.classList.contains('hidden')) return;
    modal.classList.add('hidden');
    deleteTarget = null;
  }

  function confirmDelete() {
    if (!deleteTarget) { closeDelete(); return; }

    var session = getSession();
    var item = deleteTarget.item;
    var kind = deleteTarget.kind;

    if (!session || item.authorId !== session.id) {
      closeDelete();
      return;
    }

    if (kind === 'topic') {
      var topics = loadTopics();
      var target = topics.filter(function (entry) { return entry.id === item.id; })[0];
      if (!target) { closeDelete(); return; }
      target.removed = true;
      if (!saveTopics(topics)) { closeDelete(); announce('Penghapusan belum tersimpan. Coba lagi.'); return; }
      closeDelete();
      renderRoom();
      renderProfilePreview(item.communityId);
      openRoom(item.communityId);
      announce('Topik dihapus.');
      return;
    }

    var replies = loadReplies();
    var reply = replies.filter(function (entry) { return entry.id === item.id; })[0];
    if (!reply) { closeDelete(); return; }
    reply.removed = true;
    if (!saveReplies(replies)) { closeDelete(); announce('Penghapusan belum tersimpan. Coba lagi.'); return; }
    closeDelete();
    var topic = topicById(reply.topicId);
    if (topic) { renderReplies(topic); renderRoom(); renderProfilePreview(topic.communityId); }
    announce('Balasan dihapus.');
  }

  /* ---------------- reporting ---------------- */

  function buildReportReasons() {
    var wrap = document.getElementById('discussion-report-reasons');
    if (!wrap || wrap.children.length) return;

    DISCUSSION_REASONS.forEach(function (reason) {
      var label = document.createElement('label');
      label.className = 'flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-surface-neutral';
      var input = document.createElement('input');
      input.type = 'radio';
      input.name = 'discussion-report-reason';
      input.value = reason.id;
      input.className = 'mt-0.5 h-4 w-4 accent-primary';
      var text = document.createElement('span');
      text.className = 'text-[13.5px] leading-snug text-ink-body';
      text.textContent = reason.label;
      label.appendChild(input);
      label.appendChild(text);
      wrap.appendChild(label);
    });
  }

  function openReport(item, kind) {
    var session = getSession();
    if (!session) {
      ensureDemoSession();
      session = getSession();
    }
    if (!session) return;

    buildReportReasons();
    reportTarget = { item: item, kind: kind };

    var existing = loadReports().filter(function (report) {
      return report.reporterUserId === session.id &&
        report.targetType === kind &&
        report.targetId === item.id &&
        report.status === 'pending';
    });

    document.getElementById('discussion-report-target').textContent =
      (kind === 'topic' ? 'Topik: ' : 'Balasan dari ') + (kind === 'topic' ? item.title : item.authorName);
    document.getElementById('discussion-report-excerpt').textContent = kind === 'topic' ? item.body : item.body;
    document.getElementById('discussion-report-details').value = '';
    document.getElementById('discussion-report-counter').textContent = '0/500';
    document.getElementById('discussion-report-error').classList.add('hidden');
    document.getElementById('discussion-report-details-label').textContent = 'Keterangan tambahan (opsional)';

    var checked = document.querySelector('#discussion-report-reasons input:checked');
    if (checked) checked.checked = false;

    var submit = document.getElementById('discussion-report-submit');
    submit.disabled = existing.length > 0;
    if (existing.length) {
      document.getElementById('discussion-report-error').textContent = 'Kamu sudah melaporkan konten ini.';
      document.getElementById('discussion-report-error').classList.remove('hidden');
    }

    document.getElementById('discussion-report-modal').classList.remove('hidden');
    var first = document.querySelector('#discussion-report-reasons input');
    if (first) first.focus();
  }

  function closeReport() {
    var modal = document.getElementById('discussion-report-modal');
    if (!modal || modal.classList.contains('hidden')) return;
    modal.classList.add('hidden');
    reportTarget = null;
  }

  function submitReport() {
    if (!reportTarget) { closeReport(); return; }

    var session = getSession();
    if (!session) { closeReport(); return; }

    var picked = document.querySelector('#discussion-report-reasons input:checked');
    var details = document.getElementById('discussion-report-details').value.trim();
    var error = document.getElementById('discussion-report-error');
    error.classList.add('hidden');

    if (!picked) {
      error.textContent = 'Pilih alasan pelaporan terlebih dahulu.';
      error.classList.remove('hidden');
      return;
    }

    if (picked.value === 'other' && !details) {
      error.textContent = 'Keterangan wajib diisi untuk alasan lainnya.';
      error.classList.remove('hidden');
      return;
    }

    var reports = loadReports();
    var duplicate = reports.some(function (report) {
      return report.reporterUserId === session.id &&
        report.targetType === reportTarget.kind &&
        report.targetId === reportTarget.item.id &&
        report.status === 'pending';
    });

    if (duplicate) {
      error.textContent = 'Kamu sudah melaporkan konten ini.';
      error.classList.remove('hidden');
      document.getElementById('discussion-report-submit').disabled = true;
      return;
    }

    var reason = DISCUSSION_REASONS.filter(function (item) { return item.id === picked.value; })[0];

    reports.push({
      id: 'DRPT-' + Date.now().toString(36).toUpperCase(),
      targetType: reportTarget.kind,
      targetId: reportTarget.item.id,
      communityId: reportTarget.item.communityId || activeCommunityId,
      reporterUserId: session.id,
      reasonId: picked.value,
      reasonLabel: reason ? reason.label : picked.value,
      details: details,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });

    if (!saveReports(reports)) {
      error.textContent = 'Laporan belum tersimpan. Coba lagi.';
      error.classList.remove('hidden');
      return;
    }

    closeReport();
    announce('Laporan terkirim dan menunggu peninjauan moderator.');
  }

  /* ---------------- wiring ---------------- */

  function bootDiscussion() {
    document.getElementById('btn-room-back').addEventListener('click', function () {
      if (activeCommunityId) openProfile(activeCommunityId);
    });
    document.getElementById('btn-reply-back').addEventListener('click', closeReplyView);
    document.getElementById('reply-view-form').addEventListener('submit', submitReplyView);
    document.getElementById('reply-view-input').addEventListener('input', function () {
      if (this.value.length > REPLY_LIMIT) this.value = this.value.slice(0, REPLY_LIMIT);
      document.getElementById('reply-view-counter').textContent = this.value.length + '/' + REPLY_LIMIT;
      document.getElementById('reply-view-error').classList.add('hidden');
    });

    document.getElementById('btn-topic-back').addEventListener('click', function () {
      if (activeCommunityId) openRoom(activeCommunityId);
    });
    document.getElementById('btn-new-topic').addEventListener('click', function () {
      if (this.disabled) return;
      openComposer('create');
    });
    document.getElementById('btn-empty-new-topic').addEventListener('click', function () {
      if (this.disabled) return;
      openComposer('create');
    });
    document.getElementById('btn-open-room-inline').addEventListener('click', function () {
      if (profileId) openRoom(profileId);
    });
    document.getElementById('sort-newest').addEventListener('click', function () { topicSort = 'newest'; renderRoom(); });
    document.getElementById('sort-last-activity').addEventListener('click', function () { topicSort = 'last-activity'; renderRoom(); });

    document.getElementById('composer-cancel').addEventListener('click', closeComposer);
    document.getElementById('composer-scrim').addEventListener('click', closeComposer);
    document.getElementById('composer-submit').addEventListener('click', submitComposer);
    document.getElementById('topic-body-input').addEventListener('input', paintComposerCounter);

    document.getElementById('reply-form').addEventListener('submit', submitReply);
    document.getElementById('reply-input').addEventListener('input', function () {
      if (this.value.length > REPLY_LIMIT) this.value = this.value.slice(0, REPLY_LIMIT);
      document.getElementById('reply-counter').textContent = this.value.length + '/' + REPLY_LIMIT;
      document.getElementById('reply-error').classList.add('hidden');
    });

    document.getElementById('delete-cancel').addEventListener('click', closeDelete);
    document.getElementById('delete-scrim').addEventListener('click', closeDelete);
    document.getElementById('delete-confirm').addEventListener('click', confirmDelete);

    document.getElementById('discussion-report-cancel').addEventListener('click', closeReport);
    document.getElementById('discussion-report-scrim').addEventListener('click', closeReport);
    document.getElementById('discussion-report-submit').addEventListener('click', submitReport);
    document.getElementById('discussion-report-reasons').addEventListener('change', function (event) {
      var label = document.getElementById('discussion-report-details-label');
      label.textContent = event.target.value === 'other' ? 'Keterangan tambahan (wajib)' : 'Keterangan tambahan (opsional)';
      document.getElementById('discussion-report-error').classList.add('hidden');
    });
    document.getElementById('discussion-report-details').addEventListener('input', function () {
      if (this.value.length > 500) this.value = this.value.slice(0, 500);
      document.getElementById('discussion-report-counter').textContent = this.value.length + '/500';
    });

    document.addEventListener('click', function (event) {
      var target = event.target;
      if (!target || !target.closest) return;
      if (target.closest('#content-menu')) return;
      closeContentMenu();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      closeContentMenu();
      closeComposer();
      closeDelete();
      closeReport();
    });

    var params = new URLSearchParams(window.location.search);
    var topicParam = params.get('topik');
    var replyParam = params.get('balas');

    if (replyParam) {
      /* Reply deep link: resolve the parent reply first so the right topic opens. */
      var parentReply = loadReplies().filter(function (reply) { return reply.id === replyParam; })[0] || null;
      var parentTopic = parentReply ? topicById(parentReply.topicId) : null;

      if (parentReply && parentTopic && !parentTopic.removed) {
        activeCommunityId = parentTopic.communityId;
        openTopic(parentTopic.id);
        openReplyView(parentReply.id);
      } else {
        activeReplyParentId = null;
        document.getElementById('reply-parent-card').classList.add('hidden');
        document.getElementById('reply-parent-unavailable').classList.remove('hidden');
        document.getElementById('reply-view-form').classList.add('hidden');
        document.getElementById('reply-view-restricted').classList.add('hidden');
        showView('reply');
      }
    } else if (topicParam) {
      var topic = topicById(topicParam);
      if (topic && !topic.removed) {
        activeCommunityId = topic.communityId;
        openTopic(topic.id);
      } else {
        openTopic(topicParam);
      }
    }
    /* `?komunitas=` is handled by the earlier init block and opens the profile. */
  }


  /* ---------- router: cross-page actions become real navigations ---------- */
  /* The source switches views in place. Here each open*() that would leave the current page navigates instead,
     and only paints when the page is booting (its own initial render) or when the target lives on this page. */
  var paintView = showView;

  function communityPath(suffix) {
    var base = String(CORE.directoryUrl || '/komunitas').replace(/\/$/, '');
    var community = activeCommunityId || (typeof profileId !== 'undefined' ? profileId : null) || cfg.communityId;
    if (!community) return null;
    return base + '/' + encodeURIComponent(community) + (suffix || '');
  }

  function go(path) {
    if (CORE.booting || !path) return false;
    window.location.href = path;
    return true;
  }

  /* The source wrote `?topik=<id>` into the reply-count link and intercepted the click. With real pages that href
     would point at the room again, so the href is rewritten to the topic path; the click still goes through
     openTopic(), which navigates to the same place. */
  var sourceBuildTopicRow = buildTopicRow;
  buildTopicRow = function (topic) {
    var row = sourceBuildTopicRow(topic);
    var link = row.querySelector("a[aria-label*='balasan']");
    if (link) link.setAttribute('href', communityPathFor(topic.communityId, '/diskusi/' + encodeURIComponent(topic.id)));
    return row;
  };

  var paintOpenProfile = openProfile;
  openProfile = function (communityId, trigger) {
    var base = String(CORE.directoryUrl || '/komunitas').replace(/\/$/, '');
    if (go(communityId ? base + '/' + encodeURIComponent(communityId) : null)) return;
    paintOpenProfile(communityId, trigger);
  };

  var paintOpenRoom = openRoom;
  openRoom = function (communityId) {
    if (go(communityId ? communityPathFor(communityId, '/diskusi') : null)) return;
    paintOpenRoom(communityId);
  };

  var paintOpenTopic = openTopic;
  openTopic = function (topicId) {
    var community = activeCommunityId || cfg.communityId;
    if (go(community && topicId ? communityPathFor(community, '/diskusi/' + encodeURIComponent(topicId)) : null)) return;
    paintOpenTopic(topicId);
  };

  var paintOpenReplyView = openReplyView;
  openReplyView = function (replyId) {
    var community = activeCommunityId || cfg.communityId;
    var topic = activeTopicId || cfg.topicId;
    if (go(community && topic && replyId ? communityPathFor(community, '/diskusi/' + encodeURIComponent(topic) + '/balas/' + encodeURIComponent(replyId)) : null)) return;
    paintOpenReplyView(replyId);
  };

  function communityPathFor(communityId, suffix) {
    var base = String(CORE.directoryUrl || '/komunitas').replace(/\/$/, '');
    return base + '/' + encodeURIComponent(communityId) + suffix;
  }

  /* The SPA boot wired every control in one file; a single page only owns some of them, so missing ids are
     tolerated while the boot runs and the real lookup is restored immediately afterwards. */
  function tolerateMissing(fn) {
    var real = document.getElementById;
    var stub = document.createElement('div');
    document.getElementById = function (id) { return real.call(document, id) || stub; };
    try { fn(); } finally { document.getElementById = real; }
  }

  tolerateMissing(bootDiscovery);
  tolerateMissing(bootDiscussion);

  /* ---------- page boot ---------- */
  if (CORE.page === 'profile' && cfg.communityId) {
    openProfile(cfg.communityId);
  } else if (CORE.page === 'room' && cfg.communityId) {
    openRoom(cfg.communityId);
  } else if (CORE.page === 'topic' && cfg.topicId) {
    if (cfg.communityId) activeCommunityId = cfg.communityId;
    openTopic(cfg.topicId);
  } else if (CORE.page === 'reply' && cfg.topicId) {
    if (cfg.communityId) activeCommunityId = cfg.communityId;
    openTopic(cfg.topicId);
    if (cfg.replyId) openReplyView(cfg.replyId);
    else {
      activeReplyParentId = null;
      var card = document.getElementById('reply-parent-card');
      var unavailable = document.getElementById('reply-parent-unavailable');
      var form = document.getElementById('reply-view-form');
      var restricted = document.getElementById('reply-view-restricted');
      if (card) card.classList.add('hidden');
      if (unavailable) unavailable.classList.remove('hidden');
      if (form) form.classList.add('hidden');
      if (restricted) restricted.classList.add('hidden');
      showView('reply');
    }
  } else {
    paintView('explore');
  }

  CORE.booting = false;

  /* Re-navigating to the same view (e.g. Back to the topic you are already on) must still repaint, so the
     browse entries that call showView on a hidden target keep working after the boot flag is cleared. */
  /* The prototype markup calls these from inline handlers; ES modules are scoped, so publish them. */
  Object.assign(window, { handleSearchInput: handleSearchInput, resetSearchState: resetSearchState, selectFilter: selectFilter, setSimState: setSimState, toggleDemoSession: toggleDemoSession });

  window.IkapiCommunity = {
    page: CORE.page,
    refresh: function () {
      if (CORE.page === 'topic' && cfg.topicId) openTopic(cfg.topicId);
      else if (CORE.page === 'room' && cfg.communityId) openRoom(cfg.communityId);
      else if (CORE.page === 'profile' && cfg.communityId) openProfile(cfg.communityId);
      else paintView('explore');
    },
  };
}
