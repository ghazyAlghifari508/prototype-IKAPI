#!/usr/bin/env python
"""P06 assembly: extracted prototype fragments -> Blade views + JS modules.

Verbatim markup; only links, asset URLs and the shell come from the app. Run from the repo root:
    python docs/migration/tools/p6-build-a.py [page ...]
"""
import io
import json
import os
import re

ROOT = os.getcwd()
SRC = 'docs/migration/p6-source'
VIEWS = 'resources/views'
JS = 'resources/js/ikapi/p6'
PROTO = 'docs/design/prototype-copy/user'

# prototype file -> (route name, params literal or None)
LINKS = {
    'beranda_desktop.html': ("home", None),
    'katalog_buku_desktop.html': ("books.index", None),
    'agenda_berita_literasi_desktop.html': ("agenda", None),
    'masuk_login_desktop.html': ("login", None),
    'daftar_akun_register_desktop.html': ("register", None),
    'lupa_kata_sandi_desktop.html': ("password.request", None),
    'verifikasi_email_desktop.html': ("verification.notice", None),
    'onboarding_preferensi_bacaan_desktop.html': ("onboarding", None),
    'status_pendaftaran_penerbit_desktop.html': ("publisher.status", None),
    'akun_saya_profil_dropdown_navigasi_desktop.html': ("profile.show", None),
    'pengaturan_akun_desktop.html': ("profile.settings", None),
    'bantuan_akun_desktop.html': ("help", None),
    'chatbot_bantuan_rekomendasi_desktop.html': ("help.chatbot", None),
    'keranjang_pembayaran_terpadu_desktop.html': ("cart", None),
    'riwayat_pesanan_desktop.html': ("orders", None),
    'perpustakaan_saya_desktop.html': ("library", None),
    'riwayat_ulasan_desktop.html': ("reviews", None),
    'web_reader_desktop.html': ("reader", "['book' => 'laskar-aksara-pasundan']"),
    '../penerbit/dashboard_penerbit_desktop.html': ("publisher.dashboard", None),
    'detail_buku_desktop.html': ("books.show", "['book' => 'laskar-aksara-pasundan']"),
    'komunitas_literasi_desktop.html': ("community", None),
}

QUERY_ROUTES = {
    ('login', 'role=buyer'): "{{ $links('login', ['role' => 'buyer']) }}",
    ('login', 'role=publisher'): "{{ $links('login', ['role' => 'publisher']) }}",
    ('register', 'role=buyer'): "{{ $links('register', ['role' => 'buyer']) }}",
    ('register', 'role=publisher'): "{{ $links('register', ['role' => 'publisher']) }}",
    ('password.request', 'role=buyer'): "{{ $links('password.request', ['role' => 'buyer']) }}",
    ('publisher.status', 'sesi=aktif'): "{{ $links('publisher.status', ['sesi' => 'aktif']) }}",
    ('agenda.show', 'id=ev-1'): "{{ $links('agenda.show', ['event' => 'ev-1']) }}",
    ('agenda.show', 'id=ev-2'): "{{ $links('agenda.show', ['event' => 'ev-2']) }}",
    ('agenda.show', 'id=ev-3'): "{{ $links('agenda.show', ['event' => 'ev-3']) }}",
}

PRELUDE = """@php
    /** Links to screens of later phases resolve to '#' until their route exists: no dead route errors, no fake pages. */
    $links = fn (string $name, array $params = []) => \\Illuminate\\Support\\Facades\\Route::has($name) ? route($name, $params) : '#';
@endphp
"""


def read(p):
    return io.open(p, encoding='utf-8').read()


def frag(page, prefix):
    d = os.path.join(SRC, page)
    for f in sorted(os.listdir(d)):
        if f.startswith(prefix):
            return read(os.path.join(d, f))
    raise SystemExit('missing fragment %s/%s' % (page, prefix))


def inner_main(html):
    m = re.search(r'<main\b[^>]*>', html)
    if not m:
        raise SystemExit('no <main>')
    return html[m.end():html.rindex('</main>')], m.group(0)


