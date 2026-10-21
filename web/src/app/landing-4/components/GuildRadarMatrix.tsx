"use client";

import { useState } from "react";
import type { IglooLandingData } from "../landing-igloo.data";

interface Props {
  data: IglooLandingData["matrix"];
  onSelectStation?: (stationId: string) => void;
  onInteract?: () => void;
}

export function GuildRadarMatrix({ data, onSelectStation, onInteract }: Props) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeStationId, setActiveStationId] = useState<string>(
    data.stations[0]?.id || "hang-bac"
  );

  const filteredStations =
    selectedCategory === "all"
      ? data.stations
      : data.stations.filter((s) => s.categoryId === selectedCategory);

  const activeStation =
    data.stations.find((s) => s.id === activeStationId) || data.stations[0];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-10 max-w-3xl">
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

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-6">
        {data.categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                onInteract?.();
              }}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-all duration-300 ${
                isSelected
                  ? "border border-amber-400/50 bg-amber-400/15 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.15)]"
                  : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`rounded px-1.5 py-0.2 font-mono text-[10px] ${
                  isSelected ? "bg-amber-400/20 text-amber-200" : "bg-white/10 text-white/40"
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Split Matrix Screen: List (7 cols) + Live Radar Inspector (5 cols) */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Stations Matrix List */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-7">
          {filteredStations.map((station) => {
            const isActive = station.id === activeStationId;
            return (
              <div
                key={station.id}
                onClick={() => {
                  setActiveStationId(station.id);
                  onSelectStation?.(station.id);
                  onInteract?.();
                }}
                className={`group cursor-pointer rounded-xl border p-4 transition-all duration-300 ${
                  isActive
                    ? "border-amber-400/60 bg-amber-400/[0.08] shadow-[0_0_20px_rgba(251,191,36,0.1)]"
                    : "border-white/10 bg-black/40 hover:border-white/20 hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase text-white/40 group-hover:text-amber-400/70">
                    {station.coords}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </div>
                <h4 className="mt-2 text-lg font-bold tracking-tight text-white group-hover:text-amber-200">
                  {station.name}
                </h4>
                <p className="mt-1 text-xs text-white/60 line-clamp-1">
                  {station.craft}
                </p>
              </div>
            );
          })}
        </div>

        {/* Live Radar Inspector Panel */}
        {activeStation && (
          <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/15 bg-black/60 p-6 backdrop-blur-xl lg:col-span-5">
            {/* Top Radar graphic */}
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-mono text-[11px] uppercase tracking-wider text-amber-400">
                  RADAR INSPECTOR // ACTIVE
                </span>
                <span className="font-mono text-[10px] text-white/40">
                  {activeStation.coords}
                </span>
              </div>

              {/* Minimalist Radar Visual */}
              <div className="relative my-6 flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/50">
                {/* Concentric rings */}
                <div className="absolute h-40 w-40 rounded-full border border-white/10" />
                <div className="absolute h-24 w-24 rounded-full border border-amber-400/20" />
                <div className="absolute h-10 w-10 rounded-full border border-white/10" />

                {/* Crosshairs */}
                <div className="absolute h-full w-[1px] bg-white/10" />
                <div className="absolute h-[1px] w-full bg-white/10" />

                {/* Ping blip */}
                <div className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
                </div>

                {/* Radar sweeping scanline */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-amber-400/10 via-transparent to-transparent animate-spin [animation-duration:8s]" />
              </div>

              <h3 className="text-2xl font-bold tracking-tight text-white">
                {activeStation.name}
              </h3>
              <p className="mt-1 font-mono text-xs uppercase tracking-wider text-amber-300">
                {activeStation.craft}
              </p>

              <p className="mt-4 text-sm leading-relaxed text-white/70">
                {activeStation.historyNote}
              </p>
            </div>

            {/* Bottom Status metadata */}
            <div className="mt-8 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between font-mono text-xs text-white/50">
                <span>TRẠNG THÁI CHECK-IN</span>
                <span className="text-emerald-400 font-semibold">SẴN SÀNG KHÁM PHÁ</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
