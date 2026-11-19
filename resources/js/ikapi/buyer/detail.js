/*
| Detail Buku interactions. Port of the two script blocks in user/detail_buku_desktop.html:
|   1. shopping actions: rating stars + review, add to cart, wishlist toggle, related-book cart buttons
|   2. comment actions: reaction menu (Suka / Tidak Suka) and the two report dialogs
|      ("Laporkan Komentar" + "Laporkan Buku") with their moderation-shaped local records
|
| Kept from the prototype: every message, the star label wording, the 500/80 character limits, the duplicate
| report guard, the record shapes (RPT-DEMO-xxx / LPR-DEMO-xxx) and the body-scroll lock used by the dialogs.
|
| Deliberate changes, documented in docs/migration/p5-buyer-core.md:
|   - the rating key is per book (ikapi_rating_<slug>); the prototype's only book keeps its historical key
|     ikapi_rating_laskar_aksara so a rating saved by the HTML prototype is still read
|   - injected review content is escaped (the prototype builds it with raw template strings)
|   - inline onclick handlers were replaced by data hooks
*/
import { onReady, showToast, bumpCartBadge } from './shared.js';

onReady(function () {
    var section = document.getElementById('book-detail');
    if (!section) return;

    var slug = section.getAttribute('data-book-slug') || '';
    var bookId = section.getAttribute('data-book-id') || '';
    var isReferenceBook = slug === 'laskar-aksara-pasundan';
    var RATING_STORAGE_KEY = isReferenceBook ? 'ikapi_rating_laskar_aksara' : 'ikapi_rating_' + slug;

    var RATING_LABELS = {
        1: 'Sangat kurang (1 bintang)',
        2: 'Kurang (2 bintang)',
        3: 'Cukup (3 bintang)',
        4: 'Bagus (4 bintang)',
        5: 'Sangat bagus (5 bintang)',
    };

    var REACTION_KEY = 'ikapi_comment_reactions_demo';
    var REPORT_KEY = 'ikapi_comment_reports_demo';
    var BOOK_REPORT_KEY = 'ikapi_book_reports_demo';
    var DETAIL_LIMIT = 500;
    var SECTION_LIMIT = 80;
    var REPORTER_USER_ID = (window.IkapiSession && window.IkapiSession.session('buyer') && window.IkapiSession.session('buyer').id) || 'USR-PMB-0042';

    var $ = function (id) { return document.getElementById(id); };

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
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
        try { window.localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
    }

    function lockScroll(on) {
        if (on) {
            lockScroll.y = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = -lockScroll.y + 'px';
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.width = '100%';
        } else {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.width = '';
            window.scrollTo(0, lockScroll.y || 0);
        }
    }

    function bookName() {
        var h1 = document.querySelector('h1');
        return h1 ? h1.textContent.replace(/\s+/g, ' ').trim() : '';
    }

    /* ------------------------------------------------------------------ rating */
    var selectedRating = 0;

    function renderStarVisuals(upTo) {
        document.querySelectorAll('.star-btn').forEach(function (btn) {
            var val = parseInt(btn.getAttribute('data-rating'), 10);
            btn.classList.toggle('is-active', val <= upTo);
            btn.setAttribute('aria-checked', val <= upTo ? 'true' : 'false');
        });
    }

    function setRatingLabel(text) {
        var label = $('star-rating-label');
        if (label) label.textContent = text;
    }

    function selectStarRating(val) {
        selectedRating = val;
        renderStarVisuals(selectedRating);
        setRatingLabel('Rating kamu: ' + RATING_LABELS[selectedRating]);
    }

    function updateRatingSummaryDisplay() {
        var badge = $('review-count-badge');
        if (!badge) return;
        var base = document.querySelectorAll('#reviews-list-container .review-item:not(#user-submitted-review)').length;
        badge.textContent = selectedRating === 0 ? base + ' ulasan' : (base + 1) + ' ulasan (termasuk kamu)';
    }

    function injectUserReviewInList(data) {
        var container = $('reviews-list-container');
        if (!container) return;
        var existing = $('user-submitted-review');
        if (!existing) {
            existing = document.createElement('article');
            existing.id = 'user-submitted-review';
            existing.className = 'review-item py-4 first:pt-0 border-b border-border-subtle bg-[#f5f6ff99] p-4 rounded-2xl mb-3 flex flex-col gap-1.5 transition-all';
            existing.setAttribute('data-comment-id', 'CMT-USER');
            container.insertBefore(existing, container.firstChild);
        }
        var stars = '';
        for (var i = 1; i <= 5; i++) {
            stars += '<span class="material-symbols-outlined text-[16px] ' + (i <= data.rating ? 'text-primary' : 'text-ink-subtle') + '">star</span>';
        }
        existing.innerHTML =
            '<div class="flex items-start justify-between gap-3">' +
                '<div class="flex min-w-0 flex-col gap-0.5">' +
                    '<span class="review-author text-[14px] font-bold text-ink-body">Kamu</span>' +
                    '<time class="text-[12px] text-ink-muted">' + escapeHtml(data.date || '') + '</time>' +
                '</div>' +
                '<span class="flex items-center gap-0.5">' + stars + '</span>' +
            '</div>' +
            (data.text ? '<p class="review-body text-[14px] text-ink-body leading-relaxed">' + escapeHtml(data.text) + '</p>' : '');
    }

    function submitUserRating() {
        if (selectedRating === 0) {
            showToast('Pilih jumlah bintang terlebih dahulu');
            return;
        }
        var input = $('user-review-text');
        var data = {
            rating: selectedRating,
            text: input ? input.value.trim() : '',
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        };
        var stored = writeStore(RATING_STORAGE_KEY, data);
        injectUserReviewInList(data);
        updateRatingSummaryDisplay();
        var cancel = $('btn-cancel-rating');
        if (cancel) cancel.classList.remove('hidden');
        showToast(stored ? 'Penilaian tersimpan di peramban ini' : 'Penilaian tampil, tetapi tidak dapat disimpan di peramban ini');
    }

    function resetUserRating() {
        selectedRating = 0;
        try { window.localStorage.removeItem(RATING_STORAGE_KEY); } catch (e) { /* storage disabled */ }
        renderStarVisuals(0);
        setRatingLabel('Rating kamu: Belum dipilih');
        var input = $('user-review-text');
        if (input) input.value = '';
        var mine = $('user-submitted-review');
        if (mine) mine.remove();
        var cancel = $('btn-cancel-rating');
        if (cancel) cancel.classList.add('hidden');
        updateRatingSummaryDisplay();
        showToast('Penilaian dihapus');
    }

    function loadSavedRating() {
        var data = readStore(RATING_STORAGE_KEY, null);
        if (data && data.rating) {
            selectStarRating(data.rating);
            var input = $('user-review-text');
            if (input && data.text) input.value = data.text;
            injectUserReviewInList(data);
            var cancel = $('btn-cancel-rating');
            if (cancel) cancel.classList.remove('hidden');
        }
        updateRatingSummaryDisplay();
        renderStarVisuals(selectedRating);
    }

    document.querySelectorAll('.star-btn').forEach(function (btn) {
        var val = parseInt(btn.getAttribute('data-rating'), 10);
        btn.addEventListener('click', function () { selectStarRating(val); });
        btn.addEventListener('mouseenter', function () { renderStarVisuals(val); setRatingLabel('Rating kamu: ' + RATING_LABELS[val]); });
        btn.addEventListener('mouseleave', function () {
            renderStarVisuals(selectedRating);
            setRatingLabel(selectedRating > 0 ? 'Rating kamu: ' + RATING_LABELS[selectedRating] : 'Rating kamu: Belum dipilih');
        });
    });
    if ($('btn-submit-rating')) $('btn-submit-rating').addEventListener('click', submitUserRating);
    if ($('btn-cancel-rating')) $('btn-cancel-rating').addEventListener('click', resetUserRating);

    /* ------------------------------------------------------------------ cart + wishlist */
    function handleAddToCart(title) {
        bumpCartBadge();
        var btn = $('btnAddToCart');
        var label = $('btnAddToCartText');
        if (btn && label) {
            var original = label.textContent;
            label.textContent = 'Ditambahkan';
            btn.classList.add('bg-primary-hover');
            window.setTimeout(function () {
                label.textContent = original;
                btn.classList.remove('bg-primary-hover');
            }, 1500);
        }
        showToast('"' + (title || bookName()) + '" berhasil ditambahkan ke keranjang');
    }

    var addBtn = $('btnAddToCart');
    if (addBtn) addBtn.addEventListener('click', function () { handleAddToCart(addBtn.getAttribute('data-book-title') || bookName()); });

    document.querySelectorAll('.btn-add-to-cart').forEach(function (btn) {
        btn.addEventListener('click', function (event) {
            event.preventDefault();
            var card = btn.closest('article');
            var title = btn.getAttribute('data-book-title') || (card ? (card.querySelector('h3') || {}).textContent : '') || 'Buku';
            handleAddToCart(title.trim());
        });
    });

    var wishlistBtn = $('btnWishlist');
    var wishlistIcon = $('wishlistIcon');
    var isWishlisted = false;
    if (wishlistBtn && wishlistIcon) {
        wishlistBtn.addEventListener('click', function () {
            isWishlisted = !isWishlisted;
            if (isWishlisted) {
                wishlistIcon.textContent = 'favorite';
                wishlistIcon.classList.add('text-primary');
                wishlistBtn.setAttribute('aria-label', 'Hapus dari Favorit');
                showToast('Buku ditambahkan ke favorit');
            } else {
                wishlistIcon.textContent = 'favorite_border';
                wishlistIcon.classList.remove('text-primary');
                wishlistBtn.setAttribute('aria-label', 'Tambah ke Favorit');
                showToast('Buku dihapus dari favorit');
            }
        });
    }

    /* ------------------------------------------------------------------ comment menu */
    var REASONS = [
        { id: 'spam', label: 'Spam atau promosi', category: 'Spam & Promosi Eksternal' },
        { id: 'abuse', label: 'Kata kasar atau pelecehan', category: 'Kata Kasar & Provokasi' },
        { id: 'hate', label: 'Ujaran kebencian atau diskriminasi', category: 'Ujaran Kebencian' },
        { id: 'privacy', label: 'Membagikan informasi pribadi', category: 'Informasi Pribadi' },
        { id: 'other', label: 'Alasan lainnya', category: 'Lainnya' },
    ];

    var menu = $('comment-menu');
    var reactions = readStore(REACTION_KEY, {});
    var commentReports = readStore(REPORT_KEY, []);
    var menuTrigger = null;
    var activeComment = null;

    function reasonById(id) {
        for (var i = 0; i < REASONS.length; i++) if (REASONS[i].id === id) return REASONS[i];
        return null;
    }

    function hasPendingReport(commentId) {
        return commentReports.some(function (r) {
            return r.commentId === commentId && r.reporterUserId === REPORTER_USER_ID && r.status === 'pending';
        });
    }

    function paintMenu(commentId) {
        var reaction = reactions[commentId];
        menu.querySelectorAll('.comment-menu-item').forEach(function (item) {
            var action = item.getAttribute('data-action');
            var isReaction = action === 'like' || action === 'dislike';
            var checked = isReaction && reaction === action;
            var check = item.querySelector('[data-check]');
            item.classList.toggle('bg-surface-soft', checked || (action === 'report' && hasPendingReport(commentId)));
            item.classList.toggle('text-primary', checked);
            if (isReaction) item.setAttribute('aria-checked', checked ? 'true' : 'false');
            if (check) check.classList.toggle('hidden', !checked);
            if (action === 'report') item.disabled = hasPendingReport(commentId);
        });
    }

    function positionMenu(trigger) {
        if (!menu) return;
        var rect = trigger.getBoundingClientRect();
        var width = menu.offsetWidth, height = menu.offsetHeight;
        var left = Math.min(rect.right - width, window.innerWidth - width - 8);
        menu.style.left = Math.max(8, left) + 'px';
        var top = rect.bottom + 6;
        if (top + height > window.innerHeight - 8) top = Math.max(8, rect.top - height - 6);
        menu.style.top = top + 'px';
    }

    function closeMenu(restoreFocus) {
        if (!menu || menu.classList.contains('hidden')) return;
        menu.classList.add('hidden');
        if (menuTrigger) {
            menuTrigger.setAttribute('aria-expanded', 'false');
            if (restoreFocus !== false) menuTrigger.focus();
        }
        menuTrigger = null;
    }

    function openMenu(trigger) {
        var article = trigger.closest('.review-item');
        if (!article) return;
        closeMenu(false);
        activeComment = {
            id: article.getAttribute('data-comment-id'),
            author: (article.querySelector('.review-author') || {}).textContent || '',
            text: (article.querySelector('.review-body') || {}).textContent || '',
        };
        menuTrigger = trigger;
        paintMenu(activeComment.id);
        menu.classList.remove('hidden');
        trigger.setAttribute('aria-expanded', 'true');
        positionMenu(trigger);
        var first = menu.querySelector('.comment-menu-item');
        if (first) first.focus();
    }

    document.querySelectorAll('.comment-menu-btn').forEach(function (btn) {
        btn.addEventListener('click', function (event) {
            event.stopPropagation();
            if (menuTrigger === btn) closeMenu();
            else openMenu(btn);
        });
    });

    if (menu) {
        menu.addEventListener('click', function (event) {
            var item = event.target.closest('.comment-menu-item');
            if (!item || !activeComment || item.disabled) return;
            var action = item.getAttribute('data-action');
            if (action === 'report') {
                var comment = activeComment;
                closeMenu(false);
                openReport(comment, menuTrigger);
                return;
            }
            reactions[activeComment.id] = reactions[activeComment.id] === action ? null : action;
            writeStore(REACTION_KEY, reactions);
            paintMenu(activeComment.id);
            var flag = reactions[activeComment.id] === action;
            var article = document.querySelector('.review-item[data-comment-id="' + activeComment.id + '"]');
            var badge = article ? article.querySelector('.review-reaction') : null;
            if (badge) {
                if (flag) {
                    badge.classList.remove('hidden');
                    badge.classList.add('flex');
                    var icon = badge.querySelector('[data-reaction-icon]');
                    var label = badge.querySelector('[data-reaction-label]');
                    if (icon) icon.textContent = action === 'like' ? 'thumb_up' : 'thumb_down';
                    if (label) label.textContent = action === 'like' ? 'Suka' : 'Tidak suka';
                } else {
                    badge.classList.add('hidden');
                    badge.classList.remove('flex');
                }
            }
            closeMenu();
        });
    }

    document.addEventListener('click', function (event) {
        if (menu && !menu.classList.contains('hidden') && !menu.contains(event.target)) closeMenu();
    });
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && menu && !menu.classList.contains('hidden')) closeMenu();
    });
    window.addEventListener('resize', function () { if (menuTrigger && menu && !menu.classList.contains('hidden')) positionMenu(menuTrigger); });

    /* ------------------------------------------------------------------ report a comment */
    var reportModal = $('report-modal');
    var reasonWrap = $('report-reasons');
    var reportDetails = $('report-details');
    var reportError = $('report-error');
    var reportSubmit = $('report-submit');
    var reportCancel = $('report-cancel');
    var reportReturnFocus = null;
    var reportBusy = false;

    function buildReasons() {
        if (!reasonWrap) return;
        reasonWrap.innerHTML = ''; // idempotent: never render the list twice
        REASONS.forEach(function (reason) {
            var label = document.createElement('label');
            label.className = 'flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-surface-neutral';
            label.innerHTML =
                '<input type="radio" name="report-reason" value="' + reason.id + '" class="mt-0.5 h-4 w-4 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#673de666]">' +
                '<span class="text-[13.5px] leading-snug text-ink-body">' + escapeHtml(reason.label) + '</span>';
            reasonWrap.appendChild(label);
        });
    }

    function showReportError(message) {
        if (!reportError) return;
        reportError.textContent = message;
        reportError.classList.remove('hidden');
    }

    function hideReportError() {
        if (!reportError) return;
        reportError.textContent = '';
        reportError.classList.add('hidden');
    }

    function openReport(comment, trigger) {
        if (!reportModal) return;
        activeComment = comment;
        reportReturnFocus = trigger || null;
        reportBusy = false;
        if (reportSubmit) { reportSubmit.textContent = 'Kirim Laporan'; reportSubmit.disabled = false; }
        if ($('report-author')) $('report-author').textContent = comment.author;
        if ($('report-preview')) $('report-preview').textContent = comment.text;
        if ($('report-book')) $('report-book').textContent = 'Ulasan pada ' + bookName();
        var checked = reasonWrap ? reasonWrap.querySelector('input[name="report-reason"]:checked') : null;
        if (checked) checked.checked = false;
        if (reportDetails) reportDetails.value = '';
        hideReportError();
        reportModal.classList.remove('hidden');
        lockScroll(true);
        var first = reportModal.querySelector('input[name="report-reason"]');
        if (first) first.focus();
    }

    function closeReport() {
        if (!reportModal || reportModal.classList.contains('hidden')) return;
        reportModal.classList.add('hidden');
        lockScroll(false);
        if (reportReturnFocus) { reportReturnFocus.focus(); reportReturnFocus = null; }
    }

    function submitReport() {
        if (reportBusy || !activeComment) return;
        var picked = reasonWrap ? reasonWrap.querySelector('input[name="report-reason"]:checked') : null;
        if (!picked) { showReportError('Pilih alasan pelaporan terlebih dahulu.'); return; }
        var reason = reasonById(picked.value);
        var details = reportDetails ? reportDetails.value.trim() : '';
        if (reason.id === 'other' && !details) { showReportError('Keterangan wajib diisi untuk alasan lainnya.'); return; }
        if (details.length > DETAIL_LIMIT) { showReportError('Keterangan maksimal ' + DETAIL_LIMIT + ' karakter.'); return; }
        if (hasPendingReport(activeComment.id)) { closeReport(); showToast('Laporan untuk komentar ini sudah dikirim'); return; }

        reportBusy = true;
        if (reportSubmit) { reportSubmit.disabled = true; reportSubmit.textContent = 'Mengirim...'; }
        window.setTimeout(function () {
            commentReports.push({
                reportId: 'RPT-DEMO-' + String(commentReports.length + 1).padStart(3, '0'),
                commentId: activeComment.id,
                reporterUserId: REPORTER_USER_ID,
                reasonId: reason.id,
                reasonLabel: reason.label,
                moderationCategory: reason.category,
                details: details,
                createdAt: new Date().toISOString(),
                status: 'pending',
            });
            var ok = writeStore(REPORT_KEY, commentReports);
            if (!ok) commentReports.pop();
            reportBusy = false;
            if (reportSubmit) { reportSubmit.disabled = false; reportSubmit.textContent = 'Kirim Laporan'; }
            if (!ok) { showReportError('Laporan belum tersimpan. Coba lagi.'); return; }
            closeReport();
            showToast('Simulasi laporan berhasil dikirim');
        }, 400);
    }

    if (reasonWrap) reasonWrap.addEventListener('change', hideReportError);
    if (reportSubmit) reportSubmit.addEventListener('click', submitReport);
    if (reportCancel) reportCancel.addEventListener('click', closeReport);
    if ($('report-close')) $('report-close').addEventListener('click', closeReport);
    if ($('report-scrim')) $('report-scrim').addEventListener('click', closeReport);

    /* ------------------------------------------------------------------ report a book */
    var BOOK_REASONS = [
        { id: 'file', label: 'File e-book bermasalah', desc: 'Buku sulit dibuka atau tampilannya bermasalah.', adminType: 'Berkas E-Book Bermasalah', section: true, required: false, detailsLabel: 'Jelaskan kendalanya (opsional)', detailsPlaceholder: 'Contoh: Halaman 42 tidak bisa dibuka di Web Reader.' },
        { id: 'metadata', label: 'Informasi buku tidak sesuai', desc: 'Judul, penulis, sampul, atau deskripsi keliru.', adminType: 'Metadata Tidak Sesuai', section: false, required: false, detailsLabel: 'Informasi apa yang tidak sesuai? (opsional)', detailsPlaceholder: 'Contoh: Nama penulis berbeda dengan yang tertera di sampul.' },
        { id: 'copyright', label: 'Dugaan pelanggaran hak cipta', desc: 'Ada dugaan buku diterbitkan tanpa izin yang sesuai.', adminType: 'Dugaan Hak Cipta', section: false, required: true, detailsLabel: 'Jelaskan dugaan pelanggarannya', detailsPlaceholder: 'Jelaskan materi atau karya yang diduga digunakan tanpa izin.' },
        { id: 'other', label: 'Masalah lainnya', desc: 'Masalah buku yang tidak termasuk pilihan di atas.', adminType: 'Lainnya', section: false, required: true, detailsLabel: 'Jelaskan masalahnya', detailsPlaceholder: 'Ceritakan masalah yang kamu temukan.' },
    ];

    var bookModal = $('book-report-modal');
    var typeWrap = $('book-report-types');
    var sectionField = $('book-report-section-field');
    var sectionInput = $('book-report-section');
    var bookDetails = $('book-report-details');
    var bookDetailsLabel = $('book-report-details-label');
    var bookError = $('book-report-error');
    var bookSubmit = $('book-report-submit');
    var bookCancel = $('book-report-cancel');
    var bookReports = readStore(BOOK_REPORT_KEY, []);
    var bookTrigger = null;
    var bookBusy = false;
    var currentReasonId = '';

    function readBook() {
        var cover = $('book-cover');
        var publisher = $('book-publisher');
        return {
            id: bookId,
            title: ($('book-title') || {}).textContent ? $('book-title').textContent.trim() : '',
            author: ($('book-author') || {}).textContent ? $('book-author').textContent.trim() : '',
            publisher: publisher ? publisher.textContent.replace(/^Penerbit\s+/, '').trim() : '',
            cover: cover ? cover.getAttribute('src') : '',
        };
    }

    function bookReasonById(id) {
        for (var i = 0; i < BOOK_REASONS.length; i++) if (BOOK_REASONS[i].id === id) return BOOK_REASONS[i];
        return null;
    }

    function hasOpenBookReport(reasonId) {
        return bookReports.some(function (r) {
            return r.bookId === bookId && r.reporterUserId === REPORTER_USER_ID && r.reportTypeId === reasonId && r.reportStatus === 'baru';
        });
    }

    function buildTypes() {
        if (!typeWrap) return;
        typeWrap.innerHTML = ''; // idempotent: never render the list twice
        BOOK_REASONS.forEach(function (reason) {
            var label = document.createElement('label');
            label.className = 'flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-surface-neutral';
            label.innerHTML =
                '<input type="radio" name="book-report-type" value="' + reason.id + '" class="mt-0.5 h-4 w-4 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#673de666]">' +
                '<span class="min-w-0">' +
                    '<span class="block text-[13.5px] font-semibold leading-snug text-ink-body">' + escapeHtml(reason.label) + '</span>' +
                    '<span class="mt-0.5 block text-[12.5px] leading-snug text-ink-muted">' + escapeHtml(reason.desc) + '</span>' +
                '</span>';
            typeWrap.appendChild(label);
        });
    }

    function applyBookReason(reason) {
        var nextId = reason ? reason.id : '';
        if (nextId !== currentReasonId) {
            if (bookDetails) bookDetails.value = '';
            if (sectionInput) sectionInput.value = '';
        }
        currentReasonId = nextId;
        if (sectionField) sectionField.classList.toggle('hidden', !(reason && reason.section));
        if (bookDetailsLabel) bookDetailsLabel.textContent = reason ? reason.detailsLabel : 'Keterangan tambahan';
        if (bookDetails) bookDetails.placeholder = reason ? reason.detailsPlaceholder : 'Jelaskan masalah yang kamu temukan.';
    }

    function showBookError(message) {
        if (!bookError) return;
        bookError.textContent = message;
        bookError.classList.remove('hidden');
    }

    function hideBookError() {
        if (!bookError) return;
        bookError.textContent = '';
        bookError.classList.add('hidden');
    }

    function openBookModal() {
        if (!bookModal) return;
        bookBusy = false;
        if (bookSubmit) { bookSubmit.textContent = 'Kirim Laporan'; bookSubmit.disabled = false; }
        var book = readBook();
        if ($('book-report-book-title')) $('book-report-book-title').textContent = book.title;
        if ($('book-report-book-author')) $('book-report-book-author').textContent = book.author;
        if ($('book-report-book-publisher')) $('book-report-book-publisher').textContent = book.publisher;
        var coverEl = $('book-report-cover');
        if (coverEl) { coverEl.src = book.cover; coverEl.alt = book.title ? 'Sampul ' + book.title : ''; }
        var checked = typeWrap ? typeWrap.querySelector('input[name="book-report-type"]:checked') : null;
        if (checked) checked.checked = false;
        if (sectionInput) sectionInput.value = '';
        if (bookDetails) bookDetails.value = '';
        hideBookError();
        applyBookReason(null);
        bookModal.classList.remove('hidden');
        lockScroll(true);
        var first = bookModal.querySelector('input[name="book-report-type"]');
        if (first) first.focus();
    }

    function closeBookModal() {
        if (!bookModal || bookModal.classList.contains('hidden')) return;
        bookModal.classList.add('hidden');
        lockScroll(false);
        if (bookTrigger) bookTrigger.focus();
    }

    function submitBookReport() {
        if (bookBusy) return;
        var picked = typeWrap ? typeWrap.querySelector('input[name="book-report-type"]:checked') : null;
        if (!picked) { showBookError('Pilih jenis masalah terlebih dahulu.'); return; }
        var reason = bookReasonById(picked.value);
        var details = bookDetails ? bookDetails.value.trim() : '';
        var affectedSection = sectionInput ? sectionInput.value.trim() : '';
        if (reason.required && !details) { showBookError('Keterangan wajib diisi untuk alasan ini.'); return; }
        if (details.length > DETAIL_LIMIT) { showBookError('Keterangan maksimal ' + DETAIL_LIMIT + ' karakter.'); return; }
        if (affectedSection.length > SECTION_LIMIT) { showBookError('Bagian bermasalah maksimal ' + SECTION_LIMIT + ' karakter.'); return; }
        if (hasOpenBookReport(reason.id)) { closeBookModal(); showToast('Laporan untuk buku ini sudah dikirim'); return; }

        bookBusy = true;
        if (bookSubmit) { bookSubmit.disabled = true; bookSubmit.textContent = 'Mengirim...'; }
        window.setTimeout(function () {
            var book = readBook();
            bookReports.push({
                reportId: 'LPR-DEMO-' + String(bookReports.length + 1).padStart(3, '0'),
                bookId: book.id,
                book: book.title,
                author: book.author,
                publisher: book.publisher,
                cover: book.cover,
                reporterUserId: REPORTER_USER_ID,
                reportType: reason.adminType,
                reportTypeId: reason.id,
                affectedSection: affectedSection,
                description: details,
                createdAt: new Date().toISOString(),
                reportStatus: 'baru',
            });
            var ok = writeStore(BOOK_REPORT_KEY, bookReports);
            if (!ok) bookReports.pop();
            bookBusy = false;
            if (bookSubmit) { bookSubmit.disabled = false; bookSubmit.textContent = 'Kirim Laporan'; }
            if (!ok) { showBookError('Laporan belum tersimpan. Coba lagi.'); return; }
            closeBookModal();
            showToast('Simulasi laporan berhasil dikirim');
        }, 400);
    }

    if (typeWrap) typeWrap.addEventListener('change', function () {
        hideBookError();
        var picked = typeWrap.querySelector('input[name="book-report-type"]:checked');
        applyBookReason(picked ? bookReasonById(picked.value) : null);
    });
    if (bookSubmit) bookSubmit.addEventListener('click', submitBookReport);
    if (bookCancel) bookCancel.addEventListener('click', closeBookModal);
    if ($('book-report-close')) $('book-report-close').addEventListener('click', closeBookModal);
    if ($('book-report-scrim')) $('book-report-scrim').addEventListener('click', closeBookModal);

    document.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape') return;
        if (bookModal && !bookModal.classList.contains('hidden')) closeBookModal();
        else if (reportModal && !reportModal.classList.contains('hidden')) closeReport();
    });

    var reportBookBtn = $('btn-report-book');
    if (reportBookBtn) {
        reportBookBtn.addEventListener('click', function () { bookTrigger = reportBookBtn; openBookModal(); });
    }

    /* ------------------------------------------------------------------ init */
    buildReasons();
    buildTypes();
    loadSavedRating();
});