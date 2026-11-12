<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('publisher_bank_accounts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('publisher_registration_id')
                ->unique()
                ->constrained('publisher_registrations')
                ->cascadeOnDelete();
            $table->string('bank_code', 32);
            $table->string('bank_name', 100);
            $table->text('account_number');
            $table->string('account_holder', 255);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('publisher_bank_accounts');
    }
};
