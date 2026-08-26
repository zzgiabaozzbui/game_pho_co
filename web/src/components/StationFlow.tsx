"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Compass,
  Lock,
  MapPin,
  PartyPopper,
  QrCode,
  Trophy,
  XCircle,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { fetchState } from "@/lib/client";
import type { StateDTO } from "@/lib/state";
import ChestReveal, { type RevealTier } from "@/components/ChestReveal";
import type { RevealLoot } from "@/components/RewardCard";

type Mode = "gps" | "qr" | "photo";

const PHOTO_MAX_EDGE = 1600;

async function downscalePhoto(file: File): Promise<File> {
  if (typeof createImageBitmap !== "function") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      PHOTO_MAX_EDGE / Math.max(bitmap.width, bitmap.height)
    );
    if (scale >= 1) {
      bitmap.close();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.82)
    );
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, {
      type: "image/jpeg",
    });
  } catch {
    return file;
  }
}

interface SolveResult {
  correct: boolean;
  pointsEarned?: number;
  score?: number;
}

export default function StationFlow({
  slug,
  token,
}: {
  slug: string;
  token: string | null;
}) {
  const { t, lang } = useLang();
  const [state, setState] = useState<StateDTO | null>(null);
  const [errorState, setErrorState] = useState<
    "none" | "not_found" | "network"
  >("none");
  const [mode, setMode] = useState<Mode>("photo");
  const [busy, setBusy] = useState(false);
  const [openPhase, setOpenPhase] = useState<"idle" | "pending" | "failed">(
    "idle"
  );
  const [checkinMsg, setCheckinMsg] = useState<string | null>(null);
  const [result, setResult] = useState<SolveResult | null>(null);
  const [choice, setChoice] = useState<number>(-1);
  const [revealedHint, setRevealedHint] = useState<{
    vi: string;
    en: string;
  } | null>(null);
  const [queue, setQueue] = useState<
    { grantId: number; tier: RevealTier | null; loot: RevealLoot[] }[]
  >([]);
  const [workshopAssignment, setWorkshopAssignment] = useState<{
    assignmentId: number;
    partnerName: string;
    partnerAddress: string | null;
    partnerDescription: string | null;
    partnerGoogleMapsUrl: string | null;
    task: {
      id: number;
      instructionVi: string;
      instructionEn: string;
      photoReqsVi: string;
      photoReqsEn: string;
      quizQuestionVi: string | null;
      quizQuestionEn: string | null;
      quizOptions: { vi: string; en: string }[] | null;
      quizCorrectIndex: number | null;
      rewardPoints: number;
    } | null;
  } | null>(null);
  const [workshopPhoto, setWorkshopPhoto] = useState<File | null>(null);
  const [workshopQuizChoice, setWorkshopQuizChoice] = useState<number>(-1);
  const [workshopStatus, setWorkshopStatus] = useState<
    "idle" | "fetching" | "ready" | "submitting" | "submitted" | "error"
  >("idle");
  const [workshopErrorMsg, setWorkshopErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setChoice(-1);
    setResult(null);
    setRevealedHint(null);
    setCheckinMsg(null);
    setQueue([]);
    setOpenPhase("idle");
    setWorkshopAssignment(null);
    setWorkshopPhoto(null);
    setWorkshopQuizChoice(-1);
    setWorkshopStatus("idle");
    setWorkshopErrorMsg(null);
  }, [slug]);

  const load = useCallback(async () => {
    try {
      const s = (await fetchState()) as StateDTO;
      setState(s);
      setErrorState(
        s.stations.some((x) => x.slug === slug) ? "none" : "not_found"
      );
    } catch {
      setErrorState("network");
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const station = state?.stations.find((x) => x.slug === slug) ?? null;
  const solved = station?.status === "completed";
  const checkedIn = solved || station?.status === "checked_in";
  const workshopType = station?.challengeType === "WORKSHOP";

  useEffect(() => {
    if (
      workshopType &&
      checkedIn &&
      !solved &&
      workshopStatus === "idle" &&
      !workshopAssignment &&
      state
    ) {
      setWorkshopStatus("fetching");
      fetch("/api/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId: state.playerId, stationId: station!.id }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(String(res.status));
          const data = await res.json();
          setWorkshopAssignment(data);
          setWorkshopStatus("ready");
        })
        .catch(() => {
          setWorkshopStatus("error");
          setWorkshopErrorMsg(t("workshop.fetch_error"));
        });
    }
  }, [workshopType, checkedIn, solved, workshopStatus, workshopAssignment, state, t, station]);

  if (errorState !== "none")
    return (
      <Shell title="">
        <Empty>
          <p>
            {errorState === "not_found"
              ? t("station.not_found")
              : t("common.error")}
          </p>
          {errorState === "not_found" ? (
            <Link href="/play" className="btn-primary mt-5">
              {t("common.back")}
            </Link>
          ) : (
            <button onClick={() => load()} className="btn-primary mt-5 px-6 py-2.5">
              {t("common.retry")}
            </button>
          )}
        </Empty>
      </Shell>
    );

  if (!state)
    return (
      <Shell title="…">
        <Empty>{t("common.loading")}</Empty>
      </Shell>
    );

  const name = lang === "vi" ? station!.nameVi : station!.nameEn;
  const story = lang === "vi" ? station!.storyVi : station!.storyEn;
  const question = lang === "vi" ? station!.questionVi : station!.questionEn;
  const options = station!.options ?? [];

  async function checkinGps() {
    setBusy(true);
    setCheckinMsg(t("gps.getting"));
    try {
      const pos = await new Promise<GeolocationPosition>(
        (resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          })
      );
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: state!.playerId,
          slug,
          method: "GPS",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      });
      if (res.ok) {
        await load();
      } else {
        const data = await res.json().catch(() => ({}));
        setCheckinMsg(
          data.error === "too_far"
            ? t("gps.too_far", {
                distance: data.distanceM as number,
                radius: data.radiusM as number,
              })
            : t("common.error")
        );
      }
    } catch {
      setCheckinMsg(t("gps.fail"));
    } finally {
      setBusy(false);
    }
  }

  async function checkinQr() {
    if (!token) return;
    setBusy(true);
    setCheckinMsg(null);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: state!.playerId,
          slug,
          method: "QR",
          token,
        }),
      });
      if (res.ok) await load();
      else setCheckinMsg(t("common.error"));
    } finally {
      setBusy(false);
    }
  }

  async function checkinPhoto(file: File) {
    setBusy(true);
    setCheckinMsg(null);
    try {
      const form = new FormData();
      form.set("playerId", state!.playerId);
      form.set("slug", slug);
      form.set("file", await downscalePhoto(file));
      const res = await fetch("/api/checkin/photo", {
        method: "POST",
        body: form,
      });
      if (res.ok) await load();
      else {
        const data = await res.json().catch(() => ({}));
        setCheckinMsg(
          data.error === "file_too_large"
            ? t("photo.too_large")
            : t("common.error")
        );
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitAnswer() {
    if (choice < 0 || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "answer",
          playerId: state!.playerId,
          slug,
          choice,
        }),
      });
      const data = (await res.json()) as SolveResult;
      setResult(data);
      if (data.correct) {
        await load();
        const res2 = await fetch(`/api/chests?playerId=${state!.playerId}`);
        if (res2.ok) {
          const data2 = await res2.json() as { unopened?: typeof queue };
          setQueue(data2.unopened ?? []);
        }
      }
    } finally {
      setBusy(false);
    }
  }

  async function revealHint() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "hint",
          playerId: state!.playerId,
          slug,
        }),
      });
      const data = await res.json();
      if (res.ok && data.hint) {
        setRevealedHint(data.hint);
      }
      await load();
    } catch {
      /* giữ gợi ý đã hiển thị — chỉ bỏ qua lần lấy thất bại */
    } finally {
      setBusy(false);
    }
  }

  async function confirmChestOpen(grantId: number) {
    setOpenPhase("pending");
    try {
      const res = await fetch("/api/chests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: state!.playerId, grantId }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setOpenPhase("idle");
      setQueue((q) => q.slice(1));
      await load();
    } catch {
      setOpenPhase("failed");
    }
  }

  async function submitWorkshop() {
    if (!workshopPhoto || !workshopAssignment || workshopStatus === "submitting") return;
    setWorkshopStatus("submitting");
    setWorkshopErrorMsg(null);
    try {
      const form = new FormData();
      form.set("guestId", state!.playerId);
      form.set("assignmentId", String(workshopAssignment.assignmentId));
      form.set("photo", workshopPhoto);
      if (workshopQuizChoice >= 0) {
        form.set("quizAnswer", String(workshopQuizChoice));
      }
      const res = await fetch("/api/workshop/submit", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? String(res.status));
      }
      setWorkshopStatus("submitted");
      await load();
    } catch {
      setWorkshopStatus("error");
      setWorkshopErrorMsg(t("workshop.submit_error"));
    }
  }

  const nextSlug =
    state.stations.find((s) => s.orderIndex === station!.orderIndex + 1)?.slug ??
    null;

  return (
    <Shell title={name}>
      <div className="px-5 py-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-clay-deep">
          #{station!.orderIndex} ·{" "}
          {solved
            ? t("status.completed")
            : checkedIn
              ? t("status.checked_in")
              : station!.hasPendingPhoto
                ? t("status.pending")
                : t("status.current")}
        </div>

        {!checkedIn ? (
          station!.hasPendingPhoto ? (
            <section className="mt-4 rounded-2xl border border-clay bg-clay-soft p-5 text-sm leading-relaxed text-clay-deep">
              <Lock className="mr-1.5 inline h-4 w-4 align-[-2px]" />
              {t("photo.pending")}
              <Link href="/play" className="btn-primary mt-4 block text-center">
                {t("common.back")}
              </Link>
            </section>
          ) : (
            <CheckinSection
              mode={mode}
              setMode={setMode}
              msg={checkinMsg}
              busy={busy}
              token={token}
              rejectedNote={station!.rejectedNote}
              onGps={checkinGps}
              onQr={checkinQr}
              onPhoto={checkinPhoto}
              onTabChange={() => setCheckinMsg(null)}
            />
          )
        ) : workshopType && !solved ? (
          <WorkshopPanel
            assignment={workshopAssignment}
            status={workshopStatus}
            errorMsg={workshopErrorMsg}
            photo={workshopPhoto}
            quizChoice={workshopQuizChoice}
            lang={lang}
            onPhotoChange={setWorkshopPhoto}
            onQuizChoice={setWorkshopQuizChoice}
            onSubmit={submitWorkshop}
          />
        ) : (
          <>
            <h2 className="mt-2 font-display text-xl font-black leading-snug text-ink-strong">
              {name}
            </h2>

            <section className="mt-4 rounded-2xl bg-cream p-5 shadow-sm ring-1 ring-line">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                {t("station.story")}
              </h3>
              <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-ink">
                {story}
              </p>
            </section>

            {!solved ? (
              <section className="mt-4 rounded-2xl bg-cream p-5 shadow-sm ring-1 ring-line">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                  {t("station.question")}
                </h3>
                <p className="font-display mt-2 font-bold text-ink-strong">{question}</p>
                <div className="mt-4 space-y-2.5">
                  {options.map((o, i) => (
                    <label
                      key={i}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-[15px] transition-colors ${
                        choice === i
                          ? "border-son bg-son-soft font-semibold text-son-deep"
                          : "border-line bg-paper/50 hover:bg-gold-soft/60"
                      }`}
                    >
                      <input
                        type="radio"
                        name="opt"
                        className="accent-son"
                        checked={choice === i}
                        onChange={() => {
                          setChoice(i);
                          setResult(null);
                        }}
                      />
                      {lang === "vi" ? o.vi : o.en}
                    </label>
                  ))}
                </div>
                {result && !result.correct && (
                  <p className="mt-3 flex items-center gap-2 rounded-xl bg-wine-soft px-4 py-2.5 text-sm font-medium text-wine">
                    <XCircle className="h-4 w-4 shrink-0" />
                    {t("answer.wrong")}
                  </p>
                )}
                <button
                  onClick={submitAnswer}
                  disabled={busy || choice < 0}
                  className="btn-primary mt-4 w-full py-3.5 disabled:opacity-50"
                >
                  {t("answer.submit")}
                </button>
              </section>
            ) : (
              <SuccessPanel
                pointsEarned={result?.pointsEarned}
                hintText={revealedHint}
                onReveal={revealHint}
                busy={busy}
                nextSlug={nextSlug}
                treasure={!nextSlug}
              />
            )}

            <p className="mt-6 text-center text-xs text-ink-soft">
              {t("score.label")}: {state.score}
            </p>
          </>
        )}
      </div>

      {queue.length > 0 && queue[0].tier && (
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
    </Shell>
  );
}

function CheckinSection({
  mode,
  setMode,
  msg,
  busy,
  token,
  rejectedNote,
  onGps,
  onQr,
  onPhoto,
  onTabChange,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
  msg: string | null;
  busy: boolean;
  token: string | null;
  rejectedNote?: string;
  onGps: () => void;
  onQr: () => void;
  onPhoto: (f: File) => void;
  onTabChange: () => void;
}) {
  const { t } = useLang();

  const tabs: { id: Mode; label: string }[] = [
    { id: "gps", label: t("checkin.gps") },
    { id: "qr", label: t("checkin.qr") },
    { id: "photo", label: t("checkin.photo") },
  ];

  return (
    <section className="mt-4">
      <h2 className="font-display mt-2 text-xl font-black text-ink-strong">
        {t("checkin.title")}
      </h2>
      {rejectedNote && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-wine-soft px-4 py-2.5 text-sm text-wine">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {t("photo.rejected", { note: rejectedNote || "-" })}
        </p>
      )}
      <div className="mt-4 grid grid-cols-3 gap-1 rounded-2xl bg-line/60 p-1">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => {
              onTabChange();
              setMode(tb.id);
            }}
            className={`flex min-h-[44px] items-center justify-center rounded-xl px-2 py-2.5 text-xs font-semibold transition-colors ${
              mode === tb.id
                ? "bg-cream text-ink-strong shadow"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-cream p-5 shadow-sm ring-1 ring-line">
        {mode === "gps" && (
          <>
            <button
              onClick={onGps}
              disabled={busy}
              className="btn-primary flex w-full items-center justify-center gap-2 py-3.5 disabled:opacity-60"
            >
              <MapPin className="h-4 w-4" />
              {msg ?? t("checkin.gps")}
            </button>
          </>
        )}

        {mode === "qr" && (
          <>
            <p className="text-sm leading-relaxed text-ink-soft">{t("qr.hint")}</p>
            <button
              onClick={onQr}
              disabled={busy || !token}
              className="btn-primary mt-4 flex w-full items-center justify-center gap-2 py-3.5 disabled:opacity-50"
            >
              <QrCode className="h-4 w-4" />
              {t("qr.confirm")}
            </button>
            {!token && (
              <p className="mt-3 text-center text-sm text-wine">
                {t("qr.missing")}
              </p>
            )}
          </>
        )}

        {mode === "photo" && (
          <>
            <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-line bg-paper/60 p-6 text-center text-sm font-medium text-ink-soft transition-colors hover:border-son hover:bg-son-soft/40 hover:text-son">
              <Camera className="mx-auto h-6 w-6" />
              <span className="mt-1.5 block">
                {busy ? t("photo.sending") : t("photo.choose")}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onPhoto(f);
                  e.currentTarget.value = "";
                }}
              />
            </label>
          </>
        )}

        {msg && mode !== "gps" && (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-wine-soft px-4 py-2.5 text-sm font-medium text-wine">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {msg}
          </p>
        )}
      </div>
    </section>
  );
}

function SuccessPanel({
  pointsEarned,
  hintText,
  onReveal,
  busy,
  nextSlug,
  treasure,
}: {
  pointsEarned?: number;
  hintText: { vi: string; en: string } | null;
  onReveal: () => void;
  busy: boolean;
  nextSlug: string | null;
  treasure: boolean;
}) {
  const { t, lang } = useLang();
  const [confirmingHint, setConfirmingHint] = useState(false);
  const hint = hintText ? (lang === "vi" ? hintText.vi : hintText.en) : null;

  useEffect(() => {
    setConfirmingHint(false);
  }, [treasure]);

  return (
    <section className="mt-4 rounded-2xl border border-jade bg-jade-soft p-5">
      <p className="flex items-start gap-2 font-bold text-jade-deep">
        <PartyPopper className="mt-0.5 h-5 w-5 shrink-0" />
        <span>
          {t("answer.correct")}
          {pointsEarned !== undefined ? ` (+${pointsEarned})` : ""}
        </span>
      </p>

      {hint ? (
        <>
          <h4 className="mt-4 text-xs font-bold uppercase tracking-wider text-jade">
            {t("hint.title")}
          </h4>
          <p className="mt-2 rounded-xl bg-cream px-4 py-3 text-[15px] italic leading-relaxed text-ink ring-1 ring-jade">
            <Compass className="mr-1.5 inline h-4 w-4 text-jade align-[-2px]" />
            {hint}
          </p>
        </>
      ) : confirmingHint ? (
        <div className="mt-4 rounded-xl bg-cream px-4 py-3 ring-1 ring-line">
          <p className="text-sm font-medium leading-snug text-ink">
            {t("hint.confirm_title")}
          </p>
          <div className="mt-2.5 flex gap-2">
            <button
              onClick={() => {
                setConfirmingHint(false);
                onReveal();
              }}
              disabled={busy}
              className="flex-1 rounded-lg bg-ink-strong py-2 text-sm font-semibold text-paper transition-colors hover:bg-ink disabled:opacity-50"
            >
              {t("hint.confirm_yes")}
            </button>
            <button
              onClick={() => setConfirmingHint(false)}
              className="flex-1 rounded-lg border border-line bg-cream py-2 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
            >
              {t("hint.confirm_no")}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setConfirmingHint(true)}
          disabled={busy}
          className="mt-4 w-full rounded-xl border border-jade bg-cream py-3 text-sm font-semibold text-jade-deep hover:bg-jade-soft/60 disabled:opacity-50"
        >
          {t("hint.show")}
        </button>
      )}

      {treasure ? (
        <Link
          href="/treasure"
          className="btn-primary mt-4 flex w-full items-center justify-center gap-2 py-3.5 text-center"
        >
          <Trophy className="h-4 w-4" />
          {t("cta.treasure")}
        </Link>
      ) : (
        <Link
          href={`/station/${nextSlug}`}
          className="btn-primary mt-4 block w-full py-3.5 text-center"
        >
          {t("cta.next")} →
        </Link>
      )}
    </section>
  );
}

function WorkshopPanel({
  assignment,
  status,
  errorMsg,
  photo,
  quizChoice,
  lang,
  onPhotoChange,
  onQuizChoice,
  onSubmit,
}: {
  assignment: {
    assignmentId: number;
    partnerName: string;
    partnerAddress: string | null;
    partnerDescription: string | null;
    partnerGoogleMapsUrl: string | null;
    task: {
      id: number;
      instructionVi: string;
      instructionEn: string;
      photoReqsVi: string;
      photoReqsEn: string;
      quizQuestionVi: string | null;
      quizQuestionEn: string | null;
      quizOptions: { vi: string; en: string }[] | null;
      quizCorrectIndex: number | null;
      rewardPoints: number;
    } | null;
  } | null;
  status: "idle" | "fetching" | "ready" | "submitting" | "submitted" | "error";
  errorMsg: string | null;
  photo: File | null;
  quizChoice: number;
  lang: "vi" | "en";
  onPhotoChange: (f: File | null) => void;
  onQuizChoice: (i: number) => void;
  onSubmit: () => void;
}) {
  const { t } = useLang();

  if (status === "fetching") {
    return (
      <section className="mt-4 rounded-2xl bg-cream p-5 shadow-sm ring-1 ring-line text-center text-sm text-ink-soft">
        {t("common.loading")}
      </section>
    );
  }

  if (status === "error" && errorMsg) {
    return (
      <section className="mt-4 rounded-2xl bg-cream p-5 shadow-sm ring-1 ring-line">
        <p className="text-sm text-wine">{errorMsg}</p>
      </section>
    );
  }

  if (!assignment) return null;

  const task = assignment.task;

  if (status === "submitted") {
    return (
      <section className="mt-4 rounded-2xl border border-jade bg-jade-soft p-5">
        <p className="flex items-start gap-2 font-bold text-jade-deep">
          <PartyPopper className="mt-0.5 h-5 w-5 shrink-0" />
          {t("workshop.submit_success")}
        </p>
        <p className="mt-2 text-sm text-jade">
          {t("workshop.pending")}
        </p>
      </section>
    );
  }

  const quizQuestion =
    task && lang === "vi" ? task.quizQuestionVi : task?.quizQuestionEn;
  const quizOptions = task?.quizOptions ?? [];

  return (
    <section className="mt-4 space-y-4">
      <div className="rounded-2xl bg-cream p-5 shadow-sm ring-1 ring-line">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-soft">
          {t("workshop.partner")}
        </h3>
        <p className="mt-2 font-display font-bold text-ink-strong">
          {assignment.partnerName}
        </p>
        {assignment.partnerAddress && (
          <p className="mt-1 text-sm text-ink-soft">{assignment.partnerAddress}</p>
        )}
        {assignment.partnerDescription && (
          <p className="mt-2 text-sm leading-relaxed text-ink">
            {assignment.partnerDescription}
          </p>
        )}
        {assignment.partnerGoogleMapsUrl && (
          <a
            href={assignment.partnerGoogleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-semibold text-son hover:underline"
          >
            {t("guide.start")} →
          </a>
        )}
      </div>

      {task && (
        <div className="rounded-2xl bg-cream p-5 shadow-sm ring-1 ring-line">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-soft">
            {t("workshop.task_title")}
          </h3>
          <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-ink">
            {lang === "vi" ? task.instructionVi : task.instructionEn}
          </p>

          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-clay-deep">
            {t("workshop.photo_reqs")}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {lang === "vi" ? task.photoReqsVi : task.photoReqsEn}
          </p>
        </div>
      )}

      {!task && (
        <section className="rounded-2xl bg-cream p-5 shadow-sm ring-1 ring-line text-center text-sm text-ink-soft">
          {t("workshop.no_task")}
        </section>
      )}

      <div className="rounded-2xl bg-cream p-5 shadow-sm ring-1 ring-line">
        <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-line bg-paper/60 p-6 text-center text-sm font-medium text-ink-soft transition-colors hover:border-son hover:bg-son-soft/40 hover:text-son">
          <Camera className="mx-auto h-6 w-6" />
          <span className="mt-1.5 block">
            {photo ? photo.name : t("workshop.upload_hint")}
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              onPhotoChange(f);
              e.currentTarget.value = "";
            }}
          />
        </label>
        {photo && (
          <p className="mt-2 flex items-center justify-between text-xs text-ink-soft">
            <span className="truncate">{photo.name}</span>
            <button
              onClick={() => onPhotoChange(null)}
              className="ml-2 shrink-0 text-wine hover:underline"
            >
              <XCircle className="inline h-3.5 w-3.5" />
            </button>
          </p>
        )}
      </div>

      {quizQuestion && quizOptions.length > 0 && (
        <div className="rounded-2xl bg-cream p-5 shadow-sm ring-1 ring-line">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-soft">
            {t("workshop.quiz_question")}
          </h3>
          <p className="font-display mt-2 font-bold text-ink-strong">{quizQuestion}</p>
          <div className="mt-4 space-y-2.5">
            {quizOptions.map((o, i) => (
              <label
                key={i}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-[15px] transition-colors ${
                  quizChoice === i
                    ? "border-son bg-son-soft font-semibold text-son-deep"
                    : "border-line bg-paper/50 hover:bg-gold-soft/60"
                }`}
              >
                <input
                  type="radio"
                  name="ws-opt"
                  className="accent-son"
                  checked={quizChoice === i}
                  onChange={() => onQuizChoice(i)}
                />
                {lang === "vi" ? o.vi : o.en}
              </label>
            ))}
          </div>
        </div>
      )}

      {status === "error" && errorMsg && (
        <p className="rounded-xl bg-wine-soft px-4 py-2.5 text-sm font-medium text-wine">
          {errorMsg}
        </p>
      )}

      <button
        onClick={onSubmit}
        disabled={!photo || status === "submitting"}
        className="btn-primary w-full py-3.5 disabled:opacity-50"
      >
        {status === "submitting"
          ? t("workshop.submitting")
          : t("workshop.submit")}
      </button>
    </section>
  );
}

function Shell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { t, toggle } = useLang();
  return (
    <main className="min-h-dvh bg-paper pb-[calc(2.5rem_+_env(safe-area-inset-bottom))]">
      <header className="header-bar sticky top-0 z-10 flex items-center justify-between px-4 py-3">
        <Link href="/play" className="text-paper/80 hover:text-paper">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="max-w-[60%] truncate font-display text-sm font-bold">
          {title}
        </span>
        <button
          onClick={toggle}
          className="rounded-full border border-timber-line px-2.5 py-1 text-xs font-semibold"
        >
          {t("lang.switch")}
        </button>
      </header>
      {children}
    </main>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-16 flex flex-col items-center px-8 text-center text-ink-soft">
      {children}
    </div>
  );
}
