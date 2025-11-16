/**
 * PRD Template Levels & Checklist
 *
 * 질문 개수에 따라 다른 깊이의 PRD 템플릿 제공
 */

export type TemplateLevel = 'simple' | 'standard' | 'detailed';

export interface PRDSection {
  name: string;
  required_fields: {
    key: string;
    prompt_hint: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

/**
 * PRD 템플릿 레벨 정의
 */
export const PRD_TEMPLATE_LEVELS = {
  simple: {
    name: '빠르게',
    description: '핵심만 담은 간단한 PRD',
    minQuestions: 10,
    maxQuestions: 15,
    sections: [
      {
        name: '제품 개요',
        required_fields: [
          { key: 'productName', prompt_hint: '제품명', priority: 'high' as const },
          { key: 'productOneLine', prompt_hint: '한 줄 설명', priority: 'high' as const },
          { key: 'productGoals', prompt_hint: '제품 목표', priority: 'medium' as const }
        ]
      },
      {
        name: '문제 정의',
        required_fields: [
          { key: 'coreProblem', prompt_hint: '핵심 문제', priority: 'high' as const },
          { key: 'problemImpact', prompt_hint: '문제 영향', priority: 'medium' as const }
        ]
      },
      {
        name: '타겟 사용자',
        required_fields: [
          { key: 'targetUsers', prompt_hint: '타겟 그룹', priority: 'high' as const },
          { key: 'targetUserDetail', prompt_hint: '타겟 상세', priority: 'medium' as const }
        ]
      },
      {
        name: '핵심 가치 제안',
        required_fields: [
          { key: 'coreValue', prompt_hint: '차별화 포인트', priority: 'high' as const }
        ]
      },
      {
        name: '핵심 기능',
        required_fields: [
          { key: 'coreFunctions', prompt_hint: '핵심 기능 3개', priority: 'high' as const }
        ]
      },
      {
        name: 'MVP 범위',
        required_fields: [
          { key: 'mvpScope', prompt_hint: 'MVP 범위', priority: 'medium' as const }
        ]
      }
    ]
  },

  standard: {
    name: '표준',
    description: '실무용 완전한 PRD',
    minQuestions: 20,
    maxQuestions: 30,
    sections: [
      {
        name: '제품 개요',
        required_fields: [
          { key: 'productName', prompt_hint: '제품명', priority: 'high' as const },
          { key: 'productOneLine', prompt_hint: '한 줄 설명', priority: 'high' as const },
          { key: 'productVision', prompt_hint: '제품 비전', priority: 'medium' as const },
          { key: 'productGoals', prompt_hint: '제품 목표 (수치 포함)', priority: 'high' as const }
        ]
      },
      {
        name: '문제 정의',
        required_fields: [
          { key: 'coreProblem', prompt_hint: '핵심 문제', priority: 'high' as const },
          { key: 'problemImpact', prompt_hint: '문제 영향', priority: 'high' as const },
          { key: 'existingSolution', prompt_hint: '기존 해결 방법', priority: 'medium' as const },
          { key: 'solutionLimitations', prompt_hint: '기존 솔루션 한계', priority: 'medium' as const }
        ]
      },
      {
        name: '타겟 사용자',
        required_fields: [
          { key: 'targetUsers', prompt_hint: '타겟 그룹', priority: 'high' as const },
          { key: 'targetUserDetail', prompt_hint: '타겟 상세 프로필', priority: 'high' as const }
        ]
      },
      {
        name: '핵심 가치 제안',
        required_fields: [
          { key: 'coreValue', prompt_hint: '차별화 포인트', priority: 'high' as const }
        ]
      },
      {
        name: '비즈니스 모델',
        required_fields: [
          { key: 'businessModel', prompt_hint: '수익 모델', priority: 'high' as const },
          { key: 'freeTier', prompt_hint: '무료/유료 구분', priority: 'medium' as const },
          { key: 'pricing', prompt_hint: '가격 정책', priority: 'high' as const },
          { key: 'conversionStrategy', prompt_hint: '전환 전략', priority: 'medium' as const }
        ]
      },
      {
        name: '핵심 기능',
        required_fields: [
          { key: 'coreFunctions', prompt_hint: '핵심 기능 3개', priority: 'high' as const },
          { key: 'functionDescriptions', prompt_hint: '기능별 설명', priority: 'medium' as const }
        ]
      },
      {
        name: 'MVP 범위',
        required_fields: [
          { key: 'mvpScope', prompt_hint: 'MVP 범위', priority: 'high' as const }
        ]
      },
      {
        name: '성공 지표 (KPI)',
        required_fields: [
          { key: 'successMetrics', prompt_hint: '핵심 지표', priority: 'high' as const },
          { key: 'metricTargets', prompt_hint: '목표 수치', priority: 'medium' as const }
        ]
      },
      {
        name: '출시 계획',
        required_fields: [
          { key: 'launchTimeline', prompt_hint: '출시 일정', priority: 'medium' as const }
        ]
      },
      {
        name: '리스크 및 대응',
        required_fields: [
          { key: 'risks', prompt_hint: '주요 리스크', priority: 'medium' as const }
        ]
      }
    ]
  },

  detailed: {
    name: '디테일하게',
    description: '투자 제안용 완벽한 PRD',
    minQuestions: 40,
    maxQuestions: 50,
    sections: [
      {
        name: '제품 개요',
        required_fields: [
          { key: 'productName', prompt_hint: '제품명', priority: 'high' as const },
          { key: 'productOneLine', prompt_hint: '한 줄 설명', priority: 'high' as const },
          { key: 'productVision', prompt_hint: '제품 비전', priority: 'high' as const },
          { key: 'productGoals', prompt_hint: '제품 목표 (구체적 수치)', priority: 'high' as const },
          { key: 'productMission', prompt_hint: '미션', priority: 'low' as const }
        ]
      },
      {
        name: '문제 정의',
        required_fields: [
          { key: 'coreProblem', prompt_hint: '핵심 문제', priority: 'high' as const },
          { key: 'problemImpact', prompt_hint: '문제 영향 (구체적 수치)', priority: 'high' as const },
          { key: 'existingSolution', prompt_hint: '기존 해결 방법', priority: 'high' as const },
          { key: 'solutionLimitations', prompt_hint: '기존 솔루션 한계', priority: 'high' as const },
          { key: 'marketSize', prompt_hint: '시장 규모', priority: 'medium' as const }
        ]
      },
      {
        name: '타겟 사용자',
        required_fields: [
          { key: 'targetUsers', prompt_hint: '타겟 그룹', priority: 'high' as const },
          { key: 'targetUserDetail', prompt_hint: '타겟 상세 프로필', priority: 'high' as const },
          { key: 'personaPrimary', prompt_hint: '주 페르소나', priority: 'high' as const },
          { key: 'personaSecondary', prompt_hint: '부 페르소나', priority: 'medium' as const }
        ]
      },
      {
        name: '경쟁 분석',
        required_fields: [
          { key: 'competitors', prompt_hint: '경쟁 서비스 3개', priority: 'high' as const },
          { key: 'competitiveAdvantage', prompt_hint: '경쟁 우위', priority: 'high' as const }
        ]
      },
      {
        name: '핵심 가치 제안',
        required_fields: [
          { key: 'valueProposition', prompt_hint: 'Value Proposition', priority: 'high' as const },
          { key: 'coreValue', prompt_hint: '차별화 포인트', priority: 'high' as const }
        ]
      },
      {
        name: '비즈니스 모델',
        required_fields: [
          { key: 'businessModel', prompt_hint: '수익 모델', priority: 'high' as const },
          { key: 'freeTier', prompt_hint: '무료/유료 구분', priority: 'high' as const },
          { key: 'pricing', prompt_hint: '가격 정책', priority: 'high' as const },
          { key: 'conversionStrategy', prompt_hint: '전환 전략 (타이밍/트리거)', priority: 'high' as const },
          { key: 'revenueProjection', prompt_hint: '수익 예측', priority: 'medium' as const },
          { key: 'unitEconomics', prompt_hint: 'LTV/CAC', priority: 'medium' as const }
        ]
      },
      {
        name: '핵심 기능',
        required_fields: [
          { key: 'coreFunctions', prompt_hint: '핵심 기능 3-5개', priority: 'high' as const },
          { key: 'functionDescriptions', prompt_hint: '기능별 상세 설명', priority: 'high' as const },
          { key: 'functionPriority', prompt_hint: 'Phase별 기능 우선순위', priority: 'medium' as const },
          { key: 'exceptionHandling', prompt_hint: '예외 처리', priority: 'low' as const }
        ]
      },
      {
        name: '사용자 플로우',
        required_fields: [
          { key: 'userFlow', prompt_hint: '사용자 플로우 단계', priority: 'high' as const },
          { key: 'onboarding', prompt_hint: '온보딩 플로우', priority: 'medium' as const }
        ]
      },
      {
        name: 'MVP 범위',
        required_fields: [
          { key: 'mvpScope', prompt_hint: 'MVP 범위', priority: 'high' as const },
          { key: 'mvpFeatures', prompt_hint: 'MVP 기능 상세', priority: 'medium' as const }
        ]
      },
      {
        name: '성공 지표 (KPI)',
        required_fields: [
          { key: 'successMetrics', prompt_hint: '핵심 지표', priority: 'high' as const },
          { key: 'metricTargets', prompt_hint: '목표 수치 (1개월/3개월/6개월)', priority: 'high' as const },
          { key: 'conversionFunnel', prompt_hint: '전환 퍼널', priority: 'medium' as const }
        ]
      },
      {
        name: '출시 계획',
        required_fields: [
          { key: 'launchTimeline', prompt_hint: '출시 일정', priority: 'high' as const },
          { key: 'milestones', prompt_hint: '마일스톤', priority: 'medium' as const },
          { key: 'goToMarket', prompt_hint: 'GTM 전략', priority: 'medium' as const }
        ]
      },
      {
        name: '리스크 및 대응',
        required_fields: [
          { key: 'risks', prompt_hint: '주요 리스크 5개', priority: 'high' as const },
          { key: 'mitigation', prompt_hint: '리스크 대응 방안', priority: 'medium' as const }
        ]
      }
    ]
  }
};

/**
 * 템플릿 레벨 선택 옵션
 */
export const TEMPLATE_LEVEL_OPTIONS = [
  {
    label: '빠르게 (10-15개 질문)',
    value: 'simple',
    description: PRD_TEMPLATE_LEVELS.simple.description
  },
  {
    label: '표준 (20-30개 질문) ⭐ 추천',
    value: 'standard',
    description: PRD_TEMPLATE_LEVELS.standard.description
  },
  {
    label: '디테일하게 (40-50개 질문)',
    value: 'detailed',
    description: PRD_TEMPLATE_LEVELS.detailed.description
  }
];
