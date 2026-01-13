"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; 
import { useRouter } from "next/navigation";
import { AppHeader, TabItem } from "../components/AppHeader";
import { Transaction } from "../types";

// 🔥 Імпортуємо DailyTab (тепер він повний, з формою)
import DailyTab from "../admin/tabs/DailyTab"; // Використовуємо той самий файл, що й адмін!
import AllTab from "../admin/tabs/AllTab";
import SalaryTab from "../admin/tabs/SalaryTab";
import { ReportList } from "../reports/components/ReportList";

export default function SellerPage() {
  const [activeTab, setActiveTab] = useState<'daily' | 'all' | 'reports' | 'salary'>('daily');
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null); // 👈 ВАЖЛИВО: Нам треба ID продавця
  const router = useRouter();

  // Дані
  const [dailyItems, setDailyItems] = useState<Transaction[]>([]);
  const [historyItems, setHistoryItems] = useState<Transaction[]>([]);
  const [mySalaries, setMySalaries] = useState<any[]>([]);
  const [savedReports, setSavedReports] = useState<any[]>([]);

  // Авторизація
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id); // 👈 ЗБЕРІГАЄМО ID
      
      const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single();
      setUserName(profile?.full_name || "Продавець");
    };
    init();
  }, [router]);

  // Завантаження
  useEffect(() => {
    if (activeTab === 'daily') fetchDailyItems();
    if (activeTab === 'all') fetchHistory();
    if (activeTab === 'reports') fetchReports();
    if (activeTab === 'salary') fetchSalaries();
  }, [viewDate, activeTab]);

  async function fetchDailyItems() {
    const res = await fetch(`/api/transactions?date=${viewDate}`);
    const data = await res.json();
    if (Array.isArray(data)) setDailyItems(data);
  }
  
  async function fetchHistory() {
    const { data } = await supabase.from("transactions").select("*").order("date", { ascending: false }).limit(50);
    if (data) setHistoryItems(data as Transaction[]);
  }

  async function fetchReports() { const res = await fetch("/api/reports"); const data = await res.json(); if (Array.isArray(data)) setSavedReports(data); }
  async function fetchSalaries() { const { data } = await supabase.from("reports").select("*").eq("status", "approved").order("start_date", { ascending: false }); if (data) setMySalaries(data); }

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };

  // Оновлення для історії (Вкладка Всі)
  const updatePaymentInfo = async (id: number, field: string, value: string) => {
     await supabase.from("transactions").update({ [field]: value || null }).eq("id", id);
     fetchHistory(); // Оновити список
  };

  const sellerTabs: TabItem[] = [
    { id: 'daily', label: '📅 Денний' },
    { id: 'all', label: '🗂 Всі' },
    { id: 'reports', label: '📊 Облік' },
    { id: 'salary', label: '💰 ЗП' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <AppHeader role="seller" userName={userName} tabs={sellerTabs} activeTab={activeTab} onTabChange={setActiveTab} viewDate={viewDate} setViewDate={setViewDate} onLogout={handleLogout} />
      
      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
          
          {/* ВКЛАДКА ДЕННИЙ: ТЕПЕР З ФУНКЦІОНАЛОМ */}
          {activeTab === 'daily' && (
            <DailyTab 
                date={viewDate} 
                items={dailyItems} 
                userId={userId} // 👈 Передаємо ID, щоб знати хто додає
                onUpdate={fetchDailyItems} // 👈 Щоб список оновлювався після додавання
                // Для продавця можна не передавати dayStatus, або передати 'open'
                dayStatus="open" 
            />
          )}

          {activeTab === 'all' && <AllTab items={historyItems} updatePaymentInfo={updatePaymentInfo} isAdmin={false} />}
          {activeTab === 'reports' && <ReportList reports={savedReports} onTakeSalary={() => {}} />}
          {activeTab === 'salary' && <SalaryTab />}

      </main>
    </div>
  );
}