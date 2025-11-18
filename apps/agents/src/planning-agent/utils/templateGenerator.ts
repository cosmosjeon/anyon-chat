/**
 * Empty PRD Template Generator
 *
 * 템플릿 레벨에 따라 빈 PRD 마크다운을 생성합니다
 */

import { TemplateLevel, PRD_TEMPLATE_LEVELS } from '../prd-checklist';
import { ArtifactV3 } from '@opencanvas/shared/types';

/**
 * 빈 PRD 템플릿 마크다운 생성
 */
export function generateEmptyPRDMarkdown(level: TemplateLevel): string {
  const template = PRD_TEMPLATE_LEVELS[level];
  const today = new Date().toISOString().split('T')[0];

  let markdown = `# 프로젝트 요구사항 (PRD)

**템플릿 레벨**: ${template.name}
**작성 진행도**: 0%
**작성일**: ${today}

---

`;

  // 각 섹션별로 빈 필드 생성
  template.sections.forEach((section, sectionIndex) => {
    markdown += `## ${sectionIndex + 1}. ${section.name}\n\n`;

    section.required_fields.forEach((field) => {
      markdown += `### ${field.prompt_hint}\n\n`;
      markdown += `_작성 중..._\n\n`;
    });

    markdown += '\n';
  });

  markdown += `---

**다음 단계**: 채팅을 통해 질문에 답변하시면 이 템플릿이 자동으로 채워집니다.
`;

  return markdown;
}

/**
 * 빈 PRD Artifact 생성
 */
export function createEmptyPRDArtifact(level: TemplateLevel): ArtifactV3 {
  const template = PRD_TEMPLATE_LEVELS[level];
  const markdown = generateEmptyPRDMarkdown(level);

  return {
    currentIndex: 0,
    contents: [
      {
        index: 0,
        type: 'text',
        title: `PRD 템플릿 (${template.name})`,
        fullMarkdown: markdown
      }
    ]
  };
}

/**
 * 기본 빈 PRD Artifact 생성 (Standard 레벨)
 */
export function createDefaultEmptyPRDArtifact(): ArtifactV3 {
  return createEmptyPRDArtifact('standard');
}
