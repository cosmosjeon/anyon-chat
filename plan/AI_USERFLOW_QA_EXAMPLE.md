# AI 유저 플로우 생성 - PRD 기반 질문답변 & 결과물 예시

> **목적**: 이미 생성된 PRD를 기반으로, 개발에 필요한 상세 유저 플로우 문서를 생성하기 위한 추가 질문-답변 과정

> **전제 조건**: Planning Agent를 통해 PRD가 이미 생성되어 다음 정보를 이미 알고 있음
> - ✅ 제품명, 한 줄 설명, 비전
> - ✅ 핵심 문제 및 타겟 사용자
> - ✅ 핵심 기능 3-5개
> - ✅ 비즈니스 모델 (가격, 요금제)
> - ✅ 기본 사용자 플로우 (간략한 단계)
> - ✅ MVP 범위

---

## 📋 프로젝트 예시: "TaskFlow" - 스마트 할 일 관리 앱

### 기존 PRD 요약 (Planning Agent에서 생성됨)

```markdown
# TaskFlow PRD

## 제품 개요
- **제품명**: TaskFlow
- **한 줄 요약**: AI가 자동으로 우선순위를 정해주는 할 일 관리 앱
- **타겟 사용자**: 2030 직장인, 할 일이 많아 우선순위 파악이 어려운 사람들

## 핵심 기능
1. 할 일 추가/완료 (음성 입력 가능)
2. AI 자동 우선순위 정렬
3. 데일리 생산성 리포트

## 비즈니스 모델
- Freemium: 무료(하루 3회) → 프리미엄(월 14,900원, 무제한)

## 기본 사용자 플로우
앱 다운 → 로그인 → 할 일 추가 → AI 분석 → 완료 → 리포트 확인 → 유료 전환
```

---

## 💬 Part 1: PRD 기반 유저 플로우 질문-답변 세션

### 🤖 AI: 인사 및 PRD 확인

```
안녕하세요! TaskFlow의 PRD를 확인했습니다.

이미 파악한 정보:
✅ AI 우선순위 할 일 관리 앱
✅ 핵심 기능: 음성 입력, AI 우선순위, 생산성 리포트
✅ 타겟: 2030 직장인
✅ Freemium 모델 (무료 3회 → 월 14,900원)

이제 개발에 필요한 상세 유저 플로우를 만들기 위해
몇 가지 추가 질문을 드리겠습니다. (약 5-7개 예상)
```

---

### 🤖 AI: 질문 1 - 플랫폼 & 기술 스택

```
Q1. 어떤 플랫폼으로 개발하시나요?
(개발 환경을 선택하면 그에 맞는 코드 예시를 제공합니다)
```

**선택지:**
1. **React Native + Expo** - iOS/Android 동시 개발, 빠른 프로토타입
2. **Next.js (웹 앱)** - 데스크톱 우선, SEO 중요
3. **Flutter** - 고성능 네이티브 느낌, 복잡한 애니메이션
4. **React.js (웹 전용)** - 웹 앱, 반응형
5. **Swift/SwiftUI (iOS 전용)** - Apple 생태계 최적화
6. **기타** - 직접 입력

**👤 사용자 답변:**
```
1번 - React Native + Expo
```

---

### 🤖 AI: 질문 2 - 화면 구조 및 내비게이션

```
Q2. TaskFlow는 총 몇 개의 주요 화면이 필요한가요?
각 화면의 이름과 목적을 알려주세요.

예시:
- 로그인 화면
- 메인 화면 (할 일 목록)
- 통계 화면
```

**👤 사용자 답변:**
```
1. 스플래시 화면 (앱 로고, 2초)
2. 로그인 화면 (Google/Apple 소셜 로그인)
3. 메인 화면 (할 일 목록 + AI 우선순위 표시)
4. 할 일 추가 모달 (텍스트/음성 입력)
5. 통계 화면 (주간/월간 생산성 리포트)
```

---

### 🤖 AI: 질문 3 - 핵심 화면 상세 (메인 화면)

```
PRD에 "할 일 추가/완료"와 "AI 우선순위 정렬" 기능이 있는데,
메인 화면에서 사용자가 구체적으로 무엇을 보고 어떤 행동을 하나요?

Q3-1. 메인 화면 구성:
- 상단에는 무엇이 있나요?
- 할 일 카드에는 어떤 정보가 표시되나요?
- 어떤 인터랙션이 가능한가요? (탭, 스와이프 등)
```

