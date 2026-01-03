
import { District } from './types';

export interface DistrictMetadata extends District {
  soilType: string;
  majorCrops: string[];
}

export const MP_DISTRICTS: DistrictMetadata[] = [
  { name: 'Sehore', region: 'Malwa', soilType: 'Deep Black Soil', majorCrops: ['Soybean', 'Wheat', 'Gram'] },
  { name: 'Indore', region: 'Malwa', soilType: 'Medium Black Soil', majorCrops: ['Potato', 'Soybean', 'Wheat'] },
  { name: 'Jabalpur', region: 'Mahakoshal', soilType: 'Mixed Red & Black', majorCrops: ['Rice', 'Wheat', 'Peas'] },
  { name: 'Gwalior', region: 'Gwalior-Chambal', soilType: 'Alluvial Soil', majorCrops: ['Mustard', 'Wheat', 'Bajra'] },
  { name: 'Bhopal', region: 'Malwa', soilType: 'Black Soil', majorCrops: ['Wheat', 'Soybean', 'Pulses'] },
  { name: 'Ujjain', region: 'Malwa', soilType: 'Black Soil', majorCrops: ['Soybean', 'Wheat', 'Gram'] },
  { name: 'Rewa', region: 'Vindhya', soilType: 'Mixed Red & Yellow', majorCrops: ['Rice', 'Wheat', 'Linseed'] },
  { name: 'Sagar', region: 'Bundelkhand', soilType: 'Mixed Red & Black', majorCrops: ['Soybean', 'Wheat', 'Gram'] },
  { name: 'Tikamgarh', region: 'Bundelkhand', soilType: 'Red Soil', majorCrops: ['Groundnut', 'Soybean', 'Wheat'] },
  { name: 'Chhatarpur', region: 'Bundelkhand', soilType: 'Mixed Red & Black', majorCrops: ['Mustard', 'Wheat', 'Gram'] },
  { name: 'Hoshangabad', region: 'Malwa', soilType: 'Alluvial/Black', majorCrops: ['Wheat', 'Soybean', 'Moong'] },
  { name: 'Vidisha', region: 'Malwa', soilType: 'Black Soil', majorCrops: ['Wheat', 'Gram', 'Soybean'] },
  { name: 'Raisen', region: 'Malwa', soilType: 'Black Soil', majorCrops: ['Wheat', 'Soybean', 'Gram'] },
  { name: 'Dewas', region: 'Malwa', soilType: 'Deep Black Soil', majorCrops: ['Soybean', 'Wheat', 'Potato'] },
  { name: 'Dhar', region: 'Malwa', soilType: 'Medium Black Soil', majorCrops: ['Cotton', 'Soybean', 'Maize'] }
];

export const UI_STRINGS = {
  EN: {
    title: 'MP Kisan AI',
    tagline: 'Smart Agriculture Advisory for Madhya Pradesh',
    cropAdvisor: 'Crop Advisor',
    pestDoctor: 'Pest Doctor',
    kisanChat: 'Kisan Sahayak',
    dashboard: 'Dashboard',
    languageToggle: 'हिन्दी',
    inputSoil: 'Enter Soil Parameters',
    getRecommendation: 'Get AI Recommendation',
    detectPest: 'Identify Pest/Disease',
    district: 'Select District',
    nitrogen: 'Nitrogen (N)',
    phosphorus: 'Phosphorus (P)',
    potassium: 'Potassium (K)',
    ph: 'pH Level',
    analyzing: 'AI is analyzing...',
    results: 'Results',
    cropSuggestion: 'Recommended Crops',
    fertilizerTitle: 'Fertilizer Guide',
    irrigationTitle: 'Irrigation Plan',
    pestWarning: 'Warning: Possible Pest Attack detected',
    chatPlaceholder: 'Ask Kisan Sahayak anything...',
    govSchemes: 'Relevant Government Schemes',
  },
  HI: {
    title: 'एमपी किसान एआई',
    tagline: 'मध्य प्रदेश के किसानों के लिए स्मार्ट कृषि सलाहकार',
    cropAdvisor: 'फसल सलाहकार',
    pestDoctor: 'कीट चिकित्सक',
    kisanChat: 'किसान सहायक',
    dashboard: 'डैशबोर्ड',
    languageToggle: 'English',
    inputSoil: 'मिट्टी के पैरामीटर दर्ज करें',
    getRecommendation: 'एआई सिफारिश प्राप्त करें',
    detectPest: 'कीट/रोग की पहचान करें',
    district: 'जिला चुनें',
    nitrogen: 'नाइट्रोजन (N)',
    phosphorus: 'फास्फोरस (P)',
    potassium: 'पोटेशियम (K)',
    ph: 'पीएच स्तर',
    analyzing: 'एआई विश्लेषण कर रहा है...',
    results: 'परिणाम',
    cropSuggestion: 'अनुशंसित फसलें',
    fertilizerTitle: 'उर्वरक गाइड',
    irrigationTitle: 'सिंचाई योजना',
    pestWarning: 'चेतावनी: संभावित कीट हमले का पता चला',
    chatPlaceholder: 'किसान सहायक से कुछ भी पूछें...',
    govSchemes: 'प्रासंगिक सरकारी योजनाएं',
  }
};
