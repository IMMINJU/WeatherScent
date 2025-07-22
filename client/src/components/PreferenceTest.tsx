import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { UserPreferences, PreferenceQuestion } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface PreferenceTestProps {
  currentUser: number;
  onComplete: (preferences: UserPreferences) => void;
  onClose: () => void;
}

const PREFERENCE_QUESTIONS: PreferenceQuestion[] = [
  {
    id: 1,
    title: "선호하는 향수 계열은?",
    subtitle: "가장 끌리는 향의 종류를 선택해주세요",
    options: [
      {
        id: "fresh",
        label: "프레시/시트러스",
        description: "상쾌하고 깔끔한 향",
        icon: "fas fa-leaf",
        value: "프레시"
      },
      {
        id: "floral",
        label: "플로럴",
        description: "로맨틱하고 우아한 꽃향",
        icon: "fas fa-seedling",
        value: "플로럴"
      },
      {
        id: "woody",
        label: "우디",
        description: "따뜻하고 깊은 나무향",
        icon: "fas fa-tree",
        value: "우디"
      },
      {
        id: "oriental",
        label: "오리엔탈",
        description: "신비롭고 관능적인 향",
        icon: "fas fa-fire",
        value: "오리엔탈"
      }
    ]
  },
  {
    id: 2,
    title: "선호하는 향의 강도는?",
    subtitle: "어느 정도 강도의 향을 좋아하시나요?",
    options: [
      {
        id: "light",
        label: "라이트",
        description: "은은하고 부드러운 향",
        icon: "fas fa-feather",
        value: "light"
      },
      {
        id: "medium",
        label: "미디엄",
        description: "적당한 강도의 향",
        icon: "fas fa-balance-scale",
        value: "medium"
      },
      {
        id: "strong",
        label: "스트롱",
        description: "진하고 강한 향",
        icon: "fas fa-bolt",
        value: "strong"
      }
    ]
  },
  {
    id: 3,
    title: "주로 언제 향수를 사용하시나요?",
    subtitle: "향수 사용 목적을 선택해주세요",
    options: [
      {
        id: "daily",
        label: "데일리",
        description: "일상적인 사용",
        icon: "fas fa-calendar-day",
        value: "daily"
      },
      {
        id: "work",
        label: "업무용",
        description: "직장이나 회의에서",
        icon: "fas fa-briefcase",
        value: "work"
      },
      {
        id: "date",
        label: "데이트",
        description: "특별한 만남에서",
        icon: "fas fa-heart",
        value: "date"
      },
      {
        id: "party",
        label: "파티/이벤트",
        description: "모임이나 파티에서",
        icon: "fas fa-glass-cheers",
        value: "party"
      }
    ]
  },
  {
    id: 4,
    title: "어떤 계절 향수를 선호하시나요?",
    subtitle: "계절감에 따른 선호도를 알려주세요",
    options: [
      {
        id: "spring",
        label: "봄",
        description: "상쾌하고 화사한 느낌",
        icon: "fas fa-seedling",
        value: "spring"
      },
      {
        id: "summer",
        label: "여름",
        description: "시원하고 가벼운 느낌",
        icon: "fas fa-sun",
        value: "summer"
      },
      {
        id: "autumn",
        label: "가을",
        description: "따뜻하고 포근한 느낌",
        icon: "fas fa-leaf",
        value: "autumn"
      },
      {
        id: "winter",
        label: "겨울",
        description: "깊고 진한 느낌",
        icon: "fas fa-snowflake",
        value: "winter"
      }
    ]
  },
  {
    id: 5,
    title: "향수로 표현하고 싶은 분위기는?",
    subtitle: "향수를 통해 어떤 매력을 보여주고 싶나요?",
    options: [
      {
        id: "elegant",
        label: "우아함",
        description: "세련되고 고급스러운",
        icon: "fas fa-crown",
        value: "elegant"
      },
      {
        id: "sexy",
        label: "섹시함",
        description: "매혹적이고 관능적인",
        icon: "fas fa-fire-flame-curved",
        value: "sexy"
      },
      {
        id: "fresh",
        label: "상쾌함",
        description: "깔끔하고 청량한",
        icon: "fas fa-wind",
        value: "fresh"
      },
      {
        id: "mysterious",
        label: "신비로움",
        description: "독특하고 개성있는",
        icon: "fas fa-mask",
        value: "mysterious"
      }
    ]
  }
];

export default function PreferenceTest({ currentUser, onComplete, onClose }: PreferenceTestProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const { toast } = useToast();

  const analyzePreferencesMutation = useMutation({
    mutationFn: async (answers: any[]) => {
      const response = await apiRequest("POST", "/api/preferences/analyze", {
        answers,
        userId: currentUser
      });
      return response.json();
    },
    onSuccess: (analysis) => {
      if (analysis.profile) {
        onComplete(analysis.profile);
        toast({
          title: "취향 분석 완료!",
          description: "당신의 향수 취향을 성공적으로 분석했습니다.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "분석 실패",
        description: "취향 분석 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const currentQuestion = PREFERENCE_QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / PREFERENCE_QUESTIONS.length) * 100;

  const handleOptionSelect = (option: any) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = {
      questionId: currentQuestion.id,
      question: currentQuestion.title,
      answer: option.value,
      label: option.label
    };
    setAnswers(newAnswers);

    if (currentStep < PREFERENCE_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete the test
      analyzePreferencesMutation.mutate(newAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="text-center flex-1">
              <h3 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
                향수 취향 분석
              </h3>
              <p className="text-lg text-gray-600">간단한 테스트로 당신의 향수 취향을 알아보세요</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="warm-50 rounded-3xl p-8 md:p-12">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">
                  Step {currentStep + 1} of {PREFERENCE_QUESTIONS.length}
                </span>
                <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <div className="text-center mb-8">
              <h4 className="font-display text-2xl font-semibold text-primary mb-4">
                {currentQuestion.title}
              </h4>
              <p className="text-gray-600">{currentQuestion.subtitle}</p>
            </div>

            {/* Options */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option)}
                  className="group p-6 bg-white rounded-2xl border border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-300 text-left"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center group-hover:from-primary/20 group-hover:to-accent/20 transition-all">
                      <i className={`${option.icon} text-primary text-lg`}></i>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-800">{option.label}</h5>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button 
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="text-gray-600 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-arrow-left mr-2"></i>이전
              </button>
              <div className="text-sm text-gray-500">
                선택지를 클릭하면 자동으로 다음 단계로 진행됩니다
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
