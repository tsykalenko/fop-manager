"use client";

import { useState } from "react";
import CustomSelect from "../ui/CategorySelect"; // 👈 Імпортуємо

interface Transaction {
  id: number;
  date: string;
  invoice_number: string | null;
  type: 'income' | 'expense';
  amount: string;
  expense_amount: string;
  full_value: string | null;
  writeoff_amount: string;
  payment_method: string;
  payment_status: 'paid' | 'unpaid';
  status: 'pending' | 'approved' | 'rejected';
  category: string;
  comment: string | null;
}

interface Props {
  item: Transaction;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: any) => Promise<void>;
}

export default function EditModal({ item, isOpen, onClose, onSave }: Props) {
  const [formData, setFormData] = useState({
    invoice_number: item.invoice_number || "",
    amount: item.amount || "",
    expense_amount: item.expense_amount || "",
    full_value: item.full_value || "",
    writeoff_amount: item.writeoff_amount || "",
    payment_method: item.payment_method,
    payment_status: item.payment_status,
    comment: item.comment || "",
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const isPromo = formData.payment_method.includes('Бонус') || formData.payment_method.includes('Акція');

  // ОПЦІЇ
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const payload = {
      ...item,
      ...formData,
      amount: Number(formData.amount),
      expense_amount: Number(formData.expense_amount),
      full_value: isPromo ? (Number(formData.full_value) || Number(formData.expense_amount)) : null,
      writeoff_amount: Number(formData.writeoff_amount),
    };

    await onSave(payload);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Редагування запису</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Назва</label>
            <input 
              type="text" 
              value={formData.invoice_number}
              onChange={e => setFormData({...formData, invoice_number: e.target.value})}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm font-semibold outline-none focus:border-emerald-500"
            />
          </div>

          <div className={`grid gap-3 ${isPromo ? 'grid-cols-2' : 'grid-cols-3'}`}>
             <div>
                <label className="text-[10px] font-bold text-emerald-600 uppercase mb-1 block">Дохід</label>
                <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full border border-emerald-100 bg-emerald-50/50 rounded-xl p-3 text-sm font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-200" />
             </div>
             <div>
                <label className="text-[10px] font-bold text-red-500 uppercase mb-1 block">{isPromo ? "Сплачено" : "Витрата"}</label>
                <input type="number" value={formData.expense_amount} onChange={e => setFormData({...formData, expense_amount: e.target.value})} className="w-full border border-red-100 bg-red-50/50 rounded-xl p-3 text-sm font-bold text-red-600 outline-none focus:ring-2 focus:ring-red-200" />
             </div>
             {isPromo && (
                <div className="animate-in fade-in zoom-in duration-300">
                    <label className="text-[10px] font-bold text-purple-600 uppercase mb-1 block">Повна вартість</label>
                    <input type="number" value={formData.full_value} onChange={e => setFormData({...formData, full_value: e.target.value})} className="w-full border border-purple-200 bg-purple-50 rounded-xl p-3 text-sm font-bold text-purple-700 outline-none focus:ring-2 focus:ring-purple-300" placeholder="10000" />
                </div>
             )}
             <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Списання</label>
                <input type="number" value={formData.writeoff_amount} onChange={e => setFormData({...formData, writeoff_amount: e.target.value})} className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-slate-200" />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Оплата / Тип</label>
                {/* 👇 ВИКОРИСТОВУЄМО НАШ КОМПОНЕНТ */}
                <CustomSelect 
                    value={formData.payment_method} 
                    onChange={(val) => setFormData({...formData, payment_method: val})} 
                    options={methodOptions} 
                />
             </div>
             <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Статус оплати</label>
                {/* 👇 ВИКОРИСТОВУЄМО НАШ КОМПОНЕНТ */}
                <CustomSelect 
                    value={formData.payment_status} 
                    onChange={(val) => setFormData({...formData, payment_status: val as any})} 
                    options={statusOptions} 
                />
             </div>
          </div>

           <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Коментар</label>
            <input type="text" value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})} className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-600 outline-none focus:border-emerald-500" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition">Скасувати</button>
            <button type="submit" disabled={isSaving} className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-emerald-600 transition shadow-lg">
                {isSaving ? "Збереження..." : "Зберегти зміни"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}