"use client";
import { useState } from "react";
import { TransactionData } from "../types";

interface Props {
  items: TransactionData[];
  updatePaymentInfo: (id: number, field: string, value: string) => void;
}

export default function AllTab({ items, updatePaymentInfo }: Props) {
  const [searchDate, setSearchDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchAmount, setSearchAmount] = useState("");
  const [showUnpaidOnly, setShowUnpaidOnly] = useState(false);

  const filteredItems = items.filter(item => {
    const isUnpaid = !item.payment_method?.includes('Готівка') && !item.supplier_payment_date && item.category !== 'cash_drop';
    if (showUnpaidOnly && !isUnpaid) return false;
    const matchesTitle = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = searchDate ? item.date === searchDate : true;
    const matchesAmount = searchAmount ? (item.income.toString() === searchAmount || item.expense.toString() === searchAmount) : true;
    return matchesTitle && matchesDate && matchesAmount;
  });

  return (
    <div className="space-y-4">
        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-2 items-center">
            <div className="font-bold text-gray-500 text-xs uppercase px-2">Пошук:</div>
            <button onClick={() => setShowUnpaidOnly(!showUnpaidOnly)} className={`px-3 py-1 rounded text-xs font-bold transition border ${showUnpaidOnly ? 'bg-red-500 text-white' : 'bg-gray-100'}`}>🔴 Неоплачені</button>
            <input type="date" value={searchDate} onChange={e => setSearchDate(e.target.value)} className="border rounded px-2 py-1 text-sm outline-none" />
            <input type="text" placeholder="Назва..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="border rounded px-2 py-1 text-sm outline-none" />
            <input type="number" placeholder="Сума" value={searchAmount} onChange={e => setSearchAmount(e.target.value)} className="border rounded px-2 py-1 text-sm outline-none w-24" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
            <div className="min-w-[900px]">
                <div className="grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_1fr_100px_130px] bg-gray-50 p-3 border-b text-[10px] font-bold text-gray-500 uppercase tracking-wider items-center sticky top-0">
                    <div>Дата</div><div className="pl-2">Назва</div><div className="text-center">Дохід</div><div className="text-center">Витрата</div><div className="text-center">Спис.</div><div className="text-center">% Маржа</div><div className="text-center">Оплата</div><div className="text-center">ФОП</div><div className="text-center">Сплачено</div>
                </div>
                <div className="divide-y max-h-[70vh] overflow-y-auto">
                    {filteredItems.map(item => {
                        const isCash = item.category === 'cash_drop';
                        const isUnpaid = !isCash && item.payment_method !== 'Готівка' && !item.supplier_payment_date;
                        const margin = (!isCash && item.income > 0) ? (((item.income - (item.expense + item.writeoff)) / item.income) * 100).toFixed(0) : '-';
                        
                        return (
                            <div key={item.id} className={`grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_1fr_100px_130px] p-2 items-center text-xs ${isUnpaid ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                                <div className="text-slate-400">{new Date(item.date).toLocaleDateString('uk-UA', {day:'2-digit', month:'2-digit'})}</div>
                                <div className="pl-2 font-bold truncate">{item.title}</div>
                                <div className="text-center font-bold text-emerald-600">{!isCash && item.income > 0 ? item.income : "-"}</div>
                                <div className="text-center font-bold text-red-500">{item.expense > 0 ? item.expense : "-"}</div>
                                <div className="text-center text-slate-400">{!isCash && item.writeoff > 0 ? item.writeoff : "-"}</div>
                                <div className="text-center font-bold text-slate-500">{margin}%</div>
                                <div className="text-center">{item.payment_method}</div>
                                <div className="px-1"><select value={item.fop_name || ""} onChange={e => updatePaymentInfo(item.id!, 'fop_name', e.target.value)} className="w-full border rounded p-1"><option value="">-</option><option value="ТВ">ТВ</option><option value="ВМ">ВМ</option></select></div>
                                <div className="px-1"><input type="date" value={item.supplier_payment_date || ""} onChange={e => updatePaymentInfo(item.id!, 'supplier_payment_date', e.target.value)} className="w-full border rounded p-1" /></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    </div>
  );
}