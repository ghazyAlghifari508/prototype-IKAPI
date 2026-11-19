{{--
  Portal toast. Source: the bottom-centre toast in 8 portal pages (kelola_pengguna, kelola_pencairan,
  kelola_komunitas, moderasi_ulasan, moderasi_diskusi, pengawasan_katalog, ulasan_pembeli, pengaturan_profil).
  Markup/classes copied verbatim (z-[95], bottom-6, centred, `pointer-events-none`, `role="status"`).

  One instance per page. The prototype's per-page ids (`toast`, `toast-text`) are replaced by data hooks, so
  resources/js/ikapi/toast.js can drive it and the old `toast()` helpers can be removed when a page is migrated.
  (Buyer pages use a different bottom-right toast; that variant is intentionally NOT merged here.)
--}}
<div data-ikapi-toast role="status" class="pointer-events-none fixed bottom-6 left-1/2 z-[95] hidden -translate-x-1/2 rounded-xl border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-ink shadow-[0_12px_32px_rgba(34,34,37,0.14)]">
  <span data-ikapi-toast-text></span>
</div>
