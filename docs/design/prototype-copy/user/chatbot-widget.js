/* Floating Bantuan IKAPI widget - shared component (same UI as chatbot_bantuan_rekomendasi_desktop.html) */
(function () {
  if (document.getElementById('ikapi-chat-widget-wrapper')) return;
  var style = document.createElement('style');
  style.textContent = "/* Scoped styles so the widget looks identical on every host page\n   (host pages may not define the dashboard token names in their Tailwind config). */\n#ikapi-chat-widget-wrapper .text-ink-body{color:#222225}\n#ikapi-chat-widget-wrapper .text-ink-muted{color:#62636b}\n#ikapi-chat-widget-wrapper .bg-surface-soft{background-color:#f5f6ff}\n#ikapi-chat-widget-wrapper .bg-surface-neutral{background-color:#f5f5f6}\n#ikapi-chat-widget-wrapper .bg-surface-container{background-color:#f1f1f4}\n#ikapi-chat-widget-wrapper .border-border-subtle{border-color:#e5e7eb}\n#ikapi-chat-widget-wrapper .border-border-bold{border-color:#d1d5db}\n#ikapi-chat-widget-wrapper .divide-border-subtle > * + *{border-top:1px solid #e5e7eb}\n#ikapi-chat-widget-wrapper .bg-primary{background-color:#673de6}\n#ikapi-chat-widget-wrapper .hover\\:bg-primary-hover:hover{background-color:#5025d1}\n#ikapi-chat-widget-wrapper .hover\\:bg-primary:hover{background-color:#673de6}\n#ikapi-chat-widget-wrapper .text-primary{color:#673de6}\n#ikapi-chat-widget-wrapper .hover\\:text-primary:hover{color:#673de6}\n#ikapi-chat-widget-wrapper .text-primary-accent{color:#9d99ff}\n#ikapi-chat-widget-wrapper .bg-ink-body{background-color:#222225}\n#ikapi-chat-widget-wrapper .hover\\:bg-surface-soft:hover{background-color:#f5f6ff}\n#ikapi-chat-widget-wrapper .hover\\:bg-surface-neutral:hover{background-color:#f5f5f6}\n#ikapi-chat-widget-wrapper .hover\\:text-ink-body:hover{color:#222225}\n#ikapi-chat-widget-wrapper .border-primary\\/20{border-color:rgba(103,61,230,.2)}\n#ikapi-chat-widget-wrapper .border-primary\\/30{border-color:rgba(103,61,230,.3)}\n#ikapi-chat-widget-wrapper .group:hover .group-hover\\:text-primary{color:#673de6}\n#ikapi-chat-widget-wrapper .ikapi-user-message{width:fit-content;max-width:85%;padding:10px 14px;background-color:#673de6;color:#ffffff;border-radius:18px 18px 2px 18px;font-size:14px;line-height:1.5;overflow-wrap:anywhere}\n#ikapi-chat-widget-wrapper .shadow-xs{box-shadow:0 1px 2px rgba(34,34,37,.05)}\n#ikapi-chat-widget-wrapper .focus\\:ring-primary\\/30:focus{box-shadow:0 0 0 4px rgba(103,61,230,.3)}\n#ikapi-chat-widget-wrapper .animate-in{animation:ikapiChatFade .2s ease-out}\n@keyframes ikapiChatFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}\n#ikapi-chat-widget-wrapper :focus-visible{outline:2px solid #673de6;outline-offset:2px}\n#ikapi-chat-widget-wrapper input:focus-visible,#ikapi-chat-widget-wrapper textarea:focus-visible{outline:none}\n#ikapi-chat-widget-wrapper textarea{border:0;background:transparent;box-shadow:none;resize:none}\n#ikapi-chat-widget-wrapper form:focus-within{border-color:#673de6;background:#fff;box-shadow:0 0 0 4px rgba(103,61,230,.18)}\n#ikapi-chat-widget-wrapper form{transition:border-color .15s ease, box-shadow .15s ease}\n@media (prefers-reduced-motion: reduce){#ikapi-chat-widget-wrapper *{transition:none!important;animation:none!important}}\n";
  document.head.appendChild(style);
  var holder = document.createElement('div');
  holder.innerHTML = "<!-- FLOATING CHATBOT WIDGET (Z.ai Conversation Experience \u00d7 Hostinger Design System) -->\n  <div id=\"ikapi-chat-widget-wrapper\" class=\"fixed bottom-6 right-6 z-[60] flex flex-col items-end\">\n    \n    <!-- Chat Window Container -->\n    <div id=\"ikapi-chat-window\" class=\"hidden w-[400px] h-[580px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-120px)] bg-white rounded-3xl shadow-2xl border border-border-subtle flex-col overflow-hidden mb-3 transition-all duration-300 origin-bottom-right\" role=\"dialog\" aria-labelledby=\"chat-header-title\">\n      \n      <!-- Widget Header (Clean White Hostinger-style) -->\n      <div class=\"bg-white px-5 py-3.5 border-b border-border-subtle flex items-center justify-between shrink-0\">\n        <div class=\"flex items-center gap-3\">\n          <div class=\"w-9 h-9 rounded-xl bg-surface-soft border border-primary/20 flex items-center justify-center text-primary font-bold text-[14px] shrink-0 shadow-xs\">\n            <span class=\"material-symbols-outlined text-[20px]\">smart_toy</span>\n          </div>\n          <div>\n            <h2 id=\"chat-header-title\" class=\"text-[15px] font-bold text-ink-body tracking-tight leading-tight\">\n              Bantuan IKAPI\n            </h2>\n            <span class=\"text-[12px] text-ink-muted leading-tight block\">\n              Asisten buku dan pesanan\n            </span>\n          </div>\n        </div>\n        <div class=\"flex items-center gap-1\">\n          <button type=\"button\" aria-label=\"Bersihkan Percakapan\" class=\"w-8 h-8 rounded-xl flex items-center justify-center text-ink-muted hover:text-ink-body hover:bg-surface-neutral transition-colors\" onclick=\"resetChatConversation()\" title=\"Bersihkan Percakapan\">\n            <span class=\"material-symbols-outlined text-[18px]\">refresh</span>\n          </button>\n          <button type=\"button\" aria-label=\"Tutup Jendela Bantuan\" class=\"w-8 h-8 rounded-xl flex items-center justify-center text-ink-muted hover:text-ink-body hover:bg-surface-neutral transition-colors\" onclick=\"toggleWidgetPanel()\" title=\"Tutup Jendela\">\n            <span class=\"material-symbols-outlined text-[18px]\">close</span>\n          </button>\n        </div>\n      </div>\n\n      <!-- Chat Body (Scrollable Conversation Thread - Z.ai text-first layout) -->\n      <div id=\"chat-body-scrollable\" class=\"flex-1 overflow-y-auto p-5 space-y-4 bg-white\" role=\"log\" aria-live=\"polite\">\n        <!-- Messages rendered dynamically by JS -->\n      </div>\n\n      <!-- Quick Question Prompts Container (Hidden when initial screen is shown) -->\n      <div id=\"quick-prompts-wrapper\" class=\"hidden px-4 py-2 bg-white border-t border-border-subtle shrink-0\">\n        <span class=\"text-[11px] font-bold text-ink-muted uppercase tracking-wider block mb-1.5\">\n          Coba tanyakan:\n        </span>\n        <div class=\"flex flex-wrap gap-1.5\">\n          <button type=\"button\" class=\"text-left text-[12px] font-medium px-3 py-1.5 rounded-xl bg-surface-neutral hover:bg-surface-soft hover:text-primary text-ink-body transition-colors border border-border-subtle\" onclick=\"handleQuickPrompt('Cari buku sejarah Sunda')\">\n            Cari buku sejarah Sunda\n          </button>\n          <button type=\"button\" class=\"text-left text-[12px] font-medium px-3 py-1.5 rounded-xl bg-surface-neutral hover:bg-surface-soft hover:text-primary text-ink-body transition-colors border border-border-subtle\" onclick=\"handleQuickPrompt('Cara pembayaran')\">\n            Cara pembayaran\n          </button>\n          <button type=\"button\" class=\"text-left text-[12px] font-medium px-3 py-1.5 rounded-xl bg-surface-neutral hover:bg-surface-soft hover:text-primary text-ink-body transition-colors border border-border-subtle\" onclick=\"handleQuickPrompt('Cara membaca e-book')\">\n            Cara membaca e-book\n          </button>\n          <button type=\"button\" class=\"text-left text-[12px] font-medium px-3 py-1.5 rounded-xl bg-surface-neutral hover:bg-surface-soft hover:text-primary text-ink-body transition-colors border border-border-subtle\" onclick=\"handleQuickPrompt('Hubungi bantuan')\">\n            Hubungi bantuan\n          </button>\n        </div>\n      </div>\n\n      <!-- Composer / Bottom Input Area (Unified rounded pill with arrow upward submit) -->\n      <div class=\"p-3 bg-white border-t border-border-subtle shrink-0\">\n        <form class=\"flex items-center gap-2 p-1.5 pl-4 rounded-full bg-surface-neutral border border-border-subtle focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all\" onsubmit=\"handleChatSubmit(event)\">\n          <div class=\"relative flex-1\">\n            <textarea id=\"chat-input-field\" rows=\"1\" class=\"w-full resize-none py-1.5 bg-transparent border-0 outline-none text-ink-body text-[14px] placeholder:text-ink-muted leading-relaxed max-h-24\" placeholder=\"Tulis pertanyaan...\" onkeydown=\"handleTextareaKeydown(event)\"></textarea>\n          </div>\n          <button id=\"chat-send-btn\" type=\"submit\" aria-label=\"Kirim Pesan\" class=\"w-10 h-10 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center shrink-0 transition-colors shadow-xs cursor-pointer\">\n            <span class=\"material-symbols-outlined text-[20px]\">arrow_upward</span>\n          </button>\n        </form>\n      </div>\n\n    </div>\n\n    <!-- Floating Action Button Launcher -->\n    <button id=\"launcher-button\" type=\"button\" aria-expanded=\"false\" aria-controls=\"ikapi-chat-window\" aria-label=\"Buka Bantuan IKAPI\" class=\"w-14 h-14 rounded-full bg-primary hover:bg-primary-hover text-white shadow-xl flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary/30\" onclick=\"toggleWidgetPanel()\">\n      <span id=\"launcher-icon-chat\" class=\"material-symbols-outlined text-[26px]\">chat</span>\n      <span id=\"launcher-icon-close\" class=\"material-symbols-outlined text-[26px] hidden\">close</span>\n    </button>\n\n  </div>\n<!-- TOAST NOTIFICATION -->\n  <div id=\"ikapi-chat-toast\" class=\"fixed bottom-6 right-24 z-[60] transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-ink-body text-white shadow-xl text-[14px] font-medium border border-white/10\">\n    <span id=\"ikapi-chat-toast-icon\" class=\"material-symbols-outlined text-primary-accent text-[20px]\">check_circle</span>\n    <span id=\"ikapi-chat-toast-message\">Tindakan berhasil dilakukan.</span>\n  </div>";
  while (holder.firstChild) document.body.appendChild(holder.firstChild);
})();

