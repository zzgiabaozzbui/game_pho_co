"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Camera, Compass, Lock, MapPin, Puzzle } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { ensureSession, getPlayerId, setPlayerId } from "@/lib/client";

function HeroScene({ label }: { label: string }) {
  return (
    <svg
      viewBox="0 0 400 84"
      preserveAspectRatio="xMidYMax meet"
      role="img"
      focusable="false"
      aria-label={label}
      className="h-[76px] w-full"
    >
      <defs>
        <pattern
          id="pc36-lat"
          width={16}
          height={4}
          patternUnits="userSpaceOnUse"
        >
          <rect width={8} height={4} fill="var(--color-gold)" />
        </pattern>
        <radialGradient id="pc36-glow">
          <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g fill="var(--color-line)">
        <path d="M62 78 L94 28 L126 78 Z" />
        <path d="M196 78 L230 24 L264 78 Z" />
        <path d="M300 78 L330 32 L360 78 Z" />
      </g>
      <g fill="var(--color-timber)">
        <path d="M-4 78 V54 L28 37 L60 54 V78 Z" />
        <path d="M60 78 V64 L88 58 L116 61 V78 Z" />
        <path d="M116 78 V56 L146 42 L176 56 V78 Z" />
        <path d="M176 78 V46 H210 V78 Z" />
        <rect x={190} y={40} width={6} height={6} />
        <path d="M210 78 V52 L244 36 L278 52 V78 Z" />
        <path d="M278 78 V63 L306 57 L334 60 V78 Z" />
        <path d="M334 78 V55 L362 43 L390 55 V78 Z" />
        <path d="M390 78 V60 L404 55 V78 Z" />
      </g>
      <rect
        x={4}
        y={79}
        width={392}
        height={4}
        rx={2}
        fill="url(#pc36-lat)"
        opacity={0.55}
      />
      <path
        d="M12 72 C64 58 118 66 178 52 C238 38 300 44 352 30"
        fill="none"
        stroke="var(--color-paper)"
        strokeWidth={5}
        strokeLinecap="round"
        opacity={0.9}
      />
      <path
        d="M12 72 C64 58 118 66 178 52 C238 38 300 44 352 30"
        fill="none"
        stroke="var(--color-clay-deep)"
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeDasharray="0.5 7"
      />
      <g
        stroke="var(--color-clay-deep)"
        strokeWidth={1.25}
        fill="var(--color-paper)"
      >
        <circle cx={12} cy={72} r={4.5} strokeWidth={1.5} />
        <circle cx={12} cy={72} r={1.8} stroke="none" fill="var(--color-clay-deep)" />
        <circle cx={76} cy={62} r={3} />
        <circle cx={142} cy={58} r={3} />
        <circle cx={208} cy={44} r={3} />
        <circle cx={272} cy={41} r={3} />
        <circle cx={330} cy={36} r={3} />
      </g>
      <circle cx={355} cy={21} r={16} fill="url(#pc36-glow)" />
      <g transform="translate(344 12)">
        <path
          d="M0 6 Q0 0 6 0 H16 Q22 0 22 6 V9 H0 Z"
          fill="var(--color-gold)"
        />
        <rect y={9} width={22} height={13} rx={2} fill="var(--color-gold)" />
        <rect y={8.6} width={22} height={0.9} fill="var(--color-paper)" opacity={0.6} />
        <circle cx={11} cy={15} r={2.75} fill="var(--color-paper)" />
        <rect x={10.2} y={16} width={1.6} height={4} rx={0.8} fill="var(--color-paper)" />
      </g>
    </svg>
  );
}

function savedPid(): string | null {
  return typeof window === "undefined" ? null : getPlayerId();
}

