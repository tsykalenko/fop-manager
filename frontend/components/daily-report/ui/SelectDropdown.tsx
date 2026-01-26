"use client";

import { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
  className?: string; // Щоб передавати кольори (синій/фіолетовий)
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
}

export default function CustomSelect({ value, onChange, options, placeholder }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Закриваємо меню при кліку поза межами
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Кнопка-тригер */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`
            w-full h-[42px] bg-white border rounded-lg px-3 flex items-center justify-between cursor-pointer transition-all select-none
            ${isOpen ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-slate-300'}
        `}
      >
        <span className={`text-xs font-bold truncate ${selectedOption?.className || 'text-slate-700'}`}>
          {selectedOption ? selectedOption.label : placeholder || "Оберіть..."}
        </span>
        
        {/* Стрілочка */}
        <span className={`text-slate-400 text-[10px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            ▼
        </span>
      </div>

      {/* Випадаюче меню */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="max-h-[200px] overflow-y-auto py-1">
                {options.map((option) => (
                    <div
                        key={option.value}
                        onClick={() => {
                            onChange(option.value);
                            setIsOpen(false);
                        }}
                        className={`
                            px-4 py-2.5 text-xs font-bold cursor-pointer transition-colors flex items-center gap-2
                            ${value === option.value ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                            ${option.className || ''}
                        `}
                    >
                        {/* Якщо вибрано - показуємо галочку */}
                        {value === option.value && <span className="text-emerald-500">✔</span>}
                        {option.label}
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}