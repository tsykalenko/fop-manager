"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; 
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SalaryPage() {
  const [settings, setSettings] = useState({ daily_rate: 700, percent_rate: 0.99 });
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    // 1. Отримуємо налаштування
    const resSettings = await fetch("/api/salary_settings");
    const dataSettings = await resSettings.json();
    if (dataSettings.daily_rate) setSettings(dataSettings);

    // 2. Отримуємо історію виплат (тільки затверджені звіти)
    const { data: reports } = await supabase
        .from("period_reports")
        .select("*, profiles:author_id(full_name)")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
    
    if (reports) setHistory(reports);
  }

  const saveSettings = async () => {
      setLoading(true);
      await fetch("/api/salary_settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings)
      });
      alert("Налаштування збережено!");
      setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10">
      {/* HEADER */}
      <nav className="bg-emerald-800 text-white shadow-md p-4 mb-6">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
              <Link href="/admin" className="font-bold text-lg hover:underline opacity-80">← В Адмінку</Link>
              <h1 className="font-bold text-xl">💰 Управління Зарплатою</h1>
              <div className="w-20"></div>
          </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 space-y-8">
        
        {/* БЛОК 1: НАЛАШТУВАННЯ */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="font-bold text-lg mb-4 text-slate-700 flex items-center gap-2">⚙️ Формула розрахунку</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Ставка в день (грн)</label>
                    <input 
                        type="number" 
                        value={settings.daily_rate} 
                        onChange={e => setSettings({...settings, daily_rate: Number(e.target.value)})}
                        className="w-full border-b-2 border-emerald-100 focus:border-emerald-500 outline-none py-2 text-2xl font-bold text-slate-700"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Відсоток від видатку/продажу (%)</label>
                    <input 
                        type="number" 
                        step="0.01"
                        value={settings.percent_rate} 
                        onChange={e => setSettings({...settings, percent_rate: Number(e.target.value)})}
                        className="w-full border-b-2 border-emerald-100 focus:border-emerald-500 outline-none py-2 text-2xl font-bold text-slate-700"
                    />
                </div>
            </div>
            <div className="mt-4 bg-gray-50 p-3 rounded text-sm text-gray-500 italic border border-gray-100">
                Формула: (Кількість днів × {settings.daily_rate}) + (Сума видатку × {settings.percent_rate}%)
            </div>
            <button 
                onClick={saveSettings} 
                disabled={loading}
                className="mt-4 bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-emerald-700 transition shadow"
            >
                {loading ? "Збереження..." : "Зберегти нові тарифи"}
            </button>
        </div>

        {/* БЛОК 2: ІСТОРІЯ ВИПЛАТ */}
        <div className="space-y-4">
            <h2 className="font-bold text-lg text-slate-700 border-b pb-2">Історія нарахувань</h2>
            {history.length === 0 && <div className="text-gray-400">Поки немає виплат</div>}
            
            {history.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
                    <div>
                        <div className="font-bold text-slate-800">{new Date(item.start_date).toLocaleDateString('uk-UA')} — {new Date(item.end_date).toLocaleDateString('uk-UA')}</div>
                        <div className="text-xs text-gray-500">Продавець: {item.profiles?.full_name || "Невідомий"}</div>
                    </div>
                    <div className="text-right">
                        <div className="font-black text-xl text-emerald-600">{item.total_salary} ₴</div>
                        {item.is_paid ? 
                            <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">ОТРИМАНО</span> :
                            <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-bold">ОЧІКУЄ</span>
                        }
                    </div>
                </div>
            ))}
        </div>

      </main>
    </div>
  );
}