"use client";

import { useState } from "react";

export default function SettingsTab() {
  // Тимчасові стани (потім підключимо до бази)
  const [salaryPercent, setSalaryPercent] = useState(2.0);
  const [dayRate, setDayRate] = useState(700);
  
  const [coffeeMenu, setCoffeeMenu] = useState([
    { id: 1, name: "Еспресо", price: 30 },
    { id: 2, name: "Американо", price: 30 },
    { id: 3, name: "Капучино", price: 40 },
    { id: 4, name: "Лате", price: 45 },
  ]);

  const updatePrice = (id: number, newPrice: string) => {
    setCoffeeMenu(prev => prev.map(item => 
      item.id === id ? { ...item, price: Number(newPrice) } : item
    ));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      
      {/* ЛІВА КОЛОНКА: ФІНАНСИ */}
      <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                  💸 Фінансові налаштування
              </h2>
              
              <div className="space-y-4">
                  <div>
                      <label className="text-sm font-bold text-slate-500 uppercase block mb-1">Ставка за вихід (грн)</label>
                      <input 
                        type="number" 
                        value={dayRate} onChange={e => setDayRate(Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-lg p-3 font-bold text-slate-800 outline-none focus:border-emerald-500 transition"
                      />
                  </div>
                  <div>
                      <label className="text-sm font-bold text-slate-500 uppercase block mb-1">Відсоток продавця (%)</label>
                      <input 
                        type="number" step="0.1"
                        value={salaryPercent} onChange={e => setSalaryPercent(Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-lg p-3 font-bold text-slate-800 outline-none focus:border-emerald-500 transition"
                      />
                  </div>
                  <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition">
                      💾 Зберегти тарифи
                  </button>
              </div>
          </div>

          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
              <h3 className="font-bold text-emerald-800 mb-2">ℹ️ Довідка</h3>
              <p className="text-sm text-emerald-700/80 leading-relaxed">
                  Ці налаштування впливають на автоматичний розрахунок зарплати у вкладці "Зарплата". Зміни вступають в силу миттєво для нових розрахунків.
              </p>
          </div>
      </div>

      {/* ПРАВА КОЛОНКА: МЕНЮ І ЦІНИ */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                ☕️ Меню та Ціни
            </h2>
            <button className="text-xs bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full hover:bg-emerald-200 transition">
                + Додати напій
            </button>
          </div>

          <div className="space-y-3">
              {coffeeMenu.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition group">
                      <div className="font-bold text-slate-700">{item.name}</div>
                      <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 uppercase font-bold">Ціна:</span>
                          <input 
                              type="number" 
                              value={item.price}
                              onChange={(e) => updatePrice(item.id, e.target.value)}
                              className="w-20 text-right bg-slate-100 border border-slate-200 rounded p-1 font-bold text-emerald-600 outline-none focus:bg-white focus:border-emerald-500"
                          />
                          <span className="text-slate-400 font-medium">₴</span>
                          
                          {/* Кнопка видалення (з'являється при наведенні) */}
                          <button className="opacity-0 group-hover:opacity-100 ml-2 text-red-300 hover:text-red-500 transition">
                              🗑
                          </button>
                      </div>
                  </div>
              ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
              <button className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-500 transition shadow-lg shadow-emerald-200">
                  💾 Оновити Меню
              </button>
          </div>
      </div>

    </div>
  );
}