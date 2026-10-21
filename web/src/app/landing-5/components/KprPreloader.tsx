"use client";

import { useEffect, useState } from "react";

interface KprPreloaderProps {
  onEnter: (withAudio: boolean) => void;
}

const TELEMETRY_FILES = [
  "HTTPS://PHOCO.VN/SECTOR-36/GATE-01/HANG-BAC/SILVER-FORGE/LOG-918",
  "HTTPS://PHOCO.VN/SECTOR-36/CORE-02/HOAN-KIEM/TURTLE-TOWER/TELEMETRY",
  "HTTPS://PHOCO.VN/SECTOR-36/VAULT-03/HANG-DAU/WATER-RESERVOIR/ARCHIVE",
  "HTTPS://PHOCO.VN/SECTOR-36/GUILD-04/HANG-GAI/SILK-WEAVING/PATTERN-X",
  "HTTPS://PHOCO.VN/SECTOR-36/RELIC-05/DONG-XUAN/NIGHT-MARKET/BEACON",
  "HTTPS://PHOCO.VN/SECTOR-36/PROTOCOL/AR-SPATIAL/CHEST-REVEAL/HASH-2026",
];

export function KprPreloader({ onEnter }: KprPreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [fileIndex, setFileIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Loading bar animation
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsReady(true);
          return 100;
        }
        const step = Math.floor(Math.random() * 8) + 4;
        return Math.min(100, prev + step);
      });
    }, 60);

    const fileTimer = setInterval(() => {
      setFileIndex((prev) => (prev + 1) % TELEMETRY_FILES.length);
    }, 150);

    return () => {
      clearInterval(timer);
      clearInterval(fileTimer);
    };
  }, []);

  const handleTriggerEnter = (withAudio: boolean) => {
    setIsExiting(true);
    setTimeout(() => {
      onEnter(withAudio);
    }, 450);
  };

  return (
    <aside
      aria-label="Preloader"
      className={`fixed inset-0 z-[400] flex flex-col items-center justify-center bg-white text-black font-mono transition-opacity duration-500 select-none ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      onClick={() => isReady && handleTriggerEnter(true)}
    >
      {/* Center loading bar container */}
      <div className="w-full max-w-[870px] px-6">
        {/* The thin progress bar */}
        <div className="relative h-[2px] w-full bg-[#e1e1e1] overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-black transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress details row */}
        <div className="mt-2.5 flex items-start justify-between text-[11px] uppercase tracking-tight text-black/80 font-mono">
          <div className="flex items-center gap-2">
            <svg
              className="w-3 h-3 animate-spin"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon points="8,1 15,14 1,14" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="font-semibold">LOADING - {progress}%</span>
          </div>

          <div className="hidden sm:block text-[10px] text-black/60 truncate max-w-[480px]">
            {TELEMETRY_FILES[fileIndex]}
          </div>
        </div>
      </div>

      {/* Audio Enter CTA - Positioned like KPR (50vw, 72vh) */}
      <div className="absolute left-1/2 top-[72%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleTriggerEnter(true);
          }}
          className={`group relative flex flex-col items-center cursor-pointer transition-all duration-300 ${
            isReady ? "opacity-100 scale-100" : "opacity-40 scale-95"
          }`}
          title="Click to enter with sound"
        >
          {/* Spinning Ring SVG */}
          <div className="relative w-[60px] h-[60px] flex items-center justify-center">
            <svg
              width="59"
              height="59"
              viewBox="0 0 59 59"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full animate-[spin_6s_linear_infinite]"
            >
              <path
                d="M32.6485 54.1946C38.7182 53.5094 44.3319 50.641 48.4436 46.1237C52.5553 41.6065 54.8846 35.7486 54.9975 29.6413C55.1104 23.5341 52.9993 17.594 49.0574 12.9279C45.1155 8.26175 39.6117 5.18776 33.5715 4.27864"
                stroke="black"
                strokeWidth="1.2"
              />
              <path
                d="M26.3515 54.1946C20.2818 53.5094 14.6681 50.641 10.5564 46.1237C6.44473 41.6065 4.11543 35.7486 4.0025 29.6413C3.88957 23.5341 6.00071 17.594 9.9426 12.9279C13.8845 8.26175 19.3883 5.18776 25.4285 4.27864"
                stroke="black"
                strokeWidth="1.2"
              />
            </svg>

            {/* Inner small 5 audio bars */}
            <div className="absolute inset-0 m-auto flex items-center justify-center gap-[2px] w-4 h-4">
              <span className="w-[1.5px] h-2 bg-black animate-pulse" />
              <span className="w-[1.5px] h-3.5 bg-black animate-pulse [animation-delay:150ms]" />
              <span className="w-[1.5px] h-1.5 bg-black animate-pulse [animation-delay:300ms]" />
              <span className="w-[1.5px] h-3 bg-black animate-pulse [animation-delay:450ms]" />
              <span className="w-[1.5px] h-2 bg-black animate-pulse [animation-delay:200ms]" />
            </div>
          </div>

          {/* CTA Copy */}
          <span className="mt-3 text-[11px] tracking-wider uppercase font-semibold text-black group-hover:underline">
            {isReady ? "Click to Enter with Sound" : "Calibrating Protocol..."}
          </span>
        </button>
      </div>
    </aside>
  );
}
