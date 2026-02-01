//(Сюди ми виносимо спільні типи, щоб вони були в одному місці)

export interface Transaction {
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
    is_official?: boolean;
    payment_date?: string | null; // Дата фактичної оплати
    payer?: string | null;        // Хто оплатив
}