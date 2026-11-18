import React from 'react';
import { Shield, WifiOff } from 'lucide-react';
import { User } from '../types';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { TabType } from './BottomNav';

interface HeaderProps {
  user: User | null;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  onTabChange,
  onOpenAuth
}) => {
  const isOnline = useOnlineStatus();

  const navLinks: { id: TabType; label: string }[] = [
    { id: 'dashboard', label: 'ပင်မ' },
    { id: 'letter', label: 'ရုံးစာ' },
    { id: 'apply', label: 'လျှောက်လွှာဇုန်' },
    { id: 'records', label: 'မှတ်တမ်း' },
    { id: 'legal', label: 'ဥပဒေ' }
  ];

  return (
    <header className="sticky top-0 z-40 ios-liquid-glass border-b border-slate-900/8 dark:border-white/10 px-4 h-[52px] flex items-center w-full no-print">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-6 w-full">
        {/* Zone 1: Clean Single-Line Wordmark */}
        <button
          type="button"
          onClick={() => onTabChange('dashboard')}
          className="flex items-center gap-2.5 shrink-0 whitespace-nowrap text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0055D4] rounded-xl"
        >
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#0A2E6E] to-[#0055D4] flex items-center justify-center text-white shadow-sm">
            <Shield className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
            Golden Gate MM
          </span>
        </button>

        {/* Zone 2: Desktop Single-Line Text Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
          {navLinks.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`whitespace-nowrap shrink-0 py-1.5 transition-colors border-b-2 cursor-pointer ${
                  active
                    ? 'text-[#0055D4] dark:text-blue-400 border-[#0055D4] dark:border-blue-400 font-bold'
                    : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Account Action */}
        <div className="flex items-center gap-2 shrink-0">
          {!isOnline && (
            <span
              title="Offline Mode"
              className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 mr-1 whitespace-nowrap"
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Offline</span>
            </span>
          )}

          {user && (
            <button
              type="button"
              onClick={onOpenAuth}
              className="min-h-[40px] flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-slate-900/5 dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/15 transition text-xs font-semibold text-slate-900 dark:text-white whitespace-nowrap shrink-0 ios-press cursor-pointer"
              title="အကောင့် နှင့် လုံခြုံရေး"
            >
              <div className="w-6 h-6 rounded-full bg-[#0055D4] text-white flex items-center justify-center font-bold text-[11px]">
                {user.name ? user.name.charAt(0).toUpperCase() : 'O'}
              </div>
              <span className="hidden sm:inline max-w-[110px] truncate">{user.name}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
