"use client";

import { useState, useEffect, useMemo } from "react";
import ArchiveCalendar from "./components/ArchiveCalendar";
import RecordsTable from "./components/RecordsTable";
import RepayDebtModal from "./modals/RepayDebtModal";
import { Transaction } from "./types";
import { useIntersection } from "./hooks/useIntersection";

const ITEMS_PER_PAGE = 30;

export default function AllRecords() {
    const [items, setItems] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [repayItem, setRepayItem] = useState<Transaction | null>(null);

    // Пагінація
    const [page, setPage] = useState(1);
    const { ref: loadMoreRef, isIntersecting } = useIntersection({ threshold: 0.5 });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    useEffect(() => {
        loadAllData();
    }, []);

    useEffect(() => {
        if (isIntersecting) {
            setPage(prev => prev + 1);
        }
    }, [isIntersecting]);

    useEffect(() => {
        setPage(1);
    }, [selectedDate]);

    const loadAllData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${apiUrl}/api/transactions`, {
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "ngrok-skip-browser-warning": "true",
                    "Accept": "application/json"
                }
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setItems(data);
                }
            }
        } catch (e) {
            console.error("Failed to load archive", e);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = useMemo(() => {
        return selectedDate 
            ? items.filter(i => i.date === selectedDate)
            : items;
    }, [items, selectedDate]);

    const visibleItems = useMemo(() => {
        return filteredItems.slice(0, page * ITEMS_PER_PAGE);
    }, [filteredItems, page]);

    const hasMore = visibleItems.length < filteredItems.length;

    return (
        // 👇 ЗМІНА 1: Flex-col замість Grid. Тепер елементи йдуть зверху вниз.
        <div className="flex flex-col gap-6 pb-20 items-start">
            
            {/* ВЕРХНЯ СЕКЦІЯ: Календар + Інфо-панель */}
            <div className="w-full grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">
                
                {/* 1. Календар (фіксована ширина на десктопі, щоб не розтягувався) */}
                <div className="w-full md:w-[320px] flex-shrink-0">
                    <ArchiveCalendar 
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        items={items}
                    />
                </div>

                {/* 2. Інформаційна панель (Заголовок, Легенда, Кнопка) */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col justify-between">
                    <div>
                        <h2 className="font-bold text-slate-800 text-xl mb-2 flex items-center gap-2">
                            🗄 Архів операцій
                            {selectedDate && (
                                <span className="bg-blue-100 text-blue-700 text-sm px-2 py-0.5 rounded-full">
                                    {selectedDate}
                                </span>
                            )}
                        </h2>
                        <p className="text-sm text-slate-500 mb-4">
                            Тут відображаються абсолютно всі операції. Використовуйте календар зліва для фільтрації по днях.
                            Червоні дні в календарі означають наявність неоплачених боргів.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-4 mt-4">
                        {/* Легенда кольорів (дублюємо тут для зручності) */}
                        <div className="flex gap-4 text-xs text-slate-500">
                             <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                Оплачено
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                Є борги
                            </div>
                        </div>

                        {/* Кнопка скидання фільтру */}
                        {selectedDate && (
                            <button 
                                onClick={() => setSelectedDate(null)}
                                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center gap-2"
                            >
                                🔄 Показати всі записи
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* НИЖНЯ СЕКЦІЯ: Таблиця на всю ширину */}
            <div className="w-full">
                {loading ? (
                    <div className="text-center p-10 text-slate-400">Завантаження...</div>
                ) : (
                    <>
                        <RecordsTable 
                            items={visibleItems} 
                            onPayClick={(item) => setRepayItem(item)} 
                        />
                        
                        {hasMore && (
                            <div ref={loadMoreRef} className="py-8 text-center text-slate-400 text-xs animate-pulse">
                                Завантаження старих записів...
                            </div>
                        )}

                        {!hasMore && filteredItems.length > 0 && (
                            <div className="py-8 text-center text-slate-300 text-xs">
                                — Це всі записи —
                            </div>
                        )}
                    </>
                )}
            </div>

            <RepayDebtModal 
                item={repayItem}
                isOpen={!!repayItem}
                onClose={() => setRepayItem(null)}
                onSuccess={() => {
                    loadAllData(); 
                }}
            />
        </div>
    );
}