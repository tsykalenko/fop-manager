"use client";

import { useState, useEffect } from "react";

import TransactionForm from "./TransactionForm";
import TransactionsTable from "./TransactionsTable";
import HistoryCalendar from "./HistoryCalendar";
import ImportModal from "./utils/ImportXlsx";
import { exportTransactionsToExcel } from "./utils/ExportXlsx";

interface Transaction {
  id: number;
  date: string;
  invoice_number: string | null;
  type: 'income' | 'expense';
  amount: string;
  expense_amount: string;
  full_value: string | null; 
  writeoff_amount: string;
  payment_method: string;
  payment_status: 'paid' | 'unpaid';
  status: 'pending' | 'approved' | 'rejected';
  category: string;
  comment: string | null;
  is_official: boolean;
}

export default function DailyManager() {
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isInspectionMode, setIsInspectionMode] = useState(false);

  // 👇 Визначаємо адресу один раз для всього компонента
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const loadData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const res = await fetch(`${apiUrl}/api/transactions`, {
        headers: { 
            "Authorization": `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true", // 👈 ОБОВ'ЯЗКОВО для Ngrok
            "Content-Type": "application/json"
        }
      });

      if (res.status === 401) { window.location.href = "/"; return; }
      
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data);
      }
      setLoading(false);
    } catch (err) {
      console.error("Помилка завантаження:", err);
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredItems = items.filter(i => {
      // 1. Фільтр по даті
      const dateMatch = i.date === selectedDate;
      
      // 2. Фільтр "Режим перевірки"
      if (isInspectionMode) {
          const isOfficialFlag = i.is_official == true; 
          const isBankText = i.payment_method?.toLowerCase().includes('банк') || 
                             i.payment_method?.toLowerCase().includes('bank') ||
                             i.payment_method?.toLowerCase().includes('card') ||
                             i.payment_method === '1';

          return dateMatch && (isOfficialFlag || isBankText);
      }

      return dateMatch;
  });

  const handleAddNewItem = async (newItem: any) => {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${apiUrl}/api/transactions`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true" // 👈 ОБОВ'ЯЗКОВО для Ngrok
            },
            body: JSON.stringify(newItem)
        });

        if (res.ok) {
            loadData();
        } else {
            const errorData = await res.json();
            alert(`Помилка: ${errorData.message || "Не вдалося зберегти"}`);
        }
    } catch (error) {
        console.error(error);
        alert("Помилка з'єднання");
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
        
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
            <div className="xl:col-span-4 h-full">
                <HistoryCalendar 
                    currentDate={selectedDate}
                    onDateSelect={setSelectedDate} 
                    items={items} 
                />
            </div>

            <div className="xl:col-span-8 h-full">
                <TransactionForm 
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

                     <label className="flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition select-none border border-slate-200 shadow-sm">
                        <input 
                            type="checkbox" 
                            className="toggle toggle-sm toggle-error" 
                            checked={isInspectionMode}
                            onChange={(e) => setIsInspectionMode(e.target.checked)}
                        />
                        <span className={`text-xs font-bold ${isInspectionMode ? "text-red-600" : "text-slate-500"}`}>
                            {isInspectionMode ? "🛡️ РЕЖИМ ПЕРЕВІРКИ" : "👁️ Всі записи"}
                        </span>
                     </label>
                 </div>
                 
                 <div className="flex items-center gap-3">
                    <button 
                        onClick={() => exportTransactionsToExcel(filteredItems, selectedDate)}
                        className="text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 px-3 py-1.5 rounded-lg transition flex items-center gap-1 shadow-sm"
                    >
                        📥 Експорт
                    </button>

                    <button 
                        onClick={() => setIsImportOpen(true)}
                        className="text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1 border border-emerald-100"
                    >
                        📤 Імпорт Excel
                    </button>

                    <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>

                    <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                        {filteredItems.length === 0 ? "Пусто" : `${filteredItems.length} записів`}
                    </div>
                 </div>
            </div>

            <TransactionsTable 
                items={filteredItems} 
                loading={loading} 
                onRefresh={loadData} 
            />
        </div>

        <ImportModal 
            isOpen={isImportOpen} 
            onClose={() => setIsImportOpen(false)} 
            onSuccess={loadData} 
        />

    </div>
  );
}