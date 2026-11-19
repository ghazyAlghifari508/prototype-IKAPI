{{--
  Publisher portal layout. Thin wrapper over layouts.portal: supplies the publisher persona only.
  Source of the values: penerbit/dashboard_penerbit_desktop.html (nav aria-label, account block, notification text).

  Usage
    @extends('layouts.publisher')
    @section('title', 'Dashboard Penerbit - IKAPI Jawa Barat')
    @section('content') ... @endsection
--}}
@extends('layouts.portal', [
    'persona' => 'publisher',
    'homeRoute' => 'publisher.dashboard',
    'navLabel' => 'Navigasi dashboard penerbit',
    'accountHref' => 'publisher.settings',
    'logoutHref' => 'publisher.login',
    'account' => ['title' => 'Akun Penerbit', 'subtitle' => 'IKAPI Jawa Barat', 'icon' => 'storefront'],
    'notifExtra' => 'Notifikasi pesanan dan pencairan akan muncul di sini.',
])
