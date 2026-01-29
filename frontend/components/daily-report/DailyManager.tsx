"use client";

import { useState, useEffect } from "react";
import { useInspection } from "@/context/InspectionContext"; // 👇 Підключаємось до глобального ока

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

  // 👇 Беремо стан із глобального контексту
  const { isInspectionMode } = useInspection();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const loadData = async () => {
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
        // Нормалізація даних
        const cleanData = rawData.map((item: any) => {
            const method = item.payment_method ? String(item.payment_method).toLowerCase() : "";
            const isBank = method.includes('банк') || method.includes('bank') || method.includes('card') || method.includes('термінал');
            const officialBoolean = item.is_official === true || item.is_official === 1 || item.is_official === "1" || isBank;
            return { ...item, is_official: officialBoolean };
        });
        setItems(cleanData);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // 👇 Фільтрація на основі глобального перемикача
  const filteredItems = items.filter(i => {
      const dateMatch = i.date === selectedDate;
      const officialMatch = isInspectionMode ? i.is_official === true : true;
      return dateMatch && officialMatch;
  });

  const handleAddNewItem = async (newItem: any) => {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${apiUrl}/api/transactions`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true"
            },
            body: JSON.stringify(newItem)
        });
        if (res.ok) { loadData(); } 
        else { alert("Помилка збереження"); }
    } catch (error) { console.error(error); alert("Помилка з'єднання"); }
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
                     {/* ТУТ БІЛЬШЕ НЕМАЄ КНОПКИ ПЕРЕМИКАННЯ */}
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