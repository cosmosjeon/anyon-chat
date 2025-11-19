import { AIMessage } from "@langchain/core/messages";
import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { UserFlowReturnType, UserFlowState } from "../state";
import { getModelFromConfig } from "../../utils";
import { FINAL_USER_FLOW_PROMPT } from "../prompts";
import { updateUserFlowArtifact } from "../utils/templateGenerator";

/**
 * Generate Final Flow Node
 *
 * Generates the final user flow document in 3 formats:
 * 1. Text-based scenarios
 * 2. ASCII screen mockups
 * 3. Mermaid flow diagram
 */
export async function generateFinalFlow(
  state: UserFlowState,
  config: LangGraphRunnableConfig
): Promise<UserFlowReturnType> {
  console.log("[generateFinalFlow] generating final user flow documents");

  const { prdContent, answers, userFlowContext } = state;

  // Build answers text
  const answersText = answers
    .map((a, index) => `Q${index + 1}: ${a.questionText}\nA${index + 1}: ${a.answer}`)
    .join("\n\n");

  // Build context text
  const contextText = JSON.stringify(userFlowContext, null, 2);

  // Create prompt
  const prompt = FINAL_USER_FLOW_PROMPT.replace("{prdContent}", prdContent || "PRD 없음")
    .replace("{allAnswers}", answersText)
    .replace("{userFlowContext}", contextText);

  const model = await getModelFromConfig(config);

  try {
    const response = await model.invoke([
      {
        role: "system",
        content:
          "당신은 UX 전문가입니다. PRD와 질문-답변을 바탕으로 완전한 유저 플로우 문서를 3가지 포맷으로 생성합니다.",
      },
      { role: "user", content: prompt },
    ]);

    const responseText = response.content.toString();

    // Try to parse JSON response
    let flowData: any;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        flowData = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create basic structure
        flowData = {
          textFlow: generateFallbackTextFlow(userFlowContext),
          asciiScreens: generateFallbackASCII(userFlowContext),
          mermaidDiagram: generateFallbackMermaid(userFlowContext),
        };
      }
    } catch (parseError) {
      console.error("[generateFinalFlow] failed to parse AI response:", parseError);
      flowData = {
        textFlow: generateFallbackTextFlow(userFlowContext),
        asciiScreens: generateFallbackASCII(userFlowContext),
        mermaidDiagram: generateFallbackMermaid(userFlowContext),
      };
    }

    // Create updated artifact with all 3 tabs
    const finalArtifact = state.artifact
      ? {
          ...state.artifact,
          contents: [
            {
              index: 0,
              type: "text" as const,
              title: "유저 플로우 (텍스트)",
              fullMarkdown: flowData.textFlow,
            },
            {
              index: 1,
              type: "text" as const,
              title: "유저 플로우 (ASCII)",
              fullMarkdown: flowData.asciiScreens,
            },
            {
              index: 2,
              type: "text" as const,
              title: "유저 플로우 (Mermaid)",
              fullMarkdown: flowData.mermaidDiagram,
            },
          ],
        }
      : updateUserFlowArtifact(
          undefined,
          flowData.textFlow,
          flowData.asciiScreens,
          flowData.mermaidDiagram,
          100
        );

    // Completion message
    const completionMessage = new AIMessage({
      content: `✅ 유저 플로우 작성이 완료되었습니다!

3가지 포맷으로 생성되었습니다:
1. **텍스트 플로우** - 사용자 시나리오와 주요 플로우
2. **ASCII 화면** - 각 화면의 텍스트 목업
3. **Mermaid 다이어그램** - 화면 전환 흐름도

우측 캔버스에서 탭을 전환하며 확인해보세요! 🎉`,
    });

    console.log("[generateFinalFlow] final flow generated successfully");

    return {
      messages: [completionMessage],
      textFlow: flowData.textFlow,
      asciiScreens: flowData.asciiScreens,
      mermaidDiagram: flowData.mermaidDiagram,
      artifact: finalArtifact,
      userFlowContent: flowData.textFlow,
      completenessScore: 100,
      isComplete: true,
    };
  } catch (error) {
    console.error("[generateFinalFlow] error generating final flow:", error);

    // Fallback completion message
    const errorMessage = new AIMessage({
      content: `유저 플로우 생성 중 오류가 발생했습니다. 수집된 정보를 바탕으로 기본 플로우를 생성합니다.`,
    });

    const fallbackTextFlow = generateFallbackTextFlow(userFlowContext);
    const fallbackASCII = generateFallbackASCII(userFlowContext);
    const fallbackMermaid = generateFallbackMermaid(userFlowContext);

    const fallbackArtifact = updateUserFlowArtifact(
      state.artifact,
      fallbackTextFlow,
      fallbackASCII,
      fallbackMermaid,
      80
    );

    return {
      messages: [errorMessage],
      textFlow: fallbackTextFlow,
      asciiScreens: fallbackASCII,
      mermaidDiagram: fallbackMermaid,
      artifact: fallbackArtifact,
      completenessScore: 80,
      isComplete: true,
    };
  }
}

