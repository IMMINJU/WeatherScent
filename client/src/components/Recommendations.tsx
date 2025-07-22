import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { WeatherData, UserPreferences, PerfumeRecommendation } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface RecommendationsProps {
  currentUser: number;
  weatherData: WeatherData | null;
  userPreferences: UserPreferences | null;
  onRecommendationsReceived: (recommendations: PerfumeRecommendation[]) => void;
}

export default function Recommendations({ 
  currentUser, 
  weatherData, 
  userPreferences, 
  onRecommendationsReceived 
}: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<PerfumeRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wishlist = [] } = useQuery({
    queryKey: ["/api/wishlist", currentUser],
    enabled: !!currentUser,
  });

  const recommendationsMutation = useMutation({
    mutationFn: async ({ weatherData, userPreferences }: { 
      weatherData: WeatherData; 
      userPreferences?: UserPreferences 
    }) => {
      const response = await apiRequest("POST", "/api/recommendations/weather", {
        weatherData,
        userPreferences,
        userId: currentUser
      });
      return response.json();
    },
    onSuccess: (data) => {
      setRecommendations(data.recommendations || []);
      onRecommendationsReceived(data.recommendations || []);
      setIsLoading(false);
      toast({
        title: "추천 완료!",
        description: "AI가 당신을 위한 완벽한 향수를 찾았습니다.",
      });
    },
    onError: (error) => {
      setIsLoading(false);
      toast({
        title: "추천 실패",
        description: "향수 추천 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const wishlistMutation = useMutation({
    mutationFn: async ({ perfumeId, action }: { perfumeId: number; action: "add" | "remove" }) => {
      if (action === "add") {
        const response = await apiRequest("POST", "/api/wishlist", {
          userId: currentUser,
          perfumeId
        });
        return response.json();
      } else {
        const response = await apiRequest("DELETE", `/api/wishlist/${currentUser}/${perfumeId}`);
        return response.json();
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist", currentUser] });
      const action = variables.action === "add" ? "추가" : "제거";
      toast({
        title: `찜목록 ${action} 완료`,
        description: `찜목록에서 향수를 ${action}했습니다.`,
      });
    },
    onError: (error) => {
      toast({
        title: "오류 발생",
        description: "찜목록 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (weatherData && !isLoading && recommendations.length === 0) {
      setIsLoading(true);
      recommendationsMutation.mutate({ weatherData, userPreferences: userPreferences || undefined });
    }
  }, [weatherData, userPreferences]);

  const isInWishlist = (perfumeName: string, perfumeBrand: string) => {
    return wishlist.some((item: any) => 
      item.perfume?.name === perfumeName && item.perfume?.brand === perfumeBrand
    );
  };

  const handleWishlistToggle = (recommendation: PerfumeRecommendation) => {
    // For AI recommendations, we need to find or create the perfume first
    // This is a simplified approach - in a real app, you'd want to create the perfume record first
    const isWishlisted = isInWishlist(recommendation.name, recommendation.brand);
    
    if (isWishlisted) {
      const wishlistItem = wishlist.find((item: any) => 
        item.perfume?.name === recommendation.name && item.perfume?.brand === recommendation.brand
      );
      if (wishlistItem?.perfume?.id) {
        wishlistMutation.mutate({ perfumeId: wishlistItem.perfume.id, action: "remove" });
      }
    } else {
      // For demo purposes, we'll use a mock perfume ID
      // In a real app, you'd create the perfume record first
      toast({
        title: "향수 정보 필요",
        description: "해당 향수의 상세 정보를 먼저 확인해주세요.",
      });
    }
  };

  const handleLoadMore = () => {
    if (weatherData) {
      setIsLoading(true);
      recommendationsMutation.mutate({ weatherData, userPreferences: userPreferences || undefined });
    }
  };

  return (
    <section id="recommendations" className="py-20 bg-gradient-to-b from-warm-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
            오늘의 추천 향수
          </h3>
          {weatherData && (
            <div>
              <div className="flex items-center justify-center space-x-4 text-gray-600 mb-4">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-cloud-sun text-accent"></i>
                  <span>{weatherData.condition}</span>
                </div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-thermometer-half text-primary"></i>
                  <span>{weatherData.temperature}°C</span>
                </div>
              </div>
              {weatherData.moodText && (
                <p className="text-lg text-gray-600 italic">
                  "{weatherData.moodText}"
                </p>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-2">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
              <span className="text-gray-600">AI가 당신을 위한 향수를 찾고 있어요...</span>
            </div>
          </div>
        )}

        {/* Recommendation Cards */}
        {recommendations.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendations.map((recommendation, index) => (
              <div 
                key={index}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="relative">
                  <img 
                    src={recommendation.image || "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500"} 
                    alt={`${recommendation.brand} ${recommendation.name}`}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <button 
                      onClick={() => handleWishlistToggle(recommendation)}
                      className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-all"
                    >
                      <i className={`${
                        isInWishlist(recommendation.name, recommendation.brand)
                          ? "fas fa-heart text-red-500" 
                          : "far fa-heart text-gray-400"
                      } hover:text-red-500 transition-colors`}></i>
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <div className="bg-gradient-to-r from-primary to-accent text-white text-xs px-3 py-1 rounded-full">
                      <i className="fas fa-star mr-1"></i>
                      <span>{(recommendation.confidence * 5).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500 uppercase tracking-wide">
                      {recommendation.brand}
                    </span>
                    <span className="text-sm text-accent font-medium">
                      {recommendation.category}
                    </span>
                  </div>
                  
                  <h4 className="font-display text-xl font-semibold text-primary mb-3">
                    {recommendation.name}
                  </h4>
                  
                  {/* Notes */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {recommendation.notes.map((note, noteIndex) => (
                        <span 
                          key={noteIndex}
                          className="text-xs warm-100 text-gray-700 px-2 py-1 rounded-full"
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {recommendation.reason}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <i className="fas fa-sparkles mr-1 text-accent"></i>
                      AI 추천
                    </div>
                    <button className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all">
                      자세히 보기
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Weather Data State */}
        {!weatherData && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <i className="fas fa-map-marker-alt text-4xl mb-4"></i>
              <p className="text-lg">위치 정보가 필요합니다</p>
              <p className="text-sm">위 버튼을 클릭하여 현재 위치를 확인해주세요</p>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {recommendations.length > 0 && (
          <div className="text-center mt-12">
            <button 
              onClick={handleLoadMore}
              disabled={isLoading}
              className="bg-white text-primary border-2 border-primary px-8 py-3 rounded-2xl font-semibold hover:bg-primary hover:text-white transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? "로딩 중..." : "더 많은 추천 보기"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
