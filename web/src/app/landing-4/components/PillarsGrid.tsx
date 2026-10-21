"use client";

import { useState } from "react";
import type { IglooLandingData } from "../landing-igloo.data";

interface Props {
  data: IglooLandingData["pillars"];
  onInteract?: () => void;
}

export function PillarsGrid({ data, onInteract }: Props) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="mb-12 max-w-3xl">
        <div className="font-mono text-xs uppercase tracking-[0.25em] text-amber-400/80">
          {data.sectionTag}
        </div>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          {data.heading}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-white/70">
          {data.description}
        </p>
      </div>

      {/* 4 Monolithic Pillar Cards (2x2 Grid) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {data.items.map((item) => {
          const isHovered = hoveredCard === item.id;
          return (
            <div
              key={item.id}
              onMouseEnter={() => {
                setHoveredCard(item.id);
                onInteract?.();
              }}
              onMouseLeave={() => setHoveredCard(null)}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-8 backdrop-blur-md transition-all duration-500 hover:border-amber-400/40 hover:bg-black/60 hover:shadow-[0_0_30px_rgba(251,191,36,0.08)]"
            >
              {/* Background ambient radial highlight */}
              <div
                className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/10 blur-[80px] transition-opacity duration-500 ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* Top Row: Number & Tag */}
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="font-mono text-xs font-bold text-amber-400">
                    {item.number} {"//"} PILLAR
                  </span>
                  <span className="rounded border border-white/15 bg-white/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white/60">
                    {item.tag}
                  </span>
                </div>

                <h3 className="mt-6 text-2xl font-bold tracking-tight text-white transition-colors group-hover:text-amber-200">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  {item.summary}
                </p>

                {/* Details list */}
                <ul className="mt-6 space-y-2.5">
                  {item.details.map((detail, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs leading-relaxed text-white/60"
                    >
                      <span className="mt-0.5 text-amber-400/80 font-mono">▸</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Stat Footer */}
              <div className="mt-8 flex items-baseline justify-between border-t border-white/10 pt-4">
                <span className="font-mono text-[11px] uppercase tracking-wider text-white/40">
                  {item.statLabel}
                </span>
                <span className="font-mono text-xl font-bold tracking-tight text-white group-hover:text-amber-400">
                  {item.stat}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
