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

    function handleResetSubmit(e) {
      e.preventDefault();
      const emailInput = document.getElementById('recovery-email');
      const email = emailInput ? emailInput.value.trim() : '';

      const btn = document.getElementById('submit-btn');
      const btnText = document.getElementById('submit-btn-text');
      const banner = document.getElementById('success-banner');

      if (!email) {
        showToast('Masukkan alamat email yang valid');
        return false;
      }

      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Mengirim Tautan...</span>
        `;

        setTimeout(() => {
          btn.innerHTML = `
            <span>Tautan Terkirim</span>
            <span class="material-symbols-outlined text-[18px]">check</span>
          `;
          if (banner) banner.classList.remove('hidden');
          showToast('Tautan pemulihan berhasil dikirim');
          setTimeout(() => {
            btn.innerHTML = `<span>Kirim Ulang Tautan</span><span class="material-symbols-outlined text-[18px]">arrow_forward</span>`;
            btn.disabled = false;
          }, 3000);
        }, 1200);
      }

      return false;
    }
