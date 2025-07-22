import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Sparkles, Heart, MapPin } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/10"></div>
        
        <div className="relative text-center max-w-4xl mx-auto">
          <div className="mb-8 flex justify-center">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
              <Sparkles className="w-12 h-12 text-amber-600" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold text-gray-900 mb-6 leading-tight">
            오늘의 날씨에 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-rose-600">
              완벽한 향수
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-12 leading-relaxed font-light">
            AI가 당신의 기분과 날씨를 분석해 <br />
            가장 어울리는 향수를 추천합니다
          </p>
          
          <Link href="/recommend">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white px-12 py-6 text-xl font-semibold rounded-full shadow-2xl hover:shadow-3xl transform transition-all duration-300 hover:scale-105"
            >
              지금 향수 추천받기
              <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-gray-900 mb-16">
            WeatherScent가 특별한 이유
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">실시간 날씨 분석</h3>
              <p className="text-gray-600">
                당신의 위치와 오늘의 날씨를 분석해 가장 어울리는 향수를 찾아드립니다
              </p>
            </Card>

            <Card className="p-8 text-center bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI 개인화 추천</h3>
              <p className="text-gray-600">
                최신 AI 기술로 당신만의 취향과 기분에 맞는 향수를 정확하게 추천합니다
              </p>
            </Card>

            <Card className="p-8 text-center bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
              <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">큐레이션 & 저장</h3>
              <p className="text-gray-600">
                마음에 드는 향수를 저장하고 친구들과 공유해보세요
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 px-4 bg-gradient-to-r from-amber-500/10 to-rose-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-8">
            지금 바로 시작해보세요
          </h2>
          <p className="text-xl text-gray-700 mb-12">
            몇 가지 간단한 질문으로 당신만의 향수를 찾아드려요
          </p>
          
          <Link href="/recommend">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white px-12 py-6 text-xl font-semibold rounded-full shadow-2xl hover:shadow-3xl transform transition-all duration-300 hover:scale-105"
            >
              향수 추천받기
              <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}