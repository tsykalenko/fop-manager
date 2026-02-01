// components/all-records/types.ts

export interface Transaction {
    id: number;
    date: string;          // Дата створення
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
    
    // 👇 НОВІ ПОЛЯ (з БД)
    payment_date?: string | null; // Дата фактичного погашення
    payer?: string | null;        // Хто оплатив (ВМ, ТВ, СМ або продавці)
}

export interface GroupedTransactions {
    date: string;
    items: Transaction[];
    hasDebt: boolean;
}