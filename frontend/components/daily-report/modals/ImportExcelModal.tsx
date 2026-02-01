"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Функція конвертації дати Excel
  const excelDateToJSDate = (serial: any) => {
    if (!serial) return null;
    if (typeof serial === 'string') return serial; // Якщо це текст
    
    // Якщо Excel число
    const utc_days  = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;                                        
    const date_info = new Date(utc_value * 1000);
 
    const year = date_info.getFullYear();
    const month = String(date_info.getMonth() + 1).padStart(2, '0');
    const day = String(date_info.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        const data: any[] = XLSX.utils.sheet_to_json(ws);
        
        setTotal(data.length);
        let count = 0;
        let lastDate = new Date().toISOString().split('T')[0];

        for (const row of data) {
          // 1. Дата (якщо пуста — беремо попередню)
          let currentDate = excelDateToJSDate(row['Дата']);
          if (currentDate) {
              lastDate = currentDate;
          } else {
              currentDate = lastDate;
          }

          // 2. Гроші
          const income = Number(row['Дебет']) || 0;    // Дохід
          const expense = Number(row['Кредит']) || 0;  // Витрата
          const writeoff = Number(row['Списання']) || 0;
          
          // 3. Форма оплати
          const rawMethod = String(row['Форма'] || "").toLowerCase().trim();
          let method = "Готівка"; // За замовчуванням
          let fullValue = null;

          if (rawMethod === '2') {
              method = "Готівка";
          } else if (rawMethod === '1') {
              method = "Банк (Термінал)";
          } else if (rawMethod.includes('акція')) {
              method = "🔥 Акція";
              if (expense > 0) fullValue = expense;
          } else if (rawMethod.includes('бонус')) {
              method = "🎁 Бонус";
              if (expense > 0) fullValue = expense;
          }

          // 4. Статус оплати
          const rawStatus = String(row['Стан'] || "").trim();
          const paymentStatus = rawStatus === '+' ? 'paid' : 'unpaid';

          // 5. Формуємо коментар з ФОП та Дати оплати
          let commentParts = [];
          if (row['Коментар']) commentParts.push(row['Коментар']);
          
          // Обробка ФОП
          const rawFop = String(row['ФОП'] || "").toLowerCase().trim();
          if (rawFop === 'тв') commentParts.push("ФОП: Тамара");
          else if (rawFop === 'вм') commentParts.push("ФОП: Віктор");
          else if (rawFop === 'см') commentParts.push("ФОП: Світлана");
          else if (rawFop) commentParts.push(`ФОП: ${row['ФОП']}`);

          // Обробка Дати оплати
          const paymentDate = excelDateToJSDate(row['Дата оплати']);
          if (paymentDate) {
              commentParts.push(`Оплачено: ${paymentDate}`);
          }

          const finalComment = commentParts.join(" | ");

          // 6. Тип транзакції
          let type = 'income';
          // Якщо доходу немає (0), але є витрата — це витрата (expense)
          if (income === 0 && expense > 0) type = 'expense';

          const newItem = {
            date: currentDate,
            invoice_number: row['Назва'] || "Імпорт",
            type: type, 
            category: 'Імпорт',
            amount: income,
            expense_amount: expense,
            full_value: fullValue,
            writeoff_amount: writeoff,
            payment_method: method,
            payment_status: paymentStatus, 
            status: 'approved', // За замовчуванням вважаємо перевіреним
            comment: finalComment
          };

          // Пропускаємо пусті рядки
          if (!newItem.invoice_number && newItem.amount === 0 && newItem.expense_amount === 0) {
              continue;
          }

          // API запит
          const token = localStorage.getItem("token");
          await fetch("http://localhost:8080/api/transactions", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newItem)
          });

          count++;
          setProgress(count);
        }

        onSuccess();
        onClose();
        alert(`✅ Успішно імпортовано ${count} записів!`);

      } catch (err) {
        console.error(err);
        setError("Помилка при читанні файлу. Перевір структуру.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">📊 Імпорт з Excel</h3>
        
        <p className="text-xs text-slate-500 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
            Очікувані колонки:<br/>
            <b>Дата, Назва, Кредит (Витрата), Дебет (Дохід), Списання, Форма (1/2), Стан (+/-), ФОП, Дата оплати</b>
        </p>

        {!loading ? (
            <div className="space-y-4">
                <div className="p-8 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center hover:border-emerald-500 hover:bg-emerald-50/30 transition cursor-pointer relative group">
                    <input type="file" onChange={handleFileUpload} accept=".xlsx, .xls, .csv" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">📂</div>
                    <div className="text-sm font-bold text-slate-600 group-hover:text-emerald-600">Оберіть файл</div>
                </div>
                
                {error && <div className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

                <button onClick={onClose} className="w-full h-[45px] rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition">Скасувати</button>
            </div>
        ) : (
            <div className="text-center py-6">
                <div className="inline-block w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-slate-800 font-bold text-sm mb-1">Обробка даних...</div>
                <div className="text-slate-400 text-xs mb-4">{progress} / {total}</div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${total > 0 ? (progress / total) * 100 : 0}%` }}></div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}