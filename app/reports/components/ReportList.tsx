"use client";

interface Props {
  reports: any[];
  onTakeSalary: (report: any) => void;
}

// ✅ Тільки export function (без default)
export function ReportList({ reports, onTakeSalary }: Props) {
    // ... ваш код списку ...
  return (
    <div className="space-y-4">
        <h2 className="font-bold text-lg text-slate-700 border-b pb-2">Історія звітів</h2>
        {reports.length === 0 && <div className="text-gray-400 text-center py-4">Звітів поки немає</div>}
        
        {reports.map(report => (
            <div key={report.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-4 hover:shadow-md transition">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl text-xl shrink-0 ${report.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-yellow-100 text-yellow-600'}`}>
                            {report.status === 'approved' ? '✅' : '⏳'}
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 text-base">{new Date(report.start_date).toLocaleDateString('uk-UA')} — {new Date(report.end_date).toLocaleDateString('uk-UA')}</div>
                            <div className="text-xs text-gray-500 mt-1">Оборот: {report.total_income} ₴</div>
                        </div>
                    </div>

                    {report.status === 'approved' && (
                        <div className="w-full md:w-auto bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex flex-col items-center md:items-end gap-2">
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">До виплати:</div>
                            <div className="font-black text-2xl text-emerald-700">{report.total_salary} ₴</div>
                            
                            {report.is_paid ? (
                                <div className="mt-1 bg-blue-100 text-blue-800 px-3 py-1 rounded text-xs font-bold flex items-center gap-1">✔ Отримано</div>
                            ) : (
                                <button onClick={() => onTakeSalary(report)} className="mt-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded shadow-lg text-xs font-bold uppercase tracking-wide transition active:scale-95 flex items-center gap-2">💵 Взяти з каси</button>
                            )}
                        </div>
                    )}
                    {report.status === 'pending' && <div className="text-sm text-yellow-600 font-bold bg-yellow-50 px-3 py-1 rounded">На перевірці...</div>}
                </div>
            </div>
        ))}
    </div>
  );
}