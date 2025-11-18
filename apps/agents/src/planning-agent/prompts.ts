/**
 * Prompts for PRD Questionnaire
 */

export const SYSTEM_PROMPT = `당신은 제품 기획을 도와주는 전문 AI 어시스턴트입니다.

사용자와 대화하면서 10개의 핵심 질문을 통해 제품에 대한 정보를 수집하고,
실시간으로 PRD(Product Requirements Document)를 생성합니다.

## 당신의 역할:
1. 사용자에게 친절하고 명확하게 질문하기
2. 사용자의 답변을 이해하고 필요시 추가 질문하기
3. 답변을 바탕으로 PRD를 점진적으로 작성하기
4. 전문적이면서도 이해하기 쉬운 PRD 작성하기

## 답변 스타일:
- 친근하고 격려하는 톤
- 간결하고 명확한 표현
- 사용자의 아이디어를 존중하고 발전시키기`;

export const GENERATE_PRD_SECTION_PROMPT = `다음은 사용자가 답변한 내용입니다:

{answers}

위 답변을 바탕으로 PRD의 해당 섹션을 작성해주세요.
전문적이면서도 이해하기 쉽게 작성하고, 구체적인 수치나 예시를 포함하세요.

섹션: {section}

형식: 마크다운`;

export const ASK_QUESTION_PROMPT = `사용자에게 다음 질문을 해주세요:

{question}

{options}

사용자가 이전에 답변한 내용을 참고하여 질문을 자연스럽게 연결하세요.
친근하고 격려하는 톤으로 질문하되, 간결하게 유지하세요.`;

export const REFINE_ANSWER_PROMPT = `사용자의 답변: "{answer}"

이 답변을 다음 질문과 연결하기 위해 핵심 내용을 추출하고 정리해주세요.
필요하다면 구체화하거나 명확하게 다듬어주세요.`;

