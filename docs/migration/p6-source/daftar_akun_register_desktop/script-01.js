(function () {
      'use strict';

      var $ = function (id) { return document.getElementById(id); };
      var role = 'buyer';
      var step = 1;
      var scenario = 'default';
      var busy = false;

      /* Separate draft state per role so switching never mixes or drops data. */
      var pubDraft = { pubName: '', pubMember: '', pubAddress: '', pubPic: '', pubEmail: '', pubPhone: '', pubPassword: '', pubPasswordConfirm: '', pubTerms: false };

      var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      var DUPLICATE_EMAIL = 'redaksi@kiblatbuku.co.id';

      function showErr(name, on) {
        var el = document.querySelector('[data-err="' + name + '"]');
        if (el) el.classList.toggle('hidden', !on);
      }
      function showBanner(title) {
        $('error-title').textContent = title;
        $('validation-banner').classList.remove('hidden');
        $('validation-banner').classList.add('flex');
      }
      function hideBanner() {
        $('validation-banner').classList.add('hidden');
        $('validation-banner').classList.remove('flex');
      }
      function showInfo(text) {
        $('info-text').textContent = text;
        $('info-banner').classList.remove('hidden');
        $('info-banner').classList.add('flex');
      }
      function hideInfo() {
        $('info-banner').classList.add('hidden');
        $('info-banner').classList.remove('flex');
      }
      function setBusy(btn, on, busyLabel) {
        busy = on;
        btn.disabled = on;
        var label = btn.querySelector('[data-btn-label]');
        var icon = btn.querySelector('[data-btn-icon]');
        if (label) label.textContent = on ? busyLabel : label.getAttribute('data-idle') || 'Daftar';
        if (icon) { icon.textContent = on ? 'progress_activity' : 'arrow_forward'; icon.classList.toggle('animate-spin', on); }
      }

      /* ---------- Role switch ---------- */
      function setRole(next) {
        role = next === 'publisher' ? 'publisher' : 'buyer';
        var isBuyer = role === 'buyer';

        $('auth-heading').textContent = isBuyer ? 'Buat Akun' : 'Daftar sebagai Penerbit';
        $('auth-description').textContent = isBuyer
          ? 'Daftar untuk membeli dan membaca e-book di IKAPI Store.'
          : 'Lengkapi data penerbit dalam tiga langkah.';
        $('switch-text').textContent = isBuyer ? 'Sudah punya akun?' : 'Sudah punya akun penerbit?';
        $('switch-link').textContent = 'Masuk';
        $('switch-link').setAttribute('href', 'masuk_login_desktop.html?role=' + role);
        $('google-block').classList.toggle('hidden', !isBuyer);
        $('demo-block-buyer').classList.toggle('hidden', !isBuyer);
        $('demo-block-publisher').classList.toggle('hidden', isBuyer);
        $('buyer-form').classList.toggle('hidden', !isBuyer);
        $('publisher-form').classList.toggle('hidden', isBuyer);

        $('tab-buyer').setAttribute('aria-selected', isBuyer ? 'true' : 'false');
        $('tab-publisher').setAttribute('aria-selected', isBuyer ? 'false' : 'true');
        paintTab($('tab-buyer'), isBuyer);
        paintTab($('tab-publisher'), !isBuyer);

        hideBanner();
        hideInfo();
        /* Draft data of the other role is preserved, not merged. */
        if (!isBuyer) restorePublisherStep();

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

      /* ---------- Password toggles ---------- */
      document.querySelectorAll('[data-toggle-pw]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var input = $(btn.getAttribute('data-toggle-pw'));
          var icon = btn.querySelector('.material-symbols-outlined');
          var show = input.type === 'password';
          input.type = show ? 'text' : 'password';
          icon.textContent = show ? 'visibility_off' : 'visibility';
          btn.setAttribute('aria-label', show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
        });
      });

      /* ---------- Buyer registration ---------- */
      $('buyer-submit').querySelector('[data-btn-label]').setAttribute('data-idle', 'Daftar');

      $('buyer-form').addEventListener('submit', function (e) {
        e.preventDefault();
        if (busy) return;

        var name = $('fullName').value.trim();
        var email = $('buyerEmail').value.trim().toLowerCase();
        var phone = $('buyerPhone').value.trim();
        var pw = $('buyerPassword').value;
        var pw2 = $('buyerPasswordConfirm').value;
        var terms = $('buyerTerms').checked;

        var bad = false;
        showErr('fullName', !name); bad = bad || !name;
        var emailOk = EMAIL_RE.test(email); showErr('buyerEmail', !emailOk); bad = bad || !emailOk;
        showErr('buyerPhone', !phone); bad = bad || !phone;
        var pwOk = pw.length >= 8; showErr('buyerPassword', !pwOk); bad = bad || !pwOk;
        var match = pwOk && pw === pw2; showErr('buyerPasswordConfirm', !match); bad = bad || !match;
        showErr('buyerTerms', !terms); bad = bad || !terms;

        if (bad) { showBanner('Periksa Kembali Formulir'); return; }

        if (scenario === 'duplicate' || email === DUPLICATE_EMAIL) {
          showBanner('Email sudah terdaftar pada prototype ini.');
          return;
        }

        hideBanner();
        setBusy($('buyer-submit'), true, 'Mendaftarkan...');
        window.setTimeout(function () {
          setBusy($('buyer-submit'), false);
          $('buyer-submit').querySelector('[data-btn-label]').textContent = 'Daftar';
          showInfo('Pendaftaran tersimpan pada prototype ini.');
          var infoBox = $('info-banner');
          if (infoBox && !window.__onboardingLinked) {
            window.__onboardingLinked = true;
            var link = document.createElement('a');
            link.id = 'info-onboarding-link';
            link.href = 'onboarding_preferensi_bacaan_desktop.html';
            link.className = 'focus-ring ml-2 shrink-0 rounded text-[12.5px] font-bold text-primary hover:text-primary-hover';
            link.textContent = 'Lanjut ke Preferensi Bacaan';
            infoBox.insertBefore(link, infoBox.lastElementChild);
          }
        }, scenario === 'loading' ? 1800 : 900);
      });

      /* ---------- Publisher 3-step ---------- */
      var STEP_TITLES = { 1: 'Informasi Penerbit', 2: 'Penanggung Jawab', 3: 'Keamanan Akun' };

      function saveStep() {
        if (step === 1) {
          pubDraft.pubName = $('pubName').value.trim();
          pubDraft.pubMember = $('pubMember').value.trim();
          pubDraft.pubAddress = $('pubAddress').value.trim();
        } else if (step === 2) {
          pubDraft.pubPic = $('pubPic').value.trim();
          pubDraft.pubEmail = $('pubEmail').value.trim();
          pubDraft.pubPhone = $('pubPhone').value.trim();
        } else {
          pubDraft.pubPassword = $('pubPassword').value;
          pubDraft.pubPasswordConfirm = $('pubPasswordConfirm').value;
          pubDraft.pubTerms = $('pubTerms').checked;
        }
      }

      function restorePublisherStep() {
        if (step === 1) {
          $('pubName').value = pubDraft.pubName;
          $('pubMember').value = pubDraft.pubMember;
          $('pubAddress').value = pubDraft.pubAddress;
        } else if (step === 2) {
          $('pubPic').value = pubDraft.pubPic;
          $('pubEmail').value = pubDraft.pubEmail;
          $('pubPhone').value = pubDraft.pubPhone;
        } else {
          $('pubPassword').value = pubDraft.pubPassword;
          $('pubPasswordConfirm').value = pubDraft.pubPasswordConfirm;
          $('pubTerms').checked = pubDraft.pubTerms;
        }
      }

      /* Prototype only: stores the application in this browser and hands over to the
         status page. No request is sent and no account status is created. */
      function submitPublisherApplication() {
        var record = {
          name: $('pubName').value.trim(),
          submittedAt: new Date().toISOString(),
          status: 'pending',
          reason: ''
        };
        try {
          window.localStorage.setItem('ikapi_publisher_application_demo', JSON.stringify(record));
          window.localStorage.removeItem('ikapi_publisher_status_preview');
        } catch (e) {}
        window.location.href = 'status_pendaftaran_penerbit_desktop.html';
      }

      function showStep(n) {
        step = n;
        document.querySelectorAll('#publisher-form [data-step]').forEach(function (el) {
          el.classList.toggle('hidden', Number(el.getAttribute('data-step')) !== n);
        });
        document.querySelectorAll('#step-track [data-step-bar]').forEach(function (bar) {
          var i = Number(bar.getAttribute('data-step-bar'));
          /* A segment fills only after its step is completed, so step 1 starts empty. */
          bar.className = 'h-1.5 flex-1 rounded-full ' + (i < n ? 'bg-primary' : 'bg-surface-neutral');
        });
        $('step-label').textContent = 'Langkah ' + n + ' dari 3';
        $('step-title').textContent = STEP_TITLES[n];
        $('step-track').setAttribute('aria-valuenow', String(n));
        $('pub-back').classList.toggle('hidden', n === 1);
        $('pub-back').classList.toggle('flex', n !== 1);
        $('pub-next-label').textContent = n === 3 ? 'Ajukan Pendaftaran' : 'Lanjutkan';
        $('pub-next-icon').textContent = n === 3 ? 'send' : 'arrow_forward';
        hideBanner();
      }

      function validateStep() {
        var bad = false;
        if (step === 1) {
          var n = $('pubName').value.trim(), m = $('pubMember').value.trim(), a = $('pubAddress').value.trim();
          showErr('pubName', !n); showErr('pubMember', !m); showErr('pubAddress', !a);
          bad = !n || !m || !a;
        } else if (step === 2) {
          var pic = $('pubPic').value.trim(), mail = $('pubEmail').value.trim(), tel = $('pubPhone').value.trim();
          var mailOk = EMAIL_RE.test(mail);
          showErr('pubPic', !pic); showErr('pubEmail', !mailOk); showErr('pubPhone', !tel);
          bad = !pic || !mailOk || !tel;
        } else {
          var pw = $('pubPassword').value, pw2 = $('pubPasswordConfirm').value;
          var pwOk = pw.length >= 8, match = pwOk && pw === pw2, terms = $('pubTerms').checked;
          showErr('pubPassword', !pwOk); showErr('pubPasswordConfirm', !match); showErr('pubTerms', !terms);
          bad = !pwOk || !match || !terms;
        }
        if (bad) showBanner('Lengkapi data pada langkah ini sebelum melanjutkan.');
        return !bad;
      }

      $('pub-next').addEventListener('click', function () {
        if (busy) return;
        if (!validateStep()) return;
        saveStep();

        if (step < 3) { showStep(step + 1); return; }

        /* Final submission */
        if (scenario === 'duplicate' || pubDraft.pubEmail.toLowerCase() === DUPLICATE_EMAIL) {
          showBanner('Email kantor sudah terdaftar pada prototype ini.');
          showStep(2);
          return;
        }

        busy = true;
        var btn = $('pub-next');
        btn.disabled = true;
        $('pub-next-label').textContent = 'Mengirim pengajuan...';
        $('pub-next-icon').textContent = 'progress_activity';
        $('pub-next-icon').classList.add('animate-spin');

        window.setTimeout(function () {
          busy = false;
          btn.disabled = false;
          $('pub-next-label').textContent = 'Ajukan Pendaftaran';
          $('pub-next-icon').textContent = 'send';
          $('pub-next-icon').classList.remove('animate-spin');

          submitPublisherApplication();
        }, scenario === 'loading' ? 1800 : 1000);
      });

      $('pub-back').addEventListener('click', function () {
        saveStep();
        if (step > 1) showStep(step - 1);
      });

      /* ---------- Demo scenarios ---------- */
      document.querySelectorAll('.demo-chip').forEach(function (chip) {
        chip.addEventListener('click', function () {
          scenario = chip.getAttribute('data-demo');
          document.querySelectorAll('.demo-chip').forEach(function (c) { c.classList.remove('bg-surface-soft', 'text-primary'); });
          chip.classList.add('bg-surface-soft', 'text-primary');
          hideBanner();

          if (scenario === 'duplicate') {
            setRole('buyer');
            $('buyerEmail').value = DUPLICATE_EMAIL;
            showBanner('Email sudah terdaftar pada prototype ini.');
          } else if (scenario === 'success') {
            setRole('publisher');
            submitPublisherApplication();
          } else if (scenario === 'loading') {
            setRole('publisher');
            showStep(3);
            $('pubPassword').value = 'demo12345';
            $('pubPasswordConfirm').value = 'demo12345';
            $('pubTerms').checked = true;
            busy = true;
            $('pub-next').disabled = true;
            $('pub-next-label').textContent = 'Mengirim pengajuan...';
            $('pub-next-icon').textContent = 'progress_activity';
            window.setTimeout(function () { busy = false; $('pub-next').disabled = false; $('pub-next-label').textContent = 'Ajukan Pendaftaran'; $('pub-next-icon').textContent = 'send'; }, 1800);
          } else {
            if (role === 'publisher') { $('publisher-form').classList.remove('hidden'); showStep(1); }
          }
        });
      });

      $('google-btn').addEventListener('click', function () {
        showInfo('Google OAuth belum tersedia pada prototype ini.');
      });

      /* ---------- Init ---------- */
      var params = new URLSearchParams(window.location.search);
      setRole(params.get('role') === 'publisher' ? 'publisher' : 'buyer');
      showStep(1);
    })();
