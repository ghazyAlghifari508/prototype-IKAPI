(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var scenario = 'default';
  var busy = false;

  function setFeedback(kind, text) {
    var box = $('feedback');
    var icon = $('feedback-icon');
    if (!text) { box.classList.add('hidden'); box.classList.remove('flex'); return; }
    box.classList.remove('hidden');
    box.classList.add('flex');
    if (kind === 'error') {
      box.className = 'mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-red-700';
      icon.textContent = 'error';
    } else {
      box.className = 'mt-4 flex items-start gap-2.5 rounded-xl border border-border bg-soft p-3.5 text-ink';
      icon.textContent = 'info';
    }
    $('feedback-text').textContent = text;
  }

  function clearFieldErrors() {
    $('email-error').classList.add('hidden');
    $('password-error').classList.add('hidden');
    $('admin-email').setAttribute('aria-invalid', 'false');
    $('admin-password').setAttribute('aria-invalid', 'false');
  }

  function setLoading(on) {
    busy = on;
    $('submit-btn').disabled = on;
    $('submit-label').textContent = on ? 'Memeriksa...' : 'Masuk ke Dashboard';
    $('submit-icon').textContent = on ? 'progress_activity' : 'arrow_forward';
    $('submit-icon').classList.toggle('animate-spin', on);
  }

  $('toggle-password').addEventListener('click', function () {
    var input = $('admin-password');
    var show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    $('toggle-icon').textContent = show ? 'visibility_off' : 'visibility';
    this.setAttribute('aria-label', show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
  });

  $('feedback-close').addEventListener('click', function () { setFeedback('error', ''); });
  ['admin-email', 'admin-password'].forEach(function (id) {
    $(id).addEventListener('input', function () {
      clearFieldErrors();
    });
  });

  function validate() {
    clearFieldErrors();
    var email = $('admin-email').value.trim();
    var password = $('admin-password').value;
    var ok = true;

    if (!email) {
      $('email-error').textContent = 'Alamat email wajib diisi.';
      $('email-error').classList.remove('hidden');
      $('admin-email').setAttribute('aria-invalid', 'true');
      ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      $('email-error').textContent = 'Masukkan alamat email yang valid.';
      $('email-error').classList.remove('hidden');
      $('admin-email').setAttribute('aria-invalid', 'true');
      ok = false;
    }
    if (!password.trim()) {
      $('password-error').textContent = 'Kata sandi wajib diisi.';
      $('password-error').classList.remove('hidden');
      $('admin-password').setAttribute('aria-invalid', 'true');
      ok = false;
    }
    if (!ok) {
      $('email-error').classList.contains('hidden') ? $('admin-password').focus() : $('admin-email').focus();
    }
    return ok;
  }

  /* Preview entry records an explicit administrator preview session so the
     administrator pages can distinguish it from a signed-in Buyer. */
  var previewLink = $('preview-dashboard-link');
  if (previewLink) {
    previewLink.addEventListener('click', function () {
      try {
        window.localStorage.setItem('ikapi_admin_session_demo', JSON.stringify({
          role: 'admin', preview: true, email: 'admin@ikapi-jabar.id'
        }));
      } catch (e) {}
    });
  }

  $('admin-login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    setFeedback('error', '');
    if (!validate()) return;

    setLoading(true);
    window.setTimeout(function () {
      setLoading(false);
      /* No backend authentication exists in this prototype: never claim success. */
      setFeedback('info', 'Autentikasi administrator belum tersedia pada prototype ini. Gunakan pratinjau dashboard di bawah untuk meninjau tampilan.');
      $('preview-note').classList.remove('hidden');
      $('preview-note').scrollIntoView({ block: 'nearest' });
    }, 700);
  });

  if (new URLSearchParams(window.location.search).get('akses') === 'blokir') {
    var blockedNotice = $('access-blocked');
    if (blockedNotice) blockedNotice.classList.remove('hidden');
  }

  document.querySelectorAll('.scenario-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      scenario = chip.getAttribute('data-scenario');
      document.querySelectorAll('.scenario-chip').forEach(function (c) { c.classList.remove('bg-soft', 'text-primary'); });
      chip.classList.add('bg-soft', 'text-primary');

      setLoading(false);
      clearFieldErrors();
      setFeedback('error', '');
      $('preview-note').classList.add('hidden');

      if (scenario === 'validation') {
        $('admin-email').value = 'admin';
        $('admin-password').value = '';
        validate();
        $('email-error').textContent = 'Masukkan alamat email yang valid.';
        $('email-error').classList.remove('hidden');
      } else if (scenario === 'invalid') {
        $('admin-email').value = 'admin@ikapi-jabar.id';
        $('admin-password').value = '********';
        setFeedback('error', 'Email atau kata sandi tidak sesuai.');
      } else if (scenario === 'loading') {
        $('admin-email').value = 'admin@ikapi-jabar.id';
        $('admin-password').value = '********';
        setLoading(true);
      } else if (scenario === 'denied') {
        $('admin-email').value = 'penerbit@demo.ikapi.id';
        $('admin-password').value = '********';
        setFeedback('error', 'Tidak memiliki izin untuk mengakses Portal Administrator.');
      } else if (scenario === 'network') {
        $('admin-email').value = 'admin@ikapi-jabar.id';
        $('admin-password').value = '********';
        setFeedback('error', 'Terjadi kendala saat masuk. Coba lagi.');
      } else {
        $('admin-email').value = '';
        $('admin-password').value = '';
      }
    });
  });
})();
