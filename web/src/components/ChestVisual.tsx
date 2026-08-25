"use client";

import { useCallback, useEffect, useState } from "react";
import type { RevealTier } from "@/components/ChestReveal";
import { detectRenderMode, type ArMode } from "@/lib/ar-support";
import { useLang } from "@/lib/i18n";
import InlineThreeRenderer from "./renderers/InlineThreeRenderer";
import QuickLookLauncher from "./renderers/QuickLookLauncher";
import WebXRRenderer from "./renderers/WebXRRenderer";

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
      <div className="chest-lid" style={{ backgroundColor: colorHex }} />
      <div className="chest-base" style={{ backgroundColor: colorHex }} />
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

  useEffect(() => {
    let alive = true;
    detectRenderMode().then((m) => {
      if (alive) setMode(m);
    });
    return () => {
      alive = false;
    };
  }, []);

  const handleArOpened = useCallback(() => {
    setInAr(false);
    onTapChest();
  }, [onTapChest]);
  const handleArUnavailable = useCallback(() => setInAr(false), []);
  const handleError = useCallback(() => setFailed(true), []);

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
      {!opened && (
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
