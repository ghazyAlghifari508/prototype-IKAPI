#!/usr/bin/env python
# P06 group A: auth demo pages (login, register, forgot, verify, onboarding, publisher status).
import io, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from importlib import import_module

lib = import_module('p6-build-lib'.replace('-', '_')) if False else None
exec(io.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'p6-build-lib.py'), encoding='utf-8').read())

PAGES = {
    'masuk_login_desktop': {
        'note': 'Buyer/publisher login (demo).',
        'view': 'auth-demo/login', 'layout': 'auth', 'route': 'login',
        'alt': 'Ilustrasi membaca IKAPI Store', 'width': 'md',
        'content': lambda: inner_div(frag('masuk_login_desktop', 'child-main'), 'max-w-md mx-auto space-y-5'),
        'root': '#auth-form', 'js': 'auth/login.js',
    },
    'daftar_akun_register_desktop': {
        'note': 'Buyer/publisher registration (demo, 2 roles).',
        'view': 'auth-demo/register', 'layout': 'auth', 'route': 'register',
        'alt': 'Ilustrasi membaca e-book IKAPI Store', 'width': 'lg',
        'content': lambda: inner_div(frag('daftar_akun_register_desktop', 'child-main'), 'max-w-lg mx-auto space-y-5'),
        'root': '#buyer-form', 'js': 'auth/register.js',
    },
    'lupa_kata_sandi_desktop': {
        'note': 'Forgot password (demo, no email is sent).',
        'view': 'auth-demo/forgot-password', 'layout': 'auth', 'route': 'password.request',
        'alt': 'Ilustrasi Pemulihan Akun IKAPI Store', 'width': 'md', 'stack': 'space-y-6',
        'content': lambda: inner_div(frag('lupa_kata_sandi_desktop', 'child-main'), 'max-w-md w-full mx-auto space-y-6'),
        'overlays': ['child-toast'], 'image_wrap': True, 'root': '#reset-password-form', 'js': 'auth/forgot-password.js',
    },
    'verifikasi_email_desktop': {
        'note': 'Verify email notice (demo, no email is sent).',
        'view': 'auth-demo/verify-email', 'layout': 'auth', 'route': 'verification.notice',
        'alt': 'Ilustrasi Verifikasi Email IKAPI Store', 'width': 'md', 'stack': 'space-y-6',
        'content': lambda: inner_div(frag('verifikasi_email_desktop', 'child-main'), 'max-w-md w-full mx-auto space-y-6'),
        'overlays': ['child-toast'], 'image_wrap': True, 'root': '#resendBtn', 'js': 'auth/verify-email.js',
    },
    'onboarding_preferensi_bacaan_desktop': {
        'note': 'Reading-preferences onboarding wizard (4 steps, localStorage).',
        'view': 'auth-demo/onboarding', 'layout': 'plain', 'route': 'onboarding',
        'body_class': 'min-h-screen antialiased',
        'content': lambda: frag('onboarding_preferensi_bacaan_desktop', 'child-main'),
        'root': '#progress-block', 'js': 'auth/onboarding.js',
    },
    'status_pendaftaran_penerbit_desktop': {
        'note': 'Publisher application status (demo states via ?sesi=).',
        'view': 'auth-demo/publisher-status', 'layout': 'plain', 'route': 'publisher.status',
        'body_class': 'min-h-screen bg-surface-neutral text-ink-body antialiased',
        'content': lambda: frag('status_pendaftaran_penerbit_desktop', 'child-header') + '\n' + frag('status_pendaftaran_penerbit_desktop', 'child-main'),
        'overlays': ['child-toast'], 'root': '#status-line', 'js': 'auth/publisher-status.js',
    },
}

only = sys.argv[1:] or list(PAGES)
for page in only:
    cfg = PAGES[page]
    cfg.setdefault('content_frag', lambda f, p=page: frag(p, f))
    view(page, cfg)
    js_module(page, cfg)