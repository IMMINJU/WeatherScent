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

interface PerfumeRecommendationInput {
  weather: any;
  preferences: {
    gender?: string;
    ageRange?: string;
    mood?: string;
    purpose?: string;
    preferredScents?: string[];
  };
  availablePerfumes: any[];
}

export async function generatePerfumeRecommendation(input: PerfumeRecommendationInput) {
  if (!process.env.OPENAI_API_KEY) {
    // Return mock data when API key is not available
    return {
      moodText: `${input.weather?.temperature || 20}°C ${input.weather?.description || '좋은'} 날씨에 ${input.preferences.mood} 기분으로 보내는 하루를 위한 향수를 추천합니다.`,
      summary: `${input.preferences.mood} 기분에 ${input.preferences.purpose} 목적으로 추천한 향수입니다.`,
      recommendedPerfumes: input.availablePerfumes.slice(0, 3).map(perfume => ({
        name: perfume.name,
        brand: perfume.brand,
        reason: `${input.preferences.mood} 기분에 잘 어울리는 ${perfume.category} 계열의 향수입니다.`
      }))
    };
  }

  const weatherContext = input.weather 
    ? `현재 날씨: ${input.weather.temperature}°C, ${input.weather.description}, 위치: ${input.weather.location}`
    : "날씨 정보 없음";

  const preferencesText = [
    input.preferences.gender && `성별: ${input.preferences.gender}`,
    input.preferences.ageRange && `연령대: ${input.preferences.ageRange}`,
    input.preferences.mood && `기분: ${input.preferences.mood}`,
    input.preferences.purpose && `사용 목적: ${input.preferences.purpose}`,
    input.preferences.preferredScents?.length && `선호 향: ${input.preferences.preferredScents.join(', ')}`
  ].filter(Boolean).join('\n');

  const availablePerfumesText = input.availablePerfumes.map(p => 
    `${p.name} by ${p.brand} - ${p.category} (노트: ${p.notes.join(', ')})`
  ).join('\n');

  const prompt = `당신은 전문 향수 큐레이터입니다. 다음 정보를 바탕으로 향수를 추천해주세요:

${weatherContext}

사용자 정보:
${preferencesText}

사용 가능한 향수 목록:
${availablePerfumesText}

다음 JSON 형식으로 응답해주세요:
{
  "moodText": "날씨와 기분에 맞는 감성적인 한 줄 문구",
  "summary": "추천 요약",
  "recommendedPerfumes": [
    {
      "name": "향수명",
      "brand": "브랜드명", 
      "reason": "이 향수를 추천하는 구체적인 이유 (날씨, 기분, 목적과 연관지어)"
    }
  ]
}

최대 3개의 향수를 추천하고, 각 추천 이유는 구체적이고 감성적으로 작성해주세요.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "당신은 전문적인 향수 큐레이터로서, 사용자의 기분과 날씨에 맞는 향수를 감성적으로 추천합니다. 항상 JSON 형식으로 응답해야 합니다."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result;
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback response
    return {
      moodText: `${input.weather?.temperature || 20}°C ${input.weather?.description || '좋은'} 날씨에 ${input.preferences.mood} 기분으로 보내는 하루를 위한 향수를 추천합니다.`,
      summary: `${input.preferences.mood} 기분에 ${input.preferences.purpose} 목적으로 추천한 향수입니다.`,
      recommendedPerfumes: input.availablePerfumes.slice(0, 3).map(perfume => ({
        name: perfume.name,
        brand: perfume.brand,
        reason: `${input.preferences.mood} 기분에 잘 어울리는 ${perfume.category} 계열의 향수입니다.`
      }))
    };
  }
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
