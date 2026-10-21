"use client";

import { useCallback, useEffect, useState } from "react";
import type { RevealTier } from "@/components/ChestReveal";
import { detectRenderMode, type ArMode } from "@/lib/ar-support";
import { useLang } from "@/lib/i18n";
import InlineThreeRenderer from "./renderers/InlineThreeRenderer";
import QuickLookLauncher from "./renderers/QuickLookLauncher";
import WebXRRenderer from "./renderers/WebXRRenderer";

const GOLD = "#f0c33c";
const OUTLINE = "#2a1a10";
const VELVET = "#7e1220";
const STEEL_COLOR = "#dde6f0";
const GEM_RUBY = "#d81b4a";
const GEM_SAPPHIRE = "#2b5fb8";
const RIVET_X = [45, 78, 122, 155];
const COIN_SPILL = [
  { cx: 55, cy: 72, r: 5 },
  { cx: 78, cy: 69, r: 4.5 },
  { cx: 103, cy: 71, r: 5 },
  { cx: 127, cy: 68, r: 4.5 },
  { cx: 148, cy: 72, r: 5 },
];
// Đống xu nhô trên miệng rương khi mở — chỉ render ở trạng thái opened
// (xuất hiện tức thời, không animation nên không cần gate reduced-motion).
const PILE_COINS = [
  { cx: 66, cy: 73, r: 5.5 },
  { cx: 90, cy: 70, r: 6 },
  { cx: 114, cy: 72, r: 5.5 },
  { cx: 137, cy: 70, r: 5 },
];
const PILE_GEMS = [
  { cx: 79, cy: 70, size: 7, fill: GEM_RUBY },
  { cx: 125, cy: 69, size: 6.5, fill: GEM_SAPPHIRE },
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
          : { marginTop: "-8rem", filter: `drop-shadow(0 8px 25px ${colorHex}88)` }
      }
      onClick={onTapChest}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onTapChest()}
    >
      <svg className="chest-svg" viewBox="0 0 200 150" aria-hidden="true">
        {/* Chest Base & Crimson Panels */}
        <g>
          {/* Main Body */}
          <rect x={22} y={76} width={156} height={64} rx={6} fill={colorHex} stroke={OUTLINE} strokeWidth={3} />
          {/* Inset Left & Right Crimson Panels */}
          <rect x={34} y={82} width={58} height={50} rx={3} fill="#a60e29" />
          <rect x={108} y={82} width={58} height={50} rx={3} fill="#a60e29" />
          {/* Gold Framing: Corner Posts & Center Rib */}
          <rect x={22} y={76} width={10} height={64} fill={GOLD} stroke={OUTLINE} strokeWidth={2} />
          <rect x={168} y={76} width={10} height={64} fill={GOLD} stroke={OUTLINE} strokeWidth={2} />
          <rect x={95} y={76} width={10} height={64} fill={GOLD} stroke={OUTLINE} strokeWidth={2} />
          {/* Top & Bottom Gold Horizontal Trims */}
          <rect x={22} y={77} width={156} height={7} fill={GOLD} stroke={OUTLINE} strokeWidth={2} />
          <rect x={22} y={131} width={156} height={9} fill={GOLD} stroke={OUTLINE} strokeWidth={2} />
          {/* Ruby Studs along Gold Trims */}
          {RIVET_X.map((x) => (
            <g key={`rivet-${x}`}>
              <circle cx={x} cy={80.5} r={2.5} fill={GEM_RUBY} />
              <circle cx={x} cy={135.5} r={2.5} fill={GEM_RUBY} />
            </g>
          ))}
          <circle cx={100} cy={90} r={2.5} fill={GEM_RUBY} />
          <circle cx={100} cy={122} r={2.5} fill={GEM_RUBY} />
          {/* Ornate Gold Lock Escutcheon Plate */}
          <rect x={88} y={96} width={24} height={24} rx={4} fill={GOLD} stroke={OUTLINE} strokeWidth={2} />
          <circle cx={100} cy={105} r={3.2} fill={OUTLINE} />
          <rect x={98.6} y={107} width={2.8} height={6} fill={OUTLINE} />
          {/* Ornate Golden Feet */}
          <rect x={30} y={141} width={22} height={7} rx={3} fill={GOLD} stroke={OUTLINE} strokeWidth={2} />
          <rect x={148} y={141} width={22} height={7} rx={3} fill={GOLD} stroke={OUTLINE} strokeWidth={2} />
          {/* Pearl Necklace draped across the front */}
          <path
            d="M 90 84 Q 100 120 110 84"
            fill="none"
            stroke="#fdfaf2"
            strokeWidth="3.5"
            strokeDasharray="1 3.8"
            strokeLinecap="round"
          />
        </g>
        {/* Overflowing Gold Coins */}
        <g className="chest-coins">
          {COIN_SPILL.map(({ cx, cy, r }) => (
            <circle
              key={`coin-${cx}`}
              cx={cx}
              cy={cy}
              r={r}
              fill={GOLD}
              stroke={OUTLINE}
              strokeWidth={1.5}
            />
          ))}
        </g>
        {/* Inside Treasure Pile when Opened */}
        {opened && (
          <g className="chest-pile">
            <rect x={26} y={64} width={148} height={14} fill={VELVET} opacity={0.9} />
            {/* Crown Peak in 2D */}
            <polygon points="90,62 95,50 100,56 105,50 110,62" fill={GOLD} stroke={OUTLINE} strokeWidth={1.5} />
            <circle cx={95} cy={50} r={1.5} fill={GEM_RUBY} />
            <circle cx={105} cy={50} r={1.5} fill={GEM_SAPPHIRE} />
            {/* Jeweled Sword hilt */}
            <line x1={130} y1={65} x2={145} y2={45} stroke={STEEL_COLOR} strokeWidth={2.5} />
            <line x1={138} y1={56} x2={146} y2={62} stroke={GOLD} strokeWidth={2} />
            {/* Golden Coins & Jewels */}
            {PILE_COINS.map(({ cx, cy, r }) => (
              <circle
                key={`pile-coin-${cx}`}
                cx={cx}
                cy={cy}
                r={r}
                fill={GOLD}
                stroke={OUTLINE}
                strokeWidth={1.5}
              />
            ))}
            {PILE_GEMS.map(({ cx, cy, size, fill }) => (
              <rect
                key={`pile-gem-${cx}`}
                x={cx - size / 2}
                y={cy - size / 2}
                width={size}
                height={size}
                fill={fill}
                stroke={OUTLINE}
                strokeWidth={1.2}
                transform={`rotate(45 ${cx} ${cy})`}
              />
            ))}
          </g>
        )}
        {/* Arched Vault Lid */}
        <g className="chest-lid">
          <path
            d="M 18 78 A 82 54 0 0 1 182 78 Z"
            fill={opened ? VELVET : colorHex}
            stroke={OUTLINE}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          {/* Gold Rib Bands with Ruby Studs */}
          <rect x={48} y={30} width={10} height={46} rx={2} fill={GOLD} stroke={OUTLINE} strokeWidth={2} />
          <circle cx={53} cy={45} r={2} fill={GEM_RUBY} />
          <rect x={142} y={30} width={10} height={46} rx={2} fill={GOLD} stroke={OUTLINE} strokeWidth={2} />
          <circle cx={147} cy={45} r={2} fill={GEM_RUBY} />
          <rect x={95} y={24} width={10} height={52} rx={2} fill={GOLD} stroke={OUTLINE} strokeWidth={2} />
          <circle cx={100} cy={38} r={2} fill={GEM_RUBY} />
          {/* Bottom Lid Lip Rim */}
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
