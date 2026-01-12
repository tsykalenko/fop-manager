import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const id = searchParams.get("id");
  const limit = searchParams.get("limit");

  let query = supabase
    .from("transactions")
    .select(`*, profiles ( full_name )`)
    .order("created_at", { ascending: false });

  if (id) {
    query = query.eq("id", id);
  } else if (date) {
    // 🛑 БУЛО: фільтр по created_at (помилка)
    // ✅ СТАЛО: фільтр по колонці date (календарна дата)
    query = query.eq("date", date);
  } else if (limit) {
    query = query.limit(Number(limit));
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { data, error } = await supabase.from("transactions").insert([body]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "No ID" }, { status: 400 });

  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { 
    id, 
    title, income, expense, writeoff, payment_method, payment_status, 
    admin_check, admin_comment, seller_comment,
    fop_name, supplier_payment_date
  } = body; 

  const updates: any = {};

  if (admin_check !== undefined) {
    updates.admin_check = admin_check;
    if (admin_comment !== undefined) updates.admin_comment = admin_comment;
  }
  if (seller_comment !== undefined) updates.seller_comment = seller_comment;

  if (title !== undefined) updates.title = title;
  if (income !== undefined) updates.income = income;
  if (expense !== undefined) updates.expense = expense;
  if (writeoff !== undefined) updates.writeoff = writeoff;
  if (payment_method !== undefined) updates.payment_method = payment_method;
  if (payment_status !== undefined) updates.payment_status = payment_status;

  if (fop_name !== undefined) updates.fop_name = fop_name;
  if (supplier_payment_date !== undefined) updates.supplier_payment_date = supplier_payment_date;

  if (income !== undefined || expense !== undefined || writeoff !== undefined || payment_status !== undefined) {
      updates.admin_check = 'pending';
  }

  const { data, error } = await supabase.from("transactions").update(updates).eq("id", id).select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}