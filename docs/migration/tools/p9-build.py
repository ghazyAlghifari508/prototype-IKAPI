#!/usr/bin/env python
"""P09 build: Administrator pages -> Blade views + JS modules (shell from layouts.admin, P04)."""
import io
import json
import os
import re

ROOT = os.getcwd()
SRC = 'docs/migration/p9-source'
VIEWS = 'resources/views'
JS = 'resources/js/ikapi/p9'
PROTO = 'docs/design/prototype-copy/admin'
NL = chr(10)

JS_ROUTES = [
    ('dashboard_administrasi_utama_desktop.html', '/admin'),
    ('kelola_pengguna_desktop.html', '/admin/pengguna'),
    ('pengawasan_katalog_buku_global_desktop.html', '/admin/katalog'),
    ('moderasi_ulasan_dan_komentar_desktop.html', '/admin/moderasi-ulasan'),
    ('monitoring_global_desktop.html', '/admin/monitoring'),
    ('kelola_pencairan_dana_desktop.html', '/admin/pencairan'),
    ('kelola_komunitas_desktop.html', '/admin/komunitas'),
    ('moderasi_diskusi_komunitas_desktop.html', '/admin/moderasi-diskusi'),
    ('login_administrator_desktop.html', '/admin/masuk'),
]


def read(p):
    return io.open(p, encoding='utf-8').read()


def write(p, s):
    os.makedirs(os.path.dirname(p) or '.', exist_ok=True)
    io.open(p, 'w', encoding='utf-8', newline=NL).write(s)


def frag(page, prefix):
    d = os.path.join(SRC, page)
    for f in sorted(os.listdir(d)):
        if f.startswith(prefix):
            return read(os.path.join(d, f))
    raise SystemExit('missing fragment %s/%s' % (page, prefix))


def indent(html, spaces=2):
    lines = html.split(NL)
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    widths = [len(ln) - len(ln.lstrip(' ')) for ln in lines if ln.strip()]
    cut = min(widths) if widths else 0
    pad = ' ' * spaces
    return NL.join((pad + ln[cut:]) if ln.strip() else '' for ln in lines)


APP_PATHS = dict((name, path) for name, path in JS_ROUTES)


def rewrite(html):
    # static links to other prototype files become app routes (the login page's preview link is one)
    for name, path in sorted(APP_PATHS.items(), key=lambda kv: len(kv[0]), reverse=True):
        html = html.replace('href="' + name + '"', 'href="{{ ' + repr(path) + ' }}"')
    # src/href AND data-* attributes (rows carry data-cover/data-photo that scripts assign to <img>).
    return re.sub(
        r'((?:src|href|data-[a-z-]+))="(?:\.\./)+assets/([^"]+)"',
        lambda m: '%s="{{ asset(\'assets/ikapi/%s\') }}"' % (m.group(1), m.group(2)),
        html,
    )


def workspace_inner(html):
    m = re.search(r'<main\b[^>]*id="workspace"[^>]*>', html)
    if not m:
        raise SystemExit('no #workspace')
    rest = html[m.end():]
    d = re.search(r'<div\b[^>]*class="[^"]*max-w-\[1560px\][^"]*"[^>]*>', rest)
    if not d:
        raise SystemExit('no max-w frame inside #workspace')
    depth, i = 1, d.end()
    for t in re.finditer(r'<div\b|</div>', rest):
        if t.start() < d.end():
            continue
        depth += 1 if t.group(0).startswith('<div') else -1
        if depth == 0:
            return rest[d.end():t.start()]
    raise SystemExit('unbalanced frame')


def page_style(page):
    html = read(os.path.join(PROTO, page + '.html'))
    blocks = re.findall(r'<style>(.*?)</style>', html, re.S)
    if not blocks:
        return ''
    css = (NL + NL).join(b.strip('\n') for b in blocks)
    return (
        "@push('head')" + NL + '<style>' + NL + '@layer utilities {' + NL + css.strip() + NL + '}' + NL
        + '</style>' + NL + '@endpush' + NL
    )


