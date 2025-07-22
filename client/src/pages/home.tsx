import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PreferenceTest from "@/components/PreferenceTest";
import Recommendations from "@/components/Recommendations";
import Wishlist from "@/components/Wishlist";
import Chatbot from "@/components/Chatbot";
import Footer from "@/components/Footer";
import { WeatherData, UserPreferences, PerfumeRecommendation } from "@/types";

export default function Home() {
  const [currentUser] = useState(1); // Mock user ID for demo
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [recommendations, setRecommendations] = useState<PerfumeRecommendation[]>([]);
  const [showPreferenceTest, setShowPreferenceTest] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  const handleLocationReceived = (weather: WeatherData) => {
    setWeatherData(weather);
  };

  const handlePreferencesCompleted = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
    setShowPreferenceTest(false);
  };

  const handleRecommendationsReceived = (recs: PerfumeRecommendation[]) => {
    setRecommendations(recs);
  };

  return (
    <div className="min-h-screen bg-warm-50">
      <Header 
        currentUser={currentUser}
        onStartPreferenceTest={() => setShowPreferenceTest(true)}
        onToggleChat={() => setShowChatbot(!showChatbot)}
      />
      
      <Hero 
        onLocationReceived={handleLocationReceived}
        weatherData={weatherData}
      />

      {showPreferenceTest && (
        <PreferenceTest 
          currentUser={currentUser}
          onComplete={handlePreferencesCompleted}
          onClose={() => setShowPreferenceTest(false)}
        />
      )}

      <Recommendations 
        currentUser={currentUser}
        weatherData={weatherData}
        userPreferences={userPreferences}
        onRecommendationsReceived={handleRecommendationsReceived}
      />

      <Wishlist currentUser={currentUser} />

      {showChatbot && (
        <Chatbot 
          currentUser={currentUser}
          onClose={() => setShowChatbot(false)}
          weatherData={weatherData}
          userPreferences={userPreferences}
        />
      )}

      <Footer />

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => setShowChatbot(!showChatbot)}
          className="w-14 h-14 bg-gradient-to-r from-primary to-accent text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all transform hover:scale-110"
        >
          <i className="fas fa-comment-dots text-lg"></i>
        </button>
      </div>
    </div>
  );
}