def inner_div(html, needle):
    for m in re.finditer(r'<div\b[^>]*class="([^"]*)"[^>]*>', html):
        if needle in m.group(1):
            depth, i = 1, m.end()
            while depth:
                nxt = re.compile(r'<div\b|</div>').search(html, i)
                if not nxt:
                    raise SystemExit('unbalanced div')
                depth += 1 if nxt.group(0).startswith('<div') else -1
                i = nxt.end()
            return html[m.end():nxt.start()]
    raise SystemExit('no div matching %s' % needle)


# Tailwind v3 rendered `bg-white/95` as rgba(...); v4 compiles the same class through color-mix(in oklab, ...) and
# Chromium rasterises that 1..10/255 differently (measured in P04 P4-2 and again here on `text-red-500` and
# `ring-primary/20`). P04/P05 fixed this per class with literal hex-alpha; with 184 usages across 32 combos in P06
# a table is cheaper and keeps the prototype's markup readable.
ALPHA_COLOURS = {
    'primary': '673de6', 'primary-hover': '5025d1', 'primary-deep': '2f1c6a',
    'surface': 'ffffff', 'surface-soft': 'f5f6ff', 'surface-neutral': 'f5f5f6',
    'ink': '222225', 'ink-body': '222225', 'ink-muted': '62636b',
    'border': 'e5e7eb', 'border-subtle': 'e5e7eb', 'canvas': 'ffffff',
    'white': 'ffffff', 'black': '000000',
    'red-500': 'ef4444', 'red-600': 'dc2626', 'green-700': '15803d',
    'emerald-700': '047857', 'amber-700': 'b45309',
}
ALPHA_UTILITIES = re.compile(
    '(?<![A-Za-z0-9_-])(text|bg|border|ring|from|to|via|fill|stroke|divide|outline|decoration|placeholder)-('
    + '|'.join(sorted((re.escape(k) for k in ALPHA_COLOURS), key=len, reverse=True))
    + ')/(5|10|15|20|25|30|40|50|60|70|75|80|85|90|95)(?![A-Za-z0-9_-])'
)


def alpha_literal(prefix, colour, pct):
    return '%s-[#%s%02x]' % (prefix, ALPHA_COLOURS[colour], round(255 * int(pct) / 100))


def rewrite(html, cfg):
    """Only links and asset URLs change; every class, id and text node stays verbatim."""
    html = re.sub(
        r'(src|href)="(?:\.\./)+assets/([^"]+)"',
        lambda m: '%s="{{ asset(\'assets/ikapi/%s\') }}"' % (m.group(1), m.group(2)),
        html,
    )

    html = ALPHA_UTILITIES.sub(lambda m: alpha_literal(m.group(1), m.group(2), m.group(3)), html)

    def link(m):
        target = m.group(1)
        query = (m.group(2) or '')[1:]
        key = target if target.startswith('../') else target.split('/')[-1]
        entry = LINKS.get(key)
        if entry is None:
            return 'href="#"'
        name, params = entry
        if query and (name, query) in QUERY_ROUTES:
            return 'href="' + QUERY_ROUTES[(name, query)] + '"'
        if params:
            return 'href="{{ $links(\'%s\', %s) }}"' % (name, params)
        return 'href="{{ $links(\'%s\') }}"' % name

    return re.sub(r'href="((?:\.\./)?[\w./-]+\.html)(?:\?([^"]*))?"', link, html)


def indent(html, spaces=2):
    """Re-indent a verbatim block: drop the common leading indentation, then pad by a fixed amount."""
    lines = html.split('\n')
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    widths = [len(ln) - len(ln.lstrip(' ')) for ln in lines if ln.strip()]
    cut = min(widths) if widths else 0
    pad = ' ' * spaces
    return '\n'.join((pad + ln[cut:]) if ln.strip() else '' for ln in lines)


