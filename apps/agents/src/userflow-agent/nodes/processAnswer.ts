import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { UserFlowReturnType, UserFlowState } from "../state";
import { Answer } from "../types";
import { getModelFromConfig } from "../../utils";
import { PROCESS_ANSWER_PROMPT } from "../prompts";
import { updateUserFlowArtifact } from "../utils/templateGenerator";

/**
 * Process Answer Node
 *
 * Processes user's answer to the current question:
 * 1. Extract key information (screens, features, interactions)
 * 2. Update user flow context
 * 3. Determine if follow-up question is needed
 * 4. Update completeness score
 * 5. Progressively update the artifact template
 */
export async function processAnswer(
  state: UserFlowState,
  config: LangGraphRunnableConfig
): Promise<UserFlowReturnType> {
  console.log("[processAnswer] entering");

  const { messages, latestDynamicQuestion, answers, userFlowContext, artifact } = state;

  // Get the last user message (their answer)
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage._getType() !== "human") {
    console.error("[processAnswer] no user message found");
    return { awaitingAnswer: false };
  }

  const userAnswer = lastMessage.content.toString();
  const questionText = latestDynamicQuestion?.questionText || "질문";

  // Create answer record
  const newAnswer: Answer = {
    questionId: latestDynamicQuestion?.id || `q${answers.length + 1}`,
    questionText,
    answer: userAnswer,
    timestamp: new Date(),
  };

  // Use AI to process the answer
  const model = await getModelFromConfig(config);

  const prompt = PROCESS_ANSWER_PROMPT.replace("{question}", questionText).replace(
    "{answer}",
    userAnswer
  );

  try {
    const response = await model.invoke([
      {
        role: "system",
        content:
          "당신은 UX 전문가입니다. 사용자 답변에서 핵심 정보를 추출하고 꼬리 질문이 필요한지 판단합니다.",
      },
      { role: "user", content: prompt },
    ]);

    const responseText = response.content.toString();

    // Try to parse JSON response
    let analysisData: any;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        analysisData = {
          extractedInfo: {},
          needsFollowUp: false,
          completenessScore: 50,
        };
      }
    } catch (parseError) {
      analysisData = {
        extractedInfo: {},
        needsFollowUp: false,
        completenessScore: 50,
      };
    }

    // Update context with extracted info
    const updatedContext = {
      ...userFlowContext,
      ...extractContextFromAnswer(analysisData.extractedInfo, questionText, userAnswer),
    };

    // Update completeness score
    const newCompletenessScore = Math.min(
      100,
      (state.completenessScore || 0) +
        analysisData.completenessScore / (state.maxQuestions || 20)
    );

    // Determine if follow-up is needed
    const needsFollowup = analysisData.needsFollowUp || false;
    const followUpText = needsFollowup
      ? generateFollowUpQuestion(analysisData.followUpReason, userAnswer)
      : undefined;

    // Progressively update the artifact template
    const updatedArtifact = updateProgressiveTemplate(
      artifact,
      updatedContext,
      newCompletenessScore
    );

    console.log("[processAnswer] processed:", {
      extractedInfo: analysisData.extractedInfo,
      needsFollowup,
      completenessScore: newCompletenessScore,
    });

    return {
      answers: [newAnswer],
      userFlowContext: updatedContext,
      completenessScore: newCompletenessScore,
      needsFollowup,
      customQuestionText: followUpText,
      awaitingAnswer: false,
      artifact: updatedArtifact,
      userFlowContent: updatedArtifact?.contents[0].fullMarkdown || state.userFlowContent,
    };
  } catch (error) {
    console.error("[processAnswer] error processing answer:", error);

    // Fallback: just save the answer
    return {
      answers: [newAnswer],
      completenessScore: Math.min(100, (state.completenessScore || 0) + 5),
      awaitingAnswer: false,
    };
  }
}

/**
 * Extract context information from AI analysis
 */
