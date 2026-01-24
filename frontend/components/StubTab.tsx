"use client";

interface Props {
  title?: string; // Можна передати свій заголовок, наприклад "Зарплата"
}

export default function StubTab({ title = "Цей розділ" }: Props) {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border-2 border-dashed border-slate-200">
      
      {/* Анімована іконка */}
      <div className="relative mb-6 group cursor-default">
        <div className="absolute -inset-4 bg-emerald-100/50 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
        <div className="relative bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm text-6xl animate-bounce">
          🚧
        </div>
      </div>

      {/* Тексти */}
      <h2 className="text-2xl font-black text-slate-800 mb-2">
        {title} у розробці
      </h2>
      
      <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">
        Ми працюємо над цим функціоналом прямо зараз. <br/>
        Скоро тут з'являться графіки, таблиці та магія 🪄
      </p>

      {/* Фейкова кнопка (для краси) */}
      <button 
        disabled 
        className="px-6 py-3 rounded-xl bg-slate-100 text-slate-400 font-bold text-sm cursor-not-allowed border border-slate-200 select-none"
      >
        🔔 Повідомити, коли буде готово
      </button>

    </div>
  );
}