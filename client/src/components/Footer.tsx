export default function Footer() {
  return (
    <footer className="bg-primary text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-accent to-white/20 rounded-full flex items-center justify-center">
                <i className="fas fa-spray-can text-white text-sm"></i>
              </div>
              <h1 className="font-display text-xl font-semibold">WeatherScent</h1>
            </div>
            <p className="text-white/80 text-sm">
              날씨가 선택하는 당신만의 향, AI 기반 맞춤형 향수 추천 서비스
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">서비스</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <button className="hover:text-white transition-colors text-left">
                  향수 추천
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors text-left">
                  취향 분석
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors text-left">
                  AI 컨설턴트
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors text-left">
                  매장 찾기
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">고객지원</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <button className="hover:text-white transition-colors text-left">
                  자주 묻는 질문
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors text-left">
                  이용약관
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors text-left">
                  개인정보처리방침
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors text-left">
                  문의하기
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">소셜 미디어</h4>
            <div className="flex space-x-4">
              <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all">
                <i className="fab fa-instagram"></i>
              </button>
              <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all">
                <i className="fab fa-twitter"></i>
              </button>
              <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all">
                <i className="fab fa-youtube"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-sm text-white/60">© 2024 WeatherScent. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
