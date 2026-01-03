import { NextResponse } from "next/server";
import { transactionService } from "@/lib/services/transactionService";

// GET: Обробляє запит на отримання даних
export async function GET(request: Request) {
  try {
    // Витягуємо дату з URL (наприклад ?date=2025-01-01)
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    // Викликаємо наш сервіс
    const data = await transactionService.getByDate(date);
    
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Обробляє запит на створення
export async function POST(request: Request) {
  try {
    const body = await request.json(); // Читаємо дані, які прислав фронтенд
    
    const result = await transactionService.create(body);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Обробляє видалення
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await transactionService.delete(Number(id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}