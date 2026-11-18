import React, { useState, useEffect } from 'react';
import {
  FolderArchive, Search, Plus, CloudCheck, CloudOff,
  FileText, Trash2, Calendar, X, Download, Upload, Check, Send,
  Phone, PhoneCall, Users, CheckCircle2, Clock, MapPin,
  Building2, Mail, Copy, AlertTriangle
} from 'lucide-react';
import { DocumentRecord, DocumentCategory, RegisteredOfficer } from '../types';
import { db } from '../services/db';
import { MYANMAR_ADMINISTRATIVE_DATA, getDistricts, getTownships, findTownshipLocationInfo } from '../data/administrativeData';

type ConfirmModalState =
  | { type: 'DELETE_DOC'; id: string; label: string }
  | { type: 'CLEAR_DOCS' }
  | { type: 'DELETE_OFFICER'; id: string; label: string }
  | null;

export const RecordsManager: React.FC = () => {
  const [mainTab, setMainTab] = useState<'DOCUMENTS' | 'PHONEBOOK'>('PHONEBOOK');

  // Document Records State
  const [records, setRecords] = useState<DocumentRecord[]>([]);
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeModalDoc, setActiveModalDoc] = useState<DocumentRecord | null>(null);
  const [showCreateDocModal, setShowCreateDocModal] = useState(false);

  // New Document Form State
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<DocumentCategory>('INSPECTION');
  const [newDocRefNo, setNewDocRefNo] = useState('');
  const [newDocSender, setNewDocSender] = useState('');
  const [newDocReceiver, setNewDocReceiver] = useState('');
  const [newDocSummary, setNewDocSummary] = useState('');

  // Phonebook State
  const [officers, setOfficers] = useState<RegisteredOfficer[]>([]);
  const [phoneSearchQuery, setPhoneSearchQuery] = useState('');
  const [phoneRegionId, setPhoneRegionId] = useState<string>('ALL');
  const [phoneDistrictId, setPhoneDistrictId] = useState<string>('ALL');
  const [phoneTownshipId, setPhoneTownshipId] = useState<string>('ALL');
  const [showAddOfficerModal, setShowAddOfficerModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add Officer Form State
  const [officerName, setOfficerName] = useState('');
  const [officerRank, setOfficerRank] = useState('ဦးစီးအရာရှိ');
  const [customRank, setCustomRank] = useState('');
  const [isCustomRank, setIsCustomRank] = useState(false);
  const [officerDuty, setOfficerDuty] = useState('မြို့နယ်ဦးစီးမှူး');
  const [customDuty, setCustomDuty] = useState('');
  const [isCustomDuty, setIsCustomDuty] = useState(false);
  const [officerSerialNo, setOfficerSerialNo] = useState('');
  const [officerRegionId, setOfficerRegionId] = useState('naypyitaw');
  const [officerDistrictId, setOfficerDistrictId] = useState('');
  const [officerTownshipId, setOfficerTownshipId] = useState('');
  const [officerPhone, setOfficerPhone] = useState('');
  const [officerOfficePhone, setOfficerOfficePhone] = useState('');
  const [officerEmail, setOfficerEmail] = useState('');
  const [officerStatus, setOfficerStatus] = useState<'VERIFIED' | 'PENDING_APPROVAL'>('VERIFIED');
  const [formError, setFormError] = useState<string | null>(null);

  // Toast & In-App Confirmation Modal (no window.alert / window.confirm)
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const showToast = (text: string, kind: 'success' | 'error' = 'success') => {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 3500);
  };

  const reloadData = () => {
    setRecords(db.getDocuments());
    setOfficers(db.getOfficers({
      regionId: phoneRegionId,
      districtId: phoneDistrictId,
      townshipId: phoneTownshipId,
      search: phoneSearchQuery
    }));
  };

  useEffect(() => {
    reloadData();
  }, [phoneRegionId, phoneDistrictId, phoneTownshipId, phoneSearchQuery]);

  useEffect(() => {
    const districts = getDistricts(officerRegionId);
    if (districts.length > 0) {
      setOfficerDistrictId(districts[0].id);
      const townships = districts[0].townships;
      if (townships.length > 0) {
        setOfficerTownshipId(townships[0].id);
      }
    }
  }, [officerRegionId]);

  const categories: { id: string; label: string }[] = [
    { id: 'ALL', label: 'အားလုံး' },
    { id: 'DIRECTIVE', label: 'ညွှန်ကြားစာ' },
    { id: 'INBOUND', label: 'ဝင်စာ' },
    { id: 'OUTBOUND', label: 'ထွက်စာ' },
    { id: 'INSPECTION', label: 'စစ်ဆေးရေး' },
    { id: 'VISA_VERIFY', label: 'ဗီဇာ' }
  ];

  const filteredRecords = db.searchDocumentsIndexed(docSearchQuery, selectedCategory);

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;

    db.saveDocument({
      title: newDocTitle.trim(),
      category: newDocCategory,
      refNumber: newDocRefNo.trim() || `မှတ်တမ်း/လဝက-${Math.floor(100 + Math.random() * 900)}`,
      sender: newDocSender.trim() || 'စိစစ်ရေး အရာရှိ',
      receiver: newDocReceiver.trim() || 'လူဝင်မှုကြီးကြပ်ရေး ဦးစီးဌာန',
      summary: newDocSummary.trim() || newDocTitle.trim(),
      fullText: newDocSummary.trim(),
      classification: 'NONE',
      date: new Date().toISOString().split('T')[0]
    });

    reloadData();
    setShowCreateDocModal(false);
    setNewDocTitle('');
    setNewDocRefNo('');
    setNewDocSender('');
    setNewDocReceiver('');
    setNewDocSummary('');
    showToast('မှတ်တမ်းသစ် သိမ်းဆည်းပြီးပါပြီ။');
  };

  const handleSaveOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!officerName.trim() || !officerPhone.trim()) {
      setFormError('အရာရှိ အမည်နှင့် ဖုန်းနံပါတ် ဖြည့်သွင်းရန် လိုအပ်ပါသည်။');
      return;
    }

    const rankToSave = isCustomRank ? (customRank.trim() || 'အရာရှိ') : officerRank;
    const dutyToSave = isCustomDuty ? (customDuty.trim() || 'မြို့နယ်ဦးစီးမှူး') : officerDuty;

    const region = MYANMAR_ADMINISTRATIVE_DATA.find(r => r.id === officerRegionId);
    const districts = getDistricts(officerRegionId);
    const district = districts.find(d => d.id === officerDistrictId);

    let locationLabel = '';
    let generatedOfficeName = '';

    if (officerTownshipId) {
      const info = findTownshipLocationInfo(officerTownshipId);
      locationLabel = info.township?.nameMM || district?.nameMM || region?.nameMM || 'ရုံးတည်နေရာ';
      generatedOfficeName = `${locationLabel} လူဝင်မှုကြီးကြပ်ရေးဦးစီးမှူးရုံး`;
    } else if (officerDistrictId && district) {
      locationLabel = district.nameMM;
      generatedOfficeName = `${district.nameMM} ဦးစီးမှူးရုံး (ခရိုင်ရုံး)`;
    } else if (region) {
      locationLabel = region.nameMM;
      generatedOfficeName = `${region.nameMM} ဦးစီးမှူးရုံး (တိုင်းဒေသကြီး/ပြည်နယ်ရုံး)`;
    } else {
      locationLabel = 'ရုံးတည်နေရာ';
      generatedOfficeName = 'လူဝင်မှုကြီးကြပ်ရေးဦးစီးမှူးရုံး';
    }

    db.saveOfficer({
      name: officerName.trim(),
      rank: rankToSave,
      serialNo: officerSerialNo.trim(),
      officeName: generatedOfficeName,
      regionId: officerRegionId,
      districtId: officerDistrictId || '',
      townshipId: officerTownshipId || '',
      townshipNameMM: locationLabel,
      phone: officerPhone.trim(),
      officePhone: officerOfficePhone.trim(),
      email: officerEmail.trim(),
      viberNumber: officerPhone.trim(),
      status: officerStatus,
      notes: dutyToSave,
      approvedBy: officerStatus === 'VERIFIED' ? 'Admin' : undefined
    });

    reloadData();
    setShowAddOfficerModal(false);
    setOfficerName('');
    setOfficerSerialNo('');
    setOfficerPhone('');
    setOfficerOfficePhone('');
    setOfficerEmail('');
    setOfficerRank('ဦးစီးအရာရှိ');
    setCustomRank('');
    setIsCustomRank(false);
    setOfficerDuty('မြို့နယ်ဦးစီးမှူး');
    setCustomDuty('');
    setIsCustomDuty(false);
    showToast(officerStatus === 'VERIFIED' ? 'အရာရှိ အချက်အလက် ထည့်သွင်းပြီးပါပြီ။' : 'အရာရှိ စာရင်းသွင်းပြီးပါပြီ။');
  };

  const executeConfirmAction = () => {
    if (!confirmModal) return;
    if (confirmModal.type === 'DELETE_DOC') {
      db.deleteDocument(confirmModal.id);
      reloadData();
      setActiveModalDoc(null);
      showToast('မှတ်တမ်း ပယ်ဖျက်ပြီးပါပြီ။');
    } else if (confirmModal.type === 'CLEAR_DOCS') {
      db.clearAllDocuments();
      reloadData();
      showToast('မှတ်တမ်းများ ရှင်းလင်းပြီးပါပြီ။');
    } else if (confirmModal.type === 'DELETE_OFFICER') {
      db.deleteOfficer(confirmModal.id);
      reloadData();
      showToast('ဖုန်းစာအုပ်မှ ပယ်ဖျက်ပြီးပါပြီ။');
    }
    setConfirmModal(null);
  };

  const handleApproveOfficer = (id: string) => {
    db.approveOfficer(id, 'Admin');
    reloadData();
    showToast('အရာရှိအား အတည်ပြုပြီးပါပြီ။');
  };

  const handleCopyContact = (officer: RegisteredOfficer) => {
    const text = `${officer.rank} ${officer.name}${officer.serialNo ? ` (${officer.serialNo})` : ''}\n${officer.officeName}\nဖုန်း: ${officer.phone}${officer.officePhone ? ` / ${officer.officePhone}` : ''}${officer.email ? `\n${officer.email}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(officer.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportData = () => {
    const jsonStr = db.exportUnifiedJSONBackup();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `goldengate_mm_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('JSON Backup ဒေါင်းလုဒ် ရယူပြီးပါပြီ။');
  };

  const handleRestoreData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const res = db.importUnifiedJSONBackup(content);
        if (res.success) {
          reloadData();
          showToast(res.message, 'success');
        } else {
          showToast(res.message, 'error');
        }
      } catch {
        showToast('JSON Backup ဖိုင်ပုံစံ မှန်ကန်မှု မရှိပါ။', 'error');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleShareRecordViber = async (doc: DocumentRecord) => {
    const textContent = `${doc.title}\nစာအမှတ်: ${doc.refNumber}\nရက်စွဲ: ${doc.date}\nပေးပို့သူ: ${doc.sender}\n\n${doc.fullText || doc.summary}`;

    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: doc.title,
          text: textContent
        });
        return;
      } catch {
        // Fallback below
      }
    }

    window.location.href = `viber://forward?text=${encodeURIComponent(textContent)}`;
  };

  const currentDistricts = phoneRegionId !== 'ALL' ? getDistricts(phoneRegionId) : [];
  const currentTownships = (phoneRegionId !== 'ALL' && phoneDistrictId !== 'ALL')
    ? getTownships(phoneRegionId, phoneDistrictId)
    : [];

  const getCategoryLabel = (cat: DocumentCategory) => {
    switch (cat) {
      case 'DIRECTIVE': return 'ညွှန်ကြားစာ';
      case 'INSPECTION': return 'စစ်ဆေးရေး';
      case 'INBOUND': return 'ဝင်စာ';
      case 'OUTBOUND': return 'ထွက်စာ';
      default: return 'ဗီဇာ/ကတ်';
    }
  };

  return (
    <div className="space-y-5 pb-28 max-w-4xl mx-auto w-full overflow-x-hidden">
      {/* Large Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1 px-1">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-blue-700 dark:text-blue-400">
            Directory & Records
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
            မှတ်တမ်းများ
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportData}
            className="min-h-[40px] px-3 py-2 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition ios-press"
            title="Backup JSON"
          >
            <Download className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
            <span>Backup</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[40px] px-3 py-2 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition ios-press"
            title="Restore JSON"
          >
            <Upload className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
            <span>Restore</span>
          </button>

          {mainTab === 'PHONEBOOK' ? (
            <button
              type="button"
              onClick={() => {
                setFormError(null);
                setShowAddOfficerModal(true);
              }}
              className="min-h-[40px] px-4 py-2 rounded-2xl bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition ios-press whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>အရာရှိသစ်</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowCreateDocModal(true)}
              className="min-h-[40px] px-4 py-2 rounded-2xl bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition ios-press whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>မှတ်တမ်းသစ်</span>
            </button>
          )}
        </div>
      </div>

      {/* Inline Toast Notification */}
      {toast && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-2.5 animate-in fade-in ${
            toast.kind === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.kind === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            ) : (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
          <button type="button" onClick={() => setToast(null)} className="p-1 rounded-lg opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleRestoreData}
        accept=".json,application/json"
        className="hidden"
      />

      {/* iOS Segmented Control */}
      <div className="p-1 rounded-2xl bg-slate-200/75 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => setMainTab('PHONEBOOK')}
          className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            mainTab === 'PHONEBOOK'
              ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Phone className="w-3.5 h-3.5 shrink-0" />
          <span>ဖုန်းစာအုပ်</span>
          <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 tabular-nums-clean">
            ({officers.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('DOCUMENTS')}
          className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            mainTab === 'DOCUMENTS'
              ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FolderArchive className="w-3.5 h-3.5 shrink-0" />
          <span>စာရွက်စာတမ်း</span>
          <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 tabular-nums-clean">
            ({records.length})
          </span>
        </button>
      </div>

      {/* TAB 1: PHONEBOOK */}
      {mainTab === 'PHONEBOOK' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="ios-grouped-card p-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={phoneSearchQuery}
                onChange={(e) => setPhoneSearchQuery(e.target.value)}
                placeholder="အမည်၊ ရာထူး၊ ကိုယ်ပိုင်အမှတ် သို့မဟုတ် ဖုန်းနံပါတ်..."
                className="w-full min-h-[44px] bg-slate-100/80 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none transition font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-zinc-400 mb-1">
                  တိုင်း / ပြည်နယ်
                </label>
                <select
                  value={phoneRegionId}
                  onChange={(e) => {
                    setPhoneRegionId(e.target.value);
                    setPhoneDistrictId('ALL');
                    setPhoneTownshipId('ALL');
                  }}
                  className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-semibold text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-zinc-800 focus:border-blue-600 focus:outline-none"
                >
                  <option value="ALL">အားလုံး</option>
                  {MYANMAR_ADMINISTRATIVE_DATA.map((r) => (
                    <option key={r.id} value={r.id}>{r.nameMM}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-zinc-400 mb-1">
                  ခရိုင်
                </label>
                <select
                  value={phoneDistrictId}
                  disabled={phoneRegionId === 'ALL'}
                  onChange={(e) => {
                    setPhoneDistrictId(e.target.value);
                    setPhoneTownshipId('ALL');
                  }}
                  className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-semibold text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-zinc-800 focus:border-blue-600 focus:outline-none disabled:opacity-45"
                >
                  <option value="ALL">အားလုံး</option>
                  {currentDistricts.map((d) => (
                    <option key={d.id} value={d.id}>{d.nameMM}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-zinc-400 mb-1">
                  မြို့နယ်
                </label>
                <select
                  value={phoneTownshipId}
                  disabled={phoneDistrictId === 'ALL'}
                  onChange={(e) => setPhoneTownshipId(e.target.value)}
                  className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-semibold text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-zinc-800 focus:border-blue-600 focus:outline-none disabled:opacity-45"
                >
                  <option value="ALL">အားလုံး</option>
                  {currentTownships.map((t) => (
                    <option key={t.id} value={t.id}>{t.nameMM}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {officers.length === 0 ? (
            <div className="ios-grouped-card p-10 text-center space-y-2">
              <Users className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto" />
              <p className="text-xs text-slate-600 dark:text-zinc-300 font-bold">
                အရာရှိ စာရင်း မတွေ့ရှိပါ
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {officers.map((off) => (
                <div
                  key={off.id}
                  className="ios-grouped-card p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200/70 dark:border-blue-800/70 flex items-center justify-center font-extrabold text-blue-800 dark:text-blue-300 text-xs shrink-0">
                        {off.name.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 truncate">
                          {off.rank}{off.serialNo ? ` · ${off.serialNo}` : ''}
                        </p>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                          {off.name}
                        </h4>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold shrink-0 ${
                      off.status === 'VERIFIED'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {off.status === 'VERIFIED' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>အတည်ပြုပြီး</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>ဆိုင်းငံ့</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 dark:text-zinc-300">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Building2 className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400 shrink-0" />
                      <span className="truncate">{off.officeName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="truncate">{off.townshipNameMM}{off.notes ? ` · ${off.notes}` : ''}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${off.phone}`}
                        className="min-h-[38px] px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition ios-press tabular-nums-clean"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{off.phone}</span>
                      </a>

                      <a
                        href={`viber://chat?number=${encodeURIComponent(off.viberNumber || off.phone)}`}
                        className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-800 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800/70 flex items-center justify-center transition"
                        title="Viber"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </a>

                      {off.email && (
                        <a
                          href={`mailto:${off.email}`}
                          className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center transition"
                          title="Email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopyContact(off)}
                        className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center transition"
                        title="ကူးယူမည်"
                      >
                        {copiedId === off.id ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {off.status === 'PENDING_APPROVAL' && (
                        <button
                          type="button"
                          onClick={() => handleApproveOfficer(off.id)}
                          className="min-h-[36px] px-3 py-1 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-bold"
                        >
                          အတည်ပြုမည်
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setConfirmModal({ type: 'DELETE_OFFICER', id: off.id, label: off.name })}
                        className="w-9 h-9 rounded-xl text-slate-400 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center justify-center transition"
                        title="ဖျက်ပစ်မည်"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DOCUMENTS */}
      {mainTab === 'DOCUMENTS' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="ios-grouped-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={docSearchQuery}
                  onChange={(e) => setDocSearchQuery(e.target.value)}
                  placeholder="စာအမှတ် သို့မဟုတ် ခေါင်းစဉ်ဖြင့် ရှာဖွေပါ..."
                  className="w-full min-h-[44px] bg-slate-100/80 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none transition font-medium"
                />
              </div>

              {records.length > 0 && (
                <button
                  type="button"
                  onClick={() => setConfirmModal({ type: 'CLEAR_DOCS' })}
                  className="min-h-[44px] px-3.5 py-2 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/70 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5 transition shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">အားလုံးဖျက်</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`min-h-[34px] px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition shrink-0 ios-press ${
                    selectedCategory === cat.id
                      ? 'bg-blue-700 dark:bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="ios-grouped-card p-10 text-center space-y-2">
              <FolderArchive className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto" />
              <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                သိမ်းဆည်းထားသော မှတ်တမ်း မရှိသေးပါ
              </h4>
            </div>
          ) : (
            <div className="ios-grouped-card divide-y divide-slate-100 dark:divide-zinc-800 overflow-hidden">
              {filteredRecords.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setActiveModalDoc(doc)}
                  className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 font-mono truncate">
                        {doc.refNumber} · {getCategoryLabel(doc.category)}
                      </p>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {doc.title}
                      </h3>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-zinc-400 shrink-0">
                      {doc.syncStatus === 'SYNCED' ? (
                        <CloudCheck className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                      ) : (
                        <CloudOff className="w-3.5 h-3.5" />
                      )}
                      <span>{doc.syncStatus === 'SYNCED' ? 'Synced' : 'Local'}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-zinc-300 line-clamp-1">
                    {doc.summary}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500 font-medium pt-0.5">
                    <span className="truncate">{doc.sender}</span>
                    <span className="flex items-center gap-1 shrink-0 tabular-nums-clean">
                      <Calendar className="w-3 h-3" />
                      {doc.date}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONFIRMATION MODAL (replaces window.confirm) */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4 text-slate-900 dark:text-zinc-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold">အတည်ပြုရန်</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  {confirmModal.type === 'CLEAR_DOCS'
                    ? 'မှတ်တမ်းများ အားလုံးကို ဖျက်ပစ်ရန် သေချာပါသလား။'
                    : confirmModal.type === 'DELETE_DOC'
                      ? `"${confirmModal.label}" မှတ်တမ်းကို ဖျက်ပစ်ရန် သေချာပါသလား။`
                      : `အရာရှိ "${confirmModal.label}" ကို ဖုန်းစာအုပ်မှ ပယ်ဖျက်ရန် သေချာပါသလား။`}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="min-h-[42px] px-4 py-2 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold text-xs"
              >
                မလုပ်တော့ပါ
              </button>
              <button
                type="button"
                onClick={executeConfirmAction}
                className="min-h-[42px] px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                ဖျက်ပစ်မည်
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Add Registered Officer Modal */}
      {showAddOfficerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 shadow-2xl space-y-4 text-slate-900 dark:text-zinc-100 max-h-[90vh] overflow-y-auto relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>အရာရှိသစ် စာရင်းသွင်းခြင်း</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddOfficerModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveOfficer} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                  အရာရှိ အမည် *
                </label>
                <input
                  type="text"
                  required
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400">ရာထူး</label>
                    <button
                      type="button"
                      onClick={() => setIsCustomRank(!isCustomRank)}
                      className="text-[10px] font-bold text-blue-700 dark:text-blue-400 hover:underline"
                    >
                      {isCustomRank ? 'Preset ရွေးမည်' : '+ စိတ်ကြိုက်'}
                    </button>
                  </div>

                  {!isCustomRank ? (
                    <select
                      value={officerRank}
                      onChange={(e) => {
                        if (e.target.value === 'CUSTOM') setIsCustomRank(true);
                        else setOfficerRank(e.target.value);
                      }}
                      className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white font-semibold focus:border-blue-600 focus:outline-none text-xs"
                    >
                      <option value="ဦးစီးအရာရှိ">ဦးစီးအရာရှိ</option>
                      <option value="လူဝင်မှုကြီးကြပ်ရေးမှူး">လူဝင်မှုကြီးကြပ်ရေးမှူး</option>
                      <option value="ဒုတိယလူဝင်မှုကြီးကြပ်ရေးမှူး">ဒုတိယလူဝင်မှုကြီးကြပ်ရေးမှူး</option>
                      <option value="လက်ထောက်လူဝင်မှုကြီးကြပ်ရေးမှူး">လက်ထောက်လူဝင်မှုကြီးကြပ်ရေးမှူး</option>
                      <option value="အမှုတွဲထိန်း (Record Keeper)">အမှုတွဲထိန်း (Record Keeper)</option>
                      <option value="အစောင့် (Guard) / ရုံးအကူ">အစောင့် (Guard) / ရုံးအကူ</option>
                      <option value="CUSTOM">+ စိတ်ကြိုက် ရာထူး</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={customRank}
                      onChange={(e) => setCustomRank(e.target.value)}
                      placeholder="ရာထူး ရိုက်ထည့်ပါ..."
                      className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-blue-600 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold focus:outline-none text-xs"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                    ကိုယ်ပိုင်အမှတ်
                  </label>
                  <input
                    type="text"
                    value={officerSerialNo}
                    onChange={(e) => setOfficerSerialNo(e.target.value)}
                    className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400">တာဝန်</label>
                  <button
                    type="button"
                    onClick={() => setIsCustomDuty(!isCustomDuty)}
                    className="text-[10px] font-bold text-blue-700 dark:text-blue-400 hover:underline"
                  >
                    {isCustomDuty ? 'Preset ရွေးမည်' : '+ စိတ်ကြိုက်'}
                  </button>
                </div>

                {!isCustomDuty ? (
                  <select
                    value={officerDuty}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM') setIsCustomDuty(true);
                      else setOfficerDuty(e.target.value);
                    }}
                    className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white font-semibold focus:border-blue-600 focus:outline-none text-xs"
                  >
                    <option value="မြို့နယ်ဦးစီးမှူး">မြို့နယ်ဦးစီးမှူး</option>
                    <option value="တိုက်နယ်မှူး">တိုက်နယ်မှူး</option>
                    <option value="အမှုတွဲထိန်း">အမှုတွဲထိန်း</option>
                    <option value="CUSTOM">+ စိတ်ကြိုက် တာဝန်</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={customDuty}
                    onChange={(e) => setCustomDuty(e.target.value)}
                    placeholder="တာဝန် ရိုက်ထည့်ပါ..."
                    className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-blue-600 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold focus:outline-none text-xs"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">တိုင်း / ပြည်နယ် *</label>
                  <select
                    value={officerRegionId}
                    onChange={(e) => {
                      setOfficerRegionId(e.target.value);
                      setOfficerDistrictId('');
                      setOfficerTownshipId('');
                    }}
                    className="w-full min-h-[40px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white font-semibold focus:border-blue-600 focus:outline-none text-xs"
                  >
                    {MYANMAR_ADMINISTRATIVE_DATA.map((r) => (
                      <option key={r.id} value={r.id}>{r.nameMM}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">ခရိုင်</label>
                  <select
                    value={officerDistrictId}
                    onChange={(e) => {
                      setOfficerDistrictId(e.target.value);
                      setOfficerTownshipId('');
                    }}
                    className="w-full min-h-[40px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white font-semibold focus:border-blue-600 focus:outline-none text-xs"
                  >
                    <option value="">တိုင်းရုံး</option>
                    {getDistricts(officerRegionId).map((d) => (
                      <option key={d.id} value={d.id}>{d.nameMM}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">မြို့နယ်</label>
                  <select
                    value={officerTownshipId}
                    disabled={!officerDistrictId}
                    onChange={(e) => setOfficerTownshipId(e.target.value)}
                    className="w-full min-h-[40px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white font-semibold focus:border-blue-600 focus:outline-none text-xs disabled:opacity-45"
                  >
                    <option value="">ခရိုင်ရုံး</option>
                    {officerDistrictId && getTownships(officerRegionId, officerDistrictId).map((t) => (
                      <option key={t.id} value={t.id}>{t.nameMM}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">ဖုန်းနံပါတ် *</label>
                  <input
                    type="tel"
                    required
                    value={officerPhone}
                    onChange={(e) => setOfficerPhone(e.target.value)}
                    className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">ရုံးဖုန်း</label>
                  <input
                    type="text"
                    value={officerOfficePhone}
                    onChange={(e) => setOfficerOfficePhone(e.target.value)}
                    className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">အီးမေးလ်</label>
                  <input
                    type="email"
                    value={officerEmail}
                    onChange={(e) => setOfficerEmail(e.target.value)}
                    className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">အတည်ပြုမှု</label>
                  <select
                    value={officerStatus}
                    onChange={(e) => setOfficerStatus(e.target.value as 'VERIFIED' | 'PENDING_APPROVAL')}
                    className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold focus:border-blue-600 focus:outline-none"
                  >
                    <option value="VERIFIED">အတည်ပြုပြီး (Verified)</option>
                    <option value="PENDING_APPROVAL">ဆိုင်းငံ့ (Pending)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddOfficerModal(false)}
                  className="min-h-[42px] px-4 py-2 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 py-2 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold"
                >
                  သိမ်းမည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Document Detail Viewer Modal */}
      {activeModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto relative text-slate-900 dark:text-zinc-100">
            <button
              type="button"
              onClick={() => setActiveModalDoc(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 pr-10">
              <p className="text-[11px] font-mono font-bold text-blue-700 dark:text-blue-400">
                {activeModalDoc.refNumber}
              </p>
              <h3 className="text-base font-extrabold">{activeModalDoc.title}</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                {activeModalDoc.date} · {activeModalDoc.sender}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-800 text-xs leading-relaxed whitespace-pre-line font-serif">
              {activeModalDoc.fullText || activeModalDoc.summary}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ type: 'DELETE_DOC', id: activeModalDoc.id, label: activeModalDoc.title })}
                className="min-h-[40px] px-3.5 py-2 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ပယ်ဖျက်မည်</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleShareRecordViber(activeModalDoc)}
                  className="min-h-[40px] px-3.5 py-2 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ဗိုင်ဘာသို့</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalDoc(null)}
                  className="min-h-[40px] px-4 py-2 rounded-2xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 text-xs font-bold"
                >
                  ပိတ်မည်
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Create New Document Modal */}
      {showCreateDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4 text-slate-900 dark:text-zinc-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>မှတ်တမ်းသစ် ထည့်သွင်းခြင်း</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateDocModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">အမျိုးအစား</label>
                <select
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value as DocumentCategory)}
                  className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold focus:border-blue-600 focus:outline-none"
                >
                  <option value="INSPECTION">စစ်ဆေးရေးမှတ်တမ်း</option>
                  <option value="DIRECTIVE">ညွှန်ကြားစာ</option>
                  <option value="INBOUND">ဝင်စာ</option>
                  <option value="OUTBOUND">ထွက်စာ</option>
                  <option value="VISA_VERIFY">စိစစ်ဆဲဗီဇာ/ကတ်</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">ခေါင်းစဉ် / အကြောင်းအရာ *</label>
                <input
                  type="text"
                  required
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">စာအမှတ်</label>
                <input
                  type="text"
                  value={newDocRefNo}
                  onChange={(e) => setNewDocRefNo(e.target.value)}
                  className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">အသေးစိတ် မှတ်စု</label>
                <textarea
                  rows={3}
                  value={newDocSummary}
                  onChange={(e) => setNewDocSummary(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateDocModal(false)}
                  className="min-h-[42px] px-4 py-2 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 py-2 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold"
                >
                  သိမ်းဆည်းမည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