function subscribeSavedPid(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export default function Home() {
  const { t, toggle } = useLang();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const storedPid = useSyncExternalStore(subscribeSavedPid, savedPid, () => null);
  const [recoveredPid, setRecoveredPid] = useState<string | null>();
  const pid = recoveredPid ?? storedPid;
  const [startError, setStartError] = useState(false);
  const [recoverCode, setRecoverCode] = useState("");
  const [recoverMsg, setRecoverMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [chests, setChests] = useState<{ total: number; unopened: number } | null>(
    null
  );
  const hasSession = pid !== null;

  useEffect(() => {
    if (!pid) return;
    let alive = true;
    fetch(`/api/chests?playerId=${pid}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d) return;
        const j = d as { unopenedCount?: number; collection?: unknown[] };
        setChests({
          total: (j.unopenedCount ?? 0) + (j.collection?.length ?? 0),
          unopened: j.unopenedCount ?? 0,
        });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [pid]);

  async function start() {
    setBusy(true);
    setStartError(false);
    try {
      await ensureSession();
      router.push("/play");
    } catch {
      setStartError(true);
      setBusy(false);
    }
  }

  async function applyRecover() {
    const code = recoverCode.trim();
    if (!code || busy) return;
    setBusy(true);
    setRecoverMsg(null);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: code }),
      });
      if (res.ok) {
        const data = (await res.json()) as { playerId: string };
        setPlayerId(data.playerId);
        setRecoveredPid(data.playerId);
        router.push("/play");
      } else {
        setRecoverMsg(t("home.recover_fail"));
        setBusy(false);
      }
    } catch {
      setRecoverMsg(t("common.error"));
      setBusy(false);
    }
  }

  function copyCode() {
    if (!pid) return;
    navigator.clipboard
      .writeText(pid)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 py-8 pb-[calc(2rem_+_env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-clay-deep">
          {t("home.location")}
        </span>
        <button
          onClick={toggle}
          className="rounded-full border border-line bg-cream px-3 py-1 text-sm font-medium hover:bg-gold-soft"
        >
          {t("lang.switch")}
        </button>
      </div>

      <header className="mt-8">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-timber text-paper shadow-lg shadow-timber/30">
          <Compass className="h-8 w-8 text-gold" strokeWidth={2.25} />
        </div>
        <h1 className="font-display text-3xl font-black leading-tight text-ink-strong">
          {t("app.name")}
        </h1>
        <p className="mt-2 text-base text-ink-soft">{t("app.tagline")}</p>
      </header>

      <HeroScene label={t("home.hero_scene_alt")} />

      <section className="mt-6">
        <ul
          className={`grid grid-cols-3 gap-2 ${hasSession ? "opacity-70" : ""}`}
        >
          <li
            className={`flex flex-col items-center gap-1.5 rounded-xl border border-line bg-cream px-2 text-center ${
              hasSession ? "py-2" : "py-3"
            }`}
          >
            <MapPin className="h-5 w-5 shrink-0 text-clay-deep" strokeWidth={2} />
            <span className="text-xs font-medium leading-tight text-ink">
              {t("home.step_go")}
            </span>
          </li>
          <li
            className={`flex flex-col items-center gap-1.5 rounded-xl border border-line bg-cream px-2 text-center ${
              hasSession ? "py-2" : "py-3"
            }`}
          >
            <Camera className="h-5 w-5 shrink-0 text-jade" strokeWidth={2} />
            <span className="text-xs font-medium leading-tight text-ink">
              {t("home.step_checkin")}
            </span>
          </li>
          <li
            className={`flex flex-col items-center gap-1.5 rounded-xl border border-line bg-cream px-2 text-center ${
              hasSession ? "py-2" : "py-3"
            }`}
          >
            <Puzzle className="h-5 w-5 shrink-0 text-gold" strokeWidth={2} />
            <span className="text-xs font-medium leading-tight text-ink">
              {t("home.step_solve")}
            </span>
          </li>
        </ul>
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-ink-soft transition-colors hover:text-ink">
            {t("rules.title")}
          </summary>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-ink/90 marker:font-semibold marker:text-son">
            <li>{t("rules.1")}</li>
            <li>{t("rules.2")}</li>
            <li>{t("rules.3")}</li>
            <li>{t("rules.4")}</li>
          </ol>
        </details>
      </section>

      <div className="mt-auto pt-10">
        <button
          onClick={start}
          disabled={busy}
          aria-busy={busy}
          aria-describedby={startError ? "start-error" : undefined}
          className="btn-primary w-full py-4 text-lg active:scale-[0.99] disabled:opacity-60"
        >
          {startError && !busy
            ? t("common.retry")
            : hasSession
              ? t("cta.continue")
              : t("cta.start")}
        </button>
        {startError && (
          <p
            id="start-error"
            role="alert"
            className="mt-2 text-center text-sm font-medium text-wine"
          >
            {t("home.start_error")}
          </p>
        )}
        {chests && chests.total > 0 ? (
          <Link
            href="/treasure"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-line bg-cream px-6 py-3 font-medium text-ink hover:bg-gold-soft"
          >
            {t("cta.treasure_short")}
            {chests.unopened > 0 && (
              <span className="grid min-w-5 place-items-center rounded-full bg-gold px-1.5 py-0.5 text-xs font-bold leading-none text-timber">
                {chests.unopened}
              </span>
            )}
          </Link>
        ) : (
          <p className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line px-4 py-2.5 text-center text-sm text-ink-soft">
            <Lock className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
            <span>{t("home.treasure_locked")}</span>
          </p>
        )}
      </div>

      <div className="mt-8 border-t border-line pt-5">
        {hasSession && pid ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">
              {t("home.recover_yours")}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg bg-cream px-3 py-2.5 text-xs ring-1 ring-line">
                {pid}
              </code>
              <button
                onClick={copyCode}
                className="shrink-0 rounded-lg border border-line bg-cream px-3 py-2.5 text-xs font-semibold hover:bg-gold-soft"
              >
                {copied ? t("home.recover_copied") : t("home.recover_copy")}
              </button>
            </div>
          </div>
        ) : (
          <details>
            <summary className="cursor-pointer text-sm font-semibold text-ink-soft">
              {t("home.recover_title")}
            </summary>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">
              {t("home.recover_hint")}
            </p>
            <div className="mt-2 flex gap-2">
              <input
                value={recoverCode}
                onChange={(e) => setRecoverCode(e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-line bg-cream px-4 py-2.5 text-base outline-none focus:border-son"
                type="text"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                onClick={applyRecover}
                disabled={busy || !recoverCode.trim()}
                className="btn-primary shrink-0 px-5 py-2.5 text-sm disabled:opacity-50"
              >
                {t("home.recover_apply")}
              </button>
            </div>
            {recoverMsg && (
              <p className="mt-2 text-xs font-medium text-wine">{recoverMsg}</p>
            )}
          </details>
        )}
      </div>
    </main>
  );
}
