import React from 'react';
import { FileText, Scale, FolderArchive, ShieldCheck, ArrowRight, ChevronRight, QrCode } from 'lucide-react';
import { User, DocumentRecord } from '../types';
import { TabType } from './BottomNav';

interface DashboardProps {
  user: User | null;
  documents: DocumentRecord[];
  onNavigate: (tab: TabType) => void;
  onOpenAuth: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  documents,
  onNavigate
}) => {
  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto w-full max-w-full overflow-x-hidden">
      {/* Main Core Features Menu Tiles */}
      <div className="space-y-3">
        <h2 className="text-xs font-black text-slate-700 uppercase tracking-widest px-1">
          လုပ်ငန်းခွင် ပင်မ ကဏ္ဍများ (Core Features)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Tile 1: Applying Zone */}
          <div
            onClick={() => onNavigate('apply')}
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-950 to-slate-900 text-white border border-blue-900 transition cursor-pointer space-y-2 group shadow-sm hover:shadow-md col-span-1 sm:col-span-2"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold border border-amber-400/30 group-hover:bg-amber-400 group-hover:text-blue-950 transition">
                <QrCode className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black bg-amber-400 text-blue-950 px-2.5 py-1 rounded-full uppercase tracking-wider">
                FEATURE MODULE
              </span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition flex items-center gap-1.5 pt-1">
                <span>Applying Zone (လျှောက်လွှာတင်ခြင်း ဇုန်)</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed font-medium">
                နိုင်ငံသားစိစစ်ရေးကတ်၊ အိမ်ထောင်စုဇယား၊ သေဆုံးသူပယ်ဖျက်နှင့် မွေးဖွားသူထည့်သွင်း လျှောက်လွှာများအတွက် သီးသန့်လင့်ခ် ထုတ်ပေးခြင်းနှင့် အရာရှိထံ ဒေတာ တိုက်ရိုက် စိစစ်စနစ်
              </p>
            </div>
          </div>

          {/* Tile 2: Official Letter Writer */}
          <div
            onClick={() => onNavigate('letter')}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-900 transition cursor-pointer space-y-2 group shadow-2xs hover:shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold border border-blue-200 group-hover:bg-blue-900 group-hover:text-white transition">
                <FileText className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-900 transition" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-blue-900 transition">
                ရုံးစာရေးသားခြင်း နှင့် Auto Format
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                မြို့နယ် Section အရ ရုံးစာ (အပေါ်စာ)၊ ကြေးနန်းစာ၊ ရုံးတွင်းအမိန့်စာ၊ စိစစ်ပြန်ကြားစာ၊ ထောက်ခံစာ Preset များဖြင့် အလိုအလျောက် ပုံစံညှိခြင်း
              </p>
            </div>
          </div>

          {/* Tile 3: Legal Laws Search & PDF Reader */}
          <div
            onClick={() => onNavigate('legal')}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-900 transition cursor-pointer space-y-2 group shadow-2xs hover:shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold border border-blue-200 group-hover:bg-blue-900 group-hover:text-white transition">
                <Scale className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-900 transition" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-blue-900 transition">
                ဥပဒေ စာအုပ်များ နှင့် PDF ရှာဖွေစနစ်
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                PDF ဥပဒေစာအုပ်များ တင်သွင်းခြင်း၊ ဥပဒေစာအုပ်များအလိုက် ပုဒ်မနှင့် စကားလုံးများ တိုက်ရိုက် ရှာဖွေထုတ်ယူခြင်း
              </p>
            </div>
          </div>

          {/* Tile 4: Document Records */}
          <div
            onClick={() => onNavigate('records')}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-900 transition cursor-pointer space-y-2 group shadow-2xs hover:shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold border border-blue-200 group-hover:bg-blue-900 group-hover:text-white transition">
                <FolderArchive className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-900 transition" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-blue-900 transition">
                မှတ်တမ်းများ စီမံခန့်ခွဲမှု
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                ညွှန်ကြားစာများ၊ ဝင်စာ/ထွက်စာများ၊ စစ်ဆေးရေး မှတ်တမ်းများနှင့် ဗီဇာ စိစစ်ချက်များ စီမံခြင်း
              </p>
            </div>
          </div>

          {/* Tile 5: Access Control & Authorization */}
          <div
            onClick={() => onNavigate('auth')}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-900 transition cursor-pointer space-y-2 group shadow-2xs hover:shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold border border-blue-200 group-hover:bg-blue-900 group-hover:text-white transition">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-900 transition" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-blue-900 transition">
                အကောင့် နှင့် လုပ်ပိုင်ခွင့် (Auth)
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                Google Login စိစစ်ခြင်း၊ Pre-approved အရာရှိ စာရင်း စီမံခြင်း နှင့် Access Control
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* Recent Document Records Summary List */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-xs font-extrabold text-slate-900">
            နောက်ဆုံး ပြုပြင်ထားသော မှတ်တမ်းများ
          </h3>
          <button
            onClick={() => onNavigate('records')}
            className="text-[11px] font-bold text-blue-900 hover:underline flex items-center gap-1"
          >
            <span>အားလုံး ကြည့်မည်</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {documents.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center font-medium">
              လက်ရှိ သိမ်းဆည်းထားသော မှတ်တမ်း မရှိသေးပါ။ ရုံးစာရေးသားခြင်း သို့မဟုတ် မှတ်တမ်းများ ကဏ္ဍတွင် ထည့်သွင်းနိုင်ပါသည်။
            </p>
          ) : (
            documents.slice(0, 3).map((doc) => (
              <div
                key={doc.id}
                onClick={() => onNavigate('records')}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-900 transition cursor-pointer flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5 truncate pr-2">
                  <span className="font-extrabold text-slate-900 truncate block">{doc.title}</span>
                  <span className="text-[10px] text-slate-600 font-mono block">{doc.refNumber} · {doc.date}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-950 font-extrabold text-[10px] shrink-0 border border-blue-200">
                  {doc.category}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
