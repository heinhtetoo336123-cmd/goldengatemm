import React from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
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
      <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 flex items-center gap-2.5 rounded-xl bg-blue-900 border border-blue-700 text-white px-4 py-3 text-xs font-bold shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-4">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="flex-1">အင်တာနက် ပြန်လည်ချိတ်ဆက်ပြီး offline မှတ်တမ်း ({syncedCount}) ခု အလိုအလျောက် Sync လုပ်ပြီးပါပြီ။</span>
      </div>
    );
  }

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 flex items-center gap-3 rounded-xl bg-slate-900 border border-slate-700 text-white px-4 py-3 text-xs font-bold shadow-2xl backdrop-blur-md animate-pulse">
      <WifiOff className="w-4 h-4 text-blue-300 shrink-0" />
      <div className="flex-1">
        <p className="font-extrabold text-white">Offline Mode (လိုင်းမရှိပါ)</p>
        <p className="text-[11px] text-slate-300 mt-0.5 font-medium">အချက်အလက်များကို စက်ထဲတွင် သိမ်းဆည်းထားပြီး လိုင်းရပါက Auto Sync လုပ်ပါမည်။</p>
      </div>
    </div>
  );
};
