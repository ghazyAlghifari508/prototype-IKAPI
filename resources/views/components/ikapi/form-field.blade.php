{{--
  Form field (label + input + optional icon + error line).

  Consumers: user/masuk_login, user/daftar_akun_register (13 labels), user/lupa_kata_sandi, user/pengaturan_akun
  (buyer, tone="neutral"), admin/login_administrator, penerbit/pengaturan_profil (portal, tone="portal").
  The P04 audit found 9 distinct input class strings; only the two real tones below are shared, every other
  deviation (icon padding, trailing button) is a prop, not a copy.

  Tones (classes copied from the prototype)
    neutral  buyer/auth : h-11 rounded-xl border border-border-subtle bg-surface-neutral ... focus:bg-white
    portal   portal/admin: h-11 rounded-xl border border-border bg-white ... focus:border-primary

  Props
    name       input name (and base of the generated ids)            REQUIRED
    label      label text                                            REQUIRED
    type       text|email|password|tel|number...    default text
    tone       'neutral' | 'portal'                 default neutral
    icon       Material Symbols name rendered at the left (adds pl-10)
    required   bool   adds the red asterisk like the prototype (`<span class="text-red-500">*</span>`)
    value, placeholder, autocomplete   passed through
    error      optional error text (rendered hidden-by-default element, like the prototype's validation lines)
  ids are generated from `id` or `name`, so the component can repeat without clashing:  <id>, <id>-error.
--}}
@props([
    'name',
    'label',
    'type' => 'text',
    'tone' => 'neutral',
    'icon' => null,
    'required' => false,
    'value' => null,
    'placeholder' => null,
    'autocomplete' => null,
    'error' => null,
    'id' => null,
])

@php
    $fieldId = $id ?? $name;
    $labelClass = $tone === 'portal'
        ? 'mb-1.5 block text-[13px] font-bold text-ink'
        : 'block text-[13px] font-bold text-ink-body';
    $inputBase = $tone === 'portal'
        ? 'h-11 w-full rounded-xl border border-border bg-white text-[14px] text-ink outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-[#673de633]'
        : 'h-11 w-full rounded-xl border border-border-subtle bg-surface-neutral text-[14px] text-ink-body outline-none transition-all placeholder:text-ink-muted focus:border-primary focus:bg-white focus:ring-2 focus:ring-[#673de633]';
    $padding = $icon ? 'pl-10 pr-4' : 'px-4';
    $iconClass = $tone === 'portal' ? 'text-muted' : 'text-ink-muted';
    $errorClass = $tone === 'portal' ? 'mt-1 hidden text-[12px] text-[#B42318]' : 'mt-1 hidden text-[12px] text-red-600';
@endphp

<div class="space-y-1.5">
  <label for="{{ $fieldId }}" class="{{ $labelClass }}">
    {{ $label }}@if ($required) <span class="text-red-500">*</span>@endif
  </label>
  <div class="relative flex items-center">
    @if ($icon)
      <span class="pointer-events-none absolute left-0 pl-3.5 {{ $iconClass }}">
        <span class="material-symbols-outlined text-[19px]">{{ $icon }}</span>
      </span>
    @endif
    <input id="{{ $fieldId }}" name="{{ $name }}" type="{{ $type }}"
      @if ($value !== null) value="{{ $value }}" @endif
      @if ($placeholder) placeholder="{{ $placeholder }}" @endif
      @if ($autocomplete) autocomplete="{{ $autocomplete }}" @endif
      @if ($required) required @endif
      aria-describedby="{{ $fieldId }}-error"
      {{ $attributes->merge(['class' => $inputBase.' '.$padding]) }}>
    {{ $slot }}
  </div>
  <p id="{{ $fieldId }}-error" class="{{ $errorClass }}">{{ $error }}</p>
</div>
