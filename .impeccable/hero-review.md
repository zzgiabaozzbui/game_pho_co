98fd066 feat(ui): og share metadata cho trang chu (vi_VN)
4971dee feat(ui): hero ban do kho bau - identity pho co ha noi (taste)

## Full diff (-U10)
diff --git a/web/src/app/layout.tsx b/web/src/app/layout.tsx
index 2bce134..2cd4655 100644
--- a/web/src/app/layout.tsx
+++ b/web/src/app/layout.tsx
@@ -16,20 +16,29 @@ const fraunces = Fraunces({
   variable: "--font-fraunces",
   display: "swap",
 });
 
 export const metadata: Metadata = {
   title: "Kho báu Phố cổ | Old Quarter Treasure",
   description:
     "Hành trình truy tìm kho báu văn hóa qua 36 phố phường Hà Nội xưa.",
   manifest: "/manifest.webmanifest",
   appleWebApp: { capable: true, title: "Phố cổ 36", statusBarStyle: "black-translucent" },
+  openGraph: {
+    type: "website",
+    siteName: "Kho báu Phố cổ",
+    locale: "vi_VN",
+    alternateLocale: ["en_US"],
+    title: "Kho báu Phố cổ | Old Quarter Treasure",
+    description:
+      "Hành trình truy tìm kho báu văn hóa qua 36 phố phường Hà Nội xưa.",
+  },
 };
 
 export const viewport: Viewport = {
   themeColor: "#2d1b12",
   width: "device-width",
   initialScale: 1,
   viewportFit: "cover",
 };
 
 export default function RootLayout({
diff --git a/web/src/app/page.tsx b/web/src/app/page.tsx
index c78c560..397b420 100644
--- a/web/src/app/page.tsx
+++ b/web/src/app/page.tsx
@@ -1,40 +1,156 @@
-"use client";
+﻿"use client";
 
 import Link from "next/link";
 import { useRouter } from "next/navigation";
-import { useState, useSyncExternalStore } from "react";
-import { Camera, KeyRound, MapPin, Puzzle } from "lucide-react";
+import { useEffect, useState, useSyncExternalStore } from "react";
+import { Camera, Compass, Lock, MapPin, Puzzle } from "lucide-react";
 import { useLang } from "@/lib/i18n";
 import { ensureSession, getPlayerId, setPlayerId } from "@/lib/client";
 
+function HeroScene({ label }: { label: string }) {
+  return (
+    <svg
+      viewBox="0 0 400 84"
+      preserveAspectRatio="xMidYMax meet"
+      role="img"
+      focusable="false"
+      aria-label={label}
+      className="h-[76px] w-full"
+    >
+      <defs>
+        <pattern
+          id="pc36-lat"
+          width={16}
+          height={4}
+          patternUnits="userSpaceOnUse"
+        >
+          <rect width={8} height={4} fill="var(--color-gold)" />
+        </pattern>
+        <radialGradient id="pc36-glow">
+          <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.45" />
+          <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
+        </radialGradient>
+      </defs>
+      <g fill="var(--color-line)">
+        <path d="M62 78 L94 28 L126 78 Z" />
+        <path d="M196 78 L230 24 L264 78 Z" />
+        <path d="M300 78 L330 32 L360 78 Z" />
+      </g>
+      <g fill="var(--color-timber)">
+        <path d="M-4 78 V54 L28 37 L60 54 V78 Z" />
+        <path d="M60 78 V64 L88 58 L116 61 V78 Z" />
+        <path d="M116 78 V56 L146 42 L176 56 V78 Z" />
+        <path d="M176 78 V46 H210 V78 Z" />
+        <rect x={190} y={40} width={6} height={6} />
+        <path d="M210 78 V52 L244 36 L278 52 V78 Z" />
+        <path d="M278 78 V63 L306 57 L334 60 V78 Z" />
+        <path d="M334 78 V55 L362 43 L390 55 V78 Z" />
+        <path d="M390 78 V60 L404 55 V78 Z" />
+      </g>
+      <rect
+        x={4}
+        y={79}
+        width={392}
+        height={4}
+        rx={2}
+        fill="url(#pc36-lat)"
+        opacity={0.55}
+      />
+      <path
+        d="M12 72 C64 58 118 66 178 52 C238 38 300 44 352 30"
+        fill="none"
+        stroke="var(--color-paper)"
+        strokeWidth={5}
+        strokeLinecap="round"
+        opacity={0.9}
+      />
+      <path
+        d="M12 72 C64 58 118 66 178 52 C238 38 300 44 352 30"
+        fill="none"
+        stroke="var(--color-clay-deep)"
+        strokeWidth={2.25}
+        strokeLinecap="round"
+        strokeDasharray="0.5 7"
+      />
+      <g
+        stroke="var(--color-clay-deep)"
+        strokeWidth={1.25}
+        fill="var(--color-paper)"
+      >
+        <circle cx={12} cy={72} r={4.5} strokeWidth={1.5} />
+        <circle cx={12} cy={72} r={1.8} stroke="none" fill="var(--color-clay-deep)" />
+        <circle cx={76} cy={62} r={3} />
+        <circle cx={142} cy={58} r={3} />
+        <circle cx={208} cy={44} r={3} />
+        <circle cx={272} cy={41} r={3} />
+        <circle cx={330} cy={36} r={3} />
+      </g>
+      <circle cx={355} cy={21} r={16} fill="url(#pc36-glow)" />
+      <g transform="translate(344 12)">
+        <path
+          d="M0 6 Q0 0 6 0 H16 Q22 0 22 6 V9 H0 Z"
+          fill="var(--color-gold)"
+        />
+        <rect y={9} width={22} height={13} rx={2} fill="var(--color-gold)" />
+        <rect y={8.6} width={22} height={0.9} fill="var(--color-paper)" opacity={0.6} />
+        <circle cx={11} cy={15} r={2.75} fill="var(--color-paper)" />
+        <rect x={10.2} y={16} width={1.6} height={4} rx={0.8} fill="var(--color-paper)" />
+      </g>
+    </svg>
+  );
+}
+
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
+  const [chests, setChests] = useState<{ total: number; unopened: number } | null>(
+    null
+  );
   const hasSession = pid !== null;
+  const hasChests = (chests?.total ?? 0) > 0;
+
+  useEffect(() => {
+    if (!pid) return;
+    let alive = true;
+    fetch(`/api/chests?playerId=${pid}`)
+      .then((r) => (r.ok ? r.json() : null))
+      .then((d) => {
+        if (!alive || !d) return;
+        const j = d as { unopenedCount?: number; collection?: unknown[] };
+        setChests({
+          total: (j.unopenedCount ?? 0) + (j.collection?.length ?? 0),
+          unopened: j.unopenedCount ?? 0,
+        });
+      })
+      .catch(() => {});
+    return () => {
+      alive = false;
+    };
+  }, [pid]);
 
   async function start() {
     setBusy(true);
     setStartError(false);
     try {
       await ensureSession();
       router.push("/play");
     } catch {
       setStartError(true);
       setBusy(false);
@@ -85,31 +201,31 @@ export default function Home() {
           {t("home.location")}
         </span>
         <button
           onClick={toggle}
           className="rounded-full border border-line bg-cream px-3 py-1 text-sm font-medium hover:bg-gold-soft"
         >
           {t("lang.switch")}
         </button>
       </div>
 
-      <header className="mt-10">
+      <header className="mt-8">
         <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-timber text-paper shadow-lg shadow-timber/30">
-          <KeyRound className="h-8 w-8 text-gold" strokeWidth={2.25} />
+          <Compass className="h-8 w-8 text-gold" strokeWidth={2.25} />
         </div>
         <h1 className="font-display text-3xl font-black leading-tight text-ink-strong">
           {t("app.name")}
         </h1>
         <p className="mt-2 text-base text-ink-soft">{t("app.tagline")}</p>
       </header>
 
-      <div className="lattice-divider mt-8" />
+      <HeroScene label={t("home.hero_scene_alt")} />
 
       <section className="mt-6">
         <ul
           className={`grid grid-cols-3 gap-2 ${hasSession ? "opacity-70" : ""}`}
         >
           <li
             className={`flex flex-col items-center gap-1.5 rounded-xl border border-line bg-cream px-2 text-center ${
               hasSession ? "py-2" : "py-3"
             }`}
           >
@@ -168,26 +284,38 @@ export default function Home() {
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
-        <Link
-          href="/treasure"
-          className="mt-3 block w-full rounded-2xl border border-line bg-cream px-6 py-3 text-center font-medium text-ink hover:bg-gold-soft"
-        >
-          {t("cta.treasure_short")}
-        </Link>
+        {hasChests ? (
+          <Link
+            href="/treasure"
+            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-line bg-cream px-6 py-3 font-medium text-ink hover:bg-gold-soft"
+          >
+            {t("cta.treasure_short")}
+            {chests && chests.unopened > 0 && (
+              <span className="grid min-w-5 place-items-center rounded-full bg-gold px-1.5 py-0.5 text-xs font-bold leading-none text-timber">
+                {chests.unopened}
+              </span>
+            )}
+          </Link>
+        ) : (
+          <p className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line px-4 py-2.5 text-center text-sm text-ink-soft">
+            <Lock className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
+            <span>{t("home.treasure_locked")}</span>
+          </p>
+        )}
       </div>
 
       <div className="mt-8 border-t border-line pt-5">
         {hasSession && pid ? (
           <div>
             <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">
               {t("home.recover_yours")}
             </p>
             <div className="mt-2 flex items-center gap-2">
               <code className="flex-1 truncate rounded-lg bg-cream px-3 py-2.5 text-xs ring-1 ring-line">
diff --git a/web/src/lib/dictionaries.ts b/web/src/lib/dictionaries.ts
index e6b7e66..9b3274f 100644
--- a/web/src/lib/dictionaries.ts
+++ b/web/src/lib/dictionaries.ts
@@ -4,20 +4,23 @@ const vi = {
   "app.name": "Kho báu Phố cổ",
   "app.tagline": "Hành trình truy tìm kho báu qua 36 phố phường Hà Nội xưa",
   "cta.start": "Bắt đầu hành trình",
   "cta.continue": "Tiếp tục hành trình",
   "cta.toMap": "Mở bản đồ tuyến",
   "cta.toStation": "Vào trạm này",
   "cta.next": "Đến trạm kế tiếp",
   "cta.treasure": "Nhận kho báu văn hóa",
   "cta.treasure_short": "Rương kho báu",
   "home.location": "Hà Nội · Việt Nam",
+  "home.hero_scene_alt":
+    "Tranh phố cổ: tuyến đường chấm nối 36 phố phường vượt mái ngói tới rương kho báu",
+  "home.treasure_locked": "Rương đầu tiên đang chờ ở cuối tuyến",
   "home.recover_title": "Đã có mã khôi phục?",
   "home.recover_hint":
     "Dán mã khôi phục từ thiết bị cũ để tiếp tục điểm và tiến trình của bạn.",
   "home.recover_apply": "Khôi phục",
   "home.recover_fail": "Mã không đúng hoặc không tồn tại.",
   "home.recover_yours": "Mã khôi phục của bạn — lưu lại để chơi trên máy khác",
   "home.recover_copy": "Sao chép",
   "home.recover_copied": "Đã sao chép!",
   "home.start_error": "Không kết nối được — thử lại nhé.",
   "home.step_go": "Đến địa điểm",
@@ -141,20 +144,23 @@ const en: Record<DictKey, string> = {
   "app.tagline":
     "A treasure hunt through the 36 ancient streets of Hanoi's Old Quarter",
   "cta.start": "Start the journey",
   "cta.continue": "Continue the journey",
   "cta.toMap": "Open the route map",
   "cta.toStation": "Enter this station",
   "cta.next": "Go to next station",
   "cta.treasure": "Claim the cultural treasure",
   "cta.treasure_short": "Treasure chest",
   "home.location": "Hanoi · Vietnam",
+  "home.hero_scene_alt":
+    "Old Quarter scene: a dotted route linking 36 streets over tile roofs to the treasure chest",
+  "home.treasure_locked": "Your first chest awaits at the end of the route",
   "home.recover_title": "Have a recovery code?",
   "home.recover_hint":
     "Paste the recovery code from your old device to continue your score and progress.",
   "home.recover_apply": "Restore",
   "home.recover_fail": "Invalid or unknown code.",
   "home.recover_yours": "Your recovery code — keep it to play on another device",
   "home.recover_copy": "Copy",
   "home.recover_copied": "Copied!",
   "home.start_error": "Couldn't connect — please try again.",
   "home.step_go": "Go to the spot",
