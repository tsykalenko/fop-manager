"use client";

import { useState, useEffect } from "react";
import Link from "next/link"; // Для переходів без перезавантаження
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 1. Перевіряємо юзера при завантаженні
    checkUser();

    // 2. Слухаємо зміни (вхід/вихід), щоб меню оновлювалось миттєво
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setRole(data?.role || "seller");
    } else {
      setRole(null);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login"); // Після виходу кидаємо на логін
  };

  // Не показуємо меню на сторінці логіна (щоб не відволікало)
  // Можна прибрати цю умову, якщо хочеш
  if (typeof window !== "undefined" && window.location.pathname === "/login") {
    return null;
  }

  return (
    <nav className="bg-slate-900 text-white border-b border-slate-700">
      <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* Логотип */}
        <div className="font-bold text-lg tracking-wider">
          <Link href="/">🏪 МІЙ МАГАЗИН</Link>
        </div>

        {/* Кнопки */}
        <div className="flex gap-4 text-sm font-medium items-center">
          
          {user ? (
            <>
              {/* Всі бачать Касу */}
              <Link href="/" className="hover:text-blue-300 transition">💵 Каса</Link>

              {/* Тільки Адмін бачить Адмінку */}
              {role === 'admin' && (
                <Link href="/admin" className="text-yellow-400 hover:text-yellow-300 transition">🛡 Адмінка</Link>
              )}

              {/* Кнопка Вихід */}
              <button 
                onClick={handleLogout} 
                className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded transition"
              >
                Вийти
              </button>
            </>
          ) : (
            <Link href="/login" className="text-blue-300 hover:text-white">Увійти</Link>
          )}
        </div>
      </div>
    </nav>
  );
}