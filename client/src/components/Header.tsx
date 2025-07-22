import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface HeaderProps {
  currentUser: number;
  onStartPreferenceTest: () => void;
  onToggleChat: () => void;
}

export default function Header({ currentUser, onStartPreferenceTest, onToggleChat }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data: wishlist = [] } = useQuery({
    queryKey: ["/api/wishlist", currentUser],
    enabled: !!currentUser,
  });

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-warm-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <i className="fas fa-spray-can text-white text-sm"></i>
            </div>
            <h1 className="font-display text-xl font-semibold text-primary">WeatherScent</h1>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <button 
              onClick={() => scrollToSection('home')}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              홈
            </button>
            <button 
              onClick={() => scrollToSection('recommendations')}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              추천받기
            </button>
            <button 
              onClick={onStartPreferenceTest}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              취향분석
            </button>
            <button 
              onClick={() => scrollToSection('wishlist')}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              찜목록
            </button>
            <button 
              onClick={onToggleChat}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              챗봇
            </button>
          </nav>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => scrollToSection('wishlist')}
              className="relative"
            >
              <i className="fas fa-heart text-gray-600 hover:text-primary text-lg transition-colors"></i>
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              <i className="fas fa-bars text-gray-600"></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-warm-200 py-4">
            <nav className="flex flex-col space-y-2">
              <button 
                onClick={() => scrollToSection('home')}
                className="text-left text-gray-600 hover:text-primary transition-colors py-2"
              >
                홈
              </button>
              <button 
                onClick={() => scrollToSection('recommendations')}
                className="text-left text-gray-600 hover:text-primary transition-colors py-2"
              >
                추천받기
              </button>
              <button 
                onClick={onStartPreferenceTest}
                className="text-left text-gray-600 hover:text-primary transition-colors py-2"
              >
                취향분석
              </button>
              <button 
                onClick={() => scrollToSection('wishlist')}
                className="text-left text-gray-600 hover:text-primary transition-colors py-2"
              >
                찜목록
              </button>
              <button 
                onClick={onToggleChat}
                className="text-left text-gray-600 hover:text-primary transition-colors py-2"
              >
                챗봇
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
