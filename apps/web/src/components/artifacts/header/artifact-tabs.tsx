import { cn } from "@/lib/utils";

export type ArtifactTab = "prd" | "userflow";

interface ArtifactTabsProps {
  activeTab: ArtifactTab;
  onTabChange: (tab: ArtifactTab) => void;
}

export function ArtifactTabs({ activeTab, onTabChange }: ArtifactTabsProps) {
  return (
    <div className="flex flex-row gap-1 border-b border-gray-200">
      <button
        onClick={() => onTabChange("prd")}
        className={cn(
          "px-4 py-2 text-sm font-medium transition-colors relative",
          activeTab === "prd"
            ? "text-blue-600"
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        작성 PRD
        {activeTab === "prd" && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
        )}
      </button>
      <button
        onClick={() => onTabChange("userflow")}
        className={cn(
          "px-4 py-2 text-sm font-medium transition-colors relative",
          activeTab === "userflow"
            ? "text-blue-600"
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        유저 플로우
        {activeTab === "userflow" && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
        )}
      </button>
    </div>
  );
}
