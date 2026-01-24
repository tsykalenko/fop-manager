"use client";

import { useState } from "react";

interface Props {
  onAdd: (item: any) => Promise<void>;
  currentDate: string;
}

export default function DailyForm({ onAdd, currentDate }: Props) {
  const [title, setTitle] = useState("");
  const [income, setIncome] = useState("");
  const [expense, setExpense] = useState("");
  const [writeoff, setWriteoff] = useState("");
  const [method, setMethod] = useState("Готівка");
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [userComment, setUserComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let finalComment = userComment;
    if (paymentStatus === 'unpaid') {
        finalComment = finalComment 
            ? `⚠️ БОРГ | ${finalComment}` 
            : "⚠️ БОРГ (Не оплачено)";
    }

    const newItem = {
      date: currentDate,
      invoice_number: title,
      type: 'income', 
      category: 'Звіт',
      amount: Number(income) || 0,           
      expense_amount: Number(expense) || 0,  
      writeoff_amount: Number(writeoff) || 0,
      payment_method: method,
      status: 'pending', 
      comment: finalComment 
    };

    await onAdd(newItem);
    setTitle(""); setIncome(""); setExpense(""); setWriteoff(""); setUserComment("");
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
        
        {/* Хедер */}
        <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg text-sm">✨</span>
                Додати запис за <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-4">{currentDate.split('-').reverse().join('.')}</span>
            </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-2 flex-1 flex flex-col gap-2">
            
            {/* БЛОК 1: НАЗВА (НА ВСЮ ШИРИНУ) */}
            <div className="w-full">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block ml-1">Що продали / купили?</label>
                <input 
                    required 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="Наприклад: Кава та десерти" 
                    className="w-full h-[45px] bg-slate-50 border border-slate-200 rounded-xl px-4 text-base font-semibold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 transition-all placeholder:font-normal placeholder:text-slate-400" 
                />
            </div>

            {/* БЛОК 2: ГРОШІ (3 колонки) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Дохід */}
                <div className="relative">
                    <label className="text-[10px] font-bold text-emerald-600 uppercase mb-1.5 block ml-1">Дохід</label>
                    <input 
                        type="number" value={income} onChange={e => setIncome(e.target.value)} placeholder="0" 
                        className="w-full h-[45px] bg-emerald-50/50 border border-emerald-100 rounded-xl px-3 pl-9 text-xl font-black text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-200 transition-all" 
                    />
                    <span className="absolute left-3.5 top-[40px] text-emerald-400 font-bold text-base">₴</span>
                </div>

                {/* Витрата */}
                <div className="relative">
                    <label className="text-[10px] font-bold text-red-500 uppercase mb-1.5 block ml-1">Витрата</label>
                    <input 
                        type="number" value={expense} onChange={e => setExpense(e.target.value)} placeholder="0" 
                        className="w-full h-[45px] bg-red-50/50 border border-red-100 rounded-xl px-3 pl-9 text-xl font-black text-red-600 outline-none focus:ring-2 focus:ring-red-200 transition-all" 
                    />
                    <span className="absolute left-3.5 top-[40px] text-red-300 font-bold text-base">₴</span>
                </div>

                {/* Списання */}
                <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block ml-1">Списання</label>
                    <input 
                        type="number" value={writeoff} onChange={e => setWriteoff(e.target.value)} placeholder="0" 
                        className="w-full h-[45px] bg-slate-50 border border-slate-200 rounded-xl px-3 pl-9 text-xl font-bold text-slate-600 outline-none focus:ring-2 focus:ring-slate-200 transition-all" 
                    />
                    <span className="absolute left-3.5 top-[40px] text-slate-300 font-bold text-base">₴</span>
                </div>
            </div>

            {/* БЛОК 3: ДЕТАЛІ (3 колонки) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Оплата */}
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block ml-1">Оплата</label>
                    <div className="relative">
                        <select value={method} onChange={e => setMethod(e.target.value)} className="w-full h-[50px] appearance-none border border-slate-200 rounded-xl px-4 text-sm bg-white outline-none focus:border-emerald-500 cursor-pointer text-slate-700 font-medium">
                            <option>Готівка</option>
                            <option>Банк (Термінал)</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▼</div>
                    </div>
                </div>

                {/* Статус */}
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block ml-1">Статус</label>
                    <div className="relative">
                        <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className={`w-full h-[45px] appearance-none border rounded-xl px-4 text-sm font-bold outline-none cursor-pointer ${paymentStatus === 'unpaid' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-white border-slate-200 text-slate-700'}`}>
                            <option value="paid">✅ Оплачено</option>
                            <option value="unpaid">⏳ Борг</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▼</div>
                    </div>
                </div>

                {/* Коментар */}
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block ml-1">Коментар</label>
                    <input type="text" value={userComment} onChange={e => setUserComment(e.target.value)} placeholder="..." className="w-full h-[45px] border border-slate-200 rounded-xl px-4 text-sm text-slate-600 outline-none focus:border-emerald-500" />
                </div>
            </div>

            {/* БЛОК 4: КНОПКА (НИЗ, ВСЯ ШИРИНА) */}
            <div className="mt-auto pt-2">
                <button 
                    type="submit" disabled={isSubmitting} 
                    className="w-full h-[45px] bg-slate-900 hover:bg-emerald-600 text-white rounded-xl font-bold text-base shadow-lg shadow-slate-200 transition-all active:scale-[0.99] flex items-center justify-center gap-3"
                >
                    {isSubmitting ? "Збереження..." : <><span>💾</span> Зберегти запис</>}
                </button>
            </div>

        </form>
    </div>
  );
}