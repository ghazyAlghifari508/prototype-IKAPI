/* Prototype access guard for the Portal Penerbit pages.
   The dashboard is only reachable while the demo application is approved.

   Boundary: this is a front-end demo gate that reflects the demo application state
   stored by the registration flow (localStorage, this browser only). It is not a
   substitute for server-side authorization; in a Laravel build the same rule must
   live in route middleware. Visitors without any stored application (for example a
   reviewer opening the portal directly) are not blocked. */
(function () {
  'use strict';

  var APPLICATION_KEY = 'ikapi_publisher_application_demo';
  var STATUS_PAGE = '../user/status_pendaftaran_penerbit_desktop.html';

  /* Portal pages share one folder, so the relative target also works when the
     prototype is opened from a subfolder copy. */
  function statusPageUrl() {
    return STATUS_PAGE + '?akses=blokir';
  }

  try {
    var raw = window.localStorage.getItem(APPLICATION_KEY);
    if (!raw) return;
    var application = JSON.parse(raw);
    if (!application || !application.status) return;
    if (application.status === 'approved') return;
    window.location.replace(statusPageUrl());
  } catch (e) {
    /* Never block the portal because storage is unavailable. */
  }
})();
