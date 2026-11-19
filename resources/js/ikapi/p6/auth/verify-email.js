// verifikasi_email_desktop
// Ported verbatim from docs/design/prototype-copy/user/verifikasi_email_desktop.html (inline <script>, 62 lines).
// Only this wrapper is new: the module runs once the DOM is ready and only on its own page.
import { onReady } from '../../shared.js';

onReady(function () {
    if (!document.querySelector('#resendBtn')) return;

    let toastTimer = null;
        function showToast(msg) {
          const toast = document.getElementById('toast');
          const toastMessage = document.getElementById('toast-message');
          if (!toast || !toastMessage) return;
          toastMessage.textContent = msg;
          toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
          toast.classList.add('translate-y-0', 'opacity-100');
          if (toastTimer) clearTimeout(toastTimer);
          toastTimer = setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
          }, 2500);
        }

        // Dynamic Email Parameter Parser
        function updateEmailDisplayFromUrl() {
          const urlParams = new URLSearchParams(window.location.search);
          const email = urlParams.get('email');
          const emailDisplay = document.getElementById('user-email-display');
          if (email && emailDisplay) {
            emailDisplay.textContent = email;
          }
        }

        // Resend Email Handler
        function handleResendEmail() {
          const btn = document.getElementById('resendBtn');
          const text = document.getElementById('resendText');
          const icon = document.getElementById('resendIcon');
          const feedback = document.getElementById('resendFeedback');
          const feedbackBox = document.getElementById('resend-feedback');

          if (!btn) return;
          btn.disabled = true;

          // Loading state
          text.textContent = 'Mengirim Ulang...';
          icon.classList.add('animate-spin');

          setTimeout(() => {
            icon.classList.remove('animate-spin');
            icon.textContent = 'check';
            text.textContent = 'Email Terkirim';
            btn.classList.add('bg-primary-hover');

            if (feedbackBox) feedbackBox.classList.remove('hidden');
            showToast('Tautan verifikasi baru berhasil dikirim');

            setTimeout(() => {
              icon.textContent = 'refresh';
              text.textContent = 'Kirim Ulang Email';
              btn.classList.remove('bg-primary-hover');
              btn.disabled = false;
            }, 4000);
          }, 1200);
        }

        document.addEventListener('DOMContentLoaded', () => {
          updateEmailDisplayFromUrl();
        });

    // Prototype markup calls these from inline handlers; ES modules are scoped, so publish them.
    Object.assign(window, { handleResendEmail });
});
