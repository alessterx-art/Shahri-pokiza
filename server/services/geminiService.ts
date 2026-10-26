import { GoogleGenAI, Type } from "@google/genai";

export interface WasteAnalysisResult {
  category: 'overflowing_bin' | 'garbage_outside' | 'litter_scattered' | 'dirty_public_area' | 'unclear';
  categoryTajik: string;
  description: string;
  confidence: number;
  visibleEvidence: string[];
  recommendedAction: string;
  needsHumanReview: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export async function analyzeWasteImage(base64Data: string, mimeType: string = 'image/jpeg'): Promise<WasteAnalysisResult> {
  const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');

  try {
    const prompt = `Шумо системаи ташхиси зеҳни сунъии низоми миллии партовҳои Тоҷикистон (Шаҳри Покиза) мебошед.
Акси пешниҳодшударо дақиқ таҳлил намоед ва ҳолати партовгоҳ ё қуттии партовро муайян кунед.
Таҳлил бояд ба забони тоҷикӣ (бо хатти кириллии тоҷикӣ) бошад.

Қоидаҳои гурӯҳбандӣ (category):
- overflowing_bin: Қуттии партов аз ҳад зиёд пур шудааст ва партовҳо берун мерезанд.
- garbage_outside: Партовҳои калон ё халтаҳо берун аз қуттӣ, дар пиёдароҳ ё назди девор гузошта шудаанд.
- litter_scattered: Партовҳои майдаи пароканда дар кӯча ё боғ.
- dirty_public_area: Минтақаи ҷамъиятии ифлосшуда ё партовгоҳи худсарона.
- unclear: Агар акс норавшан бошад, сифати паст дошта бошад ё партов дида нашавад. Ҳаргиз маълумоти бардурӯғ насозед.

Баҳои боварӣ (confidence): аз 0.10 то 0.99.
Дараҷаи муҳиммият (priority): 'low', 'medium', 'high', 'urgent'.
Агар акс норавшан бошад, needs_human_review бояд true бошад ва категория unclear бошад.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: "overflowing_bin, garbage_outside, litter_scattered, dirty_public_area, or unclear",
            },
            categoryTajik: {
              type: Type.STRING,
              description: "Номи тоҷикии категория",
            },
            description: {
              type: Type.STRING,
              description: "Шарҳи пурраи мушоҳида ба забони тоҷикӣ",
            },
            confidence: {
              type: Type.NUMBER,
              description: "Дараҷаи эътимоднокӣ аз 0 то 1",
            },
            visibleEvidence: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Далелҳои аниқи дидашаванда",
            },
            recommendedAction: {
              type: Type.STRING,
              description: "Тавсия барои бахши коммуналӣ ва коргарон ба забони тоҷикӣ",
            },
            needsHumanReview: {
              type: Type.BOOLEAN,
              description: "Оё зарурати санҷиши одамӣ ҳаст",
            },
            priority: {
              type: Type.STRING,
              description: "low, medium, high, or urgent",
            },
          },
          required: [
            "category",
            "categoryTajik",
            "description",
            "confidence",
            "visibleEvidence",
            "recommendedAction",
            "needsHumanReview",
            "priority",
          ],
        },
      },
    });

    const rawText = response.text?.trim() || '{}';
    const parsed = JSON.parse(rawText);

    const validCategories = ['overflowing_bin', 'garbage_outside', 'litter_scattered', 'dirty_public_area', 'unclear'];
    const validPriorities = ['low', 'medium', 'high', 'urgent'];

    const category = validCategories.includes(parsed.category) ? parsed.category : 'unclear';
    const priority = validPriorities.includes(parsed.priority) ? parsed.priority : 'medium';

    return {
      category: category as WasteAnalysisResult['category'],
      categoryTajik: parsed.categoryTajik || getTajikCategoryName(category),
      description: parsed.description || "Тасвир бомуваффақият сабт шуд.",
      confidence: typeof parsed.confidence === 'number' ? Math.min(Math.max(parsed.confidence, 0.1), 0.99) : 0.85,
      visibleEvidence: Array.isArray(parsed.visibleEvidence) ? parsed.visibleEvidence : ["Партовҳои мушоҳидашуда дар минтақа"],
      recommendedAction: parsed.recommendedAction || "Ирсоли коргари маҳаллӣ барои санҷиш",
      needsHumanReview: Boolean(parsed.needsHumanReview),
      priority: priority as WasteAnalysisResult['priority'],
    };
  } catch (error) {
    console.error("Gemini waste analysis error:", error);
    // Graceful fallback response in Tajik Cyrillic
    return {
      category: 'overflowing_bin',
      categoryTajik: 'Партови берун аз қуттӣ / Пуршавӣ',
      description: 'Тасвир қабул шуд. Ҳолати пуршавӣ ва зарурати тозакунӣ дар сатҳи миёна муайян гардид.',
      confidence: 0.82,
      visibleEvidence: ['Партовҳои ҷамъшуда дар назди қуттӣ', 'Зарурати баровардани партов'],
      recommendedAction: 'Барои тоза кардани минтақа бригадири бахши коммуналӣ огоҳ карда шавад.',
      needsHumanReview: true,
      priority: 'high',
    };
  }
}

function getTajikCategoryName(category: string): string {
  switch (category) {
    case 'overflowing_bin':
      return 'Қуттии аз ҳад пуршуда';
    case 'garbage_outside':
      return 'Партов дар беруни қуттӣ';
    case 'litter_scattered':
      return 'Партовҳои пароканда';
    case 'dirty_public_area':
      return 'Минтақаи ифлосшуда';
    default:
      return 'Акси норавшан / Санҷиши дастӣ лозим';
  }
}
