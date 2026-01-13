// lib/services/transactionService.ts
import { Transaction } from "@/app/types";

export const transactionService = {
  
  // 1. Отримати транзакції за дату
  async getByDate(date: string): Promise<Transaction[]> {
    try {
      const res = await fetch(`/api/transactions?date=${date}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return await res.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  // 2. Отримати всю історію (ліміт 50)
  async getHistory(): Promise<Transaction[]> {
    // Тут ми можемо викликати інший ендпоінт або передати параметр
    // Для спрощення поки що просто звертаємось до API
    const res = await fetch(`/api/transactions`); 
    return await res.json();
  },

  // 3. Створити нову
  async create(data: Transaction) {
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  },

  // 4. Оновити (наприклад, метод оплати)
  async update(id: number, updates: Partial<Transaction>) {
    const res = await fetch("/api/transactions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    return res.ok;
  },

  // 5. Видалити
  async delete(id: number) {
    const res = await fetch(`/api/transactions?id=${id}`, {
      method: "DELETE",
    });
    return res.ok;
  }
};