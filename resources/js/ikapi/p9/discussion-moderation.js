// discussion-moderation - Portal Administrator
// Ported verbatim from docs/design/prototype-copy/admin/moderasi_diskusi_komunitas_desktop.html (inline <script>, 447 lines).
// Only this wrapper is new: module scope and the app route names.
import { onReady } from '../shared.js';

onReady(function () {
    if (!document.querySelector('#tab-pending')) return;

    (function () {
      'use strict';

      var $ = function (id) { return document.getElementById(id); };

      var REPORT_KEY = 'ikapi_discussion_reports_demo';
      var TOPIC_KEY = 'ikapi_community_topics_demo';
      var REPLY_KEY = 'ikapi_community_replies_demo';
      var COMMUNITY_KEY = 'ikapi_communities_demo';

      var COMMUNITY_NAMES = {
        'community-filologi': 'Komunitas Filologi Pasundan',
        'community-klub-buku': 'Klub Buku Priangan (KBP)',
        'community-sejarah': 'Masyarakat Sejarah & Budaya Sunda'
      };

      var STATUS_LABEL = { pending: 'Menunggu', kept: 'Ditolak laporannya', removed: 'Konten dihapus' };

      var ui = { tab: 'pending', query: '', type: 'all', selectedId: null, lastTrigger: null };

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

      function reports() { return readJSON(REPORT_KEY, []) || []; }
      function topics() { return readJSON(TOPIC_KEY, []) || []; }
      function replies() { return readJSON(REPLY_KEY, []) || []; }
      function saveReports(list) { return writeJSON(REPORT_KEY, list); }
      function saveTopics(list) { return writeJSON(TOPIC_KEY, list); }
      function saveReplies(list) { return writeJSON(REPLY_KEY, list); }

      function communityName(id) {
        var list = readJSON(COMMUNITY_KEY, []);
        if (Array.isArray(list)) {
          var found = list.filter(function (c) { return c.id === id; })[0];
          if (found) return found.name;
        }
        return COMMUNITY_NAMES[id] || 'Komunitas';
      }

      function targetOf(report) {
        if (report.targetType === 'topic') {
          var topic = topics().filter(function (t) { return t.id === report.targetId; })[0];
          return topic || null;
        }
        var reply = replies().filter(function (r) { return r.id === report.targetId; })[0];
        return reply || null;
      }

      function parentTopicOf(reply) {
        if (!reply) return null;
        return topics().filter(function (t) { return t.id === reply.topicId; })[0] || null;
      }

      function reportCountFor(targetType, targetId) {
        return reports().filter(function (r) {
          return r.targetType === targetType && r.targetId === targetId;
        }).length;
      }

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
        var list = reports();
        if (ui.tab === 'pending') list = list.filter(function (r) { return r.status === 'pending'; });
        if (ui.type !== 'all') list = list.filter(function (r) { return r.targetType === ui.type; });

        var q = ui.query.trim().toLowerCase();
        if (q) {
          list = list.filter(function (r) {
            var target = targetOf(r);
            var haystack = [
              r.id, r.reasonLabel, r.details,
              target ? (target.title || target.body || '') : '',
              target ? (target.authorName || '') : '',
              communityName(r.communityId)
            ].join(' ').toLowerCase();
            return haystack.indexOf(q) !== -1;
          });
        }

        return list.sort(function (a, b) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      }

      function render() {
        var all = reports();
        var pending = all.filter(function (r) { return r.status === 'pending'; }).length;
        $('count-pending').textContent = '(' + pending + ')';
        $('count-all').textContent = '(' + all.length + ')';

        var pendingTab = ui.tab === 'pending';
        $('tab-pending').setAttribute('aria-selected', pendingTab ? 'true' : 'false');
        $('tab-pending').className = 'tab-btn focus-ring rounded-lg px-3 py-1.5 text-[12.5px] font-semibold ' +
          (pendingTab ? 'bg-primary text-white' : 'text-muted hover:text-ink');
        $('tab-all').setAttribute('aria-selected', pendingTab ? 'false' : 'true');
        $('tab-all').className = 'tab-btn focus-ring rounded-lg px-3 py-1.5 text-[12.5px] font-semibold ' +
          (pendingTab ? 'text-muted hover:text-ink' : 'bg-primary text-white');

        var list = filtered();
        var tbody = $('report-rows');
        tbody.textContent = '';
        $('table-summary').textContent = list.length + ' laporan ditampilkan';
        $('state-empty').classList.toggle('hidden', list.length > 0);

        list.forEach(function (report) {
          var target = targetOf(report);
          var tr = document.createElement('tr');
          tr.className = 'border-b border-divider transition-colors hover:bg-soft';

          var contentCell = document.createElement('td');
          contentCell.className = 'px-4 py-3';
          var type = document.createElement('span');
          type.className = 'block text-[11px] font-bold uppercase tracking-[0.06em] text-primary';
          type.textContent = report.targetType === 'topic' ? 'Topik' : 'Balasan';
          var preview = document.createElement('p');
          preview.className = 'mt-0.5 line-clamp-2 max-w-[320px] text-[13px] font-medium leading-snug text-ink';
          preview.textContent = target ? (target.title || target.body) : 'Konten tidak ditemukan';
          contentCell.appendChild(type);
          contentCell.appendChild(preview);

          var communityCell = document.createElement('td');
          communityCell.className = 'px-4 py-3 text-[12.5px] text-muted';
          communityCell.textContent = communityName(report.communityId);

          var reasonCell = document.createElement('td');
          reasonCell.className = 'px-4 py-3 text-[12.5px] text-ink';
          reasonCell.textContent = report.reasonLabel;

          var reporterCell = document.createElement('td');
          reporterCell.className = 'num px-4 py-3 text-[12px] text-muted';
          reporterCell.textContent = report.reporterUserId;

          var statusCell = document.createElement('td');
          statusCell.className = 'px-4 py-3';
          var status = document.createElement('span');
          status.className = report.status === 'pending'
            ? 'text-[12px] font-semibold text-muted'
            : report.status === 'removed'
              ? 'text-[12px] font-semibold text-[#B42318]'
              : 'text-[12px] font-semibold text-[#0F7B4F]';
          status.textContent = STATUS_LABEL[report.status] || report.status;
          statusCell.appendChild(status);

          var actionCell = document.createElement('td');
          actionCell.className = 'px-4 py-3 pr-5 text-right';
          var button = document.createElement('button');
          button.type = 'button';
          button.className = 'focus-ring inline-flex h-8 items-center rounded-lg border border-border px-3 text-[12.5px] font-semibold text-ink hover:bg-neutral';
          button.textContent = 'Tinjau';
          button.addEventListener('click', function () { openDrawer(report.id, button); });
          actionCell.appendChild(button);

          tr.appendChild(contentCell);
          tr.appendChild(communityCell);
          tr.appendChild(reasonCell);
          tr.appendChild(reporterCell);
          tr.appendChild(statusCell);
          tr.appendChild(actionCell);
          tbody.appendChild(tr);
        });
      }

      function paintToggleButtons(report) {
        var decided = report.status !== 'pending';
        $('btn-keep').disabled = decided;
        $('btn-remove').disabled = decided;
        $('btn-keep').textContent = report.status === 'kept' ? 'Sudah Dipertahankan' : 'Pertahankan';
        $('btn-remove').textContent = report.status === 'removed' ? 'Konten Sudah Dihapus' : 'Hapus Konten';
      }

      function openDrawer(reportId, trigger) {
        var report = reports().filter(function (r) { return r.id === reportId; })[0];
        if (!report) return;

        ui.selectedId = report.id;
        ui.lastTrigger = trigger || null;

        var target = targetOf(report);
        var topic = report.targetType === 'topic' ? target : parentTopicOf(target);

        $('drawer-id').textContent = report.id;
        $('detail-community').textContent = communityName(report.communityId);
        $('detail-type').textContent = report.targetType === 'topic' ? 'Topik' : 'Balasan';
        $('detail-topic').textContent = topic ? topic.title : 'Topik tidak ditemukan';
        $('detail-author').textContent = target ? target.authorName || '-' : '-';
        $('detail-time').textContent = new Date(report.createdAt).toLocaleString('id-ID', {
          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        $('detail-status').textContent = STATUS_LABEL[report.status] || report.status;
        $('detail-report-count').textContent = reportCountFor(report.targetType, report.targetId) + ' laporan';
        $('detail-content').textContent = target ? (target.body || '') : 'Konten tidak tersedia.';
        $('detail-reason').textContent = report.reasonLabel;
        $('detail-details').textContent = report.details ? report.details : 'Tidak ada keterangan tambahan.';

        var contentNote = $('detail-content-note');
        if (target && target.removed) {
          contentNote.textContent = 'Konten ini sudah tidak ditampilkan kepada anggota komunitas.';
          contentNote.classList.remove('hidden');
        } else {
          contentNote.classList.add('hidden');
        }

        var contextBlock = $('context-block');
        var parentReplyBlock = $('context-parent-reply');
        if (report.targetType === 'reply' && topic) {
          contextBlock.classList.remove('hidden');
          $('context-topic-title').textContent = 'Topik: ' + topic.title;
          $('context-topic-body').textContent = topic.body;

          if (target && target.parentReplyId) {
            var parentReply = replies().filter(function (r) { return r.id === target.parentReplyId; })[0];
            if (parentReply) {
              parentReplyBlock.classList.remove('hidden');
              $('context-parent-author').textContent = 'Membalas ' + parentReply.authorName + ':';
              $('context-parent-body').textContent = parentReply.removed ? 'Komentar telah dihapus' : parentReply.body;
            } else {
              parentReplyBlock.classList.add('hidden');
            }
          } else {
            parentReplyBlock.classList.add('hidden');
          }

          var siblings = replies().filter(function (r) {
            return r.topicId === topic.id && r.id !== report.targetId && !r.removed;
          });
          $('context-other-replies').textContent = siblings.length
            ? siblings.length + ' balasan lain pada topik ini.'
            : 'Belum ada balasan lain pada topik ini.';
        } else {
          contextBlock.classList.add('hidden');
          if (parentReplyBlock) parentReplyBlock.classList.add('hidden');
        }

        if (report.status === 'kept') {
          $('detail-decision').textContent = 'Laporan ditutup. Konten tetap ditampilkan.';
        } else if (report.status === 'removed') {
          $('detail-decision').textContent = 'Konten dihapus dari tampilan publik dan laporan ditutup.';
        } else {
          $('detail-decision').textContent = 'Belum ada keputusan. Laporan tidak otomatis menghapus konten.';
        }

        paintToggleButtons(report);

        $('review-drawer').classList.add('is-open');
        $('review-drawer').setAttribute('aria-hidden', 'false');
        $('drawer-scrim').classList.remove('hidden');
        $('drawer-close').focus();
      }

      function closeDrawer() {
        var drawer = $('review-drawer');
        drawer.classList.remove('is-open');
        drawer.setAttribute('aria-hidden', 'true');
        $('drawer-scrim').classList.add('hidden');
        if (ui.lastTrigger) ui.lastTrigger.focus();
      }

      function keepReport() {
        var list = reports();
        var report = list.filter(function (r) { return r.id === ui.selectedId; })[0];
        if (!report || report.status !== 'pending') return;

        report.status = 'kept';
        report.reviewedAt = new Date().toISOString();

        if (!saveReports(list)) { toast('Keputusan belum tersimpan. Coba lagi.'); return; }

        note('Laporan ' + report.id + ' ditutup. Konten tetap ditampilkan.');
        toast('Laporan dipertahankan.');
        render();
        openDrawer(report.id, ui.lastTrigger);
      }

      function removeReport() {
        var list = reports();
        var report = list.filter(function (r) { return r.id === ui.selectedId; })[0];
        if (!report || report.status !== 'pending') return;

        var target = targetOf(report);
        if (!target) { toast('Konten tidak ditemukan.'); return; }

        /* Only the reported target is affected; the rest of the thread stays. */
        if (report.targetType === 'topic') {
          var topicList = topics();
          var topic = topicList.filter(function (t) { return t.id === report.targetId; })[0];
          if (!topic) { toast('Topik tidak ditemukan.'); return; }
          topic.removed = true;
          topic.removedAt = new Date().toISOString();
          if (!saveTopics(topicList)) { toast('Keputusan belum tersimpan. Coba lagi.'); return; }
        } else {
          var replyList = replies();
          var reply = replyList.filter(function (r) { return r.id === report.targetId; })[0];
          if (!reply) { toast('Balasan tidak ditemukan.'); return; }
          reply.removed = true;
          reply.removedAt = new Date().toISOString();
          if (!saveReplies(replyList)) { toast('Keputusan belum tersimpan. Coba lagi.'); return; }
        }

        /* Every pending report for the same target is closed, records stay. */
        var now = new Date().toISOString();
        list.forEach(function (entry) {
          if (entry.targetType === report.targetType && entry.targetId === report.targetId && entry.status === 'pending') {
            entry.status = 'removed';
            entry.reviewedAt = now;
          }
        });

        if (!saveReports(list)) { toast('Keputusan belum tersimpan. Coba lagi.'); return; }

        note('Konten ' + (report.targetType === 'topic' ? 'topik' : 'balasan') + ' ' + report.targetId + ' dihapus dari tampilan publik.');
        toast('Konten dihapus dan laporan ditutup.');
        render();
        openDrawer(report.id, ui.lastTrigger);
      }

      /* ---------- demo data ---------- */
      function hoursAgo(h) { return new Date(Date.now() - h * 3600 * 1000).toISOString(); }

      function ensureDemoTopics() {
        var topicList = topics();
        if (topicList.length) return topicList;

        topicList = [
          { id: 'TPC-2026-101', communityId: 'community-klub-buku', title: 'Novel apa yang menarik untuk dibahas bersama?',
            body: 'Lagi cari novel dengan karakter dan konflik menarik untuk diskusi klub baca bulan ini.',
            authorId: 'USR-DEMO-NADIA', authorName: 'Nadia', createdAt: hoursAgo(30), updatedAt: null, removed: false },
          { id: 'TPC-2026-102', communityId: 'community-klub-buku', title: 'Bagaimana kalian memilih buku berikutnya?',
            body: 'Penasaran bagaimana anggota klub baca menentukan bacaan untuk diskusi bulanan.',
            authorId: 'USR-DEMO-RAKA', authorName: 'Raka', createdAt: hoursAgo(20), updatedAt: null, removed: false },
          { id: 'TPC-2026-103', communityId: 'community-filologi', title: 'E-book naskah kuno: versi digital atau cetak yang lebih nyaman?',
            body: 'Untuk menelaah naskah panjang, saya lebih nyaman membaca e-book karena bisa memperbesar bagian tulisan.',
            authorId: 'USR-DEMO-DINA', authorName: 'Dina', createdAt: hoursAgo(70), updatedAt: null, removed: false },
          { id: 'TPC-2026-105', communityId: 'community-sejarah', title: 'Buku sejarah lokal apa yang paling berkesan tahun ini?',
            body: 'Bagikan satu judul buku sejarah Priangan yang menurutmu paling berkesan.',
            authorId: 'USR-DEMO-RAKA', authorName: 'Raka', createdAt: hoursAgo(26), updatedAt: null, removed: false }
        ];
        saveTopics(topicList);

        var replyList = replies();
        if (!replyList.length) {
          saveReplies([
            { id: 'RPL-2026-201', topicId: 'TPC-2026-101', communityId: 'community-klub-buku',
              body: 'Menurutku novel dengan banyak sudut pandang akan menarik untuk dibahas bersama.',
              authorId: 'USR-DEMO-DINA', authorName: 'Dina', createdAt: hoursAgo(28), updatedAt: null, removed: false },
            { id: 'RPL-2026-205', topicId: 'TPC-2026-105', communityId: 'community-sejarah',
              body: 'Bumi Parahyangan: Jejak Purba cukup berkesan karena menghubungkan bentang alam dengan cerita warga.',
              authorId: 'USR-DEMO-NADIA', authorName: 'Nadia', createdAt: hoursAgo(20), updatedAt: null, removed: false }
          ]);
        }

        return topicList;
      }

      function seedDemoReports() {
        ensureDemoTopics();

        var list = reports();
        var existingIds = list.map(function (r) { return r.id; });
        var seeds = [
          { id: 'DRPT-DEMO-01', targetType: 'topic', targetId: 'TPC-2026-102', communityId: 'community-klub-buku',
            reporterUserId: 'USR-DEMO-NADIA', reasonId: 'spam', reasonLabel: 'Spam atau promosi',
            details: 'Judulnya terasa seperti promosi berulang, bukan pembahasan buku.', createdAt: hoursAgo(5), status: 'pending' },
          { id: 'DRPT-DEMO-02', targetType: 'reply', targetId: 'RPL-2026-201', communityId: 'community-klub-buku',
            reporterUserId: 'USR-DEMO-RAKA', reasonId: 'abuse', reasonLabel: 'Kata kasar atau pelecehan',
            details: 'Balasan menyebut anggota lain dengan kata yang tidak pantas.', createdAt: hoursAgo(3), status: 'pending' }
        ];

        seeds.forEach(function (seed) {
          if (existingIds.indexOf(seed.id) === -1) list.push(seed);
        });

        if (!saveReports(list)) { toast('Contoh laporan tidak dapat dimuat.'); return; }
        note('Contoh laporan demo dimuat. Data ini hanya tersimpan di browser ini.');
        toast('Contoh laporan dimuat.');
        render();
      }

      function clearDemoReports() {
        if (!saveReports([])) { toast('Laporan demo tidak dapat dikosongkan.'); return; }
        note('Semua laporan demo dikosongkan.');
        toast('Laporan demo dikosongkan.');
        render();
      }

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
        if (item.getAttribute('data-demo') === 'seed') seedDemoReports();
        else clearDemoReports();
      });

      $('tab-pending').addEventListener('click', function () { ui.tab = 'pending'; render(); });
      $('tab-all').addEventListener('click', function () { ui.tab = 'all'; render(); });
      $('report-search').addEventListener('input', function (e) { ui.query = e.target.value; render(); });
      $('type-filter').addEventListener('change', function (e) { ui.type = e.target.value; render(); });
      $('btn-keep').addEventListener('click', keepReport);
      $('btn-remove').addEventListener('click', removeReport);
      $('drawer-close').addEventListener('click', closeDrawer);
      $('drawer-scrim').addEventListener('click', closeDrawer);

      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (!$('demo-menu').classList.contains('hidden')) { closeDemo(); return; }
        closeDrawer();
      });
      document.addEventListener('click', function (e) {
        if (!demoMenu.contains(e.target) && !demoToggle.contains(e.target)) closeDemo();
      });

      render();
    })();});