**👤 사용자 답변:**
```
【메인 화면 구성】

상단:
- "오늘의 할 일" 제목 + 날짜
- 우측에 필터 아이콘 (전체/완료/미완료)

할 일 카드 (우선순위 순으로 정렬):
- 좌측: 체크박스
- 중앙: 할 일 제목
- 우선순위 라벨: 🔥긴급 (빨강) / ⭐중요 (주황) / 📌보통 (회색)
- 우측: 생성 시간
- 완료된 건 회색+취소선

인터랙션:
1. 체크박스 탭 → 완료 처리 (진동 피드백)
2. 카드 좌측 스와이프 → 삭제
3. 카드 탭 → 상세 보기 (추후 구현)
4. 하단 플로팅 "+" 버튼 → 추가 모달

모든 할 일 완료 시:
- 축하 애니메이션 (Lottie confetti)
- "오늘 할 일 완료! 🎉" 토스트
```

---

### 🤖 AI: 질문 4 - 핵심 기능 상세 (음성 입력)

```
PRD에서 "음성 입력"이 핵심 차별화 포인트인데,
정확히 어떤 방식으로 동작하나요?

Q4. 음성 입력 플로우:
- 언제 음성 입력을 사용하나요?
- 어떤 UI/버튼으로 시작하나요?
- 녹음 중일 때 사용자는 무엇을 보나요?
- AI가 어떻게 우선순위를 판단하나요?
```

**👤 사용자 답변:**
```
【음성 입력 플로우】

시작:
- 할 일 추가 모달에서 마이크 버튼 표시
- 버튼을 "길게 누르고 있는 동안" 녹음
- 손을 떼면 녹음 종료

녹음 중 UI:
- 마이크 버튼 색상 변경 (보라 → 빨강)
- 중앙에 음파 애니메이션
- "말씀하세요..." 텍스트

처리 과정:
1. 음성 → 텍스트 변환 (OpenAI Whisper API)
   - 로딩 스피너 0.5-1초
2. 텍스트 → AI 우선순위 분석 (GPT-4)
   - "오늘 회의 준비" → "긴급"
   - "책 읽기" → "보통"
3. 결과 미리보기: "AI가 '긴급'으로 분류했어요"

권한 처리:
- 첫 사용 시 마이크 권한 요청
- 거부 시: "설정으로 이동" 버튼 표시
```

---

### 🤖 AI: 질문 5 - 상태 관리 & 데이터

```
Q5. 앱에서 관리해야 하는 데이터는 무엇이고,
어떻게 저장하시나요?

1. 로컬 상태 (앱 내부)
2. 서버 데이터 (API)
3. 상태 관리 라이브러리 (Zustand, Redux 등)
```

**👤 사용자 답변:**
```
【데이터 구조】

상태 관리: Zustand 사용

로컬 상태:
- user: { id, email, name, isPremium }
- tasks: Task[]
- filter: 'all' | 'completed' | 'incomplete'
- darkMode: boolean

Task 타입:
{
  id: string
  title: string
  priority: 'urgent' | 'important' | 'normal'
  completed: boolean
  createdAt: string
}

서버 데이터 (Supabase):
- users 테이블
- tasks 테이블 (user_id 외래키)
- productivity_stats 테이블 (일별 완료 개수, 점수)

오프라인 지원:
- AsyncStorage에 로컬 캐싱
- 온라인 복구 시 서버와 동기화
```

---

### 🤖 AI: 질문 6 - API 엔드포인트

```
Q6. 백엔드 API가 필요한 기능과 엔드포인트를 알려주세요.

예시:
- POST /api/tasks - 할 일 추가
- GET /api/tasks - 할 일 목록 조회
```

**👤 사용자 답변:**
```
【API 엔드포인트】

인증:
- Firebase Auth (Google/Apple 로그인)

할 일 관리:
- POST   /api/tasks          - 할 일 추가
- GET    /api/tasks          - 목록 조회 (쿼리: ?filter=all)
- PUT    /api/tasks/:id      - 완료/수정
- DELETE /api/tasks/:id      - 삭제

AI 기능:
- POST   /api/ai/prioritize  - 우선순위 분석
  Request: { "text": "오늘 회의 준비" }
  Response: { "priority": "urgent", "confidence": 0.95 }

통계:
- GET    /api/stats/weekly   - 주간 통계
  Response: { score: 80, completedCount: 24, dailyData: [...] }
```

---

### 🤖 AI: 질문 7 - UI/UX 스타일 및 애니메이션

```
Q7-1. 디자인 스타일과 색상 팔레트가 있나요?

Q7-2. 중요한 애니메이션이나 인터랙션이 있나요?
(예: 완료 시 애니메이션, 화면 전환 효과 등)
```

