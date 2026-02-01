"use client";

import { useState, useEffect } from "react";
import AppHeader, { TabItem } from "@/components/AppHeader";
import AuthGuard from "@/components/AuthGuard";
import StubTab from "@/components/StubTab";

// Вкладки
import ValidationTab from "@/components/validation/ValidationTab";
import AnalyticsTab from "@/components/analytics/AnalyticsTab";
import RevisionTab from "@/components/revision/RevisionTab";
import SalaryTab from "@/components/salary/SalaryTab";
import SettingsTab from "@/components/settings/SettingsTab";
import DailyTab from "@/components/daily-report/DailyReport";

// Контекст залишаємо, щоб не ламалася логіка всередині вкладок, 
// але саму кнопку (Toggle) ми прибираємо.
import { InspectionProvider } from "@/context/InspectionContext";
import AllRecords from "@/components/all-records/AllRecords";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("validation");

  useEffect(() => {
    const savedTab = localStorage.getItem("admin_active_tab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

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
      {/* Провайдер залишаємо, щоб уникнути помилок у дочірніх компонентах */}
      <InspectionProvider>
        <div className="min-h-screen bg-slate-50 pb-10">
            
          {/* Контейнер для Шапки */}
          <div className="relative">
              <AppHeader 
                title="FOP Manager"
                userType="Панель Адміна" 
                tabs={ADMIN_TABS}
                activeTab={activeTab}
                onTabChange={handleTabChange} 
              />
              {/* ❌ Тут була кнопка InspectionToggle, я її видалив. Тепер око муляти не буде. */}
          </div>

          <div className="px-4 md:px-8 max-w-7xl mx-auto mt-8">
            <div className="transition-all duration-500 ease-in-out">
              
              {activeTab === "validation" && <StubTab />}
              {activeTab === "daily" && <DailyTab />}
              {activeTab === "analytics" && <StubTab />}
              {activeTab === "all" && <AllRecords />}
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