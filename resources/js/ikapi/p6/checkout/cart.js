// keranjang_pembayaran_terpadu_desktop
// Ported verbatim from docs/design/prototype-copy/user/keranjang_pembayaran_terpadu_desktop.html (inline <script>, 245 lines).
// Only this wrapper is new: the module runs once the DOM is ready and only on its own page.
import { onReady } from '../../shared.js';

onReady(function () {
    if (!document.querySelector('#cart-filled-view')) return;

    let currentCartTotal = 103000;
        let toastTimer = null;
        let currentSessionOrderId = 'IKP-20261116-081';
        let selectedPaymentMethodName = 'GoPay / QRIS';

        function showToast(message, icon = 'check_circle') {
          const toast = document.getElementById('cart-toast');
          const toastMsg = document.getElementById('toast-msg');
          const toastIcon = document.getElementById('toast-icon');
          if (!toast || !toastMsg) return;

          toastMsg.textContent = message;
          if (toastIcon) toastIcon.textContent = icon;
          toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
          toast.classList.add('translate-y-0', 'opacity-100');

          if (toastTimer) clearTimeout(toastTimer);
          toastTimer = setTimeout(() => {
            toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
            toast.classList.remove('translate-y-0', 'opacity-100');
          }, 2500);
        }

        function formatRupiah(number) {
          return 'Rp ' + number.toLocaleString('id-ID');
        }

        function recalculateCart() {
          const items = document.querySelectorAll('#cart-filled-view article.cart-item');
          let total = 0;
          items.forEach(item => {
            const price = parseInt(item.getAttribute('data-price') || '0', 10);
            total += price;
          });

          currentCartTotal = total;
          const count = items.length;
          const countDisplay = document.getElementById('cart-item-count');
          const badgeDisplay = document.getElementById('header-cart-badge');
          const subtotalDisplay = document.getElementById('summary-subtotal');
          const totalDisplay = document.getElementById('summary-total');
          const snapTotal = document.getElementById('snap-total-display');
          const orderDetailsTotal = document.getElementById('order-details-total');
          const statusBerhasilTotal = document.getElementById('status-berhasil-total');
          const statusMenungguTotal = document.getElementById('status-menunggu-total');

          if (countDisplay) countDisplay.textContent = `${count} buku`;
          if (badgeDisplay) badgeDisplay.textContent = count;
          if (subtotalDisplay) subtotalDisplay.textContent = formatRupiah(total);
          if (totalDisplay) totalDisplay.textContent = formatRupiah(total);
          if (snapTotal) snapTotal.textContent = formatRupiah(total);
          if (orderDetailsTotal) orderDetailsTotal.textContent = formatRupiah(total);
          if (statusBerhasilTotal) statusBerhasilTotal.textContent = formatRupiah(total);
          if (statusMenungguTotal) statusMenungguTotal.textContent = formatRupiah(total);

          if (count === 0) {
            document.getElementById('cart-filled-view')?.classList.add('hidden');
            document.getElementById('cart-empty-view')?.classList.remove('hidden');
          }
        }

        function removeCartItem(id) {
          const itemEl = document.getElementById('cart-item-' + id);
          if (itemEl) {
            itemEl.style.transition = 'all 0.25s ease';
            itemEl.style.opacity = '0';
            itemEl.style.transform = 'translateX(-20px)';
            setTimeout(() => {
              itemEl.remove();
              recalculateCart();
              showToast('Buku dihapus dari keranjang belanja', 'delete');
            }, 250);
          }
        }

        function toggleFavorite(id, btn) {
          const icon = btn.querySelector('.material-symbols-outlined');
          const itemEl = document.getElementById('cart-item-' + id);
          const title = itemEl?.getAttribute('data-title') || 'Buku';

          const isFav = btn.getAttribute('data-fav') === 'true';
          if (!isFav) {
            btn.setAttribute('data-fav', 'true');
            btn.classList.remove('text-ink-muted');
            btn.classList.add('text-red-600', 'bg-red-50');
            if (icon) {
              icon.textContent = 'favorite';
            }
            showToast(`"${title}" ditambahkan ke favorit`, 'favorite');
          } else {
            btn.setAttribute('data-fav', 'false');
            btn.classList.remove('text-red-600', 'bg-red-50');
            btn.classList.add('text-ink-muted');
            if (icon) {
              icon.textContent = 'favorite_border';
            }
            showToast(`"${title}" dihapus dari favorit`, 'favorite_border');
          }
        }

        // Direct Payment Modal Trigger (Redundant Confirmation Modal Bypassed!)
        function triggerDirectPaymentModal() {
          const items = document.querySelectorAll('#cart-filled-view article.cart-item');
          if (items.length === 0) {
            showToast('Keranjang Anda masih kosong', 'info');
            return;
          }

          // Generate session order ID
          const randomSuffix = Math.floor(100 + Math.random() * 900);
          currentSessionOrderId = `IKP-20261116-${randomSuffix}`;

          // Populate snapshot order items
          const itemsListContainer = document.getElementById('order-details-items-list');
          if (itemsListContainer) {
            let itemsHtml = '';
            items.forEach(item => {
              const title = item.getAttribute('data-title') || '';
              const price = parseInt(item.getAttribute('data-price') || '0', 10);
              itemsHtml += `
                <div class="flex items-center justify-between text-ink-body">
                  <span class="truncate pr-2">${title}</span>
                  <span class="font-mono font-bold shrink-0">${formatRupiah(price)}</span>
                </div>
              `;
            });
            itemsListContainer.innerHTML = itemsHtml;
          }

          // Sync Order ID labels
          ['snap-order-id-label', 'status-success-order-id', 'status-pending-order-id', 'status-failed-order-id', 'status-expired-order-id'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = `Order ID #${currentSessionOrderId}`;
          });

          // Recalculate totals
          recalculateCart();

          // Open Modal
          const snap = document.getElementById('snap-overlay');
          if (snap) {
            snap.classList.remove('hidden');
            snap.classList.add('flex');
            document.body.style.overflow = 'hidden';
            backToSnapSelector();
          }
        }

        function closeSnapOverlay() {
          const snap = document.getElementById('snap-overlay');
          if (snap) {
            snap.classList.add('hidden');
            snap.classList.remove('flex');
            document.body.style.overflow = '';
          }
        }

        // Expandable Order Details Drawer (Midtrans Photo 8 Feature)
        function toggleOrderDetailsDrawer() {
          const drawer = document.getElementById('order-details-drawer');
          const chevron = document.getElementById('detail-chevron');
          if (!drawer) return;

          const isHidden = drawer.classList.contains('hidden');
          if (isHidden) {
            drawer.classList.remove('hidden');
            chevron?.classList.add('rotate-180');
          } else {
            drawer.classList.add('hidden');
            chevron?.classList.remove('rotate-180');
          }
        }

        // Expandable Virtual Account Accordion (Midtrans Photo 8 Feature)
        function toggleVaAccordion() {
          const sublist = document.getElementById('va-sublist');
          const chevron = document.getElementById('va-chevron');
          if (!sublist) return;

          const isHidden = sublist.classList.contains('hidden');
          if (isHidden) {
            sublist.classList.remove('hidden');
            chevron?.classList.add('rotate-180');
          } else {
            sublist.classList.add('hidden');
            chevron?.classList.remove('rotate-180');
          }
        }

        function hideAllSnapSubviews() {
          document.getElementById('snap-selection-view')?.classList.add('hidden');
          document.getElementById('status-berhasil')?.classList.add('hidden');
          document.getElementById('status-menunggu')?.classList.add('hidden');
          document.getElementById('status-gagal')?.classList.add('hidden');
          document.getElementById('status-kedaluwarsa')?.classList.add('hidden');
        }

        function backToSnapSelector() {
          hideAllSnapSubviews();
          document.getElementById('snap-selection-view')?.classList.remove('hidden');
        }

        // Select payment method -> leads to pending state simulation
        function selectPaymentMethod(code, name) {
          selectedPaymentMethodName = name;
          const methodLabel = document.getElementById('status-pending-method');
          if (methodLabel) methodLabel.textContent = name;

          showToast(`Menghubungkan ke ${name}...`, 'sync');
          setTimeout(() => {
            setDemoPaymentStatus('menunggu');
          }, 400);
        }

        // Honest State Transition
        function setDemoPaymentStatus(status) {
          hideAllSnapSubviews();
          if (status === 'berhasil') {
            document.getElementById('status-berhasil')?.classList.remove('hidden');
            showToast('Pembayaran berhasil dikonfirmasi!', 'check_circle');
          } else if (status === 'menunggu') {
            document.getElementById('status-menunggu')?.classList.remove('hidden');
          } else if (status === 'gagal') {
            document.getElementById('status-gagal')?.classList.remove('hidden');
          } else if (status === 'kedaluwarsa') {
            document.getElementById('status-kedaluwarsa')?.classList.remove('hidden');
          }
        }

        // Check Status does NOT automatically make it successful unless verified
        function checkPaymentStatus() {
          showToast('Memeriksa status transaksi ke gateway...', 'sync');
          // Remains in current state or gives honest simulation response
        }

        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            closeSnapOverlay();
          }
        });

        document.getElementById('snap-overlay')?.addEventListener('click', (e) => {
          if (e.target.id === 'snap-overlay') closeSnapOverlay();
        });

    // Prototype markup calls these from inline handlers; ES modules are scoped, so publish them.
    Object.assign(window, { backToSnapSelector, checkPaymentStatus, closeSnapOverlay, removeCartItem, selectPaymentMethod, setDemoPaymentStatus, toggleFavorite, toggleOrderDetailsDrawer, toggleVaAccordion, triggerDirectPaymentModal });
});
