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
        onClick={install}
        className={`flex items-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-3 py-1.5 text-xs shadow-md transition active:scale-95 whitespace-nowrap shrink-0 ${className}`}
      >
        <Download className="w-3.5 h-3.5" />
        <span>PWA ထည့်သွင်းရန်</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-amber-300 font-medium px-2.5 py-1.5 text-xs transition whitespace-nowrap shrink-0 ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>iOS PWA</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-100 relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">iPhone/iPad တွင် ထည့်သွင်းရန်</h3>
                  <p className="text-xs text-slate-400">Golden Gate MM PWA App</p>
                </div>
              </div>

              <div className="space-y-3 my-4 text-xs text-slate-300">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400 font-bold shrink-0">၁</div>
                  <p className="mt-0.5">Safari ဘရောက်ဇာအောက်ခြေရှိ <Share2 className="w-3.5 h-3.5 inline text-amber-400 mx-1" /> <strong>Share (မျှဝေရန်)</strong> ခလုတ်ကို နှိပ်ပါ။</p>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400 font-bold shrink-0">၂</div>
                  <p className="mt-0.5">အောက်သို့ဆွဲ၍ <strong>"Add to Home Screen" (ပင်မစာမျက်နှာသို့ ထည့်ရန်)</strong> ကို ရွေးချယ်ပါ။</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition"
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
