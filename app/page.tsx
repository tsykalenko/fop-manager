"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient"; 

interface TransactionData {
  id?: number;
  created_at?: string;
  title: string;
  category: "trade" | "cash_drop";
  income: number;
  expense: number;
  writeoff: number;
  payment_method: string;
  payment_status: "paid" | "unpaid";
  admin_check: "valid" | "issue" | "pending";
  admin_comment?: string | null;
  seller_comment?: string | null;
  author_id: string;
  date: string;
}

export default function Home() {
  const [items, setItems] = useState<TransactionData[]>([]);
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const dateInputRef = useRef<any>(null);

  const [dayStatus, setDayStatus] = useState({
    income_status: "pending", expense_status: "pending", writeoff_status: "pending"
  });

  const [mode, setMode] = useState<"trade" | "cash_drop">("trade");
  const [title, setTitle] = useState("");
  const [income, setIncome] = useState("");
  const [expense, setExpense] = useState("");
  const [writeoff, setWriteoff] = useState("");
  const [method, setMethod] = useState("Готівка");
  const [status, setStatus] = useState<"paid" | "unpaid">("paid");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<TransactionData>>({});

  useEffect(() => { 
    fetchItems();
    fetchDayStatus();
  }, [viewDate]);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions?date=${viewDate}`);
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  }

  async function fetchDayStatus() {
    const res = await fetch(`/api/day_status?date=${viewDate}`);
    const data = await res.json();
    if (data.date) {
        setDayStatus({
            income_status: data.income_status || 'pending',
            expense_status: data.expense_status || 'pending',
            writeoff_status: data.writeoff_status || 'pending'
        });
    }
  }

  const changeDate = (days: number) => {
    const date = new Date(viewDate);
    date.setDate(date.getDate() + days);
    setViewDate(date.toISOString().split('T')[0]);
  };
  const openCalendar = () => { try { dateInputRef.current?.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current?.focus(); } catch (e) {} };
  const getPrettyDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Сьогодні";
    if (date.toDateString() === yesterday.toDateString()) return "Вчора";
    return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
  };

  const handleAdd = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Помилка! Ви не авторизовані.");
    if (mode === 'trade' && !title) return alert("Введіть назву товару!");
    if (mode === 'cash_drop' && !expense) return alert("Введіть суму!");

    const newItem: TransactionData = {
        date: viewDate, title: mode === 'trade' ? title : "💰 Здача виручки", category: mode,
        income: mode === 'trade' ? Number(income) || 0 : 0, expense: Number(expense) || 0,
        writeoff: mode === 'trade' ? Number(writeoff) || 0 : 0, payment_method: method, payment_status: status,
        admin_check: "pending", author_id: user.id
    };
    const res = await fetch("/api/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newItem) });
    if (res.ok) { setTitle(""); setIncome(""); setExpense(""); setWriteoff(""); setStatus("paid"); fetchItems(); } 
    else { alert("Помилка збереження!"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Видалити запис?")) return;
    await fetch(`/api/transactions?id=${id}`, { method: "DELETE" });
    fetchItems();
  };

  const handleAddComment = async (id: number, currentComment: string | null | undefined) => {
    const text = prompt("Ваш коментар:", currentComment || "");
    if (text === null) return; 
    setItems(items.map(i => i.id === id ? { ...i, seller_comment: text } : i));
    await fetch("/api/transactions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, seller_comment: text }) });
  };

  const startEditing = (item: TransactionData) => {
    setEditingId(item.id!);
    setEditFormData({ ...item });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setItems(items.map(i => i.id === editingId ? { ...i, ...editFormData, admin_check: 'pending' } : i));
    setEditingId(null);
    await fetch("/api/transactions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...editFormData }),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const totalIncome = items.reduce((acc, i) => acc + i.income, 0);
  const totalExpense = items.reduce((acc, i) => acc + i.expense, 0);
  const totalWriteoff = items.reduce((acc, i) => acc + i.writeoff, 0);

  const getDayStatus = () => {
    if (items.length === 0) return 'empty';
    if (items.some(i => i.admin_check === 'issue')) return 'issue'; 
    if (items.some(i => i.admin_check === 'pending')) return 'pending';
    return 'valid';
  };
  const currentDayStatus = getDayStatus();

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'valid') return <span className="mt-1 inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-emerald-200">✅ Вірно</span>;
    if (status === 'issue') return <span className="mt-1 inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-yellow-200">⚠️ Помилка</span>;
    if (status === 'empty') return <span className="mt-1 inline-block bg-gray-50 text-gray-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-gray-100">-</span>;
    return <span className="mt-1 inline-block bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-gray-200">⏳ На перевірці</span>;
  };

  const gridLayout = "grid-cols-[110px_3fr_1fr_1fr_1fr_70px]";

  return (
    <div className="min-h-screen bg-gray-50 pb-32 font-sans text-gray-900">
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 shadow-md mb-6 relative rounded-b-[2rem]">
        <div className="max-w-5xl mx-auto flex justify-center items-center px-4 gap-4 relative z-10">
            <button onClick={() => changeDate(-1)} className="text-2xl font-bold opacity-70 hover:opacity-100 transition p-1">‹</button>
            <div onClick={openCalendar} className="group flex flex-col items-center cursor-pointer bg-white/10 hover:bg-white/20 transition px-6 py-1 rounded-full border border-white/20 backdrop-blur-sm select-none min-w-[140px]">
                <div className="text-[10px] text-emerald-100 uppercase font-bold tracking-widest leading-none mb-0.5">{new Date(viewDate).getFullYear()}</div>
                <div className="text-lg font-bold capitalize whitespace-nowrap leading-none pb-0.5">{getPrettyDate(viewDate)}</div>
                <input ref={dateInputRef} type="date" value={viewDate} onChange={(e) => setViewDate(e.target.value)} className="absolute opacity-0 w-0 h-0" />
            </div>
            <button onClick={() => changeDate(1)} className="text-2xl font-bold opacity-70 hover:opacity-100 transition p-1">›</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 space-y-6">
        {!editingId && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex bg-gray-100 p-1 rounded-lg">
                <button onClick={() => setMode('trade')} className={`flex-1 py-2 rounded-md text-sm font-bold transition ${mode === 'trade' ? 'bg-white shadow text-emerald-700' : 'text-gray-500'}`}>📦 Товар</button>
                <button onClick={() => setMode('cash_drop')} className={`flex-1 py-2 rounded-md text-sm font-bold transition ${mode === 'cash_drop' ? 'bg-white shadow text-emerald-700' : 'text-gray-500'}`}>💰 Здача каси</button>
            </div>
            {mode === 'trade' && (
                <>
                    <input type="text" placeholder="Назва товару..." value={title} onChange={e => setTitle(e.target.value)} className="w-full border-b border-gray-300 py-2 font-medium outline-none placeholder-gray-400 focus:border-emerald-500 transition" />
                    <div className="grid grid-cols-3 gap-2">
                        <div><label className="text-[10px] text-green-600 font-bold uppercase">Дохід</label><input type="number" placeholder="0" value={income} onChange={e => setIncome(e.target.value)} className="w-full bg-green-50 rounded px-2 py-2 font-bold text-slate-700 outline-none focus:ring-1 focus:ring-green-500" /></div>
                        <div><label className="text-[10px] text-red-600 font-bold uppercase">Витрата</label><input type="number" placeholder="0" value={expense} onChange={e => setExpense(e.target.value)} className="w-full bg-red-50 rounded px-2 py-2 font-bold text-slate-700 outline-none focus:ring-1 focus:ring-red-500" /></div>
                        <div><label className="text-[10px] text-gray-500 font-bold uppercase">Спис.</label><input type="number" placeholder="0" value={writeoff} onChange={e => setWriteoff(e.target.value)} className="w-full bg-gray-100 rounded px-2 py-2 font-bold text-slate-700 outline-none focus:ring-1 focus:ring-gray-500" /></div>
                    </div>
                </>
            )}
            {mode === 'cash_drop' && (
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 text-center space-y-2">
                    <div className="text-sm text-emerald-800 font-medium">Скільки грошей ви забираєте з каси?</div>
                    <input autoFocus type="number" placeholder="0" value={expense} onChange={e => setExpense(e.target.value)} className="w-32 mx-auto text-center text-3xl font-bold bg-white border-b-2 border-emerald-500 outline-none p-2 text-emerald-900" />
                </div>
            )}
            <div className="flex gap-2 items-center pt-2">
                <select value={method} onChange={e => setMethod(e.target.value)} className="bg-gray-50 text-xs p-3 rounded-lg border outline-none font-medium"><option>💵 Готівка</option><option>💳 Картка</option></select>
                {mode === 'trade' && <select value={status} onChange={e => setStatus(e.target.value as any)} className={`text-xs p-3 rounded-lg border outline-none font-bold ${status === 'unpaid' ? 'bg-orange-100 text-orange-700' : 'bg-gray-50'}`}><option value="paid">✅ Оплачено</option><option value="unpaid">⏳ Борг</option></select>}
                <button onClick={handleAdd} disabled={loading} className="flex-1 bg-emerald-700 text-white py-3 rounded-lg font-bold text-sm shadow-lg active:scale-95 transition hover:bg-emerald-800">{loading ? "..." : mode === 'trade' ? "+ Додати" : "✔ Підтвердити"}</button>
            </div>
            </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className={`grid ${gridLayout} bg-gray-50 p-3 border-b text-[10px] font-bold text-gray-500 uppercase tracking-wider items-center`}>
              <div className="text-center">Статус</div>
              <div className="pl-2">Опис</div>
              <div className="text-center text-emerald-600">Дохід</div>
              <div className="text-center text-red-600">Витрата</div>
              <div className="text-center text-slate-500">Спис.</div>
              <div className="text-center">Дія</div>
          </div>

          <div className="divide-y">
            {items.map((item) => {
                const isCash = item.category === 'cash_drop';
                const isEditing = editingId === item.id;
                let rowBg = "bg-white";
                if (item.admin_check === 'valid') rowBg = "bg-emerald-50/40";
                if (item.admin_check === 'issue') rowBg = "bg-yellow-50/40";
                if (isEditing) rowBg = "bg-blue-50 border-l-4 border-blue-500";
                
                return (
                  <div key={item.id} className={`grid ${gridLayout} p-3 items-center text-sm ${rowBg}`}>
                      
                      <div className="flex justify-center">
                          {isEditing ? (
                              <span className="text-blue-600 font-bold text-xs animate-pulse">✏️ Ред...</span>
                          ) : (
                              <>
                                {item.admin_check === 'pending' && <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-gray-300">На перевірці</span>}
                                {item.admin_check === 'valid' && <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-emerald-200">Вірно</span>}
                                {item.admin_check === 'issue' && <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-yellow-200">Не вірно</span>}
                              </>
                          )}
                      </div>

                      <div className="pl-2 pr-2 relative group">
                          {isEditing ? (
                              <div className="space-y-1">
                                  <input 
                                    type="text" 
                                    value={editFormData.title || ""} 
                                    onChange={e => setEditFormData({...editFormData, title: e.target.value})}
                                    className="w-full border border-blue-300 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                  {/* 👇 ТУТ ТЕПЕР МОЖНА ЗМІНИТИ І МЕТОД ОПЛАТИ */}
                                  <div className="flex gap-1">
                                    <select 
                                        value={editFormData.payment_method}
                                        onChange={e => setEditFormData({...editFormData, payment_method: e.target.value})}
                                        className="text-xs border border-blue-300 rounded px-1 py-0.5"
                                    >
                                        <option value="Готівка">💵 Готівка</option>
                                        <option value="Картка">💳 Картка</option>
                                    </select>
                                    <select 
                                        value={editFormData.payment_status}
                                        onChange={e => setEditFormData({...editFormData, payment_status: e.target.value as any})}
                                        className="text-xs border border-blue-300 rounded px-1 py-0.5"
                                    >
                                        <option value="paid">✅ Оплачено</option>
                                        <option value="unpaid">⏳ Борг</option>
                                    </select>
                                  </div>
                              </div>
                          ) : (
                              <>
                                <div className={`font-medium ${isCash ? 'text-blue-700 font-bold' : 'text-slate-800'}`}>
                                    {item.title}
                                    <button onClick={() => handleAddComment(item.id!, item.seller_comment)} className="ml-2 text-gray-300 hover:text-blue-500 transition" title="Додати коментар">💬</button>
                                </div>
                                {item.payment_status === 'unpaid' && <span className="text-[10px] text-red-500 bg-red-100 px-1 rounded font-bold uppercase">БОРГ</span>}
                                {item.admin_comment && <div className="mt-1 text-[11px] text-red-600 bg-red-50 p-1 rounded border border-red-100 font-medium">🛡 {item.admin_comment}</div>}
                                {item.seller_comment && <div className="mt-1 text-[11px] text-blue-600 bg-blue-50 p-1 rounded border border-blue-100 font-medium">👤 {item.seller_comment}</div>}
                              </>
                          )}
                      </div>

                      <div className="text-center">
                          {isEditing && !isCash ? (
                             <input type="number" value={editFormData.income} onChange={e => setEditFormData({...editFormData, income: Number(e.target.value)})} className="w-16 border border-green-300 rounded px-1 py-1 text-center font-bold text-green-700 outline-none" />
                          ) : (
                             <span className="font-bold text-emerald-600/80">{!isCash && item.income > 0 ? item.income : "-"}</span>
                          )}
                      </div>

                      <div className="text-center">
                          {isEditing ? (
                             <input type="number" value={editFormData.expense} onChange={e => setEditFormData({...editFormData, expense: Number(e.target.value)})} className="w-16 border border-red-300 rounded px-1 py-1 text-center font-bold text-red-600 outline-none" />
                          ) : (
                             <span className="font-bold text-red-500/80">{item.expense > 0 ? item.expense : "-"}</span>
                          )}
                      </div>

                      <div className="text-center">
                          {isEditing && !isCash ? (
                             <input type="number" value={editFormData.writeoff} onChange={e => setEditFormData({...editFormData, writeoff: Number(e.target.value)})} className="w-16 border border-gray-300 rounded px-1 py-1 text-center font-bold text-gray-600 outline-none" />
                          ) : (
                             <span className="font-bold text-slate-400">{!isCash && item.writeoff > 0 ? item.writeoff : "-"}</span>
                          )}
                      </div>
                      
                      <div className="text-center flex flex-col items-center gap-1">
                          {isEditing ? (
                              <>
                                <button onClick={saveEdit} className="text-green-600 hover:text-green-800 font-bold" title="Зберегти">💾</button>
                                <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600" title="Відмінити">✖</button>
                              </>
                          ) : (
                              <>
                                <button onClick={() => startEditing(item)} className="text-blue-300 hover:text-blue-600 font-bold px-2" title="Редагувати">✏️</button>
                                <button onClick={() => handleDelete(item.id!)} className="text-gray-300 hover:text-red-500 font-bold px-2" title="Видалити">×</button>
                              </>
                          )}
                      </div>
                  </div>
                )
            })}
            {items.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">Список пустий</div>}
          </div>

          {items.length > 0 && (
             <div className={`grid ${gridLayout} bg-white border-t-2 border-slate-200 p-3 items-start`}>
                <div></div>
                <div className="pl-2 pt-1 text-xs font-bold text-slate-500 uppercase text-right pr-4">Всього:</div>
                <div className="flex flex-col items-center"><div className="font-black text-emerald-700 text-sm">{totalIncome} ₴</div><StatusBadge status={dayStatus.income_status} /></div>
                <div className="flex flex-col items-center"><div className="font-black text-red-600 text-sm">{totalExpense} ₴</div><StatusBadge status={dayStatus.expense_status} /></div>
                <div className="flex flex-col items-center"><div className="font-black text-slate-600 text-sm">{totalWriteoff} ₴</div><StatusBadge status={dayStatus.writeoff_status} /></div>
                <div></div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}