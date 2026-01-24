"use client";

interface Transaction {
  id: number;
  date: string;
  invoice_number: string | null;
  type: 'income' | 'expense';
  
  amount: string;          
  expense_amount: string;  
  writeoff_amount: string; 
  
  payment_method: string;
  status: 'pending' | 'approved' | 'rejected';
  category: string;
  comment: string | null;
}

interface Props {
  items: Transaction[];
  loading: boolean;
}

export default function DailyTable({ items, loading }: Props) {
    
  return (
    <div className="space-y-4"> {/* Було space-y-6, стало менше відступів між блоками */}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
             <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-400 font-bold text-xs uppercase">
                    <tr>
                        {/* 👇 ТУТ ЗМІНЮЄМО РОЗМІР ЗАГОЛОВКІВ (p-2 замість p-4) */}
                        <th className="p-2 w-[40px]">Статус</th>
                        <th className="p-2">Назва</th>
                        <th className="p-2 text-right">Дохід</th>
                        <th className="p-2 text-right">Витрата</th>
                        <th className="p-2 text-center">Списання</th>
                        <th className="p-2 text-right">Націнка (%)</th>
                        <th className="p-2">Коментар</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {loading ? (
                        <tr><td colSpan={7} className="p-6 text-center text-slate-400">Завантаження...</td></tr>
                    ) : items.length === 0 ? (
                        <tr><td colSpan={7} className="p-6 text-center text-slate-400">Поки що записів немає</td></tr>
                    ) : (
                        items.map(item => {
                            const income = Number(item.amount);
                            const expense = Number(item.expense_amount || 0);
                            const writeoff = Number(item.writeoff_amount || 0);
                            
                            let markup = 0;
                            let markupText = "—";
                            let markupColor = "text-slate-300";

                            if (expense > 0) {
                                const effectiveIncome = income - writeoff;
                                const profit = effectiveIncome - expense;
                                markup = (profit / expense) * 100;
                                markupText = `${markup.toFixed(1)}%`;

                                if (markup >= 30) markupColor = "text-emerald-600 font-black"; 
                                else if (markup > 0) markupColor = "text-emerald-500 font-bold"; 
                                else if (markup === 0) markupColor = "text-slate-400"; 
                                else markupColor = "text-red-500 font-bold"; 
                            }

                            return (
                                <tr key={item.id} className="hover:bg-slate-50 transition">
                                    {/* 👇 ТУТ ЗМІНЮЄМО РОЗМІР КЛІТИНОК (p-2 замість p-4) */}
                                    <td className="p-2">
                                        {item.status === 'pending' && <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-sm animate-pulse" title="На перевірці"></span>}
                                        {item.status === 'approved' && <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" title="Перевірено"></span>}
                                        {item.status === 'rejected' && <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" title="Помилка"></span>}
                                    </td>
                                    
                                    <td className="p-2 font-medium text-slate-800 text-xs"> {/* text-xs робить шрифт меншим */}
                                        {item.invoice_number}
                                        <div className="text-[9px] text-slate-400 uppercase mt-0.5">{item.payment_method}</div>
                                    </td>

                                    <td className="p-2 text-right font-bold text-emerald-600 text-xs">
                                        {income > 0 ? `+${income}` : "—"}
                                    </td>

                                    <td className="p-2 text-right font-bold text-red-500 text-xs">
                                        {expense > 0 ? `-${expense}` : "—"}
                                    </td>

                                    <td className="p-2 text-center text-slate-500 text-xs">
                                        {writeoff > 0 ? `${writeoff}` : "—"}
                                    </td>

                                    <td className={`p-2 text-right text-xs ${markupColor}`}>
                                        {markupText}
                                    </td>
                                    
                                    <td className="p-2 text-[10px] text-slate-500 max-w-[120px] truncate">
                                        {item.comment}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
             </table>
        </div>
    </div>
  );
}