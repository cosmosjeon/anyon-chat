"use client";

import { Canvas } from "@/components/canvas";
import { AssistantProvider } from "@/contexts/AssistantContext";
import { GraphProvider } from "@/contexts/GraphContext";
import { ThreadProvider } from "@/contexts/ThreadProvider";
import { UserProvider } from "@/contexts/UserContext";
import { Suspense } from "react";

export default function Home() {
  return (
    <UserProvider>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
        <ThreadProvider>
          <AssistantProvider>
            <GraphProvider>
              <Canvas />
            </GraphProvider>
          </AssistantProvider>
        </ThreadProvider>
      </Suspense>
    </UserProvider>
  );
}
