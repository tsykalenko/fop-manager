"use client";

interface Props {
  data: any;
  startDate: string;
  endDate: string;
  onSave: () => void;
}

// ✅ Тільки export function (без default)
export function ReportPreview({ data, startDate, endDate, onSave }: Props) {
  if (!data) return null;
  // ... ваш код таблиці ...
  return (
    <div className="bg-white rounded-xl shadow-lg border border-emerald-500 overflow-hidden animate-fade-in-up">
       {/* ... вміст ... */}
        <div className="bg-emerald-50 p-3 border-b border-emerald-100 flex justify-between items-center">
            <h3 className="font-bold text-emerald-800">Період: {new Date(startDate).toLocaleDateString('uk-UA')} — {new Date(endDate).toLocaleDateString('uk-UA')}</h3>
            <button onClick={onSave} className="bg-emerald-600 text-white text-sm font-bold py-1.5 px-4 rounded hover:bg-emerald-700 shadow animate-pulse">✅ Відправити Адміну</button>
        </div>
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-500 uppercase text-[10px] tracking-wider">
                <tr><th className="px-4 py-2">Дата</th><th className="px-4 py-2 text-center text-emerald-600">Дохід</th><th className="px-4 py-2 text-center text-red-600">Витрата</th><th className="px-4 py-2 text-center text-slate-500">Списання</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {data.dailyData.map((day: any) => (
                    <tr key={day.date} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-bold text-slate-700 border-r border-gray-100">{new Date(day.date).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', weekday: 'short' })}</td>
                        <td className="px-4 py-3 text-center font-bold text-emerald-600">{day.income > 0 ? day.income : <span className="text-gray-300">-</span>}</td>
                        <td className="px-4 py-3 text-center font-bold text-red-600">{day.expense > 0 ? day.expense : <span className="text-gray-300">-</span>}</td>
                        <td className="px-4 py-3 text-center font-bold text-slate-400">{day.writeoff > 0 ? day.writeoff : <span className="text-gray-300">-</span>}</td>
                    </tr>
                ))}
                <tr className="bg-gray-800 text-white font-black border-t-2 border-emerald-500 text-base">
                    <td className="px-4 py-3 uppercase tracking-widest text-xs">Всього:</td>
                    <td className="px-4 py-3 text-center text-emerald-300">{data.totalIncome} ₴</td>
                    <td className="px-4 py-3 text-center text-red-300">{data.totalExpense} ₴</td>
                    <td className="px-4 py-3 text-center text-gray-400">{data.totalWriteoff} ₴</td>
                </tr>
            </tbody>
        </table>
    </div>
  );
}