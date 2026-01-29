"use client";

import { useState } from "react"; // Якщо використовується для стану вкладок
import DailyManager from "@/components/daily-report/DailyManager"; 
import Navbar from "@/components/Navbar"; // Якщо є

// 👇 1. Додаємо імпорти для "Ока"
import { InspectionProvider } from "@/context/InspectionContext";
import InspectionToggle from "@/components/ui/InspectionToggle";

export default function SellerPage() {
  // Якщо у тебе тут є якась логіка вкладок, залиш її без змін
  
  return (
    // 👇 2. ОГОРАТАЄМО ВСЕ В PROVDIER
    <InspectionProvider>
        <div className="min-h-screen bg-slate-50 p-4 pb-20">
            
            {/* ШАПКА ПРОДАВЦЯ */}
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 relative">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">👋 Привіт, Продавець</h1>
                    <p className="text-slate-500 text-xs">Гарної зміни!</p>
                </div>

                {/* 👇 3. Додаємо кнопку-око (щоб можна було швидко все приховати) */}
                <div className="flex items-center gap-4">
                     <InspectionToggle />
                </div>
            </div>

            {/* ОСНОВНИЙ КОНТЕНТ */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 md:p-6">
                <DailyManager />
            </div>

        </div>
    </InspectionProvider>
  );
}