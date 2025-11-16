import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { PRDQuestionnaireReturnType, PRDQuestionnaireState } from "../state";
import { ArtifactV3 } from "@opencanvas/shared/types";
import { savePRDDocument } from "../supabase";

/**
 * Update PRD Node
 *
 * Incrementally updates the PRD artifact as questions are answered
 */
export async function updatePRD(
  state: PRDQuestionnaireState,
  _config: LangGraphRunnableConfig
): Promise<PRDQuestionnaireReturnType> {
  const prdData = state.prdData;
  const completenessScore = state.completenessScore || 0;
  const progress = Math.round(completenessScore);

  // Generate progressive PRD content
  let prdContent = generateProgressivePRD(prdData, progress);

  // Create or update artifact
  const artifact: ArtifactV3 = state.artifact
    ? {
        ...state.artifact,
        contents: [
          {
            index: 0,
            type: "text",
            title: `PRD 초안 (${progress}% 완료)`,
            fullMarkdown: prdContent,
          },
        ],
      }
    : {
        currentIndex: 0,
        contents: [
          {
            index: 0,
            type: "text",
            title: `PRD 초안 (${progress}% 완료)`,
            fullMarkdown: prdContent,
          },
        ],
      };

  // Save PRD to Supabase
  if (state.projectId) {
    await savePRDDocument(
      state.projectId,
      {
        prdData,
        prdContent,
        artifact,
      },
      progress
    );
  }

  return {
    prdContent,
    artifact,
    next: "ask_question", // Continue to next question
  };
}

/**
 * Generate PRD content based on collected data so far
 */
