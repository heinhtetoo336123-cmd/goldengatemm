import { DocumentRecord, User, LetterPreset, UserLocationConfig, OfficialLetterInput, TelegramInput, RegisteredOfficer, MasterLetterData, ApplicationLink, ApplicationSubmission, ApplicationSubmissionStatus, ApplicationType } from '../types';

const STORAGE_KEYS = {
  PRE_APPROVED_EMAILS: 'ggmm_pre_approved_emails_v1',
  CURRENT_USER: 'ggmm_current_user_v1',
  DOCUMENTS: 'ggmm_documents_v1',
  LETTER_PRESETS: 'ggmm_letter_presets_v3',
  OFFLINE_QUEUE: 'ggmm_offline_queue_v1',
  THEME: 'ggmm_theme_v1',
  LEGAL_BOOKMARKS: 'ggmm_legal_bookmarks_v1',
  USER_LOCATION_CONFIG: 'ggmm_user_location_config_v1',
  COVER_LETTER_DRAFT: 'ggmm_cover_letter_draft_v1',
  TELEGRAM_DRAFT: 'ggmm_telegram_draft_v1',
  REGISTERED_OFFICERS: 'ggmm_registered_officers_v1',
  APPLICATION_LINKS: 'ggmm_app_links_v1',
  APPLICATION_SUBMISSIONS: 'ggmm_app_submissions_v1'
};


// Initial default pre-approved emails
const DEFAULT_PRE_APPROVED = [
  'heinhtetoo336123@gmail.com' // Active user email
];

