"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; // Це залишається, бо ми оновили цей файл у Кроці 3
import { useRouter } from "next/navigation";

// Весь інший код залишається таким самим!
// ... (RootPage компонент)
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      // 1. Перевіряємо, чи є активна сесія
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Якщо не увійшов — на сторінку входу
        router.replace("/login");
        return;
      }

      // 2. Якщо увійшов — дізнаємось роль
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      // 3. Розподіляємо по кабінетах
      if (profile?.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/seller");
      }
    };

    checkUser();
  }, [router]);

  // Поки йде перевірка — показуємо спіннер
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
          {/* Анімоване кільце завантаження */}
          <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
          
          <div className="text-sm font-bold text-slate-400 animate-pulse tracking-wide">
              Завантаження...
          </div>
      </div>
    </div>
  );
}