function extractContextFromAnswer(
  extractedInfo: any,
  questionText: string,
  userAnswer: string
): any {
  const context: any = {};

  // Extract screens
  if (extractedInfo.screens && Array.isArray(extractedInfo.screens)) {
    if (questionText.includes("화면 개수")) {
      context.totalScreens = extractedInfo.screens.length || parseScreenCount(userAnswer);
    } else {
      context.screenList = extractedInfo.screens.map((name: string) => ({
        name,
        purpose: "",
      }));
    }
  }

  // Extract features
  if (extractedInfo.features && Array.isArray(extractedInfo.features)) {
    context.features = extractedInfo.features;
  }

  // Extract interactions
  if (extractedInfo.interactions && Array.isArray(extractedInfo.interactions)) {
    context.interactions = extractedInfo.interactions;
  }

  // Extract specific patterns from answers
  if (questionText.includes("로그인")) {
    context.loginMethod = userAnswer;
  }

  if (questionText.includes("메인 화면") && questionText.includes("레이아웃")) {
    context.mainScreenLayout = userAnswer;
  }

  if (questionText.includes("스플래시")) {
    context.splashDuration = userAnswer;
  }

  if (questionText.includes("결제") || questionText.includes("유료")) {
    context.hasFreemium = true;
    context.pricingInfo = userAnswer;
  }

  return context;
}

/**
 * Parse screen count from user answer
 */
function parseScreenCount(answer: string): number | undefined {
  const match = answer.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
}

/**
 * Generate follow-up question based on reason
 */
function generateFollowUpQuestion(_reason: string, previousAnswer: string): string {
  // Extract mentioned elements that need clarification
  const elements = extractMentionedElements(previousAnswer);

  if (elements.length > 0) {
    const element = elements[0];
    return `"${element}"에 대해 좀 더 자세히 설명해주시겠어요? (예: 어떻게 작동하나요? 어디로 이동하나요?)`;
  }

  return `방금 답변하신 내용에 대해 조금 더 구체적으로 설명해주실 수 있나요?`;
}

/**
 * Extract mentioned UI elements for follow-up
 */
function extractMentionedElements(answer: string): string[] {
  const elements: string[] = [];

  // Common UI element patterns
  const patterns = [
    /([가-힣]+)\s*버튼/g,
    /([가-힣]+)\s*아이콘/g,
    /([가-힣]+)\s*화면/g,
    /([가-힣]+)\s*모달/g,
    /([가-힣]+)\s*탭/g,
  ];

  for (const pattern of patterns) {
    const matches = answer.matchAll(pattern);
    for (const match of matches) {
      elements.push(match[0]);
    }
  }

  return elements;
}

/**
 * Progressively update artifact template with new info
 */
function updateProgressiveTemplate(
  artifact: any,
  context: any,
  completenessScore: number
): any {
  if (!artifact) return artifact;

  // Get current markdown
  const currentMarkdown = artifact.contents[0].fullMarkdown || "";

  // Update screen list section
  let updatedMarkdown = currentMarkdown;

  if (context.screenList && context.screenList.length > 0) {
    const screenListText = context.screenList
      .map((screen: any, index: number) => `${index + 1}. **${screen.name}**`)
      .join("\n");

    updatedMarkdown = updatedMarkdown.replace(
      /## 📱 화면 목록\n\n_작성 중\.\.\._/,
      `## 📱 화면 목록\n\n${screenListText}\n\n총 ${context.screenList.length}개 화면`
    );
  }

  // Update progress percentage
  updatedMarkdown = updatedMarkdown.replace(
    /\*\*작성 진행도\*\*:\s*\d+%/,
    `**작성 진행도**: ${Math.round(completenessScore)}%`
  );

  return updateUserFlowArtifact(
    artifact,
    updatedMarkdown,
    undefined,
    undefined,
    completenessScore
  );
}
