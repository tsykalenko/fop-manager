"use client";

import { useState, useEffect } from "react";

interface Transaction {
  id: number;
  date: string;
  type: 'income' | 'expense';
  amount: string;
  status: string;
  category: string;
}

export default function AnalyticsTab() {
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Фільтр дат (за замовчуванням - поточний місяць)
  const date = new Date();
  const [startDate, setStartDate] = useState(new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // 1. Беремо токен
    const token = localStorage.getItem("token");

    fetch("http://localhost:8080/api/transactions", {
      headers: {
        "Authorization": `Bearer ${token}` // <--- ПОКАЗУЄМО ПАСПОРТ
      }
    })
      .then((res) => {
        // Якщо не пускає (401) - на сторінку входу
        if (res.status === 401) {
            window.location.href = "/";
            return [];
        }
        return res.json();
      })
      .then((data) => {
        // Перевіряємо, чи прийшов масив, щоб не було помилок
        if (Array.isArray(data)) {
            // Беремо тільки ПІДТВЕРДЖЕНІ (approved) записи!
            const approved = data.filter((t: Transaction) => t.status === 'approved');
            setItems(approved);
        }
        setLoading(false);
      })
      .catch((err) => {
          console.error(err);
          setLoading(false);
      });
  }, []);

  // --- МАТЕМАТИКА ---
  
  // 1. Фільтруємо по датах
  const periodData = items.filter(t => t.date >= startDate && t.date <= endDate);

  // 2. Основні цифри
  const totalIncome = periodData
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalExpense = periodData
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const netProfit = totalIncome - totalExpense;
  const margin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : "0";

  // 3. Групування по категоріях (для графіку)
  const categories: Record<string, number> = {};
  periodData.filter(t => t.type === 'income').forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + Number(t.amount);
  });
  
  // Сортуємо категорії від найбільшої до найменшої
  const sortedCategories = Object.entries(categories)
    .sort(([, a], [, b]) => b - a);

  // Знаходимо максимум для масштабування графіку
  const maxCatValue = sortedCategories.length > 0 ? sortedCategories[0][1] : 1;

  return (
    <div className="space-y-6">
      
      {/* ФІЛЬТР */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-4">
          <h2 className="font-bold text-slate-800 text-lg">📊 Фінансовий огляд</h2>
          <div className="flex gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
             <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent text-sm font-bold p-2 outline-none text-slate-600" />
             <span className="text-slate-300 self-center">➜</span>
             <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent text-sm font-bold p-2 outline-none text-slate-600" />
          </div>
      </div>

      {loading ? (
          <div className="text-center p-10 text-slate-400">Рахуємо гроші...</div>
      ) : (
          <>
            {/* КАРТКИ (KPI) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Дохід */}
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                    <div className="text-emerald-600 text-xs font-bold uppercase mb-2">Оборот (Дохід)</div>
                    <div className="text-3xl font-black text-emerald-700">+{totalIncome.toLocaleString()} ₴</div>
                </div>

                {/* Витрати */}
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                    <div className="text-red-500 text-xs font-bold uppercase mb-2">Витрати</div>
                    <div className="text-3xl font-black text-red-600">-{totalExpense.toLocaleString()} ₴</div>
                </div>

                {/* Прибуток */}
                <div className="bg-slate-900 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-slate-400 text-xs font-bold uppercase mb-2">Чистий прибуток</div>
                        <div className={`text-4xl font-black ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {netProfit > 0 ? '+' : ''}{netProfit.toLocaleString()} ₴
                        </div>
                        <div className="mt-2 text-xs font-medium text-slate-500">
                            Рентабельність: <span className="text-white">{margin}%</span>
                        </div>
                    </div>
                    {/* Фоновий декор */}
                    <div className="absolute right-[-20px] bottom-[-20px] text-8xl opacity-10">💰</div>
                </div>
            </div>

            {/* ГРАФІК КАТЕГОРІЙ */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-6">🏆 Топ продажів за категоріями</h3>
                
                {sortedCategories.length === 0 ? (
                    <div className="text-center text-slate-400 py-10">Немає даних за цей період</div>
                ) : (
                    <div className="space-y-4">
                        {sortedCategories.map(([catName, value]) => {
                            const percent = (value / totalIncome) * 100; // Частка в обороті
                            const widthPercent = (value / maxCatValue) * 100; // Ширина смужки відносно лідера

                            return (
                                <div key={catName}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-bold text-slate-700">{catName}</span>
                                        <span className="font-bold text-slate-900">{value.toLocaleString()} ₴ <span className="text-slate-400 font-normal ml-1">({percent.toFixed(0)}%)</span></span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                        <div 
                                            className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${widthPercent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
          </>
      )}
    </div>
  );
}