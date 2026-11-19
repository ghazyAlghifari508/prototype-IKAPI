/*
| Shell interactions (vanilla JS, no framework).
|
| Ported behaviour, not redesigned:
|   - portal drawer: penerbit/dashboard_penerbit_desktop.html lines 664-690
|       open  -> sidebar.is-open, scrim visible, toggle aria-expanded=true, body scroll locked, focus first link
|       close -> reverse, focus returns to the toggle; Escape, scrim click and link click all close it
|   - portal notification panel: toggle on click, close on outside click and Escape, aria-expanded kept in sync
|   - buyer account dropdown: toggle, close on outside click and Escape, aria-expanded kept in sync
|
| Rules
|   - hooks are data attributes (data-ikapi-*), never global ids, so a component can repeat on a page
|   - each document-level listener is registered once (guarded by a flag on window)
|   - works with elements that exist at DOMContentLoaded; nothing here touches page-specific markup
*/
(function (window, document) {
    'use strict';

    if (window.__ikapiShellBound) return;
    window.__ikapiShellBound = true;

    function ready(fn) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
        else fn();
    }

    ready(function () {
        var sidebar = document.getElementById('publisher-sidebar');
        var scrim = document.querySelector('[data-ikapi-sidebar-scrim]');
        var toggle = document.querySelector('[data-ikapi-sidebar-toggle]');

        function openSidebar() {
            if (!sidebar || !toggle) return;
            sidebar.classList.add('is-open');
            if (scrim) scrim.classList.remove('hidden');
            toggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
            var first = sidebar.querySelector('a');
            if (first) first.focus();
        }

        function closeSidebar() {
            if (!sidebar || !toggle || !sidebar.classList.contains('is-open')) return;
            sidebar.classList.remove('is-open');
            if (scrim) scrim.classList.add('hidden');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            toggle.focus();
        }

        if (sidebar && toggle) {
            toggle.addEventListener('click', function () {
                if (sidebar.classList.contains('is-open')) closeSidebar();
                else openSidebar();
            });
            if (scrim) scrim.addEventListener('click', closeSidebar);
            sidebar.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeSidebar); });
        }

        var notifBtn = document.querySelector('[data-ikapi-notif-toggle]');
        var notifPanel = document.querySelector('[data-ikapi-notif-panel]');

        function closeNotif() {
            if (!notifBtn || !notifPanel) return;
            notifPanel.classList.add('hidden');
            notifBtn.setAttribute('aria-expanded', 'false');
        }

        if (notifBtn && notifPanel) {
            notifBtn.addEventListener('click', function () {
                var willOpen = notifPanel.classList.contains('hidden');
                notifPanel.classList.toggle('hidden', !willOpen);
                notifBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
            });
        }

        var dropdowns = Array.prototype.slice.call(document.querySelectorAll('[data-ikapi-dropdown]'));

        function closeDropdown(root) {
            var btn = root.querySelector('[data-ikapi-dropdown-toggle]');
            var menu = root.querySelector('[data-ikapi-dropdown-menu]');
            if (!btn || !menu) return;
            menu.classList.add('hidden');
            btn.setAttribute('aria-expanded', 'false');
        }

        dropdowns.forEach(function (root) {
            var btn = root.querySelector('[data-ikapi-dropdown-toggle]');
            var menu = root.querySelector('[data-ikapi-dropdown-menu]');
            if (!btn || !menu) return;
            btn.addEventListener('click', function () {
                var willOpen = menu.classList.contains('hidden');
                dropdowns.forEach(closeDropdown);
                menu.classList.toggle('hidden', !willOpen);
                btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
            });
        });

        document.addEventListener('click', function (e) {
            if (notifBtn && notifPanel && !notifPanel.contains(e.target) && !notifBtn.contains(e.target)) closeNotif();
            dropdowns.forEach(function (root) { if (!root.contains(e.target)) closeDropdown(root); });
        });

        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape') return;
            closeNotif();
            dropdowns.forEach(closeDropdown);
            closeSidebar();
        });

        window.IkapiShell = { openSidebar: openSidebar, closeSidebar: closeSidebar };
    });
})(window, document);
