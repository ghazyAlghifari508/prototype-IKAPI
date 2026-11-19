(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var STORE_KEY = 'ikapi_reading_prefs_demo';

  var prefs = { categories: [], styles: [], duration: '', completed: false };
  var step = 1;

  /* ---------- persistence (demo only, no credentials stored) ---------- */
  function loadPrefs() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      return parsed;
    } catch (e) { return null; }
  }
  function savePrefs() {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(prefs)); } catch (e) { /* ignore */ }
  }

  /* ---------- rendering ---------- */
  function paintProgress() {
    var bars = document.querySelectorAll('#step-progress [data-bar]');
    bars.forEach(function (bar) {
      var i = Number(bar.getAttribute('data-bar'));
      bar.className = 'h-1.5 flex-1 rounded-full ' + (i <= step ? 'bg-primary' : 'bg-neutral');
    });
    $('step-label').textContent = 'Langkah ' + step + ' dari 4';
    $('step-progress').setAttribute('aria-valuenow', String(step));
  }

  function paintSelection() {
    document.querySelectorAll('[data-category]').forEach(function (btn) {
      var on = prefs.categories.indexOf(btn.getAttribute('data-category')) !== -1;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.className = 'option-card focus-ring inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13.5px] font-medium transition-colors ' +
        (on ? 'border-primary bg-soft text-primary' : 'border-border text-ink hover:border-primary hover:text-primary');
      btn.querySelector('.option-check').classList.toggle('hidden', !on);
    });

    document.querySelectorAll('[data-style]').forEach(function (btn) {
      var on = prefs.styles.indexOf(btn.getAttribute('data-style')) !== -1;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.className = 'option-card focus-ring flex items-start justify-between gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors ' +
        (on ? 'border-primary bg-soft' : 'border-border hover:bg-neutral');
      btn.querySelector('.option-check').classList.toggle('hidden', !on);
    });

    document.querySelectorAll('input[name="duration"]').forEach(function (input) {
      input.checked = prefs.duration === input.value;
      var label = input.closest('label');
      label.className = 'focus-ring flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3.5 transition-colors ' +
        (input.checked ? 'border-primary bg-soft' : 'border-border hover:bg-neutral');
    });

    document.querySelectorAll('.next-btn').forEach(function (btn) {
      var next = btn.getAttribute('data-next');
      var ready = next === '2' ? prefs.categories.length > 0 : prefs.styles.length > 0;
      btn.disabled = !ready;
    });
    $('btn-finish').disabled = !prefs.duration;
  }

  function showStep(target) {
    step = Number(target);
    document.querySelectorAll('[data-step]').forEach(function (s) {
      s.classList.toggle('hidden', s.getAttribute('data-step') !== String(step));
    });
    paintProgress();
    paintSelection();
  }

  /* ---------- interactions ---------- */
  document.querySelectorAll('[data-category]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-category');
      var i = prefs.categories.indexOf(key);
      if (i === -1) prefs.categories.push(key); else prefs.categories.splice(i, 1);
      savePrefs();
      paintSelection();
    });
  });

  document.querySelectorAll('[data-style]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-style');
      var i = prefs.styles.indexOf(key);
      if (i === -1) prefs.styles.push(key); else prefs.styles.splice(i, 1);
      savePrefs();
      paintSelection();
    });
  });

  document.querySelectorAll('input[name="duration"]').forEach(function (input) {
    input.addEventListener('change', function () {
      prefs.duration = input.value;
      savePrefs();
      paintSelection();
    });
  });

  document.querySelectorAll('.next-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { showStep(btn.getAttribute('data-next')); });
  });
  document.querySelectorAll('.back-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { showStep(btn.getAttribute('data-back')); });
  });

  $('btn-finish').addEventListener('click', function () {
    if (!prefs.duration) return;
    this.disabled = true;
    prefs.completed = true;
    savePrefs();
    showStep(4);
  });

  $('btn-skip').addEventListener('click', function () {
    window.location.href = 'katalog_buku_desktop.html';
  });

  /* ---------- init ---------- */
  var stored = loadPrefs();
  if (stored) {
    prefs.categories = Array.isArray(stored.categories) ? stored.categories : [];
    prefs.styles = Array.isArray(stored.styles) ? stored.styles : [];
    prefs.duration = stored.duration || '';
    prefs.completed = !!stored.completed;
  }
  /* Selalu mulai dari langkah 1; pilihan tersimpan hanya dipakai sebagai draft. */
  showStep(1);
})();
