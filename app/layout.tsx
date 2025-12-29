import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Ось цей рядок вмикає стилі!

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FOP Manager",
  description: "Моя бухгалтерія",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className={inter.className}>{children}</body>
    </html>
  );
}