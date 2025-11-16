# PRD 에이전트 동적 질문 생성 시스템 구현 계획

**작성일**: 2025-11-17
**목표**: 고정 질문 → AI 동적 질문 생성으로 전환

---

## 📋 목차

1. [시스템 아키텍처](#시스템-아키텍처)
2. [데이터 플로우](#데이터-플로우)
3. [파일별 구현 계획](#파일별-구현-계획)
4. [핵심 로직 의사코드](#핵심-로직-의사코드)
5. [동작 시나리오](#동작-시나리오)
6. [구현 체크리스트](#구현-체크리스트)

---

## 시스템 아키텍처

### Before (고정 질문)
```
questions.ts (19개 고정 질문)
    ↓
askQuestion → 질문 표시
    ↓
사용자 답변
    ↓
processAnswer → 다음 질문 ID 결정
    ↓
updatePRD → 템플릿 업데이트
    ↓
반복
```

### After (동적 질문)
```
온보딩: 질문 개수 선택 (10/30/50)
    ↓
prd-checklist.ts (템플릿 레벨)
    ↓
generateQuestion (AI가 질문 생성)
    - 컨텍스트 분석
    - 완성도 체크
    - 질문 예산 관리
    - 전문가 관점 선택지 생성
    ↓
사용자 답변
    ↓
processAnswer
    - PRD 업데이트
    - 컨텍스트 업데이트
    - 사용자 성향 추론
    - 완성도 체크
    ↓
[분기]
  - 완성도 < 80% → generateQuestion
  - 완성도 >= 80% → generateFinalPRD
```

---

## 데이터 플로우

### State 구조
```typescript
{
  // 기존 필드
  messages: BaseMessage[];
  prdData: PRDData;
  answers: Answer[];

  // 신규 필드
  templateLevel: 'simple' | 'standard' | 'detailed';
  maxQuestions: number;          // 30
  currentQuestionCount: number;  // 7
  conversationContext: {
    product: string;
    problem: string;
    target: string;
    values: string[];
    userMindset: string;         // "빠른 성장 중시"
  };
  completenessScore: number;     // 0-100
  currentPhase: 'initial' | 'middle' | 'final' | 'closing';
}
```

### 질문 생성 흐름
```
1. 완성도 분석
   - PRD 섹션별로 필수 필드 체크
   - 완성도 점수 계산 (0-100)

2. 우선순위 결정
   - 미완성 섹션 중 우선순위 높은 것
   - 현재 단계 고려 (초반/중반/후반)

3. 컨텍스트 구성
   - 이전 대화 내용
   - 현재 PRD 상태
   - 질문 예산 (7/30)
   - 사용자 성향

4. AI 질문 생성
   - 자연스러운 질문 문구
   - 맥락 인식 선택지 4-5개
   - 전문가 관점 레이블
   - Trade-off 명시
```

---

## 파일별 구현 계획

### 1. types.ts 수정

**추가할 인터페이스:**

```typescript
// 대화 컨텍스트
export interface ConversationContext {
  product?: string;              // "AI 자세 교정 앱"
  problem?: string;              // "PT 너무 비쌈"
  target?: string;               // "2030 헬스 초보"
  values?: string[];             // ["실시간", "맞춤", "저렴"]
  competitors?: string[];        // ["PT", "유튜브"]
  userMindset?: string;          // "빠른 성장 중시" | "안정적 수익 중시" | "품질 중시"
}

// 동적 생성 질문
export interface DynamicQuestion {
  question: string;
  options?: QuestionOption[];
  type: "text" | "single_choice" | "multiple_choice";
  context: string;               // "타겟이 '월 2만원 이하' 원하는데..."
  phase: 'initial' | 'middle' | 'final' | 'closing';
}

// PRD 완성도
export interface CompletenessReport {
  overall: number;               // 0-100
  sections: {
    name: string;
    completed: boolean;
    filledFields: number;
    totalFields: number;
  }[];
  missingCritical: string[];     // ["비즈니스 모델", "KPI"]
}

// PRDData에 추가 필드
export interface PRDData {
  // 기존 필드 +

  // Detailed 레벨용
  productMission?: string;
  marketSize?: string;
  personaPrimary?: string;
  personaSecondary?: string;
  competitors?: string[];
  competitiveAdvantage?: string;
  valueProposition?: string;
  revenueProjection?: string;
  unitEconomics?: string;
  functionPriority?: string;
  exceptionHandling?: string;
  userFlow?: string;
  onboarding?: string;
  mvpFeatures?: string;
  conversionFunnel?: string;
  milestones?: string;
  goToMarket?: string;
  mitigation?: string;
}
```

### 2. state.ts 수정

**추가할 필드:**

```typescript
export const PRDQuestionnaireAnnotation = Annotation.Root({
  // 기존 필드...

  // 질문 관리
  templateLevel: Annotation<'simple' | 'standard' | 'detailed'>({
    reducer: (_, update) => update,
    default: () => 'standard'
  }),

  maxQuestions: Annotation<number>({
    reducer: (_, update) => update,
    default: () => 30
  }),

  currentQuestionCount: Annotation<number>({
    reducer: (prev, update) => update ?? prev,
    default: () => 0
  }),

  // 컨텍스트
  conversationContext: Annotation<ConversationContext>({
    reducer: (prev, update) => ({ ...prev, ...update }),
    default: () => ({})
  }),

  // 완성도
  completenessScore: Annotation<number>({
    reducer: (_, update) => update,
    default: () => 0
  }),

  currentPhase: Annotation<'initial' | 'middle' | 'final' | 'closing'>({
    reducer: (_, update) => update,
    default: () => 'initial'
  }),

  // 동적 질문
  currentDynamicQuestion: Annotation<DynamicQuestion | null>({
    reducer: (_, update) => update,
    default: () => null
  })
});
```

### 3. utils/ 폴더 생성

#### 3.1 `utils/contextAnalyzer.ts`

```typescript
/**
 * 대화 컨텍스트 분석
 */

import { PRDData, Answer, ConversationContext } from '../types';

export function analyzeConversationContext(
  prdData: PRDData,
  answers: Answer[]
): ConversationContext {
  return {
    product: prdData.productOneLine,
    problem: prdData.coreProblem,
    target: prdData.targetUserDetail || prdData.targetUsers?.join(', '),
    values: prdData.coreValue || [],
    competitors: extractCompetitors(answers),
    userMindset: inferUserMindset(prdData, answers)
  };
}

/**
 * 이전 답변에서 경쟁자 추출
 */
function extractCompetitors(answers: Answer[]): string[] {
  // "기존 해결 방법" 답변에서 경쟁자 추출
  const competitorAnswer = answers.find(a =>
    a.questionId?.includes('existing') ||
    a.text?.includes('PT') ||
    a.text?.includes('유튜브')
  );

  if (!competitorAnswer) return [];

  // 간단한 파싱 (실제로는 더 정교하게)
  const text = competitorAnswer.text || '';
  const competitors: string[] = [];

  if (text.includes('PT')) competitors.push('PT');
  if (text.includes('유튜브')) competitors.push('유튜브');
  if (text.includes('앱')) competitors.push('일반 앱');

  return competitors;
}

/**
 * 사용자 성향 추론
 */
function inferUserMindset(prdData: PRDData, answers: Answer[]): string {
  let growthScore = 0;
  let profitScore = 0;
  let qualityScore = 0;

  // 가격 선택에서 성향 파악
  if (prdData.pricing) {
    if (prdData.pricing.includes('4,900') || prdData.pricing.includes('9,900')) {
      growthScore += 2; // 저가 = 성장 중시
    } else if (prdData.pricing.includes('29,900')) {
      profitScore += 2; // 고가 = 수익 중시
      qualityScore += 1;
    }
  }

  // 핵심 가치에서 성향 파악
  if (prdData.coreValue) {
    if (prdData.coreValue.includes('저렴') || prdData.coreValue.includes('확산')) {
      growthScore += 1;
    }
    if (prdData.coreValue.includes('품질') || prdData.coreValue.includes('프리미엄')) {
      qualityScore += 2;
    }
  }

  // 비즈니스 모델에서 성향 파악
  if (prdData.businessModel?.includes('프리미엄') || prdData.businessModel?.includes('무료')) {
    growthScore += 1;
  }
  if (prdData.businessModel?.includes('구독')) {
    profitScore += 1;
  }

  // 최종 판단
  if (growthScore >= profitScore && growthScore >= qualityScore) {
    return '빠른 성장 중시';
  } else if (profitScore >= qualityScore) {
    return '안정적 수익 중시';
  } else {
    return '품질 중시';
  }
}
```

#### 3.2 `utils/completenessChecker.ts`

```typescript
/**
 * PRD 완성도 체크
 */

import { PRDData, CompletenessReport } from '../types';
import { PRD_TEMPLATE_LEVELS, TemplateLevel } from '../prd-checklist';

export function checkCompleteness(
  prdData: PRDData,
  level: TemplateLevel
): CompletenessReport {
  const template = PRD_TEMPLATE_LEVELS[level];
  const sections = template.sections;

  let totalFields = 0;
  let filledFields = 0;
  const missingCritical: string[] = [];
  const sectionReports: CompletenessReport['sections'] = [];

  for (const section of sections) {
    let sectionFilled = 0;
    let sectionTotal = section.required_fields.length;

    for (const field of section.required_fields) {
      totalFields++;
      const value = (prdData as any)[field.key];

      if (value && (
        (typeof value === 'string' && value.length > 0) ||
        (Array.isArray(value) && value.length > 0) ||
        (typeof value === 'object' && Object.keys(value).length > 0)
      )) {
        filledFields++;
        sectionFilled++;
      } else if (field.priority === 'high') {
        missingCritical.push(`${section.name} - ${field.prompt_hint}`);
      }
    }

    sectionReports.push({
      name: section.name,
      completed: sectionFilled === sectionTotal,
      filledFields: sectionFilled,
      totalFields: sectionTotal
    });
  }

  return {
    overall: Math.round((filledFields / totalFields) * 100),
    sections: sectionReports,
    missingCritical
  };
}

/**
 * 다음 질문할 섹션 결정
 */
export function getNextSection(
  report: CompletenessReport,
  currentPhase: string
): string | null {
  // 미완성 섹션 찾기
  const incomplete = report.sections.filter(s => !s.completed);

  if (incomplete.length === 0) return null;

  // 단계별 우선순위
  if (currentPhase === 'initial') {
    // 초반: 제품 개요, 문제 정의, 타겟 우선
    const priority = ['제품 개요', '문제 정의', '타겟 사용자'];
    for (const name of priority) {
      if (incomplete.find(s => s.name === name)) return name;
    }
  } else if (currentPhase === 'middle') {
    // 중반: 비즈니스 모델, 핵심 기능 우선
    const priority = ['핵심 가치 제안', '비즈니스 모델', '핵심 기능'];
    for (const name of priority) {
      if (incomplete.find(s => s.name === name)) return name;
    }
  } else if (currentPhase === 'final') {
    // 후반: KPI, 출시 계획, 리스크 우선
    const priority = ['성공 지표 (KPI)', '출시 계획', '리스크 및 대응'];
    for (const name of priority) {
      if (incomplete.find(s => s.name === name)) return name;
    }
  }

  // 기본: 첫 번째 미완성 섹션
  return incomplete[0].name;
}
```

#### 3.3 `utils/phaseManager.ts`

```typescript
/**
 * 질문 단계 관리
 */

export function getCurrentPhase(
  currentQuestion: number,
  maxQuestions: number
): 'initial' | 'middle' | 'final' | 'closing' {
  const progress = (currentQuestion / maxQuestions) * 100;

  if (progress < 30) return 'initial';
  if (progress < 70) return 'middle';
  if (progress < 90) return 'final';
  return 'closing';
}

export function getPhaseStrategy(phase: string): string {
  const strategies = {
    initial: `초반입니다. 제품 개요, 문제 정의, 타겟 사용자 같은 기본 정보를 넓게 수집하세요.
각 주제당 1-2개 질문으로 핵심만 빠르게 파악하세요.`,

    middle: `중반입니다. 비즈니스 모델, 핵심 기능, MVP 범위 같은 핵심 정보를 깊이 탐색하세요.
중요한 주제는 2-3개 질문으로 구체화하세요.`,

    final: `후반입니다. KPI, 출시 계획, 리스크 같은 실행 정보를 수집하세요.
빠진 중요 정보가 있는지 PRD를 검토하고 채우세요.`,

    closing: `마무리 단계입니다. PRD를 전체적으로 검토하고 **핵심적인** 빠진 정보만 물어보세요.
사소한 정보는 AI가 추론할 수 있으므로 건너뛰세요.
완성도가 80% 이상이면 질문을 종료하고 최종 PRD를 생성하세요.`
  };

  return strategies[phase as keyof typeof strategies] || strategies.initial;
}
```

### 4. prompts.ts 수정

**추가할 프롬프트:**

```typescript
/**
 * 동적 질문 생성 프롬프트
 */
export const DYNAMIC_QUESTION_GENERATION_PROMPT = `
당신은 전문 제품 기획자로서 PRD를 작성하기 위해 사용자와 대화하고 있습니다.

## 🎯 질문 예산 관리

**현재 상황:**
- 현재 질문: {currentQuestion}/{maxQuestions}
- 진행률: {progress}%
- 남은 질문: {remaining}개
- 현재 단계: {phase}

**단계별 전략:**
{phaseStrategy}

## 📊 PRD 완성도

**전체 완성도: {completeness}%**

**완료된 섹션:**
{completedSections}

**부족한 섹션:**
{missingSections}

**다음 우선순위 섹션:** {nextSection}

## 🎨 대화 컨텍스트

{conversationContext}

## 📝 질문 생성 규칙

1. **우선순위 기반 질문**
   - {nextSection}의 부족한 정보를 채우는 질문
   - 현재 단계에 맞는 깊이로 질문

2. **맥락 연결**
   - 이전 답변 내용 참조
   - 자연스러운 대화 흐름
   - "오, 그렇다면..." 스타일

3. **질문 예산 의식**
   - 남은 질문 수 고려
   - 중요도 낮은 정보는 스킵
   - 마지막 3개 질문은 핵심만

4. **종료 조건**
   - 완성도 80% 이상 + 남은 질문 3개 이하
   - → "COMPLETE" 응답

## 출력 형식

\`\`\`json
{
  "action": "ask" | "complete",
  "question": "자연스러운 질문 문구 (진행률 표시 포함)",
  "type": "text" | "single_choice" | "multiple_choice",
  "context": "왜 이 질문을 하는지 설명"
}
\`\`\`

이제 다음 질문을 생성하세요.
`;

/**
 * 객관식 선택지 생성 프롬프트
 */
export const OPTION_GENERATION_PROMPT = `
당신은 3명의 전문가 패널입니다:

1. **실리콘밸리 창업자** - 성장 최우선, 네트워크 효과, 바이럴
2. **실무 기획자** - 현실적 실행, 밸런스, 리스크 관리
3. **벤처 투자자** - 수익성, LTV/CAC, Exit 전략

## 현재 상황

**질문 주제:** {topic}

**대화 컨텍스트:**
{context}

**사용자 성향:** {userMindset}
- 이 사용자는 "{userMindset}"를 중시하는 것 같습니다
- 이에 맞는 선택지를 포함하되, 다른 관점도 제시하세요

## 선택지 생성 규칙

1. **다양한 전략 축**
   - 각 선택지는 다른 전략을 대표
   - 비슷한 선택지 2개 이상 금지

2. **전문가 관점 명시**
   ```
   [창업자] 파괴적 저가 (4,900원/월)
   설명: 빠른 시장 점유 → 네트워크 효과
   리스크: 초기 적자, 저가 이미지
   ```

3. **Trade-off 명확화**
   - 장점만이 아닌 리스크도 명시
   - 사용자가 전략적 선택 가능하게

4. **컨텍스트 반영**
   - 이전 답변과 일관성
   - 타겟/문제/가치와 연결

## 출력 형식

\`\`\`json
{
  "options": [
    {
      "label": "짧은 선택지명",
      "value": "slug",
      "description": "[관점] 전략 설명 + 장점 + 리스크",
      "perspective": "창업자|기획자|투자자"
    }
  ]
}
\`\`\`

4-5개의 전략적으로 다른 선택지를 생성하세요.
`;
```

### 5. nodes/ 구현

#### 5.1 `nodes/askOnboarding.ts`

```typescript
/**
 * 온보딩: 질문 개수 선택
 */

import { AIMessage } from "@langchain/core/messages";
import { PRDQuestionnaireReturnType } from "../state";
import { TEMPLATE_LEVEL_OPTIONS } from "../prd-checklist";

export async function askOnboarding(): Promise<PRDQuestionnaireReturnType> {
  const message = new AIMessage({
    content: `안녕하세요! PRD를 함께 작성해볼까요? 👋

얼마나 디테일하게 기획하고 싶으신가요?

${TEMPLATE_LEVEL_OPTIONS.map((opt, i) =>
  `${i + 1}. ${opt.label}\n   ${opt.description}`
).join('\n\n')}

4. 직접 설정 (질문 개수 입력)

숫자를 선택하거나 직접 입력해주세요.`
  });

  return {
    messages: [message],
    awaitingAnswer: true,
    currentQuestionCount: 0
  };
}
```

#### 5.2 `nodes/generateQuestion.ts`

```typescript
/**
 * 동적 질문 생성 노드
 */

import { AIMessage } from "@langchain/core/messages";
import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { PRDQuestionnaireState, PRDQuestionnaireReturnType } from "../state";
import { getModelFromConfig } from "../../utils";
import { checkCompleteness, getNextSection } from "../utils/completenessChecker";
import { analyzeConversationContext } from "../utils/contextAnalyzer";
import { getCurrentPhase, getPhaseStrategy } from "../utils/phaseManager";
import { DYNAMIC_QUESTION_GENERATION_PROMPT, OPTION_GENERATION_PROMPT } from "../prompts";

export async function generateQuestion(
  state: PRDQuestionnaireState,
  config: LangGraphRunnableConfig
): Promise<PRDQuestionnaireReturnType> {

  const {
    prdData,
    answers,
    currentQuestionCount,
    maxQuestions,
    templateLevel
  } = state;

  // 1. 완성도 체크
  const completenessReport = checkCompleteness(prdData, templateLevel);

  // 2. 단계 결정
  const phase = getCurrentPhase(currentQuestionCount, maxQuestions);
  const phaseStrategy = getPhaseStrategy(phase);

  // 3. 종료 조건 체크
  const remaining = maxQuestions - currentQuestionCount;
  if (completenessReport.overall >= 80 && remaining <= 3) {
    return {
      isComplete: true,
      currentPhase: 'closing'
    };
  }

  // 4. 컨텍스트 분석
  const context = analyzeConversationContext(prdData, answers);

  // 5. 다음 섹션 결정
  const nextSection = getNextSection(completenessReport, phase);

  if (!nextSection) {
    return { isComplete: true };
  }

  // 6. AI에게 질문 생성 요청
  const model = await getModelFromConfig(config);

  const prompt = DYNAMIC_QUESTION_GENERATION_PROMPT
    .replace('{currentQuestion}', String(currentQuestionCount + 1))
    .replace('{maxQuestions}', String(maxQuestions))
    .replace('{progress}', String(Math.round((currentQuestionCount / maxQuestions) * 100)))
    .replace('{remaining}', String(remaining))
    .replace('{phase}', phase)
    .replace('{phaseStrategy}', phaseStrategy)
    .replace('{completeness}', String(completenessReport.overall))
    .replace('{completedSections}',
      completenessReport.sections
        .filter(s => s.completed)
        .map(s => s.name)
        .join(', ') || '없음'
    )
    .replace('{missingSections}',
      completenessReport.sections
        .filter(s => !s.completed)
        .map(s => `${s.name} (${s.filledFields}/${s.totalFields})`)
        .join(', ')
    )
    .replace('{nextSection}', nextSection)
    .replace('{conversationContext}', JSON.stringify(context, null, 2));

  const response = await model.invoke([
    { role: "system", content: "전문 기획자" },
    { role: "user", content: prompt }
  ]);

  // JSON 파싱
  const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
  const questionData = JSON.parse(content);

  if (questionData.action === 'complete') {
    return { isComplete: true };
  }

  // 7. 객관식인 경우 선택지 생성
  let options = undefined;
  if (questionData.type !== 'text') {
    const optionModel = await getModelFromConfig(config, { temperature: 0.7 });
    const optionPrompt = OPTION_GENERATION_PROMPT
      .replace('{topic}', nextSection)
      .replace('{context}', JSON.stringify(context, null, 2))
      .replace('{userMindset}', context.userMindset || '확인 필요');

    const optionResponse = await optionModel.invoke([
      { role: "system", content: "전문가 패널" },
      { role: "user", content: optionPrompt }
    ]);

    const optionContent = typeof optionResponse.content === 'string'
      ? optionResponse.content
      : JSON.stringify(optionResponse.content);
    const optionData = JSON.parse(optionContent);
    options = optionData.options;
  }

  // 8. 질문 메시지 생성
  const questionMessage = new AIMessage({
    content: questionData.question
  });

  return {
    messages: [questionMessage],
    currentQuestionCount: currentQuestionCount + 1,
    currentPhase: phase,
    currentDynamicQuestion: {
      question: questionData.question,
      options,
      type: questionData.type,
      context: questionData.context,
      phase
    },
    awaitingAnswer: true
  };
}
```

---

## 핵심 로직 의사코드

### 질문 생성 로직

```
function generateQuestion(state):
  1. 완성도 = checkCompleteness(state.prdData, state.templateLevel)

  2. 단계 = getCurrentPhase(state.currentQuestionCount, state.maxQuestions)
     - 0-30%: initial
     - 30-70%: middle
     - 70-90%: final
     - 90-100%: closing

  3. if 완성도 >= 80% AND 남은질문 <= 3:
       return COMPLETE

  4. 컨텍스트 = analyzeContext(state.prdData, state.answers)
     - product, problem, target, values 추출
     - userMindset 추론

  5. 다음섹션 = getNextSection(완성도리포트, 단계)
     - 단계별 우선순위 고려
     - 미완성 섹션 중 선택

  6. AI에게 요청:
     - 현재 질문/최대 질문
     - 완성도 리포트
     - 컨텍스트
     - 단계별 전략
     → 질문 생성

  7. if 객관식:
       AI에게 선택지 요청:
       - 전문가 관점 (창업자/기획자/투자자)
       - 다양한 전략 축
       - Trade-off 명시
       → 선택지 생성

  8. return 질문 + 선택지
```

### 답변 처리 로직

```
function processAnswer(state, answer):
  1. PRD 업데이트
     - extractPRDData(answer)
     - state.prdData 갱신

  2. 컨텍스트 업데이트
     - analyzeContext() 재실행
     - state.conversationContext 갱신

  3. 완성도 체크
     - checkCompleteness()
     - state.completenessScore 갱신

  4. if 완성도 >= 80% OR currentQuestionCount >= maxQuestions:
       return 최종 PRD 생성
     else:
       return 다음 질문 생성
```

---

## 동작 시나리오

### 시나리오 1: 표준 (30개 질문)

```
[질문 0] 온보딩
AI: "얼마나 디테일하게 기획하고 싶으신가요?"
사용자: "2" (표준, 20-30개)
→ maxQuestions = 30, templateLevel = 'standard'

[질문 1/30] 초반 - 제품 개요
완성도: 0%, 단계: initial
AI: "만들고 싶은 서비스를 한 문장으로 설명해주세요. (1/30)"
사용자: "PT 없이도 AI가 실시간으로 내 운동 자세를 교정해주는 앱"
→ prdData.productOneLine 업데이트

[질문 2/30] 초반 - 문제 정의
완성도: 10%, 단계: initial
컨텍스트: product = "AI 자세 교정 앱"
AI: "좋네요! (2/30) 이 앱이 해결하려는 핵심 문제는 무엇인가요?"
선택지:
  1. [기획자] 기존 서비스가 불편해서
  2. [창업자] 해결책이 아예 없는 문제
  3. [투자자] 기존 솔루션이 너무 비싸서
사용자: "3"

[질문 7/30] 초반 끝 - 타겟 완성
완성도: 30%, 단계: initial → middle
AI: "이제 중요한 비즈니스 모델로 넘어가볼까요? (7/30)"

[질문 15/30] 중반
완성도: 50%, 단계: middle
컨텍스트: {
  product: "AI 자세 교정 앱",
  problem: "PT 너무 비쌈",
  target: "2030 헬스 초보",
  values: ["실시간", "맞춤", "저렴"],
  userMindset: "빠른 성장 중시"
}
AI: "가격 전략을 어떻게 가져갈까요? (15/30)
     타겟이 '월 2만원 이하'를 원하고, 빠른 성장을 목표로 하시는 것 같은데요."
선택지:
  1. [창업자] 파괴적 저가 (4,900원) - 빠른 확산, 리스크: 적자
  2. [기획자] 합리적 중가 (14,900원) - 안정적, 리스크: 차별화
  3. [투자자] 프리미엄 (29,900원) - 높은 LTV, 리스크: 성장 느림
  4. [창업자] 종량제 (회당 500원) - 혁신적, 리스크: 예측 어려움

[질문 28/30] 마무리
완성도: 85%, 단계: closing
남은 질문: 2개
AI: "거의 다 왔어요! (28/30) 마지막으로 예상되는 가장 큰 리스크 2-3가지는?"

[질문 29/30]
완성도: 92%, 남은: 1개
→ 조기 종료 조건 충족 (완성도 >= 80% AND 남은 <= 3)
→ 최종 PRD 생성
```

---

## 구현 체크리스트

### Phase 1: 기반 구조 ✅

- [x] `prd-checklist.ts` 생성
- [ ] `types.ts` 수정
- [ ] `state.ts` 수정

### Phase 2: Utils

- [ ] `utils/contextAnalyzer.ts` 생성
- [ ] `utils/completenessChecker.ts` 생성
- [ ] `utils/phaseManager.ts` 생성

### Phase 3: Prompts

- [ ] `prompts.ts` - DYNAMIC_QUESTION_GENERATION_PROMPT 추가
- [ ] `prompts.ts` - OPTION_GENERATION_PROMPT 추가

### Phase 4: Nodes

- [ ] `nodes/askOnboarding.ts` 생성
- [ ] `nodes/generateQuestion.ts` 생성
- [ ] `nodes/processAnswer.ts` 수정
- [ ] `nodes/updatePRD.ts` 수정 (레벨별 템플릿)
- [ ] `nodes/generateFinalPRD.ts` 수정 (레벨별 PRD)

### Phase 5: Graph

- [ ] `index.ts` 그래프 재구성
  - onboarding → generate_question 플로우
  - process_answer → 완성도 체크 → 분기

### Phase 6: Cleanup

- [ ] `questions.ts` 삭제
- [ ] `askQuestion.ts` 삭제 (generateQuestion으로 대체)

### Phase 7: Testing

- [ ] Simple (10-15개) 시뮬레이션
- [ ] Standard (20-30개) 시뮬레이션
- [ ] Detailed (40-50개) 시뮬레이션
- [ ] 조기 종료 테스트
- [ ] 선택지 품질 테스트

---

## 예상 문제 및 대응

### 1. AI 질문 생성 실패
**대응**: 폴백 질문 준비, 재시도 로직

### 2. 무한 루프
**대응**: maxQuestions 강제 제한, 완성도 체크

### 3. 비용 과다
**대응**: 질문 생성은 haiku, 최종 PRD만 sonnet

### 4. 선택지 품질 낮음
**대응**: Few-shot 예시 추가, 프롬프트 개선

---

## 다음 단계

1. 이 문서 검토
2. 순서대로 구현
3. 각 단계별 테스트
4. 프롬프트 튜닝
5. 사용자 테스트

**작성 완료**
