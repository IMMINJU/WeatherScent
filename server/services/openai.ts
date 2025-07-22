import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface PerfumeRecommendation {
  name: string;
  brand: string;
  category: string;
  notes: string[];
  reason: string;
  moodText: string;
  confidence: number;
}

export interface ChatResponse {
  message: string;
  recommendations?: PerfumeRecommendation[];
}

export async function getWeatherBasedRecommendations(
  weatherData: any,
  userPreferences?: any
): Promise<PerfumeRecommendation[]> {
  try {
    const prompt = `
You are an expert perfume consultant. Based on the following weather conditions and user preferences, recommend 3 perfumes that would be perfect for today.

Weather Information:
- Temperature: ${weatherData.temperature}°C
- Condition: ${weatherData.condition}
- Humidity: ${weatherData.humidity}%
- Location: ${weatherData.location}

User Preferences:
${userPreferences ? JSON.stringify(userPreferences, null, 2) : "No specific preferences provided"}

Please provide recommendations in JSON format with the following structure:
{
  "recommendations": [
    {
      "name": "perfume name",
      "brand": "brand name",
      "category": "fragrance category (프레시/플로럴/우디/오리엔탈)",
      "notes": ["note1", "note2", "note3"],
      "reason": "detailed explanation why this perfume suits the weather and preferences",
      "moodText": "poetic description of how this perfume matches the day's mood",
      "confidence": 0.95
    }
  ]
}

Focus on how the weather conditions (temperature, humidity, atmospheric pressure) affect how fragrances perform and how they should complement the day's mood.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.recommendations || [];
  } catch (error) {
    console.error("Error getting weather-based recommendations:", error);
    throw new Error("Failed to get AI recommendations");
  }
}

export async function analyzePreferences(answers: any[]): Promise<any> {
  try {
    const prompt = `
You are a perfume expert analyzing user preferences. Based on the following quiz answers, provide a detailed analysis and fragrance profile.

Quiz Answers:
${JSON.stringify(answers, null, 2)}

Please provide the analysis in JSON format:
{
  "profile": {
    "favoriteCategories": ["category1", "category2"],
    "intensity": "light/medium/strong",
    "occasion": ["daily", "special", "romantic", "professional"],
    "personality": "brief personality description"
  },
  "recommendations": {
    "topCategories": ["recommended fragrance families"],
    "avoidCategories": ["categories to avoid"],
    "bestTimes": ["morning", "evening", "special occasions"],
    "seasonality": ["spring", "summer", "fall", "winter"]
  },
  "explanation": "detailed explanation of the analysis"
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error analyzing preferences:", error);
    throw new Error("Failed to analyze preferences");
  }
}

export async function getChatResponse(
  message: string,
  context?: any
): Promise<ChatResponse> {
  try {
    const prompt = `
You are WeatherScent AI, an expert perfume consultant. Respond to the user's question about perfumes, fragrances, or scent-related topics.

User Message: "${message}"

Context: ${context ? JSON.stringify(context, null, 2) : "No additional context"}

If the user is asking for specific recommendations, provide them in a structured format. 
Always be helpful, knowledgeable, and maintain a luxurious, sophisticated tone that matches a premium perfume brand.

Respond in JSON format:
{
  "message": "your response to the user",
  "recommendations": [
    {
      "name": "perfume name",
      "brand": "brand name",
      "category": "category",
      "notes": ["note1", "note2"],
      "reason": "why this fits their request"
    }
  ]
}

Only include recommendations if the user is specifically asking for perfume suggestions.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error getting chat response:", error);
    throw new Error("Failed to get AI response");
  }
}
