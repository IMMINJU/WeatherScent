import { WeatherData } from "@shared/schema";

export async function getWeatherData(lat: number, lon: number): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY || "default_key";
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind?.speed || 0,
      location: data.name || "Unknown Location"
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    // Return mock data for development/demo purposes
    return {
      temperature: 18,
      condition: "partly cloudy",
      humidity: 65,
      windSpeed: 5.2,
      location: "Seoul"
    };
  }
}

export function getWeatherMood(weatherData: WeatherData): string {
  const { temperature, condition } = weatherData;
  
  if (condition.includes("rain") || condition.includes("storm")) {
    return "비가 내리는 오늘, 따뜻하고 포근한 향으로 마음을 달래보세요";
  } else if (condition.includes("cloud")) {
    return "구름이 낀 오늘, 은은하고 깊은 향으로 신비로운 분위기를 연출해보세요";
  } else if (condition.includes("clear") || condition.includes("sun")) {
    if (temperature > 25) {
      return "맑고 따뜻한 날, 상쾌한 시트러스 향으로 활기찬 하루를 시작하세요";
    } else if (temperature > 15) {
      return "따스한 봄바람이 불어오는 오늘, 가벼운 플로럴 향으로 우아함을 더해보세요";
    } else {
      return "맑지만 쌀쌀한 오늘, 따뜻한 우디 계열로 포근한 느낌을 만들어보세요";
    }
  } else if (condition.includes("snow")) {
    return "눈이 내리는 겨울, 깊고 관능적인 향으로 특별한 날을 만들어보세요";
  }
  
  return "오늘 같은 날씨에는 당신만의 특별한 향으로 하루를 시작해보세요";
}
