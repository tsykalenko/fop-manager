<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'invoice_number',
        'type',
        'amount',          // Це буде наш ДОХІД
        'expense_amount',  // Нове поле: ВИТРАТА
        'writeoff_amount', // Нове поле: СПИСАННЯ
        'payment_method',
        'status',
        'category',
        'comment',
    ];
}