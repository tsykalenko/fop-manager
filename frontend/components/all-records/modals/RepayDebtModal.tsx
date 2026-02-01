// components/all-records/modals/RepayDebtModal.tsx
"use client";

import { useState } from "react";
import { Transaction } from "../types";
import { processDebtRepayment } from "../lib/sync-logic";

interface Props {
    item: Transaction | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RepayDebtModal({ item, isOpen, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [method, setMethod] = useState<'cash' | 'bank'>('cash');
    const [payer, setPayer] = useState("");

    if (!isOpen || !item) return null;

    // Списки платників
    const cashPayers = ["Світлана", "Анна", "Людмила"];
    const bankPayers = ["ВМ", "ТВ", "СМ"];
    
    // Актуальний список залежно від методу
    const currentPayers = method === 'cash' ? cashPayers : bankPayers;

    const handleSubmit = async () => {
        if (!payer) return alert("Оберіть, хто оплачує!");
        
        setLoading(true);
        try {
            const token = localStorage.getItem("token") || "";
            
            await processDebtRepayment({
                item,
                paymentDate,
                method,
                payer,
                token
            });

            onSuccess();
            onClose();
        } catch (e) {
            console.error(e);
            alert("Помилка при оплаті");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">💸 Погашення боргу</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                <div className="p-5 space-y-4">
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 text-sm text-slate-700">
                        <div className="font-bold">{item.invoice_number || item.category}</div>
                        <div className="flex justify-between mt-1">
                            <span>Сума до сплати:</span>
                            <span className="font-bold text-red-600">{item.amount} грн</span>
                        </div>
                    </div>

                    {/* Дата оплати */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Дата оплати</label>
                        <input 
                            type="date" 
                            value={paymentDate} 
                            onChange={(e) => setPaymentDate(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                        />
                    </div>

                    {/* Метод оплати */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Форма оплати</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={() => { setMethod('cash'); setPayer(""); }}
                                className={`py-2 text-sm font-bold rounded-lg border ${method === 'cash' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-500'}`}
                            >
                                💵 Готівка
                            </button>
                            <button 
                                onClick={() => { setMethod('bank'); setPayer(""); }}
                                className={`py-2 text-sm font-bold rounded-lg border ${method === 'bank' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-500'}`}
                            >
                                💳 Банк
                            </button>
                        </div>
                        {method === 'cash' && (
                            <p className="text-[10px] text-emerald-600 mt-1 pl-1">
                                * Створиться запис "Витрата" у денному звіті
                            </p>
                        )}
                    </div>

                    {/* Вибір платника */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Хто платить?</label>
                        <select 
                            value={payer} 
                            onChange={(e) => setPayer(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
                        >
                            <option value="">-- Оберіть --</option>
                            {currentPayers.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2 text-sm font-bold text-slate-500 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition">Скасувати</button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={loading}
                        className="flex-1 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition disabled:opacity-50"
                    >
                        {loading ? "Обробка..." : "Підтвердити оплату"}
                    </button>
                </div>
            </div>
        </div>
    );
}