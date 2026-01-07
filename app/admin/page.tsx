"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient"; 
import { useRouter } from "next/navigation";

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

export default function AdminPage() {
  const [items, setItems] = useState<TransactionData[]>([]);
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dateInputRef = useRef<any>(null);

  const [dayStatus, setDayStatus] = useState({
    income_status: "pending", expense_status: "pending", writeoff_status: "pending"
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profile?.role !== 'admin') router.push("/");
    };
    checkUser();
  }, [router]);

  useEffect(() => { 
    fetchItems(); 
    fetchDayStatus();
  }, [viewDate]);

  async function fetchItems() {
    setLoading(true);
    const res = await fetch(`/api/transactions?date=${viewDate}`);
    const data = await res.json();
    if (Array.isArray(data)) setItems(data);
    setLoading(false);
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

  const toggleCol = async (col: "income_status" | "expense_status" | "writeoff_status") => {
    const current = dayStatus[col];
    let next = "pending";
    if (current === "pending") next = "valid";
    else if (current === "valid") next = "issue";
    else if (current === "issue") next = "pending";

    setDayStatus(prev => ({ ...prev, [col]: next }));

    await fetch("/api/day_status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: viewDate, type: col, status: next })
    });
  };

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

  const updateStatus = async (id: number, newStatus: "valid" | "issue" | "pending") => {
    let comment = undefined;
    if (newStatus === 'issue') {
        const text = prompt("Опишіть помилку (або залиште пустим):");
        if (text === null) return; 
        comment = text;
    }
    setItems(items.map(i => i.id === id ? { ...i, admin_check: newStatus, admin_comment: comment !== undefined ? comment : i.admin_comment } : i));
    await fetch("/api/transactions", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, admin_check: newStatus, admin_comment: comment }),
    });
  };

  const approveAll = async () => {
    if (!confirm("Затвердити всі операції?")) return;
    setItems(items.map(i => ({ ...i, admin_check: "valid" }))); 
    // Тут ми не очищаємо коментарі масово, щоб зберегти історію, але статус міняємо
    for (const item of items) {
        if (item.admin_check !== 'valid') {
            await fetch("/api/transactions", {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: item.id, admin_check: "valid" }),
            });
        }
    }
  };

  const totalIncome = items.reduce((acc, i) => acc + i.income, 0);
  const totalExpense = items.reduce((acc, i) => acc + i.expense, 0);
  const totalWriteoff = items.reduce((acc, i) => acc + i.writeoff, 0);
  
  // Responsive grid logic: Table on MD+, Cards on Mobile
  const desktopGrid = "md:grid md:grid-cols-[100px_3fr_1fr_1fr_1fr_100px]";

  const StatusButton = ({ status, onClick }: { status: string, onClick: () => void }) => {
    if (status === 'valid') return <button onClick={onClick} className="mt-1 w-full md:w-auto flex justify-center items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded text-[10px] font-bold uppercase border border-emerald-200 shadow-sm hover:bg-emerald-200 transition">✅ Вірно</button>;
    if (status === 'issue') return <button onClick={onClick} className="mt-1 w-full md:w-auto flex justify-center items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-[10px] font-bold uppercase border border-yellow-200 shadow-sm hover:bg-yellow-200 transition">⚠️ Помилка</button>;
    return <button onClick={onClick} className="mt-1 w-full md:w-auto flex justify-center items-center gap-1 bg-gray-100 text-gray-500 px-3 py-1 rounded text-[10px] font-bold uppercase border border-gray-200 hover:bg-gray-200 transition">❔ Перевірити</button>;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-32">
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 shadow-md mb-4 relative rounded-b-[2rem]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center px-4 gap-4 relative z-10">
            <h1 className="font-bold text-xl flex items-center gap-2 opacity-90">🛡 Кабінет Власника</h1>
            <div className="flex items-center gap-4">
                <button onClick={() => changeDate(-1)} className="text-2xl font-bold opacity-70 hover:opacity-100 transition p-1">‹</button>
                <div onClick={openCalendar} className="group flex flex-col items-center cursor-pointer bg-white/10 hover:bg-white/20 transition px-6 py-1 rounded-full border border-white/20 backdrop-blur-sm select-none min-w-[140px]">
                    <div className="text-[10px] text-emerald-100 uppercase font-bold tracking-widest leading-none mb-0.5">{new Date(viewDate).getFullYear()}</div>
                    <div className="text-lg font-bold capitalize whitespace-nowrap leading-none pb-0.5">{getPrettyDate(viewDate)}</div>
                    <input ref={dateInputRef} type="date" value={viewDate} onChange={(e) => setViewDate(e.target.value)} className="absolute opacity-0 w-0 h-0" />
                </div>
                <button onClick={() => changeDate(1)} className="text-2xl font-bold opacity-70 hover:opacity-100 transition p-1">›</button>
            </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-2 md:px-4 space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            
            {/* Header only for Desktop */}
            <div className={`hidden ${desktopGrid} bg-gray-50 p-3 border-b text-[10px] font-bold text-gray-500 uppercase tracking-wider items-center sticky top-0 z-10`}>
                <div className="text-center">Статус</div>
                <div className="pl-2">Опис операції</div>
                <div className="text-center text-emerald-600">Дохід</div>
                <div className="text-center text-red-600">Витрата</div>
                <div className="text-center text-slate-500">Спис.</div>
                <div className="text-center">Дія</div>
            </div>

            <div className="divide-y">
                {items.map(item => {
                    const isCash = item.category === 'cash_drop';
                    let rowBg = "bg-white";
                    if (item.admin_check === 'valid') rowBg = "bg-emerald-50/40"; 
                    if (item.admin_check === 'issue') rowBg = "bg-yellow-50/40";

                    return (
                        <div key={item.id} className={`flex flex-col gap-3 p-4 md:gap-0 md:p-3 md:items-center text-sm transition hover:bg-gray-50 ${desktopGrid} ${rowBg}`}>
                            
                            {/* 1. Status Row on Mobile */}
                            <div className="flex justify-between items-center md:justify-center w-full">
                                <span className="md:hidden text-xs font-bold text-gray-400">Статус:</span>
                                {item.admin_check === 'pending' && <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-gray-300">На перевірці</span>}
                                {item.admin_check === 'valid' && <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-emerald-200">Вірно</span>}
                                {item.admin_check === 'issue' && <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-yellow-200">Не вірно</span>}
                            </div>

                            {/* 2. Title & Comments */}
                            <div className="pl-0 md:pl-2 md:pr-2">
                                <div className={`font-bold text-base md:text-sm ${isCash ? 'text-blue-700' : 'text-slate-700'}`}>{item.title}</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase flex flex-wrap items-center gap-1 mt-0.5">
                                    👤 {(item as any).profiles?.full_name || "Невідомий"}
                                    {item.payment_status === 'unpaid' && <span className="text-red-500 bg-red-100 px-1 rounded ml-1">БОРГ</span>}
                                </div>
                                {item.admin_comment && <div className="mt-1 text-[11px] text-red-600 bg-red-50 p-1 rounded border border-red-100 font-medium">🛡 {item.admin_comment}</div>}
                                {item.seller_comment && <div className="mt-1 text-[11px] text-blue-600 bg-blue-50 p-1 rounded border border-blue-100 font-medium">👤 {item.seller_comment}</div>}
                            </div>

                            {/* 3. Financials (Grid on Mobile) */}
                            <div className="grid grid-cols-3 gap-2 md:contents w-full">
                                <div className="flex flex-col items-center md:block">
                                    <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase">Дохід</span>
                                    <div className="text-center font-bold text-emerald-600 text-lg md:text-sm">{!isCash && item.income > 0 ? item.income : <span className="text-gray-300">-</span>}</div>
                                </div>
                                <div className="flex flex-col items-center md:block">
                                    <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase">Витрата</span>
                                    <div className="text-center font-bold text-red-500 text-lg md:text-sm">{item.expense > 0 ? item.expense : <span className="text-gray-300">-</span>}</div>
                                </div>
                                <div className="flex flex-col items-center md:block">
                                    <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase">Спис.</span>
                                    <div className="text-center font-bold text-slate-400 text-lg md:text-sm">{!isCash && item.writeoff > 0 ? item.writeoff : <span className="text-gray-300">-</span>}</div>
                                </div>
                            </div>

                            {/* 4. Actions (Buttons row on mobile) */}
                            <div className="flex justify-end gap-2 md:justify-center w-full border-t border-gray-100 pt-2 md:border-0 md:pt-0">
                                <button onClick={() => updateStatus(item.id!, 'valid')} className={`flex-1 md:flex-none md:w-8 h-8 rounded-lg flex items-center justify-center transition ${item.admin_check === 'valid' ? 'bg-emerald-600 text-white shadow' : 'bg-gray-100 text-gray-400 hover:text-emerald-600'}`}>✔</button>
                                <button onClick={() => updateStatus(item.id!, 'issue')} className={`flex-1 md:flex-none md:w-8 h-8 rounded-lg flex items-center justify-center transition ${item.admin_check === 'issue' ? 'bg-orange-500 text-white shadow' : 'bg-gray-100 text-gray-400 hover:text-orange-600'}`}>?</button>
                            </div>
                        </div>
                    );
                })}
                {items.length === 0 && <div className="p-10 text-center text-gray-400">В цей день записів немає</div>}
            </div>

            {items.length > 0 && (
                <div className={`grid grid-cols-3 md:grid-cols-[100px_3fr_1fr_1fr_1fr_100px] bg-white border-t-2 border-slate-200 p-3 items-start gap-4 md:gap-0 sticky bottom-0 z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]`}>
                    <div className="hidden md:block"></div>
                    <div className="hidden md:block pl-2 pt-1 text-xs font-bold text-slate-500 uppercase text-right pr-4">Всього:</div>
                    
                    <div className="flex flex-col items-center">
                        <span className="md:hidden text-[10px] text-gray-400 font-bold uppercase mb-1">Дохід</span>
                        <div className="font-black text-emerald-700 text-sm">{totalIncome} ₴</div>
                        <StatusButton status={dayStatus.income_status} onClick={() => toggleCol('income_status')} />
                    </div>
                    
                    <div className="flex flex-col items-center">
                         <span className="md:hidden text-[10px] text-gray-400 font-bold uppercase mb-1">Витрата</span>
                        <div className="font-black text-red-600 text-sm">{totalExpense} ₴</div>
                        <StatusButton status={dayStatus.expense_status} onClick={() => toggleCol('expense_status')} />
                    </div>
                    
                    <div className="flex flex-col items-center">
                        <span className="md:hidden text-[10px] text-gray-400 font-bold uppercase mb-1">Списання</span>
                        <div className="font-black text-slate-600 text-sm">{totalWriteoff} ₴</div>
                        <StatusButton status={dayStatus.writeoff_status} onClick={() => toggleCol('writeoff_status')} />
                    </div>
                    
                    <div className="hidden md:block text-center">
                         <button onClick={approveAll} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-2 px-3 rounded shadow active:scale-95 transition">ВСЕ ОК</button>
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}