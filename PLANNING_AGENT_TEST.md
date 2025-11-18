# Planning Agent 테스트 가이드

## 방법 1: Interactive Script (추천)

터미널에서 직접 대화하며 PRD를 생성합니다.

### 사용법:

```bash
# 1. LangGraph 서버가 실행 중인지 확인 (이미 실행 중)
# yarn langgraphjs dev --port 54369 --no-browser

# 2. Interactive 스크립트 실행
node run_planning_interactive.js
```

### 실행 예시:

```
=== Planning Agent Interactive Test ===

Thread 생성 중...
✓ Thread 생성 완료: abc123...

📋 AI:
안녕하세요! 😊
저는 여러분의 제품 아이디어를 체계적인 PRD로 만들어드리는 AI 기획자입니다.
먼저, 어떤 제품 아이디어를 가지고 계신지 간단히 말씀해주세요!

진행률: 0%

💬 You: AI 기반 개인 맞춤형 학습 플랫폼

📋 AI:
좋은 아이디어네요! 👍
이제 얼마나 디테일하게 PRD를 작성할지 선택해주세요:
1️⃣ 빠르게 (10-15개 질문)
2️⃣ 표준 (20-30개 질문) ⭐ 추천
3️⃣ 디테일하게 (40-50개 질문)

💬 You: 2

...
```

종료하려면 `quit` 또는 `exit` 입력

---

## 방법 2: LangGraph Studio (GUI)

### 사용법:

1. 브라우저에서 다음 URL 열기:
   ```
   https://smith.langchain.com/studio?baseUrl=http://localhost:54369
   ```

2. `planning` 그래프 선택

3. GUI에서 직접 대화하며 테스트

---

## 방법 3: Direct Graph Import

Node.js 코드에서 직접 graph를 import하여 실행:

```javascript
// test_direct.js
const { prdQuestionnaireGraph } = require('./apps/agents/src/planning-agent/index');

async function test() {
  const config = { configurable: { thread_id: "test-1" } };

  // Start conversation
  let result = await prdQuestionnaireGraph.invoke(
    { messages: [] },
    config
  );

  console.log(result);
}

test();
```

---

## 방법 4: REST API (curl)

```bash
# 1. Thread 생성
THREAD_ID=$(curl -s -X POST http://localhost:54369/threads \
  -H "Content-Type: application/json" \
  -d '{"assistant_id":"planning"}' | jq -r '.thread_id')

echo "Thread ID: $THREAD_ID"

# 2. 대화 시작 (빈 메시지로 시작)
curl -X POST "http://localhost:54369/threads/$THREAD_ID/runs/stream" \
  -H "Content-Type: application/json" \
  -d '{"assistant_id":"planning","input":{"messages":[]}}'

# 3. 메시지 전송
curl -X POST "http://localhost:54369/threads/$THREAD_ID/runs/stream" \
  -H "Content-Type: application/json" \
  -d '{"assistant_id":"planning","input":{"messages":[{"role":"human","content":"AI 학습 플랫폼"}]}}'
```

---

## 템플릿 레벨 비교

| 레벨 | 질문 수 | 완성도 | 용도 |
|------|---------|--------|------|
| 1번 (빠르게) | 10-15개 | 간단 | 빠른 아이디어 정리 |
| 2번 (표준) ⭐ | 20-30개 | 완전 | 실무용 PRD |
| 3번 (디테일) | 40-50개 | 완벽 | 투자 제안용 |

---

## 생성된 PRD 확인

```bash
# Thread 상태 확인
curl http://localhost:54369/threads/$THREAD_ID/state | jq '.values.prdContent'

# 완성도 확인
curl http://localhost:54369/threads/$THREAD_ID/state | jq '.values.completenessScore'
```

---

## 문제 해결

### LangGraph 서버가 실행되지 않는 경우:

```bash
yarn langgraphjs dev --port 54369 --no-browser
```

### Port 충돌:

다른 포트 사용:
```bash
yarn langgraphjs dev --port 54370 --no-browser
```

그리고 스크립트에서 `BASE_URL` 수정
