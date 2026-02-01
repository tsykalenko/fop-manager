// components/all-records/components/RecordsTable.tsx
import { useMemo, Fragment } from "react"; // 👈 Додав імпорт Fragment
import { Transaction } from "../types";
import { groupTransactionsByDate } from "../lib/sync-logic";
import RecordsRow from "./RecordsRow";

interface Props {
    items: Transaction[];
    onPayClick: (item: Transaction) => void;
}

export default function RecordsTable({ items, onPayClick }: Props) {
    const groups = useMemo(() => groupTransactionsByDate(items), [items]);

    if (items.length === 0) {
        return <div className="text-center py-10 text-slate-400">Записів не знайдено</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase border-b border-slate-200 whitespace-nowrap sticky top-0 z-20">
                    <tr>
                        <th className="p-3 w-[100px]">Дата</th>
                        <th className="p-3">Назва</th>
                        <th className="p-3 text-right">Витрата</th>
                        <th className="p-3 text-right">Дохід</th>
                        <th className="p-3 text-center">Спис.</th>
                        <th className="p-3 text-right">Націнка</th>
                        <th className="p-3 text-center">Форма</th>
                        <th className="p-3 text-center">Статус</th>
                        <th className="p-3 text-center">Платник</th>
                        <th className="p-3 text-center">Дата оплати</th>
                        <th className="p-3 text-right w-[100px]">Дія</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {groups.map(group => (
                        /* 👇 ЗАМІНИВ <> НА <Fragment key={...}> */
                        <Fragment key={group.date}>
                            {/* Рядок-розділювач дати */}
                            <tr className="bg-slate-50/80">
                                <td colSpan={11} className="py-2 px-3 text-xs font-bold text-slate-600 border-y border-slate-200">
                                    <div className="flex items-center gap-2">
                                        <span>📅 {group.date}</span>
                                        {group.hasDebt && (
                                            <span className="text-[10px] text-red-500 bg-red-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                Є борг
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                            
                            {/* Самі записи за цю дату */}
                            {group.items.map(item => (
                                <RecordsRow key={item.id} item={item} onPayClick={onPayClick} />
                            ))}
                        </Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
}