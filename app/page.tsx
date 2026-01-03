"use client";

import { useState, useEffect } from "react";
// 👇 ДОДАЙ ЦЕЙ РЯДОК:
import { supabase } from "@/lib/supabaseClient"; 
import { TransactionData } from "@/lib/services/transactionService";

export default function Home() {
  const [items, setItems] = useState<TransactionData[]>([]);
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  // Режим форми: "trade" (Товар) або "cash_drop" (Здача каси)
  const [mode, setMode] = useState<"trade" | "cash_drop">("trade");

  // Поля форми
  const [title, setTitle] = useState("");
  const [income, setIncome] = useState("");
  const [expense, setExpense] = useState(""); // Для каси це буде сума здачі
  const [writeoff, setWriteoff] = useState("");
  const [method, setMethod] = useState("Готівка");
  const [status, setStatus] = useState<"paid" | "unpaid">("paid");

  useEffect(() => { fetchItems(); }, [viewDate]);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions?date=${viewDate}`);
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  }

  const changeDate = (days: number) => {
    const date = new Date(viewDate);
    date.setDate(date.getDate() + days);
    setViewDate(date.toISOString().split('T')[0]);
  };

  const handleAdd = async () => {
    // Валідація
    if (mode === 'trade' && !title) return alert("Введіть назву товару!");
    if (mode === 'cash_drop' && !expense) return alert("Введіть суму, яку забираєте!");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert("Помилка! Ви не авторизовані.");
        return;
    }
    // Готуємо об'єкт (автоматично визначаємо поля залежно від режиму)
    const newItem: TransactionData = {
        date: viewDate,
        title: mode === 'trade' ? title : "💰 Здача виручки",
        category: mode,
        income: mode === 'trade' ? Number(income) || 0 : 0,
        expense: Number(expense) || 0,
        writeoff: mode === 'trade' ? Number(writeoff) || 0 : 0,
        payment_method: method,
        payment_status: status,
        admin_check: "pending",
        
        author_id: user.id // 🔥 ДОДАЄМО ID АВТОРА
    };

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });

    if (res.ok) {
      // Чистимо поля
      setTitle(""); setIncome(""); setExpense(""); setWriteoff(""); setStatus("paid");
      fetchItems();
    } else {
      alert("Помилка збереження!");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Видалити?")) return;
    await fetch(`/api/transactions?id=${id}`, { method: "DELETE" });
    fetchItems();
  };

  // --- МАТЕМАТИКА ---
  // Рахуємо чистий баланс (товарний)
  const tradeBalance = items
    .filter(i => i.category === 'trade')
    .reduce((acc, i) => acc + (i.income - (i.payment_status === 'unpaid' ? 0 : i.expense) - i.writeoff), 0);
  
  // Рахуємо скільки грошей здали в касу
  const cashDropped = items
    .filter(i => i.category === 'cash_drop')
    .reduce((acc, i) => acc + i.expense, 0);

  // Фактичний залишок в шухляді (Заробили - Здали)
  const cashInDrawer = tradeBalance - cashDropped;

  return (
    <div className="min-h-screen bg-gray-50 pb-32 font-sans text-gray-900">
      
      {/* --- ШАПКА --- */}
      <header className="bg-slate-900 text-white sticky top-0 z-20 shadow-lg">
        <div className="p-3 flex justify-between items-center">
             <button onClick={() => changeDate(-1)} className="text-2xl font-bold px-4 active:opacity-50 text-slate-400 hover:text-white">‹</button>
             <div className="flex flex-col items-center">
                <input type="date" value={viewDate} onChange={(e) => setViewDate(e.target.value)} className="bg-transparent text-white font-bold text-lg text-center outline-none cursor-pointer" />
             </div>
             <button onClick={() => changeDate(1)} className="text-2xl font-bold px-4 active:opacity-50 text-slate-400 hover:text-white">›</button>
        </div>
        
        {/* Інфо-панель */}
        <div className="bg-slate-800 p-3 grid grid-cols-2 gap-4 text-xs border-t border-slate-700">
            <div>
                <div className="text-slate-400">Заробіток за день:</div>
                <div className="font-bold text-lg text-green-400">{tradeBalance} ₴</div>
            </div>
            <div className="text-right border-l border-slate-700 pl-4">
                <div className="text-slate-400">В шухляді (після здачі):</div>
                <div className="font-bold text-lg text-white">{cashInDrawer} ₴</div>
            </div>
        </div>
      </header>

      <main className="p-3 max-w-3xl mx-auto space-y-6 mt-2">
        
        {/* --- ФОРМА ВВОДУ --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4">
          
          {/* Перемикач режиму */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setMode('trade')} className={`flex-1 py-2 rounded-md text-sm font-bold transition ${mode === 'trade' ? 'bg-white shadow text-slate-900' : 'text-gray-500'}`}>📦 Товар</button>
            <button onClick={() => setMode('cash_drop')} className={`flex-1 py-2 rounded-md text-sm font-bold transition ${mode === 'cash_drop' ? 'bg-white shadow text-slate-900' : 'text-gray-500'}`}>💰 Здача каси</button>
          </div>

          {/* Поля для ТОВАРУ */}
          {mode === 'trade' && (
            <>
                <input type="text" placeholder="Назва товару..." value={title} onChange={e => setTitle(e.target.value)} className="w-full border-b border-gray-300 py-2 font-medium outline-none placeholder-gray-400" />
                <div className="grid grid-cols-3 gap-2">
                    <div><label className="text-[10px] text-green-600 font-bold uppercase">Дохід</label><input type="number" placeholder="0" value={income} onChange={e => setIncome(e.target.value)} className="w-full bg-green-50 rounded px-2 py-2 font-bold text-slate-700 outline-none focus:ring-1 focus:ring-green-500" /></div>
                    <div><label className="text-[10px] text-red-600 font-bold uppercase">Витрата</label><input type="number" placeholder="0" value={expense} onChange={e => setExpense(e.target.value)} className="w-full bg-red-50 rounded px-2 py-2 font-bold text-slate-700 outline-none focus:ring-1 focus:ring-red-500" /></div>
                    <div><label className="text-[10px] text-gray-500 font-bold uppercase">Спис.</label><input type="number" placeholder="0" value={writeoff} onChange={e => setWriteoff(e.target.value)} className="w-full bg-gray-100 rounded px-2 py-2 font-bold text-slate-700 outline-none focus:ring-1 focus:ring-gray-500" /></div>
                </div>
            </>
          )}

          {/* Поля для ЗДАЧІ КАСИ */}
          {mode === 'cash_drop' && (
             <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center space-y-2">
                <div className="text-sm text-blue-800 font-medium">Скільки грошей ви забираєте з каси?</div>
                <input autoFocus type="number" placeholder="0" value={expense} onChange={e => setExpense(e.target.value)} className="w-32 mx-auto text-center text-3xl font-bold bg-white border-b-2 border-blue-500 outline-none p-2 text-blue-900" />
                <div className="text-xs text-blue-400">Ця сума відніметься від залишку</div>
             </div>
          )}

          {/* Кнопка і налаштування */}
          <div className="flex gap-2 items-center pt-2">
             <select value={method} onChange={e => setMethod(e.target.value)} className="bg-gray-50 text-xs p-3 rounded-lg border outline-none font-medium"><option>💵 Готівка</option><option>💳 Картка</option></select>
             
             {mode === 'trade' && (
                <select value={status} onChange={e => setStatus(e.target.value as any)} className={`text-xs p-3 rounded-lg border outline-none font-bold ${status === 'unpaid' ? 'bg-orange-100 text-orange-700' : 'bg-gray-50'}`}><option value="paid">✅ Оплачено</option><option value="unpaid">⏳ Борг</option></select>
             )}
             
             <button onClick={handleAdd} disabled={loading} className="flex-1 bg-slate-900 text-white py-3 rounded-lg font-bold text-sm shadow-lg active:scale-95 transition hover:bg-slate-800">
               {loading ? "..." : mode === 'trade' ? "+ Додати товар" : "✔ Підтвердити здачу"}
             </button>
          </div>
        </div>

        {/* --- ТАБЛИЦЯ --- */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {items.map((item) => {
             // Стилі для статусу адміна
             let statusColor = "border-l-4 border-l-gray-300"; // pending
             if (item.admin_check === 'valid') statusColor = "border-l-4 border-l-green-500 bg-green-50/30";
             if (item.admin_check === 'issue') statusColor = "border-l-4 border-l-yellow-400 bg-yellow-50/50";
             
             // Для каси - інший вигляд
             if (item.category === 'cash_drop') {
                 return (
                    <div key={item.id} className={`p-3 flex justify-between items-center bg-blue-50/50 border-b border-blue-100 ${statusColor}`}>
                        <div className="font-bold text-blue-800 flex items-center gap-2">
                            <span>💰 Здача каси</span>
                            {item.admin_check === 'valid' && <span className="text-[10px] bg-green-100 text-green-700 px-1 rounded">Перевірено</span>}
                        </div>
                        <div className="font-bold text-lg text-blue-900">-{item.expense} ₴</div>
                        <button onClick={() => handleDelete(item.id!)} className="text-gray-300 hover:text-red-500 font-bold px-2">×</button>
                    </div>
                 )
             }

             // Для товарів
             const isUnpaid = item.payment_status === 'unpaid';
             let markupText = "";
             if (item.expense > 0) {
                 const val = (item.income - item.writeoff) / item.expense;
                 markupText = val.toFixed(2).replace('.', ',') + '%';
             }

             return (
               <div key={item.id} className={`grid grid-cols-[3fr_2fr_2fr_2fr_1fr] p-3 text-sm items-center border-b border-slate-100 ${statusColor}`}>
                  <div className="pl-2">
                      <div className="font-medium text-slate-800 truncate">{item.title}</div>
                      {markupText && <span className="text-[10px] text-slate-400">x{markupText}</span>}
                  </div>
                  <div className="text-center font-bold text-green-600">{item.income || "-"}</div>
                  <div className={`text-center font-bold ${isUnpaid ? "text-red-300" : "text-red-500"}`}>{isUnpaid ? "⏳" : ""}{item.expense || "-"}</div>
                  <div className="text-center font-bold text-slate-400">{item.writeoff || "-"}</div>
                  <div className="text-center"><button onClick={() => handleDelete(item.id!)} className="text-gray-300 hover:text-red-600 font-bold">×</button></div>
               </div>
             )
          })}
          
          {items.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">Список пустий</div>}
        </div>
      </main>
    </div>
  );
}