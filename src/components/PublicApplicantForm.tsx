import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, FileText, Upload, Camera, ShieldCheck, 
  MapPin, Phone, User as UserIcon, Calendar, AlertCircle, 
  Building2, ArrowRight, ArrowLeft, Copy, Check, Download, Users, X
} from 'lucide-react';
import { ApplicationLink, ApplicationSubmission, ApplicationType } from '../types';
import { db } from '../services/db';

interface PublicApplicantFormProps {
  token: string;
  onBackToApp?: () => void;
}

export const PublicApplicantForm: React.FC<PublicApplicantFormProps> = ({ token, onBackToApp }) => {
  const [linkConfig, setLinkConfig] = useState<ApplicationLink | null>(null);
  const [appType, setAppType] = useState<ApplicationType>('NRC_APP');
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedResult, setSubmittedResult] = useState<ApplicationSubmission | null>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  // Form Input States
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantNrc, setApplicantNrc] = useState('');
  const [applicantAddress, setApplicantAddress] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [bloodGroup, setBloodGroup] = useState('');
  const [ethnicityReligion, setEthnicityReligion] = useState('ဗမာ / ဗုဒ္ဓ');

  // Application Specific States
  const [nrcSubCategory, setNrcSubCategory] = useState<'10_YEAR' | '18_YEAR' | 'REPLACEMENT' | 'NEW'>('10_YEAR');
  const [householdListNo, setHouseholdListNo] = useState('');
  const [deceasedPersonName, setDeceasedPersonName] = useState('');
  const [dateOfDeath, setDateOfDeath] = useState('');
  const [causeOfDeath, setCauseOfDeath] = useState('');
  const [childName, setChildName] = useState('');
  const [childDob, setChildDob] = useState('');
  const [childGender, setChildGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [placeOfBirth, setPlaceOfBirth] = useState('');

  // Uploaded Attachment Base64s
  const [attachments, setAttachments] = useState<{ title: string; dataUrl: string }[]>([]);

  useEffect(() => {
    if (token) {
      const config = db.getApplicationLinkByToken(token);
      if (config) {
        setLinkConfig(config);
        setAppType(config.applicationType);
      }
    }
  }, [token]);

  // Handle Photo Attachment Selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, title: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setAttachments(prev => [
          ...prev.filter(a => a.title !== title),
          { title, dataUrl }
        ]);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = (title: string) => {
    setAttachments(prev => prev.filter(a => a.title !== title));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantPhone.trim()) {
      alert('ကျေးဇူးပြု၍ လျှောက်ထားသူ အမည်နှင့် ဖုန်းနံပါတ် အပြည့်အစုံ ဖြည့်သွင်းပါ။');
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      const newSub = db.saveApplicationSubmission({
        linkToken: token || 'DIRECT-GENERIC',
        officerId: linkConfig?.officerId || 'usr-101',
        officerEmail: linkConfig?.officerBadge || 'heinhtetoo336123@gmail.com',
        applicationType: appType,
        applicantName: applicantName.trim(),
        applicantPhone: applicantPhone.trim(),
        applicantNrc: applicantNrc.trim(),
        applicantAddress: applicantAddress.trim(),
        fatherName: fatherName.trim(),
        motherName: motherName.trim(),
        dob,
        gender,
        bloodGroup,
        ethnicityReligion,
        nrcSubCategory,
        householdListNo,
        deceasedPersonName,
        dateOfDeath,
        causeOfDeath,
        childName,
        childDob,
        childGender,
        placeOfBirth,
        attachments
      });

      setSubmitting(false);
      setSubmittedResult(newSub);
    }, 1000);
  };

  const getTitleMM = (type: ApplicationType) => {
    switch (type) {
      case 'NRC_APP': return 'နိုင်ငံသားစိစစ်ရေးကတ်ပြား လျှောက်ထားခြင်း';
      case 'HOUSEHOLD_APP': return 'အိမ်ထောင်စုလူဦးရေစာရင်း လျှောက်ထားခြင်း (ပုံစံ ၆၆/၆)';
      case 'DECEASED_REMOVAL': return 'အိမ်ထောင်စုစာရင်းမှ သေဆုံးသူ ပယ်ဖျက်ခြင်း';
      case 'BIRTH_ADDITION': return 'အိမ်ထောင်စုစာရင်းသို့ မွေးဖွားသူ ထည့်သွင်းခြင်း';
      default: return 'လူဝင်မှုကြီးကြပ်ရေး လျှောက်လွှာတင်ခြင်း';
    }
  };

  // If application submitted successfully
  if (submittedResult) {
    return (
      <div className="min-h-screen bg-slate-100 p-4 flex items-center justify-center font-sans">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-5 text-slate-900 animate-in fade-in">
          <div className="w-16 h-16 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-800">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="text-center space-y-1">
            <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              လျှောက်လွှာ အောင်မြင်စွာ တင်သွင်းပြီးပါပြီ
            </span>
            <h2 className="text-lg font-black text-slate-900 pt-1">
              {getTitleMM(submittedResult.applicationType)}
            </h2>
            <p className="text-xs text-slate-500 font-bold">
              တာဝန်ခံ အရာရှိထံသို့ တိုက်ရိုက် ပေးပို့စိစစ်လျက် ရှိပါသည်
            </p>
          </div>

          {/* Submission Receipt Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs text-slate-500 font-bold">လျှောက်လွှာ ကုတ်အမှတ်:</span>
              <div className="flex items-center gap-1.5 font-mono font-black text-sm text-blue-950 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                <span>{submittedResult.submissionRef}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(submittedResult.submissionRef);
                    setCopiedRef(true);
                    setTimeout(() => setCopiedRef(false), 2000);
                  }}
                  className="p-1 hover:text-blue-700"
                >
                  {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">လျှောက်ထားသူ:</span>
                <span className="font-extrabold text-slate-900">{submittedResult.applicantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">ဆက်သွယ်ရန် ဖုန်း:</span>
                <span className="font-extrabold text-slate-900">{submittedResult.applicantPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">တာဝန်ခံ အရာရှိ:</span>
                <span className="font-extrabold text-blue-900">{linkConfig?.officerName || 'Hein Htet Oo'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">ရုံးစခန်း တည်နေရာ:</span>
                <span className="font-extrabold text-slate-900">{linkConfig?.officerStation || 'မြို့နယ်ဦးစီးမှူးရုံး'}</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200 leading-relaxed font-bold">
            💡 လျှောက်လွှာ စိစစ်ပြီးပါက တာဝန်ခံ အရာရှိမှ သက်ဆိုင်ရာ ဖုန်းနံပါတ် သို့မဟုတ် Viber မှတစ်ဆင့် ဆက်သွယ် အကြောင်းကြားပေးမည် ဖြစ်ပါသည်။
          </p>

          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="w-full py-3 rounded-2xl bg-blue-950 text-white font-extrabold text-xs hover:bg-blue-900 shadow-md transition"
            >
              Golden Gate MM အက်ပ်သို့ ပြန်သွားမည်
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-3 sm:px-4 font-sans flex flex-col items-center justify-center">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden text-slate-900">
        
        {/* Myanmar Official Header Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 p-5 text-white text-center space-y-1.5 relative">
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="absolute left-3 top-3 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1 font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>အက်ပ်သို့</span>
            </button>
          )}

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-black tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>ပြည်ထောင်စုသမ္မတမြန်မာနိုင်ငံတော် · လဝက တရားဝင် လျှောက်လွှာဇုန်</span>
          </div>

          <h1 className="text-base sm:text-lg font-black tracking-wide text-white pt-1">
            {getTitleMM(appType)}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px] text-slate-300 font-bold">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{linkConfig?.townshipName || 'မင်္ဂလာဒုံမြို့နယ် ရုံး'}</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-300">
              <UserIcon className="w-3.5 h-3.5" />
              <span>တာဝန်ခံ - {linkConfig?.officerName || 'Hein Htet Oo'}</span>
            </span>
          </div>
        </div>

        {/* Step Indicator Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-[11px] font-black text-slate-600">
          <span className={`px-2.5 py-1 rounded-lg ${step === 1 ? 'bg-blue-950 text-white' : 'bg-slate-200'}`}>
            ၁။ ကိုယ်ရေးအချက်အလက်
          </span>
          <span className={`px-2.5 py-1 rounded-lg ${step === 2 ? 'bg-blue-950 text-white' : 'bg-slate-200'}`}>
            ၂။ လျှောက်လွှာအသေးစိတ်
          </span>
          <span className={`px-2.5 py-1 rounded-lg ${step === 3 ? 'bg-blue-950 text-white' : 'bg-slate-200'}`}>
            ၃။ စာရွက်စာတမ်းများ
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-medium">
          
          {/* STEP 1: Applicant Personal Info */}
          {step === 1 && (
            <div className="space-y-3.5 animate-in fade-in">
              <h3 className="text-xs font-black text-blue-950 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <UserIcon className="w-4 h-4 text-amber-600" />
                <span>၁။ လျှောက်ထားသူ၏ ကိုယ်ရေးအချက်အလက်များ</span>
              </h3>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  လျှောက်ထားသူ အမည် *
                </label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="e.g. မောင်အောင်ကျော်"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-blue-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ဆက်သွယ်ရန် ဖုန်းနံပါတ် *
                  </label>
                  <input
                    type="tel"
                    required
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    placeholder="09..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-blue-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    မွေးသက္ကရာဇ် (DOB)
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-blue-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    အဖအမည် *
                  </label>
                  <input
                    type="text"
                    required
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="e.g. ဦးသန်းဝင်း"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-blue-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    အမိအမည် *
                  </label>
                  <input
                    type="text"
                    required
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    placeholder="e.g. ဒေါ်မြင့်မြင့်နွဲ့"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-blue-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  လက်ရှိ နေရပ်လိပ်စာ အပြည့်အစုံ *
                </label>
                <textarea
                  rows={2}
                  required
                  value={applicantAddress}
                  onChange={(e) => setApplicantAddress(e.target.value)}
                  placeholder="အိမ်အမှတ်၊ လမ်း၊ ရပ်ကွက်၊ မြို့နယ်..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:border-blue-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ကျား / မ
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-blue-900 focus:outline-none"
                  >
                    <option value="MALE">ကျား (Male)</option>
                    <option value="FEMALE">မ (Female)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    လူမျိုး / ကိုးကွယ်သည့်ဘာသာ
                  </label>
                  <input
                    type="text"
                    value={ethnicityReligion}
                    onChange={(e) => setEthnicityReligion(e.target.value)}
                    placeholder="e.g. ဗမာ / ဗုဒ္ဓ"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-blue-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-2xl bg-blue-950 text-white font-extrabold text-xs hover:bg-blue-900 flex items-center gap-1.5 shadow-sm transition"
                >
                  <span>နောက်တစ်ဆင့် (လျှောက်လွှာအသေးစိတ်)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Specific Application Form Details */}
          {step === 2 && (
            <div className="space-y-3.5 animate-in fade-in">
              <h3 className="text-xs font-black text-blue-950 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>၂။ {getTitleMM(appType)} - အသေးစိတ် အချက်အလက်</span>
              </h3>

              {/* NRC Application Specific Controls */}
              {appType === 'NRC_APP' && (
                <div className="space-y-3 bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      မှတ်ပုံတင် လျှောက်ထားသည့် အမျိုးအစား
                    </label>
                    <select
                      value={nrcSubCategory}
                      onChange={(e) => setNrcSubCategory(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-blue-900 focus:outline-none"
                    >
                      <option value="10_YEAR">၁၀ နှစ်ပြည့် နိုင်ငံသားစိစစ်ရေးကတ် လျှောက်ထားခြင်း</option>
                      <option value="18_YEAR">၁၈ နှစ်ပြည့် နိုင်ငံသားစိစစ်ရေးကတ် လဲလှယ်ခြင်း</option>
                      <option value="REPLACEMENT">ပျက်စီး / ပျောက်ဆုံး လဲလှယ် လျှောက်ထားခြင်း</option>
                      <option value="NEW">အသစ် လျှောက်ထားခြင်း</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      လက်ရှိ မှတ်ပုံတင်အမှတ် (ရှိပါက)
                    </label>
                    <input
                      type="text"
                      value={applicantNrc}
                      onChange={(e) => setApplicantNrc(e.target.value)}
                      placeholder="e.g. ၁၂/မဂဒ(နိုင်)၁၂၃၄၅၆"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-blue-900 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Household List Specific Controls */}
              {(appType === 'HOUSEHOLD_APP' || appType === 'DECEASED_REMOVAL' || appType === 'BIRTH_ADDITION') && (
                <div className="space-y-3 bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      အိမ်ထောင်စု လူဦးရေစာရင်း အမှတ် (ပုံစံ ၆၆/၆) *
                    </label>
                    <input
                      type="text"
                      required
                      value={householdListNo}
                      onChange={(e) => setHouseholdListNo(e.target.value)}
                      placeholder="e.g. မဂဒ/အိမ်-၈၉၄၁၂"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-blue-900 focus:outline-none"
                    />
                  </div>

                  {appType === 'DECEASED_REMOVAL' && (
                    <div className="space-y-3 pt-1 border-t border-amber-200">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-800 mb-1">
                          သေဆုံးသူ၏ အမည် *
                        </label>
                        <input
                          type="text"
                          required
                          value={deceasedPersonName}
                          onChange={(e) => setDeceasedPersonName(e.target.value)}
                          placeholder="e.g. ဦးလှမောင်"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-blue-900 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-800 mb-1">
                            သေဆုံးသည့် ရက်စွဲ *
                          </label>
                          <input
                            type="date"
                            required
                            value={dateOfDeath}
                            onChange={(e) => setDateOfDeath(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-blue-900 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-800 mb-1">
                            သေဆုံးသည့် အကြောင်းအရင်း / နေရာ
                          </label>
                          <input
                            type="text"
                            value={causeOfDeath}
                            onChange={(e) => setCauseOfDeath(e.target.value)}
                            placeholder="e.g. ရောဂါကြီးဖြင့် ဆေးရုံတွင်"
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-blue-900 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {appType === 'BIRTH_ADDITION' && (
                    <div className="space-y-3 pt-1 border-t border-amber-200">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-800 mb-1">
                          မွေးဖွားသူ ကလေး၏ အမည် အပြည့်အစုံ *
                        </label>
                        <input
                          type="text"
                          required
                          value={childName}
                          onChange={(e) => setChildName(e.target.value)}
                          placeholder="e.g. မောင်မင်းခန့်"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-blue-900 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-800 mb-1">
                            မွေးဖွားသည့် ရက်စွဲ *
                          </label>
                          <input
                            type="date"
                            required
                            value={childDob}
                            onChange={(e) => setChildDob(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-blue-900 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-800 mb-1">
                            မွေးဖွားသည့် နေရာ / ဆေးရုံ
                          </label>
                          <input
                            type="text"
                            value={placeOfBirth}
                            onChange={(e) => setPlaceOfBirth(e.target.value)}
                            placeholder="e.g. မြောက်ဥက္ကလာ ဆေးရုံကြီး"
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-blue-900 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-3 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-200 text-slate-800 font-extrabold text-xs hover:bg-slate-300 flex items-center gap-1.5 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>ရှေ့သို့</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-2xl bg-blue-950 text-white font-extrabold text-xs hover:bg-blue-900 flex items-center gap-1.5 shadow-sm transition"
                >
                  <span>နောက်တစ်ဆင့် (ပုံများပူးတွဲရန်)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Attachment Photo Uploads */}
          {step === 3 && (
            <div className="space-y-3.5 animate-in fade-in">
              <h3 className="text-xs font-black text-blue-950 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Camera className="w-4 h-4 text-amber-600" />
                <span>၃။ လိုအပ်သော စာရွက်စာတမ်း / ဓာတ်ပုံများ ပူးတွဲတင်ပြခြင်း</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Applicant Photo */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">၁။ လျှောက်ထားသူ ဓာတ်ပုံ</span>
                    <span className="text-[10px] font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">လိုအပ်</span>
                  </div>
                  
                  {attachments.find(a => a.title === 'လျှောက်ထားသူဓာတ်ပုံ') ? (
                    <div className="relative rounded-xl overflow-hidden border border-emerald-300 bg-emerald-50 p-2 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>ဓာတ်ပုံ ပူးတွဲပြီးပါပြီ</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttachment('လျှောက်ထားသူဓာတ်ပုံ')}
                        className="text-rose-600 p-1 font-bold text-xs"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 hover:border-blue-800 bg-white cursor-pointer transition">
                      <Camera className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-bold text-slate-700">ဓာတ်ပုံ ရိုက်မည် / ရွေးမည်</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'လျှောက်ထားသူဓာတ်ပုံ')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* 2. Household List Photo */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">၂။ အိမ်ထောင်စုဇယား (ပုံစံ ၆၆/၆)</span>
                    <span className="text-[10px] font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">လိုအပ်</span>
                  </div>

                  {attachments.find(a => a.title === 'အိမ်ထောင်စုဇယား') ? (
                    <div className="relative rounded-xl overflow-hidden border border-emerald-300 bg-emerald-50 p-2 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>ပုံ ပူးတွဲပြီးပါပြီ</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttachment('အိမ်ထောင်စုဇယား')}
                        className="text-rose-600 p-1 font-bold text-xs"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 hover:border-blue-800 bg-white cursor-pointer transition">
                      <Upload className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-bold text-slate-700">အိမ်ထောင်စုဇယား ပုံတင်မည်</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'အိမ်ထောင်စုဇယား')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* 3. Ward Recommendation Photo */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">၃။ ရပ်ကွက်အုပ်ချုပ်ရေးမှူး ထောက်ခံစာ</span>
                    <span className="text-[10px] font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">လိုအပ်</span>
                  </div>

                  {attachments.find(a => a.title === 'ရပ်ကွက်ထောက်ခံစာ') ? (
                    <div className="relative rounded-xl overflow-hidden border border-emerald-300 bg-emerald-50 p-2 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>ပုံ ပူးတွဲပြီးပါပြီ</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttachment('ရပ်ကွက်ထောက်ခံစာ')}
                        className="text-rose-600 p-1 font-bold text-xs"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 hover:border-blue-800 bg-white cursor-pointer transition">
                      <Upload className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-bold text-slate-700">ထောက်ခံစာ ပုံတင်မည်</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'ရပ်ကွက်ထောက်ခံစာ')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* 4. Additional Document (Police / Death / Birth Cert) */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      ၄။ {appType === 'DECEASED_REMOVAL' ? 'သေစာရင်း ပုံ' : appType === 'BIRTH_ADDITION' ? 'မွေးစာရင်း ပုံ' : 'ရဲစခန်းထောက်ခံစာ (ရှိပါက)'}
                    </span>
                    <span className="text-[10px] font-black text-slate-500 bg-slate-200 px-2 py-0.5 rounded">မဖြစ်မနေ မဟုတ်ပါ</span>
                  </div>

                  {attachments.find(a => a.title === 'အခြားစာရွက်စာတမ်း') ? (
                    <div className="relative rounded-xl overflow-hidden border border-emerald-300 bg-emerald-50 p-2 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>ပုံ ပူးတွဲပြီးပါပြီ</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttachment('အခြားစာရွက်စာတမ်း')}
                        className="text-rose-600 p-1 font-bold text-xs"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 hover:border-blue-800 bg-white cursor-pointer transition">
                      <Upload className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-bold text-slate-700">အခြား စာရွက်စာတမ်း တင်မည်</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'အခြားစာရွက်စာတမ်း')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Final Declaration Checkbox */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  required
                  id="declaration"
                  className="mt-0.5 w-4 h-4 accent-emerald-700 rounded cursor-pointer"
                />
                <label htmlFor="declaration" className="text-[11px] leading-relaxed font-bold cursor-pointer">
                  အထက်ဖော်ပြပါ အချက်အလက်များနှင့် ပူးတွဲတင်ပြထားသော စာရွက်စာတမ်းများသည် အမှန်တကယ် မှန်ကန်ကြောင်း ကတိပြုပါသည်။
                </label>
              </div>

              <div className="pt-3 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-200 text-slate-800 font-extrabold text-xs hover:bg-slate-300 flex items-center gap-1.5 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>ရှေ့သို့</span>
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition disabled:opacity-50"
                >
                  {submitting ? (
                    <span>တင်သွင်းနေပါသည်...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>လျှောက်လွှာ တင်သွင်းမည်</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
