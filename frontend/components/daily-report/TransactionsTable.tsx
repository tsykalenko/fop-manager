"use client";

import { useMemo, useState } from "react";
import EditTransactionModal from "./modals/EditTransactionModal";
import DeleteConfirmationModal from "./modals/DeleteConfirmationModal";

interface Transaction {
  id: number;
  date: string;
  invoice_number: string | null;
  type: 'income' | 'expense';
  amount: string;          
  expense_amount: string;  
  full_value: string | null;
  writeoff_amount: string; 
  payment_method: string;
  payment_status: 'paid' | 'unpaid'; 
  status: 'pending' | 'approved' | 'rejected';
  category: string;
  comment: string | null;
}

interface Props {
  items: Transaction[];
  loading: boolean;
  onRefresh: () => void;
}

const isDebt = (item: Transaction) => item.payment_status === 'unpaid';
const isPromo = (method: string) => method.includes('Бонус') || method.includes('Акція');

const calculateMarkup = (income: number, expense: number, writeoff: number) => {
    if (expense <= 0) return { text: "—", color: "text-slate-400" };
    const effectiveIncome = income - writeoff;
    const profit = effectiveIncome - expense;
    const markup = (profit / expense) * 100;
    const text = `${markup.toFixed(1)}%`;

    let color = "text-red-500 font-bold"; 
    if (markup >= 30) color = "text-emerald-600 font-black"; 
    else if (markup > 0) color = "text-emerald-500 font-bold"; 
    else if (markup === 0) color = "text-slate-400"; 

    return { text, color };
};

