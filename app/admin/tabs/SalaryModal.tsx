"use client";
import { useState, useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  initialData: any;
}

export default function SalaryModal({ isOpen, onClose, onConfirm, initialData }: Props) {
  const [form, setForm] = useState({ salary: "", bonus: "", fine: "", comment: "" });

  useEffect(() => {
    if (initialData) {
        setForm({
            salary: initialData.salary || "",
            bonus: "",
            fine: "",
            comment: initialData.comment || ""
        });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const total = (Number(form.salary) || 0) + (Number(form.bonus) || 0) - (Number(form.fine) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up">
        <div className="bg-emerald-600 p-4 text-white font-bold text-center text-lg">💰 Нарахування ЗП</div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Основна ставка (Авто)</label>
            <input type="number" className="w-full border-b-2 border-gray-200 focus:border-emerald-500 outline-none py-2 text-xl font-bold text-gray-800"
              value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-emerald-600 uppercase">Бонус (+)</label>
              <input type="number" placeholder="0" className="w-full border-b-2 border-gray-200 focus:border-emerald-500 outline-none py-1 font-bold text-emerald-600"
                value={form.bonus} onChange={e => setForm({...form, bonus: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-red-600 uppercase">Штраф (-)</label>
              <input type="number" placeholder="0" className="w-full border-b-2 border-gray-200 focus:border-red-500 outline-none py-1 font-bold text-red-600"
                value={form.fine} onChange={e => setForm({...form, fine: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Коментар</label>
            <input type="text" className="w-full border border-gray-200 rounded p-2 text-sm outline-none"
              value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} />
          </div>
          <div className="pt-2 border-t flex justify-between items-center text-slate-800 font-bold">
            <span>До сплати:</span>
            <span className="text-2xl text-emerald-700">{total.toLocaleString()} ₴</span>
          </div>
        </div>
        <div className="grid grid-cols-2">
          <button onClick={onClose} className="bg-gray-100 py-3 font-bold hover:bg-gray-200 text-gray-600">Скасувати</button>
          <button onClick={() => onConfirm({ ...form, total })} className="bg-emerald-600 text-white py-3 font-bold hover:bg-emerald-700">Затвердити</button>
        </div>
      </div>
    </div>
  );
}