// Initial default Township Section Presets matching authentic official Myanmar letter layouts
const DEFAULT_PRESETS: LetterPreset[] = [
  {
    id: 'preset-cover-letter',
    category: 'မြို့နယ် Section အသုံး',
    title: 'ရုံးစာ (အပေါ်စာ)',
    letterType: 'COVER_LETTER',
    regionId: 'tanintharyi',
    districtId: 'dawei_district',
    townshipId: 'dawei_township',
    townshipName: 'ထားဝယ်မြို့နယ်',
    subject: 'ဖြေရှင်းတင်ပြရန်ကိစ္စ',
    referenceText: 'လူဝင်မှုကြီးကြပ်ရေးဒုတိယဌာနခွဲ၏ ၂၀၂၆ စက် ၂၇ ၁၇၃၀ ချိန်ပို့ ကြေးနန်းအမှတ်၊ ၁၆၅/လဝက',
    ministry: 'လူဝင်မှုကြီးကြပ်ရေးနှင့် ပြည်သူ့အင်အားဝန်ကြီးဌာန',
    department: 'တိုင်းဒေသကြီးဦးစီးမှူးရုံး',
    location: 'တနင်္သာရီတိုင်းဒေသကြီး၊ ထားဝယ်မြို့',
    recipient: 'ဌာနမှူး\nလူဝင်မှုကြီးကြပ်ရေးဒုတိယဌာနခွဲ',
    senderTitle: 'ဒုတိယညွှန်ကြားရေးမှူး',
    senderName: '',
    classification: 'RESTRICTED', // ကန့်သတ်
    urgency: 'ORDINARY',       // ရိုးရိုး
    bodyParagraphs: [
      '၁။    ------------------- ပိုင်ဆိုင်သည့် ရတနာဝင်း-၃ (T-၆၈၅)အမည်ရှိ တဂုတ်ဆွဲငါးဖမ်းရေယာဉ်သည် ၂၄-၉-၂၀၂၆ ရက်နေ့ (၁၇၀၀) အချိန်တွင် (OSS)စစ်ဆေးရေးစခန်းသို့ အဖွဲ့စုံဖြင့်စစ်ဆေးခဲ့ပြီး ရေလုပ်သား(၁၇)ဦးဖြင့် ပင်လယ်ပြင်ငါးဖမ်းကွက်သို့ ထွက်ခွာသွားခဲ့ကြောင်း၊ အဆိုပါငါးဖမ်းရေယာဉ်သည် ၂၇-၉-၂၀၂၆ ရက်နေ့ (၀၄၀၀)အချိန်ခန့်တွင် ပင်လယ်ပြင်၌ ရာသီဥတုဆိုးရွားကာ ရုတ်တရက်လှိုင်းလေပြင်းထန်လာပြီး မလိုင်ကျွန်းအနောက်ဘက်အလွန် ၁၃ ဒီဂရီ ၁၉ မိနစ်၊ လောင် ၉၇ ဒီဂရီ ၄၁ မိနစ်၌ နှစ်မြုပ်သွားခဲ့ကြောင်း၊ ရေယာဉ်ပေါ်ပါ ရေလုပ်သားများအား အနီးနားရှိ ငါးဖမ်းလှေ၏ အကူအညီဖြင့် ဆယ်ယူနိုင်ခဲ့၍ ရေလုပ်သားများ သေဆုံးမှုမရှိပါကြောင်း၊ ရာသီဥတုကောင်းမွန်ပါက ရေယာဉ်အား ပြန်လည်ဆယ်ယူမည်ဖြစ်ကြောင်း ရည်ညွှန်းပါကြေးနန်းဖြင့် တင်ပြလာပါသည်။',
      '၂။    အဆိုပါဖြစ်စဉ်နှင့်ပတ်သက်၍ ကြေးနန်းစာအား ၂၉-၉-၂၀၂၆ ရက်နေ့ (၀၉၅၅)အချိန်တွင် Viber မှတစ်ဆင့် လက်ခံရရှိပြီး မည်သည့်အတွက်ကြောင့် အချိန်နှင့်တစ်ပြေးညီတင်ပြရန် ပျက်ကွက်ရခြင်းကိုဖြေရှင်းတင်ပြရန်နှင့် နောက်နောင်အဆိုပါဖြစ်စဉ်မျိုး ထပ်မံဖြစ်ပွားမှုမရှိစေရေး အလေးထားဆောင်ရွက်ရန် သတိပေးအကြောင်းကြားပါသည်။'
    ],
    copyTo: [
      'ခရိုင်ဦးစီးမှူး၊ လူဝင်မှုကြီးကြပ်ရေးနှင့်ပြည်သူ့အင်အားဝန်ကြီးဌာန၊',
      'ရုံးလက်ခံ/မျှောစာတွဲ'
    ]
  },
  {
    id: 'preset-telegram',
    category: 'မြို့နယ် Section အသုံး',
    title: 'ကြေးနန်းစာ',
    letterType: 'TELEGRAM',
    regionId: 'yangon',
    districtId: 'yangon_north',
    townshipId: 'mingaladon_township',
    townshipName: 'မင်္ဂလာဒုံမြို့နယ်',
    subject: 'နယ်စပ်ဝင်ထွက်ဂိတ် အရေးပေါ် ဖြစ်စဉ် ကြေးနန်းစာ',
    referenceText: 'ညွှန်ကြားရေးမှူးချုပ်ရုံး၏ ၁၅-၁၀-၂၀၂၆ ရက်စွဲပါ စာအမှတ်၊ ၁၂/လဝက(စိစစ်)',
    ministry: 'လူဝင်မှုကြီးကြပ်ရေးနှင့် ပြည်သူ့အင်အားဝန်ကြီးဌာန',
    department: 'မြို့နယ် လူဝင်မှုကြီးကြပ်ရေး ဦးစီးမှူးရုံး',
    location: 'ရန်ကုန်တိုင်းဒေသကြီး၊ မင်္ဂလာဒုံမြို့နယ်',
    recipient: 'ညွှန်ကြားရေးမှူးချုပ် / တိုင်းဒေသကြီး ဦးစီးမှူးရုံး',
    senderTitle: 'မြို့နယ်ဦးစီးမှူး',
    senderName: '',
    classification: 'CONFIDENTIAL', // အတွင်းရေး
    urgency: 'IMMEDIATE',         // ချက်ခြင်း
    bodyParagraphs: [
      '၁။    အရေးကြီး ကြေးနန်းသတင်း - ယနေ့ ရက်စွဲပါ မင်္ဂလာဒုံ လေဆိပ်ဂိတ်၌ စိစစ်ချက်အရ နိုင်ငံကူးလက်မှတ် N-884920 ကိုင်ဆောင်သူ နိုင်ငံခြားသားသည် ဗီဇာ သက်တမ်းလွန် ရက်ပေါင်း (၁၁၅) ရက် နေထိုင်ကြောင်း စိစစ်တွေ့ရှိရပါသည်။',
      '၂။    အဆိုပါ ပုဂ္ဂိုလ်အား ၁၉၄၇ ခုနှစ် မြန်မာနိုင်ငံ လူဝင်မှုကြီးကြပ်ရေး အက်ဥပဒေ ပုဒ်မ ၁၃(၁) အရ စိစစ် ထိန်းသိမ်းထားရှိပြီး အသေးစိတ် အစီရင်ခံစာအား ဆက်လက် ပို့ဆောင်မည်ဖြစ်ပါကြောင်း ကြေးနန်းပေးပို့အပ်ပါသည်။'
    ],
    copyTo: [
      'သတင်းရဲတပ်ဖွဲ့၊ ရန်ကုန်တိုင်းဒေသကြီး။',
      'ရုံးလက်ခံ။'
    ]
  },
  {
    id: 'preset-office-order',
    category: 'မြို့နယ် Section အသုံး',
    title: 'ရုံးတွင်းအမိန့်စာ',
    letterType: 'OFFICE_ORDER',
    regionId: 'yangon',
    districtId: 'yangon_north',
    townshipId: 'insein_township',
    townshipName: 'အင်းစိန်မြို့နယ်',
    subject: 'မြို့နယ်ရုံး အရာထမ်း/အမှုထမ်းများ တာဝန်ခွဲဝေမှု ရုံးတွင်းအမိန့်စာ',
    referenceText: 'တိုင်းဒေသကြီး ဦးစီးမှူးရုံး၏ ၂၀-၁၀-၂၀၂၆ ရက်စွဲပါ ညွှန်ကြားချက် စာအမှတ်၊ ၅၀/လဝက',
    ministry: 'လူဝင်မှုကြီးကြပ်ရေးနှင့် ပြည်သူ့အင်အားဝန်ကြီးဌာန',
    department: 'မြို့နယ် လူဝင်မှုကြီးကြပ်ရေး ဦးစီးမှူးရုံး',
    location: 'ရန်ကုန်တိုင်းဒေသကြီး၊ အင်းစိန်မြို့နယ်',
    recipient: 'မြို့နယ်ရုံး အရာထမ်း/အမှုထမ်း အားလုံး',
    senderTitle: 'မြို့နယ်ဦးစီးမှူး',
    senderName: '',
    classification: 'NONE',      // ဖြုတ်ထားတာ(မပါတာ)
    urgency: 'ORDINARY',        // ရိုးရိုး
    bodyParagraphs: [
      '၁။    ရုံးလုပ်ငန်းများ လျင်မြန်ချောမွေ့စွာ ပြီးစီးနိုင်ရေးအတွက် လာမည့် စစ်ဆေးရေး ကာလအတွင်း အရာထမ်း/အမှုထမ်းများအား ဂိတ်စစ်ဆေးရေးနှင့် မှတ်တမ်းအဖွဲ့များအဖြစ် အလှည့်ကျ တာဝန် ပေးအပ်လိုက်သည်။',
      '၂။    တာဝန်ပေးအပ်ခြင်းခံရသော ဝန်ထမ်းများသည် တာဝန်ကျချိန်၌ ရုံးဝတ်စုံ စနစ်တကျ ဝတ်ဆင်၍ တာဝန်သိစွာ လိုက်နာ ဆောင်ရွက်ရမည်။'
    ],
    copyTo: [
      'ဦးစီးအရာရှိ၊ စိစစ်ရေးဌာနခွဲ။',
      'ကြော်ငြာသင်ပုန်း။'
    ]
  },
  {
    id: 'preset-verify-reply',
    category: 'မြို့နယ် Section အသုံး',
    title: 'စိစစ်ပြန်ကြားစာ',
    letterType: 'VERIFY_REPLY',
    regionId: 'tanintharyi',
    districtId: 'myeik_district',
    townshipId: 'myeik_township',
    townshipName: 'မြိတ်မြို့နယ်',
    subject: 'နိုင်ငံသား/နေထိုင်ခွင့် အထောက်အထား စိစစ်ပြန်ကြားခြင်း',
    referenceText: 'မြို့နယ်ရဲတပ်ဖွဲ့မှူးရုံး၏ ၁၈-၁၀-၂၀၂၆ ရက်စွဲပါ စာအမှတ်၊ ၄၀၀/ရဲ-၁',
    ministry: 'လူဝင်မှုကြီးကြပ်ရေးနှင့် ပြည်သူ့အင်အားဝန်ကြီးဌာန',
    department: 'မြို့နယ် လူဝင်မှုကြီးကြပ်ရေး ဦးစီးမှူးရုံး',
    location: 'တနင်္သာရီတိုင်းဒေသကြီး၊ မြိတ်မြို့နယ်',
    recipient: 'မြို့နယ် ရဲတပ်ဖွဲ့မှူးရုံး / သက်ဆိုင်ရာ ဌာန',
    senderTitle: 'ဦးစီးအရာရှိ',
    senderName: '',
    classification: 'RESTRICTED', // ကန့်သတ်
    urgency: 'IMPORTANT',        // အရေးကြီး
    bodyParagraphs: [
      '၁။    စာအပါအကြောင်းအရာပါ ပုဂ္ဂိုလ်၏ နိုင်ငံသား/နေထိုင်ခွင့် အထောက်အထားများအား မြို့နယ်ရုံး မူလ မှတ်တမ်းတွဲများနှင့် e-ID စနစ်တို့၌ စိစစ်ခဲ့ပါသည်။',
      '၂။    စိစစ်ချက်အရ အဆိုပါ ပုဂ္ဂိုလ်၏ အချက်အလက်များသည် မြို့နယ်ရုံး မှတ်ပုံတင်စာရင်းပါ အထောက်အထားများနှင့် တိကျစွာ ကိုက်ညီမှု ရှိပါကြောင်း စိစစ် ပြန်ကြားအပ်ပါသည်။'
    ],
    copyTo: [
      'မြို့နယ်တရားရုံး။',
      'ရုံးလက်ခံ။'
    ]
  },
  {
    id: 'preset-recommendation',
    category: 'မြို့နယ် Section အသုံး',
    title: 'ထောက်ခံစာ',
    letterType: 'RECOMMENDATION',
    regionId: 'mandalay',
    districtId: 'mandalay_district',
    townshipId: 'mahaaungmye_township',
    townshipName: 'မဟာအောင်မြေမြို့နယ်',
    subject: 'နေရပ်လိပ်စာနှင့် ဒေသခံဖြစ်ကြောင်း လဝက စိစစ် ထောက်ခံစာ',
    referenceText: 'ရပ်ကွက်အုပ်ချုပ်ရေးမှူးရုံး၏ ၂၂-၁၀-၂၀၂၆ ရက်စွဲပါ ထောက်ခံစာအမှတ်၊ ၁၂/ထက',
    ministry: 'လူဝင်မှုကြီးကြပ်ရေးနှင့် ပြည်သူ့အင်အားဝန်ကြီးဌာန',
    department: 'မြို့နယ် လူဝင်မှုကြီးကြပ်ရေး ဦးစီးမှူးရုံး',
    location: 'မန္တလေးတိုင်းဒေသကြီး၊ မဟာအောင်မြေမြို့နယ်',
    recipient: 'သက်ဆိုင်ရာ ဌာနအဖွဲ့အစည်းများ',
    senderTitle: 'မြို့နယ်ဦးစီးမှူး',
    senderName: '',
    classification: 'NONE',      // ဖြုတ်ထားတာ(မပါတာ)
    urgency: 'ORDINARY',        // ရိုးရိုး
    bodyParagraphs: [
      '၁။    အမည် - -------------------၊ မှတ်ပုံတင်အမှတ် - -------------------၊ အဖအမည် - ------------------- သည် အမှန်တကယ် မြို့နယ်အတွင်း နေထိုင်သူဖြစ်ကြောင်း စိစစ်တွေ့ရှိရပါသည်။',
      '၂။    အဆိုပါ ပုဂ္ဂိုလ်သည် ရုံးမှတ်တမ်းများအရ ပြစ်မှုကင်းရှင်းပြီး တရားဝင် ဒေသခံဖြစ်ကြောင်း ထောက်ခံလက်မှတ် ထုတ်ပေးအပ်ပါသည်။'
    ],
    copyTo: [
      'သက်ဆိုင်ရာ ရပ်ကွက်အုပ်ချုပ်ရေးမှူးရုံး။',
      'လျှောက်ထားသူ ကိုယ်တိုင်။'
    ]
  }
];

