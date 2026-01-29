"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // Переконайся, що lucide-react встановлено
import { useInspection } from "@/context/InspectionContext";

const SECRET_PIN = "1111"; // 👈 Твій пароль тут

export default function InspectionToggle() {
  const { isInspectionMode, setInspectionMode } = useInspection();
  
  const [showPrompt, setShowPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleClick = () => {
    if (isInspectionMode) {
      // Якщо зараз ЗАЧИНЕНО -> Хочемо відкрити -> Питаємо пароль
      setShowPrompt(true);
    } else {
      // Якщо зараз ВІДКРИТО -> Хочемо закрити -> Закриваємо миттєво
      setInspectionMode(true);
    }
  };

  const verifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === SECRET_PIN) {
      setInspectionMode(false); // Відкриваємо око
      setShowPrompt(false);
      setPassword("");
      setError(false);
    } else {
      setError(true);
      setPassword("");
    }
  };

  return (
    <div className="relative">
      {/* КНОПКА-ОКО */}
      <button 
        onClick={handleClick}
        className={`p-2 rounded-full transition-all duration-300 shadow-sm border ${
            isInspectionMode 
            ? "bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200" // Закрито (Тільки банк)
            : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100" // Відкрито (Всі дані)
        }`}
        title={isInspectionMode ? "Показати приховані дані" : "Приховати готівку"}
      >
        {isInspectionMode ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>

      {/* МОДАЛКА ПАРОЛЯ */}
      {showPrompt && (
        <>
            {/* Прозорий фон, щоб закрити кліком повз */}
            <div className="fixed inset-0 z-40" onClick={() => setShowPrompt(false)}></div>
            
            <div className="absolute top-12 right-0 bg-white p-4 rounded-xl shadow-2xl border border-slate-200 w-64 z-50 animate-in fade-in zoom-in duration-200">
                <form onSubmit={verifyPassword} className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase text-center">Введіть PIN</label>
                    <input 
                        autoFocus
                        type="password" 
                        className={`w-full border rounded-lg p-2 text-center font-bold text-lg tracking-widest outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-slate-200'}`}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••"
                        maxLength={4}
                    />
                    <div className="grid grid-cols-2 gap-2 mt-1">
                        <button type="button" onClick={() => setShowPrompt(false)} className="bg-slate-100 text-slate-600 text-xs font-bold py-2 rounded-lg hover:bg-slate-200">Скасувати</button>
                        <button type="submit" className="bg-slate-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-emerald-600">ОК</button>
                    </div>
                </form>
            </div>
        </>
      )}
    </div>
  );
}