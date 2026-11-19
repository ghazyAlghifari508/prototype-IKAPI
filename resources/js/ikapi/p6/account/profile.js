// akun_saya_profil_dropdown_navigasi_desktop
// Ported verbatim from docs/design/prototype-copy/user/akun_saya_profil_dropdown_navigasi_desktop.html (inline <script>, 237 lines).
// Only this wrapper is new: the module runs once the DOM is ready and only on its own page.
import { onReady } from '../../shared.js';

onReady(function () {
    if (!document.querySelector('#profile-form')) return;

    const STORAGE_KEY = 'ikapi_user_profile';
        const DEFAULT_PROFILE = {
          fullName: 'Ahmad Hidayat',
          email: 'ahmad.hidayat@literasi.id',
          phone: '0812-3456-7890',
          avatarUrl: null,
          categories: ['Sastra & Fiksi', 'Budaya & Tradisi', 'Pendidikan']
        };

        // Committed State (persisted) vs Draft State (in-flight editing)
        let committedProfile = getStoredProfile();
        let draftProfile = JSON.parse(JSON.stringify(committedProfile));

        function getStoredProfile() {
          try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
          } catch (e) {}
          return Object.assign({}, DEFAULT_PROFILE);
        }

        function saveStoredProfile(p) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
          } catch (e) {}
        }

        let toastTimer = null;
        function showToast(message, icon = 'check_circle') {
          const toast = document.getElementById('toast-notification');
          const msg = document.getElementById('toastMessage');
          const ic = document.getElementById('toastIcon');
          if (!toast || !msg) return;

          msg.textContent = message;
          if (ic) ic.textContent = icon;
          toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
          toast.classList.add('translate-y-0', 'opacity-100');

          if (toastTimer) clearTimeout(toastTimer);
          toastTimer = setTimeout(() => {
            toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
            toast.classList.remove('translate-y-0', 'opacity-100');
          }, 2800);
        }

        function getInitials(name) {
          if (!name) return 'AH';
          const parts = name.trim().split(/\s+/);
          if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
          return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }

        function syncGlobalIdentity(profile) {
          const initials = getInitials(profile.fullName);

          // Text elements
          const headerName = document.getElementById('header-user-name');
          const dropdownName = document.getElementById('dropdown-user-name');
          const sidebarName = document.getElementById('sidebar-user-name');

          if (headerName) headerName.textContent = profile.fullName;
          if (dropdownName) dropdownName.textContent = profile.fullName;
          if (sidebarName) sidebarName.textContent = profile.fullName;

          // Avatar elements
          const avatarContainers = [
            { id: 'header-avatar', initialsId: 'header-avatar-initials' },
            { id: 'sidebar-avatar', initialsId: 'sidebar-avatar-initials' }
          ];

          avatarContainers.forEach(t => {
            const container = document.getElementById(t.id);
            if (!container) return;
            if (profile.avatarUrl) {
              container.innerHTML = `<img src="${profile.avatarUrl}" alt="Avatar" class="w-full h-full object-cover">`;
            } else {
              container.innerHTML = `<span id="${t.initialsId}">${initials}</span>`;
            }
          });
        }

        function syncDraftFormView() {
          const nameInput = document.getElementById('full-name');
          const phoneInput = document.getElementById('phone');
          const formAvatar = document.getElementById('form-avatar');

          if (nameInput) nameInput.value = draftProfile.fullName;
          if (phoneInput) phoneInput.value = draftProfile.phone;

          if (formAvatar) {
            if (draftProfile.avatarUrl) {
              formAvatar.innerHTML = `<img src="${draftProfile.avatarUrl}" alt="Avatar Preview" class="w-full h-full object-cover">`;
            } else {
              formAvatar.innerHTML = `<span id="form-avatar-initials">${getInitials(draftProfile.fullName)}</span>`;
            }
          }

          // Sync chips
          const chips = document.querySelectorAll('.category-chip');
          chips.forEach(chip => {
            const cat = chip.getAttribute('data-category');
            const isSelected = draftProfile.categories.includes(cat);
            if (isSelected) {
              chip.className = 'category-chip px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all bg-primary text-white shadow-xs';
            } else {
              chip.className = 'category-chip px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all bg-surface-neutral text-ink-body hover:bg-surface-soft border border-border-subtle';
            }
          });
        }

        // Input change handlers (draft only)
        function handleNameInput(e) {
          draftProfile.fullName = e.target.value;
          const initials = getInitials(draftProfile.fullName);
          const formInitials = document.getElementById('form-avatar-initials');
          if (formInitials) formInitials.textContent = initials;
        }

        function handlePhoneInput(e) {
          draftProfile.phone = e.target.value;
        }

        // Photo Upload Handler (Draft only)
        function handlePhotoUpload(e) {
          const file = e.target.files?.[0];
          if (!file) return;

          if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            showToast('Format berkas harus JPG, PNG, atau WebP', 'error');
            return;
          }

          if (file.size > 2 * 1024 * 1024) {
            showToast('Ukuran berkas maksimal 2.0 MB', 'error');
            return;
          }

          const reader = new FileReader();
          reader.onload = function(evt) {
            draftProfile.avatarUrl = evt.target.result;
            syncDraftFormView();
            showToast('Pratinjau foto diperbarui (tekan Simpan untuk menerapkan)', 'image');
          };
          reader.readAsDataURL(file);
        }

        function handleDeletePhoto() {
          draftProfile.avatarUrl = null;
          const input = document.getElementById('photo-input');
          if (input) input.value = '';
          syncDraftFormView();
          showToast('Foto profil dihapus dari pratinjau', 'delete');
        }

        // Category Chip Toggle (Draft only)
        function toggleCategoryChip(btn) {
          const cat = btn.getAttribute('data-category');
          if (!cat) return;

          const idx = draftProfile.categories.indexOf(cat);
          if (idx > -1) {
            draftProfile.categories.splice(idx, 1);
          } else {
            draftProfile.categories.push(cat);
          }
          syncDraftFormView();
        }

        // Form Submit Handler (Commit changes)
        function handleProfileSubmit(e) {
          e.preventDefault();
          const nameVal = draftProfile.fullName.trim();
          if (!nameVal) {
            showToast('Nama lengkap tidak boleh kosong', 'error');
            document.getElementById('full-name')?.focus();
            return;
          }

          draftProfile.fullName = nameVal;
          committedProfile = JSON.parse(JSON.stringify(draftProfile));
          saveStoredProfile(committedProfile);

          syncGlobalIdentity(committedProfile);
          syncDraftFormView();
          showToast('Informasi profil berhasil disimpan');
        }

        // Form Cancel / Reset Handler (Revert draft to committed)
        function handleProfileCancel() {
          draftProfile = JSON.parse(JSON.stringify(committedProfile));
          const input = document.getElementById('photo-input');
          if (input) input.value = '';
          syncDraftFormView();
          showToast('Perubahan formulir dibatalkan', 'undo');
        }

        // Account Dropdown Interactions
        document.addEventListener('DOMContentLoaded', () => {
          syncGlobalIdentity(committedProfile);
          syncDraftFormView();

          const toggleBtn = document.getElementById('toggle-dropdown-btn');
          const dropdownMenu = document.getElementById('header-user-dropdown');

          function openDropdown() {
            if (!dropdownMenu) return;
            dropdownMenu.classList.remove('hidden');
            toggleBtn?.setAttribute('aria-expanded', 'true');
          }

          function closeDropdown() {
            if (!dropdownMenu) return;
            dropdownMenu.classList.add('hidden');
            toggleBtn?.setAttribute('aria-expanded', 'false');
          }

          if (toggleBtn && dropdownMenu) {
            toggleBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              const isHidden = dropdownMenu.classList.contains('hidden');
              if (isHidden) openDropdown();
              else closeDropdown();
            });

            document.addEventListener('click', (e) => {
              if (!dropdownMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
                closeDropdown();
              }
            });

            document.addEventListener('keydown', (e) => {
              if (e.key === 'Escape') closeDropdown();
            });
          }
        });

    // Prototype markup calls these from inline handlers; ES modules are scoped, so publish them.
    Object.assign(window, { handleDeletePhoto, handleNameInput, handlePhoneInput, handlePhotoUpload, handleProfileCancel, handleProfileSubmit, toggleCategoryChip });
});
