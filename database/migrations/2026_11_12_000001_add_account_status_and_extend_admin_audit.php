<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('account_status')->default('active')->index();
            $table->unsignedBigInteger('account_version')->default(0);
        });
        Schema::table('publisher_registration_reviews', function (Blueprint $table): void {
            $table->unsignedBigInteger('publisher_registration_id')->nullable()->change();
            $table->foreignId('target_user_id')->nullable()->constrained('users')->restrictOnDelete();
            $table->string('action')->nullable();
            $table->text('reason')->nullable();
        });
        DB::statement("UPDATE publisher_registration_reviews AS reviews SET target_user_id = registrations.user_id, action = CASE WHEN reviews.new_status = 'approved' THEN 'approval' ELSE 'rejection' END, reason = reviews.rejection_reason FROM publisher_registrations AS registrations WHERE registrations.id = reviews.publisher_registration_id");
    }

    public function down(): void
    {
        // Restore the P2 audit schema; only P3 audit entries have no application target.
        DB::table('publisher_registration_reviews')->whereNull('publisher_registration_id')->delete();
        Schema::table('publisher_registration_reviews', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('target_user_id');
            $table->dropColumn(['action', 'reason']);
            $table->unsignedBigInteger('publisher_registration_id')->nullable(false)->change();
        });
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn(['account_status', 'account_version']);
        });
    }
};
