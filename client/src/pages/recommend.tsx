import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Thermometer, Cloud, Sparkles, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  location: string;
}

export default function Recommend() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [isGeneratingRecommendation, setIsGeneratingRecommendation] = useState(false);
  
  const [formData, setFormData] = useState({
    gender: "",
    ageRange: "",
    mood: "",
    purpose: "",
    preferredScents: [] as string[]
  });

  useEffect(() => {
    requestLocationAndWeather();
  }, []);

  const requestLocationAndWeather = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "위치 서비스를 지원하지 않습니다",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingWeather(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const weatherData = await apiRequest(`/api/weather?lat=${latitude}&lon=${longitude}`);
          setWeather(weatherData);
        } catch (error) {
          toast({
            title: "날씨 정보를 가져올 수 없습니다",
            description: "위치 권한을 확인해주세요",
            variant: "destructive"
          });
        }
        setIsLoadingWeather(false);
      },
      () => {
        toast({
          title: "위치 권한이 필요합니다",
          description: "정확한 향수 추천을 위해 위치 권한을 허용해주세요",
          variant: "destructive"
        });
        setIsLoadingWeather(false);
      }
    );
  };

  const handleScentChange = (scent: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferredScents: checked 
        ? [...prev.preferredScents, scent]
        : prev.preferredScents.filter(s => s !== scent)
    }));
  };

  const generateRecommendation = async () => {
    if (!formData.gender || !formData.ageRange || !formData.mood || !formData.purpose) {
      toast({
        title: "모든 필수 항목을 선택해주세요",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingRecommendation(true);
    
    try {
      const recommendationData = {
        ...formData,
        weather: weather || null
      };

      const result = await apiRequest("/api/recommendations", {
        method: "POST",
        body: JSON.stringify(recommendationData),
        headers: {
          "Content-Type": "application/json"
        }
      });

      // UUID 생성하여 결과 페이지로 이동
      const uuid = crypto.randomUUID();
      sessionStorage.setItem(`recommendation_${uuid}`, JSON.stringify(result));
      setLocation(`/result/${uuid}`);
      
    } catch (error) {
      toast({
        title: "추천 생성 중 오류가 발생했습니다",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive"
      });
    }
    
    setIsGeneratingRecommendation(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
            당신만의 향수 찾기
          </h1>
          <p className="text-lg text-gray-600">
            몇 가지 질문에 답해주시면 AI가 완벽한 향수를 추천해드려요
          </p>
        </div>

        {/* Weather Card */}
        {isLoadingWeather ? (
          <Card className="mb-8 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-gray-600">날씨 정보를 가져오는 중...</p>
            </CardContent>
          </Card>
        ) : weather ? (
          <Card className="mb-8 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Cloud className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{weather.location}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Thermometer className="w-4 h-4 text-orange-500" />
                      <span className="font-semibold">{weather.temperature}°C</span>
                    </div>
                    <span className="text-gray-700">{weather.description}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Button variant="outline" onClick={requestLocationAndWeather}>
                위치 권한 허용하기
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                정확한 추천을 위해 현재 날씨를 확인합니다
              </p>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <div className="space-y-6">
          {/* Gender */}
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">성별 *</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">여성</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">남성</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unisex" id="unisex" />
                  <Label htmlFor="unisex">상관없음</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Age Range */}
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">연령대 *</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.ageRange}
                onValueChange={(value) => setFormData(prev => ({ ...prev, ageRange: value }))}
                className="grid grid-cols-2 gap-4"
              >
                {["10대", "20대", "30대", "40대", "50대 이상"].map((age) => (
                  <div key={age} className="flex items-center space-x-2">
                    <RadioGroupItem value={age} id={age} />
                    <Label htmlFor={age}>{age}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Mood */}
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">오늘의 기분 *</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.mood}
                onValueChange={(value) => setFormData(prev => ({ ...prev, mood: value }))}
                className="space-y-3"
              >
                {[
                  "상쾌하고 활기찬",
                  "로맨틱하고 우아한", 
                  "차분하고 여유로운",
                  "자신감 넘치고 강인한",
                  "신비롭고 매력적인"
                ].map((mood) => (
                  <div key={mood} className="flex items-center space-x-2">
                    <RadioGroupItem value={mood} id={mood} />
                    <Label htmlFor={mood}>{mood}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Purpose */}
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">향수 사용 목적 *</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.purpose}
                onValueChange={(value) => setFormData(prev => ({ ...prev, purpose: value }))}
                className="space-y-3"
              >
                {[
                  "일상 데일리", 
                  "데이트", 
                  "비즈니스/직장",
                  "특별한 행사",
                  "선물용"
                ].map((purpose) => (
                  <div key={purpose} className="flex items-center space-x-2">
                    <RadioGroupItem value={purpose} id={purpose} />
                    <Label htmlFor={purpose}>{purpose}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Preferred Scents */}
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">선호하는 향 계열 (선택)</CardTitle>
              <p className="text-sm text-gray-500">여러 개 선택 가능</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  "플로럴", "프레시", "우디", "오리엔탈", 
                  "시트러스", "스파이시", "머스크", "바닐라"
                ].map((scent) => (
                  <div key={scent} className="flex items-center space-x-2">
                    <Checkbox 
                      id={scent}
                      checked={formData.preferredScents.includes(scent)}
                      onCheckedChange={(checked) => handleScentChange(scent, checked as boolean)}
                    />
                    <Label htmlFor={scent}>{scent}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="text-center pt-6">
            <Button
              size="lg"
              onClick={generateRecommendation}
              disabled={isGeneratingRecommendation}
              className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white px-12 py-6 text-xl font-semibold rounded-full shadow-2xl hover:shadow-3xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingRecommendation ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  AI가 분석 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 mr-3" />
                  AI에게 추천받기
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}