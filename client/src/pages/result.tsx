import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Thermometer, Share2, RefreshCw, MessageCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface RecommendationResult {
  id: string;
  mood: string;
  weather: {
    temperature: number;
    condition: string;
    description: string;
    location: string;
  };
  perfumes: Array<{
    id: number;
    name: string;
    brand: string;
    category: string;
    notes: string[];
    description: string;
    image: string;
    rating: number;
    reason: string;
  }>;
  moodText: string;
  summary: string;
}

export default function Result() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlist, setWishlist] = useState<number[]>([]);

  const uuid = params.uuid;

  useEffect(() => {
    if (uuid) {
      loadRecommendationResult();
      loadWishlist();
    }
  }, [uuid]);

  const loadRecommendationResult = () => {
    try {
      const stored = sessionStorage.getItem(`recommendation_${uuid}`);
      if (stored) {
        setResult(JSON.parse(stored));
      } else {
        // 공유된 링크의 경우 서버에서 가져오기 시도
        fetchSharedResult();
      }
    } catch (error) {
      toast({
        title: "추천 결과를 불러올 수 없습니다",
        variant: "destructive"
      });
      setLocation("/");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSharedResult = async () => {
    try {
      const data = await apiRequest(`/api/recommendations/shared/${uuid}`);
      setResult(data);
    } catch (error) {
      toast({
        title: "공유된 추천을 찾을 수 없습니다",
        variant: "destructive"
      });
      setLocation("/");
    }
  };

  const loadWishlist = async () => {
    try {
      const data = await apiRequest("/api/wishlist/1"); // 임시 사용자 ID
      setWishlist(data.map((item: any) => item.perfume?.id).filter(Boolean));
    } catch (error) {
      // 위시리스트 로드 실패는 무시
    }
  };

  const toggleWishlist = async (perfumeId: number) => {
    try {
      const isInWishlist = wishlist.includes(perfumeId);
      
      if (isInWishlist) {
        await apiRequest(`/api/wishlist/${perfumeId}`, { method: "DELETE" });
        setWishlist(prev => prev.filter(id => id !== perfumeId));
        toast({ title: "찜 목록에서 제거되었습니다" });
      } else {
        await apiRequest("/api/wishlist", {
          method: "POST",
          body: JSON.stringify({ perfumeId }),
          headers: { "Content-Type": "application/json" }
        });
        setWishlist(prev => [...prev, perfumeId]);
        toast({ title: "찜 목록에 추가되었습니다" });
      }
    } catch (error) {
      toast({
        title: "오류가 발생했습니다",
        variant: "destructive"
      });
    }
  };

  const shareResult = async () => {
    const url = `${window.location.origin}/result/${uuid}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "링크가 복사되었습니다!" });
    } catch (error) {
      toast({
        title: "링크 복사에 실패했습니다",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">추천 결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">추천 결과를 찾을 수 없습니다</p>
          <Link href="/recommend">
            <Button>다시 추천받기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
            당신을 위한 향수 추천
          </h1>
        </div>

        {/* Weather Summary */}
        {result.weather && (
          <Card className="mb-8 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Thermometer className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{result.weather.location}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-lg">{result.weather.temperature}°C</span>
                    <span className="text-gray-700">{result.weather.description}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-amber-50 to-rose-50 p-4 rounded-lg">
                <p className="text-lg font-medium text-gray-800 text-center">
                  {result.moodText}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Perfume Recommendations */}
        <div className="grid gap-6 mb-8">
          {result.perfumes.map((perfume) => (
            <Card key={perfume.id} className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <div className="w-32 h-40 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={perfume.image} 
                      alt={perfume.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{perfume.name}</h3>
                        <p className="text-gray-600 font-medium">{perfume.brand}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleWishlist(perfume.id)}
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Heart 
                          className={`w-5 h-5 ${wishlist.includes(perfume.id) ? 'fill-current' : ''}`} 
                        />
                      </Button>
                    </div>

                    <div className="mb-3">
                      <Badge variant="secondary" className="mb-2">{perfume.category}</Badge>
                      <div className="flex flex-wrap gap-1">
                        {perfume.notes.map((note, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {note}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {perfume.description}
                    </p>

                    <div className="bg-gradient-to-r from-amber-50 to-rose-50 p-4 rounded-lg mb-4">
                      <p className="text-sm font-medium text-gray-800">
                        <strong>AI 추천 이유:</strong> {perfume.reason}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Link href={`/perfume/${perfume.id}`}>
                        <Button variant="outline" size="sm">
                          자세히 보기
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        매장 찾기
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={shareResult}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            결과 공유하기
          </Button>
          
          <Link href="/recommend">
            <Button variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              다시 추천받기
            </Button>
          </Link>

          <Link href="/chat">
            <Button 
              className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              챗봇에게 더 물어보기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}