"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type TradeItem = {
  id: number;
  date: string;
  title: string;
  income: number;
  expense: number;
  writeoff: number;
  payment_method: string;
  status: "paid" | "unpaid"; // Статус оплати
};

export default function Home() {
  const [items, setItems] = useState<TradeItem[]>([]);
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);

  // Поля форми
  const [title, setTitle] = useState("");
  const [income, setIncome] = useState("");
  const [expense, setExpense] = useState("");
  const [writeoff, setWriteoff] = useState("");
  const [method, setMethod] = useState("Готівка");
  const [status, setStatus] = useState<"paid" | "unpaid">("paid"); // Повернули статус

  useEffect(() => { fetchItems(); }, [viewDate]);

  async function fetchItems() {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("date", viewDate)
      .order("created_at", { ascending: false });
      
    if (data) setItems(data);
    else setItems([]);
  }

  const changeDate = (days: number) => {
    const date = new Date(viewDate);
    date.setDate(date.getDate() + days);
    setViewDate(date.toISOString().split('T')[0]);
  };

  const handleAdd = async () => {
    if (!title) return alert("Введіть назву!");

    const { error } = await supabase.from("transactions").insert([
      {
        date: viewDate,
        title: title,
        income: Number(income) || 0,
        expense: Number(expense) || 0,
        writeoff: Number(writeoff) || 0,
        payment_method: method,
        status: status // Записуємо вибраний статус
      },
    ]);

    if (!error) {
      setTitle(""); setIncome(""); setExpense(""); setWriteoff("");
      // Скидаємо статус на "Оплачено" після додавання, щоб не забути
      setStatus("paid"); 
      fetchItems();
    } else {
      alert("Помилка!");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Видалити?")) return;
    await supabase.from("transactions").delete().eq("id", id);
    fetchItems();
  };

  // --- МАТЕМАТИКА ---
  const sumIncome = items.reduce((acc, item) => acc + item.income, 0);
  
  // 🔥 ВАЖЛИВО: Рахуємо витрати, тільки якщо статус "paid"
  const sumExpense = items.reduce((acc, item) => {
    if (item.status === 'unpaid') return acc; // Якщо борг - пропускаємо
    return acc + item.expense;
  }, 0);

  const sumWriteoff = items.reduce((acc, item) => acc + item.writeoff, 0);
  
  // Чистий прибуток
  const dayProfit = sumIncome - sumExpense - sumWriteoff;

  return (
    <div className="min-h-screen bg-gray-50 pb-32 font-sans">
      
      {/* --- НАВІГАЦІЯ --- */}
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
            <span className="opacity-80">Чистий прибуток (по касі):</span>
            <span className="font-bold text-lg">{dayProfit} ₴</span>
        </div>
      </header>

      <main className="p-3 max-w-3xl mx-auto space-y-6 mt-2">
        
        {/* --- ФОРМА --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 space-y-3">
          <div className="text-center text-xs text-gray-400 font-bold uppercase mb-2">
            Додати запис за {viewDate}
          </div>
          <input type="text" placeholder="Товар (напр. Хліб)" value={title} onChange={e => setTitle(e.target.value)} className="w-full border-b border-gray-300 py-2 font-medium outline-none placeholder-gray-400" />

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-bold text-green-600 uppercase">Дохід</label>
              <input type="number" placeholder="0" value={income} onChange={e => setIncome(e.target.value)} className="w-full bg-green-50 rounded px-2 py-2 font-bold text-gray-700 outline-none focus:ring-1 focus:ring-green-500" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-red-600 uppercase">Витрата</label>
              <input type="number" placeholder="0" value={expense} onChange={e => setExpense(e.target.value)} className="w-full bg-red-50 rounded px-2 py-2 font-bold text-gray-700 outline-none focus:ring-1 focus:ring-red-500" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">Спис.</label>
              <input type="number" placeholder="0" value={writeoff} onChange={e => setWriteoff(e.target.value)} className="w-full bg-gray-100 rounded px-2 py-2 font-bold text-gray-700 outline-none focus:ring-1 focus:ring-gray-500" />
            </div>
          </div>

          <div className="flex gap-2 items-center pt-2">
             <select value={method} onChange={e => setMethod(e.target.value)} className="bg-gray-50 text-xs p-2 rounded border flex-1">
                <option>💵 Готівка</option>
                <option>💳 Картка</option>
             </select>
             
             {/* 👇 ПОВЕРНУЛИ ВИБІР СТАТУСУ */}
             <select 
                value={status} 
                onChange={e => setStatus(e.target.value as any)} 
                className={`text-xs p-2 rounded border flex-1 font-bold ${status === 'unpaid' ? 'bg-orange-100 text-orange-700 border-orange-300' : 'bg-gray-50'}`}
             >
                <option value="paid">✅ Оплачено</option>
                <option value="unpaid">⏳ Борг</option>
             </select>

             <button onClick={handleAdd} className="flex-[2] bg-black text-white py-3 rounded-lg font-bold text-sm shadow active:scale-95 transition">
               + Зберегти
             </button>
          </div>
        </div>

        {/* --- ТАБЛИЦЯ --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-[3fr_2fr_2fr_2fr_1fr] bg-gray-100 p-2 text-[10px] font-bold text-gray-500 uppercase border-b text-center">
            <div className="text-left pl-2">Товар</div>
            <div className="text-green-600">Дохід</div>
            <div className="text-red-500">Витрата</div>
            <div className="text-gray-500">Спис.</div>
            <div></div>
          </div>

          <div className="divide-y divide-gray-100">
            {items.map((item) => {
                // Розрахунок націнки
                let markupText = "";
                let markupColor = "bg-gray-100 text-gray-500";
                if (item.expense > 0) {
                    const val = (item.income - item.writeoff) / item.expense;
                    if (val >= 1) markupColor = "bg-green-50 text-green-700";
                    else markupColor = "bg-red-50 text-red-700";
                    markupText = val.toFixed(2).replace('.', ',') + '%';
                }

                // 🔥 Визначаємо стиль для витрати (Блідий якщо не оплачено)
                const isUnpaid = item.status === 'unpaid';
                const expenseStyle = isUnpaid 
                    ? "font-bold text-red-200 text-center flex items-center justify-center gap-1" // Блідий + іконка
                    : "font-bold text-red-500 text-center"; // Звичайний

                return (
                  <div key={item.id} className="grid grid-cols-[3fr_2fr_2fr_2fr_1fr] p-3 text-sm items-center">
                    <div className="font-medium text-gray-800 leading-tight text-left pl-2 overflow-hidden">
                      <div className="text-ellipsis whitespace-nowrap">{item.title}</div>
                      {markupText && (
                          <span className={`text-[10px] px-1.5 rounded font-bold inline-block mt-1 ${markupColor}`}>
                              x{markupText}
                          </span>
                      )}
                    </div>
                    
                    <div className="font-bold text-green-600 text-center">{item.income > 0 ? item.income : "-"}</div>
                    
                    {/* 👇 ВИТРАТА З УРАХУВАННЯМ БОРГУ */}
                    <div className={expenseStyle}>
                        {isUnpaid && <span className="text-[10px]">⏳</span>}
                        {item.expense > 0 ? item.expense : "-"}
                    </div>

                    <div className="font-bold text-gray-500 text-center bg-gray-50 rounded py-1 mx-1">
                        {item.writeoff > 0 ? item.writeoff : "-"}
                    </div>
                    <div className="text-center">
                      <button onClick={() => handleDelete(item.id)} className="text-gray-300 hover:text-red-600 font-bold px-2">×</button>
                    </div>
                  </div>
                );
            })}

            {items.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm">
                Пусто.
              </div>
            )}
          </div>

          {/* ПІДВАЛ */}
          {items.length > 0 && (
            <div className="grid grid-cols-[3fr_2fr_2fr_2fr_1fr] bg-gray-100 p-3 border-t-2 border-gray-200 text-sm items-center">
                <div className="text-right pr-2 font-bold text-gray-600 text-xs uppercase">Разом:</div>
                <div className="font-bold text-green-700 text-center text-base leading-none">
                    {sumIncome} <span className="text-[10px] font-normal block text-green-600">грн</span>
                </div>
                
                {/* Сума тільки оплачених витрат */}
                <div className="font-bold text-red-700 text-center text-base leading-none">
                    {sumExpense} <span className="text-[10px] font-normal block text-red-600">грн</span>
                </div>

                <div className="font-bold text-gray-700 text-center text-base leading-none">
                    {sumWriteoff} <span className="text-[10px] font-normal block text-gray-500">грн</span>
                </div>
                <div></div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}