/**
 * Generate fallback text flow
 */
function generateFallbackTextFlow(context: any): string {
  const today = new Date().toISOString().split("T")[0];

  let content = `# 유저 플로우 문서\n\n**작성 진행도**: 100%\n**작성일**: ${today}\n\n---\n\n`;

  content += `## 📱 화면 목록\n\n`;

  if (context.screenList && context.screenList.length > 0) {
    context.screenList.forEach((screen: any, index: number) => {
      content += `${index + 1}. **${screen.name}**${screen.purpose ? ` - ${screen.purpose}` : ""}\n`;
    });
    content += `\n총 ${context.screenList.length}개 화면\n\n`;
  } else {
    content += `_화면 정보가 수집되지 않았습니다._\n\n`;
  }

  content += `## 🎬 사용자 플로우\n\n`;
  content += `### 1️⃣ 첫 사용자 플로우\n\n`;
  content += `1. 앱 실행\n`;
  if (context.splashDuration) {
    content += `2. 스플래시 화면 (${context.splashDuration})\n`;
  }
  if (context.loginMethod) {
    content += `3. 로그인 (${context.loginMethod})\n`;
  }
  content += `4. 메인 화면 진입\n`;
  content += `5. 주요 기능 사용\n\n`;

  content += `### 2️⃣ 일반 사용자 플로우\n\n`;
  content += `1. 메인 화면\n`;
  content += `2. 기능 실행\n`;
  content += `3. 작업 완료\n\n`;

  return content;
}

/**
 * Generate fallback ASCII mockups
 */
function generateFallbackASCII(context: any): string {
  const today = new Date().toISOString().split("T")[0];

  let content = `# 화면 구성 (ASCII)\n\n**작성 진행도**: 100%\n**작성일**: ${today}\n\n---\n\n`;

  if (context.screenList && context.screenList.length > 0) {
    context.screenList.forEach((screen: any, index: number) => {
      content += `## 화면 ${index + 1}: ${screen.name}\n\n`;
      content += `\`\`\`\n`;
      content += `┌─────────────────────────┐\n`;
      content += `│ ${screen.name.padEnd(23)} │\n`;
      content += `├─────────────────────────┤\n`;
      content += `│                         │\n`;
      content += `│   메인 콘텐츠 영역      │\n`;
      content += `│                         │\n`;
      content += `│                         │\n`;
      content += `└─────────────────────────┘\n`;
      content += `\`\`\`\n\n`;
    });
  } else {
    content += `_화면 정보가 수집되지 않았습니다._\n\n`;
  }

  return content;
}

/**
 * Generate fallback Mermaid diagram
 */
function generateFallbackMermaid(context: any): string {
  const today = new Date().toISOString().split("T")[0];

  let content = `# 화면 흐름도 (Mermaid)\n\n**작성 진행도**: 100%\n**작성일**: ${today}\n\n---\n\n`;

  content += `\`\`\`mermaid\n`;
  content += `graph TD\n`;

  if (context.screenList && context.screenList.length > 0) {
    context.screenList.forEach((screen: any, index: number) => {
      const nodeId = String.fromCharCode(65 + index); // A, B, C, ...
      content += `    ${nodeId}[${screen.name}]\n`;

      if (index < context.screenList.length - 1) {
        const nextNodeId = String.fromCharCode(65 + index + 1);
        content += `    ${nodeId} --> ${nextNodeId}\n`;
      }
    });

    // Add some styling
    content += `\n`;
    const colors = ["#e1bee7", "#c5e1a5", "#ffccbc", "#b3e5fc", "#fff9c4"];
    context.screenList.forEach((_: any, index: number) => {
      const nodeId = String.fromCharCode(65 + index);
      const color = colors[index % colors.length];
      content += `    style ${nodeId} fill:${color}\n`;
    });
  } else {
    content += `    A[시작]\n`;
    content += `    A --> B[종료]\n`;
  }

  content += `\`\`\`\n\n`;

  return content;
}
