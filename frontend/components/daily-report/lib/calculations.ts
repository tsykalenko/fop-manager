//(Сюди виносимо "математику", щоб вона не заважала читати React-код)

import { Transaction } from "../types";

export const isDebt = (item: Transaction) => item.payment_status === 'unpaid';

export const calculateMarkup = (income: number, expense: number, writeoff: number) => {
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