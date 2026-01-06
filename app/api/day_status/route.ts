import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) return NextResponse.json({ error: "Date required" }, { status: 400 });

  const { data, error } = await supabase
    .from("day_checks")
    .select("*")
    .eq("date", date)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found (це ок)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Якщо запису ще немає, повертаємо дефолт
  return NextResponse.json(data || { 
    date, 
    income_status: 'pending', 
    expense_status: 'pending', 
    writeoff_status: 'pending' 
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { date, type, status } = body; // type = 'income_status', etc.

  const { data, error } = await supabase
    .from("day_checks")
    .upsert({ 
        date, 
        [type]: status 
    }, { onConflict: 'date' }) // Якщо дата є - оновити, якщо ні - створити
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0]);
}