"use client";

import { useState, useEffect } from "react";
// Supabase тут більше не імпортуємо! Ми спілкуємось через API.

type TradeItem = {
  id: number;
  date: string;
  title: string;
  income: number;
  expense: number;
  writeoff: number;
  payment_method: string;
  status: "paid" | "unpaid";
};

export default function Home() {
  const [items, setItems] = useState<TradeItem[]>([]);
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false); // Додамо стан завантаження

  // Поля форми
  const [title, setTitle] = useState("");
  const [income, setIncome] = useState("");
  const [expense, setExpense] = useState("");
  const [writeoff, setWriteoff] = useState("");
  const [method, setMethod] = useState("Готівка");
  const [status, setStatus] = useState<"paid" | "unpaid">("paid");

  useEffect(() => { fetchItems(); }, [viewDate]);

  // 1. ОТРИМАННЯ (Через наше API)
  async function fetchItems() {
    setLoading(true);
    try {
      // Звертаємось до нашого Node.js сервера
      const res = await fetch(`/api/transactions?date=${viewDate}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setItems(data);
      } else {
        console.error("Помилка API:", data);
      }
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  }

  const changeDate = (days: number) => {
    const date = new Date(viewDate);
    date.setDate(date.getDate() + days);
    setViewDate(date.toISOString().split('T')[0]);
  };

  // 2. ДОДАВАННЯ (Через API)
  const handleAdd = async () => {
    if (!title) return alert("Введіть назву!");

    const newItem = {
        date: viewDate,
        title: title,
        income: Number(income) || 0,
        expense: Number(expense) || 0,
        writeoff: Number(writeoff) || 0,
        payment_method: method,
        status: status
    };

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });

    if (res.ok) {
      setTitle(""); setIncome(""); setExpense(""); setWriteoff(""); setStatus("paid");
      fetchItems();
    } else {
      alert("Помилка збереження!");
    }
  };

  // 3. ВИДАЛЕННЯ (Через API)
  const handleDelete = async (id: number) => {
    if (!confirm("Видалити?")) return;
    
    await fetch(`/api/transactions?id=${id}`, {
      method: "DELETE",
    });
    
    fetchItems();
  };

  const sumIncome = items.reduce((acc, item) => acc + item.income, 0);
  const sumExpense = items.reduce((acc, item) => item.status === 'unpaid' ? acc : acc + item.expense, 0);
  const sumWriteoff = items.reduce((acc, item) => acc + item.writeoff, 0);
  const dayProfit = sumIncome - sumExpense - sumWriteoff;

  return (
    <div className="min-h-screen bg-gray-50 pb-32 font-sans">
      <header className="bg-blue-700 text-white sticky top-0 z-20 shadow-md">
        <div className="p-4 flex justify-between items-center">
             <button onClick={() => changeDate(-1)} className="text-2xl font-bold px-4 active:opacity-50">‹</button>
             <div className="flex flex-col items-center">
                <input 
                    type="date" 
                    value={viewDate} 
                    onChange={(e) => setViewDate(e.target.value)}
                    className="bg-transparent text-white font-bold text-lg text-center outline-none cursor-pointer"
                />
                <span className="text-[10px] opacity-80 uppercase tracking-widest">Обраний день</span>
             </div>
             <button onClick={() => changeDate(1)} className="text-2xl font-bold px-4 active:opacity-50">›</button>
        </div>
        <div className="bg-blue-800 p-2 flex justify-between px-6 text-sm">
            <span className="opacity-80">Чистий прибуток:</span>
            <span className="font-bold text-lg">{dayProfit} ₴</span>
        </div>
      </header>

      <main className="p-3 max-w-3xl mx-auto space-y-6 mt-2">
        {/* ФОРМА */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 space-y-3">
          <input type="text" placeholder="Товар..." value={title} onChange={e => setTitle(e.target.value)} className="w-full border-b border-gray-300 py-2 font-medium outline-none placeholder-gray-400" />

          <div className="grid grid-cols-3 gap-2">
            <div><input type="number" placeholder="Дохід" value={income} onChange={e => setIncome(e.target.value)} className="w-full bg-green-50 rounded px-2 py-2 font-bold text-gray-700 outline-none" /></div>
            <div><input type="number" placeholder="Витрата" value={expense} onChange={e => setExpense(e.target.value)} className="w-full bg-red-50 rounded px-2 py-2 font-bold text-gray-700 outline-none" /></div>
            <div><input type="number" placeholder="Спис." value={writeoff} onChange={e => setWriteoff(e.target.value)} className="w-full bg-gray-100 rounded px-2 py-2 font-bold text-gray-700 outline-none" /></div>
          </div>

          <div className="flex gap-2 items-center pt-2">
             <select value={method} onChange={e => setMethod(e.target.value)} className="bg-gray-50 text-xs p-2 rounded border flex-1"><option>💵 Готівка</option><option>💳 Картка</option></select>
             <select value={status} onChange={e => setStatus(e.target.value as any)} className={`text-xs p-2 rounded border flex-1 font-bold ${status === 'unpaid' ? 'bg-orange-100 text-orange-700' : 'bg-gray-50'}`}><option value="paid">✅ Оплачено</option><option value="unpaid">⏳ Борг</option></select>
             <button onClick={handleAdd} disabled={loading} className="flex-[2] bg-black text-white py-3 rounded-lg font-bold text-sm shadow active:scale-95 transition">
               {loading ? "..." : "+ Зберегти"}
             </button>
          </div>
        </div>

        {/* ТАБЛИЦЯ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading && <div className="p-4 text-center text-blue-600">Завантаження...</div>}
          
          {!loading && items.map((item) => {
             // Логіка відображення (та сама)
             const isUnpaid = item.status === 'unpaid';
             let markupText = "";
             if (item.expense > 0) {
                 const val = (item.income - item.writeoff) / item.expense;
                 markupText = val.toFixed(2).replace('.', ',') + '%';
             }

             return (
               <div key={item.id} className="grid grid-cols-[3fr_2fr_2fr_2fr_1fr] p-3 text-sm items-center border-b border-gray-100 last:border-0">
                  <div className="pl-2">
                      <div className="font-medium truncate">{item.title}</div>
                      {markupText && <span className="text-[10px] px-1 bg-gray-100 rounded">x{markupText}</span>}
                  </div>
                  <div className="text-center font-bold text-green-600">{item.income || "-"}</div>
                  <div className={`text-center font-bold ${isUnpaid ? "text-red-200" : "text-red-500"}`}>{isUnpaid ? "⏳" : ""}{item.expense || "-"}</div>
                  <div className="text-center font-bold text-gray-500">{item.writeoff || "-"}</div>
                  <div className="text-center"><button onClick={() => handleDelete(item.id)} className="text-gray-300 hover:text-red-600 font-bold">×</button></div>
               </div>
             )
          })}
        </div>
      </main>
    </div>
  );
}