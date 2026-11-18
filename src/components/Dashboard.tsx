import React from 'react';
import { FileText, Scale, FolderArchive, ShieldCheck, ArrowUpRight, ChevronRight, QrCode } from 'lucide-react';
import { User, DocumentRecord } from '../types';
import { TabType } from './BottomNav';

interface DashboardProps {
  user: User | null;
  documents: DocumentRecord[];
  onNavigate: (tab: TabType) => void;
  onOpenAuth: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  documents,
  onNavigate,
  onOpenAuth
}) => {
  const modules: {
    id: TabType;
    title: string;
    subtitle: string;
    icon: typeof FileText;
  }[] = [
    {
      id: 'letter',
      title: 'ရုံးစာရေးသားခြင်း နှင့် Auto Format',
      subtitle: 'အပေါ်စာ၊ ကြေးနန်းစာ၊ ရုံးတွင်းအမိန့်နှင့် ထောက်ခံစာ ပုံစံများ',
      icon: FileText
    },
    {
      id: 'legal',
      title: 'ဥပဒေ စာအုပ်များ နှင့် PDF ရှာဖွေစနစ်',
      subtitle: 'PDF ဥပဒေစာအုပ်များ တင်သွင်းခြင်းနှင့် ပုဒ်မရှာဖွေခြင်း',
      icon: Scale
    },
    {
      id: 'records',
      title: 'မှတ်တမ်းများ နှင့် ဖုန်းစာအုပ်',
      subtitle: 'ဝင်စာ/ထွက်စာ မှတ်တမ်းများနှင့် တိုင်း/ခရိုင်/မြို့နယ် ဖုန်းစာအုပ်',
      icon: FolderArchive
    },
    {
      id: 'auth',
      title: 'အကောင့် နှင့် လုံခြုံရေး စီမံမှု',
      subtitle: 'Verified Google Auth၊ Allowlist စီမံမှုနှင့် Theme',
      icon: ShieldCheck
    }
  ];

  return (
    <div className="space-y-6 pb-28 max-w-5xl mx-auto w-full">
      {/* iOS 27 Large Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 px-1">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {user ? `${user.department} · ${user.badgeNumber}` : 'လူဝင်မှုကြီးကြပ်ရေး ဦးစီးဌာန'}
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white text-balance">
            {user ? `မင်္ဂလာပါ၊ ${user.name}` : 'Golden Gate MM'}
          </h1>
        </div>
        {user && (
          <button
            type="button"
            onClick={onOpenAuth}
            className="self-start sm:self-auto min-h-[44px] px-4 py-2 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-slate-900/10 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#0055D4] transition ios-press whitespace-nowrap cursor-pointer"
          >
            {user.role} · {user.email}
          </button>
        )}
      </div>

      {/* Focal Anchor Card: Applying Zone */}
      <button
        type="button"
        onClick={() => onNavigate('apply')}
        className="w-full text-left p-6 sm:p-7 rounded-[28px] bg-gradient-to-br from-[#0A2E6E] via-[#0B3B8C] to-[#071F4A] text-white shadow-lg shadow-blue-950/20 border border-white/15 transition group ios-press cursor-pointer"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/12 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 whitespace-nowrap">
            <span>ဖွင့်လှစ်မည်</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>

        <div className="mt-5 space-y-1.5">
          <p className="text-xs font-medium text-blue-200">
            နိုင်ငံသားစိစစ်ရေးကတ် · အိမ်ထောင်စုစာရင်း · သေဆုံး/မွေးဖွား
          </p>
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
            Applying Zone (လျှောက်လွှာတင်ခြင်း ဇုန်)
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-2xl">
            ပြည်သူများထံသို့ သီးသန့် QR/Link ထုတ်ပေးခြင်းနှင့် တင်သွင်းလာသော လျှောက်လွှာများကို သက်ဆိုင်ရာ အရာရှိထံ တိုက်ရိုက် စိစစ်အတည်ပြုသည့် စနစ်
          </p>
        </div>
      </button>

      {/* iOS 27 Inset Grouped Modules Grid */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
          လုပ်ငန်းခွင် ကဏ္ဍများ
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => onNavigate(mod.id)}
                className="ios-grouped-card p-4 sm:p-5 text-left flex items-center gap-4 hover:border-[#0055D4]/50 dark:hover:border-blue-500/50 transition ios-press group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#0055D4]/10 dark:bg-blue-500/15 text-[#0055D4] dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-[#0055D4] group-hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {mod.subtitle}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0055D4] shrink-0 transition-colors" />
              </button>
            );
          })}
        </div>
      </div>

      {/* iOS Inset Grouped Recent Records Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400">
            နောက်ဆုံး မှတ်တမ်းများ
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('records')}
            className="min-h-[40px] px-2 text-xs font-semibold text-[#0055D4] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>အားလုံး ကြည့်မည်</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="ios-grouped-card overflow-hidden divide-y divide-slate-200/70 dark:divide-white/10">
          {documents.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-8 px-4 text-center">
              လက်ရှိ သိမ်းဆည်းထားသော မှတ်တမ်း မရှိသေးပါ။ ရုံးစာရေးသားခြင်း သို့မဟုတ် မှတ်တမ်းများ ကဏ္ဍတွင် ထည့်သွင်းနိုင်ပါသည်။
            </p>
          ) : (
            documents.slice(0, 4).map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => onNavigate('records')}
                className="w-full px-4 sm:px-5 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {doc.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums truncate">
                    {doc.refNumber} · {doc.date} · {doc.category}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
