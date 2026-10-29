import React, { useState, useEffect } from 'react';
import { 
  Send, Plus, Copy, Check, QrCode, FileText, Filter, Search, 
  CheckCircle2, Clock, XCircle, AlertTriangle, Eye, ArrowUpRight, 
  Trash2, ShieldCheck, Download, Printer, Share2, Sparkles, Building2, User as UserIcon
} from 'lucide-react';
import { ApplicationLink, ApplicationSubmission, ApplicationSubmissionStatus, ApplicationType, User } from '../types';
import { db } from '../services/db';

interface ApplyingZoneProps {
  currentUser: User | null;
}

export const ApplyingZone: React.FC<ApplyingZoneProps> = ({ currentUser }) => {
  const [activeSubTab, setActiveSubTab] = useState<'GENERATE' | 'ACTIVE_LINKS' | 'SUBMISSIONS'>('GENERATE');
  
  // Link Generator State
  const [selectedAppType, setSelectedAppType] = useState<ApplicationType>('NRC_APP');
  const [townshipInput, setTownshipInput] = useState<string>('မင်္ဂလာဒုံမြို့နယ်');
  const [customNote, setCustomNote] = useState<string>('');
  const [generatedLink, setGeneratedLink] = useState<ApplicationLink | null>(null);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);

  // Active Links & Submissions Lists
  const [links, setLinks] = useState<ApplicationLink[]>([]);
  const [submissions, setSubmissions] = useState<ApplicationSubmission[]>([]);

  // Submission Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active Viewer Modal State
  const [activeSubmission, setActiveSubmission] = useState<ApplicationSubmission | null>(null);
  const [officerNoteInput, setOfficerNoteInput] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const officerId = currentUser?.badgeNumber || currentUser?.id || 'usr-101';

  const reloadData = () => {
    const l = db.getApplicationLinks(officerId);
    setLinks(l);
    const s = db.getApplicationSubmissions({ officerId });
    setSubmissions(s);
  };

  useEffect(() => {
    reloadData();
  }, [currentUser]);

  // Handle Link Generation
  const handleGenerateLink = (e: React.FormEvent) => {
    e.preventDefault();
    const token = `APP-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const newLink = db.saveApplicationLink({
      token,
      officerId,
      officerName: currentUser?.name || 'Hein Htet Oo',
      officerBadge: currentUser?.badgeNumber || 'IMM-2026',
      officerStation: currentUser?.station || 'မင်္ဂလာဒုံမြို့နယ် ရုံး',
      applicationType: selectedAppType,
      townshipName: townshipInput,
      customNote: customNote.trim()
    });

    setGeneratedLink(newLink);
    reloadData();
  };

  const getFullShareUrl = (token: string) => {
    const origin = window.location.origin;
    return `${origin}/?applyToken=${token}`;
  };

  const handleCopyLink = (token: string) => {
    const url = getFullShareUrl(token);
    navigator.clipboard.writeText(url);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleShareViber = (link: ApplicationLink) => {
    const url = getFullShareUrl(link.token);
    const text = `📌 ${getTypeLabelMM(link.applicationType)} လျှောက်ထားရန် သီးသန့်လင့်ခ်\nတာဝန်ခံ: ${link.officerName} (${link.officerStation})\n\nကျေးဇူးပြု၍ အောက်ပါ လင့်ခ်မှတစ်ဆင့် အချက်အလက်နှင့် စာရွက်စာတမ်းများ တင်သွင်းပါ-\n${url}`;
    window.location.href = `viber://forward?text=${encodeURIComponent(text)}`;
  };

  const handleUpdateStatus = (id: string, newStatus: ApplicationSubmissionStatus) => {
    db.updateSubmissionStatus(id, newStatus, officerNoteInput.trim());
    reloadData();
    if (activeSubmission && activeSubmission.id === id) {
      setActiveSubmission(prev => prev ? { ...prev, status: newStatus, officerNotes: officerNoteInput.trim() } : null);
    }
  };

  const getTypeLabelMM = (type: ApplicationType) => {
    switch (type) {
      case 'NRC_APP': return 'နိုင်ငံသားစိစစ်ရေးကတ်ပြား လျှောက်ထားခြင်း';
      case 'HOUSEHOLD_APP': return 'အိမ်ထောင်စုလူဦးရေစာရင်း လျှောက်ထားခြင်း (ပုံစံ ၆၆/၆)';
      case 'DECEASED_REMOVAL': return 'အိမ်ထောင်စုစာရင်းမှ သေဆုံးသူ ပယ်ဖျက်ခြင်း';
      case 'BIRTH_ADDITION': return 'အိမ်ထောင်စုစာရင်းသို့ မွေးဖွားသူ ထည့်သွင်းခြင်း';
      default: return 'လျှောက်လွှာ';
    }
  };

  const filteredSubmissions = db.getApplicationSubmissions({
    officerId,
    status: statusFilter,
    search: searchQuery
  }).filter(s => typeFilter === 'ALL' || s.applicationType === typeFilter);

  const pendingCount = submissions.filter(s => s.status === 'PENDING').length;

  return (
    <div className="space-y-4 pb-20 max-w-4xl mx-auto w-full text-slate-900 font-sans">
      
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-black">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>အရာရှိ သီးသန့် လျှောက်လွှာ တင်ဒေတာ စိစစ်ရေးဇုန်</span>
          </div>
          <h2 className="text-base sm:text-lg font-black tracking-wide text-white">
            Applying Zone (လျှောက်လွှာတင်ခြင်း ဇုန်)
          </h2>
          <p className="text-xs text-slate-300 font-medium">
            ပြည်သူများထံမှ လျှောက်လွှာများ တိုက်ရိုက် လက်ခံရန် သီးသန့်လင့်ခ် ထုတ်ပေးခြင်းနှင့် ဒေတာစိစစ် စီမံမှုစနစ်
          </p>
        </div>

        {/* Quick Pending Submissions Badge */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl text-center shrink-0 min-w-[110px]">
          <span className="text-[10px] text-slate-300 font-bold block">စိစစ်ရန် လျှောက်လွှာ</span>
          <span className="text-xl font-black text-amber-400">{pendingCount} စောင်</span>
        </div>
      </div>

      {/* Primary Sub-Tab Switcher */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300/80 text-xs font-black">
        <button
          onClick={() => setActiveSubTab('GENERATE')}
          className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'GENERATE'
              ? 'bg-blue-950 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>လင့်ခ်သစ် ထုတ်ပေးမည်</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ACTIVE_LINKS')}
          className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 relative ${
            activeSubTab === 'ACTIVE_LINKS'
              ? 'bg-blue-950 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>ထုတ်ပေးထားသော လင့်ခ်များ</span>
          <span className="bg-slate-300 text-slate-900 text-[10px] px-1.5 py-0.2 rounded-full font-black">
            {links.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('SUBMISSIONS')}
          className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 relative ${
            activeSubTab === 'SUBMISSIONS'
              ? 'bg-blue-950 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>လက်ခံရရှိ လျှောက်လွှာများ</span>
          {pendingCount > 0 && (
            <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* SUB-TAB 1: Unique Link Generator Form */}
      {activeSubTab === 'GENERATE' && (
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-blue-900" />
              <span>ပြည်သူများသို့ ပေးပို့မည့် သီးသန့် လျှောက်လွှာ လင့်ခ် (Unique Link) ထုတ်ပေးခြင်း</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              ထုတ်ပေးလိုက်သော လင့်ခ်မှ တင်သွင်းလာသည့် လျှောက်လွှာများကို သင့်ထံသို့သာ တိုက်ရိုက် လမ်းကြောင်းပေး သိမ်းဆည်းပေးမည် ဖြစ်ပါသည်။
            </p>
          </div>

          <form onSubmit={handleGenerateLink} className="space-y-3.5 text-xs font-medium">
            <div>
              <label className="block text-[11px] font-bold text-slate-800 mb-1">
                ၁။ လျှောက်လွှာ အမျိုးအစား ရွေးချယ်ပါ *
              </label>
              <select
                value={selectedAppType}
                onChange={(e) => setSelectedAppType(e.target.value as ApplicationType)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-bold focus:border-blue-950 focus:bg-white focus:outline-none"
              >
                <option value="NRC_APP">၁။ နိုင်ငံသားစိစစ်ရေးကတ်ပြား လျှောက်ထားခြင်း (NRC Application)</option>
                <option value="HOUSEHOLD_APP">၂။ အိမ်ထောင်စုလူဦးရေစာရင်း လျှောက်ထားခြင်း (Household List Application)</option>
                <option value="DECEASED_REMOVAL">၃။ အိမ်ထောင်စုစာရင်းမှ သေဆုံးသူ ပယ်ဖျက်ခြင်း (Deceased Removal)</option>
                <option value="BIRTH_ADDITION">၄။ အိမ်ထောင်စုစာရင်းသို့ မွေးဖွားသူ ထည့်သွင်းခြင်း (Birth Addition)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  ၂။ တာဝန်ကျရာ မြို့နယ်/ရုံးစခန်း *
                </label>
                <input
                  type="text"
                  required
                  value={townshipInput}
                  onChange={(e) => setTownshipInput(e.target.value)}
                  placeholder="e.g. မင်္ဂလာဒုံမြို့နယ် ဦးစီးမှူးရုံး"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-blue-950 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  ၃။ လျှောက်ထားသူထံ အကြောင်းကြားချက် မှတ်စု (Optional)
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. မင်္ဂလာဒုံရုံး ရုံးချိန်အတွင်း အပြည့်အစုံ ဖြည့်သွင်းပါ"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-blue-950 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-blue-950 hover:bg-blue-900 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>သီးသန့် လင့်ခ် နှင့် QR Code ထုတ်ယူမည်</span>
            </button>
          </form>

          {/* Generated Link Display Box */}
          {generatedLink && (
            <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-slate-900 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>သီးသန့် လျှောက်လွှာလင့်ခ် ထုတ်ပေးပြီးပါပြီ</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-blue-950 bg-white px-2 py-0.5 rounded border border-slate-200">
                  TOKEN: {generatedLink.token}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">မျှဝေရန် လင့်ခ် (Full App URL):</span>
                <p className="text-xs font-mono font-bold text-blue-950 break-all select-all">
                  {getFullShareUrl(generatedLink.token)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleCopyLink(generatedLink.token)}
                  className="px-3.5 py-2 rounded-xl bg-blue-950 text-white text-xs font-bold hover:bg-blue-900 flex items-center gap-1.5 shadow-xs transition"
                >
                  {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedToken ? 'လင့်ခ် ကူးယူပြီး' : 'လင့်ခ် ကူးယူမည်'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShareViber(generatedLink)}
                  className="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Viber ဖြင့် ပို့မည်</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: Active Links List */}
      {activeSubTab === 'ACTIVE_LINKS' && (
        <div className="space-y-3 animate-in fade-in">
          {links.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
              <QrCode className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">ထုတ်ပေးထားသော သီးသန့်လင့်ခ် မရှိသေးပါ</p>
            </div>
          ) : (
            links.map((link) => (
              <div key={link.id} className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-900 transition shadow-xs space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-100 text-blue-950 border border-blue-200">
                      {getTypeLabelMM(link.applicationType)}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 pt-1">
                      {link.townshipName}
                    </h4>
                  </div>

                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                    link.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {link.status === 'ACTIVE' ? 'အသုံးပြုနိုင်ဆဲ' : 'ပယ်ဖျက်ပြီး'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono font-medium pt-1 border-t border-slate-100">
                  <span>Token: {link.token}</span>
                  <span className="font-extrabold text-blue-950 font-sans">
                    ဝင်ရောက်တင်သွင်းမှု: {link.submissionCount || 0} ခု
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(link.token)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center gap-1 border border-slate-200"
                  >
                    <Copy className="w-3.5 h-3.5 text-blue-900" />
                    <span>လင့်ခ် ကူးယူမည်</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShareViber(link)}
                    className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-[11px] font-bold flex items-center gap-1 border border-purple-200"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Viber</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SUB-TAB 3: Received Submissions (Routed Direct to Officer) */}
      {activeSubTab === 'SUBMISSIONS' && (
        <div className="space-y-3.5 animate-in fade-in">
          
          {/* Filter & Search Toolbar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="လျှောက်ထားသူ အမည်၊ ဖုန်း၊ NRC သို့မဟုတ် ကုတ်အမှတ်ဖြင့် ရှာဖွေပါ..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 font-medium focus:border-blue-950 focus:bg-white focus:outline-none transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 mb-1">
                  အဆင့်အတန်း စစ်ထုတ်ရန်:
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:border-blue-950 focus:outline-none"
                >
                  <option value="ALL">အဆင့်အတန်း အားလုံး</option>
                  <option value="PENDING">စိစစ်ဆဲ (Pending)</option>
                  <option value="APPROVED">အတည်ပြုပြီး (Approved)</option>
                  <option value="REVISED">ပြင်ဆင်ရန် (Revision Needed)</option>
                  <option value="REJECTED">ငြင်းပယ်ထား (Rejected)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 mb-1">
                  အမျိုးအစား စစ်ထုတ်ရန်:
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:border-blue-950 focus:outline-none"
                >
                  <option value="ALL">အမျိုးအစား အားလုံး</option>
                  <option value="NRC_APP">နိုင်ငံသားစိစစ်ရေးကတ်</option>
                  <option value="HOUSEHOLD_APP">အိမ်ထောင်စုဇယား</option>
                  <option value="DECEASED_REMOVAL">သေဆုံးသူပယ်ဖျက်</option>
                  <option value="BIRTH_ADDITION">မွေးဖွားသူထည့်သွင်း</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submissions List Grid */}
          <div className="space-y-2.5">
            {filteredSubmissions.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">လက်ခံရရှိထားသော လျှောက်လွှာ မရှိသေးပါ</p>
              </div>
            ) : (
              filteredSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => {
                    setActiveSubmission(sub);
                    setOfficerNoteInput(sub.officerNotes || '');
                  }}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-900 transition cursor-pointer shadow-2xs space-y-2.5 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-[10px] bg-blue-100 text-blue-950 px-2 py-0.5 rounded border border-blue-200">
                          {sub.submissionRef}
                        </span>
                        <span className="text-[10px] font-extrabold text-slate-600">
                          {getTypeLabelMM(sub.applicationType)}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-900 transition mt-1">
                        {sub.applicantName}
                      </h4>
                    </div>

                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border shrink-0 ${
                      sub.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : sub.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : sub.status === 'REVISION_NEEDED'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-blue-50 text-blue-950 border-blue-200'
                    }`}>
                      {sub.status === 'APPROVED' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                      <span>{sub.status === 'APPROVED' ? 'အတည်ပြုပြီး' : sub.status === 'REJECTED' ? 'ငြင်းပယ်ထား' : sub.status === 'REVISION_NEEDED' ? 'ပြင်ဆင်ရန်' : 'စိစစ်ဆဲ'}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100 font-medium">
                    <span>ဖုန်း: {sub.applicantPhone}</span>
                    <span>ပူးတွဲဓာတ်ပုံ: {sub.attachments?.length || 0} ပုံ</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBMISSION VIEWER & ACTION MODAL */}
      {activeSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto relative text-slate-900">
            <button
              onClick={() => setActiveSubmission(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-800 rounded-full bg-slate-100"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-950 font-mono text-[10px] font-black border border-blue-200">
                {activeSubmission.submissionRef}
              </span>
              <h3 className="text-base font-black text-slate-900">
                {activeSubmission.applicantName} - {getTypeLabelMM(activeSubmission.applicationType)}
              </h3>
              <p className="text-xs text-slate-500 font-bold">
                တင်သွင်းရက်စွဲ: {new Date(activeSubmission.createdAt).toLocaleString('my-MM')}
              </p>
            </div>

            {/* Applicant Details Table */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2 font-medium">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 font-bold block">ဖုန်းနံပါတ်:</span>
                  <span className="font-extrabold text-slate-900">{activeSubmission.applicantPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">အဖအမည်:</span>
                  <span className="font-extrabold text-slate-900">{activeSubmission.fatherName}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 font-bold block">အမိအမည်:</span>
                  <span className="font-extrabold text-slate-900">{activeSubmission.motherName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">မွေးသက္ကရာဇ်:</span>
                  <span className="font-extrabold text-slate-900">{activeSubmission.dob || '-'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold block">နေရပ်လိပ်စာ:</span>
                <span className="font-extrabold text-slate-900">{activeSubmission.applicantAddress}</span>
              </div>

              {/* Specific fields */}
              {activeSubmission.householdListNo && (
                <div>
                  <span className="text-slate-400 font-bold block">အိမ်ထောင်စုဇယား အမှတ်:</span>
                  <span className="font-extrabold text-blue-900">{activeSubmission.householdListNo}</span>
                </div>
              )}

              {activeSubmission.deceasedPersonName && (
                <div>
                  <span className="text-slate-400 font-bold block">သေဆုံးသူ အမည်:</span>
                  <span className="font-extrabold text-rose-900">{activeSubmission.deceasedPersonName} ({activeSubmission.dateOfDeath})</span>
                </div>
              )}

              {activeSubmission.childName && (
                <div>
                  <span className="text-slate-400 font-bold block">မွေးဖွားသူ ကလေး အမည်:</span>
                  <span className="font-extrabold text-emerald-900">{activeSubmission.childName} ({activeSubmission.childDob})</span>
                </div>
              )}
            </div>

            {/* Submitted Photo Attachments */}
            {activeSubmission.attachments && activeSubmission.attachments.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-800 block">ပူးတွဲပါ စာရွက်စာတမ်း / ဓာတ်ပုံများ:</span>
                <div className="grid grid-cols-2 gap-2">
                  {activeSubmission.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImage(att.dataUrl)}
                      className="border border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:border-blue-900 transition bg-slate-100 group"
                    >
                      <img src={att.dataUrl} alt={att.title} className="w-full h-24 object-cover group-hover:scale-105 transition" />
                      <span className="block text-[10px] font-extrabold p-1.5 text-center text-slate-800 bg-white border-t border-slate-100 truncate">
                        {att.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Officer Action & Notes */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="block text-xs font-black text-slate-800">
                အရာရှိ စိစစ်ချက် မှတ်ချက် / အကြောင်းကြားစာ
              </label>
              <textarea
                rows={2}
                value={officerNoteInput}
                onChange={(e) => setOfficerNoteInput(e.target.value)}
                placeholder="စိစစ်ချက် မှတ်ချက် ရေးသားပါ..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:border-blue-950 focus:outline-none"
              />

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(activeSubmission.id, 'APPROVED')}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-xs transition"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>အတည်ပြုမည်</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus(activeSubmission.id, 'REVISION_NEEDED')}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-xs transition"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-200" />
                  <span>ပြင်ဆင်ရန်</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus(activeSubmission.id, 'REJECTED')}
                  className="flex-1 py-2 px-3 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-xs transition"
                >
                  <XCircle className="w-4 h-4 text-rose-200" />
                  <span>ငြင်းပယ်မည်</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN IMAGE PREVIEW MODAL */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 p-4 flex items-center justify-center" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-2xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white font-black text-sm bg-white/20 p-2 rounded-full"
            >
              ✕
            </button>
            <img src={selectedImage} alt="Attachment" className="w-full max-h-[85vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};
