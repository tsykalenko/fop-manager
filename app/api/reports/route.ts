import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { data, error } = await supabase
    .from("period_reports")
    .select("*, profiles:author_id(full_name)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  // --- 1. ГЕНЕРАЦІЯ ЗВІТУ ---
  if (body.action === 'generate') {
    const { start_date, end_date } = body;
    
    // Перевірка на неперевірені записи
    const { data: notValidated, error: checkError } = await supabase
        .from("transactions")
        .select("date")
        .neq("admin_check", "valid") 
        .gte("date", start_date)
        .lte("date", end_date);

    if (checkError) return NextResponse.json({ error: checkError.message }, { status: 500 });

    if (notValidated && notValidated.length > 0) {
        const badDates = [...new Set(notValidated.map(t => t.date))].sort();
        return NextResponse.json({ error: "validation_failed", badDates }, { status: 400 });
    }

    // Отримання даних
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .gte("date", start_date)
      .lte("date", end_date)
      .order("date", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const dailyMap: any = {};
    let totalIncome = 0;
    let totalExpense = 0;
    let totalWriteoff = 0;

    transactions?.forEach(t => {
       const dateKey = t.date;
       if (!dailyMap[dateKey]) dailyMap[dateKey] = { date: dateKey, income: 0, expense: 0, writeoff: 0 };
       
       const isCash = t.category === 'cash_drop';
       if (!isCash) {
           dailyMap[dateKey].income += t.income;
           dailyMap[dateKey].writeoff += t.writeoff;
           totalIncome += t.income;
           totalWriteoff += t.writeoff;
       }
       dailyMap[dateKey].expense += t.expense;
       totalExpense += t.expense;
    });

    const dailyData = Object.values(dailyMap).sort((a: any, b: any) => a.date.localeCompare(b.date));
    return NextResponse.json({ dailyData, totalIncome, totalExpense, totalWriteoff });
  }

  // --- 2. ЗБЕРЕЖЕННЯ ЗВІТУ ---
  if (body.action === 'save') {
      const { start_date, end_date, total_income, total_expense, total_writeoff, author_id } = body;
      const { data, error } = await supabase
        .from("period_reports")
        .insert([{ start_date, end_date, total_income, total_expense, total_writeoff, author_id, status: 'pending' }])
        .select();
      
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data);
  }

  // --- 3. ЗАТВЕРДЖЕННЯ ТА НАРАХУВАННЯ ЗП (ОНОВЛЕНО) ---
  if (body.action === 'approve') {
      const { id, bonus, fine, total_salary, admin_note } = body;
      
      const { data, error } = await supabase
        .from("period_reports")
        .update({ 
            status: 'approved',
            bonus: bonus || 0,
            fine: fine || 0,
            total_salary: total_salary || 0,
            admin_note: admin_note || ""
        })
        .eq('id', id)
        .select();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data);
  }

  // --- 4. ВИПЛАТА ЗП (НОВЕ: Створюємо транзакцію) ---
  if (body.action === 'pay_salary') {
      const { report_id, amount, date, user_id, user_name } = body;

      // 1. Позначаємо звіт як оплачений
      const { error: updateError } = await supabase
          .from("period_reports")
          .update({ is_paid: true })
          .eq('id', report_id);
      
      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

      // 2. Створюємо витрату в касі
      const { error: txError } = await supabase
          .from("transactions")
          .insert([{
              title: `Виплата ЗП (${user_name})`,
              category: 'trade', // Це витрата з торгової діяльності
              income: 0,
              expense: Number(amount),
              writeoff: 0,
              payment_method: 'Готівка',
              payment_status: 'paid',
              admin_check: 'valid', // Автоматично вірно, бо створено системою
              seller_comment: 'Автоматична виплата по звіту',
              date: date, // Сьогоднішня дата
              author_id: user_id
          }]);

      if (txError) return NextResponse.json({ error: txError.message }, { status: 500 });

      return NextResponse.json({ success: true });
  }
}