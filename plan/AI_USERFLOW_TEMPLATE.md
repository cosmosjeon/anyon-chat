# AI 개발자용 유저 플로우 템플릿

> **목적**: AI 코딩 에이전트(Claude Code, Cursor 등)가 서비스를 완벽히 이해하고 개발할 수 있도록 하는 유저 플로우 작성 가이드

## 📌 핵심 원칙

### AI 개발용 vs 일반 PRD 유저 플로우 차이

| 항목 | 일반 PRD 유저 플로우 | AI 개발용 시나리오 |
|------|---------------------|-------------------|
| **목적** | 기획자/PM이 이해 | **AI가 코드 생성** |
| **엣지 케이스** | 모든 케이스 나열 | **AI가 알아서 처리 (생략 가능)** |
| **오류 처리** | 상세한 매트릭스 | 주요 케이스만 (나머지는 AI가 처리) |
| **포맷** | Mermaid 다이어그램 | **Given-When-Then + 화면 상세** |
| **상세도** | 개념적 설명 | **컴포넌트, 상태, API 스펙까지** |
| **코드 예시** | 없음 | **의사 코드 포함 (필수!)** |

### 4S 원칙

1. **Specific** (명확하고 상세하게) - 각 화면, 버튼, 인터랙션을 구체적으로
2. **Short** (간결하게 핵심만) - 불필요한 엣지 케이스는 생략
3. **Surround** (주변 컨텍스트 제공) - 기술 스택, 상태 관리, 데이터 흐름 명시
4. **Structural** (구조화) - Given-When-Then 포맷 사용

---

## 🎯 템플릿 포맷

### 포맷 1: Given-When-Then 방식 (최우선 추천!)

AI가 **화면과 기능을 완벽히 이해**하고 개발할 수 있는 포맷

```markdown
### [화면/단계 이름]

**Given (초기 상태)**
- 사용자의 현재 상태
- 데이터/권한 상태
- 이전 단계에서 넘어온 컨텍스트

**When (사용자 행동)**
1. 사용자가 수행하는 구체적인 행동
2. 버튼 클릭, 입력, 선택 등
3. 순서대로 나열

**Then (시스템 응답 및 화면)**
- 화면에 표시되는 모든 요소
- 컴포넌트 구조
- 상태 변경
- 다음 화면 이동

**UI 상세:**
```jsx
<ComponentStructure>
  {/* 실제 컴포넌트 구조 예시 */}
</ComponentStructure>
```

**데이터 흐름/로직:**
```javascript
// 의사 코드 또는 실제 로직
```
```

---

## 📋 실전 예시: AI 운동 자세 교정 앱

### 1️⃣ 앱 다운로드 및 첫 실행

**Given (초기 상태)**
- 사용자가 앱스토어에서 "FitForm AI" 앱을 검색함
- 앱이 설치되어 있지 않음
- iOS 16 이상, 카메라 권한 미설정

**When (사용자 행동)**
1. 사용자가 "다운로드" 버튼 클릭
2. 앱 설치 완료 후 홈 화면에서 앱 아이콘 탭
3. 앱이 실행됨

