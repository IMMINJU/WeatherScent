export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
  moodText?: string;
}

export interface PerfumeRecommendation {
  name: string;
  brand: string;
  category: string;
  notes: string[];
  reason: string;
  moodText: string;
  confidence: number;
  image?: string;
  rating?: number;
  views?: number;
}

export interface Perfume {
  id: number;
  name: string;
  brand: string;
  category: string;
  notes: string[];
  description?: string;
  image?: string;
  rating?: number;
  views?: number;
}

export interface UserPreferences {
  favoriteCategories: string[];
  intensity: "light" | "medium" | "strong";
  occasion: string[];
  ageRange?: string;
  gender?: string;
}

export interface PreferenceQuestion {
  id: number;
  title: string;
  subtitle: string;
  options: {
    id: string;
    label: string;
    description: string;
    icon: string;
    value: any;
  }[];
}

export interface ChatMessage {
  id: number;
  message: string;
  isUser: boolean;
  timestamp: Date;
  recommendations?: PerfumeRecommendation[];
}

export interface WishlistItem {
  id: number;
  perfume: Perfume;
  createdAt: Date;
}
