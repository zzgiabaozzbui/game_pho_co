"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Camera, KeyRound, MapPin, Puzzle } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { ensureSession, getPlayerId, setPlayerId } from "@/lib/client";

function savedPid(): string | null {
  return typeof window === "undefined" ? null : getPlayerId();
}

export default function Home() {
  const { t, toggle } = useLang();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [pid, setPid] = useState<string | null>(savedPid);
  const [startError, setStartError] = useState(false);
  const [recoverCode, setRecoverCode] = useState("");
  const [recoverMsg, setRecoverMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const hasSession = pid !== null;

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
        setPid(data.playerId);
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

      <header className="mt-10">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-timber text-paper shadow-lg shadow-timber/30">
          <KeyRound className="h-8 w-8 text-gold" strokeWidth={2.25} />
        </div>
        <h1 className="font-display text-3xl font-black leading-tight text-ink-strong">
          {t("app.name")}
        </h1>
        <p className="mt-2 text-base text-ink-soft">{t("app.tagline")}</p>
      </header>

      <div className="lattice-divider mt-8" />

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
        <Link
          href="/treasure"
          className="mt-3 block w-full rounded-2xl border border-line bg-cream px-6 py-3 text-center font-medium text-ink hover:bg-gold-soft"
        >
          {t("cta.treasure_short")}
        </Link>
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
