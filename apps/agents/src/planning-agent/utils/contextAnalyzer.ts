import { Answer, ConversationContext, UserMindset, PRDData } from "../types";

/**
 * Analyze conversation context from collected answers
 */
export function analyzeConversationContext(
  answers: Answer[],
  prdData: Partial<PRDData>
): ConversationContext {
  const context: ConversationContext = {};

  // Extract product information
  if (prdData.productName || prdData.productOneLine) {
    context.product = prdData.productName
      ? `${prdData.productName}: ${prdData.productOneLine || ""}`
      : prdData.productOneLine;
  }

  // Extract problem
  if (prdData.coreProblem) {
    context.problem = prdData.coreProblem;
  }

  // Extract target users
  if (prdData.targetUsers && prdData.targetUsers.length > 0) {
    context.target = prdData.targetUsers.join(", ");
  } else if (prdData.targetUserDetail) {
    context.target = prdData.targetUserDetail;
  }

  // Extract core values
  if (prdData.coreValue && prdData.coreValue.length > 0) {
    context.values = prdData.coreValue;
  }

  // Infer user mindset
  context.userMindset = inferUserMindset(answers, prdData);

  return context;
}

/**
 * Infer user mindset from previous answers
 */
export function inferUserMindset(
  answers: Answer[],
  prdData: Partial<PRDData>
): UserMindset {
  const signals = {
    growth: 0,
    profit: 0,
    quality: 0,
  };

  // Analyze business model choices
  if (prdData.businessModel?.includes("무료")) {
    signals.growth += 2;
  }
  if (prdData.businessModel?.includes("프리미엄")) {
    signals.profit += 2;
  }

  // Analyze pricing strategy
  if (prdData.pricing) {
    const pricingText = prdData.pricing.toLowerCase();
    if (pricingText.includes("저가") || pricingText.includes("무료")) {
      signals.growth += 2;
    }
    if (pricingText.includes("프리미엄") || pricingText.includes("고가")) {
      signals.profit += 1;
      signals.quality += 1;
    }
  }

  // Analyze conversion strategy
  if (prdData.conversionStrategy) {
    const conversionText = prdData.conversionStrategy.toLowerCase();
    if (conversionText.includes("빠르") || conversionText.includes("즉시")) {
      signals.growth += 1;
    }
    if (conversionText.includes("가치") || conversionText.includes("경험")) {
      signals.quality += 1;
    }
  }

  // Analyze core values
  if (prdData.coreValue) {
    prdData.coreValue.forEach((value) => {
      const valueText = value.toLowerCase();
      if (valueText.includes("빠른") || valueText.includes("간편")) {
        signals.growth += 1;
      }
      if (valueText.includes("정확") || valueText.includes("품질")) {
        signals.quality += 1;
      }
      if (valueText.includes("수익") || valueText.includes("효율")) {
        signals.profit += 1;
      }
    });
  }

  // Analyze metrics
  if (prdData.successMetrics) {
    prdData.successMetrics.forEach((metric) => {
      const metricText = metric.toLowerCase();
      if (metricText.includes("성장") || metricText.includes("사용자")) {
        signals.growth += 1;
      }
      if (metricText.includes("수익") || metricText.includes("매출")) {
        signals.profit += 1;
      }
      if (metricText.includes("만족") || metricText.includes("품질")) {
        signals.quality += 1;
      }
    });
  }

  // Determine dominant mindset
  const maxSignal = Math.max(signals.growth, signals.profit, signals.quality);
  const equalSignals = Object.values(signals).filter((s) => s === maxSignal).length;

  // If all signals are equal or very close, return balanced
  if (equalSignals >= 2 || maxSignal === 0) {
    return "balanced";
  }

  if (signals.growth === maxSignal) {
    return "growth_focused";
  }
  if (signals.profit === maxSignal) {
    return "profit_focused";
  }
  if (signals.quality === maxSignal) {
    return "quality_focused";
  }

  return "balanced";
}

/**
 * Get mindset description for AI prompts
 */
export function getMindsetDescription(mindset: UserMindset): string {
  switch (mindset) {
    case "growth_focused":
      return "사용자는 빠른 성장과 시장 점유율 확대에 집중하고 있습니다. 사용자 획득, 바이럴 성장, 네트워크 효과에 관심이 많습니다.";
    case "profit_focused":
      return "사용자는 수익성과 비즈니스 효율성에 집중하고 있습니다. 수익 모델, LTV/CAC, 단위 경제성에 관심이 많습니다.";
    case "quality_focused":
      return "사용자는 제품 품질과 사용자 경험에 집중하고 있습니다. 완성도, 만족도, 장기적 가치에 관심이 많습니다.";
    case "balanced":
      return "사용자는 성장, 수익, 품질을 균형있게 고려하고 있습니다.";
  }
}
