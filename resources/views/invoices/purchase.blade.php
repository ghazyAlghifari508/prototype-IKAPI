@php
    /** @var \App\Domain\Orders\Invoices\InvoiceDocument $invoice */
@endphp
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $invoice->orderNumber }}</title>
    <style>
        @page { margin: 32px; }
        body { font-family: "DejaVu Sans", sans-serif; font-size: 10px; line-height: 1.5; color: #111; }
        h1 { font-size: 18px; margin: 0 0 4px; }
        h2 { font-size: 12px; margin: 22px 0 8px; }
        p { margin: 3px 0; overflow-wrap: anywhere; }
        .brand { color: #0075de; }
        .metadata { width: 100%; margin: 20px 0; }
        .metadata td { padding: 2px 0; vertical-align: top; }
        .metadata td:first-child { width: 140px; }
        .items { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .items thead { display: table-header-group; }
        .items th, .items td { padding: 8px 5px; border-bottom: 1px solid #ddd; vertical-align: top; }
        .items th { text-align: left; border-top: 1px solid #111; }
        .items tr { page-break-inside: avoid; }
        .items .title { width: 43%; overflow-wrap: anywhere; word-wrap: break-word; }
        .items .quantity { width: 9%; text-align: center; }
        .items .money { width: 24%; text-align: right; white-space: nowrap; }
        .publisher { color: #615d59; font-size: 9px; }
        .totals { width: 55%; margin: 20px 0 0 auto; border-collapse: collapse; page-break-inside: avoid; }
        .totals td { padding: 4px; }
        .totals td:last-child { text-align: right; white-space: nowrap; }
        .total td { border-top: 1px solid #111; font-weight: bold; }
    </style>
</head>
<body>
    <h1 class="brand">IKAPI Jawa Barat</h1>
    <p>Bukti Pembelian E-Book</p>
    <table class="metadata">
        <tr><td>Nomor Pesanan</td><td>{{ $invoice->orderNumber }}</td></tr>
        <tr><td>Nomor Transaksi</td><td>{{ $invoice->transactionReference }}</td></tr>
        <tr><td>Tanggal Pembayaran</td><td>{{ $invoice->formattedPaidAt() }}</td></tr>
    </table>
    <h2>Informasi Pembeli</h2>
    <p>{{ $invoice->buyerName }}</p>
    <p>{{ $invoice->buyerEmail }}</p>
    <h2>Rincian Pembelian</h2>
    <table class="items">
        <thead><tr><th class="title">Judul Buku</th><th class="quantity">Jumlah</th><th class="money">Harga Satuan</th><th class="money">Total</th></tr></thead>
        <tbody>
        @foreach ($invoice->lines as $line)
            <tr>
                <td class="title">{{ $line->title }}<br><span class="publisher">{{ $line->publisherName }}</span></td>
                <td class="quantity">{{ $line->quantity }}</td>
                <td class="money">{{ $invoice::rupiah($line->unitPriceRupiah) }}</td>
                <td class="money">{{ $invoice::rupiah($line->lineTotalRupiah) }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>
    <table class="totals">
        <tr><td>Subtotal</td><td>{{ $invoice::rupiah($invoice->subtotalRupiah) }}</td></tr>
        @if ($invoice->discountRupiah !== null)
            <tr><td>Diskon</td><td>{{ $invoice::rupiah($invoice->discountRupiah) }}</td></tr>
        @endif
        @if ($invoice->paymentFeeRupiah !== null)
            <tr><td>Biaya Pembayaran</td><td>{{ $invoice::rupiah($invoice->paymentFeeRupiah) }}</td></tr>
        @endif
        <tr class="total"><td>Total Pembayaran</td><td>{{ $invoice::rupiah($invoice->paidTotalRupiah) }}</td></tr>
    </table>
</body>
</html>
