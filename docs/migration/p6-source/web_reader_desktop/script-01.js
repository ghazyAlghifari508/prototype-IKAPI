// Storage keys
    const SETTINGS_KEY = 'ikapi_reader_settings';
    const BOOKMARKS_KEY = 'ikapi_reader_bookmarks';
    const POSITION_KEY = 'ikapi_reader_pos_laskar_aksara';

    // Canonical total book pages from Detail Buku: 268 halaman
    const TOTAL_BOOK_PAGES = 268;

    // Four real prototype pages for Chapter 3
    const bookPagesData = [
      {
        pageNumber: 41,
        chapter: "BAB 3",
        chapterTitle: "Menelusuri Jejak Aksara Kuno di Hulu Cimanuk",
        contentHtml: `
          <header class="mb-8 text-center font-sans">
            <h2 class="text-[24px] sm:text-[28px] font-bold theme-text tracking-tight leading-tight">
              Menelusuri Jejak Aksara Kuno di Hulu Cimanuk
            </h2>
          </header>
          <div class="space-y-5 text-left">
            <p>
              Pagi itu, kabut tipis masih bergelayut di atas lekukan bukit Rancah saat rombongan kami menyusuri tepian purba Sungai Cimanuk. Gemuruh air di celah batu andesit seakan melantunkan tembang buhun yang telah ratusan tahun terkunci rapat dari bising peradaban perkotaan.
            </p>
            <p>
              Kami mencari serpihan lempengan batu bertulis dan lembaran gebang lontar yang dicatat oleh para filolog pada awal abad kedua puluh, namun kerap kali lenyap ditelan kisah lisan para sesepuh lereng Gunung Ciremai.
            </p>
            <p>
              Bagi masyarakat Sunda kuna, aksara bukanlah sekadar guratan fonetis untuk mencatat transaksi niaga atau silsilah kebangsawanan semata. Aksara adalah wadah sakral dari getaran pemikiran peradaban—sebuah jembatan batiniah antara manusia dengan semesta lingkungan yang melingkupinya.
            </p>
            <p>
              Di jalan setapak berbatu cadas yang licin karena lumut hutan basah, langkah kami dipandu oleh Ki Sasmita, tetua adat yang hafal setiap jengkal lembah Cimanuk. Beliau menunjuk lekukan tebing purba tempat para resi zaman Galuh sering menyendiri untuk menuliskan petuah kebajikan pada lembaran lempir lontar.
            </p>
            <p>
              “Kearifan tulisan baheula tak pernah memisahkan ilmu dari tata krama,” tutur Ki Sasmita seraya menyingkap semak belukar pakis hutan. “Sebelum para juru tulis menggoreskan pisau pangot pada daun gebang, mereka berpuasa dan bermeditasi demi menyucikan niat agar kata-kata yang diwariskan membawa keselamatan bagi alam semesta.”
            </p>
          </div>
        `
      },
      {
        pageNumber: 42,
        chapter: "BAB 3",
        chapterTitle: "Menelusuri Jejak Aksara Kuno di Hulu Cimanuk",
        contentHtml: `
          <div class="space-y-5 text-left">
            <p>
              Ketika sebuah prasasti dipahat di atas batu monolith kali, setiap lengkungan guratan aksara Sunda Kuno memuat doa permohonan keselamatan atas tanah, lumbung pangan, dan ketenteraman mata air warga mandala.
            </p>
            <p>
              Kala jari kami meraba permukaan batuan beku yang berlumut di situs Leuwi Gede, terasalah ketajaman tatah sang pemahat masa silam. Diperlukan ketenangan batin sebelum linggam batu suci disentuh besi tempaan.
            </p>
            <figure class="my-6 rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 p-4 text-center border theme-border">
              <img class="w-full max-h-64 object-cover rounded-xl shadow-xs mx-auto" src="../../assets/events/event-community.jpg" alt="Fragmen rekonstruksi guratan piagam Kabuyutan Galuh">
              <figcaption class="mt-2.5 text-[13px] theme-muted italic font-sans">
                Gambar 3.2 — Rekonstruksi dokumentasi penelitian naskah Sunda kuno di kawasan Priangan Timur.
              </figcaption>
            </figure>
            <p>
              Kami mencatat bagaimana aliran air Sungai Cimanuk sengaja diarahkan melintasi pelataran mandala suci ini. Suara gemercik air dipercaya sebagai pengiring pembacaan mantra pupuh yang dilantunkan para cantrik ketika mereka menyalin teks-teks filsafat dan hukum adat kerajaan.
            </p>
            <p>
              Setiap goresan garis horizontal dan lengkung pada batu andesit itu memperlihatkan keahlian geometris yang luar biasa. Di bawah naungan pohon beringin yang berakar kokoh ke dalam celah tebing, tulisan kuno ini telah bertahan melintasi pergantian dinasti, gempa bumi, dan banjir bandang selama berabad-abad.
            </p>
            <p>
              Dani mengeluarkan kuas halus berbulu musang untuk membersihkan lumut tipis yang menutupi bagian vokal aksara. Melalui lensa makro, detail pahatan yang dibuat sekitar paruh kedua abad ke-15 tampak begitu anggun dan berwibawa, membuktikan tingginya disiplin seni ukir huruf para leluhur Pasundan.
            </p>
          </div>
        `
      },
      {
        pageNumber: 43,
        chapter: "BAB 3",
        chapterTitle: "Malam di Pondok Ki Warsa",
        contentHtml: `
          <div class="space-y-5 text-left">
            <p>
              Dari baris ketiga yang masih terbaca secara utuh, terpahat jelas kalimat petuah dharma, mengisyaratkan bahwa wilayah perbukitan ini dulunya merupakan pusat pendidikan spiritual bagi para resi pengembara.
            </p>
            <p>
              Malam harinya, di bawah temaram lampu damar pondok kayu panggung milik Ki Warsa, naskah lontar lain dibentangkan dengan sangat hati-hati. Udara lembap pegunungan yang menusuk tulang seakan memudar digantikan aroma minyak kemiri dan serbuk cendana yang melumuri lembar-lembar gebang.
            </p>
            <p>
              Di sinilah terkuak rahasia mengapa Laskar Aksara Pasundan memilih untuk bertahan di rimba belantara ketika benteng ibu kota Pajajaran di Pakuan diruntuhkan pada tahun 1579 Masehi. Mereka tidak membawa laras bedil atau keping emas; mereka hanya memanggul peti-peti kayu jati berisi ribuan helai lontar beraksara suci.
            </p>
            <p>
              “Bagi para laskar aksara, tanah kekuasaan boleh saja beralih penguasa, tetapi jiwa kebudayaan tak boleh ikut binasa,” ujar Ki Warsa seraya menyeduh teh pucuk sangray dalam cangkir tempurung kelapa. “Selama aksara dan naskah suci ini terselamatkan di gua-gua pegunungan, jati diri manusia Pasundan akan tetap tegak berdiri.”
            </p>
            <p>
              Di sudut balai-balai bambu, kami menyalin transliterasi bait demi bait ke dalam catatan lapangan. Lembaran lontar yang tipis dan rapuh ini seakan memancarkan daya magis ketabahan; sebuah perlawanan sunyi kaum cendekia kuno yang memilih menyelamatkan ilmu pengetahuan daripada tunduk pada kehancuran zaman.
            </p>
          </div>
        `
      },
      {
        pageNumber: 44,
        chapter: "BAB 3",
        chapterTitle: "Refleksi Akhir Bab",
        contentHtml: `
          <div class="space-y-5 text-left">
            <p>
              Pengetahuan bukanlah sekadar tumpukan kertas tua, melainkan napas yang menentukan apakah sebuah peradaban masih mengenali jati dirinya saat berhadapan dengan laju zaman.
            </p>
            <p>
              Perjalanan di hulu Cimanuk ini menjadi pengingat berharga bagi generasi kini bahwa menjaga aksara adalah ikhtiar merawat ingatan bersama bangsa Nusantara.
            </p>
            <p>
              Manakala masyarakat modern kerap silau oleh kecepatan informasi serba instan, naskah-naskah kuno ini justru mengajarkan keheningan batin, ketelitian mengolah rasa, dan kedalaman perenungan moral dalam memandang kehidupan.
            </p>
            <p>
              Sebelum rombongan kami berpamitan meninggalkan lembah Cimanuk, Ki Sasmita menyerahkan selembar salinan tembang Asmarandana kuno bertuliskan aksara Sunda Buhun. Pesan di dalamnya sederhana: teruskanlah lentera aksara ini kepada anak cucu agar mereka tidak menjadi pengembara tanpa akar di tanah kelahirannya sendiri.
            </p>
            <p>
              Kami melangkah menuruni bukit menuju jalan raya kota saat fajar hari berikutnya mulai merekah di ufuk timur. Di dalam ransel kami, rekaman digital naskah Cimanuk siap dibuka dan dipelajari kembali melalui Web Reader oleh pembaca di era digital hari ini.
            </p>
            <div class="mt-8 pt-4 border-t theme-border text-[13px] theme-muted font-sans space-y-1">
              <p class="font-bold theme-text">Catatan Akhir Bab:</p>
              <p>Materi mengacu pada kajian naskah Sunda klasik dan transkripsi lontar wilayah Priangan Timur.</p>
            </div>
          </div>
        `
      }
    ];

    // State Variables
    let currentPageIndex = 0; // index in bookPagesData (0 = page 41)
    let currentTheme = 'light';
    let currentFontFamily = 'serif';
    let currentFontSize = '18px';
    let currentLineHeight = '1.8';

    let bookmarksData = [
      { page: 41, chapter: "Bab 3: Hulu Cimanuk", time: "Hari ini, 14:15 WIB" },
      { page: 43, chapter: "Bab 3: Pondok Ki Warsa", time: "Kemarin, 19:40 WIB" }
    ];

    let toastTimer = null;
    function showToast(message, icon = 'info') {
      const toast = document.getElementById('reader-toast');
      const msg = document.getElementById('toast-message');
      const ic = document.getElementById('toast-icon');
      if (!toast || !msg) return;

      msg.textContent = message;
      if (ic) ic.textContent = icon;
      toast.classList.remove('-translate-y-6', 'opacity-0', 'pointer-events-none');
      toast.classList.add('translate-y-0', 'opacity-100');

      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('-translate-y-6', 'opacity-0', 'pointer-events-none');
      }, 2500);
    }

    // Render Current Reading Page
    function renderCurrentPage() {
      const data = bookPagesData[currentPageIndex];
      if (!data) return;

      const prose = document.getElementById('prose-content');
      if (prose) {
        prose.innerHTML = data.contentHtml;
        prose.style.fontSize = currentFontSize;
        prose.style.lineHeight = currentLineHeight;
      }

      // Update Running Chapter Label
      document.getElementById('running-chapter-label').textContent = data.chapter;
      document.getElementById('footer-chapter-name').textContent = `${data.chapter}: ${data.chapterTitle}`;
      document.getElementById('footer-page-number').textContent = `Hal ${data.pageNumber}`;

      // Calculate progress relative to total book pages (268 pages)
      const bookPercent = Math.round((data.pageNumber / TOTAL_BOOK_PAGES) * 100);
      const totalInChapter = bookPagesData.length;
      const curInChapter = currentPageIndex + 1;

      document.getElementById('page-indicator').textContent = `Halaman ${data.pageNumber} (${curInChapter} dari ${totalInChapter} di Bab 3)`;
      document.getElementById('progress-percent').textContent = `(${bookPercent}% dari buku)`;
      
      // Progress bar within active chapter
      const chapterPercent = Math.round((curInChapter / totalInChapter) * 100);
      document.getElementById('progress-bar-fill').style.width = `${chapterPercent}%`;

      document.getElementById('progress-min-label').textContent = String(bookPagesData[0].pageNumber);
      document.getElementById('progress-max-label').textContent = String(bookPagesData[totalInChapter - 1].pageNumber);

      document.getElementById('bm-current-page').textContent = String(data.pageNumber);
      document.getElementById('bm-current-chapter').textContent = `${data.chapter}: ${data.chapterTitle}`;

      // Disabled button states
      document.getElementById('btn-prev-page').disabled = currentPageIndex === 0;
      document.getElementById('btn-next-page').disabled = currentPageIndex === totalInChapter - 1;

      // Save position to localStorage
      try {
        localStorage.setItem(POSITION_KEY, String(currentPageIndex));
      } catch (e) {}

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function changePage(delta) {
      const nextIndex = currentPageIndex + delta;
      if (nextIndex >= 0 && nextIndex < bookPagesData.length) {
        currentPageIndex = nextIndex;
        renderCurrentPage();
      }
    }

    function goToPageNumber(pageNo) {
      const idx = bookPagesData.findIndex(p => p.pageNumber === pageNo);
      if (idx !== -1) {
        currentPageIndex = idx;
        renderCurrentPage();
        closeAllDrawers();
      }
    }

    function navigateToChapter(startPage) {
      goToPageNumber(startPage);
    }

    function handleScrub(e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      const targetIndex = Math.min(bookPagesData.length - 1, Math.floor(ratio * bookPagesData.length));
      currentPageIndex = targetIndex;
      renderCurrentPage();
    }

    // THEME HANDLING
    function setReaderTheme(theme) {
      currentTheme = theme;
      document.documentElement.setAttribute('data-reader-theme', theme);

      // Button states
      ['light', 'sepia', 'dark'].forEach(t => {
        const btn = document.getElementById('theme-btn-' + t);
        if (!btn) return;
        if (t === theme) {
          btn.classList.add('border-primary', 'shadow-xs');
          btn.classList.remove('border-transparent');
        } else {
          btn.classList.remove('border-primary', 'shadow-xs');
          btn.classList.add('border-transparent');
        }
      });
      saveSettings();
    }

    function setFontFamily(type) {
      currentFontFamily = type;
      const prose = document.getElementById('prose-content');
      const btnSerif = document.getElementById('font-family-serif');
      const btnSans = document.getElementById('font-family-sans');

      if (type === 'serif') {
        prose.classList.add('font-reading-serif');
        prose.classList.remove('font-reading-sans');
        btnSerif.className = "py-2.5 px-3 rounded-xl border border-primary bg-primary/10 text-primary font-bold text-[13px] font-reading-serif cursor-pointer";
        btnSans.className = "py-2.5 px-3 rounded-xl border theme-border text-ink-muted hover:theme-text font-semibold text-[13px] font-sans cursor-pointer";
      } else {
        prose.classList.remove('font-reading-serif');
        prose.classList.add('font-reading-sans');
        btnSans.className = "py-2.5 px-3 rounded-xl border border-primary bg-primary/10 text-primary font-bold text-[13px] font-sans cursor-pointer";
        btnSerif.className = "py-2.5 px-3 rounded-xl border theme-border text-ink-muted hover:theme-text font-semibold text-[13px] font-reading-serif cursor-pointer";
      }
      saveSettings();
    }

    function setTextSize(size) {
      currentFontSize = size;
      const prose = document.getElementById('prose-content');
      if (prose) prose.style.fontSize = size;

      ['btn-font-sm', 'btn-font-md', 'btn-font-lg'].forEach(id => {
        document.getElementById(id).className = "py-2 px-2.5 rounded-xl border theme-border text-[12px] font-medium theme-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer";
      });

      if (size === '16px') document.getElementById('btn-font-sm').className = "py-2 px-2.5 rounded-xl border border-primary bg-primary text-white text-[12px] font-bold shadow-xs cursor-pointer";
      if (size === '18px') document.getElementById('btn-font-md').className = "py-2 px-2.5 rounded-xl border border-primary bg-primary text-white text-[12px] font-bold shadow-xs cursor-pointer";
      if (size === '22px') document.getElementById('btn-font-lg').className = "py-2 px-2.5 rounded-xl border border-primary bg-primary text-white text-[12px] font-bold shadow-xs cursor-pointer";
      saveSettings();
    }

    function setLineHeight(val) {
      currentLineHeight = val;
      const prose = document.getElementById('prose-content');
      if (prose) prose.style.lineHeight = val;

      ['btn-line-normal', 'btn-line-relaxed', 'btn-line-loose'].forEach(id => {
        document.getElementById(id).className = "py-2 px-2 rounded-xl border theme-border text-[12px] font-medium theme-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer";
      });

      if (val === '1.6') document.getElementById('btn-line-normal').className = "py-2 px-2 rounded-xl border border-primary bg-primary text-white text-[12px] font-bold shadow-xs cursor-pointer";
      if (val === '1.8') document.getElementById('btn-line-relaxed').className = "py-2 px-2 rounded-xl border border-primary bg-primary text-white text-[12px] font-bold shadow-xs cursor-pointer";
      if (val === '2.0') document.getElementById('btn-line-loose').className = "py-2 px-2 rounded-xl border border-primary bg-primary text-white text-[12px] font-bold shadow-xs cursor-pointer";
      saveSettings();
    }

    function saveSettings() {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({
          theme: currentTheme,
          fontFamily: currentFontFamily,
          fontSize: currentFontSize,
          lineHeight: currentLineHeight
        }));
      } catch (e) {}
    }

    function loadSavedSettings() {
      try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (raw) {
          const s = JSON.parse(raw);
          if (s.theme) setReaderTheme(s.theme);
          if (s.fontFamily) setFontFamily(s.fontFamily);
          if (s.fontSize) setTextSize(s.fontSize);
          if (s.lineHeight) setLineHeight(s.lineHeight);
        }
        const savedPos = localStorage.getItem(POSITION_KEY);
        if (savedPos !== null) {
          const p = parseInt(savedPos, 10);
          if (p >= 0 && p < bookPagesData.length) currentPageIndex = p;
        }
      } catch (e) {}
    }

    // BOOKMARKS ENGINE
    function renderBookmarksList() {
      const container = document.getElementById('bookmarks-list-container');
      const countHeader = document.getElementById('bm-count-heading');
      if (!container) return;

      countHeader.textContent = `${bookmarksData.length} penanda tersimpan`;

      if (bookmarksData.length === 0) {
        container.innerHTML = `
          <div class="py-8 text-center theme-muted text-[13px]">
            Belum ada penanda buku yang tersimpan.
          </div>
        `;
        return;
      }

      container.innerHTML = bookmarksData.map(bm => `
        <div class="p-3.5 rounded-2xl border theme-border hover:border-primary transition-all flex justify-between items-start gap-2 theme-paper">
          <button type="button" class="text-left flex-1 min-w-0 cursor-pointer" onclick="goToPageNumber(${bm.page})">
            <span class="text-[12px] font-bold text-primary block">Halaman ${bm.page}</span>
            <p class="text-[13px] font-bold theme-text truncate mt-0.5">${bm.chapter}</p>
            <p class="text-[11px] theme-muted mt-1">${bm.time}</p>
          </button>
          <button type="button" aria-label="Hapus Penanda" class="text-gray-400 hover:text-red-500 p-1 transition-colors cursor-pointer" onclick="removeBookmark(${bm.page})">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      `).join('');
    }

    function addCurrentBookmark() {
      const curPage = bookPagesData[currentPageIndex].pageNumber;
      const isExist = bookmarksData.some(b => b.page === curPage);

      if (isExist) {
        showToast('Halaman ini sudah ditandai.', 'info');
        return;
      }

      bookmarksData.push({
        page: curPage,
        chapter: `${bookPagesData[currentPageIndex].chapter}: ${bookPagesData[currentPageIndex].chapterTitle}`,
        time: 'Baru saja'
      });

      try {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarksData));
      } catch (e) {}

      renderBookmarksList();
      showToast(`Halaman ${curPage} berhasil ditandai!`, 'bookmark_added');
    }

    function removeBookmark(pageNo) {
      bookmarksData = bookmarksData.filter(b => b.page !== pageNo);
      try {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarksData));
      } catch (e) {}
      renderBookmarksList();
      showToast('Penanda buku dihapus.', 'delete');
    }

    function loadSavedBookmarks() {
      try {
        const raw = localStorage.getItem(BOOKMARKS_KEY);
        if (raw) bookmarksData = JSON.parse(raw);
      } catch (e) {}
    }

    // DRAWER & MODAL MANAGEMENT
    function openDrawer(drawerId) {
      closeAllDrawers();
      document.getElementById('drawer-backdrop')?.classList.remove('hidden');
      const drawer = document.getElementById(drawerId);
      if (drawer) {
        drawer.classList.remove('hidden', 'translate-x-full', '-translate-x-full');
      }
    }

    function closeAllDrawers() {
      document.getElementById('drawer-backdrop')?.classList.add('hidden');
      ['drawer-bookmarks', 'drawer-settings', 'drawer-toc'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.classList.add('hidden');
          if (id === 'drawer-toc') el.classList.add('-translate-x-full');
          else el.classList.add('translate-x-full');
        }
      });
    }

    // FULLSCREEN HANDLER
    function toggleFullscreen() {
      const icon = document.getElementById('fullscreen-icon');
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
          if (icon) icon.textContent = 'fullscreen_exit';
        }).catch(() => {
          showToast('Mode layar penuh tidak didukung peramban ini.', 'info');
        });
      } else {
        document.exitFullscreen().then(() => {
          if (icon) icon.textContent = 'fullscreen';
        }).catch(() => {});
      }
    }

    document.addEventListener('fullscreenchange', () => {
      const icon = document.getElementById('fullscreen-icon');
      if (icon) {
        icon.textContent = document.fullscreenElement ? 'fullscreen_exit' : 'fullscreen';
      }
    });

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      if (e.key === 'Escape') {
        closeAllDrawers();
        document.getElementById('modal-unlicensed')?.classList.add('hidden');
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        changePage(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        changePage(-1);
      }
    });

    // Initializer
    document.addEventListener('DOMContentLoaded', () => {
      loadSavedSettings();
      loadSavedBookmarks();
      renderCurrentPage();
      renderBookmarksList();
    });
