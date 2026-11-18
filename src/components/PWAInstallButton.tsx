import React, { useState } from 'react';
import { Download, Share2, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`min-h-[36px] flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 text-xs transition ios-press whitespace-nowrap shrink-0 ${className}`}
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span>PWA ထည့်သွင်း</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`min-h-[36px] flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-amber-300 font-semibold px-2.5 py-1.5 text-xs transition whitespace-nowrap shrink-0 ios-press ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 shrink-0" />
          <span>iOS PWA</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 shadow-2xl text-slate-900 dark:text-zinc-100 relative">
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition"
                aria-label="ပိတ်မည်"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 mb-4 pr-8">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">iPhone/iPad တွင် ထည့်သွင်းရန်</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Golden Gate MM PWA</p>
                </div>
              </div>

              <div className="space-y-2.5 my-4 text-xs text-slate-700 dark:text-zinc-300">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/70 dark:border-zinc-800">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 font-extrabold flex items-center justify-center shrink-0">၁</span>
                  <p className="leading-relaxed">
                    Safari အောက်ခြေရှိ <Share2 className="w-3.5 h-3.5 inline text-blue-600 dark:text-blue-400 mx-0.5" /> <strong>Share</strong> ခလုတ်ကို နှိပ်ပါ။
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/70 dark:border-zinc-800">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 font-extrabold flex items-center justify-center shrink-0">၂</span>
                  <p className="leading-relaxed">
                    <strong>"Add to Home Screen"</strong> ကို ရွေးချယ်ပါ။
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full min-h-[44px] py-2.5 rounded-2xl bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs transition ios-press"
              >
                နားလည်ပါပြီ
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
