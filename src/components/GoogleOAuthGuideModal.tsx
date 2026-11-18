import React from 'react';
import { ShieldCheck, Key, ExternalLink, X } from 'lucide-react';

interface GoogleOAuthGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleOAuthGuideModal: React.FC<GoogleOAuthGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://your-app-domain';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-[28px] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto relative text-slate-900 dark:text-slate-100 text-xs">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-full"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-[#0055D4]/10 dark:bg-blue-500/20 text-[#0055D4] dark:text-blue-400 flex items-center justify-center shrink-0">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Firebase &amp; Google OAuth Setup လမ်းညွှန်</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Firebase Project အသစ်၊ Firestore နှင့် Google Sign-In ပြင်ဆင်နည်း</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-3 leading-relaxed">
          <p className="text-[#0055D4] dark:text-blue-400 font-bold">
            Golden Gate MM အက်ပ်ကို Firebase Project အသစ်ဖြင့် စတင်ချိတ်ဆက်ရန်-
          </p>

          <ol className="space-y-3">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#0055D4] text-white font-bold flex items-center justify-center text-[11px] shrink-0">၁</span>
              <div>
                <strong className="block text-slate-900 dark:text-white">Firebase Google Auth &amp; Firestore ဖွင့်ပါ:</strong>
                <p className="text-slate-600 dark:text-slate-300">
                  Firebase Console Project အသစ်တွင် <strong>Firestore Database</strong> ဖန်တီး၍ <strong>Authentication → Sign-in method → Google</strong> ကို Enable လုပ်ပါ။ ထို့နောက် <strong>Authorized domains</strong> တွင် Hosting Domain အသစ် (<code className="font-mono">&lt;new-project&gt;.web.app</code>) နှင့် လက်ရှိ URL ကို ထည့်ပါ။
                </p>
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#0055D4] text-white font-bold flex items-center justify-center text-[11px] shrink-0">၂</span>
              <div>
                <strong className="block text-slate-900 dark:text-white">Firebase Config Env Vars ထည့်သွင်းပါ:</strong>
                <p className="text-slate-600 dark:text-slate-300">
                  Web App SDK မှ ရရှိသော <code className="font-mono">VITE_FIREBASE_API_KEY</code>, <code className="font-mono">VITE_FIREBASE_AUTH_DOMAIN</code>, <code className="font-mono">VITE_FIREBASE_PROJECT_ID</code>, <code className="font-mono">VITE_FIREBASE_APP_ID</code> တို့ကို Environment / GitHub Secrets တွင် ထည့်ပါ။
                </p>
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#0055D4] text-white font-bold flex items-center justify-center text-[11px] shrink-0">၃</span>
              <div>
                <strong className="block text-slate-900 dark:text-white">Authorized JavaScript origins ဖြည့်စွက်ပါ:</strong>
                <p className="text-slate-600 dark:text-slate-300">
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0055D4] dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                  >
                    <span>console.cloud.google.com/apis/credentials</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {' '}တွင် <code className="font-mono break-all">{currentOrigin}</code> နှင့် Hosting Domain (<code className="font-mono">https://&lt;new-project&gt;.web.app</code>) ကို ထည့်သွင်းပါ။
                </p>
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#0055D4] text-white font-bold flex items-center justify-center text-[11px] shrink-0">၄</span>
              <div>
                <strong className="block text-slate-900 dark:text-white">Client ID ကိုသာ ထည့်သွင်းပါ (Secret မထည့်ရ):</strong>
                <p className="text-slate-600 dark:text-slate-300">
                  <code className="font-mono">...apps.googleusercontent.com</code> Client ID ကို <code className="font-mono">VITE_GOOGLE_CLIENT_ID</code> တွင် ထည့်ပါ။ <code className="font-mono text-rose-600 dark:text-rose-400">GOCSPX-...</code> Client Secret ကို Frontend Code ထဲ ဘယ်တော့မှ မထည့်ရပါ။
                </p>
              </div>
            </li>
          </ol>
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-blue-950 dark:text-blue-200 text-[11px] flex items-center gap-2 font-medium">
          <ShieldCheck className="w-4 h-4 text-[#0055D4] dark:text-blue-400 shrink-0" />
          <span>Google Login အောင်မြင်ပြီးသော်လည်း Verified + Admin Pre-Approved အကောင့်များသာ စနစ်သုံးခွင့် ရရှိမည် ဖြစ်ပါသည်။</span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[44px] py-2.5 rounded-2xl bg-[#0055D4] hover:bg-[#0A46B8] text-white font-bold text-xs transition ios-press"
        >
          နားလည်ပါပြီ
        </button>
      </div>
    </div>
  );
};
