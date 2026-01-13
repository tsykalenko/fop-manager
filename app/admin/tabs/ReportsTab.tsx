"use client";
import { useState } from "react";

interface Props {
  savedReports: any[];
  onGenerate: (start: string, end: string) => Promise<any>;
  onApproveClick: (report: any) => void;
}

export default function ReportsTab({ savedReports, onGenerate, onApproveClick }: Props) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reportData, setReportData] = useState<any>(null);

  const handleGenerate = async () => {
    const data = await onGenerate(start, end);
    if (data) setReportData(data);
  };

  return (
    <div className="space-y-6">
        {/* Генератор */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="font-bold text-lg mb-4 text-slate-700">Перевірити період</h2>
            <div className="flex gap-4 items-end">
                <div><div className="text-xs font-bold uppercase text-gray-500 mb-1">З дати</div><input type="date" value={start} onChange={e => setStart(e.target.value)} className="border p-2 rounded-lg" /></div>
                <div><div className="text-xs font-bold uppercase text-gray-500 mb-1">По дату</div><input type="date" value={end} onChange={e => setEnd(e.target.value)} className="border p-2 rounded-lg" /></div>
                <button onClick={handleGenerate} className="bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-emerald-700 transition">Сформувати</button>
            </div>
        </div>

        {/* Результат генерації */}
        {reportData && (
            <div className="bg-white rounded-xl shadow-lg border border-emerald-500 overflow-hidden">
                <div className="bg-emerald-50 p-3 border-b border-emerald-100 font-bold text-emerald-800">Результат: {start} — {end}</div>
                <div className="p-4 grid grid-cols-4 font-bold text-center">
                    <div className="text-emerald-700">Дохід: {reportData.totalIncome}</div>
                    <div className="text-red-700">Витрата: {reportData.totalExpense}</div>
                    <div className="text-slate-600">Спис: {reportData.totalWriteoff}</div>
                </div>
            </div>
        )}

        {/* Список звітів */}
        <div className="space-y-4">
             <h2 className="font-bold text-lg text-slate-700 border-b pb-2">Вхідні звіти</h2>
             {savedReports.map(report => (
                 <div key={report.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                     <div className="flex items-center gap-4">
                        <span className="text-2xl">{report.status === 'approved' ? '✅' : '⏳'}</span>
                        <div>
                            <div className="font-bold">{new Date(report.start_date).toLocaleDateString()} — {new Date(report.end_date).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">Створив: {report.profiles?.full_name}</div>
                            {report.is_paid && <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded font-bold">💰 ВИПЛАЧЕНО</span>}
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                         {report.status === 'pending' ? (
                             <button onClick={() => onApproveClick(report)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold">Затвердити</button>
                         ) : (
                             <div className="text-right text-xs font-bold text-slate-500">ЗП: {report.total_salary} ₴</div>
                         )}
                     </div>
                 </div>
             ))}
        </div>
    </div>
  );
}