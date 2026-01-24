"use client";

import { useState, useEffect } from "react";

interface Transaction {
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Props {
  currentDate: string;             // Яка дата зараз вибрана
  onDateSelect: (date: string) => void; // Функція при кліку на день
  items: Transaction[];            // Список всіх транзакцій (щоб малювати кольори)
}

export default function CalendarGrid({ currentDate, onDateSelect, items }: Props) {
  // Внутрішній стан календаря (який місяць ми зараз дивимось)
  // За замовчуванням - місяць поточної вибраної дати
  const [viewYear, setViewYear] = useState(new Date(currentDate).getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date(currentDate).getMonth());

  // Назви днів тижня (починаємо з Понеділка)
  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
  
  // Назви місяців
  const monthNames = [
    "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
    "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
  ];

  // Функція для отримання кольору дня
  const getDayStatusColor = (day: number) => {
    // Формуємо рядок дати YYYY-MM-DD
    // +1 бо місяці в JS з 0, padStart додає 0 перед числом (05 замість 5)
    const checkDate = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Шукаємо записи за цей день
    const dayItems = items.filter(i => i.date === checkDate);

    if (dayItems.length === 0) return "bg-slate-50 border-transparent"; // Пусто

    // Логіка пріоритетів:
    // 1. Якщо є хоч одна помилка (rejected) -> ЧЕРВОНИЙ
    if (dayItems.some(i => i.status === 'rejected')) return "bg-red-50 border-red-200 text-red-600 font-bold";
    
    // 2. Якщо є хоч одне неперевірене (pending) -> ЖОВТИЙ
    if (dayItems.some(i => i.status === 'pending')) return "bg-yellow-50 border-yellow-200 text-yellow-600 font-bold";
    
    // 3. Якщо все ок (approved) -> ЗЕЛЕНИЙ
    return "bg-emerald-50 border-emerald-200 text-emerald-600 font-bold";
  };

  // Генерація днів
  const renderDays = () => {
    // Перший день місяця
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    // Коригуємо, щоб понеділок був 0-м (в JS неділя - це 0)
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    // Кількість днів в місяці
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const days = [];

    // Пусті клітинки на початку місяця
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Дні
    for (let d = 1; d <= daysInMonth; d++) {
      const dateString = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isSelected = dateString === currentDate;
      const statusClass = getDayStatusColor(d);

      days.push(
        <button
          key={d}
          onClick={() => onDateSelect(dateString)}
          className={`
            h-10 rounded-lg flex items-center justify-center text-sm border transition-all relative
            ${isSelected 
                ? "bg-slate-800 text-white border-slate-800 shadow-md transform scale-105 z-10" 
                : `${statusClass} hover:bg-white hover:border-slate-300 hover:shadow-sm`
            }
          `}
        >
          {d}
          {/* Маленька крапочка-індикатор знизу */}
          {!isSelected && statusClass.includes("red") && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-red-500"></span>}
          {!isSelected && statusClass.includes("yellow") && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-yellow-500"></span>}
          {!isSelected && statusClass.includes("emerald") && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500"></span>}
        </button>
      );
    }
    return days;
  };

  // Навігація
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else { setViewMonth(viewMonth - 1); }
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else { setViewMonth(viewMonth + 1); }
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        {/* Шапка календаря */}
        <div className="flex justify-between items-center mb-4">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition">◀</button>
            <h2 className="font-bold text-slate-800 capitalize text-lg">
                {monthNames[viewMonth]} <span className="text-slate-400 font-medium ml-1">{viewYear}</span>
            </h2>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition">▶</button>
        </div>

        {/* Дні тижня */}
        <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map(day => (
                <div key={day} className="text-center text-[10px] font-bold text-slate-300 uppercase">
                    {day}
                </div>
            ))}
        </div>

        {/* Сітка днів */}
        <div className="grid grid-cols-7 gap-2">
            {renderDays()}
        </div>
        
        {/* Легенда */}
        <div className="flex justify-center gap-4 mt-4 text-[10px] font-bold text-slate-400 uppercase">
             <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Звірено</div>
             <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400"></span> В процесі</div>
             <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Помилка</div>
        </div>
    </div>
  );
}