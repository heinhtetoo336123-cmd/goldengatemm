import React from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { db } from '../services/db';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [syncedCount, setSyncedCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (isOnline) {
      const count = db.syncPendingItems();
      if (count > 0) {
        setSyncedCount(count);
        const timer = setTimeout(() => setSyncedCount(null), 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [isOnline]);

  if (syncedCount !== null) {
    return (
      <div className="fixed bottom-24 md:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-50 flex items-center gap-2.5 rounded-2xl ios-liquid-glass border border-emerald-500/30 text-slate-900 dark:text-white px-4 py-3 text-xs font-semibold no-print">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="flex-1">အင်တာနက် ပြန်လည်ချိတ်ဆက်ပြီး offline မှတ်တမ်း ({syncedCount}) ခု Sync လုပ်ပြီးပါပြီ။</span>
      </div>
    );
  }

  if (isOnline) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-50 flex items-center gap-3 rounded-2xl ios-liquid-glass border border-amber-500/30 text-slate-900 dark:text-white px-4 py-3 text-xs no-print">
      <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
      <div className="flex-1">
        <p className="font-bold">Offline Mode (လိုင်းမရှိပါ)</p>
        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
          အချက်အလက်များကို စက်ထဲတွင် သိမ်းဆည်းထားပြီး လိုင်းရပါက Sync လုပ်ပါမည်။
        </p>
      </div>
    </div>
  );
};
