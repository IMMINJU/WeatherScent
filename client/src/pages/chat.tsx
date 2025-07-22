import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Bot, User, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Chat() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      content: "안녕하세요! 저는 WeatherScent의 AI 향수 컨설턴트입니다. 어떤 향수에 대해 궁금한 점이 있으신가요? 날씨, 기분, 상황에 맞는 향수 추천을 도와드릴 수 있어요.",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await apiRequest("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message: inputMessage,
          userId: 1, // 임시 사용자 ID
          context: {
            previousMessages: messages.slice(-5) // 최근 5개 메시지만 컨텍스트로 전달
          }
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.message || "죄송합니다. 응답을 생성할 수 없습니다.",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "메시지 전송에 실패했습니다",
        variant: "destructive"
      });

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "죄송합니다. 일시적으로 응답을 드릴 수 없습니다. 잠시 후 다시 시도해주세요.",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickPrompts = [
    "오늘 날씨에 어울리는 향수 추천해주세요",
    "데이트용 향수 추천해주세요",
    "직장에서 쓸 수 있는 은은한 향수는?",
    "가을에 어울리는 향수 종류는?",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                홈으로
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-amber-500 to-rose-500 p-2 rounded-full">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-gray-900">
                  AI 향수 컨설턴트
                </h1>
                <p className="text-sm text-gray-600">언제든지 향수에 대해 물어보세요</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-200px)] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex items-start gap-3 max-w-[80%]`}>
                {!message.isUser && (
                  <div className="bg-gradient-to-r from-amber-500 to-rose-500 p-2 rounded-full flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <Card className={`${
                  message.isUser 
                    ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white" 
                    : "bg-white/80 backdrop-blur-sm"
                } border-0 shadow-md`}>
                  <CardContent className="p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p className={`text-xs mt-2 ${
                      message.isUser ? "text-amber-100" : "text-gray-500"
                    }`}>
                      {message.timestamp.toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </CardContent>
                </Card>

                {message.isUser && (
                  <div className="bg-gray-400 p-2 rounded-full flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3">
                <div className="bg-gradient-to-r from-amber-500 to-rose-500 p-2 rounded-full">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length === 1 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">빠른 질문:</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage(prompt)}
                  className="text-sm bg-white/60 backdrop-blur-sm hover:bg-white/80"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="향수에 대해 궁금한 것을 물어보세요..."
            className="flex-1 bg-white/80 backdrop-blur-sm border-0 shadow-md"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white shadow-md"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}