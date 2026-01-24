"use client";

import { useState, useEffect } from "react"; // <--- useEffect
import AppHeader, { TabItem } from "@/components/AppHeader";
import AuthGuard from "@/components/AuthGuard";

import DailyTab from "@/components/daily/DailyTab";
import AllRecordsTab from "@/components/allRecords/AllRecordsTab";
import ReportsTab from "@/components/reports/ReportsTab";
import RevisionTab from "@/components/revision/RevisionTab";

export default function SellerPage() {
  const [activeTab, setActiveTab] = useState("daily");

  // 1. ЗАВАНТАЖЕННЯ
  useEffect(() => {
    const savedTab = localStorage.getItem("seller_active_tab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  // 2. ЗБЕРЕЖЕННЯ
  const handleTabChange = (id: string) => {
    setActiveTab(id);
    localStorage.setItem("seller_active_tab", id);
  };

  const SELLER_TABS: TabItem[] = [
    { id: "daily", label: "Денний звіт", icon: "📝" },
    { id: "all", label: "Склад / Архів", icon: "📦" },
    { id: "reports", label: "Звіт тиждень", icon: "📊" },
    { id: "revision", label: "Переоблік", icon: "⚖️" },
  ];

  return (
    <AuthGuard requiredRole="seller">
    <div className="min-h-screen bg-slate-50 pb-10">
      <AppHeader 
        title="FOP Manager"
        userType="Панель Продавця"
        tabs={SELLER_TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange} // <--- НОВА ФУНКЦІЯ
      />

      <div className="px-4 md:px-8 max-w-7xl mx-auto mt-8">
        <div className="transition-all duration-500 ease-in-out">
          {activeTab === "daily" && <DailyTab />}
          {activeTab === "all" && <AllRecordsTab role="seller" />}
          {activeTab === "reports" && <ReportsTab />}
          {activeTab === "revision" && <RevisionTab />}
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}