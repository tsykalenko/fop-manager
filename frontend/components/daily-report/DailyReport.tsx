"use client";

import { useState, useEffect } from "react";
import { useInspection } from "@/context/InspectionContext"; 

// Імпорти компонентів
import AddEntryForm from "./AddEntryForm";
import TransactionList from "./TransactionList";
import DateNavigator from "./DateNavigator";
import ImportModal from "./modals/ImportExcelModal";

// Імпорти логіки
import { exportTransactionsToExcel } from "./lib/excel";
import { Transaction } from "./types"; // 👈 Тепер беремо типи з одного місця!

export default function DailyReport() {
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Виправляємо проблему часових поясів (щоб дата завжди була локальна)
  const [selectedDate, setSelectedDate] = useState(() => {
      const now = new Date();
      return new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
        .toISOString()
        .split('T')[0];
  });

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { isInspectionMode } = useInspection();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  useEffect(() => {
    const role = localStorage.getItem("user_role");
    setIsAdmin(role === 'admin');
    loadData(false); 
  }, [selectedDate]);

  const loadData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/api/transactions`, {
        headers: { 
            "Authorization": `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json"
        }
      });

      if (res.status === 401) { window.location.href = "/"; return; }
      
      const rawData = await res.json();
      if (Array.isArray(rawData)) {
        const cleanData = rawData.map((item: any) => {
            const method = item.payment_method ? String(item.payment_method).toLowerCase() : "";
            const isBank = method.includes('банк') || method.includes('bank') || method.includes('card') || method.includes('термінал');
            // Нормалізуємо is_official
            const officialBoolean = item.is_official === true || item.is_official === 1 || item.is_official === "1" || isBank;
            return { ...item, is_official: officialBoolean };
        });
        setItems(cleanData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  // 👇 ОСЬ ТУТ БУЛА ПРОБЛЕМА. ТЕПЕР ЦЕ ПРАЦЮЄ ЗАЛІЗНО:
  const filteredItems = items.filter(i => {
      // 1. Умова "Створено сьогодні" (Звичайний новий товар)
      const isCreatedOnDate = i.date === selectedDate;

      // 2. Умова "Оплачено сьогодні" (Старий борг, який ми закрили сьогодні)
      // (Перевіряємо, що payment_date існує, співпадає з обраною датою, і це не день створення)
      const isPaidOnDate = i.payment_date === selectedDate && 
                           i.payment_date !== i.date && 
                           i.payment_status === 'paid';
      
      // 3. Перевірка "Око" (Режим інспекції)
const officialMatch = isAdmin ? true : (isInspectionMode ? i.is_official === true : true);
      // 4. Перевірка "Адмін/Продавець" (Приховані видалені)
      const visibilityMatch = isAdmin ? true : i.status !== 'rejected';

      // Логіка: (АБО створено сьогодні, АБО оплачено сьогодні) І (проходить перевірку Ока і Ролі)
      return (isCreatedOnDate || isPaidOnDate) && officialMatch && visibilityMatch;
  });

  // ... всередині DailyReport ...

  const handleAddNewItem = async (newItem: any) => {
    const token = localStorage.getItem("token");
    console.log("➕ Спроба додати:", newItem);

    // 1. Підготовка даних (щоб задовольнити суворий бекенд)
    // Якщо форма не передала payment_status, ставимо 'paid' (бо це зазвичай витрата)
    // Якщо немає is_official, ставимо 0
    const safePayload = {
        ...newItem,
        payment_status: newItem.payment_status || 'paid', 
        is_official: newItem.is_official ? 1 : 0, 
        status: 'pending' // Нові записи завжди на перевірці
    };

    try {
        const res = await fetch(`${apiUrl}/api/transactions`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
                "Accept": "application/json" // 👈 ‼️ ГОЛОВНИЙ ФІКС (як в архіві)
            },
            body: JSON.stringify(safePayload)
        });

        if (res.ok) { 
            // Успіх!
            await loadData(true); 
        } else {
            // Тепер ми побачимо реальну помилку, а не Failed to fetch
            const errData = await res.json(); 
            console.error("Server Error:", errData);
            
            // Формуємо читабельний текст помилки
            const message = errData.message || "Помилка збереження";
            const details = errData.errors ? JSON.stringify(errData.errors) : "";
            
            alert(`Не вдалося додати запис:\n${message}\n${details}`);
        }
    } catch (error) {
        console.error(error);
        alert("Помилка з'єднання з сервером");
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
            <div className="xl:col-span-4 h-full">
                <DateNavigator 
                    currentDate={selectedDate}
                    onDateSelect={setSelectedDate} 
                    items={items} 
                />
            </div>
            <div className="xl:col-span-8 h-full">
                <AddEntryForm 
                    onAdd={handleAddNewItem} 
                    currentDate={selectedDate} 
                />
            </div>
        </div>

        <div>
            <div className="flex items-center justify-between mb-4 px-2">
                 <div className="flex items-center gap-4">
                     <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        📜 Історія операцій
                        <span className="text-slate-400 text-sm font-normal">| {selectedDate}</span>
                     </h2>
                 </div>
                 
                 <div className="flex items-center gap-3">
                    {isAdmin && (
                        <>
                            <button onClick={() => exportTransactionsToExcel(filteredItems, selectedDate)} className="text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 px-3 py-1.5 rounded-lg transition flex items-center gap-1 shadow-sm">
                                📥 Експорт
                            </button>
                            <button onClick={() => setIsImportOpen(true)} className="text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1 border border-emerald-100">
                                📤 Імпорт Excel
                            </button>
                            <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>
                        </>
                    )}

                    <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                        {filteredItems.length === 0 ? "Пусто" : `${filteredItems.length} записів`}
                    </div>
                 </div>
            </div>

            <TransactionList 
                items={filteredItems} 
                loading={loading} 
                onRefresh={() => loadData(true)} 
            />
        </div>

        <ImportModal 
            isOpen={isImportOpen} 
            onClose={() => setIsImportOpen(false)} 
            onSuccess={() => loadData(false)} 
        />
    </div>
  );
}