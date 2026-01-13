"use client";
import { useRef } from "react";
import { TabItem } from "../types";

interface Props {
  role: "admin" | "seller";
  userName: string | null;
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: any) => void;
  viewDate: string;
  setViewDate: (date: string) => void;
  onLogout: () => void;
}

export function AppHeader({ role, userName, tabs, activeTab, onTabChange, viewDate, setViewDate, onLogout }: Props) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const changeDate = (days: number) => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() + days);
    setViewDate(d.toISOString().split('T')[0]);
  };

  const openCal = () => { if (dateInputRef.current) dateInputRef.current.showPicker(); };

  return (
    <nav className="bg-slate-900 text-white shadow-xl sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-16 relative flex items-center justify-between">
        
        {/* Лого */}
        <div className="flex items-center gap-3 shrink-0 z-10 relative">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-lg shadow-lg ${role === 'admin' ? 'bg-emerald-500 text-slate-900' : 'bg-emerald-600'}`}>F</div>
            <div className="hidden md:block font-bold text-lg tracking-tight text-slate-200">
                FOP <span className="text-emerald-500">{role === 'admin' ? 'Manager' : 'Seller'}</span>
            </div>
            {role === 'admin' && <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">Admin</span>}
        </div>

        {/* Вкладки */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center pointer-events-none">
            <div className="flex items-center bg-slate-800 p-1 rounded-xl gap-1 pointer-events-auto border border-white/5 shadow-inner">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => onTabChange(tab.id)} className={`relative px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-2 border border-transparent ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && <span className="bg-red-500 text-white text-[9px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full -mr-1 animate-pulse border border-slate-800">{tab.count}</span>}
                    </button>
                ))}
            </div>
        </div>

        {/* Права частина */}
        <div className="flex items-center gap-4 shrink-0 z-10 relative ml-auto">
            {(activeTab === 'daily' || activeTab === 'trade') && (
                <div className="hidden md:flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-white/10 mr-2">
                    <button onClick={() => changeDate(-1)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded text-slate-400 hover:text-white transition">‹</button>
                    <div onClick={openCal} className="relative group px-3 text-center cursor-pointer min-w-[100px]">
                        <div className="text-[10px] text-slate-500 uppercase leading-none font-bold">Дата</div>
                        <div className="text-sm font-bold text-slate-200 leading-none mt-1">{new Date(viewDate).toLocaleDateString('uk-UA', {day: '2-digit', month: 'short'})}</div>
                        <input ref={dateInputRef} type="date" value={viewDate} onChange={(e) => setViewDate(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                    <button onClick={() => changeDate(1)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded text-slate-400 hover:text-white transition">›</button>
                </div>
            )}
            <div className="h-8 w-px bg-white/10 hidden md:block"></div>
            <div className="flex items-center gap-3 group cursor-pointer" onClick={onLogout} title="Вийти">
                <div className="text-right hidden sm:block">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">{role === 'admin' ? 'Власник' : 'Продавець'}</div>
                    <div className="text-xs font-bold text-emerald-400">{userName || '...'}</div>
                </div>
                <div className="bg-slate-800 p-2 rounded-lg text-slate-400 group-hover:text-red-400 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg></div>
            </div>
        </div>
      </div>
    </nav>
  );
}