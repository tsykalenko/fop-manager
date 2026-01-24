import "./globals.css";

export const metadata = {
  title: "FOP Manager",
  description: "Облік для ФОП",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body className="bg-slate-50 min-h-screen text-slate-900 font-sans">
        {/* Ми прибрали <main className="max-w-3xl..."> */}
        {children}
      </body>
    </html>
  );
}