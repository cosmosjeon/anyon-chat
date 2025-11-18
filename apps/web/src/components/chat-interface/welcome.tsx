import { ProgrammingLanguageOptions } from "@opencanvas/shared/types";
import { ThreadPrimitive, useThreadRuntime } from "@assistant-ui/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FC, useMemo, useState, useEffect } from "react";
import { Button } from "../ui/button";

const QUICK_START_PROMPTS_SEARCH = [
  "2025년 AI 칩 제조업체에 대한 시장 분석 보고서 작성해줘",
  "최신 기후 변화 정책과 그 영향에 대한 블로그 포스트 작성해줘",
  "이번 분기 재생 에너지 동향에 대한 투자자 업데이트 작성해줘",
  "클라우드 컴퓨팅의 현재 사이버 보안 위협에 대한 보고서 작성해줘",
  "양자 컴퓨팅의 최신 발전 사항을 기술 뉴스레터로 분석해줘",
  "암 치료 분야의 새로운 의학적 돌파구 요약 작성해줘",
  "현재 금리가 주택 시장에 미치는 영향에 대해 작성해줘",
  "올해 배터리 기술 혁신에 대한 기사 초안 작성해줘",
  "반도체 제조업체의 현재 공급망 혼란 상황 분석해줘",
  "최근 AI 규제가 비즈니스 혁신에 미치는 영향에 대해 작성해줘",
];

const QUICK_START_PROMPTS = [
  "용감한 작은 로봇에 대한 잠자리 동화 작성해줘",
  "TypeScript로 피보나치 수열을 계산하는 함수 만들어줘",
  "2년 동안 재직한 직장의 사직서 초안 작성해줘",
  "React와 Tailwind를 사용한 간단한 날씨 대시보드 만들어줘",
  "인공지능에 대한 시를 작성해줘",
  "두 개의 엔드포인트를 가진 기본 Express.js REST API 만들어줘",
  "내 동생의 졸업식 축사 초안 작성해줘",
  "Python으로 명령줄 계산기 만들어줘",
  "완벽한 스크램블 에그 만드는 방법 설명해줘",
  "HTML canvas를 사용한 간단한 스네이크 게임 만들어줘",
  "React로 TODO 앱 만들어줘",
  "하늘이 파란 이유를 짧은 에세이로 설명해줘",
  "Craig 교수님께 보낼 이메일 초안 작성 도와줘",
  "Python으로 웹 스크래핑 프로그램 작성해줘",
];

function getRandomPrompts(prompts: string[], count: number = 4): string[] {
  return [...prompts].sort(() => Math.random() - 0.5).slice(0, count);
}

interface QuickStartButtonsProps {
  handleQuickStart: (
    type: "text" | "code",
    language?: ProgrammingLanguageOptions
  ) => void;
  composer: React.ReactNode;
  searchEnabled: boolean;
}

interface QuickStartPromptsProps {
  searchEnabled: boolean;
}

const QuickStartPrompts = ({ searchEnabled }: QuickStartPromptsProps) => {
  const threadRuntime = useThreadRuntime();
  const [isMounted, setIsMounted] = useState(false);

  const handleClick = (text: string) => {
    threadRuntime.append({
      role: "user",
      content: [{ type: "text", text }],
    });
  };

  const selectedPrompts = useMemo(
    () =>
      getRandomPrompts(
        searchEnabled ? QUICK_START_PROMPTS_SEARCH : QUICK_START_PROMPTS
      ),
    [searchEnabled]
  );

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex flex-col w-full gap-2">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        {selectedPrompts.map((prompt, index) => (
          <Button
            key={`quick-start-prompt-${index}`}
            onClick={() => handleClick(prompt)}
            variant="outline"
            className="min-h-[60px] w-full flex items-center justify-center p-6 whitespace-normal text-gray-500 hover:text-gray-700 transition-colors ease-in rounded-2xl"
          >
            <p className="text-center break-words text-sm font-normal">
              {prompt}
            </p>
          </Button>
        ))}
      </div>
    </div>
  );
};

const QuickStartButtons = (props: QuickStartButtonsProps) => {
  return (
    <div className="flex flex-col gap-8 items-center justify-center w-full">
      <div className="flex flex-col gap-6">
        <p className="text-3xl font-bold text-gray-800">어떤 서비스를 만들고 싶나요?</p>
      </div>
      <div className="flex flex-col gap-6 mt-2 w-full">
        <p className="text-gray-600 text-sm">또는 메시지로 시작하기</p>
        {props.composer}
        <QuickStartPrompts searchEnabled={props.searchEnabled} />
      </div>
    </div>
  );
};

interface ThreadWelcomeProps {
  handleQuickStart: (
    type: "text" | "code",
    language?: ProgrammingLanguageOptions
  ) => void;
  composer: React.ReactNode;
  searchEnabled: boolean;
}

export const ThreadWelcome: FC<ThreadWelcomeProps> = (
  props: ThreadWelcomeProps
) => {
  return (
    <ThreadPrimitive.Empty>
      <div className="flex items-center justify-center mt-16 w-full">
        <div className="text-center max-w-3xl w-full">
          <Avatar className="mx-auto">
            <AvatarImage src="/logo.svg" alt="LangChain Logo" />
            <AvatarFallback>LC</AvatarFallback>
          </Avatar>
          <div className="mt-8 w-full">
            <QuickStartButtons
              composer={props.composer}
              handleQuickStart={props.handleQuickStart}
              searchEnabled={props.searchEnabled}
            />
          </div>
        </div>
      </div>
    </ThreadPrimitive.Empty>
  );
};
