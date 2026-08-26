// E2E hành trình DU KHÁCH — chạy: $env:BASE="http://localhost:3000"; node scripts/e2e-du-khach.mjs (trong web/)
// Bám pattern e2e-chests.mjs; bổ sung góc nhìn người chơi: trang, assets 3D M2, i18n, hành trình 36 trạm -> FINAL.
import Database from "better-sqlite3";
import { readFileSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3000";
const db = new Database("dev.db");
let failures = 0;
const pass = (name, cond, extra = "") => {
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra ? ` | ${extra}` : ""}`);
  if (!cond) failures++;
};

async function post(pathname, body) {
  const res = await fetch(BASE + pathname, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json().catch(() => null) };
}

async function answer(pid, slug, choice) {
  // tôn trọng rate-limit: retry khi 429 theo Retry-After
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await post("/api/answer", { action: "answer", playerId: pid, slug, choice });
    if (r.status === 429) {
      const wait = Number(r.data?.retryAfterSec ?? 2);
      await new Promise((res) => setTimeout(res, wait * 1000));
      continue;
    }
    return r;
  }
  return { status: 429, data: null };
}

console.log("=== S1. Trang du khách tải được ===");
for (const path of ["/", "/play", "/treasure", "/station/hang-bac"]) {
  try {
    const res = await fetch(BASE + path);
    pass(`trang ${path} -> 200`, res.status === 200, `status=${res.status}`);
  } catch (e) {
    pass(`trang ${path} -> 200`, false, String(e));
  }
}

console.log("=== S2. Assets 3D M2 phục vụ qua HTTP ===");
for (const tier of ["common", "gold", "epic", "grand"]) {
  for (const ext of ["glb", "usdz"]) {
    try {
      const res = await fetch(`${BASE}/models/chest-${tier}.${ext}`);
      const buf = await res.arrayBuffer();
      pass(`model ${tier}.${ext} -> 200`, res.status === 200 && buf.byteLength > 500, `${buf.byteLength}B`);
    } catch (e) {
      pass(`model ${tier}.${ext} -> 200`, false, String(e));
    }
  }
}
for (const p of ["/manifest.webmanifest", "/sw.js"]) {
  const res = await fetch(BASE + p).catch(() => null);
  pass(`PWA ${p} -> 200`, !!res && res.status === 200);
}

console.log("=== S3. i18n vi/en đủ keys ar.* (M2) ===");
const dict = readFileSync("src/lib/dictionaries.ts", "utf8");
for (const key of ["ar.view_in_space", "ar.quick_look", "ar.loading_model", "ar.place_hint", "ar.tap_chest_ar", "ar.exit_ar"]) {
  const count = dict.split(`"${key}"`).length - 1;
  pass(`key ${key} xuat hien >= 2 lan (VI+EN)`, count >= 2, `count=${count}`);
}

console.log("=== S4. Du khách bắt đầu hành trình ===");
const session = await post("/api/session", {});
const pid = session.data?.playerId;
pass("tạo player", !!pid);

const stations = db.prepare("SELECT id, slug, correctIndex FROM Station ORDER BY id").all();
pass("DB có 36 trạm active", stations.length === 36, `n=${stations.length}`);

console.log("=== S5. Trạm đầu: check-in -> giải đúng -> rương ===");
const first = stations[0];
db.prepare(
  "INSERT INTO CheckIn (playerId, stationId, method, status, createdAt) VALUES (?,?,?,?, datetime('now'))"
).run(pid, first.id, "GPS", "APPROVED");
const ans1 = await answer(pid, first.slug, first.correctIndex);
pass("giải đúng trạm 1", ans1.data?.correct === true, JSON.stringify(ans1.data));
pass("newChests >= 1 (ít nhất STATION)", (ans1.data?.newChests ?? 0) >= 1, `newChests=${ans1.data?.newChests}`);

let list = await (await fetch(`${BASE}/api/chests?playerId=${pid}`)).json();
const sg = list.unopened.find((g) => g.source === "STATION" && g.sourceRef === first.slug);
pass("unopened có grant STATION", !!sg);
pass("tier có model paths M2", /^\/models\/chest-[a-z]+\.glb$/.test(sg?.tier?.modelGlbPath ?? "") && /^\/models\/chest-[a-z]+\.usdz$/.test(sg?.tier?.modelUsdzPath ?? ""), JSON.stringify(sg?.tier));
pass("unopenedCount khớp mảng", list.unopenedCount === list.unopened.length);

console.log("=== S6. Mở rương: CAS chống double-open ===");
const before = db.prepare("SELECT score FROM Player WHERE id = ?").get(pid).score;
const [o1, o2] = await Promise.all([
  post("/api/chests", { playerId: pid, grantId: sg.grantId }),
  post("/api/chests", { playerId: pid, grantId: sg.grantId }),
]);
const real = o1.data?.alreadyOpened === false ? o1 : o2;
pass("đúng 1 response là lần mở thật", [o1, o2].filter((r) => r.data?.alreadyOpened === false).length === 1);
pass("lần mở thật trả loot + tier", Array.isArray(real.data?.loot) && !!real.data?.tier?.key);
const afterOpen = db.prepare("SELECT score FROM Player WHERE id = ?").get(pid).score;
const expectedPoints = sg.loot.filter((l) => l.type === "POINTS").reduce((s, l) => s + (l.pointsAmount ?? 0), 0);
pass("điểm cộng ĐÚNG 1 lần", afterOpen - before === expectedPoints, `delta=${afterOpen - before} expected=${expectedPoints}`);

console.log("=== S7. Hành trình 36/36 -> thành tích + FINAL ===");
let dropWon = 0;
for (const st of stations.slice(1)) {
  db.prepare(
    "INSERT INTO CheckIn (playerId, stationId, method, status, createdAt) VALUES (?,?,?,?, datetime('now'))"
  ).run(pid, st.id, "GPS", "APPROVED");
  const r = await answer(pid, st.slug, st.correctIndex);
  if (r.data?.correct !== true) pass(`giải đúng ${st.slug}`, false, JSON.stringify(r.data));
  dropWon += Math.max(0, r.data?.newChests ?? 0) > 0 ? 1 : 0;
  await new Promise((res) => setTimeout(res, 120)); // tránh rate-limit
}
pass("giải đúng cả 35 trạm còn lại", true);

list = await (await fetch(`${BASE}/api/chests?playerId=${pid}`)).json();
const allGrants = list.unopened.concat(list.collection);
const achKeys = new Set(allGrants.filter((g) => g.source === "ACHIEVEMENT").map((g) => g.sourceRef));
pass("thành tích stations_6", achKeys.has("stations_6"));
pass("thành tích stations_18", achKeys.has("stations_18"));
pass("thành tích perfect_5 (giải đúng ngay lần đầu liên tục)", achKeys.has("perfect_5"), `ach=[${[...achKeys]}]`);
pass("có DROP grant khi roll trúng (info, không assert cứng)", true, `answers có newChests>0: ${dropWon}/35`);

const finalGrant = allGrants.find((g) => g.source === "FINAL");
pass("grant FINAL tồn tại sau 36/36", !!finalGrant);
pass("FINAL là tier grand", finalGrant?.tier?.key === "grand");

const beforeFinal = db.prepare("SELECT score FROM Player WHERE id = ?").get(pid).score;
const fo = await post("/api/chests", { playerId: pid, grantId: finalGrant.grantId });
const finalPts = (fo.data?.loot ?? []).filter((l) => l.type === "POINTS").reduce((s, l) => s + (l.pointsAmount ?? 0), 0);
const afterFinal = db.prepare("SELECT score FROM Player WHERE id = ?").get(pid).score;
pass("mở FINAL ok + cộng điểm loot final", fo.status === 200 && afterFinal - beforeFinal === finalPts && finalPts > 0, `delta=${afterFinal - beforeFinal}`);
const fReopen = await post("/api/chests", { playerId: pid, grantId: finalGrant.grantId });
pass("mở lại FINAL -> alreadyOpened", fReopen.data?.alreadyOpened === true);

console.log("=== S8. Điểm đối tác (workshop) ===");
const spot = db.prepare("SELECT token FROM PartnerSpot LIMIT 1").get();
const badClaim = await post("/api/chests/claim-partner", { playerId: pid, token: "sai-token-vo-huong-16" });
pass("token sai -> 404", badClaim.status === 404);
const claim = await post("/api/chests/claim-partner", { playerId: pid, token: spot.token });
pass("claim đúng -> ok:true", claim.status === 200 && claim.data?.ok === true);
const reClaim = await post("/api/chests/claim-partner", { playerId: pid, token: spot.token });
pass("claim lại -> alreadyClaimed", reClaim.data?.alreadyClaimed === true);
const pGrant = await (await fetch(`${BASE}/api/chests?playerId=${pid}`)).json();
const pg = pGrant.unopened.concat(pGrant.collection).find((g) => g.source === "PARTNER");
pass("PARTNER trong bộ sưu tập + redact sourceRef", !!pg && pg.sourceRef === null);

console.log("=== S10. Đối tác M3 (marker MindAR) ===");
try {
  const pcfgRes = await fetch(`${BASE}/api/partner/config`);
  const pcfg = await pcfgRes.json().catch(() => null);
  pass(
    "/api/partner/config -> 200 {key, mindTargetPath}",
    pcfgRes.status === 200 && pcfg?.key === "workshop" && pcfg?.mindTargetPath === "/markers/workshop.mind",
    JSON.stringify(pcfg)
  );
  pass("config KHÔNG lộ token", !!pcfg && !("token" in pcfg), `keys=[${Object.keys(pcfg ?? {})}]`);
} catch (e) {
  pass("/api/partner/config -> 200 {key, mindTargetPath}", false, String(e));
}
try {
  const pPage = await fetch(`${BASE}/partner`);
  pass("trang /partner -> 200", pPage.status === 200, `status=${pPage.status}`);
} catch (e) {
  pass("trang /partner -> 200", false, String(e));
}
try {
  const lib = await fetch(`${BASE}/vendor/mindar/mindar-image-three.prod.js`);
  const buf = await lib.arrayBuffer();
  pass("mindar-image-three.prod.js -> 200 (>500KB)", lib.status === 200 && buf.byteLength > 500000, `${buf.byteLength}B`);
} catch (e) {
  pass("mindar-image-three.prod.js -> 200 (>500KB)", false, String(e));
}

console.log("=== S9. Dọn dữ liệu du khách thử nghiệm (chạy cuối) ===");
const del = db.prepare("DELETE FROM ChestGrant WHERE playerId = ?").run(pid);
db.prepare("DELETE FROM Answer WHERE playerId = ?").run(pid);
db.prepare("DELETE FROM CheckIn WHERE playerId = ?").run(pid);
db.prepare("DELETE FROM Player WHERE id = ?").run(pid);
console.log(`cleanup: ${del.changes} grants + answers/checkins/player đã xóa (pid=${pid})`);

console.log(failures === 0 ? "\nALL PASS — hành trình du khách OK" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
