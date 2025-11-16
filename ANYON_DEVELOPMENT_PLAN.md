# Anyon 개발 계획서

> AI와의 대화형 인터랙션을 통해 PRD와 사용자 시나리오를 자동 생성하는 개발 기획 도구

**작성일**: 2025-01-16
**프로젝트 코드명**: Anyon
**기반 프로젝트**: Open Canvas

---

## 📋 목차

1. [프로젝트 개요](#-프로젝트-개요)
2. [제품 기획 요약](#-제품-기획-요약)
3. [시스템 아키텍처](#-시스템-아키텍처)
4. [디렉토리 구조 설계](#-디렉토리-구조-설계)
5. [Phase별 개발 로드맵](#-phase별-개발-로드맵)
6. [핵심 기술 구현 상세](#-핵심-기술-구현-상세)
7. [데이터베이스 스키마 설계](#-데이터베이스-스키마-설계)
8. [UI/UX 플로우 상세](#-uiux-플로우-상세)
9. [테스트 전략](#-테스트-전략)
10. [배포 전략](#-배포-전략)
11. [예상 비용 분석](#-예상-비용-분석)
12. [리스크 관리](#-리스크-관리)
13. [다음 단계](#-다음-단계-action-items)

---

## 🎯 프로젝트 개요

### 목표
Open Canvas 코드베이스를 활용하여 **AI 기반 PRD/사용자 시나리오 자동 생성 도구** 개발

### 기존 자산 활용도
- ✅ 전체 UI 프레임워크 (좌측 채팅 + 우측 캔버스)
- ✅ LangGraph 기반 AI 에이전트 시스템
- ✅ 실시간 문서 생성 및 렌더링 로직
- ✅ 인증 및 사용자 관리 (Supabase)
- ✅ 탭 기반 멀티 문서 관리

### 핵심 가치 제안
비개발자(vibe coder)들이 막연한 아이디어를 **30분 내에 체계적인 PRD**로 전환

---

## 📝 제품 기획 요약

### 1. 해결하려는 문제

**페인포인트**:
- 막연한 아이디어를 구조화된 기획서로 만드는 방법을 모름
- PRD 작성 경험이 없어 어떤 항목을 채워야 할지 혼란스러움
- 기획서 작성에만 수 시간~수 일 소요되어 실제 개발 진입이 늦어짐

**현재 해결 방식의 한계**:
- 노션/구글독스 템플릿: 빈 템플릿만 제공, 작성 가이드 부족
- AI 챗봇 직접 질문: 구조화되지 않은 대화, 최종 문서화는 수동
- 컨설턴트 상담: 비용과 시간 소요

### 2. 타겟 사용자

**Primary**: AI 네이티브 비개발자 (Vibe Coders)
- Claude, ChatGPT 등 AI 도구 사용 경험 보유
- 서비스 아이디어는 있으나 개발 지식 부족
- PRD, 사용자 시나리오 등 기획 문서 작성 경험 없음
- 빠른 실행력을 원하지만 체계적 준비 필요성 인지

**Secondary** (향후 확장):
- 주니어 PM: 체계적인 PRD 작성법 학습
- 스타트업 파운더: 빠른 아이디어 검증
- 기획 입문자: 실전 기획 연습

### 3. 핵심 기능

#### Must-have (P0)
1. **AI 기반 대화형 기획 가이드** (좌측 채팅)
   - 구조화된 질문 흐름(Q0→Q1→Q2...)으로 유도
   - 이전 답변 기반 다음 질문 자동 생성
   - 꼬리질문으로 세부 사항 구체화

2. **실시간 PRD 자동 생성** (우측 캔버스)
   - 좌측 대화 내용이 실시간으로 우측 PRD 문서에 반영
   - 9개 표준 섹션 (제품 개요, 문제/솔루션, 타겟, 핵심 기능, 시나리오, 성공 기준, 리스크, 미결정 사항, MVP)
   - 실시간 미리보기 및 편집 가능

3. **멀티탭 문서 관리**
   - 탭 1: PRD (기본)
   - 탭 2: 사용자 시나리오 (PRD 완성 후 자동 생성 시작)
   - 탭 간 자유로운 이동 및 독립적 편집

#### Should-have (P1)
4. **사용자 시나리오 자동 생성**
5. **컨텍스트 기반 질문 최적화**
6. **문서 내보내기** (Markdown, PDF, Notion)

#### Nice-to-have (P2)
- 과거 작성 PRD 라이브러리 및 재사용
- 팀 협업 (여러 명이 동시 편집)
- 산업별 PRD 템플릿 (핀테크, 헬스케어 등)

### 4. 성공 지표

**정량 지표**:
- PRD 완성률: 시작한 사용자의 **80% 이상**이 전체 섹션 완성
- 작성 시간: 평균 PRD 작성 시간 **30분 이내** (기존 2-4시간 대비)
- 재방문율: 1주일 내 재방문 **50% 이상**

**정성 지표**:
- "혼자 썼을 때보다 훨씬 체계적이고 놓친 부분이 없다"
- "작성한 PRD를 실제로 개발자/팀원에게 공유했다" 70% 이상
- NPS: 60 이상

---

## 🏗️ 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    Anyon Platform                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend (Next.js 14)          Backend (LangGraph)          │
│  ┌──────────────────────┐      ┌─────────────────────┐      │
│  │ Chat Interface       │◄─────┤ Planning Agent      │      │
│  │ (기존 재사용)         │      │ (신규 개발)          │      │
│  │                      │      │                     │      │
│  │ - Message Input      │      │ - Q0-Q30 Flow       │      │
│  │ - AI Response        │      │ - Context Analysis  │      │
│  │ - Question Display   │      │ - Smart Questioning │      │
│  └──────────────────────┘      └─────────────────────┘      │
│                                                               │
│  ┌──────────────────────┐      ┌─────────────────────┐      │
│  │ Document Canvas      │◄─────┤ Document Generator  │      │
│  │ (수정 필요)           │      │ (신규 개발)          │      │
│  │                      │      │                     │      │
│  │ - PRD Tab            │      │ - PRD Builder       │      │
│  │ - Scenario Tab       │      │ - Scenario Builder  │      │
│  │ - Multi-tab Manager  │      │ - Section Parser    │      │
│  └──────────────────────┘      └─────────────────────┘      │
│                                                               │
│  ┌──────────────────────┐      ┌─────────────────────┐      │
│  │ Shared Components    │      │ Memory Store        │      │
│  │ (기존 활용)           │      │ (기존 활용)          │      │
│  │                      │      │                     │      │
│  │ - MD Editor          │      │ - User Context      │      │
│  │ - Export Functions   │      │ - Project History   │      │
│  └──────────────────────┘      └─────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

**기술 스택**:
- **Frontend**: Next.js 14, React 18, TypeScript
- **UI**: Radix UI, Tailwind CSS, Framer Motion
- **Editor**: @uiw/react-md-editor, CodeMirror
- **State**: Zustand
- **Backend**: LangGraph, LangChain
- **AI**: Anthropic Claude, OpenAI GPT
- **Auth/DB**: Supabase
- **Observability**: LangSmith

---

## 📂 디렉토리 구조 설계

```
open-canvas/
├── apps/
│   ├── web/
│   │   └── src/
│   │       ├── components/
│   │       │   ├── chat-interface/          # 기존 재사용
│   │       │   │   ├── composer.tsx
│   │       │   │   ├── thread.tsx
│   │       │   │   └── message.tsx
│   │       │   │
│   │       │   ├── artifacts/                # 수정 필요
│   │       │   │   ├── prd-canvas.tsx        # 🆕 PRD 전용 캔버스
│   │       │   │   ├── scenario-canvas.tsx   # 🆕 시나리오 전용 캔버스
│   │       │   │   └── tab-manager.tsx       # 기존 수정
│   │       │   │
│   │       │   ├── planning/                 # 🆕 신규 디렉토리
│   │       │   │   ├── question-display.tsx  # 질문 UI (객관식/주관식)
│   │       │   │   ├── progress-tracker.tsx  # Q1/30 진행률 표시
│   │       │   │   └── section-indicator.tsx # 현재 작성 중인 섹션 표시
│   │       │   │
│   │       │   └── export/                   # 🆕 신규 디렉토리
│   │       │       ├── markdown-exporter.tsx
│   │       │       ├── pdf-exporter.tsx
│   │       │       └── notion-exporter.tsx
│   │       │
│   │       ├── hooks/
│   │       │   ├── usePlanningAgent.ts       # 🆕 Planning Agent 통신
│   │       │   ├── useDocumentSync.ts        # 🆕 실시간 문서 동기화
│   │       │   └── useQuestionFlow.ts        # 🆕 질문 흐름 관리
│   │       │
│   │       └── lib/
│   │           ├── document-builders/        # 🆕 신규 디렉토리
│   │           │   ├── prd-builder.ts        # PRD 섹션 생성 로직
│   │           │   └── scenario-builder.ts   # 시나리오 섹션 생성 로직
│   │           │
│   │           └── templates/                # 🆕 신규 디렉토리
│   │               ├── prd-template.ts       # 9개 섹션 템플릿
│   │               └── scenario-template.ts  # 4개 섹션 템플릿
│   │
│   └── agents/
│       └── src/
│           ├── planning-agent/               # 🆕 신규 디렉토리
│           │   ├── graph.ts                  # LangGraph 정의
│           │   ├── nodes/
│           │   │   ├── question-generator.ts # 맥락 기반 질문 생성
│           │   │   ├── answer-processor.ts   # 답변 분석
│           │   │   └── document-updater.ts   # 문서 업데이트 로직
│           │   │
│           │   ├── prompts/
│           │   │   ├── prd-questions.ts      # Q0-Q5 질문 프롬프트
│           │   │   └── scenario-questions.ts # Q1-Q30 질문 프롬프트
│           │   │
│           │   └── state.ts                  # Agent 상태 정의
│           │
│           └── utils/
│               └── question-engine.ts        # 🆕 질문 생성 엔진
│
└── packages/
    └── shared/
        └── src/
            ├── types/
            │   ├── prd.ts                    # 🆕 PRD 타입 정의
            │   ├── scenario.ts               # 🆕 시나리오 타입 정의
            │   └── question.ts               # 🆕 질문/답변 타입
            │
            └── constants/
                └── planning.ts               # 🆕 기획 관련 상수
```

**범례**:
- 기존 재사용: 코드 수정 없이 그대로 사용
- 수정 필요: 기존 컴포넌트를 Anyon 요구사항에 맞게 수정
- 🆕 신규: 새로 개발해야 하는 파일/디렉토리

---

## 🎯 Phase별 개발 로드맵

### 개선된 계획 요약 (2025-01 업데이트)
- **기존 자산 우선 재사용**: Open Canvas의 `artifacts` 렌더 체계, Zustand 상태, Supabase 인증/저장 흐름을 가능한 한 확장 방식으로 사용하고, 새 컴포넌트는 기존 디렉터리 구조 안에 통합한다. 대규모 신규 디렉터리 생성은 후순위로 밀어 통합 비용을 줄인다.
- **명확한 API 계약**: LangGraph ↔ Next.js 간 최소 REST+SSE 계약을 Phase 1 산출물로 정의/구현한다. 실패/재시도/토큰 전달 규칙을 문서화한다.
- **RLS 완비**: Supabase 테이블 전반(`projects`, `prd_documents`, `scenario_documents`, `conversation_history`, `analytics_events`)에 대한 SELECT/INSERT/UPDATE 정책을 완비하고 마이그레이션 스크립트를 포함한다.
- **테스트 스코프 축소·집중**: CI에서 즉시 돌릴 수 있는 단위 테스트 3종(질문 생성 노드, PRD 빌더 완료율, SSE 수신 상태 업데이트)과 1개 짧은 Playwright 시나리오(로그인+PRD 섹션 1개 채우기)만을 Phase 1 목표로 한다.
- **일정 현실화**: Phase 1을 “텍스트 기반 PRD MVP”로 축소(약 2주), Phase 2에서 시나리오/내보내기/멀티탭 확장, Phase 3에서 라이브러리/고급 기능·최적화로 이동한다.

### Phase 1: MVP Core (2-3주) ✅ Must-have

**목표**: 기본 PRD 작성 플로우 완성 (텍스트 기반 MVP, 기존 컴포넌트 확장 중심)

#### 1.1 Planning Agent 개발 (1주)
- [ ] LangGraph 기반 Planning Agent 구조 설계 (기존 `open-canvas` 그래프 패턴 재사용)
- [ ] Q0-Q5 질문 생성 프롬프트 작성 및 단위 테스트 추가
- [ ] 답변 기반 다음 질문 생성 로직 (컨텍스트 병합 규칙 명시)
- [ ] 9개 PRD 섹션 매핑 로직 (텍스트 기반으로 최소 섹션 5개 채우기)

**핵심 파일**:
```typescript
// apps/agents/src/planning-agent/state.ts
interface PlanningState {
  currentQuestion: number;        // Q0, Q1, Q2...
  currentSection: PRDSection;     // "제품 개요", "문제/솔루션" 등
  conversationHistory: Message[];
  userAnswers: Record<string, string>;
  generatedPRD: PRDDocument;
  context: {
    projectType?: string;         // "모바일 앱", "웹 서비스" 등
    targetUser?: string;
    keyFeatures?: string[];
  };
}
```

#### 1.2 Frontend - Chat Interface 커스터마이징 (3일)
- [ ] 기존 `apps/web/src/components/chat-interface/*` 확장: 질문 표시 레이아웃/진행률 배지 추가
- [ ] 객관식/주관식 입력 컴포넌트 (기존 message composer 패턴 재사용)
- [ ] 진행률 표시 (Q1/5, Section 1/9)
- [ ] "건너뛰기", "이전 질문" 버튼

**컴포넌트 인터페이스**:
```tsx
interface QuestionProps {
  question: string;
  type: 'multiple_choice' | 'text';
  options?: string[];
  onAnswer: (answer: string) => void;
  currentStep: number;
  totalSteps: number;
}
```

#### 1.3 Frontend - PRD Canvas 개발 (4일)
- [ ] 기존 `apps/web/src/components/artifacts/*` 렌더러 확장: PRD 전용 뷰 추가(텍스트 우선)
- [ ] 9개 섹션 템플릿 (`packages/shared/src/templates/prd-template.ts`)
- [ ] 실시간 섹션 업데이트 로직 (SSE 수신 → Zustand 스토어 업데이트)
- [ ] 마크다운 렌더링 (@uiw/react-md-editor 활용, PDF/Notion 내보내기는 Phase 2로 이관)

**PRD 데이터 타입**:
```typescript
// packages/shared/src/types/prd.ts
interface PRDDocument {
  metadata: {
    projectName: string;
    createdAt: Date;
    updatedAt: Date;
  };
  sections: {
    overview: string;           // 1. 제품 개요
    problem: string;            // 2. 해결하려는 문제
    target: string;             // 3. 타겟 사용자
    features: string;           // 4. 핵심 기능
    scenarios: string;          // 5. 사용자 시나리오
    success: string;            // 6. 성공 기준
    risks: string;              // 7. 리스크
    openQuestions: string;      // 8. 미결정 사항
    mvp: string;                // 9. MVP 범위
  };
  completionRate: number;       // 0-100%
}
```

#### 1.4 Backend-Frontend 연동 (2일)
- [ ] Planning Agent API 엔드포인트 (POST /api/planning/session, SSE /api/planning/stream)
- [ ] 실시간 스트리밍 응답 (Server-Sent Events) - 중단 시 재연결/lastEventId 처리 포함
- [ ] 문서 자동 저장 (Supabase Upsert; 인증 토큰 전달 규칙 명시)
- [ ] 계약서 작성: 요청/응답 JSON 스키마, 에러 코드 테이블

#### 1.5 기본 내보내기 기능 (1일)
- [ ] Markdown 다운로드
- [ ] 복사하기 버튼

**Phase 1 완료 기준**:
- ✅ 사용자가 Q0-Q5까지 답변하여 PRD 9개 섹션 중 최소 5개 텍스트 작성
- ✅ 30분 내 기본 PRD 초안 생성 가능 (SSE/자동저장 동작 확인)
- ✅ Markdown 내보내기 성공
- ✅ API 계약/인증/RLS 정책 문서화 및 테스트 통과

### Phase 1 API 계약 (MVP)
- **POST /api/planning/session**: `{ projectId, messages[] }` → `{ sessionId, nextQuestion, options?, targetSection }`
- **SSE /api/planning/stream?sessionId=**: 이벤트 `"question"`, `"documentUpdate"`, `"error"`, `"done"`; `lastEventId` 지원, 서버는 30초마다 heartbeat.
- **에러 코드**: `400` 잘못된 입력, `401` 인증 실패(쿠키/헤더 토큰 필요), `429` 호출 한도, `500` 내부 오류. SSE 에러 시 3초 지수백오프로 재연결.
- **인증**: Next.js API Routes에서 Supabase 세션 검증 → LangGraph 호출 시 `Authorization: Bearer <supabase_jwt>` 전달. 익명 세션 불가.

### 기존 구조 통합 가이드 (MVP)
- **프런트 아티팩트 뷰**: `apps/web/src/components/artifacts/ArtifactRenderer.tsx` 확장해 PRD 뷰 등록. PRD 상태는 기존 Zustand 스토어(artifacts 상태) 안에 `prdDocument` 필드로 병합.
- **채팅 인터페이스**: `apps/web/src/components/chat-interface/` 내 message/composer를 확장해 질문 표시·진행률 UI 추가. 새 디렉터리 추가는 후순위, 기존 파일 우선 패치.
- **백엔드 그래프**: `apps/agents/src` 내 기존 그래프 패턴을 복제해 `planning-agent/graph.ts` 추가. 공용 유틸은 `apps/agents/src/utils.ts` 재사용.
- **템플릿/타입**: `packages/shared/src/types/prd.ts`, `templates/prd-template.ts` 새로 추가하되, 다른 타입 경로와 일관되게 exports.

---

### Phase 2: Enhanced Experience (2주) 🔄 Should-have

**목표**: 사용자 시나리오 자동 생성 + UX 개선

#### 2.1 사용자 시나리오 Agent 개발 (4일)
- [ ] Q1-Q30 질문 프롬프트 작성 (4개 섹션별)
- [ ] 맥락 기반 객관식 옵션 자동 생성 엔진
- [ ] PRD 내용 기반 시나리오 질문 커스터마이징

**시나리오 질문 구조**:
```typescript
// apps/agents/src/planning-agent/prompts/scenario-questions.ts
const SECTION_1_PROMPTS = {
  Q1: {
    question: "앱 첫 실행 화면에 무엇을 보여줄까요?",
    optionGenerator: (context: PRDContext) => {
      // PRD의 핵심 기능 기반 동적 옵션 생성
      const options = ["로그인/회원가입", "서비스 소개 슬라이드"];
      if (context.features.includes("설문")) {
        options.push("간단한 온보딩 설문");
      }
      return options;
    }
  },
  // Q2-Q5...
};
```

#### 2.2 Scenario Canvas 개발 (3일)
- [ ] 시나리오 전용 캔버스 컴포넌트
- [ ] 4개 섹션 템플릿 (온보딩, 핵심 기능, 수익화, 리텐션)
- [ ] 섹션별 진행률 표시

#### 2.3 멀티탭 관리 강화 (2일)
- [ ] 탭 전환 애니메이션
- [ ] 탭별 독립적인 편집/저장
- [ ] "PRD → 시나리오" 자동 전환 제안

#### 2.4 컨텍스트 기반 질문 최적화 (3일)
- [ ] 키워드 분석 엔진 (예: "촬영" → 카메라 권한 질문)
- [ ] 중복 질문 방지 로직
- [ ] 관련 질문 그룹핑

#### 2.5 PDF 내보내기 (2일)
- [ ] PDF 생성 라이브러리 통합 (jsPDF)
- [ ] PRD/시나리오 템플릿 디자인

**Phase 2 완료 기준**:
- ✅ PRD 완성 후 시나리오 작성 플로우 자동 시작
- ✅ 20분 내 30개 질문 완료 및 시나리오 문서 생성
- ✅ PDF 내보내기 성공

---

### Phase 3: Polish & Scale (1-2주) 🎨 Nice-to-have

**목표**: 사용성 극대화 및 확장성 확보

#### 3.1 문서 라이브러리 (3일)
- [ ] 과거 PRD 목록 페이지
- [ ] 프로젝트별 관리
- [ ] 검색 및 필터링

#### 3.2 고급 기능 (4일)
- [ ] Notion 내보내기 (Notion API)
- [ ] 템플릿 선택 (핀테크, 헬스케어 등)
- [ ] AI 리스크 제안 기능

#### 3.3 성능 최적화 (2일)
- [ ] LangGraph 응답 캐싱
- [ ] 문서 렌더링 최적화
- [ ] 로딩 상태 개선

#### 3.4 테스트 및 배포 (2일)
- [ ] E2E 테스트 (Playwright)
- [ ] Vercel 배포 설정
- [ ] 모니터링 (LangSmith)

---

## 🔧 핵심 기술 구현 상세

### 1. Planning Agent 아키텍처 (LangGraph)

```typescript
// apps/agents/src/planning-agent/graph.ts
import { StateGraph } from "@langchain/langgraph";

const planningGraph = new StateGraph<PlanningState>({
  channels: {
    currentQuestion: { value: (x, y) => y ?? x },
    conversationHistory: { value: (x, y) => y ?? x },
    generatedPRD: { value: (x, y) => y ?? x },
    context: { value: (x, y) => ({ ...x, ...y }) },
  }
})
  .addNode("analyzeAnswer", analyzeAnswerNode)      // 답변 분석
  .addNode("updateContext", updateContextNode)      // 컨텍스트 업데이트
  .addNode("generateQuestion", generateQuestionNode)// 다음 질문 생성
  .addNode("updatePRD", updatePRDNode)              // PRD 문서 업데이트
  .addNode("checkCompletion", checkCompletionNode)  // 완성도 체크
  .addEdge("analyzeAnswer", "updateContext")
  .addEdge("updateContext", "generateQuestion")
  .addEdge("generateQuestion", "updatePRD")
  .addEdge("updatePRD", "checkCompletion")
  .addConditionalEdges("checkCompletion",
    (state) => state.currentQuestion < 5 ? "analyzeAnswer" : "end"
  );
```

#### 핵심 노드 구현 예시

```typescript
// apps/agents/src/planning-agent/nodes/question-generator.ts
async function generateQuestionNode(state: PlanningState): Promise<Partial<PlanningState>> {
  const { currentQuestion, context, conversationHistory } = state;

  const prompt = `
    당신은 전문 PM입니다. 사용자의 이전 답변을 바탕으로 다음 질문을 생성하세요.

    현재 진행: Q${currentQuestion}
    이전 답변: ${conversationHistory.slice(-3).map(m => m.content).join('\n')}
    프로젝트 컨텍스트: ${JSON.stringify(context)}

    다음 질문 (Q${currentQuestion + 1})을 생성하고,
    맥락에 맞는 객관식 옵션 3-5개를 제시하세요.

    출력 형식:
    {
      "question": "...",
      "options": ["옵션1", "옵션2", ...],
      "targetSection": "제품 개요" | "문제/솔루션" | ...
    }
  `;

  const response = await model.invoke(prompt);
  const nextQuestion = JSON.parse(response.content);

  return {
    currentQuestion: currentQuestion + 1,
    currentSection: nextQuestion.targetSection,
  };
}
```

### 2. 실시간 문서 동기화

```typescript
// apps/web/src/hooks/useDocumentSync.ts
export function useDocumentSync() {
  const [prdDocument, setPRDDocument] = useState<PRDDocument>(emptyPRD);

  useEffect(() => {
    // LangGraph 스트리밍 응답 구독
    const eventSource = new EventSource(`${LANGGRAPH_API_URL}/stream`);

    eventSource.addEventListener('documentUpdate', (event) => {
      const { section, content } = JSON.parse(event.data);

      setPRDDocument(prev => ({
        ...prev,
        sections: {
          ...prev.sections,
          [section]: content
        },
        completionRate: calculateCompletion(prev.sections)
      }));
    });

    return () => eventSource.close();
  }, []);

  return { prdDocument, setPRDDocument };
}
```

### 3. 질문 타입별 UI 컴포넌트

```tsx
// apps/web/src/components/planning/question-display.tsx
export function QuestionDisplay({ question, type, options, onAnswer }: QuestionProps) {
  if (type === 'multiple_choice') {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{question}</h3>
        <div className="grid gap-2">
          {options?.map((option, idx) => (
            <button
              key={idx}
              onClick={() => onAnswer(option)}
              className="p-4 border rounded-lg hover:bg-blue-50 text-left transition-colors"
            >
              <span className="font-mono text-sm text-gray-500">#{idx + 1}</span>
              <p className="mt-1">{option}</p>
            </button>
          ))}
          <button
            onClick={() => onAnswer("__CUSTOM__")}
            className="p-4 border-2 border-dashed rounded-lg hover:bg-gray-50 transition-colors"
          >
            ✏️ 직접 입력하기
          </button>
        </div>
      </div>
    );
  }

  // type === 'text'
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">{question}</h3>
      <textarea
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        rows={4}
        placeholder="자유롭게 답변해주세요..."
        onBlur={(e) => onAnswer(e.target.value)}
      />
    </div>
  );
}
```

### 4. PRD 섹션 빌더

```typescript
// apps/web/src/lib/document-builders/prd-builder.ts
export class PRDBuilder {
  private sections: Partial<PRDSections> = {};

  updateSection(section: keyof PRDSections, content: string) {
    this.sections[section] = content;
  }

  generateMarkdown(): string {
    return `
# ${this.sections.overview?.split('\n')[0] || 'Product Requirements Document'}

## 1. 제품 개요
${this.sections.overview || '(작성 중...)'}

## 2. 해결하려는 문제
${this.sections.problem || '(작성 중...)'}

## 3. 타겟 사용자
${this.sections.target || '(작성 중...)'}

## 4. 핵심 기능
${this.sections.features || '(작성 중...)'}

## 5. 사용자 시나리오
${this.sections.scenarios || '(작성 중...)'}

## 6. 성공 기준
${this.sections.success || '(작성 중...)'}

## 7. 주요 리스크
${this.sections.risks || '(작성 중...)'}

## 8. 미결정 사항
${this.sections.openQuestions || '(작성 중...)'}

## 9. MVP 범위
${this.sections.mvp || '(작성 중...)'}
    `.trim();
  }

  getCompletionRate(): number {
    const totalSections = 9;
    const completedSections = Object.values(this.sections).filter(
      content => content && content.length > 20
    ).length;
    return Math.round((completedSections / totalSections) * 100);
  }
}
```

---

## 🗄️ 데이터베이스 스키마 설계

### Supabase Tables (기존 구조 확장)

```sql
-- 프로젝트 테이블
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  project_type TEXT, -- 'mobile', 'web', 'saas' 등
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- PRD 문서 테이블
CREATE TABLE prd_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  content JSONB NOT NULL, -- PRDDocument 전체 저장
  version INTEGER DEFAULT 1,
  completion_rate INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 사용자 시나리오 테이블
CREATE TABLE scenario_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 대화 기록 테이블
CREATE TABLE conversation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  question_number INTEGER,
  question TEXT,
  answer TEXT,
  section_mapped TEXT, -- 어느 섹션에 반영되었는지
  created_at TIMESTAMP DEFAULT NOW()
);

-- 분석 이벤트 테이블 (성공 지표 추적)
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  project_id UUID REFERENCES projects(id),
  event_type TEXT NOT NULL, -- 'question_answered', 'section_completed', 'prd_exported' 등
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_created ON projects(created_at DESC);
CREATE INDEX idx_prd_project ON prd_documents(project_id);
CREATE INDEX idx_scenario_project ON scenario_documents(project_id);
CREATE INDEX idx_conversation_project ON conversation_history(project_id);
CREATE INDEX idx_analytics_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);

-- RLS (Row Level Security) 정책
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE prd_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로젝트만 접근 가능
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

-- PRD 문서도 동일한 정책 적용
CREATE POLICY "Users can view own PRDs" ON prd_documents
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own PRDs" ON prd_documents
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own PRDs" ON prd_documents
  FOR UPDATE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- 시나리오 문서 정책
CREATE POLICY "Users can view own scenarios" ON scenario_documents
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own scenarios" ON scenario_documents
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own scenarios" ON scenario_documents
  FOR UPDATE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- 대화 기록 정책
CREATE POLICY "Users can view own conversation history" ON conversation_history
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own conversation history" ON conversation_history
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- 분석 이벤트 정책 (user_id 기준)
CREATE POLICY "Users can view own analytics events" ON analytics_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics events" ON analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

> 마이그레이션 시나리오: 테이블/인덱스 생성 → RLS 활성화 → 정책 적용 → 샘플 데이터 삽입 시 세션 컨텍스트 확인. 롤백은 정책/테이블 삭제 역순으로 수행.

---

## 🎨 UI/UX 플로우 상세

### 1. 초기 진입 화면

```
┌─────────────────────────────────────────────┐
│  Anyon                        [@사용자] [⚙️]  │
├─────────────────────────────────────────────┤
│                                             │
│         🎯 AI와 대화하며 PRD 만들기          │
│                                             │
│         아이디어를 체계적인 기획서로         │
│         평균 30분이면 완성됩니다            │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  "AI 스터디 플래너 만들고 싶어요"      │  │
│  │                             [시작하기→]│  │
│  └───────────────────────────────────────┘  │
│                                             │
│  또는 과거 프로젝트 불러오기:                │
│  • StudyFlow PRD (2024-01-15) 80% 완성      │
│  • 운동 코치 앱 (2024-01-10) 100% 완성      │
│                                             │
└─────────────────────────────────────────────┘
```

### 2. 대화 진행 중 (Split View)

```
┌─────────────────────────────────────────────────────────────────┐
│  Anyon - "StudyFlow" 프로젝트            [@사용자] [저장] [⚙️]  │
├──────────────────────┬──────────────────────────────────────────┤
│  💬 AI 기획 가이드    │  📄 PRD 문서                   [▼ 더보기]│
│  ──────────────────  │  ───────────────────────────────────── │
│                      │  [PRD] [사용자 시나리오] [+]            │
│  🟢 Q3/5 - 타겟 사용자│  ─────────────────────────────────────  │
│  ████░░ 60%          │                                          │
│                      │  # StudyFlow PRD                         │
│  ┌────────────────┐  │                                          │
│  │ AI: 주 사용자는│  │  ## 1. 제품 개요 ✓                       │
│  │ 누구인가요?    │  │  **제품명**: StudyFlow                   │
│  │                │  │  **핵심 가치**: AI가 시험 일정을...      │
│  │ ① 대학생       │  │                                          │
│  │ ② 직장인       │  │  ## 2. 해결하려는 문제 ✓                 │
│  │ ③ 고등학생     │  │  ### 사용자가 겪는 핵심 문제             │
│  │ ④ 직접입력     │  │  시험 기간 다수 과목을 동시에...         │
│  └────────────────┘  │                                          │
│                      │  ## 3. 타겟 사용자 🔵 (작성 중)          │
│  ┌────────────────┐  │  대학생들이 주 타겟이며...               │
│  │ 나: ①번        │  │                                          │
│  └────────────────┘  │  ## 4. 핵심 기능                         │
│                      │  (아직 작성되지 않음)                    │
│  [입력창_______][→] │                                          │
│                      │  ...                                     │
│  [← 이전] [건너뛰기]│  [편집 모드] [Markdown ⬇] [PDF ⬇]       │
└──────────────────────┴──────────────────────────────────────────┘
```

### 3. PRD 완성 후 전환 제안

```
┌─────────────────────────────────────────────┐
│  🎉 PRD가 완성되었습니다!                    │
│                                             │
│  9개 섹션 모두 작성 완료 (100%)             │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 다음 단계를 선택하세요:              │   │
│  │                                     │   │
│  │ ✨ 사용자 시나리오 작성하기 (추천)   │   │
│  │    → AI와 30개 질문으로 UX 구체화    │   │
│  │                                     │   │
│  │ 📥 PRD 내보내기                      │   │
│  │    → Markdown / PDF / Notion        │   │
│  │                                     │   │
│  │ 🚀 개발 시작하기                     │   │
│  │    → Cursor/Claude Code 가이드      │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### 4. 사용자 시나리오 작성 화면

```
┌─────────────────────────────────────────────────────────────────┐
│  Anyon - "StudyFlow" 프로젝트            [@사용자] [저장] [⚙️]  │
├──────────────────────┬──────────────────────────────────────────┤
│  💬 AI UX 가이드      │  📄 사용자 시나리오              [▼ 더보기]│
│  ──────────────────  │  ───────────────────────────────────── │
│                      │  [PRD] [사용자 시나리오✨] [+]           │
│  🟢 Section 1/4      │  ─────────────────────────────────────  │
│  Q8/30 - 온보딩 흐름 │                                          │
│  ███████░░ 27%       │  # StudyFlow 사용자 시나리오             │
│                      │                                          │
│  ┌────────────────┐  │  ## Section 1: 첫 실행 및 온보딩 ✓       │
│  │ AI: 설문이 끝나│  │                                          │
│  │ 후 첫 화면은?  │  │  ### 1.1 앱 첫 실행                      │
│  │                │  │  사용자는 앱스토어에서 "StudyFlow"를...  │
│  │ ① 목표 설정    │  │                                          │
│  │ ② 대시보드     │  │  ### 1.2 온보딩 설문 (3개 질문)          │
│  │ ③ 튜토리얼     │  │  - Q1: "주요 시험 일정은?"               │
│  │ ④ 직접입력     │  │  - Q2: "하루 공부 가능 시간은?"          │
│  └────────────────┘  │  ...                                     │
│                      │                                          │
│  ┌────────────────┐  │  ## Section 2: 핵심 기능 사용 🔵         │
│  │ 나: ②번 - 바로│  │  (작성 중...)                            │
│  │ 사용 시작하게  │  │                                          │
│  └────────────────┘  │  ## Section 3: 수익화 전환               │
│                      │  (아직 작성되지 않음)                    │
│  [입력창_______][→] │                                          │
│                      │  ...                                     │
│  [← 이전] [건너뛰기]│  [편집 모드] [Markdown ⬇] [PDF ⬇]       │
└──────────────────────┴──────────────────────────────────────────┘
```

---

## 🧪 테스트 전략

**Phase 1 집중 스코프**: CI에서 즉시 실행 가능한 최소 세트만 우선 도입
- 단위: 질문 생성 노드(분기/옵션), PRD 빌더 완료율 계산, SSE 수신 시 상태 업데이트 훅
- 통합: Playwright로 로그인→Q1 응답→PRD 섹션 1개 채움→마크다운 다운로드까지의 짧은 흐름
- 외부 호출은 LangGraph/Supabase를 mock하거나 테스트 플래그(프롬프트/LLM 호출 차단) 사용

**CI 체크리스트 (매 PR)**:
- `yarn format:check` → `yarn lint`(turbo) → `yarn test`(Phase 1 최소 단위) → `yarn eval` 필요 시 선택 실행
- Playwright E2E는 main 병합 전 데일리/주간 배치로 실행

## 운영 가드레일 (MVP)
- LLM 호출: 타임아웃 15s, 최대 재시도 2회(429/500), 동시세션 rate limit 30 req/min/유저
- 로깅/트레이싱: LangSmith trace 켜기, 프롬프트/응답 PII 제거, 에러 시 세션Id+userId 해시만 기록
- 비용 방지: 응답 토큰 상한 설정, 시나리오 생성은 Phase 2까지 비활성(플래그)로 시작
- 안정성: SSE 실패 시 3초→9초 백오프, 5회 실패 후 폴백으로 최신 저장본을 반환

### 단위 테스트 (Vitest)

**Agent 로직 테스트**:
```typescript
// apps/agents/src/planning-agent/nodes/__tests__/question-generator.test.ts
describe('Question Generator Node', () => {
  it('should generate next question based on previous answer', async () => {
    const state: PlanningState = {
      currentQuestion: 1,
      context: { projectType: 'mobile' },
      conversationHistory: [
        { role: 'user', content: 'AI 스터디 플래너' }
      ],
      // ...
    };

    const result = await generateQuestionNode(state);

    expect(result.currentQuestion).toBe(2);
    expect(result.currentSection).toBeDefined();
  });

  it('should generate context-aware options', async () => {
    const state: PlanningState = {
      currentQuestion: 3,
      context: {
        projectType: 'mobile',
        keyFeatures: ['카메라', '위치 추적']
      },
      // ...
    };

    const result = await generateQuestionNode(state);
    const question = result.nextQuestion;

    // 카메라/위치 관련 질문이 포함되어야 함
    expect(question.options).toContain(expect.stringMatching(/권한|허용/));
  });
});
```

**Document Builder 테스트**:
```typescript
// apps/web/src/lib/document-builders/__tests__/prd-builder.test.ts
describe('PRD Builder', () => {
  it('should calculate completion rate correctly', () => {
    const builder = new PRDBuilder();

    builder.updateSection('overview', '제품 개요 내용');
    expect(builder.getCompletionRate()).toBe(11); // 1/9 ≈ 11%

    builder.updateSection('problem', '문제 내용');
    expect(builder.getCompletionRate()).toBe(22); // 2/9 ≈ 22%
  });

  it('should generate valid markdown', () => {
    const builder = new PRDBuilder();
    builder.updateSection('overview', '# 제품명: TestApp');

    const markdown = builder.generateMarkdown();

    expect(markdown).toContain('# TestApp');
    expect(markdown).toContain('## 1. 제품 개요');
  });
});
```

### 통합 테스트

**E2E 플로우 테스트** (Playwright):
```typescript
// apps/web/tests/e2e/prd-creation.spec.ts
import { test, expect } from '@playwright/test';

test('complete PRD creation flow', async ({ page }) => {
  // 1. 로그인
  await page.goto('http://localhost:3000/auth/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  // 2. 새 프로젝트 시작
  await page.goto('http://localhost:3000');
  await page.fill('textarea', 'AI 스터디 플래너 만들고 싶어요');
  await page.click('button:has-text("시작하기")');

  // 3. Q1 답변
  await expect(page.locator('text=제품을 한 문장으로')).toBeVisible();
  await page.click('button:has-text("모바일 앱")');

  // 4. Q2-Q5 진행...
  // (생략)

  // 5. PRD 문서 확인
  const prdContent = await page.locator('[data-testid="prd-canvas"]').textContent();
  expect(prdContent).toContain('제품 개요');
  expect(prdContent).toContain('StudyFlow'); // 또는 사용자가 입력한 제품명

  // 6. 완성률 확인
  const completionRate = await page.locator('[data-testid="completion-rate"]').textContent();
  expect(parseInt(completionRate)).toBeGreaterThan(50);

  // 7. 내보내기
  await page.click('button:has-text("Markdown 다운로드")');
  // 다운로드 확인...
});
```

### 사용자 테스트

**베타 테스트 체크리스트**:
- [ ] 10명의 타겟 사용자 (AI 네이티브 비개발자) 리크루팅
- [ ] 사전 설문: 기존 PRD 작성 경험, 소요 시간
- [ ] 테스트 시나리오 제공: "본인의 실제 아이디어로 PRD 작성"
- [ ] 관찰 항목:
  - 각 질문에서 소요 시간
  - 이탈 지점
  - 혼란스러워하는 부분
  - 자발적 피드백
- [ ] 사후 설문:
  - "Anyon 없이 혼자 썼을 때보다 얼마나 나았나요?" (1-5점)
  - "PRD 완성도를 스스로 평가한다면?" (1-5점)
  - "실제로 이 PRD를 개발자에게 전달할 의향이 있나요?"
  - "친구에게 추천하시겠습니까?" (NPS)

**성공 기준**:
- 평균 완성 시간 < 40분
- 완성률 > 70%
- NPS > 50

---

## 🚀 배포 전략

### 개발 환경

**로컬 개발**:
```bash
# Frontend
cd apps/web
yarn dev  # http://localhost:3000

# LangGraph Agent
cd apps/agents
yarn dev  # http://localhost:54367
```

**Staging 환경**:
- Frontend: Vercel Preview Deployment (PR마다 자동 배포)
- Backend: LangGraph Cloud Staging
- Database: Supabase Development Project

### 프로덕션 배포

#### Frontend (Vercel)

**배포 설정**:
```json
// vercel.json
{
  "buildCommand": "cd ../.. && yarn build --filter=@anyon/web",
  "outputDirectory": "apps/web/.next",
  "installCommand": "yarn install",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "LANGGRAPH_API_URL": "@langgraph-api-url"
  }
}
```

**도메인 설정**:
- Production: `app.anyon.ai`
- Staging: `staging.anyon.ai`

#### Backend (LangGraph)

**옵션 1: LangGraph Cloud** (권장)
```bash
# LangGraph CLI로 배포
cd apps/agents
npx @langchain/langgraph-cli deploy \
  --name anyon-planning-agent \
  --env-file .env.production
```

**옵션 2: 자체 호스팅** (AWS/GCP)
- Docker 컨테이너로 패키징
- Kubernetes 또는 Cloud Run에 배포
- API Gateway로 라우팅

#### Database (Supabase)

**프로덕션 프로젝트 설정**:
1. Supabase 대시보드에서 새 프로젝트 생성
2. 위의 SQL 스키마 실행
3. RLS 정책 활성화
4. API 키 및 URL 환경변수에 설정

**백업 전략**:
- 일일 자동 백업 (Supabase 기본 제공)
- 주간 수동 스냅샷

### 환경 변수 관리

**개발 환경** (`.env.local`):
```bash
# Frontend (apps/web/.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_LANGGRAPH_API_URL=http://localhost:54367

# Backend (root .env)
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
LANGSMITH_API_KEY=ls__xxx
```

**프로덕션 환경** (Vercel Secrets + LangGraph Cloud):
- Vercel 대시보드에서 환경변수 설정
- LangGraph Cloud 대시보드에서 시크릿 설정
- 민감 정보는 절대 코드에 커밋하지 않음

### CI/CD 파이프라인

**GitHub Actions 워크플로우**:
```yaml
# .github/workflows/deploy.yml
name: Deploy Anyon

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: yarn install
      - run: yarn lint
      - run: yarn test

  deploy-frontend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/actions@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-agents:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: |
          cd apps/agents
          npx @langchain/langgraph-cli deploy \
            --name anyon-planning-agent \
            --api-key ${{ secrets.LANGGRAPH_API_KEY }}
```

### 모니터링 및 관찰성

**LangSmith** (LLM 호출 모니터링):
- 모든 Planning Agent 호출 자동 추적
- 프롬프트 버전 관리
- 응답 품질 모니터링
- 비용 분석 대시보드

**Vercel Analytics**:
- 페이지 로드 시간
- Core Web Vitals
- 사용자 지역 분포

**Supabase Metrics**:
- 데이터베이스 쿼리 성능
- RLS 정책 적용 여부
- 스토리지 사용량

**커스텀 대시보드** (Grafana or Metabase):
```typescript
// apps/web/src/lib/analytics.ts
export async function trackEvent(event: AnalyticsEvent) {
  // Supabase analytics_events 테이블에 삽입
  await supabase.from('analytics_events').insert({
    user_id: event.userId,
    project_id: event.projectId,
    event_type: event.type,
    metadata: event.metadata,
  });

  // 중요 이벤트는 LangSmith에도 전송
  if (event.type === 'prd_completed') {
    await langsmithClient.createEvent({
      name: 'PRD Completed',
      properties: event.metadata,
    });
  }
}
```

---

## 💰 예상 비용 분석

### 개발 단계 (MVP, 1-2개월)

| 항목 | 티어 | 월 비용 |
|------|------|---------|
| Supabase | Free | $0 |
| Vercel | Hobby | $0 |
| LangSmith | Free (5K traces) | $0 |
| Anthropic API | Pay-as-you-go (~1000 PRDs) | $50 |
| OpenAI API | Pay-as-you-go (백업) | $20 |
| **Total** | | **~$70/월** |

### 베타 테스트 (100명 사용자)

| 항목 | 티어/사용량 | 월 비용 |
|------|-------------|---------|
| Supabase | Pro | $25 |
| Vercel | Pro | $20 |
| LangSmith | Starter | $39 |
| Anthropic API | ~10K PRDs (Claude Haiku) | $200 |
| OpenAI API | 백업 | $30 |
| LangGraph Cloud | Starter | $29 |
| **Total** | | **~$343/월** |

**비용 산정 근거**:
- 평균 PRD 1개당 토큰: ~3,000 input + 5,000 output = 8K tokens
- Claude Haiku 가격: $0.25/M input, $1.25/M output
- PRD 1개당 비용: (3K×0.25 + 5K×1.25) / 1M = **$0.007 (약 7원)**
- 100명 × 평균 2개 PRD/월 = 200 PRDs = **$1.4/월**
- 안전 마진 포함하여 $200 책정

### 프로덕션 (1,000명 활성 사용자)

| 항목 | 티어/사용량 | 월 비용 |
|------|-------------|---------|
| Supabase | Pro | $25 |
| Vercel | Pro | $20 |
| LangSmith | Plus | $99 |
| Anthropic API | ~100K PRDs | $2,000 |
| OpenAI API | 백업 | $100 |
| LangGraph Cloud | Pro | $99 |
| **Total** | | **~$2,343/월** |

### 스케일업 시나리오 (10,000명 사용자)

| 항목 | 예상 비용 |
|------|-----------|
| Infrastructure | $500/월 |
| AI API (Claude) | $20,000/월 |
| Observability | $300/월 |
| **Total** | **~$20,800/월** |

**수익화 고려사항**:
- 무료 티어: 월 1개 PRD
- 프로 티어: $9.99/월 (무제한 PRD, PDF 내보내기, 우선 지원)
- 팀 티어: $29.99/월 (협업 기능, 템플릿 라이브러리)

**손익분기점**:
- 베타 단계 (100명): 무료 제공
- 1,000명 단계: ~300명 유료 전환 시 손익분기 ($3,000 수익)
- 10,000명 단계: ~2,500명 유료 전환 시 손익분기 ($25,000 수익)

---

## ⚠️ 리스크 관리

### Critical Risks (높은 영향도)

#### 1. AI 질문 품질 편차
**리스크**: AI가 생성하는 질문이 너무 일반적이거나 맥락과 무관하면 사용자 이탈

**완화 전략**:
- ✅ 초기 10개 프로젝트는 수동으로 질문 흐름 큐레이션
- ✅ 사용자 피드백 수집 ("이 질문이 도움 됐나요?" 버튼)
- ✅ 질문 템플릿 데이터베이스 구축 및 지속 개선
- ✅ A/B 테스트로 질문 유형별 완성률 분석
- ✅ 베타 테스터와 주간 피드백 세션

**측정 지표**:
- 각 질문별 "도움됨" 비율 > 70%
- 질문 단계별 이탈률 < 15%

#### 2. 사용자 기대치 관리
**리스크**: 사용자가 "완벽한 PRD"를 기대하지만 초안 수준일 수 있음

**완화 전략**:
- ✅ 온보딩에서 "AI가 80% 기본 구조 잡아주고, 20%는 직접 다듬기" 명시
- ✅ 각 섹션에 "AI 제안" 라벨 표시
- ✅ 완성 후 "검토 체크리스트" 제공
- ✅ 성공 사례 공유 (이 PRD로 실제 만든 서비스)

**예시 온보딩 메시지**:
> "Anyon은 당신의 아이디어를 **80% 체계화**해줍니다.
> 나머지 20%는 당신만이 채울 수 있는 디테일입니다.
> 완성된 초안을 바탕으로 자유롭게 수정하세요!"

### High Risks (중간 영향도)

#### 3. 실시간 문서 생성 안정성
**리스크**: AI 응답 지연 시 우측 캔버스 업데이트 느려짐, 긴 대화에서 PRD 구조 깨질 가능성

**완화 전략**:
- ✅ Claude API 응답 최적화 (스트리밍, 프롬프트 캐싱)
- ✅ 문서 생성 로직과 채팅 로직 분리 (비동기 처리)
- ✅ 사용자가 수동 편집 시 AI 생성 내용과 충돌 방지 로직
- ✅ 로딩 상태 명확히 표시 ("AI가 문서를 업데이트하는 중...")
- ✅ 오프라인 모드: 답변만 먼저 저장, 온라인 복구 시 일괄 처리

#### 4. API 비용 급증
**리스크**: 예상보다 많은 사용자 유입 시 Anthropic API 비용 폭증

**완화 전략**:
- ✅ 응답 캐싱 (동일 질문/맥락 → 캐시 사용)
- ✅ 토큰 리미트 설정 (PRD 1개당 최대 10K tokens)
- ✅ Rate limiting (무료 사용자: 시간당 5개 질문)
- ✅ 비용 알림 설정 (월 $500 초과 시 Slack 알림)
- ✅ Haiku 우선 사용, 필요 시에만 Sonnet

### Medium Risks (낮은 영향도)

#### 5. Open Canvas와의 코드 충돌
**리스크**: Open Canvas 업스트림 업데이트 시 Anyon 코드와 충돌

**완화 전략**:
- ✅ 별도 브랜치 관리 (`main` ← `anyon-dev`)
- ✅ 정기적 Merge (월 1회)
- ✅ Anyon 전용 코드는 별도 디렉토리로 분리
- ✅ 공통 컴포넌트는 Open Canvas 구조 최대한 준수

#### 6. 프로젝트 이탈 및 미완성
**리스크**: 사용자가 중간에 이탈하여 PRD 완성하지 못함

**완화 전략**:
- ✅ 자동 저장 (5초마다)
- ✅ 진행률 시각화 (완성까지 70% 남았어요!)
- ✅ 이메일 리마인더 (24시간 후: "PRD 완성하러 돌아오세요!")
- ✅ 재진입 UX 개선 (이전 대화 이력 보여주기)

---

## 📝 다음 단계 (Action Items)

### 즉시 시작 가능한 작업 (Week 1-2)

#### Week 1: 기획 및 프롬프트 작성

- [ ] **Q0-Q5 질문 및 옵션 초안 작성** (Google Docs)
  - Q0: 제품 카테고리 (모바일/웹/SaaS...)
  - Q1: 한 문장 설명
  - Q2: 핵심 문제
  - Q3: 타겟 사용자
  - Q4: 핵심 기능 (3개)
  - Q5: 차별점

- [ ] **9개 PRD 섹션 템플릿 마크다운 작성**
  - 각 섹션별 가이드라인
  - 좋은 예시 / 나쁜 예시

- [ ] **테스트용 시나리오 3개 준비**
  - 시나리오 1: 모바일 앱 (예: 스터디 플래너)
  - 시나리오 2: 웹 서비스 (예: AI 이력서 빌더)
  - 시나리오 3: SaaS (예: 팀 협업 도구)

- [ ] **베타 테스터 10명 리크루팅**
  - AI 네이티브 비개발자
  - 실제 아이디어 보유자
  - 피드백 적극 제공 가능한 사람

#### Week 2: Planning Agent 개발

- [ ] **`apps/agents/src/planning-agent/` 디렉토리 생성**

- [ ] **LangGraph 기본 구조 구현** (`graph.ts`)
  - State 정의
  - 5개 노드 생성 (analyzeAnswer, updateContext, generateQuestion, updatePRD, checkCompletion)
  - Edge 연결

- [ ] **Question Generator 노드 개발**
  - 프롬프트 엔지니어링
  - 맥락 기반 옵션 생성 로직
  - 테스트 (LangGraph Studio)

- [ ] **PRD Updater 노드 개발**
  - 답변 → 섹션 매핑 로직
  - 마크다운 생성

- [ ] **로컬 테스트**
  - 3개 테스트 시나리오로 E2E 플로우 검증
  - LangSmith로 추적 확인

#### Week 3: Frontend 개발

- [ ] **Chat Interface 수정**
  - `apps/web/src/components/planning/question-display.tsx` 개발
  - 객관식 버튼 UI
  - 주관식 텍스트 입력
  - 진행률 표시 컴포넌트

- [ ] **PRD Canvas 컴포넌트 개발**
  - `apps/web/src/components/artifacts/prd-canvas.tsx`
  - MD Editor 통합
  - 섹션별 완성도 표시

- [ ] **실시간 동기화 훅 구현**
  - `apps/web/src/hooks/useDocumentSync.ts`
  - SSE (Server-Sent Events) 구독
  - Zustand 상태 관리

#### Week 4: 통합 및 MVP 배포

- [ ] **Frontend-Backend 연동**
  - API 엔드포인트 구현
  - 스트리밍 응답 처리
  - 에러 핸들링

- [ ] **Supabase 설정**
  - 테이블 생성 (SQL 실행)
  - RLS 정책 설정
  - 자동 저장 구현

- [ ] **E2E 테스트**
  - 3개 시나리오로 전체 플로우 테스트
  - 버그 수정

- [ ] **Vercel 배포**
  - Staging 환경 배포
  - 베타 테스터에게 링크 공유

- [ ] **베타 피드백 수집**
  - 사용성 테스트 관찰
  - 설문 조사
  - 개선 사항 정리

### 중기 계획 (Week 5-8): Phase 2 개발

- [ ] 사용자 시나리오 Agent 개발
- [ ] PDF 내보내기 기능
- [ ] 컨텍스트 기반 질문 최적화
- [ ] 멀티탭 관리 강화

### 장기 계획 (Week 9+): Phase 3 & 프로덕션

- [ ] 문서 라이브러리
- [ ] Notion 내보내기
- [ ] 산업별 템플릿
- [ ] 팀 협업 기능 (향후)

---

## 🎓 학습 리소스

### 필수 학습

#### LangGraph
- [ ] [LangGraph 공식 문서](https://langchain-ai.github.io/langgraphjs/)
- [ ] [LangGraph Tutorial](https://langchain-ai.github.io/langgraphjs/tutorials/)
- [ ] Open Canvas 코드베이스 분석 (`apps/agents/src/agent/`)
  - `graph.ts`: 전체 플로우
  - `nodes/`: 각 노드 구현
  - `prompts/`: 프롬프트 엔지니어링

#### Next.js & React
- [ ] [Next.js App Router 패턴](https://nextjs.org/docs/app)
- [ ] [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [ ] Zustand 상태 관리

#### Prompt Engineering
- [ ] [Anthropic Prompt Engineering Guide](https://docs.anthropic.com/claude/docs/prompt-engineering)
- [ ] [Prompt Caching](https://docs.anthropic.com/claude/docs/prompt-caching) (비용 절감)

### 참고 자료

- **LangSmith Observability**: [Best Practices](https://docs.smith.langchain.com/)
- **Supabase Real-time**: [문서](https://supabase.com/docs/guides/realtime)
- **Radix UI**: [컴포넌트 라이브러리](https://www.radix-ui.com/)
- **Tailwind CSS**: [유틸리티 클래스](https://tailwindcss.com/docs)

---

## 📊 개발 일정 요약 (Gantt Chart)

```
Week 1-2: Phase 1 - MVP Core 기초
├── 기획 및 프롬프트 작성       ████████░░ (80%)
├── Planning Agent 개발        ██████░░░░ (60%)
└── Frontend 컴포넌트 개발      ████░░░░░░ (40%)

Week 3-4: Phase 1 완료
├── Frontend-Backend 연동      ████████░░ (80%)
├── 통합 테스트 및 버그 수정    ██████████ (100%)
├── MVP 배포                   ██████████ (100%)
└── 베타 피드백 수집           ██████░░░░ (60%)

Week 5-6: Phase 2 - Enhanced Experience
├── 시나리오 Agent 개발        ████████░░ (80%)
├── Scenario Canvas 개발       ██████░░░░ (60%)
├── PDF 내보내기               ██████████ (100%)
└── 컨텍스트 최적화            ████████░░ (80%)

Week 7-8: Phase 2 완료 & Phase 3 시작
├── 멀티탭 관리 강화           ██████████ (100%)
├── 문서 라이브러리            ██████░░░░ (60%)
└── 고급 기능 개발             ████░░░░░░ (40%)

Week 9+: Phase 3 완료 & 프로덕션 배포
├── 모든 기능 완성             ██████████ (100%)
├── E2E 테스트 및 QA           ██████████ (100%)
├── 프로덕션 배포              ██████████ (100%)
└── 마케팅 준비                ████████░░ (80%)
```

---

## ✅ 체크리스트: 개발 시작 전 준비사항

### 기술 환경

- [ ] **Open Canvas 로컬 실행 성공**
  ```bash
  git clone https://github.com/langchain-ai/open-canvas.git
  cd open-canvas
  yarn install
  yarn build
  # apps/agents: yarn dev
  # apps/web: yarn dev
  ```

- [ ] **API 키 발급**
  - [ ] [Anthropic API 키](https://console.anthropic.com/)
  - [ ] [OpenAI API 키](https://platform.openai.com/) (백업용)
  - [ ] [LangSmith API 키](https://smith.langchain.com/)

- [ ] **Supabase 프로젝트 생성**
  - [ ] [Supabase 계정](https://supabase.com/) 생성
  - [ ] 새 프로젝트 생성
  - [ ] URL 및 API 키 복사

- [ ] **환경 변수 설정**
  - [ ] `apps/web/.env.local` 파일 생성
  - [ ] `root/.env` 파일 생성
  - [ ] 모든 API 키 입력

### 기획 문서

- [ ] **Q0-Q5 질문 초안 작성** (Google Docs)
- [ ] **PRD 9개 섹션 템플릿 작성** (Markdown)
- [ ] **테스트 시나리오 3개 준비**
- [ ] **베타 테스터 10명 컨택**

### 팀 협업 (해당 시)

- [ ] **GitHub Repository 생성**
  - [ ] Private repo 생성
  - [ ] 팀원 초대
  - [ ] Branch protection 설정 (main)

- [ ] **태스크 관리 도구 설정**
  - [ ] Linear / Notion / GitHub Projects 중 선택
  - [ ] 태스크 임포트 (이 문서 기반)

- [ ] **주간 체크인 미팅 일정**
  - [ ] 매주 월요일 오전 10시 (예시)
  - [ ] 진행 상황 공유 및 블로커 논의

### 기타

- [ ] **Zero100 2차 제출 자료 준비**
  - [ ] 이 개발 계획서
  - [ ] 프로토타입 스크린샷 (있다면)
  - [ ] 타임라인 요약

- [ ] **학습 계획 수립**
  - [ ] LangGraph 튜토리얼 (1-2일)
  - [ ] Open Canvas 코드 분석 (2-3일)
  - [ ] 프롬프트 엔지니어링 (1일)

---

## 🎯 MVP 성공 기준

### 기능적 요구사항

- [x] 사용자가 Q0-Q5까지 답변 가능
- [x] AI가 맥락 기반 질문 생성
- [x] 실시간으로 PRD 9개 섹션 채워짐
- [x] Markdown 다운로드 가능
- [x] 자동 저장 기능

### 성능 요구사항

- [x] 평균 PRD 작성 시간 < 40분
- [x] AI 응답 지연 < 5초
- [x] 문서 렌더링 지연 < 1초
- [x] 페이지 로드 시간 < 3초

### 품질 요구사항

- [x] PRD 완성률 > 70% (베타 테스터 기준)
- [x] 각 질문 "도움됨" 비율 > 60%
- [x] 버그 발생률 < 5% (크리티컬 버그 0%)
- [x] NPS > 40 (베타 테스터)

---

## 📞 연락처 및 참고 링크

**프로젝트 관련**:
- GitHub Repository: (설정 후 추가)
- Notion Workspace: (설정 후 추가)
- Slack Channel: (설정 후 추가)

**기술 문서**:
- Open Canvas: https://github.com/langchain-ai/open-canvas
- LangGraph Docs: https://langchain-ai.github.io/langgraphjs/
- Anthropic Docs: https://docs.anthropic.com/

**커뮤니티**:
- LangChain Discord: https://discord.gg/langchain
- Open Canvas Issues: https://github.com/langchain-ai/open-canvas/issues

---

## 📌 버전 히스토리

| 버전 | 날짜 | 변경 사항 |
|------|------|-----------|
| 1.0 | 2025-01-16 | 초안 작성 (기반: Open Canvas 분석) |

---

**작성자**: Anyon Development Team
**최종 수정**: 2025-01-16
**문서 상태**: Draft

---

이 문서는 **Anyon** 서비스 개발을 위한 마스터 플랜입니다.
궁금한 점이나 수정 사항이 있으면 언제든지 업데이트하세요!
