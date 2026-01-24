"use client";

import { useState, useEffect } from "react";

interface Transaction {
  id: number;
  date: string;
  invoice_number: string | null;
  type: 'income' | 'expense';
  amount: string;
  payment_method: string;
  status: 'pending' | 'approved' | 'rejected';
  category: string;
  comment: string | null;
  created_at: string;
}

export default function ValidationTab() {
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Завантажуємо ТІЛЬКИ неперевірені (pending)
  const loadData = async () => {
    try {
      const token = localStorage.getItem("token"); // <--- БЕРЕМО ТОКЕН

      const res = await fetch("http://localhost:8080/api/transactions", {
        headers: {
            "Authorization": `Bearer ${token}` // <--- ПОКАЗУЄМО СЕРВЕРУ
        }
      });

      // Якщо токен прострочений або невірний
      if (res.status === 401) {
        window.location.href = "/";
        return;
      }

      const data = await res.json();
      
      // Фільтруємо на клієнті
      // (Тут важливо перевірити, чи data це масив, бо іноді може прийти помилка)
      if (Array.isArray(data)) {
          const pending = data.filter((t: Transaction) => t.status === 'pending');
          // Сортуємо: нові зверху
          setItems(pending.sort((a: any, b: any) => b.id - a.id));
      }
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // 2. Функція: Змінити статус (Approve / Reject)
  const updateStatus = async (id: number, newStatus: 'approved' | 'rejected') => {
    try {
      // Оптимістичне оновлення (миттєво прибираємо з екрану)
      setItems(prev => prev.filter(item => item.id !== id));

      const token = localStorage.getItem("token"); // <--- БЕРЕМО ТОКЕН

      await fetch(`http://localhost:8080/api/transactions/${id}`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // <--- ДОДАЄМО ХЕДЕР
        },
        body: JSON.stringify({ status: newStatus })
      });
      
    } catch (err) {
      alert("Помилка оновлення!");
      loadData(); // Якщо помилка - повертаємо назад
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            👀 Очікують перевірки
            <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">{items.length}</span>
        </h2>
        <button onClick={loadData} className="text-sm text-emerald-600 font-bold hover:underline">🔄 Оновити</button>
      </div>

      {loading ? (
        <div className="text-center p-10 text-slate-400">Завантаження...</div>
      ) : items.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-lg font-bold text-slate-800">Все чисто!</h3>
            <p className="text-slate-400">Всі транзакції перевірені.</p>
        </div>
      ) : (
        <div className="grid gap-4">
            {items.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition">
                    
                    {/* ЛІВА ЧАСТИНА: Інфо */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-1">
                            <span>{item.date}</span>
                            <span>•</span>
                            <span>{item.category}</span>
                            {item.payment_method !== 'cash' && (
                                <span className="bg-indigo-50 text-indigo-600 px-1.5 rounded border border-indigo-100">Банк</span>
                            )}
                        </div>
                        
                        <div className="text-lg font-bold text-slate-800">
                            {item.invoice_number || "Без назви"}
                        </div>
                        
                        {item.comment && (
                            <div className="text-sm text-red-500 mt-1 bg-red-50 inline-block px-2 py-0.5 rounded">
                                💬 {item.comment}
                            </div>
                        )}
                    </div>

                    {/* ЦЕНТР: Сума */}
                    <div className="text-right pr-4">
                        <div className={`text-2xl font-black ${item.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {item.type === 'income' ? '+' : '-'}{Number(item.amount).toFixed(2)} ₴
                        </div>
                        <div className="text-xs text-slate-400">Сума операції</div>
                    </div>

                    {/* ПРАВА ЧАСТИНА: Кнопки дій */}
                    <div className="flex items-center gap-2 border-l pl-4 border-slate-100">
                        <button 
                            onClick={() => updateStatus(item.id, 'rejected')}
                            className="w-10 h-10 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition"
                            title="Відхилити (Помилка)"
                        >
                            ✖
                        </button>
                        <button 
                            onClick={() => updateStatus(item.id, 'approved')}
                            className="h-10 px-6 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500 shadow-lg hover:shadow-emerald-500/30 transition flex items-center gap-2"
                        >
                            <span>ВІРНО</span>
                            <span>✓</span>
                        </button>
                    </div>

                </div>
            ))}
        </div>
      )}
    </div>
  );
}