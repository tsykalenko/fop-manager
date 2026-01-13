"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SalaryTab() {
  // Початковий стан — null, бо ми ще не знаємо налаштувань
  const [settings, setSettings] = useState<any>(null);
  const [localSettings, setLocalSettings] = useState<any>({ daily_rate: 0, percent: 0 }); // Додаємо дефолтні значення, щоб не падало
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    // Спробуємо взяти налаштування
    const { data, error } = await supabase.from("salary_settings").select("*").single();
    
    if (data) {
      setSettings(data);
      setLocalSettings(data);
    } else {
      // Якщо налаштувань ще немає в базі, створюємо дефолтні
      const defaultSettings = { daily_rate: 0, percent: 0 };
      setLocalSettings(defaultSettings);
    }
    setLoading(false);
  }

  const handleSave = async () => {
    setSaving(true);
    // Якщо запис вже є — оновлюємо (id), якщо немає — створюємо новий
    const payload = { ...localSettings, id: settings?.id }; 
    
    // Upsert = Update or Insert
    const { data, error } = await supabase.from("salary_settings").upsert(payload).select().single();
    
    if (!error && data) {
        setSettings(data);
        alert("Налаштування збережено! ✅");
    } else {
        alert("Помилка збереження ❌");
    }
    setSaving(false);
  };

  // 🔥 ГОЛОВНИЙ ЗАХИСТ: Якщо вантажиться — показуємо спіннер
  if (loading) {
      return (
          <div className="p-12 text-center flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
              <div className="text-slate-400 text-sm font-bold">Завантаження налаштувань...</div>
          </div>
      );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
            ⚙️ Налаштування Зарплати
        </h2>
        
        <div className="space-y-5">
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Ставка в день (грн)</label>
                <input 
                    type="number" 
                    value={localSettings.daily_rate} // Тепер тут точно є число, бо ми дали дефолтні значення
                    onChange={e => setLocalSettings({...localSettings, daily_rate: Number(e.target.value)})} 
                    className="w-full text-lg font-bold border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition"
                />
            </div>

            <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Відсоток від каси (%)</label>
                <input 
                    type="number" 
                    value={localSettings.percent} 
                    onChange={e => setLocalSettings({...localSettings, percent: Number(e.target.value)})} 
                    className="w-full text-lg font-bold border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition"
                />
            </div>

            <button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-emerald-200 active:scale-[0.98] transition mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {saving ? "Збереження..." : "Зберегти зміни"}
            </button>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
                Ці налаштування будуть використовуватись для автоматичного розрахунку зарплати продавця при закритті зміни.
            </p>
        </div>
    </div>
  );
}