/*
| Modal behaviour for <x-ikapi.modal>.
|
| Ported from the portal pages (kelola_pengguna, kelola_pencairan, ...): open adds focus + scroll lock,
| close restores them, Escape closes the top-most modal, a click on the backdrop closes. Triggers and
| closers are data attributes, so the same component can repeat on a page without sharing ids.
|
|   <button data-ikapi-modal-open="modal-approve">...</button>
|   <button data-ikapi-modal-close>...</button>        (inside the modal; the backdrop carries it too)
|
| Programmatic API: window.IkapiModal.open(id, triggerEl) / .close(id).
*/
(function (window, document) {
    'use strict';

    if (window.IkapiModal) return;

    var stack = [];
    var lastTrigger = {};
    var previousOverflow = '';

    function el(id) { return document.getElementById(id); }

    function open(id, trigger) {
        var root = el(id);
        if (!root) return false;
        if (!stack.length) previousOverflow = document.body.style.overflow;
        lastTrigger[id] = trigger || document.activeElement;
        root.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        if (stack.indexOf(id) === -1) stack.push(id);
        var panel = root.querySelector('[role="dialog"]');
        var first = panel && panel.querySelector('input, textarea, select, button, [href]');
        window.setTimeout(function () { (first || panel).focus(); }, 0);
        return true;
    }

    function close(id) {
        var root = el(id);
        if (!root) return false;
        root.classList.add('hidden');
        var i = stack.indexOf(id);
        if (i !== -1) stack.splice(i, 1);
        if (!stack.length) document.body.style.overflow = previousOverflow;
        var back = lastTrigger[id];
        if (back && typeof back.focus === 'function') back.focus();
        return true;
    }

    document.addEventListener('click', function (e) {
        var opener = e.target.closest('[data-ikapi-modal-open]');
        if (opener) {
            e.preventDefault();
            open(opener.getAttribute('data-ikapi-modal-open'), opener);
            return;
        }
        var closer = e.target.closest('[data-ikapi-modal-close]');
        if (closer) {
            var root = closer.closest('[data-ikapi-modal]');
            if (root) close(root.id);
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && stack.length) close(stack[stack.length - 1]);
    });

    window.IkapiModal = { open: open, close: close, isOpen: function (id) { return stack.indexOf(id) !== -1; } };
})(window, document);
