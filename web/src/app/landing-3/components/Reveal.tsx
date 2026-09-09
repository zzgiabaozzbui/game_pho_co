"use client";

import { useReveal } from "@/lib/motion/useReveal";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delayMs?: number;
  className?: string;
  threshold?: number;
}

export function Reveal({
  children,
  delayMs = 0,
  className = "",
  threshold = 0.15,
}: RevealProps) {
  const { ref, revealed } = useReveal<HTMLDivElement>(threshold);

  return (
    <div
      ref={ref}
      style={{
        transitionDuration: "400ms",
        transitionDelay: `${delayMs}ms`,
      }}
      className={`transition-all ease-out transform-gpu ${
        revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className}`}
    >
      {children}
    </div>
  );
}
