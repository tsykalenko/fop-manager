import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // 👈 Тут підключається твоя краса (Tailwind)

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FOP Manager", // Назва у вкладці браузера
  description: "Система обліку для ФОП",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        {/* 👇 Сюди Next.js вставляє твої сторінки (Admin або Seller) */}
        {children}
      </body>
    </html>
  );
}