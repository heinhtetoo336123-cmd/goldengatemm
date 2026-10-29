export type UserRole = 'ADMIN' | 'OFFICER' | 'INSPECTOR' | 'SUPERVISOR';

export interface UserLocationConfig {
  regionId: string;
  districtId: string;
  townshipId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  badgeNumber: string;
  department: string;
  station: string;
  isPreApproved: boolean;
}

export type DocumentCategory = 
  | 'DIRECTIVE'       // ညွှန်ကြားစာ
  | 'INBOUND'         // ဝင်စာ
  | 'OUTBOUND'        // ထွက်စာ
  | 'INSPECTION'      // စစ်ဆေးရေးမှတ်တမ်း
  | 'VISA_VERIFY';    // ဗီဇာ/ကတ် စိစစ်မှု

export type SyncStatus = 'SYNCED' | 'PENDING';

export interface DocumentRecord {
  id: string;
  refNumber: string;       // စာအမှတ်
  title: string;           // အကြောင်းအရာ
  category: DocumentCategory;
  date: string;            // ရက်စွဲ
  sender: string;          // ပေးပို့သူ
  receiver: string;        // ပေးပို့ခြင်း
  summary: string;         // အကျဉ်းချုပ်
  fullText: string;        // စာအပြည့်အစုံ
  classification: 'NONE' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET';
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
  attachmentName?: string;
}

export type LetterType = 'COVER_LETTER' | 'TELEGRAM' | 'OFFICE_ORDER' | 'VERIFY_REPLY' | 'RECOMMENDATION' | 'CUSTOM';

export interface LetterPreset {
  id: string;
  category: string;        // e.g. 'မြို့နယ် Section အသုံး'
  title: string;           // e.g. 'ရုံးစာ (အပေါ်စာ)', 'ကြေးနန်းစာ', 'ရုံးတွင်းအမိန့်စာ', 'စိစစ်ပြန်ကြားစာ', 'ထောက်ခံစာ'
  letterType: LetterType;  // Layout type
  regionId?: string;       // e.g. 'tanintharyi'
  districtId?: string;     // e.g. 'dawei_district'
  townshipId?: string;     // e.g. 'dawei_township'
  townshipName?: string;   // e.g. 'ထားဝယ်မြို့နယ်'
  subject: string;
  referenceText?: string;  // ရည်ညွှန်းချက်
  ministry?: string;
  department?: string;
  location?: string;
  recipient?: string;
  bodyParagraphs: string[];
  copyTo: string[];
  senderTitle?: string;     // ပေးပို့သူ/လက်မှတ်ထိုးသူ ရာထူး
  senderName?: string;      // ပေးပို့သူ/လက်မှတ်ထိုးသူ အမည်
  classification?: 'NONE' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET';
  urgency?: 'ORDINARY' | 'IMPORTANT' | 'URGENT' | 'IMMEDIATE';
}

export type LawCategory = 
  | 'IMMIGRATION' 
  | 'RESIDENCY' 
  | 'PASSPORT' 
  | 'CITIZENSHIP' 
  | 'VISA_REGULATION';

export interface LegalLawSection {
  id: string;
  lawName: string;
  lawNameMM: string;
  actYear: string;
  sectionNumber: string;     // ပုဒ်မ
  sectionTitle: string;    // ခေါင်းစဉ်
  content: string;         // ဥပဒေပါ ပြဋ္ဌာန်းချက်
  penalty: string;         // ပြစ်ဒဏ် (ထောင်ဒဏ်/ဒဏ်ငွေ)
  officerGuidance: string; // အရာရှိ ဆောင်ရွက်ရန် လုပ်ထုံးလုပ်နည်းများ
  scenarioKeywords: string[];
  category: LawCategory;
}

export interface OfficialLetterInput {
  docNumber: string;        // စာအမှတ်
  date: string;             // ရက်စွဲ
  ministry: string;         // ဝန်ကြီးဌာန
  department: string;       // ဦးစီးဌာန
  officeLocation: string;   // ရုံးတည်နေရာ
  subject: string;          // အကြောင်းအရာ
  referenceText: string;    // ရည်ညွှန်းချက်
  recipient: string;        // ပေးပို့ခြင်း
  senderTitle: string;      // ပေးပို့သူ ရာထူး
  senderName: string;       // ပေးပို့သူ အမည်
  classification: 'NONE' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET';
  urgency: 'ORDINARY' | 'IMPORTANT' | 'URGENT' | 'IMMEDIATE';
  letterType: LetterType;
  bodyParagraphs: string[];
  copyTo: string[];         // မိတ္တူ
}

export interface TelegramRoutingRecipient {
  code: string;             // e.g. '(ပ)', '(လ)', '(တ)'
  office: string;           // e.g. 'ခရမ၊ လဝပ၊ မူဆယ်'
}

export interface TelegramPersonnelRow {
  code: string;             // e.g. '(က)', '(ခ)', '(ဂ)'
  serialNo: string;         // e.g. 'လဝက-၁၆၉၇၅'
  rankName: string;         // e.g. 'ဒု-လဝကမှူး ဦးမျိုးသိန်းအေး'
  station: string;          // e.g. 'မူဆယ်(မနမ)'
}

