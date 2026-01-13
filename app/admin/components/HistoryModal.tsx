"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function HistoryModal({ transactionId }: { transactionId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const openHistory = async () => {
    setIsOpen(true);
    setLoading(true);
    const { data } = await supabase.from("transaction_logs").select("*, profiles(full_name)").eq("transaction_id", transactionId).order("created_at", { ascending: false });
    if (data) setLogs(data);
    setLoading(false);
  };

  if (!isOpen) return <button onClick={openHistory} className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold px-2 py-1 rounded border border-slate-300 transition" title="Історія">🕒</button>;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800">Історія змін</h3>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500">×</button>
        </div>
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
            {loading && <div className="text-center text-slate-400">Завантаження...</div>}
            {!loading && logs.length === 0 && <div className="text-center text-slate-400 py-4">Змін не було</div>}
            {logs.map((log) => (
                <div key={log.id} className="text-sm border rounded-lg p-3 bg-slate-50">
                    <div className="flex justify-between items-start mb-2">
                        <div><span className="font-bold text-slate-700">{log.profiles?.full_name || "Невідомий"}</span><span className="text-slate-400 text-xs ml-2">{new Date(log.created_at).toLocaleString('uk-UA')}</span></div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${log.change_type === 'UPDATE' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>{log.change_type === 'UPDATE' ? 'Редаговано' : 'Видалено'}</span>
                    </div>
                    {log.change_type === 'UPDATE' && log.old_data && log.new_data && (
                        <div className="text-xs bg-white p-2 rounded border border-slate-200 space-y-1">
                             {Object.keys(log.new_data).map(key => {
                                if (log.old_data[key] != log.new_data[key] && key !== 'admin_check') {
                                    return <div key={key} className="flex justify-between border-b border-slate-50 py-0.5 last:border-0"><span className="text-slate-400">{key}:</span><span className="flex gap-2"><span className="line-through text-red-400">{log.old_data[key]}</span> → <span className="font-bold text-emerald-600">{log.new_data[key]}</span></span></div>
                                }
                                return null;
                             })}
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}