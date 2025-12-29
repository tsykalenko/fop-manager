import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link"; // Це спеціальна "ссилка" для Next.js

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FOP Manager",
  description: "Моя бухгалтерія",
  manifest: "/manifest.json", // Це на майбутнє для встановлення як додаток
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className={`${inter.className} bg-gray-50 pb-24`}>
        {/* Тут виводиться твоя сторінка (Home або Salary) */}
        {children}

        {/* НИЖНЄ МЕНЮ (Як у мобільних додатках) */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 pb-safe">
          <div className="flex justify-around items-center h-16 max-w-md mx-auto">
            
            {/* Кнопка 1: Головна */}
            <Link 
              href="/" 
              className="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-blue-600 active:text-blue-700 transition"
            >
              <span className="text-2xl">📊</span>
              <span className="text-xs font-medium mt-1">Транзакції</span>
            </Link>

            {/* Кнопка 2: Зарплата */}
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