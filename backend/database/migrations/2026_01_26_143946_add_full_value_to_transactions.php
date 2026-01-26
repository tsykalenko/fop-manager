<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    Schema::table('transactions', function (Blueprint $table) {
        // Колонка для повної вартості товару (якщо відрізняється від оплати)
        $table->decimal('full_value', 15, 2)->nullable()->after('expense_amount');
    });
}

public function down(): void
{
    Schema::table('transactions', function (Blueprint $table) {
        $table->dropColumn('full_value');
    });
}
};
