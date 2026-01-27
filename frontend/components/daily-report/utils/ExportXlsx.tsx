import * as XLSX from "xlsx";

/**
 * Функція для експорту масиву транзакцій у Excel
 */
export const exportTransactionsToExcel = (items: any[], date: string) => {
    if (!items || items.length === 0) {
        alert("Немає даних для експорту за цей день.");
        return;
    }

    // 1. Формуємо красиві дані для Excel (українською)
    const dataToExport = items.map(item => ({
        "ID": item.id,
        "Дата": item.date,
        "Назва": item.invoice_number,
        "Дохід (Дебет)": Number(item.amount),
        "Витрата (Кредит)": Number(item.expense_amount),
        "Повна вартість": Number(item.full_value || item.expense_amount),
        "Списання": Number(item.writeoff_amount),
        "Метод оплати": item.payment_method,
        "Статус оплати": item.payment_status === 'paid' ? 'Оплачено' : 'Борг',
        "Статус перевірки": item.status === 'approved' ? 'Перевірено' : (item.status === 'rejected' ? 'Відхилено' : 'На перевірці'),
        "Коментар": item.comment
    }));

    // 2. Створюємо робочу книгу (Worksheet & Workbook)
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Звіт");

    // 3. Автоматична ширина колонок (трохи краси)
    const wscols = [
        { wch: 5 },  // ID
        { wch: 12 }, // Дата
        { wch: 30 }, // Назва
        { wch: 10 }, // Дохід
        { wch: 10 }, // Витрата
        { wch: 15 }, // Повна вартість
        { wch: 10 }, // Списання
        { wch: 15 }, // Метод
        { wch: 15 }, // Статус оплати
        { wch: 15 }, // Статус перевірки
        { wch: 40 }, // Коментар
    ];
    ws['!cols'] = wscols;

    // 4. Зберігаємо файл
    XLSX.writeFile(wb, `Звіт_${date}.xlsx`);
};