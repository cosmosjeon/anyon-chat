# PRD Questionnaire Agent

AI가 10개의 질문을 통해 대화하면서 PRD(Product Requirements Document)를 자동으로 생성하는 LangGraph 에이전트입니다.

## 📋 기능

- **대화형 질문 플로우**: 10개의 구조화된 질문으로 제품 정보 수집
- **실시간 PRD 생성**: 답변할 때마다 오른쪽 캔버스에 PRD가 점진적으로 업데이트
- **스마트 후속 질문**: 사용자 답변에 따라 동적으로 후속 질문 생성
- **최종 PRD 완성**: 모든 질문 완료 후 AI가 완전한 PRD 문서 생성

## 🗂️ 구조

```
planning-agent/
├── state.ts                    # 그래프 상태 정의
├── types.ts                    # TypeScript 타입 정의
├── questions.ts                # 10개 질문 데이터 및 플로우 로직
├── prompts.ts                  # AI 프롬프트 템플릿
├── nodes/
│   ├── askQuestion.ts          # 질문 생성 노드
│   ├── processAnswer.ts        # 답변 처리 노드
│   ├── updatePRD.ts            # PRD 점진적 업데이트 노드
│   └── generateFinalPRD.ts     # 최종 PRD 생성 노드
└── index.ts                    # LangGraph 그래프 정의
```

## 🔄 플로우

```
START
  ↓
askQuestion (첫 질문 생성)
  ↓
[사용자 답변 대기]
  ↓
processAnswer (답변 처리 + 다음 질문 결정)
  ↓
완료? ─No─→ updatePRD (PRD 업데이트) → askQuestion
  ↓ Yes
generateFinalPRD (최종 PRD 생성)
  ↓
END
```

## 📝 질문 플로우

1. **Q1**: 제품 한 줄 설명
2. **Q2**: 핵심 문제
   - Q2-1: 문제의 영향
3. **Q3**: 타겟 사용자
   - Q3-1: 타겟 구체화
4. **Q4**: 기존 해결 방법
   - Q4-1: 기존 솔루션의 한계
5. **Q5**: 핵심 가치
6. **Q6**: 비즈니스 모델
   - Q6-1: 무료/유료 구분
   - Q6-2: 가격 설정
   - **Q6-3: 전환 전략** (신규)
7. **Q7**: 핵심 기능
   - Q7-1: 기능별 설명
8. **Q8**: MVP 범위
9. **Q9**: 성공 지표
   - Q9-1: 구체적 목표
10. **Q10**: 출시 계획
11. **Q11: 리스크** (신규)

## 🚀 사용 방법

### 백엔드 (이미 완료)

LangGraph 서버에 자동으로 등록됨:
- Graph ID: `prd_questionnaire`
- Endpoint: `http://localhost:54367`

### 프론트엔드 통합

1. **새 스레드 생성**
```typescript
const thread = await client.threads.create({
  metadata: { mode: "prd_questionnaire" }
});
```

2. **첫 질문 받기**
```typescript
const stream = client.runs.stream(thread.thread_id, "prd_questionnaire", {
  input: { messages: [] }
});

for await (const chunk of stream) {
  if (chunk.event === "messages/partial") {
    // AI 질문 표시
  }
  if (chunk.data?.artifact) {
    // PRD 캔버스에 표시
  }
}
```

3. **사용자 답변 전송**
```typescript
const stream = client.runs.stream(thread.thread_id, "prd_questionnaire", {
  input: {
    messages: [{ role: "human", content: userAnswer }]
  }
});
```

4. **완료 확인**
```typescript
if (chunk.data?.isComplete) {
  // 최종 PRD 생성 완료
}
```

## 🎨 State 구조

```typescript
{
  messages: BaseMessage[];              // 대화 히스토리
  currentQuestionId: string;            // 현재 질문 ID
  completedQuestions: string[];         // 완료된 질문 목록
  answers: Answer[];                    // 수집된 답변
  prdData: Partial<PRDData>;            // 구조화된 PRD 데이터
  prdContent: string;                   // PRD 마크다운 콘텐츠
  artifact: ArtifactV3;                 // 캔버스 아티팩트
  isComplete: boolean;                  // 완료 여부
}
```

## 🔧 커스터마이징

### 질문 추가/수정

`questions.ts` 파일에서 `QUESTIONS` 객체 수정:

```typescript
export const QUESTIONS: Record<string, Question> = {
  q11_new_question: {
    id: "q11_new_question",
    question: "새로운 질문?",
    type: "text",
    placeholder: "예시 답변...",
  }
};
```

### PRD 템플릿 수정

`nodes/updatePRD.ts`의 `generateProgressivePRD` 함수 또는
`prompts.ts`의 `FINAL_PRD_PROMPT` 수정

## 📊 생성되는 PRD 구조

1. 제품 개요
2. 문제 정의 (표 형식)
3. 타겟 사용자 (페르소나 포함)
4. 기존 솔루션 분석 (표 형식)
5. 핵심 가치 제안
6. 비즈니스 모델 (요금제 표, 전환 전략, 수익 예측)
7. 핵심 기능 (입출력/예외 처리)
8. 사용자 플로우
9. 성공 지표 (KPI + 퍼널)
10. 출시 계획
11. 리스크 및 대응 (표 형식)

## 🐛 디버깅

LangGraph Studio에서 그래프 시각화:
```
https://smith.langchain.com/studio?baseUrl=http://localhost:54367
```

로그 확인:
```bash
yarn langgraphjs dev --port 54367
```

## 📄 라이선스

프로젝트 라이선스 참조
