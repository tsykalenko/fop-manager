"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; // Імпортуємо наше підключення

// Описуємо структуру даних, яка приходить з бази
type Transaction = {
  id: number;
  created_at: string;
  title: string;
  type: "income" | "expense";
  amount: number;
  payment_method: string;
};

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true); // Щоб показувати "Завантаження..."

  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newType, setNewType] = useState<"income" | "expense">("income");
  const [paymentMethod, setPaymentMethod] = useState("Готівка");

  // 1. МАГІЯ: Ця функція запускається один раз при вході на сайт
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Функція для завантаження даних з Supabase
  async function fetchTransactions() {
    setLoading(true);
    // "select *" означає "дай мені все"
    // "order" - сортувати за датою (спочатку нові)
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Помилка завантаження:", error);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  }

  // Функція для додавання запису в Supabase
  const handleAdd = async () => {
    if (!newTitle || !newAmount) return alert("Заповніть всі поля!");

    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          title: newTitle,
          amount: Number(newAmount),
          type: newType,
          payment_method: paymentMethod, // Тепер беремо те, що вибрав користувач
        },
      ])
      .select();

    if (error) {
      alert("Помилка при збереженні!");
      console.error(error);
    } else {
      // Якщо все ок - оновлюємо список
      setNewTitle("");
      setNewAmount("");
      fetchTransactions(); // Перезавантажуємо таблицю
    }
  };

  // Підрахунок балансу
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const profit = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-700">FOP Manager</h1>
          <div className="text-sm text-gray-500">Віктор (Адмін)</div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto mt-6 p-4 space-y-6">
        
        {/* Баланс */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
            <p className="text-xs text-gray-500 uppercase">Дохід</p>
            <p className="text-lg md:text-2xl font-bold text-green-600">+{totalIncome} ₴</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500">
            <p className="text-xs text-gray-500 uppercase">Витрати</p>
            <p className="text-lg md:text-2xl font-bold text-red-500">-{totalExpense} ₴</p>
          </div>
          <div className="bg-blue-600 p-4 rounded-xl shadow-sm text-white">
            <p className="text-xs opacity-80 uppercase">Прибуток</p>
            <p className="text-lg md:text-2xl font-bold">{profit} ₴</p>
          </div>
        </div>

        {/* Форма */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold mb-3 text-gray-700">Нова операція</h3>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Назва"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="border p-2 rounded-lg w-full"
            />
            <input
              type="number"
              placeholder="Сума"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="border p-2 rounded-lg w-full md:w-32"
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as "income" | "expense")}
              className="border p-2 rounded-lg bg-gray-50"
            >
              <option value="income">Дохід (+)</option>
              <option value="expense">Витрата (-)</option>
            </select>
            {/* Вибір: Готівка чи Картка */}
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="border p-2 rounded-lg bg-gray-50"
            >
              <option value="Готівка">💵 Готівка</option>
              <option value="Картка">💳 Картка</option>
            </select>
            <button
              onClick={handleAdd}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition"
            >
              Додати
            </button>
          </div>
        </div>

        {/* Таблиця */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Завантаження даних...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase border-b">
                <tr>
                  <th className="p-3">Дата</th>
                  <th className="p-3">Опис</th>
                  <th className="p-3 text-right">Сума</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="p-3 text-gray-500">
                      {new Date(t.created_at).toLocaleDateString("uk-UA")}
                    </td>
                    <td className="p-3 font-medium">{t.title}</td>
                    <td
                      className={`p-3 text-right font-bold ${
                        t.type === "income" ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"} {t.amount} ₴
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && transactions.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              Поки немає записів у базі
            </div>
          )}
        </div>
      </main>
    </div>
  );
}