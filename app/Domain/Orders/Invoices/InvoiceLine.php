<?php

namespace App\Domain\Orders\Invoices;

use InvalidArgumentException;

/** Presentation data only: map persisted order snapshots here after authorization. */
final readonly class InvoiceLine
{
    public function __construct(
        public string $title,
        public string $publisherName,
        public int $quantity,
        public int $unitPriceRupiah,
        public int $lineTotalRupiah,
    ) {
        if (trim($title) === '' || trim($publisherName) === '' || $quantity < 1 || $unitPriceRupiah < 0
            || $unitPriceRupiah > intdiv(PHP_INT_MAX, $quantity)
            || $quantity * $unitPriceRupiah !== $lineTotalRupiah) {
            throw new InvalidArgumentException('Snapshot item invoice tidak valid.');
        }
    }
}
