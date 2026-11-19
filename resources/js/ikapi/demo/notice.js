/*
| Demo notice (toast) renderer.
|
| Why this file exists: the prototype shows a toast on 24 pages (P01 section 3.3). Porting that needs a
| shared renderer, and it is also the proof that classes written inside JS are picked up by Tailwind's
| source scanning. Rule kept from the brief: never build class names at runtime (`'bg-' + variant`) -
| every variant below is a complete literal so the scanner sees it.
*/
(function (window) {
    'use strict';

    var VARIANTS = {
        success: {
            wrap: 'fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-border-subtle bg-surface px-4 py-3 shadow-sm',
            icon: 'material-symbols-outlined text-[20px] text-status-success',
            glyph: 'check_circle',
        },
        error: {
            wrap: 'fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-border-subtle bg-surface px-4 py-3 shadow-sm',
            icon: 'material-symbols-outlined text-[20px] text-status-danger',
            glyph: 'error',
        },
        info: {
            wrap: 'fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-border-subtle bg-surface px-4 py-3 shadow-sm',
            icon: 'material-symbols-outlined text-[20px] text-primary',
            glyph: 'info',
        },
    };

    var TEXT_CLASS = 'text-[13.5px] font-semibold text-ink-body';
    var timer = null;

    function show(message, variant) {
        var conf = VARIANTS[variant] || VARIANTS.info;
        var el = document.getElementById('ikapi-demo-notice');

        if (!el) {
            el = document.createElement('div');
            el.id = 'ikapi-demo-notice';
            el.setAttribute('role', 'status');
            el.setAttribute('aria-live', 'polite');
            document.body.appendChild(el);
        }

        el.className = conf.wrap;
        el.innerHTML = '';
        var icon = document.createElement('span');
        icon.className = conf.icon;
        icon.textContent = conf.glyph;
        var text = document.createElement('span');
        text.className = TEXT_CLASS;
        text.textContent = message;
        el.appendChild(icon);
        el.appendChild(text);

        window.clearTimeout(timer);
        timer = window.setTimeout(function () { el.remove(); }, 3200);
        return true;
    }

    window.IkapiNotice = { show: show };
})(window);
