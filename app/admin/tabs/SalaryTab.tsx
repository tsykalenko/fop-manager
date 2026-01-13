"use client";
import { useState } from "react";
import { SalarySettings } from "../types";

interface Props {
  settings: SalarySettings;
  onSave: (s: SalarySettings) => Promise<void>;
  history: any[];
}

export default function SalaryTab({ settings, onSave, history }: Props) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
      setLoading(true);
      await onSave(localSettings);
      setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="font-bold text-lg mb-4 text-slate-700">⚙️ Формула розрахунку ЗП</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Ставка в день (грн)</label>
                    <input type="number" value={localSettings.daily_rate} onChange={e => setLocalSettings({...localSettings, daily_rate: Number(e.target.value)})} className="w-full border-b-2 border-emerald-100 focus:border-emerald-500 outline-none py-2 text-2xl font-bold" />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Відсоток (%)</label>
                    <input type="number" step="0.01" value={localSettings.percent_rate} onChange={e => setLocalSettings({...localSettings, percent_rate: Number(e.target.value)})} className="w-full border-b-2 border-emerald-100 focus:border-emerald-500 outline-none py-2 text-2xl font-bold" />
                </div>
            </div>
            <button onClick={handleSave} disabled={loading} className="mt-4 bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-emerald-700 transition">{loading ? "Збереження..." : "Зберегти"}</button>
        </div>
        
        <div className="space-y-4">
             <h2 className="font-bold text-lg text-slate-700 border-b pb-2">Історія виплат</h2>
             {history.filter(r => r.status === 'approved').map(item => (
                 <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
                     <div>
                         <div className="font-bold">{new Date(item.start_date).toLocaleDateString()} — {new Date(item.end_date).toLocaleDateString()}</div>
                         <div className="text-xs text-gray-500">{item.profiles?.full_name}</div>
                     </div>
                     <div className="text-right font-black text-emerald-600">{item.total_salary} ₴</div>
                 </div>
             ))}
        </div>
    </div>
  );
}