def page_style(page):
    """The prototype's own <style> block, verbatim (focus ring, icon axes, animations, theme vars)."""
    html = read(os.path.join(PROTO, page + '.html'))
    blocks = re.findall(r'<style>(.*?)</style>', html, re.S)
    if not blocks:
        return ''
    css = '\n'.join(b.strip('\n') for b in blocks)
    # Wrapped in @layer utilities on purpose. In the prototype both the page <style> block and the utilities the
    # Tailwind v3 CDN injected were unlayered, so SPECIFICITY decided: `body { padding: 0 }` lost to `.p-4`, while
    # `.switch-checkbox:checked + .switch-track` beat `.bg-border-subtle`. Unlayered page CSS here would outrank every
    # utility (v4 keeps utilities in a layer), which broke both cases (measured: auth card moved 16px; the settings
    # switches stayed grey). Same layer = specificity decides again, exactly like v3.
    return "@push('head')\n<style>\n@layer utilities {\n%s\n}\n</style>\n@endpush\n" % css.strip()


# Prototype scripts navigate by file name ('perpustakaan_saya_desktop.html'), sometimes with a query
# ('masuk_login_desktop.html?role=publisher'). In the app those are named routes, so the literals are mapped
# once here. Longest keys first so 'chatbot_bantuan_rekomendasi_desktop.html' wins over shorter suffixes.
JS_ROUTE_MAP = [
    ('../penerbit/dashboard_penerbit_desktop.html', '/status-pendaftaran-penerbit?sesi=aktif'),
    ('chatbot_bantuan_rekomendasi_desktop.html', '/akun/bantuan/chatbot'),
    ('akun_saya_profil_dropdown_navigasi_desktop.html', '/akun/profil'),
    ('pengaturan_akun_desktop.html', '/akun/pengaturan'),
    ('onboarding_preferensi_bacaan_desktop.html', '/onboarding'),
    ('status_pendaftaran_penerbit_desktop.html', '/status-pendaftaran-penerbit'),
    ('riwayat_pesanan_desktop.html', '/akun/pesanan'),
    ('riwayat_ulasan_desktop.html', '/akun/ulasan'),
    ('perpustakaan_saya_desktop.html', '/akun/perpustakaan'),
    ('web_reader_desktop.html', '/akun/perpustakaan/laskar-aksara-pasundan/baca'),
    ('agenda_berita_literasi_desktop.html', '/agenda'),
    ('detail_agenda_desktop.html', '/agenda/ev-1'),
    ('keranjang_pembayaran_terpadu_desktop.html', '/keranjang'),
    ('lupa_kata_sandi_desktop.html', '/lupa-kata-sandi'),
    ('verifikasi_email_desktop.html', '/verifikasi-email'),
    ('daftar_akun_register_desktop.html', '/daftar'),
    ('masuk_login_desktop.html', '/masuk'),
    ('bantuan_akun_desktop.html', '/akun/bantuan'),
    ('katalog_buku_desktop.html', '/katalog'),
    ('beranda_desktop.html', '/'),
]


def rewrite_js_links(text):
    for file_name, app_path in JS_ROUTE_MAP:
        text = text.replace(file_name, app_path)
    return text


def replace_literal(js, name, window_key):
    """Swap the prototype's inline seed literal for the JSON fixture the controller hands the view.

    The prototype keeps demo data inline; the app keeps it in resources/data/ikapi/*.json so there is ONE source.
    Data shape is unchanged (the fixtures were extracted from these very literals), so rendering code stays verbatim.
    """
    m = re.search(r'(?<![A-Za-z_$])(?:const|let|var)\s+%s\s*=\s*([\[{])' % re.escape(name), js)
    if not m:
        raise SystemExit('literal %s not found' % name)
    start = m.start(1)
    depth = 0
    for i in range(start, len(js)):
        ch = js[i]
        if ch in '[{':
            depth += 1
        elif ch in ']}':
            depth -= 1
            if depth == 0:
                return js[:m.start()] + 'const %s = window.IKAPI_P6_DATA.%s;' % (name, window_key) + js[i + 1:]
    raise SystemExit('unbalanced literal %s' % name)


