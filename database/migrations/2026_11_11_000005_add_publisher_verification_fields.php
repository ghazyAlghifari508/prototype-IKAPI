<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('publisher_registrations', function (Blueprint $table): void {
            if (! Schema::hasColumn('publisher_registrations', 'legal_number')) {
                $table->string('legal_number')->nullable();
            }

            if (! Schema::hasColumn('publisher_registrations', 'verification_document_path')) {
                $table->string('verification_document_path')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('publisher_registrations', function (Blueprint $table): void {
            $columns = [];

            if (Schema::hasColumn('publisher_registrations', 'legal_number')) {
                $columns[] = 'legal_number';
            }

            if (Schema::hasColumn('publisher_registrations', 'verification_document_path')) {
                $columns[] = 'verification_document_path';
            }

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
