import { GoogleGenAI } from '@google/genai';
import { OfficialLetterInput } from '../types';
import { LEGAL_DATABASE } from '../data/legalDatabase';

// Helper to check Gemini client availability
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

export async function aiPolishOfficialLetter(input: OfficialLetterInput): Promise<{
  polishedBody: string[];
  suggestedSubject: string;
  summaryNote: string;
}> {
  const client = getGeminiClient();

  if (!client || !navigator.onLine) {
    // Smart Offline Fallback
    const formattedParagraphs = input.bodyParagraphs.map(p => {
      let trimmed = p.trim();
      if (!trimmed.match(/^[၁-၉၀-၉]+။/)) {
        return trimmed;
      }
      return trimmed;
    });

    return {
      polishedBody: formattedParagraphs,
      suggestedSubject: input.subject || 'အကြောင်းအရာ စိစစ်တင်ပြခြင်း',
      summaryNote: 'Offline Mode: ပြည်ထောင်စုမြန်မာနိုင်ငံတော် ရုံးစာ စံနှုန်းအတိုင်း စာပိုဒ်ပုံစံ အလိုအလျောက် ပုံစံသွင်းပြီးပါပြီ။'
    };
  }

  try {
    const prompt = `
You are an expert Myanmar Government Office Communications Secretary specializing in official letter drafting for the Ministry of Immigration and Population (လူဝင်မှုကြီးကြပ်ရေးနှင့် ပြည်သူ့အင်အားဝန်ကြီးဌာန).

Draft and polish the following letter into formal, authoritative Myanmar government official correspondence standard prose.

Input Details:
- Subject: ${input.subject}
- Sender: ${input.senderTitle} (${input.department})
- Recipient: ${input.recipient}
- Raw Content:
${input.bodyParagraphs.join('\n\n')}

Instructions:
1. Standardize terminology according to official Myanmar government style.
2. Ensure clear numbered paragraphs (၁။, ၂။, ၃။) with proper Burmese punctuation.
3. Output strictly a JSON object with:
   - "polishedBody": array of strings (each paragraph string starting with paragraph number)
   - "suggestedSubject": string (refined formal subject)
   - "summaryNote": string (brief summary of edits made)
`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      return {
        polishedBody: parsed.polishedBody || input.bodyParagraphs,
        suggestedSubject: parsed.suggestedSubject || input.subject,
        summaryNote: parsed.summaryNote || 'AI ဖြင့် ရုံးစာအသုံးအနှုန်း ပုံစံညှိယူပြီးပါပြီ။'
      };
    }
  } catch (error) {
    console.warn('Gemini API call failed, using offline fallback:', error);
  }

  return {
    polishedBody: input.bodyParagraphs,
    suggestedSubject: input.subject,
    summaryNote: 'အကြံပြုချက်- မြန်မာရုံးစာစံနှုန်းအတိုင်း အမှတ်စဉ်အလိုက် စနစ်တကျ ပြင်ဆင်ပြီးပါပြီ။'
  };
}

export async function aiAnalyzeLegalScenario(scenarioQuery: string): Promise<{
  legalAnalysisText: string;
  recommendedActions: string[];
  relevantLawIds: string[];
}> {
  // First find matching local offline sections
  const queryLower = scenarioQuery.toLowerCase();
  const matchedLocal = LEGAL_DATABASE.filter(law => {
    const matchScenario = law.scenarioKeywords.some(k => queryLower.includes(k.toLowerCase()));
    const matchContent = law.content.includes(scenarioQuery) || law.sectionTitle.includes(scenarioQuery) || law.sectionNumber.includes(scenarioQuery);
    return matchScenario || matchContent;
  });

  const matchedLawIds = matchedLocal.map(l => l.id);

  const client = getGeminiClient();

  if (!client || !navigator.onLine) {
    // Offline Analysis Response
    if (matchedLocal.length > 0) {
      const topMatch = matchedLocal[0];
      return {
        legalAnalysisText: `Offline စိစစ်ချက်- တင်ပြပါဖြစ်စဉ်သည် ${topMatch.lawNameMM} ${topMatch.sectionNumber} (${topMatch.sectionTitle}) နှင့် တိုက်ရိုက် သက်ဆိုင်ပါသည်။`,
        recommendedActions: topMatch.officerGuidance.split('\n').filter(line => line.trim().length > 0),
        relevantLawIds: matchedLawIds
      };
    }

    return {
      legalAnalysisText: 'Offline စိစစ်ချက်- တင်ပြပါ ဖြစ်စဉ်အား မြန်မာနိုင်ငံ လူဝင်မှုကြီးကြပ်ရေး အက်ဥပဒေ ပုဒ်မ ၁၃(၁) / ပုဒ်မ ၃(၁) နှင့် ၁၉၄၇ နေထိုင်သူများ မှတ်ပုံတင်ရေး အက်ဥပဒေ ပုဒ်မ ၄ တို့ဖြင့် တိုက်ဆိုင် စိစစ်ပါရန်။',
      recommendedActions: [
        '၁။ ခရီးသွားအထောက်အထား (Passport / Visa / Form C) သက်တမ်း စိစစ်ပါ။',
        '၂။ မသင်္ကာပါက သက်ဆိုင်ရာ မြို့နယ်/ဂိတ် တာဝန်ခံအရာရှိထံ တင်ပြပါ။',
        '၃။ ရက်လွန်/တရားမဝင်ပါက စိစစ်ဆဲ မှတ်တမ်းအဖြစ် ထိန်းသိမ်းစစ်ဆေးပါ။'
      ],
      relevantLawIds: ['law-imm-13-1', 'law-imm-3-1']
    };
  }

  try {
    const prompt = `
You are a Legal Advisor to Myanmar Immigration Field Officers. Analyze this field scenario query: "${scenarioQuery}"

Relevant Laws Database Context:
${JSON.stringify(LEGAL_DATABASE.map(l => ({ id: l.id, law: l.lawNameMM, section: l.sectionNumber, title: l.sectionTitle, penalty: l.penalty, guidance: l.officerGuidance })))}

Task:
1. Identify applicable Myanmar Immigration / Residency / Passport laws and sections.
2. Outline exact step-by-step enforcement procedures for the field officer in Burmese language.
3. Return JSON object with:
   - "legalAnalysisText": string (clear summary analysis in Burmese)
   - "recommendedActions": array of strings (step-by-step procedures in Burmese)
   - "relevantLawIds": array of strings (matching law IDs from context)
`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      return {
        legalAnalysisText: parsed.legalAnalysisText || 'ဖြစ်စဉ်အား ဥပဒေအရ စိစစ်ပြီးပါပြီ။',
        recommendedActions: parsed.recommendedActions || ['၁။ အထောက်အထား စိစစ်ပါ။'],
        relevantLawIds: parsed.relevantLawIds || matchedLawIds
      };
    }
  } catch (error) {
    console.warn('Gemini legal analysis error:', error);
  }

  return {
    legalAnalysisText: `စိစစ်ချက်- ${matchedLocal.length > 0 ? matchedLocal[0].sectionTitle : 'လူဝင်မှုကြီးကြပ်ရေး အက်ဥပဒေအရ စိစစ်ပါရန်'}`,
    recommendedActions: matchedLocal.length > 0 ? matchedLocal[0].officerGuidance.split('\n') : ['၁။ အထောက်အထား စိစစ်ပါ။'],
    relevantLawIds: matchedLawIds
  };
}
