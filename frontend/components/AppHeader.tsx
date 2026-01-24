"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface TabItem {
  id: string;
  label: string;
  icon: string;
}

interface Props {
  title: string;
  userType: string;
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export default function AppHeader({ title, userType, tabs, activeTab, onTabChange }: Props) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_name");
    router.push("/");
  };

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('uk-UA', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    }));
  }, []);

  return (
    // 1. ГОЛОВНА ЗМІНА: w-full, прибрали rounded, прибрали відступи
    <div className="w-full bg-slate-900 shadow-md mb-8">
      
      {/* ВЕРХНЯ ЧАСТИНА: Лого і Інфо */}
      <div className="bg-gradient-to-r from-emerald-950 to-emerald-900 text-white border-b border-emerald-800/30">
        {/* Контейнер для центрування вмісту */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* Логотип */}
            <div className="flex items-center gap-4">
              <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30 backdrop-blur-sm">
                <span className="text-2xl">💎</span>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                  {title.split(' ')[0]} 
                  <span className="text-emerald-400 font-light"> {title.split(' ')[1]}</span>
                </h1>
                <div className="flex items-center gap-2 text-emerald-200/60 text-xs font-medium uppercase tracking-widest mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {userType}
                </div>
              </div>
            </div>

            {/* Права частина */}
            <div className="flex items-center gap-6">
                <div className="text-right hidden md:block">
                    <div className="text-emerald-100 text-sm capitalize font-medium">{currentDate}</div>
                </div>
                
                <button 
                    onClick={handleLogout}
                    className="bg-emerald-900/50 hover:bg-red-500/20 hover:text-red-200 border border-emerald-800 text-emerald-300 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2"
                >
                    <span>Вихід</span>
                    <span>🚪</span>
                </button>
            </div>
        </div>
      </div>

      {/* НИЖНЯ ЧАСТИНА: Навігація */}
      <div className="bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-hide pt-2">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`
                    relative px-6 py-3 text-sm font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap border-b-2
                    ${isActive 
                        ? "border-emerald-500 text-emerald-50" 
                        : "border-transparent text-emerald-200/70 hover:bg-emerald-800/50 hover:text-white"
                    }
                    `}
                >
                    <span className={`text-lg ${isActive ? "scale-110" : "scale-100 grayscale opacity-70"} transition-transform`}>
                        {tab.icon}
                    </span>
                    {tab.label}
                </button>
                );
            })}
            </div>
        </div>
      </div>
    </div>
  );
}