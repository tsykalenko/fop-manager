import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: Request) {
  // 1. Шукаємо транзакції, які "pending" або "issue"
  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("date, admin_check")
    .neq("admin_check", "valid"); // Все, що не "valid"

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 2. Групуємо, щоб дізнатися, які дні "світяться"
  // Ми хочемо отримати масив унікальних дат: ["2026-01-10", "2026-01-12"]
  const rawDates = transactions?.map(t => t.date) || [];
  const uniqueDates = [...new Set(rawDates)].sort();

  // 3. Також перевіримо, чи є незатверджені Звіти
  const { data: pendingReports } = await supabase
    .from("period_reports")
    .select("id")
    .eq("status", "pending");

  return NextResponse.json({ 
    pendingDates: uniqueDates,
    pendingReportsCount: pendingReports?.length || 0
  });
}