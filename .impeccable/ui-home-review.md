b0a70dc fix(ui): hasSession qua useSyncExternalStore - het hydration mismatch
3fe5eb4 feat(ui): home nen 3 buoc chip + thu gon luat (impeccable distill)
45dab99 feat(ui): home bat loi start co message + retry (impeccable harden)

## Diff stat
 web/src/app/page.tsx        | 105 ++++++++++++++++++++++++++++++++++----------
 web/src/lib/dictionaries.ts |   8 ++++
 2 files changed, 89 insertions(+), 24 deletions(-)

## Full diff (-U10)
diff --git a/web/src/app/page.tsx b/web/src/app/page.tsx
index 7a59af4..c78c560 100644
--- a/web/src/app/page.tsx
+++ b/web/src/app/page.tsx
@@ -1,62 +1,68 @@
 "use client";
 
 import Link from "next/link";
 import { useRouter } from "next/navigation";
-import { useState } from "react";
-import { KeyRound } from "lucide-react";
+import { useState, useSyncExternalStore } from "react";
+import { Camera, KeyRound, MapPin, Puzzle } from "lucide-react";
 import { useLang } from "@/lib/i18n";
 import { ensureSession, getPlayerId, setPlayerId } from "@/lib/client";
-import { useEffect } from "react";
+
+function savedPid(): string | null {
+  return typeof window === "undefined" ? null : getPlayerId();
+}
+
+function subscribeSavedPid(onChange: () => void): () => void {
+  window.addEventListener("storage", onChange);
+  return () => window.removeEventListener("storage", onChange);
+}
 
 export default function Home() {
   const { t, toggle } = useLang();
   const router = useRouter();
   const [busy, setBusy] = useState(false);
-  const [hasSession, setHasSession] = useState(false);
-  const [pid, setPid] = useState<string | null>(null);
+  const storedPid = useSyncExternalStore(subscribeSavedPid, savedPid, () => null);
+  const [recoveredPid, setRecoveredPid] = useState<string | null>();
+  const pid = recoveredPid ?? storedPid;
+  const [startError, setStartError] = useState(false);
   const [recoverCode, setRecoverCode] = useState("");
   const [recoverMsg, setRecoverMsg] = useState<string | null>(null);
   const [copied, setCopied] = useState(false);
-
-  useEffect(() => {
-    const id = getPlayerId();
-    setPid(id);
-    setHasSession(!!id);
-  }, []);
+  const hasSession = pid !== null;
 
   async function start() {
     setBusy(true);
+    setStartError(false);
     try {
       await ensureSession();
       router.push("/play");
     } catch {
+      setStartError(true);
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
-        setPid(data.playerId);
-        setHasSession(true);
+        setRecoveredPid(data.playerId);
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
@@ -91,40 +97,91 @@ export default function Home() {
           <KeyRound className="h-8 w-8 text-gold" strokeWidth={2.25} />
         </div>
         <h1 className="font-display text-3xl font-black leading-tight text-ink-strong">
           {t("app.name")}
         </h1>
         <p className="mt-2 text-base text-ink-soft">{t("app.tagline")}</p>
       </header>
 
       <div className="lattice-divider mt-8" />
 
-      <section className="mt-6 rounded-2xl border border-line bg-cream p-5">
-        <h2 className="font-display font-bold text-ink-strong">
-          {t("rules.title")}
-        </h2>
-        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-ink/90 marker:font-semibold marker:text-son">
-          <li>{t("rules.1")}</li>
-          <li>{t("rules.2")}</li>
-          <li>{t("rules.3")}</li>
-          <li>{t("rules.4")}</li>
-        </ol>
+      <section className="mt-6">
+        <ul
+          className={`grid grid-cols-3 gap-2 ${hasSession ? "opacity-70" : ""}`}
+        >
+          <li
+            className={`flex flex-col items-center gap-1.5 rounded-xl border border-line bg-cream px-2 text-center ${
+              hasSession ? "py-2" : "py-3"
+            }`}
+          >
+            <MapPin className="h-5 w-5 shrink-0 text-clay-deep" strokeWidth={2} />
+            <span className="text-xs font-medium leading-tight text-ink">
+              {t("home.step_go")}
+            </span>
+          </li>
+          <li
+            className={`flex flex-col items-center gap-1.5 rounded-xl border border-line bg-cream px-2 text-center ${
+              hasSession ? "py-2" : "py-3"
+            }`}
+          >
+            <Camera className="h-5 w-5 shrink-0 text-jade" strokeWidth={2} />
+            <span className="text-xs font-medium leading-tight text-ink">
+              {t("home.step_checkin")}
+            </span>
+          </li>
+          <li
+            className={`flex flex-col items-center gap-1.5 rounded-xl border border-line bg-cream px-2 text-center ${
+              hasSession ? "py-2" : "py-3"
+            }`}
+          >
+            <Puzzle className="h-5 w-5 shrink-0 text-gold" strokeWidth={2} />
+            <span className="text-xs font-medium leading-tight text-ink">
+              {t("home.step_solve")}
+            </span>
+          </li>
+        </ul>
+        <details className="mt-3">
+          <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-ink-soft transition-colors hover:text-ink">
+            {t("rules.title")}
+          </summary>
+          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-ink/90 marker:font-semibold marker:text-son">
+            <li>{t("rules.1")}</li>
+            <li>{t("rules.2")}</li>
+            <li>{t("rules.3")}</li>
+            <li>{t("rules.4")}</li>
+          </ol>
+        </details>
       </section>
 
       <div className="mt-auto pt-10">
         <button
           onClick={start}
           disabled={busy}
+          aria-busy={busy}
+          aria-describedby={startError ? "start-error" : undefined}
           className="btn-primary w-full py-4 text-lg active:scale-[0.99] disabled:opacity-60"
         >
-          {hasSession ? t("cta.continue") : t("cta.start")}
+          {startError && !busy
+            ? t("common.retry")
+            : hasSession
+              ? t("cta.continue")
+              : t("cta.start")}
         </button>
+        {startError && (
+          <p
+            id="start-error"
+            role="alert"
+            className="mt-2 text-center text-sm font-medium text-wine"
+          >
+            {t("home.start_error")}
+          </p>
+        )}
         <Link
           href="/treasure"
           className="mt-3 block w-full rounded-2xl border border-line bg-cream px-6 py-3 text-center font-medium text-ink hover:bg-gold-soft"
         >
           {t("cta.treasure_short")}
         </Link>
       </div>
 
       <div className="mt-8 border-t border-line pt-5">
         {hasSession && pid ? (
diff --git a/web/src/lib/dictionaries.ts b/web/src/lib/dictionaries.ts
index e30cde1..e6b7e66 100644
--- a/web/src/lib/dictionaries.ts
+++ b/web/src/lib/dictionaries.ts
@@ -12,20 +12,24 @@ const vi = {
   "cta.treasure_short": "Rương kho báu",
   "home.location": "Hà Nội · Việt Nam",
   "home.recover_title": "Đã có mã khôi phục?",
   "home.recover_hint":
     "Dán mã khôi phục từ thiết bị cũ để tiếp tục điểm và tiến trình của bạn.",
   "home.recover_apply": "Khôi phục",
   "home.recover_fail": "Mã không đúng hoặc không tồn tại.",
   "home.recover_yours": "Mã khôi phục của bạn — lưu lại để chơi trên máy khác",
   "home.recover_copy": "Sao chép",
   "home.recover_copied": "Đã sao chép!",
+  "home.start_error": "Không kết nối được — thử lại nhé.",
+  "home.step_go": "Đến địa điểm",
+  "home.step_checkin": "Chụp ảnh check-in",
+  "home.step_solve": "Giải đố nhận rương",
   "chest.title": "Rương kho báu!",
   "chest.tap_to_open": "Chạm để mở rương",
   "chest.reward_points": "+{points} điểm",
   "chest.reward_story": "Câu chuyện",
   "chest.reward_image": "Hình kỷ niệm",
   "chest.reward_video": "Video",
   "chest.unopened_badge": "{count} rương chờ mở",
   "chest.collection_title": "Bộ sưu tập của bạn",
   "chest.empty_collection": "Chưa mở rương nào.",
   "chest.final_title": "Rương Kho Báu đang chờ!",
@@ -145,20 +149,24 @@ const en: Record<DictKey, string> = {
   "cta.treasure_short": "Treasure chest",
   "home.location": "Hanoi · Vietnam",
   "home.recover_title": "Have a recovery code?",
   "home.recover_hint":
     "Paste the recovery code from your old device to continue your score and progress.",
   "home.recover_apply": "Restore",
   "home.recover_fail": "Invalid or unknown code.",
   "home.recover_yours": "Your recovery code — keep it to play on another device",
   "home.recover_copy": "Copy",
   "home.recover_copied": "Copied!",
+  "home.start_error": "Couldn't connect — please try again.",
+  "home.step_go": "Go to the spot",
+  "home.step_checkin": "Snap a check-in photo",
+  "home.step_solve": "Solve & earn chests",
   "chest.title": "Treasure chest!",
   "chest.tap_to_open": "Tap to open the chest",
   "chest.reward_points": "+{points} points",
   "chest.reward_story": "Story",
   "chest.reward_image": "Photo memory",
   "chest.reward_video": "Video",
   "chest.unopened_badge": "{count} chests waiting",
   "chest.collection_title": "Your collection",
   "chest.empty_collection": "No chests opened yet.",
   "chest.final_title": "The Grand Chest awaits!",
