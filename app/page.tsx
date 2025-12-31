"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

// 1. Описуємо тип однієї транзакції (як вона лежить в базі)
type Transaction = {
  id: number;
  created_at: string;
  title: string;
  type: "income" | "expense";
  amount: number;
  payment_method: string;
};

// 2. Описуємо тип для ГРУПИ (День + список транзакцій + підсумки)
type DayGroup = {
  date: string;
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
};

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Стейт для форми
  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newType, setNewType] = useState<"income" | "expense">("income");
  const [paymentMethod, setPaymentMethod] = useState("Готівка");

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false }); // Спочатку нові

    if (error) console.error("Помилка:", error);
    else setTransactions(data || []);
    
    setLoading(false);
  }

  // --- 🧠 МОЗОК: Функція групування ---
  // Вона перетворює плоский список транзакцій на список груп по днях
  const groupedTransactions: DayGroup[] = [];

  transactions.forEach((t) => {
    // Перетворюємо страшну дату "2023-12-30T14:00:00" на просту "30.12.2023"
    const dateKey = new Date(t.created_at).toLocaleDateString("uk-UA");

    // Шукаємо, чи є вже група для цієї дати
    let group = groupedTransactions.find((g) => g.date === dateKey);

    // Якщо групи немає — створюємо нову
    if (!group) {
      group = { date: dateKey, transactions: [], totalIncome: 0, totalExpense: 0 };
      groupedTransactions.push(group);
    }

    // Додаємо транзакцію в групу
    group.transactions.push(t);

    // Рахуємо гроші в цій групі
    if (t.type === "income") {
      group.totalIncome += t.amount;
    } else {
      group.totalExpense += t.amount;
    }
  });
  // ------------------------------------

  const handleAdd = async () => {
    if (!newTitle || !newAmount) return alert("Заповніть поля!");

    const { error } = await supabase.from("transactions").insert([
      {
        title: newTitle,
        amount: Number(newAmount),
        type: newType,
        payment_method: paymentMethod,
      },
    ]);

    if (!error) {
      setNewTitle("");
      setNewAmount("");
      fetchTransactions();
    }
  };

  // Загальний баланс за весь час
  const globalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const globalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

    
// Функція видалення
  const handleDelete = async (id: number) => {
    // 1. Питаємо користувача, чи він певен (щоб не видалити випадково)
    if (!confirm("Видалити цей запис?")) return;

    // 2. Видаляємо з бази, де id співпадає
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id); // .eq означає EQuals (дорівнює)

    if (error) {
      alert("Не вдалося видалити!");
      console.error(error);
    } else {
      // 3. Оновлюємо список на екрані
      fetchTransactions();
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Шапка */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-700">Мій ФОП</h1>
          <div className="text-sm font-mono bg-blue-50 px-2 py-1 rounded text-blue-800">
             Баланс: {globalIncome - globalExpense} ₴
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto mt-4 p-4 space-y-6">
        
        {/* Форма додавання */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Що продали/купили?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="border p-2 rounded-lg w-full"
            />
            <input
              type="number"
              placeholder="Сума"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="border p-2 rounded-lg w-24"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as any)}
              className="border p-2 rounded-lg flex-1 bg-gray-50"
            >
              <option value="income">🟢 Дохід</option>
              <option value="expense">🔴 Витрата</option>
            </select>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="border p-2 rounded-lg flex-1 bg-gray-50"
            >
              <option value="Готівка">💵 Готівка</option>
              <option value="Картка">💳 Картка</option>
            </select>
          </div>
          <button
            onClick={handleAdd}
            className="w-full mt-3 bg-black text-white py-3 rounded-lg font-bold active:scale-95 transition"
          >
            Додати запис
          </button>
        </div>

        {/* СПИСОК ПО ДНЯХ */}
        <div className="space-y-6">
          {groupedTransactions.map((group) => (
            <div key={group.date} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              
              {/* Заголовок Дня (Дата + Підсумки) */}
              <div className="bg-gray-100 p-3 flex justify-between items-center border-b border-gray-200">
                <span className="font-bold text-gray-700">{group.date}</span>
                <div className="text-xs space-x-2">
                  <span className="text-green-600 font-bold">+{group.totalIncome}</span>
                  <span className="text-red-500 font-bold">-{group.totalExpense}</span>
                </div>
              </div>

              {/* Список транзакцій цього дня */}
              <div className="divide-y divide-gray-100">
                {group.transactions.map((t) => (
                  <div key={t.id} className="p-3 flex justify-between items-center hover:bg-gray-50 group">
                    {/* Ліва частина: Назва + Метод */}
                    <div className="flex items-center gap-3">
                      {/* КНОПКА ВИДАЛЕННЯ (З'являється червоний хрестик) */}
                      <button 
                        onClick={() => handleDelete(t.id)}
                        className="text-gray-300 hover:text-red-500 transition px-2 py-1 text-xl font-bold"
                        title="Видалити"
                      >
                        ×
                      </button>
                      
                      <div>
                        <div className="font-medium text-gray-800">{t.title}</div>
                        <div className="text-xs text-gray-400">{t.payment_method}</div>
                      </div>
                    </div>

                    {/* Права частина: Сума */}
                    <span className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                      {t.type === 'income' ? '+' : '-'} {t.amount}
                    </span>
                  </div>
                ))}
              </div>

              {/* Чистий прибуток за день */}
              <div className="bg-gray-50 p-2 text-right text-xs text-gray-500 border-t">
                Прибуток за день: 
                <span className="font-bold ml-1 text-gray-800">
                  {group.totalIncome - group.totalExpense} ₴
                </span>
              </div>
            </div>
          ))}

          {!loading && groupedTransactions.length === 0 && (
             <div className="text-center text-gray-400 py-10">Тут поки пусто</div>
          )}
        </div>

      </main>
    </div>
  );
}