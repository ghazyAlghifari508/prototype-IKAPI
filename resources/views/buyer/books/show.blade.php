@extends('layouts.public')

{{--
  Detail Buku. Source: user/detail_buku_desktop.html (1.899 lines).
  Sections: cover + purchase panel -> Sinopsis / Detail Buku -> Ulasan Pembaca (rating + reviews) -> Buku Terkait,
  plus the comment action menu and the two report dialogs (komentar + buku).
  Only the reference book (BK-01) carries synopsis/detail/review content in the prototype; other books resolve to
  the same page shell with their own catalog metadata and an explicit "content not available" state instead of
  invented copy (see docs/migration/p5-buyer-core.md).
--}}
@section('title', $book['title'].' — Detail Buku IKAPI Store Jawa Barat')
@section('cart_count', '2')

@section('content')
  @include('partials.buyer.books.hero', ['book' => $book])
  @include('partials.buyer.books.about', ['book' => $book])
  @include('partials.buyer.books.rating', ['book' => $book])
  @include('partials.buyer.books.related', ['book' => $book])
@endsection

@push('overlays')
  @include('partials.buyer.books.report-modals', ['book' => $book])
  @include('partials.buyer.toast', ['position' => 'bottom-6', 'offset' => 'translate-y-20', 'icon' => false, 'message' => 'Tindakan berhasil diproses'])
@endpush