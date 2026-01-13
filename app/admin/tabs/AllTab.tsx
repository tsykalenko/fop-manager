"use client";
import { Transaction } from "../../types";
import HistoryModal from "../components/HistoryModal"; // Перевір шлях

interface Props {
  items: Transaction[];
  updatePaymentInfo: (id: number, field: string, value: string) => Promise<void>;
  isAdmin?: boolean;
}

export default function AllTab({ items, updatePaymentInfo, isAdmin = false }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up">
       <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
             <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                <tr>
                   <th className="px-4 py-3">Дата</th>
                   <th className="px-4 py-3">Опис</th>
                   <th className="px-4 py-3 text-right">Сума</th>
                   <th className="px-4 py-3 text-center">Дія</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                   <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 text-slate-500 font-bold text-xs whitespace-nowrap">{new Date(item.date).toLocaleDateString('uk-UA')}</td>
                      <td className="px-4 py-3 font-medium text-slate-700">{item.title}</td>
                      <td className={`px-4 py-3 text-right font-bold ${item.income > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {item.income > 0 ? `+${item.income}` : `-${item.expense}`}
                      </td>
                      <td className="px-4 py-3">
                         <div className="flex items-center justify-center gap-2">
                             {isAdmin && item.id && <HistoryModal transactionId={item.id} />}
                             {/* Тут можуть бути твої інші кнопки */}
                         </div>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
          {items.length === 0 && <div className="p-8 text-center text-slate-300">Список порожній</div>}
       </div>
    </div>
  );
}