**👤 사용자 답변:**
```
【디자인 스타일】

컨셉: 미니멀 + 포인트 컬러

색상 팔레트:
- Primary: #6366F1 (보라)
- Success: #10B981 (초록)
- Warning: #F59E0B (주황)
- Error: #EF4444 (빨강)
- Gray: #6B7280
- Background: #F9FAFB (라이트) / #111827 (다크)

타이포그래피:
- 제목: 20px, Bold
- 본문: 16px, Regular
- 작은 텍스트: 14px, Medium

【애니메이션】

1. 완료 체크:
   - 햅틱 피드백 (진동)
   - 체크 애니메이션 300ms
   - 카드가 회색으로 변하며 맨 아래로 이동 (500ms)

2. 삭제:
   - 좌측 스와이프로 빨간 배경 노출
   - 확인 후 좌측으로 슬라이드 out (300ms)

3. 전체 완료:
   - Lottie confetti 애니메이션
   - 토스트 메시지

4. 화면 전환:
   - 모든 전환 300ms 기본
   - 모달: 하단에서 slide-up

5. 통계 화면:
   - 점수 카운트업 애니메이션 (0→80, 2초)
```

---

### 🤖 AI: 질문 8 - 특별 요구사항

```
Q8. 마지막으로, 개발할 때 특히 신경 써야 할 부분이 있나요?

예시:
- 권한 처리 (마이크, 알림)
- 오프라인 모드
- 접근성
- 성능 최적화
```

**👤 사용자 답변:**
```
【특별 요구사항】

1. 마이크 권한 처리 (핵심!)
   - 음성 입력이 핵심 기능이므로 중요
   - 거부 시에도 텍스트 입력 가능하도록
   - 설정 링크 제공

2. 애니메이션 중요
   - 모든 인터랙션에 부드러운 전환 (300ms)
   - 햅틱 피드백 필수

3. 다크모드 지원
   - 시스템 설정 따르기
   - 수동 토글도 가능

4. 오프라인 모드
   - 로컬 저장 후 온라인 시 동기화
   - 낙관적 업데이트 (Optimistic UI)

5. 성능
   - FlatList 가상화 (할 일 많을 때)
   - 이미지/애니메이션 최적화
```

---

## ✅ Part 2: AI가 생성한 최종 유저 플로우 문서

> 아래는 **PRD + 추가 질문-답변**을 바탕으로 AI가 자동 생성한 완전한 개발 문서입니다.

---

# TaskFlow - AI 할 일 관리 앱 상세 유저 플로우

> **자동 생성일**: 2025-11-19
> **기반 문서**: TaskFlow PRD v1.0
> **개발 대상**: AI 코딩 에이전트 (Claude Code, Cursor 등)

---

## 🎯 PRD 요약 (이미 정의됨)

| 항목 | 내용 |
|------|------|
| **제품명** | TaskFlow |
| **핵심 가치** | AI가 자동으로 우선순위를 정해주는 할 일 관리 |
| **타겟 사용자** | 2030 직장인, 할 일이 많아 우선순위 파악 어려운 사람 |
| **핵심 기능** | 1) 음성 입력 2) AI 우선순위 3) 생산성 리포트 |
| **비즈니스 모델** | Freemium (무료 3회 → 월 14,900원) |

---

## 🏗️ 기술 스택

### Frontend
- **Framework**: React Native + Expo SDK 51
- **Navigation**: React Navigation 6
- **State Management**: Zustand
- **UI Library**: NativeWind (Tailwind for RN)
- **Animation**: react-native-reanimated, Lottie
- **Voice Input**: expo-av + OpenAI Whisper API
- **Haptics**: expo-haptics

### Backend
- **API**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Auth**: Firebase Auth (Google, Apple)
- **AI**: OpenAI GPT-4 (우선순위 분석)

### Design System
```javascript
const colors = {
  primary: '#6366F1',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  gray: '#6B7280',
  bgLight: '#F9FAFB',
  bgDark: '#111827'
};

const typography = {
  title: { fontSize: 20, fontWeight: 'bold' },
  body: { fontSize: 16, fontWeight: 'normal' },
  small: { fontSize: 14, fontWeight: '500' }
};

const animation = {
  default: 300, // ms
  slow: 500,
  countUp: 2000
};
```

---

## 📊 데이터 구조

### Zustand Store

```typescript
// store/app.ts
interface AppStore {
  // User
  user: {
    id: string;
    email: string;
    name: string;
    isPremium: boolean;
  } | null;

  // Tasks
  tasks: Task[];
  filter: 'all' | 'completed' | 'incomplete';

  // UI
  darkMode: boolean;

  // Actions
  setUser: (user: User) => void;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  fetchTasks: () => Promise<void>;
  setFilter: (filter: Filter) => void;
}

interface Task {
  id: string;
  title: string;
  priority: 'urgent' | 'important' | 'normal';
  completed: boolean;
  createdAt: string;
  userId: string;
}
```

### Database Schema (Supabase)

```sql
-- users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,

  INDEX idx_user_priority (user_id, priority, completed)
);

-- productivity_stats
CREATE TABLE productivity_stats (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed_count INTEGER DEFAULT 0,
  score INTEGER CHECK (score >= 0 AND score <= 100),

  UNIQUE(user_id, date)
);
```

---

## 🎬 상세 유저 플로우 (Given-When-Then)

