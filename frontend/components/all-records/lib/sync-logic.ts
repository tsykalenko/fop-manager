import { Transaction, GroupedTransactions } from "../types";

// --- 1. ЛОГІКА ГРУПУВАННЯ (Без змін) ---
export const groupTransactionsByDate = (items: Transaction[]): GroupedTransactions[] => {
    const groups: { [key: string]: Transaction[] } = {};

    items.forEach(item => {
        if (!groups[item.date]) {
            groups[item.date] = [];
        }
        groups[item.date].push(item);
    });

    return Object.keys(groups)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
        .map(date => {
            const dayItems = groups[date];
            const hasDebt = dayItems.some(i => i.payment_status === 'unpaid');
            return { date, items: dayItems, hasDebt };
        });
};

export const getDayStatusColor = (date: string, allItems: Transaction[]) => {
    const dayItems = allItems.filter(i => i.date === date);
    if (dayItems.length === 0) return null;
    const hasDebt = dayItems.some(i => i.payment_status === 'unpaid');
    return hasDebt ? 'red' : 'green';
};


// --- 2. ЛОГІКА ОПЛАТИ (ВИПРАВЛЕНА) ---

interface RepayParams {
    item: Transaction;      
    paymentDate: string;    
    method: 'cash' | 'bank';
    payer: string;          
    token: string;
}

export const processDebtRepayment = async ({ item, paymentDate, method, payer, token }: RepayParams) => {
    // 1. URL
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    const baseUrl = envUrl && envUrl !== "" ? envUrl : "http://localhost:8080";

    if (!item || !item.id) {
        throw new Error("Не знайдено ID запису для оплати");
    }

    console.log(`💸 Спроба оплати. URL: ${baseUrl}/api/transactions/${item.id}`);

    const updatePayload = {
        ...item,
        payment_status: 'paid',   
        payment_date: paymentDate, 
        payer: payer,
        is_official: item.is_official ? 1 : 0             
    };

    const res = await fetch(`${baseUrl}/api/transactions/${item.id}`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json" // 👈 ‼️ ОБОВ'ЯЗКОВО ДОДАЙ ЦЕЙ РЯДОК ‼️
        },
        body: JSON.stringify(updatePayload) 
    });

    if (!res.ok) {
        // Тепер, якщо буде помилка, сервер поверне текст помилки, а не редірект
        const errText = await res.text();
        console.error("Server Error Response:", errText); // Для відладки
        throw new Error(`Помилка сервера: ${errText}`);
    }

    return true;
};