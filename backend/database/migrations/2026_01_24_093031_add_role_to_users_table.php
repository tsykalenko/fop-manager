<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // 1. Прибираємо default.
            // 2. Додаємо nullable(), щоб база не лаялась, якщо ми раптом створимо юзера без ролі.
            // Але в коді ми будемо змушувати вказувати роль.
            $table->string('role')->nullable()->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};