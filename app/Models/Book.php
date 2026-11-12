<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property int $publisher_registration_id
 * @property int $category_id
 * @property string $title
 * @property string|null $edition
 * @property string|null $genre
 * @property string $synopsis
 * @property int $page_count
 * @property int $original_price_rupiah
 * @property int $discount_percentage
 * @property string $publication_status
 * @property string|null $cover_path
 * @property string|null $pdf_path
 * @property int|null $pdf_size_bytes
 * @property string|null $pdf_checksum
 * @property int $final_price_rupiah
 * @property string|null $cover_url
 */
class Book extends Model
{
    protected $fillable = [
        'publisher_registration_id',
        'category_id',
        'title',
        'edition',
        'genre',
        'synopsis',
        'page_count',
        'original_price_rupiah',
        'discount_percentage',
        'publication_status',
        'cover_path',
        'pdf_path',
        'pdf_size_bytes',
        'pdf_checksum',
    ];

    protected function casts(): array
    {
        return [
            'page_count' => 'integer',
            'original_price_rupiah' => 'integer',
            'discount_percentage' => 'integer',
            'pdf_size_bytes' => 'integer',
        ];
    }

    /** @return BelongsTo<PublisherRegistration, $this> */
    public function publisherRegistration(): BelongsTo
    {
        return $this->belongsTo(PublisherRegistration::class);
    }

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @return BelongsToMany<Author, $this> */
    public function authors(): BelongsToMany
    {
        return $this->belongsToMany(Author::class);
    }

    /** @return Attribute<int, never> */
    protected function finalPriceRupiah(): Attribute
    {
        return Attribute::get(fn (): int => (int) round(
            $this->original_price_rupiah * (100 - $this->discount_percentage) / 100,
            0,
            PHP_ROUND_HALF_UP,
        ));
    }

    /** @return Attribute<?string, never> */
    protected function coverUrl(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->cover_path
            ? Storage::disk('public')->url($this->cover_path)
            : null);
    }
}
