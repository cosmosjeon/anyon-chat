import { PRDData, CompletenessReport } from "../types";
import { TemplateLevel, PRD_TEMPLATE_LEVELS } from "../prd-checklist";

/**
 * Check PRD completeness based on template level
 */
export function checkCompleteness(
  prdData: Partial<PRDData>,
  templateLevel: TemplateLevel
): CompletenessReport {
  const template = PRD_TEMPLATE_LEVELS[templateLevel];
  const sections = template.sections;

  const sectionScores = sections.map((section) => {
    const totalFields = section.required_fields.length;
    const filledFields = section.required_fields.filter((field) => {
      const value = prdData[field.key as keyof PRDData];
      return value !== undefined && value !== null && value !== "";
    }).length;

    const score = totalFields > 0 ? (filledFields / totalFields) * 100 : 0;

    const missingFields = section.required_fields
      .filter((field) => {
        const value = prdData[field.key as keyof PRDData];
        return value === undefined || value === null || value === "";
      })
      .map((field) => field.key);

    return {
      name: section.name,
      score: Math.round(score),
      missingFields,
    };
  });

  // Calculate overall score (weighted by section count)
  const overallScore = Math.round(
    sectionScores.reduce((sum, s) => sum + s.score, 0) / sectionScores.length
  );

  // Identify critical gaps (high priority missing fields)
  const criticalGaps: string[] = [];
  sections.forEach((section) => {
    section.required_fields.forEach((field) => {
      if (field.priority === "high") {
        const value = prdData[field.key as keyof PRDData];
        if (value === undefined || value === null || value === "") {
          criticalGaps.push(`${section.name} - ${field.prompt_hint}`);
        }
      }
    });
  });

  return {
    overallScore,
    sections: sectionScores,
    criticalGaps,
  };
}

/**
 * Get next section to focus on (lowest score, prioritize high-priority sections)
 */
export function getNextSection(
  report: CompletenessReport,
  templateLevel: TemplateLevel
): string | null {
  const template = PRD_TEMPLATE_LEVELS[templateLevel];

  // Find sections with lowest scores
  const incompleteSections = report.sections.filter((s) => s.score < 100);

  if (incompleteSections.length === 0) {
    return null; // Everything is complete
  }

  // Sort by score ascending (focus on least complete sections first)
  incompleteSections.sort((a, b) => a.score - b.score);

  // Return the section name with lowest score
  return incompleteSections[0].name;
}

/**
 * Get missing high-priority fields
 */
export function getMissingHighPriorityFields(
  prdData: Partial<PRDData>,
  templateLevel: TemplateLevel
): Array<{ section: string; field: string; hint: string }> {
  const template = PRD_TEMPLATE_LEVELS[templateLevel];
  const missing: Array<{ section: string; field: string; hint: string }> = [];

  template.sections.forEach((section) => {
    section.required_fields.forEach((field) => {
      if (field.priority === "high") {
        const value = prdData[field.key as keyof PRDData];
        if (value === undefined || value === null || value === "") {
          missing.push({
            section: section.name,
            field: field.key,
            hint: field.prompt_hint,
          });
        }
      }
    });
  });

  return missing;
}

/**
 * Check if PRD is complete enough to finish
 */
export function isCompleteEnough(
  report: CompletenessReport,
  currentQuestionCount: number,
  maxQuestions: number
): boolean {
  // If we've used all questions, we're done regardless
  if (currentQuestionCount >= maxQuestions) {
    return true;
  }

  // If overall score is above 90%, we're done
  if (report.overallScore >= 90) {
    return true;
  }

  // If we're at 80%+ questions used and score is above 70%, we're done
  const questionProgress = (currentQuestionCount / maxQuestions) * 100;
  if (questionProgress >= 80 && report.overallScore >= 70) {
    return true;
  }

  // If there are no critical gaps and score is above 80%, we're done
  if (report.criticalGaps.length === 0 && report.overallScore >= 80) {
    return true;
  }

  return false;
}
