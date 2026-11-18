import React from 'react';
import { Home, FileText, QrCode, FolderArchive, Scale, ShieldCheck } from 'lucide-react';

export type TabType = 'dashboard' | 'letter' | 'apply' | 'records' | 'legal' | 'auth';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingSyncCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  pendingSyncCount = 0
}) => {
  const tabs: { id: TabType; label: string; icon: typeof Home; badge?: number }[] = [
    { id: 'dashboard', label: 'ပင်မ', icon: Home },
    { id: 'letter', label: 'ရုံးစာ', icon: FileText },
    { id: 'apply', label: 'လျှောက်လွှာ', icon: QrCode },
    { id: 'records', label: 'မှတ်တမ်း', icon: FolderArchive, badge: pendingSyncCount },
    { id: 'legal', label: 'ဥပဒေ', icon: Scale },
    { id: 'auth', label: 'အကောင့်', icon: ShieldCheck }
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-2.5 left-2.5 right-2.5 z-40 pb-safe no-print"
    >
      <div className="max-w-md mx-auto ios-liquid-glass border border-slate-900/10 dark:border-white/15 rounded-[28px] px-1.5 py-1.5 grid grid-cols-6 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`min-h-[46px] flex flex-col items-center justify-center py-1 px-0.5 rounded-[22px] transition-all relative ios-press cursor-pointer ${
                isActive
                  ? 'bg-[#0055D4]/12 dark:bg-blue-500/20 text-[#0055D4] dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
              }`}
            >
              <Icon className={`w-[19px] h-[19px] ${isActive ? 'stroke-[2.4]' : 'stroke-[1.9]'}`} />
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap leading-none">
                {tab.label}
              </span>
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-[#0055D4] text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
