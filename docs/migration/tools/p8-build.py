#!/usr/bin/env python
"""P08 build: Portal Penerbit pages -> Blade views + JS modules.

Shell (topbar, sidebar, angled banner, workspace frame, drawer) comes from layouts.publisher (P04); each page only
contributes its workspace content, its modals/toasts and its own script (ported verbatim).
"""
import io
import json
import os
import re

ROOT = os.getcwd()
SRC = 'docs/migration/p8-source'
VIEWS = 'resources/views'
JS = 'resources/js/ikapi/p8'
PROTO = 'docs/design/prototype-copy/penerbit'
NL = chr(10)

# prototype file -> app path used by the ported scripts (window.location / href strings)
JS_ROUTES = [
    ('invoice_penjualan_pdf_portal_penerbit.html', '/penerbit/invoice'),
    ('dashboard_penerbit_desktop.html', '/penerbit'),
    ('kelola_buku_desktop.html', '/penerbit/buku'),
    ('pesanan_masuk_desktop.html', '/penerbit/pesanan'),
    ('pendapatan_dan_pencairan_desktop.html', '/penerbit/keuangan'),
    ('ulasan_pembeli_desktop.html', '/penerbit/ulasan'),
    ('pengaturan_profil_desktop.html', '/penerbit/pengaturan'),
    ('masuk_portal_penerbit_desktop.html', '/penerbit/masuk'),
    ('pendaftaran_penerbit_desktop.html', '/penerbit/daftar'),
    ('../user/status_pendaftaran_penerbit_desktop.html', '/status-pendaftaran-penerbit'),
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


# Static links between publisher pages point at prototype file names; the app has named routes for the same screens.
LINK_ROUTES = {
    'dashboard_penerbit_desktop.html': 'publisher.dashboard',
    'kelola_buku_desktop.html': 'publisher.books',
    'pesanan_masuk_desktop.html': 'publisher.orders',
    'pendapatan_dan_pencairan_desktop.html': 'publisher.payouts',
    'ulasan_pembeli_desktop.html': 'publisher.reviews',
    'pengaturan_profil_desktop.html': 'publisher.settings',
    'invoice_penjualan_pdf_portal_penerbit.html': 'publisher.invoice',
}


def rewrite(html):
    # Static cross-page links first: prototype file names -> named routes (P10 route audit).
    for name, route_name in LINK_ROUTES.items():
        html = html.replace('href="' + name + '"', 'href="{{ route(\'' + route_name + '\') }}"')
    # Then src/href AND data-* assets: the books table carries `data-cover="../../assets/covers/..."` and the page
    # script assigns it to an <img>, so a rewrite that only looked at src/href left a relative URL -> 404.
    return re.sub(
        r'((?:src|href|data-[a-z-]+))="(?:\.\./)+assets/([^"]+)"',
        lambda m: '%s="{{ asset(\'assets/ikapi/%s\') }}"' % (m.group(1), m.group(2)),
        html,
    )


def workspace_inner(html):
    """Inner HTML of the workspace's max-w frame - exactly what the layout's @yield('content') holds."""
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
    """The page's own <style> block (chart canvas sizing, banner geometry helpers, print rules)."""
    html = read(os.path.join(PROTO, page + '.html'))
    blocks = re.findall(r'<style>(.*?)</style>', html, re.S)
    if not blocks:
        return ''
    css = (NL + NL).join(b.strip('\n') for b in blocks)
    # Same reasoning as P06/P07: the source CSS was unlayered next to unlayered v3 utilities, so specificity
    # decided. Keeping it in the utilities layer reproduces that ordering without outranking every utility.
    return (
        "@push('head')" + NL + '<style>' + NL + '@layer utilities {' + NL + css.strip() + NL + '}' + NL
        + '</style>' + NL + '@endpush' + NL
    )


PAGES = {
    'dashboard_penerbit_desktop': {
        'view': 'publisher/dashboard', 'route': 'publisher.dashboard', 'page': 'dashboard', 'guard': '#chart-panel',
        'note': 'Dashboard penerbit: KPI, grafik 30 hari, transaksi terbaru, state demo (normal/kosong/gagal analitik).',
        'overlays': [],
    },
    'kelola_buku_desktop': {
        'view': 'publisher/books', 'route': 'publisher.books', 'page': 'books', 'guard': '#book-form',
        'note': 'Kelola buku: tabel katalog, filter/sort/cari, drawer detail, form tambah/edit, konfirmasi unpublish.',
        'overlays': ['child-row-menu', 'child-modal-detail', 'child-modal-book', 'child-modal-unpublish'],
    },
    'pesanan_masuk_desktop': {
        'view': 'publisher/orders', 'route': 'publisher.orders', 'page': 'orders', 'guard': '#detail-invoice',
        'note': 'Pesanan masuk: filter status, tabel pesanan, drawer detail pesanan (tanpa fulfillment nyata).',
        'overlays': ['child-modal-detail'],
    },
    'pendapatan_dan_pencairan_desktop': {
        'view': 'publisher/finance', 'route': 'publisher.payouts', 'page': 'finance', 'guard': '#btn-review',
        'note': 'Pendapatan & pencairan: ringkasan saldo, riwayat pencairan, rekening, permintaan pencairan simulasi.',
        'overlays': ['child-modal-confirm', 'child-modal-success', 'child-modal-detail'],
    },
    'ulasan_pembeli_desktop': {
        'view': 'publisher/reviews', 'route': 'publisher.reviews', 'page': 'reviews', 'guard': '#review-list',
        'note': 'Ulasan pembeli: daftar ulasan, filter rating, balasan penerbit simulasi.',
        'overlays': ['child-toast'],
    },
    'pengaturan_profil_desktop': {
        'view': 'publisher/settings', 'route': 'publisher.settings', 'page': 'settings', 'guard': '#b-bank',
        'note': 'Pengaturan profil penerbit: identitas, rekening, modal konfirmasi dan peringatan perubahan belum disimpan.',
        'overlays': ['child-modal-bank-confirm', 'child-modal-unsaved', 'child-toast'],
    },
}

for page, cfg in PAGES.items():
    main = frag(page, 'child-div-shell-main')
    body = indent(rewrite(workspace_inner(main)))
    overlays = NL.join(indent(rewrite(frag(page, o))) + NL for o in cfg['overlays']).rstrip()
    out = (
        "{{--" + NL
        + "  " + cfg['note'] + NL
        + "  Source: " + PROTO + "/" + page + ".html (workspace markup verbatim; shell from layouts.publisher)." + NL
        + "  Routing/handlers: resources/js/ikapi/p8/" + cfg['page'] + ".js" + NL
        + "--}}" + NL + NL
        + "@extends('layouts.publisher')" + NL + NL
        + "@section('title', '" + json.loads(read(os.path.join(SRC, page, 'head.json')))['title'] + "')" + NL + NL
        + "@section('manual_shell', '1')" + NL + NL
        + page_style(page) + NL
        + "@section('content')" + NL + body + NL + "@endsection" + NL
    )
    if overlays:
        out += NL + "@push('overlays')" + NL + overlays + NL + "@endpush" + NL
    out += (
        NL + "@push('head')" + NL + "<script>" + NL
        + "  window.IKAPI_P8 = { page: '" + cfg['page'] + "' };" + NL
        + "</script>" + NL + "@endpush" + NL
    )
    write(os.path.join(VIEWS, cfg['view'] + '.blade.php'), out)
    print('view  ' + cfg['view'] + '.blade.php')

# ---------------------------------------------------------------------------------------------------------------
# JS modules: the page's own inline script, verbatim, plus a small wrapper (module scope + data injection).
# ---------------------------------------------------------------------------------------------------------------
DATA_KEYS = {
    'dashboard_penerbit_desktop': ['DEMO', 'EMPTY', 'FILLED'],
    'pesanan_masuk_desktop': ['BASE_ORDERS'],
    'pendapatan_dan_pencairan_desktop': ['BASE'],
    'ulasan_pembeli_desktop': ['BASE_REVIEWS'],
    'pengaturan_profil_desktop': ['SAVED_PROFILE', 'SAVED_BANK'],
}


def main_script(page):
    d = os.path.join(SRC, page)
    return max((read(os.path.join(d, f)) for f in sorted(os.listdir(d)) if f.startswith('script-')), key=len)


def rewrite_js(text):
    for name, path in sorted(JS_ROUTES, key=lambda kv: len(kv[0]), reverse=True):
        text = text.replace(name, path)
    text = text.replace("'../../assets/", "'/assets/ikapi/").replace('"../../assets/', '"/assets/ikapi/')
    text = text.replace("'../assets/", "'/assets/ikapi/").replace('"../assets/', '"/assets/ikapi/')
    return text


for page, cfg in PAGES.items():
    src = rewrite_js(main_script(page))
    html = read(os.path.join(PROTO, page + '.html'))
    handlers = sorted(set(re.findall(r'on[a-z]+="([A-Za-z_$][\w$]*)\(', html)))
    defined = set(re.findall(r'function\s+([A-Za-z_$][\w$]*)', src))
    expose = [h for h in handlers if h in defined]

    head = (
        '// ' + cfg['page'] + ' - Portal Penerbit' + NL
        + '// Ported verbatim from ' + PROTO + '/' + page + '.html (inline <script>, '
        + str(main_script(page).count(NL) + 1) + ' lines).' + NL
        + '// Only this wrapper is new: module scope, the demo fixture injection and the app route names.' + NL
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
    print('js    resources/js/ikapi/p8/' + cfg['page'] + '.js' + (('  (handlers: ' + ', '.join(expose) + ')') if expose else ''))