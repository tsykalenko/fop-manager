// components/all-records/components/RecordsRow.tsx
import { Transaction } from "../types";

interface Props {
    item: Transaction;
    onPayClick: (item: Transaction) => void;
}

export default function RecordsRow({ item, onPayClick }: Props) {
    const isIncome = item.type === 'income';
    const amount = Number(item.amount);
    const expense = Number(item.expense_amount || 0);
    const writeoff = Number(item.writeoff_amount || 0);

    // Розрахунок націнки (якщо є продажі)
    let markupText = "—";
    if (isIncome && expense > 0) {
        const profit = (amount - writeoff) - expense;
        const markup = (profit / expense) * 100;
        markupText = `${markup.toFixed(0)}%`;
    }

    const isUnpaid = item.payment_status === 'unpaid';
    
    // Перевірка: чи показувати дату оплати?
    // Показуємо тільки якщо вона Є і вона ВІДРІЗНЯЄТЬСЯ від дати створення
    const showPaymentDate = item.payment_date && item.payment_date !== item.date;

    return (
        <tr className={`hover:bg-slate-50 transition border-b border-slate-100 text-sm ${isUnpaid ? 'bg-red-50/30' : ''}`}>
            {/* 1. Дата створення */}
            <td className="p-3 text-slate-500 whitespace-nowrap">{item.date}</td>
            
            {/* 2. Назва */}
            <td className="p-3 font-medium text-slate-800 max-w-[200px] truncate" title={item.invoice_number || item.category}>
                {item.invoice_number || item.category}
            </td>
            
            {/* 3. Витрата */}
            <td className="p-3 text-right text-red-600 font-medium">
                {expense > 0 ? `-${expense}` : "—"}
            </td>

            {/* 4. Дохід */}
            <td className="p-3 text-right text-emerald-600 font-medium">
                {isIncome ? `+${amount}` : "—"}
            </td>

            {/* 5. Списання */}
            <td className="p-3 text-center text-slate-400">{writeoff > 0 ? writeoff : "—"}</td>

            {/* 6. Націнка */}
            <td className="p-3 text-right text-xs font-bold text-slate-600">{markupText}</td>

            {/* 7. Форма оплати */}
            <td className="p-3 text-center text-xs">
                <span className="px-2 py-1 bg-slate-100 rounded text-slate-600">{item.payment_method}</span>
            </td>

            {/* 8. Статус */}
            <td className="p-3 text-center">
                {isUnpaid ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                        🔴 Борг
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                        🟢 Оплачено
                    </span>
                )}
            </td>

            {/* 9. Хто оплатив (ВМ, ТВ, СМ...) */}
            <td className="p-3 text-center font-bold text-slate-700">
                {item.payer || "—"}
            </td>

            {/* 10. Дата оплати (Тільки якщо відрізняється) */}
            <td className="p-3 text-center text-xs text-slate-500">
                {showPaymentDate ? item.payment_date : "—"}
            </td>

            {/* 11. ДІЯ */}
            <td className="p-3 text-right">
                {isUnpaid && (
                    <button 
                        onClick={() => onPayClick(item)}
                        className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-sm transition"
                    >
                        Оплатити
                    </button>
                )}
            </td>
        </tr>
    );
}