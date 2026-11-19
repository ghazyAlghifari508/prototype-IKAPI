@extends('layouts.public')

{{--
  Beranda. Source: user/beranda_desktop.html (1.002 lines).
  Structure: hero carousel -> 5 category tiles -> 3 book shelves -> Agenda Literasi strip -> footer.
  Header/footer come from layouts.public (P04); sections live in partials/buyer/*.
--}}
@section('title', 'IKAPI Store Jawa Barat — Toko E-Book Resmi Penerbit Daerah')
@section('cart_count', '2')

@section('content')
  @include('partials.buyer.hero', ['slides' => $home['slides']])
  @include('partials.buyer.categories', ['categories' => $home['categories']])
  @foreach ($home['shelves'] as $shelf)
    @include('partials.buyer.shelf', ['shelf' => $shelf])
  @endforeach
  @include('partials.buyer.agenda', ['items' => $home['agenda']])
@endsection

@section('chatbot', '1')

@push('overlays')
  @include('partials.buyer.toast', ['position' => 'bottom-24', 'offset' => 'translate-y-16', 'icon' => true, 'message' => 'Item berhasil ditambahkan ke keranjang'])
@endpush