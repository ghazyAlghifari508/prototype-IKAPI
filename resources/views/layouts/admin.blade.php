{{--
  Administrator portal layout. Thin wrapper over layouts.portal: supplies the admin persona only.
  Source of the values: admin/dashboard_administrasi_utama_desktop.html (nav aria-label, account block).

  Usage
    @extends('layouts.admin')
    @section('title', 'Dashboard Administrator - IKAPI Jawa Barat')
    @section('content') ... @endsection
--}}
@extends('layouts.portal', [
    'persona' => 'admin',
    'homeRoute' => 'admin.dashboard',
    'navLabel' => 'Navigasi dashboard administrator',
    'accountHref' => 'admin.login',
    'logoutHref' => 'admin.login',
    'account' => ['title' => 'Administrator', 'subtitle' => 'Portal Administrator', 'icon' => 'shield_person'],
])