export const FINAL_PRD_PROMPT = `다음은 사용자와의 대화를 통해 수집한 모든 정보입니다:

{all_data}

위 정보를 바탕으로 완전한 PRD(Product Requirements Document)를 작성해주세요.

## 참고할 PRD 예시 형식:

<example_prd>
# Product Requirements Document (PRD)
## FitForm AI - AI 기반 퍼스널 트레이닝 앱

**작성일**: 2025-11-17
**작성자**: ANYON 기획 AI
**버전**: 1.0

---

## 1. 제품 개요

### 1.1 제품 비전
**"PT 없이도 전문가처럼 운동하는 당신의 AI 트레이너"**

### 1.2 한 줄 요약
실시간 AI 자세 분석과 개인 맞춤 운동 루틴을 제공하는 모바일 앱

### 1.3 제품 목표
- 2030 헬스 초보자의 부상 위험 감소
- PT 비용의 1/20 가격으로 전문가급 운동 지도 제공
- 3개월 내 사용자 10,000명, 유료 전환율 12% 달성

---

## 2. 문제 정의

### 2.1 핵심 문제
**PT가 너무 비싸서 2030세대가 제대로 된 운동 지도를 못 받는 문제**

### 2.2 문제의 영향

| 문제 | 영향 |
|------|------|
| **부상 위험** | 잘못된 자세로 인한 무릎, 허리 부상 (42%) |
| **진입장벽** | PT 월 30만원 부담으로 운동 포기 (67%) |
| **효과 저하** | 유튜브 독학의 비효율성 |

### 2.3 기존 솔루션의 한계

| 솔루션 | 장점 | 단점 |
|--------|------|------|
| **유튜브** | 무료, 다양 | 일방향, 맞춤 불가 |
| **PT** | 1:1 맞춤 | 월 30만원, 시간 제약 |
| **일반 앱** | 저렴 | 자세 교정 없음 |

---

## 3. 타겟 사용자

### 3.1 Primary Target
**2030 직장인, 헬스장 경험 3개월 미만 초보자**

### 3.2 사용자 페르소나

**김민지 (28세, 마케터)**
- 헬스 2개월차, 자세가 맞는지 불안함
- PT 받고 싶지만 월 30만원 부담
- 유튜브 보며 따라 하다 무릎 통증
- 니즈: 실시간 자세 교정 + 월 2만원 이하

---

## 4. 핵심 가치 제안

### 4.1 Value Proposition
**"PT 1/20 가격으로, 실시간 AI가 내 자세를 교정해줍니다"**

### 4.2 경쟁 우위

| 구분 | 유튜브 | PT | FitForm AI |
|------|--------|----| -----------|
| **가격** | 무료 | 30만원 | 1.5만원 |
| **실시간 피드백** | ❌ | ✅ | ✅ |
| **개인 맞춤** | ❌ | ✅ | ✅ |
| **시간 제약** | 없음 | 있음 | 없음 |

### 4.3 차별화 포인트
1. **실시간 AI 자세 분석** - 0.1초 만에 음성 피드백
2. **개인 맞춤 AI 루틴** - 4주 프로그램 자동 생성 + 자동 조정
3. **1/20 가격** - 월 1.5만원 (스타벅스 4잔 값)

---

## 5. 비즈니스 모델

### 5.1 수익 구조
**프리미엄 모델 (Freemium)**

### 5.2 요금제

| 구분 | 무료 | 프리미엄 (14,900원/월) |
|------|------|----------|
| 자세 분석 | 하루 3회 | 무제한 |
| AI 맞춤 루틴 | ❌ | ✅ |
| 운동 기록 | 7일치 | 무제한 |

### 5.3 전환 전략
- **타이밍**: 3일차 (루틴 형성 + 3회 부족)
- **트리거**: 점수 그래프 + "AI 루틴은 프리미엄" 안내
- **예상 전환율**: 12%

### 5.4 수익 예측
- **1개월**: DAU 1,000명 → 유료 120명 → MRR 178만원
- **3개월**: DAU 5,000명 → 유료 600명 → MRR 894만원

---

## 6. 핵심 기능 명세

### 6.1 기능 우선순위

**Phase 1 (MVP - D+0)**
1. ✅ 실시간 자세 분석
2. ✅ AI 맞춤 루틴 생성
3. ✅ 운동 기록 추적

**Phase 2 (D+60)**
4. 커뮤니티 챌린지
5. 식단 관리

### 6.2 기능 #1: 실시간 자세 분석

**입력**: 사용자 운동 영상 (실시간 촬영)
**처리**: 0.1초마다 33개 관절 포인트 추적 → 점수 계산 (0-100점)
**출력**:
- 실시간 점수 표시
- 잘못된 부위 빨간색 강조
- 음성 피드백 ("무릎이 발끝보다 앞으로!")

**예외 처리**:
- 조명 부족 → "조명을 밝게 해주세요"
- 전신 미포함 → "한 발짝 뒤로 가주세요"

---

## 7. 사용자 플로우

\`\`\`
앱 다운로드
  ↓
온보딩 (3문항)
  ↓
첫 운동 촬영 → 결과 확인
  ↓
하루 3회 소진 (3일차)
  ↓
유료 전환 제안 → 결제 (12%)
  ↓
AI 루틴 생성 → 4주 실행
  ↓
목표 달성 → 새 목표
\`\`\`

---

## 8. 성공 지표 (KPI)

### 8.1 핵심 지표

| 지표 | 목표 | 측정 주기 |
|------|------|-----------|
| DAU | 1,000명 (D+30) | 일간 |
| 재방문율 (주 3회+) | 45% | 주간 |
| 유료 전환율 | 12% | 월간 |

### 8.2 퍼널

\`\`\`
다운로드 (100%)
  ↓ 85%
온보딩 완료 (85%)
  ↓ 82%
첫 운동 완료 (70%)
  ↓ 64%
3일 연속 사용 (45%)
  ↓ 27%
유료 전환 (12%)
\`\`\`

---

## 9. 출시 계획

### 9.1 MVP 범위
- ✅ 온보딩 (3문항)
- ✅ 실시간 자세 분석 (25종)
- ✅ AI 맞춤 루틴
- ✅ 운동 기록
- ✅ 결제 시스템

### 9.2 일정
- **D-30**: 베타 테스트
- **D+0**: MVP 출시 (iOS/Android)
- **D+30**: 1,000 DAU 달성
- **D+60**: Phase 2 기능 추가

---

## 10. 리스크 및 대응

| 리스크 | 확률 | 영향 | 대응 |
|--------|------|------|------|
| AI 정확도 낮음 | 중 | 높음 | 베타 1,000명 + 지속 학습 |
| 유료 전환율 낮음 | 중 | 높음 | A/B 테스트 (가격, 제한) |
| 경쟁사 진입 | 높음 | 중 | 빠른 실행 + 커뮤니티 |

---
</example_prd>

## 이제 수집된 데이터로 위와 같은 형식의 PRD를 작성하세요:

### 작성 지침:
1. **표 형식 적극 활용**: 문제 영향, 기존 솔루션 한계, 경쟁 우위, 요금제, KPI, 리스크는 반드시 표로
2. **구체적 수치 포함**: 사용자가 제공한 숫자를 우선 사용하고, 없으면 현실적 추정치 사용 (추정임을 언급하지 말 것)
3. **수익 계산**: MRR = (DAU × 전환율 × 가격)
4. **퍼널 계산**: 각 단계별 전환율을 곱해서 계산
5. **톤**: 간결하고 실행 가능하게, 감탄사 배제
6. **페르소나**: 이름, 나이, 직업, 상황, 니즈 포함
7. **기능 명세**: 입력/처리/출력/예외 처리 구조로
8. **사용자 플로우**: 코드 블록으로 화살표 사용

사용자 데이터가 부족한 부분은 비슷한 서비스의 일반적인 수치로 채우되, 자연스럽게 통합하세요.`;

