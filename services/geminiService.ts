
// @google/genai guidelines followed: use new GoogleGenAI({apiKey: process.env.API_KEY})
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SoilData, RecommendationResult, PestAnalysisResult, Language, ChatMessage, WeatherData, MarketIntelligenceResult } from "../types";

const MASTER_AGRI_INSTRUCTION = `
  Act as an AI agricultural advisor for farmers in Madhya Pradesh. 
  Focus on MP agro-climatic zones: Malwa Plateau, Bundelkhand, Vindhya Plateau, Mahakoshal, and Gwalior-Chambal.
  Provide localized, clear, and actionable advice.
`;

// Exponential Backoff Utility
const callWithRetry = async (fn: () => Promise<any>, maxRetries = 3) => {
  let delay = 1000;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isQuotaError = error?.message?.includes('429') || error?.message?.toLowerCase().includes('quota');
      const isNotFoundError = error?.message?.includes('Requested entity was not found');

      if (isNotFoundError) {
        // As per instructions, reset key state if entity not found
        if (typeof window !== 'undefined' && (window as any).aistudio) {
          await (window as any).aistudio.openSelectKey();
        }
        throw error;
      }

      if (isQuotaError && i < maxRetries - 1) {
        console.warn(`Quota exceeded. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      throw error;
    }
  }
};

const extractJson = (text: string) => {
  if (!text) return null;
  try {
    const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      let candidate = jsonMatch[0];
      candidate = candidate.replace(/\\n/g, '').replace(/\n/g, '');
      return JSON.parse(candidate);
    }
    return JSON.parse(text);
  } catch (e) {
    try {
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      }
    } catch (e2) {}
    return null;
  }
};

export const getMarketIntelligence = async (crop: string, district: string, mandis: string, lang: Language): Promise<MarketIntelligenceResult> => {
  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      You are an agricultural market intelligence AI for Madhya Pradesh.
      
      Inputs:
      - Crop: ${crop}
      - District: ${district}
      - Target Mandis: ${mandis || 'Major district mandis'}
      
      Your Expertise must include:
      - Retrieval of Historical mandi prices (last 3–5 years) via Google Search.
      - Analysis of Current arrivals & demand trends.
      - Assessment of Weather impact on supply for the specified region.
      - Checking Current MSP (Minimum Support Price).

      Tasks:
      1. Predict mandi price range (₹ per quintal) for the next 7, 15, and 30 days.
      2. Provide minimum, average, and maximum expected price for each period.
      3. Mention confidence level (0-100) for each prediction.
      4. Highlight key factors influencing the price.
      
      IMPORTANT: The summary and factors MUST be in ${lang === Language.HINDI ? 'simple, clear Hindi (हिन्दी)' : 'English'}.
      
      Return strictly as JSON with this structure:
      {
        "predictions": [
          { "timeframe": "7 Days", "min": number, "max": number, "avg": number, "confidence": number },
          { "timeframe": "15 Days", "min": number, "max": number, "avg": number, "confidence": number },
          { "timeframe": "30 Days", "min": number, "max": number, "avg": number, "confidence": number }
        ],
        "influencingFactors": ["Hindi text strings"],
        "summary": "Full summary in Hindi"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "{}");
  });
};

export const getCropRecommendation = async (data: SoilData, lang: Language): Promise<RecommendationResult> => {
  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `${MASTER_AGRI_INSTRUCTION} Analyze soil for ${data.district}. Respond in ${lang === Language.HINDI ? 'Hindi' : 'English'}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const analyzePestImage = async (images: string[], lang: Language): Promise<PestAnalysisResult> => {
  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts = images.map(img => ({ inlineData: { data: img.split(',')[1], mimeType: 'image/png' } }));
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [...parts, { text: `Identify pest/disease. Respond in ${lang === Language.HINDI ? 'Hindi' : 'English'}.` }] },
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const getKisanChatResponse = async (history: ChatMessage[], message: string, lang: Language): Promise<string> => {
  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const contents = history.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
    contents.push({ role: 'user', parts: [{ text: message }] });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents,
      config: { systemInstruction: MASTER_AGRI_INSTRUCTION, thinkingConfig: { thinkingBudget: 32768 } }
    });
    return response.text || "";
  });
};

export const textToSpeech = async (text: string) => {
  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: { responseModalities: [Modality.AUDIO] },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  });
};

export const getWeatherData = async (district: string, lang: Language): Promise<WeatherData> => {
  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Weather for ${district}, MP as JSON.`,
      config: { tools: [{ googleSearch: {} }] }
    });
    const parsed = extractJson(response.text || "{}");
    return { ...parsed };
  });
};

export const connectLiveAssistant = (callbacks: any, lang: Language) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      systemInstruction: `${MASTER_AGRI_INSTRUCTION}. Use ${lang === Language.HINDI ? 'Hindi' : 'English'}.`,
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
      }
    }
  });
};

export const generateAgriImage = async (prompt: string, aspectRatio: string = "1:1", imageSize: string = "1K") => {
  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: imageSize as any
        }
      }
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  });
};

export const generateAgriVideo = async (prompt: string, aspectRatio: '16:9' | '9:16' = '16:9', imageBytes?: string) => {
  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      image: imageBytes ? {
        imageBytes: imageBytes.split(',')[1],
        mimeType: 'image/png'
      } : undefined,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  });
};

export const editAgriImage = async (base64Image: string, prompt: string) => {
  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1],
              mimeType: 'image/png',
            },
          },
          { text: prompt },
        ],
      },
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  });
};
