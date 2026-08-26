"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Gift } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { ensureSession } from "@/lib/client";
import ChestReveal, { type RevealTier } from "@/components/ChestReveal";
import type { RevealLoot } from "@/components/RewardCard";

const TOKEN_RE = /^[a-f0-9]{32,128}$/;

type Phase =
  | "booting"
  | "need-token"
  | "idle"
  | "loading-lib"
  | "scanning"
  | "found"
  | "claiming"
  | "done"
  | "already"
  | "error-camera"
  | "error-lib"
  | "marker-missing";

interface MindAnchor {
  onTargetFound: (() => void) | null;
}

interface MindARThreeInstance {
  start(): Promise<void>;
  stop(): void;
  addAnchor(index: number): MindAnchor;
  update(): void;
  renderer: { setAnimationLoop(callback: (() => void) | null): void };
}

type MindARWindow = Window & {
  MINDAR?: {
    IMAGE?: {
      MindARThree?: new (options: {
        container: HTMLElement;
        imageTarget: string;
        uiLoading: string;
        uiScanning: string;
        uiError: string;
      }) => MindARThreeInstance;
    };
  };
};

interface ChestGrantView {
  grantId: number;
  source: string;
  tier: RevealTier | null;
  loot: RevealLoot[];
}

function loadMindArScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const w = window as MindARWindow;
    if (w.MINDAR?.IMAGE?.MindARThree) return resolve();
    const s = document.createElement("script");
    s.src = "/vendor/mindar/mindar-image-three.prod.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("mindar-load-failed"));
    document.head.appendChild(s);
  });
}

function runQuietly(fn: () => void): void {
  try {
    fn();
  } catch {
    return;
  }
}

function teardownContainer(container: HTMLElement | null): void {
  if (!container) return;
  container.querySelectorAll("video").forEach((video) => {
    const stream = video.srcObject as MediaStream | null;
    stream?.getTracks().forEach((track) => track.stop());
    video.remove();
  });
  container.querySelectorAll("canvas").forEach((canvas) => canvas.remove());
}

