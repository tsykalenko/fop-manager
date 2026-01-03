"use client";

import { useState, useEffect } from "react";
import { TransactionData } from "@/lib/services/transactionService";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [items, setItems] = useState<TransactionData[]>([]);
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 🛡 ЗАХИСТ СТОРІНКИ (Тільки для Адміна)
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login"); // Нема входу -> на логін
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== 'admin') {
        alert("Сюди не можна! Тільки для власника.");
        router.push("/"); // Продавця -> на касу
      }
    };
    
    checkUser();
  }, [router]);

  useEffect(() => { fetchItems(); }, [viewDate]);

  async function fetchItems() {
    setLoading(true);
    // Сервер тепер повертає дані разом з profiles (іменами)
    const res = await fetch(`/api/transactions?date=${viewDate}`);
    const data = await res.json();
    if (Array.isArray(data)) setItems(data);
    setLoading(false);
  }

  // Функція зміни статусу (Валідація)
  const updateStatus = async (id: number, newStatus: "valid" | "issue" | "pending") => {
    // Оптимістичне оновлення (спочатку малюємо, потім шлемо запит)
    setItems(items.map(i => i.id === id ? { ...i, admin_check: newStatus } : i));

    await fetch("/api/transactions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, admin_check: newStatus }),
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-20">
      
      {/* Шапка Адміна */}
      <header className="bg-slate-800 text-white p-4 shadow-md sticky top-0 z-10 flex justify-between items-center">
        <h1 className="font-bold text-xl">🛡 Кабінет Власника</h1>
        <input 
            type="date" 
            value={viewDate} 
            onChange={(e) => setViewDate(e.target.value)}
            className="bg-slate-700 text-white border border-slate-600 rounded px-2 py-1 outline-none cursor-pointer"
        />
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        <div className="bg-white rounded-xl shadow border overflow-hidden">
            <div className="bg-gray-50 p-3 border-b text-xs font-bold text-gray-500 uppercase grid grid-cols-[1fr_4fr_2fr_2fr]">
                <div className="pl-2">Статус</div>
                <div>Опис операції</div>
                <div className="text-center">Сума</div>
                <div className="text-center">Дія</div>
            </div>

            <div className="divide-y">
                {items.map(item => {
                    const isCash = item.category === 'cash_drop';
                    // Колір рядка залежно від статусу
                    let rowClass = "bg-white";
                    if (item.admin_check === 'valid') rowClass = "bg-green-50/50";
                    if (item.admin_check === 'issue') rowClass = "bg-yellow-50/50";

                    return (
                        <div key={item.id} className={`grid grid-cols-[1fr_4fr_2fr_2fr] p-4 items-center transition ${rowClass}`}>
                            
                            {/* 1. Індикатор статусу */}
                            <div className="pl-2">
                                {item.admin_check === 'pending' && <span className="text-gray-400 text-xs font-bold">⏳ Чекає</span>}
                                {item.admin_check === 'valid' && <span className="text-green-600 text-xs font-bold">✅ ОК</span>}
                                {item.admin_check === 'issue' && <span className="text-orange-500 text-xs font-bold">⚠️ Питання</span>}
                            </div>

                            {/* 2. Деталі */}
                            <div>
                                <div className={`font-bold ${isCash ? 'text-blue-700' : 'text-gray-800'}`}>
                                    {item.title}
                                </div>

                                {/* 👇 ОСЬ ТУТ МИ ПОКАЗУЄМО ХТО ЦЕ ДОДАВ */}
                                <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 flex items-center gap-1">
                                    👤 {(item as any).profiles?.full_name || "Невідомий"}
                                </div>

                                <div className="text-xs text-gray-400 mt-1">
                                    {isCash ? "Здача виручки" : `${item.income} (дох) - ${item.expense} (вит) - ${item.writeoff} (спис)`}
                                    {item.payment_status === 'unpaid' && <span className="ml-2 text-orange-500 font-bold">БОРГ</span>}
                                </div>
                            </div>

                            {/* 3. Головна цифра */}
                            <div className="text-center font-mono text-sm">
                                {isCash 
                                    ? <span className="text-blue-600 font-bold">-{item.expense}</span>
                                    : <span className="text-green-600 font-bold">+{item.income - item.expense - item.writeoff}</span>
                                }
                            </div>

                            {/* 4. Кнопки управління */}
                            <div className="flex justify-center gap-2">
                                <button 
                                    onClick={() => updateStatus(item.id!, 'valid')}
                                    className={`p-2 rounded-lg transition hover:scale-110 ${item.admin_check === 'valid' ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'}`}
                                    title="Все правильно"
                                >
                                    ✅
                                </button>
                                <button 
                                    onClick={() => updateStatus(item.id!, 'issue')}
                                    className={`p-2 rounded-lg transition hover:scale-110 ${item.admin_check === 'issue' ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-orange-100 hover:text-orange-600'}`}
                                    title="Є проблема"
                                >
                                    ⚠️
                                </button>
                            </div>
                        </div>
                    );
                })}
                
                {items.length === 0 && <div className="p-10 text-center text-gray-400">В цей день записів немає</div>}
            </div>
        </div>
      </main>
    </div>
  );
}