"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { KprLandingData } from "../landing-kpr.data";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: KprLandingData["console"];
  onCommandSound?: () => void;
}

interface LogEntry {
  type: "input" | "output" | "system";
  text: string;
}

export function KprConsole({ isOpen, onClose, data, onCommandSound }: Props) {
  const router = useRouter();
  const [inputVal, setInputVal] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([
    { type: "system", text: data.welcomeMsg },
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    const rawCmd = inputVal.trim();
    if (!rawCmd) return;

    onCommandSound?.();
    const cmd = rawCmd.toLowerCase();
    const newLogs: LogEntry[] = [...logs, { type: "input", text: `${data.promptPrefix} ${rawCmd}` }];

    if (cmd === "clear") {
      setLogs([]);
      setInputVal("");
      return;
    }

    if (cmd === "help") {
      newLogs.push({ type: "output", text: data.commandsHelp });
    } else if (cmd === "lore") {
      newLogs.push({ type: "output", text: data.commands.lore });
    } else if (cmd === "stations") {
      newLogs.push({ type: "output", text: data.commands.stations });
    } else if (cmd === "chests") {
      newLogs.push({ type: "output", text: data.commands.chests });
    } else if (cmd === "coords") {
      newLogs.push({ type: "output", text: data.commands.coords });
    } else if (cmd === "play") {
      newLogs.push({ type: "output", text: "INITIATING RUNTIME ENGINE // SECTOR 36..." });
      setTimeout(() => {
        router.push("/play");
      }, 600);
    } else {
      newLogs.push({ type: "output", text: data.commandNotFound });
    }

    setLogs(newLogs);
    setInputVal("");
  };

  return (
    <aside
      aria-label="Terminal Console"
      className="the-console fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm font-mono select-none"
    >
      {/* KPR Retro Terminal Panel: Clean Light Modern Window */}
      <div className="relative w-full max-w-[560px] h-[500px] flex flex-col rounded-lg border border-black/15 bg-white text-black shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden">
        {/* Terminal Header Bar */}
        <div className="h-[48px] px-4 flex items-center justify-between border-b border-black/10 bg-[#F4F4F6]">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#6D64A3]">
              ENCRYPTED PROTOCOL
            </span>
            <span className="text-[9px] text-black/50 tracking-tight font-medium">
              VJ91-31133150 // PHO-CO-36
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-0.5 border border-black/15 rounded text-[9px] uppercase font-semibold text-black/70">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6D64A3] animate-ping" />
              <span>PHỐ CỔ MAINNET</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center border border-black/15 rounded hover:bg-black hover:text-white text-black transition-colors cursor-pointer"
              aria-label="Close terminal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Terminal Output Buffer */}
        <div
          ref={scrollRef}
          className="flex-1 p-4 overflow-y-auto space-y-2.5 text-xs text-black/80 leading-relaxed select-text font-mono bg-[#FAFAFC]"
        >
          {logs.map((entry, idx) => (
            <div
              key={idx}
              className={`whitespace-pre-wrap break-words ${
                entry.type === "input"
                  ? "text-black font-bold"
                  : entry.type === "system"
                  ? "text-[#6D64A3] font-semibold"
                  : "text-black/80"
              }`}
            >
              {entry.text}
            </div>
          ))}
        </div>

        {/* Interactive Prompt Command Input Form */}
        <form
          onSubmit={handleExecute}
          className="h-[44px] px-4 flex items-center gap-2 border-t border-black/10 bg-white"
        >
          {/* Terminal prompt symbol */}
          <div className="flex items-center gap-1.5 text-[#6D64A3]">
            <svg fill="none" viewBox="0 0 18 14" className="w-3.5 h-3.5 stroke-current">
              <path d="m1.68 1.11 4.888 4.949A1.04 1.04 0 0 1 6.56 7.53l-4.88 4.818m7.508.59h7.491" strokeWidth="1.5" />
            </svg>
            <span className="font-bold text-xs">&gt;</span>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="type 'help', 'stations', 'chests', 'lore', 'play'..."
            className="flex-1 bg-transparent text-xs text-black placeholder-black/40 focus:outline-none font-mono"
          />

          <span className="text-[10px] text-black/40 hidden sm:inline font-mono font-semibold">↵ ENTER</span>
        </form>
      </div>
    </aside>
  );
}