PAGES = {
    'dashboard_administrasi_utama_desktop': {
        'view': 'admin/dashboard', 'route': 'admin.dashboard', 'page': 'dashboard',
        'guard': '#activity-list', 'note': 'Dashboard administrasi: KPI, antrean moderasi, aktivitas terbaru, state demo.',
        'overlays': [],
    },
    'kelola_pengguna_desktop': {
        'view': 'admin/users', 'route': 'admin.users', 'page': 'users',
        'guard': '#user-search',
        'note': 'Kelola pengguna: tabel akun, filter peran/status, drawer detail, aksi setujui/tolak/nonaktifkan (simulasi).',
        'overlays': ['child-drawer-scrim', 'child-user-drawer', 'child-modal-approve', 'child-modal-reject', 'child-modal-deactivate', 'child-toast'],
    },
    'pengawasan_katalog_buku_global_desktop': {
        'view': 'admin/catalog', 'route': 'admin.catalog', 'page': 'catalog',
        'guard': '#cat-search',
        'note': 'Pengawasan katalog global: laporan buku, drawer detail, takedown dan penutupan laporan (simulasi).',
        'overlays': ['child-drawer-scrim', 'child-catalog-drawer', 'child-modal-takedown', 'child-modal-close-report', 'child-toast'],
    },
    'moderasi_ulasan_dan_komentar_desktop': {
        'view': 'admin/review-moderation', 'route': 'admin.review-moderation', 'page': 'review-moderation',
        'guard': '#mod-search',
        'note': 'Moderasi ulasan & komentar produk: antrean laporan, drawer detail, hapus konten (simulasi).',
        'overlays': ['child-drawer-scrim', 'child-mod-drawer', 'child-modal-delete', 'child-toast'],
    },
    'monitoring_global_desktop': {
        'view': 'admin/monitoring', 'route': 'admin.monitoring', 'page': 'monitoring',
        'guard': '#revenue-chart',
        'note': 'Monitoring global: filter periode/penerbit, kartu ringkasan, grafik dan tabel transaksi dari fixture.',
        'overlays': [],
    },
    'kelola_pencairan_dana_desktop': {
        'view': 'admin/payouts', 'route': 'admin.payouts', 'page': 'payouts',
        'guard': '#payout-search',
        'note': 'Kelola pencairan dana: antrean pencairan, drawer detail, finalisasi/tolak/preview (tanpa transfer nyata).',
        'overlays': ['child-drawer-scrim', 'child-payout-drawer', 'child-modal-finalize', 'child-modal-reject', 'child-modal-preview', 'child-toast'],
    },
    'kelola_komunitas_desktop': {
        'view': 'admin/communities', 'route': 'admin.communities', 'page': 'communities',
        'guard': '#community-rows',
        'note': 'Kelola komunitas: tabel komunitas (state buyer), drawer tambah/ubah, visibilitas (simulasi admin).',
        'overlays': ['child-drawer-scrim', 'child-community-drawer', 'child-toast'],
    },
    'moderasi_diskusi_komunitas_desktop': {
        'view': 'admin/discussion-moderation', 'route': 'admin.discussion-moderation', 'page': 'discussion-moderation',
        'guard': '#tab-pending',
        'note': 'Moderasi diskusi komunitas: laporan topik/balasan (state buyer), drawer konteks induk, aksi moderasi.',
        'overlays': ['child-drawer-scrim', 'child-review-drawer', 'child-toast'],
    },
}

for page, cfg in PAGES.items():
    main = frag(page, 'child-div-shell-main')
    body = indent(rewrite(workspace_inner(main)))
    overlays = NL.join(indent(rewrite(frag(page, o))) + NL for o in cfg['overlays']).rstrip()
    title = json.loads(read(os.path.join(SRC, page, 'head.json')))['title']
    out = (
        "{{--" + NL
        + "  " + cfg['note'] + NL
        + "  Source: " + PROTO + "/" + page + ".html (workspace markup verbatim; shell from layouts.admin)." + NL
        + "--}}" + NL + NL
        + "@extends('layouts.admin')" + NL + NL
        + "@section('title', '" + title + "')" + NL + NL
        + "@section('manual_shell', '1')" + NL + NL
        + page_style(page) + NL
        + "@section('content')" + NL + body + NL + "@endsection" + NL
    )
    if overlays:
        out += NL + "@push('overlays')" + NL + overlays + NL + "@endpush" + NL
    out += (
        NL + "@push('head')" + NL + "<script>" + NL
        + "  window.IKAPI_P9 = { page: '" + cfg['page'] + "' };" + NL
        + "</script>" + NL + "@endpush" + NL
    )
    write(os.path.join(VIEWS, cfg['view'] + '.blade.php'), out)
    print('view  ' + cfg['view'] + '.blade.php')