let ikapiChatOpen = false;

    // True Conversation Thread State
    let ikapiChatHistory = [];

    let ikapiChatToastTimer = null;
    function ikapiChatToast(message, icon = 'check_circle') {
      const toast = document.getElementById('ikapi-chat-toast');
      const msg = document.getElementById('ikapi-chat-toast-message');
      const ic = document.getElementById('ikapi-chat-toast-icon');
      if (!toast || !msg) return;

      msg.textContent = message;
      if (ic) ic.textContent = icon;
      toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
      toast.classList.add('translate-y-0', 'opacity-100');

      if (ikapiChatToastTimer) clearTimeout(ikapiChatToastTimer);
      ikapiChatToastTimer = setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
        toast.classList.remove('translate-y-0', 'opacity-100');
      }, 2500);
    }

    // Copy to clipboard helper for Z.ai action
    function copyMessageText(btn, text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          ikapiChatToast('Pesan berhasil disalin ke papan klip', 'content_copy');
        }).catch(() => {
          ikapiChatToast('Teks siap disalin', 'content_copy');
        });
      } else {
        ikapiChatToast('Teks siap disalin', 'content_copy');
      }
    }

    // Helper to sanitize HTML strings
    function escapeHtml(str) {
      if (!str) return '';
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    function initWelcomeConversation() {
      ikapiChatHistory = [];
      renderConversation();
    }

    function renderConversation() {
      const body = document.getElementById('chat-body-scrollable');
      const quickPromptsWrapper = document.getElementById('quick-prompts-wrapper');
      if (!body) return;

      // When conversation is empty, display the clean initial greeting & prompt cards (like Z.ai)
      if (ikapiChatHistory.length === 0) {
        if (quickPromptsWrapper) quickPromptsWrapper.classList.add('hidden');
        body.innerHTML = `
          <div class="h-full flex flex-col justify-center items-center text-center px-1 py-6 space-y-5 animate-in fade-in duration-300">
            <!-- Headline & Subtitle -->
            <div class="space-y-1.5">
              <h3 class="text-[20px] font-bold text-ink-body tracking-tight leading-snug">
                Ada yang bisa dibantu?
              </h3>
              <p class="text-[13px] text-ink-muted leading-relaxed max-w-xs mx-auto">
                Tanyakan rekomendasi buku, panduan pembayaran, atau cara membaca e-book di IKAPI Store.
              </p>
            </div>

            <!-- Unified Rounded Card Container with 4 rows and 1px dividers (100% matching screenshot) -->
            <div class="w-full rounded-2xl bg-surface-neutral border border-border-subtle overflow-hidden divide-y divide-border-subtle text-left shadow-xs">
              <button type="button" class="w-full px-4 py-3.5 flex items-center gap-3.5 hover:bg-surface-soft hover:text-primary text-ink-body transition-colors cursor-pointer group" onclick="handleQuickPrompt('Cari buku sejarah Sunda')">
                <span class="material-symbols-outlined text-[20px] text-primary shrink-0">auto_stories</span>
                <span class="text-[13.5px] font-medium group-hover:text-primary transition-colors">Cari buku sejarah Sunda</span>
              </button>

              <button type="button" class="w-full px-4 py-3.5 flex items-center gap-3.5 hover:bg-surface-soft hover:text-primary text-ink-body transition-colors cursor-pointer group" onclick="handleQuickPrompt('Cara pembayaran')">
                <span class="material-symbols-outlined text-[20px] text-primary shrink-0">payments</span>
                <span class="text-[13.5px] font-medium group-hover:text-primary transition-colors">Cara pembayaran</span>
              </button>

              <button type="button" class="w-full px-4 py-3.5 flex items-center gap-3.5 hover:bg-surface-soft hover:text-primary text-ink-body transition-colors cursor-pointer group" onclick="handleQuickPrompt('Cara membaca e-book')">
                <span class="material-symbols-outlined text-[20px] text-primary shrink-0">menu_book</span>
                <span class="text-[13.5px] font-medium group-hover:text-primary transition-colors">Cara membaca e-book</span>
              </button>

              <button type="button" class="w-full px-4 py-3.5 flex items-center gap-3.5 hover:bg-surface-soft hover:text-primary text-ink-body transition-colors cursor-pointer group" onclick="handleQuickPrompt('Hubungi bantuan')">
                <span class="material-symbols-outlined text-[20px] text-primary shrink-0">support_agent</span>
                <span class="text-[13.5px] font-medium group-hover:text-primary transition-colors">Hubungi bantuan</span>
              </button>
            </div>
          </div>
        `;
        return;
      }

      // If conversation has messages, render conversation thread and show compact prompt row
      if (quickPromptsWrapper) quickPromptsWrapper.classList.remove('hidden');
      body.innerHTML = ikapiChatHistory.map(msg => {
        // User Messages: Z.ai right-aligned with sharp bottom-right corner
        if (msg.role === 'user') {
          return `
            <div class="flex justify-end">
              <div class="ikapi-user-message shadow-xs">
                ${escapeHtml(msg.content)}
              </div>
            </div>
          `;
        }

        if (msg.type === 'loading') {
          return `
            <div class="flex items-center gap-1.5 py-1.5 text-ink-muted text-[13px] animate-in fade-in duration-200">
              <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span class="w-2 h-2 rounded-full bg-primary animate-pulse [animation-delay:200ms]"></span>
              <span class="w-2 h-2 rounded-full bg-primary animate-pulse [animation-delay:400ms]"></span>
              <span class="ml-1 text-[13px]">Menyiapkan jawaban...</span>
            </div>
          `;
        }

        if (msg.type === 'rekomendasi') {
          const rawCopyText = `${msg.content} Laskar Aksara Pasundan oleh Ayi R. Kurnia - Rp 45.000`;
          return `
            <div class="flex flex-col items-start gap-1 w-full animate-in fade-in duration-200">
              <div class="w-full text-[14px] text-ink-body leading-relaxed space-y-3">
                <p>${escapeHtml(msg.content)}</p>
                
                <!-- Recommendation Card -->
                <div class="w-full bg-surface-neutral hover:bg-surface-soft/60 border border-border-subtle rounded-2xl p-3.5 flex gap-3.5 shadow-xs transition-colors">
                  <div class="w-16 sm:w-20 aspect-[2/3] bg-white rounded-xl overflow-hidden shrink-0 border border-border-subtle shadow-xs">
                    <img src="../../assets/covers/laskar-aksara-pasundan.jpg" alt="Sampul Laskar Aksara Pasundan" class="w-full h-full object-cover">
                  </div>
                  <div class="flex flex-col justify-between flex-1 min-w-0 py-0.5">
                    <div>
                      <h4 class="text-[14px] font-bold text-ink-body leading-tight truncate">Laskar Aksara Pasundan</h4>
                      <p class="text-[12px] text-ink-muted mt-0.5">Ayi R. Kurnia</p>
                      <p class="text-[14px] font-bold text-primary mt-1">Rp 45.000</p>
                    </div>
                    <div class="pt-1.5">
                      <a href="detail_buku_desktop.html" data-path="detail-buku" class="inline-flex items-center gap-1 text-[13px] font-bold text-primary hover:text-primary-hover">
                        <span>Lihat Buku</span>
                        <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </a>
                    </div>
                  </div>
                </div>

                <!-- Copy Action -->
                <div>
                  <button type="button" class="inline-flex items-center gap-1.5 text-[12px] text-ink-muted hover:text-primary transition-colors cursor-pointer" onclick="copyMessageText(this, '${escapeHtml(rawCopyText)}')">
                    <span class="material-symbols-outlined text-[15px]">content_copy</span>
                    <span>Salin</span>
                  </button>
                </div>
              </div>
            </div>
          `;
        }

        if (msg.type === 'pembayaran') {
          const rawCopyText = `Cara Membeli & Membayar E-Book: 1. Pilih buku dan tambahkan ke keranjang. 2. Lanjutkan ke konfirmasi pesanan dan pembayaran. 3. Pilih metode pembayaran (QRIS atau Virtual Account). 4. Setelah terverifikasi, buku otomatis masuk ke akun Anda.`;
          return `
            <div class="flex flex-col items-start gap-1 w-full animate-in fade-in duration-200">
              <div class="w-full text-[14px] text-ink-body leading-relaxed space-y-2.5">
                <p class="font-bold text-ink-body">Cara Membeli &amp; Membayar E-Book:</p>
                <ol class="list-decimal list-inside space-y-1 text-ink-body text-[13.5px]">
                  <li>Pilih buku dan tambahkan ke keranjang belanja.</li>
                  <li>Lanjutkan ke konfirmasi pesanan dan pembayaran.</li>
                  <li>Pilih metode pembayaran (QRIS atau Virtual Account).</li>
                  <li>Setelah terverifikasi, buku otomatis masuk ke akun Anda.</li>
                </ol>
                <div class="pt-1 flex items-center justify-between">
                  <a href="perpustakaan_saya_desktop.html" data-path="perpustakaan-saya" class="text-[13px] font-bold text-primary hover:text-primary-hover inline-flex items-center gap-1">
                    <span>Buka Perpustakaan Saya</span>
                    <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </a>
                  <button type="button" class="inline-flex items-center gap-1.5 text-[12px] text-ink-muted hover:text-primary transition-colors cursor-pointer" onclick="copyMessageText(this, '${escapeHtml(rawCopyText)}')">
                    <span class="material-symbols-outlined text-[15px]">content_copy</span>
                    <span>Salin</span>
                  </button>
                </div>
              </div>
            </div>
          `;
        }

        if (msg.type === 'reader') {
          const rawCopyText = `Cara Membaca E-Book: 1. Masuk ke akun IKAPI Store Anda. 2. Buka menu Perpustakaan Saya. 3. Pilih buku yang telah dibeli, lalu klik Mulai Baca. 4. E-book langsung dibaca di peramban tanpa unduh file.`;
          return `
            <div class="flex flex-col items-start gap-1 w-full animate-in fade-in duration-200">
              <div class="w-full text-[14px] text-ink-body leading-relaxed space-y-2.5">
                <p class="font-bold text-ink-body">Cara Membaca E-Book:</p>
                <ol class="list-decimal list-inside space-y-1 text-ink-body text-[13.5px]">
                  <li>Masuk ke akun IKAPI Store Anda.</li>
                  <li>Buka menu <strong>Perpustakaan Saya</strong>.</li>
                  <li>Pilih buku yang telah dibeli, lalu klik <strong>Mulai Baca</strong>.</li>
                  <li>E-book langsung dibaca di peramban tanpa unduh file.</li>
                </ol>
                <div class="pt-1 flex items-center justify-between">
                  <a href="perpustakaan_saya_desktop.html" data-path="perpustakaan-saya" class="text-[13px] font-bold text-primary hover:text-primary-hover inline-flex items-center gap-1">
                    <span>Buka Perpustakaan Saya</span>
                    <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </a>
                  <button type="button" class="inline-flex items-center gap-1.5 text-[12px] text-ink-muted hover:text-primary transition-colors cursor-pointer" onclick="copyMessageText(this, '${escapeHtml(rawCopyText)}')">
                    <span class="material-symbols-outlined text-[15px]">content_copy</span>
                    <span>Salin</span>
                  </button>
                </div>
              </div>
            </div>
          `;
        }

        if (msg.type === 'eskalasi') {
          const rawCopyText = `Kontak Sekretariat IKAPI Jabar: Email: sekretariat@ikapi-jabar.id | Alamat: Jl. Buah Batu No. 120, Kota Bandung`;
          return `
            <div class="flex flex-col items-start gap-1 w-full animate-in fade-in duration-200">
              <div class="w-full text-[14px] text-ink-body leading-relaxed space-y-2.5">
                <p class="text-ink-body">
                  Untuk pertanyaan seputar kerja sama penerbit, keanggotaan, atau kendala transaksi khusus, silakan hubungi tim kami:
                </p>
                <div class="bg-surface-neutral p-3 rounded-2xl border border-border-subtle text-[13px] space-y-2">
                  <div class="flex items-center gap-2.5">
                    <span class="material-symbols-outlined text-[18px] text-primary">mail</span>
                    <a href="mailto:sekretariat@ikapi-jabar.id" class="text-primary font-medium hover:underline">sekretariat@ikapi-jabar.id</a>
                  </div>
                  <div class="flex items-center gap-2.5">
                    <span class="material-symbols-outlined text-[18px] text-primary">location_on</span>
                    <span class="text-ink-body">Jl. Buah Batu No. 120, Kota Bandung</span>
                  </div>
                </div>
                <div class="pt-1">
                  <button type="button" class="inline-flex items-center gap-1.5 text-[12px] text-ink-muted hover:text-primary transition-colors cursor-pointer" onclick="copyMessageText(this, '${escapeHtml(rawCopyText)}')">
                    <span class="material-symbols-outlined text-[15px]">content_copy</span>
                    <span>Salin</span>
                  </button>
                </div>
              </div>
            </div>
          `;
        }

        // Generic Plain Text Assistant Response
        const plainCopyText = msg.content;
        return `
          <div class="flex flex-col items-start gap-1 w-full animate-in fade-in duration-200">
            <div class="text-[14px] text-ink-body leading-relaxed space-y-2">
              <p>${escapeHtml(msg.content)}</p>
              <button type="button" class="inline-flex items-center gap-1.5 text-[12px] text-ink-muted hover:text-primary transition-colors cursor-pointer" onclick="copyMessageText(this, '${escapeHtml(plainCopyText)}')">
                <span class="material-symbols-outlined text-[15px]">content_copy</span>
                <span>Salin</span>
              </button>
            </div>
          </div>
        `;
      }).join('');

      // Auto scroll to bottom
      setTimeout(() => {
        body.scrollTop = body.scrollHeight;
      }, 50);
    }

    // Toggle Chat Window
    function toggleWidgetPanel() {
      const windowEl = document.getElementById('ikapi-chat-window');
      const chatIcon = document.getElementById('launcher-icon-chat');
      const closeIcon = document.getElementById('launcher-icon-close');
      const toggleLabel = document.getElementById('toggle-label-text');
      const launcherBtn = document.getElementById('launcher-button');

      ikapiChatOpen = !ikapiChatOpen;

      if (ikapiChatOpen) {
        windowEl.classList.remove('hidden', 'scale-95', 'opacity-0', 'pointer-events-none');
        windowEl.classList.add('flex', 'scale-100', 'opacity-100');
        chatIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');
        if (toggleLabel) toggleLabel.textContent = 'Tutup Jendela Chat';
        if (launcherBtn) {
          launcherBtn.setAttribute('aria-expanded', 'true');
          launcherBtn.setAttribute('aria-label', 'Tutup Bantuan IKAPI');
        }
      } else {
        windowEl.classList.add('hidden', 'scale-95', 'opacity-0', 'pointer-events-none');
        windowEl.classList.remove('flex', 'scale-100', 'opacity-100');
        chatIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
        if (toggleLabel) toggleLabel.textContent = 'Buka Jendela Chat';
        if (launcherBtn) {
          launcherBtn.setAttribute('aria-expanded', 'false');
          launcherBtn.setAttribute('aria-label', 'Buka Bantuan IKAPI');
        }
      }
    }

    function openWidgetIfClosed() {
      if (!ikapiChatOpen) {
        toggleWidgetPanel();
      }
    }

    // Reset Conversation to Initial Welcome
    function resetChatConversation() {
      initWelcomeConversation();
      const input = document.getElementById('chat-input-field');
      if (input) input.value = '';
      ikapiChatToast('Percakapan dibersihkan', 'refresh');
    }

    // Dispatch Assistant Response by Intent
    function dispatchAssistantResponse(userText) {
      const lower = userText.toLowerCase();

      // Check Intent
      if (lower.includes('sunda') || lower.includes('naskah') || lower.includes('sejarah') || lower.includes('rekomendasi')) {
        ikapiChatHistory.push({
          id: 'msg-' + Date.now(),
          role: 'assistant',
          type: 'rekomendasi',
          content: 'Ada buku yang membahas sejarah dan naskah Sunda. Ini yang paling sesuai dengan pencarianmu:'
        });
      } else if (lower.includes('bayar') || lower.includes('qris') || lower.includes('transfer') || lower.includes('pembayaran')) {
        ikapiChatHistory.push({
          id: 'msg-' + Date.now(),
          role: 'assistant',
          type: 'pembayaran',
          content: ''
        });
      } else if (lower.includes('baca') || lower.includes('reader') || lower.includes('e-book') || lower.includes('perpustakaan')) {
        ikapiChatHistory.push({
          id: 'msg-' + Date.now(),
          role: 'assistant',
          type: 'reader',
          content: ''
        });
      } else if (lower.includes('hubungi') || lower.includes('kontak') || lower.includes('bantuan') || lower.includes('cs') || lower.includes('admin') || lower.includes('kerja sama')) {
        ikapiChatHistory.push({
          id: 'msg-' + Date.now(),
          role: 'assistant',
          type: 'eskalasi',
          content: ''
        });
      } else {
        // Fallback response
        ikapiChatHistory.push({
          id: 'msg-' + Date.now(),
          role: 'assistant',
          type: 'text',
          content: 'Untuk saat ini, aku bisa bantu cari buku, menjelaskan pembayaran, dan cara membaca e-book. Mau pilih salah satunya?'
        });
      }

      renderConversation();
    }

    function handleQuickPrompt(text) {
      openWidgetIfClosed();
      ikapiChatHistory.push({
        id: 'msg-' + Date.now(),
        role: 'user',
        content: text
      });
      renderConversation();
      setTimeout(() => {
        dispatchAssistantResponse(text);
      }, 100);
    }

    function handleChatSubmit(e) {
      if (e) e.preventDefault();
      const input = document.getElementById('chat-input-field');
      if (!input) return;
      const val = input.value.trim();
      if (!val) return;

      openWidgetIfClosed();
      ikapiChatHistory.push({
        id: 'msg-' + Date.now(),
        role: 'user',
        content: val
      });
      input.value = '';
      renderConversation();

      setTimeout(() => {
        dispatchAssistantResponse(val);
      }, 100);
    }

    function handleTextareaKeydown(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleChatSubmit(e);
      }
    }

    // Demo Scenario Switcher for Reviewers
    // Close on Escape if widget is open
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && ikapiChatOpen) {
        toggleWidgetPanel();
      }
    });

    initWelcomeConversation();
