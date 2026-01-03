"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Помилка входу: " + error.message);
      setLoading(false);
    } else {
      // Успіх! Перевіряємо, хто це зайшов (Адмін чи ні)
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      
      if (profile?.role === 'admin') {
        router.push("/admin"); // Адміна кидаємо в адмінку
      } else {
        router.push("/"); // Продавця на касу
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-800">Вхід в систему</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="seller@shop.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Пароль</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••"
            />
          </div>

          <button 
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition disabled:opacity-50"
          >
            {loading ? "Входимо..." : "Увійти"}
          </button>
        </div>
      </div>
    </div>
  );
}