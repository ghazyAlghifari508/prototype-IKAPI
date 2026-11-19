{{--
  Auth shell (login, register, forgot password, verify email). Hand-written from the prototype markup.
  Source: <body>/<main>/card in user/masuk_login_desktop.html, daftar_akun_register_desktop.html,
  lupa_kata_sandi_desktop.html, verifikasi_email_desktop.html (P04 audit):
    <main class="w-full max-w-6xl mx-auto py-4">
      <div class="w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-xl bg-white border border-border-subtle">
        panel ilustrasi  (lg:col-span-5, p-8 xl:p-12, auth_register_reading.png, max 380x460)
        panel form       (lg:col-span-7, p-6 sm:p-10 lg:p-12)
  Variants kept: form width max-w-md (login, forgot, verify) | max-w-lg (register), illustration alt text per page.

  Sections
    title    <title>
    alt      illustration alt text (the prototype differs per page)
    width    'md' (default) | 'lg'
    stack    'space-y-5' (login, register) | 'space-y-6' (forgot password, verify email)
    content  everything inside the form column (tabs, heading, form, helper links)
--}}
<!DOCTYPE html>
<html lang="id">
<head>
  <x-ikapi.head :title="trim($__env->yieldContent('title', 'IKAPI Store Jawa Barat'))" icons="buyer" />
  @stack('head')
</head>
<body class="min-h-screen bg-surface-neutral font-sans text-ink-body antialiased selection:bg-surface-soft selection:text-primary-deep flex items-center justify-center p-4 sm:p-6">
  <main class="w-full max-w-6xl mx-auto py-4">
    <div class="w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-xl bg-white border border-border-subtle">

      <!-- Illustration panel (same asset for every auth page and both roles).
           forgot-password and verify-email wrap the image in an extra relative flex box and add drop-shadow-sm;
           that difference is visible (a soft shadow around the illustration), so it is a section, not a template whim. -->
      @hasSection('image_wrap')
        <div class="hidden lg:flex lg:col-span-5 bg-white p-8 xl:p-12 items-center justify-center relative overflow-hidden">
          <div class="relative w-full max-w-[380px] flex items-center justify-center">
            <img src="{{ asset('assets/ikapi/ilustration/auth_register_reading.png') }}" alt="@yield('alt', 'Ilustrasi membaca IKAPI Store')"
              class="w-full h-auto max-h-[460px] object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)] select-none">
          </div>
        </div>
      @else
        <div class="hidden lg:flex lg:col-span-5 bg-white p-8 xl:p-12 items-center justify-center overflow-hidden">
          <img src="{{ asset('assets/ikapi/ilustration/auth_register_reading.png') }}" alt="@yield('alt', 'Ilustrasi membaca IKAPI Store')"
            class="w-full max-w-[380px] h-auto max-h-[460px] object-contain select-none">
        </div>
      @endif

      <!-- Form panel -->
      <div class="col-span-1 lg:col-span-7 bg-white p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
        <div class="w-full {{ trim($__env->yieldContent('width', 'md')) === 'lg' ? 'max-w-lg' : 'max-w-md' }} mx-auto @yield('stack', 'space-y-5')">
          @yield('content')
        </div>
      </div>
    </div>
  </main>

  @stack('scripts')
</body>
</html>
