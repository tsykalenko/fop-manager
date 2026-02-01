import { Transaction } from "../types";
import { calculateMarkup, isDebt } from "../lib/calculations";

interface TableRowProps {
    item: Transaction;
    isAdmin: boolean;
    onEdit: (item: Transaction) => void;
    onDeleteClick: (id: number) => void;
    onStatusChange: (item: Transaction, status: 'approved' | 'rejected') => void;
    viewDate?: string; // 👈 Новий пропс
}

export default function TransactionRow({ item, onEdit, onDeleteClick, onStatusChange, isAdmin, viewDate }: TableRowProps) {
    const income = Number(item.amount);
    const expense = Number(item.expense_amount || 0);
    const fullValue = Number(item.full_value || expense);
    const writeoff = Number(item.writeoff_amount || 0);
    const debt = isDebt(item);
    
    const isHistory = item.status === 'rejected'; 
    const isApproved = item.status === 'approved';
    const isPending = item.status === 'pending';

    // 🔥 ГОЛОВНА ЛОГІКА ВІДОБРАЖЕННЯ
    // Ми показуємо "Погашення" (червону витрату) ТІЛЬКИ якщо:
    // 1. У нас є viewDate (ми в денному звіті)
    // 2. Дата календаря == дата оплати
    // 3. Це НЕ день створення запису
    const showAsRepayment = viewDate 
        ? (item.payment_date === viewDate && item.date !== viewDate)
        : false;

    const { text: markupText, color: markupBaseColor } = calculateMarkup(income, fullValue, writeoff);
    const markupColor = debt && markupBaseColor.includes('emerald') 
        ? markupBaseColor.replace('text-emerald-', 'text-emerald-600/50 ') 
        : markupBaseColor;

    const canEdit = !isHistory; 
    const canDelete = isAdmin || (item.status === 'pending');

    const rowClasses = isHistory 
        ? 'bg-slate-50 opacity-50 grayscale select-none border-b border-slate-100' 
        : `hover:bg-slate-50 border-b border-slate-100 transition group ${debt ? 'bg-orange-50/30' : ''}`;

    // --- ЛОГІКА ВИТРАТ ---
    let expenseContent = <span className="text-slate-400">—</span>;

    if (showAsRepayment) {
        // РЕЖИМ ПОГАШЕННЯ: Червона витрата
        expenseContent = (
            <div className="flex flex-col items-end leading-none">
                <span className="text-red-600 font-bold text-sm">
                    -{income} <span className="text-[10px] text-red-300 font-normal">грн</span>
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Борг</span>
            </div>
        );
    } else if (debt) {
        // РЕЖИМ СТВОРЕННЯ (Борг)
        expenseContent = <span className="text-slate-400 italic font-normal text-[10px]">Без оплати</span>;
    } else if (expense > 0 || fullValue > 0) {
        // Звичайні витрати
        const isBonus = item.payment_method?.includes('Бонус');
        const isAction = item.payment_method?.includes('Акція');
        if (isBonus || isAction) {
            const labelColor = isBonus ? "text-blue-500" : "text-purple-500";
            const labelText = isBonus ? "🎁 БОНУС" : "🔥 АКЦІЯ";
            expenseContent = (
                <div className="flex flex-col items-end leading-none">
                    <span className="text-red-500 font-bold text-sm">-{expense}</span>
                    <span className={`text-[9px] ${labelColor} font-bold uppercase mt-0.5`}>{labelText}</span>
                </div>
            );
        } else if (expense > 0) {
            expenseContent = <span className="text-red-500 font-bold text-sm">-{expense}</span>;
        }
    }

    // --- ЛОГІКА ДОХОДУ ---
    let incomeContent = <span className="text-slate-400">—</span>;
    // Показуємо дохід, якщо це НЕ режим погашення і є сума
    if (!showAsRepayment && income > 0) {
        incomeContent = <span>+{income} <span className="text-[10px] text-emerald-600/60 font-normal">грн</span></span>;
    }

    return (
        <tr className={rowClasses}>
            {/* Назва */}
            <td className="p-3 font-bold text-slate-900 text-sm truncate" title={item.invoice_number || ""}>
                {item.invoice_number}
                {showAsRepayment && (
                    <div className="text-[10px] text-emerald-600 font-bold uppercase mt-0.5">
                        💸 Погашення боргу
                    </div>
                )}
                <div className="text-[9px] text-slate-400 font-normal uppercase mt-0.5 no-underline">{item.payment_method}</div>
            </td>

            <td className="p-3 text-right font-bold text-sm text-emerald-600">
                {incomeContent}
            </td>
            
            <td className="p-3 text-right">{expenseContent}</td>

            <td className="p-3 text-center text-slate-500 text-xs">{writeoff > 0 ? `${writeoff}` : "—"}</td>

            <td className={`p-3 text-right text-xs ${markupColor}`}>
                {showAsRepayment ? "—" : markupText}
            </td>

            <td className="p-3 text-center text-slate-500 font-medium text-xs">{item.date}</td> 
            <td className="p-3 text-[10px] text-slate-500 truncate max-w-[150px]">{item.comment}</td>
            
            {/* Кнопки */}
            <td className="p-3 text-right">
                <div className="flex justify-end gap-2 items-center">
                    {isAdmin && !isHistory && (
                        <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                            <button onClick={() => onStatusChange(item, 'approved')} className={`p-1.5 rounded-md ${isApproved ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-emerald-600'}`}>✅</button>
                        </div>
                    )}
                    <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                        {canEdit && (
                            <button onClick={() => onEdit(item)} className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-slate-500 hover:text-blue-600">✏️</button>
                        )}
                        {canDelete && (
                            <>
                                {canEdit && <div className="w-[1px] bg-slate-200 my-1"></div>}
                                <button onClick={() => onDeleteClick(item.id)} className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-slate-400 hover:text-red-600">🗑️</button>
                            </>
                        )}
                    </div>
                </div>
            </td>

            {/* Статус */}
            <td className="p-3 text-center">
                {isHistory ? (
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider border border-slate-300 px-2 py-0.5 rounded-md bg-white">
                        Історія
                    </span>
                ) : (
                    <>
                        {isPending && <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 shadow-sm animate-pulse" title="На перевірці"></span>}
                        {isApproved && <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 shadow-sm" title="Затверджено"></span>}
                    </>
                )}
            </td>
        </tr>
    );
}