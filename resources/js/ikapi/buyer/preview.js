/*
| Preview Buku (cuplikan) navigation. Port of the script in user/preview_buku_desktop.html:
|   goToPage(index) -> renderPage(index): chapter + title + paragraphs, "Cuplikan N dari M", progress width,
|   prev/next disabled at the ends, smooth scroll back to the article, and the end-of-preview box on the last page.
|   Add to cart: button label swap + toast (the prototype has no header badge on this page).
| Differences kept deliberate: paragraph text is escaped (the prototype injects it raw) and the button label is
| rebuilt from the fixture price instead of a hardcoded string.
*/
import { onReady, showToast } from './shared.js';

onReady(function () {
    var dataEl = document.getElementById('preview-data');
    if (!dataEl) return;

    var data = JSON.parse(dataEl.textContent);
    var pages = data.pages;
    var totalPages = pages.length;
    var currentPageIndex = 0;

    var contentEl = document.getElementById('reader-content');
    var chapterEl = document.getElementById('preview-chapter');
    var titleEl = document.getElementById('preview-title');
    var paragraphsEl = document.getElementById('preview-paragraphs');
    var counterBadge = document.getElementById('preview-counter-badge');
    var progressBar = document.getElementById('preview-progress-bar');
    var btnPrev = document.getElementById('btn-prev');
    var btnNext = document.getElementById('btn-next');

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function renderPage(index) {
        var page = pages[index];
        if (!page || !contentEl) return;

        var isLastPage = index === totalPages - 1;

        if (chapterEl) chapterEl.textContent = page.chapter;
        if (titleEl) titleEl.textContent = page.title;
        if (paragraphsEl) {
            paragraphsEl.innerHTML = page.paragraphs.map(function (p) {
                return '<p class="font-reading text-[17px] sm:text-[18px] text-ink-body leading-[1.85] text-left">' + escapeHtml(p) + '</p>';
            }).join('');
        }

        var existingEnd = document.getElementById('preview-end-box');
        if (existingEnd) existingEnd.remove();
        if (isLastPage && paragraphsEl) {
            var box = document.createElement('div');
            box.id = 'preview-end-box';
            box.className = 'mt-8 pt-6 border-t border-border-subtle bg-surface-neutral p-6 rounded-2xl space-y-3 animate-in fade-in duration-300';
            box.innerHTML =
                '<div class="flex items-center gap-2 text-primary font-bold text-[13px] uppercase tracking-wider">' +
                    '<span class="material-symbols-outlined text-[18px]">verified</span>' +
                    '<span>Akhir Cuplikan Buku</span>' +
                '</div>' +
                '<p class="text-[14px] text-ink-body leading-relaxed">' +
                    'Kamu telah mencapai akhir cuplikan gratis <strong>' + escapeHtml(data.title) + '</strong>. ' +
                    'Lanjutkan membaca seluruh 268 halaman dengan membeli lisensi e-book resmi di IKAPI Store Jawa Barat.' +
                '</p>';
            paragraphsEl.insertAdjacentElement('afterend', box);
        }

        if (counterBadge) counterBadge.textContent = 'Cuplikan ' + page.num + ' dari ' + totalPages;
        if (progressBar) progressBar.style.width = (page.num / totalPages) * 100 + '%';
        if (btnPrev) btnPrev.disabled = index === 0;
        if (btnNext) btnNext.disabled = isLastPage;
    }

    function goToPage(index) {
        if (index < 0 || index >= totalPages) return;
        currentPageIndex = index;
        renderPage(currentPageIndex);
        if (contentEl) contentEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (btnPrev) btnPrev.addEventListener('click', function () { goToPage(currentPageIndex - 1); });
    if (btnNext) btnNext.addEventListener('click', function () { goToPage(currentPageIndex + 1); });

    var addBtn = document.getElementById('btnAddToCart');
    var addLabel = document.getElementById('btnAddToCartText');
    if (addBtn) {
        addBtn.addEventListener('click', function (event) {
            event.preventDefault();
            if (addLabel) {
                addLabel.textContent = 'Ditambahkan ke Keranjang';
                addBtn.classList.add('bg-primary-hover');
                window.setTimeout(function () {
                    addLabel.textContent = 'Beli Buku Penuh (Rp ' + Number(data.price).toLocaleString('id-ID') + ')';
                    addBtn.classList.remove('bg-primary-hover');
                }, 1800);
            }
            showToast(data.title + ' ditambahkan ke keranjang');
        });
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowLeft') goToPage(currentPageIndex - 1);
        if (event.key === 'ArrowRight') goToPage(currentPageIndex + 1);
    });
});