def view(page, cfg):
    head = json.load(io.open(os.path.join(SRC, page, 'head.json'), encoding='utf-8'))
    title = cfg.get('title') or head['title']
    lines = len(read(os.path.join(PROTO, page + '.html')).split('\n'))
    parts = ['{{--\n  %s\n  Source: %s/%s.html (%d lines). Markup, classes, ids and copy are verbatim; only links,\n  asset URLs and the shell come from the app. See docs/migration/p6-buyer-flows.md.\n--}}\n'
             % (cfg['note'], PROTO, page, lines)]

    if cfg['layout'] == 'auth':
        parts.append("@extends('layouts.auth')\n")
        if cfg.get('style', True):
            parts.append(page_style(page))
        parts.append("@section('title', '%s')\n" % title)
        if cfg.get('alt'):
            parts.append("@section('alt', '%s')\n" % cfg['alt'])
        if cfg.get('width'):
            parts.append("@section('width', '%s')\n" % cfg['width'])
        if cfg.get('stack'):
            parts.append("@section('stack', '%s')\n" % cfg['stack'])
        if cfg.get('image_wrap'):
            parts.append("@section('image_wrap', '1')\n")
        body = cfg['content']()
        parts.append('@section(\'content\')\n' + indent(rewrite(body, cfg)) + '\n@endsection\n')
    elif cfg['layout'] == 'plain':
        parts.append("@extends('layouts.plain')\n")
        if cfg.get('style', True):
            parts.append(page_style(page))
        parts.append("@section('title', '%s')\n" % title)
        if cfg.get('body_class'):
            parts.append("@section('body_class', '%s')\n" % cfg['body_class'])
        if cfg.get('serif'):
            parts.append("@section('serif', '1')\n")
        body = cfg['content']()
        parts.append('@section(\'content\')\n' + indent(rewrite(body, cfg)) + '\n@endsection\n')
        if cfg.get('overlays'):
            ov = '\n\n'.join(indent(rewrite(frag(page, f), cfg)) for f in cfg['overlays'])
            parts.append("@push('overlays')\n" + ov + '\n@endpush\n')
    else:
        parts.append("@extends('layouts.public')\n")
        if cfg.get('style', True):
            parts.append(page_style(page))
        parts.append("@section('title', '%s')\n" % title)
        if cfg.get('body_class'):
            parts.append("@section('body_class', '%s')\n" % cfg['body_class'])
        if cfg.get('serif'):
            parts.append("@section('serif', '1')\n")
        h = cfg['header']
        parts.append("@section('header_z', '%s')\n" % h.get('z', 'z-40'))
        parts.append("@section('account', '%s')\n" % h.get('account', 'guest'))
        if h.get('container'):
            parts.append("@section('header_container', '%s')\n" % h['container'])
        if h.get('current'):
            parts.append("@section('current_route', '%s')\n" % h['current'])
        if h.get('cart') == '':
            parts.append("@section('cart_badge_empty', '1')\n")
        elif h.get('cart') is not None:
            parts.append("@section('cart_count', '%s')\n" % h['cart'])
        if h.get('search'):
            parts.append("@section('search_placeholder', '%s')\n" % h['search'])
        if h.get('navActiveSm') is False:
            parts.append("@section('nav_active_sm', '0')\n")
        if h.get('pill') is False:
            parts.append("@section('account_pill', '0')\n")
        if h.get('identityIds'):
            parts.append("@section('identity_ids', '1')\n")
        if cfg.get('footer_variant'):
            parts.append("@section('footer_variant', '%s')\n" % cfg['footer_variant'])
        if cfg.get('main_pt'):
            parts.append("@section('main_pt', '%s')\n" % cfg['main_pt'])
        if cfg.get('main_class'):
            parts.append("@section('main_class', '%s')\n" % cfg['main_class'])
        body = cfg['content']()
        parts.append('@section(\'content\')\n' + indent(rewrite(body, cfg)) + '\n@endsection\n')
        if cfg.get('overlays'):
            ov = '\n\n'.join(indent(rewrite(frag(page, f), cfg)) for f in cfg['overlays'])
            parts.append("@push('overlays')\n" + ov + '\n@endpush\n')

    if cfg.get('data_push') or cfg.get('scripts_extra'):
        lines = ["@push('head')", '<script>']
        if cfg.get('data_push'):
            lines.append('window.IKAPI_P6_DATA = @json(%s);' % cfg['data_push'])
        if cfg.get('scripts_extra'):
            lines.append(cfg['scripts_extra'].strip())
        lines += ['</script>', '@endpush']
        parts.append('\n'.join(lines) + '\n')

    parts.insert(1, PRELUDE)
    out = os.path.join(VIEWS, cfg['view'] + '.blade.php')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    io.open(out, 'w', encoding='utf-8', newline='\n').write('\n'.join(parts))
    print('view  ', cfg['view'] + '.blade.php')


