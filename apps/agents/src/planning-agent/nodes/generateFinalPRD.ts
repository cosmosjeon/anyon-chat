import { AIMessage } from "@langchain/core/messages";
import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { PRDQuestionnaireReturnType, PRDQuestionnaireState } from "../state";
import { ArtifactV3 } from "@opencanvas/shared/types";
import { getModelFromConfig } from "../../utils";
import { FINAL_PRD_PROMPT } from "../prompts";
import { savePRDDocument, trackAnalyticsEvent } from "../supabase";

/**
 * Generate Final PRD Node
 *
 * Creates a comprehensive, polished PRD document after all questions are answered
 */
export async function generateFinalPRD(
  state: PRDQuestionnaireState,
  config: LangGraphRunnableConfig
): Promise<PRDQuestionnaireReturnType> {
  const prdData = state.prdData;
  const answers = state.answers;

  // Get model for generating comprehensive PRD
  const model = await getModelFromConfig(config);

  // Extract numbers for revenue calculation
  const pricingHint = extractPricingFromAnswer(prdData.pricing || "");
  const conversionRateHint = extractConversionRate(prdData.metricTargets);

  // Add calculation hints to prdData
  const enhancedData = {
    ...prdData,
    _calculations: {
      pricing_monthly: pricingHint,
      conversion_rate: conversionRateHint,
      calculation_note: `MRR = (DAU × ${conversionRateHint}% × ${pricingHint}원)`
    }
  };

  // Format all collected data
  const allData = JSON.stringify(enhancedData, null, 2);
  const answersText = answers
    .map((a) => `Q: ${a.questionId}\nA: ${a.text}`)
    .join("\n\n");

  // Generate final PRD using AI
  const prompt = FINAL_PRD_PROMPT.replace("{all_data}", `${allData}\n\n답변 내역:\n${answersText}`);

  const response = await model.invoke([
    {
      role: "system",
      content: "당신은 전문 제품 기획자입니다. 수집된 정보를 바탕으로 완벽한 PRD 문서를 작성합니다.",
    },
    {
      role: "user",
      content: prompt,
    },
  ]);

  const finalPRDContent = typeof response.content === "string"
    ? response.content
    : JSON.stringify(response.content);

  // Create final artifact
  const finalArtifact: ArtifactV3 = {
    currentIndex: 0,
    contents: [
      {
        index: 0,
        type: "text",
        title: `${prdData.productName || "제품"} PRD`,
        fullMarkdown: finalPRDContent,
      },
    ],
  };

  // Save final PRD to Supabase
  if (state.projectId && state.userId) {
    await savePRDDocument(
      state.projectId,
      {
        prdData,
        prdContent: finalPRDContent,
        artifact: finalArtifact,
        answers,
      },
      100 // 100% completion
    );

    // Track completion event
    await trackAnalyticsEvent(
      state.userId,
      state.projectId,
      "prd_completed",
      {
        totalQuestions: answers.length,
        completedAt: new Date().toISOString(),
      }
    );
  }

  // Create completion message
  const completionMessage = new AIMessage({
    content: `✅ PRD 작성이 완료되었습니다!\n\n오른쪽 캔버스에서 완성된 PRD 문서를 확인하실 수 있습니다.\n\n총 ${answers.length}개의 질문에 답변해주셔서 감사합니다. 이 PRD를 기반으로 제품 개발을 시작하실 수 있습니다.`,
  });

  // Create user flow transition message
  const transitionMessage = new AIMessage({
    content: `이제 사용자 플로우를 작성하겠습니다. PRD 내용을 바탕으로 화면 구성과 사용자 흐름을 파악하기 위한 질문을 드릴게요! 🚀`,
  });

  return {
    prdContent: finalPRDContent,
    artifact: finalArtifact,
    messages: [completionMessage, transitionMessage],
    isComplete: true,
  };
}

/**
 * Extract pricing number from string (e.g., "14,900원/월" -> 14900)
 */
function extractPricingFromAnswer(pricing: string): number {
  // Remove commas and extract numbers
  const match = pricing.match(/(\d+,?\d*)/);
  if (match) {
    return parseInt(match[1].replace(/,/g, ''));
  }
  return 15000; // Default fallback
}

/**
 * Extract conversion rate from metric targets
 */
function extractConversionRate(targets?: Record<string, string>): number {
  if (!targets) return 12; // Default 12%

  // Look for conversion rate in targets
  for (const [key, value] of Object.entries(targets)) {
    if (key.includes('전환') || key.includes('conversion')) {
      const match = value.match(/(\d+)/);
      if (match) {
        return parseInt(match[1]);
      }
    }
  }

  return 12; // Default 12%
}