// Clean initial document records - Ghost AI data purged per user request
const INITIAL_DOCUMENTS: DocumentRecord[] = [];

// Initial Registered Immigration Officers Directory (လဝက ဖုန်းစာအုပ်)
// Admin accounts will confirm and manage registered officers across administrative locations
const DEFAULT_OFFICERS: RegisteredOfficer[] = [];

export const db = {
  getPreApprovedEmails(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRE_APPROVED_EMAILS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.PRE_APPROVED_EMAILS, JSON.stringify(DEFAULT_PRE_APPROVED));
        return DEFAULT_PRE_APPROVED;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_PRE_APPROVED;
    }
  },

  isEmailPreApproved(email: string): boolean {
    if (!email) return false;
    const list = this.getPreApprovedEmails();
    const clean = email.trim().toLowerCase();
    return list.some(item => item.trim().toLowerCase() === clean);
  },

  addPreApprovedEmail(email: string): boolean {
    if (!email || !email.includes('@')) return false;
    const clean = email.trim().toLowerCase();
    const list = this.getPreApprovedEmails();
    if (!list.map(e => e.toLowerCase()).includes(clean)) {
      list.push(clean);
      localStorage.setItem(STORAGE_KEYS.PRE_APPROVED_EMAILS, JSON.stringify(list));
    }
    return true;
  },

  removePreApprovedEmail(email: string): void {
    const list = this.getPreApprovedEmails().filter(e => e.toLowerCase() !== email.toLowerCase());
    localStorage.setItem(STORAGE_KEYS.PRE_APPROVED_EMAILS, JSON.stringify(list));
  },

  getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  // Letter Presets Management
  getLetterPresets(): LetterPreset[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LETTER_PRESETS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.LETTER_PRESETS, JSON.stringify(DEFAULT_PRESETS));
        return DEFAULT_PRESETS;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_PRESETS;
    }
  },

  saveLetterPreset(preset: Partial<LetterPreset>): LetterPreset {
    const presets = this.getLetterPresets();
    if (preset.id) {
      const idx = presets.findIndex(p => p.id === preset.id);
      if (idx !== -1) {
        const updated = { ...presets[idx], ...preset };
        presets[idx] = updated;
        localStorage.setItem(STORAGE_KEYS.LETTER_PRESETS, JSON.stringify(presets));
        return updated;
      }
    }

    const newPreset: LetterPreset = {
      id: preset.id || `preset-${Date.now()}`,
      category: preset.category || 'မြို့နယ် Section အသုံး',
      title: preset.title || 'ရုံးစာ မူကြမ်း',
      letterType: preset.letterType || 'COVER_LETTER',
      subject: preset.subject || 'အကြောင်းအရာ ရေးသားချက်',
      referenceText: preset.referenceText || '',
      ministry: preset.ministry || 'လူဝင်မှုကြီးကြပ်ရေးနှင့် ပြည်သူ့အင်အားဝန်ကြီးဌာန',
      department: preset.department || 'မြို့နယ် လူဝင်မှုကြီးကြပ်ရေး ဦးစီးမှူးရုံး',
      location: preset.location || 'မြို့နယ်ရုံး',
      recipient: preset.recipient || 'သက်ဆိုင်ရာ ဌာန',
      senderTitle: preset.senderTitle || 'မြို့နယ်ဦးစီးမှူး',
      senderName: preset.senderName || '',
      classification: preset.classification || 'NONE',
      urgency: preset.urgency || 'ORDINARY',
      bodyParagraphs: preset.bodyParagraphs || ['၁။    အကြောင်းအရာပါ အတိုင်း အကြောင်းကြားအပ်ပါသည်။'],
      copyTo: preset.copyTo || ['ရုံးလက်ခံ/မျှောစာတွဲ']
    };

    presets.push(newPreset);
    localStorage.setItem(STORAGE_KEYS.LETTER_PRESETS, JSON.stringify(presets));
    return newPreset;
  },

  deleteLetterPreset(id: string): void {
    const presets = this.getLetterPresets().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.LETTER_PRESETS, JSON.stringify(presets));
  },

  // Document Records CRUD
  getDocuments(): DocumentRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify([]));
        return [];
      }
      const parsed: DocumentRecord[] = JSON.parse(stored);
      // Clean up ghost sample documents (like doc-1001 or mock entries) per user request
      const cleaned = parsed.filter(d => d.id !== 'doc-1001');
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch {
      return [];
    }
  },

  clearAllDocuments(): void {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify([]));
  },

  saveDocument(doc: Partial<DocumentRecord>): DocumentRecord {
    const docs = this.getDocuments();
    const now = new Date().toISOString();
    
    if (doc.id) {
      const index = docs.findIndex(d => d.id === doc.id);
      if (index !== -1) {
        const updatedDoc: DocumentRecord = {
          ...docs[index],
          ...doc,
          updatedAt: now,
          syncStatus: navigator.onLine ? 'SYNCED' : 'PENDING'
        };
        docs[index] = updatedDoc;
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
        if (!navigator.onLine) {
          this.addToOfflineQueue({ type: 'UPDATE_DOC', payload: updatedDoc });
        }
        return updatedDoc;
      }
    }

    const newDoc: DocumentRecord = {
      id: doc.id || `doc-${Date.now()}`,
      refNumber: doc.refNumber || `သီးခြား/လဝက-${Math.floor(100 + Math.random() * 900)}`,
      title: doc.title || 'အကြောင်းအရာမရှိပါ',
      category: doc.category || 'OUTBOUND',
      date: doc.date || new Date().toISOString().split('T')[0],
      sender: doc.sender || 'အရာရှိ၊ လူဝင်မှုကြီးကြပ်ရေး',
      receiver: doc.receiver || 'သက်ဆိုင်ရာဌာန',
      summary: doc.summary || '',
      fullText: doc.fullText || '',
      classification: doc.classification || 'NONE',
      syncStatus: navigator.onLine ? 'SYNCED' : 'PENDING',
      createdAt: now,
      updatedAt: now,
      attachmentName: doc.attachmentName
    };

    docs.unshift(newDoc);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));

    if (!navigator.onLine) {
      this.addToOfflineQueue({ type: 'CREATE_DOC', payload: newDoc });
    }

    return newDoc;
  },

  deleteDocument(id: string): void {
    const docs = this.getDocuments().filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
    if (!navigator.onLine) {
      this.addToOfflineQueue({ type: 'DELETE_DOC', payload: { id } });
    }
  },

  getOfflineQueue(): Array<{ type: string; payload: unknown; timestamp: string }> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  addToOfflineQueue(item: { type: string; payload: unknown }): void {
    const queue = this.getOfflineQueue();
    queue.push({ ...item, timestamp: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  },

  clearOfflineQueue(): void {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify([]));
  },

  syncPendingItems(): number {
    const queue = this.getOfflineQueue();
    if (queue.length === 0) return 0;
    
    const docs = this.getDocuments().map(d => ({ ...d, syncStatus: 'SYNCED' as const }));
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
    this.clearOfflineQueue();
    return queue.length;
  },

  // Legal Bookmarks
  getLegalBookmarks(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LEGAL_BOOKMARKS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveLegalBookmark(bookmarkId: string): string[] {
    const current = this.getLegalBookmarks();
    if (!current.includes(bookmarkId)) {
      current.push(bookmarkId);
      localStorage.setItem(STORAGE_KEYS.LEGAL_BOOKMARKS, JSON.stringify(current));
    }
    return current;
  },

  removeLegalBookmark(bookmarkId: string): string[] {
    const current = this.getLegalBookmarks().filter(b => b !== bookmarkId);
    localStorage.setItem(STORAGE_KEYS.LEGAL_BOOKMARKS, JSON.stringify(current));
    return current;
  },

  setLegalBookmarks(bookmarks: string[]): void {
    localStorage.setItem(STORAGE_KEYS.LEGAL_BOOKMARKS, JSON.stringify(bookmarks || []));
  },

  // Fast Indexed Offline Search across documents
  searchDocumentsIndexed(query: string, category?: string, classification?: string): DocumentRecord[] {
    const docs = this.getDocuments();
    if (!query && (!category || category === 'ALL') && (!classification || classification === 'ALL')) {
      return docs;
    }

    const cleanQuery = query.toLowerCase().trim();
    const queryTokens = cleanQuery ? cleanQuery.split(/\s+/).filter(Boolean) : [];

    return docs.filter(doc => {
      // Filter Category
      if (category && category !== 'ALL' && doc.category !== category) {
        return false;
      }
      // Filter Classification
      if (classification && classification !== 'ALL' && doc.classification !== classification) {
        return false;
      }

      if (queryTokens.length === 0) return true;

      // Multi-field document searchable text index token string
      const searchableText = [
        doc.refNumber,
        doc.title,
        doc.sender,
        doc.receiver,
        doc.summary,
        doc.fullText || '',
        doc.category,
        doc.classification || '',
        doc.date || '',
        doc.attachmentName || ''
      ].join(' ').toLowerCase();

      // Check if all query tokens match any part of searchable text index
      return queryTokens.every(token => searchableText.includes(token));
    });
  },

  // Registered Immigration Officers Directory (လဝက ဖုန်းစာအုပ်)
  getOfficers(filters?: { regionId?: string; districtId?: string; townshipId?: string; search?: string }): RegisteredOfficer[] {
    try {
      let officers: RegisteredOfficer[] = [];
      const stored = localStorage.getItem(STORAGE_KEYS.REGISTERED_OFFICERS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.REGISTERED_OFFICERS, JSON.stringify(DEFAULT_OFFICERS));
        officers = DEFAULT_OFFICERS;
      } else {
        officers = JSON.parse(stored);
      }

      if (!filters) return officers;

      return officers.filter(off => {
        if (filters.regionId && filters.regionId !== 'ALL' && off.regionId !== filters.regionId) {
          return false;
        }
        if (filters.districtId && filters.districtId !== 'ALL' && off.districtId !== filters.districtId) {
          return false;
        }
        if (filters.townshipId && filters.townshipId !== 'ALL' && off.townshipId !== filters.townshipId) {
          return false;
        }
        if (filters.search && filters.search.trim()) {
          const q = filters.search.toLowerCase().trim();
          const matchName = off.name.toLowerCase().includes(q);
          const matchRank = off.rank.toLowerCase().includes(q);
          const matchPhone = off.phone.toLowerCase().includes(q) || (off.officePhone && off.officePhone.includes(q));
          const matchOffice = off.officeName.toLowerCase().includes(q);
          const matchSerial = off.serialNo ? off.serialNo.toLowerCase().includes(q) : false;
          const matchTownship = off.townshipNameMM.toLowerCase().includes(q);
          if (!matchName && !matchRank && !matchPhone && !matchOffice && !matchSerial && !matchTownship) {
            return false;
          }
        }
        return true;
      });
    } catch {
      return DEFAULT_OFFICERS;
    }
  },

  saveOfficer(officer: Partial<RegisteredOfficer>): RegisteredOfficer {
    const list = this.getOfficers();
    const now = new Date().toISOString().split('T')[0];

    if (officer.id) {
      const idx = list.findIndex(o => o.id === officer.id);
      if (idx !== -1) {
        const updated = { ...list[idx], ...officer };
        list[idx] = updated;
        localStorage.setItem(STORAGE_KEYS.REGISTERED_OFFICERS, JSON.stringify(list));
        return updated;
      }
    }

    const newOfficer: RegisteredOfficer = {
      id: officer.id || `off-${Date.now()}`,
      name: officer.name?.trim() || 'အရာရှိ အမည်',
      rank: officer.rank?.trim() || 'ဒု-လဝကမှူး',
      serialNo: officer.serialNo?.trim() || '',
      officeName: officer.officeName?.trim() || 'မြို့နယ် လူဝင်မှုကြီးကြပ်ရေးဦးစီးမှူးရုံး',
      regionId: officer.regionId || 'naypyitaw',
      districtId: officer.districtId || '',
      townshipId: officer.townshipId || '',
      townshipNameMM: officer.townshipNameMM || 'မြို့နယ်ရုံး',
      phone: officer.phone?.trim() || '',
      officePhone: officer.officePhone?.trim(),
      email: officer.email?.trim(),
      viberNumber: officer.viberNumber?.trim() || officer.phone?.trim(),
      status: officer.status || 'VERIFIED',
      notes: officer.notes?.trim() || '',
      registeredAt: officer.registeredAt || now,
      approvedBy: officer.approvedBy || 'Admin အတည်ပြုပြီး'
    };

    list.unshift(newOfficer);
    localStorage.setItem(STORAGE_KEYS.REGISTERED_OFFICERS, JSON.stringify(list));
    return newOfficer;
  },

  deleteOfficer(id: string): void {
    const list = this.getOfficers().filter(o => o.id !== id);
    localStorage.setItem(STORAGE_KEYS.REGISTERED_OFFICERS, JSON.stringify(list));
  },

  approveOfficer(id: string, adminName: string = 'Admin'): void {
    const list = this.getOfficers();
    const idx = list.findIndex(o => o.id === id);
    if (idx !== -1) {
      list[idx].status = 'VERIFIED';
      list[idx].approvedBy = `${adminName} အတည်ပြုပြီး`;
      localStorage.setItem(STORAGE_KEYS.REGISTERED_OFFICERS, JSON.stringify(list));
    }
  },

  // User Location Config Management
  getUserLocationConfig(): UserLocationConfig {
    const DEFAULT_CONFIG: UserLocationConfig = {
      regionId: 'tanintharyi',
      districtId: 'dawei_district',
      townshipId: 'dawei_township'
    };
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_LOCATION_CONFIG);
      return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  },

  setUserLocationConfig(config: UserLocationConfig): void {
    localStorage.setItem(STORAGE_KEYS.USER_LOCATION_CONFIG, JSON.stringify(config));
  },

  // Unified JSON Backup (Export all app data into a single file)
  exportUnifiedJSONBackup(): string {
    const backupData = {
      appName: 'GoldenGateMM_Immigration',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      documents: this.getDocuments(),
      presets: this.getLetterPresets(),
      currentUser: this.getCurrentUser(),
      legalBookmarks: this.getLegalBookmarks(),
      preApprovedEmails: this.getPreApprovedEmails(),
      locationConfig: this.getUserLocationConfig(),
      registeredOfficers: this.getOfficers()
    };
    return JSON.stringify(backupData, null, 2);
  },

  // Unified JSON Restore (Restore all app data from a single backup file)
  importUnifiedJSONBackup(jsonData: string | object): {
    success: boolean;
    message: string;
    stats?: { documents: number; presets: number; legalBookmarks: number; officers: number };
  } {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

      if (!data || typeof data !== 'object') {
        return { success: false, message: 'အချက်အလက် ပုံစံ မှားယွင်းနေပါသည် (Invalid JSON format).' };
      }

      let docCount = 0;
      let presetCount = 0;
      let bookmarkCount = 0;
      let officerCount = 0;

      // Restore Documents
      if (Array.isArray(data.documents)) {
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(data.documents));
        docCount = data.documents.length;
      }

      // Restore Letter Presets
      if (Array.isArray(data.presets)) {
        localStorage.setItem(STORAGE_KEYS.LETTER_PRESETS, JSON.stringify(data.presets));
        presetCount = data.presets.length;
      }

      // Restore Current User Profile
      if (data.currentUser && typeof data.currentUser === 'object') {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(data.currentUser));
      }

      // Restore Legal Bookmarks
      if (Array.isArray(data.legalBookmarks)) {
        localStorage.setItem(STORAGE_KEYS.LEGAL_BOOKMARKS, JSON.stringify(data.legalBookmarks));
        bookmarkCount = data.legalBookmarks.length;
      }

      // Restore Registered Officers Phonebook
      if (Array.isArray(data.registeredOfficers)) {
        localStorage.setItem(STORAGE_KEYS.REGISTERED_OFFICERS, JSON.stringify(data.registeredOfficers));
        officerCount = data.registeredOfficers.length;
      }

      // Restore Pre-approved Emails if present
      if (Array.isArray(data.preApprovedEmails)) {
        localStorage.setItem(STORAGE_KEYS.PRE_APPROVED_EMAILS, JSON.stringify(data.preApprovedEmails));
      }

      // Restore Location Config if present
      if (data.locationConfig && typeof data.locationConfig === 'object') {
        localStorage.setItem(STORAGE_KEYS.USER_LOCATION_CONFIG, JSON.stringify(data.locationConfig));
      }

      return {
        success: true,
        message: 'ဒေတာအချက်အလက်များ (မှတ်တမ်းများ၊ Presets၊ ဖုန်းစာအုပ်၊ ပရိုဖိုင်၊ တည်နေရာ ဆက်တင် နှင့် ဥပဒေ Bookmarks) အားလုံး အောင်မြင်စွာ ပြန်လည် ထည့်သွင်းပြီးပါပြီ!',
        stats: {
          documents: docCount,
          presets: presetCount,
          legalBookmarks: bookmarkCount,
          officers: officerCount
        }
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `JSON ဖိုင်ဖတ်ရှုရာတွင် အမှားအယွင်းရှိပါသည်: ${errorMsg}`
      };
    }
  },

  // Auto-Save Drafts for Official Cover Letter & Telegram
  saveCoverLetterDraft(data: OfficialLetterInput): void {
    try {
      localStorage.setItem(STORAGE_KEYS.COVER_LETTER_DRAFT, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to auto-save cover letter draft', e);
    }
  },

  getCoverLetterDraft(): OfficialLetterInput | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COVER_LETTER_DRAFT);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },

  saveTelegramDraft(data: TelegramInput): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TELEGRAM_DRAFT, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to auto-save telegram draft', e);
    }
  },

  getTelegramDraft(): TelegramInput | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TELEGRAM_DRAFT);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },

  // Dynamic Master Data Extractor across saved letters, presets, and officer directory
  getMasterLetterData(): MasterLetterData {
    const docs = this.getDocuments();
    const presets = this.getLetterPresets();
    const officers = this.getOfficers();

    // Standard predefined options
    const defaultRecipients = [
      'ဌာနမှူး\nလူဝင်မှုကြီးကြပ်ရေးဒုတိယဌာနခွဲ',
      'ညွှန်ကြားရေးမှူးချုပ် / တိုင်းဒေသကြီး ဦးစီးမှူးရုံး',
      'ခရိုင်ဦးစီးမှူး၊ လူဝင်မှုကြီးကြပ်ရေးနှင့်ပြည်သူ့အင်အားဝန်ကြီးဌာန',
      'မြို့နယ် ရဲတပ်ဖွဲ့မှူးရုံး / သက်ဆိုင်ရာ ဌာန',
      'မြို့နယ် အုပ်ချုပ်ရေးမှူးရုံး',
      'မြို့နယ်ရုံး အရာထမ်း/အမှုထမ်း အားလုံး',
      'သက်ဆိုင်ရာ ဌာနအဖွဲ့အစည်းများ'
    ];

    const defaultSubjects = [
      'ဖြေရှင်းတင်ပြရန်ကိစ္စ',
      'နယ်စပ်ဝင်ထွက်ဂိတ် အရေးပေါ် ဖြစ်စဉ် ကြေးနန်းစာ',
      'မြို့နယ်ရုံး အရာထမ်း/အမှုထမ်းများ တာဝန်ခွဲဝေမှု ရုံးတွင်းအမိန့်စာ',
      'နိုင်ငံသား/နေထိုင်ခွင့် အထောက်အထား စိစစ်ပြန်ကြားခြင်း',
      'နေရပ်လိပ်စာနှင့် ဒေသခံဖြစ်ကြောင်း လဝက စိစစ် ထောက်ခံစာ',
      'ဗီဇာ သက်တမ်းလွန် သတိပေး အကြောင်းကြားစာ'
    ];

    const defaultReferenceTexts = [
      'လူဝင်မှုကြီးကြပ်ရေးဒုတိယဌာနခွဲ၏ ၂၀၂၆ စက် ၂၇ ၁၇၃၀ ချိန်ပို့ ကြေးနန်းအမှတ်၊ ၁၆၅/လဝက',
      'ညွှန်ကြားရေးမှူးချုပ်ရုံး၏ ၁၅-၁၀-၂၀၂၆ ရက်စွဲပါ စာအမှတ်၊ ၁၂/လဝက(စိစစ်)',
      'တိုင်းဒေသကြီး ဦးစီးမှူးရုံး၏ ၂၀-၁၀-၂၀၂၆ ရက်စွဲပါ ညွှန်ကြားချက် စာအမှတ်၊ ၅၀/လဝက',
      'မြို့နယ်ရဲတပ်ဖွဲ့မှူးရုံး၏ ၁၈-၁၀-၂၀၂၆ ရက်စွဲပါ စာအမှတ်၊ ၄၀၀/ရဲ-၁'
    ];

    const defaultSenderTitles = [
      'မြို့နယ်ဦးစီးမှူး',
      'ခရိုင်ဦးစီးမှူး',
      'ဒုတိယညွှန်ကြားရေးမှူး',
      'ညွှန်ကြားရေးမှူး',
      'လက်ထောက်ညွှန်ကြားရေးမှူး',
      'ဦးစီးအရာရှိ',
      'ဒုတိယဦးစီးမှူး',
      'လူဝင်မှုကြီးကြပ်ရေးမှူး',
      'ဒုတိယလူဝင်မှုကြီးကြပ်ရေးမှူး',
      'လက်ထောက်လူဝင်မှုကြီးကြပ်ရေးမှူး'
    ];

    // Collect from saved document records
    const docRecipients = docs.map(d => d.receiver).filter(Boolean);
    const docSubjects = docs.map(d => d.title).filter(Boolean);
    const docSenderTitles = docs.map(d => d.sender).filter(Boolean);

    // Collect from letter presets
    const presetRecipients = presets.map(p => p.recipient || '').filter(Boolean);
    const presetSubjects = presets.map(p => p.subject || '').filter(Boolean);
    const presetReferences = presets.map(p => p.referenceText || '').filter(Boolean);
    const presetTitles = presets.map(p => p.senderTitle || '').filter(Boolean);
    const presetNames = presets.map(p => p.senderName || '').filter(Boolean);

    // Collect from registered officers directory
    const officerTitles = officers.map(o => o.rank || '').filter(Boolean);
    const officerNames = officers.map(o => o.name || '').filter(Boolean);

    const unique = (arr: string[]) => Array.from(new Set(arr.map(s => s.trim()))).filter(Boolean);

    return {
      recipients: unique([...defaultRecipients, ...docRecipients, ...presetRecipients]),
      subjects: unique([...defaultSubjects, ...docSubjects, ...presetSubjects]),
      referenceTexts: unique([...defaultReferenceTexts, ...presetReferences]),
      senderTitles: unique([...defaultSenderTitles, ...docSenderTitles, ...presetTitles, ...officerTitles]),
      senderNames: unique([...presetNames, ...officerNames])
    };
  },

  // Applying Zone: Application Links Management
  getApplicationLinks(officerId?: string): ApplicationLink[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.APPLICATION_LINKS);
      const links: ApplicationLink[] = stored ? JSON.parse(stored) : [];
      if (!officerId || officerId === 'ALL') return links;
      return links.filter(l => l.officerId === officerId || l.officerBadge === officerId);
    } catch {
      return [];
    }
  },

  saveApplicationLink(link: Partial<ApplicationLink>): ApplicationLink {
    const links = this.getApplicationLinks();
    const now = new Date().toISOString();
    
    if (link.id) {
      const idx = links.findIndex(l => l.id === link.id);
      if (idx !== -1) {
        const updated = { ...links[idx], ...link };
        links[idx] = updated;
        localStorage.setItem(STORAGE_KEYS.APPLICATION_LINKS, JSON.stringify(links));
        return updated;
      }
    }

    const token = link.token || `APP-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const newLink: ApplicationLink = {
      id: link.id || `link-${Date.now()}`,
      token,
      officerId: link.officerId || 'usr-101',
      officerName: link.officerName || 'Hein Htet Oo',
      officerBadge: link.officerBadge || 'IMM-2026',
      officerStation: link.officerStation || 'ရန်ကုန် အပြည်ပြည်ဆိုင်ရာ လေဆိပ်ဂိတ်',
      applicationType: link.applicationType || 'NRC_APP',
      townshipName: link.townshipName || 'မင်္ဂလာဒုံမြို့နယ်',
      customNote: link.customNote || '',
      createdAt: now,
      expiresAt: link.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'ACTIVE',
      submissionCount: 0
    };

    links.unshift(newLink);
    localStorage.setItem(STORAGE_KEYS.APPLICATION_LINKS, JSON.stringify(links));
    return newLink;
  },

  getApplicationLinkByToken(token: string): ApplicationLink | null {
    if (!token) return null;
    const links = this.getApplicationLinks();
    return links.find(l => l.token.toUpperCase() === token.toUpperCase().trim()) || null;
  },

  revokeApplicationLink(id: string): void {
    const links = this.getApplicationLinks();
    const idx = links.findIndex(l => l.id === id);
    if (idx !== -1) {
      links[idx].status = 'REVOKED';
      localStorage.setItem(STORAGE_KEYS.APPLICATION_LINKS, JSON.stringify(links));
    }
  },

  // Applying Zone: Submissions Management
  getApplicationSubmissions(filters?: { officerId?: string; linkToken?: string; status?: string; search?: string }): ApplicationSubmission[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.APPLICATION_SUBMISSIONS);
      let submissions: ApplicationSubmission[] = stored ? JSON.parse(stored) : [];

      if (!filters) return submissions;

      return submissions.filter(s => {
        if (filters.officerId && filters.officerId !== 'ALL' && s.officerId !== filters.officerId && s.officerEmail !== filters.officerId) {
          return false;
        }
        if (filters.linkToken && s.linkToken !== filters.linkToken) {
          return false;
        }
        if (filters.status && filters.status !== 'ALL' && s.status !== filters.status) {
          return false;
        }
        if (filters.search && filters.search.trim()) {
          const q = filters.search.toLowerCase().trim();
          const matchName = s.applicantName.toLowerCase().includes(q);
          const matchRef = s.submissionRef.toLowerCase().includes(q);
          const matchPhone = s.applicantPhone.includes(q);
          const matchNrc = s.applicantNrc.toLowerCase().includes(q);
          if (!matchName && !matchRef && !matchPhone && !matchNrc) return false;
        }
        return true;
      });
    } catch {
      return [];
    }
  },

  saveApplicationSubmission(sub: Partial<ApplicationSubmission>): ApplicationSubmission {
    const submissions = this.getApplicationSubmissions();
    const now = new Date().toISOString();

    if (sub.id) {
      const idx = submissions.findIndex(s => s.id === sub.id);
      if (idx !== -1) {
        const updated = { ...submissions[idx], ...sub, updatedAt: now };
        submissions[idx] = updated;
        localStorage.setItem(STORAGE_KEYS.APPLICATION_SUBMISSIONS, JSON.stringify(submissions));
        return updated;
      }
    }

    const refNo = `REF-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const newSubmission: ApplicationSubmission = {
      id: sub.id || `sub-${Date.now()}`,
      submissionRef: refNo,
      linkToken: sub.linkToken || 'DIRECT-GENERIC',
      officerId: sub.officerId || 'usr-101',
      officerEmail: sub.officerEmail || 'heinhtetoo336123@gmail.com',
      applicationType: sub.applicationType || 'NRC_APP',
      applicantName: sub.applicantName?.trim() || 'လျှောက်ထားသူ',
      applicantPhone: sub.applicantPhone?.trim() || '',
      applicantNrc: sub.applicantNrc?.trim() || '',
      applicantAddress: sub.applicantAddress?.trim() || '',
      fatherName: sub.fatherName?.trim() || '',
      motherName: sub.motherName?.trim() || '',
      dob: sub.dob || '',
      gender: sub.gender || 'MALE',
      bloodGroup: sub.bloodGroup || '',
      ethnicityReligion: sub.ethnicityReligion || '',
      nrcSubCategory: sub.nrcSubCategory || 'NEW',
      householdListNo: sub.householdListNo || '',
      deceasedPersonName: sub.deceasedPersonName || '',
      dateOfDeath: sub.dateOfDeath || '',
      causeOfDeath: sub.causeOfDeath || '',
      childName: sub.childName || '',
      childDob: sub.childDob || '',
      childGender: sub.childGender || 'MALE',
      placeOfBirth: sub.placeOfBirth || '',
      attachments: sub.attachments || [],
      status: 'PENDING',
      createdAt: now,
      updatedAt: now
    };

    submissions.unshift(newSubmission);
    localStorage.setItem(STORAGE_KEYS.APPLICATION_SUBMISSIONS, JSON.stringify(submissions));

    // Increment count on matching link
    if (sub.linkToken) {
      const links = this.getApplicationLinks();
      const linkIdx = links.findIndex(l => l.token === sub.linkToken);
      if (linkIdx !== -1) {
        links[linkIdx].submissionCount = (links[linkIdx].submissionCount || 0) + 1;
        localStorage.setItem(STORAGE_KEYS.APPLICATION_LINKS, JSON.stringify(links));
      }
    }

    return newSubmission;
  },

  updateSubmissionStatus(id: string, status: ApplicationSubmissionStatus, officerNotes?: string): void {
    const submissions = this.getApplicationSubmissions();
    const idx = submissions.findIndex(s => s.id === id);
    if (idx !== -1) {
      submissions[idx].status = status;
      if (officerNotes !== undefined) {
        submissions[idx].officerNotes = officerNotes;
      }
      submissions[idx].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.APPLICATION_SUBMISSIONS, JSON.stringify(submissions));
    }
  }
};