export default function PartnerPage() {
  const { t, toggle } = useLang();
  const [phase, setPhase] = useState<Phase>("booting");
  const [token, setToken] = useState("");
  const [reveal, setReveal] = useState<{
    grantId: number;
    tier: RevealTier;
    loot: RevealLoot[];
  } | null>(null);
  const [apiError, setApiError] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const containerElRef = useRef<HTMLElement | null>(null);
  const mindarRef = useRef<MindARThreeInstance | null>(null);
  const activeRef = useRef(false);
  const aliveRef = useRef(true);
  const claimedRef = useRef(false);
  const busyRef = useRef(false);

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("t") ?? "";
    setToken(raw);
    setPhase(TOKEN_RE.test(raw) ? "idle" : "need-token");
  }, []);

  const stopScan = useCallback(() => {
    activeRef.current = false;
    const mindar = mindarRef.current;
    mindarRef.current = null;
    if (mindar) {
      runQuietly(() => mindar.renderer.setAnimationLoop(null));
      runQuietly(() => mindar.stop());
    }
    teardownContainer(containerElRef.current);
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      stopScan();
    };
  }, [stopScan]);

  const doClaim = useCallback(async () => {
    if (!TOKEN_RE.test(token)) return;
    setApiError(false);
    setPhase("claiming");
    try {
      const playerId = await ensureSession();
      const res = await fetch("/api/chests/claim-partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, token }),
      });
      if (!res.ok) {
        setApiError(true);
        setPhase("idle");
        return;
      }
      const data = (await res.json()) as {
        ok: boolean;
        grantId: number | null;
        alreadyClaimed: boolean;
      };
      if (data.alreadyClaimed || data.grantId === null) {
        setPhase("already");
        return;
      }
      const chestRes = await fetch(`/api/chests?playerId=${playerId}`, {
        cache: "no-store",
      });
      if (!chestRes.ok) {
        setApiError(true);
        setPhase("idle");
        return;
      }
      const chestData = (await chestRes.json()) as { unopened?: ChestGrantView[] };
      const grant = chestData.unopened?.find(
        (g) => g.source === "PARTNER" && g.grantId === data.grantId && g.tier
      );
      if (!grant || !grant.tier) {
        setApiError(true);
        setPhase("idle");
        return;
      }
      setReveal({
        grantId: grant.grantId,
        tier: grant.tier,
        loot: grant.loot ?? [],
      });
      setPhase("done");
    } catch {
      setApiError(true);
      setPhase("idle");
    }
  }, [token]);

  const startScan = useCallback(async () => {
    if (busyRef.current) return;
    const container = containerRef.current;
    if (!container) {
      setPhase("error-lib");
      return;
    }
    containerElRef.current = container;
    busyRef.current = true;
    claimedRef.current = false;
    setApiError(false);
    setPhase("loading-lib");
    try {
      try {
        await loadMindArScript();
      } catch {
        if (aliveRef.current) setPhase("error-lib");
        return;
      }
      if (!aliveRef.current) return;

      const cfgRes = await fetch("/api/partner/config", { cache: "no-store" });
      if (!aliveRef.current) return;
      if (!cfgRes.ok) {
        setPhase("marker-missing");
        return;
      }
      const cfg = (await cfgRes.json()) as { mindTargetPath?: string };
      if (!aliveRef.current) return;
      const target = cfg.mindTargetPath;
      if (!target) {
        setPhase("marker-missing");
        return;
      }
      const headRes = await fetch(target, { method: "HEAD" });
      if (!aliveRef.current) return;
      if (!headRes.ok) {
        setPhase("marker-missing");
        return;
      }

      const w = window as MindARWindow;
      const Ctor = w.MINDAR?.IMAGE?.MindARThree;
      if (!Ctor) {
        setPhase("error-lib");
        return;
      }

      const mindarThree = new Ctor({
        container,
        imageTarget: target,
        uiLoading: "no",
        uiScanning: "no",
        uiError: "no",
      });
      mindarRef.current = mindarThree;
      await mindarThree.start();
      if (!aliveRef.current) {
        runQuietly(() => mindarThree.renderer.setAnimationLoop(null));
        runQuietly(() => mindarThree.stop());
        mindarRef.current = null;
        teardownContainer(container);
        return;
      }
      activeRef.current = true;

      const anchor = mindarThree.addAnchor(0);
      anchor.onTargetFound = () => {
        if (claimedRef.current) return;
        claimedRef.current = true;
        void navigator.vibrate?.(80);
        setPhase("found");
        stopScan();
        void doClaim();
      };

      mindarThree.renderer.setAnimationLoop(() => {
        if (activeRef.current) mindarThree.update();
      });

      setPhase("scanning");
    } catch {
      if (aliveRef.current) {
        stopScan();
        setPhase("error-camera");
      }
    } finally {
      busyRef.current = false;
    }
  }, [doClaim, stopScan]);

  const manualClaim = useCallback(() => {
    if (busyRef.current) return;
    claimedRef.current = true;
    stopScan();
    void doClaim();
  }, [doClaim, stopScan]);

  const closeReveal = useCallback(async () => {
    const current = reveal;
    if (!current) return;
    setReveal(null);
    try {
      const playerId = await ensureSession();
      await fetch("/api/chests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, grantId: current.grantId }),
      });
    } catch {
      return;
    }
  }, [reveal]);

  const validShape = TOKEN_RE.test(token);
  const scanBoxVisible =
    phase === "loading-lib" || phase === "scanning" || phase === "found";
  const showManual =
    validShape &&
    !reveal &&
    phase !== "claiming" &&
    phase !== "done" &&
    phase !== "booting" &&
    phase !== "need-token";
  const showCollectionLink =
    phase === "already" || (phase === "done" && !reveal);

  return (
    <main className="paper-noise flex min-h-dvh flex-col items-center bg-gradient-to-b from-timber via-[#1f130c] to-[#14100d] px-6 py-10 pb-[calc(2.5rem_+_env(safe-area-inset-bottom))] text-center text-paper">
      <button
        onClick={toggle}
        className="self-end rounded-full border border-gold/40 px-3 py-1 text-xs font-semibold hover:bg-gold/10"
      >
        {t("lang.switch")}
      </button>

      <div className="mt-8 rounded-full bg-gold/10 p-5 shadow-[0_0_60px_-10px_rgba(201,150,43,0.45)]">
        <Gift className="h-12 w-12 text-gold" strokeWidth={1.5} />
      </div>
      <h1 className="font-display mt-4 text-3xl font-black tracking-tight">
        {t("partner.title")}
      </h1>
      <p className="mt-3 max-w-sm leading-relaxed text-paper/85">
        {t("partner.subtitle")}
      </p>

      <div
        ref={containerRef}
        className={`relative mt-6 aspect-square w-full max-w-sm overflow-hidden rounded-3xl border border-gold/30 bg-black/60 ${
          scanBoxVisible ? "" : "hidden"
        }`}
      />

      {phase === "booting" && (
        <p className="mt-6 animate-pulse text-paper/70">{t("common.loading")}</p>
      )}
      {phase === "need-token" && (
        <p className="mt-6 max-w-sm leading-relaxed text-paper/85">
          {t("partner.missing_token")}
        </p>
      )}
      {phase === "idle" && (
        <>
          <button
            onClick={() => void startScan()}
            className="mt-8 flex items-center gap-2 rounded-2xl bg-gold px-8 py-3.5 font-bold text-timber shadow-lg shadow-gold/25 active:scale-[0.99]"
          >
            <Camera className="h-5 w-5" />
            {t("partner.start_scan")}
          </button>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/60">
            {t("partner.scanning_hint")}
          </p>
        </>
      )}
      {phase === "loading-lib" && (
        <p className="mt-6 animate-pulse text-paper/70">{t("common.loading")}</p>
      )}
      {phase === "scanning" && (
        <>
          <p className="mt-4 text-sm font-semibold text-gold">
            {t("partner.scanning_hint")}
          </p>
          <button
            onClick={() => {
              stopScan();
              setPhase("idle");
            }}
            className="mt-4 rounded-full border border-paper/40 px-5 py-2 text-sm font-semibold text-paper/85 hover:bg-white/10"
          >
            {t("partner.stop_scan")}
          </button>
        </>
      )}
      {phase === "found" && (
        <p className="font-display mt-4 text-lg font-bold text-gold">
          {t("partner.found")}
        </p>
      )}
      {phase === "claiming" && (
        <p className="mt-6 animate-pulse text-paper/85">{t("partner.claiming")}</p>
      )}
      {phase === "already" && (
        <p className="mt-6 max-w-sm leading-relaxed text-paper/85">
          {t("partner.already")}
        </p>
      )}
      {(phase === "error-camera" || phase === "error-lib") && (
        <p className="mt-6 max-w-sm leading-relaxed text-paper/85">
          {t("partner.camera_error")}
        </p>
      )}
      {phase === "marker-missing" && (
        <p className="mt-6 max-w-sm leading-relaxed text-paper/85">
          {t("partner.marker_missing")}
        </p>
      )}

      {apiError && !reveal && phase !== "claiming" && (
        <p className="mt-4 text-sm text-red-300">{t("common.error")}</p>
      )}

      {showCollectionLink && (
        <Link
          href="/treasure"
          className="mt-8 rounded-2xl border border-gold/50 px-6 py-3 font-semibold text-gold hover:bg-gold/10"
        >
          {t("partner.to_collection")}
        </Link>
      )}

      {showManual && (
        <button
          onClick={manualClaim}
          className="mt-6 rounded-full border border-paper/40 px-5 py-2.5 text-sm font-semibold text-paper/85 hover:bg-white/10"
        >
          {t("partner.manual_claim")}
        </button>
      )}

      {reveal && (
        <ChestReveal
          tier={reveal.tier}
          loot={reveal.loot}
          onClose={() => void closeReveal()}
        />
      )}
    </main>
  );
}
