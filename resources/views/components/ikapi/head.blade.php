{{--
  Shared <head> for every shell: fonts + Vite assets, no Tailwind CDN, no inline tailwind.config.

  Fonts are loaded exactly as the prototype pages load them (same Google Fonts URLs), so measured
  metrics stay comparable with the P02 golden screenshots. See docs/migration/p3-foundation.md (K5).

  Props
    $title        string  document title
    $icons        string  'buyer' (opsz/GRAD axes, 21 prototype pages) | 'portal' (wght/FILL axes, 17 pages)
    $serif        bool    also load Literata (preview_buku + web_reader only)
--}}
@props(['title', 'icons' => 'buyer', 'serif' => false])

<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{ $title }}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
@if ($serif)
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;0,7..72,700;1,7..72,400&display=swap" rel="stylesheet">
@else
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet">
@endif
{{--
  Material Symbols stylesheet, loaded INSIDE a cascade layer (`@import url(...) layer(icons)`).
  Why: Google's CSS ships an unlayered `.material-symbols-outlined { font-size: 24px }`. In Tailwind 4 every utility
  lives in `@layer utilities`, and unlayered CSS always beats layered CSS, so `text-[20px]` on an icon silently
  lost to 24px (found by pixel-diffing the buyer header against the prototype, which uses the v3 CDN without layers).
  `@layer icons, theme, base, components, utilities` (declared first) makes utilities win again.
--}}
@php
    $iconsUrl = $icons === 'portal'
        ? 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap'
        : 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
@endphp
<style>
@layer icons, theme, base, components, utilities;
@import url("{{ $iconsUrl }}") layer(icons);
</style>
@vite(['resources/css/app.css', 'resources/js/app.js'])
