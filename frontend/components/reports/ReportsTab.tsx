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

export default function ReportsTab() {
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Налаштування дат за замовчуванням (поточний тиждень)
  const today = new Date();
  const firstDay = new Date(today.setDate(today.getDate() - today.getDay() + 1)); // Понеділок
  
  const [startDate, setStartDate] = useState(firstDay.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Завантажуємо дані
  useEffect(() => {
    fetch("http://localhost:8080/api/transactions")
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  // --- МАТЕМАТИКА ---

  // 1. Фільтруємо записи за період
  const periodItems = items.filter(item => {
    return item.date >= startDate && 
           item.date <= endDate && 
           item.status === 'approved'; // ВАЖЛИВО: Рахуємо тільки підтверджені!
  });

  // 2. Рахуємо Попередній залишок (все що було ДО startDate і затверджено)
  const previousBalance = items
    .filter(item => item.date < startDate && item.status === 'approved')
    .reduce((acc, item) => {
        return item.type === 'income' 
          ? acc + Number(item.amount) 
          : acc - Number(item.amount);
    }, 0);

  // 3. Рахуємо обороти за обраний період
  const incomePeriod = periodItems
    .filter(i => i.type === 'income')
    .reduce((acc, i) => acc + Number(i.amount), 0);

  const expensePeriod = periodItems
    .filter(i => i.type === 'expense')
    .reduce((acc, i) => acc + Number(i.amount), 0);

  // 4. Списання (шукаємо категорію 'Списання' або спеціальні записи)
  // У нас поки списання йде як expense, тому воно вже у витратах.
  // Але можна вивести окремо для інформації:
  const writeoffPeriod = periodItems
    .filter(i => i.category === 'Списання')
    .reduce((acc, i) => acc + Number(i.amount), 0); // Якщо ми пишемо суму списання в amount

  // Фінальний результат
  const finalBalance = previousBalance + incomePeriod - expensePeriod;

  // Рахуємо, скільки записів "зависло" (не перевірено) за цей період
  const pendingCount = items.filter(i => i.date >= startDate && i.date <= endDate && i.status === 'pending').length;

  return (
    <div className="space-y-6">
      
      {/* ПАНЕЛЬ ФІЛЬТРІВ */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            📊 Фінансовий звіт
            {pendingCount > 0 && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full border border-yellow-200">
                    ⚠️ {pendingCount} неперевірених записів не включено
                </span>
            )}
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-auto">
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">З дати</label>
                <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-slate-200 rounded-lg px-4 py-2 font-medium outline-none focus:border-emerald-500 bg-slate-50"
                />
            </div>
            <div className="w-full md:w-auto">
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">По дату</label>
                <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-slate-200 rounded-lg px-4 py-2 font-medium outline-none focus:border-emerald-500 bg-slate-50"
                />
            </div>
        </div>
      </div>

      {/* КАРТКИ ПОКАЗНИКІВ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Попередній залишок */}
          <div className="bg-slate-100 p-5 rounded-2xl border border-slate-200">
              <div className="text-xs font-bold text-slate-400 uppercase mb-1">Попередній залишок</div>
              <div className="text-2xl font-black text-slate-600">
                  {previousBalance.toFixed(2)} ₴
              </div>
          </div>

          {/* Дохід (+ Зелений) */}
          <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
              <div className="text-xs font-bold text-emerald-600 uppercase mb-1">Всього дохід</div>
              <div className="text-2xl font-black text-emerald-600">
                  +{incomePeriod.toFixed(2)} ₴
              </div>
          </div>

          {/* Витрати (- Червоний) */}
          <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
              <div className="text-xs font-bold text-red-500 uppercase mb-1">Всього витрати</div>
              <div className="text-2xl font-black text-red-500">
                  -{expensePeriod.toFixed(2)} ₴
              </div>
          </div>

          {/* Новий залишок (Підсумок) */}
          <div className="bg-slate-900 p-5 rounded-2xl shadow-lg text-white">
              <div className="text-xs font-bold text-slate-400 uppercase mb-1">Фінальний залишок</div>
              <div className="text-3xl font-black text-emerald-400">
                  {finalBalance.toFixed(2)} ₴
              </div>
          </div>
      </div>
        
      {/* ДЕТАЛІЗАЦІЯ (Optional) */}
      <div className="text-center text-xs text-slate-400 mt-4">
          Показано дані за період з {startDate} по {endDate}. <br/>
          Списання товарів на суму {writeoffPeriod} грн включено у витрати.
      </div>

    </div>
  );
}