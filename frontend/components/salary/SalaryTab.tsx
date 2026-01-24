"use client";

import { useState, useEffect } from "react";

interface Transaction {
  id: number;
  date: string;
  type: 'income' | 'expense';
  amount: string;
  status: string;
}

export default function SalaryTab() {
  const [loading, setLoading] = useState(true);

  // --- НАЛАШТУВАННЯ (Пізніше це буде приходити з Адмінки) ---
  const [percentRate, setPercentRate] = useState(2.0); // 2% від каси
  const [fixedRate, setFixedRate] = useState(700);     // 700 грн за вихід
  const [employeesCount, setEmployeesCount] = useState(2); // На скількох ділимо

  // --- ДАТИ ---
  // За замовчуванням - поточний місяць
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  
  const [startDate, setStartDate] = useState(firstDay.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // --- ДАНІ ---
  const [totalSales, setTotalSales] = useState(0);
  const [workDays, setWorkDays] = useState(0);

  // Завантаження даних
  useEffect(() => {
    fetch("http://localhost:8080/api/transactions")
      .then(res => res.json())
      .then((data: Transaction[]) => {
        // 1. Фільтруємо за період і тільки ЗАТВЕРДЖЕНІ (approved)
        // (Для тесту можеш прибрати status === 'approved', щоб бачити цифри з тестових даних)
        const periodData = data.filter(t => 
            t.date >= startDate && 
            t.date <= endDate && 
            t.type === 'income' &&
            t.status === 'approved' // <--- ВАЖЛИВО: Рахуємо тільки чесні гроші
        );

        // 2. Рахуємо суму продажів (База для %)
        const sum = periodData.reduce((acc, t) => acc + Number(t.amount), 0);
        setTotalSales(sum);

        // 3. Рахуємо кількість унікальних робочих днів (по датах транзакцій)
        const uniqueDays = new Set(periodData.map(t => t.date)).size;
        setWorkDays(uniqueDays);
        
        setLoading(false);
      });
  }, [startDate, endDate]);

  // --- МАТЕМАТИКА ЗАРПЛАТИ ---
  const bonusPart = totalSales * (percentRate / 100);       // Гроші з відсотка
  const fixedPart = workDays * fixedRate;                   // Гроші за виходи
  const totalPool = bonusPart + fixedPart;                  // Загальний фонд ЗП
  const salaryPerPerson = totalPool / employeesCount;       // На руки одному

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* ЗАГОЛОВОК І ФІЛЬТР */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="font-black text-2xl text-slate-800 flex items-center gap-2">
            💸 Калькулятор ЗП
        </h2>
        <div className="flex gap-2 items-center bg-slate-50 p-1 rounded-lg border border-slate-200">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent text-sm font-bold p-2 outline-none text-slate-600" />
            <span className="text-slate-300">➜</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent text-sm font-bold p-2 outline-none text-slate-600" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
          
          {/* ЛІВА ЧАСТИНА: НАЛАШТУВАННЯ */}
          <div className="space-y-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Налаштування розрахунку</h3>
                  
                  <div className="space-y-4">
                      {/* Відсоток */}
                      <div className="flex justify-between items-center">
                          <label className="text-sm font-bold text-slate-700">Відсоток від каси (%)</label>
                          <input 
                              type="number" step="0.01" value={percentRate} onChange={e => setPercentRate(Number(e.target.value))}
                              className="w-20 text-right font-bold border rounded p-1 outline-none focus:border-blue-500"
                          />
                      </div>

                      {/* Ставка */}
                      <div className="flex justify-between items-center">
                          <label className="text-sm font-bold text-slate-700">Ставка за зміну (грн)</label>
                          <input 
                              type="number" value={fixedRate} onChange={e => setFixedRate(Number(e.target.value))}
                              className="w-20 text-right font-bold border rounded p-1 outline-none focus:border-blue-500"
                          />
                      </div>

                      {/* Працівники */}
                      <div className="flex justify-between items-center">
                          <label className="text-sm font-bold text-slate-700">Кількість працівників</label>
                          <div className="flex items-center gap-2">
                              <button onClick={() => setEmployeesCount(Math.max(1, employeesCount - 1))} className="w-8 h-8 rounded bg-white border font-bold hover:bg-slate-100">-</button>
                              <span className="font-black w-4 text-center">{employeesCount}</span>
                              <button onClick={() => setEmployeesCount(employeesCount + 1)} className="w-8 h-8 rounded bg-white border font-bold hover:bg-slate-100">+</button>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Статистика за період */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                   <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Дані за період</h3>
                   <div className="space-y-3">
                       <div className="flex justify-between">
                           <span className="text-sm text-slate-500">Всього каса (Approved):</span>
                           <span className="font-bold text-slate-800">{totalSales.toFixed(2)} ₴</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-sm text-slate-500">Відпрацьовано днів:</span>
                           <span className="font-bold text-slate-800">{workDays}</span>
                       </div>
                   </div>
              </div>
          </div>

          {/* ПРАВА ЧАСТИНА: ЧЕК */}
          <div className="bg-white p-0 rounded-2xl shadow-xl overflow-hidden flex flex-col">
              <div className="bg-slate-800 text-white p-6 text-center">
                  <div className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-2">Зарплата на руки</div>
                  <div className="text-5xl font-black text-emerald-400">
                      {salaryPerPerson.toFixed(0)} <span className="text-2xl text-emerald-600">грн</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-2">Кожному з {employeesCount} працівників</div>
              </div>
              
              <div className="p-6 bg-slate-50 flex-1 border-t border-slate-100 relative">
                  {/* Декор чека */}
                  <div className="absolute top-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIiBmaWxsPSJub25lIiBzdHJva2U9IiNlMmU4ZjAiIHN0cm9rZS13aWR0aD0iMSI+PHBhdGggZD0iTTAgMjBMMTAgMEwyMCAyMCIvPjwvc3ZnPg==')] bg-repeat-x -mt-2"></div>

                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 text-center">Деталізація нарахувань</h4>
                  
                  <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-2 border-b border-dashed border-slate-300">
                          <span>Бонус ({percentRate}%)</span>
                          <span className="font-bold text-slate-700">+{bonusPart.toFixed(2)} ₴</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-dashed border-slate-300">
                          <span>Ставка ({workDays} змін × {fixedRate})</span>
                          <span className="font-bold text-slate-700">+{fixedPart.toFixed(2)} ₴</span>
                      </div>
                      <div className="flex justify-between py-2 pt-4">
                          <span className="font-bold text-slate-900">Загальний фонд</span>
                          <span className="font-black text-slate-900">{totalPool.toFixed(2)} ₴</span>
                      </div>
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
}