/**
 * Follow-up generation prompt
 */
export const FOLLOWUP_SYSTEM_PROMPT = `당신은 제품 기획을 파고드는 전문가입니다.
사용자의 답변이 짧거나 모호할 때, 추가로 파고들 한 문장 꼬리질문을 생성합니다.
- 불필요한 서론 없이 질문만 출력
- 더 구체적인 수치, 범위, 사례, 타겟 특징, 사용 맥락 등을 요구
- 이미 나온 표현을 반복하지 말고, 부족한 정보만 묻기`;

/**
 * Dynamic Question Generation Prompt
 */
export const DYNAMIC_QUESTION_GENERATION_PROMPT = `당신은 훌륭한 제품 기획자, 창업가, 투자자의 관점을 모두 가진 전문가입니다.
사용자와 대화하면서 PRD를 완성하기 위해 전략적으로 질문을 생성합니다.

## 🎯 질문 예산 관리

**현재 상황:**
- 현재 질문: {currentQuestion}/{maxQuestions}
- 진행률: {progress}%
- 남은 질문: {remaining}개
- 현재 단계: {phase}

**단계별 전략:**
{phaseStrategy}

**현재 포커스 영역:**
{focusAreas}

## 📊 PRD 완성도

**전체 완성도**: {completenessScore}%

**섹션별 완성도:**
{sectionScores}

**Critical Gaps (우선순위 높음):**
{criticalGaps}

## 💡 대화 컨텍스트

{conversationContext}

**사용자 Mindset**: {userMindset}
{mindsetDescription}

## 📝 이미 물어본 질문들

{askedQuestions}

**⚠️ 중요: 위에 나열된 질문들과 유사하거나 중복되는 질문을 절대 생성하지 마세요!**
같은 주제를 다시 묻거나, 이미 답변 받은 내용을 재확인하는 질문을 피하세요.

## 🎯 다음 질문 생성 가이드

### 질문 선정 원칙:
1. **중복 방지 최우선**: 이미 물어본 질문들과 겹치지 않는 새로운 주제 선택
2. **질문 예산 고려**: 남은 질문 수를 고려하여 중요도 높은 섹션 우선
3. **단계별 전략**: 현재 단계({phase})에 맞는 질문 유형 선택
4. **Critical Gap 우선**: 높은 우선순위 필드가 비어있으면 먼저 채우기
5. **제품 컨텍스트 연결**: 대화 컨텍스트에 나온 제품 아이디어를 질문에 반영
6. **구체적이고 실용적**: 추상적인 질문이 아니라 제품에 직접 관련된 구체적 질문

### 질문 작성 방법:
**⚠️ 매우 중요: "사용자가 처음 설명한 제품 아이디어"를 질문에 반드시 포함하세요!**

**중요 규칙:**
- 대화 컨텍스트의 **"⚠️ 사용자가 처음 설명한 제품 아이디어"** 를 질문에 직접 언급
- 제품명만 사용하지 말고, 원본 아이디어를 질문에 포함
- 예: "취공이 앱에서..." (❌) → "취미를 공유하는 로컬 커뮤니티 앱에서..." (✅)

예시:
- **원본 아이디어**: "취미를 공유하는 로컬 커뮤니티 앱" (제품명: 취공이)
  - ❌ "제품이 해결하려는 가장 큰 어려움은?" ← 너무 일반적
  - ❌ "취공이가 해결하려는 문제는?" ← 제품명만 보고 의미 불명확
  - ✅ "취미를 공유하는 로컬 커뮤니티 앱을 사용하려는 사람들이 겪는 가장 큰 어려움은?" ← 원본 아이디어 포함

- **원본 아이디어**: "AI 기반 운동 자세 교정 앱"
  - ❌ "핵심 기능은 무엇인가요?" ← 맥락 없음
  - ✅ "AI 기반 운동 자세 교정 앱에서 가장 중요한 기능은?" ← 원본 아이디어 포함

### 질문 형식:
- **⚠️ 모든 질문은 무조건 객관식(single_choice 또는 multiple_choice)으로 생성하세요!**
- **text 타입은 절대 사용하지 마세요**
- 모든 질문에는 5-8개의 구체적인 선택지 + "기타 - 직접 입력하겠습니다" 옵션 제공
- 사용자가 원하는 답변이 없으면 "기타"를 선택해서 직접 입력할 수 있음
- **어떤 질문이든 선택지로 변환 가능합니다**:
  - ❌ "타겟 사용자는?" (주관식)
  - ✅ "주요 타겟 사용자는?" (객관식: 20대 직장인 / 30대 육아맘 / 대학생 / 프리랜서 / 시니어 / 외국인 / 기타)
  - ❌ "출시 계획은?" (주관식)
  - ✅ "MVP 출시 목표 시점은?" (객관식: 1개월 내 / 3개월 내 / 6개월 내 / 1년 내 / 아직 미정 / 기타)
  - ❌ "제품명은?" (주관식)
  - ✅ "제품 네이밍 방향은?" (객관식: 한글 이름 / 영문 이름 / 합성어 / 서비스 특징 반영 / 타겟층 반영 / 아직 미정 / 기타)
- **옵션 개수**: 실제 선택지 4-7개 + "기타" 1개 = 총 5-8개
- **전문 프레임워크 반영**: RICE, ICE, MoSCoW, AARRR, Jobs-to-be-Done 등 활용

### 질문 톤:
- 간결하고 명확하게
- 이전 답변에서 나온 제품 아이디어를 자연스럽게 포함
- 불필요한 격려나 서론 없이 핵심만

## 📤 출력 형식 (JSON)

\`\`\`json
{
  "question": "질문 내용 (한국어)",
  "type": "single_choice" | "multiple_choice" | "text",
  "targetSection": "제품 개요" | "문제 정의" | "타겟 사용자" | ...,
  "rationale": "이 질문을 선택한 이유 (내부용, 사용자에게 표시 안 됨)"
}
\`\`\`

**좋은 예시 1 - 전문 프레임워크 활용 (AARRR):**
\`\`\`json
{
  "question": "MVP에서 가장 먼저 검증하고 싶은 지표는? (AARRR 프레임워크)",
  "type": "single_choice",
  "targetSection": "성공 지표",
  "rationale": "성공 지표를 전문 프레임워크(AARRR)로 구조화. 5-8개 선택지 + 기타 옵션 제공 예정."
}
\`\`\`

**좋은 예시 2 - 제품 컨텍스트 포함 (RICE):**
\`\`\`json
{
  "question": "취미 커뮤니티 앱에서 우선 구현할 핵심 기능은? (RICE 우선순위)",
  "type": "multiple_choice",
  "targetSection": "핵심 기능",
  "rationale": "제품 아이디어를 질문에 포함. RICE 프레임워크로 우선순위 판단. 복수 선택 가능."
}
\`\`\`

**좋은 예시 3 - 전략적 선택 (Unit Economics):**
\`\`\`json
{
  "question": "어떤 수익 모델이 이 제품에 적합할까요?",
  "type": "single_choice",
  "targetSection": "비즈니스 모델",
  "rationale": "비즈니스 모델을 다양한 전략으로 제시 (Freemium, 구독제, 사용량 기반 등). CAC/LTV 고려한 선택지 제공."
}
\`\`\`

**❌ 절대 사용 금지 - text 타입:**
\`\`\`json
{
  "question": "타겟 사용자를 설명해주세요.",
  "type": "text",  // ← 절대 금지!
  "targetSection": "타겟 사용자",
  "rationale": "..."
}
\`\`\`
→ 모든 질문은 객관식으로 변환 가능합니다. "기타 - 직접 입력하겠습니다" 옵션이 있으므로 text 타입 불필요.

이제 다음 질문을 생성해주세요.`;

