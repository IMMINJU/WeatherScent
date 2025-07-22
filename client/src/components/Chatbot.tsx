import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { WeatherData, UserPreferences, ChatMessage } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface ChatbotProps {
  currentUser: number;
  onClose: () => void;
  weatherData?: WeatherData | null;
  userPreferences?: UserPreferences | null;
}

const QUICK_SUGGESTIONS = [
  "데이트용 향수 추천해줘",
  "겨울에 어울리는 향수는?",
  "프레시한 향수 추천",
  "업무용으로 좋은 향수는?",
  "특별한 날에 어울리는 향수"
];

export default function Chatbot({ currentUser, onClose, weatherData, userPreferences }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      message: "안녕하세요! WeatherScent AI입니다. 오늘은 어떤 향수를 찾고 계신가요? 날씨나 기분, 상황을 알려주시면 맞춤 추천을 해드릴게요.",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const context = {
        weatherData,
        userPreferences,
        userId: currentUser
      };
      
      const response = await apiRequest("POST", "/api/chat", {
        message,
        userId: currentUser,
        context
      });
      return response.json();
    },
    onSuccess: (data) => {
      const aiMessage: ChatMessage = {
        id: messages.length + 1,
        message: data.message,
        isUser: false,
        timestamp: new Date(),
        recommendations: data.recommendations
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    },
    onError: (error) => {
      setIsTyping(false);
      toast({
        title: "메시지 전송 실패",
        description: "AI 응답을 받을 수 없습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: messages.length + 1,
      message: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    chatMutation.mutate(inputMessage);
    setInputMessage("");
  };

  const handleQuickMessage = (suggestion: string) => {
    setInputMessage(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full h-[80vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-primary to-accent text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <i className="fas fa-robot text-white"></i>
              </div>
              <div>
                <h4 className="font-semibold">WeatherScent AI</h4>
                <p className="text-sm opacity-90">온라인</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-start space-x-3 ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.isUser 
                  ? 'bg-gray-300' 
                  : 'bg-gradient-to-br from-primary to-accent'
              }`}>
                <i className={`${
                  message.isUser 
                    ? 'fas fa-user text-gray-600' 
                    : 'fas fa-robot text-white'
                } text-sm`}></i>
              </div>
              <div className={`rounded-2xl p-4 max-w-sm ${
                message.isUser 
                  ? 'bg-gradient-to-r from-primary to-accent text-white rounded-tr-none' 
                  : 'warm-100 rounded-tl-none'
              }`}>
                <p className={`text-sm ${message.isUser ? 'text-white' : 'text-gray-800'}`}>
                  {message.message}
                </p>
                
                {/* AI Recommendations */}
                {message.recommendations && message.recommendations.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {message.recommendations.map((rec, index) => (
                      <div key={index} className="bg-white rounded-xl p-3 border">
                        <h5 className="text-sm font-semibold text-primary">
                          {rec.brand} {rec.name}
                        </h5>
                        <p className="text-xs text-gray-600 mb-2">{rec.category}</p>
                        <p className="text-xs text-gray-700">{rec.reason}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {rec.notes.slice(0, 3).map((note, noteIndex) => (
                            <span key={noteIndex} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                              {note}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-robot text-white text-sm"></i>
              </div>
              <div className="warm-100 rounded-2xl rounded-tl-none p-4 max-w-xs">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-6 border-t border-gray-100 flex-shrink-0">
          <div className="flex space-x-4 mb-4">
            <input 
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="flex-1 p-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              disabled={isTyping}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-gradient-to-r from-primary to-accent text-white p-3 rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
          
          {/* Quick Suggestions */}
          <div className="flex flex-wrap gap-2">
            {QUICK_SUGGESTIONS.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleQuickMessage(suggestion)}
                disabled={isTyping}
                className="text-xs warm-100 text-gray-700 px-3 py-1 rounded-full hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