export interface TelegramInput {
  routingRecipients: TelegramRoutingRecipient[];
  telegramNo: string;        // e.g. '၀၀၆ / အခမ ၊ ၊'
  dateTimeGroup: string;     // e.g. '၂၀၂၆ ဇန် ၂၂ ၁၆၀၀'
  paragraphs: string[];
  personnelList: TelegramPersonnelRow[];
  telegraphicClosing: string;// e.g. 'တင်ပြသွားရန် အကကသည်---/'
  dispatchMethod: string;    // e.g. 'သင့်ရာနည်းဖြင့်'
  securityLevel: string;     // e.g. 'အဆင့်အတန်း'
  signatoryTitle: string;    // e.g. 'ခရိုင်ဦးစီးမှူး'
  signatoryName: string;     // e.g. '(ထွန်းဇော်ဦး၊ ဒုတိယညွှန်ကြားရေးမှူး)'
}

export interface RegisteredOfficer {
  id: string;
  name: string;             // အရာရှိ အမည်
  rank: string;             // ရာထူး (ဒုတိယညွှန်ကြားရေးမှူး၊ ခရိုင်ဦးစီးမှူး၊ မြို့နယ်ဦးစီးမှူး၊ ဦးစီးအရာရှိ၊ ဒု-လဝကမှူး၊ လဝကမှူး)
  serialNo?: string;        // ကိုယ်ပိုင်အမှတ် (e.g. လဝက-၁၅၉၃၁)
  officeName: string;       // တာဝန်ကျရာ ရုံး/စခန်း
  regionId: string;         // တိုင်းဒေသကြီး / ပြည်နယ် ID
  districtId: string;       // ခရိုင် ID
  townshipId: string;       // မြို့နယ် ID
  townshipNameMM: string;   // မြို့နယ် အမည် (မြန်မာ)
  phone: string;            // တရားဝင် ဖုန်းနံပါတ်
  officePhone?: string;     // ရုံးဖုန်း
  email?: string;           // အီးမေးလ်
  viberNumber?: string;     // ဗိုင်ဘာ နံပါတ်
  status: 'VERIFIED' | 'PENDING_APPROVAL'; // အတည်ပြုပြီး / စောင့်ဆိုင်းဆဲ
  notes?: string;           // မှတ်ချက် / လက်ရှိတာဝန်
  registeredAt?: string;     // စာရင်းသွင်း ရက်စွဲ
  approvedBy?: string;      // Admin အတည်ပြုသူ
}

export interface MasterLetterData {
  recipients: string[];
  subjects: string[];
  referenceTexts: string[];
  senderTitles: string[];
  senderNames: string[];
}

// Applying Zone (လျှောက်လွှာတင်ခြင်း ဇုန်) Types
export type ApplicationType = 
  | 'NRC_APP'           // နိုင်ငံသားစိစစ်ရေးကတ်ပြား လျှောက်ထားခြင်း
  | 'HOUSEHOLD_APP'     // အိမ်ထောင်စုလူဦးရေစာရင်း လျှောက်ထားခြင်း (ပုံစံ ၆၆/၆)
  | 'DECEASED_REMOVAL'  // အိမ်ထောင်စုစာရင်းမှ သေဆုံးသူ ပယ်ဖျက်ခြင်း
  | 'BIRTH_ADDITION';   // အိမ်ထောင်စုစာရင်းသို့ မွေးဖွားသူ ထည့်သွင်းခြင်း

export interface ApplicationLink {
  id: string;
  token: string;              // e.g. APP-2026-X89K2
  officerId: string;         // e.g. usr-101 / officer email
  officerName: string;       // e.g. Hein Htet Oo
  officerBadge: string;      // e.g. IMM-2026
  officerStation: string;    // e.g. မင်္ဂလာဒုံမြို့နယ် ရုံး
  applicationType: ApplicationType;
  townshipName: string;
  customNote?: string;
  createdAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  submissionCount: number;
}

export type ApplicationSubmissionStatus = 
  | 'PENDING'          // စိစစ်ဆဲ
  | 'APPROVED'         // အတည်ပြုပြီး
  | 'REJECTED'         // ငြင်းပယ်ထား
  | 'REVISION_NEEDED'; // ပြင်ဆင်ရန် အကြောင်းကြား

export interface ApplicationAttachment {
  title: string;
  dataUrl: string;     // Base64 or image preview URL
}

export interface ApplicationSubmission {
  id: string;
  submissionRef: string;     // e.g. REF-2026-94812
  linkToken: string;
  officerId: string;
  officerEmail: string;
  applicationType: ApplicationType;
  
  // General Applicant Info
  applicantName: string;
  applicantPhone: string;
  applicantNrc: string;
  applicantAddress: string;
  fatherName: string;
  motherName: string;
  dob: string;
  gender: 'MALE' | 'FEMALE';
  bloodGroup?: string;
  ethnicityReligion?: string;

  // NRC Application Specific
  nrcSubCategory?: '10_YEAR' | '18_YEAR' | 'REPLACEMENT' | 'NEW';

  // Household List / Deceased / Birth Specific
  householdListNo?: string;
  deceasedPersonName?: string;
  dateOfDeath?: string;
  causeOfDeath?: string;
  childName?: string;
  childDob?: string;
  childGender?: 'MALE' | 'FEMALE';
  placeOfBirth?: string;

  // Documents attached
  attachments: ApplicationAttachment[];

  status: ApplicationSubmissionStatus;
  officerNotes?: string;
  createdAt: string;
  updatedAt: string;
}
