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
    'amount',
    'expense_amount',
    'full_value',
    'writeoff_amount',
    'payment_method',
    'is_official',
    'payment_status',
    'status',
    'category',
    'comment',
    'payment_date',
    'payer'
];
protected $casts = [
        'is_official' => 'boolean', // Це перетворить 0/1 на true/false
        'amount' => 'decimal:2',
        'expense_amount' => 'decimal:2',
    ];
}