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
      <div className="fixed bottom-24 md:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-64 z-50 flex items-center gap-2 rounded-2xl ios-liquid-glass border border-emerald-500/30 text-slate-900 dark:text-white px-4 py-2.5 text-xs font-semibold no-print">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="truncate">Sync ပြီး ({syncedCount})</span>
      </div>
    );
  }

  if (isOnline) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-56 z-50 flex items-center gap-2 rounded-2xl ios-liquid-glass border border-amber-500/30 text-slate-900 dark:text-white px-4 py-2.5 text-xs font-bold no-print">
      <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
      <span>Offline Mode</span>
    </div>
  );
};