def js_module(page, cfg):
    """Copy the page's main inline script into an ES module, guarded by a root selector.

    The prototype defined these functions globally, so its inline handlers could call them. Modules are
    scoped, so the handlers the markup actually uses are published on window explicitly.
    """
    d = os.path.join(SRC, page)
    main = max((read(os.path.join(d, f)) for f in sorted(os.listdir(d)) if f.startswith('script-')), key=len)
    src = read(os.path.join(PROTO, page + '.html'))
    handlers = sorted(set(re.findall(r'on[a-z]+="([a-zA-Z_0-9]+)\(', src)))
    defined = set(re.findall(r'function\s+([a-zA-Z_0-9]+)', main))
    # Two scopes to bridge, because the prototype had one global scope:
    #   top level of the module (plain scripts)  -> Object.assign at the end of the wrapper
    #   inside a nested IIFE (login/register)    -> inject the assignment right after 'use strict'
    nested = set()
    iife = re.search(r'\(function\s*\(\)\s*\{', main)
    body_text = main
    if iife:
        inner = main[iife.end():]
        nested = {h for h in handlers if re.search(r'function\s+%s\s*\(' % re.escape(h), inner)}
    expose = [h for h in handlers if h in defined and h not in nested]
    missing = [h for h in handlers if h not in defined]
    if nested:
        inject = "'use strict';\n      // prototype inline handlers call these from the global scope\n" + ''.join(
            '      window.%s = %s;\n' % (h, h) for h in sorted(nested))
        body_text = body_text.replace("'use strict';", inject, 1)
    for var, key in (cfg.get('data') or {}).items():
        body_text = replace_literal(body_text, var, key)

    for old_snippet, new_snippet in (cfg.get('js_patch') or []):
        if old_snippet not in body_text:
            raise SystemExit('js_patch miss: %r' % old_snippet[:60])
        body_text = body_text.replace(old_snippet, new_snippet)

    # The prototype's scripts build asset URLs relative to the HTML file ('../../assets/...'). In the app the
    # same files are served from /assets/ikapi, so the prefix is rewritten once here instead of in every page.
    body_text = rewrite_js_links(body_text)
    body_text = body_text.replace("'../../assets/", "'/assets/ikapi/").replace('"../../assets/', '"/assets/ikapi/')
    body_text = body_text.replace("'../assets/", "'/assets/ikapi/").replace('"../assets/', '"/assets/ikapi/')
    body = '\n'.join(('    ' + ln if ln.strip() else '') for ln in body_text.rstrip().split('\n'))
    head = ("// %s\n// Ported verbatim from %s/%s.html (inline <script>, %d lines).\n"
            "// Only this wrapper is new: the module runs once the DOM is ready and only on its own page.\n"
            "import { onReady } from '../../shared.js';\n\n"
            "onReady(function () {\n"
            "    if (!document.querySelector('%s')) return;\n\n"
            % (cfg.get('js_note', page), PROTO, page, main.count('\n') + 1, cfg['root']))
    tail = '\n\n    // Prototype markup calls these from inline handlers; ES modules are scoped, so publish them.\n'
    tail += ('    Object.assign(window, { %s });\n' % ', '.join(expose)) if expose else ''
    tail += '});\n'
    out = os.path.join(JS, cfg['js'])
    os.makedirs(os.path.dirname(out), exist_ok=True)
    io.open(out, 'w', encoding='utf-8', newline='\n').write(head + body + tail)
    print('js    ', 'resources/js/ikapi/p6/' + cfg['js'] + (('  (handlers not exposed: %s)' % ', '.join(missing)) if missing else ''))