function generateProgressivePRD(data: Partial<any>, progress: number): string {
  let prd = `# Product Requirements Document (PRD)\n\n`;
  prd += `**작성 진행도**: ${progress}%\n\n`;
  prd += `**작성일**: ${new Date().toLocaleDateString('ko-KR')}\n\n`;
  prd += `---\n\n`;

  // 1. 제품 개요
  if (data.productOneLine) {
    prd += `## 1. 제품 개요\n\n`;
    prd += `### 1.1 제품 비전\n${data.productOneLine}\n\n`;
  }

  // 2. 문제 정의
  if (data.coreProblem || data.problemImpact) {
    prd += `## 2. 문제 정의\n\n`;

    if (data.coreProblem) {
      prd += `### 2.1 핵심 문제\n**${data.coreProblem}**\n\n`;
    }

    if (data.problemImpact && data.problemImpact.length > 0) {
      prd += `### 2.2 문제의 영향\n\n`;
      prd += `| 문제 | 영향 |\n`;
      prd += `|------|------|\n`;
      data.problemImpact.forEach((impact: string) => {
        prd += `| **${impact}** | 사용자 경험 저하 |\n`;
      });
      prd += `\n`;
    }
  }

  // 3. 타겟 사용자
  if (data.targetUsers || data.targetUserDetail) {
    prd += `## 3. 타겟 사용자\n\n`;

    if (data.targetUsers && data.targetUsers.length > 0) {
      prd += `### 3.1 사용자 그룹\n`;
      data.targetUsers.forEach((user: string) => {
        prd += `- ${user}\n`;
      });
      prd += `\n`;
    }

    if (data.targetUserDetail) {
      prd += `### 3.2 상세 프로필\n${data.targetUserDetail}\n\n`;
    }
  }

  // 4. 기존 솔루션 분석
  if (data.existingSolution || data.solutionLimitations) {
    prd += `## 4. 기존 솔루션 분석\n\n`;

    if (data.existingSolution) {
      prd += `### 4.1 현재 해결 방법\n${data.existingSolution}\n\n`;
    }

    if (data.solutionLimitations && data.solutionLimitations.length > 0) {
      prd += `### 4.2 기존 솔루션의 한계\n\n`;
      prd += `| 솔루션 | 한계 |\n`;
      prd += `|--------|------|\n`;
      data.solutionLimitations.forEach((limit: string) => {
        prd += `| 기존 방법 | ${limit} |\n`;
      });
      prd += `\n`;
    }
  }

  // 5. 핵심 가치 제안
  if (data.coreValue && data.coreValue.length > 0) {
    prd += `## 5. 핵심 가치 제안\n\n`;
    prd += `### 5.1 차별화 포인트\n`;
    data.coreValue.forEach((value: string) => {
      prd += `- ${value}\n`;
    });
    prd += `\n`;
  }

  // 6. 비즈니스 모델
  if (data.businessModel || data.freeTier || data.pricing || data.conversionStrategy) {
    prd += `## 6. 비즈니스 모델\n\n`;

    if (data.businessModel) {
      prd += `### 6.1 수익 모델\n**${data.businessModel}**\n\n`;
    }

    if (data.freeTier && data.pricing) {
      prd += `### 6.2 요금제\n\n`;
      prd += `| 구분 | 무료 | 유료 |\n`;
      prd += `|------|------|------|\n`;
      prd += `| 기능 | ${data.freeTier} | ${data.pricing} (전체 기능) |\n\n`;
    } else {
      if (data.freeTier) {
        prd += `### 6.2 무료 티어\n${data.freeTier}\n\n`;
      }
      if (data.pricing) {
        prd += `### 6.3 가격 정책\n**${data.pricing}**\n\n`;
      }
    }

    if (data.conversionStrategy) {
      prd += `### 6.${data.freeTier && data.pricing ? '3' : '4'} 전환 전략\n- **타이밍**: ${data.conversionStrategy}\n\n`;
    }
  }

  // 7. 핵심 기능
  if (data.coreFunctions || data.functionDescriptions) {
    prd += `## 7. 핵심 기능\n\n`;

    if (data.coreFunctions && data.coreFunctions.length > 0) {
      prd += `### 7.1 주요 기능 목록\n`;
      data.coreFunctions.forEach((func: string, idx: number) => {
        prd += `${idx + 1}. ${func}\n`;
        if (data.functionDescriptions && data.functionDescriptions[func]) {
          prd += `   - ${data.functionDescriptions[func]}\n`;
        }
      });
      prd += `\n`;
    }
  }

  // 8. MVP 범위
  if (data.mvpScope) {
    prd += `## 8. MVP 범위\n\n`;
    prd += `${data.mvpScope}\n\n`;
  }

  // 9. 성공 지표
  if (data.successMetrics || data.metricTargets) {
    prd += `## 9. 성공 지표 (KPI)\n\n`;

    if (data.successMetrics && data.successMetrics.length > 0) {
      prd += `### 9.1 핵심 지표\n`;
      data.successMetrics.forEach((metric: string) => {
        prd += `- ${metric}\n`;
      });
      prd += `\n`;
    }

    if (data.metricTargets && Object.keys(data.metricTargets).length > 0) {
      prd += `### 9.2 목표 수치 (3개월)\n\n`;
      prd += `| 지표 | 목표 |\n`;
      prd += `|------|------|\n`;
      Object.entries(data.metricTargets).forEach(([metric, target]) => {
        prd += `| ${metric} | ${target} |\n`;
      });
      prd += `\n`;
    }
  }

  // 10. 출시 계획
  if (data.launchTimeline) {
    prd += `## 10. 출시 계획\n\n`;
    prd += `**타임라인**: ${data.launchTimeline}\n\n`;
  }

  // 11. 리스크 및 대응
  if (data.risks && data.risks.length > 0) {
    prd += `## 11. 리스크 및 대응\n\n`;
    prd += `| 리스크 | 확률 | 영향 | 대응 |\n`;
    prd += `|--------|------|------|------|\n`;
    data.risks.forEach((risk: string) => {
      prd += `| ${risk} | 중 | 중 | 대응 방안 검토 중 |\n`;
    });
    prd += `\n`;
  }

  // Footer
  prd += `---\n\n`;
  prd += `*이 문서는 AI 대화를 통해 자동 생성되었습니다.*\n`;
  prd += `*진행도: ${progress}%*\n`;

  return prd;
}
