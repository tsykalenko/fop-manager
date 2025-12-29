"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Shift = {
  id: number;
  date: string;
  seller_name: string;
  total_sales: number;
  final_salary: number;
};

export default function SalaryPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  // Дані для нової зміни
  const [sellerName, setSellerName] = useState("Світлана");
  const [totalSales, setTotalSales] = useState("");
  const [penalty, setPenalty] = useState("");
  
  // Налаштування (можна міняти)
  const RATE = 700; // Ставка
  const PERCENT = 0.0099; // 0.99%

  // Автоматичний розрахунок ЗП (поки вводиш цифри)
  const calculatedSalary = 
    (Number(totalSales) * PERCENT) + RATE - Number(penalty);

  useEffect(() => {
    fetchShifts();
  }, []);

  async function fetchShifts() {
    const { data } = await supabase
      .from("shifts")
      .select("*")
      .order("date", { ascending: false });
    
    if (data) setShifts(data);
    setLoading(false);
  }

  async function handleSaveShift() {
    if (!totalSales) return alert("Введіть суму каси!");

    const { error } = await supabase.from("shifts").insert([
      {
        date: new Date().toISOString(),
        seller_name: sellerName,
        total_sales: Number(totalSales),
        salary_rate: RATE,
        salary_percent: 0.99, // Зберігаємо як 0.99%
        penalty: Number(penalty) || 0,
        final_salary: calculatedSalary,
      },
    ]);

    if (error) {
      alert("Помилка!");
      console.error(error);
    } else {
      setTotalSales("");
      setPenalty("");
      fetchShifts(); // Оновити таблицю
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        
        {/* Заголовок */}
        <div className="bg-blue-700 p-4 text-white flex justify-between items-center">
          <h1 className="text-xl font-bold">Розрахунок ЗП</h1>
          <a href="/" className="text-sm underline opacity-80">← Назад</a>
        </div>

        <div className="p-6 space-y-4">
          
          {/* Форма розрахунку */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Продавець</label>
            <select 
              value={sellerName}
              onChange={e => setSellerName(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option>Світлана</option>
              <option>Анна</option>
              <option>Людмила</option>
              <option>Ірина</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Каса за день (грн)</label>
            <input 
              type="number" 
              value={totalSales}
              onChange={e => setTotalSales(e.target.value)}
              className="w-full border p-2 rounded text-lg"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Штрафи (якщо є)</label>
            <input 
              type="number" 
              value={penalty}
              onChange={e => setPenalty(e.target.value)}
              className="w-full border p-2 rounded text-red-600"
              placeholder="0"
            />
          </div>

          {/* Результат розрахунку */}
          <div className="bg-gray-100 p-4 rounded-lg mt-4">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Ставка: {RATE}</span>
              <span>Відсоток: 0.99%</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="font-semibold text-gray-700">До видачі:</span>
              <span className="text-2xl font-bold text-blue-700">
                {totalSales ? calculatedSalary.toFixed(0) : "0"} ₴
              </span>
            </div>
          </div>

          <button 
            onClick={handleSaveShift}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
          >
            Зберегти зміну
          </button>

        </div>
      </div>

      {/* Історія змін */}
      <div className="max-w-md mx-auto mt-6">
        <h3 className="text-gray-500 font-semibold mb-2 ml-2">Історія виплат</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y">
          {shifts.map(shift => (
            <div key={shift.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-800">{shift.seller_name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(shift.date).toLocaleDateString()} • Каса: {shift.total_sales}
                </p>
              </div>
              <div className="text-right">
                <span className="block font-bold text-green-700">{shift.final_salary} ₴</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}