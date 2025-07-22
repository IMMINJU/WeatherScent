export interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  location: string;
}

export async function getWeatherData(lat: number, lon: number): Promise<WeatherData> {
  const API_KEY = process.env.OPENWEATHER_API_KEY;
  
  if (!API_KEY) {
    // Return mock weather data for demo
    return {
      temperature: Math.floor(Math.random() * 20) + 10,
      condition: "Clear",
      description: "맑음",
      location: "서울"
    };
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`
    );
    
    if (!response.ok) {
      throw new Error('Weather API request failed');
    }
    
    const data = await response.json();
    
    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      location: data.name || "현재 위치"
    };
  } catch (error) {
    console.error('Weather API error:', error);
    
    // Return mock weather data as fallback
    return {
      temperature: Math.floor(Math.random() * 20) + 10,
      condition: "Clear",
      description: "맑음",
      location: "현재 위치"
    };
  }
}