/*
| Beranda interactions. Ported from user/beranda_desktop.html (script block at the end of the page):
|   - hero carousel: 3 slides, autoplay every 6000ms, prev/next/dots, stops on hover/focus, honours reduced motion
|   - agenda strip: scroll by 340px, smooth
|   - share event: clipboard write of origin+pathname+#agenda, toast with the event title
|   - add to cart (shelf + agenda cards): bump the header badge, toast like the prototype
| Hooks: the carousel keeps the prototype ids; cart buttons keep .btn-add-to-cart / data-book-* attributes.
*/
import { onReady, showToast, bumpCartBadge } from './shared.js';

onReady(function () {
    /* ---------------- Hero carousel ---------------- */
    var carousel = document.getElementById('hero-carousel');
    var slides = Array.prototype.slice.call(document.querySelectorAll('.carousel-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.carousel-dot'));
    var prev = document.getElementById('carousel-prev');
    var next = document.getElementById('carousel-next');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var current = 0;
    var autoplay = null;

    function updateSlide(index) {
        if (!slides.length) return;
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            var active = i === current;
            slide.classList.toggle('opacity-100', active);
            slide.classList.toggle('z-10', active);
            slide.classList.toggle('opacity-0', !active);
            slide.classList.toggle('z-0', !active);
            slide.classList.toggle('pointer-events-none', !active);
            slide.setAttribute('aria-hidden', active ? 'false' : 'true');
        });
        dots.forEach(function (dot, i) {
            var active = i === current;
            dot.classList.toggle('w-7', active);
            dot.classList.toggle('bg-primary', active);
            dot.classList.toggle('w-2', !active);
            dot.classList.toggle('bg-[#ffffffb3]', !active);
            dot.classList.toggle('hover:bg-white', !active);
            dot.setAttribute('aria-selected', active ? 'true' : 'false');
        });
    }

    function startAutoplay() {
        if (reduced || !slides.length) return;
        stopAutoplay();
        autoplay = window.setInterval(function () { updateSlide(current + 1); }, 6000);
    }

    function stopAutoplay() {
        if (autoplay) { window.clearInterval(autoplay); autoplay = null; }
    }

    if (carousel && slides.length) {
        if (next) next.addEventListener('click', function () { updateSlide(current + 1); });
        if (prev) prev.addEventListener('click', function () { updateSlide(current - 1); });
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () { updateSlide(Number(dot.getAttribute('data-dot')) || 0); });
        });
        carousel.addEventListener('mouseenter', stopAutoplay);
        carousel.addEventListener('mouseleave', startAutoplay);
        carousel.addEventListener('focusin', stopAutoplay);
        carousel.addEventListener('focusout', startAutoplay);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft' && document.activeElement && carousel.contains(document.activeElement)) updateSlide(current - 1);
            if (e.key === 'ArrowRight' && document.activeElement && carousel.contains(document.activeElement)) updateSlide(current + 1);
        });
        startAutoplay();
    }

    /* ---------------- Agenda strip ---------------- */
    var agenda = document.getElementById('agenda-scroll-container');
    var agendaPrev = document.getElementById('agenda-scroll-prev');
    var agendaNext = document.getElementById('agenda-scroll-next');
    if (agenda && agendaPrev && agendaNext) {
        agendaPrev.addEventListener('click', function () { agenda.scrollBy({ left: -340, behavior: 'smooth' }); });
        agendaNext.addEventListener('click', function () { agenda.scrollBy({ left: 340, behavior: 'smooth' }); });
    }

    /* ---------------- Share event ---------------- */
    document.querySelectorAll('.btn-share-event').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var title = btn.getAttribute('data-title') || 'Agenda Literasi IKAPI';
            var url = window.location.origin + window.location.pathname + '#agenda';
            if (navigator.clipboard) {
                navigator.clipboard.writeText(url).then(function () {
                    showToast('Tautan "' + title + '" berhasil disalin');
                }).catch(function () {
                    showToast('Tautan "' + title + '" siap dibagikan');
                });
            } else {
                showToast('Tautan "' + title + '" siap dibagikan');
            }
        });
    });

    /* ---------------- Add to cart (shelf cards) ---------------- */
    document.querySelectorAll('.btn-add-to-cart').forEach(function (btn) {
        btn.addEventListener('click', function (event) {
            event.preventDefault();
            var title = btn.getAttribute('data-book-title') || 'Buku';
            bumpCartBadge();
            showToast('"' + title + '" berhasil ditambahkan ke keranjang');
        });
    });
});
