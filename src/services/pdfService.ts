import * as pdfjsLib from 'pdfjs-dist';

// Set up pdfjs worker using cdn worker script for browser runtime
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export interface PdfBook {
  id: string;
  title: string;
  titleMM: string;
  category: string;
  fileSize?: string;
  pageCount: number;
  pdfDataUrl?: string; // Base64 or Blob URL
  extractedPages: { pageNum: number; text: string }[];
}

// Built-in Sample Law PDF books structure
export const INITIAL_PDF_BOOKS: PdfBook[] = [
  {
    id: 'pdf-law-1',
    title: 'The Myanmar Immigration (Emergency Provisions) Act 1947',
    titleMM: '၁၉၄၇ ခုနှစ် မြန်မာနိုင်ငံလူဝင်မှုကြီးကြပ်ရေး (ခေတ္တ) အက်ဥပဒေ စာအုပ်',
    category: 'လူဝင်မှုကြီးကြပ်ရေး',
    pageCount: 12,
    extractedPages: [
      {
        pageNum: 1,
        text: `ပြည်ထောင်စုမြန်မာနိုင်ငံတော်
၁၉၄၇ ခုနှစ် မြန်မာနိုင်ငံလူဝင်မှုကြီးကြပ်ရေး (ခေတ္တ) အက်ဥပဒေ

ပုဒ်မ ၁။ ဤအက်ဥပဒေကို ၁၉၄၇ ခုနှစ် မြန်မာနိုင်ငံလူဝင်မှုကြီးကြပ်ရေး (ခေတ္တ) အက်ဥပဒေ ဟု ခေါ်တွင်စေရမည်။
ပုဒ်မ ၃ (၁)။ မည်သည့် နိုင်ငံခြားသားမဆို တရားဝင် နိုင်ငံကူးလက်မှတ် သို့မဟုတ် ပြည်ဝင်ခွင့်ဗီဇာ (Visa) မပါဘဲ မြန်မာနိုင်ငံ သို့ ဝင်ရောက်ခွင့်မရှိ။
ပုဒ်မ ၁၃ (၁)။ မည်သူမဆို တရားဝင် နိုင်ငံကူးလက်မှတ် သို့မဟုတ် ပြည်ဝင်ခွင့်ဗီဇာ မပါရှိဘဲ ဝင်ရောက်ပါက သို့မဟုတ် ခွင့်ပြုထားသော နေထိုင်ခွင့် သက်တမ်း ကုန်ဆုံးပြီးနောက် ဆက်လက်နေထိုင်ပါက အနည်းဆုံး ထောင်ဒဏ် (၆) လ မှ အများဆုံး ထောင်ဒဏ် (၅) နှစ်အထိ သို့မဟုတ် ဒဏ်ငွေ သို့မဟုတ် ဒဏ်နှစ်ရပ်လုံး ချမှတ်နိုင်သည်။`
      },
      {
        pageNum: 2,
        text: `ပုဒ်မ ၁၃ (၂)။ မည်သူမဆို တရားမဝင် ဝင်ရောက်လာသူ သို့မဟုတ် တရားမဝင် နေထိုင်သူအား မြန်မာနိုင်ငံအတွင်းသို့ ဝင်ရောက်ရန်၊ ပုန်းအောင်းရန်၊ သယ်ယူပို့ဆောင်ရန် သို့မဟုတ် အလုပ်ခန့်ထားရန် အားပေးကူညီပါက အနည်းဆုံး ထောင်ဒဏ် (၆) လ မှ အများဆုံး ထောင်ဒဏ် (၅) နှစ်အထိ ကျခံစေရမည်။
ပုဒ်မ ၁၃ (၅)။ ဥပဒေတစ်ရပ်ရပ်အရ အပြစ်ဒဏ်ကျခံပြီးသော သို့မဟုတ် ပြစ်ဒဏ်မှ ကင်းလွတ်ခွင့်ရရှိသော နိုင်ငံခြားသားအား မြန်မာနိုင်ငံမှ ထွက်ခွာသွားစေရန် ပြည်နှင်ဒဏ်မိန့်စာ ထုတ်ပြန်နိုင်သည်။`
      }
    ]
  },
  {
    id: 'pdf-law-2',
    title: 'The Myanmar Residents Registration Act 1947',
    titleMM: '၁၉၄၇ ခုနှစ် မြန်မာနိုင်ငံအတွင်းနေထိုင်သူများ မှတ်ပုံတင်ရေးအက်ဥပဒေ စာအုပ်',
    category: 'နေထိုင်ခွင့် စည်းမျဉ်း',
    pageCount: 8,
    extractedPages: [
      {
        pageNum: 1,
        text: `၁၉၄၇ ခုနှစ် မြန်မာနိုင်ငံအတွင်းနေထိုင်သူများ မှတ်ပုံတင်ရေးအက်ဥပဒေ

ပုဒ်မ ၄။ မြန်မာနိုင်ငံအတွင်း ရက်ပေါင်း (၉၀) ထက်ပိုမိုနေထိုင်သော နိုင်ငံခြားသားများသည် နိုင်ငံခြားသား မှတ်ပုံတင်ကတ်ပြား (Form C / FRC) လျှောက်ထားရမည်။
ပုဒ်မ ၅။ တည်းခိုရာ ဟိုတယ်/တည်းခိုခန်း/အိမ်ရှင်သည် နိုင်ငံခြားသား ရောက်ရှိပြီး ၂၄ နာရီအတွင်း သက်ဆိုင်ရာ လဝက ရုံးသို့ Form C သတင်းပို့ ရမည်။ ပျက်ကွက်ပါက ဒဏ်ငွေ သို့မဟုတ် ထောင်ဒဏ် (၆) လအထိ ချမှတ်နိုင်သည်။`
      }
    ]
  },
  {
    id: 'pdf-law-3',
    title: 'Myanmar Passport Law 2012',
    titleMM: '၂၀၁၂ ခုနှစ် မြန်မာနိုင်ငံ နိုင်ငံကူးလက်မှတ် ဥပဒေ စာအုပ်',
    category: 'နိုင်ငံကူးလက်မှတ်',
    pageCount: 15,
    extractedPages: [
      {
        pageNum: 1,
        text: `၂၀၁၂ ခုနှစ် မြန်မာနိုင်ငံ နိုင်ငံကူးလက်မှတ် ဥပဒေ

ပုဒ်မ ၉။ မည်သူမဆို သတင်းအချက်အလက် မမှန်မကန်ပေး၍ နိုင်ငံကူးလက်မှတ် လျှောက်ထားခြင်း၊ အတုပြုလုပ်ခြင်း သို့မဟုတ် အတုကို ကိုင်ဆောင်အသုံးပြုခြင်း မပြုရ။ ပြစ်ဒဏ် - ထောင်ဒဏ် အနည်းဆုံး (၃) နှစ်မှ အများဆုံး (၇) နှစ်အထိ ချမှတ်ရမည်။
ပုဒ်မ ၁၀။ သူတစ်ပါး၏ နိုင်ငံကူးလက်မှတ်အား အလွဲသုံးစားပြုခြင်း သို့မဟုတ် ရောင်းချခြင်း မပြုရ။ ပြစ်ဒဏ် - ထောင်ဒဏ် (၃) နှစ်အထိ။`
      }
    ]
  }
];

export async function parsePdfFile(file: File): Promise<PdfBook> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const extractedPages: { pageNum: number; text: string }[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    try {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      extractedPages.push({
        pageNum,
        text: pageText || `စာမျက်နှာ (${pageNum}) အကြောင်းအရာ`
      });
    } catch (e) {
      console.warn(`Error parsing page ${pageNum}:`, e);
      extractedPages.push({ pageNum, text: `စာမျက်နှာ (${pageNum})` });
    }
  }

  const pdfUrl = URL.createObjectURL(file);

  return {
    id: `pdf-upload-${Date.now()}`,
    title: file.name.replace(/\.pdf$/i, ''),
    titleMM: `${file.name.replace(/\.pdf$/i, '')} (တင်သွင်းထားသော ဥပဒေစာအုပ်)`,
    category: 'တင်သွင်းထားသော ဥပဒေ',
    fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    pageCount: pdf.numPages,
    pdfDataUrl: pdfUrl,
    extractedPages
  };
}
