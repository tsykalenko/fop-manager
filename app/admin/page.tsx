"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { AppHeader, TabItem } from "../components/AppHeader";
import { Transaction } from "../types";

// Імпорти вкладок
import DailyTab from "./tabs/DailyTab";
import AllTab from "./tabs/AllTab";
import SalaryTab from "./tabs/SalaryTab";
import { ReportList } from "../reports/components/ReportList"; 

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'daily' | 'all' | 'reports' | 'salary'>('daily');
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [userName, setUserName] = useState<string | null>(null);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [dayStatus, setDayStatus] = useState<string>('open');
  const [loading, setLoading] = useState(false);
  const [prevDayDebt, setPrevDayDebt] = useState(0);
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [pendingDates, setPendingDates] = useState<string[]>([]);
  const [pendingReportsCount, setPendingReportsCount] = useState(0);

  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single();
      if (profile?.role !== 'admin') { router.push("/"); return; }
      setUserName(profile?.full_name || "Власник");
      fetchNotifications();
    };
    init();
  }, [router]);

  useEffect(() => {
    if (activeTab === 'daily') fetchDayData();
    if (activeTab === 'all') fetchAllData();
    if (activeTab === 'reports') fetchReports();
  }, [viewDate, activeTab]);

  async function fetchDayData() {
    setLoading(true);
    const { data: trans } = await supabase.from("transactions").select("*").eq("date", viewDate).order("created_at", { ascending: true });
    if (trans) setTransactions(trans as Transaction[]);
    const { data: statusData } = await supabase.from("day_status").select("status, cash_in_register").eq("date", viewDate).single();
    setDayStatus(statusData?.status || 'open');
    setPrevDayDebt(statusData?.cash_in_register || 0);
    setLoading(false);
  }

  async function fetchAllData() { const { data } = await supabase.from("transactions").select("*").order("date", { ascending: false }); if (data) setAllTransactions(data as Transaction[]); }
  async function fetchReports() { const res = await fetch("/api/reports"); const data = await res.json(); if (Array.isArray(data)) setSavedReports(data); }
  
  async function fetchNotifications() {
    const { data: unverified } = await supabase.from("day_status").select("date").neq("status", "verified");
    if (unverified) setPendingDates(unverified.map(d => d.date));
    const { count } = await supabase.from("reports").select("*", { count: 'exact', head: true }).eq("status", "pending");
    if (count !== null) setPendingReportsCount(count);
  }

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };
  const updateStatus = async (newStatus: string) => { await supabase.from("day_status").upsert({ date: viewDate, status: newStatus }); setDayStatus(newStatus); fetchNotifications(); };
  const toggleDayStatus = () => { if (dayStatus === 'verified') updateStatus('closed'); else if (dayStatus === 'closed') updateStatus('verified'); else updateStatus('closed'); };
  const updatePaymentInfo = async (id: number, field: string, value: string) => { await supabase.from("transactions").update({ [field]: value || null }).eq("id", id); setAllTransactions(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item)); };

  const adminTabs: TabItem[] = [
    { id: 'daily', label: '📅 Денний', count: pendingDates.length },
    { id: 'all', label: '🗂 Всі' },
    { id: 'reports', label: '📊 Облік', count: pendingReportsCount },
    { id: 'salary', label: '💰 ЗП' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <AppHeader role="admin" userName={userName} tabs={adminTabs} activeTab={activeTab} onTabChange={setActiveTab} viewDate={viewDate} setViewDate={setViewDate} onLogout={handleLogout} />
      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
         {activeTab === 'daily' && <DailyTab date={viewDate} items={transactions} updateStatus={updateStatus} dayStatus={dayStatus} toggleDayStatus={toggleDayStatus} loading={loading} prevDayDebt={prevDayDebt} />}
         {activeTab === 'all' && <AllTab items={allTransactions} updatePaymentInfo={updatePaymentInfo} isAdmin={true} />}
         {activeTab === 'salary' && <SalaryTab />}
         {activeTab === 'reports' && <ReportList reports={savedReports} onTakeSalary={() => {}} />}
      </main>
    </div>
  );
}