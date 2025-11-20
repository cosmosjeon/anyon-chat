"use client";

import React, { useState } from "react";
import { useThreadRuntime } from "@assistant-ui/react";
import { Button } from "../ui/button";
import { Check } from "lucide-react";

interface DynamicQuestionOption {
  label: string;
  value: string;
  description: string;
}

interface DynamicQuestion {
  question: string;
  type: "single_choice" | "multiple_choice";
  targetSection?: string;
  rationale?: string;
}

interface DynamicQuestionData {
  question: DynamicQuestion;
  options: DynamicQuestionOption[];
}

interface DecisionButtonsProps {
  dynamicQuestion: DynamicQuestionData;
  messageId: string;
}

export const DecisionButtons: React.FC<DecisionButtonsProps> = ({
  dynamicQuestion,
  messageId: _messageId,
}) => {
  const threadRuntime = useThreadRuntime();
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(
    new Set()
  );
  const [submitted, setSubmitted] = useState(false);

  const { question, options} = dynamicQuestion;
  const isMultipleChoice = question.type === "multiple_choice";

  const handleOptionClick = (optionValue: string, optionLabel: string) => {
    if (submitted) return;

    if (isMultipleChoice) {
      const newSelected = new Set(selectedOptions);
      if (newSelected.has(optionValue)) {
        newSelected.delete(optionValue);
      } else {
        newSelected.add(optionValue);
      }
      setSelectedOptions(newSelected);
    } else {
      // Single choice - submit immediately
      setSubmitted(true);
      threadRuntime.append({ role: "user", content: [{ type: "text", text: optionLabel }] });
    }
  };

  const handleSubmitMultiple = () => {
    if (submitted || selectedOptions.size === 0) return;

    setSubmitted(true);
    const selectedLabels = options
      .filter((opt) => selectedOptions.has(opt.value))
      .map((opt) => opt.label);
    threadRuntime.append({ role: "user", content: [{ type: "text", text: selectedLabels.join(", ") }] });
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 mt-3 px-4 py-3 bg-blue-50 rounded-lg border border-blue-200">
        <Check className="w-4 h-4 text-blue-600" />
        <span className="text-sm text-blue-700 font-medium">
          {isMultipleChoice
            ? `${selectedOptions.size}개 선택 완료`
            : "선택 완료"}
        </span>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="grid gap-2">
        {options.map((option) => {
          const isSelected = selectedOptions.has(option.value);
          return (
            <Button
              key={option.value}
              onClick={() => handleOptionClick(option.value, option.label)}
              variant={isSelected ? "default" : "outline"}
              className={`w-full text-left justify-start h-auto py-3 px-4 ${
                isSelected
                  ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                  : "bg-white hover:bg-gray-50 border-gray-300"
              }`}
            >
              <div className="flex flex-col items-start w-full">
                <div className="flex items-center gap-2">
                  {isMultipleChoice && (
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? "bg-white border-white"
                          : "border-gray-400 bg-transparent"
                      }`}
                    >
                      {isSelected && (
                        <Check className="w-3 h-3 text-blue-600" />
                      )}
                    </div>
                  )}
                  <span className="font-medium">{option.label}</span>
                </div>
                <span
                  className={`text-sm mt-1 ${
                    isSelected ? "text-blue-100" : "text-gray-600"
                  }`}
                >
                  {option.description}
                </span>
              </div>
            </Button>
          );
        })}
      </div>

      {isMultipleChoice && selectedOptions.size > 0 && (
        <Button
          onClick={handleSubmitMultiple}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          선택 완료 ({selectedOptions.size}개 선택)
        </Button>
      )}
    </div>
  );
};
