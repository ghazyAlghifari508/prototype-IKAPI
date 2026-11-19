/*
| Portal toast behaviour for <x-ikapi.toast>. Same timing and DOM effect as the prototype `toast(t)`:
| set text, reveal, hide after 2800ms (the last call wins).
|
|   window.IkapiToast.show('Pencairan diperbarui.');
*/
(function (window, document) {
    'use strict';

    if (window.IkapiToast) return;

    var timer = null;

    function show(message) {
        var box = document.querySelector('[data-ikapi-toast]');
        var text = document.querySelector('[data-ikapi-toast-text]');
        if (!box || !text) return false;
        text.textContent = message;
        box.classList.remove('hidden');
        window.clearTimeout(timer);
        timer = window.setTimeout(function () { box.classList.add('hidden'); }, 2800);
        return true;
    }

    window.IkapiToast = { show: show };
})(window, document);
