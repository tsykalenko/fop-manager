<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Додаємо колонки для Витрат і Списань
            // default(0) означає, що якщо ми нічого не передали, буде 0
            $table->decimal('expense_amount', 10, 2)->default(0)->after('amount');
            $table->decimal('writeoff_amount', 10, 2)->default(0)->after('expense_amount');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['expense_amount', 'writeoff_amount']);
        });
    }
};