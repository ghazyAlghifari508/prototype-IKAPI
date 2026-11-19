// perpustakaan_saya_desktop
// Ported verbatim from docs/design/prototype-copy/user/perpustakaan_saya_desktop.html (inline <script>, 451 lines).
// Only this wrapper is new: the module runs once the DOM is ready and only on its own page.
import { onReady } from '../../shared.js';

onReady(function () {
    if (!document.querySelector('#librarySearch')) return;

    const STORAGE_KEY = 'ikapi_user_profile';
        const DEFAULT_PROFILE = {
          fullName: 'Ahmad Hidayat',
          email: 'ahmad.hidayat@literasi.id'
        };

        function getStoredProfile() {
          try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
          } catch (e) {}
          return Object.assign({}, DEFAULT_PROFILE);
        }

        function getInitials(name) {
          if (!name) return 'AH';
          const parts = name.trim().split(/\s+/);
          if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
          return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }

        function syncGlobalIdentity(profile) {
          const initials = getInitials(profile.fullName);

          ['header-user-name', 'dropdown-user-name', 'sidebar-user-name'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = profile.fullName;
          });

          ['dropdown-user-email', 'sidebar-user-email'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = profile.email;
          });

          const avatarContainers = [
            { id: 'header-avatar', initialsId: 'header-avatar-initials' },
            { id: 'sidebar-avatar', initialsId: 'sidebar-avatar-initials' }
          ];

          avatarContainers.forEach(t => {
            const container = document.getElementById(t.id);
            if (!container) return;
            if (profile.avatarUrl) {
              container.innerHTML = `<img src="${profile.avatarUrl}" alt="Avatar" class="w-full h-full object-cover">`;
            } else {
              container.innerHTML = `<span id="${t.initialsId}">${initials}</span>`;
            }
          });
        }

        let currentTab = 'all'; // 'all' | 'reading' | 'unread' | 'favorite'
        let currentSearchTerm = '';
        let isViewGrid = true;
        let isSimulatingEmpty = false;
        let toastTimer = null;

        function showToast(message, icon = 'info') {
          const toast = document.getElementById('toastNotification');
          const msg = document.getElementById('toastMessage');
          const ic = document.getElementById('toastIcon');
          if (!toast || !msg) return;

          msg.textContent = message;
          if (ic) ic.textContent = icon;
          toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
          toast.classList.add('translate-y-0', 'opacity-100');

          if (toastTimer) clearTimeout(toastTimer);
          toastTimer = setTimeout(() => {
            toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
            toast.classList.remove('translate-y-0', 'opacity-100');
          }, 2500);
        }

        function updateTabCounts() {
          const cards = Array.from(document.querySelectorAll('.book-card'));
          if (isSimulatingEmpty) {
            document.getElementById('count-all').textContent = '(0)';
            document.getElementById('count-reading').textContent = '(0)';
            document.getElementById('count-unread').textContent = '(0)';
            document.getElementById('count-favorite').textContent = '(0)';
            return;
          }

          const allPurchased = cards.filter(c => c.dataset.purchased === 'true');
          const reading = cards.filter(c => c.dataset.status === 'reading' && c.dataset.purchased === 'true');
          const unread = cards.filter(c => c.dataset.status === 'unread' && c.dataset.purchased === 'true');
          const favorite = cards.filter(c => c.dataset.favorite === 'true');

          document.getElementById('count-all').textContent = `(${allPurchased.length})`;
          document.getElementById('count-reading').textContent = `(${reading.length})`;
          document.getElementById('count-unread').textContent = `(${unread.length})`;
          document.getElementById('count-favorite').textContent = `(${favorite.length})`;
        }

        function switchTab(tabKey) {
          currentTab = tabKey;
          isSimulatingEmpty = false;

          const tabs = ['all', 'reading', 'unread', 'favorite'];
          tabs.forEach(t => {
            const btn = document.getElementById('tab-' + t);
            if (!btn) return;
            if (t === tabKey) {
              btn.className = 'tab-btn px-3.5 py-1.5 rounded-xl text-[13px] font-bold transition-all bg-primary text-white shadow-xs cursor-pointer';
              btn.setAttribute('aria-selected', 'true');
            } else {
              btn.className = 'tab-btn px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all bg-surface-neutral text-ink-muted hover:text-ink-body hover:bg-surface-soft cursor-pointer';
              btn.setAttribute('aria-selected', 'false');
            }
          });

          renderBooks();
        }

        function toggleFavorite(bookId, event) {
          if (event) event.stopPropagation();
          const card = document.querySelector(`.book-card[data-book-id="${bookId}"]`);
          if (!card) return;

          const isFav = card.dataset.favorite === 'true';
          const newFav = !isFav;
          card.dataset.favorite = String(newFav);

          const icon = document.getElementById(`fav-icon-${bookId}`);
          if (icon) {
            if (newFav) {
              icon.textContent = 'favorite';
              icon.parentElement.classList.remove('text-ink-muted');
              icon.parentElement.classList.add('text-red-600');
              showToast(`"${card.dataset.title}" ditambahkan ke buku favorit`, 'favorite');
            } else {
              icon.textContent = 'favorite_border';
              icon.parentElement.classList.remove('text-red-600');
              icon.parentElement.classList.add('text-ink-muted');
              showToast(`"${card.dataset.title}" dihapus dari favorit`, 'favorite_border');
            }
          }

          updateTabCounts();
          if (currentTab === 'favorite' && !newFav) {
            renderBooks();
          }
        }

        function markAsFinished(bookTitle) {
          const card = document.querySelector('.book-card[data-book-id="1"]');
          if (card) {
            card.dataset.status = 'completed';
            card.dataset.progress = '100';
            card.dataset.currentPage = '268';

            const bar = card.querySelector('.card-progress-bar');
            const text = card.querySelector('.card-progress-text');
            if (bar) bar.style.width = '100%';
            if (text) text.textContent = 'Halaman 268 / 268 • 100% Selesai';
          }

          const continueSec = document.getElementById('continue-reading-section');
          if (continueSec) {
            continueSec.style.transition = 'all 0.3s ease';
            continueSec.style.opacity = '0';
            setTimeout(() => {
              continueSec.classList.add('hidden');
            }, 300);
          }

          updateTabCounts();
          renderBooks();
          showToast(`"${bookTitle}" ditandai selesai dibaca!`, 'task_alt');
        }

        function renderBooks() {
          const grid = document.getElementById('booksGrid');
          const emptyCat = document.getElementById('emptyCategoryState');
          const emptySearch = document.getElementById('emptySearchState');
          const emptyTitle = document.getElementById('empty-state-title');
          const emptyDesc = document.getElementById('empty-state-desc');
          const emptyCta = document.getElementById('empty-state-cta');
          const emptyCtaText = document.getElementById('empty-state-cta-text');

          const cards = Array.from(document.querySelectorAll('.book-card'));
          const term = currentSearchTerm.toLowerCase();

          if (isSimulatingEmpty) {
            grid.classList.add('hidden');
            emptySearch.classList.add('hidden');
            emptyCat.classList.remove('hidden');
            emptyCat.classList.add('flex');
            if (emptyTitle) emptyTitle.textContent = 'Belum Ada Buku';
            if (emptyDesc) emptyDesc.textContent = 'Buku yang kamu beli akan muncul di sini.';
            if (emptyCta) {
              emptyCta.href = '/katalog';
              emptyCtaText.textContent = 'Jelajahi Katalog Buku';
            }
            return;
          }

          let visibleCount = 0;
          cards.forEach(card => {
            const title = (card.dataset.title || '').toLowerCase();
            const author = (card.dataset.author || '').toLowerCase();
            const status = card.dataset.status;
            const isFav = card.dataset.favorite === 'true';

            let matchesTab = false;
            if (currentTab === 'all') {
              matchesTab = card.dataset.purchased === 'true';
            } else if (currentTab === 'reading') {
              matchesTab = status === 'reading' && card.dataset.purchased === 'true';
            } else if (currentTab === 'unread') {
              matchesTab = status === 'unread' && card.dataset.purchased === 'true';
            } else if (currentTab === 'favorite') {
              matchesTab = isFav;
            }

            let matchesSearch = true;
            if (term.length > 0) {
              matchesSearch = title.includes(term) || author.includes(term);
            }

            if (matchesTab && matchesSearch) {
              card.classList.remove('hidden');
              visibleCount++;
            } else {
              card.classList.add('hidden');
            }
          });

          if (visibleCount === 0) {
            grid.classList.add('hidden');
            if (term.length > 0) {
              emptyCat.classList.add('hidden');
              emptySearch.classList.remove('hidden');
              emptySearch.classList.add('flex');
            } else {
              emptySearch.classList.add('hidden');
              emptyCat.classList.remove('hidden');
              emptyCat.classList.add('flex');

              // Contextual Empty Tab Titles
              if (currentTab === 'reading') {
                emptyTitle.textContent = 'Belum Ada Buku yang Sedang Dibaca';
                emptyDesc.textContent = 'Mulai membaca e-book yang sudah kamu miliki di tab Belum Dibaca.';
                emptyCta.href = 'javascript:void(0)';
                emptyCta.onclick = () => switchTab('unread');
                emptyCtaText.textContent = 'Buka Buku Belum Dibaca';
              } else if (currentTab === 'unread') {
                emptyTitle.textContent = 'Tidak Ada Buku yang Belum Dibaca';
                emptyDesc.textContent = 'Semua buku yang kamu miliki sudah mulai dibaca atau selesai.';
                emptyCta.href = '/katalog';
                emptyCta.onclick = null;
                emptyCtaText.textContent = 'Cari Buku Baru di Katalog';
              } else if (currentTab === 'favorite') {
                emptyTitle.textContent = 'Belum Ada Buku Favorit';
                emptyDesc.textContent = 'Tandai buku yang kamu sukai dengan ikon hati untuk menyimpannya di sini.';
                emptyCta.href = '/katalog';
                emptyCta.onclick = null;
                emptyCtaText.textContent = 'Jelajahi Katalog Buku';
              } else {
                emptyTitle.textContent = 'Belum Ada Buku';
                emptyDesc.textContent = 'Buku yang kamu beli akan muncul di sini.';
                emptyCta.href = '/katalog';
                emptyCta.onclick = null;
                emptyCtaText.textContent = 'Jelajahi Katalog Buku';
              }
            }
          } else {
            emptyCat.classList.add('hidden');
            emptySearch.classList.add('hidden');
            grid.classList.remove('hidden');
          }
        }

        // View Mode Toggle (Grid vs List)
        function toggleViewMode(mode) {
          const grid = document.getElementById('booksGrid');
          const gridBtn = document.getElementById('viewGridBtn');
          const listBtn = document.getElementById('viewListBtn');
          const cards = Array.from(document.querySelectorAll('.book-card'));

          if (mode === 'list') {
            isViewGrid = false;
            grid.className = 'flex flex-col gap-4 transition-all';
            gridBtn.className = 'p-1 rounded-lg text-ink-muted hover:text-ink-body transition-colors cursor-pointer';
            listBtn.className = 'p-1 rounded-lg bg-primary text-white transition-colors cursor-pointer';

            cards.forEach(c => {
              c.classList.add('sm:flex-row', 'items-start', 'sm:items-center', 'gap-4');
              const cover = c.querySelector('.book-cover-container');
              if (cover) {
                cover.classList.remove('w-full', 'mb-3');
                cover.classList.add('w-20', 'shrink-0', 'mb-0');
              }
            });
          } else {
            isViewGrid = true;
            grid.className = 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 transition-all';
            gridBtn.className = 'p-1 rounded-lg bg-primary text-white transition-colors cursor-pointer';
            listBtn.className = 'p-1 rounded-lg text-ink-muted hover:text-ink-body transition-colors cursor-pointer';

            cards.forEach(c => {
              c.classList.remove('sm:flex-row', 'items-start', 'sm:items-center', 'gap-4');
              const cover = c.querySelector('.book-cover-container');
              if (cover) {
                cover.classList.remove('w-20', 'shrink-0', 'mb-0');
                cover.classList.add('w-full', 'mb-3');
              }
            });
          }
        }

        // Sorting Logic
        function applySorting() {
          const sortVal = document.getElementById('sortSelect').value;
          const grid = document.getElementById('booksGrid');
          const cards = Array.from(document.querySelectorAll('.book-card'));

          cards.sort((a, b) => {
            if (sortVal === 'title') {
              return a.dataset.title.localeCompare(b.dataset.title);
            } else if (sortVal === 'progress') {
              return parseInt(b.dataset.progress || '0', 10) - parseInt(a.dataset.progress || '0', 10);
            } else {
              return parseInt(a.dataset.bookId || '0', 10) - parseInt(b.dataset.bookId || '0', 10);
            }
          });

          cards.forEach(card => grid.appendChild(card));
          showToast(`Koleksi diurutkan berdasarkan ${sortVal === 'title' ? 'Judul (A–Z)' : sortVal === 'progress' ? 'Kemajuan Baca' : 'Terakhir Diakses'}`);
        }

        // Simulator Controls (Preserved in Same HTML)
        function simulateEmptyLibrary() {
          isSimulatingEmpty = true;
          updateTabCounts();
          renderBooks();
          showToast('Menampilkan simulasi koleksi kosong');
        }

        function simulateNoSearchResult() {
          const searchInput = document.getElementById('librarySearch');
          const clearBtn = document.getElementById('clearSearchBtn');
          if (searchInput) {
            searchInput.value = 'Naskah Kuno 1890 Tidak Ada';
            currentSearchTerm = searchInput.value;
            if (clearBtn) clearBtn.classList.remove('hidden');
            isSimulatingEmpty = false;
            renderBooks();
            showToast('Menampilkan simulasi hasil pencarian nihil');
          }
        }

        function resetLibraryState() {
          clearSearchInput();
          isSimulatingEmpty = false;
          const card1 = document.querySelector('.book-card[data-book-id="1"]');
          if (card1) {
            card1.dataset.status = 'reading';
            card1.dataset.progress = '16';
            card1.dataset.currentPage = '42';
            const bar = card1.querySelector('.card-progress-bar');
            const text = card1.querySelector('.card-progress-text');
            if (bar) bar.style.width = '16%';
            if (text) text.textContent = 'Halaman 42 / 268 • 16%';
          }
          const continueSec = document.getElementById('continue-reading-section');
          if (continueSec) {
            continueSec.style.opacity = '1';
            continueSec.classList.remove('hidden');
          }
          switchTab('all');
          toggleViewMode('grid');
          updateTabCounts();
          showToast('Koleksi perpustakaan dikembalikan ke status awal');
        }

        function clearSearchInput() {
          const searchInput = document.getElementById('librarySearch');
          const clearBtn = document.getElementById('clearSearchBtn');
          if (searchInput) searchInput.value = '';
          currentSearchTerm = '';
          if (clearBtn) clearBtn.classList.add('hidden');
          renderBooks();
        }

        document.addEventListener('DOMContentLoaded', () => {
          const profile = getStoredProfile();
          syncGlobalIdentity(profile);

          // Account Dropdown Setup
          const toggleBtn = document.getElementById('toggle-dropdown-btn');
          const dropdownMenu = document.getElementById('header-user-dropdown');

          function openDropdown() {
            if (!dropdownMenu) return;
            dropdownMenu.classList.remove('hidden');
            toggleBtn?.setAttribute('aria-expanded', 'true');
          }

          function closeDropdown() {
            if (!dropdownMenu) return;
            dropdownMenu.classList.add('hidden');
            toggleBtn?.setAttribute('aria-expanded', 'false');
          }

          if (toggleBtn && dropdownMenu) {
            toggleBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              const isHidden = dropdownMenu.classList.contains('hidden');
              if (isHidden) openDropdown();
              else closeDropdown();
            });

            document.addEventListener('click', (e) => {
              if (!dropdownMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
                closeDropdown();
              }
            });

            document.addEventListener('keydown', (e) => {
              if (e.key === 'Escape') closeDropdown();
            });
          }

          // Search Input Setup
          const searchInput = document.getElementById('librarySearch');
          const clearBtn = document.getElementById('clearSearchBtn');

          if (searchInput) {
            searchInput.addEventListener('input', (e) => {
              currentSearchTerm = e.target.value.trim();
              if (currentSearchTerm.length > 0) {
                clearBtn?.classList.remove('hidden');
              } else {
                clearBtn?.classList.add('hidden');
              }
              renderBooks();
            });
          }

          const urlParams = new URLSearchParams(window.location.search);
          const tabParam = urlParams.get('tab');
          if (tabParam && ['all', 'reading', 'unread', 'favorite'].includes(tabParam)) {
            switchTab(tabParam);
          } else {
            updateTabCounts();
            renderBooks();
          }
        });

    // Prototype markup calls these from inline handlers; ES modules are scoped, so publish them.
    Object.assign(window, { applySorting, clearSearchInput, markAsFinished, resetLibraryState, simulateEmptyLibrary, simulateNoSearchResult, switchTab, toggleFavorite, toggleViewMode });
});
