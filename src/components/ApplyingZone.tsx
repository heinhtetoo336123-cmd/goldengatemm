import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import {
  Send,
  Plus,
  Copy,
  Check,
  QrCode,
  FileText,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  Ban,
  X
} from 'lucide-react';
import {
  ApplicationLink,
  ApplicationSubmission,
  ApplicationSubmissionStatus,
  ApplicationType,
  User
} from '../types';
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
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedToken, setCopiedToken] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

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
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const officerId = currentUser?.id || '';
  const officerEmail = currentUser?.email || '';
  const isAdminUser = currentUser?.role === 'ADMIN';

  const reloadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [fetchedLinks, fetchedSubs] = await Promise.all([
        db.fetchApplicationLinksAsync(officerId, officerEmail, isAdminUser),
        db.fetchApplicationSubmissionsAsync(officerId, officerEmail, isAdminUser)
      ]);
      setLinks(fetchedLinks);
      setSubmissions(fetchedSubs);
    } finally {
      setIsRefreshing(false);
    }
  }, [officerId, officerEmail, isAdminUser]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  const getFullShareUrl = (token: string) => {
    return `${window.location.origin}/?applyToken=${token}`;
  };

  // Generate QR Data URL whenever generatedLink changes
  useEffect(() => {
    if (!generatedLink) {
      setQrDataUrl('');
      return;
    }
    const url = getFullShareUrl(generatedLink.token);
    QRCode.toDataURL(url, {
      width: 280,
      margin: 2,
      color: { dark: '#0A2E6E', light: '#FFFFFF' }
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [generatedLink]);

  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!townshipInput.trim()) return;
    setIsGenerating(true);
    setStatusBanner(null);
    try {
      const token = `APP-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const newLink = await db.saveApplicationLinkAsync({
        token,
        officerId,
        officerEmail,
        officerName: currentUser?.name || 'Officer',
        officerBadge: currentUser?.badgeNumber || 'IMM-2026',
        officerStation: currentUser?.station || townshipInput.trim(),
        applicationType: selectedAppType,
        townshipName: townshipInput.trim(),
        customNote: customNote.trim()
      });
      setGeneratedLink(newLink);
      await reloadData();
    } catch {
      setStatusBanner({ type: 'error', text: 'သိမ်းဆည်းမရပါ။' });
      setTimeout(() => setStatusBanner(null), 4000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = (token: string) => {
    navigator.clipboard.writeText(getFullShareUrl(token));
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl || !generatedLink) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR_${generatedLink.token}.png`;
    link.click();
  };

  const handleShareViber = (link: ApplicationLink) => {
    const url = getFullShareUrl(link.token);
    const text = `${getTypeLabelMM(link.applicationType)}\n${link.officerName} (${link.townshipName})\n${url}`;
    window.location.href = `viber://forward?text=${encodeURIComponent(text)}`;
  };

  const handleRevokeLink = async (token: string) => {
    try {
      await db.revokeApplicationLinkAsync(token);
      setStatusBanner({ type: 'success', text: `${token} ပိတ်သိမ်းပြီး` });
      await reloadData();
    } catch {
      setStatusBanner({ type: 'error', text: `${token} ပိတ်သိမ်းမရပါ` });
    }
    setTimeout(() => setStatusBanner(null), 3500);
  };

  const handleUpdateStatus = async (id: string, newStatus: ApplicationSubmissionStatus) => {
    try {
      await db.updateSubmissionStatusAsync(id, newStatus, officerNoteInput.trim());
      await reloadData();
      if (activeSubmission && activeSubmission.id === id) {
        setActiveSubmission((prev) =>
          prev ? { ...prev, status: newStatus, officerNotes: officerNoteInput.trim() } : null
        );
      }
      setStatusBanner({ type: 'success', text: 'သိမ်းဆည်းပြီး' });
    } catch {
      setStatusBanner({ type: 'error', text: 'ပြင်ဆင်မရပါ' });
    }
    setTimeout(() => setStatusBanner(null), 3500);
  };

  const getTypeLabelMM = (type: ApplicationType) => {
    switch (type) {
      case 'NRC_APP':
        return 'နိုင်ငံသားစိစစ်ရေးကတ်ပြား လျှောက်ထားခြင်း';
      case 'HOUSEHOLD_APP':
        return 'အိမ်ထောင်စုလူဦးရေစာရင်း (ပုံစံ ၆၆/၆)';
      case 'DECEASED_REMOVAL':
        return 'အိမ်ထောင်စုစာရင်းမှ သေဆုံးသူ ပယ်ဖျက်ခြင်း';
      case 'BIRTH_ADDITION':
        return 'အိမ်ထောင်စုစာရင်းသို့ မွေးဖွားသူ ထည့်သွင်းခြင်း';
      default:
        return 'လျှောက်လွှာ';
    }
  };

  const getStatusLabelMM = (status: ApplicationSubmissionStatus) => {
    switch (status) {
      case 'APPROVED':
        return 'အတည်ပြုပြီး';
      case 'REJECTED':
        return 'ငြင်းပယ်ထား';
      case 'REVISION_NEEDED':
        return 'ပြင်ဆင်ရန်';
      default:
        return 'စိစစ်ဆဲ';
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && s.applicationType !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        s.applicantName.toLowerCase().includes(q) ||
        s.submissionRef.toLowerCase().includes(q) ||
        s.applicantPhone.includes(q) ||
        s.applicantNrc.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const pendingCount = submissions.filter((s) => s.status === 'PENDING').length;

  return (
    <div className="space-y-5 pb-28 max-w-5xl mx-auto w-full">
      {/* iOS 27 Large Title Header */}
      <div className="flex items-center justify-between gap-3 px-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Applying Zone
        </h1>

        <button
          type="button"
          onClick={reloadData}
          disabled={isRefreshing}
          className="min-h-[44px] px-4 py-2 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-slate-900/10 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 ios-press cursor-pointer whitespace-nowrap"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {statusBanner && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
            statusBanner.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          {statusBanner.type === 'error' ? (
            <XCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{statusBanner.text}</span>
        </div>
      )}

      {/* iOS 27 Segmented Control */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-200/80 dark:bg-[#1C1C1E] border border-slate-900/5 dark:border-white/10 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveSubTab('GENERATE')}
          className={`min-h-[44px] px-2 sm:px-3 py-2 rounded-[14px] transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'GENERATE'
              ? 'bg-white dark:bg-[#2C2C2E] text-slate-900 dark:text-white shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">လင့်ခ်သစ်</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('ACTIVE_LINKS')}
          className={`min-h-[44px] px-2 sm:px-3 py-2 rounded-[14px] transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer tabular-nums ${
            activeSubTab === 'ACTIVE_LINKS'
              ? 'bg-white dark:bg-[#2C2C2E] text-slate-900 dark:text-white shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <QrCode className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">လင့်ခ်များ ({links.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('SUBMISSIONS')}
          className={`min-h-[44px] px-2 sm:px-3 py-2 rounded-[14px] transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer tabular-nums ${
            activeSubTab === 'SUBMISSIONS'
              ? 'bg-white dark:bg-[#2C2C2E] text-slate-900 dark:text-white shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">လျှောက်လွှာ ({pendingCount})</span>
        </button>
      </div>

      {/* SUB-TAB 1: Unique Link & QR Generator */}
      {activeSubTab === 'GENERATE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7 ios-grouped-card p-5 sm:p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              လင့်ခ် နှင့် QR ထုတ်ရန်
            </h2>

            <form onSubmit={handleGenerateLink} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  ၁။ အမျိုးအစား
                </label>
                <select
                  value={selectedAppType}
                  onChange={(e) => setSelectedAppType(e.target.value as ApplicationType)}
                  className="w-full min-h-[44px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-semibold focus:border-[#0055D4] focus:outline-none"
                >
                  <option value="NRC_APP">နိုင်ငံသားစိစစ်ရေးကတ်ပြား (NRC)</option>
                  <option value="HOUSEHOLD_APP">အိမ်ထောင်စုစာရင်း (ပုံစံ ၆၆/၆)</option>
                  <option value="DECEASED_REMOVAL">သေဆုံးသူ ပယ်ဖျက်ခြင်း</option>
                  <option value="BIRTH_ADDITION">မွေးဖွားသူ ထည့်သွင်းခြင်း</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  ၂။ မြို့နယ် / ရုံး
                </label>
                <input
                  type="text"
                  required
                  value={townshipInput}
                  onChange={(e) => setTownshipInput(e.target.value)}
                  className="w-full min-h-[44px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-semibold focus:border-[#0055D4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  ၃။ မှတ်စု
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Optional"
                  className="w-full min-h-[44px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-[#0055D4] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-[#0055D4] hover:bg-[#0A46B8] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 ios-press cursor-pointer disabled:opacity-60"
              >
                <QrCode className="w-4 h-4" />
                <span>{isGenerating ? 'ထုတ်နေသည်...' : 'လင့်ခ် နှင့် QR ထုတ်မည်'}</span>
              </button>
            </form>
          </div>

          {/* Generated Link & QR Code Preview */}
          <div className="lg:col-span-5 ios-grouped-card p-5 sm:p-6 space-y-4">
            {generatedLink ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>လင့်ခ် အဆင်သင့်ဖြစ်ပါပြီ</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                    {generatedLink.token}
                  </span>
                </div>

                {qrDataUrl && (
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col items-center gap-2">
                    <img
                      src={qrDataUrl}
                      alt={`QR code for ${generatedLink.token}`}
                      className="w-44 h-44 object-contain"
                    />
                    <span className="text-[11px] font-mono font-semibold text-slate-600">
                      {generatedLink.townshipName}
                    </span>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10">
                  <p className="text-[11px] font-mono text-slate-800 dark:text-slate-200 break-all select-all">
                    {getFullShareUrl(generatedLink.token)}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(generatedLink.token)}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-[#0055D4] text-white text-xs font-semibold flex items-center justify-center gap-1.5 ios-press cursor-pointer"
                  >
                    {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedToken ? 'ကူးပြီး' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShareViber(generatedLink)}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 ios-press cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Viber</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadQR}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white text-xs font-semibold flex items-center justify-center gap-1.5 ios-press cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>QR</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="py-12 text-center space-y-2">
                <QrCode className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  QR နှင့် လင့်ခ်
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Active Links List */}
      {activeSubTab === 'ACTIVE_LINKS' && (
        <div className="ios-grouped-card overflow-hidden divide-y divide-slate-200/70 dark:divide-white/10">
          {links.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <QrCode className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                လင့်ခ် မရှိသေးပါ
              </p>
            </div>
          ) : (
            links.map((link) => (
              <div key={link.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {getTypeLabelMM(link.applicationType)}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums truncate">
                    {link.token} · {link.townshipName} ·{' '}
                    <span className={link.status === 'ACTIVE' ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-rose-600 font-semibold'}>
                      {link.status === 'ACTIVE' ? 'အသုံးပြုနိုင်ဆဲ' : 'ပိတ်သိမ်းပြီး'}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(link.token)}
                    className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShareViber(link)}
                    className="min-h-[40px] px-3 py-1.5 rounded-xl bg-purple-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Viber</span>
                  </button>

                  {link.status === 'ACTIVE' && (
                    <button
                      type="button"
                      onClick={() => handleRevokeLink(link.token)}
                      className="min-h-[40px] px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      title="လင့်ခ်ပိတ်သိမ်းမည်"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>ပိတ်မည်</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SUB-TAB 3: Received Submissions (Direct to Issuing Officer) */}
      {activeSubTab === 'SUBMISSIONS' && (
        <div className="space-y-4">
          <div className="ios-grouped-card p-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="လျှောက်ထားသူ အမည်၊ ဖုန်း၊ NRC သို့မဟုတ် ကုတ်အမှတ်ဖြင့် ရှာဖွေပါ..."
                className="w-full min-h-[44px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:border-[#0055D4] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="min-h-[44px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:border-[#0055D4] focus:outline-none"
              >
                <option value="ALL">အဆင့်အတန်း အားလုံး</option>
                <option value="PENDING">စိစစ်ဆဲ (Pending)</option>
                <option value="APPROVED">အတည်ပြုပြီး (Approved)</option>
                <option value="REVISION_NEEDED">ပြင်ဆင်ရန် (Revision Needed)</option>
                <option value="REJECTED">ငြင်းပယ်ထား (Rejected)</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="min-h-[44px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:border-[#0055D4] focus:outline-none"
              >
                <option value="ALL">လျှောက်လွှာအမျိုးအစား အားလုံး</option>
                <option value="NRC_APP">နိုင်ငံသားစိစစ်ရေးကတ်</option>
                <option value="HOUSEHOLD_APP">အိမ်ထောင်စုဇယား</option>
                <option value="DECEASED_REMOVAL">သေဆုံးသူပယ်ဖျက်</option>
                <option value="BIRTH_ADDITION">မွေးဖွားသူထည့်သွင်း</option>
              </select>
            </div>
          </div>

          <div className="ios-grouped-card overflow-hidden divide-y divide-slate-200/70 dark:divide-white/10">
            {filteredSubmissions.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  လျှောက်လွှာ မရှိသေးပါ
                </p>
              </div>
            ) : (
              filteredSubmissions.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    setActiveSubmission(sub);
                    setOfficerNoteInput(sub.officerNotes || '');
                  }}
                  className="w-full p-4 sm:p-5 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {sub.applicantName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums truncate">
                      {sub.submissionRef} · {getTypeLabelMM(sub.applicationType)} · ဖုန်း {sub.applicantPhone} · ပုံ {sub.attachments?.length || 0} ပုံ
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold shrink-0 ${
                      sub.status === 'APPROVED'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : sub.status === 'REJECTED'
                        ? 'text-rose-600 dark:text-rose-400'
                        : sub.status === 'REVISION_NEEDED'
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-[#0055D4] dark:text-blue-400'
                    }`}
                  >
                    {sub.status === 'APPROVED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    <span>{getStatusLabelMM(sub.status)}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBMISSION VIEWER & ACTION SHEET */}
      {activeSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-[28px] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto relative text-slate-900 dark:text-slate-100">
            <button
              type="button"
              onClick={() => setActiveSubmission(null)}
              className="absolute top-4 right-4 min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-full"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pr-8">
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                {activeSubmission.submissionRef} · {getStatusLabelMM(activeSubmission.status)}
              </p>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {activeSubmission.applicantName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {getTypeLabelMM(activeSubmission.applicationType)}
              </p>
            </div>

            <div className="divide-y divide-slate-200/70 dark:divide-white/10 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 text-xs">
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-slate-500 dark:text-slate-400">ဖုန်းနံပါတ်</span>
                <span className="font-mono font-semibold tabular-nums">{activeSubmission.applicantPhone}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-slate-500 dark:text-slate-400">အဖ / အမိ</span>
                <span className="font-semibold text-right">{activeSubmission.fatherName} / {activeSubmission.motherName}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-slate-500 dark:text-slate-400">မွေးသက္ကရာဇ်</span>
                <span className="font-mono tabular-nums">{activeSubmission.dob || '-'}</span>
              </div>
              <div className="px-4 py-2.5 space-y-0.5">
                <span className="text-slate-500 dark:text-slate-400 block">နေရပ်လိပ်စာ</span>
                <span className="font-medium block">{activeSubmission.applicantAddress}</span>
              </div>
              {activeSubmission.householdListNo && (
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-slate-500 dark:text-slate-400">အိမ်ထောင်စုစာရင်း</span>
                  <span className="font-semibold">{activeSubmission.householdListNo}</span>
                </div>
              )}
              {activeSubmission.deceasedPersonName && (
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-slate-500 dark:text-slate-400">သေဆုံးသူ</span>
                  <span className="font-semibold">{activeSubmission.deceasedPersonName} ({activeSubmission.dateOfDeath})</span>
                </div>
              )}
              {activeSubmission.childName && (
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-slate-500 dark:text-slate-400">မွေးဖွားသူ ကလေး</span>
                  <span className="font-semibold">{activeSubmission.childName} ({activeSubmission.childDob})</span>
                </div>
              )}
            </div>

            {activeSubmission.attachments && activeSubmission.attachments.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold block">ပူးတွဲပါ စာရွက်စာတမ်းများ</span>
                <div className="grid grid-cols-2 gap-2.5">
                  {activeSubmission.attachments.map((att, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(att.dataUrl)}
                      className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden text-left hover:border-[#0055D4] transition bg-slate-100 dark:bg-white/5 cursor-pointer"
                    >
                      <img src={att.dataUrl} alt={att.title} className="w-full h-24 object-cover" />
                      <span className="block text-[11px] font-semibold p-2 text-center truncate">
                        {att.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2.5 pt-2 border-t border-slate-200/70 dark:border-white/10">
              {(activeSubmission.status === 'APPROVED' || activeSubmission.status === 'REJECTED') && !isAdminUser ? (
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {getStatusLabelMM(activeSubmission.status)} (Admin မှသာ ပြင်ဆင်နိုင်သည်)
                  </p>
                  {activeSubmission.officerNotes && (
                    <p className="text-[11px]">{activeSubmission.officerNotes}</p>
                  )}
                </div>
              ) : (
                <>
                  <label className="block text-xs font-bold">
                    အရာရှိ စိစစ်ချက် မှတ်ချက်
                  </label>
                  <textarea
                    rows={2}
                    value={officerNoteInput}
                    onChange={(e) => setOfficerNoteInput(e.target.value)}
                    placeholder="စိစစ်ချက် မှတ်ချက် ရေးသားပါ..."
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs focus:border-[#0055D4] focus:outline-none"
                  />

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(activeSubmission.id, 'APPROVED')}
                      className="min-h-[44px] py-2 px-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-1 ios-press cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>အတည်ပြုမည်</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(activeSubmission.id, 'REVISION_NEEDED')}
                      className="min-h-[44px] py-2 px-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center justify-center gap-1 ios-press cursor-pointer"
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>ပြင်ဆင်ရန်</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(activeSubmission.id, 'REJECTED')}
                      className="min-h-[44px] py-2 px-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs flex items-center justify-center gap-1 ios-press cursor-pointer"
                    >
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span>ငြင်းပယ်မည်</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN IMAGE PREVIEW */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 p-4 flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-2xl w-full">
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 min-h-[44px] min-w-[44px] text-white bg-white/15 rounded-full flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={selectedImage} alt="Attachment" className="w-full max-h-[85vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};