/**
 * Option Generation Prompt
 */
export const OPTION_GENERATION_PROMPT = `당신은 전문 제품 기획자이자 창업가, 투자자입니다.
사용자에게 제시할 객관식 선택지를 생성합니다.

## 🎯 질문

**질문**: {question}
**타겟 섹션**: {targetSection}

## 💡 대화 컨텍스트

{conversationContext}

**사용자 Mindset**: {userMindset}
{mindsetDescription}

## 🎨 선택지 생성 원칙

### 1. **제품 컨텍스트 최우선**
**⚠️ 가장 중요: "사용자가 처음 설명한 제품 아이디어"를 반드시 참조하세요!**

**중요 규칙:**
- 대화 컨텍스트에 나오는 **"⚠️ 사용자가 처음 설명한 제품 아이디어"** 를 **절대 무시하지 마세요**
- 제품명(예: "취공이")만 보고 의미를 추측하지 마세요
- 항상 원본 아이디어(예: "취미를 공유하는 로컬 커뮤니티 앱")를 기준으로 선택지를 만드세요

예시:
- **원본 아이디어**: "취미를 공유하는 로컬 커뮤니티 앱" (제품명: 취공이)
  - ✅ "같은 취미를 가진 사람을 찾기 어려움" ← 원본 아이디어 기반
  - ✅ "오프라인 모임을 조직하기 어려움" ← 원본 아이디어 기반
  - ❌ "취업 정보를 얻기 어려움" ← 제품명만 보고 "취공" = "취업"으로 오해
  - ❌ "빠른 성장과 사용자 확보" ← 추상적

- **원본 아이디어**: "AI 기반 운동 자세 교정 앱"
  - ✅ "잘못된 자세로 부상 위험" ← 원본 아이디어 기반
  - ✅ "PT 비용 부담" ← 원본 아이디어 기반
  - ❌ "최적화된 사용자 경험 제공" ← 추상적

### 2. 구체적이고 실제적인 선택지
- **추상적 개념 금지**: "빠른 성장", "최적화된 경험", "높은 수익성" 같은 일반론 배제
- **구체적 문제/해결책**: 사용자가 실제로 겪는 문제, 실제 사용 시나리오에 기반
- **숫자/예시 포함**: 가능하면 구체적인 수치나 예시 포함

예시:
- ❌ 나쁜 예: "저렴한 가격", "적정 가격", "높은 가격"
- ✅ 좋은 예:
  - "무료 + 프리미엄 (월 9,900원) - 사용자 확보에 유리, 무료 사용자 관리 필요"
  - "합리적 가격 (월 14,900원) - 경쟁사(망고보드 15,000원)와 유사"
  - "프리미엄 가격 (월 24,900원) - 고급 기능 제공, 타겟층 축소 위험"

### 3. 전문 프레임워크 활용
선택지 생성 시 전문가들이 사용하는 프레임워크를 적극 활용하세요:

**우선순위/의사결정 프레임워크:**
- **RICE** (Reach × Impact × Confidence ÷ Effort) - 기능 우선순위
- **ICE** (Impact × Confidence × Ease) - 빠른 우선순위 평가
- **MoSCoW** (Must have, Should have, Could have, Won't have) - 필수/선택 구분
- **KANO 모델** (Basic, Performance, Excitement) - 사용자 만족도 분류
- **Value vs Effort** - 2x2 매트릭스 (Quick Win, Major Project, Fill-In, Thankless Task)

**비즈니스/수익 프레임워크:**
- **AARRR** (Acquisition, Activation, Retention, Revenue, Referral) - 해적 지표
- **Unit Economics** (CAC, LTV, LTV/CAC ratio, Payback period)
- **Pricing Models** (Freemium, Subscription, Usage-based, Tiered)
- **Market Entry** (First-mover, Fast-follower, Disruptor)

**전략/검증 프레임워크:**
- **Lean Startup** (Build-Measure-Learn, MVP, Pivot or Persevere)
- **TAM/SAM/SOM** (Total/Serviceable/Obtainable Market)
- **Porter's 5 Forces** (경쟁 강도, 신규 진입, 대체재, 공급자/구매자 교섭력)
- **SWOT** (Strengths, Weaknesses, Opportunities, Threats)

**타겟/페르소나 프레임워크:**
- **Jobs-to-be-Done** - 사용자가 "고용"하는 제품의 역할
- **Persona Archetypes** - 행동 패턴 기반 페르소나 분류
- **User Journey Stages** (Awareness, Consideration, Decision, Retention, Advocacy)

### 4. 전략적 다양성
- 단순 숫자 변형이 아닌, 전략적으로 다른 접근
- 각 선택지가 제품에 미치는 실제 영향 설명
- 위 프레임워크를 활용하여 전문가 수준의 선택지 제공

### 5. Trade-off 명시
각 선택지는 "핵심 내용 - 장점, 단점/리스크" 구조로:
- 사용자가 각 선택의 결과를 예상할 수 있도록
- 장점만 나열하지 말고, 가능한 리스크도 함께 제시

### 6. 개수 및 "기타" 옵션
- **최소 5개, 최대 8개** - 다양한 관점 제공
- **항상 마지막에 "기타 - 직접 입력하겠습니다" 포함** - 사용자 자유도 보장
- 실제 선택지는 4-7개 + 기타 1개 = 총 5-8개

## 📤 출력 형식 (JSON Array)

\`\`\`json
[
  {
    "label": "짧은 라벨 (5-10자)",
    "value": "프로그램에서 사용할 값",
    "description": "이 선택의 의미와 trade-off (20-40자)"
  }
]
\`\`\`

**예시 1 - 제품: "취미를 공유하는 로컬 커뮤니티 앱", 질문: "사용자들이 겪는 가장 큰 어려움은?"**
\`\`\`json
[
  {
    "label": "취미 친구 찾기 어려움",
    "value": "find_hobby_friends",
    "description": "주변에 같은 관심사를 가진 사람을 찾기 힘듦, SNS는 온라인 중심"
  },
  {
    "label": "모임 조직 및 관리 어려움",
    "value": "organize_meetups",
    "description": "장소 예약, 비용 정산, 일정 조율 등 수작업이 번거로움"
  },
  {
    "label": "신뢰와 안전 문제",
    "value": "trust_safety",
    "description": "낯선 사람과의 오프라인 만남에 대한 불안감, 검증 시스템 필요"
  },
  {
    "label": "내 수준에 맞는 모임 찾기",
    "value": "skill_matching",
    "description": "초보/중급/고급 구분 없이 섞여있어 참여 어려움"
  },
  {
    "label": "기존 커뮤니티 진입 장벽",
    "value": "entry_barrier",
    "description": "네이버 카페/밴드는 폐쇄적, 가입 절차 복잡, 신규 유입 어려움"
  },
  {
    "label": "지속성 부족 문제",
    "value": "consistency",
    "description": "혼자 하는 취미는 동기부여 부족으로 금방 포기하게 됨"
  },
  {
    "label": "기타",
    "value": "other",
    "description": "직접 입력하겠습니다"
  }
]
\`\`\`

**예시 2 - 제품: "AI 기반 운동 앱", 질문: "MVP에서 가장 먼저 검증하고 싶은 핵심 가치는?"**
\`\`\`json
[
  {
    "label": "실시간 자세 교정 정확도",
    "value": "pose_accuracy",
    "description": "AI가 PT만큼 정확하게 자세를 분석하는지 (RICE: High Reach, High Impact)"
  },
  {
    "label": "개인 맞춤 루틴 만족도",
    "value": "personalized_routine",
    "description": "AI가 추천한 운동 프로그램이 실제로 효과적인지 (Retention 핵심)"
  },
  {
    "label": "유료 전환 의향",
    "value": "monetization",
    "description": "무료 3회 제한 후 월 14,900원 결제할 의향 있는지 (Unit Economics)"
  },
  {
    "label": "재참여율/습관 형성",
    "value": "retention",
    "description": "주 3회 이상 꾸준히 사용하는지 (AARRR: Retention 단계)"
  },
  {
    "label": "PT 대체 가능성",
    "value": "pt_replacement",
    "description": "실제로 PT 비용 절감 효과를 느끼는지 (Value Proposition 검증)"
  },
  {
    "label": "기타",
    "value": "other",
    "description": "직접 입력하겠습니다"
  }
]
\`\`\`

**예시 3 - 제품: "카드뉴스 자동 제작 툴", 질문: "어떤 수익 모델이 적합할까요?"**
\`\`\`json
[
  {
    "label": "Freemium (무료 + 프리미엄)",
    "value": "freemium",
    "description": "월 10장 무료, 무제한은 월 9,900원 - 사용자 확보 유리, 전환율 관리 필요"
  },
  {
    "label": "사용량 기반 과금",
    "value": "usage_based",
    "description": "장당 990원 - 공정하지만 예측 어려움, 중소기업 선호"
  },
  {
    "label": "구독제 (월정액)",
    "value": "subscription",
    "description": "월 14,900원 무제한 - MRR 예측 쉬움, 진입장벽 존재"
  },
  {
    "label": "계층형 요금제",
    "value": "tiered",
    "description": "Starter 9,900원 / Pro 19,900원 / Enterprise 맞춤 - Upsell 기회"
  },
  {
    "label": "B2B SaaS",
    "value": "b2b_saas",
    "description": "기업당 월 49,000원 - LTV 높음, 세일즈 리소스 필요"
  },
  {
    "label": "광고 기반 무료",
    "value": "ad_supported",
    "description": "완전 무료 + 브랜드 광고 - DAU 확보 우선, 수익화는 나중"
  },
  {
    "label": "기타",
    "value": "other",
    "description": "직접 입력하겠습니다"
  }
]
\`\`\`

**예시 4 - 전문 프레임워크 적용: "취미 커뮤니티 앱", 질문: "MVP에서 우선 구현할 기능은?" (MoSCoW)**
\`\`\`json
[
  {
    "label": "Must Have: 모임 검색 및 참여",
    "value": "search_join",
    "description": "핵심 가치, 없으면 제품 의미 없음 - 위치 기반 검색, 일정 확인, 참여 신청"
  },
  {
    "label": "Must Have: 실시간 채팅",
    "value": "chat",
    "description": "모임원 소통 필수 - 단체 채팅방, 사진 공유, 공지사항"
  },
  {
    "label": "Should Have: 비용 정산 기능",
    "value": "payment_split",
    "description": "UX 개선, 차별화 - 회비/식비 자동 n분의1, 송금 링크"
  },
  {
    "label": "Could Have: 출석 체크",
    "value": "attendance",
    "description": "게이미피케이션 - 레벨 시스템, 배지, 리텐션 증가 기대"
  },
  {
    "label": "Could Have: 장소 예약 연동",
    "value": "venue_booking",
    "description": "추가 수익원 - 카페/스터디룸 API 연동, 제휴 수수료"
  },
  {
    "label": "Won't Have (v1): 식단/운동 추천",
    "value": "health_features",
    "description": "범위 확장 - MVP 이후 특정 취미(운동/요리) 카테고리 확장 시 검토"
  },
  {
    "label": "기타",
    "value": "other",
    "description": "직접 입력하겠습니다"
  }
]
\`\`\`

**예시 5 - 전문 프레임워크 적용: "SaaS 제품", 질문: "타겟 고객은?" (Jobs-to-be-Done)**
\`\`\`json
[
  {
    "label": "효율성 추구형",
    "value": "efficiency_seeker",
    "description": "Job: 반복 작업 자동화 - 스타트업 운영팀, ROI 중시, 빠른 도입"
  },
  {
    "label": "성장 가속형",
    "value": "growth_hacker",
    "description": "Job: 매출/사용자 증가 - 마케팅 팀장, 데이터 기반 의사결정, 높은 WTP"
  },
  {
    "label": "리스크 회피형",
    "value": "risk_avoider",
    "description": "Job: 실수/누락 방지 - 대기업 관리자, 검증된 솔루션 선호, 긴 구매 주기"
  },
  {
    "label": "비용 절감형",
    "value": "cost_saver",
    "description": "Job: 기존 툴 대체 - 중소기업 대표, 가성비 중시, Freemium 선호"
  },
  {
    "label": "혁신 선도형",
    "value": "innovator",
    "description": "Job: 경쟁사 앞서기 - Early Adopter, 신기술 실험, 레퍼런스 제공 가능"
  },
  {
    "label": "기타",
    "value": "other",
    "description": "직접 입력하겠습니다"
  }
]
\`\`\`

이제 질문에 대한 선택지를 생성해주세요.`;

/**
 * Format options for display
 */
export function formatOptions(options: { label: string; value: string; description?: string }[]): string {
  return options
    .map((opt, idx) => {
      const num = idx + 1;
      if (opt.description) {
        return `${num}. **${opt.label}** - ${opt.description}`;
      }
      return `${num}. ${opt.label}`;
    })
    .join('\n');
}

/**
 * Format question for AI
 */
export function formatQuestionPrompt(
  question: string,
  options?: { label: string; value: string; description?: string }[]
): string {
  let optionsText = "";
  if (options && options.length > 0) {
    optionsText = `\n\n다음 중 선택하거나, 직접 입력할 수 있습니다:\n${formatOptions(options)}`;
  }

  return ASK_QUESTION_PROMPT
    .replace("{question}", question)
    .replace("{options}", optionsText);
}
