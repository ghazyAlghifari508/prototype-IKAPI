// riwayat_ulasan_desktop
// Ported verbatim from docs/design/prototype-copy/user/riwayat_ulasan_desktop.html (inline <script>, 332 lines).
// Only this wrapper is new: the module runs once the DOM is ready and only on its own page.
import { onReady } from '../../shared.js';

onReady(function () {
    if (!document.querySelector('#review-total-count')) return;

    const STORAGE_KEY = 'ikapi_user_profile';
        const RATING_DETAIL_KEY = 'ikapi_rating_laskar_aksara';
        const REVIEWS_STORAGE_KEY = 'ikapi_user_review_history';

        // Baseline User-Written Reviews (Dedicated to logged-in user)
        const initialUserReviews = window.IKAPI_P6_DATA.initialUserReviews;;

        let userReviews = loadUserReviews();
        let editingReviewId = null;
        let deletingReviewId = null;
        let editCurrentRating = 5;
        let toastTimer = null;

        function showToast(msg, icon = 'check_circle') {
          const toast = document.getElementById('toast');
          const toastMsg = document.getElementById('toast-message');
          const toastIcon = document.getElementById('toast-icon');
          if (!toast || !toastMsg) return;

          toastMsg.textContent = msg;
          if (toastIcon) toastIcon.textContent = icon;
          toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
          toast.classList.add('translate-y-0', 'opacity-100');
          if (toastTimer) clearTimeout(toastTimer);
          toastTimer = setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
          }, 2500);
        }

        function loadUserReviews() {
          try {
            const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
            if (raw) return JSON.parse(raw);
          } catch (e) {}

          // Check if user submitted a rating on Detail Buku
          try {
            const detailRaw = localStorage.getItem(RATING_DETAIL_KEY);
            if (detailRaw) {
              const detailData = JSON.parse(detailRaw);
              initialUserReviews[0].rating = detailData.rating;
              if (detailData.text) initialUserReviews[0].comment = detailData.text;
              if (detailData.date) initialUserReviews[0].date = detailData.date;
            }
          } catch (e) {}

          return initialUserReviews.slice();
        }

        function saveUserReviews(list) {
          try {
            localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(list));
          } catch (e) {}
        }

        function renderReviewList() {
          const container = document.getElementById('reviews-list-container');
          const emptyState = document.getElementById('reviews-empty-state');
          const totalCount = document.getElementById('review-total-count');

          if (!container || !emptyState) return;

          if (totalCount) {
            totalCount.textContent = `${userReviews.length} Ulasan Ditulis`;
          }

          if (userReviews.length === 0) {
            container.classList.add('hidden');
            emptyState.classList.remove('hidden');
            emptyState.classList.add('flex');
            return;
          }

          emptyState.classList.add('hidden');
          emptyState.classList.remove('flex');
          container.classList.remove('hidden');

          container.innerHTML = userReviews.map(r => {
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
              starsHtml += `<span class="material-symbols-outlined text-[18px] ${i <= r.rating ? 'text-amber-400' : 'text-gray-300'}">star</span>`;
            }

            return `
              <article class="bg-white rounded-3xl p-5 sm:p-6 border border-border-subtle shadow-xs hover:border-primary/40 transition-all flex flex-col gap-4">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <!-- Book Info Row -->
                  <div class="flex items-center gap-4 min-w-0">
                    <div class="w-16 sm:w-20 aspect-[2/3] rounded-2xl overflow-hidden bg-surface-neutral border border-border-subtle shrink-0 shadow-xs">
                      <img src="${r.cover}" alt="${r.title}" class="w-full h-full object-cover">
                    </div>
                    <div class="min-w-0">
                      <div class="flex items-center gap-1 mb-1">
                        ${starsHtml}
                        <span class="text-[12.5px] font-bold text-ink-body ml-1">${r.rating}.0 / 5.0</span>
                      </div>
                      <h3 class="text-[16px] font-bold text-ink-body leading-snug truncate">${r.title}</h3>
                      <p class="text-[13px] text-ink-muted mt-0.5">Penulis: ${r.author} • Diulas pada ${r.date}</p>
                    </div>
                  </div>

                  <!-- Actions on top right for desktop -->
                  <div class="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <a href="detail_buku_desktop.html" class="h-9 px-3.5 rounded-xl border border-border-subtle bg-white hover:bg-surface-neutral text-ink-body text-[13px] font-semibold flex items-center gap-1 transition-colors">
                      <span>Lihat Buku</span>
                      <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </a>
                    <button type="button" class="h-9 px-3 rounded-xl border border-border-subtle bg-white hover:bg-surface-soft hover:text-primary text-ink-body text-[13px] font-semibold flex items-center gap-1 transition-colors cursor-pointer" onclick="openEditModal('${r.id}')">
                      <span class="material-symbols-outlined text-[16px]">edit</span>
                      <span>Edit</span>
                    </button>
                    <button type="button" class="h-9 px-3 rounded-xl border border-border-subtle bg-white hover:bg-red-50 hover:text-red-600 text-ink-muted text-[13px] font-semibold flex items-center gap-1 transition-colors cursor-pointer" onclick="openDeleteModal('${r.id}')">
                      <span class="material-symbols-outlined text-[16px]">delete</span>
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>

                <!-- Review Comment Body -->
                <div class="pt-3 border-t border-border-subtle bg-surface-neutral/60 p-4 rounded-2xl text-[14px] text-ink-body leading-relaxed">
                  <p>${r.comment || '<span class="text-ink-muted italic">Memberikan penilaian tanpa ulasan teks.</span>'}</p>
                </div>
              </article>
            `;
          }).join('');
        }

        function handleSortReviews() {
          const sortVal = document.getElementById('review-sort-select')?.value;
          if (sortVal === 'newest') {
            userReviews.sort((a, b) => b.timestamp - a.timestamp);
          } else if (sortVal === 'oldest') {
            userReviews.sort((a, b) => a.timestamp - b.timestamp);
          } else if (sortVal === 'rating_high') {
            userReviews.sort((a, b) => b.rating - a.rating);
          } else if (sortVal === 'rating_low') {
            userReviews.sort((a, b) => a.rating - b.rating);
          }
          renderReviewList();
        }

        // Edit Review Modal
        function openEditModal(reviewId) {
          const review = userReviews.find(r => r.id === reviewId);
          if (!review) return;

          editingReviewId = reviewId;
          editCurrentRating = review.rating;

          document.getElementById('edit-modal-book-title').textContent = review.title;
          document.getElementById('edit-comment-input').value = review.comment || '';
          selectEditRating(editCurrentRating);

          const modal = document.getElementById('modal-edit-review');
          if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.style.overflow = 'hidden';
          }
        }

        function closeEditModal() {
          const modal = document.getElementById('modal-edit-review');
          if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = '';
          }
          editingReviewId = null;
        }

        function selectEditRating(val) {
          editCurrentRating = val;
          const stars = document.querySelectorAll('.edit-star-btn');
          stars.forEach(btn => {
            const starVal = parseInt(btn.getAttribute('data-star'), 10);
            if (starVal <= val) {
              btn.classList.add('is-active');
            } else {
              btn.classList.remove('is-active');
            }
          });
          document.getElementById('edit-stars-label').textContent = `${val} Bintang`;
        }

        function handleSaveEditedReview(e) {
          e.preventDefault();
          const review = userReviews.find(r => r.id === editingReviewId);
          if (!review) return;

          const commentVal = document.getElementById('edit-comment-input')?.value.trim();
          review.rating = editCurrentRating;
          review.comment = commentVal;
          review.date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
          review.timestamp = Date.now();

          // If it's Laskar Aksara Pasundan, sync to detail page storage
          if (review.id === 'rev-laskar-aksara') {
            try {
              localStorage.setItem(RATING_DETAIL_KEY, JSON.stringify({
                rating: review.rating,
                text: review.comment,
                date: review.date
              }));
            } catch (e) {}
          }

          saveUserReviews(userReviews);
          renderReviewList();
          closeEditModal();
          showToast('Ulasan berhasil diperbarui!');
        }

        // Delete Review Modal
        function openDeleteModal(reviewId) {
          deletingReviewId = reviewId;
          const modal = document.getElementById('modal-delete-confirm');
          if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.style.overflow = 'hidden';
          }
        }

        function closeDeleteModal() {
          const modal = document.getElementById('modal-delete-confirm');
          if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = '';
          }
          deletingReviewId = null;
        }

        document.getElementById('btn-confirm-delete')?.addEventListener('click', () => {
          if (!deletingReviewId) return;
          userReviews = userReviews.filter(r => r.id !== deletingReviewId);

          if (deletingReviewId === 'rev-laskar-aksara') {
            try {
              localStorage.removeItem(RATING_DETAIL_KEY);
            } catch (e) {}
          }

          saveUserReviews(userReviews);
          renderReviewList();
          closeDeleteModal();
          showToast('Ulasan berhasil dihapus', 'delete');
        });

        // Account Dropdown & Identity
        document.addEventListener('DOMContentLoaded', () => {
          try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
              const profile = JSON.parse(raw);
              const initials = (profile.fullName.split(' ').map(p => p[0]).join('')).toUpperCase().slice(0, 2);
              document.getElementById('header-user-name').textContent = profile.fullName;
              document.getElementById('dropdown-user-name').textContent = profile.fullName;
              document.getElementById('sidebar-user-name').textContent = profile.fullName;
              document.getElementById('dropdown-user-email').textContent = profile.email;
              document.getElementById('sidebar-user-email').textContent = profile.email;
              if (profile.avatarUrl) {
                document.getElementById('header-avatar').innerHTML = `<img src="${profile.avatarUrl}" class="w-full h-full object-cover">`;
                document.getElementById('sidebar-avatar').innerHTML = `<img src="${profile.avatarUrl}" class="w-full h-full object-cover">`;
              } else {
                document.getElementById('header-avatar-initials').textContent = initials;
                document.getElementById('sidebar-avatar-initials').textContent = initials;
              }
            }
          } catch (e) {}

          renderReviewList();

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
                closeEditModal();
                closeDeleteModal();
              }
            });
          }
        });

    // Prototype markup calls these from inline handlers; ES modules are scoped, so publish them.
    Object.assign(window, { closeDeleteModal, closeEditModal, handleSaveEditedReview, handleSortReviews, openDeleteModal, openEditModal, selectEditRating });
});
