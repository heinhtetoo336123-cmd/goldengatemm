import React from 'react';
import { Key, ExternalLink, X } from 'lucide-react';

interface GoogleOAuthGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleOAuthGuideModal: React.FC<GoogleOAuthGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-[28px] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto relative text-slate-900 dark:text-slate-100 text-xs">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-full cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 pr-8">
          <Key className="w-5 h-5 text-[#0055D4] dark:text-blue-400 shrink-0" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Firebase &amp; OAuth Setup</h3>
        </div>

        <ol className="space-y-2.5 text-slate-700 dark:text-slate-300 leading-relaxed">
          <li>
            <strong>1. Firebase:</strong> Firestore + Auth (Google) ဖွင့်၍ Authorized domains တွင် <code className="font-mono break-all">{currentOrigin}</code> ထည့်ပါ။
          </li>
          <li>
            <strong>2. Env Vars:</strong> <code className="font-mono">VITE_FIREBASE_API_KEY</code>, <code className="font-mono">VITE_FIREBASE_AUTH_DOMAIN</code>, <code className="font-mono">VITE_FIREBASE_PROJECT_ID</code>, <code className="font-mono">VITE_FIREBASE_APP_ID</code> ထည့်ပါ။
          </li>
          <li>
            <strong>3. OAuth Client:</strong>{' '}
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noreferrer"
              className="text-[#0055D4] dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>Cloud Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>{' '}
            တွင် <code className="font-mono">VITE_GOOGLE_CLIENT_ID</code> ယူပါ (Client Secret မထည့်ရ)။
          </li>
        </ol>

        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[44px] py-2.5 rounded-2xl bg-[#0055D4] hover:bg-[#0A46B8] text-white font-bold text-xs transition ios-press cursor-pointer"
        >
          ပိတ်မည်
        </button>
      </div>
    </div>
  );
};
