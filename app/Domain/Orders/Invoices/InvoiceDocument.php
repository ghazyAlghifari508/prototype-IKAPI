<?php

namespace App\Domain\Orders\Invoices;

use DateTimeImmutable;
use DateTimeZone;
use InvalidArgumentException;

/**
 * Immutable presentation contract, not an Order model or proof of payment.
 * No request payload may be mapped here without canonical ownership/payment checks.
 */
final readonly class InvoiceDocument
{
    /** @param list<InvoiceLine> $lines */
    public function __construct(
        public string $orderNumber,
        public string $transactionReference,
        public DateTimeImmutable $paidAt,
        public string $buyerName,
        public string $buyerEmail,
        public array $lines,
        public int $subtotalRupiah,
        public int $paidTotalRupiah,
        public ?int $discountRupiah = null,
        public ?int $paymentFeeRupiah = null,
    ) {
        if (trim($orderNumber) === '' || trim($transactionReference) === '' || trim($buyerName) === ''
            || ! filter_var($buyerEmail, FILTER_VALIDATE_EMAIL) || $lines === []) {
            throw new InvalidArgumentException('Identitas atau rincian invoice tidak lengkap.');
        }
        $sum = 0;
        foreach ($lines as $line) {
            if ($sum > PHP_INT_MAX - $line->lineTotalRupiah) {
                throw new InvalidArgumentException('Nominal item invoice tidak valid.');
            }
            $sum += $line->lineTotalRupiah;
        }
        $discount = $discountRupiah ?? 0;
        $fee = $paymentFeeRupiah ?? 0;
        if ($sum !== $subtotalRupiah || $discount < 0 || $discount > $subtotalRupiah
            || $fee < 0 || $subtotalRupiah - $discount > PHP_INT_MAX - $fee
            || $subtotalRupiah - $discount + $fee !== $paidTotalRupiah) {
            throw new InvalidArgumentException('Total snapshot invoice tidak konsisten.');
        }
    }

    public function formattedPaidAt(): string
    {
        return $this->paidAt->setTimezone(new DateTimeZone('Asia/Jakarta'))->format('d/m/Y H:i').' WIB';
    }

    public static function rupiah(int $amount): string
    {
        if ($amount < 0) {
            throw new InvalidArgumentException('Nominal Rupiah tidak boleh negatif.');
        }

        return 'Rp'.preg_replace('/\B(?=(\d{3})+(?!\d))/', '.', (string) $amount);
    }
}
