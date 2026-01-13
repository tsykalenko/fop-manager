import { createClient } from "@/lib/supabase/server"; // 👈 Беремо наш новий серверний клієнт
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // 1. Створюємо клієнт (тепер це асинхронна функція!)
  const supabase = await createClient();
  
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  let query = supabase.from("transactions").select("*").order("created_at", { ascending: true });
  if (date) query = query.eq("date", date);

  const { data, error } = await query;
  
  if (error) {
    console.error("Supabase Error:", error);
    return NextResponse.json([], { status: 200 });
  }
  
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient(); // 👈 await
  const body = await request.json();
  
  const { error } = await supabase.from("transactions").insert(body);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const supabase = await createClient(); // 👈 await
  const body = await request.json();
  const { id, ...updates } = body;

  // Отримуємо старі дані
  const { data: oldData } = await supabase.from("transactions").select("*").eq("id", id).single();

  // Оновлюємо
  const { error } = await supabase.from("transactions").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Логування
  const { data: { user } } = await supabase.auth.getUser();
  if (user && oldData) {
       await supabase.from("transaction_logs").insert({
          transaction_id: id,
          changed_by: user.id,
          change_type: 'UPDATE',
          old_data: oldData,
          new_data: { ...oldData, ...updates }
      });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const supabase = await createClient(); // 👈 await
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const { data: oldData } = await supabase.from("transactions").select("*").eq("id", id).single();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data: { user } } = await supabase.auth.getUser();
  if (user && oldData) {
      await supabase.from("transaction_logs").insert({
          transaction_id: oldData.id,
          changed_by: user.id,
          change_type: 'DELETE',
          old_data: oldData,
          new_data: null
      });
  }

  return NextResponse.json({ success: true });
}