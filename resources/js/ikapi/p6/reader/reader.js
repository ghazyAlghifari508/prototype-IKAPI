// web_reader_desktop
// Ported verbatim from docs/design/prototype-copy/user/web_reader_desktop.html (inline <script>, 468 lines).
// Only this wrapper is new: the module runs once the DOM is ready and only on its own page.
import { onReady } from '../../shared.js';

onReady(function () {
    if (!document.querySelector('#book-page')) return;

    // Storage keys
        const SETTINGS_KEY = 'ikapi_reader_settings';
        const BOOKMARKS_KEY = 'ikapi_reader_bookmarks';
        const POSITION_KEY = 'ikapi_reader_pos_laskar_aksara';

        // Canonical total book pages from Detail Buku: 268 halaman
        const TOTAL_BOOK_PAGES = 268;

        // Four real prototype pages for Chapter 3
        const bookPagesData = window.IKAPI_P6_DATA.bookPagesData;;

        // State Variables
        let currentPageIndex = 0; // index in bookPagesData (0 = page 41)
        let currentTheme = 'light';
        let currentFontFamily = 'serif';
        let currentFontSize = '18px';
        let currentLineHeight = '1.8';

        const bookmarksData = window.IKAPI_P6_DATA.bookmarksData;;

        let toastTimer = null;
        function showToast(message, icon = 'info') {
          const toast = document.getElementById('reader-toast');
          const msg = document.getElementById('toast-message');
          const ic = document.getElementById('toast-icon');
          if (!toast || !msg) return;

          msg.textContent = message;
          if (ic) ic.textContent = icon;
          toast.classList.remove('-translate-y-6', 'opacity-0', 'pointer-events-none');
          toast.classList.add('translate-y-0', 'opacity-100');

          if (toastTimer) clearTimeout(toastTimer);
          toastTimer = setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('-translate-y-6', 'opacity-0', 'pointer-events-none');
          }, 2500);
        }

        // Render Current Reading Page
        function renderCurrentPage() {
          const data = bookPagesData[currentPageIndex];
          if (!data) return;

          const prose = document.getElementById('prose-content');
          if (prose) {
            prose.innerHTML = data.contentHtml;
            prose.style.fontSize = currentFontSize;
            prose.style.lineHeight = currentLineHeight;
          }

          // Update Running Chapter Label
          document.getElementById('running-chapter-label').textContent = data.chapter;
          document.getElementById('footer-chapter-name').textContent = `${data.chapter}: ${data.chapterTitle}`;
          document.getElementById('footer-page-number').textContent = `Hal ${data.pageNumber}`;

          // Calculate progress relative to total book pages (268 pages)
          const bookPercent = Math.round((data.pageNumber / TOTAL_BOOK_PAGES) * 100);
          const totalInChapter = bookPagesData.length;
          const curInChapter = currentPageIndex + 1;

          document.getElementById('page-indicator').textContent = `Halaman ${data.pageNumber} (${curInChapter} dari ${totalInChapter} di Bab 3)`;
          document.getElementById('progress-percent').textContent = `(${bookPercent}% dari buku)`;

          // Progress bar within active chapter
          const chapterPercent = Math.round((curInChapter / totalInChapter) * 100);
          document.getElementById('progress-bar-fill').style.width = `${chapterPercent}%`;

          document.getElementById('progress-min-label').textContent = String(bookPagesData[0].pageNumber);
          document.getElementById('progress-max-label').textContent = String(bookPagesData[totalInChapter - 1].pageNumber);

          document.getElementById('bm-current-page').textContent = String(data.pageNumber);
          document.getElementById('bm-current-chapter').textContent = `${data.chapter}: ${data.chapterTitle}`;

          // Disabled button states
          document.getElementById('btn-prev-page').disabled = currentPageIndex === 0;
          document.getElementById('btn-next-page').disabled = currentPageIndex === totalInChapter - 1;

          // Save position to localStorage
          try {
            localStorage.setItem(POSITION_KEY, String(currentPageIndex));
          } catch (e) {}

          window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function changePage(delta) {
          const nextIndex = currentPageIndex + delta;
          if (nextIndex >= 0 && nextIndex < bookPagesData.length) {
            currentPageIndex = nextIndex;
            renderCurrentPage();
          }
        }

        function goToPageNumber(pageNo) {
          const idx = bookPagesData.findIndex(p => p.pageNumber === pageNo);
          if (idx !== -1) {
            currentPageIndex = idx;
            renderCurrentPage();
            closeAllDrawers();
          }
        }

        function navigateToChapter(startPage) {
          goToPageNumber(startPage);
        }

        function handleScrub(e) {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const ratio = Math.max(0, Math.min(1, clickX / rect.width));
          const targetIndex = Math.min(bookPagesData.length - 1, Math.floor(ratio * bookPagesData.length));
          currentPageIndex = targetIndex;
          renderCurrentPage();
        }

        // THEME HANDLING
        function setReaderTheme(theme) {
          currentTheme = theme;
          document.documentElement.setAttribute('data-reader-theme', theme);

          // Button states
          ['light', 'sepia', 'dark'].forEach(t => {
            const btn = document.getElementById('theme-btn-' + t);
            if (!btn) return;
            if (t === theme) {
              btn.classList.add('border-primary', 'shadow-xs');
              btn.classList.remove('border-transparent');
            } else {
              btn.classList.remove('border-primary', 'shadow-xs');
              btn.classList.add('border-transparent');
            }
          });
          saveSettings();
        }

        function setFontFamily(type) {
          currentFontFamily = type;
          const prose = document.getElementById('prose-content');
          const btnSerif = document.getElementById('font-family-serif');
          const btnSans = document.getElementById('font-family-sans');

          if (type === 'serif') {
            prose.classList.add('font-reading-serif');
            prose.classList.remove('font-reading-sans');
            btnSerif.className = "py-2.5 px-3 rounded-xl border border-primary bg-primary/10 text-primary font-bold text-[13px] font-reading-serif cursor-pointer";
            btnSans.className = "py-2.5 px-3 rounded-xl border theme-border text-ink-muted hover:theme-text font-semibold text-[13px] font-sans cursor-pointer";
          } else {
            prose.classList.remove('font-reading-serif');
            prose.classList.add('font-reading-sans');
            btnSans.className = "py-2.5 px-3 rounded-xl border border-primary bg-primary/10 text-primary font-bold text-[13px] font-sans cursor-pointer";
            btnSerif.className = "py-2.5 px-3 rounded-xl border theme-border text-ink-muted hover:theme-text font-semibold text-[13px] font-reading-serif cursor-pointer";
          }
          saveSettings();
        }

        function setTextSize(size) {
          currentFontSize = size;
          const prose = document.getElementById('prose-content');
          if (prose) prose.style.fontSize = size;

          ['btn-font-sm', 'btn-font-md', 'btn-font-lg'].forEach(id => {
            document.getElementById(id).className = "py-2 px-2.5 rounded-xl border theme-border text-[12px] font-medium theme-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer";
          });

          if (size === '16px') document.getElementById('btn-font-sm').className = "py-2 px-2.5 rounded-xl border border-primary bg-primary text-white text-[12px] font-bold shadow-xs cursor-pointer";
          if (size === '18px') document.getElementById('btn-font-md').className = "py-2 px-2.5 rounded-xl border border-primary bg-primary text-white text-[12px] font-bold shadow-xs cursor-pointer";
          if (size === '22px') document.getElementById('btn-font-lg').className = "py-2 px-2.5 rounded-xl border border-primary bg-primary text-white text-[12px] font-bold shadow-xs cursor-pointer";
          saveSettings();
        }

        function setLineHeight(val) {
          currentLineHeight = val;
          const prose = document.getElementById('prose-content');
          if (prose) prose.style.lineHeight = val;

          ['btn-line-normal', 'btn-line-relaxed', 'btn-line-loose'].forEach(id => {
            document.getElementById(id).className = "py-2 px-2 rounded-xl border theme-border text-[12px] font-medium theme-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer";
          });

          if (val === '1.6') document.getElementById('btn-line-normal').className = "py-2 px-2 rounded-xl border border-primary bg-primary text-white text-[12px] font-bold shadow-xs cursor-pointer";
          if (val === '1.8') document.getElementById('btn-line-relaxed').className = "py-2 px-2 rounded-xl border border-primary bg-primary text-white text-[12px] font-bold shadow-xs cursor-pointer";
          if (val === '2.0') document.getElementById('btn-line-loose').className = "py-2 px-2 rounded-xl border border-primary bg-primary text-white text-[12px] font-bold shadow-xs cursor-pointer";
          saveSettings();
        }

        function saveSettings() {
          try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify({
              theme: currentTheme,
              fontFamily: currentFontFamily,
              fontSize: currentFontSize,
              lineHeight: currentLineHeight
            }));
          } catch (e) {}
        }

        function loadSavedSettings() {
          try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            if (raw) {
              const s = JSON.parse(raw);
              if (s.theme) setReaderTheme(s.theme);
              if (s.fontFamily) setFontFamily(s.fontFamily);
              if (s.fontSize) setTextSize(s.fontSize);
              if (s.lineHeight) setLineHeight(s.lineHeight);
            }
            const savedPos = localStorage.getItem(POSITION_KEY);
            if (savedPos !== null) {
              const p = parseInt(savedPos, 10);
              if (p >= 0 && p < bookPagesData.length) currentPageIndex = p;
            }
          } catch (e) {}
        }

        // BOOKMARKS ENGINE
        function renderBookmarksList() {
          const container = document.getElementById('bookmarks-list-container');
          const countHeader = document.getElementById('bm-count-heading');
          if (!container) return;

          countHeader.textContent = `${bookmarksData.length} penanda tersimpan`;

          if (bookmarksData.length === 0) {
            container.innerHTML = `
              <div class="py-8 text-center theme-muted text-[13px]">
                Belum ada penanda buku yang tersimpan.
              </div>
            `;
            return;
          }

          container.innerHTML = bookmarksData.map(bm => `
            <div class="p-3.5 rounded-2xl border theme-border hover:border-primary transition-all flex justify-between items-start gap-2 theme-paper">
              <button type="button" class="text-left flex-1 min-w-0 cursor-pointer" onclick="goToPageNumber(${bm.page})">
                <span class="text-[12px] font-bold text-primary block">Halaman ${bm.page}</span>
                <p class="text-[13px] font-bold theme-text truncate mt-0.5">${bm.chapter}</p>
                <p class="text-[11px] theme-muted mt-1">${bm.time}</p>
              </button>
              <button type="button" aria-label="Hapus Penanda" class="text-gray-400 hover:text-red-500 p-1 transition-colors cursor-pointer" onclick="removeBookmark(${bm.page})">
                <span class="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          `).join('');
        }

        function addCurrentBookmark() {
          const curPage = bookPagesData[currentPageIndex].pageNumber;
          const isExist = bookmarksData.some(b => b.page === curPage);

          if (isExist) {
            showToast('Halaman ini sudah ditandai.', 'info');
            return;
          }

          bookmarksData.push({
            page: curPage,
            chapter: `${bookPagesData[currentPageIndex].chapter}: ${bookPagesData[currentPageIndex].chapterTitle}`,
            time: 'Baru saja'
          });

          try {
            localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarksData));
          } catch (e) {}

          renderBookmarksList();
          showToast(`Halaman ${curPage} berhasil ditandai!`, 'bookmark_added');
        }

        function removeBookmark(pageNo) {
          bookmarksData = bookmarksData.filter(b => b.page !== pageNo);
          try {
            localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarksData));
          } catch (e) {}
          renderBookmarksList();
          showToast('Penanda buku dihapus.', 'delete');
        }

        function loadSavedBookmarks() {
          try {
            const raw = localStorage.getItem(BOOKMARKS_KEY);
            if (raw) bookmarksData = JSON.parse(raw);
          } catch (e) {}
        }

        // DRAWER & MODAL MANAGEMENT
        function openDrawer(drawerId) {
          closeAllDrawers();
          document.getElementById('drawer-backdrop')?.classList.remove('hidden');
          const drawer = document.getElementById(drawerId);
          if (drawer) {
            drawer.classList.remove('hidden', 'translate-x-full', '-translate-x-full');
          }
        }

        function closeAllDrawers() {
          document.getElementById('drawer-backdrop')?.classList.add('hidden');
          ['drawer-bookmarks', 'drawer-settings', 'drawer-toc'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
              el.classList.add('hidden');
              if (id === 'drawer-toc') el.classList.add('-translate-x-full');
              else el.classList.add('translate-x-full');
            }
          });
        }

        // FULLSCREEN HANDLER
        function toggleFullscreen() {
          const icon = document.getElementById('fullscreen-icon');
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
              if (icon) icon.textContent = 'fullscreen_exit';
            }).catch(() => {
              showToast('Mode layar penuh tidak didukung peramban ini.', 'info');
            });
          } else {
            document.exitFullscreen().then(() => {
              if (icon) icon.textContent = 'fullscreen';
            }).catch(() => {});
          }
        }

        document.addEventListener('fullscreenchange', () => {
          const icon = document.getElementById('fullscreen-icon');
          if (icon) {
            icon.textContent = document.fullscreenElement ? 'fullscreen_exit' : 'fullscreen';
          }
        });

        // Keyboard Navigation
        document.addEventListener('keydown', (e) => {
          if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
          if (e.ctrlKey || e.altKey || e.metaKey) return;

          if (e.key === 'Escape') {
            closeAllDrawers();
            document.getElementById('modal-unlicensed')?.classList.add('hidden');
          } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
            changePage(1);
          } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
            changePage(-1);
          }
        });

        // Initializer
        document.addEventListener('DOMContentLoaded', () => {
          loadSavedSettings();
          loadSavedBookmarks();
          renderCurrentPage();
          renderBookmarksList();
        });

    // Prototype markup calls these from inline handlers; ES modules are scoped, so publish them.
    Object.assign(window, { addCurrentBookmark, changePage, closeAllDrawers, goToPageNumber, handleScrub, navigateToChapter, openDrawer, removeBookmark, setFontFamily, setLineHeight, setReaderTheme, setTextSize, toggleFullscreen });
});
