"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; 
import { useRouter } from "next/navigation";
import Link from "next/link";

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

  // 👇 НОВА ФУНКЦІЯ: ВИПЛАТА ЗП
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
        {/* БЛОК СТВОРЕННЯ (без змін) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="font-bold text-lg mb-4 text-slate-700">Створити новий звіт</h2>
            <div className="flex flex-wrap gap-4 items-end">
                <div><div className="text-xs font-bold text-gray-500 uppercase mb-1">З дати</div><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border p-2 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div><div className="text-xs font-bold text-gray-500 uppercase mb-1">По дату</div><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border p-2 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <button onClick={generateReport} className="bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-emerald-700 transition shadow-lg">Сформувати</button>
            </div>
            {validationError && (<div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"><div className="font-bold flex items-center gap-2">⛔ Неможливо створити звіт!</div><p className="text-sm mt-1">Адміністратор ще не перевірив (не поставив статус "Вірно") записи за ці дні:</p><div className="flex flex-wrap gap-2 mt-2">{validationError.map(date => (<span key={date} className="bg-white border border-red-300 px-2 py-1 rounded text-xs font-bold shadow-sm">{new Date(date).toLocaleDateString('uk-UA')}</span>))}</div></div>)}
        </div>

        {/* ТАБЛИЦЯ ПОПЕРЕДНЬОГО ПЕРЕГЛЯДУ */}
        {reportData && (
            <div className="bg-white rounded-xl shadow-lg border border-emerald-500 overflow-hidden animate-fade-in-up">
                <div className="bg-emerald-50 p-3 border-b border-emerald-100 flex justify-between items-center">
                    <h3 className="font-bold text-emerald-800">Період: {new Date(startDate).toLocaleDateString('uk-UA')} — {new Date(endDate).toLocaleDateString('uk-UA')}</h3>
                    <button onClick={saveReport} className="bg-emerald-600 text-white text-sm font-bold py-1.5 px-4 rounded hover:bg-emerald-700 shadow animate-pulse">✅ Відправити Адміну</button>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-500 uppercase text-[10px] tracking-wider"><tr><th className="px-4 py-2">Дата</th><th className="px-4 py-2 text-center text-emerald-600">Дохід</th><th className="px-4 py-2 text-center text-red-600">Витрата</th><th className="px-4 py-2 text-center text-slate-500">Списання</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                        {reportData.dailyData.map((day: any) => (<tr key={day.date} className="hover:bg-gray-50"><td className="px-4 py-3 font-bold text-slate-700 border-r border-gray-100">{new Date(day.date).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', weekday: 'short' })}</td><td className="px-4 py-3 text-center font-bold text-emerald-600">{day.income > 0 ? day.income : <span className="text-gray-300">-</span>}</td><td className="px-4 py-3 text-center font-bold text-red-600">{day.expense > 0 ? day.expense : <span className="text-gray-300">-</span>}</td><td className="px-4 py-3 text-center font-bold text-slate-400">{day.writeoff > 0 ? day.writeoff : <span className="text-gray-300">-</span>}</td></tr>))}
                        <tr className="bg-gray-800 text-white font-black border-t-2 border-emerald-500 text-base"><td className="px-4 py-3 uppercase tracking-widest text-xs">Всього:</td><td className="px-4 py-3 text-center text-emerald-300">{reportData.totalIncome} ₴</td><td className="px-4 py-3 text-center text-red-300">{reportData.totalExpense} ₴</td><td className="px-4 py-3 text-center text-gray-400">{reportData.totalWriteoff} ₴</td></tr>
                    </tbody>
                </table>
            </div>
        )}

        {/* СПИСОК ЗВІТІВ */}
        <div className="space-y-4">
            <h2 className="font-bold text-lg text-slate-700 border-b pb-2">Історія звітів</h2>
            {savedReports.map(report => (
                <div key={report.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-4 hover:shadow-md transition">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl text-xl shrink-0 ${report.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-yellow-100 text-yellow-600'}`}>{report.status === 'approved' ? '✅' : '⏳'}</div>
                            <div>
                                <div className="font-bold text-slate-800 text-base">{new Date(report.start_date).toLocaleDateString('uk-UA')} — {new Date(report.end_date).toLocaleDateString('uk-UA')}</div>
                                <div className="text-xs text-gray-500 mt-1">Оборот: {report.total_income} ₴</div>
                            </div>
                        </div>

                        {/* БЛОК ЗАРПЛАТИ (Якщо затверджено) */}
                        {report.status === 'approved' && (
                            <div className="w-full md:w-auto bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex flex-col items-center md:items-end gap-2">
                                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">До виплати:</div>
                                <div className="font-black text-2xl text-emerald-700">{report.total_salary} ₴</div>
                                {report.bonus > 0 && <div className="text-[10px] text-green-600 font-bold">+ {report.bonus} бонус</div>}
                                {report.fine > 0 && <div className="text-[10px] text-red-600 font-bold">- {report.fine} штраф</div>}
                                {report.admin_note && <div className="text-[10px] text-gray-500 italic">"{report.admin_note}"</div>}
                                
                                {report.is_paid ? (
                                    <div className="mt-1 bg-blue-100 text-blue-800 px-3 py-1 rounded text-xs font-bold flex items-center gap-1">
                                        ✔ Отримано
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => takeSalary(report)}
                                        className="mt-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded shadow-lg text-xs font-bold uppercase tracking-wide transition active:scale-95 flex items-center gap-2"
                                    >
                                        💵 Взяти з каси
                                    </button>
                                )}
                            </div>
                        )}
                        {report.status === 'pending' && <div className="text-sm text-yellow-600 font-bold bg-yellow-50 px-3 py-1 rounded">На перевірці...</div>}
                    </div>
                </div>
            ))}
        </div>

      </main>
    </div>
  );
}