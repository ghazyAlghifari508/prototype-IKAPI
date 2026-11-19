// status_pendaftaran_penerbit_desktop
// Ported verbatim from docs/design/prototype-copy/user/status_pendaftaran_penerbit_desktop.html (inline <script>, 283 lines).
// Only this wrapper is new: the module runs once the DOM is ready and only on its own page.
import { onReady } from '../../shared.js';

onReady(function () {
    if (!document.querySelector('#status-line')) return;

    /* Publisher application status page.
           Prototype boundary: the application record and the demo preview both live in
           localStorage for this browser only. Nothing is sent to the administrator and
           no real account status is read or written here. */
        (function () {
          'use strict';

          var APPLICATION_KEY = 'ikapi_publisher_application_demo';
          var PREVIEW_KEY = 'ikapi_publisher_status_preview';

          var $ = function (id) { return document.getElementById(id); };
          var params = new URLSearchParams(window.location.search);

          /* Dashboard access guard sends visitors back with ?akses=blokir */
          var blocked = params.get('akses') === 'blokir';
          var hasSession = params.get('sesi') === 'aktif';

          var STATES = {
            pending: {
              label: 'Menunggu persetujuan',
              icon: 'hourglass_top',
              heading: 'Pendaftaran penerbit sedang ditinjau',
              description: 'Data pendaftaranmu sudah diterima. Tim IKAPI sedang memeriksa pengajuan sebelum akun penerbit dapat digunakan.',
              detailStatus: 'Dalam peninjauan',
              next: 'Admin IKAPI akan memeriksa data pendaftaranmu. Setelah disetujui, kamu dapat mengakses Dashboard Penerbit.',
              notice: {
                heading: 'Dashboard belum dapat diakses',
                text: 'Akses tersedia setelah pendaftaran disetujui.'
              }
            },
            approved: {
              label: 'Disetujui',
              icon: 'check_circle',
              heading: 'Pendaftaran penerbit disetujui',
              description: 'Akun penerbitmu sudah disetujui. Kamu sekarang dapat mengakses Dashboard Penerbit.',
              detailStatus: 'Disetujui',
              next: 'Gunakan akun penerbitmu untuk masuk ke Dashboard Penerbit dan mulai mengelola katalog.',
              notice: null
            },
            rejected: {
              label: 'Tidak disetujui',
              icon: 'cancel',
              heading: 'Pendaftaran penerbit belum dapat disetujui',
              description: 'Pengajuan pendaftaranmu belum disetujui oleh tim IKAPI.',
              detailStatus: 'Tidak disetujui',
              next: 'Kamu masih dapat menghubungi tim IKAPI atau mengajukan pendaftaran baru dengan data yang sudah diperbaiki.',
              notice: {
                heading: 'Dashboard belum dapat diakses',
                text: 'Akses tersedia setelah pendaftaran disetujui.'
              }
            }
          };

          var CHIPS = [
            { id: 'pending', label: 'Menunggu persetujuan' },
            { id: 'approved', label: 'Disetujui' },
            { id: 'rejected', label: 'Ditolak (dengan alasan)' },
            { id: 'rejected-empty', label: 'Ditolak (tanpa alasan)' }
          ];

          function readStore(key) {
            try {
              var raw = window.localStorage.getItem(key);
              if (!raw) return null;
              var parsed = JSON.parse(raw);
              return parsed && typeof parsed === 'object' ? parsed : null;
            } catch (e) { return null; }
          }

          function writeStore(key, value) {
            try { window.localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
          }

          function formatDate(iso) {
            var date = new Date(iso);
            if (isNaN(date.getTime())) return '';
            var day = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            var time = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
            return day + ', ' + time + ' WIB';
          }

          function toast(message) {
            $('toast-text').textContent = message;
            $('toast').classList.remove('hidden');
            window.clearTimeout(toast.timer);
            toast.timer = window.setTimeout(function () { $('toast').classList.add('hidden'); }, 2600);
          }

          /* Rejection reason carried by the administrator record in the demo dataset. */
          var DEFAULT_DEMO_REASON = 'Nomor anggota IKAPI belum sesuai dengan data keanggotaan.';

          var application = readStore(APPLICATION_KEY);
          var preview = readStore(PREVIEW_KEY);
          var currentView = '';

          /* The preview only decides what is rendered; it never rewrites the record. */
          function resolveView() {
            if (preview && preview.state && STATES[preview.state.replace('-empty', '')]) return preview.state;
            if (application && application.status && STATES[application.status]) return application.status;
            return 'pending';
          }

          function buildChips() {
            var wrap = $('demo-chips');
            CHIPS.forEach(function (chip) {
              var button = document.createElement('button');
              button.type = 'button';
              button.className = 'demo-chip focus-ring rounded-lg border border-border-subtle bg-white px-2.5 py-1 font-semibold text-ink-body';
              button.textContent = chip.label;
              button.setAttribute('data-demo-state', chip.id);
              wrap.appendChild(button);
            });

            var sessionChip = document.createElement('button');
            sessionChip.type = 'button';
            sessionChip.className = 'demo-chip focus-ring rounded-lg border border-border-subtle bg-white px-2.5 py-1 font-semibold text-ink-body';
            sessionChip.textContent = 'Sesi login aktif';
            sessionChip.setAttribute('data-demo-session', '1');
            sessionChip.setAttribute('aria-pressed', hasSession ? 'true' : 'false');
            wrap.appendChild(sessionChip);

            wrap.addEventListener('click', function (event) {
              var target = event.target.closest ? event.target.closest('.demo-chip') : null;
              if (!target) return;

              if (target.hasAttribute('data-demo-session')) {
                hasSession = !hasSession;
                target.setAttribute('aria-pressed', hasSession ? 'true' : 'false');
                paintChips();
                render();
                return;
              }

              var state = target.getAttribute('data-demo-state');
              var parts = state.split('-');
              preview = {
                state: parts[0],
                withReason: state === 'rejected' ? true : state === 'rejected-empty' ? false : null
              };
              writeStore(PREVIEW_KEY, preview);
              render();
            });
          }

          function paintChips() {
            document.querySelectorAll('.demo-chip').forEach(function (chip) {
              var state = chip.getAttribute('data-demo-state');
              var session = chip.hasAttribute('data-demo-session');
              var on = session
                ? hasSession
                : (preview && preview.state === state) ||
                  (!preview && application && application.status === state);
              chip.classList.toggle('bg-surface-soft', !!on);
              chip.classList.toggle('text-primary', !!on);
            });
          }

          function actionClass(kind) {
            return kind === 'primary'
              ? 'focus-ring inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-[14px] font-bold text-white transition-colors hover:bg-primary-hover'
              : 'focus-ring inline-flex h-11 items-center justify-center rounded-xl border border-border-subtle bg-white px-5 text-[14px] font-semibold text-ink-body transition-colors hover:bg-surface-neutral';
          }

          function link(label, href, kind) {
            var a = document.createElement('a');
            a.textContent = label;
            a.href = href;
            a.className = actionClass(kind);
            return a;
          }

          function actionButton(label, onClick) {
            var button = document.createElement('button');
            button.type = 'button';
            button.textContent = label;
            button.className = actionClass('primary');
            button.addEventListener('click', onClick);
            return button;
          }

          function paintActions(key) {
            var wrap = $('action-block');
            wrap.innerHTML = '';

            if (key === 'approved') {
              wrap.appendChild(link('Masuk ke Dashboard', '/status-pendaftaran-penerbit?sesi=aktif', 'primary'));
            } else if (key === 'pending') {
              if (hasSession) {
                wrap.appendChild(actionButton('Periksa Status', checkStatus));
              } else {
                wrap.appendChild(link('Ke Halaman Masuk', '/masuk?role=publisher', 'primary'));
              }
            } else {
              /* Rejected: only link to channels that really exist in this prototype. */
              wrap.appendChild(link('Hubungi Admin', '/akun/bantuan/chatbot', 'primary'));
              wrap.appendChild(link('Ajukan Pendaftaran Ulang', '/daftar?role=publisher'));
            }

            if (hasSession) {
              wrap.appendChild(link('Keluar dari Akun', '/masuk?role=publisher'));
            }
          }

          /* Reads the stored application again. Reports exactly what changed. */
          function checkStatus() {
            var latest = readStore(APPLICATION_KEY);
            var before = currentView;
            application = latest;
            preview = null;
            try { window.localStorage.removeItem(PREVIEW_KEY); } catch (e) {}
            render();

            if (currentView === before) {
              toast('Status belum berubah. Pengajuan masih dalam peninjauan.');
            } else {
              toast('Status pengajuan diperbarui dari data demo lokal.');
            }
          }

          function render() {
            var key = resolveView();
            currentView = key;
            var state = STATES[key];

            $('status-label').textContent = state.label;
            $('status-icon').textContent = state.icon;
            $('status-heading').textContent = state.heading;
            $('status-description').textContent = state.description;
            $('next-text').textContent = state.next;
            $('detail-status').textContent = state.detailStatus;

            if (application && (application.name || application.submittedAt)) {
              $('detail-rows').classList.remove('hidden');
              $('detail-empty').classList.add('hidden');
              $('detail-name').textContent = application.name || 'Tidak dicatat';
              $('detail-date').textContent = application.submittedAt ? formatDate(application.submittedAt) : 'Tidak dicatat';
            } else {
              $('detail-rows').classList.add('hidden');
              $('detail-empty').classList.remove('hidden');
            }

            var reasonBlock = $('reason-block');
            var showReason = key === 'rejected';
            var reason = '';
            if (showReason) {
              var isPreview = preview && preview.state === 'rejected';
              if (isPreview) {
                reason = preview.withReason ? (application && application.reason ? application.reason : DEFAULT_DEMO_REASON) : '';
              } else {
                reason = application && application.reason ? application.reason : '';
              }
            }
            if (showReason) {
              reasonBlock.classList.remove('hidden');
              $('reason-text').textContent = reason || 'Belum ada alasan penolakan yang dicatat pada prototype ini. Hubungi Admin IKAPI untuk informasi lanjutan.';
            } else {
              reasonBlock.classList.add('hidden');
              $('reason-text').textContent = '';
            }

            var notice = $('notice-block');
            if (state.notice) {
              notice.classList.remove('hidden');
              $('notice-heading').textContent = state.notice.heading;
              $('notice-text').textContent = state.notice.text;
            } else {
              notice.classList.add('hidden');
            }

            paintActions(key);
            paintChips();
          }

          if (blocked) {
            var banner = $('access-blocked');
            banner.textContent = 'Dashboard Penerbit belum dapat dibuka karena pengajuanmu belum disetujui.';
            banner.classList.remove('hidden');
          }

          buildChips();
          render();
        })();

    // Prototype markup calls these from inline handlers; ES modules are scoped, so publish them.
});
