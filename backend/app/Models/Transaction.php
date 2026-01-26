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
    'payment_status',
    'status',
    'category',
    'comment',
];
}