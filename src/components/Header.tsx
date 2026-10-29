import React from 'react';
import { Shield, Wifi, WifiOff, Lock, User as UserIcon } from 'lucide-react';
import { User } from '../types';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface HeaderProps {
  user: User | null;
  onOpenAuth: () => void;
  onOpenGoogleOAuthGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenAuth,
  onOpenGoogleOAuthGuide
}) => {
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3.5 py-2.5 shadow-xs w-full max-w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 w-full">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex items-center justify-center shadow-md shadow-blue-900/20 text-white font-black">
            <Shield className="w-4 h-4 stroke-[2.5] text-white" />
          </div>
          <div>
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-1 leading-none">
              Golden Gate <span className="text-blue-900">MM</span>
            </span>
            <span className="text-[9px] font-bold text-blue-900 tracking-wider block mt-0.5">
              လူဝင်မှုကြီးကြပ်ရေး အရာရှိသုံး
            </span>
          </div>
        </div>

        {/* Zone 2: Status & Quick Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Online/Offline Status Indicator */}
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            isOnline 
              ? 'bg-blue-50 border-blue-200 text-blue-900'
              : 'bg-slate-100 border-slate-300 text-slate-700 animate-pulse'
          }`}>
            {isOnline ? <Wifi className="w-3 h-3 text-blue-800" /> : <WifiOff className="w-3 h-3 text-slate-600" />}
            <span className="hidden xs:inline">{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* User Account / Auth Status */}
          {user ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 transition text-xs font-bold text-slate-900"
              title="အကောင့် စီမံခန့်ခွဲရန်"
            >
              <div className="w-5 h-5 rounded-lg bg-blue-900 text-white flex items-center justify-center font-extrabold text-[10px]">
                {user.name ? user.name.charAt(0).toUpperCase() : 'O'}
              </div>
              <span className="hidden sm:inline max-w-[90px] truncate text-slate-900">{user.name}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs transition shadow-2xs"
            >
              <Lock className="w-3 h-3 text-white" />
              <span>ဝင်ရောက်ရန်</span>
            </button>
          )}

          {/* OAuth Setup Info Button */}
          <button
            onClick={onOpenGoogleOAuthGuide}
            className="p-1.5 rounded-xl text-slate-600 hover:text-blue-900 hover:bg-blue-50 transition"
            title="Google OAuth လမ်းညွှန်"
          >
            <UserIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
