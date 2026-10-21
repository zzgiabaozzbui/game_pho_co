"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  text: string;
  className?: string;
  hoverTrigger?: boolean;
}

const GLYPHS = "!<>-_\\/[]{}—=+*^?#________0101";

export function HackyText({ text, className = "", hoverTrigger = true }: Props) {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  const scramble = () => {
    let iteration = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((letter, index) => {
            if (letter === " ") return " ";
            if (index < iteration) {
              return text[index];
            }
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      iteration += 1 / 2;
    }, 28);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <span
      onMouseEnter={hoverTrigger ? scramble : undefined}
      className={`inline-block select-none font-mono ${className}`}
    >
      {displayText}
    </span>
  );
}
