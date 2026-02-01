"use client";

import { useState, useEffect } from "react";
import AppHeader, { TabItem } from "@/components/AppHeader";
import AuthGuard from "@/components/AuthGuard";
import StubTab from "@/components/StubTab"; // Заглушка для майбутніх вкладок
import DailyTab from "@/components/daily-report/DailyReport";

// 👇 1. Імпорти для "Ока"
import { InspectionProvider } from "@/context/InspectionContext";
import InspectionToggle from "@/components/ui/InspectionToggle";

export default function SellerPage() {
  const [activeTab, setActiveTab] = useState("daily");

  // ЗАВАНТАЖЕННЯ: Зберігаємо вибір вкладки
  useEffect(() => {
    const savedTab = localStorage.getItem("seller_active_tab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    localStorage.setItem("seller_active_tab", id);
  };

  // 👇 Вкладки саме для ПРОДАВЦЯ (зазвичай їх менше, ніж у адміна)
  const SELLER_TABS: TabItem[] = [
    { id: "daily", label: "Денний звіт", icon: "📝" },
    { id: "revision", label: "Переоблік", icon: "⚖️" }, // Додав про всяк випадок
  ];

  return (
    <AuthGuard requiredRole="seller">
      {/* 👇 2. Огортаємо в Провайдер "Ока" */}
      <InspectionProvider>
        <div className="min-h-screen bg-slate-50 pb-10">
            
          {/* Контейнер для Шапки + Кнопки */}
          <div className="relative">
              <AppHeader 
                title="FOP Manager"
                userType="Панель Продавця" // 👈 Тут пишемо Продавець
                tabs={SELLER_TABS}
                activeTab={activeTab}
                onTabChange={handleTabChange} 
              />

              {/* 👇 3. Кнопка-око (Точно так само, як в Адмінці) */}
              <div className="absolute top-6 right-6 z-50 md:top-8 md:right-8">
                  <InspectionToggle />
              </div>
          </div>

          <div className="px-4 md:px-8 max-w-7xl mx-auto mt-8">
            <div className="transition-all duration-500 ease-in-out">
              
              {activeTab === "daily" && <DailyTab />}
              {activeTab === "revision" && <StubTab />}

            </div>
          </div>
        </div>
      </InspectionProvider>
    </AuthGuard>
  );
}