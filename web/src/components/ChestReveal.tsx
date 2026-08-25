"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import RewardCard, { type RevealLoot } from "@/components/RewardCard";

export interface RevealTier {
  key: string;
  nameVi: string;
  nameEn: string;
  colorHex: string;
  modelGlbPath: string;
  modelUsdzPath: string;
}

export default function ChestReveal({
  tier,
  loot,
  onClose,
}: {
  tier: RevealTier;
  loot: RevealLoot[];
  onClose: () => void;
}) {
  const { t } = useLang();
  const [opened, setOpened] = useState(false);

  return (
    <div className="chest-overlay">
      <button
        onClick={onClose}
        aria-label="close"
        className="absolute right-4 top-4 rounded-full border border-paper/30 p-2 text-paper/80 hover:text-paper"
      >
        <X className="h-5 w-5" />
      </button>
      <p className="font-display text-lg font-black text-gold">{t("chest.title")}</p>

      {!opened && <div className="chest-glow" />}
      <div
        className={`chest-box ${opened ? "chest-opened pointer-events-none opacity-80" : ""}`}
        style={
          opened
            ? { marginTop: "-2.5rem" }
            : { marginTop: "-8rem", filter: `drop-shadow(0 8px 20px ${tier.colorHex}66)` }
        }
        onClick={() => setOpened(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setOpened(true)}
      >
        <div className="chest-lid" style={{ backgroundColor: tier.colorHex }} />
        <div className="chest-base" style={{ backgroundColor: tier.colorHex }} />
      </div>
      {!opened ? (
        <p className="text-sm font-semibold text-paper/90">
          {t("chest.tap_to_open")}
        </p>
      ) : (
        <ul className="mt-2 flex w-full max-w-sm flex-col gap-2">
          {loot.map((item, i) => (
            <RewardCard key={i} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
