"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Package, Trophy } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { fetchState } from "@/lib/client";
import type { StateDTO } from "@/lib/state";
import ChestReveal, { type RevealTier } from "@/components/ChestReveal";
import RewardCard, { type RevealLoot } from "@/components/RewardCard";

interface ChestView {
  grantId: number;
  source: string;
  tier: RevealTier | null;
  loot: RevealLoot[];
}

export default function TreasurePage() {
  const { t, toggle, lang } = useLang();
  const [state, setState] = useState<StateDTO | null>(null);
  const [error, setError] = useState(false);
  const [finalChest, setFinalChest] = useState<{
    grantId: number;
    tier: RevealTier;
    loot: RevealLoot[];
  } | null>(null);
  const [collection, setCollection] = useState<
    Array<{ tier: RevealTier | null; loot: RevealLoot[] }>
  >([]);

  const loadChests = useCallback(async (playerId: string) => {
    try {
      const res = await fetch(`/api/chests?playerId=${playerId}`);
      if (!res.ok) return;
      const data = (await res.json()) as {
        unopened?: ChestView[];
        collection?: ChestView[];
      };
      const fin = data.unopened?.find((c) => c.source === "FINAL");
      setFinalChest(
        fin && fin.tier
          ? { grantId: fin.grantId, tier: fin.tier, loot: fin.loot ?? [] }
          : null
      );
      setCollection(
        (data.collection ?? []).map((c) => ({ tier: c.tier, loot: c.loot ?? [] }))
      );
    } catch {
      setCollection([]);
    }
  }, []);

  useEffect(() => {
    fetchState()
      .then(async (s) => {
        const st = s as StateDTO;
        setState(st);
        await loadChests(st.playerId);
      })
      .catch(() => setError(true));
  }, [loadChests]);

  async function openFinal() {
    if (!finalChest || !state) return;
    await fetch("/api/chests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId: state.playerId, grantId: finalChest.grantId }),
    }).catch(() => {});
    setFinalChest(null);
    await loadChests(state.playerId);
  }

  return (
    <main className="paper-noise flex min-h-dvh flex-col items-center bg-gradient-to-b from-timber via-[#1f130c] to-[#14100d] px-6 py-10 pb-[calc(2.5rem_+_env(safe-area-inset-bottom))] text-center text-paper">
      <button
        onClick={toggle}
        className="self-end rounded-full border border-gold/40 px-3 py-1 text-xs font-semibold hover:bg-gold/10"
      >
        {t("lang.switch")}
      </button>

      <div className="mt-10 rounded-full bg-gold/10 p-5 shadow-[0_0_60px_-10px_rgba(201,150,43,0.45)]">
        {state?.completedAll ? (
          <Trophy className="h-14 w-14 text-gold" strokeWidth={1.5} />
        ) : (
          <Package className="h-14 w-14 text-gold" strokeWidth={1.5} />
        )}
      </div>
      <h1 className="font-display mt-4 text-3xl font-black tracking-tight">
        {t("treasure.title")}
      </h1>

      {!state && !error && (
        <p className="mt-8 animate-pulse text-paper/70">
          {t("common.loading")}
        </p>
      )}

      {error && (
        <>
          <p className="mt-6 text-paper/80">{t("common.error")}</p>
          <Link href="/play" className="btn-primary mt-6 px-6 py-3">
            {t("common.back")}
          </Link>
        </>
      )}

      {state && !state.completedAll && (
        <>
          <p className="mt-6 max-w-sm leading-relaxed text-paper/85">
            {t("treasure.locked", {
              total: state.total as unknown as number,
            })}
          </p>
          <div className="mt-6 h-3 w-full max-w-xs overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-gradient-to-r from-clay to-gold transition-all"
              style={{
                width: `${Math.round((state.done / Math.max(1, state.total)) * 100)}%`,
              }}
            />
          </div>
          <p className="mt-2 text-sm text-gold">
            {t("progress.of", { done: state.done, total: state.total })}
          </p>
          <Link
            href="/play"
            className="mt-8 rounded-2xl bg-gold px-8 py-3.5 font-bold text-timber shadow-lg shadow-gold/25 active:scale-[0.99]"
          >
            {t("cta.toMap")}
          </Link>
        </>
      )}

      {state?.completedAll && (
        <>
          <p className="font-display mt-6 max-w-sm text-lg leading-relaxed text-paper/90">
            {t("treasure.done", {
              total: state.total as unknown as number,
              score: state.score,
            })}
          </p>

          <section className="mt-8 w-full max-w-sm rounded-3xl border border-gold/50 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gold">
              {t("treasure.workshop")}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-paper/90">
              {t("treasure.partner")}
            </p>
            <p className="mt-4 text-sm text-paper/65">
              {t("treasure.contact")}
            </p>
          </section>

          <Link href="/play" className="mt-8 text-sm text-paper/60 underline">
            {t("common.back")}
          </Link>
        </>
      )}

      {state && !error && (
        <section className="mt-10 w-full max-w-md">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gold">
            {t("chest.collection_title")}
          </h2>
          {collection.length === 0 ? (
            <p className="mt-4 text-sm text-paper/60">
              {t("chest.empty_collection")}
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {collection.map((c, i) => (
                <div
                  key={i}
                  className="rounded-2xl border bg-white/5 p-4 text-left backdrop-blur"
                  style={c.tier ? { borderColor: c.tier.colorHex } : undefined}
                >
                  {c.tier && (
                    <p
                      className="font-display text-sm font-bold"
                      style={{ color: c.tier.colorHex }}
                    >
                      {lang === "vi" ? c.tier.nameVi : c.tier.nameEn}
                    </p>
                  )}
                  <ul className="mt-2 flex flex-col gap-2">
                    {c.loot.map((item, j) => (
                      <RewardCard key={j} item={item} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {state?.completedAll && finalChest && (
        <ChestReveal
          tier={finalChest.tier}
          loot={finalChest.loot}
          onClose={openFinal}
        />
      )}
    </main>
  );
}
