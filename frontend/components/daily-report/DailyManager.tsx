"use client";

import { useState, useEffect } from "react";

// 👇 Оновлені імпорти (нові назви файлів)
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
  
  // 👇 Виправив тип (було 'nullable|numeric')
  full_value: string | null; 

  writeoff_amount: string;
  payment_method: string;
  payment_status: 'paid' | 'unpaid';
  status: 'pending' | 'approved' | 'rejected';
  category: string;
  comment: string | null;
}

export default function DailyManager() { // 👇 Перейменував компонент на Manager
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // 👇 Стейт для відкриття модалки імпорту
  const [isImportOpen, setIsImportOpen] = useState(false);

  const loadData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/transactions", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.status === 401) { window.location.href = "/"; return; }
      
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredItems = items.filter(i => i.date === selectedDate);

  const handleAddNewItem = async (newItem: any) => {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch("http://localhost:8080/api/transactions", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newItem)
        });

        if (res.ok) {
            loadData();
        } else {
            alert("Помилка збереження!");
        }
    } catch (error) {
        console.error(error);
        alert("Помилка з'єднання");
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
        
        {/* ВЕРХНІЙ БЛОК: Календар + Форма */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
            
            {/* 1. КАЛЕНДАР (Займає 4 з 12 колонок) */}
            <div className="xl:col-span-4 h-full">
                <HistoryCalendar 
                    currentDate={selectedDate}
                    onDateSelect={setSelectedDate} 
                    items={items} 
                />
            </div>

            {/* 2. ФОРМА (Займає 8 з 12 колонок) */}
            <div className="xl:col-span-8 h-full">
                <TransactionForm 
                    onAdd={handleAddNewItem} 
                    currentDate={selectedDate} 
                />
            </div>
        </div>

        {/* НИЖНІЙ БЛОК: Таблиця */}
        <div>
            {/* Заголовок таблиці та кнопки */}
            <div className="flex items-center justify-between mb-4 px-2">
                 <div>
                     <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        📜 Історія операцій
                        <span className="text-slate-400 text-sm font-normal">| {selectedDate}</span>
                     </h2>
                 </div>
                 
                 <div className="flex items-center gap-3">
                    {/* 👇 НОВА КНОПКА ЕКСПОРТУ */}
                    <button 
                        onClick={() => exportTransactionsToExcel(filteredItems, selectedDate)}
                        className="text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 px-3 py-1.5 rounded-lg transition flex items-center gap-1 shadow-sm"
                    >
                        📥 Експорт
                    </button>

                    {/* 👇 КНОПКА ІМПОРТУ */}
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

        {/* 👇 МОДАЛКА ІМПОРТУ */}
        <ImportModal 
            isOpen={isImportOpen} 
            onClose={() => setIsImportOpen(false)} 
            onSuccess={loadData} 
        />

    </div>
  );
}