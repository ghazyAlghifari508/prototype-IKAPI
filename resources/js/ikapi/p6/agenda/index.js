// agenda_berita_literasi_desktop
// Ported verbatim from docs/design/prototype-copy/user/agenda_berita_literasi_desktop.html (inline <script>, 448 lines).
// Only this wrapper is new: the module runs once the DOM is ready and only on its own page.
import { onReady } from '../../shared.js';

onReady(function () {
    if (!document.querySelector('#btn-state-nov18')) return;

    // Events Dataset for November 2026
        const eventsData = window.IKAPI_P6_DATA.eventsData;;

        // Articles Dataset for Modal Reader Preview
        const articlesData = window.IKAPI_P6_DATA.articlesData;;

        let currentYear = 2026;
        let currentMonth = 10; // 0-indexed: 10 = November
        let selectedDateStr = null; // null = show all events in month

        const monthNames = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];

        let toastTimer = null;
        function showToast(message, iconName = 'check_circle') {
          const toast = document.getElementById('toastNotification');
          const msg = document.getElementById('toastMessage');
          const icon = document.getElementById('toastIcon');
          if (!toast || !msg) return;

          msg.textContent = message;
          if (icon) icon.textContent = iconName;
          toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
          toast.classList.add('translate-y-0', 'opacity-100');

          if (toastTimer) clearTimeout(toastTimer);
          toastTimer = setTimeout(() => {
            toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
            toast.classList.remove('translate-y-0', 'opacity-100');
          }, 2800);
        }

        // Render Calendar Days Grid dynamically
        function renderCalendar() {
          const label = document.getElementById('calendar-month-label');
          if (label) {
            label.textContent = `${monthNames[currentMonth]} ${currentYear}`;
          }

          const grid = document.getElementById('calendar-days-grid');
          if (!grid) return;
          grid.innerHTML = '';

          const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
          const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

          // Empty spaces for padding days before the 1st
          for (let i = 0; i < firstDayIndex; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'h-9';
            grid.appendChild(emptyDiv);
          }

          for (let day = 1; day <= totalDays; day++) {
            const dayStr = String(day).padStart(2, '0');
            const monthStr = String(currentMonth + 1).padStart(2, '0');
            const fullDateStr = `${currentYear}-${monthStr}-${dayStr}`;

            const hasEvent = eventsData.some(ev => ev.dates.includes(fullDateStr));
            const isSelected = selectedDateStr === fullDateStr;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.id = `date-btn-${day}`;
            btn.className = 'day-cell h-9 rounded-xl flex flex-col items-center justify-center relative font-medium transition-colors text-[13px] ';

            if (isSelected) {
              btn.className += 'bg-primary text-white font-bold shadow-xs';
            } else if (hasEvent) {
              btn.className += 'hover:bg-surface-soft text-primary font-bold';
            } else {
              btn.className += 'hover:bg-surface-neutral text-ink-body';
            }

            btn.innerHTML = `<span>${day}</span>${hasEvent && !isSelected ? '<span class="w-1.5 h-1.5 rounded-full bg-primary mt-[-2px]"></span>' : ''}`;
            btn.addEventListener('click', () => selectCalendarDate(fullDateStr, day));

            grid.appendChild(btn);
          }
        }

        function prevCalendarMonth() {
          if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
          } else {
            currentMonth--;
          }
          selectedDateStr = null;
          renderCalendar();
          renderFilteredEvents();
        }

        function nextCalendarMonth() {
          if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
          } else {
            currentMonth++;
          }
          selectedDateStr = null;
          renderCalendar();
          renderFilteredEvents();
        }

        function selectCalendarDate(fullDateStr, dayNumber) {
          selectedDateStr = fullDateStr;
          renderCalendar();
          renderFilteredEvents();
        }

        function resetCalendarSelection() {
          selectedDateStr = null;
          renderCalendar();
          renderFilteredEvents();
          showToast('Menampilkan seluruh agenda bulan ' + monthNames[currentMonth], 'calendar_today');
        }

        // Render Event List based on active calendar selection
        function renderFilteredEvents() {
          const eventsContainer = document.getElementById('events-container');
          const emptyState = document.getElementById('events-empty-state');
          const emptyDesc = document.getElementById('events-empty-desc');
          const headline = document.getElementById('event-list-headline');
          const badge = document.getElementById('event-count-badge');

          if (!eventsContainer || !emptyState) return;

          const monthStr = String(currentMonth + 1).padStart(2, '0');
          let matchingEvents = [];

          if (selectedDateStr) {
            matchingEvents = eventsData.filter(ev => ev.dates.includes(selectedDateStr));
            const day = parseInt(selectedDateStr.split('-')[2], 10);
            if (headline) headline.textContent = `Agenda ${day} ${monthNames[currentMonth]} ${currentYear}`;
            if (emptyDesc) emptyDesc.textContent = `Tidak ada kegiatan pada tanggal ${day} ${monthNames[currentMonth]} ${currentYear}.`;
          } else {
            matchingEvents = eventsData.filter(ev => ev.dates.some(d => d.startsWith(`${currentYear}-${monthStr}`)));
            if (headline) headline.textContent = `Agenda ${monthNames[currentMonth]} ${currentYear}`;
            if (emptyDesc) emptyDesc.textContent = `Tidak ada kegiatan pada bulan ${monthNames[currentMonth]} ${currentYear}.`;
          }

          if (badge) {
            badge.textContent = `${matchingEvents.length} Kegiatan`;
          }

          if (matchingEvents.length === 0) {
            eventsContainer.classList.add('hidden');
            emptyState.classList.remove('hidden');
            emptyState.classList.add('flex');
          } else {
            emptyState.classList.add('hidden');
            emptyState.classList.remove('flex');
            eventsContainer.classList.remove('hidden');

            const cards = eventsContainer.querySelectorAll('.event-card');
            cards.forEach(card => {
              const evId = card.getAttribute('data-event-id');
              const isMatch = matchingEvents.some(ev => ev.id === evId);
              if (isMatch) {
                card.classList.remove('hidden');
              } else {
                card.classList.add('hidden');
              }
            });
          }
        }

        // Real .ics iCalendar file generator & downloader
        function downloadIcsFile(title, startISO, endISO, location, description) {
          // Escape iCalendar special characters
          const cleanSummary = title.replace(/([,;])/g, '\\$1');
          const cleanLocation = location.replace(/([,;])/g, '\\$1');
          const cleanDesc = description.replace(/([,;])/g, '\\$1');

          const icsData = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//IKAPI Jawa Barat//Agenda Literasi//ID',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            `SUMMARY:${cleanSummary}`,
            `DESCRIPTION:${cleanDesc}`,
            `LOCATION:${cleanLocation}`,
            `DTSTART:${startISO}`,
            `DTEND:${endISO}`,
            'STATUS:CONFIRMED',
            'END:VEVENT',
            'END:VCALENDAR'
          ].join('\r\n');

          const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          showToast(`Berkas kalender "${title}" berhasil diunduh`, 'event_available');
        }

        // Share Article with truth-preserving clipboard copy
        function shareArticle(title) {
          const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const articleUrl = `${window.location.origin}${window.location.pathname}#artikel-${slug}`;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(articleUrl).then(() => {
              showToast(`Tautan "${title}" disalin ke papan klip`, 'share');
            }).catch(() => {
              showToast(`Tautan "${title}" siap dibagikan`, 'share');
            });
          } else {
            showToast(`Tautan "${title}" siap dibagikan`, 'share');
          }
        }

        // Featured Event Modal Handlers
        function openFeaturedEventModal() {
          const modal = document.getElementById('modal-featured-detail');
          if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.style.overflow = 'hidden';
          }
        }

        function closeFeaturedEventModal() {
          const modal = document.getElementById('modal-featured-detail');
          if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = '';
          }
        }

        // Article Preview Reader Modal Handlers
        function openArticleModal(articleId) {
          const article = articlesData[articleId];
          if (!article) return;

          const modal = document.getElementById('modal-article-preview');
          const titleEl = document.getElementById('article-modal-title');
          const catEl = document.getElementById('article-modal-category');
          const metaEl = document.getElementById('article-modal-meta');
          const imgEl = document.getElementById('article-modal-image');
          const bodyEl = document.getElementById('article-modal-body');
          const shareBtn = document.getElementById('article-modal-share-btn');

          if (titleEl) titleEl.textContent = article.title;
          if (catEl) catEl.textContent = article.category;
          if (metaEl) metaEl.textContent = `${article.date} • ${article.author}`;
          if (imgEl) {
            imgEl.src = article.image;
            imgEl.alt = article.title;
          }
          if (bodyEl) {
            bodyEl.innerHTML = article.paragraphs.map(p => `<p class="leading-relaxed text-ink-body">${p}</p>`).join('');
          }
          if (shareBtn) {
            shareBtn.onclick = () => shareArticle(article.title);
          }

          if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.style.overflow = 'hidden';
          }
        }

        function closeArticleModal() {
          const modal = document.getElementById('modal-article-preview');
          if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = '';
          }
        }

        // Close Modals on Backdrop Click or Escape Key
        window.addEventListener('click', (e) => {
          const featModal = document.getElementById('modal-featured-detail');
          const artModal = document.getElementById('modal-article-preview');
          if (featModal && e.target === featModal) closeFeaturedEventModal();
          if (artModal && e.target === artModal) closeArticleModal();
        });

        window.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            closeFeaturedEventModal();
            closeArticleModal();
          }
        });

        // Reviewer Simulation State Switches (Preserved in Same HTML)
        function setViewState(state) {
          const btnNormal = document.getElementById('btn-state-normal');
          const btnNov18 = document.getElementById('btn-state-nov18');
          const btnEmptyEvents = document.getElementById('btn-state-empty-events');
          const btnEmptyNews = document.getElementById('btn-state-empty-news');

          const neutralStyle = "px-3 py-1 rounded-lg bg-surface-neutral text-ink-body hover:bg-surface-soft hover:text-primary font-medium transition-all border border-border-subtle";
          const activeStyle = "px-3 py-1 rounded-lg bg-primary text-white font-medium transition-all shadow-xs";

          [btnNormal, btnNov18, btnEmptyEvents, btnEmptyNews].forEach(btn => {
            if (btn) btn.className = neutralStyle;
          });

          const eventsContainer = document.getElementById('events-container');
          const eventsEmptyState = document.getElementById('events-empty-state');
          const articlesContainer = document.getElementById('articles-container');
          const articlesEmptyState = document.getElementById('articles-empty-state');

          // Reset DOM containers
          if (eventsContainer) eventsContainer.classList.remove('hidden');
          if (eventsEmptyState) {
            eventsEmptyState.classList.add('hidden');
            eventsEmptyState.classList.remove('flex');
          }
          if (articlesContainer) articlesContainer.classList.remove('hidden');
          if (articlesEmptyState) {
            articlesEmptyState.classList.add('hidden');
            articlesEmptyState.classList.remove('flex');
          }

          if (state === 'normal') {
            if (btnNormal) btnNormal.className = activeStyle;
            currentYear = 2026;
            currentMonth = 10;
            selectedDateStr = null;
            renderCalendar();
            renderFilteredEvents();
            showToast('Tampilan normal dipulihkan', 'refresh');
          } else if (state === 'nov18') {
            if (btnNov18) btnNov18.className = activeStyle;
            currentYear = 2026;
            currentMonth = 10;
            selectedDateStr = '2026-11-18';
            renderCalendar();
            renderFilteredEvents();
            showToast('Tanggal 18 November 2026 dipilih', 'event');
          } else if (state === 'empty-events') {
            if (btnEmptyEvents) btnEmptyEvents.className = activeStyle;
            if (eventsContainer) eventsContainer.classList.add('hidden');
            if (eventsEmptyState) {
              eventsEmptyState.classList.remove('hidden');
              eventsEmptyState.classList.add('flex');
            }
            const headline = document.getElementById('event-list-headline');
            const badge = document.getElementById('event-count-badge');
            if (headline) headline.textContent = "Agenda Terpilih";
            if (badge) badge.textContent = "0 Kegiatan";
            showToast('Simulasi jadwal kegiatan kosong aktif', 'visibility');
          } else if (state === 'empty-news') {
            if (btnEmptyNews) btnEmptyNews.className = activeStyle;
            if (articlesContainer) articlesContainer.classList.add('hidden');
            if (articlesEmptyState) {
              articlesEmptyState.classList.remove('hidden');
              articlesEmptyState.classList.add('flex');
            }
            showToast('Simulasi artikel dan berita kosong aktif', 'visibility');
          }
        }

        document.addEventListener('DOMContentLoaded', () => {
          renderCalendar();
          renderFilteredEvents();
        });

    // Prototype markup calls these from inline handlers; ES modules are scoped, so publish them.
    Object.assign(window, { closeArticleModal, closeFeaturedEventModal, downloadIcsFile, nextCalendarMonth, openArticleModal, openFeaturedEventModal, prevCalendarMonth, resetCalendarSelection, setViewState, shareArticle });
});
