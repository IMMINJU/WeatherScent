import { storage } from "../storage";
import { generatePerfumeRecommendation } from "./openai";

interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  location: string;
}

interface RecommendationInput {
  gender: string;
  ageRange: string;
  mood: string;
  purpose: string;
  preferredScents: string[];
  weather: WeatherData | null;
}

export async function generateRecommendations(input: RecommendationInput) {
  const allPerfumes = await storage.getAllPerfumes();
  
  try {
    // Use OpenAI for intelligent recommendations
    const aiResult = await generatePerfumeRecommendation({
      weather: input.weather,
      preferences: {
        gender: input.gender,
        ageRange: input.ageRange,
        mood: input.mood,
        purpose: input.purpose,
        preferredScents: input.preferredScents
      },
      availablePerfumes: allPerfumes
    });

    // Find matching perfumes from our database
    const recommendedPerfumes = allPerfumes
      .filter(perfume => 
        aiResult.recommendedPerfumes.some(rec => 
          perfume.name.toLowerCase().includes(rec.name.toLowerCase()) ||
          rec.name.toLowerCase().includes(perfume.name.toLowerCase()) ||
          perfume.brand.toLowerCase() === rec.brand.toLowerCase()
        )
      )
      .slice(0, 3);

    // If no matches found, use top rated perfumes
    let finalPerfumes = recommendedPerfumes;
    if (finalPerfumes.length === 0) {
      // Filter by preferred scents if provided
      if (input.preferredScents.length > 0) {
        finalPerfumes = allPerfumes.filter(perfume =>
          input.preferredScents.some(scent => 
            perfume.category.toLowerCase().includes(scent.toLowerCase()) ||
            perfume.notes.some((note: any) => 
              typeof note === 'string' && note.toLowerCase().includes(scent.toLowerCase())
            )
          )
        ).slice(0, 3);
      }
      
      if (finalPerfumes.length === 0) {
        finalPerfumes = allPerfumes
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 3);
      }
    }

    // Enhance perfumes with AI reasons
    const enhancedPerfumes = finalPerfumes.map((perfume, index) => {
      const aiPerfume = aiResult.recommendedPerfumes[index] || aiResult.recommendedPerfumes[0];
      return {
        ...perfume,
        reason: aiPerfume?.reason || generateReason(perfume, input)
      };
    });

    return {
      id: crypto.randomUUID(),
      mood: input.mood,
      weather: input.weather,
      perfumes: enhancedPerfumes,
      moodText: aiResult.moodText,
      summary: aiResult.summary
    };
    
  } catch (error) {
    console.error('AI recommendation error, falling back to simple logic:', error);
    
    // Fallback to simple recommendation logic
    let filteredPerfumes = allPerfumes;

    // Filter by preferred scents if provided
    if (input.preferredScents.length > 0) {
      filteredPerfumes = allPerfumes.filter(perfume =>
        input.preferredScents.some(scent => 
          perfume.category.toLowerCase().includes(scent.toLowerCase()) ||
          perfume.notes.some((note: any) => 
            typeof note === 'string' && note.toLowerCase().includes(scent.toLowerCase())
          )
        )
      );
    }

    // If no matches, use all perfumes
    if (filteredPerfumes.length === 0) {
      filteredPerfumes = allPerfumes;
    }

    // Get top rated perfumes
    const recommendedPerfumes = filteredPerfumes
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);

    // Generate mood text based on weather and preferences
    const moodText = generateMoodText(input);

    // Enhance perfumes with reasons
    const enhancedPerfumes = recommendedPerfumes.map(perfume => ({
      ...perfume,
      reason: generateReason(perfume, input)
    }));

    return {
      id: crypto.randomUUID(),
      mood: input.mood,
      weather: input.weather,
      perfumes: enhancedPerfumes,
      moodText,
      summary: `${input.mood} 기분에 ${input.purpose} 목적으로 추천한 향수입니다.`
    };
  }
}

function generateMoodText(input: RecommendationInput): string {
  const weather = input.weather;
  if (weather) {
    return `${weather.temperature}°C ${weather.description} 날씨에 ${input.mood} 기분으로 보내는 하루를 위한 향수를 추천합니다.`;
  }
  return `${input.mood} 기분과 ${input.purpose} 목적에 어울리는 향수를 추천합니다.`;
}

function generateReason(perfume: any, input: RecommendationInput): string {
  const reasons = [
    `${input.mood} 기분에 잘 어울리는 ${perfume.category} 계열의 향수입니다.`,
    `${input.purpose} 용도로 사용하기에 적합한 브랜드 ${perfume.brand}의 인기 제품입니다.`,
    `${perfume.notes.slice(0, 2).join(', ')} 노트가 ${input.mood} 분위기를 연출해줍니다.`
  ];
  
  return reasons[Math.floor(Math.random() * reasons.length)];
}