"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const inter = Inter({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-screen">
      <body className={cn("min-h-full", inter.className)}>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
