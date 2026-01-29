"use client";

import { useState } from "react";
import CustomSelect from "./ui/SelectDropdown"; 

interface Props {
  onAdd: (item: any) => Promise<void>;
  currentDate: string;
}

export default function DailyForm({ onAdd, currentDate }: Props) {
  const [title, setTitle] = useState("");
  const [income, setIncome] = useState("");
  const [expense, setExpense] = useState("");
  const [fullValue, setFullValue] = useState("");
  const [writeoff, setWriteoff] = useState("");
  
  const [method, setMethod] = useState("Готівка");
  const [paymentStatus, setPaymentStatus] = useState("paid");
  
  const [userComment, setUserComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPromo = method.includes('Бонус') || method.includes('Акція');

  const methodOptions = [
    { value: "Готівка", label: "💵 Готівка" },
    { value: "Банк (Термінал)", label: "💳 Банк (Термінал)" },
    { value: "🎁 Бонус", label: "🎁 Бонус", className: "text-blue-600" },
    { value: "🔥 Акція", label: "🔥 Акція", className: "text-purple-600" },
  ];

  const statusOptions = [
    { value: "paid", label: "✅ Оплачено" },
    { value: "unpaid", label: "⏳ Борг", className: "text-orange-500" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 👇 ГОЛОВНА ЛОГІКА: Офіційно тільки якщо "Банк (Термінал)"
    const isOfficial = method === "Банк (Термінал)";

    const newItem = {
      date: currentDate,
      invoice_number: title,
      type: 'income', 
      category: 'Звіт',
      amount: Number(income) || 0,           
      expense_amount: Number(expense) || 0,
      full_value: isPromo ? (Number(fullValue) || Number(expense)) : null,
      writeoff_amount: Number(writeoff) || 0,
      payment_method: method,
      payment_status: paymentStatus, 
      status: 'pending', 
      comment: userComment,
      is_official: isOfficial // 👈 Автоматично визначаємо тут
    };

    await onAdd(newItem);
    setTitle(""); setIncome(""); setExpense(""); setFullValue(""); setWriteoff(""); setUserComment("");
    setPaymentStatus("paid");
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
        <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <span className="bg-emerald-100 text-emerald-600 p-1 rounded-md text-xs">✨</span>
                Додати запис за <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-4">{currentDate.split('-').reverse().join('.')}</span>
            </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 flex-1 flex flex-col gap-3 justify-center">
            <div className="w-full">
                <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block ml-1">Що продали / купили?</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Наприклад: Кава, Зарплата..." 
                className="w-full h-[42px] bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 transition-all placeholder:font-normal placeholder:text-slate-400" />
            </div>

            {/* ЦИФРИ */}
            <div className={`grid gap-3 ${isPromo ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
                <div className="relative">
                    <label className="text-[9px] font-bold text-emerald-600 uppercase mb-1 block ml-1">Дохід</label>
                    <input type="number" value={income} onChange={e => setIncome(e.target.value)} placeholder="0" className="w-full h-[42px] bg-emerald-50/50 border border-emerald-100 rounded-lg px-3 pl-7 text-lg font-black text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-200 transition-all" />
                    <span className="absolute left-3 top-[32px] text-emerald-400 font-bold text-sm">₴</span>
                </div>

                <div className="relative">
                    <label className="text-[9px] font-bold text-red-500 uppercase mb-1 block ml-1">{isPromo ? "Сплачено (Факт)" : "Витрата"}</label>
                    <input type="number" value={expense} onChange={e => setExpense(e.target.value)} placeholder="0" className="w-full h-[42px] bg-red-50/50 border border-red-100 rounded-lg px-3 pl-7 text-lg font-black text-red-600 outline-none focus:ring-2 focus:ring-red-200 transition-all" />
                    <span className="absolute left-3 top-[32px] text-red-300 font-bold text-sm">₴</span>
                </div>

                {isPromo && (
                    <div className="relative animate-in fade-in zoom-in duration-300">
                        <label className="text-[9px] font-bold text-purple-600 uppercase mb-1 block ml-1">Повна вартість</label>
                        <input type="number" value={fullValue} onChange={e => setFullValue(e.target.value)} placeholder="10000" className="w-full h-[42px] bg-purple-50 border border-purple-200 rounded-lg px-3 pl-7 text-lg font-black text-purple-700 outline-none focus:ring-2 focus:ring-purple-300 transition-all" />
                        <span className="absolute left-3 top-[32px] text-purple-400 font-bold text-sm">∑</span>
                    </div>
                )}

                <div className="relative">
                    <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block ml-1">Списання</label>
                    <input type="number" value={writeoff} onChange={e => setWriteoff(e.target.value)} placeholder="0" className="w-full h-[42px] bg-slate-50 border border-slate-200 rounded-lg px-3 pl-7 text-lg font-bold text-slate-600 outline-none focus:ring-2 focus:ring-slate-200 transition-all" />
                    <span className="absolute left-3 top-[32px] text-slate-300 font-bold text-sm">₴</span>
                </div>
            </div>

            {/* СЕЛЕКТИ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block ml-1">Оплата / Тип</label>
                    <CustomSelect 
                        value={method} 
                        onChange={setMethod} 
                        options={methodOptions} 
                    />
                </div>
                <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block ml-1">Статус</label>
                    <CustomSelect 
                        value={paymentStatus} 
                        onChange={(val) => setPaymentStatus(val as any)} 
                        options={statusOptions} 
                    />
                </div>
                <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block ml-1">Коментар</label>
                    <input type="text" value={userComment} onChange={e => setUserComment(e.target.value)} placeholder="..." className="w-full h-[42px] border border-slate-200 rounded-lg px-3 text-xs text-slate-600 outline-none focus:border-emerald-500" />
                </div>
            </div>

            <div className="mt-1">
                <button type="submit" disabled={isSubmitting} className="w-full h-[45px] bg-slate-900 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2">
                    {isSubmitting ? "Збереження..." : <><span>💾</span> Зберегти запис</>}
                </button>
            </div>
        </form>
    </div>
  );
}