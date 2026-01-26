"use client";

import { useState } from "react";

interface Transaction {
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Props {
  currentDate: string;             
  onDateSelect: (date: string) => void; 
  items: Transaction[];            
}

export default function CalendarGrid({ currentDate, onDateSelect, items }: Props) {
  const [viewYear, setViewYear] = useState(new Date(currentDate).getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date(currentDate).getMonth());

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
  
  const monthNames = [
    "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
    "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
  ];

  const getDayStatusColor = (day: number) => {
    const checkDate = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayItems = items.filter(i => i.date === checkDate);

    if (dayItems.length === 0) return "bg-slate-50 border-transparent text-slate-600"; 

    if (dayItems.some(i => i.status === 'rejected')) return "bg-red-50 border-red-200 text-red-600 font-bold";
    if (dayItems.some(i => i.status === 'pending')) return "bg-yellow-50 border-yellow-200 text-yellow-600 font-bold";
    return "bg-emerald-50 border-emerald-200 text-emerald-600 font-bold";
  };

  const renderDays = () => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const days = [];

    // Зменшили висоту пустих клітинок (h-8)
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateString = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isSelected = dateString === currentDate;
      const statusClass = getDayStatusColor(d);

      days.push(
        <button
          key={d}
          onClick={() => onDateSelect(dateString)}
          // Зменшили висоту (h-8) і шрифт (text-xs)
          className={`
            h-8 rounded-md flex items-center justify-center text-xs border transition-all relative
            ${isSelected 
                ? "bg-slate-800 text-white border-slate-800 shadow-md transform scale-105 z-10" 
                : `${statusClass} hover:bg-white hover:border-slate-300 hover:shadow-sm`
            }
          `}
        >
          {d}
          {!isSelected && statusClass.includes("red") && <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-red-500"></span>}
          {!isSelected && statusClass.includes("yellow") && <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-yellow-500"></span>}
          {!isSelected && statusClass.includes("emerald") && <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-emerald-500"></span>}
        </button>
      );
    }
    return days;
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else { setViewMonth(viewMonth - 1); }
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else { setViewMonth(viewMonth + 1); }
  };

  return (
    // Зменшили паддінг (p-4)
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col justify-center">
        {/* Шапка календаря */}
        <div className="flex justify-between items-center mb-2">
            <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition text-xs">◀</button>
            <h2 className="font-bold text-slate-800 capitalize text-sm">
                {monthNames[viewMonth]} <span className="text-slate-400 font-medium ml-1">{viewYear}</span>
            </h2>
            <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition text-xs">▶</button>
        </div>

        {/* Дні тижня */}
        <div className="grid grid-cols-7 gap-1 mb-1">
            {weekDays.map(day => (
                <div key={day} className="text-center text-[9px] font-bold text-slate-300 uppercase">
                    {day}
                </div>
            ))}
        </div>

        {/* Сітка днів (gap-1) */}
        <div className="grid grid-cols-7 gap-1">
            {renderDays()}
        </div>
        
        {/* Легенда */}
        <div className="flex justify-center gap-3 mt-3 text-[9px] font-bold text-slate-400 uppercase">
             <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Звірено</div>
             <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> В процесі</div>
             <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Помилка</div>
        </div>
    </div>
  );
}