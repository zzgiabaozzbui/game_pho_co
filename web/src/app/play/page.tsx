"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Gift, Trophy } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { haversineM } from "@/lib/geo";
import { fetchState } from "@/lib/client";
import type { StateDTO } from "@/lib/state";
import ChestReveal, { type RevealTier } from "@/components/ChestReveal";
import type { RevealLoot } from "@/components/RewardCard";

type GrantView = {
  grantId: number;
  tier: RevealTier | null;
  loot: RevealLoot[];
};

const GameMap = dynamic(() => import("@/components/GameMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-line text-sm text-ink-soft">
      …
    </div>
  ),
});

export default function PlayPage() {
  const { t, toggle, lang } = useLang();
  const [state, setState] = useState<StateDTO | null>(null);
  const [error, setError] = useState(false);
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [unopenedCount, setUnopenedCount] = useState(0);
  const [queue, setQueue] = useState<GrantView[]>([]);
  const [openPhase, setOpenPhase] = useState<"idle" | "pending" | "failed">(
    "idle"
  );

  const load = useCallback(async () => {
    try {
      const s = (await fetchState()) as StateDTO;
      setState(s);
      setError(false);
      try {
        const res = await fetch(`/api/chests?playerId=${s.playerId}`);
        const data = res.ok
          ? ((await res.json()) as { unopenedCount?: number; unopened?: GrantView[] })
          : null;
        setUnopenedCount(data?.unopenedCount ?? 0);
        setQueue(data?.unopened ?? []);
      } catch {
        setUnopenedCount(0);
        setQueue([]);
      }
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onPosition = useCallback(
    (p: { lat: number; lng: number }) => setPos(p),
    []
  );

  async function confirmChestOpen(grantId: number) {
    if (!state) return;
    setOpenPhase("pending");
    try {
      const res = await fetch("/api/chests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: state.playerId, grantId }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setOpenPhase("idle");
      setQueue((q) => q.slice(1));
      await load();
    } catch {
      setOpenPhase("failed");
    }
  }

  if (error)
    return (
      <Centered>
        <p>{t("common.error")}</p>
        <button onClick={load} className="btn-primary mt-4 px-5 py-2.5 font-semibold">
          {t("common.retry")}
        </button>
      </Centered>
    );

  if (!state)
    return (
      <Centered>
        <p>{t("common.loading")}</p>
      </Centered>
    );

  const pending = state.stations.filter((s) => s.status !== "completed");
  const current =
    pending.length === 0
      ? null
      : pos
        ? pending.reduce((best, s) =>
            haversineM(pos.lat, pos.lng, s.lat, s.lng) <
            haversineM(pos.lat, pos.lng, best.lat, best.lng)
              ? s
              : best
          )
        : pending[0];

  return (
    <main className="flex min-h-dvh flex-col">
      <header className="header-bar sticky top-0 z-10 flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-paper/80 hover:text-paper">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex flex-col items-center">
          <span className="font-display text-sm font-bold">{t("app.name")}</span>
          <span className="flex items-center gap-1.5 text-xs text-gold">
            {t("play.progress_compact", {
              done: state.done,
              total: state.total,
              score: state.score,
            })}
            {unopenedCount > 0 && (
              <span className="flex items-center gap-0.5 rounded-full bg-gold px-1.5 py-0.5 font-bold leading-none text-timber">
                <Gift className="h-3 w-3" aria-hidden="true" />
                {unopenedCount}
              </span>
            )}
          </span>
        </div>
        <button
          onClick={toggle}
          className="rounded-full border border-timber-line px-2.5 py-1 text-xs font-semibold"
        >
          {t("lang.switch")}
        </button>
      </header>

      <div className="relative h-[52dvh] min-h-64 w-full">
        <GameMap
          stations={state.stations}
          activeSlug={current?.slug ?? null}
          onPosition={onPosition}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-paper to-transparent" />
      </div>

      <section className="-mt-1 flex-1 rounded-t-3xl border-t border-line bg-cream px-5 py-5 pb-[calc(1.25rem_+_env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(45,27,18,0.12)]">
        {state.completedAll ? (
          <div className="text-center">
            <Trophy className="mx-auto h-12 w-12 text-gold" strokeWidth={1.75} />
            <h2 className="mt-2 font-display text-xl font-black">{t("treasure.title")}</h2>
            <p className="mt-1 text-sm text-ink-soft">{t("play.route_done")}</p>
            <Link
              href="/treasure"
              className="btn-primary mt-4 block w-full px-6 py-3.5"
            >
              {t("cta.treasure")}
            </Link>
          </div>
        ) : current ? (
          <>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-son">
              #{current.orderIndex} ·{" "}
              {current.hasPendingPhoto
                ? t("status.pending")
                : current.status === "checked_in"
                  ? t("status.checked_in")
                  : t("status.current")}
            </div>
            <h2 className="mt-1 font-display text-2xl font-black leading-snug text-ink-strong">
              {lang === "vi" ? current.nameVi : current.nameEn}
            </h2>
            <p className="mt-1 line-clamp-2 text-sm text-ink-soft">
              {(lang === "vi" ? current.storyVi : current.storyEn) ?? ""}
            </p>
            <Link
              href={`/station/${current.slug}`}
              className="btn-primary mt-4 block w-full px-6 py-3.5 text-center active:scale-[0.99]"
            >
              {current.status === "checked_in"
                ? `${t("play.solve_puzzle")} →`
                : t("cta.toStation")}
            </Link>
          </>
        ) : null}

        <div className="mt-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-ink-soft">
            {t("play.route_legend")}
          </p>
          <div className="mt-2 flex items-center gap-4 text-[11px] font-semibold text-ink-soft">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-jade" aria-hidden />
              {t("play.legend_solved")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-clay" aria-hidden />
              {t("play.legend_current")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-son" aria-hidden />
              {t("play.legend_locked")}
            </span>
          </div>
        </div>

        <div className="-mx-5 mt-2 overflow-x-auto px-5 pb-1">
          <div className="flex gap-2">
            {state.stations.map((s) => (
              <StationChip key={s.slug} station={s} />
            ))}
          </div>
        </div>
      </section>

      {queue[0]?.tier && (
        <ChestReveal
          key={queue[0].grantId}
          tier={queue[0].tier}
          loot={queue[0].loot}
          onClose={() => {
            if (openPhase === "pending") return;
            void confirmChestOpen(queue[0].grantId);
          }}
          notice={
            openPhase === "failed" ? (
              <div className="flex w-full max-w-sm flex-col items-center gap-2">
                <p className="rounded-xl bg-wine-soft px-4 py-2.5 text-sm font-medium text-wine">
                  {t("play.chest_open_failed")}
                </p>
                <button
                  onClick={() => void confirmChestOpen(queue[0].grantId)}
                  className="rounded-full border border-paper/40 px-5 py-2 text-sm font-semibold text-paper transition-colors hover:bg-paper/10"
                >
                  {t("common.retry")}
                </button>
              </div>
            ) : null
          }
        />
      )}
    </main>
  );
}

function StationChip({
  station: s,
}: {
  station: StateDTO["stations"][number];
}) {
  const { lang } = useLang();
  const shortName =
    lang === "vi"
      ? s.nameVi.replace("Phố ", "")
      : s.nameEn.replace(/\s+Street$/i, "");
  const style =
    s.status === "completed"
      ? "bg-jade-soft text-jade-deep border-jade"
      : s.status === "checked_in" || s.hasPendingPhoto
        ? "bg-clay-soft text-clay-deep border-clay"
        : "bg-son text-paper border-son-deep";
  return (
    <Link
      href={`/station/${s.slug}`}
      className={`flex items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${style}`}
    >
      #{s.orderIndex} {shortName}
    </Link>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-2 p-8 text-center text-ink-soft">
      {children}
    </main>
  );
}
