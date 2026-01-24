"use client";

import { useState, useEffect } from "react";
import DailyForm from "./DailyForm";
import DailyTable from "./DailyTable";
import CalendarGrid from "./CalendarGrid";

interface Transaction {
  id: number;
  date: string;
  invoice_number: string | null;
  type: 'income' | 'expense';
  amount: string;
  expense_amount: string;
  writeoff_amount: string;
  payment_method: string;
  status: 'pending' | 'approved' | 'rejected';
  category: string;
  comment: string | null;
}

export default function DailyTab() {
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

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
            
            {/* 1. КАЛЕНДАР (Займає 4 з 12 колонок, тобто 1/3) */}
            <div className="xl:col-span-4 h-full">
                <CalendarGrid 
                    currentDate={selectedDate}
                    onDateSelect={setSelectedDate} 
                    items={items} 
                />
            </div>

            {/* 2. ФОРМА (Займає 8 з 12 колонок, тобто 2/3) */}
            <div className="xl:col-span-8 h-full">
                <DailyForm 
                    onAdd={handleAddNewItem} 
                    currentDate={selectedDate} 
                />
            </div>
        </div>

        {/* НИЖНІЙ БЛОК: Таблиця (На всю ширину) */}
        <div>
            {/* Заголовок таблиці */}
            <div className="flex items-center justify-between mb-4 px-2">
                 <div>
                     <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        📜 Історія операцій
                        <span className="text-slate-400 text-sm font-normal">| {selectedDate}</span>
                     </h2>
                 </div>
                 <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                    {filteredItems.length === 0 ? "Пусто" : `${filteredItems.length} записів`}
                 </div>
            </div>

            <DailyTable items={filteredItems} loading={loading} />
        </div>

    </div>
  );
}