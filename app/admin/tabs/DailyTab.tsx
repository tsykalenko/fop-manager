"use client";

import { useState } from "react";
import { Transaction } from "../../types";

interface Props {
  date: string;
  items: Transaction[];
  userId?: string | null; // ID того, хто додає
  onUpdate: () => void;   // Функція оновлення списку
  // Пропси для статусу дня (адмінські)
  dayStatus?: string;
  updateStatus?: (s: string) => void;
  toggleDayStatus?: () => void;
  loading?: boolean;
  prevDayDebt?: number;
}

export default function DailyTab({ 
  date, items, userId, onUpdate, 
  dayStatus, updateStatus, toggleDayStatus, loading: parentLoading, prevDayDebt 
}: Props) {
  
  // --- ЛОГІКА ФОРМИ ---
  const [mode, setMode] = useState<"trade" | "cash_drop">("trade");
  const [title, setTitle] = useState("");
  const [income, setIncome] = useState("");
  const [expense, setExpense] = useState("");
  const [writeoff, setWriteoff] = useState("");
  const [method, setMethod] = useState("Готівка");
  const [status, setStatus] = useState<"paid" | "unpaid">("paid");
  const [localLoading, setLocalLoading] = useState(false);

  // Функція додавання (вона тепер всередині, щоб не губилась)
  const handleAdd = async () => {
    if (!userId) return alert("Помилка авторизації (немає userId)");
    if (mode === 'trade' && !title) return alert("Введіть назву товару!");
    if (mode === 'cash_drop' && !expense) return alert("Введіть суму!");

    setLocalLoading(true);
    
    const newItem = {
        date, 
        title: mode === 'trade' ? title : "💰 Здача виручки", 
        category: mode,
        income: mode === 'trade' ? Number(income) || 0 : 0, 
        expense: Number(expense) || 0,
        writeoff: mode === 'trade' ? Number(writeoff) || 0 : 0, 
        payment_method: method, 
        payment_status: status,
        admin_check: "pending", 
        author_id: userId
    };

    try {
        const res = await fetch("/api/transactions", { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(newItem) 
        });

        if (res.ok) { 
            // Чистимо форму
            setTitle(""); setIncome(""); setExpense(""); setWriteoff(""); 
            // Оновлюємо дані на сторінці
            onUpdate(); 
        } else { 
            alert("Помилка при збереженні!"); 
        }
    } catch (e) {
        console.error(e);
        alert("Помилка з'єднання");
    } finally {
        setLocalLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Видалити цей запис?")) return;
    await fetch(`/api/transactions?id=${id}`, { method: "DELETE" });
    onUpdate();
  };

  // Рахуємо суму за день
  const totalIncome = items.reduce((acc, i) => acc + (i.income || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in-up">
        
        {/* 1. БЛОК СТАТУСУ ДНЯ (Тільки якщо передані пропси - тобто для Адміна) */}
        {dayStatus && updateStatus && (
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border ${
                        dayStatus === 'verified' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                        dayStatus === 'closed' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                        'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                        {dayStatus === 'verified' ? '✅ Перевірено' : dayStatus === 'closed' ? '🔒 Закрито' : '🔓 Відкрито'}
                    </div>
                    {prevDayDebt > 0 && (
                        <div className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100">
                            Борг з минулого: -{prevDayDebt} ₴
                        </div>
                    )}
                </div>
                {/* Кнопки керування статусом */}
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => updateStatus('open')} className={`px-3 py-1 rounded-md text-xs font-bold transition ${dayStatus === 'open' ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>🔓 Відкр.</button>
                    <button onClick={() => updateStatus('closed')} className={`px-3 py-1 rounded-md text-xs font-bold transition ${dayStatus === 'closed' ? 'bg-white shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>🔒 Закр.</button>
                    <button onClick={() => updateStatus('verified')} className={`px-3 py-1 rounded-md text-xs font-bold transition ${dayStatus === 'verified' ? 'bg-white shadow text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>✅ Ок</button>
                </div>
            </div>
        )}

        {/* 2. ФОРМА ДОДАВАННЯ (ОСЬ ВОНА!) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex gap-2 mb-6 bg-slate-50 p-1 rounded-xl">
                <button onClick={() => setMode('trade')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'trade' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>📦 Продаж товару</button>
                <button onClick={() => setMode('cash_drop')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'cash_drop' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>💰 Інкасація</button>
            </div>
            
            <div className="space-y-4">
                {mode === 'trade' ? (
                    <>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Назва товару</label>
                            <input type="text" placeholder="Наприклад: Кава" value={title} onChange={e => setTitle(e.target.value)} className="w-full text-base font-medium border border-slate-200 rounded-lg py-2.5 px-3 outline-none focus:border-emerald-500 transition" />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <div><label className="text-[10px] font-bold text-emerald-600 uppercase">Дохід</label><input type="number" placeholder="0" value={income} onChange={e => setIncome(e.target.value)} className="w-full bg-emerald-50 border border-emerald-100 rounded-lg py-2.5 px-3 font-bold text-emerald-700 outline-none focus:border-emerald-500" /></div>
                            <div><label className="text-[10px] font-bold text-red-500 uppercase">Витрати</label><input type="number" placeholder="0" value={expense} onChange={e => setExpense(e.target.value)} className="w-full bg-red-50 border border-red-100 rounded-lg py-2.5 px-3 font-bold text-red-700 outline-none focus:border-red-500" /></div>
                            <div><label className="text-[10px] font-bold text-slate-400 uppercase">Списання</label><input type="number" placeholder="0" value={writeoff} onChange={e => setWriteoff(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 font-bold text-slate-600 outline-none focus:border-slate-400" /></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div><label className="text-[10px] font-bold text-slate-400 uppercase">Оплата</label><select value={method} onChange={e => setMethod(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg text-sm font-medium px-3 py-2.5 outline-none"><option>Готівка</option><option>Картка</option></select></div>
                             <div><label className="text-[10px] font-bold text-slate-400 uppercase">Статус</label><select value={status} onChange={e => setStatus(e.target.value as any)} className={`w-full border rounded-lg text-sm font-medium px-3 py-2.5 outline-none ${status === 'unpaid' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white border-slate-200'}`}><option value="paid">✅ Оплачено</option><option value="unpaid">⏳ Борг</option></select></div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8 bg-emerald-50 rounded-xl border-2 border-dashed border-emerald-200">
                        <div className="text-sm text-emerald-700 font-medium mb-2 uppercase tracking-wide">Сума вилучення з каси</div>
                        <div className="flex justify-center items-center gap-2">
                             <input autoFocus type="number" placeholder="0" value={expense} onChange={e => setExpense(e.target.value)} className="text-5xl font-black text-center w-48 outline-none text-emerald-700 placeholder-emerald-200 bg-transparent" />
                             <span className="text-3xl font-bold text-emerald-300">₴</span>
                        </div>
                    </div>
                )}
                
                <button onClick={handleAdd} disabled={localLoading || parentLoading} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold text-base shadow-lg transition mt-4 active:scale-[0.98]">
                    {localLoading ? "Збереження..." : "Додати запис"}
                </button>
            </div>
        </div>

        {/* 3. СПИСОК ОПЕРАЦІЙ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Операції</span>
                <span className="text-base font-black text-emerald-600 bg-white px-3 py-1 rounded-lg border border-emerald-100 shadow-sm">+{totalIncome} ₴</span>
            </div>
            
            <div className="divide-y divide-slate-100">
                {items.map((item) => (
                    <div key={item.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition group">
                        
                        <div className="flex flex-col gap-1 overflow-hidden mr-4">
                            <div className="font-bold text-slate-800 text-sm sm:text-base truncate">{item.title}</div>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">{item.payment_method}</span>
                                {item.admin_check === 'pending' && <span className="text-[10px] font-bold uppercase bg-orange-50 text-orange-500 px-2 py-0.5 rounded border border-orange-100">⏳ Перевірка</span>}
                                {item.admin_check === 'valid' && <span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100">✅ ОК</span>}
                                {item.admin_check === 'issue' && <span className="text-[10px] font-bold uppercase bg-red-50 text-red-500 px-2 py-0.5 rounded border border-red-100">❌ Помилка</span>}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                            <div className="text-right">
                                {item.income > 0 && <div className="text-sm sm:text-base font-black text-emerald-600">+{item.income}</div>}
                                {item.expense > 0 && <div className="text-sm sm:text-base font-bold text-red-500">-{item.expense}</div>}
                            </div>
                            
                            <div className="w-8 flex justify-end">
                                {/* Кнопка видалення: Доступна якщо запис свіжий (pending) або це адмін */}
                                {(item.admin_check !== 'valid' || dayStatus === 'open') && (
                                    <button onClick={() => handleDelete(item.id!)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {items.length === 0 && <div className="py-12 text-center text-slate-300">Список порожній</div>}
            </div>
        </div>
    </div>
  );
}