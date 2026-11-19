function selectStarRating(val) {
      selectedRating = val;
      renderStarVisuals(selectedRating);
      const label = document.getElementById('star-rating-label');
      if (label) {
        label.textContent = `Rating kamu: ${RATING_LABELS[selectedRating]}`;
      }
    }

function hoverStarRating(val) {
      renderStarVisuals(val);
      const label = document.getElementById('star-rating-label');
      if (label) {
        label.textContent = `Rating kamu: ${RATING_LABELS[val]}`;
      }
    }

function leaveStarRating() {
      renderStarVisuals(selectedRating);
      const label = document.getElementById('star-rating-label');
      if (label) {
        if (selectedRating > 0) {
          label.textContent = `Rating kamu: ${RATING_LABELS[selectedRating]}`;
        } else {
          label.textContent = 'Rating kamu: Belum dipilih';
        }
      }
    }

function renderStarVisuals(highlightUpTo) {
      const starButtons = document.querySelectorAll('.star-btn');
      starButtons.forEach(btn => {
        const val = parseInt(btn.getAttribute('data-rating'), 10);
        if (val <= highlightUpTo) {
          btn.classList.add('is-active');
        } else {
          btn.classList.remove('is-active');
        }
      });
    }

function submitUserRating() {
      if (selectedRating === 0) {
        showToast('Pilih jumlah bintang terlebih dahulu', 'error');
        return;
      }

      const reviewInput = document.getElementById('user-review-text');
      const reviewText = reviewInput ? reviewInput.value.trim() : '';

      const ratingData = {
        rating: selectedRating,
        text: reviewText,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      };

      try {
        localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(ratingData));
      } catch (e) {}

      updateRatingSummaryDisplay();
      injectUserReviewInList(ratingData);

      const cancelBtn = document.getElementById('btn-cancel-rating');
      if (cancelBtn) cancelBtn.classList.remove('hidden');

      showToast('Penilaian berhasil disimpan');
    }

function resetUserRating() {
      selectedRating = 0;
      try {
        localStorage.removeItem(RATING_STORAGE_KEY);
      } catch (e) {}

      renderStarVisuals(0);
      const label = document.getElementById('star-rating-label');
      if (label) label.textContent = 'Rating kamu: Belum dipilih';

      const reviewInput = document.getElementById('user-review-text');
      if (reviewInput) reviewInput.value = '';

      const userReviewEl = document.getElementById('user-submitted-review');
      if (userReviewEl) userReviewEl.remove();

      const cancelBtn = document.getElementById('btn-cancel-rating');
      if (cancelBtn) cancelBtn.classList.add('hidden');

      updateRatingSummaryDisplay();
      showToast('Penilaian telah dihapus', 'delete');
    }

function loadSavedRating() {
      try {
        const raw = localStorage.getItem(RATING_STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          selectedRating = data.rating || 0;
          selectStarRating(selectedRating);
          const reviewInput = document.getElementById('user-review-text');
          if (reviewInput && data.text) reviewInput.value = data.text;
          injectUserReviewInList(data);
          const cancelBtn = document.getElementById('btn-cancel-rating');
          if (cancelBtn) cancelBtn.classList.remove('hidden');
        }
      } catch (e) {}
      updateRatingSummaryDisplay();
    }

function updateRatingSummaryDisplay() {
      const summaryStars = document.getElementById('summary-stars');
      const summaryText = document.getElementById('summary-rating-text');
      const summaryCta = document.getElementById('summary-rating-cta');
      const reviewBadge = document.getElementById('review-count-badge');

      /* The counter lives in the Ulasan header, so update it before the optional
         summary row is checked. */
      if (reviewBadge) {
        reviewBadge.textContent = selectedRating === 0 ? '3 ulasan' : '4 ulasan (termasuk kamu)';
      }

      if (!summaryStars || !summaryText) return;

      if (selectedRating === 0) {
        // Honest baseline: No user rating given yet
        summaryStars.innerHTML = `
          <span class="material-symbols-outlined text-[19px] text-gray-300">star</span>
          <span class="material-symbols-outlined text-[19px] text-gray-300">star</span>
          <span class="material-symbols-outlined text-[19px] text-gray-300">star</span>
          <span class="material-symbols-outlined text-[19px] text-gray-300">star</span>
          <span class="material-symbols-outlined text-[19px] text-gray-300">star</span>
        `;
        summaryText.textContent = 'Belum ada penilaian';
        summaryText.className = 'text-ink-muted font-normal';
        if (summaryCta) summaryCta.textContent = 'Beri penilaian';
        if (reviewBadge) reviewBadge.textContent = '3 ulasan';
      } else {
        // Calculated user rating
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
          if (i <= selectedRating) {
            starsHtml += '<span class="material-symbols-outlined text-[19px] text-amber-400">star</span>';
          } else {
            starsHtml += '<span class="material-symbols-outlined text-[19px] text-gray-300">star</span>';
          }
        }
        summaryStars.innerHTML = starsHtml;
        summaryText.textContent = `${selectedRating}.0 / 5.0`;
        summaryText.className = 'text-ink-body font-bold';
        if (summaryCta) summaryCta.textContent = 'Ubah penilaian';
        if (reviewBadge) reviewBadge.textContent = '4 ulasan (termasuk kamu)';
      }
    }

