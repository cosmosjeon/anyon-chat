"use client";

import { ComposerPrimitive, ThreadPrimitive } from "@assistant-ui/react";
import { type FC, useState, useEffect } from "react";

import { TooltipIconButton } from "@/components/ui/assistant-ui/tooltip-icon-button";
import { SendHorizontalIcon } from "lucide-react";
import { DragAndDropWrapper } from "./drag-drop-wrapper";
import { ComposerAttachments } from "../assistant-ui/attachment";
import { ComposerActionsPopOut } from "./composer-actions-popout";

const GENERIC_PLACEHOLDERS = [
  "당신의 아이디어를 공유하고 멋진 콘텐츠를 만들어요",
  "다음 훌륭한 콘텐츠에 대한 비전을 입력해주세요",
  "당신의 걸작은 이 프롬프트에서 시작됩니다",
  "오늘은 무엇에 대해 작성하시겠어요?",
  "콘텐츠 아이디어를 여기에 입력하고 함께 만들어요",
  "다음 훌륭한 작품은 이 프롬프트에서 시작됩니다",
  "스토리 아이디어를 공유하고 펼쳐보세요",
  "놀라운 작품을 함께 써봐요 - 여기서 시작하세요",
  "당신의 글쓰기 여정은 이 프롬프트에서 시작됩니다",
  "아이디어를 콘텐츠 마법으로 바꿔보세요 - 여기서 시작",
];

const SEARCH_PLACEHOLDERS = [
  "주제를 공유하세요 - 최신 데이터를 추가해드릴게요",
  "무엇이든 작성하세요 - 자료를 찾아드릴게요",
  "당신의 아이디어 + 최신 연구 = 훌륭한 콘텐츠",
  "실시간 사실과 함께 여기서 시작하세요",
  "데이터가 풍부한 콘텐츠를 위한 주제를 입력하세요",
  "최신 인사이트로 만들어요",
  "실시간 자료와 함께 지금 작성하세요",
  "당신의 스토리 + 최신 데이터",
  "아이디어 환영 - 리서치 준비 완료",
  "최신 사실과 함께 새롭게 시작하세요",
];

const getRandomPlaceholder = (searchEnabled: boolean) => {
  return searchEnabled
    ? SEARCH_PLACEHOLDERS[
        Math.floor(Math.random() * SEARCH_PLACEHOLDERS.length)
      ]
    : GENERIC_PLACEHOLDERS[
        Math.floor(Math.random() * GENERIC_PLACEHOLDERS.length)
      ];
};

const CircleStopIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      width="16"
      height="16"
    >
      <rect width="10" height="10" x="3" y="3" rx="2" />
    </svg>
  );
};

interface ComposerProps {
  chatStarted: boolean;
  userId: string | undefined;
  searchEnabled: boolean;
}

export const Composer: FC<ComposerProps> = (props: ComposerProps) => {
  const [placeholder, setPlaceholder] = useState("");

  useEffect(() => {
    setPlaceholder(getRandomPlaceholder(props.searchEnabled));
  }, [props.searchEnabled]);

  return (
    <DragAndDropWrapper>
      <ComposerPrimitive.Root className="focus-within:border-aui-ring/20 flex flex-col w-full min-h-[64px] flex-wrap items-center justify-center border px-2.5 shadow-sm transition-colors ease-in bg-white rounded-2xl">
        <div className="flex flex-wrap gap-2 items-start mr-auto">
          <ComposerAttachments />
        </div>

        <div className="flex flex-row w-full items-center justify-start my-auto">
          <ComposerActionsPopOut
            userId={props.userId}
            chatStarted={props.chatStarted}
          />
          <ComposerPrimitive.Input
            autoFocus
            placeholder={placeholder}
            rows={1}
            className="placeholder:text-muted-foreground max-h-40 flex-grow resize-none border-none bg-transparent px-2 py-4 text-sm outline-none focus:ring-0 disabled:cursor-not-allowed"
          />
          <ThreadPrimitive.If running={false}>
            <ComposerPrimitive.Send asChild>
              <TooltipIconButton
                tooltip="전송"
                variant="default"
                className="my-2.5 size-8 p-2 transition-opacity ease-in"
              >
                <SendHorizontalIcon />
              </TooltipIconButton>
            </ComposerPrimitive.Send>
          </ThreadPrimitive.If>
          <ThreadPrimitive.If running>
            <ComposerPrimitive.Cancel asChild>
              <TooltipIconButton
                tooltip="취소"
                variant="default"
                className="my-2.5 size-8 p-2 transition-opacity ease-in"
              >
                <CircleStopIcon />
              </TooltipIconButton>
            </ComposerPrimitive.Cancel>
          </ThreadPrimitive.If>
        </div>
      </ComposerPrimitive.Root>
    </DragAndDropWrapper>
  );
};
