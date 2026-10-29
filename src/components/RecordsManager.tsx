import React, { useState, useEffect } from 'react';
import { 
  FolderArchive, Search, Plus, Filter, CloudCheck, CloudOff, 
  FileText, Trash2, Calendar, X, Download, Upload, Check, Send, 
  Phone, PhoneCall, Users, CheckCircle2, Clock, MapPin, 
  Building2, ShieldCheck, Mail, MessageCircle, Copy, Info
} from 'lucide-react';
import { DocumentRecord, DocumentCategory, RegisteredOfficer } from '../types';
import { db } from '../services/db';
import { MYANMAR_ADMINISTRATIVE_DATA, getDistricts, getTownships, findTownshipLocationInfo } from '../data/administrativeData';

export const RecordsManager: React.FC = () => {
  // Main Tab Switcher: Documents vs Phonebook
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

  // Notification & File Input
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  // Set default initial location for add officer form
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
    { id: 'INSPECTION', label: 'စစ်ဆေးရေးမှတ်တမ်း' },
    { id: 'VISA_VERIFY', label: 'စိစစ်ဆဲဗီဇာ' }
  ];

  // Filtered Documents
  const filteredRecords = db.searchDocumentsIndexed(docSearchQuery, selectedCategory);

  // Document Handlers
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
    setNewDocSummary('');
    setNotificationMessage('မှတ်တမ်းသစ် အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။');
    setTimeout(() => setNotificationMessage(null), 3000);
  };

  const handleDeleteDocument = (id: string) => {
    if (window.confirm('ဤမှတ်တမ်းအား ပယ်ဖျက်ရန် သေချာပါသလား။')) {
      db.deleteDocument(id);
      reloadData();
      setActiveModalDoc(null);
    }
  };

  const handleClearAllDocuments = () => {
    if (window.confirm('မှတ်တမ်းများ အားလုံးကို ရှင်းလင်းဖျက်ပစ်ရန် သေချာပါသလား။')) {
      db.clearAllDocuments();
      reloadData();
      setNotificationMessage('မှတ်တမ်းများအားလုံး ရှင်းလင်းပြီးပါပြီ။');
      setTimeout(() => setNotificationMessage(null), 3000);
    }
  };

  // Officer Directory Handlers
  const handleSaveOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerName.trim() || !officerPhone.trim()) {
      alert('အရာရှိ အမည်နှင့် ဖုန်းနံပါတ် ဖြည့်သွင်းရန် လိုအပ်ပါသည်။');
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
      approvedBy: officerStatus === 'VERIFIED' ? 'Admin အတည်ပြုပြီး' : undefined
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
    setNotificationMessage(officerStatus === 'VERIFIED' ? 'အရာရှိ အချက်အလက် ထည့်သွင်းအတည်ပြုပြီးပါပြီ။' : 'အရာရှိ အချက်အလက် စာရင်းသွင်းပြီး Admin အတည်ပြုရန် စောင့်ဆိုင်းပါမည်။');
    setTimeout(() => setNotificationMessage(null), 4000);
  };

  const handleDeleteOfficer = (id: string, name: string) => {
    if (window.confirm(`အရာရှိ ${name} ၏ အချက်အလက်အား ဖုန်းစာအုပ်မှ ပယ်ဖျက်ရန် သေချာပါသလား။`)) {
      db.deleteOfficer(id);
      reloadData();
    }
  };

  const handleApproveOfficer = (id: string) => {
    db.approveOfficer(id, 'Admin');
    reloadData();
    setNotificationMessage('အရာရှိအား Admin မှ အတည်ပြုပေးပြီးပါပြီ။');
    setTimeout(() => setNotificationMessage(null), 3000);
  };

  const handleCopyContact = (officer: RegisteredOfficer) => {
    const text = `📌 ${officer.rank} ${officer.name} (${officer.serialNo || 'လဝက'})\nတာဝန်: ${officer.officeName}\nမြို့နယ်: ${officer.townshipNameMM}\nဖုန်း: ${officer.phone}${officer.officePhone ? ` / ${officer.officePhone}` : ''}${officer.email ? `\nအီးမေးလ်: ${officer.email}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(officer.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export Unified App Backup JSON
  const handleExportData = () => {
    const jsonStr = db.exportUnifiedJSONBackup();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonStr);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `goldengate_mm_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Restore Unified App Backup JSON
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
          setNotificationMessage(res.message);
          setTimeout(() => setNotificationMessage(null), 5000);
        } else {
          alert(res.message);
        }
      } catch (err) {
        alert('JSON Backup ဖိုင်အား ဖတ်ရှုရာတွင် မအောင်မြင်ပါ။ ဖိုင်ပုံစံ မှန်ကန်မှု အား စိစစ်ပါ။');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleShareRecordViber = async (doc: DocumentRecord) => {
    const textContent = `📌 ${doc.title}\nစာအမှတ်: ${doc.refNumber}\nရက်စွဲ: ${doc.date}\nပေးပို့သူ: ${doc.sender}\n\n${doc.fullText || doc.summary}`;

    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: doc.title,
          text: textContent
        });
        return;
      } catch (e) {
        // Fallback to Viber URI scheme
      }
    }

    const viberUrl = `viber://forward?text=${encodeURIComponent(textContent)}`;
    window.location.href = viberUrl;
  };

  // Cascading location options for phonebook filter
  const currentDistricts = phoneRegionId !== 'ALL' ? getDistricts(phoneRegionId) : [];
  const currentTownships = (phoneRegionId !== 'ALL' && phoneDistrictId !== 'ALL') 
    ? getTownships(phoneRegionId, phoneDistrictId) 
    : [];

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto w-full max-w-full overflow-x-hidden">
      {/* Toast Notification */}
      {notificationMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2.5 animate-in fade-in shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notificationMessage}</span>
        </div>
      )}

      {/* Hidden File Input for Unified JSON Restore */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleRestoreData}
        accept=".json,application/json"
        className="hidden"
      />

      {/* Primary Section Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setMainTab('PHONEBOOK')}
            className={`px-3.5 py-2 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 ${
              mainTab === 'PHONEBOOK'
                ? 'bg-blue-900 text-white shadow-2xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>ဖုန်းစာအုပ်</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              mainTab === 'PHONEBOOK' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {officers.length}
            </span>
          </button>

          <button
            onClick={() => setMainTab('DOCUMENTS')}
            className={`px-3.5 py-2 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 ${
              mainTab === 'DOCUMENTS'
                ? 'bg-blue-900 text-white shadow-2xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>စာရွက်စာတမ်းများ</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              mainTab === 'DOCUMENTS' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {records.length}
            </span>
          </button>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportData}
            title="JSON Backup ရယူမည်"
            className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-900 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-blue-900" />
            <span className="hidden sm:inline">Backup</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            title="JSON Backup မှ ပြန်လည်ထည့်သွင်းမည်"
            className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-900 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Upload className="w-3.5 h-3.5 text-blue-900" />
            <span className="hidden sm:inline">Restore</span>
          </button>

          {mainTab === 'PHONEBOOK' ? (
            <button
              onClick={() => setShowAddOfficerModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs flex items-center gap-1 transition shadow-sm"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>အရာရှိသစ် ထည့်မည်</span>
            </button>
          ) : (
            <button
              onClick={() => setShowCreateDocModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs flex items-center gap-1 transition shadow-sm"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>မှတ်တမ်းသစ်</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: PHONEBOOK */}
      {mainTab === 'PHONEBOOK' && (
        <div className="space-y-4 animate-in fade-in">

          {/* Location Filters & Search Toolbar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={phoneSearchQuery}
                onChange={(e) => setPhoneSearchQuery(e.target.value)}
                placeholder="အရာရှိ အမည်၊ ရာထူး၊ ကိုယ်ပိုင်အမှတ် သို့မဟုတ် ဖုန်းနံပါတ်ဖြင့် ရှာဖွေပါ..."
                className="w-full bg-slate-50 border border-slate-300 focus:border-blue-900 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none transition shadow-2xs font-medium"
              />
            </div>

            {/* Cascading Location Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* Region Selector */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-600 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-600" />
                  <span>တိုင်းဒေသကြီး / ပြည်နယ်</span>
                </label>
                <select
                  value={phoneRegionId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPhoneRegionId(val);
                    setPhoneDistrictId('ALL');
                    setPhoneTownshipId('ALL');
                  }}
                  className="w-full bg-white text-slate-900 font-bold text-xs rounded-xl px-3 py-2 border border-slate-300 focus:border-blue-900 focus:outline-none"
                >
                  <option value="ALL">တိုင်းဒေသကြီး အားလုံး</option>
                  {MYANMAR_ADMINISTRATIVE_DATA.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nameMM}
                    </option>
                  ))}
                </select>
              </div>

              {/* District Selector */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-600 mb-1">
                  ခရိုင်
                </label>
                <select
                  value={phoneDistrictId}
                  disabled={phoneRegionId === 'ALL'}
                  onChange={(e) => {
                    setPhoneDistrictId(e.target.value);
                    setPhoneTownshipId('ALL');
                  }}
                  className="w-full bg-white text-slate-900 font-bold text-xs rounded-xl px-3 py-2 border border-slate-300 focus:border-blue-900 focus:outline-none disabled:opacity-50"
                >
                  <option value="ALL">ခရိုင် အားလုံး</option>
                  {currentDistricts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nameMM}
                    </option>
                  ))}
                </select>
              </div>

              {/* Township Selector */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-600 mb-1">
                  မြို့နယ်
                </label>
                <select
                  value={phoneTownshipId}
                  disabled={phoneDistrictId === 'ALL'}
                  onChange={(e) => setPhoneTownshipId(e.target.value)}
                  className="w-full bg-white text-slate-900 font-bold text-xs rounded-xl px-3 py-2 border border-slate-300 focus:border-blue-900 focus:outline-none disabled:opacity-50"
                >
                  <option value="ALL">မြို့နယ် အားလုံး</option>
                  {currentTownships.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nameMM}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Officers Cards List */}
          <div className="space-y-3">
            {officers.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 space-y-2">
                <Users className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600 font-bold">ရွေးချယ်ထားသော တည်နေရာတွင် စာရင်းသွင်းထားသည့် အရာရှိ မတွေ့ရှိပါ။</p>
                <p className="text-[11px] text-slate-400">အပေါ်ရှိ "အရာရှိသစ် ထည့်မည်" ခလုတ်ဖြင့် စာရင်းအသစ် ထည့်သွင်းနိုင်ပါသည်။</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {officers.map((off) => (
                  <div
                    key={off.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-800 transition shadow-2xs space-y-3"
                  >
                    {/* Header: Rank, Name & Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-950 text-xs shrink-0">
                          {off.name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-300">
                              {off.rank}
                            </span>
                            {off.serialNo && (
                              <span className="text-[10px] font-mono font-bold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                {off.serialNo}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
                            {off.name}
                          </h4>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {off.status === 'VERIFIED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Admin အတည်ပြုပြီး</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>အတည်ပြုရန်ဆိုင်းငံ့</span>
                        </span>
                      )}
                    </div>

                    {/* Department / Office & Location */}
                    <div className="space-y-1 text-xs text-slate-700">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Building2 className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                        <span className="line-clamp-1">{off.officeName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{off.townshipNameMM}</span>
                        {off.notes && (
                          <span className="text-slate-400">· {off.notes}</span>
                        )}
                      </div>
                    </div>

                    {/* Phone Numbers and Contact Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${off.phone}`}
                          className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-2xs transition"
                          title="တိုက်ရိုက် ဖုန်းခေါ်ဆိုမည်"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>{off.phone}</span>
                        </a>

                        {/* Viber forward/chat fallback */}
                        <a
                          href={`viber://chat?number=${encodeURIComponent(off.viberNumber || off.phone)}`}
                          className="p-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-200 transition"
                          title="Viber ဖြင့် ဆက်သွယ်မည်"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </a>

                        {off.email && (
                          <a
                            href={`mailto:${off.email}`}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                            title="အီးမေးလ် ပေးပို့မည်"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleCopyContact(off)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                          title="အချက်အလက် ကူးယူမည်"
                        >
                          {copiedId === off.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Admin Approve / Delete */}
                      <div className="flex items-center gap-1">
                        {off.status === 'PENDING_APPROVAL' && (
                          <button
                            type="button"
                            onClick={() => handleApproveOfficer(off.id)}
                            className="px-2.5 py-1 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-[11px] font-bold"
                          >
                            အတည်ပြုမည်
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteOfficer(off.id, off.name)}
                          className="text-slate-400 hover:text-rose-600 p-1 text-xs"
                          title="ဖျက်ပစ်မည်"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DOCUMENTS (စာရွက်စာတမ်း မှတ်တမ်းများ - No Ghost Data) */}
      {mainTab === 'DOCUMENTS' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-blue-900" />
                <span>စာရွက်စာတမ်း မှတ်တမ်းများ</span>
              </h2>
            </div>

            {records.length > 0 && (
              <button
                onClick={handleClearAllDocuments}
                className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-700" />
                <span>မှတ်တမ်းအားလုံး ရှင်းလင်းမည်</span>
              </button>
            )}
          </div>

          {/* Search & Category Filter Section */}
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={docSearchQuery}
                onChange={(e) => setDocSearchQuery(e.target.value)}
                placeholder="စာအမှတ် သို့မဟုတ် ခေါင်းစဉ်ဖြင့် ရှာဖွေပါ..."
                className="w-full bg-white border border-slate-300 focus:border-blue-900 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none transition shadow-2xs font-medium"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-blue-900 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Document Records List Grid */}
          <div className="space-y-2.5">
            {filteredRecords.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 space-y-2">
                <FolderArchive className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-xs font-bold text-slate-600">သိမ်းဆည်းထားသော မှတ်တမ်း မရှိသေးပါ</h4>
              </div>
            ) : (
              filteredRecords.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setActiveModalDoc(doc)}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-900 transition cursor-pointer space-y-2 group shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-950 font-mono font-bold text-[10px] border border-blue-200">
                          {doc.refNumber}
                        </span>
                        <span className="text-[10px] text-slate-600 font-bold">
                          {doc.category === 'DIRECTIVE' ? 'ညွှန်ကြားစာ' : doc.category === 'INSPECTION' ? 'စစ်ဆေးရေး' : doc.category === 'INBOUND' ? 'ဝင်စာ' : 'ထွက်စာ'}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-900 transition line-clamp-1">
                        {doc.title}
                      </h3>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                      doc.syncStatus === 'SYNCED'
                        ? 'bg-blue-50 border-blue-200 text-blue-950'
                        : 'bg-slate-100 border-slate-300 text-slate-800'
                    }`}>
                      {doc.syncStatus === 'SYNCED' ? <CloudCheck className="w-3 h-3 text-blue-800" /> : <CloudOff className="w-3 h-3 text-slate-600" />}
                      <span>{doc.syncStatus === 'SYNCED' ? 'Synced' : 'Pending'}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                    {doc.summary}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100 font-bold">
                    <span>ပေးပို့သူ: {doc.sender}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {doc.date}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: Add Registered Officer Modal */}
      {showAddOfficerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-5 shadow-2xl space-y-4 text-slate-900 max-h-[90vh] overflow-y-auto relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-900" />
                <span>လဝက အရာရှိသစ် အဆိုပြု/စာရင်းသွင်းခြင်း</span>
              </h3>
              <button onClick={() => setShowAddOfficerModal(false)} className="text-slate-400 hover:text-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOfficer} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  အရာရှိ အမည် *
                </label>
                <input
                  type="text"
                  required
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  placeholder=""
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-blue-900 focus:outline-none"
                />
              </div>

              {/* Rank & Serial Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      ရာထူး
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomRank(!isCustomRank)}
                      className="text-[10px] font-extrabold text-blue-900 hover:underline"
                    >
                      {isCustomRank ? '✓ Preset ရာထူးမှ ရွေးမည်' : '+ စိတ်ကြိုက် ရာထူး'}
                    </button>
                  </div>

                  {!isCustomRank ? (
                    <select
                      value={officerRank}
                      onChange={(e) => {
                        if (e.target.value === 'CUSTOM') {
                          setIsCustomRank(true);
                        } else {
                          setOfficerRank(e.target.value);
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-slate-900 font-bold focus:border-blue-900 focus:outline-none text-xs"
                    >
                      <option value="ဦးစီးအရာရှိ">ဦးစီးအရာရှိ</option>
                      <option value="လူဝင်မှုကြီးကြပ်ရေးမှူး">လူဝင်မှုကြီးကြပ်ရေးမှူး</option>
                      <option value="ဒုတိယလူဝင်မှုကြီးကြပ်ရေးမှူး">ဒုတိယလူဝင်မှုကြီးကြပ်ရေးမှူး</option>
                      <option value="လက်ထောက်လူဝင်မှုကြီးကြပ်ရေးမှူး">လက်ထောက်လူဝင်မှုကြီးကြပ်ရေးမှူး</option>
                      <option value="အမှုတွဲထိန်း (Record Keeper)">အမှုတွဲထိန်း (Record Keeper)</option>
                      <option value="အစောင့် (Guard) / ရုံးအကူ">အစောင့် (Guard) / ရုံးအကူ</option>
                      <option value="CUSTOM">+ စိတ်ကြိုက် ရာထူး ရိုက်ထည့်မည်</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={customRank}
                      onChange={(e) => setCustomRank(e.target.value)}
                      placeholder="စိတ်ကြိုက် ရာထူး ရိုက်ထည့်ပါ..."
                      className="w-full bg-slate-50 border border-blue-900 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none text-xs"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ကိုယ်ပိုင်အမှတ်
                  </label>
                  <input
                    type="text"
                    value={officerSerialNo}
                    onChange={(e) => setOfficerSerialNo(e.target.value)}
                    placeholder=""
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-blue-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Duty / Assignment (Positioned directly below Rank) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    တာဝန် (လက်ရှိတာဝန်)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomDuty(!isCustomDuty)}
                    className="text-[10px] font-extrabold text-blue-900 hover:underline"
                  >
                    {isCustomDuty ? '✓ Preset တာဝန်မှ ရွေးမည်' : '+ စိတ်ကြိုက် တာဝန်'}
                  </button>
                </div>

                {!isCustomDuty ? (
                  <select
                    value={officerDuty}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM') {
                        setIsCustomDuty(true);
                      } else {
                        setOfficerDuty(e.target.value);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-slate-900 font-bold focus:border-blue-900 focus:outline-none text-xs"
                  >
                    <option value="မြို့နယ်ဦးစီးမှူး">မြို့နယ်ဦးစီးမှူး</option>
                    <option value="တိုက်နယ်မှူး">တိုက်နယ်မှူး</option>
                    <option value="အမှုတွဲထိန်း">အမှုတွဲထိန်း</option>
                    <option value="CUSTOM">+ စိတ်ကြိုက် တာဝန် ရိုက်ထည့်မည်</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={customDuty}
                    onChange={(e) => setCustomDuty(e.target.value)}
                    placeholder="စိတ်ကြိုက် တာဝန် ရိုက်ထည့်ပါ..."
                    className="w-full bg-slate-50 border border-blue-900 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none text-xs"
                  />
                )}
              </div>

              {/* Location Selection: Region (Required) -> District (Optional) -> Township (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    တိုင်းဒေသကြီး / ပြည်နယ် *
                  </label>
                  <select
                    value={officerRegionId}
                    onChange={(e) => {
                      const regId = e.target.value;
                      setOfficerRegionId(regId);
                      setOfficerDistrictId('');
                      setOfficerTownshipId('');
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-slate-900 font-bold focus:border-blue-900 focus:outline-none text-xs"
                  >
                    {MYANMAR_ADMINISTRATIVE_DATA.map((r) => (
                      <option key={r.id} value={r.id}>{r.nameMM}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ခရိုင် (အဆင့်အထိ)
                  </label>
                  <select
                    value={officerDistrictId}
                    onChange={(e) => {
                      const distId = e.target.value;
                      setOfficerDistrictId(distId);
                      setOfficerTownshipId('');
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-slate-900 font-bold focus:border-blue-900 focus:outline-none text-xs"
                  >
                    <option value="">မရွေးချယ်ပါ (တိုင်းရုံး ဝန်ထမ်း)</option>
                    {getDistricts(officerRegionId).map((d) => (
                      <option key={d.id} value={d.id}>{d.nameMM}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    မြို့နယ် (အဆင့်အထိ)
                  </label>
                  <select
                    value={officerTownshipId}
                    disabled={!officerDistrictId}
                    onChange={(e) => setOfficerTownshipId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-slate-900 font-bold focus:border-blue-900 focus:outline-none text-xs disabled:opacity-50"
                  >
                    <option value="">မရွေးချယ်ပါ (ခရိုင်ရုံး ဝန်ထမ်း)</option>
                    {officerDistrictId && getTownships(officerRegionId, officerDistrictId).map((t) => (
                      <option key={t.id} value={t.id}>{t.nameMM}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phone Numbers */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ဖုန်းနံပါတ် *
                  </label>
                  <input
                    type="tel"
                    required
                    value={officerPhone}
                    onChange={(e) => setOfficerPhone(e.target.value)}
                    placeholder=""
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-blue-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ရုံးဖုန်း (ရှိပါက)
                  </label>
                  <input
                    type="text"
                    value={officerOfficePhone}
                    onChange={(e) => setOfficerOfficePhone(e.target.value)}
                    placeholder=""
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-blue-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  အီးမေးလ် (ရှိပါက)
                </label>
                <input
                  type="email"
                  value={officerEmail}
                  onChange={(e) => setOfficerEmail(e.target.value)}
                  placeholder=""
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  အတည်ပြုမှု အဆင့်အတန်း
                </label>
                <select
                  value={officerStatus}
                  onChange={(e) => setOfficerStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-blue-900 focus:outline-none"
                >
                  <option value="VERIFIED">✓ Admin အတည်ပြုပြီး (Verified)</option>
                  <option value="PENDING_APPROVAL">စောင့်ဆိုင်းဆဲ (Pending Admin Approval)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddOfficerModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold border border-slate-200"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-900 text-white font-bold hover:bg-blue-800 shadow-xs"
                >
                  ဖုန်းစာအုပ်တွင် သိမ်းမည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Document Detail Viewer Modal */}
      {activeModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto relative text-slate-900">
            <button
              onClick={() => setActiveModalDoc(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-950 font-mono text-[10px] font-extrabold border border-blue-200">
                {activeModalDoc.refNumber}
              </span>
              <h3 className="text-base font-bold text-slate-900 pr-6">
                {activeModalDoc.title}
              </h3>
              <p className="text-xs text-slate-500 font-bold">
                ရက်စွဲ: {activeModalDoc.date} · {activeModalDoc.sender}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-line font-serif font-medium">
              {activeModalDoc.fullText || activeModalDoc.summary}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleDeleteDocument(activeModalDoc.id)}
                className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100 text-xs font-bold flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ပယ်ဖျက်မည်</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShareRecordViber(activeModalDoc)}
                  className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition"
                  title="Viber သို့ တိုက်ရိုက် ပို့မည်"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                  <span>ဗိုင်ဘာသို့ ပို့မည်</span>
                </button>
                <button
                  onClick={() => setActiveModalDoc(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-5 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-900" />
                <span>မှတ်တမ်းသစ် ထည့်သွင်းခြင်း</span>
              </h3>
              <button onClick={() => setShowCreateDocModal(false)} className="text-slate-400 hover:text-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  အမျိုးအစား
                </label>
                <select
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value as DocumentCategory)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:border-blue-900 focus:outline-none"
                >
                  <option value="INSPECTION">စစ်ဆေးရေးမှတ်တမ်း</option>
                  <option value="DIRECTIVE">ညွှန်ကြားစာ</option>
                  <option value="INBOUND">ဝင်စာ</option>
                  <option value="OUTBOUND">ထွက်စာ</option>
                  <option value="VISA_VERIFY">စိစစ်ဆဲဗီဇာ/ကတ်</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ခေါင်းစဉ် / အကြောင်းအရာ
                </label>
                <input
                  type="text"
                  required
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="ခေါင်းစဉ် ရိုက်ထည့်ပါ..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:border-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  စာအမှတ်
                </label>
                <input
                  type="text"
                  value={newDocRefNo}
                  onChange={(e) => setNewDocRefNo(e.target.value)}
                  placeholder="စာအမှတ် ရိုက်ထည့်ပါ..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:border-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  အသေးစိတ် အကြောင်းအရာ မှတ်စု
                </label>
                <textarea
                  rows={3}
                  value={newDocSummary}
                  onChange={(e) => setNewDocSummary(e.target.value)}
                  placeholder="စစ်ဆေးတွေ့ရှိချက်များ သို့မဟုတ် ညွှန်ကြားချက်များ ရိုက်ထည့်ပါ..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:border-blue-900 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateDocModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold border border-slate-200"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-900 text-white font-bold hover:bg-blue-800 shadow-xs"
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
