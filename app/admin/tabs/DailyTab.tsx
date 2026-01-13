"use client";
import { TransactionData, StatusBadge } from "../types";

interface Props {
  items: TransactionData[];
  updateStatus: (id: number, status: "valid" | "issue" | "pending") => void;
  approveAll: () => void;
}

export default function DailyTab({ items, updateStatus, approveAll }: Props) {
  const totalIncome = items.reduce((acc, i) => acc + i.income, 0);
  const totalExpense = items.reduce((acc, i) => acc + i.expense, 0);
  const totalWriteoff = items.reduce((acc, i) => acc + i.writeoff, 0);

  const getAutoStatus = (type: 'income' | 'expense' | 'writeoff') => {
      const relevantItems = items.filter(i => i[type] > 0);
      if (relevantItems.length === 0) return null;
      if (relevantItems.some(i => i.admin_check === 'issue')) return 'issue';
      if (relevantItems.some(i => i.admin_check === 'pending')) return 'pending';
      return 'valid';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className={`hidden md:grid md:grid-cols-[100px_3fr_1fr_1fr_1fr_100px] bg-gray-50 p-3 border-b text-[10px] font-bold text-gray-500 uppercase tracking-wider items-center sticky top-0 z-10`}>
            <div className="text-center">Статус</div><div className="pl-2">Опис операції</div><div className="text-center text-emerald-600">Дохід</div><div className="text-center text-red-600">Витрата</div><div className="text-center text-slate-500">Спис.</div><div className="text-center">Дія</div>
        </div>
        <div className="divide-y">
            {items.map(item => {
                const isCash = item.category === 'cash_drop';
                let rowBg = item.admin_check === 'valid' ? "bg-emerald-50/40" : item.admin_check === 'issue' ? "bg-yellow-50/40" : "bg-white";
                return (
                    <div key={item.id} className={`flex flex-col gap-3 p-4 md:grid md:grid-cols-[100px_3fr_1fr_1fr_1fr_100px] md:items-center text-sm ${rowBg}`}>
                         <div className="flex justify-between md:justify-center w-full">
                            <span className="md:hidden text-xs font-bold text-gray-400">Статус:</span>
                            {item.admin_check === 'pending' && <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-[10px] font-bold uppercase">На перевірці</span>}
                            {item.admin_check === 'valid' && <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Вірно</span>}
                            {item.admin_check === 'issue' && <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Не вірно</span>}
                        </div>
                        <div className="pl-0 md:pl-2">
                            <div className={`font-bold ${isCash ? 'text-blue-700' : 'text-slate-700'}`}>{item.title}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase flex gap-1 mt-0.5">👤 {item.profiles?.full_name || "Невідомий"} {item.payment_status === 'unpaid' && <span className="text-red-500 bg-red-100 px-1 rounded ml-1">БОРГ</span>}</div>
                            {item.admin_comment && <div className="mt-1 text-[11px] text-red-600 italic">🛡 {item.admin_comment}</div>}
                            {item.seller_comment && <div className="mt-1 text-[11px] text-blue-600 italic">👤 {item.seller_comment}</div>}
                        </div>
                        <div className="grid grid-cols-3 md:contents w-full text-center font-bold">
                            <div className="text-emerald-600">{!isCash && item.income > 0 ? item.income : "-"}</div>
                            <div className="text-red-500">{item.expense > 0 ? item.expense : "-"}</div>
                            <div className="text-slate-400">{!isCash && item.writeoff > 0 ? item.writeoff : "-"}</div>
                        </div>
                        <div className="flex justify-end gap-2 md:justify-center">
                            <button onClick={() => updateStatus(item.id!, 'valid')} className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 hover:text-emerald-600 transition">✔</button>
                            <button onClick={() => updateStatus(item.id!, 'issue')} className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 hover:text-orange-600 transition">?</button>
                        </div>
                    </div>
                );
            })}
            {items.length === 0 && <div className="p-10 text-center text-gray-400">В цей день записів немає</div>}
        </div>
        {items.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-[100px_3fr_1fr_1fr_1fr_100px] bg-white border-t-2 border-slate-200 p-3 items-center sticky bottom-0 z-20">
                <div className="hidden md:block"></div><div className="hidden md:block text-right pr-4 font-bold text-slate-500 text-xs uppercase">Всього:</div>
                <div className="flex flex-col items-center"><span className="font-black text-emerald-700">{totalIncome}</span><StatusBadge status={getAutoStatus('income')} /></div>
                <div className="flex flex-col items-center"><span className="font-black text-red-600">{totalExpense}</span><StatusBadge status={getAutoStatus('expense')} /></div>
                <div className="flex flex-col items-center"><span className="font-black text-slate-600">{totalWriteoff}</span><StatusBadge status={getAutoStatus('writeoff')} /></div>
                <div className="hidden md:block text-center"><button onClick={approveAll} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-2 px-3 rounded shadow transition">ВСЕ ОК</button></div>
            </div>
        )}
    </div>
  );
}