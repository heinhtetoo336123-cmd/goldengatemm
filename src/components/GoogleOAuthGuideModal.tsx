import React from 'react';
import { ShieldCheck, Key, ExternalLink, CheckCircle2, X } from 'lucide-react';

interface GoogleOAuthGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleOAuthGuideModal: React.FC<GoogleOAuthGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto relative text-slate-900 text-xs">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 text-blue-900 flex items-center justify-center">
            <Key className="w-5 h-5 text-blue-900" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Google OAuth Login Setup လမ်းညွှန်</h3>
            <p className="text-xs text-slate-500 font-bold">Google Cloud Console တွင် Client ID ပြင်ဆင်နည်း</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 leading-relaxed">
          <p className="text-blue-950 font-black">
            Golden Gate MM အက်ပ်တွင် Google Sign-In ထည့်သွင်းရန် အောက်ပါအဆင့်များအတိုင်း ဆောင်ရွက်ပါ-
          </p>

          <ol className="space-y-3 pt-2">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-900 text-white font-black flex items-center justify-center text-[11px] shrink-0">၁</span>
              <div>
                <strong className="text-slate-900 block font-black">Google Cloud Console သို့ သွားပါ:</strong>
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-900 font-extrabold hover:underline inline-flex items-center gap-1 font-mono text-[11px] mt-0.5"
                >
                  <span>console.cloud.google.com/apis/credentials</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-900 text-white font-black flex items-center justify-center text-[11px] shrink-0">၂</span>
              <div>
                <strong className="text-slate-900 block font-black">OAuth 2.0 Client ID ဖန်တီးပါ:</strong>
                <p className="text-slate-700 font-bold">Credentials → Create Credentials → OAuth Client ID သို့ သွား၍ Application type အား <strong>"Web application"</strong> ဟု ရွေးချယ်ပါ။</p>
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-900 text-white font-black flex items-center justify-center text-[11px] shrink-0">၃</span>
              <div>
                <strong className="text-slate-900 block font-black">Authorized JavaScript origins ဖြည့်စွက်ပါ:</strong>
                <p className="text-slate-700 font-bold">အက်ပ်၏ Hosting Domain (e.g. <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-950 font-mono">https://ais-dev-fyvwk4ssdr2ubdlnd5wyf4-571336294203.us-east1.run.app</code>) ကို ထည့်သွင်းပါ။</p>
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-900 text-white font-black flex items-center justify-center text-[11px] shrink-0">၄</span>
              <div>
                <strong className="text-slate-900 block font-black">Environment Variable တွင် ရေးထည့်ပါ:</strong>
                <p className="text-slate-700 font-bold">ရရှိလာသော Client ID အား <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-950 font-mono">VITE_GOOGLE_CLIENT_ID</code> အဖြစ် ထည့်သွင်းအသုံးပြုပါ။</p>
              </div>
            </li>
          </ol>
        </div>

        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 text-[11px] flex items-center gap-2 font-bold">
          <ShieldCheck className="w-4 h-4 text-blue-900 shrink-0" />
          <span>Access Control: Google Login ပြုလုပ်ပြီးပါကလည်း Admin မူလ ခွင့်ပြုထားသော (Pre-approved) အကောင့်များသာ အက်ပ်၏ ပင်မ လုပ်ဆောင်ချက်များကို သုံးစွဲနိုင်မည် ဖြစ်သည်။</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-black text-xs transition shadow-2xs"
        >
          နားလည်ပါပြီ
        </button>
      </div>
    </div>
  );
};
