"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient"; 
import { useRouter } from "next/navigation";
import Link from "next/link"; 

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
  fop_name?: string | null;
  supplier_payment_date?: string | null;
}

export default function AdminPage() {
  const [items, setItems] = useState<TransactionData[]>([]);
  const [allItems, setAllItems] = useState<TransactionData[]>([]);
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'daily' | 'all' | 'reports'>('daily');

  // UI States
  const [searchDate, setSearchDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchAmount, setSearchAmount] = useState("");
  const [showUnpaidOnly, setShowUnpaidOnly] = useState(false);
  const [pendingDates, setPendingDates] = useState<string[]>([]);
  const [pendingReportsCount, setPendingReportsCount] = useState(0);

  // Reports
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [reportData, setReportData] = useState<any>(null);
  const [savedReports, setSavedReports] = useState<any[]>([]);
  
  // Salary Modal
  const [salaryModal, setSalaryModal] = useState<{ isOpen: boolean, reportId: number | null }>({ isOpen: false, reportId: null });
  const [salaryForm, setSalaryForm] = useState({ salary: "", bonus: "", fine: "", comment: "" });

  const router = useRouter();
  const dateInputRef = useRef<any>(null);

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
    fetchNotifications(); 
    if (activeTab === 'daily') fetchItems(); 
    else if (activeTab === 'all') fetchAllItems();
    else if (activeTab === 'reports') fetchSavedReports(); 
  }, [viewDate, activeTab]);

  async function fetchNotifications() {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (data.pendingDates) setPendingDates(data.pendingDates);
        if (data.pendingReportsCount !== undefined) setPendingReportsCount(data.pendingReportsCount);
      } catch (e) { console.error(e); }
  }

  async function fetchItems() {
    setLoading(true);
    const res = await fetch(`/api/transactions?date=${viewDate}`);
    const data = await res.json();
    if (Array.isArray(data)) setItems(data);
    setLoading(false);
  }

  async function fetchAllItems() {
    setLoading(true);
    const res = await fetch(`/api/transactions?limit=500`);
    const data = await res.json();
    if (Array.isArray(data)) setAllItems(data);
    setLoading(false);
  }

  async function fetchSavedReports() {
    const res = await fetch("/api/reports");
    const data = await res.json();
    if (Array.isArray(data)) setSavedReports(data);
  }

  const generateReport = async () => {
    if (!reportStartDate || !reportEndDate) return alert("Виберіть дати!");
    const res = await fetch("/api/reports", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", start_date: reportStartDate, end_date: reportEndDate })
    });
    const data = await res.json();
    setReportData(data);
  };

  const openApproveModal = async (report: any) => {
      const resSettings = await fetch("/api/salary_settings");
      const settings = await resSettings.json();
      const dailyRate = settings.daily_rate || 700;
      const percentRate = settings.percent_rate || 0.99;

      const start = new Date(report.start_date);
      const end = new Date(report.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const salaryByDays = diffDays * dailyRate;
      const salaryByPercent = report.total_expense * (percentRate / 100); 
      const autoTotal = Math.round(salaryByDays + salaryByPercent);

      setSalaryForm({ 
          salary: autoTotal.toString(), 
          bonus: "", 
          fine: "", 
          comment: `Авто: ${diffDays} днів * ${dailyRate} + ${percentRate}% від видатку` 
      });
      setSalaryModal({ isOpen: true, reportId: report.id });
  };

  const submitApproval = async () => {
      if (!salaryModal.reportId) return;
      const base = Number(salaryForm.salary) || 0;
      const bonus = Number(salaryForm.bonus) || 0;
      const fine = Number(salaryForm.fine) || 0;
      const total = base + bonus - fine;

      if (!confirm(`Затвердити виплату ${total} грн?`)) return;

      await fetch("/api/reports", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", id: salaryModal.reportId, total_salary: total, bonus: bonus, fine: fine, admin_note: salaryForm.comment })
    });

    setSalaryModal({ isOpen: false, reportId: null });
    fetchSavedReports();
    fetchNotifications();
  };

  const approveAll = async () => {
    if (!confirm("Затвердити всі операції?")) return;
    for (const item of items) {
        if (item.admin_check !== 'valid') {
            await fetch("/api/transactions", {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: item.id, admin_check: "valid" }),
            });
        }
    }
    fetchItems();
    fetchNotifications();
  };

  const updateStatus = async (id: number, newStatus: "valid" | "issue" | "pending") => {
    let comment = undefined;
    if (newStatus === 'issue') {
        const text = prompt("Опишіть помилку:");
        if (text === null) return; 
        comment = text;
    }
    await fetch("/api/transactions", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, admin_check: newStatus, admin_comment: comment }),
    });
    fetchItems();
    fetchNotifications();
  };
  
  const updatePaymentInfo = async (id: number, field: 'fop_name' | 'supplier_payment_date', value: string) => {
    await fetch("/api/transactions", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value }),
    });
    if (activeTab === 'all') fetchAllItems(); else fetchItems();
  };

  const changeDate = (days: number) => { const d = new Date(viewDate); d.setDate(d.getDate() + days); setViewDate(d.toISOString().split('T')[0]); };
  const jumpToDate = (dateStr: string) => { setViewDate(dateStr); setActiveTab('daily'); };
  const openCalendar = () => { try { dateInputRef.current?.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current?.focus(); } catch (e) {} };
  const getPrettyDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
  
  const getAutoStatus = (type: 'income' | 'expense' | 'writeoff') => {
      const relevantItems = items.filter(i => i[type] > 0);
      if (relevantItems.length === 0) return null;
      if (relevantItems.some(i => i.admin_check === 'issue')) return 'issue';
      if (relevantItems.some(i => i.admin_check === 'pending')) return 'pending';
      return 'valid';
  };

  const StatusBadge = ({ status }: { status: string | null }) => {
    if (!status) return <span className="text-gray-300 text-[10px]">-</span>;
    if (status === 'valid') return <span className="mt-1 w-full flex justify-center items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded text-[10px] font-bold uppercase border border-emerald-200">✅ Вірно</span>;
    if (status === 'issue') return <span className="mt-1 w-full flex justify-center items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded text-[10px] font-bold uppercase border border-red-200 animate-pulse">⚠️ Помилка</span>;
    return <span className="mt-1 w-full flex justify-center items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-[10px] font-bold uppercase border border-yellow-200">⏳ Очікує</span>;
  };

  const totalIncome = items.reduce((acc, i) => acc + i.income, 0);
  const totalExpense = items.reduce((acc, i) => acc + i.expense, 0);
  const totalWriteoff = items.reduce((acc, i) => acc + i.writeoff, 0);

  const filteredAllItems = allItems.filter(item => {
    const isCash = item.category === 'cash_drop';
    const isCashPayment = item.payment_method === 'Готівка';
    const isUnpaid = !isCash && !isCashPayment && !item.supplier_payment_date;
    if (showUnpaidOnly && !isUnpaid) return false;
    const matchesTitle = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = searchDate ? item.date === searchDate : true;
    const matchesAmount = searchAmount ? (item.income.toString() === searchAmount || item.expense.toString() === searchAmount) : true;
    return matchesTitle && matchesDate && matchesAmount;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-32">
       {salaryModal.isOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
               <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                   <div className="bg-emerald-600 p-4 text-white font-bold text-center text-lg">💰 Нарахування ЗП</div>
                   <div className="p-6 space-y-4">
                       <div>
                           <label className="text-xs font-bold text-gray-500 uppercase">Основна ставка (Авто)</label>
                           <input type="number" className="w-full border-b-2 border-gray-200 focus:border-emerald-500 outline-none py-2 text-xl font-bold text-gray-800"
                            value={salaryForm.salary} onChange={e => setSalaryForm({...salaryForm, salary: e.target.value})}
                           />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="text-xs font-bold text-emerald-600 uppercase">Бонус (+)</label>
                               <input type="number" placeholder="0" className="w-full border-b-2 border-gray-200 focus:border-emerald-500 outline-none py-1 font-bold text-emerald-600"
                                value={salaryForm.bonus} onChange={e => setSalaryForm({...salaryForm, bonus: e.target.value})}
                               />
                           </div>
                           <div>
                               <label className="text-xs font-bold text-red-600 uppercase">Штраф (-)</label>
                               <input type="number" placeholder="0" className="w-full border-b-2 border-gray-200 focus:border-red-500 outline-none py-1 font-bold text-red-600"
                                value={salaryForm.fine} onChange={e => setSalaryForm({...salaryForm, fine: e.target.value})}
                               />
                           </div>
                       </div>
                       <div>
                           <label className="text-xs font-bold text-gray-400 uppercase">Коментар</label>
                           <input type="text" className="w-full border border-gray-200 rounded p-2 text-sm outline-none"
                            value={salaryForm.comment} onChange={e => setSalaryForm({...salaryForm, comment: e.target.value})}
                           />
                       </div>
                       <div className="pt-2 border-t flex justify-between items-center text-slate-800 font-bold">
                           <span>До сплати:</span>
                           <span className="text-2xl text-emerald-700">
                               {(Number(salaryForm.salary) + Number(salaryForm.bonus) - Number(salaryForm.fine)).toLocaleString()} ₴
                           </span>
                       </div>
                   </div>
                   <div className="grid grid-cols-2">
                       <button onClick={() => setSalaryModal({isOpen: false, reportId: null})} className="bg-gray-100 py-3 font-bold">Скасувати</button>
                       <button onClick={submitApproval} className="bg-emerald-600 text-white py-3 font-bold">Затвердити</button>
                   </div>
               </div>
           </div>
       )}

      <header className="bg-emerald-600 text-white py-4 shadow-md mb-4 rounded-b-3xl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center px-4 gap-4">
            <div className="flex items-center gap-3">
                 <h1 className="font-bold text-xl">🛡 Адмінка</h1>
                 <Link href="/admin/salary" className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold border border-white/20">💰 Налаштування</Link>
            </div>
            
            <div className="flex bg-emerald-800/30 p-1 rounded-lg">
                <button onClick={() => setActiveTab('daily')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition relative ${activeTab === 'daily' ? 'bg-white text-emerald-700' : 'text-emerald-100'}`}>
                    📅 Денний {pendingDates.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{pendingDates.length}</span>}
                </button>
                <button onClick={() => setActiveTab('all')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${activeTab === 'all' ? 'bg-white text-emerald-700' : 'text-emerald-100'}`}>📑 Всі</button>
                <button onClick={() => setActiveTab('reports')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition relative ${activeTab === 'reports' ? 'bg-white text-emerald-700' : 'text-emerald-100'}`}>
                    📊 Звіти {pendingReportsCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{pendingReportsCount}</span>}
                </button>
            </div>

            {activeTab === 'daily' && (
                <div className="flex items-center gap-3">
                    <button onClick={() => changeDate(-1)} className="text-xl font-bold">‹</button>
                    <div onClick={openCalendar} className="bg-white/10 px-4 py-1 rounded-full border border-white/20 cursor-pointer text-center">
                        <div className="text-[10px] uppercase font-bold opacity-60">Дата</div>
                        <div className="font-bold">{getPrettyDate(viewDate)}</div>
                        <input ref={dateInputRef} type="date" value={viewDate} onChange={(e) => setViewDate(e.target.value)} className="hidden" />
                    </div>
                    <button onClick={() => changeDate(1)} className="text-xl font-bold">›</button>
                </div>
            )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 space-y-4">
        {pendingDates.length > 0 && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex flex-wrap gap-2 items-center">
                <span className="text-red-700 font-bold text-sm">🔔 Перевірити:</span>
                {pendingDates.map(date => (<button key={date} onClick={() => jumpToDate(date)} className="bg-white border border-red-200 px-3 py-1 rounded-full text-xs font-bold text-red-600">{getPrettyDate(date)}</button>))}
            </div>
        )}

        {activeTab === 'daily' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="hidden md:grid grid-cols-[100px_3fr_1fr_1fr_1fr_100px] bg-slate-50 p-3 border-b text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <div className="text-center">Статус</div>
                    <div className="pl-2">Операція</div>
                    <div className="text-center">Дохід</div>
                    <div className="text-center">Витрата</div>
                    <div className="text-center">Списання</div>
                    <div className="text-center">Дія</div>
                </div>
                <div className="divide-y divide-slate-100">
                    {items.map(item => {
                        const isCash = item.category === 'cash_drop';
                        return (
                            <div key={item.id} className={`flex flex-col md:grid md:grid-cols-[100px_3fr_1fr_1fr_1fr_100px] p-4 md:p-3 items-center text-sm ${item.admin_check === 'valid' ? 'bg-emerald-50/30' : item.admin_check === 'issue' ? 'bg-orange-50/30' : ''}`}>
                                <div className="text-center mb-2 md:mb-0">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${item.admin_check === 'valid' ? 'bg-emerald-100 text-emerald-700' : item.admin_check === 'issue' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {item.admin_check === 'valid' ? 'Вірно' : item.admin_check === 'issue' ? 'Помилка' : 'Чекає'}
                                    </span>
                                </div>
                                <div className="pl-2 w-full">
                                    <div className={`font-bold ${isCash ? 'text-blue-700' : 'text-slate-800'}`}>{item.title}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase flex gap-2">
                                        👤 {(item as any).profiles?.full_name} 
                                        {item.payment_status === 'unpaid' && <span className="text-red-500">🔴 Борг</span>}
                                    </div>
                                    {item.admin_comment && <div className="mt-1 text-xs text-red-600 italic">🛡 {item.admin_comment}</div>}
                                </div>
                                <div className="grid grid-cols-3 md:contents w-full mt-2 md:mt-0 text-center font-bold">
                                    <div className="text-emerald-600">{item.income || '-'}</div>
                                    <div className="text-red-500">{item.expense || '-'}</div>
                                    <div className="text-slate-400">{item.writeoff || '-'}</div>
                                </div>
                                <div className="flex gap-2 justify-center mt-3 md:mt-0">
                                    <button onClick={() => updateStatus(item.id!, 'valid')} className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold hover:bg-emerald-600 hover:text-white transition">✔</button>
                                    <button onClick={() => updateStatus(item.id!, 'issue')} className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold hover:bg-orange-600 hover:text-white transition">?</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {items.length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-[100px_3fr_1fr_1fr_1fr_100px] p-4 bg-slate-50 border-t-2 border-slate-200">
                        <div className="hidden md:block"></div>
                        <div className="hidden md:flex items-center justify-end pr-4 text-[10px] font-bold text-slate-400 uppercase">Підсумок:</div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-emerald-700 font-black">{totalIncome}</span>
                            <StatusBadge status={getAutoStatus('income')} />
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-red-600 font-black">{totalExpense}</span>
                            <StatusBadge status={getAutoStatus('expense')} />
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-slate-600 font-black">{totalWriteoff}</span>
                            <StatusBadge status={getAutoStatus('writeoff')} />
                        </div>
                        <div className="hidden md:flex justify-center items-center">
                            <button onClick={approveAll} className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-2 rounded-lg shadow-sm">ВСЕ ОК</button>
                        </div>
                    </div>
                )}
            </div>
        )}

        {activeTab === 'all' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-3 border-b flex flex-wrap gap-2 items-center bg-slate-50">
                    <input type="text" placeholder="Пошук..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="text-sm border rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-auto" />
                    <input type="date" value={searchDate} onChange={e => setSearchDate(e.target.value)} className="text-sm border rounded-lg px-3 py-1.5 outline-none" />
                    <button onClick={() => setShowUnpaidOnly(!showUnpaidOnly)} className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${showUnpaidOnly ? 'bg-red-500 text-white border-red-600' : 'bg-white text-slate-600'}`}>🔴 Борги</button>
                </div>
                <div className="overflow-x-auto">
                    <div className="min-w-[1000px]">
                        <div className="grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_1fr_100px_130px] bg-slate-100 p-3 text-[10px] font-bold text-slate-500 uppercase">
                            <div>Дата</div><div>Назва</div><div className="text-center">Дохід</div><div className="text-center">Витрата</div><div className="text-center">Спис.</div><div className="text-center">% Маржа</div><div className="text-center">Оплата</div><div className="text-center">ФОП</div><div className="text-center">Дата сплати</div>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {filteredAllItems.map(item => {
                                const isCash = item.category === 'cash_drop';
                                const totalCost = item.expense + item.writeoff;
                                const margin = (!isCash && item.income > 0) ? (((item.income - totalCost) / item.income) * 100).toFixed(0) : '-';
                                const isUnpaid = !isCash && item.payment_method !== 'Готівка' && !item.supplier_payment_date;
                                return (
                                    <div key={item.id} className={`grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_1fr_100px_130px] p-2 items-center text-xs ${isUnpaid ? 'bg-red-50' : ''}`}>
                                        <div className="text-slate-400">{new Date(item.date).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })}</div>
                                        <div className="font-bold truncate pr-2">{item.title}</div>
                                        <div className="text-center font-bold text-emerald-600">{item.income || '-'}</div>
                                        <div className="text-center font-bold text-red-500">{item.expense || '-'}</div>
                                        <div className="text-center text-slate-400">{item.writeoff || '-'}</div>
                                        <div className="text-center font-bold text-slate-500">{margin}{margin !== '-' && '%'}</div>
                                        <div className="text-center uppercase text-[9px] font-black tracking-tighter">{item.payment_method}</div>
                                        <div className="px-1"><select value={item.fop_name || ""} onChange={e => updatePaymentInfo(item.id!, 'fop_name', e.target.value)} className="w-full text-[10px] border rounded bg-white p-1"><option value="">-</option><option value="ТВ">ТВ</option><option value="ВМ">ВМ</option></select></div>
                                        <div className="px-1"><input type="date" value={item.supplier_payment_date || ""} onChange={e => updatePaymentInfo(item.id!, 'supplier_payment_date', e.target.value)} className="w-full text-[10px] border rounded p-1" /></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'reports' && (
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="font-bold mb-4">Перевірити період</h2>
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[150px]"><div className="text-[10px] font-bold uppercase text-slate-400 mb-1">З дати</div><input type="date" value={reportStartDate} onChange={e => setReportStartDate(e.target.value)} className="w-full border rounded-lg p-2" /></div>
                        <div className="flex-1 min-w-[150px]"><div className="text-[10px] font-bold uppercase text-slate-400 mb-1">По дату</div><input type="date" value={reportEndDate} onChange={e => setReportEndDate(e.target.value)} className="w-full border rounded-lg p-2" /></div>
                        <button onClick={generateReport} className="bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg">Сформувати</button>
                    </div>
                </div>
                <div className="space-y-3">
                    <h2 className="font-bold text-slate-800">Звіти продавців</h2>
                    {savedReports.map(report => (
                        <div key={report.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex gap-4 items-center">
                                <span className={`text-xl ${report.status === 'approved' ? 'grayscale-0' : 'grayscale'}`}>✅</span>
                                <div>
                                    <div className="font-bold">{getPrettyDate(report.start_date)} — {getPrettyDate(report.end_date)}</div>
                                    <div className="text-[10px] uppercase font-bold text-slate-400">👤 {report.profiles?.full_name}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="text-center"><div className="text-[10px] uppercase font-bold text-slate-400">Витрата</div><div className="font-bold text-red-600">{report.total_expense}</div></div>
                                {report.status === 'pending' ? (
                                    <button onClick={() => openApproveModal(report)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm">Затвердити</button>
                                ) : (
                                    <div className="text-right"><span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded uppercase">Готово</span><div className="text-xs font-bold text-slate-500 mt-1">ЗП: {report.total_salary} ₴</div></div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </main>
    </div>
  );
}