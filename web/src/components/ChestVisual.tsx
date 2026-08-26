"use client";

import { useCallback, useEffect, useState } from "react";
import type { RevealTier } from "@/components/ChestReveal";
import { detectRenderMode, type ArMode } from "@/lib/ar-support";
import { useLang } from "@/lib/i18n";
import InlineThreeRenderer from "./renderers/InlineThreeRenderer";
import QuickLookLauncher from "./renderers/QuickLookLauncher";
import WebXRRenderer from "./renderers/WebXRRenderer";

const GOLD = "#d4af37";
const OUTLINE = "#2a1a10";
const RIVET_X = [45, 78, 122, 155];
const COIN_SPILL = [
  { cx: 55, cy: 72, r: 5 },
  { cx: 78, cy: 69, r: 4.5 },
  { cx: 103, cy: 71, r: 5 },
  { cx: 127, cy: 68, r: 4.5 },
  { cx: 148, cy: 72, r: 5 },
];

// Fallback CSS 2D từ M1 — dùng khi đang nạp three HOẶC nạp lỗi (ràng buộc Global #8).
function LegacyChest({
  colorHex,
  opened,
  onTapChest,
}: {
  colorHex: string;
  opened: boolean;
  onTapChest: () => void;
}) {
  return (
    <div
      className={`chest-box ${opened ? "chest-opened pointer-events-none opacity-80" : ""}`}
      style={
        opened
          ? { marginTop: "-2.5rem" }
          : { marginTop: "-8rem", filter: `drop-shadow(0 8px 20px ${colorHex}66)` }
      }
      onClick={onTapChest}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onTapChest()}
    >
      <svg className="chest-svg" viewBox="0 0 200 150" aria-hidden="true">
        <g>
          <rect x={22} y={76} width={156} height={64} rx={6} fill={colorHex} stroke={OUTLINE} strokeWidth={3} />
          <rect x={22} y={76} width={9} height={64} fill={GOLD} stroke={OUTLINE} strokeWidth={2} />
          <rect x={169} y={76} width={9} height={64} fill={GOLD} stroke={OUTLINE} strokeWidth={2} />
          <rect x={22} y={79} width={156} height={8} fill={GOLD} stroke={OUTLINE} strokeWidth={2} />
          <rect x={22} y={129} width={156} height={8} fill={GOLD} stroke={OUTLINE} strokeWidth={2} />
          {RIVET_X.map((x) => (
            <g key={`rivet-${x}`}>
              <circle cx={x} cy={83} r={2.2} fill="#7a5c10" />
              <circle cx={x} cy={133} r={2.2} fill="#7a5c10" />
            </g>
          ))}
          <rect x={88} y={90} width={24} height={26} rx={4} fill={GOLD} stroke={OUTLINE} strokeWidth={2} />
          <circle cx={100} cy={99} r={3.5} fill={OUTLINE} />
          <rect x={98.6} y={101} width={2.8} height={7} fill={OUTLINE} />
          <rect x={32} y={140} width={18} height={8} rx={3} fill={GOLD} stroke={OUTLINE} strokeWidth={2} />
          <rect x={150} y={140} width={18} height={8} rx={3} fill={GOLD} stroke={OUTLINE} strokeWidth={2} />
        </g>
        <g className="chest-coins">
          {COIN_SPILL.map(({ cx, cy, r }) => (
            <circle
              key={`coin-${cx}`}
              cx={cx}
              cy={cy}
              r={r}
              fill="#e8bf4d"
              stroke={OUTLINE}
              strokeWidth={2}
            />
          ))}
        </g>
        <g className="chest-lid">
          <path
            d="M 18 78 A 82 54 0 0 1 182 78 Z"
            fill={colorHex}
            stroke={OUTLINE}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <rect x={51} y={31} width={9} height={44} rx={2} fill={GOLD} stroke={OUTLINE} strokeWidth={2} />
          <rect x={141} y={31} width={9} height={44} rx={2} fill={GOLD} stroke={OUTLINE} strokeWidth={2} />
          <rect x={16} y={72} width={168} height={9} rx={3} fill={GOLD} stroke={OUTLINE} strokeWidth={2} />
        </g>
      </svg>
    </div>
  );
}

export default function ChestVisual({
  tier,
  opened,
  onTapChest,
}: {
  tier: RevealTier;
  opened: boolean;
  onTapChest: () => void;
}) {
  const { t } = useLang();
  const [mode, setMode] = useState<ArMode | null>(null);
  const [failed, setFailed] = useState(false);
  const [inAr, setInAr] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    detectRenderMode().then((m) => {
      if (alive) setMode(m);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    setModelLoaded(false);
  }, [tier.modelGlbPath]);

  const handleArOpened = useCallback(() => {
    setInAr(false);
    onTapChest();
  }, [onTapChest]);
  const handleArUnavailable = useCallback(() => setInAr(false), []);
  const handleError = useCallback(() => setFailed(true), []);
  const handleLoaded = useCallback(() => setModelLoaded(true), []);

  if (failed || mode === null || !tier.modelGlbPath) {
    return <LegacyChest colorHex={tier.colorHex} opened={opened} onTapChest={onTapChest} />;
  }

  if (inAr) {
    return (
      <WebXRRenderer
        modelGlbPath={tier.modelGlbPath}
        onOpened={handleArOpened}
        onUnavailable={handleArUnavailable}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {!opened && !modelLoaded && (
        <p className="text-xs font-semibold uppercase tracking-wide text-paper/70">
          {t("ar.loading_model")}
        </p>
      )}
      <div
        className={`h-56 w-72 ${opened ? "pointer-events-none opacity-80" : "cursor-pointer"}`}
        onClick={() => {
          if (!opened) onTapChest();
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && !opened && onTapChest()}
      >
        <InlineThreeRenderer
          modelGlbPath={tier.modelGlbPath}
          opened={opened}
          onTapChest={onTapChest}
          onError={handleError}
          onLoaded={handleLoaded}
        />
      </div>
      {mode === "webxr" && !opened && (
        <button
          onClick={() => setInAr(true)}
          className="flex items-center gap-2 rounded-full bg-jade px-4 py-2 text-sm font-bold text-paper shadow-lg active:scale-95"
        >
          {t("ar.view_in_space")}
        </button>
      )}
      {mode === "quicklook" && !opened && (
        <QuickLookLauncher modelUsdzPath={tier.modelUsdzPath} />
      )}
    </div>
  );
}
