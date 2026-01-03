
export enum Language {
  ENGLISH = 'EN',
  HINDI = 'HI'
}

export type District = {
  name: string;
  region: 'Bundelkhand' | 'Malwa' | 'Mahakoshal' | 'Gwalior-Chambal' | 'Vindhya';
};

export type SoilData = {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  district: string;
};

export interface RecommendationResult {
  suggestedCrops: string[];
  fertilizerAdvice: string;
  irrigationSchedule: string;
  risks: string[];
  thoughtProcess?: string;
}

export interface PestAnalysisResult {
  pestName: string;
  confidence: number;
  remedy: string;
  preventiveMeasures: string[];
}

export interface MarketIntelligenceResult {
  predictions: {
    timeframe: string;
    min: number;
    max: number;
    avg: number;
    confidence: number;
  }[];
  influencingFactors: string[];
  summary: string;
}

export type WeatherData = {
  current: {
    temp: string;
    condition: string;
    feelsLike: string;
    humidity: string;
    windSpeed: string;
    uvIndex: string;
  };
  forecast: {
    day: string;
    condition: string;
    high: string;
    low: string;
  }[];
  sowingSuitability: string;
  agriWarnings: string[];
  sources?: { title: string; uri: string }[];
};

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  audio?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success';
  time: string;
  read: boolean;
}
