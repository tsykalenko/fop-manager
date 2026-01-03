import { supabase } from "@/lib/supabaseClient";

// 1. Описуємо типи даних
export interface TransactionData {
  title: string;
  amount: number;
  type: "income" | "expense" | "writeoff";
  payment_method: string;
  status: "paid" | "unpaid";
  date: string;
  income: number;
  expense: number;
  writeoff: number;
}

// 2. Клас із логікою
export class TransactionService {
  
  // Отримати записи за дату
  async getByDate(date: string) {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("date", date)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  // Створити запис
  async create(item: TransactionData) {
    const { data, error } = await supabase
      .from("transactions")
      .insert([item])
      .select();

    if (error) throw new Error(error.message);
    return data;
  }

  // Видалити запис
  async delete(id: number) {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
    return true;
  }
}

// 3. ЕКСПОРТУЄМО ГОТОВИЙ ОБ'ЄКТ (Це критично важливо!)
export const transactionService = new TransactionService();