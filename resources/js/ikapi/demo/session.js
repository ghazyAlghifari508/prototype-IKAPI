/*
| IKAPI demo session + URL helpers (frontend-only).
|
| Mirrors the rules the prototype already implements in per-page scripts (P01 section 3.3):
|   - role demos: buyer / publisher / admin, stored in the ikapi_*_session_demo keys
|   - the publisher portal is only reachable while the demo application is approved
|   - admin pages are not reachable while a buyer demo session exists
|   - `?next=` is restricted to a safe pattern (the prototype uses /^[a-z0-9_-]+\.html$/i)
| These are demo guards, not authorization. In a Laravel build the same rules belong to middleware.
*/
(function (window) {
    'use strict';

    var D = window.IkapiDemo;
    var K = D.keys;
    /* same character set the prototype accepts (no scheme, no host, no traversal) */
    var SAFE_PATH = /^\/?[a-z0-9_\-/]+(?:\.html)?(?:\?[^#\s]*)?$/i;
    /* fixtures use readable ids: B01..B12, BK-01, ev-1..3, community-*, TPC-*, RPL-*, ORD-*, REG-* */
    var SAFE_ID = /^[a-z0-9][a-z0-9\-_]{0,63}$/i;

    function session(role) {
        var key = role === 'admin' ? K.adminSession : K.buyerSession;
        return D.read(key, null);
    }

    function setSession(role, payload) {
        var key = role === 'admin' ? K.adminSession : K.buyerSession;
        return D.write(key, Object.assign({ role: role, at: new Date().toISOString() }, payload || {}));
    }

    function clearSession(role) {
        return D.remove(role === 'admin' ? K.adminSession : K.buyerSession);
    }

    function publisherApplication() {
        return D.read(K.publisherApplication, null);
    }

    /* Portal penerbit guard, same outcome as penerbit/access-guard.js in the prototype. */
    function publisherPortalBlocked() {
        var app = publisherApplication();
        if (!app || !app.status) return false;
        return app.status !== 'approved';
    }

    /* Admin guard, same outcome as admin/admin-guard.js: an existing buyer session blocks the portal. */
    function adminPortalBlocked() {
        var admin = session('admin');
        if (admin && admin.role === 'admin') return false;
        return session('buyer') !== null;
    }

    function idParam(name, search) {
        var value = new URLSearchParams(search || window.location.search).get(name);
        return value && SAFE_ID.test(value) ? value : null;
    }

    function safeNext(raw) {
        if (!raw) return null;
        var value = String(raw).trim();
        return SAFE_PATH.test(value) && value.indexOf('//') === -1 ? value : null;
    }

    /* Missing-content helper for later pages: toggles a "not found" block and hides the content block,
       the same two-state pattern the prototype uses for agenda/komunitas/404 cases. */
    function showMissingState(contentEl, missingEl) {
        if (contentEl) contentEl.classList.add('hidden');
        if (missingEl) missingEl.classList.remove('hidden');
    }

    window.IkapiSession = {
        session: session,
        setSession: setSession,
        clearSession: clearSession,
        publisherApplication: publisherApplication,
        publisherPortalBlocked: publisherPortalBlocked,
        adminPortalBlocked: adminPortalBlocked,
        idParam: idParam,
        safeNext: safeNext,
        isValidId: function (v) { return typeof v === 'string' && SAFE_ID.test(v); },
        showMissingState: showMissingState,
    };
})(window);
