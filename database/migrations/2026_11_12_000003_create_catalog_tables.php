<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('authors', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('categories', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('books', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('publisher_registration_id')
                ->constrained('publisher_registrations')
                ->restrictOnDelete();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->string('title');
            $table->string('edition', 100)->nullable();
            $table->string('genre', 100)->nullable();
            $table->text('synopsis');
            $table->unsignedInteger('page_count');
            $table->unsignedBigInteger('original_price_rupiah');
            $table->unsignedTinyInteger('discount_percentage')->default(0);
            $table->string('publication_status', 20)->default('draft');
            $table->string('cover_path')->nullable();
            $table->string('pdf_path')->nullable();
            $table->unsignedBigInteger('pdf_size_bytes')->nullable();
            $table->string('pdf_checksum', 64)->nullable();
            $table->timestamps();

            $table->index(['publisher_registration_id', 'publication_status']);
            $table->index(['category_id', 'publication_status']);
        });

        Schema::create('author_book', function (Blueprint $table): void {
            $table->foreignId('book_id')->constrained()->cascadeOnDelete();
            $table->foreignId('author_id')->constrained()->restrictOnDelete();
            $table->primary(['book_id', 'author_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('author_book');
        Schema::dropIfExists('books');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('authors');
    }
};
