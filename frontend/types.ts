// app/types.ts

// 1. ТРАНЗАКЦІЯ (Головна сутність)
export interface Transaction {
  id?: number;              // ID може не бути, якщо ми тільки створюємо запис
  created_at?: string;      // Час створення
  date: string;             // Дата операції (2025-01-14)
  title: string;            // Назва (Хліб, Кава)
  category: "trade" | "cash_drop"; // Тип: Торгівля або Здача каси
  
  // Гроші
  income: number;           // Скільки зайшло (+100)
  expense: number;          // Скільки вийшло (витрати)
  writeoff: number;         // Списання (не впливає на касу, але впливає на склад)
  
  // Оплата
  payment_method: string;             // "Готівка" або "Картка"
  payment_status: "paid" | "unpaid";  // "Оплачено" або "Борг"
  
  // Контроль Адміна
  admin_check: "valid" | "issue" | "pending"; // valid=ОК, issue=Помилка, pending=Перевірка
  admin_comment?: string | null;    // Коментар адміна (необов'язковий)
  seller_comment?: string | null;   // Коментар продавця (необов'язковий)
  
  author_id: string; // ID того, хто створив запис (uuid з Supabase)
}

// 2. ЗВІТ (Report)
export interface Report {
  id: number;
  created_at: string;
  start_date: string;
  end_date: string;
  
  // Підсумки
  total_income: number;
  total_expense: number;
  total_writeoff: number;
  total_salary: number; // Нарахована зарплата
  
  status: "pending" | "approved" | "paid"; // Очікує / Затверджено / Виплачено
  author_id: string;
  is_paid: boolean;
}

// 3. ВКЛАДКА (Для шапки)
export interface TabItem {
  id: string;
  label: string;
  count?: number; // Червоний кружечок (наприклад, "3 неперевірені дні")
}

// 4. ПРОФІЛЬ КОРИСТУВАЧА
export interface UserProfile {
  id: string;
  full_name: string | null;
  role: "admin" | "seller";
}