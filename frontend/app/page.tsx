"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 👇 ЗМІНА: Визначаємо адресу сервера динамічно
      // Якщо ми на Vercel — беремо з Environment Variables
      // Якщо локально — беремо localhost
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

      const res = await fetch(`${apiUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Невірний логін або пароль");
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user_role", data.user.role);
      localStorage.setItem("user_name", data.user.name);

      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/seller");
      }

    } catch (err: any) {
      console.error(err); // Корисно для відладки
      // Якщо помилка мережі (Failed to fetch)
      if (err.message === "Failed to fetch") {
          setError("Помилка з'єднання з сервером. Перевірте інтернет або чи запущено Ngrok.");
      } else {
          setError(err.message);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      {/* Картка Входу */}
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Шапка */}
        <div className="bg-emerald-950 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="text-5xl mb-2 relative z-10">💎</div>
            <h1 className="text-2xl font-bold text-white tracking-wide relative z-10">FOP Manager</h1>
            <p className="text-emerald-400 text-sm font-medium uppercase tracking-widest mt-1 relative z-10">Система обліку</p>
        </div>

        {/* Форма */}
        <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
                
                {/* Повідомлення про помилку */}
                {error && (
                    <div className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-xl border border-red-100 flex items-center gap-2">
                        <span>⛔️</span> {error}
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Email адреса</label>
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition"
                        placeholder="user@fop.com"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Пароль</label>
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition"
                        placeholder="••••••••"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition transform active:scale-[0.98] ${
                        loading ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/30"
                    }`}
                >
                    {loading ? "Заходимо..." : "Увійти в кабінет ➜"}
                </button>
            </form>
            
            <div className="mt-6 text-center text-xs text-slate-400">
                Забули пароль? Зверніться до Власника.
            </div>
        </div>
      </div>
    </div>
  );
}