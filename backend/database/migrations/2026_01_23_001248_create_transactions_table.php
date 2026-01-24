<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            
            // Основні дані
            $table->date('date'); // Дата звіту (за яке число запис)
            $table->string('invoice_number')->nullable(); // Назва/Номер накладної
            
            // Тип операції: income (дохід), expense (витрата), write_off (списання)
            $table->string('type'); 
            
            // Сума
            $table->decimal('amount', 15, 2); 
            
            // Оплата
            // cash (готівка), bank (термінал/картка), none (не оплачено/борг)
            $table->string('payment_method')->default('cash'); 
            
            // Статус перевірки Адміном
            // pending (жовтий), approved (зелений), rejected (червоний)
            $table->string('status')->default('pending');
            
            // Додаткові поля
            $table->text('comment')->nullable(); // Коментар (чат по запису)
            $table->string('category')->nullable(); // Категорія (ЗЕД, Податки, Товар)
            
            // Для зв'язку автоматичного запису (коли оплатили накладну з Модуля 2)
            $table->date('payment_date')->nullable(); // Фактична дата оплати
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
