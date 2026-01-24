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
        // 1. ВАЛІДАЦІЯ: Перевіряємо, чи дані коректні
        $validated = $request->validate([
            'date' => 'required|date',
            'invoice_number' => 'nullable|string',
            'type' => 'required|in:income,expense', // Тільки ці два слова
            'status' => 'required|in:pending,approved,rejected',
            'category' => 'required|string',
            'payment_method' => 'required|string',
            'comment' => 'nullable|string',
            
            // Наші нові герої (можуть бути пустими, тоді буде 0)
            'amount' => 'nullable|numeric',          // Дохід
            'expense_amount' => 'nullable|numeric',  // Витрата
            'writeoff_amount' => 'nullable|numeric', // Списання
        ]);

        // 2. СТВОРЕННЯ: Якщо валідація пройшла, просто зберігаємо
        // Ларавель сам візьме потрібні поля з масиву $validated
        $transaction = Transaction::create($validated);

        return response()->json($transaction, 201);
    }

    // 3. Оновлення (PUT)
    public function update(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);
        
        // Тут теж бажано провалідувати, але можна дозволити часткове оновлення
        $transaction->update($request->all());
        
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