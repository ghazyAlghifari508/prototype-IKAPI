// bantuan_akun_desktop
// Ported verbatim from docs/design/prototype-copy/user/bantuan_akun_desktop.html (inline <script>, 245 lines).
// Only this wrapper is new: the module runs once the DOM is ready and only on its own page.
import { onReady } from '../../shared.js';

onReady(function () {
    if (!document.querySelector('#faq-search-input')) return;

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

        // Accurate IKAPI FAQ Dataset
        const faqData = window.IKAPI_P6_DATA.faqData;;

        let currentSelectedTopic = 'all';
        let currentSearchTerm = '';
        let activeAccordionId = null;

        function renderFaqList() {
          const container = document.getElementById('faq-accordion-container');
          const emptyState = document.getElementById('faq-empty-state');
          const countText = document.getElementById('faq-count-text');
          const sectionTitle = document.getElementById('faq-section-title');

          if (!container || !emptyState) return;

          let filtered = faqData.slice();

          if (currentSelectedTopic !== 'all') {
            filtered = filtered.filter(f => f.topic === currentSelectedTopic);
          }

          if (currentSearchTerm) {
            const q = currentSearchTerm.toLowerCase();
            filtered = filtered.filter(f => 
              f.question.toLowerCase().includes(q) || 
              f.answer.toLowerCase().includes(q)
            );
          }

          if (countText) countText.textContent = `${filtered.length} pertanyaan`;

          if (filtered.length === 0) {
            container.classList.add('hidden');
            emptyState.classList.remove('hidden');
            emptyState.classList.add('flex');
            return;
          }

          emptyState.classList.add('hidden');
          emptyState.classList.remove('flex');
          container.classList.remove('hidden');

          container.innerHTML = filtered.map(item => {
            const isOpen = activeAccordionId === item.id;
            return `
              <div class="faq-item">
                <button type="button" aria-expanded="${isOpen}" class="w-full p-5 flex items-center justify-between text-left hover:bg-surface-soft transition-colors cursor-pointer group" onclick="toggleFaqAccordion('${item.id}')">
                  <span class="text-[15px] font-bold text-ink-body group-hover:text-primary transition-colors pr-4">
                    ${item.question}
                  </span>
                  <span class="material-symbols-outlined text-[20px] text-ink-muted group-hover:text-primary transition-transform ${isOpen ? 'rotate-180' : ''} shrink-0">
                    expand_more
                  </span>
                </button>
                <div class="${isOpen ? 'block' : 'hidden'} px-5 pb-5 text-[14px] text-ink-muted leading-relaxed">
                  <p>${item.answer}</p>
                </div>
              </div>
            `;
          }).join('');
        }

        function toggleFaqAccordion(id) {
          if (activeAccordionId === id) {
            activeAccordionId = null;
          } else {
            activeAccordionId = id;
          }
          renderFaqList();
        }

        function selectFaqTopic(topic) {
          currentSelectedTopic = topic;
          activeAccordionId = null;

          // Update button styles
          document.querySelectorAll('.topic-btn').forEach(btn => {
            const t = btn.getAttribute('data-topic');
            if (t === topic) {
              btn.className = "topic-btn p-4 rounded-2xl bg-surface-soft border border-primary text-left transition-all cursor-pointer group shadow-xs";
            } else {
              btn.className = "topic-btn p-4 rounded-2xl bg-white hover:bg-surface-soft border border-border-subtle text-left transition-all cursor-pointer group shadow-xs";
            }
          });

          renderFaqList();
        }

        function handleFaqSearch(e) {
          currentSearchTerm = e.target.value.trim();
          const clearBtn = document.getElementById('clear-faq-search');
          if (clearBtn) {
            if (currentSearchTerm) clearBtn.classList.remove('hidden');
            else clearBtn.classList.add('hidden');
          }
          activeAccordionId = null;
          renderFaqList();
        }

        function clearFaqSearch() {
          const input = document.getElementById('faq-search-input');
          const clearBtn = document.getElementById('clear-faq-search');
          if (input) input.value = '';
          if (clearBtn) clearBtn.classList.add('hidden');
          currentSearchTerm = '';
          currentSelectedTopic = 'all';
          selectFaqTopic('all');
        }

        document.addEventListener('DOMContentLoaded', () => {
          const profile = getStoredProfile();
          syncGlobalIdentity(profile);
          renderFaqList();

          const toggleBtn = document.getElementById('toggle-dropdown-btn');
          const dropdownMenu = document.getElementById('header-user-dropdown');

          if (toggleBtn && dropdownMenu) {
            toggleBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              const isHidden = dropdownMenu.classList.contains('hidden');
              if (isHidden) {
                dropdownMenu.classList.remove('hidden');
                toggleBtn.setAttribute('aria-expanded', 'true');
              } else {
                dropdownMenu.classList.add('hidden');
                toggleBtn.setAttribute('aria-expanded', 'false');
              }
            });

            document.addEventListener('click', (e) => {
              if (!dropdownMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
                dropdownMenu.classList.add('hidden');
                toggleBtn?.setAttribute('aria-expanded', 'false');
              }
            });

            document.addEventListener('keydown', (e) => {
              if (e.key === 'Escape') {
                dropdownMenu.classList.add('hidden');
                toggleBtn?.setAttribute('aria-expanded', 'false');
              }
            });
          }
        });

    // Prototype markup calls these from inline handlers; ES modules are scoped, so publish them.
    Object.assign(window, { clearFaqSearch, handleFaqSearch, selectFaqTopic, toggleFaqAccordion });
});
