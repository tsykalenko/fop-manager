"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient"; 
import { useRouter } from "next/navigation";
import { TransactionData, SalarySettings } from "./types";
import DailyTab from "./tabs/DailyTab";
import AllTab from "./tabs/AllTab";
import ReportsTab from "./tabs/ReportsTab";
import SalaryTab from "./tabs/SalaryTab";
import SalaryModal from "./tabs/SalaryModal";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'daily' | 'all' | 'reports' | 'salary'>('daily');
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<TransactionData[]>([]);
  const [allItems, setAllItems] = useState<TransactionData[]>([]);
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [salarySettings, setSalarySettings] = useState<SalarySettings>({ daily_rate: 700, percent_rate: 0.99 });
  const [pendingDates, setPendingDates] = useState<string[]>([]);
  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  const router = useRouter();
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (data?.role !== 'admin') router.push("/");
    };
    init();
  }, [router]);

  useEffect(() => {
    fetchNotifications();
    fetchSalarySettings();
    if (activeTab === 'daily') fetchItems();
    if (activeTab === 'all') fetchAllItems();
    if (activeTab === 'reports' || activeTab === 'salary') fetchSavedReports();
    // eslint-disable-next-line
  }, [viewDate, activeTab]);

  // --- Data Fetching ---
  const fetchItems = async () => { const res = await fetch(`/api/transactions?date=${viewDate}`); setItems(await res.json()); };
  const fetchAllItems = async () => { const res = await fetch(`/api/transactions?limit=500`); setAllItems(await res.json()); };
  const fetchSavedReports = async () => { const res = await fetch("/api/reports"); setSavedReports(await res.json()); };
  const fetchSalarySettings = async () => { const res = await fetch("/api/salary_settings"); const data = await res.json(); if(data.daily_rate) setSalarySettings(data); };
  const fetchNotifications = async () => { try { const res = await fetch("/api/notifications"); const data = await res.json(); setPendingDates(data.pendingDates); setPendingReportsCount(data.pendingReportsCount); } catch (e) {} };

  // --- Actions ---
  const updateStatus = async (id: number, status: any) => {
      let comment = undefined;
      if (status === 'issue') {
          const text = prompt("Опишіть помилку:");
          if (text === null) return;
          comment = text;
      }
      await fetch("/api/transactions", { method: "PATCH", headers: {"Content-Type": "application/json"}, body: JSON.stringify({id, admin_check: status, admin_comment: comment}) });
      fetchItems(); fetchNotifications();
  };

  const approveAll = async () => {
      if(!confirm("Затвердити все?")) return;
      for(const item of items) { if(item.admin_check !== 'valid') await fetch("/api/transactions", { method: "PATCH", headers: {"Content-Type": "application/json"}, body: JSON.stringify({id: item.id, admin_check: 'valid'}) }); }
      fetchItems(); fetchNotifications();
  };

  const updatePaymentInfo = async (id: number, field: string, value: string) => {
      await fetch("/api/transactions", { method: "PATCH", headers: {"Content-Type": "application/json"}, body: JSON.stringify({id, [field]: value}) });
      fetchAllItems();
  };

  const generateReport = async (start: string, end: string) => {
      if(!start || !end) { alert("Дати!"); return null; }
      const res = await fetch("/api/reports", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({action: "generate", start_date: start, end_date: end}) });
      return await res.json();
  };

  const saveSettings = async (s: SalarySettings) => {
      await fetch("/api/salary_settings", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(s) });
      alert("Збережено!");
  };

  // --- Salary Modal Logic ---
  const openApproveModal = (report: any) => {
      const start = new Date(report.start_date);
      const end = new Date(report.end_date);
      const days = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const salary = Math.round((days * salarySettings.daily_rate) + (report.total_expense * (salarySettings.percent_rate / 100)));
      
      setModalData({ salary, comment: `Авто: ${days} дн * ${salarySettings.daily_rate} + ${salarySettings.percent_rate}%` });
      setSelectedReportId(report.id);
      setModalOpen(true);
  };

  const confirmApproval = async (formData: any) => {
      await fetch("/api/reports", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ action: "approve", id: selectedReportId, total_salary: formData.total, bonus: formData.bonus, fine: formData.fine, admin_note: formData.comment }) });
      setModalOpen(false);
      fetchSavedReports(); fetchNotifications();
  };

  // --- UI Helpers ---
  const changeDate = (d: number) => { const date = new Date(viewDate); date.setDate(date.getDate() + d); setViewDate(date.toISOString().split('T')[0]); };
  const openCal = () => { try { (dateInputRef.current as any)?.showPicker ? (dateInputRef.current as any).showPicker() : dateInputRef.current?.focus(); } catch(e){} };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-32">
        <SalaryModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onConfirm={confirmApproval} initialData={modalData} />

        {/* HEADER */}
        <header className="bg-emerald-600 text-white py-4 shadow-md mb-4 rounded-b-[2rem]">
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-[200px_1fr_200px] gap-4 items-center">
                <div className="flex justify-center md:justify-start"><h1 className="font-bold text-xl flex items-center gap-2">🛡 Адмінка</h1></div>
                <div className="flex justify-center"><div className="flex bg-emerald-800/30 p-1 rounded-lg backdrop-blur-sm relative">
                    <button onClick={() => setActiveTab('daily')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${activeTab === 'daily' ? 'bg-white text-emerald-700' : 'text-emerald-100'}`}>📅 Денний {pendingDates.length > 0 && <span className="text-red-500 bg-white ml-1 px-1 rounded-full text-[10px]">{pendingDates.length}</span>}</button>
                    <button onClick={() => setActiveTab('all')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${activeTab === 'all' ? 'bg-white text-emerald-700' : 'text-emerald-100'}`}>📑 Всі</button>
                    <button onClick={() => setActiveTab('reports')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${activeTab === 'reports' ? 'bg-white text-emerald-700' : 'text-emerald-100'}`}>📊 Звіти {pendingReportsCount > 0 && <span className="text-red-500 bg-white ml-1 px-1 rounded-full text-[10px]">{pendingReportsCount}</span>}</button>
                    <button onClick={() => setActiveTab('salary')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${activeTab === 'salary' ? 'bg-white text-emerald-700' : 'text-emerald-100'}`}>💰 ЗП</button>
                </div></div>
                <div className="flex justify-center md:justify-end min-h-[40px]">
                    {activeTab === 'daily' && <div className="flex items-center gap-4"><button onClick={() => changeDate(-1)} className="text-2xl font-bold opacity-70">‹</button><div onClick={openCal} className="bg-white/10 px-4 py-1 rounded-full cursor-pointer text-center border border-white/20"><div className="text-[10px] opacity-60">ДАТА</div><div className="font-bold">{new Date(viewDate).toLocaleDateString('uk-UA')}</div><input ref={dateInputRef} type="date" value={viewDate} onChange={e => setViewDate(e.target.value)} className="hidden" /></div><button onClick={() => changeDate(1)} className="text-2xl font-bold opacity-70">›</button></div>}
                </div>
            </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="max-w-6xl mx-auto px-4 space-y-4">
            {pendingDates.length > 0 && <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex gap-2 items-center text-red-700 font-bold text-sm">🔔 Перевірити: {pendingDates.map(d => <button key={d} onClick={() => { setViewDate(d); setActiveTab('daily'); }} className="bg-white px-2 rounded border border-red-300 text-xs">{new Date(d).toLocaleDateString('uk-UA', {day:'numeric', month:'short'})}</button>)}</div>}
            
            {activeTab === 'daily' && <DailyTab items={items} updateStatus={updateStatus} approveAll={approveAll} />}
            {activeTab === 'all' && <AllTab items={allItems} updatePaymentInfo={updatePaymentInfo} />}
            {activeTab === 'reports' && <ReportsTab savedReports={savedReports} onGenerate={generateReport} onApproveClick={openApproveModal} />}
            {activeTab === 'salary' && <SalaryTab settings={salarySettings} onSave={saveSettings} history={savedReports} />}
        </main>
    </div>
  );
}