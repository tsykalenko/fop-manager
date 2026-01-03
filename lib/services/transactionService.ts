import { supabase } from "@/lib/supabaseClient";

// 👇 ОСЬ ТУТ МИ ОНОВЛЮЄМО СПИСОК ДОЗВОЛЕНИХ ПОЛІВ
export interface TransactionData {
  id?: number;
  date: string;
  title: string;
  category: "trade" | "cash_drop";
  income: number;
  expense: number;
  writeoff: number;
  payment_method: string;
  payment_status: "paid" | "unpaid";
  actual_payment_date?: string | null;
  admin_check: "pending" | "valid" | "issue";
  
  // 👇 ДОДАЄМО ЦЕЙ РЯДОК:
  author_id?: string; 
  
  // 👇 І ЦЕЙ (для відображення імені):
  profiles?: {
    full_name: string;
  };
}
export class TransactionService {
  
  // 👇 ОСЬ ТУТ БУЛА ПРОБЛЕМА
  async getByDate(date: string) {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        profiles:author_id ( full_name )
      `) // 👈 Цей рядок "підтягує" імена!
      .eq("date", date)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async create(item: TransactionData) {
    // Видаляємо зайві поля перед записом в БД (profiles не треба записувати, він тільки для читання)
    const { id, profiles, ...payload } = item;
    
    const { data, error } = await supabase
      .from("transactions")
      .insert([payload])
      .select();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: number, updates: Partial<TransactionData>) {
    // Теж чистимо від зайвого
    const { profiles, ...cleanUpdates } = updates;

    const { error } = await supabase
      .from("transactions")
      .update(cleanUpdates)
      .eq("id", id);

    if (error) throw new Error(error.message);
    return true;
  }

  async delete(id: number) {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return true;
  }
}

export const transactionService = new TransactionService();