const TableRow = ({ item, onEdit, onDeleteClick, onStatusChange }: any) => {
    const income = Number(item.amount);
    const expense = Number(item.expense_amount || 0);
    const fullValue = Number(item.full_value || expense);
    const writeoff = Number(item.writeoff_amount || 0);
    const debt = isDebt(item);
    const isBonus = item.payment_method.includes('Бонус');
    const isAction = item.payment_method.includes('Акція');

    const { text: markupText, color: markupBaseColor } = calculateMarkup(income, fullValue, writeoff);
    const markupColor = debt && markupBaseColor.includes('emerald') 
        ? markupBaseColor.replace('text-emerald-', 'text-emerald-600/50 ') 
        : markupBaseColor;

    let expenseContent = <span className="text-slate-400">—</span>;
    
    if (debt) {
        expenseContent = <span className="text-slate-400 italic font-normal text-[10px]">Без оплати</span>;
    } else if (expense > 0 || fullValue > 0) {
        if (isBonus || isAction) {
            const labelColor = isBonus ? "text-blue-500" : "text-purple-500";
            const labelText = isBonus ? "🎁 БОНУС" : "🔥 АКЦІЯ";
            
            expenseContent = (
                <div className="flex flex-col items-end leading-none">
                    <span className="text-red-500 font-bold">-{expense}</span>
                    <span className={`text-[9px] ${labelColor} font-bold uppercase mt-0.5`} title={`Повна вартість: ${fullValue}`}>
                        {labelText}
                    </span>
                </div>
            );
        } else if (expense > 0) {
            expenseContent = <span className="text-red-500">-{expense}</span>;
        }
    }

    // 👇 ТУТ ЗМІНИЛИ: Дата поки що пуста (буде заповнюватись при погашенні боргу)
    // Якщо хочеш, можна додати умову: item.original_date ? ... : "—"
    const displayDate = <span className="text-slate-300">—</span>; 

    return (
        <tr className={`hover:bg-slate-50 transition group ${debt ? 'bg-orange-50/30' : ''}`}>
            
            {/* 1. НАЗВА */}
            <td className="p-2 font-medium text-slate-800 text-xs truncate" title={item.invoice_number || ""}>
                {item.invoice_number}
                <div className="text-[9px] text-slate-400 uppercase mt-0.5">{item.payment_method}</div>
            </td>

            {/* 2. ДОХІД */}
            <td className="p-2 text-right font-bold text-xs text-emerald-600">{income > 0 ? `+${income}` : "—"}</td>
            
            {/* 3. ВИТРАТА */}
            <td className="p-2 text-right font-bold text-xs">
                {expenseContent}
            </td>

            {/* 4. СПИСАННЯ */}
            <td className="p-2 text-center text-slate-500 text-xs">{writeoff > 0 ? `${writeoff}` : "—"}</td>

            {/* 5. НАЦІНКА */}
            <td className={`p-2 text-right text-xs ${markupColor}`}>{markupText}</td>

            {/* 6. ДАТА (Поки пуста) */}
            <td className="p-2 text-center text-xs text-slate-500 font-medium">
                {displayDate}
            </td>

            {/* 7. КОМЕНТАР */}
            <td className="p-2 text-[10px] text-slate-500 truncate" title={item.comment || ""}>{item.comment}</td>
            
            {/* 8. ДІЇ (Прозора частина) */}
            <td className="p-2 text-right">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity items-center">
                    {/* Статуси */}
                    <div className="flex bg-slate-100 rounded-lg p-0.5 mr-2">
                        <button onClick={() => onStatusChange(item, 'approved')} className="p-1.5 rounded-md hover:bg-white text-slate-400 hover:text-emerald-600" title="Все вірно">✅</button>
                        <button onClick={() => onStatusChange(item, 'rejected')} className="p-1.5 rounded-md hover:bg-white text-slate-400 hover:text-red-600" title="Помилка">❌</button>
                    </div>
                    {/* Редагування/Видалення */}
                    <button onClick={() => onEdit(item)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-blue-600" title="Редагувати">✏️</button>
                    <button onClick={() => onDeleteClick(item.id)} className="p-1.5 hover:bg-red-100 rounded-lg text-slate-400 hover:text-red-600" title="Видалити">🗑️</button>
                </div>
            </td>

            {/* 9. СТАТУС (Кружечок) */}
            <td className="p-2 text-center">
                {item.status === 'pending' && <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-sm animate-pulse" title="На перевірці"></span>}
                {item.status === 'approved' && <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" title="Перевірено"></span>}
                {item.status === 'rejected' && <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" title="Відхилено"></span>}
            </td>
        </tr>
    );
};

export default function TransactionsTable({ items, loading, onRefresh }: Props) {
  const [editingItem, setEditingItem] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusChange = async (item: Transaction, newStatus: 'approved' | 'rejected') => {
      if (item.status === newStatus) return;
      try {
        const token = localStorage.getItem("token");
        const updatedItem = { ...item, status: newStatus };
        const res = await fetch(`http://localhost:8080/api/transactions/${item.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(updatedItem)
        });
        if (res.ok) onRefresh();
      } catch (e) { alert("Помилка"); }
  };
  
  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
        const token = localStorage.getItem("token");
        await fetch(`http://localhost:8080/api/transactions/${deletingId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        onRefresh(); setDeletingId(null);
    } catch (e) { alert("Помилка"); } finally { setIsDeleting(false); }
  };

  const handleSaveEdit = async (updatedData: any) => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8080/api/transactions/${updatedData.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(updatedData)
        });
        if (res.ok) onRefresh();
      } catch (e) { alert("Помилка"); }
  };

  const totals = useMemo(() => {
    return items.reduce((acc, item) => {
        acc.income += Number(item.amount || 0);
        if (!isDebt(item)) {
            acc.expense += Number(item.full_value || item.expense_amount || 0);
        }
        acc.writeoff += Number(item.writeoff_amount || 0);
        return acc;
    }, { income: 0, expense: 0, writeoff: 0 });
  }, [items]);

  const totalMarkup = calculateMarkup(totals.income, totals.expense, totals.writeoff);

  return (
    <>
        <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto min-h-[300px]">
                <table className="w-full text-left text-sm table-fixed">
                    <thead className="bg-slate-50 text-slate-400 font-bold text-xs uppercase sticky top-0 z-10 shadow-sm">
                        <tr>
                            {/* 👇 ОНОВЛЕНІ ЗАГОЛОВКИ ТА ШИРИНИ */}
                            <th className="p-3 w-[20%]">Назва</th>
                            <th className="p-2 text-right w-[10%]">Дохід</th>
                            <th className="p-2 text-right w-[10%]">Витрата</th>
                            <th className="p-2 text-center w-[10%]">Списання</th>
                            <th className="p-2 text-right w-[10%]">Націнка</th>
                            <th className="p-2 text-center w-[90px]">Дата</th>
                            <th className="p-2 w-auto">Коментар</th>
                            <th className="p-2 w-[120px]"></th> 
                            <th className="p-2 text-center w-[80px]">Статус</th> 
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={9} className="p-10 text-center text-slate-400">Завантаження...</td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan={9} className="p-10 text-center text-slate-400">Поки що записів немає</td></tr>
                        ) : (
                            items.map(item => (
                                <TableRow 
                                    key={item.id} 
                                    item={item} 
                                    onEdit={setEditingItem} 
                                    onDeleteClick={setDeletingId} 
                                    onStatusChange={handleStatusChange} 
                                />
                            ))
                        )}
                    </tbody>
                    {items.length > 0 && (
                        <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-black text-xs text-slate-800">
                            <tr>
                                <td className="p-3 text-right text-slate-500 uppercase tracking-wider">Підсумок:</td>
                                <td className="p-2 text-right text-emerald-700 text-sm">{totals.income.toFixed(2)} грн</td>
                                <td className="p-2 text-right text-red-600 text-sm">{totals.expense > 0 ? `-${totals.expense.toFixed(2)} грн` : "0"}</td>
                                <td className="p-2 text-center text-slate-600">{totals.writeoff > 0 ? `${totals.writeoff.toFixed(2)}` : "—"}</td>
                                <td className={`p-2 text-right ${totalMarkup.color}`}>{totalMarkup.text}</td>
                                <td colSpan={4}></td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>

        {editingItem && (
            <EditTransactionModal 
                item={editingItem} 
                isOpen={!!editingItem} 
                onClose={() => setEditingItem(null)} 
                onSave={handleSaveEdit} 
            />
        )}
        <DeleteConfirmationModal 
            isOpen={!!deletingId} 
            onClose={() => setDeletingId(null)} 
            onConfirm={handleConfirmDelete} 
            isDeleting={isDeleting}
        />
    </>
  );
}