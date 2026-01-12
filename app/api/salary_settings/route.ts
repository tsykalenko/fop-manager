import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { data, error } = await supabase
    .from("salary_settings")
    .select("*")
    .single(); // Беремо тільки один рядок

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { daily_rate, percent_rate } = body;

  // Оновлюємо перший рядок (у нас він завжди один)
  const { data, error } = await supabase
    .from("salary_settings")
    .update({ daily_rate, percent_rate, updated_at: new Date() })
    .eq('id', 1) 
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}