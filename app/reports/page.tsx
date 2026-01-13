"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; 
import { useRouter } from "next/navigation";
import Link from "next/link";

// 👇 ЗМІНІТЬ ЦІ 3 РЯДКИ (Додайте дужки { })
import { CreateReport } from "./components/CreateReport";
import { ReportPreview } from "./components/ReportPreview";
import { ReportList } from "./components/ReportList";

export default function ReportsPage() {
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState<any>(null);
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [validationError, setValidationError] = useState<string[] | null>(null);

  useEffect(() => { checkUser(); fetchSavedReports(); }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    setUserId(user.id);
    const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single();
    setRole(profile?.role || "seller");
    setUserName(profile?.full_name || "Продавець");
  }

  async function fetchSavedReports() {
      const res = await fetch("/api/reports");
      const data = await res.json();
      if (Array.isArray(data)) setSavedReports(data);
  }

  const generateReport = async () => {
    if (!startDate || !endDate) return alert("Виберіть дати!");
    setValidationError(null);
    setReportData(null);
    
    const res = await fetch("/api/reports", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", start_date: startDate, end_date: endDate })
    });
    
    const data = await res.json();
    if (res.status === 400 && data.error === "validation_failed") {
        setValidationError(data.badDates);
        return;
    }
    if (res.ok) setReportData(data);
    else alert("Помилка сервера");
  };

  const saveReport = async () => {
      if (!reportData || !userId) return;
      if (!confirm("Відправити цей звіт адміну?")) return;
      const res = await fetch("/api/reports", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", start_date: startDate, end_date: endDate, total_income: reportData.totalIncome, total_expense: reportData.totalExpense, total_writeoff: reportData.totalWriteoff, author_id: userId })
    });
    if (res.ok) { alert("Звіт відправлено!"); setReportData(null); fetchSavedReports(); }
  };

  const takeSalary = async (report: any) => {
      if (!confirm(`Підтвердіть, що ви взяли з каси ${report.total_salary} грн?`)) return;

      const res = await fetch("/api/reports", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
              action: "pay_salary", 
              report_id: report.id,
              amount: report.total_salary,
              date: new Date().toISOString().split('T')[0],
              user_id: userId,
              user_name: userName
          })
      });

      if (res.ok) {
          alert("Готово! Транзакцію створено.");
          fetchSavedReports();
      } else {
          alert("Помилка при створенні транзакції");
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10">
      <nav className="bg-emerald-700 text-white shadow-md p-4 mb-6">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
              <Link href={role === 'admin' ? '/admin' : '/'} className="font-bold text-lg hover:underline opacity-80">← Назад</Link>
              <h1 className="font-bold text-xl">📊 Звіти</h1>
              <div className="w-20"></div>
          </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 space-y-8">
        
        {/* 1. Блок створення */}
        <CreateReport 
            startDate={startDate} 
            setStartDate={setStartDate} 
            endDate={endDate} 
            setEndDate={setEndDate} 
            onGenerate={generateReport} 
            validationError={validationError} 
        />

        {/* 2. Попередній перегляд */}
        <ReportPreview 
            data={reportData} 
            startDate={startDate} 
            endDate={endDate} 
            onSave={saveReport} 
        />

        {/* 3. Список звітів */}
        <ReportList 
            reports={savedReports} 
            onTakeSalary={takeSalary} 
        />

      </main>
    </div>
  );
}