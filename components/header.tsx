"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState<string>(""); 
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkUser();
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
        .select("role, full_name") 
        .eq("id", user.id)
        .single();
      
      setRole(data?.role || "seller");
      setName(data?.full_name || user.email?.split('@')[0] || "Користувач");
    } else {
      setRole(null);
      setName("");
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (pathname === "/login") return null;
  const homeLink = role === 'admin' ? "/admin" : "/";

  return (
    <nav className="bg-emerald-700 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        
        <div className="font-bold text-lg tracking-wider flex items-center gap-2">
          <span>🍃</span> 
          <Link href={homeLink} className="hover:opacity-90 transition">
             FOP MANAGER
          </Link>
        </div>

        {/* Кнопку "Звіти" ми звідси ПРИБРАЛИ */}

        <div className="flex gap-3 text-sm font-medium items-center">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2 bg-emerald-800/40 px-3 py-1.5 rounded-full border border-emerald-600/30 text-emerald-50 cursor-default">
                <span className="text-emerald-200">👤</span>
                <span className="max-w-[150px] truncate">{name}</span>
              </div>
              <button onClick={handleLogout} className="ml-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-1.5 rounded-lg transition backdrop-blur-sm whitespace-nowrap">
                Вийти
              </button>
            </>
          ) : (
            <Link href="/login" className="text-white font-bold border-b border-transparent hover:border-white transition">Увійти</Link>
          )}
        </div>
      </div>
    </nav>
  );
}