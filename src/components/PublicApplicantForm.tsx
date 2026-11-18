import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  FileText,
  Upload,
  Camera,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  X
} from 'lucide-react';
import { ApplicationLink, ApplicationSubmission, ApplicationType } from '../types';
import { db } from '../services/db';

interface PublicApplicantFormProps {
  token: string;
  onBackToApp?: () => void;
}

// Compress uploaded images to fit reliably under Firestore document size limits
function compressImageToDataUrl(file: File, maxDim = 900, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('File read error'));
    reader.onload = (ev) => {
      const rawUrl = ev.target?.result as string;
      const img = new Image();
      img.onerror = () => resolve(rawUrl);
      img.onload = () => {
        const encode = (dim: number, q: number): string => {
          const scale = Math.min(1, dim / Math.max(img.width, img.height));
          const width = Math.max(1, Math.round(img.width * scale));
          const height = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return rawUrl;
          ctx.drawImage(img, 0, 0, width, height);
          return canvas.toDataURL('image/jpeg', q);
        };
        let out = encode(maxDim, quality);
        if (out.length > 320000) {
          out = encode(680, 0.56);
        }
        resolve(out);
      };
      img.src = rawUrl;
    };
    reader.readAsDataURL(file);
  });
}

export const PublicApplicantForm: React.FC<PublicApplicantFormProps> = ({ token, onBackToApp }) => {
  const [linkConfig, setLinkConfig] = useState<ApplicationLink | null>(null);
  const [linkLoading, setLinkLoading] = useState<boolean>(true);
  const [appType, setAppType] = useState<ApplicationType>('NRC_APP');
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedResult, setSubmittedResult] = useState<ApplicationSubmission | null>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Input States
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantNrc, setApplicantNrc] = useState('');
  const [applicantAddress, setApplicantAddress] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [ethnicityReligion, setEthnicityReligion] = useState('');

  // Application Specific States
  const [nrcSubCategory, setNrcSubCategory] = useState<'10_YEAR' | '18_YEAR' | 'REPLACEMENT' | 'NEW'>('10_YEAR');
  const [householdListNo, setHouseholdListNo] = useState('');
  const [deceasedPersonName, setDeceasedPersonName] = useState('');
  const [dateOfDeath, setDateOfDeath] = useState('');
  const [causeOfDeath, setCauseOfDeath] = useState('');
  const [childName, setChildName] = useState('');
  const [childDob, setChildDob] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');

  const [attachments, setAttachments] = useState<{ title: string; dataUrl: string }[]>([]);

  useEffect(() => {
    let active = true;
    if (!token) {
      setLinkLoading(false);
      return;
    }
    db.fetchApplicationLinkByTokenAsync(token)
      .then((config) => {
        if (!active) return;
        if (config) {
          setLinkConfig(config);
          setAppType(config.applicationType);
        }
      })
      .finally(() => {
        if (active) setLinkLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, title: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormError(null);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setAttachments((prev) => [...prev.filter((a) => a.title !== title), { title, dataUrl }]);
    } catch {
      setFormError('ဓာတ်ပုံ ဖတ်ရှုရာတွင် အမှားအယွင်းရှိပါသည်။ ထပ်မံရွေးချယ်ပါ။');
    }
  };

  const removeAttachment = (title: string) => {
    setAttachments((prev) => prev.filter((a) => a.title !== title));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!linkConfig || linkConfig.status !== 'ACTIVE') {
      setFormError('ဤလျှောက်လွှာလင့်ခ်သည် အကျုံးမဝင်တော့ပါ သို့မဟုတ် ပိတ်သိမ်းပြီးဖြစ်ပါသည်။');
      return;
    }

    if (!applicantName.trim() || !applicantPhone.trim()) {
      setFormError('ကျေးဇူးပြု၍ လျှောက်ထားသူ အမည်နှင့် ဖုန်းနံပါတ် အပြည့်အစုံ ဖြည့်သွင်းပါ။');
      setStep(1);
      return;
    }

    setSubmitting(true);
    try {
      const newSub = await db.submitApplicationAsync({
        linkToken: linkConfig.token,
        officerId: linkConfig.officerId,
        officerEmail: linkConfig.officerEmail || '',
        applicationType: appType,
        applicantName: applicantName.trim(),
        applicantPhone: applicantPhone.trim(),
        applicantNrc: applicantNrc.trim(),
        applicantAddress: applicantAddress.trim(),
        fatherName: fatherName.trim(),
        motherName: motherName.trim(),
        dob,
        gender,
        ethnicityReligion,
        nrcSubCategory,
        householdListNo,
        deceasedPersonName,
        dateOfDeath,
        causeOfDeath,
        childName,
        childDob,
        placeOfBirth,
        attachments
      });
      setSubmittedResult(newSub);
    } catch {
      setFormError('လျှောက်လွှာ တင်သွင်းရာတွင် အခက်အခဲရှိနေပါသည်။ အင်တာနက် သို့မဟုတ် လင့်ခ်အခြေအနေကို စစ်ဆေး၍ ထပ်မံကြိုးစားပါ။');
    } finally {
      setSubmitting(false);
    }
  };

  const getTitleMM = (type: ApplicationType) => {
    switch (type) {
      case 'NRC_APP':
        return 'နိုင်ငံသားစိစစ်ရေးကတ်ပြား လျှောက်ထားခြင်း';
      case 'HOUSEHOLD_APP':
        return 'အိမ်ထောင်စုလူဦးရေစာရင်း လျှောက်ထားခြင်း (ပုံစံ ၆၆/၆)';
      case 'DECEASED_REMOVAL':
        return 'အိမ်ထောင်စုစာရင်းမှ သေဆုံးသူ ပယ်ဖျက်ခြင်း';
      case 'BIRTH_ADDITION':
        return 'အိမ်ထောင်စုစာရင်းသို့ မွေးဖွားသူ ထည့်သွင်းခြင်း';
      default:
        return 'လူဝင်မှုကြီးကြပ်ရေး လျှောက်လွှာတင်ခြင်း';
    }
  };

  if (linkLoading) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] dark:bg-black flex items-center justify-center p-6">
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">လျှောက်လွှာဖောင် ဖွင့်လှစ်နေပါသည်...</p>
      </div>
    );
  }

  const isExpired = Boolean(
    linkConfig?.expiresAt && !Number.isNaN(Date.parse(linkConfig.expiresAt)) && Date.parse(linkConfig.expiresAt) < Date.now()
  );

  if (!linkConfig || linkConfig.status !== 'ACTIVE' || isExpired) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] dark:bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md ios-grouped-card p-6 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {!linkConfig
              ? 'လျှောက်လွှာလင့်ခ် မတွေ့ရှိပါ'
              : isExpired
              ? 'လျှောက်လွှာလင့်ခ် သက်တမ်းကုန်ဆုံးသွားပါပြီ'
              : 'လျှောက်လွှာလင့်ခ် ပိတ်သိမ်းထားပါသည်'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {!linkConfig
              ? `ဤလျှောက်လွှာလင့်ခ် (${token}) သည် မမှန်ကန်ပါ သို့မဟုတ် ပယ်ဖျက်ထားပြီး ဖြစ်နိုင်ပါသည်။ သက်ဆိုင်ရာ လဝက အရာရှိထံမှ လင့်ခ်အသစ် ပြန်လည်တောင်းခံပါ။`
              : `ဤလျှောက်လွှာလင့်ခ် (${token}) အား အသုံးပြု၍ မရတော့ပါ။ သက်ဆိုင်ရာ အရာရှိထံ ဆက်သွယ်ပါ။`}
          </p>
          {onBackToApp && (
            <button
              type="button"
              onClick={onBackToApp}
              className="w-full min-h-[44px] py-2.5 rounded-2xl bg-[#0055D4] text-white font-semibold text-xs ios-press cursor-pointer"
            >
              ပြန်ထွက်မည်
            </button>
          )}
        </div>
      </div>
    );
  }

  if (submittedResult) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] dark:bg-black p-4 flex items-center justify-center">
        <div className="w-full max-w-md ios-grouped-card p-6 space-y-5 text-slate-900 dark:text-slate-100">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center mx-auto text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              လျှောက်လွှာ အောင်မြင်စွာ တင်သွင်းပြီးပါပြီ
            </p>
            <h2 className="text-lg font-extrabold">{getTitleMM(submittedResult.applicationType)}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              တာဝန်ခံ အရာရှိထံသို့ တိုက်ရိုက် ပေးပို့စိစစ်လျက် ရှိပါသည်
            </p>
          </div>

          <div className="divide-y divide-slate-200/70 dark:divide-white/10 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 text-xs">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-slate-500 dark:text-slate-400">လျှောက်လွှာ ကုတ်အမှတ်</span>
              <div className="flex items-center gap-1.5 font-mono font-bold text-[#0055D4] dark:text-blue-400 tabular-nums">
                <span>{submittedResult.submissionRef}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(submittedResult.submissionRef);
                    setCopiedRef(true);
                    setTimeout(() => setCopiedRef(false), 2000);
                  }}
                  className="p-1"
                >
                  {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-slate-500 dark:text-slate-400">လျှောက်ထားသူ</span>
              <span className="font-semibold">{submittedResult.applicantName}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-slate-500 dark:text-slate-400">ဆက်သွယ်ရန် ဖုန်း</span>
              <span className="font-mono tabular-nums">{submittedResult.applicantPhone}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-slate-500 dark:text-slate-400">တာဝန်ခံ အရာရှိ</span>
              <span className="font-semibold">{linkConfig?.officerName || 'တာဝန်ခံ အရာရှိ'}</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-center">
            လျှောက်လွှာ စိစစ်ပြီးပါက တာဝန်ခံ အရာရှိမှ ဖုန်း သို့မဟုတ် Viber မှတစ်ဆင့် ဆက်သွယ် အကြောင်းကြားပေးမည် ဖြစ်ပါသည်။
          </p>

          {onBackToApp && (
            <button
              type="button"
              onClick={onBackToApp}
              className="w-full min-h-[44px] py-3 rounded-2xl bg-[#0055D4] text-white font-bold text-xs ios-press"
            >
              Golden Gate MM သို့ ပြန်သွားမည်
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black py-6 px-3 sm:px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl ios-grouped-card overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Clean Native Header */}
        <div className="bg-gradient-to-br from-[#0A2E6E] to-[#0055D4] p-5 text-white space-y-2 relative">
          {onBackToApp && (
            <button
              type="button"
              onClick={onBackToApp}
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs inline-flex items-center gap-1 font-semibold mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ပြန်ထွက်မည်</span>
            </button>
          )}

          <p className="text-[11px] font-medium text-blue-100 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>လူဝင်မှုကြီးကြပ်ရေး ဦးစီးဌာန · တရားဝင် လျှောက်လွှာပုံစံ</span>
          </p>

          <h1 className="text-base sm:text-lg font-extrabold tracking-tight">
            {getTitleMM(appType)}
          </h1>

          <p className="text-[11px] text-blue-100/90 font-medium">
            {linkConfig?.townshipName || 'မြို့နယ်ဦးစီးမှူးရုံး'} · တာဝန်ခံ {linkConfig?.officerName || 'အရာရှိ'}
          </p>
        </div>

        {/* iOS Segmented Progress Bar */}
        <div className="p-3 bg-slate-100/80 dark:bg-white/5 border-b border-slate-200/70 dark:border-white/10 grid grid-cols-3 gap-1.5 text-[11px] font-semibold">
          <div className={`py-2 px-2 rounded-xl text-center ${step === 1 ? 'bg-white dark:bg-[#2C2C2E] text-slate-900 dark:text-white shadow-xs font-bold' : 'text-slate-500'}`}>
            ၁။ ကိုယ်ရေးအချက်အလက်
          </div>
          <div className={`py-2 px-2 rounded-xl text-center ${step === 2 ? 'bg-white dark:bg-[#2C2C2E] text-slate-900 dark:text-white shadow-xs font-bold' : 'text-slate-500'}`}>
            ၂။ အသေးစိတ်
          </div>
          <div className={`py-2 px-2 rounded-xl text-center ${step === 3 ? 'bg-white dark:bg-[#2C2C2E] text-slate-900 dark:text-white shadow-xs font-bold' : 'text-slate-500'}`}>
            ၃။ စာရွက်စာတမ်း
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {formError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {linkConfig?.customNote && (
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-800/50 text-blue-950 dark:text-blue-200 text-xs">
              {linkConfig.customNote}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  လျှောက်ထားသူ အမည် *
                </label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full min-h-[44px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 font-semibold focus:border-[#0055D4] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ဆက်သွယ်ရန် ဖုန်းနံပါတ် *
                  </label>
                  <input
                    type="tel"
                    required
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    placeholder="09..."
                    className="w-full min-h-[44px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 font-mono focus:border-[#0055D4] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    မွေးသက္ကရာဇ်
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full min-h-[44px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 focus:border-[#0055D4] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    အဖအမည် *
                  </label>
                  <input
                    type="text"
                    required
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="w-full min-h-[44px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 focus:border-[#0055D4] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    အမိအမည် *
                  </label>
                  <input
                    type="text"
                    required
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    className="w-full min-h-[44px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 focus:border-[#0055D4] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  လက်ရှိ နေရပ်လိပ်စာ *
                </label>
                <textarea
                  rows={2}
                  required
                  value={applicantAddress}
                  onChange={(e) => setApplicantAddress(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 focus:border-[#0055D4] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ကျား / မ
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE')}
                    className="w-full min-h-[44px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 focus:border-[#0055D4] focus:outline-none"
                  >
                    <option value="MALE">ကျား</option>
                    <option value="FEMALE">မ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    လူမျိုး / ဘာသာ
                  </label>
                  <input
                    type="text"
                    value={ethnicityReligion}
                    onChange={(e) => setEthnicityReligion(e.target.value)}
                    className="w-full min-h-[44px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 focus:border-[#0055D4] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-[#0055D4] text-white font-bold text-xs flex items-center gap-1.5 ios-press cursor-pointer"
                >
                  <span>နောက်တစ်ဆင့်</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {appType === 'NRC_APP' && (
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10">
                  <div>
                    <label className="block text-xs font-semibold mb-1">မှတ်ပုံတင် လျှောက်ထားသည့် အမျိုးအစား</label>
                    <select
                      value={nrcSubCategory}
                      onChange={(e) => setNrcSubCategory(e.target.value as '10_YEAR' | '18_YEAR' | 'REPLACEMENT' | 'NEW')}
                      className="w-full min-h-[44px] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 font-semibold focus:border-[#0055D4] focus:outline-none"
                    >
                      <option value="10_YEAR">၁၀ နှစ်ပြည့် နိုင်ငံသားစိစစ်ရေးကတ်</option>
                      <option value="18_YEAR">၁၈ နှစ်ပြည့် နိုင်ငံသားစိစစ်ရေးကတ် လဲလှယ်ခြင်း</option>
                      <option value="REPLACEMENT">ပျက်စီး / ပျောက်ဆုံး လဲလှယ်ခြင်း</option>
                      <option value="NEW">အသစ် လျှောက်ထားခြင်း</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">လက်ရှိ မှတ်ပုံတင်အမှတ် (ရှိပါက)</label>
                    <input
                      type="text"
                      value={applicantNrc}
                      onChange={(e) => setApplicantNrc(e.target.value)}
                      className="w-full min-h-[44px] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 focus:border-[#0055D4] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {(appType === 'HOUSEHOLD_APP' || appType === 'DECEASED_REMOVAL' || appType === 'BIRTH_ADDITION') && (
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10">
                  <div>
                    <label className="block text-xs font-semibold mb-1">အိမ်ထောင်စု လူဦးရေစာရင်း အမှတ် (ပုံစံ ၆၆/၆) *</label>
                    <input
                      type="text"
                      required
                      value={householdListNo}
                      onChange={(e) => setHouseholdListNo(e.target.value)}
                      className="w-full min-h-[44px] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 focus:border-[#0055D4] focus:outline-none"
                    />
                  </div>

                  {appType === 'DECEASED_REMOVAL' && (
                    <div className="space-y-3 pt-2 border-t border-slate-200/70 dark:border-white/10">
                      <div>
                        <label className="block text-xs font-semibold mb-1">သေဆုံးသူ၏ အမည် *</label>
                        <input
                          type="text"
                          required
                          value={deceasedPersonName}
                          onChange={(e) => setDeceasedPersonName(e.target.value)}
                          className="w-full min-h-[44px] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 focus:border-[#0055D4] focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold mb-1">သေဆုံးသည့် ရက်စွဲ *</label>
                          <input
                            type="date"
                            required
                            value={dateOfDeath}
                            onChange={(e) => setDateOfDeath(e.target.value)}
                            className="w-full min-h-[44px] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 focus:border-[#0055D4] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">သေဆုံးသည့် အကြောင်းအရင်း</label>
                          <input
                            type="text"
                            value={causeOfDeath}
                            onChange={(e) => setCauseOfDeath(e.target.value)}
                            className="w-full min-h-[44px] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 focus:border-[#0055D4] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {appType === 'BIRTH_ADDITION' && (
                    <div className="space-y-3 pt-2 border-t border-slate-200/70 dark:border-white/10">
                      <div>
                        <label className="block text-xs font-semibold mb-1">မွေးဖွားသူ ကလေးအမည် *</label>
                        <input
                          type="text"
                          required
                          value={childName}
                          onChange={(e) => setChildName(e.target.value)}
                          className="w-full min-h-[44px] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 focus:border-[#0055D4] focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold mb-1">မွေးဖွားသည့် ရက်စွဲ *</label>
                          <input
                            type="date"
                            required
                            value={childDob}
                            onChange={(e) => setChildDob(e.target.value)}
                            className="w-full min-h-[44px] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 focus:border-[#0055D4] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">မွေးဖွားသည့် နေရာ / ဆေးရုံ</label>
                          <input
                            type="text"
                            value={placeOfBirth}
                            onChange={(e) => setPlaceOfBirth(e.target.value)}
                            className="w-full min-h-[44px] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 focus:border-[#0055D4] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>ရှေ့သို့</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-[#0055D4] text-white font-bold text-xs flex items-center gap-1.5 ios-press cursor-pointer"
                >
                  <span>နောက်တစ်ဆင့်</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'လျှောက်ထားသူဓာတ်ပုံ', label: '၁။ လျှောက်ထားသူ ဓာတ်ပုံ', icon: Camera },
                  { key: 'အိမ်ထောင်စုဇယား', label: '၂။ အိမ်ထောင်စုဇယား (၆၆/၆)', icon: Upload },
                  { key: 'ရပ်ကွက်ထောက်ခံစာ', label: '၃။ ရပ်ကွက်ထောက်ခံစာ', icon: Upload },
                  {
                    key: 'အခြားစာရွက်စာတမ်း',
                    label:
                      appType === 'DECEASED_REMOVAL'
                        ? '၄။ သေစာရင်း (ရှိပါက)'
                        : appType === 'BIRTH_ADDITION'
                        ? '၄။ မွေးစာရင်း (ရှိပါက)'
                        : '၄။ အခြားထောက်ခံချက်',
                    icon: FileText
                  }
                ].map((slot) => {
                  const Icon = slot.icon;
                  const existingAtt = attachments.find((a) => a.title === slot.key);
                  return (
                    <div
                      key={slot.key}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 space-y-2"
                    >
                      <span className="text-xs font-bold block">{slot.label}</span>
                      {existingAtt ? (
                        <div className="rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>ပူးတွဲပြီး</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(slot.key)}
                            className="text-rose-600 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="min-h-[44px] flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-300 dark:border-white/20 hover:border-[#0055D4] bg-white dark:bg-[#1C1C1E] cursor-pointer transition">
                          <Icon className="w-4 h-4 text-slate-500" />
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">ပုံရွေးမည်</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, slot.key)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>

              <label className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 w-4 h-4 accent-[#0055D4] rounded cursor-pointer"
                />
                <span className="text-[11px] leading-relaxed font-semibold text-slate-700 dark:text-slate-300">
                  အထက်ဖော်ပြပါ အချက်အလက်များနှင့် ပူးတွဲတင်ပြထားသော စာရွက်စာတမ်းများသည် အမှန်တကယ် မှန်ကန်ကြောင်း ကတိပြုပါသည်။
                </span>
              </label>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>ရှေ့သို့</span>
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="min-h-[44px] px-6 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 ios-press cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? 'တင်သွင်းနေပါသည်...' : 'လျှောက်လွှာ တင်သွင်းမည်'}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
