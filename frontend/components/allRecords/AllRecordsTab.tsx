"use client";

import { useState, useEffect } from "react";

// 1. Додаємо пропс role, щоб знати, хто дивиться (Адмін чи Продавець)
interface Props {
  role?: "seller" | "admin";
}

interface Transaction {
  id: number;
  date: string;
  invoice_number: string | null;
  type: 'income' | 'expense';
  amount: string;
  payment_method: string;
  status: string;
  category: string;
  comment: string | null;
  created_at: string;
}

export default function AllRecordsTab({ role = "seller" }: Props) {
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 2. Виносимо функцію завантаження окремо
  const loadData = () => {
    const token = localStorage.getItem("token"); // <--- БЕРЕМО ТОКЕН

    fetch("http://localhost:8080/api/transactions", {
      headers: {
        "Authorization": `Bearer ${token}`, // <--- ПОКАЗУЄМО ЙОГО СЕРВЕРУ
        "Content-Type": "application/json"
      }
    })
      .then((res) => {
        // Якщо токен протух (401) - викидаємо на вхід
        if (res.status === 401) {
             window.location.href = "/";
             return [];
        }
        return res.json();
      })
      .then((data) => {
        if(Array.isArray(data)) {
            setItems(data);
        }
        setLoading(false);
      })
      .catch((err) => {
          console.error(err);
          setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  // 3. Функція видалення (Тільки для Адміна)
  const handleDelete = async (id: number) => {
    if(!confirm("Видалити цей запис назавжди?")) return;
    
    const token = localStorage.getItem("token");

    try {
        await fetch(`http://localhost:8080/api/transactions/${id}`, { 
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        // Оновлюємо список без перезавантаження сторінки
        setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
        alert("Помилка видалення");
    }
  };

  // Фільтрація
  const filteredItems = items.filter(item => 
    (item.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     item.category?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const isAdmin = role === "admin";

  return (
    <div className="space-y-6">
      
      {/* ПАНЕЛЬ ІНСТРУМЕНТІВ */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          📦 {isAdmin ? "Архів (Адмін)" : "Реєстр операцій"}
          <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full">{items.length}</span>
        </h2>
        
        <input 
          type="text" 
          placeholder="🔍 Пошук..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm w-full md:w-64 outline-none focus:border-emerald-500"
        />
      </div>

      {/* ВЕЛИКА ТАБЛИЦЯ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Дата</th>
              <th className="px-6 py-4">Назва</th>
              <th className="px-6 py-4">Категорія</th>
              <th className="px-6 py-4">Оплата</th>
              <th className="px-6 py-4 text-right">Сума</th>
              <th className="px-6 py-4">Статус</th>
              {/* Показуємо колонку дій тільки Адміну */}
              {isAdmin && <th className="px-6 py-4 text-center">Дії</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={isAdmin ? 7 : 6} className="p-8 text-center text-slate-400">Завантаження...</td></tr>
            ) : filteredItems.length === 0 ? (
              <tr><td colSpan={isAdmin ? 7 : 6} className="p-8 text-center text-slate-400">Записів не знайдено</td></tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-slate-500 font-medium">{item.date}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{item.invoice_number || "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                        item.type === 'income' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                        {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                     {item.payment_method === 'cash' ? '💵 Готівка' : '💳 Банк'}
                  </td>
                  <td className={`px-6 py-4 text-right font-black text-base ${
                    item.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {item.type === 'income' ? '+' : '-'}{Number(item.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {item.status === 'pending' && <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded border border-orange-100">⏳ В обробці</span>}
                    {item.status === 'approved' && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">✅ Проведено</span>}
                    {item.status === 'rejected' && <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">🚫 Відмова</span>}
                  </td>
                  
                  {/* Кнопка видалення ТІЛЬКИ ДЛЯ АДМІНА */}
                  {isAdmin && (
                      <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="text-red-400 hover:text-red-600 font-bold px-3 py-1 hover:bg-red-50 rounded transition"
                            title="Видалити назавжди"
                          >
                              🗑
                          </button>
                      </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}