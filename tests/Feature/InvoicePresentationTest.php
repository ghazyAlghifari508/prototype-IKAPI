<?php

use App\Domain\Orders\Invoices\InvoiceDocument;
use App\Domain\Orders\Invoices\InvoiceLine;

function invoicePresentationFixture(): InvoiceDocument
{
    // Test-only presentation fixture; not a paid order, payment, or eligibility proof.
    return new InvoiceDocument(
        orderNumber: 'ORD-TEST-001',
        transactionReference: 'TX-TEST-001',
        paidAt: new DateTimeImmutable('2026-11-12T03:00:00+00:00'),
        buyerName: 'Pembeli Uji',
        buyerEmail: 'buyer@example.test',
        lines: [
            new InvoiceLine('Judul Panjang: Literasi & Kebudayaan Indonesia', 'Penerbit Bandung', 2, 45000, 90000),
            new InvoiceLine('Cerita Nusantara', 'Penerbit Jakarta', 1, 30000, 30000),
        ],
        subtotalRupiah: 120000,
        paidTotalRupiah: 120000,
    );
}

test('invoice presentation renders all snapshot items publishers references and integer totals', function () {
    $invoice = invoicePresentationFixture();
    $html = view('invoices.purchase', compact('invoice'))->render();
    expect($html)->toContain('ORD-TEST-001', 'TX-TEST-001', 'Penerbit Bandung', 'Penerbit Jakarta');
    expect($html)->toContain('Literasi &amp; Kebudayaan Indonesia', 'Cerita Nusantara', 'Rp45.000', 'Rp90.000', 'Rp120.000');
    expect($html)->toContain('12/11/2026 10:00 WIB');
    expect($html)->not->toContain('Biaya Pembayaran', 'Diskon', '<img', 'http://', 'https://');
});

test('invoice presentation escapes untrusted snapshot text rather than rendering executable markup', function () {
    $invoice = new InvoiceDocument('ORD-1', 'TX-1', new DateTimeImmutable, '<script>name</script>', 'buyer@example.test', [
        new InvoiceLine('<img src="https://example.test/private">', 'Penerbit & Rekan', 1, 1000, 1000),
    ], 1000, 1000);
    $html = view('invoices.purchase', compact('invoice'))->render();
    expect($html)->not->toContain('<script>name</script>', '<img src=');
    expect($html)->toContain('&lt;script&gt;name&lt;/script&gt;', 'Penerbit &amp; Rekan');
});

test('invoice presentation includes only explicitly supplied discount and fee amounts', function () {
    $invoice = new InvoiceDocument('ORD-1', 'TX-1', new DateTimeImmutable, 'Pembeli Uji', 'buyer@example.test', [
        new InvoiceLine('Judul', 'Penerbit', 1, 45000, 45000),
    ], 45000, 42000, 5000, 2000);
    $html = view('invoices.purchase', compact('invoice'))->render();
    expect($html)->toContain('Diskon', 'Biaya Pembayaran', 'Rp5.000', 'Rp2.000', 'Rp42.000');
});

test('integer rupiah formatting avoids floating point precision loss', function (int $amount, string $formatted) {
    expect(InvoiceDocument::rupiah($amount))->toBe($formatted);
})->with([[0, 'Rp0'], [45000, 'Rp45.000'], [9007199254740993, 'Rp9.007.199.254.740.993']]);

test('invalid item arithmetic and overflow are rejected', function (int $quantity, int $price, int $total) {
    expect(fn () => new InvoiceLine('Judul', 'Penerbit', $quantity, $price, $total))
        ->toThrow(InvalidArgumentException::class);
})->with([[0, 1000, 0], [1, -1, -1], [2, 1000, 1000], [2, PHP_INT_MAX, PHP_INT_MAX]]);

test('inconsistent snapshot totals are rejected before rendering', function (int $subtotal, int $paid, ?int $discount, ?int $fee) {
    expect(fn () => new InvoiceDocument('ORD-1', 'TX-1', new DateTimeImmutable, 'Pembeli', 'buyer@example.test', [
        new InvoiceLine('Judul', 'Penerbit', 1, 45000, 45000),
    ], $subtotal, $paid, $discount, $fee))->toThrow(InvalidArgumentException::class);
})->with([[46000, 46000, null, null], [45000, 44000, null, null], [45000, 45000, -1, null], [45000, 0, 46000, null], [45000, 45000, null, -1]]);

test('presentation values and repeated renders remain immutable without creating a new number', function () {
    $invoice = invoicePresentationFixture();
    $first = view('invoices.purchase', compact('invoice'))->render();
    expect(fn () => $invoice->lines[0]->unitPriceRupiah = 60000)->toThrow(Error::class);
    expect(view('invoices.purchase', compact('invoice'))->render())->toBe($first);
    expect($invoice->orderNumber)->toBe('ORD-TEST-001');
});

test('presentation rejects missing transaction data and empty items', function () {
    expect(fn () => new InvoiceDocument('', '', new DateTimeImmutable, '', 'invalid-email', [], 0, 0))
        ->toThrow(InvalidArgumentException::class);
});
