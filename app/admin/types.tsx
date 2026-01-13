// app/admin/types.ts
export interface TransactionData {
    id?: number;
    created_at?: string;
    title: string;
    category: "trade" | "cash_drop";
    income: number;
    expense: number;
    writeoff: number;
    payment_method: string;
    payment_status: "paid" | "unpaid";
    admin_check: "valid" | "issue" | "pending";
    admin_comment?: string | null;
    seller_comment?: string | null;
    author_id: string;
    date: string;
    fop_name?: string | null;
    supplier_payment_date?: string | null;
    profiles?: { full_name: string };
}
  
export interface SalarySettings {
    daily_rate: number;
    percent_rate: number;
}

// Допоміжний компонент для статусів (щоб не писати його в кожному файлі)
export const StatusBadge = ({ status }: { status: string | null }) => {
    if (!status) return <span className="text-gray-300 text-[10px]">-</span>;
    if (status === 'valid') return <span className="mt-1 w-full flex justify-center items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded text-[10px] font-bold uppercase border border-emerald-200">✅ Вірно</span>;
    if (status === 'issue') return <span className="mt-1 w-full flex justify-center items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded text-[10px] font-bold uppercase border border-red-200 animate-pulse">⚠️ Помилка</span>;
    return <span className="mt-1 w-full flex justify-center items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-[10px] font-bold uppercase border border-yellow-200">⏳ Очікує</span>;
};