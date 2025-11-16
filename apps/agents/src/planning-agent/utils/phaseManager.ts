/**
 * Phase Management for Dynamic Question Generation
 */

export type QuestionPhase = "initial" | "middle" | "final" | "closing";

/**
 * Get current phase based on question progress
 */
export function getCurrentPhase(
  currentQuestionCount: number,
  maxQuestions: number
): QuestionPhase {
  const progress = (currentQuestionCount / maxQuestions) * 100;

  if (progress < 30) {
    return "initial";
  } else if (progress < 70) {
    return "middle";
  } else if (progress < 90) {
    return "final";
  } else {
    return "closing";
  }
}

/**
 * Get phase-specific strategy description
 */
export function getPhaseStrategy(phase: QuestionPhase): string {
  switch (phase) {
    case "initial":
      return `**초기 단계 (0-30%)**
- 제품 개요, 핵심 문제, 타겟 사용자 등 기본 정보 수집
- 넓게 탐색하여 전체 그림 파악
- 간단하고 명확한 질문으로 시작
- 사용자의 비전과 방향성 이해`;

    case "middle":
      return `**중반 단계 (30-70%)**
- 핵심 기능, 비즈니스 모델, 가치 제안 등 구체적 내용 수집
- 이전 답변을 바탕으로 깊이 있는 질문
- 사용자의 mindset에 맞는 관점으로 질문
- 빠진 중요 섹션 집중 공략`;

    case "final":
      return `**마무리 단계 (70-90%)**
- MVP, 출시 계획, 성공 지표 등 실행 계획 수집
- 아직 빈 섹션이 있다면 우선 순위로 채우기
- 구체적인 수치와 계획 요청
- 리스크 및 대응 방안 확인`;

    case "closing":
      return `**종료 단계 (90-100%)**
- 마지막 남은 critical gap만 질문
- 더 이상 중요한 빈 칸이 없다면 종료
- 이미 충분한 정보가 있다면 추가 질문 없이 종료`;
  }
}

/**
 * Get question focus areas for current phase
 */
export function getPhaseFocusAreas(phase: QuestionPhase): string[] {
  switch (phase) {
    case "initial":
      return [
        "제품 개요",
        "문제 정의",
        "타겟 사용자",
        "핵심 가치 제안",
      ];

    case "middle":
      return [
        "핵심 기능",
        "비즈니스 모델",
        "경쟁 분석",
        "사용자 플로우",
      ];

    case "final":
      return [
        "MVP 범위",
        "성공 지표 (KPI)",
        "출시 계획",
        "리스크 및 대응",
      ];

    case "closing":
      return [
        "리스크 및 대응",
        "출시 계획",
      ];
  }
}

/**
 * Get question type recommendation for phase
 */
export function getPhaseQuestionTypeRecommendation(phase: QuestionPhase): {
  preferMultipleChoice: boolean;
  allowOpenEnded: boolean;
  requireSpecificity: boolean;
} {
  switch (phase) {
    case "initial":
      return {
        preferMultipleChoice: true, // Easy start with multiple choice
        allowOpenEnded: true, // But allow text for product description
        requireSpecificity: false, // Broad answers OK
      };

    case "middle":
      return {
        preferMultipleChoice: true, // Multiple choice for efficiency
        allowOpenEnded: false, // Minimize text input
        requireSpecificity: true, // Want specific answers
      };

    case "final":
      return {
        preferMultipleChoice: false, // More open-ended for plans
        allowOpenEnded: true, // Need detailed execution plans
        requireSpecificity: true, // Want concrete numbers
      };

    case "closing":
      return {
        preferMultipleChoice: true, // Quick multiple choice to wrap up
        allowOpenEnded: false, // No time for long answers
        requireSpecificity: true, // Fill specific gaps only
      };
  }
}

/**
 * Calculate remaining questions
 */
export function getRemainingQuestions(
  currentQuestionCount: number,
  maxQuestions: number
): number {
  return Math.max(0, maxQuestions - currentQuestionCount);
}

/**
 * Get progress percentage
 */
export function getProgressPercentage(
  currentQuestionCount: number,
  maxQuestions: number
): number {
  return Math.round((currentQuestionCount / maxQuestions) * 100);
}
