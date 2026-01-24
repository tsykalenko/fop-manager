"use client";

import { useState, useEffect } from "react";

// Тип для кавових напоїв
interface CoffeeItem {
  id: number;
  name: string;
  price: number;
  old_counter: number;
  new_counter: number;
}

// Початковий список кави (потім будемо тягнути з бази)
const INITIAL_COFFEE_MENU: CoffeeItem[] = [
  { id: 1, name: "Еспресо", price: 30, old_counter: 1000, new_counter: 1000 },
  { id: 2, name: "Американо", price: 30, old_counter: 850, new_counter: 850 },
  { id: 3, name: "Американо з мол.", price: 35, old_counter: 400, new_counter: 400 },
  { id: 4, name: "Капучино", price: 40, old_counter: 1200, new_counter: 1200 },
  { id: 5, name: "Лате", price: 45, old_counter: 950, new_counter: 950 },
  { id: 6, name: "Флет Вайт", price: 50, old_counter: 300, new_counter: 300 },
  { id: 7, name: "Раф", price: 55, old_counter: 150, new_counter: 150 },
  { id: 8, name: "Какао", price: 40, old_counter: 200, new_counter: 200 },
  { id: 9, name: "Чай", price: 25, old_counter: 500, new_counter: 500 },
];

export default function RevisionTab() {
  // --- БЛОК 1: ГРОШІ ---
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [prevBalance, setPrevBalance] = useState("0"); // Залишок з минулої ревізії
  const [actualCash, setActualCash] = useState("");    // Скільки грошей в касі по факту
  
  // Дані з бази (обороти)
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  // --- БЛОК 2: КАВА ---
  const [coffeeItems, setCoffeeItems] = useState<CoffeeItem[]>(INITIAL_COFFEE_MENU);

  // Завантаження транзакцій для підрахунку "Теорії"
  useEffect(() => {
    fetch("http://localhost:8080/api/transactions")
      .then(res => res.json())
      .then(data => {
        // Фільтруємо затверджені записи за період
        const filtered = data.filter((t: any) => 
            t.date >= startDate && t.date <= endDate && t.status === 'approved'
        );
        
        const inc = filtered.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + Number(t.amount), 0);
        const exp = filtered.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + Number(t.amount), 0);
        
        setIncome(inc);
        setExpense(exp);
      });
  }, [startDate, endDate]);

  // Зміна лічильника кави
  const handleCounterChange = (id: number, val: string) => {
    const newValue = Number(val);
    setCoffeeItems(prev => prev.map(item => 
      item.id === id ? { ...item, new_counter: newValue } : item
    ));
  };

  // --- ПІДРАХУНКИ ---
  
  // 1. Кава: Скільки продано на суму
  const totalCoffeeSum = coffeeItems.reduce((acc, item) => {
    const sold = item.new_counter - item.old_counter;
    return acc + (sold * item.price);
  }, 0);

  // 2. Теорія: Скільки МАЄ БУТИ грошей
  // Формула: (Попередній залишок + Дохід + Продана Кава) - Витрати
  const theoreticalBalance = Number(prevBalance) + income + totalCoffeeSum - expense;

  // 3. Різниця (Нестача / Надлишок)
  const difference = Number(actualCash) - theoreticalBalance;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* ЗАГОЛОВОК І ДАТИ */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="font-black text-2xl text-slate-800">⚖️ Переоблік (Ревізія)</h2>
        <div className="flex gap-2 items-center">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded p-2 text-sm" />
            <span className="text-slate-400">-</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded p-2 text-sm" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* === ЛІВА КОЛОНКА: КАВА === */}
        <div className="space-y-4">
            <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg flex justify-between items-center">
                <h3 className="font-bold text-lg">☕️ Облік кави</h3>
                <div className="text-emerald-400 font-bold text-xl">+{totalCoffeeSum} ₴</div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-xs text-slate-500 font-bold uppercase">
                        <tr>
                            <th className="p-3">Напій</th>
                            <th className="p-3 text-center">Старий</th>
                            <th className="p-3 text-center">Новий</th>
                            <th className="p-3 text-right">Сума</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {coffeeItems.map(item => {
                            const diff = item.new_counter - item.old_counter;
                            return (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="p-3 font-bold text-slate-700">
                                        {item.name} <span className="text-xs font-normal text-slate-400">({item.price}₴)</span>
                                    </td>
                                    <td className="p-3 text-center text-slate-400">{item.old_counter}</td>
                                    <td className="p-3 text-center">
                                        <input 
                                            type="number" 
                                            value={item.new_counter}
                                            onChange={(e) => handleCounterChange(item.id, e.target.value)}
                                            className={`w-20 text-center border rounded p-1 font-bold outline-none focus:border-blue-500 ${diff < 0 ? 'text-red-500 bg-red-50' : 'text-slate-800'}`}
                                        />
                                    </td>
                                    <td className="p-3 text-right font-bold text-emerald-600">
                                        {diff > 0 ? `+${diff * item.price}` : '0'}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>

        {/* === ПРАВА КОЛОНКА: ФІНАНСИ === */}
        <div className="space-y-6">
            
            {/* Ввідні дані */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-800 uppercase text-sm mb-4">💰 Зведення балансу</h3>
                
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Попередній залишок</span>
                    <input 
                        type="number" value={prevBalance} onChange={e => setPrevBalance(e.target.value)}
                        className="text-right w-24 font-bold border-b border-dashed border-slate-300 outline-none focus:border-blue-500"
                    />
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Оборот (Дохід)</span>
                    <span className="font-bold text-emerald-600">+{income} ₴</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Кава (по лічильниках)</span>
                    <span className="font-bold text-emerald-600">+{totalCoffeeSum} ₴</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Витрати</span>
                    <span className="font-bold text-red-500">-{expense} ₴</span>
                </div>

                <div className="bg-slate-100 p-3 rounded-lg flex justify-between items-center mt-4">
                    <span className="text-slate-700 font-bold text-sm uppercase">Теоретичний залишок</span>
                    <span className="font-black text-xl text-slate-800">{theoreticalBalance.toFixed(2)} ₴</span>
                </div>
            </div>

            {/* Факт і Результат */}
            <div className="bg-slate-900 p-6 rounded-2xl shadow-xl text-white space-y-6">
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Введіть фактичний залишок (Гроші в касі)</label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="number" 
                            value={actualCash} 
                            onChange={e => setActualCash(e.target.value)}
                            placeholder="0"
                            className="w-full bg-transparent text-4xl font-black text-white placeholder-slate-600 outline-none border-b-2 border-slate-700 focus:border-emerald-500 transition"
                        />
                        <span className="text-2xl text-slate-500 font-bold">₴</span>
                    </div>
                </div>

                <div className={`p-4 rounded-xl border-2 flex justify-between items-center ${
                    difference >= 0 
                        ? 'bg-emerald-900/30 border-emerald-500/50' 
                        : 'bg-red-900/30 border-red-500/50'
                }`}>
                    <span className="font-bold uppercase text-sm opacity-80">
                        {difference >= 0 ? '✅ Надлишок' : '❌ Нестача'}
                    </span>
                    <span className={`text-2xl font-black ${difference >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {difference > 0 ? '+' : ''}{difference.toFixed(2)} ₴
                    </span>
                </div>

                <button 
                    onClick={() => alert("Функція збереження ревізії буде доступна після налаштування Бази Даних для історії!")}
                    className="w-full bg-white text-slate-900 font-bold py-3 rounded-lg hover:bg-slate-200 transition"
                >
                    💾 Зберегти ревізію
                </button>
            </div>

        </div>
      </div>
    </div>
  );
}