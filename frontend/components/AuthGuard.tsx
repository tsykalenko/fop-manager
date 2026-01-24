"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  children: React.ReactNode;
  requiredRole?: "admin" | "seller";
}

export default function AuthGuard({ children, requiredRole }: Props) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // 1. Читаємо дані
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("user_role");

    // 2. Якщо немає токена АБО немає ролі — повний вихід
    if (!token || !userRole) {
      // Чистимо все, щоб не було глюків
      localStorage.clear(); 
      router.replace("/");
      return;
    }

    // 3. Перевірка "Чужий серед своїх"
    // Якщо сторінка вимагає роль (наприклад admin), а у юзера інша (seller)
    if (requiredRole && userRole !== requiredRole) {
      if (userRole === "seller") {
          router.replace("/seller");
      } else {
          router.replace("/admin");
      }
      return;
    }

    // 4. Якщо дійшли сюди — все добре, показуємо контент
    setAuthorized(true);
  }, [router, requiredRole]);

  // Поки йде перевірка — показуємо заглушку
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-bold animate-pulse">
        🔒 Перевірка доступу...
      </div>
    );
  }

  return <>{children}</>;
}