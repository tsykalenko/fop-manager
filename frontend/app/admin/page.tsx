"use client";

import { useState, useEffect } from "react";
import AppHeader, { TabItem } from "@/components/AppHeader";
import AuthGuard from "@/components/AuthGuard";
import StubTab from "@/components/StubTab";

// Імпорти твоїх вкладок...
import ValidationTab from "@/components/validation/ValidationTab";
import AnalyticsTab from "@/components/analytics/AnalyticsTab";
import AllRecordsTab from "@/components/allRecords/AllRecordsTab";
import RevisionTab from "@/components/revision/RevisionTab";
import SalaryTab from "@/components/salary/SalaryTab";
import SettingsTab from "@/components/settings/SettingsTab";
import DailyTab from "@/components/daily-report/DailyManager";

// 👇 1. Імпорти для "Ока"
import { InspectionProvider } from "@/context/InspectionContext";
import InspectionToggle from "@/components/ui/InspectionToggle";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("validation");

  // ЗАВАНТАЖЕННЯ: При старті читаємо пам'ять
  useEffect(() => {
    const savedTab = localStorage.getItem("admin_active_tab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  // ЗБЕРЕЖЕННЯ: Функція перемикання
  const handleTabChange = (id: string) => {
    setActiveTab(id);
    localStorage.setItem("admin_active_tab", id);
  };

  const ADMIN_TABS: TabItem[] = [
    { id: "validation", label: "Валідація", icon: "👀" },
    { id: "daily", label: "Денний звіт", icon: "📝" },
    { id: "all", label: "Архів операцій", icon: "📦" },
    { id: "revision", label: "Переоблік", icon: "⚖️" },
    { id: "salary", label: "Зарплата", icon: "💵" },
    { id: "analytics", label: "Аналітика", icon: "📊" },
    { id: "settings", label: "Налаштування", icon: "⚙️" },
  ];

  return (
    <AuthGuard requiredRole="admin">
      {/* 👇 2. Огортаємо все в Провайдер, щоб кнопка працювала всюди */}
      <InspectionProvider>
        <div className="min-h-screen bg-slate-50 pb-10">
            
          {/* Контейнер для Шапки + Кнопки */}
          <div className="relative">
              <AppHeader 
                title="FOP Manager"
                userType="Панель Адміна" 
                tabs={ADMIN_TABS}
                activeTab={activeTab}
                onTabChange={handleTabChange} 
              />

              {/* 👇 3. Додаємо кнопку-око поверх шапки (справа) */}
              <div className="absolute top-6 right-6 z-50 md:top-8 md:right-8">
                  <InspectionToggle />
              </div>
          </div>

          <div className="px-4 md:px-8 max-w-7xl mx-auto mt-8">
            <div className="transition-all duration-500 ease-in-out">
              
              {activeTab === "validation" && <StubTab />}
              {activeTab === "daily" && <DailyTab />} {/* Тут тепер працюватиме фільтр */}
              {activeTab === "analytics" && <StubTab />}
              {activeTab === "all" && <StubTab />}
              {activeTab === "revision" && <StubTab />}
              {activeTab === "salary" && <StubTab />}
              {activeTab === "settings" && <StubTab />}

            </div>
          </div>
        </div>
      </InspectionProvider>
    </AuthGuard>
  );
}