# ---------------------------------------------------------------------------------------------------------------
# Login page: standalone card (no portal shell), body class from the source.
# ---------------------------------------------------------------------------------------------------------------
login_html = read(os.path.join(PROTO, 'login_administrator_desktop.html'))
login_head = json.loads(read(os.path.join(SRC, 'login_administrator_desktop/head.json')))
login_css = (NL + NL).join(b.strip('\n') for b in re.findall(r'<style>(.*?)</style>', login_html, re.S))
login_body = frag('login_administrator_desktop', 'child-div-mx-auto')
write(
    os.path.join(VIEWS, 'admin/login.blade.php'),
    "{{--" + NL
    + "  Masuk Administrator (demo). Bukan autentikasi nyata: tidak ada Laravel Auth, hashing, atau sesi server." + NL
    + "  Source: " + PROTO + "/login_administrator_desktop.html (298 baris), markup verbatim." + NL
    + "--}}" + NL + NL
    + "@extends('layouts.plain')" + NL + NL
    + "@section('title', '" + login_head['title'] + "')" + NL + NL
    + "@section('body_class', '" + login_head['bodyClass'] + "')" + NL + NL
    + "@push('head')" + NL + "<style>" + NL + "@layer utilities {" + NL + login_css.strip() + NL + "}" + NL
    + "</style>" + NL + "@endpush" + NL + NL
    + "@section('content')" + NL + indent(rewrite(login_body)) + NL + "@endsection" + NL,
)
print('view  admin/login.blade.php')


def main_script(page):
    d = os.path.join(SRC, page)
    return max((read(os.path.join(d, f)) for f in sorted(os.listdir(d)) if f.startswith('script-')), key=len)


def rewrite_js(text):
    for name, path in sorted(JS_ROUTES, key=lambda kv: len(kv[0]), reverse=True):
        text = text.replace(name, path)
    text = text.replace("'../../assets/", "'/assets/ikapi/").replace('"../../assets/', '"/assets/ikapi/')
    text = text.replace("'../assets/", "'/assets/ikapi/").replace('"../assets/', '"/assets/ikapi/')
    return text


MODULES = dict(PAGES)
MODULES['login_administrator_desktop'] = {
    'page': 'login', 'guard': '#admin-login-form',
    'note': 'Masuk Administrator (demo)',
}
for page, cfg in MODULES.items():
    src = rewrite_js(main_script(page))
    html = read(os.path.join(PROTO, page + '.html'))
    handlers = sorted(set(re.findall(r'on[a-z]+="([A-Za-z_$][\w$]*)\(', html)))
    defined = set(re.findall(r'function\s+([A-Za-z_$][\w$]*)', src))
    expose = [h for h in handlers if h in defined]
    head = (
        '// ' + cfg['page'] + ' - Portal Administrator' + NL
        + '// Ported verbatim from ' + PROTO + '/' + page + '.html (inline <script>, '
        + str(main_script(page).count(NL) + 1) + ' lines).' + NL
        + '// Only this wrapper is new: module scope and the app route names.' + NL
        + "import { onReady } from '../shared.js';" + NL + NL
        + 'onReady(function () {' + NL
        + "    if (!document.querySelector('" + cfg['guard'] + "')) return;" + NL + NL
    )
    tail = ''
    if expose:
        tail += NL + '    // Prototype markup calls these from inline handlers; ES modules are scoped, so publish them.' + NL
        tail += '    Object.assign(window, { ' + ', '.join(expose) + ' });' + NL
    tail += '});' + NL
    body = NL.join(('    ' + ln if ln.strip() else '') for ln in src.rstrip().split(NL))
    write(os.path.join(JS, cfg['page'] + '.js'), head + body + tail)
    print('js    resources/js/ikapi/p9/' + cfg['page'] + '.js' + (('  (handlers: ' + ', '.join(expose) + ')') if expose else ''))