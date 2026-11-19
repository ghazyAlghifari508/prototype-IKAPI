// riwayat_pesanan_desktop
// Ported verbatim from docs/design/prototype-copy/user/riwayat_pesanan_desktop.html (inline <script>, 402 lines).
// Only this wrapper is new: the module runs once the DOM is ready and only on its own page.
import { onReady } from '../../shared.js';

onReady(function () {
    if (!document.querySelector('#tab-filter-all')) return;

    const STORAGE_KEY = 'ikapi_user_profile';
        const DEFAULT_PROFILE = {
          fullName: 'Ahmad Hidayat',
          email: 'ahmad.hidayat@literasi.id',
          phone: '0812-3456-7890',
          avatarUrl: null
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

        // Realistic Demo Orders Dataset
        const ordersData = window.IKAPI_P6_DATA.ordersData;;

        let currentFilter = 'all';

        function formatRupiah(num) {
          return 'Rp' + num.toLocaleString('id-ID');
        }

        function getStatusBadgeClass(status) {
          switch (status) {
            case 'success':
              return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
            case 'pending':
              return 'bg-amber-50 text-amber-700 border border-amber-200';
            case 'failed':
              return 'bg-red-50 text-red-700 border border-red-200';
            case 'expired':
              return 'bg-gray-100 text-gray-700 border border-gray-200';
            default:
              return 'bg-surface-neutral text-ink-muted border border-border-subtle';
          }
        }

        function renderOrders() {
          const container = document.getElementById('orders-container');
          const emptyState = document.getElementById('orders-empty-state');
          if (!container || !emptyState) return;

          const filtered = currentFilter === 'all' 
            ? ordersData 
            : ordersData.filter(o => o.status === currentFilter);

          if (filtered.length === 0) {
            container.classList.add('hidden');
            emptyState.classList.remove('hidden');
            emptyState.classList.add('flex');
            return;
          }

          emptyState.classList.add('hidden');
          emptyState.classList.remove('flex');
          container.classList.remove('hidden');

          container.innerHTML = filtered.map(order => {
            const badgeClass = getStatusBadgeClass(order.status);
            const mainBook = order.books[0];
            const otherCount = order.books.length - 1;

            return `
              <article class="order-card bg-white rounded-3xl border border-border-subtle p-5 sm:p-6 shadow-xs hover:border-primary/40 transition-all flex flex-col gap-4">
                <!-- Top Card Header -->
                <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border-subtle text-[13px]">
                  <div class="flex items-center gap-3">
                    <span class="font-bold text-ink-body font-mono">${order.id}</span>
                    <span class="text-ink-muted">${order.date}</span>
                  </div>
                  <span class="px-3 py-1 rounded-full text-[12px] font-bold ${badgeClass}">
                    ${order.statusLabel}
                  </span>
                </div>

                <!-- Middle Card Body -->
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div class="flex items-center gap-4">
                    <div class="w-16 sm:w-20 aspect-[2/3] rounded-xl overflow-hidden bg-surface-neutral border border-border-subtle shrink-0 shadow-xs">
                      <img src="${mainBook.cover}" alt="${mainBook.title}" class="w-full h-full object-cover">
                    </div>
                    <div class="flex flex-col gap-1 min-w-0">
                      <h3 class="text-[16px] font-bold text-ink-body leading-snug">
                        ${mainBook.title}
                      </h3>
                      <p class="text-[13px] text-ink-muted">
                        Penulis: ${mainBook.author}
                      </p>
                      ${otherCount > 0 ? `<p class="text-[12px] text-primary font-semibold">+${otherCount} buku lainnya</p>` : ''}
                    </div>
                  </div>

                  <!-- Price & Quick Actions -->
                  <div class="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle">
                    <div class="text-left sm:text-right">
                      <span class="text-[11px] text-ink-muted block uppercase tracking-wider">Total Pesanan</span>
                      <span class="text-[17px] font-bold text-ink-body font-sans">${formatRupiah(order.total)}</span>
                    </div>
                    <div class="flex items-center gap-2 mt-1">
                      <button type="button" class="h-9 px-4 rounded-xl border border-border-subtle bg-white hover:bg-surface-neutral text-ink-body text-[13px] font-semibold transition-colors" onclick="openOrderDetailModal('${order.id}')">
                        Lihat Rincian
                      </button>
                      ${order.status === 'success' ? `
                        <a href="/akun/perpustakaan" class="h-9 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-[13px] font-bold flex items-center gap-1 transition-colors shadow-xs">
                          <span>Baca E-Book</span>
                          <span class="material-symbols-outlined text-[16px]">menu_book</span>
                        </a>
                      ` : ''}
                    </div>
                  </div>
                </div>
              </article>
            `;
          }).join('');
        }

        function filterOrders(status) {
          currentFilter = status;
          const tabs = ['all', 'success', 'pending', 'failed', 'expired'];
          tabs.forEach(t => {
            const btn = document.getElementById('tab-filter-' + t);
            if (!btn) return;
            if (t === status) {
              btn.className = 'tab-filter-btn px-4 py-2 rounded-xl bg-primary text-white shadow-xs transition-all';
            } else {
              btn.className = 'tab-filter-btn px-4 py-2 rounded-xl bg-surface-neutral text-ink-muted hover:text-ink-body hover:bg-surface-soft transition-all';
            }
          });
          renderOrders();
        }

        // Modal Details Handlers
        function openOrderDetailModal(orderId) {
          const order = ordersData.find(o => o.id === orderId);
          if (!order) return;

          const modal = document.getElementById('modal-order-detail');
          const idEl = document.getElementById('modal-order-id');
          const badgeEl = document.getElementById('modal-order-badge');
          const dateEl = document.getElementById('modal-order-date');
          const paymentEl = document.getElementById('modal-order-payment');
          const itemsEl = document.getElementById('modal-order-items');
          const subtotalEl = document.getElementById('modal-order-subtotal');
          const totalEl = document.getElementById('modal-order-total');
          const actionsEl = document.getElementById('modal-order-actions');

          if (idEl) idEl.textContent = order.id;
          if (dateEl) dateEl.textContent = order.date;
          if (paymentEl) paymentEl.textContent = order.paymentMethod;
          if (subtotalEl) subtotalEl.textContent = formatRupiah(order.subtotal);
          if (totalEl) totalEl.textContent = formatRupiah(order.total);

          if (badgeEl) {
            badgeEl.textContent = order.statusLabel;
            badgeEl.className = `px-3 py-1 rounded-full text-[12px] font-bold ${getStatusBadgeClass(order.status)}`;
          }

          if (itemsEl) {
            itemsEl.innerHTML = order.books.map(b => `
              <div class="flex items-center justify-between gap-4 p-3 rounded-2xl bg-surface-neutral border border-border-subtle">
                <div class="flex items-center gap-3">
                  <div class="w-12 aspect-[2/3] rounded-lg overflow-hidden bg-white border border-border-subtle shrink-0">
                    <img src="${b.cover}" alt="${b.title}" class="w-full h-full object-cover">
                  </div>
                  <div>
                    <p class="text-[14px] font-bold text-ink-body">${b.title}</p>
                    <p class="text-[12px] text-ink-muted">${b.author}</p>
                  </div>
                </div>
                <span class="text-[14px] font-bold text-ink-body font-mono">${formatRupiah(b.price)}</span>
              </div>
            `).join('');
          }

          if (actionsEl) {
            if (order.status === 'success') {
              actionsEl.innerHTML = `
                <a href="/akun/perpustakaan" class="h-10 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white text-[13px] font-bold flex items-center gap-1.5 transition-colors shadow-xs">
                  <span class="material-symbols-outlined text-[18px]">local_library</span>
                  <span>Buka Perpustakaan Saya</span>
                </a>
              `;
            } else if (order.status === 'pending') {
              actionsEl.innerHTML = `
                <a href="/keranjang" class="h-10 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white text-[13px] font-bold flex items-center gap-1.5 transition-colors shadow-xs">
                  <span class="material-symbols-outlined text-[18px]">payments</span>
                  <span>Lanjut Pembayaran</span>
                </a>
              `;
            } else {
              actionsEl.innerHTML = `
                <a href="/katalog" class="h-10 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white text-[13px] font-bold flex items-center gap-1.5 transition-colors shadow-xs">
                  <span class="material-symbols-outlined text-[18px]">shopping_cart</span>
                  <span>Beli Kembali di Katalog</span>
                </a>
              `;
            }
          }

          if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.style.overflow = 'hidden';
          }
        }

        function closeOrderDetailModal() {
          const modal = document.getElementById('modal-order-detail');
          if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = '';
          }
        }

        window.addEventListener('click', (e) => {
          const modal = document.getElementById('modal-order-detail');
          if (modal && e.target === modal) closeOrderDetailModal();
        });

        window.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') closeOrderDetailModal();
        });

        // Account Dropdown Interactions
        document.addEventListener('DOMContentLoaded', () => {
          const profile = getStoredProfile();
          syncGlobalIdentity(profile);
          renderOrders();

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
        });

    // Prototype markup calls these from inline handlers; ES modules are scoped, so publish them.
    Object.assign(window, { closeOrderDetailModal, filterOrders, openOrderDetailModal });
});
