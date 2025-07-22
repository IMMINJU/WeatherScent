import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { WeatherData } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface HeroProps {
  onLocationReceived: (weather: WeatherData) => void;
  weatherData: WeatherData | null;
}

export default function Hero({ onLocationReceived, weatherData }: HeroProps) {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const { toast } = useToast();

  const weatherMutation = useMutation({
    mutationFn: async ({ lat, lon }: { lat: number; lon: number }) => {
      const response = await apiRequest("POST", "/api/weather", { lat, lon });
      return response.json();
    },
    onSuccess: (data: WeatherData) => {
      onLocationReceived(data);
      setIsLoadingLocation(false);
      toast({
        title: "위치 확인 완료",
        description: `${data.location}의 현재 날씨 정보를 받아왔습니다.`,
      });
    },
    onError: (error) => {
      setIsLoadingLocation(false);
      toast({
        title: "위치 확인 실패",
        description: "위치 정보를 가져올 수 없습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "위치 서비스 불가",
        description: "브라우저에서 위치 서비스를 지원하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        weatherMutation.mutate({ lat: latitude, lon: longitude });
      },
      (error) => {
        setIsLoadingLocation(false);
        toast({
          title: "위치 권한 필요",
          description: "정확한 날씨 기반 추천을 위해 위치 권한을 허용해주세요.",
          variant: "destructive",
        });
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
      }
    );
  };

  const scrollToRecommendations = () => {
    const element = document.getElementById('recommendations');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080" 
          alt="Elegant perfume bottles on marble surface" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="relative z-20 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl">
          <h2 className="font-display text-4xl md:text-6xl font-bold text-primary mb-6">
            날씨가 선택하는<br/>
            <span className="text-accent">당신만의 향</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            AI가 오늘의 날씨와 당신의 취향을 분석해<br/>
            완벽한 향수를 추천해드립니다
          </p>
          
          {/* Weather Status */}
          {weatherData && (
            <div className="flex items-center justify-center space-x-4 mb-8 p-4 warm-100 rounded-2xl">
              <div className="flex items-center space-x-2">
                <i className="fas fa-map-marker-alt text-primary"></i>
                <span className="text-sm text-gray-600">{weatherData.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-cloud-sun text-accent"></i>
                <span className="text-sm text-gray-600">
                  {weatherData.condition}, {weatherData.temperature}°C
                </span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {!weatherData ? (
              <button 
                onClick={handleGetLocation}
                disabled={isLoadingLocation}
                className="w-full md:w-auto bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoadingLocation ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    위치 확인 중...
                  </>
                ) : (
                  <>
                    <i className="fas fa-location-dot mr-2"></i>
                    위치 기반 추천받기
                  </>
                )}
              </button>
            ) : (
              <button 
                onClick={scrollToRecommendations}
                className="w-full md:w-auto bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
              >
                <i className="fas fa-sparkles mr-2"></i>
                AI 추천 보기
              </button>
            )}
            <p className="text-sm text-gray-500">
              {!weatherData 
                ? "위치 권한을 허용하여 정확한 날씨 기반 추천을 받으세요"
                : "현재 날씨에 완벽한 향수를 확인해보세요"
              }
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
