/*
| Buyer toast. Port of the prototype's showToast() (beranda, katalog, detail, preview):
| set the message, reveal by swapping the movement/opacity utilities, hide again after 2.8s.
| The hidden state utilities differ per page (translate-y-16 on beranda, translate-y-20 elsewhere),
| so the module remembers which class it removed instead of hardcoding one.
*/
(function (window, document) {
    'use strict';

    if (window.IkapiBuyerToast) return;

    var timer = null;

    function show(message) {
        var toast = document.querySelector('[data-ikapi-buyer-toast]');
        var text = document.querySelector('[data-ikapi-buyer-toast-text]');
        if (!toast || !text) return false;

        text.textContent = message;

        var hiddenOffset = toast.classList.contains('translate-y-16') ? 'translate-y-16' : 'translate-y-20';
        toast.dataset.hiddenOffset = hiddenOffset;
        toast.classList.remove(hiddenOffset, 'opacity-0', 'pointer-events-none');
        toast.classList.add('translate-y-0', 'opacity-100');

        window.clearTimeout(timer);
        timer = window.setTimeout(function () {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add(toast.dataset.hiddenOffset || 'translate-y-20', 'opacity-0', 'pointer-events-none');
        }, 2800);

        return true;
    }

    window.IkapiBuyerToast = { show: show };
})(window, document);
