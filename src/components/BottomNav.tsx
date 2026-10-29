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
  const tabs = [
    { id: 'dashboard', label: 'ပင်မ', icon: Home },
    { id: 'letter', label: 'ရုံးစာရေးသား', icon: FileText },
    { id: 'apply', label: 'လျှောက်လွှာဇုန်', icon: QrCode },
    { id: 'records', label: 'မှတ်တမ်းများ', icon: FolderArchive, badge: pendingSyncCount },
    { id: 'legal', label: 'ဥပဒေရှာဖွေ', icon: Scale },
    { id: 'auth', label: 'အကောင့်', icon: ShieldCheck }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1.5 pb-safe shadow-lg">
      <div className="max-w-lg mx-auto grid grid-cols-6 items-center">

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as TabType)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-blue-950 font-black'
                  : 'text-slate-500 hover:text-slate-900 font-semibold'
              }`}
            >
              <div className={`p-1 rounded-lg transition ${
                isActive ? 'bg-blue-100 text-blue-950' : ''
              }`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap font-bold">
                {tab.label}
              </span>
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-blue-900 text-white text-[9px] font-black flex items-center justify-center shadow-2xs">
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