**Then (시스템 응답 및 화면)**
- 스플래시 화면 표시 (2초)
  - 중앙에 FitForm AI 로고 (SVG 애니메이션)
  - 배경: 그라디언트 (#4A90E2 → #7B68EE)
  - 로딩 인디케이터 하단 표시
- 2초 후 자동으로 온보딩 1단계로 이동

**UI 상세:**
```jsx
<SplashScreen>
  <Logo src="/logo-animated.svg" size={120} />
  <GradientBackground from="#4A90E2" to="#7B68EE" />
  <LoadingIndicator position="bottom" />
</SplashScreen>
```

**로직:**
```javascript
useEffect(() => {
  const timer = setTimeout(() => {
    router.push('/onboarding/1');
  }, 2000);

  return () => clearTimeout(timer);
}, []);
```

---

### 2️⃣ 온보딩 1단계: 목표 선택

**Given**
- 스플래시 화면이 끝남
- 사용자가 처음 사용하는 상태
- 온보딩 데이터가 비어있음

**When**
1. 온보딩 1/3 화면이 표시됨
2. 사용자가 3가지 목표 중 하나를 선택
   - "체중 감량" 카드 탭 OR
   - "근력 강화" 카드 탭 OR
   - "건강 유지" 카드 탭
3. 선택 후 하단 "다음" 버튼 활성화
4. "다음" 버튼 클릭

**Then**
- **화면 구성:**
  - 상단: 진행률 바 (1/3 = 33%)
  - 제목: "운동 목표를 선택해주세요" (24px, Bold)
  - 부제목: "맞춤 루틴을 만들어드릴게요" (14px, Gray)
  - 중앙: 3개 카드 (세로 정렬, 16px 간격)
    - 각 카드: 아이콘 + 제목 + 설명
    - 선택 시 파란색 테두리 + 체크마크
  - 하단: "다음" 버튼 (선택 전: 비활성화 Gray, 선택 후: 파란색)

- **선택값 저장:**
  - `onboardingData.goal = "weight_loss" | "muscle_gain" | "health"`

- **다음 화면으로 이동:**
  - 슬라이드 애니메이션 (좌→우, 300ms)
  - 온보딩 2단계로 전환

**UI 상세:**
```jsx
<OnboardingStep1>
  <ProgressBar current={1} total={3} />
  <Title>운동 목표를 선택해주세요</Title>
  <Subtitle>맞춤 루틴을 만들어드릴게요</Subtitle>

  <CardContainer>
    <GoalCard
      icon="🏃‍♂️"
      title="체중 감량"
      description="체지방을 줄이고 슬림한 몸매 만들기"
      value="weight_loss"
      selected={goal === "weight_loss"}
      onClick={() => setGoal("weight_loss")}
    />
    <GoalCard
      icon="💪"
      title="근력 강화"
      description="근육을 키우고 강한 체력 만들기"
      value="muscle_gain"
      selected={goal === "muscle_gain"}
      onClick={() => setGoal("muscle_gain")}
    />
    <GoalCard
      icon="🧘‍♀️"
      title="건강 유지"
      description="꾸준한 운동으로 건강 관리하기"
      value="health"
      selected={goal === "health"}
      onClick={() => setGoal("health")}
    />
  </CardContainer>

  <NextButton
    disabled={!goal}
    onClick={() => navigate("/onboarding/2")}
  >
    다음
  </NextButton>
</OnboardingStep1>
```

**데이터 흐름:**
```javascript
// State 관리 (Zustand or Context)
const [onboardingData, setOnboardingData] = useState({
  goal: null,
  level: null,
  permissions: {
    camera: false,
    notifications: false
  }
});

// 다음 버튼 클릭 핸들러
const handleNext = () => {
  setOnboardingData({ ...onboardingData, goal: selectedGoal });
  router.push('/onboarding/2');
};
```

---

### 3️⃣ 온보딩 2단계: 수준 선택

**Given**
- 온보딩 1단계 완료
- `onboardingData.goal`에 값이 저장됨 (예: "weight_loss")
- 현재 2/3 단계

**When**
1. 온보딩 2/3 화면 표시
2. 사용자가 3가지 수준 중 하나 선택
   - "초보 (3개월 미만)" 선택 OR
   - "중급 (3-12개월)" 선택 OR
   - "고급 (1년 이상)" 선택
3. "다음" 버튼 클릭

**Then**
- **화면 구성:**
  - 진행률 바: 2/3 = 67%
  - 제목: "운동 경험이 어느 정도인가요?"
  - 3개 라디오 버튼 (세로 정렬)
    - 각 버튼: 레벨 + 기간 + 설명
  - 하단: "다음" 버튼

- **선택값 저장:**
  - `onboardingData.level = "beginner" | "intermediate" | "advanced"`

- **다음 화면:**
  - 온보딩 3단계 (권한 요청)로 이동

**UI 상세:**
```jsx
<OnboardingStep2>
  <ProgressBar current={2} total={3} />
  <Title>운동 경험이 어느 정도인가요?</Title>

  <RadioGroup value={level} onChange={setLevel}>
    <RadioOption value="beginner">
      <Label>초보</Label>
      <Duration>3개월 미만</Duration>
      <Description>운동을 처음 시작하시는 분</Description>
    </RadioOption>
    <RadioOption value="intermediate">
      <Label>중급</Label>
      <Duration>3-12개월</Duration>
      <Description>기본 동작에 익숙하신 분</Description>
    </RadioOption>
    <RadioOption value="advanced">
      <Label>고급</Label>
      <Duration>1년 이상</Duration>
      <Description>고난도 운동도 가능하신 분</Description>
    </RadioOption>
  </RadioGroup>

  <NextButton
    disabled={!level}
    onClick={() => {
      setOnboardingData({ ...onboardingData, level });
      navigate("/onboarding/3");
    }}
  >
    다음
  </NextButton>
</OnboardingStep2>
```

---

### 4️⃣ 온보딩 3단계: 권한 요청

**Given**
- 온보딩 1-2단계 완료
- `onboardingData.goal`, `onboardingData.level`에 값 저장됨
- 카메라, 알림 권한이 아직 요청되지 않음

**When**
1. 온보딩 3/3 화면 표시
2. "카메라 권한이 필요한 이유" 설명 표시
3. 사용자가 "카메라 허용하기" 버튼 클릭
4. **시스템 권한 팝업 자동 표시** (iOS/Android 네이티브)
5. 사용자가 "허용" 또는 "거부" 선택

**Then (허용한 경우)**
- 카메라 권한 상태: ✅ 허용됨
- `onboardingData.permissions.camera = true`
- 알림 권한 요청 UI 표시
- 사용자가 "알림 허용하기" 버튼 클릭
- 시스템 알림 권한 팝업 표시
- "시작하기" 버튼 활성화

**Then (거부한 경우)**
- 권한 거부 안내 모달 표시
  - 제목: "카메라 권한이 필요해요"
  - 설명: "운동 자세를 분석하려면 카메라가 필요합니다"
  - 버튼 1: "설정으로 이동" (시스템 설정 앱 열기)
  - 버튼 2: "나중에 허용하기" (제한 모드로 진입)

**UI 상세:**
```jsx
<OnboardingStep3>
  <ProgressBar current={3} total={3} />
  <Title>마지막 단계예요!</Title>
  <Subtitle>AI 자세 분석을 위해 권한이 필요해요</Subtitle>

  <PermissionCard>
    <Icon>📷</Icon>
    <PermissionTitle>카메라</PermissionTitle>
    <PermissionDescription>
      운동 중 자세를 실시간으로 분석합니다
    </PermissionDescription>
    <PermissionButton
      onClick={requestCameraPermission}
      granted={permissions.camera}
    >
      {permissions.camera ? "✅ 허용됨" : "카메라 허용하기"}
    </PermissionButton>
  </PermissionCard>

  <PermissionCard>
    <Icon>🔔</Icon>
    <PermissionTitle>알림</PermissionTitle>
    <PermissionDescription>
      운동 리마인더를 보내드려요
    </PermissionDescription>
    <PermissionButton
      onClick={requestNotificationPermission}
      granted={permissions.notifications}
    >
      {permissions.notifications ? "✅ 허용됨" : "알림 허용하기"}
    </PermissionButton>
  </PermissionCard>

  <StartButton
    disabled={!permissions.camera}
    onClick={completeOnboarding}
  >
    시작하기
  </StartButton>
</OnboardingStep3>

{/* 거부 시 모달 */}
{showPermissionDeniedModal && (
  <Modal>
    <ModalTitle>카메라 권한이 필요해요</ModalTitle>
    <ModalDescription>
      운동 자세를 분석하려면 카메라가 필요합니다.
      설정에서 허용해주세요.
    </ModalDescription>
    <ModalButtons>
      <Button onClick={openSettings}>설정으로 이동</Button>
      <Button variant="secondary" onClick={proceedWithoutCamera}>
        나중에 허용하기
      </Button>
    </ModalButtons>
  </Modal>
)}
```

**로직:**
```javascript
const requestCameraPermission = async () => {
  const { status } = await Camera.requestCameraPermissionsAsync();

  if (status === 'granted') {
    setPermissions({ ...permissions, camera: true });
  } else {
    setShowPermissionDeniedModal(true);
  }
};

const openSettings = () => {
  Linking.openSettings();
};

const completeOnboarding = async () => {
  // 온보딩 데이터 저장
  await saveOnboardingData(onboardingData);

  // 메인 화면으로 이동
  router.replace('/home');
};
```

---

### 5️⃣ 첫 운동 촬영

**Given**
- 온보딩 완료
- 카메라 권한 허용됨
- 사용자가 메인 화면에 있음
- 운동 기록 없음 (첫 사용)

**When**
1. 메인 화면에서 "첫 운동 시작하기" 대형 버튼 표시
2. 사용자가 버튼 클릭
3. 운동 선택 화면으로 이동
4. "스쿼트 (추천)" 카드 선택
5. "촬영 시작" 버튼 클릭

**Then**
- **촬영 준비 화면 표시:**
  - 카메라 프리뷰 (전체 화면)
  - 반투명 가이드 실루엣 (사람 형태)
  - 상단 안내: "가이드에 맞춰 서주세요"
  - 하단: 3초 카운트다운 버튼

- **3초 카운트다운 후 촬영 시작:**
  - "3... 2... 1... 시작!" 음성 안내
  - 녹화 시작 (빨간색 녹화 중 표시)
  - AI 실시간 분석 시작

**UI 상세:**
```jsx
<ExerciseCamera>
  {/* 카메라 프리뷰 */}
  <CameraView
    ref={cameraRef}
    style={{ flex: 1 }}
    onCameraReady={() => setIsCameraReady(true)}
  >
    {/* 가이드 실루엣 오버레이 */}
    <SilhouetteGuide
      type="squat"
      opacity={0.3}
      position="center"
    />

    {/* 상단 안내 */}
    <TopBanner>
      <Icon>👤</Icon>
      <Text>가이드에 맞춰 서주세요</Text>
    </TopBanner>

    {/* 카운트다운 */}
    {countdown > 0 && (
      <CountdownOverlay>
        <CountdownNumber>{countdown}</CountdownNumber>
      </CountdownOverlay>
    )}

    {/* 녹화 중 표시 */}
    {isRecording && (
      <RecordingIndicator>
        <RedDot />
        <Text>녹화 중</Text>
      </RecordingIndicator>
    )}

    {/* 하단 버튼 */}
    <BottomControls>
      {!isRecording ? (
        <StartButton onClick={startCountdown}>
          촬영 시작 (3초 후)
        </StartButton>
      ) : (
        <StopButton onClick={stopRecording}>
          촬영 중단
        </StopButton>
      )}
    </BottomControls>
  </CameraView>
</ExerciseCamera>
```

**로직:**
```javascript
const startCountdown = () => {
  setCountdown(3);

  const timer = setInterval(() => {
    setCountdown(prev => {
      if (prev === 1) {
        clearInterval(timer);
        startRecording();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
};

const startRecording = async () => {
  setIsRecording(true);

  // 비디오 녹화 시작
  const video = await cameraRef.current.recordAsync();

  // AI 분석 시작 (WebSocket 연결)
  startRealtimeAnalysis(video.uri);
};

const startRealtimeAnalysis = (videoUri) => {
  // 0.1초마다 프레임 전송 → AI 서버 분석
  const ws = new WebSocket('wss://api.fitform.ai/analyze');

  ws.onmessage = (event) => {
    const { score, feedback, joints } = JSON.parse(event.data);

    // 실시간 피드백 표시
    setCurrentScore(score);
    setCurrentFeedback(feedback);
    highlightJoints(joints);
  };
};
```

---

### 6️⃣ AI 실시간 분석 및 피드백

**Given**
- 촬영이 시작됨
- 사용자가 스쿼트 운동 중
- AI 서버가 0.1초마다 프레임 분석 중

**When**
1. AI가 33개 관절 포인트 추적
2. 자세 점수 계산 (0-100점)
3. 잘못된 부위 감지
4. **실시간 피드백 생성**

**Then**
- **화면 오버레이:**
  - 관절 포인트 표시 (33개 점, 연결선)
  - 정상 부위: 초록색
  - 잘못된 부위: 빨간색 + 깜빡임
  - 현재 점수: 우측 상단 대형 숫자 (예: 85점)
  - 음성 피드백: "무릎이 발끝보다 앞으로!" (TTS)

- **피드백 예시:**
  - 무릎이 발끝을 넘음 → "무릎을 뒤로!"
  - 허리가 굽음 → "허리를 펴세요!"
  - 깊이 부족 → "더 깊게 앉으세요!"
  - 완벽한 자세 → "Perfect! 👍"

**UI 상세:**
```jsx
<AnalysisOverlay>
  {/* 관절 포인트 표시 */}
  <Canvas>
    {joints.map((joint, idx) => (
      <JointPoint
        key={idx}
        x={joint.x}
        y={joint.y}
        color={joint.isCorrect ? "green" : "red"}
        animated={!joint.isCorrect}
      />
    ))}
    <Skeleton joints={joints} />
  </Canvas>

  {/* 점수 표시 */}
  <ScoreDisplay position="top-right">
    <ScoreNumber color={getScoreColor(score)}>
      {score}
    </ScoreNumber>
    <ScoreLabel>점</ScoreLabel>
  </ScoreDisplay>

  {/* 실시간 피드백 */}
  {currentFeedback && (
    <FeedbackBanner
      color={currentFeedback.type === "error" ? "red" : "green"}
      animation="slide-in"
    >
      <FeedbackIcon>
        {currentFeedback.type === "error" ? "⚠️" : "✅"}
      </FeedbackIcon>
      <FeedbackText>{currentFeedback.message}</FeedbackText>
    </FeedbackBanner>
  )}
</AnalysisOverlay>
```

**AI 분석 로직 (서버 측):**
```javascript
// 서버 측 AI 분석 (Pseudocode)
function analyzeFrame(frame) {
  // 1. 관절 포인트 추출 (MediaPipe or OpenPose)
  const joints = extractJoints(frame); // 33개 포인트

  // 2. 스쿼트 자세 검증
  const kneeAngle = calculateAngle(joints.hip, joints.knee, joints.ankle);
  const kneePosition = joints.knee.x;
  const toePosition = joints.toe.x;

  let score = 100;
  let feedback = [];

  // 무릎이 발끝을 넘는지 체크
  if (kneePosition > toePosition + 20) {
    score -= 20;
    feedback.push({
      type: "error",
      message: "무릎이 발끝보다 앞으로!",
      joint: "knee"
    });
  }

  // 허리 각도 체크
  const backAngle = calculateAngle(joints.shoulder, joints.hip, joints.knee);
  if (backAngle < 160) {
    score -= 15;
    feedback.push({
      type: "error",
      message: "허리를 펴세요!",
      joint: "back"
    });
  }

  // 깊이 체크
  if (kneeAngle > 100) {
    score -= 10;
    feedback.push({
      type: "warning",
      message: "더 깊게 앉으세요!",
      joint: "knee"
    });
  }

  return {
    score: Math.max(0, score),
    feedback: feedback[0] || { type: "success", message: "Perfect! 👍" },
    joints: joints.map(j => ({
      ...j,
      isCorrect: !feedback.some(f => f.joint === j.name)
    }))
  };
}
```

**WebSocket API 스펙:**
```
WebSocket: wss://api.fitform.ai/analyze

// Client → Server (매 0.1초)
{
  "frame": "base64_encoded_image",
  "timestamp": 1234567890,
  "exerciseType": "squat"
}

// Server → Client
{
  "score": 85,
  "joints": [
    { "name": "left_knee", "x": 120, "y": 340, "isCorrect": false },
    { "name": "right_knee", "x": 200, "y": 345, "isCorrect": true },
    ...
  ],
  "feedback": {
    "type": "error",
    "message": "무릎이 발끝보다 앞으로!",
    "voice": true
  }
}
```

---

### 7️⃣ 운동 결과 화면

**Given**
- 스쿼트 10회 완료
- 촬영 종료
- AI 분석 완료
- 평균 점수: 82점

**When**
1. "촬영 중단" 버튼 클릭 OR 자동 종료 (10회 감지)
2. 분석 완료 로딩 (2초)

**Then**
- **결과 화면 표시:**
  - 상단: 축하 애니메이션 (Lottie)
  - 중앙: 대형 점수 (82점, 초록색)
  - 등급: "Good! 💪"
  - 상세 분석:
    - "완료한 횟수: 10회"
    - "평균 점수: 82점"
    - "가장 좋았던 자세: 5회차 (95점)"
    - "개선이 필요한 부분: 무릎 위치 (3회 오류)"
  - 하단 버튼:
    - "운동 기록 보기" (회색)
    - "다음 운동 하기" (파란색)

**UI 상세:**
```jsx
<ResultScreen>
  {/* 축하 애니메이션 */}
  <LottieAnimation
    source={require("@/assets/animations/celebration.json")}
    autoPlay
    loop={false}
  />

  {/* 점수 */}
  <ScoreSection>
    <ScoreCircle score={82}>
      <ScoreNumber>82</ScoreNumber>
      <ScoreLabel>점</ScoreLabel>
    </ScoreCircle>
    <GradeLabel color="green">Good! 💪</GradeLabel>
  </ScoreSection>

  {/* 상세 분석 */}
  <AnalysisSection>
    <StatRow>
      <StatLabel>완료한 횟수</StatLabel>
      <StatValue>10회</StatValue>
    </StatRow>
    <StatRow>
      <StatLabel>평균 점수</StatLabel>
      <StatValue>82점</StatValue>
    </StatRow>
    <StatRow>
      <StatLabel>가장 좋았던 자세</StatLabel>
      <StatValue>5회차 (95점)</StatValue>
    </StatRow>

    <ImprovementCard>
      <CardTitle>개선이 필요한 부분</CardTitle>
      <IssueItem>
        <IssueIcon>⚠️</IssueIcon>
        <IssueText>무릎 위치 (3회 오류)</IssueText>
        <HelpButton onClick={showTip}>도움말</HelpButton>
      </IssueItem>
    </ImprovementCard>
  </AnalysisSection>

  {/* 하단 버튼 */}
  <BottomButtons>
    <SecondaryButton onClick={() => navigate("/history")}>
      운동 기록 보기
    </SecondaryButton>
    <PrimaryButton onClick={() => navigate("/exercise-select")}>
      다음 운동 하기
    </PrimaryButton>
  </BottomButtons>
</ResultScreen>
```

**데이터 저장:**
```javascript
const saveWorkoutResult = async () => {
  const workoutData = {
    userId: user.id,
    exerciseType: "squat",
    completedAt: new Date().toISOString(),
    reps: 10,
    averageScore: 82,
    bestScore: 95,
    videoUri: uploadedVideoUri,
    analysis: {
      totalErrors: 3,
      errorTypes: {
        kneePosition: 3,
        backAngle: 0,
        depth: 0
      },
      improvements: [
        "무릎이 발끝을 넘지 않도록 주의하세요"
      ]
    }
  };

  await db.workouts.insert(workoutData);

  // 로컬 카운터 증가 (무료 3회 제한)
  incrementFreeUsageCount();
};
```

---

### 8️⃣ 유료 전환 제안 (Paywall)

**Given**
- 사용자가 3일 연속 사용 완료
- 무료 횟수 3회 모두 소진
- 결제 이력 없음

**When**
- 4번째 운동 시작 시도 OR
- 3일차 운동 완료 후 자동 표시

**Then**
- **Paywall 모달 표시:**
  - 전체 화면 모달
  - 뒤로 가기 차단 (X 버튼 없음)
  - 제목: "🎉 3일간 완주!"
  - 부제목: "이제 프리미엄으로 무제한 운동하세요"
  - 혜택 리스트:
    - ✅ 무제한 자세 분석
    - ✅ AI 맞춤 루틴
    - ✅ 운동 기록 무제한
    - ✅ 우선 고객지원
  - 가격: "월 14,900원" (큰 글씨)
  - 프로모션: "(첫 7일 무료)"
  - 주요 CTA: "7일 무료 시작" (파란색)
  - 보조 CTA: "나중에 결정할게요" (회색 텍스트)

**UI 상세:**
```jsx
<PaywallModal>
  <Header>
    <Title>🎉 3일간 완주!</Title>
    <Subtitle>이제 프리미엄으로 무제한 운동하세요</Subtitle>
  </Header>

  <BenefitsList>
    <BenefitItem>
      <CheckIcon>✅</CheckIcon>
      <Text>무제한 자세 분석</Text>
    </BenefitItem>
    <BenefitItem>
      <CheckIcon>✅</CheckIcon>
      <Text>AI 맞춤 루틴</Text>
    </BenefitItem>
    <BenefitItem>
      <CheckIcon>✅</CheckIcon>
      <Text>운동 기록 무제한</Text>
    </BenefitItem>
    <BenefitItem>
      <CheckIcon>✅</CheckIcon>
      <Text>우선 고객지원</Text>
    </BenefitItem>
  </BenefitsList>

  <Pricing>
    <Price>월 14,900원</Price>
    <Promo>(첫 7일 무료)</Promo>
  </Pricing>

  <CTAButton onClick={handleFreeTrial}>
    7일 무료 시작
  </CTAButton>

  <SecondaryAction onClick={handleLater}>
    나중에 결정할게요
  </SecondaryAction>
</PaywallModal>
```

**로직:**
```javascript
const handleFreeTrial = () => {
  // 결제 화면으로 이동
  navigate("/payment", {
    plan: "premium_monthly",
    trial: 7
  });
};

const handleLater = () => {
  // 제한 모드 설정
  setUserMode("limited");

  // 안내 토스트
  showToast("하루 1회만 무료로 사용할 수 있어요");

  // 메인 화면으로
  navigate("/home");
};
```

---

## 📐 화면 레이아웃 예시

### 레이아웃 다이어그램 포맷

```
┌─────────────────────┐
│ [상단 요소]         │  ← 위치 및 크기 명시
│                     │
│   [중앙 컨텐츠]     │
│                     │
│ [하단 버튼]         │
└─────────────────────┘
```

### 온보딩 1단계 레이아웃 예시

```
┌─────────────────────┐
│ ▓▓▓░░░░░░ (33%)   │  ← 진행률 바 (height: 4px)
│                     │
│  운동 목표를         │  ← 제목 (24px, Bold, #000)
│  선택해주세요        │
│                     │
│  맞춤 루틴을 만들어  │  ← 부제목 (14px, #666)
│  드릴게요            │
│                     │
│ ┌─────────────────┐ │
│ │  🏃‍♂️ 체중 감량    │ │  ← 카드 1 (padding: 16px)
│ │  체지방 줄이기... │ │     border: 1px #E0E0E0
│ └─────────────────┘ │     선택 시: border: 2px #007AFF
│                     │
│ ┌─────────────────┐ │
│ │  💪 근력 강화     │ │  ← 카드 2
│ │  근육 키우기...  │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │  🧘‍♀️ 건강 유지    │ │  ← 카드 3
│ │  꾸준히 관리...  │ │
│ └─────────────────┘ │
│                     │
│     [ 다음 ]        │  ← 버튼 (height: 56px)
│                     │     선택 전: #D0D0D0
└─────────────────────┘     선택 후: #007AFF
```

---

## 🏗️ 기술 스택 명시 (필수!)

AI가 정확한 코드를 생성하려면 **기술 스택을 명확히 명시**해야 합니다.

### 예시

**Frontend:**
- Framework: React Native + Expo SDK 51
- Navigation: React Navigation 6
- State Management: Zustand
- UI Library: React Native Paper
- Animation: react-native-reanimated, Lottie
- Camera: expo-camera
- Permissions: expo-permissions

**Backend:**
- API: Node.js + Express (또는 Python FastAPI)
- Database: Supabase (PostgreSQL)
- Real-time: WebSocket (ws library)
- AI Model: MediaPipe (자세 분석)

**Styling:**
- NativeWind (Tailwind for React Native)
- 색상 팔레트:
  - Primary: #007AFF
  - Secondary: #5856D6
  - Success: #34C759
  - Error: #FF3B30
  - Gray: #8E8E93

---

## 📊 데이터 구조 (필수!)

AI가 상태 관리와 데이터 흐름을 이해하도록 **데이터 스키마** 제공

### 예시: Zustand Store

```typescript
// store/user.ts
interface UserStore {
  // 사용자 정보
  user: {
    id: string;
    email: string;
    name: string;
    isPremium: boolean;
  } | null;

  // 온보딩 데이터
  onboarding: {
    goal: "weight_loss" | "muscle_gain" | "health" | null;
    level: "beginner" | "intermediate" | "advanced" | null;
    permissions: {
      camera: boolean;
      notifications: boolean;
    };
  };

  // 운동 데이터
  workout: {
    currentExercise: string | null;
    isRecording: boolean;
    currentScore: number;
    freeUsageCount: number; // 무료 3회 제한
  };

  // Actions
  setUser: (user: User) => void;
  updateOnboarding: (data: Partial<Onboarding>) => void;
  startWorkout: (exerciseType: string) => void;
  stopWorkout: () => void;
  incrementFreeUsage: () => void;
}
```

### 예시: Database Schema

```sql
-- users 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- workouts 테이블
CREATE TABLE workouts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  exercise_type VARCHAR(50),
  completed_at TIMESTAMP,
  reps INTEGER,
  average_score INTEGER,
  best_score INTEGER,
  video_uri TEXT,
  analysis JSONB
);
```

---

## ✅ AI 개발 태스크 분리

큰 작업을 **작은 태스크로 분리**하여 AI가 단계별로 개발할 수 있도록 합니다.

### Task 1: 온보딩 플로우 구현

**목표:** 사용자가 3단계 온보딩을 완료하고 운동을 시작할 수 있도록 함

**구현 범위:**
- 3개 화면: `/onboarding/1`, `/onboarding/2`, `/onboarding/3`
- 진행률 바 컴포넌트
- 선택 상태 관리 (Zustand)
- 권한 요청 로직 (Camera, Notifications)
- 온보딩 완료 후 메인 화면 이동

**검증 기준:**
- [ ] 3단계 모두 정상 표시됨
- [ ] 진행률 바가 33% → 67% → 100% 정확히 표시됨
- [ ] 카드 선택 시 테두리 색상 변경됨
- [ ] "다음" 버튼이 선택 전/후 활성화 상태 올바름
- [ ] 카메라 권한 거부 시 모달 표시됨
- [ ] 온보딩 데이터가 AsyncStorage에 저장됨

**예상 구조:**
```
app/
├── onboarding/
│   ├── _layout.tsx
│   ├── 1.tsx  ← 목표 선택
│   ├── 2.tsx  ← 수준 선택
│   └── 3.tsx  ← 권한 요청
├── components/
│   ├── ProgressBar.tsx
│   ├── GoalCard.tsx
│   └── PermissionCard.tsx
└── store/
    └── onboarding.ts  ← Zustand store
```

---

### Task 2: 실시간 AI 자세 분석 구현

**목표:** 운동 중 0.1초마다 자세를 분석하고 실시간 피드백 제공

**구현 범위:**
- 카메라 녹화 기능
- WebSocket 연결 (AI 서버)
- 프레임 추출 및 전송 (0.1초 간격)
- 관절 포인트 오버레이
- 실시간 점수 표시
- 음성 피드백 (TTS)

**서버 API 스펙:**
```
WebSocket: wss://api.fitform.ai/analyze

// Client → Server (매 0.1초)
{
  "frame": "base64_encoded_image",
  "timestamp": 1234567890,
  "exerciseType": "squat"
}

// Server → Client
{
  "score": 85,
  "joints": [...],
  "feedback": {
    "type": "error",
    "message": "무릎이 발끝보다 앞으로!",
    "voice": true
  }
}
```

**검증 기준:**
- [ ] 카메라 프리뷰가 전체 화면에 표시됨
- [ ] 3초 카운트다운 후 녹화 시작됨
- [ ] WebSocket 연결이 정상적으로 수립됨
- [ ] 0.1초마다 프레임이 서버로 전송됨
- [ ] 관절 포인트가 정확한 위치에 표시됨
- [ ] 점수가 우측 상단에 실시간 업데이트됨
- [ ] 오류 발생 시 음성 피드백이 재생됨

---

## 💡 추가 팁

### 1. 명확한 용어 사용

**좋은 예:**
```
"파란색 버튼 (#007AFF, height: 56px, corner radius: 12px)"
"상단에서 16px 떨어진 위치에 배치"
```

**나쁜 예:**
```
"예쁜 버튼"
"적당히 떨어진 위치"
```

### 2. 의사 코드 포함

AI가 로직을 이해할 수 있도록 **의사 코드** 또는 **실제 코드 예시** 제공

```javascript
// Good!
const handleNext = () => {
  if (!selectedGoal) return;
  setOnboardingData({ ...onboardingData, goal: selectedGoal });
  router.push('/onboarding/2');
};
```

### 3. 상태 변화 명시

```
초기 상태: goal = null, button disabled
↓
사용자가 카드 선택
↓
변경된 상태: goal = "weight_loss", button enabled
```

### 4. API 응답 예시 포함

```json
// POST /api/workouts/save 응답
{
  "success": true,
  "workoutId": "uuid-1234",
  "averageScore": 82,
  "nextRecommendation": "plank"
}
```

---

## 🎯 Planning Agent 질문 리스트

프로젝트의 Planning Agent에서 유저 플로우를 생성하기 위해 물어볼 질문들:

```typescript
const USER_FLOW_QUESTIONS_FOR_AI_DEV = [
  {
    id: "uf_screens",
    question: "주요 화면은 몇 개인가요? (AI가 개발할 화면 수)",
    type: "single_choice",
    options: [
      { label: "3-5개 (MVP)", value: "3-5" },
      { label: "6-10개 (표준)", value: "6-10" },
      { label: "11-20개 (복잡)", value: "11-20" },
      { label: "20개 이상 (대규모)", value: "20+" }
    ]
  },
  {
    id: "uf_tech_stack",
    question: "프론트엔드 기술 스택은?",
    type: "single_choice",
    options: [
      { label: "React Native + Expo", value: "react-native-expo" },
      { label: "React.js (웹)", value: "react-web" },
      { label: "Next.js", value: "nextjs" },
      { label: "Flutter", value: "flutter" },
      { label: "Swift/SwiftUI", value: "swift" },
      { label: "기타", value: "other" }
    ]
  },
  {
    id: "uf_core_journey",
    question: "사용자의 핵심 여정을 단계별로 설명해주세요 (AI가 이해할 수 있게)",
    type: "text",
    multiline: true,
    placeholder: "예: 1) 앱 다운로드 → 2) 온보딩 3단계 → 3) 첫 사용 → 4) 결제 → 5) 목표 달성",
    hint: "화살표(→)로 단계를 구분해주세요. 각 단계에서 사용자가 '무엇을 하는지' 명확히 적어주세요."
  },
  {
    id: "uf_screen_details",
    question: "각 화면에서 사용자가 보는 것과 하는 행동을 설명해주세요",
    type: "text",
    multiline: true,
    placeholder: `예:
화면 1 (온보딩): 3개 카드 중 목표 선택 → 다음 버튼 클릭
화면 2 (촬영): 카메라 프리뷰 → 촬영 시작 버튼 → AI 분석 중...
화면 3 (결과): 점수 표시 → 개선점 안내 → 다음 운동 버튼`,
    hint: "화면 이름 + 사용자가 보는 것 + 사용자가 하는 행동"
  },
  {
    id: "uf_interactions",
    question: "주요 인터랙션(버튼, 입력, 선택 등)은 무엇인가요?",
    type: "multiple_choice",
    options: [
      { label: "버튼 클릭", value: "button" },
      { label: "텍스트 입력", value: "text_input" },
      { label: "카드/리스트 선택", value: "selection" },
      { label: "스와이프/드래그", value: "swipe" },
      { label: "카메라/사진 촬영", value: "camera" },
      { label: "파일 업로드", value: "upload" },
      { label: "결제", value: "payment" }
    ]
  },
  {
    id: "uf_data_flow",
    question: "화면 간 데이터 전달이 필요한가요?",
    type: "single_choice",
    options: [
      {
        label: "Yes - 이전 화면 데이터를 다음 화면에서 사용",
        value: "yes",
        description: "예: 온보딩 선택값을 메인에서 사용"
      },
      {
        label: "No - 각 화면 독립적",
        value: "no"
      }
    ]
  },
  {
    id: "uf_state_management",
    question: "상태 관리 라이브러리는?",
    type: "single_choice",
    options: [
      { label: "Zustand", value: "zustand" },
      { label: "Redux Toolkit", value: "redux" },
      { label: "React Context", value: "context" },
      { label: "Recoil", value: "recoil" },
      { label: "MobX", value: "mobx" },
      { label: "없음/모르겠음", value: "none" }
    ]
  },
  {
    id: "uf_api_integration",
    question: "백엔드 API가 필요한가요?",
    type: "single_choice",
    options: [
      { label: "Yes - REST API", value: "rest" },
      { label: "Yes - GraphQL", value: "graphql" },
      { label: "Yes - WebSocket (실시간)", value: "websocket" },
      { label: "No - 로컬만", value: "none" }
    ]
  },
  {
    id: "uf_success_path",
    question: "사용자가 성공적으로 목표를 달성하는 경로는? (Happy Path)",
    type: "text",
    multiline: true,
    placeholder: "예: 다운로드 → 온보딩 완료 → 첫 촬영 → 80점 이상 → 3일 사용 → 유료 결제 → 목표 달성",
    hint: "AI가 이 경로를 우선적으로 구현합니다"
  }
];
```

---

## 📚 참고 자료

- [Behavior-Driven Development (BDD) - Given-When-Then](https://martinfowler.com/bliki/GivenWhenThen.html)
- [Spec-Driven Development with AI](https://www.augmentcode.com/guides/spec-driven-development-ai-agents-explained)
- [Prompt Engineering for Code Generation](https://github.com/dair-ai/Prompt-Engineering-Guide)
- [Claude Code vs Cursor: Best Practices](https://www.qodo.ai/blog/claude-code-vs-cursor/)

---

**작성일:** 2025-11-19
**버전:** 1.0
**작성자:** Planning Agent Template Generator
