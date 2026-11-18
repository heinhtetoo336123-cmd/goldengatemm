import React, { useState, useEffect } from 'react';
import { FileText, Printer, Copy, Save, Check, BookmarkCheck, MapPin, Building2, Download, Send, Loader2, Sliders, Radio, Settings2, X, AlertTriangle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { OfficialLetterInput, DocumentRecord, LetterPreset, LetterType, TelegramInput, MasterLetterData } from '../types';
import { db } from '../services/db';
import { MYANMAR_ADMINISTRATIVE_DATA, getDistricts, getTownships, findTownshipLocationInfo } from '../data/administrativeData';

// English to Myanmar Numeral converter helper
export function toMyanmarDigits(numStr: string | number): string {
  const map: { [key: string]: string } = {
    '0': '၀', '1': '၁', '2': '၂', '3': '၃', '4': '၄',
    '5': '၅', '6': '၆', '7': '၇', '8': '၈', '9': '၉'
  };
  return String(numStr).replace(/[0-9]/g, (w) => map[w] || w);
}

// Auto-formatter helper: Clean up extra spaces in Myanmar text
export function autoJustifyMyanmarLine(str: string): string {
  if (!str) return '';
  return str.trim().replace(/\s+/g, ' ');
}

export function formatMyanmarDate(dateISO: string): string {
  if (!dateISO) return '';
  const [year, month, day] = dateISO.split('-');
  const monthNames = [
    'ဇန်နဝါရီလ', 'ဖေဖော်ဝါရီလ', 'မတ်လ', 'ဧပြီလ', 'မေလ', 'ဇွန်လ',
    'ဇူလိုင်လ', 'ဩဂုတ်လ', 'စက်တင်ဘာလ', 'အောက်တိုဘာလ', 'နိုဝင်ဘာလ', 'ဒီဇင်ဘာလ'
  ];
  const monthIdx = parseInt(month, 10) - 1;
  const mmYear = toMyanmarDigits(year);
  const mmDay = toMyanmarDigits(parseInt(day, 10));
  const mmMonth = monthNames[monthIdx] || '';

  return `${mmYear} ခုနှစ်၊ ${mmMonth} ${mmDay} ရက်`;
}

interface LetterFormatterProps {
  onSavedToRecords?: () => void;
}

// Dropdown Predefined Options
const DEPARTMENT_OPTIONS = [
  'တိုင်းဒေသကြီးဦးစီးမှူးရုံး',
  'ခရိုင် လူဝင်မှုကြီးကြပ်ရေး ဦးစီးမှူးရုံး',
  'မြို့နယ် လူဝင်မှုကြီးကြပ်ရေး ဦးစီးမှူးရုံး',
  'နယ်စပ် (OSS) စစ်ဆေးရေးစခန်း',
  'အမျိုးသားမှတ်ပုံတင်နှင့် နိုင်ငံသားဦးစီးဌာန',
  'ဗီဇာနှင့် နေထိုင်ခွင့် စိစစ်ရေးဌာနခွဲ',
  'CUSTOM'
];

const SENDER_TITLE_OPTIONS = [
  'မြို့နယ်ဦးစီးမှူး',
  'ခရိုင်ဦးစီးမှူး',
  'ဒုတိယညွှန်ကြားရေးမှူး',
  'ညွှန်ကြားရေးမှူး',
  'လက်ထောက်ညွှန်ကြားရေးမှူး',
  'ဦးစီးအရာရှိ',
  'ဒုတိယဦးစီးမှူး',
  'CUSTOM'
];

export const LetterFormatter: React.FC<LetterFormatterProps> = ({ onSavedToRecords }) => {
  // Cascading Myanmar Administrative Location Dropdown State
  const [selectedRegionId, setSelectedRegionId] = useState<string>('yangon');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('yangon_north');
  const [selectedTownshipId, setSelectedTownshipId] = useState<string>('mingaladon_township');
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);

  // Available Presets
  const [allPresets, setAllPresets] = useState<LetterPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-cover-letter');
  
  // Page & View Controls
  const [pageSize, setPageSize] = useState<'A4' | 'LEGAL'>('A4');
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('edit');
  const [zoomFit, setZoomFit] = useState(true);
  const [scale, setScale] = useState(1);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Live Margin Adjustments (Default: Top 0.25in, Bottom 0.25in, Left 1.0in, Right 0.25in)
  const [marginTop, setMarginTop] = useState<number>(0.25);
  const [marginBottom, setMarginBottom] = useState<number>(0.25);
  const [marginLeft, setMarginLeft] = useState<number>(1.0);
  const [marginRight, setMarginRight] = useState<number>(0.25);
  const [showMarginSettings, setShowMarginSettings] = useState<boolean>(false);

  // Export Loading States
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Preset Edit / Add Modal state
  const [showPresetManagerModal, setShowPresetManagerModal] = useState(false);
  const [editingPreset, setEditingPreset] = useState<LetterPreset | null>(null);
  const [presetTitleInput, setPresetTitleInput] = useState('');
  const [presetSubjectInput, setPresetSubjectInput] = useState('');
  const [presetRefInput, setPresetRefInput] = useState('');
  const [presetSenderTitleInput, setPresetSenderTitleInput] = useState('');
  const [presetSenderNameInput, setPresetSenderNameInput] = useState('');
  const [presetParagraphs, setPresetParagraphs] = useState<string[]>([]);
  const [presetCopyTo, setPresetCopyTo] = useState<string[]>([]);

  // Document Mode: Official Cover Letter or Official Telegram
  const [docMode, setDocMode] = useState<'COVER_LETTER' | 'TELEGRAM'>('COVER_LETTER');

  // Dedicated Telegram Input State (Exact match to Myanmar Government Telegram IMG_7026)
  const [telegramInput, setTelegramInput] = useState<TelegramInput>({
    routingRecipients: [
      { code: '(ပ)', office: 'ခရမ၊ လဝပ' },
      { code: '(လ)', office: 'ဒုပနမ၊ လဝပ' },
      { code: '(တ)', office: 'ပနမ၊ လဝပ' }
    ],
    telegramNo: '၀၀၆ / အခမ ၊ ၊',
    dateTimeGroup: '၂၀၂၆ ဇန် ၂၂ ၁၆၀၀',
    paragraphs: [
      '(၁)    ဝကရုံး၏ စာအမိန့်အမှတ်(   /၂၀၂၆)၊ စာအမှတ်၊ ၁/လဝပ/၁ (ညွှန်း)',
      '(၂)    ဒုပနမ၏ ချိန်ပို့ကနအမှတ်၊  /အခမ(ညွှန်း)',
      '(၃)    လူဝင်မှုကြီးကြပ်ရေးနှင့်ပြည်သူ့အင်အားဝန်ကြီးဌာန၊ ဝန်ထမ်းရေးရာစီမံခန့်ခွဲမှုကော်မတီ အစည်းအဝေး ဆုံးဖြတ်ချက်အရ တာဝန်ထမ်းဆောင်နေသည့် ဝန်ထမ်းများအား ပြောင်းရွှေ့တာဝန်ချထားခဲ့-',
      '(၄)    အထက်ဖော်ပြပါ ဝန်ထမ်းများသည် တာဝန်ကျရာ ရုံးသို့ သတင်းပို့ရန်နှင့် တာဝန်လက်ခံဆောင်ရွက်သွားရန် ညွှန်း(၂)ပါကနဖြင့် အကကလာခဲ့၊',
      '(၅)    သို့ဖြစ်ပါ၍ တာဝန်ကျရာ ရုံးသို့ အချိန်မီ သတင်းပို့နိုင်ရေးအတွက် ကြိုတင်ပြင်ဆင်ဆောင်ရွက်ထားရှိရန်နှင့် အခြေအနေအား တင်ပြသွားရန် အကကသည်---/'
    ],
    personnelList: [],
    telegraphicClosing: 'တင်ပြသွားရန် အကကသည်---/',
    dispatchMethod: 'သင့်ရာနည်းဖြင့်',
    securityLevel: 'အဆင့်အတန်း',
    signatoryTitle: 'ခရိုင်ဦးစီးမှူး',
    signatoryName: ''
  });

  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('မူကြမ်း သိမ်းဆည်းပြီး');

  // Dynamic Master Letter Data State (Accumulates saved history & selectable dropdown options)
  const [masterData, setMasterData] = useState<MasterLetterData>({
    recipients: [],
    subjects: [],
    referenceTexts: [],
    senderTitles: [],
    senderNames: []
  });

  const refreshMasterData = () => {
    setMasterData(db.getMasterLetterData());
  };

  // Main Letter Form Input State - Default requested fields set to BLANK ('')
  const [formInput, setFormInput] = useState<OfficialLetterInput>({
    docNumber: '၁၀၂ / လ-၆ ( ၄ရ၂၇ ) စီမံ/လဝက',
    date: new Date().toISOString().split('T')[0],
    ministry: 'လူဝင်မှုကြီးကြပ်ရေးနှင့် ပြည်သူ့အင်အားဝန်ကြီးဌာန',
    department: 'တိုင်းဒေသကြီးဦးစီးမှူးရုံး',
    officeLocation: 'တနင်္သာရီတိုင်းဒေသကြီး၊ ထားဝယ်မြို့',
    subject: '',       // Blank by default per user request
    referenceText: '', // Blank by default per user request
    recipient: '',     // Blank by default per user request
    senderTitle: '',   // Blank by default per user request
    senderName: '',    // Blank by default per user request
    classification: 'RESTRICTED', // ကန့်သတ်
    urgency: 'ORDINARY',       // ရိုးရိုး
    letterType: 'COVER_LETTER',
    bodyParagraphs: [
      '၁။    ------------------- ပိုင်ဆိုင်သည့် ရတနာဝင်း-၃ (T-၆၈၅)အမည်ရှိ တဂုတ်ဆွဲငါးဖမ်းရေယာဉ်သည် (OSS)စစ်ဆေးရေးစခန်းသို့ အဖွဲ့စုံဖြင့်စစ်ဆေးခဲ့ပြီး ပင်လယ်ပြင်ငါးဖမ်းကွက်သို့ ထွက်ခွာသွားခဲ့ကြောင်း၊ အဆိုပါငါးဖမ်းရေယာဉ်သည် ပင်လယ်ပြင်၌ ရာသီဥတုဆိုးရွားကာ ရုတ်တရက်လှိုင်းလေပြင်းထန်လာပြီး နှစ်မြုပ်သွားခဲ့ကြောင်း၊ ရေယာဉ်ပေါ်ပါ ရေလုပ်သားများအား အနီးနားရှိ ငါးဖမ်းလှေ၏ အကူအညီဖြင့် ဆယ်ယူနိုင်ခဲ့၍ ရေလုပ်သားများ သေဆုံးမှုမရှိပါကြောင်း၊ ရာသီဥတုကောင်းမွန်ပါက ရေယာဉ်အား ပြန်လည်ဆယ်ယူမည်ဖြစ်ကြောင်း ရည်ညွှန်းပါကြေးနန်းဖြင့် တင်ပြလာပါသည်။',
      '၂။    အဆိုပါဖြစ်စဉ်နှင့်ပတ်သက်၍ မည်သည့်အတွက်ကြောင့် အချိန်နှင့်တစ်ပြေးညီတင်ပြရန် ပျက်ကွက်ရခြင်းကိုဖြေရှင်းတင်ပြရန်နှင့် နောက်နောင်အဆိုပါဖြစ်စဉ်မျိုး ထပ်မံဖြစ်ပွားမှုမရှိစေရေး အလေးထားဆောင်ရွက်ရန် သတိပေးအကြောင်းကြားပါသည်။'
    ],
    copyTo: [
      'ခရိုင်ဦးစီးမှူး၊ လူဝင်မှုကြီးကြပ်ရေးနှင့်ပြည်သူ့အင်အားဝန်ကြီးဌာန၊',
      'ရုံးလက်ခံ/မျှောစာတွဲ'
    ]
  });


  // Custom Dropdown Selections
  const [customDept, setCustomDept] = useState(false);

  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [toastBanner, setToastBanner] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [showSavePresetPromptModal, setShowSavePresetPromptModal] = useState(false);
  const [savePresetPromptTitle, setSavePresetPromptTitle] = useState('');
  const [confirmDeletePresetId, setConfirmDeletePresetId] = useState<string | null>(null);

  const showToast = (text: string, kind: 'success' | 'error' = 'success') => {
    setToastBanner({ kind, text });
    setTimeout(() => setToastBanner(null), 3500);
  };

  // Client-Side Offline PDF Generation Helper
  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const element = document.getElementById('print-area');
      if (!element) {
        showToast('စာရွက် အကြမ်းမတွေ့ပါ', 'error');
        return;
      }

      // High quality canvas render for sharp Myanmar typography
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: pageSize === 'LEGAL' ? 'legal' : 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

      const safeTitle = docMode === 'TELEGRAM'
        ? `ကြေးနန်းစာ_${(telegramInput.telegramNo || 'ကန').replace(/[\/\\?%*:|"<>]/g, '_')}`
        : (formInput.subject || 'ရုံးစာ').replace(/[\/\\?%*:|"<>]/g, '_');
      const safeDoc = docMode === 'TELEGRAM'
        ? (telegramInput.dateTimeGroup || 'dtg').replace(/[\/\\?%*:|"<>]/g, '_')
        : (formInput.docNumber || 'doc').replace(/[\/\\?%*:|"<>]/g, '_');
      const fileName = `${safeTitle}_${safeDoc}.pdf`;

      pdf.save(fileName);
      showToast('PDF ဖိုင် ဒေါင်းလုဒ် ရယူပြီးပါပြီ။');
    } catch (err) {
      console.error('PDF generation error:', err);
      showToast('PDF ထုတ်ယူရာတွင် အမှားအယွင်းရှိပါသည်: ' + (err as Error).message, 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Direct Share to Viber with Web Share API & Viber Fallback Helper
  const handleShareViber = async () => {
    setIsSharing(true);
    try {
      const element = document.getElementById('print-area');

      // Construct comprehensive generated document text content
      const fullDocumentContent = docMode === 'TELEGRAM'
        ? `⚡️ ကြေးနန်းစာ (TELEGRAM)\n${telegramInput.routingRecipients.map(r => `${r.code}  ${r.office}`).join('\n')}\nစာအမှတ်: ${telegramInput.telegramNo}\nရက်စွဲ/အချိန်: ${telegramInput.dateTimeGroup}\n\n${telegramInput.paragraphs.slice(0, 3).join('\n\n')}\n\n${telegramInput.personnelList.map(p => `${p.code} ${p.serialNo}   ${p.rankName}   ${p.station}`).join('\n')}\n\n${telegramInput.paragraphs.slice(3).join('\n\n')}\n\n----------------------------------\n${telegramInput.dispatchMethod}                       ${telegramInput.securityLevel}\n(လက်မှတ်)\n${telegramInput.signatoryTitle}\n${telegramInput.signatoryName}`.trim()
        : `📌 ${formInput.subject}
စာအမှတ်: ${formInput.docNumber}
ရက်စွဲ: ${formatMyanmarDate(formInput.date)}
ဌာန: ${formInput.department}
ဝန်ကြီးဌာန: ${formInput.ministry}
တည်နေရာ: ${formInput.officeLocation}

သို့
${formInput.recipient}

အကြောင်းအရာ။    ။ ${formInput.subject}
${formInput.referenceText ? `ရည်ညွှန်းချက် ။    ။ ${formInput.referenceText}` : ''}

${formInput.bodyParagraphs.join('\n\n')}

(${formInput.senderName})
${formInput.senderTitle}

မိတ္တူကို -
${formInput.copyTo.map((c, i) => `${toMyanmarDigits(i + 1)}။    ${c}`).join('\n')}`.trim();

      let sharedViaWebShare = false;

      // 1. Check if Web Share API with File Sharing is supported
      if (element && typeof navigator !== 'undefined' && 'share' in navigator) {
        try {
          const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
          const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));

          if (blob) {
            const safeTitle = (docMode === 'TELEGRAM' ? 'ကြေးနန်းစာ' : (formInput.subject || 'ရုံးစာ')).replace(/[\/\\?%*:|"<>]/g, '_');
            const file = new File([blob], `${safeTitle}.png`, { type: 'image/png' });

            // Verify if the browser explicitly supports file sharing
            if ('canShare' in navigator && navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: docMode === 'TELEGRAM' ? `ကြေးနန်းစာ - ${telegramInput.telegramNo}` : formInput.subject,
                text: fullDocumentContent,
                files: [file]
              });
              sharedViaWebShare = true;
            }
          }
        } catch (e) {
          console.warn('Web Share file sharing skipped or failed:', e);
        }

        // If file sharing wasn't supported/successful, attempt Web Share API with text
        if (!sharedViaWebShare) {
          try {
            await navigator.share({
              title: docMode === 'TELEGRAM' ? `ကြေးနန်းစာ - ${telegramInput.telegramNo}` : formInput.subject,
              text: fullDocumentContent
            });
            sharedViaWebShare = true;
          } catch (e) {
            console.warn('Web Share text sharing dismissed or unsupported:', e);
          }
        }
      }

      // 2. Fallback: If Web Share API or file sharing is not supported, use the 'viber://forward?text=' URI scheme
      if (!sharedViaWebShare) {
        const viberUrl = `viber://forward?text=${encodeURIComponent(fullDocumentContent)}`;
        window.location.href = viberUrl;
      }
    } catch (err) {
      console.error('Viber share error:', err);
      // Direct URI scheme fallback on error
      const textFallback = docMode === 'TELEGRAM'
        ? `⚡️ ကြေးနန်းစာ ${telegramInput.telegramNo}\n${telegramInput.paragraphs[0] || ''}`
        : `📌 ${formInput.subject}\n\n${formInput.bodyParagraphs.join('\n\n')}`;
      window.location.href = `viber://forward?text=${encodeURIComponent(textFallback)}`;
    } finally {
      setIsSharing(false);
    }
  };

  // Reload all presets from local database
  const reloadPresets = () => {
    const list = db.getLetterPresets();
    setAllPresets(list);
  };

  useEffect(() => {
    reloadPresets();
    refreshMasterData();
    const savedLoc = db.getUserLocationConfig();
    if (savedLoc && savedLoc.regionId && savedLoc.districtId && savedLoc.townshipId) {
      setSelectedRegionId(savedLoc.regionId);
      setSelectedDistrictId(savedLoc.districtId);
      setSelectedTownshipId(savedLoc.townshipId);
      const info = findTownshipLocationInfo(savedLoc.townshipId);
      if (info.fullLocationMM) {
        setFormInput(prev => ({ ...prev, officeLocation: info.fullLocationMM }));
      }
    }

    // Restore Auto-saved Drafts
    const letterDraft = db.getCoverLetterDraft();
    if (letterDraft) {
      setFormInput(letterDraft);
    }
    const teleDraft = db.getTelegramDraft();
    if (teleDraft) {
      setTelegramInput(teleDraft);
    }
  }, []);


  // Auto-Save Effect for Cover Letter Draft
  useEffect(() => {
    const timer = setTimeout(() => {
      db.saveCoverLetterDraft(formInput);
      setAutoSaveStatus('မူကြမ်း အလိုအလျောက် သိမ်းဆည်းပြီး');
    }, 800);
    return () => clearTimeout(timer);
  }, [formInput]);

  // Auto-Save Effect for Telegram Draft
  useEffect(() => {
    const timer = setTimeout(() => {
      db.saveTelegramDraft(telegramInput);
      setAutoSaveStatus('မူကြမ်း အလိုအလျောက် သိမ်းဆည်းပြီး');
    }, 800);
    return () => clearTimeout(timer);
  }, [telegramInput]);

  // Handle Region Change in Cascading Dropdown
  const handleRegionChange = (regionId: string) => {
    setSelectedRegionId(regionId);
    const districts = getDistricts(regionId);
    const firstDistrictId = districts[0]?.id || '';
    setSelectedDistrictId(firstDistrictId);
    
    const townships = getTownships(regionId, firstDistrictId);
    const firstTownshipId = townships[0]?.id || '';
    setSelectedTownshipId(firstTownshipId);

    updateLocationAndPresets(firstTownshipId);
  };

  // Handle District Change in Cascading Dropdown
  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrictId(districtId);
    const townships = getTownships(selectedRegionId, districtId);
    const firstTownshipId = townships[0]?.id || '';
    setSelectedTownshipId(firstTownshipId);

    updateLocationAndPresets(firstTownshipId);
  };

  // Handle Township Change in Cascading Dropdown
  const handleTownshipChange = (townshipId: string) => {
    setSelectedTownshipId(townshipId);
    updateLocationAndPresets(townshipId);
  };

  // Helper to update Office Location and filter presets when township is selected
  const updateLocationAndPresets = (townshipId: string) => {
    const info = findTownshipLocationInfo(townshipId);
    if (info.fullLocationMM) {
      setFormInput(prev => ({
        ...prev,
        officeLocation: info.fullLocationMM
      }));
    }
  };

  // Get presets filtered by selected township or region
  const filteredTownshipPresets = allPresets.filter(p => {
    if (!selectedTownshipId) return true;
    if (p.townshipId === selectedTownshipId) return true;
    if (!p.townshipId && p.regionId === selectedRegionId) return true;
    if (!p.townshipId && !p.regionId) return true; // Global default preset
    return false;
  });

  // Effective list of presets to show (if no specific presets for township, fall back to all presets)
  const displayPresets = filteredTownshipPresets.length > 0 ? filteredTownshipPresets : allPresets;

  // Load a selected preset into form input
  const handleSelectPreset = (preset: LetterPreset) => {
    setSelectedPresetId(preset.id);
    const info = findTownshipLocationInfo(selectedTownshipId);
    setFormInput(prev => ({
      ...prev,
      subject: preset.subject,
      referenceText: preset.referenceText || '',
      department: preset.department || prev.department,
      officeLocation: preset.location || info.fullLocationMM || prev.officeLocation,
      recipient: preset.recipient || prev.recipient,
      senderTitle: preset.senderTitle || prev.senderTitle,
      senderName: preset.senderName || prev.senderName,
      classification: preset.classification || 'NONE',
      urgency: preset.urgency || 'ORDINARY',
      letterType: preset.letterType || 'COVER_LETTER',
      bodyParagraphs: preset.bodyParagraphs,
      copyTo: preset.copyTo && preset.copyTo.length > 0 ? preset.copyTo : prev.copyTo
    }));
  };

  // Calculate Mobile Screen Scaling
  useEffect(() => {
    if (!zoomFit) {
      setScale(1);
      return;
    }
    const calculateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 20;
        const paperPxWidth = pageSize === 'LEGAL' ? 816 : 794;
        if (containerWidth < paperPxWidth && containerWidth > 0) {
          setScale(containerWidth / paperPxWidth);
        } else {
          setScale(1);
        }
      }
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [zoomFit, pageSize, activeTab]);

  // Open Edit / New Preset Modal
  const handleOpenEditPreset = (preset?: LetterPreset) => {
    if (preset) {
      setEditingPreset(preset);
      setPresetTitleInput(preset.title);
      setPresetSubjectInput(preset.subject);
      setPresetRefInput(preset.referenceText || '');
      setPresetSenderTitleInput(preset.senderTitle || formInput.senderTitle);
      setPresetSenderNameInput(preset.senderName || formInput.senderName);
      setPresetParagraphs([...preset.bodyParagraphs]);
      setPresetCopyTo(preset.copyTo && preset.copyTo.length > 0 ? [...preset.copyTo] : [...formInput.copyTo]);
    } else {
      setEditingPreset(null);
      setPresetTitleInput('');
      setPresetSubjectInput('');
      setPresetRefInput('');
      setPresetSenderTitleInput(formInput.senderTitle);
      setPresetSenderNameInput(formInput.senderName);
      setPresetParagraphs(['၁။    စာပိုဒ် အကြောင်းအရာ ရိုက်ထည့်ပါ...']);
      setPresetCopyTo([...formInput.copyTo]);
    }
    setShowPresetManagerModal(true);
  };

  // Save Preset to local DB with current Township metadata
  const handleSavePresetForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetTitleInput.trim()) return;

    const info = findTownshipLocationInfo(selectedTownshipId);

    db.saveLetterPreset({
      id: editingPreset?.id,
      category: 'မြို့နယ် Section အသုံး',
      title: presetTitleInput.trim(),
      subject: presetSubjectInput.trim() || presetTitleInput.trim(),
      referenceText: presetRefInput.trim(),
      regionId: selectedRegionId,
      districtId: selectedDistrictId,
      townshipId: selectedTownshipId,
      townshipName: info.township?.nameMM || '',
      ministry: formInput.ministry,
      department: formInput.department,
      location: formInput.officeLocation,
      recipient: formInput.recipient,
      senderTitle: presetSenderTitleInput.trim(),
      senderName: presetSenderNameInput.trim(),
      classification: formInput.classification,
      urgency: formInput.urgency,
      letterType: formInput.letterType,
      bodyParagraphs: presetParagraphs,
      copyTo: presetCopyTo
    });

    reloadPresets();
    setShowPresetManagerModal(false);
  };

  // Delete Preset via in-app modal
  const confirmDeletePreset = () => {
    if (!confirmDeletePresetId) return;
    db.deleteLetterPreset(confirmDeletePresetId);
    reloadPresets();
    setConfirmDeletePresetId(null);
    showToast('Preset စာပုံစံ ပယ်ဖျက်ပြီးပါပြီ။');
  };

  // Save Current Form as New Preset via in-app modal
  const handleSaveCurrentAsPreset = () => {
    setSavePresetPromptTitle(formInput.subject || '');
    setShowSavePresetPromptModal(true);
  };

  const submitSaveCurrentAsPreset = (e: React.FormEvent) => {
    e.preventDefault();
    const newTitle = savePresetPromptTitle.trim();
    if (!newTitle) return;

    const info = findTownshipLocationInfo(selectedTownshipId);

    db.saveLetterPreset({
      category: 'မြို့နယ် Section အသုံး',
      title: newTitle,
      regionId: selectedRegionId,
      districtId: selectedDistrictId,
      townshipId: selectedTownshipId,
      townshipName: info.township?.nameMM || '',
      subject: formInput.subject,
      referenceText: formInput.referenceText,
      department: formInput.department,
      location: formInput.officeLocation,
      recipient: formInput.recipient,
      senderTitle: formInput.senderTitle,
      senderName: formInput.senderName,
      classification: formInput.classification,
      urgency: formInput.urgency,
      letterType: formInput.letterType,
      bodyParagraphs: formInput.bodyParagraphs,
      copyTo: formInput.copyTo
    });

    reloadPresets();
    setShowSavePresetPromptModal(false);
    showToast('Preset စာပုံစံ သိမ်းဆည်းပြီးပါပြီ။');
  };

  // Save to Local Records
  const handleSaveRecord = () => {
    if (docMode === 'TELEGRAM') {
      const newDoc: Partial<DocumentRecord> = {
        refNumber: telegramInput.telegramNo,
        title: `ကြေးနန်းစာ (${telegramInput.telegramNo})`,
        category: 'DIRECTIVE',
        date: new Date().toISOString().split('T')[0],
        sender: telegramInput.signatoryTitle,
        receiver: telegramInput.routingRecipients.map(r => `${r.code} ${r.office}`).join(', '),
        summary: telegramInput.paragraphs[0] || 'တရားဝင် ကြေးနန်းစာ',
        fullText: `${telegramInput.routingRecipients.map(r => `${r.code}  ${r.office}`).join('\n')}\n${telegramInput.telegramNo}   ရက်စွဲ/အချိန်: ${telegramInput.dateTimeGroup}\n\n${telegramInput.paragraphs.join('\n\n')}`,
        classification: 'RESTRICTED'
      };
      db.saveDocument(newDoc);
    } else {
      const newDoc: Partial<DocumentRecord> = {
        refNumber: formInput.docNumber,
        title: formInput.subject,
        category: 'OUTBOUND',
        date: formInput.date,
        sender: formInput.department,
        receiver: formInput.recipient,
        summary: formInput.bodyParagraphs[0] || formInput.subject,
        fullText: `${formInput.ministry}\n${formInput.department}\n${formInput.docNumber}\nအကြောင်းအရာ။ ။ ${formInput.subject}\n\n${formInput.bodyParagraphs.join('\n\n')}`,
        classification: formInput.classification
      };
      db.saveDocument(newDoc);
    }

    setSavedSuccess(true);
    refreshMasterData();
    setTimeout(() => setSavedSuccess(false), 3000);
    if (onSavedToRecords) onSavedToRecords();
  };


  // Copy full document text
  const handleCopyText = () => {
    if (docMode === 'TELEGRAM') {
      const fullText = `
${telegramInput.routingRecipients.map(r => `${r.code}    ${r.office}`).join('\n')}
${telegramInput.telegramNo}                              ရက်စွဲ/အချိန်: ${telegramInput.dateTimeGroup}

${telegramInput.paragraphs.slice(0, 3).join('\n\n')}

${telegramInput.personnelList.map(p => `${p.code} ${p.serialNo}   ${p.rankName}   ${p.station}`).join('\n')}

${telegramInput.paragraphs.slice(3).join('\n\n')}

------------------------------------------------------
${telegramInput.dispatchMethod}                       ${telegramInput.securityLevel}
(လက်မှတ်)
${telegramInput.signatoryTitle}
${telegramInput.signatoryName}
      `.trim();
      navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    const fullText = `
${formInput.classification !== 'NONE' ? getClassificationLabel(formInput.classification) : ''}
${formInput.urgency !== 'ORDINARY' ? getUrgencyLabel(formInput.urgency) : ''}
${formInput.department}
${formInput.ministry}
${formInput.officeLocation}
စာအမှတ်၊ ${formInput.docNumber}
ရက်စွဲ၊ ${formatMyanmarDate(formInput.date)}

သို့
    ${formInput.recipient}

အကြောင်းအရာ။    ။ ${formInput.subject}
${formInput.referenceText ? `ရည်ညွှန်းချက် ။    ။ ${formInput.referenceText}` : ''}

${formInput.bodyParagraphs.join('\n\n')}

                                        (${formInput.senderName})
                                        ${formInput.senderTitle}

မိတ္တူကို -
${formInput.copyTo.map((c, i) => `${toMyanmarDigits(i + 1)}။    ${c}`).join('\n')}
${formInput.classification !== 'NONE' ? getClassificationLabel(formInput.classification) : ''}
    `.trim();

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const getClassificationLabel = (cls: string): string => {
    switch (cls) {
      case 'RESTRICTED': return 'ကန့်သတ်';
      case 'CONFIDENTIAL': return 'အတွင်းရေး';
      case 'SECRET': return 'လျှို့ဝှက်';
      case 'TOP_SECRET': return 'ထိပ်တန်းလျှို့ဝှက်';
      default: return '';
    }
  };

  const getUrgencyLabel = (urg: string): string => {
    switch (urg) {
      case 'IMMEDIATE': return 'ချက်ခြင်း';
      case 'URGENT': return 'အမြန်';
      case 'IMPORTANT': return 'အရေးကြီး';
      default: return '';
    }
  };

  const currentDistricts = getDistricts(selectedRegionId);
  const currentTownships = getTownships(selectedRegionId, selectedDistrictId);

  return (
    <div className="space-y-5 pb-28 max-w-4xl mx-auto w-full overflow-x-hidden">
      {/* iOS 27 Large Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pt-1 px-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          ရုံးစာနှင့် ကြေးနန်း
        </h1>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 self-start sm:self-auto">
          <Check className="w-3.5 h-3.5 shrink-0" />
          <span>{autoSaveStatus}</span>
        </span>
      </div>

      {/* Inline Toast Banner */}
      {toastBanner && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in ${
            toastBanner.kind === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastBanner.kind === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            ) : (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            <span>{toastBanner.text}</span>
          </div>
          <button type="button" onClick={() => setToastBanner(null)} className="p-1 rounded-lg opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sleek Action Toolbar with Document Mode Switcher */}
      <div className="ios-grouped-card flex flex-wrap items-center justify-between gap-2.5 p-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Location Settings Button */}
          <button
            type="button"
            onClick={() => setShowLocationModal(true)}
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 font-bold text-xs flex items-center gap-1.5 transition"
            title="တိုင်း/ခရိုင်/မြို့နယ် တည်နေရာ ဆက်တင်"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="max-w-[140px] sm:max-w-[200px] truncate">
              {findTownshipLocationInfo(selectedTownshipId).fullLocationMM || 'ရုံးတည်နေရာ'}
            </span>
            <Settings2 className="w-3 h-3 text-slate-500 dark:text-zinc-400 shrink-0" />
          </button>

          {/* Document Type Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/75 dark:bg-zinc-800 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setDocMode('COVER_LETTER')}
              className={`min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                docMode === 'COVER_LETTER'
                  ? 'bg-white dark:bg-zinc-700 text-blue-800 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>ရုံးစာ</span>
            </button>
            <button
              type="button"
              onClick={() => setDocMode('TELEGRAM')}
              className={`min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                docMode === 'TELEGRAM'
                  ? 'bg-white dark:bg-zinc-700 text-purple-800 dark:text-purple-200 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-amber-500" />
              <span>ကြေးနန်းစာ</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/75 dark:bg-zinc-800 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'edit'
                ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ရိုက်ထည့်မည်
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            စာရွက်ကြည့်မည်
          </button>
        </div>
      </div>

      {/* Quick Preset Strip (when in Cover Letter edit mode) */}
      {activeTab === 'edit' && docMode === 'COVER_LETTER' && displayPresets.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 px-0.5">
          <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 shrink-0">စာပုံစံများ:</span>
          {displayPresets.slice(0, 8).map((preset) => {
            const active = selectedPresetId === preset.id;
            return (
              <div key={preset.id} className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`min-h-[34px] px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    active
                      ? 'bg-blue-700 dark:bg-blue-600 text-white'
                      : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {preset.title}
                </button>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => handleOpenEditPreset()}
            className="min-h-[34px] px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-blue-700 dark:text-blue-400 font-bold text-xs whitespace-nowrap shrink-0"
          >
            + ပုံစံသစ်
          </button>
        </div>
      )}

      {activeTab === 'edit' ? (
        docMode === 'TELEGRAM' ? (
          /* Dedicated Telegram Form Controls */
          <div className="ios-grouped-card p-5 space-y-4 text-slate-900 dark:text-zinc-100">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-xs font-extrabold flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                <span>တရားဝင် ကြေးနန်းစာ ရေးသားခြင်း</span>
              </h3>
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                တံဆိပ်တုံးနေရာ လွတ်ထားမည်
              </span>
            </div>

            {/* Row 1: Telegram No & DateTime Group (DTG) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-purple-50/60 dark:bg-purple-950/30 p-3.5 rounded-2xl border border-purple-100 dark:border-purple-900/50">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  ကြေးနန်းစာအမှတ် (Telegram Reference No.)
                </label>
                <input
                  type="text"
                  value={telegramInput.telegramNo}
                  onChange={(e) => setTelegramInput({ ...telegramInput, telegramNo: e.target.value })}
                  placeholder="e.g. ၀၀၆ / အခမ ၊ ၊"
                  className="w-full min-h-[42px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:border-purple-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  ရက်စွဲ/အချိန် (Date-Time Group / DTG)
                </label>
                <input
                  type="text"
                  value={telegramInput.dateTimeGroup}
                  onChange={(e) => setTelegramInput({ ...telegramInput, dateTimeGroup: e.target.value })}
                  placeholder="e.g. ၂၀၂၆ ဇန် ၂၂ ၁၆၀၀"
                  className="w-full min-h-[42px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:border-purple-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Routing Recipients List */}
            <div className="space-y-2 bg-slate-50 dark:bg-zinc-900/80 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                  ထိပ်စီး လမ်းကြောင်းနှင့် လက်ခံသူများ (ပ၊ လ၊ တ...)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const letters = ['(ပ)', '(လ)', '(တ)', '(က)', '(ခ)', '(ဂ)'];
                    const nextCode = letters[telegramInput.routingRecipients.length] || `(${toMyanmarDigits(telegramInput.routingRecipients.length + 1)})`;
                    setTelegramInput({
                      ...telegramInput,
                      routingRecipients: [...telegramInput.routingRecipients, { code: nextCode, office: '' }]
                    });
                  }}
                  className="text-xs text-purple-800 dark:text-purple-400 font-bold hover:underline"
                >
                  + လက်ခံသူ ထည့်မည်
                </button>
              </div>

              {telegramInput.routingRecipients.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={item.code}
                    onChange={(e) => {
                      const updated = [...telegramInput.routingRecipients];
                      updated[idx].code = e.target.value;
                      setTelegramInput({ ...telegramInput, routingRecipients: updated });
                    }}
                    className="w-16 min-h-[40px] bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2 py-1.5 text-xs text-slate-900 dark:text-white font-bold text-center"
                  />
                  <input
                    type="text"
                    value={item.office}
                    onChange={(e) => {
                      const updated = [...telegramInput.routingRecipients];
                      updated[idx].office = e.target.value;
                      setTelegramInput({ ...telegramInput, routingRecipients: updated });
                    }}
                    placeholder="e.g. ခရမ၊ လဝပ၊ မူဆယ်"
                    className="flex-1 min-h-[40px] bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-medium"
                  />
                  {telegramInput.routingRecipients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = telegramInput.routingRecipients.filter((_, i) => i !== idx);
                        setTelegramInput({ ...telegramInput, routingRecipients: updated });
                      }}
                      className="text-slate-400 hover:text-rose-600 p-2 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Paragraphs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                  ကြေးနန်း စာပိုဒ်များ
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setTelegramInput({
                      ...telegramInput,
                      paragraphs: [...telegramInput.paragraphs, `(${toMyanmarDigits(telegramInput.paragraphs.length + 1)})    `]
                    });
                  }}
                  className="text-xs text-purple-800 dark:text-purple-400 font-bold hover:underline"
                >
                  + စာပိုဒ် ထည့်မည်
                </button>
              </div>

              {telegramInput.paragraphs.map((p, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 pt-2.5 shrink-0 w-6 text-right">
                    {idx + 1}။
                  </span>
                  <textarea
                    rows={2}
                    value={p}
                    onChange={(e) => {
                      const updated = [...telegramInput.paragraphs];
                      updated[idx] = e.target.value;
                      setTelegramInput({ ...telegramInput, paragraphs: updated });
                    }}
                    className="flex-1 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white font-medium focus:border-purple-600 focus:outline-none"
                  />
                  {telegramInput.paragraphs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = telegramInput.paragraphs.filter((_, i) => i !== idx);
                        setTelegramInput({ ...telegramInput, paragraphs: updated });
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1.5 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Personnel List */}
            <div className="space-y-2 bg-slate-50 dark:bg-zinc-900/80 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                  အရာထမ်း/အမှုထမ်း စာရင်းဇယား
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const letters = ['(က)', '(ခ)', '(ဂ)', '(ဃ)', '(င)', '(စ)', '(ဆ)'];
                    const nextCode = letters[telegramInput.personnelList.length] || `(${telegramInput.personnelList.length + 1})`;
                    setTelegramInput({
                      ...telegramInput,
                      personnelList: [
                        ...telegramInput.personnelList,
                        { code: nextCode, serialNo: 'လဝက-', rankName: 'ဒု-လဝကမှူး ', station: '' }
                      ]
                    });
                  }}
                  className="text-xs text-purple-800 dark:text-purple-400 font-bold hover:underline"
                >
                  + ဝန်ထမ်း ထည့်မည်
                </button>
              </div>

              {telegramInput.personnelList.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-1.5 items-center">
                  <input
                    type="text"
                    value={row.code}
                    onChange={(e) => {
                      const updated = [...telegramInput.personnelList];
                      updated[idx].code = e.target.value;
                      setTelegramInput({ ...telegramInput, personnelList: updated });
                    }}
                    className="col-span-2 min-h-[38px] bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2 py-1.5 text-xs text-slate-900 dark:text-white text-center font-bold"
                  />
                  <input
                    type="text"
                    value={row.serialNo}
                    placeholder="လဝက-၁၆၉၇၅"
                    onChange={(e) => {
                      const updated = [...telegramInput.personnelList];
                      updated[idx].serialNo = e.target.value;
                      setTelegramInput({ ...telegramInput, personnelList: updated });
                    }}
                    className="col-span-3 min-h-[38px] bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2 py-1.5 text-xs text-slate-900 dark:text-white font-medium"
                  />
                  <input
                    type="text"
                    value={row.rankName}
                    placeholder="ဒု-လဝကမှူး ..."
                    onChange={(e) => {
                      const updated = [...telegramInput.personnelList];
                      updated[idx].rankName = e.target.value;
                      setTelegramInput({ ...telegramInput, personnelList: updated });
                    }}
                    className="col-span-4 min-h-[38px] bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2 py-1.5 text-xs text-slate-900 dark:text-white font-medium"
                  />
                  <input
                    type="text"
                    value={row.station}
                    placeholder="မြို့နယ်"
                    onChange={(e) => {
                      const updated = [...telegramInput.personnelList];
                      updated[idx].station = e.target.value;
                      setTelegramInput({ ...telegramInput, personnelList: updated });
                    }}
                    className="col-span-2 min-h-[38px] bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2 py-1.5 text-xs text-slate-900 dark:text-white font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = telegramInput.personnelList.filter((_, i) => i !== idx);
                      setTelegramInput({ ...telegramInput, personnelList: updated });
                    }}
                    className="col-span-1 text-slate-400 hover:text-rose-600 p-1 text-xs font-bold text-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Dispatch method & Security rating */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                  ပေးပို့သည့်နည်းလမ်း
                </label>
                <input
                  type="text"
                  value={telegramInput.dispatchMethod}
                  onChange={(e) => setTelegramInput({ ...telegramInput, dispatchMethod: e.target.value })}
                  className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:border-purple-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                  အဆင့်အတန်း
                </label>
                <input
                  type="text"
                  value={telegramInput.securityLevel}
                  onChange={(e) => setTelegramInput({ ...telegramInput, securityLevel: e.target.value })}
                  className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:border-purple-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Signatory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                  လက်မှတ်ထိုးသူ ရာထူး
                </label>
                <input
                  type="text"
                  value={telegramInput.signatoryTitle}
                  onChange={(e) => setTelegramInput({ ...telegramInput, signatoryTitle: e.target.value })}
                  className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:border-purple-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                  လက်မှတ်ထိုးသူ အမည်
                </label>
                <input
                  type="text"
                  value={telegramInput.signatoryName}
                  onChange={(e) => setTelegramInput({ ...telegramInput, signatoryName: e.target.value })}
                  className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:border-purple-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-purple-800 hover:bg-purple-700 text-white font-bold text-xs ios-press"
              >
                ကြေးနန်းစာ ပုံစံ ကြည့်မည် →
              </button>
            </div>
          </div>
        ) : (
          /* Cover Letter Form Controls */
          <div className="ios-grouped-card p-5 space-y-4 text-slate-900 dark:text-zinc-100">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-xs font-extrabold flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>ရုံးစာ (အပေါ်စာ) အသေးစိတ် အချက်အလက်များ</span>
              </h3>
              <button
                type="button"
                onClick={handleSaveCurrentAsPreset}
                className="text-[11px] font-bold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>လက်ရှိ စာပုံစံအား Preset သိမ်းမည်</span>
              </button>
            </div>

          {/* Classifications & Urgency Selectors (Dropdowns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-blue-50/70 dark:bg-blue-950/30 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-900/50">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1">
                လုံခြုံမှုအဆင့်အတန်း
              </label>
              <select
                value={formInput.classification}
                onChange={(e) => setFormInput({ ...formInput, classification: e.target.value as any })}
                className="w-full min-h-[42px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold focus:border-blue-600 focus:outline-none"
              >
                <option value="NONE">ဖြုတ်ထားတာ (မပါတာ)</option>
                <option value="RESTRICTED">ကန့်သတ် (Restricted)</option>
                <option value="CONFIDENTIAL">အတွင်းရေး (Confidential)</option>
                <option value="SECRET">လျှို့ဝှက် (Secret)</option>
                <option value="TOP_SECRET">ထိပ်တန်းလျှို့ဝှက် (Top Secret)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1">
                ဦးစားပေးအဆင့်အတန်း
              </label>
              <select
                value={formInput.urgency}
                onChange={(e) => setFormInput({ ...formInput, urgency: e.target.value as any })}
                className="w-full min-h-[42px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold focus:border-blue-600 focus:outline-none"
              >
                <option value="ORDINARY">၁။ ရိုးရိုး (Ordinary)</option>
                <option value="IMPORTANT">၂။ အရေးကြီး (Important)</option>
                <option value="URGENT">၃။ အမြန် (Urgent)</option>
                <option value="IMMEDIATE">၄။ ချက်ခြင်း (Immediate)</option>
              </select>
            </div>
          </div>

          {/* Letter Layout Type Selector Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
              စာ အမျိုးအစား ပုံစံ
            </label>
            <select
              value={formInput.letterType}
              onChange={(e) => setFormInput({ ...formInput, letterType: e.target.value as LetterType })}
              className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold focus:border-blue-600 focus:outline-none"
            >
              <option value="COVER_LETTER">ရုံးစာ (အပေါ်စာ / Cover Letter)</option>
              <option value="TELEGRAM">ကြေးနန်းစာ (Telegram)</option>
              <option value="OFFICE_ORDER">ရုံးတွင်းအမိန့်စာ (Office Order)</option>
              <option value="VERIFY_REPLY">စိစစ်ပြန်ကြားစာ (Verification Reply)</option>
              <option value="RECOMMENDATION">ထောက်ခံစာ (Recommendation Letter)</option>
              <option value="CUSTOM">စိတ်ကြိုက် ရုံးစာ (Custom)</option>
            </select>
          </div>

          {/* Document Number & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                စာအမှတ် (Document Ref No.)
              </label>
              <input
                type="text"
                value={formInput.docNumber}
                onChange={(e) => setFormInput({ ...formInput, docNumber: e.target.value })}
                className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold focus:border-blue-600 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                ရက်စွဲ (Date)
              </label>
              <input
                type="date"
                value={formInput.date}
                onChange={(e) => setFormInput({ ...formInput, date: e.target.value })}
                className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold focus:border-blue-600 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Department Selector Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                ဌာန / ဦးစီးမှူးရုံး
              </label>
              <select
                value={customDept ? 'CUSTOM' : formInput.department}
                onChange={(e) => {
                  if (e.target.value === 'CUSTOM') {
                    setCustomDept(true);
                  } else {
                    setCustomDept(false);
                    setFormInput({ ...formInput, department: e.target.value });
                  }
                }}
                className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold focus:border-blue-600 focus:outline-none"
              >
                {DEPARTMENT_OPTIONS.map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt === 'CUSTOM' ? 'အခြား (စိတ်ကြိုက် ရိုက်ထည့်မည်)' : opt}
                  </option>
                ))}
              </select>
              {customDept && (
                <input
                  type="text"
                  value={formInput.department}
                  onChange={(e) => setFormInput({ ...formInput, department: e.target.value })}
                  placeholder="ဌာနအမည် ရိုက်ထည့်ပါ..."
                  className="w-full mt-2 min-h-[40px] bg-white dark:bg-zinc-800 border border-blue-500 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-semibold"
                />
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                ရုံးတည်နေရာ / မြို့
              </label>
              <input
                type="text"
                value={formInput.officeLocation}
                onChange={(e) => setFormInput({ ...formInput, officeLocation: e.target.value })}
                className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none transition font-semibold"
              />
            </div>
          </div>

          {/* 1. Recipient */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400">
                ပေးပို့ခြင်း (Recipient Dropdown)
              </label>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    setFormInput({ ...formInput, recipient: e.target.value });
                  }
                }}
                className="text-[11px] bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
              >
                <option value="">▼ မာစတာဒေတာမှ ရွေးရန်</option>
                {masterData.recipients.map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt.replace(/\n/g, ' - ')}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              rows={2}
              value={formInput.recipient}
              onChange={(e) => setFormInput({ ...formInput, recipient: e.target.value })}
              placeholder="ပေးပို့မည့် ဌာန/ရာထူး ရိုက်ထည့်ပါ..."
              className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:border-blue-600 focus:outline-none transition"
            />
          </div>

          {/* 2. Subject Header */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400">
                အကြောင်းအရာ (Subject Header Dropdown)
              </label>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    setFormInput({ ...formInput, subject: e.target.value });
                  }
                }}
                className="text-[11px] bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
              >
                <option value="">▼ မာစတာဒေတာမှ ရွေးရန်</option>
                {masterData.subjects.map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="text"
              value={formInput.subject}
              onChange={(e) => setFormInput({ ...formInput, subject: e.target.value })}
              placeholder="အကြောင်းအရာ ရိုက်ထည့်ပါ..."
              className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold focus:border-blue-600 focus:outline-none transition"
            />
          </div>

          {/* 3. Reference Text (Optional) */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400">
                ရည်ညွှန်းချက် (Reference Text - Optional)
              </label>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    setFormInput({ ...formInput, referenceText: e.target.value });
                  }
                }}
                className="text-[11px] bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
              >
                <option value="">▼ မာစတာဒေတာမှ ရွေးရန်</option>
                {masterData.referenceTexts.map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="text"
              value={formInput.referenceText}
              onChange={(e) => setFormInput({ ...formInput, referenceText: e.target.value })}
              placeholder="ရည်ညွှန်းချက် ရိုက်ထည့်ပါ (Optional)..."
              className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:border-blue-600 focus:outline-none transition"
            />
          </div>

          {/* Body Paragraphs List */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400">
              အကြောင်းအရာ အပြည့်အစုံ စာပိုဒ်များ
            </label>
            {formInput.bodyParagraphs.map((para, index) => (
              <div key={index} className="flex gap-2 items-start">
                <textarea
                  rows={3}
                  value={para}
                  onChange={(e) => {
                    const newArr = [...formInput.bodyParagraphs];
                    newArr[index] = e.target.value;
                    setFormInput({ ...formInput, bodyParagraphs: newArr });
                  }}
                  className="flex-1 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white leading-relaxed focus:border-blue-600 focus:outline-none transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newArr = formInput.bodyParagraphs.filter((_, i) => i !== index);
                    setFormInput({ ...formInput, bodyParagraphs: newArr });
                  }}
                  className="text-slate-400 hover:text-rose-600 p-2 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const nextIdx = toMyanmarDigits(formInput.bodyParagraphs.length + 1);
                setFormInput({
                  ...formInput,
                  bodyParagraphs: [...formInput.bodyParagraphs, `${nextIdx}။    `]
                });
              }}
              className="text-xs text-blue-700 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 py-1"
            >
              + စာပိုဒ်အသစ် ထပ်ထည့်မည်
            </button>
          </div>

          {/* 4 & 5. Signatory Title & Signatory Name Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400">
                  လက်မှတ်ထိုးသူ၏ ရာထူး
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      setFormInput({ ...formInput, senderTitle: e.target.value });
                    }
                  }}
                  className="text-[11px] bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
                >
                  <option value="">▼ မာစတာဒေတာမှ ရွေးရန်</option>
                  {masterData.senderTitles.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                value={formInput.senderTitle}
                onChange={(e) => setFormInput({ ...formInput, senderTitle: e.target.value })}
                placeholder="ရာထူး ရိုက်ထည့်ပါ..."
                className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold focus:border-blue-600 focus:outline-none transition"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400">
                  လက်မှတ်ထိုးသူ၏ အမည်
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      setFormInput({ ...formInput, senderName: e.target.value });
                    }
                  }}
                  className="text-[11px] bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
                >
                  <option value="">▼ မာစတာဒေတာမှ ရွေးရန်</option>
                  {masterData.senderNames.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                value={formInput.senderName}
                onChange={(e) => setFormInput({ ...formInput, senderName: e.target.value })}
                placeholder="အမည် ရိုက်ထည့်ပါ..."
                className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold focus:border-blue-600 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Copy To List */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400">
              မိတ္တူကို
            </label>
            {formInput.copyTo.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 w-6 text-right shrink-0">
                  {toMyanmarDigits(idx + 1)}။
                </span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newCopies = [...formInput.copyTo];
                    newCopies[idx] = e.target.value;
                    setFormInput({ ...formInput, copyTo: newCopies });
                  }}
                  className="flex-1 min-h-[40px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newCopies = formInput.copyTo.filter((_, i) => i !== idx);
                    setFormInput({ ...formInput, copyTo: newCopies });
                  }}
                  className="text-slate-400 hover:text-rose-600 p-1.5 text-xs font-bold shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormInput({ ...formInput, copyTo: [...formInput.copyTo, ''] })}
              className="text-xs text-blue-700 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 py-1"
            >
              + မိတ္တူပေးပို့ရန်နေရာ ထပ်ထည့်မည်
            </button>
          </div>

          {/* Submit Action Button */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs ios-press"
            >
              ရုံးစာ ပုံစံ ကြည့်မည် →
            </button>
          </div>
        </div>
      )) : (
        /* Preview Official Document Letter Card (Exact Match to Official Myanmar Letter Layout) */
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="ios-grouped-card flex flex-wrap items-center justify-between gap-2 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50 ios-press"
              >
                {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>{isGeneratingPdf ? 'PDF ပြုလုပ်နေသည်...' : 'PDF ရယူရန်'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareViber}
                disabled={isSharing}
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50 ios-press"
              >
                {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{isSharing ? 'မျှဝေနေသည်...' : 'ဗိုင်ဘာသို့'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-100 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>ပရင့်</span>
              </button>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl text-xs">
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as 'A4' | 'LEGAL')}
                  className="bg-white dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 rounded-lg px-2 py-1 font-bold text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="A4">A4</option>
                  <option value="LEGAL">Legal</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setShowMarginSettings(!showMarginSettings)}
                className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  showMarginSettings
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-100'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>ဘောင်များ</span>
              </button>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl text-xs">
                <select
                  value={zoomFit ? 'FIT' : '100%'}
                  onChange={(e) => setZoomFit(e.target.value === 'FIT')}
                  className="bg-white dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 rounded-lg px-2 py-1 font-bold text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="FIT">Fit View</option>
                  <option value="100%">100%</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleCopyText}
                className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-100 font-bold text-xs flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'ကူးယူပြီး' : 'ကူးယူ'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveRecord}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition ios-press"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'သိမ်းဆည်းပြီး' : 'မှတ်တမ်းသိမ်းမည်'}</span>
            </button>
          </div>

          {/* Interactive Live Margins Control Panel */}
          {showMarginSettings && (
            <div className="ios-grouped-card p-4 space-y-3 animate-in fade-in text-slate-900 dark:text-zinc-100">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  <span className="text-xs font-extrabold">
                    စာရွက် အနားသတ် ဘောင်များ (Live Margin Adjustments)
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 font-mono">
                  Top: {marginTop}" · Bottom: {marginBottom}" · Left: {marginLeft}" · Right: {marginRight}"
                </div>
              </div>

              {/* Default Reset Button */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
                  Default ဘောင်အချိုး:
                </span>
                <button
                  type="button"
                  onClick={() => { setMarginTop(0.25); setMarginBottom(0.25); setMarginLeft(1.0); setMarginRight(0.25); }}
                  className="min-h-[36px] px-3 py-1 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white transition"
                >
                  Reset Default (0.25" / 1")
                </button>
              </div>

              {/* Live Sliders */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-zinc-900/80 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                    <span>အပေါ် (Top)</span>
                    <span className="text-blue-700 dark:text-blue-400 font-mono">{marginTop}"</span>
                  </div>
                  <input
                    type="range"
                    min="0.25"
                    max="4.0"
                    step="0.05"
                    value={marginTop}
                    onChange={(e) => setMarginTop(parseFloat(e.target.value))}
                    className="w-full accent-blue-700 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                    <span>အောက် (Bottom)</span>
                    <span className="text-blue-700 dark:text-blue-400 font-mono">{marginBottom}"</span>
                  </div>
                  <input
                    type="range"
                    min="0.25"
                    max="4.0"
                    step="0.05"
                    value={marginBottom}
                    onChange={(e) => setMarginBottom(parseFloat(e.target.value))}
                    className="w-full accent-blue-700 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                    <span>ဘယ် (Left)</span>
                    <span className="text-blue-700 dark:text-blue-400 font-mono">{marginLeft}"</span>
                  </div>
                  <input
                    type="range"
                    min="0.25"
                    max="3.0"
                    step="0.05"
                    value={marginLeft}
                    onChange={(e) => setMarginLeft(parseFloat(e.target.value))}
                    className="w-full accent-blue-700 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                    <span>ညာ (Right)</span>
                    <span className="text-blue-700 dark:text-blue-400 font-mono">{marginRight}"</span>
                  </div>
                  <input
                    type="range"
                    min="0.25"
                    max="4.0"
                    step="0.05"
                    value={marginRight}
                    onChange={(e) => setMarginRight(parseFloat(e.target.value))}
                    className="w-full accent-blue-700 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Print Stylesheet with Live Margins */}
          <style>{`
            @media print {
              @page {
                size: ${pageSize === 'LEGAL' ? 'legal portrait' : 'A4 portrait'};
                margin: 0;
              }
              body {
                background: white !important;
                color: black !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              #print-area {
                transform: none !important;
                width: ${pageSize === 'LEGAL' ? '8.5in' : '8.27in'} !important;
                min-height: ${pageSize === 'LEGAL' ? '14in' : '11.69in'} !important;
                padding-top: ${marginTop}in !important;
                padding-bottom: ${marginBottom}in !important;
                padding-left: ${marginLeft}in !important;
                padding-right: ${marginRight}in !important;
                font-size: 13pt !important;
                box-shadow: none !important;
                border: none !important;
                margin: 0 auto !important;
              }
              #print-area * {
                font-size: 13pt !important;
              }
            }
          `}</style>

          {/* Scrollable & Auto-Scaling Preview Paper Container for Mobile Screen Fit */}
          <div
            ref={containerRef}
            className="w-full overflow-x-auto bg-slate-200/70 dark:bg-zinc-900/90 p-2 sm:p-4 rounded-3xl border border-slate-300 dark:border-zinc-800 flex justify-center items-start min-h-[450px]"
          >
            <div
              style={{
                width: zoomFit && scale < 1
                  ? `${(pageSize === 'LEGAL' ? 816 : 794) * scale}px`
                  : (pageSize === 'LEGAL' ? '8.5in' : '8.27in'),
                height: zoomFit && scale < 1
                  ? `calc(${pageSize === 'LEGAL' ? '14in' : '11.69in'} * ${scale} + 12px)`
                  : undefined,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                overflow: 'hidden',
              }}
            >
              {/* Official Letter Paper Layout with Live Dynamic Padding */}
              <div
                id="print-area"
                className="bg-white text-slate-900 shadow-2xl space-y-6 font-serif border border-slate-300 relative text-[13pt] leading-normal shrink-0"
                style={{
                  width: pageSize === 'LEGAL' ? '8.5in' : '8.27in',
                  minHeight: pageSize === 'LEGAL' ? '14in' : '11.69in',
                  paddingTop: `${marginTop}in`,
                  paddingBottom: `${marginBottom}in`,
                  paddingLeft: `${marginLeft}in`,
                  paddingRight: `${marginRight}in`,
                  fontSize: '13pt',
                  boxSizing: 'border-box',
                  transform: zoomFit && scale < 1 ? `scale(${scale})` : 'none',
                  transformOrigin: 'top center',
                }}
              >
                {docMode === 'TELEGRAM' ? (
                  /* Dedicated Telegram Paper Layout (IMG_7026 Authentic Myanmar Government Telegram) */
                  <div className="space-y-5 font-serif text-[12pt] leading-relaxed text-slate-900">
                    {/* Header: Left (Routing & Telegram Ref No), Center (100% Blank Area for rubber stamp), Right (Date-Time Group) */}
                    <div className="flex justify-between items-start gap-4 pt-1 font-serif">
                      {/* Left: Routing List & Telegram Ref No */}
                      <div className="space-y-1.5 min-w-[210px] text-left">
                        {telegramInput.routingRecipients.map((r, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-[12pt]">
                            <span className="font-bold shrink-0">{r.code}</span>
                            <span className="font-medium">{r.office}</span>
                          </div>
                        ))}

                        <div className="pt-3 font-bold text-[13pt] tracking-wider text-slate-900">
                          {telegramInput.telegramNo}
                        </div>
                      </div>

                      {/* Center: Blank Rubber Seal Area (STRICT REQUIREMENT: "တံဆိပ်တုံးနေရာက ဘာမှ မထည့်ပါနဲ့ ထုတ်ပြီးမှ ထုမှာ") */}
                      <div className="w-36 h-28 shrink-0" aria-label="Reserved blank space for physical rubber seal stamp" />

                      {/* Right: Date-Time Group (DTG) */}
                      <div className="text-right min-w-[170px] pt-1">
                        <span className="text-[12pt] font-bold text-slate-900 block">
                          {telegramInput.dateTimeGroup}
                        </span>
                      </div>
                    </div>

                    {/* Body Paragraphs & Personnel Sub-Table */}
                    <div className="space-y-3.5 pt-3 text-justify font-serif">
                      {telegramInput.paragraphs.map((p, idx) => {
                        // In Myanmar Telegram format, Paragraph 3 (idx 2) is followed by personnel list sub-table if present
                        const isPara3 = idx === 2;
                        return (
                          <div key={idx} className="space-y-2">
                            <p className="text-[12pt] leading-relaxed whitespace-pre-wrap">
                              {p}
                            </p>

                            {isPara3 && telegramInput.personnelList && telegramInput.personnelList.length > 0 && (
                              <div className="pl-6 py-2 space-y-1 font-serif">
                                {telegramInput.personnelList.map((row, pIdx) => (
                                  <div key={pIdx} className="grid grid-cols-12 gap-2 text-[11.5pt] leading-snug">
                                    <span className="col-span-1 font-bold text-right pr-1">{row.code}</span>
                                    <span className="col-span-3 font-medium">{row.serialNo}</span>
                                    <span className="col-span-5 font-medium">{row.rankName}</span>
                                    <span className="col-span-3 font-medium">{row.station}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer Section: Dashed Line, Dispatch Method, Signature space, Signatory Title & Name, Security Level */}
                    <div className="pt-6 font-serif">
                      <div className="border-t border-dashed border-slate-700 w-full mb-3" />
                      <div className="flex justify-between items-start pt-1">
                        {/* Left: Dispatch Method & Signatory Info */}
                        <div className="space-y-1 text-left">
                          <p className="text-[12pt] font-medium">{telegramInput.dispatchMethod}</p>
                          {/* Physical Signature Reserved Blank Space */}
                          <div className="h-12 flex items-end text-xs text-slate-300 select-none no-print">
                            (လက်မှတ်ရေးထိုးရန် နေရာလွတ်)
                          </div>
                          <p className="text-[12pt] font-medium">{telegramInput.signatoryTitle}</p>
                          <p className="text-[12pt] font-medium">{telegramInput.signatoryName}</p>
                        </div>

                        {/* Right: Security Level */}
                        <div className="text-right pt-1">
                          <p className="text-[12pt] font-medium">{telegramInput.securityLevel}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Official Cover Letter Paper Layout */
                  <>
                    {/* Top Centered Classification Stamp */}
                    {formInput.classification !== 'NONE' && (
                      <div className="text-center">
                        <span className="font-serif font-normal text-[13pt] tracking-wider text-slate-900 inline-block px-4">
                          {getClassificationLabel(formInput.classification)}
                        </span>
                      </div>
                    )}

                    {/* Top Urgency Priority Stamp */}
                    {formInput.urgency !== 'ORDINARY' && (
                      <div className="text-left font-serif font-bold text-[13pt] text-rose-800 tracking-wider">
                        [{getUrgencyLabel(formInput.urgency)}]
                      </div>
                    )}

                    {/* Header Lockup: Left Reserved Area & Right Department Address Justified */}
                    <div className="flex justify-between items-start pt-2">
                      <div className="w-28 h-28 shrink-0"></div>

                      <div 
                        className="w-[280px] sm:w-[320px] text-[13pt] font-serif space-y-1 font-normal text-slate-900 shrink-0 text-right"
                      >
                        <p className="font-normal text-[13pt]">{formInput.department}</p>
                        <p className="font-normal text-[13pt]">{formInput.ministry}</p>
                        <p className="font-normal text-[13pt]">{formInput.officeLocation}</p>
                        <p className="pt-2 font-normal text-[13pt]">စာအမှတ်၊ {formInput.docNumber}</p>
                        <p className="font-normal text-[13pt]">ရက်စွဲ၊ {formatMyanmarDate(formInput.date)}</p>
                      </div>
                    </div>

                    {/* Recipient ("သို့ / ဌာနမှူး") Block */}
                    <div className="pt-4 text-[13pt] space-y-1 font-serif">
                      <span className="font-bold text-[13pt] block">သို့</span>
                      <div className="pl-6 font-bold text-[13pt] whitespace-pre-line leading-snug">
                        {formInput.recipient}
                      </div>
                    </div>

                    {/* Subject & Reference Block */}
                    <div className="pt-4 text-[13pt] font-serif space-y-2">
                      <div className="flex items-start">
                        <span className="font-bold text-[13pt] shrink-0 w-28">အကြောင်းအရာ။</span>
                        <span className="font-bold text-[13pt]">   ။ </span>
                        <span className="font-bold text-[13pt] pl-2 underline underline-offset-4">{formInput.subject}</span>
                      </div>

                      {formInput.referenceText && (
                        <div className="flex items-start">
                          <span className="font-bold text-[13pt] shrink-0 w-28">ရည်ညွှန်းချက် ။</span>
                          <span className="font-bold text-[13pt]">   ။ </span>
                          <span className="font-medium text-[13pt] pl-2 leading-relaxed">{formInput.referenceText}</span>
                        </div>
                      )}
                    </div>

                    {/* Paragraph Content */}
                    <div className="space-y-4 pt-4 text-[13pt] leading-relaxed text-justify font-serif">
                      {formInput.bodyParagraphs.map((paragraph, index) => (
                        <p key={index} className="leading-relaxed text-[13pt]">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    {/* Sign Off Block */}
                    <div className="pt-10 flex justify-end font-serif">
                      <div className="text-center space-y-1 min-w-[220px]">
                        <div className="h-10 flex items-end justify-center pb-1 text-[13pt] text-slate-400">
                          (လက်မှတ်)
                        </div>
                        <p className="font-normal text-[13pt]">({formInput.senderTitle}ကိုယ်စား)</p>
                        <p className="font-normal text-[13pt]">{formInput.senderName}</p>
                      </div>
                    </div>

                    {/* Copy To Block */}
                    <div className="pt-6 text-[13pt] space-y-1 font-serif">
                      <span className="font-bold text-[13pt] block">မိတ္တူကို</span>
                      {formInput.copyTo.map((c, idx) => (
                        <p key={idx} className="pl-4 text-[13pt] text-slate-800">
                          {toMyanmarDigits(idx + 1)}။    {c}
                        </p>
                      ))}
                    </div>

                    {/* Bottom Centered Classification Stamp */}
                    {formInput.classification !== 'NONE' && (
                      <div className="text-center pt-4">
                        <span className="font-serif font-normal text-[13pt] tracking-wider text-slate-900 inline-block px-4">
                          {getClassificationLabel(formInput.classification)}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Current Form as Preset Prompt Modal (replaces window.prompt/alert) */}
      {showSavePresetPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4 text-slate-900 dark:text-zinc-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>Preset စာပုံစံ အသစ်သိမ်းမည်</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSavePresetPromptModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={submitSaveCurrentAsPreset} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                  Preset စာခေါင်းစဉ် *
                </label>
                <input
                  type="text"
                  required
                  value={savePresetPromptTitle}
                  onChange={(e) => setSavePresetPromptTitle(e.target.value)}
                  placeholder="ခေါင်းစဉ် ရိုက်ထည့်ပါ..."
                  className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSavePresetPromptModal(false)}
                  className="min-h-[40px] px-4 py-2 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] px-4 py-2 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold"
                >
                  သိမ်းဆည်းမည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Preset Modal */}
      {confirmDeletePresetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4 text-slate-900 dark:text-zinc-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold">Preset ဖျက်ပစ်ရန်</h3>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeletePresetId(null)}
                className="min-h-[40px] px-4 py-2 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold text-xs"
              >
                မလုပ်တော့ပါ
              </button>
              <button
                type="button"
                onClick={confirmDeletePreset}
                className="min-h-[40px] px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                ဖျက်ပစ်မည်
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / New Preset Management Modal */}
      {showPresetManagerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4 text-slate-900 dark:text-zinc-100 max-h-[90vh] overflow-y-auto relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>{editingPreset ? 'Preset စာပုံစံ ပြင်ဆင်ခြင်း' : 'Preset စာပုံစံ အသစ်တိုးခြင်း'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPresetManagerModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePresetForm} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                  Preset စာခေါင်းစဉ် (Title)
                </label>
                <input
                  type="text"
                  required
                  value={presetTitleInput}
                  onChange={(e) => setPresetTitleInput(e.target.value)}
                  placeholder="e.g. ရုံးစာ (အပေါ်စာ)၊ စိစစ်ပြန်ကြားစာ..."
                  className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                  အကြောင်းအရာ (Subject)
                </label>
                <input
                  type="text"
                  value={presetSubjectInput}
                  onChange={(e) => setPresetSubjectInput(e.target.value)}
                  placeholder="e.g. ဖြေရှင်းတင်ပြရန်ကိစ္စ..."
                  className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                  ရည်ညွှန်းချက် (Reference)
                </label>
                <input
                  type="text"
                  value={presetRefInput}
                  onChange={(e) => setPresetRefInput(e.target.value)}
                  placeholder="e.g. ကြေးနန်းအမှတ်၊ ၁၆၅/လဝက..."
                  className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                    လက်မှတ်ထိုးသူ ရာထူး
                  </label>
                  <select
                    value={presetSenderTitleInput}
                    onChange={(e) => setPresetSenderTitleInput(e.target.value)}
                    className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold focus:border-blue-600 focus:outline-none"
                  >
                    {SENDER_TITLE_OPTIONS.filter(o => o !== 'CUSTOM').map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                    လက်မှတ်ထိုးသူ အမည်
                  </label>
                  <input
                    type="text"
                    value={presetSenderNameInput}
                    onChange={(e) => setPresetSenderNameInput(e.target.value)}
                    className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400">
                  Preset စာပိုဒ်များ
                </label>
                {presetParagraphs.map((para, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <textarea
                      rows={2}
                      value={para}
                      onChange={(e) => {
                        const updated = [...presetParagraphs];
                        updated[idx] = e.target.value;
                        setPresetParagraphs(updated);
                      }}
                      className="flex-1 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setPresetParagraphs(presetParagraphs.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-600 p-1.5 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setPresetParagraphs([...presetParagraphs, `${toMyanmarDigits(presetParagraphs.length + 1)}။    `])}
                  className="text-xs text-blue-700 dark:text-blue-400 font-bold hover:underline"
                >
                  + စာပိုဒ်အသစ် ထည့်မည်
                </button>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400">
                  မိတ္တူကို
                </label>
                {presetCopyTo.map((c, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <span className="text-xs font-bold text-slate-400 w-5 text-right shrink-0">
                      {toMyanmarDigits(idx + 1)}။
                    </span>
                    <input
                      type="text"
                      value={c}
                      onChange={(e) => {
                        const updated = [...presetCopyTo];
                        updated[idx] = e.target.value;
                        setPresetCopyTo(updated);
                      }}
                      className="flex-1 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:border-blue-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setPresetCopyTo(presetCopyTo.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-600 p-1 text-xs font-bold shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setPresetCopyTo([...presetCopyTo, ''])}
                  className="text-xs text-blue-700 dark:text-blue-400 font-bold hover:underline"
                >
                  + မိတ္တူ ထပ်ထည့်မည်
                </button>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPresetManagerModal(false)}
                  className="min-h-[40px] px-4 py-2 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] px-5 py-2 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold"
                >
                  Preset သိမ်းဆည်းမည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Location Settings Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4 text-slate-900 dark:text-zinc-100 relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>ရုံးတည်နေရာ ဆက်တင်</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                  ၁။ တိုင်းဒေသကြီး / ပြည်နယ်
                </label>
                <select
                  value={selectedRegionId}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-zinc-700 focus:border-blue-600 focus:outline-none"
                >
                  {MYANMAR_ADMINISTRATIVE_DATA.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nameMM} ({r.nameEN})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                  ၂။ ခရိုင်
                </label>
                <select
                  value={selectedDistrictId}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-zinc-700 focus:border-blue-600 focus:outline-none"
                >
                  {currentDistricts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nameMM} ({d.nameEN})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                  ၃။ မြို့နယ်
                </label>
                <select
                  value={selectedTownshipId}
                  onChange={(e) => handleTownshipChange(e.target.value)}
                  className="w-full min-h-[42px] bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-zinc-700 focus:border-blue-600 focus:outline-none"
                >
                  {currentTownships.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nameMM} ({t.nameEN})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 text-[11px] font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{findTownshipLocationInfo(selectedTownshipId).fullLocationMM}</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    db.setUserLocationConfig({
                      regionId: selectedRegionId,
                      districtId: selectedDistrictId,
                      townshipId: selectedTownshipId
                    });
                    setShowLocationModal(false);
                    showToast('ရုံးတည်နေရာ သိမ်းဆည်းပြီးပါပြီ။');
                  }}
                  className="min-h-[42px] px-5 py-2 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>သိမ်းဆည်း၍ ပိတ်မည်</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