### 1️⃣ 앱 첫 실행 - 스플래시 & 로그인

**Given (초기 상태)**
- 사용자가 앱스토어에서 TaskFlow 다운로드 완료
- 앱이 설치되어 있음
- 로그인 정보 없음

**When (사용자 행동)**
1. 홈 화면에서 TaskFlow 아이콘 탭
2. 스플래시 화면 표시 (2초)
3. 자동으로 로그인 화면 전환
4. "Google로 계속하기" 버튼 탭
5. Google 계정 선택 및 승인

**Then (시스템 응답)**

**스플래시 화면 (2초):**
- 중앙: TaskFlow 로고 (SVG, 120px)
- 배경: 그라디언트 (#6366F1 → #8B5CF6)
- 하단: "AI가 도와주는 할 일 관리" 문구
- 페이드인 애니메이션 (500ms)

**로그인 화면:**
- 상단: 로고 + "TaskFlow" + 캐치프레이즈
- 중앙: 2개 버튼
  - "Google로 계속하기" (흰 배경, Google 아이콘)
  - "Apple로 계속하기" (검정 배경, Apple 아이콘)
- 하단: "서비스 약관 동의" 안내 (12px, Gray)

**로그인 성공:**
- 로딩 인디케이터 (1초)
- Firebase 토큰 받아옴
- Zustand store에 사용자 저장
- 메인 화면으로 이동 (fade 300ms)

**로그인 실패:**
- 토스트: "로그인에 실패했습니다"
- 버튼 다시 활성화

**UI 코드:**
```jsx
// app/login.tsx
<LoginScreen>
  <View style={{ flex: 1, padding: 24 }}>
    {/* 상단 */}
    <View style={{ flex: 0.4, justifyContent: 'center', alignItems: 'center' }}>
      <Image source={require('@/assets/logo.svg')} style={{ width: 100, height: 100 }} />
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 16 }}>TaskFlow</Text>
      <Text style={{ fontSize: 16, color: colors.gray, marginTop: 8 }}>
        작업을 똑똑하게 관리하세요
      </Text>
    </View>

    {/* 로그인 버튼 */}
    <View style={{ flex: 0.6, justifyContent: 'center', gap: 16 }}>
      <SocialButton
        provider="google"
        onPress={handleGoogleLogin}
        loading={loading}
      />
      <SocialButton
        provider="apple"
        onPress={handleAppleLogin}
        loading={loading}
      />
    </View>
  </View>
</LoginScreen>
```

**로직:**
```typescript
const handleGoogleLogin = async () => {
  try {
    setLoading(true);
    const result = await GoogleSignin.signIn();
    const credential = GoogleAuthProvider.credential(result.idToken);
    const userCredential = await signInWithCredential(auth, credential);

    // Zustand 저장
    setUser({
      id: userCredential.user.uid,
      email: userCredential.user.email!,
      name: userCredential.user.displayName!,
      isPremium: false
    });

    router.replace('/main');
  } catch (error) {
    showToast('로그인에 실패했습니다');
  } finally {
    setLoading(false);
  }
};
```

---

### 2️⃣ 메인 화면 (할 일 목록 + AI 우선순위)

**Given**
- 로그인 완료
- 사용자 정보가 Zustand store에 저장됨
- 할 일 목록이 비어있거나 데이터 있음

**When**
1. 메인 화면 진입
2. API로 할 일 목록 조회 (`GET /api/tasks`)
3. AI가 우선순위 순으로 정렬
4. 사용자 인터랙션:
   - 체크박스 탭 → 완료
   - 좌측 스와이프 → 삭제
   - 카드 탭 → 상세 (v2)
   - "+" 버튼 → 추가 모달

**Then**

**화면 구성:**

**상단 헤더:**
- 좌측: "오늘의 할 일" + 날짜
- 우측: 필터 아이콘

**할 일 카드 리스트 (FlatList):**
각 카드:
- 좌측: 체크박스 (24px, 원형)
- 중앙:
  - 할 일 제목 (16px)
  - 우선순위 라벨 (🔥긴급/⭐중요/📌보통)
- 우측: 생성 시간 (14px, Gray)
- 완료: 회색 + 취소선
- 간격: 12px

**빈 상태:**
- 중앙 일러스트
- "아직 할 일이 없어요"
- "아래 + 버튼을 눌러 추가해보세요"

**플로팅 버튼:**
- 우측 하단 고정
- 보라색 원형 (64px)
- "+" 아이콘 (흰색)

**인터랙션 응답:**

1. **체크박스 탭:**
   ```
   → 햅틱 피드백 (진동)
   → 체크 애니메이션 300ms
   → 카드 회색 변경 + 맨 아래 이동 500ms
   → API: PUT /api/tasks/:id { completed: true }
   ```

2. **좌측 스와이프:**
   ```
   → 빨간 배경 노출 (삭제 아이콘)
   → 삭제 탭 시 확인 모달
   → 확인 → 좌측 슬라이드 out 300ms
   → API: DELETE /api/tasks/:id
   ```

3. **전체 완료 시:**
   ```
   → Lottie confetti 애니메이션
   → 토스트: "오늘 할 일을 모두 완료했어요! 🎉"
   ```

**UI 코드:**
```jsx
// app/main.tsx
<MainScreen>
  <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgLight }}>
    {/* 헤더 */}
    <View style={styles.header}>
      <View>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>오늘의 할 일</Text>
        <Text style={{ fontSize: 14, color: colors.gray }}>
          {format(new Date(), 'yyyy년 MM월 dd일')}
        </Text>
      </View>
      <IconButton icon="filter" onPress={openFilterModal} />
    </View>

    {/* 리스트 */}
    {tasks.length === 0 ? (
      <EmptyState />
    ) : (
      <FlatList
        data={sortedTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Swipeable renderRightActions={() => <DeleteAction />}>
            <TaskCard
              task={item}
              onToggle={() => handleToggle(item.id)}
            />
          </Swipeable>
        )}
        contentContainerStyle={{ padding: 16, gap: 12 }}
      />
    )}

    {/* 플로팅 버튼 */}
    <FloatingButton onPress={() => setShowAddModal(true)}>
      <PlusIcon color="white" size={32} />
    </FloatingButton>
  </SafeAreaView>
</MainScreen>
```

**TaskCard 컴포넌트:**
```jsx
// components/TaskCard.tsx
const priorityConfig = {
  urgent: { icon: '🔥', label: '긴급', color: colors.error },
  important: { icon: '⭐', label: '중요', color: colors.warning },
  normal: { icon: '📌', label: '보통', color: colors.gray }
};

const TaskCard = ({ task, onToggle }) => {
  const config = priorityConfig[task.priority];

  return (
    <Pressable style={[styles.card, task.completed && styles.completed]}>
      <Checkbox checked={task.completed} onPress={onToggle} />

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[styles.title, task.completed && styles.strikethrough]}>
          {task.title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <Badge
            icon={config.icon}
            label={config.label}
            color={config.color}
          />
          <Text style={{ fontSize: 12, color: colors.gray, marginLeft: 8 }}>
            {formatRelativeTime(task.createdAt)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};
```

**로직:**
```typescript
const handleToggle = async (id: string) => {
  try {
    // 햅틱 피드백
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // 낙관적 업데이트
    toggleTaskOptimistic(id);

    // API 호출
    await api.put(`/tasks/${id}`, { completed: true });

    // 전체 완료 확인
    const allDone = tasks.every(t => t.completed);
    if (allDone) {
      showConfetti();
      showToast('오늘 할 일을 모두 완료했어요! 🎉');
    }
  } catch (error) {
    toggleTaskOptimistic(id); // 롤백
    showToast('완료 처리에 실패했습니다');
  }
};
```

---

### 3️⃣ 할 일 추가 모달 (음성 입력 핵심!)

**Given**
- 메인 화면에서 "+" 버튼 클릭
- 모달 열림
- 마이크 권한: 미설정/허용/거부

**When**
1. 모달이 하단에서 slide-up (300ms)
2. 텍스트 입력창 자동 포커스
3. 옵션 A: 텍스트 직접 입력
4. 옵션 B: 마이크 버튼 길게 누르기 (핵심!)
5. "추가하기" 버튼 탭

**Then**

#### 옵션 B: 음성 입력 (핵심 플로우!)

**첫 사용 시:**
```
1. 마이크 버튼 탭
2. 시스템 권한 팝업: "TaskFlow가 마이크 접근 요청"
3. "허용" 선택
```

**권한 허용 후:**
```
1. 마이크 버튼 길게 누르고 있는 동안 녹음
   → 버튼 색상: 보라 → 빨강
   → 중앙에 음파 애니메이션
   → "말씀하세요..." 텍스트

2. 손 떼면 녹음 종료

3. AI 음성 인식 (Whisper API):
   → 로딩 스피너 (0.5-1초)
   → 텍스트 변환: "오늘 회의 준비"
   → 입력창에 자동 입력

4. AI 우선순위 분석 (GPT-4):
   → API 호출: POST /api/ai/prioritize
   → 0.3초 후 응답: { priority: "urgent", confidence: 0.95 }
   → 미리보기: "✨ AI가 '긴급'으로 분류했어요"
```

**권한 거부 시:**
```
→ 토스트: "음성 입력을 사용하려면 마이크 권한이 필요해요"
→ "설정으로 이동" 버튼 표시
→ 텍스트 입력은 여전히 가능
```

**추가 완료:**
```
→ 모달 slide-down (300ms)
→ 메인 리스트 최상단에 새 카드 추가 (fade-in)
→ 토스트: "할 일이 추가되었어요"
```

**UI 코드:**
```jsx
// components/AddTaskModal.tsx
<Modal visible={visible} animationType="slide">
  <View style={styles.container}>
    {/* 헤더 */}
    <View style={styles.header}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>새 할 일</Text>
      <IconButton icon="x" onPress={onClose} />
    </View>

    {/* 입력 영역 */}
    <View style={{ flex: 1, padding: 24 }}>
      {/* 텍스트 입력 */}
      <TextInput
        ref={inputRef}
        placeholder="할 일을 입력하세요"
        value={text}
        onChangeText={setText}
        maxLength={100}
        multiline
        style={styles.input}
      />
      <Text style={{ fontSize: 12, color: colors.gray, textAlign: 'right' }}>
        {text.length}/100
      </Text>

      {/* 음성 입력 */}
      <View style={{ alignItems: 'center', marginTop: 32 }}>
        <Text style={{ fontSize: 14, color: colors.gray, marginBottom: 16 }}>
          또는 음성으로 입력하세요
        </Text>

        <Pressable
          onLongPress={startRecording}
          onPressOut={stopRecording}
          style={[
            styles.micButton,
            isRecording && styles.micButtonRecording
          ]}
        >
          <MicIcon color="white" size={32} />
        </Pressable>

        {isRecording && (
          <Animated.View style={styles.waveAnimation}>
            <WaveForm />
            <Text style={{ color: colors.primary, marginTop: 16 }}>
              말씀하세요...
            </Text>
          </Animated.View>
        )}

        {transcribing && <ActivityIndicator size="small" />}
      </View>

      {/* AI 우선순위 미리보기 */}
      {aiPriority && (
        <View style={styles.aiPreview}>
          <SparkleIcon size={16} />
          <Text style={{ fontSize: 14, color: colors.primary }}>
            AI가 '{priorityLabels[aiPriority]}'로 분류했어요
          </Text>
        </View>
      )}
    </View>

    {/* 추가 버튼 */}
    <Button
      title="추가하기"
      onPress={handleAdd}
      disabled={!text.trim()}
    />
  </View>
</Modal>
```

**음성 입력 로직:**
```typescript
const startRecording = async () => {
  // 권한 확인
  const { status } = await Audio.requestPermissionsAsync();

  if (status !== 'granted') {
    showToast('음성 입력을 사용하려면 마이크 권한이 필요해요');
    Alert.alert(
      '마이크 권한 필요',
      '설정에서 권한을 허용해주세요',
      [
        { text: '취소', style: 'cancel' },
        { text: '설정으로', onPress: () => Linking.openSettings() }
      ]
    );
    return;
  }

  // 녹음 시작
  setIsRecording(true);
  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
  await recording.startAsync();
  recordingRef.current = recording;
};

const stopRecording = async () => {
  setIsRecording(false);

  await recordingRef.current.stopAndUnloadAsync();
  const uri = recordingRef.current.getURI();

  // AI 음성 인식 (Whisper)
  setTranscribing(true);
  const transcribed = await transcribeAudio(uri);
  setText(transcribed);

  // AI 우선순위 분석 (GPT-4)
  const priority = await analyzePriority(transcribed);
  setAiPriority(priority);

  setTranscribing(false);
};

// Whisper API 호출
const transcribeAudio = async (audioUri: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', {
    uri: audioUri,
    type: 'audio/m4a',
    name: 'recording.m4a'
  } as any);
  formData.append('model', 'whisper-1');

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
    body: formData
  });

  const data = await res.json();
  return data.text;
};

// GPT-4 우선순위 분석
const analyzePriority = async (text: string): Promise<Priority> => {
  const res = await fetch('/api/ai/prioritize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });

  const data = await res.json();
  return data.priority; // 'urgent' | 'important' | 'normal'
};
```

---

### 4️⃣ 통계 화면 (주간 생산성 리포트)

**Given**
- 사용자가 3일 이상 앱 사용
- 완료 데이터 누적됨
- 메인 화면 상단 통계 아이콘 탭

**When**
1. 통계 화면으로 전환
2. API: `GET /api/stats/weekly`
3. 데이터 로딩 (1초)

**Then**

**화면 구성:**

**상단 헤더:**
- "이번 주 생산성"
- 기간: "2025.11.13 - 2025.11.19"

**점수 카드:**
- 원형 progress (200px)
- 점수: 80/100 (카운트업 애니메이션 2초)
- 등급: "Excellent! 🎉" (초록)

**상세 통계:**
- 완료한 할 일: 24개
- 평균 완료: 3.4개/일
- 가장 생산적인 요일: 화요일

**우선순위 분포 (Bar):**
- 긴급: 8개 (33%)
- 중요: 10개 (42%)
- 보통: 6개 (25%)

**주간 그래프:**
- 막대 그래프 (월~일)
- 가장 높은 막대 하이라이트

**UI 코드:**
```jsx
// app/stats.tsx
<StatsScreen>
  <ScrollView>
    <View style={styles.header}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>이번 주 생산성</Text>
      <Text style={{ fontSize: 14, color: colors.gray }}>
        {startDate} - {endDate}
      </Text>
    </View>

    {/* 점수 카드 */}
    <View style={styles.scoreCard}>
      <AnimatedCircularProgress
        size={200}
        width={20}
        fill={stats.score}
        duration={2000}
        tintColor={colors.primary}
      >
        {(fill) => (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 48, fontWeight: 'bold' }}>
              {Math.round(fill)}
            </Text>
            <Text style={{ fontSize: 16, color: colors.gray }}>/ 100</Text>
          </View>
        )}
      </AnimatedCircularProgress>

      <Text style={styles.grade}>Excellent! 🎉</Text>
    </View>

    {/* 상세 통계 */}
    <View style={styles.statsGrid}>
      <StatItem label="완료한 할 일" value={`${stats.total}개`} />
      <StatItem label="평균 완료" value={`${stats.avg}개/일`} />
      <StatItem label="가장 생산적인 요일" value={stats.bestDay} />
    </View>

    {/* 우선순위 분포 */}
    <SectionTitle>우선순위별 분포</SectionTitle>
    <PriorityBar label="긴급" count={8} percent={33} color={colors.error} />
    <PriorityBar label="중요" count={10} percent={42} color={colors.warning} />
    <PriorityBar label="보통" count={6} percent={25} color={colors.gray} />

    {/* 주간 그래프 */}
    <SectionTitle>일별 완료 현황</SectionTitle>
    <BarChart
      data={weeklyData}
      width={screenWidth - 48}
      height={220}
    />
  </ScrollView>
</StatsScreen>
```

---

## 🔌 API 명세

### 1. 할 일 추가
```http
POST /api/tasks
Authorization: Bearer {firebase_token}
Content-Type: application/json

Request:
{
  "title": "오늘 회의 준비",
  "priority": "urgent"
}

Response (201):
{
  "success": true,
  "task": {
    "id": "uuid-1234",
    "title": "오늘 회의 준비",
    "priority": "urgent",
    "completed": false,
    "createdAt": "2025-11-19T10:30:00Z"
  }
}
```

### 2. 할 일 목록 조회
```http
GET /api/tasks?filter=all
Authorization: Bearer {firebase_token}

Response (200):
{
  "tasks": [
    {
      "id": "uuid-1234",
      "title": "오늘 회의 준비",
      "priority": "urgent",
      "completed": false,
      "createdAt": "2025-11-19T10:30:00Z"
    }
  ]
}
```

### 3. 할 일 완료
```http
PUT /api/tasks/:id
Authorization: Bearer {firebase_token}
Content-Type: application/json

Request:
{
  "completed": true
}

Response (200):
{
  "success": true,
  "task": {
    "id": "uuid-1234",
    "completed": true,
    "completedAt": "2025-11-19T14:30:00Z"
  }
}
```

### 4. 할 일 삭제
```http
DELETE /api/tasks/:id
Authorization: Bearer {firebase_token}

Response (204)
```

### 5. AI 우선순위 분석
```http
POST /api/ai/prioritize
Authorization: Bearer {firebase_token}
Content-Type: application/json

Request:
{
  "text": "오늘 회의 준비"
}

Response (200):
{
  "priority": "urgent",
  "confidence": 0.95,
  "reason": "시간 제약('오늘')이 있는 작업으로 판단"
}
```

### 6. 주간 통계
```http
GET /api/stats/weekly
Authorization: Bearer {firebase_token}

Response (200):
{
  "score": 80,
  "totalCompleted": 24,
  "averagePerDay": 3.4,
  "bestDay": "Tuesday",
  "priorityDistribution": {
    "urgent": 8,
    "important": 10,
    "normal": 6
  },
  "dailyData": [
    { "day": "Mon", "count": 3 },
    { "day": "Tue", "count": 6 },
    ...
  ]
}
```

---

## 🎨 화면 레이아웃 다이어그램

### 메인 화면

```
┌─────────────────────────────┐
│  오늘의 할 일       [필터] │  ← 80px
│  2025년 11월 19일           │
├─────────────────────────────┤
│                             │
│  ┌─────────────────────┐   │
│  │ ☐ 오늘 회의 준비    │   │  ← 72px
│  │ 🔥 긴급   2시간 전  │   │     gap: 12px
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │ ☐ 프로젝트 기획     │   │
│  │ ⭐ 중요   어제      │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │ ☑ 이메일 확인       │   │  ← 완료 (회색)
│  │ 📌 보통   5시간 전  │   │
│  └─────────────────────┘   │
│                             │
│                    ┌────┐  │  ← 64px
│                    │ +  │  │     우하단
│                    └────┘  │
└─────────────────────────────┘
```

### 할 일 추가 모달

```
┌─────────────────────────────┐
│  새 할 일            [X]    │
├─────────────────────────────┤
│  ┌─────────────────────┐   │
│  │ 할 일을 입력...    │   │  ← 120px
│  │                     │   │
│  └─────────────────────┘   │
│  0/100                     │
│                             │
│  또는 음성으로 입력하세요    │
│                             │
│          ┌──────┐           │  ← 80px
│          │  🎤  │           │     보라색
│          └──────┘           │
│                             │
│  [음파 애니메이션]          │  ← 녹음 중
│  "말씀하세요..."            │
│                             │
│  ┌─────────────────────┐   │  ← AI 미리보기
│  │ ✨ AI가 '긴급'으로  │   │     연보라 배경
│  │    분류했어요        │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │     추가하기         │   │  ← 56px
│  └─────────────────────┘   │
└─────────────────────────────┘
```

---

## ✅ 개발 태스크

### Task 1: 인증 플로우
- `app/splash.tsx`, `app/login.tsx`
- Firebase Auth 설정
- Zustand store 연동

**검증:**
- [ ] Google 로그인 성공
- [ ] Apple 로그인 성공
- [ ] 실패 시 토스트 표시
- [ ] 토큰 저장 및 메인 이동

### Task 2: 메인 화면 (할 일 CRUD)
- `app/main.tsx`
- `components/TaskCard.tsx`
- `components/Swipeable.tsx`

**검증:**
- [ ] 우선순위 순 정렬
- [ ] 체크 시 햅틱 + 애니메이션
- [ ] 스와이프 삭제
- [ ] 빈 상태 표시

### Task 3: 음성 입력 + AI 우선순위 (핵심!)
- `components/AddTaskModal.tsx`
- `lib/audio.ts`
- `api/ai.ts`

**검증:**
- [ ] 마이크 권한 요청
- [ ] 길게 누르는 동안 녹음
- [ ] Whisper API 텍스트 변환
- [ ] GPT-4 우선순위 분석
- [ ] 미리보기 표시

### Task 4: 통계 화면
- `app/stats.tsx`
- `components/BarChart.tsx`

**검증:**
- [ ] 점수 카운트업 애니메이션
- [ ] 주간 그래프 표시
- [ ] 우선순위 분포

---

## 🎯 핵심 구현 포인트

### 1. 음성 입력 UX (차별화!)
- **길게 누르기**: 누르는 동안만 녹음 (직관적)
- **시각적 피드백**: 색상 변경 + 음파 애니메이션
- **빠른 처리**: Whisper 0.5-1초, GPT-4 0.3초

### 2. AI 우선순위
- GPT-4 사용 (정확도)
- 키워드: "오늘", "긴급", "마감" → urgent
- Confidence 0.9 이상일 때만 자동 적용

### 3. 애니메이션 (중요!)
- 모든 전환: 300ms 기본
- 완료: 햅틱 + 체크 애니메이션
- 삭제: 슬라이드 out
- 통계: 카운트업 2초

### 4. 오프라인 지원
- AsyncStorage 로컬 캐싱
- 온라인 복구 시 sync
- 낙관적 업데이트 (Optimistic UI)

---

## 🚀 개발 시작 가이드

### 1단계: 프로젝트 생성
```bash
npx create-expo-app@latest TaskFlow
cd TaskFlow
```

### 2단계: 패키지 설치
```bash
npm install zustand
npm install @react-navigation/native @react-navigation/native-stack
npm install firebase
npm install expo-av expo-haptics
npm install nativewind
npm install react-native-reanimated
npm install lottie-react-native
```

### 3단계: Firebase 설정
- Firebase Console → 프로젝트 생성
- Google/Apple Sign-In 활성화
- 설정 파일 다운로드

### 4단계: OpenAI API 키
- https://platform.openai.com/api-keys
- Whisper + GPT-4 사용

### 5단계: Supabase 설정
- Supabase 프로젝트 생성
- Database Schema 실행

---

**✅ 생성 완료!**

**이 문서는 PRD를 기반으로 생성되었으며, AI 개발 에이전트가 바로 개발을 시작할 수 있는 모든 정보를 포함합니다.**

**PRD에서 가져온 정보:**
- ✅ 제품 비전 및 핵심 가치
- ✅ 타겟 사용자 및 문제 정의
- ✅ 비즈니스 모델 (Freemium)
- ✅ 핵심 기능 (음성 입력, AI 우선순위, 리포트)

**추가로 수집한 정보:**
- ✅ 기술 스택 (React Native + Expo)
- ✅ 화면별 상세 UI/UX
- ✅ 데이터 구조 및 API 명세
- ✅ 애니메이션 및 인터랙션
- ✅ 권한 및 에러 처리
