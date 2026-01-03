import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link"; 
import Header from "@/components/header"; // 👈 1. Імпортуємо верхнє меню

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FOP Manager",
  description: "Моя бухгалтерія",
  manifest: "/manifest.json", 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className={`${inter.className} bg-gray-50 pb-24`}>
        
        {/* 👇 2. Вставляємо верхнє меню СЮДИ (над усім іншим) */}
        <Header />

        {/* Тут виводиться твоя сторінка (Home або Salary) */}
        {children}

        {/* НИЖНЄ МЕНЮ (Твоє рідне) */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 pb-safe">
          <div className="flex justify-around items-center h-16 max-w-md mx-auto">
            
            {/* Кнопка 1: Головна (Каса) */}
            <Link 
              href="/" 
              className="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-blue-600 active:text-blue-700 transition"
            >
              <span className="text-2xl">📊</span>
              <span className="text-xs font-medium mt-1">Каса</span>
            </Link>

            {/* Кнопка 2: Зарплата (поки що веде в нікуда, якщо сторінки нема, але хай буде) */}
            <Link 
              href="/salary" 
              className="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-blue-600 active:text-blue-700 transition"
            >
              <span className="text-2xl">💰</span>
              <span className="text-xs font-medium mt-1">Зарплата</span>
            </Link>

          </div>
        </nav>
      </body>
    </html>
  );
}