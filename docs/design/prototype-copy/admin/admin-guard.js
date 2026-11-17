/* Prototype authorization gate for the Administrator pages.

   Boundary: there is no backend, so this only demonstrates the rule. A browser that
   is signed in as a Buyer cannot open an Administrator page; the request is sent to
   the administrator login instead. A browser without any session (for example a
   reviewer opening a page directly) is not blocked, and the preview dashboard entry on
   the login page records an explicit administrator preview session first.

   In a Laravel build the same rule belongs to route middleware, not to this file. */
(function () {
  'use strict';

  var BUYER_KEY = 'ikapi_buyer_session_demo';
  var ADMIN_KEY = 'ikapi_admin_session_demo';

  function read(key) {
    try {
      var raw = window.localStorage.getItem(key);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (e) { return null; }
  }

  var admin = read(ADMIN_KEY);
  if (admin && admin.role === 'admin') return;

  var buyer = read(BUYER_KEY);
  if (!buyer) return;

  window.location.replace('login_administrator_desktop.html?akses=blokir');
})();