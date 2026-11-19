/*
| Shared buyer-page helpers (toast + cart badge), used by the four P05 pages.
| Toast classes come from partials/buyer/toast.blade.php (ported from the prototype's showToast()).
*/
export { onReady } from '../shared.js';

export function showToast(message) {
    if (window.IkapiBuyerToast) return window.IkapiBuyerToast.show(message);
    return false;
}

/* The prototype bumps the header badge text and briefly scales it. The badge is a demo counter, not a cart store. */
export function bumpCartBadge() {
    var badge = document.querySelector('.ikapi-cart-badge');
    if (!badge) return null;
    var next = (parseInt(badge.textContent.trim(), 10) || 0) + 1;
    badge.textContent = String(next);
    badge.classList.add('scale-125');
    window.setTimeout(function () { badge.classList.remove('scale-125'); }, 200);
    return next;
}
