// components/all-records/components/ArchiveCalendar.tsx
"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Transaction } from "../types";
import { getDayStatusColor } from "../lib/sync-logic";

interface Props {
    selectedDate: string | null; // null, якщо ми дивимось "всі записи", або дата для фільтру
    onDateSelect: (date: string | null) => void;
    items: Transaction[];
}

export default function ArchiveCalendar({ selectedDate, onDateSelect, items }: Props) {
    // Поточний місяць, який ми переглядаємо в календарі
    const [viewDate, setViewDate] = useState(new Date());

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    
    // Коригування для України (понеділок - перший день)
    const startOffset = firstDay === 0 ? 6 : firstDay - 1; 
    const daysInMonth = getDaysInMonth(year, month);
    const totalSlots = Math.ceil((daysInMonth + startOffset) / 7) * 7;

    const changeMonth = (delta: number) => {
        setViewDate(new Date(year, month + delta, 1));
    };

    const monthNames = [
        "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
        "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            {/* Шапка календаря */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
                    <ChevronLeft size={20} />
                </button>
                <span className="font-bold text-slate-700 capitalize">
                    {monthNames[month]} {year}
                </span>
                <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Сітка днів */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map(d => (
                    <div key={d} className="text-slate-400 font-medium">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: totalSlots }).map((_, i) => {
                    const dayNum = i - startOffset + 1;
                    
                    if (dayNum <= 0 || dayNum > daysInMonth) {
                        return <div key={i} className="h-9"></div>;
                    }

                    // Форматуємо дату в YYYY-MM-DD
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    
                    // Визначаємо статус дня (Green/Red)
                    const status = getDayStatusColor(dateStr, items);
                    const isSelected = selectedDate === dateStr;

                    // Стилі для індикатора
                    let bgClass = "bg-slate-50 text-slate-700 hover:bg-slate-100";
                    let statusDot = null;

                    if (isSelected) {
                        bgClass = "bg-blue-600 text-white shadow-md ring-2 ring-blue-200";
                    } else if (status === 'red') {
                        bgClass = "bg-red-50 text-slate-800 border border-red-100 hover:bg-red-100";
                        statusDot = <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>;
                    } else if (status === 'green') {
                        bgClass = "bg-emerald-50 text-slate-800 border border-emerald-100 hover:bg-emerald-100";
                        statusDot = <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500"></div>;
                    }

                    return (
                        <button
                            key={i}
                            onClick={() => onDateSelect(isSelected ? null : dateStr)} // Клік повторно знімає фільтр
                            className={`h-9 rounded-lg flex flex-col items-center justify-center relative transition-all text-sm font-medium ${bgClass}`}
                        >
                            {dayNum}
                            {statusDot}
                        </button>
                    );
                })}
            </div>
            
            {/* Легенда */}
            <div className="flex justify-center gap-4 mt-4 text-[10px] text-slate-500">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Оплачено</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>Борг</div>
            </div>
        </div>
    );
}