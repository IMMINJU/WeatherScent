import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, Eye, ArrowLeft, MapPin, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PerfumeDetail {
  id: number;
  name: string;
  brand: string;
  category: string;
  notes: string[];
  description: string;
  image: string;
  rating: number;
  views: number;
  topNotes?: string[];
  middleNotes?: string[];
  baseNotes?: string[];
  fullDescription?: string;
}

export default function Perfume() {
  const params = useParams();
  const { toast } = useToast();
  const [perfume, setPerfume] = useState<PerfumeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [similarPerfumes, setSimilarPerfumes] = useState<PerfumeDetail[]>([]);

  const perfumeId = params.id;

  useEffect(() => {
    if (perfumeId) {
      loadPerfumeDetail();
      checkWishlistStatus();
      loadSimilarPerfumes();
    }
  }, [perfumeId]);

  const loadPerfumeDetail = async () => {
    try {
      const data = await apiRequest(`/api/perfumes/${perfumeId}`);
      setPerfume(data);
      
      // 조회수 증가
      await apiRequest(`/api/perfumes/${perfumeId}/view`, { method: "POST" });
    } catch (error) {
      toast({
        title: "향수 정보를 불러올 수 없습니다",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const wishlist = await apiRequest("/api/wishlist/1"); // 임시 사용자 ID
      setIsInWishlist(wishlist.some((item: any) => item.perfume?.id === parseInt(perfumeId)));
    } catch (error) {
      // 위시리스트 상태 확인 실패는 무시
    }
  };

  const loadSimilarPerfumes = async () => {
    try {
      const data = await apiRequest(`/api/perfumes/${perfumeId}/similar`);
      setSimilarPerfumes(data.slice(0, 3)); // 최대 3개만 표시
    } catch (error) {
      // 유사 향수 로드 실패는 무시
    }
  };

  const toggleWishlist = async () => {
    try {
      if (isInWishlist) {
        await apiRequest(`/api/wishlist/${perfumeId}`, { method: "DELETE" });
        setIsInWishlist(false);
        toast({ title: "찜 목록에서 제거되었습니다" });
      } else {
        await apiRequest("/api/wishlist", {
          method: "POST",
          body: JSON.stringify({ perfumeId: parseInt(perfumeId) }),
          headers: { "Content-Type": "application/json" }
        });
        setIsInWishlist(true);
        toast({ title: "찜 목록에 추가되었습니다" });
      }
    } catch (error) {
      toast({
        title: "오류가 발생했습니다",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">향수 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!perfume) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">향수를 찾을 수 없습니다</p>
          <Link href="/">
            <Button>홈으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <div className="flex justify-center lg:justify-start">
            <div className="w-80 h-96 bg-gray-200 rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={perfume.image} 
                alt={perfume.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
                    {perfume.name}
                  </h1>
                  <p className="text-xl text-gray-600 font-medium">{perfume.brand}</p>
                </div>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={toggleWishlist}
                  className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                >
                  <Heart 
                    className={`w-7 h-7 ${isInWishlist ? 'fill-current' : ''}`} 
                  />
                </Button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {perfume.category}
                </Badge>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-medium">{(perfume.rating / 10).toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">{perfume.views?.toLocaleString()} 조회</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">향 노트</h3>
              <div className="space-y-3">
                {perfume.topNotes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">탑 노트</p>
                    <div className="flex flex-wrap gap-1">
                      {perfume.topNotes.map((note, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {note}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {perfume.middleNotes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">미들 노트</p>
                    <div className="flex flex-wrap gap-1">
                      {perfume.middleNotes.map((note, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {note}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {perfume.baseNotes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">베이스 노트</p>
                    <div className="flex flex-wrap gap-1">
                      {perfume.baseNotes.map((note, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {note}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fallback to simple notes if detailed notes not available */}
                {!perfume.topNotes && !perfume.middleNotes && !perfume.baseNotes && (
                  <div className="flex flex-wrap gap-1">
                    {perfume.notes.map((note, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {note}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">향수 설명</h3>
              <p className="text-gray-700 leading-relaxed">
                {perfume.fullDescription || perfume.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                가까운 매장 찾기
              </Button>
              <Button variant="outline" size="lg" className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                온라인 구매
              </Button>
            </div>
          </div>
        </div>

        {/* Similar Perfumes */}
        {similarPerfumes.length > 0 && (
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
              비슷한 향수
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {similarPerfumes.map((similar) => (
                <Card key={similar.id} className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4">
                      <img 
                        src={similar.image} 
                        alt={similar.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{similar.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{similar.brand}</p>
                    <Badge variant="outline" className="text-xs mb-3">
                      {similar.category}
                    </Badge>
                    <Link href={`/perfume/${similar.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        자세히 보기
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}