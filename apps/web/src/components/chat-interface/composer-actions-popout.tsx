"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CirclePlus, Globe } from "lucide-react";
import { useState } from "react";
import { ComposerAddAttachment } from "../assistant-ui/attachment";
import { TooltipIconButton } from "../assistant-ui/tooltip-icon-button";
import { cn } from "@/lib/utils";
import { useGraphContext } from "@/contexts/GraphContext";

interface ComposerActionsPopOutProps {
  userId: string | undefined;
  chatStarted: boolean;
}

export function ComposerActionsPopOut(_props: ComposerActionsPopOutProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [_isMouseOver, setIsMouseOver] = useState(false);
  const {
    graphData: { searchEnabled, setSearchEnabled },
  } = useGraphContext();

  const containerVariants = {
    collapsed: {
      width: searchEnabled ? "80px" : "40px",
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
      },
    },
    expanded: {
      width: "120px",
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
      },
    },
  };

  const iconsContainerVariants = {
    collapsed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2,
      },
    },
    expanded: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
        delay: 0.1,
      },
    },
  };

  return (
    <motion.div
      onMouseEnter={() => {
        setIsMouseOver(true);
        setIsExpanded(true);
      }}
      onMouseLeave={() => {
        setIsMouseOver(false);
        setIsExpanded(false);
      }}
    >
      <motion.div
        className="rounded-full flex items-center h-8 justify-start px-2 py-5 bg-blue-50 overflow-hidden"
        variants={containerVariants}
        animate={isExpanded ? "expanded" : "collapsed"}
        initial="collapsed"
      >
        <div className="flex items-center gap-2">
          <CirclePlus
            className={cn(
              "size-6 flex-shrink-0",
              isExpanded && "opacity-60 transition-all ease-in-out"
            )}
          />
          {searchEnabled && (
            <TooltipIconButton
              tooltip="Web search"
              variant="ghost"
              className="size-7 flex-shrink-0 bg-blue-100 hover:bg-blue-100"
              onClick={() => setSearchEnabled((p) => !p)}
            >
              <Globe />
            </TooltipIconButton>
          )}
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="flex items-center justify-center gap-2 ml-2"
              variants={iconsContainerVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
            >
              {!searchEnabled && (
                <TooltipIconButton
                  tooltip="Web search"
                  variant="ghost"
                  className="size-7 flex-shrink-0 hover:bg-blue-100 transition-colors ease-in-out"
                  onClick={() => setSearchEnabled((p) => !p)}
                >
                  <Globe />
                </TooltipIconButton>
              )}
              <ComposerAddAttachment className="hover:bg-blue-100 transition-colors ease-in-out" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