function injectUserReviewInList(data) {
      let existing = document.getElementById('user-submitted-review');
      const listContainer = document.getElementById('reviews-list-container');
      if (!listContainer) return;

      if (!existing) {
        existing = document.createElement('article');
        existing.id = 'user-submitted-review';
        existing.className = 'py-4 first:pt-0 border-b border-border-subtle bg-surface-soft/60 p-4 rounded-2xl mb-3 flex flex-col gap-1.5 transition-all';
        listContainer.insertBefore(existing, listContainer.firstChild);
      }

      let starsHtml = '';
      for (let i = 1; i <= 5; i++) {
        starsHtml += `<span class="material-symbols-outlined text-[16px] ${i <= data.rating ? 'text-amber-400' : 'text-gray-300'}">star</span>`;
      }

      existing.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-[14px] font-bold text-ink-body">Penilaian Kamu</span>
            <span class="px-2 py-0.5 rounded-full bg-surface-soft text-primary font-bold text-[11px]">Terverifikasi</span>
          </div>
          <time class="text-[12px] text-ink-muted">${data.date}</time>
        </div>
        <div class="flex items-center gap-1 my-0.5">
          ${starsHtml}
          <span class="text-[12px] font-bold text-ink-body ml-1">${data.rating}.0 / 5.0</span>
        </div>
        ${data.text ? `<p class="text-[14px] text-ink-body leading-relaxed">${data.text}</p>` : '<p class="text-[13px] text-ink-muted italic">Memberikan penilaian tanpa ulasan teks.</p>'}
      `;
    }

function showToast(msg, icon = 'check_circle') {
      const toast = document.getElementById('toast');
      const toastMessage = document.getElementById('toast-message');
      if (!toast || !toastMessage) return;
      toastMessage.textContent = msg;
      toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
      toast.classList.add('translate-y-0', 'opacity-100');
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
      }, 2500);
    }

function handleAddToCart(title = 'Laskar Aksara Pasundan') {
        cartCount += 1;
        if (cartBadge) {
          cartBadge.textContent = cartCount;
          cartBadge.classList.add('scale-125');
          setTimeout(() => cartBadge.classList.remove('scale-125'), 200);
        }

        if (btnAddToCart && btnAddToCartText) {
          const origText = btnAddToCartText.textContent;
          btnAddToCartText.textContent = 'Ditambahkan';
          btnAddToCart.classList.add('bg-primary-hover');
          setTimeout(() => {
            btnAddToCartText.textContent = origText;
            btnAddToCart.classList.remove('bg-primary-hover');
          }, 1500);
        }

        showToast(`"${title}" berhasil ditambahkan ke keranjang`);
      }

function lockScroll(on) {
        if (on) {
          scrollY = window.scrollY;
          document.body.style.position = 'fixed';
          document.body.style.top = -scrollY + 'px';
          document.body.style.left = '0';
          document.body.style.right = '0';
          document.body.style.width = '100%';
        } else {
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.style.left = '';
          document.body.style.right = '';
          document.body.style.width = '';
          window.scrollTo(0, scrollY);
        }
      }

function openMenu(trigger) {
        closeMenu(false);
        var comment = commentFromTrigger(trigger);
        if (!comment) return;
        menuTrigger = trigger;
        paintMenu(comment.id);
        menu.classList.remove('hidden');
        trigger.setAttribute('aria-expanded', 'true');
        positionMenu(trigger);
        var first = menuItems()[0];
        if (first) first.focus();
      }

function closeMenu(restoreFocus) {
        if (menu.classList.contains('hidden')) return;
        menu.classList.add('hidden');
        if (menuTrigger) {
          menuTrigger.setAttribute('aria-expanded', 'false');
          if (restoreFocus !== false) menuTrigger.focus();
        }
        menuTrigger = null;
      }

function paintMenu(id) {
        var entry = reactions[id];
        var reported = hasPendingReport(id);

        menuItems().forEach(function (item) {
          var action = item.getAttribute('data-action');
          var isReaction = action === 'like' || action === 'dislike';
          var checked = isReaction && entry === action;
          var check = item.querySelector('[data-check]');
          var icon = item.querySelector('[data-icon]');

          item.classList.toggle('bg-surface-soft', checked);
          item.classList.toggle('text-primary', checked);
          if (isReaction) item.setAttribute('aria-checked', checked ? 'true' : 'false');
          /* The report item has no check mark, so both nodes are optional. */
          if (check) check.classList.toggle('hidden', !checked);
          if (icon) {
            icon.classList.toggle('text-primary', checked);
            icon.classList.toggle('text-ink-muted', !checked);
          }

          if (action === 'report') {
            item.setAttribute('aria-disabled', reported ? 'true' : 'false');
            item.classList.toggle('text-ink-muted', reported);
            item.title = reported ? 'Komentar ini sudah kamu laporkan' : '';
          }
        });
      }

function menuItems() {
        return Array.prototype.slice.call(menu.querySelectorAll('.comment-menu-item'));
      }

function commentFromTrigger(trigger) {
        var article = trigger.closest('.review-item');
        if (!article) return null;
        var author = article.querySelector('.review-author');
        var body = article.querySelector('.review-body');
        return {
          id: article.getAttribute('data-comment-id'),
          author: author ? author.textContent.trim() : '',
          text: body ? body.textContent.trim() : ''
        };
      }

function openReport(comment, trigger) {
        activeComment = comment;
        returnFocus = trigger || null;
        busy = false;
        submitBtn.textContent = 'Kirim Laporan';

        $('report-author').textContent = comment.author;
        $('report-preview').textContent = comment.text;
        var book = bookName();
        $('report-book').textContent = book ? 'Ulasan pada ' + book : 'Ulasan pembaca';

        var checked = reasonWrap.querySelector('input[name="report-reason"]:checked');
        if (checked) checked.checked = false;
        detailsField.value = '';
        hideError();
        refreshState();

        modal.classList.remove('hidden');
        lockScroll(true);
        detailsField.blur();
        var firstReason = reasonWrap.querySelector('input[name="report-reason"]');
        if (firstReason) firstReason.focus();
      }

function closeReport() {
        if (modal.classList.contains('hidden')) return;
        modal.classList.add('hidden');
        lockScroll(false);
        activeComment = null;
        detailsField.value = '';
        var checked = reasonWrap.querySelector('input[name="report-reason"]:checked');
        if (checked) checked.checked = false;
        hideError();
        if (returnFocus) {
          returnFocus.focus();
          returnFocus = null;
        }
      }

function submitReport() {
        if (busy || !activeComment) return;

        var reason = reasonById(selectedReason());
        if (!reason) {
          showError('Pilih alasan pelaporan terlebih dahulu.');
          return;
        }

        var details = detailsField.value.trim();
        if (reason.id === 'other' && !details) {
          showError('Keterangan wajib diisi untuk alasan lainnya.');
          detailsField.focus();
          return;
        }
        if (details.length > DETAIL_LIMIT) {
          showError('Keterangan maksimal ' + DETAIL_LIMIT + ' karakter.');
          return;
        }
        if (hasPendingReport(activeComment.id)) {
          closeReport();
          showToast('Komentar ini sudah kamu laporkan.');
          return;
        }

        var commentId = activeComment.id;
        busy = true;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Mengirim...';
        hideError();

        window.setTimeout(function () {
          try {
            reports.push({
              reportId: 'RPT-DEMO-' + String(reports.length + 1).padStart(3, '0'),
              commentId: commentId,
              reporterUserId: REPORTER_USER_ID,
              reasonId: reason.id,
              reasonLabel: reason.label,
              moderationCategory: reason.category,
              details: details,
              createdAt: new Date().toISOString(),
              status: 'pending'
            });
            writeStore(REPORT_KEY, reports);

            busy = false;
            submitBtn.textContent = 'Kirim Laporan';
            closeReport();
            showToast('Simulasi laporan berhasil dikirim');
          } catch (err) {
            busy = false;
            submitBtn.textContent = 'Kirim Laporan';
            refreshState();
            showError('Terjadi kendala. Coba lagi.', 'Laporan belum dapat dikirim');
          }
        }, 600);
      }

function openModal() {
        book = readBook();
        if (!book) return;
        busy = false;
        submitBtn.textContent = 'Kirim Laporan';

        $('book-report-book-title').textContent = book.title;
        $('book-report-book-author').textContent = book.author;
        $('book-report-book-publisher').textContent = book.publisher;
        var coverEl = $('book-report-cover');
        coverEl.src = book.cover;
        coverEl.alt = book.title ? 'Sampul ' + book.title : '';

        var checked = typeWrap.querySelector('input[name="book-report-type"]:checked');
        if (checked) checked.checked = false;
        sectionInput.value = '';
        detailsField.value = '';
        hideError();
        hideNotice();
        applyReason(null);

        modal.classList.remove('hidden');
        lockScroll(true);
        var firstType = typeWrap.querySelector('input[name="book-report-type"]');
        if (firstType) firstType.focus();
      }

function closeModal() {
        if (modal.classList.contains('hidden')) return;
        modal.classList.add('hidden');
        lockScroll(false);
        if (trigger) trigger.focus();
      }

function applyReason(reason) {
        /* Switching category clears the previous answers, so a report never
           carries text typed for a different category. Re-selecting the same
           category keeps what the user already typed. */
        var nextId = reason ? reason.id : '';
        var changed = nextId !== currentReasonId;
        currentReasonId = nextId;
        if (changed) {
          detailsField.value = '';
          sectionInput.value = '';
        }

        if (!reason) {
          sectionField.classList.add('hidden');
          sectionInput.value = '';
          detailsLabel.textContent = 'Keterangan tambahan';
          detailsField.placeholder = 'Jelaskan masalah pada buku ini...';
          detailsField.value = '';
          hideNotice();
          refreshState();
          return;
        }

        sectionField.classList.toggle('hidden', !reason.section);
        if (!reason.section) sectionInput.value = '';

        detailsLabel.textContent = reason.detailsLabel;
        detailsField.placeholder = reason.detailsPlaceholder;

        var duplicate = hasOpenReport(reason.id, book ? book.id : '');
        if (duplicate) {
          noticeEl.textContent = 'Buku ini sudah kamu laporkan untuk masalah tersebut.';
          noticeEl.classList.remove('hidden');
        } else {
          hideNotice();
        }
        refreshState();
      }

function buildReasons() {
        REASONS.forEach(function (reason) {
          var label = document.createElement('label');
          label.className = 'flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-surface-neutral';

          var input = document.createElement('input');
          input.type = 'radio';
          input.name = 'report-reason';
          input.value = reason.id;
          input.className = 'mt-0.5 h-4 w-4 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';

          var text = document.createElement('span');
          text.className = 'text-[13.5px] leading-snug text-ink-body';
          text.textContent = reason.label;

          label.appendChild(input);
          label.appendChild(text);
          reasonWrap.appendChild(label);
        });
      }

function readStore(key, fallback) {
        try {
          var raw = window.localStorage.getItem(key);
          if (!raw) return fallback;
          var parsed = JSON.parse(raw);
          return parsed && typeof parsed === 'object' ? parsed : fallback;
        } catch (e) { return fallback; }
      }

function writeStore(key, value) {
        try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
      }

function hasOpenReport(reasonId, bookId) {
        if (!bookId) return false;
        return reports.some(function (r) {
          return r.bookId === bookId &&
            r.reporterUserId === REPORTER_USER_ID &&
            r.reportTypeId === reasonId &&
            r.reportStatus === 'baru';
        });
      }

function showError(message) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
      }

function hideError() {
        errorEl.textContent = '';
        errorEl.classList.add('hidden');
      }

function bookName() {
        var h1 = document.querySelector('h1');
        return h1 ? h1.textContent.replace(/\s+/g, ' ').trim() : '';
      }

function reasonById(id) {
        for (var i = 0; i < REASONS.length; i++) {
          if (REASONS[i].id === id) return REASONS[i];
        }
        return null;
      }

function articleById(id) {
        return document.querySelector('.review-item[data-comment-id="' + id + '"]');
      }

function repositionMenu() {
        if (menu.classList.contains('hidden') || !menuTrigger) return;
        positionMenu(menuTrigger);
      }

function positionMenu(trigger) {
        var rect = trigger.getBoundingClientRect();
        var width = menu.offsetWidth;
        var height = menu.offsetHeight;
        var left = Math.min(rect.right - width, window.innerWidth - width - 8);
        left = Math.max(8, left);
        var top = rect.bottom + 6;
        if (top + height > window.innerHeight - 8) top = Math.max(8, rect.top - height - 6);
        menu.style.left = left + 'px';
        menu.style.top = top + 'px';
      }