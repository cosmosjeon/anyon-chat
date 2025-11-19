/**
 * Empty User Flow Template Generator
 *
 * 3가지 포맷의 빈 유저 플로우 템플릿을 생성합니다:
 * 1. 텍스트 기반 시나리오
 * 2. ASCII 화면 목업
 * 3. Mermaid 흐름도
 */

import { ArtifactV3 } from '@opencanvas/shared/types';

/**
 * 빈 텍스트 플로우 템플릿 생성
 */
export function generateEmptyTextFlowMarkdown(): string {
  const today = new Date().toISOString().split('T')[0];

  return `# 유저 플로우 문서

**작성 진행도**: 0%
**작성일**: ${today}

---

## 📱 화면 목록

_작성 중..._

---

## 🎬 사용자 플로우

### 1️⃣ 첫 사용자 플로우

_작성 중..._

### 2️⃣ 일반 사용자 플로우

_작성 중..._

### 3️⃣ 비즈니스 플로우

_작성 중..._

---

## 📝 주요 사용자 시나리오

### 시나리오 1: 첫 사용자

_작성 중..._

### 시나리오 2: 일반 사용자

_작성 중..._

---

**다음 단계**: 채팅을 통해 질문에 답변하시면 이 템플릿이 자동으로 채워집니다.
`;
}

/**
 * 빈 ASCII 화면 템플릿 생성
 */
export function generateEmptyASCIIMarkdown(): string {
  const today = new Date().toISOString().split('T')[0];

  return `# 화면 구성 (ASCII)

**작성 진행도**: 0%
**작성일**: ${today}

---

## 🖼️ 화면 목업

_작성 중..._

질문에 답변하시면 각 화면의 ASCII 목업이 자동으로 생성됩니다.

예시:
\`\`\`
┌─────────────────────────┐
│ 화면 제목          [⚙️] │
├─────────────────────────┤
│                         │
│ ┌─────────────────────┐ │
│ │ 콘텐츠 영역         │ │
│ └─────────────────────┘ │
│                         │
│                    [+]  │
└─────────────────────────┘
\`\`\`

---

**다음 단계**: 채팅을 통해 화면 구성에 대한 질문에 답변해주세요.
`;
}

/**
 * 빈 Mermaid 다이어그램 템플릿 생성
 */
export function generateEmptyMermaidMarkdown(): string {
  const today = new Date().toISOString().split('T')[0];

  return `# 화면 흐름도 (Mermaid)

**작성 진행도**: 0%
**작성일**: ${today}

---

## 🔀 화면 전환 흐름

_작성 중..._

질문에 답변하시면 화면 간 전환 흐름이 자동으로 생성됩니다.

예시:
\`\`\`mermaid
graph TD
    A[시작 화면] -->|버튼 클릭| B[다음 화면]
    B -->|완료| C[종료 화면]

    style A fill:#e1bee7
    style B fill:#c5e1a5
    style C fill:#ffccbc
\`\`\`

---

**다음 단계**: 채팅을 통해 화면 흐름에 대한 질문에 답변해주세요.
`;
}

/**
 * 빈 User Flow Artifact 생성 (3개 탭)
 */
export function createEmptyUserFlowArtifact(): ArtifactV3 {
  return {
    currentIndex: 0,
    contents: [
      {
        index: 0,
        type: 'text',
        title: '유저 플로우 (텍스트)',
        fullMarkdown: generateEmptyTextFlowMarkdown(),
      },
      {
        index: 1,
        type: 'text',
        title: '유저 플로우 (ASCII)',
        fullMarkdown: generateEmptyASCIIMarkdown(),
      },
      {
        index: 2,
        type: 'text',
        title: '유저 플로우 (Mermaid)',
        fullMarkdown: generateEmptyMermaidMarkdown(),
      },
    ],
  };
}

/**
 * User Flow Artifact 업데이트
 *
 * @param currentArtifact 현재 artifact
 * @param textFlow 텍스트 플로우 콘텐츠
 * @param asciiScreens ASCII 화면 콘텐츠
 * @param mermaidDiagram Mermaid 다이어그램 콘텐츠
 * @param completenessScore 완성도 (0-100)
 */
export function updateUserFlowArtifact(
  currentArtifact: ArtifactV3 | undefined,
  textFlow?: string,
  asciiScreens?: string,
  mermaidDiagram?: string,
  completenessScore?: number
): ArtifactV3 {
  const artifact = currentArtifact || createEmptyUserFlowArtifact();

  // Update each tab's content
  const updatedContents = artifact.contents.map((content, index) => {
    if (index === 0 && textFlow) {
      // Text Flow tab
      return {
        ...content,
        fullMarkdown: updateProgressInMarkdown(textFlow, completenessScore),
      };
    } else if (index === 1 && asciiScreens) {
      // ASCII tab
      return {
        ...content,
        fullMarkdown: updateProgressInMarkdown(asciiScreens, completenessScore),
      };
    } else if (index === 2 && mermaidDiagram) {
      // Mermaid tab
      return {
        ...content,
        fullMarkdown: updateProgressInMarkdown(mermaidDiagram, completenessScore),
      };
    }
    return content;
  });

  return {
    ...artifact,
    contents: updatedContents,
  };
}

/**
 * 마크다운 내용에 진행도 업데이트
 */
function updateProgressInMarkdown(markdown: string, completenessScore?: number): string {
  if (completenessScore === undefined) {
    return markdown;
  }

  // Update progress percentage
  return markdown.replace(
    /\*\*작성 진행도\*\*:\s*\d+%/,
    `**작성 진행도**: ${Math.round(completenessScore)}%`
  );
}
