a954219 fix(play): mo ruong cho xac nhan POST + legend mau chip
910a126 fix(play): mac dinh tab photo + xac nhan truoc khi tieu diem goi y

## Full diff (-U10)
diff --git a/web/src/app/play/page.tsx b/web/src/app/play/page.tsx
index 230abd1..4fe16c0 100644
--- a/web/src/app/play/page.tsx
+++ b/web/src/app/play/page.tsx
@@ -26,20 +26,23 @@ const GameMap = dynamic(() => import("@/components/GameMap"), {
   ),
 });
 
 export default function PlayPage() {
   const { t, toggle, lang } = useLang();
   const [state, setState] = useState<StateDTO | null>(null);
   const [error, setError] = useState(false);
   const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
   const [unopenedCount, setUnopenedCount] = useState(0);
   const [queue, setQueue] = useState<GrantView[]>([]);
+  const [openPhase, setOpenPhase] = useState<"idle" | "pending" | "failed">(
+    "idle"
+  );
 
   const load = useCallback(async () => {
     try {
       const s = (await fetchState()) as StateDTO;
       setState(s);
       setError(false);
       try {
         const res = await fetch(`/api/chests?playerId=${s.playerId}`);
         const data = res.ok
           ? ((await res.json()) as { unopenedCount?: number; unopened?: GrantView[] })
@@ -57,20 +60,38 @@ export default function PlayPage() {
 
   useEffect(() => {
     load();
   }, [load]);
 
   const onPosition = useCallback(
     (p: { lat: number; lng: number }) => setPos(p),
     []
   );
 
+  async function confirmChestOpen(grantId: number) {
+    if (!state) return;
+    setOpenPhase("pending");
+    try {
+      const res = await fetch("/api/chests", {
+        method: "POST",
+        headers: { "Content-Type": "application/json" },
+        body: JSON.stringify({ playerId: state.playerId, grantId }),
+      });
+      if (!res.ok) throw new Error(String(res.status));
+      setOpenPhase("idle");
+      setQueue((q) => q.slice(1));
+      await load();
+    } catch {
+      setOpenPhase("failed");
+    }
+  }
+
   if (error)
     return (
       <Centered>
         <p>{t("common.error")}</p>
         <button onClick={load} className="btn-primary mt-4 px-5 py-2.5 font-semibold">
           {t("common.retry")}
         </button>
       </Centered>
     );
 
@@ -163,44 +184,68 @@ export default function PlayPage() {
               href={`/station/${current.slug}`}
               className="btn-primary mt-4 block w-full px-6 py-3.5 text-center active:scale-[0.99]"
             >
               {current.status === "checked_in"
                 ? `${t("play.solve_puzzle")} →`
                 : t("cta.toStation")}
             </Link>
           </>
         ) : null}
 
-        <div className="mt-6 -mx-5 overflow-x-auto px-5 pb-1">
+        <div className="mt-6 flex items-center gap-4 text-[11px] font-semibold text-ink-soft">
+          <span className="flex items-center gap-1.5">
+            <span className="h-2 w-2 rounded-full bg-jade" aria-hidden />
+            {t("play.legend_solved")}
+          </span>
+          <span className="flex items-center gap-1.5">
+            <span className="h-2 w-2 rounded-full bg-clay" aria-hidden />
+            {t("play.legend_current")}
+          </span>
+          <span className="flex items-center gap-1.5">
+            <span className="h-2 w-2 rounded-full bg-son" aria-hidden />
+            {t("play.legend_locked")}
+          </span>
+        </div>
+
+        <div className="-mx-5 mt-2 overflow-x-auto px-5 pb-1">
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
-          onClose={async () => {
-            const current = queue[0];
-            setQueue((q) => q.slice(1));
-            await fetch("/api/chests", {
-              method: "POST",
-              headers: { "Content-Type": "application/json" },
-              body: JSON.stringify({ playerId: state.playerId, grantId: current.grantId }),
-            }).catch(() => {});
-            await load();
+          onClose={() => {
+            if (openPhase === "pending") return;
+            void confirmChestOpen(queue[0].grantId);
           }}
+          notice={
+            openPhase === "failed" ? (
+              <div className="flex w-full max-w-sm flex-col items-center gap-2">
+                <p className="rounded-xl bg-wine-soft px-4 py-2.5 text-sm font-medium text-wine">
+                  {t("play.chest_open_failed")}
+                </p>
+                <button
+                  onClick={() => void confirmChestOpen(queue[0].grantId)}
+                  className="rounded-full border border-paper/40 px-5 py-2 text-sm font-semibold text-paper transition-colors hover:bg-paper/10"
+                >
+                  {t("common.retry")}
+                </button>
+              </div>
+            ) : null
+          }
         />
       )}
     </main>
   );
 }
 
 function StationChip({
   station: s,
 }: {
   station: StateDTO["stations"][number];
diff --git a/web/src/components/ChestReveal.tsx b/web/src/components/ChestReveal.tsx
index d7cf424..59dcecf 100644
--- a/web/src/components/ChestReveal.tsx
+++ b/web/src/components/ChestReveal.tsx
@@ -12,24 +12,26 @@ export interface RevealTier {
   nameEn: string;
   colorHex: string;
   modelGlbPath: string;
   modelUsdzPath: string;
 }
 
 export default function ChestReveal({
   tier,
   loot,
   onClose,
+  notice,
 }: {
   tier: RevealTier;
   loot: RevealLoot[];
   onClose: () => void;
+  notice?: React.ReactNode;
 }) {
   const { t } = useLang();
   const [opened, setOpened] = useState(false);
 
   return (
     <div className="chest-overlay">
       <button
         onClick={onClose}
         aria-label="close"
         className="absolute right-4 top-4 rounded-full border border-paper/30 p-2 text-paper/80 hover:text-paper"
@@ -44,13 +46,14 @@ export default function ChestReveal({
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
+      {notice}
     </div>
   );
 }
diff --git a/web/src/components/StationFlow.tsx b/web/src/components/StationFlow.tsx
index e79b44b..eb10cf5 100644
--- a/web/src/components/StationFlow.tsx
+++ b/web/src/components/StationFlow.tsx
@@ -12,21 +12,21 @@ import {
   QrCode,
   Trophy,
   XCircle,
 } from "lucide-react";
 import { useLang } from "@/lib/i18n";
 import { fetchState } from "@/lib/client";
 import type { StateDTO } from "@/lib/state";
 import ChestReveal, { type RevealTier } from "@/components/ChestReveal";
 import type { RevealLoot } from "@/components/RewardCard";
 
-type Mode = "choose" | "gps" | "qr" | "photo";
+type Mode = "gps" | "qr" | "photo";
 
 const PHOTO_MAX_EDGE = 1600;
 
 async function downscalePhoto(file: File): Promise<File> {
   if (typeof createImageBitmap !== "function") return file;
   try {
     const bitmap = await createImageBitmap(file);
     const scale = Math.min(
       1,
       PHOTO_MAX_EDGE / Math.max(bitmap.width, bitmap.height)
@@ -68,21 +68,21 @@ export default function StationFlow({
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
-  const [mode, setMode] = useState<Mode>("choose");
+  const [mode, setMode] = useState<Mode>("photo");
   const [busy, setBusy] = useState(false);
   const [checkinMsg, setCheckinMsg] = useState<string | null>(null);
   const [result, setResult] = useState<SolveResult | null>(null);
   const [choice, setChoice] = useState<number>(-1);
   const [revealedHint, setRevealedHint] = useState<{
     vi: string;
     en: string;
   } | null>(null);
   const [queue, setQueue] = useState<
     { grantId: number; tier: RevealTier | null; loot: RevealLoot[] }[]
@@ -447,21 +447,21 @@ function CheckinSection({
   busy: boolean;
   token: string | null;
   rejectedNote?: string;
   onGps: () => void;
   onQr: () => void;
   onPhoto: (f: File) => void;
   onTabChange: () => void;
 }) {
   const { t } = useLang();
 
-  const tabs: { id: Exclude<Mode, "choose">; label: string }[] = [
+  const tabs: { id: Mode; label: string }[] = [
     { id: "gps", label: t("checkin.gps") },
     { id: "qr", label: t("checkin.qr") },
     { id: "photo", label: t("checkin.photo") },
   ];
 
   return (
     <section className="mt-4">
       <h2 className="font-display mt-2 text-xl font-black text-ink-strong">
         {t("checkin.title")}
       </h2>
@@ -565,45 +565,74 @@ function SuccessPanel({
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
+  const [confirmingHint, setConfirmingHint] = useState(false);
   const hint = hintText ? (lang === "vi" ? hintText.vi : hintText.en) : null;
 
+  useEffect(() => {
+    setConfirmingHint(false);
+  }, [nextSlug, treasure]);
+
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
+      ) : confirmingHint ? (
+        <div className="mt-4 rounded-xl bg-cream px-4 py-3 ring-1 ring-line">
+          <p className="text-sm font-medium leading-snug text-ink">
+            {t("hint.confirm_title")}
+          </p>
+          <div className="mt-2.5 flex gap-2">
+            <button
+              onClick={() => {
+                setConfirmingHint(false);
+                onReveal();
+              }}
+              disabled={busy}
+              className="flex-1 rounded-lg bg-ink-strong py-2 text-sm font-semibold text-paper transition-colors hover:bg-ink disabled:opacity-50"
+            >
+              {t("hint.confirm_yes")}
+            </button>
+            <button
+              onClick={() => setConfirmingHint(false)}
+              className="flex-1 rounded-lg border border-line bg-cream py-2 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
+            >
+              {t("hint.confirm_no")}
+            </button>
+          </div>
+        </div>
       ) : (
         <button
-          onClick={onReveal}
+          onClick={() => setConfirmingHint(true)}
           disabled={busy}
           className="mt-4 w-full rounded-xl border border-jade bg-cream py-3 text-sm font-semibold text-jade-deep hover:bg-jade-soft/60 disabled:opacity-50"
         >
           {t("hint.show")}
         </button>
       )}
 
       {treasure ? (
         <Link
           href="/treasure"
