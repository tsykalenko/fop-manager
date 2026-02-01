"use client";

import { useMemo, useState, useEffect } from "react";
import EditTransactionModal from "./modals/EditTransactionModal";
import DeleteConfirmationModal from "./modals/DeleteConfirmationModal";
import TransactionRow from "./ui/TransactionRow";
import { Transaction } from "./types";
import { calculateMarkup, isDebt } from "./lib/calculations";

interface Props {
  items: Transaction[];
  loading: boolean;
  onRefresh: () => void;
  viewDate?: string; // 👈 ВАЖЛИВО: Додали назад цей параметр
}

export default function TransactionList({ items, loading, onRefresh, viewDate }: Props) {
  const [editingItem, setEditingItem] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  useEffect(() => {
      const role = localStorage.getItem("user_role");
      setIsAdmin(role === 'admin');
  }, []);

  // Сортування: Нові записи зверху
  const sortedItems = useMemo(() => {
      return [...items].sort((a, b) => b.id - a.id);
  }, [items]);

  // Зміна статусу
  const handleStatusChange = async (item: Transaction, newStatus: 'approved' | 'rejected') => {
      if (item.status === newStatus) return;
      try {
        const token = localStorage.getItem("token");
        await fetch(`${apiUrl}/api/transactions/${item.id}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            },
            body: JSON.stringify({ ...item, status: newStatus })
        });
        onRefresh();
      } catch (e) { alert("Помилка зміни статусу"); }
  };
  
  // Жорстке видалення
  const handleHardDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${apiUrl}/api/transactions/${deletingId}`, {
            method: "DELETE",
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            }
        });

        if (!res.ok) throw new Error("Помилка при видаленні");
        onRefresh(); 
        setDeletingId(null);
    } catch (e: any) { alert(`Помилка: ${e.message}`); } finally { setIsDeleting(false); }
  };

  // Редагування (Твоя правильна версія з фіксом CORS)
  const handleSaveEdit = async (updatedData: any) => {
      if (!editingItem) return;

      try {
        const token = localStorage.getItem("token");
        const targetId = editingItem.id; 

        // 1. Архівуємо старий (передаємо весь об'єкт, щоб уникнути помилок валідації)
        const archivePayload = {
            ...editingItem,
            status: 'rejected',
            comment: `${updatedData.comment} (ред.)`
        };

        const archiveRes = await fetch(`${apiUrl}/api/transactions/${targetId}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            },
            body: JSON.stringify(archivePayload) 
        });

        if (!archiveRes.ok) {
            const err = await archiveRes.text();
            throw new Error(`Помилка при архівуванні: ${err}`);
        }

        // 2. Створюємо новий
        const createPayload = { 
            ...updatedData, 
            status: 'pending',
            is_official: updatedData.is_official ? 1 : 0 
        };
        
        const createRes = await fetch(`${apiUrl}/api/transactions`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            },
            body: JSON.stringify(createPayload) 
        });

        if (createRes.ok) {
            setEditingItem(null); 
            onRefresh(); 
        } else {
            const err = await createRes.text();
            throw new Error(`Помилка при створенні нового: ${err}`);
        }
      } catch (e: any) { 
          console.error(e);
          alert(`Помилка: ${e.message}`); 
      }
  };

  // 🔥 ПРАВИЛЬНИЙ ПІДРАХУНОК СУМ (Враховує viewDate)
  const totals = useMemo(() => {
    return items.reduce((acc, item) => {
        if (item.status === 'rejected') return acc;

        // Визначаємо, чи це перегляд "Погашення боргу"
        // (Тобто дата календаря == дата оплати, але це не день створення)
        const isRepaymentView = viewDate && item.payment_date === viewDate && item.date !== viewDate;

        if (isRepaymentView) {
            // Режим погашення: це ВИТРАТА
            acc.expense += Number(item.amount || 0); 
        } else {
            // Режим створення (або архів): це ДОХІД
            acc.income += Number(item.amount || 0);
            
            if (!isDebt(item)) {
                acc.expense += Number(item.full_value || item.expense_amount || 0);
            }
        }
        
        acc.writeoff += Number(item.writeoff_amount || 0);
        return acc;
    }, { income: 0, expense: 0, writeoff: 0 });
  }, [items, viewDate]);

  const totalMarkup = calculateMarkup(totals.income, totals.expense, totals.writeoff);

  return (
    <>
        <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto min-h-[300px]">
                <table className="w-full text-left text-sm table-fixed">
                    <thead className="bg-slate-50 text-slate-400 font-bold text-xs uppercase sticky top-0 z-10 shadow-sm">
                        <tr>
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
                            sortedItems.map(item => (
                                <TransactionRow 
                                    key={item.id} 
                                    item={item} 
                                    onEdit={setEditingItem} 
                                    onDeleteClick={setDeletingId} 
                                    onStatusChange={handleStatusChange} 
                                    isAdmin={isAdmin}
                                    viewDate={viewDate} // 👈 Передаємо дату в рядок
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
            onConfirm={handleHardDelete} 
            isDeleting={isDeleting}
        />
    </>
  );
}