"use client";
export default function HistoryTab({ items }: { items: any[] }) {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h2 className="font-bold text-slate-700 mb-4">Останні транзакції (Історія)</h2>
            <div className="space-y-2">
                {items.map(item => (
                    <div key={item.id} className="grid grid-cols-[100px_1fr_100px] gap-4 p-3 border rounded-lg bg-slate-50 items-center text-sm">
                        <div className="text-slate-400 text-xs font-bold">{new Date(item.date).toLocaleDateString('uk-UA')}</div>
                        <div className="font-medium truncate">{item.title}</div>
                        <div className={`text-right font-bold ${item.income > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {item.income > 0 ? `+${item.income}` : `-${item.expense}`}
                        </div>
                    </div>
                ))}
                {items.length === 0 && <div className="text-center text-slate-400 py-4">Історія пуста</div>}
            </div>
        </div>
    </div>
  );
}