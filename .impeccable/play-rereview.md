diff --git a/web/src/components/StationFlow.tsx b/web/src/components/StationFlow.tsx
index eb10cf5..6ebba36 100644
--- a/web/src/components/StationFlow.tsx
+++ b/web/src/components/StationFlow.tsx
@@ -70,37 +70,41 @@ export default function StationFlow({
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
+  const [openPhase, setOpenPhase] = useState<"idle" | "pending" | "failed">(
+    "idle"
+  );
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
 
   useEffect(() => {
     setChoice(-1);
     setResult(null);
     setRevealedHint(null);
     setCheckinMsg(null);
     setQueue([]);
+    setOpenPhase("idle");
   }, [slug]);
 
   const load = useCallback(async () => {
     try {
       const s = (await fetchState()) as StateDTO;
       setState(s);
       setErrorState(
         s.stations.some((x) => x.slug === slug) ? "none" : "not_found"
       );
     } catch {
@@ -261,20 +265,21 @@ export default function StationFlow({
           const data2 = await res2.json() as { unopened?: typeof queue };
           setQueue(data2.unopened ?? []);
         }
       }
     } finally {
       setBusy(false);
     }
   }
 
   async function revealHint() {
+    if (busy) return;
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
@@ -282,20 +287,37 @@ export default function StationFlow({
       const data = await res.json();
       if (res.ok && data.hint) {
         setRevealedHint(data.hint);
       }
       await load();
     } finally {
       setBusy(false);
     }
   }
 
+  async function confirmChestOpen(grantId: number) {
+    setOpenPhase("pending");
+    try {
+      const res = await fetch("/api/chests", {
+        method: "POST",
+        headers: { "Content-Type": "application/json" },
+        body: JSON.stringify({ playerId: state!.playerId, grantId }),
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
   const solved = station.status === "completed";
   const checkedIn = solved || station.status === "checked_in";
   const nextSlug =
     state.stations.find((s) => s.orderIndex === station.orderIndex + 1)?.slug ??
     null;
 
   return (
     <Shell title={name}>
       <div className="px-5 py-4">
         <div className="text-xs font-semibold uppercase tracking-wide text-clay-deep">
@@ -406,30 +428,39 @@ export default function StationFlow({
               {t("score.label")}: {state.score}
             </p>
           </>
         )}
       </div>
 
       {queue.length > 0 && queue[0].tier && (
         <ChestReveal
           tier={queue[0].tier}
           loot={queue[0].loot}
-          onClose={async () => {
-            const current = queue[0];
-            setQueue((q) => q.slice(1));
-            await fetch("/api/chests", {
-              method: "POST",
-              headers: { "Content-Type": "application/json" },
-              body: JSON.stringify({ playerId: state!.playerId, grantId: current.grantId }),
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
     </Shell>
   );
 }
 
 function CheckinSection({
   mode,
   setMode,
   msg,
