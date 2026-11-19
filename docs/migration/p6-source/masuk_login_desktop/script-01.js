(function () {
      'use strict';

      /* Demo accounts — prototype only, not production credentials. */
      var DEMO_ACCOUNTS = {
        'pembeli@demo.ikapi.id': { role: 'buyer', status: 'active', next: 'perpustakaan_saya_desktop.html' },
        'penerbit@demo.ikapi.id': { role: 'publisher', status: 'approved', next: '../penerbit/dashboard_penerbit_desktop.html' },
        'pending@demo.ikapi.id': { role: 'publisher', status: 'pending', next: null }
      };
      var DEMO_PASSWORD = 'demo12345';

      var $ = function (id) { return document.getElementById(id); };
      var role = 'buyer';
      var scenario = 'default';
      var busy = false;

      /* ---------- Role ---------- */
      var ROLE_COPY = {
        buyer: {
          heading: 'Selamat Datang Kembali',
          description: 'Masuk untuk melanjutkan membaca koleksi bukumu.',
          cta: 'Masuk ke Akun',
          switchText: 'Belum memiliki akun IKAPI Store?',
          switchLabel: 'Daftar Sekarang',
          register: 'daftar_akun_register_desktop.html?role=buyer'
        },
        publisher: {
          heading: 'Masuk ke Portal Penerbit',
          description: 'Kelola buku dan pantau aktivitas penjualan.',
          cta: 'Masuk Portal Penerbit',
          switchText: 'Belum punya akun penerbit?',
          switchLabel: 'Daftar sebagai Penerbit',
          register: 'daftar_akun_register_desktop.html?role=publisher'
        }
      };

      function setRole(next) {
        role = (next === 'publisher') ? 'publisher' : 'buyer';
        var copy = ROLE_COPY[role];

        $('auth-heading').textContent = copy.heading;
        $('auth-description').textContent = copy.description;
        $('submit-label').textContent = copy.cta;
        $('switch-text').textContent = copy.switchText;
        $('switch-link').textContent = copy.switchLabel;
        $('switch-link').setAttribute('href', copy.register);
        $('forgot-link').setAttribute('href', 'lupa_kata_sandi_desktop.html?role=' + role);

        $('tab-buyer').setAttribute('aria-selected', role === 'buyer' ? 'true' : 'false');
        $('tab-publisher').setAttribute('aria-selected', role === 'publisher' ? 'true' : 'false');
        paintTab($('tab-buyer'), role === 'buyer');
        paintTab($('tab-publisher'), role === 'publisher');

        /* Google OAuth is only offered where it is supported (buyer). */
        $('google-block').classList.toggle('hidden', role !== 'buyer');

        /* Demo helpers are role specific: buyer scenarios vs publisher scenarios. */
        $('demo-block-buyer').classList.toggle('hidden', role !== 'buyer');
        $('demo-block-publisher').classList.toggle('hidden', role === 'buyer');

        hideBanner();
        hidePending();
        clearFieldErrors();

        var url = new URL(window.location.href);
        url.searchParams.set('role', role);
        window.history.replaceState({}, '', url);
      }

      function paintTab(btn, active) {
        btn.className = 'role-tab focus-ring flex-1 rounded-lg px-3 py-2 text-[13px] ' +
          (active ? 'bg-white font-bold text-primary shadow-sm' : 'font-semibold text-ink-muted hover:text-ink-body');
      }

      $('tab-buyer').addEventListener('click', function () { setRole('buyer'); });
      $('tab-publisher').addEventListener('click', function () { setRole('publisher'); });

      /* ---------- Password visibility ---------- */
      $('toggle-pw-btn').addEventListener('click', function () {
        var input = $('password-field');
        var icon = $('pw-visibility-icon');
        var show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        icon.textContent = show ? 'visibility_off' : 'visibility';
        this.setAttribute('aria-label', show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
      });

      /* ---------- Feedback helpers ---------- */
      function showBanner(title) {
        $('error-title').textContent = title;
        $('validation-banner').classList.remove('hidden');
        $('validation-banner').classList.add('flex');
      }
      function hideBanner() {
        $('validation-banner').classList.add('hidden');
        $('validation-banner').classList.remove('flex');
      }
      function showPending() {
        $('pending-panel').classList.remove('hidden');
        $('auth-form').classList.add('hidden');
        $('google-block').classList.add('hidden');
      }
      function hidePending() {
        $('pending-panel').classList.add('hidden');
        $('auth-form').classList.remove('hidden');
        $('google-block').classList.toggle('hidden', role !== 'buyer');
      }
      /* Only same-folder prototype pages may be used as a return destination. */
      function safeNext(raw) {
        if (!raw) return null;
        var value = raw.trim();
        if (!/^[a-z0-9_-]+\.html(\?[^#\s]*)?$/i.test(value)) return null;
        return value;
      }

      function rememberBuyerSession(email) {
        try {
          window.localStorage.setItem('ikapi_buyer_session_demo', JSON.stringify({
            id: 'USR-PMB-0042',
            email: email,
            name: 'Pembeli Demo',
            role: 'buyer'
          }));
        } catch (e) {}
      }

      function resetToForm() {
        hidePending();
        $('password-field').value = '';
        $('password-field').focus();
      }
      function clearFieldErrors() {
        $('email-error-msg').classList.add('hidden');
        $('password-error-msg').classList.add('hidden');
      }
      $('email-field').addEventListener('input', function () { $('email-error-msg').classList.add('hidden'); });
      $('password-field').addEventListener('input', function () { $('password-error-msg').classList.add('hidden'); });

      function setLoading(on) {
        busy = on;
        var btn = $('submit-btn');
        btn.disabled = on;
        $('submit-label').textContent = on ? 'Memverifikasi akun...' : ROLE_COPY[role].cta;
        $('submit-icon').textContent = on ? 'progress_activity' : 'arrow_forward';
        $('submit-icon').classList.toggle('animate-spin', on);
      }

      /* ---------- Validation ---------- */
      function validate() {
        var email = $('email-field').value.trim();
        var password = $('password-field').value;
        var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        var passwordOk = password.trim().length >= 6;

        $('email-error-msg').classList.toggle('hidden', emailOk);
        $('password-error-msg').classList.toggle('hidden', passwordOk);

        if (!emailOk) { $('email-field').focus(); return null; }
        if (!passwordOk) { $('password-field').focus(); return null; }
        return { email: email.toLowerCase(), password: password };
      }

      /* ---------- Submit ---------- */
      function attemptLogin() {
        var data = validate();
        if (!data) {
          showBanner('Periksa Kembali Formulir');
          return;
        }

        hideBanner();
        hidePending();
        setLoading(true);

        var delay = scenario === 'loading' ? 2000 : 900;
        window.setTimeout(function () {
          setLoading(false);
          resolve(data);
        }, delay);
      }

      function resolve(data) {
        if (scenario === 'network') {
          showBanner('Koneksi bermasalah. Coba lagi.');
          return;
        }
        if (scenario === 'invalid') {
          showBanner('Email atau kata sandi tidak sesuai.');
          return;
        }

        var account = DEMO_ACCOUNTS[data.email];

        /* Reviewer-forced pending scenario (still role-checked). */
        if (scenario === 'pending') { showPending(); return; }

        if (!account || data.password !== DEMO_PASSWORD) {
          showBanner('Email atau kata sandi tidak sesuai.');
          return;
        }

        if (account.role !== role) {
          showBanner('Akun ini terdaftar sebagai ' + (account.role === 'buyer' ? 'Pembeli' : 'Penerbit') +
            '. Pilih tab ' + (account.role === 'buyer' ? 'Pembeli' : 'Penerbit') + ' untuk melanjutkan.');
          return;
        }

        if (account.status === 'pending') { showPending(); return; }

        if (account.role === 'buyer') rememberBuyerSession(data.email || 'pembeli@demo.ikapi.id');

        window.location.href = safeNext(params.get('next')) || account.next;
      }

      $('auth-form').addEventListener('submit', function (e) {
        e.preventDefault();
        if (busy) return;
        attemptLogin();
      });

      /* The reset helper lives in this closure, so bind it here. */
      document.getElementById('pending-back').addEventListener('click', resetToForm);

      /* ---------- Demo scenarios ---------- */
      document.querySelectorAll('.demo-chip').forEach(function (chip) {
        chip.addEventListener('click', function () {
          scenario = chip.getAttribute('data-demo');
          document.querySelectorAll('.demo-chip').forEach(function (c) { c.classList.remove('bg-surface-soft', 'text-primary'); });
          chip.classList.add('bg-surface-soft', 'text-primary');

          hideBanner();
          hidePending();
          setLoading(false);

          if (scenario === 'validation') {
            $('email-field').value = '';
            $('password-field').value = '';
            validate();
            showBanner('Periksa Kembali Formulir');
          } else if (scenario === 'invalid') {
            $('email-field').value = 'pembeli@demo.ikapi.id';
            $('password-field').value = 'salah12345';
            showBanner('Email atau kata sandi tidak sesuai.');
          } else if (scenario === 'pending') {
            $('email-field').value = 'pending@demo.ikapi.id';
            $('password-field').value = DEMO_PASSWORD;
            showPending();
          } else if (scenario === 'loading') {
            $('email-field').value = 'pembeli@demo.ikapi.id';
            $('password-field').value = DEMO_PASSWORD;
            setLoading(true);
            window.setTimeout(function () { setLoading(false); }, 2000);
          } else if (scenario === 'network') {
            $('email-field').value = 'pembeli@demo.ikapi.id';
            $('password-field').value = DEMO_PASSWORD;
            showBanner('Koneksi bermasalah. Coba lagi.');
          } else {
            $('email-field').value = '';
            $('password-field').value = '';
          }
        });
      });

      $('google-btn').addEventListener('click', function () {
        showBanner('Google OAuth belum tersedia pada prototype ini.');
      });

      /* ---------- Init ---------- */
      var params = new URLSearchParams(window.location.search);
      var requested = params.get('role');
      setRole(requested === 'publisher' ? 'publisher' : 'buyer');
    })();
