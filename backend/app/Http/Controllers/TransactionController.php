<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    // 1. Отримати список (GET)
    public function index()
    {
        // Сортуємо: найсвіжіші записи зверху
        return response()->json(Transaction::orderBy('created_at', 'desc')->get());
    }

    // 2. Зберегти нову операцію (POST)
    public function store(Request $request)
{
    $validated = $request->validate([
        // ... старі поля ...
        'date' => 'required|date',
        'invoice_number' => 'nullable|string',
        'type' => 'required|in:income,expense',
        'status' => 'required|in:pending,approved,rejected',
        'category' => 'required|string',
        'payment_method' => 'required|string',
        'full_value' => 'nullable|numeric',
        'payment_status' => 'required|in:paid,unpaid', 
        'comment' => 'nullable|string',
        'amount' => 'nullable|numeric',
        'expense_amount' => 'nullable|numeric',
        'writeoff_amount' => 'nullable|numeric',
    ]);

    $transaction = Transaction::create($validated);
    return response()->json($transaction, 201);
}
    // 3. Оновлення запису
    public function update(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);

        $validated = $request->validate([
            'date' => 'required|date',
            'invoice_number' => 'nullable|string',
            'type' => 'required|in:income,expense',
            'amount' => 'nullable|numeric',
            'expense_amount' => 'nullable|numeric',
            'full_value' => 'nullable|numeric',
            'writeoff_amount' => 'nullable|numeric',
            'payment_method' => 'required|string',
            'payment_status' => 'required|in:paid,unpaid',
            'status' => 'required|in:pending,approved,rejected',
            'category' => 'required|string',
            'comment' => 'nullable|string',
        ]);

        $transaction->update($validated);

        return response()->json($transaction);
    }
    // 4. Видалити операцію (DELETE)
    public function destroy($id)
    {
        $transaction = Transaction::findOrFail($id);
        $transaction->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}