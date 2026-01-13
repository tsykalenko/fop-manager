"use client";

interface Props {
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  onGenerate: () => void;
  validationError: string[] | null;
}

// ❌ БУЛО: export default function...
// ✅ МАЄ БУТИ (без слова default):
export function CreateReport({ startDate, setStartDate, endDate, setEndDate, onGenerate, validationError }: Props) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="font-bold text-lg mb-4 text-slate-700">Створити новий звіт</h2>
        {/* ... решта коду без змін ... */}
        <div className="flex flex-wrap gap-4 items-end">
            <div>
                <div className="text-xs font-bold text-gray-500 uppercase mb-1">З дати</div>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border p-2 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
                <div className="text-xs font-bold text-gray-500 uppercase mb-1">По дату</div>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border p-2 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <button onClick={onGenerate} className="bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-emerald-700 transition shadow-lg">Сформувати</button>
        </div>
        
        {validationError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 animate-fade-in-up">
                <div className="font-bold flex items-center gap-2">⛔ Неможливо створити звіт!</div>
                <p className="text-sm mt-1">Адміністратор ще не перевірив (не поставив статус "Вірно") записи за ці дні:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                    {validationError.map(date => (
                        <span key={date} className="bg-white border border-red-300 px-2 py-1 rounded text-xs font-bold shadow-sm">
                            {new Date(date).toLocaleDateString('uk-UA')}
                        </span>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
}