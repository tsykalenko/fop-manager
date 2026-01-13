"use client";
export default function SalaryTab({ salaries }: { salaries: any[] }) {
  return (
    <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 border-b border-slate-800">
                <h2 className="font-bold text-lg">Моя Зарплата</h2>
                <p className="text-slate-400 text-xs">Історія нарахувань за зміни</p>
            </div>
            <div className="divide-y divide-slate-100">
                {salaries.map(salary => (
                    <div key={salary.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50 transition">
                        <div>
                            <div className="font-bold text-slate-700 text-base mb-1">
                                Зміна: {new Date(salary.start_date).toLocaleDateString('uk-UA')} — {new Date(salary.end_date).toLocaleDateString('uk-UA')}
                            </div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                                Оборот: {salary.total_income} ₴
                            </div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-right">
                                <div className="text-[10px] text-slate-400 uppercase font-bold">До виплати</div>
                                <div className="text-2xl font-black text-emerald-600">{salary.total_salary} ₴</div>
                            </div>
                            <div>
                                {salary.is_paid ? (
                                    <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-2 border border-blue-200">✅ Отримано</span>
                                ) : (
                                    <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-2 border border-orange-200 animate-pulse">⏳ Очікує</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {salaries.length === 0 && <div className="p-10 text-center text-slate-400">Поки що немає зарплати</div>}
            </div>
        </div>
    </div>
  );
}