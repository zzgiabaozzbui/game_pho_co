import Database from "better-sqlite3";

const BASE = process.env.BASE ?? "http://localhost:3000";
const db = new Database("dev.db");
let failures = 0;

function check(name, cond, extra = "") {
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra ? ` | ${extra}` : ""}`);
  if (!cond) failures++;
}

async function post(pathname, body) {
  const res = await fetch(BASE + pathname, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json().catch(() => null) };
}

const session = await post("/api/session", {});
const pid = session.data.playerId;
check("C0 tạo player", !!pid);

const st = db.prepare("SELECT id, correctIndex FROM Station WHERE slug = ?").get("hang-bac");
db.prepare(
  "INSERT INTO CheckIn (playerId, stationId, method, status, createdAt) VALUES (?,?,?,?, datetime('now'))"
).run(pid, st.id, "GPS", "APPROVED");

const ans = await post("/api/answer", { action: "answer", playerId: pid, slug: "hang-bac", choice: st.correctIndex });
check("C1 giải đúng có newChests >= 1", ans.data.correct === true && ans.data.newChests >= 1, JSON.stringify(ans.data));

let list = await (await fetch(`${BASE}/api/chests?playerId=${pid}`)).json();
const stationGrant = list.unopened.find((g) => g.source === "STATION" && g.sourceRef === "hang-bac");
check("C2 unopened có STATION/hang-bac", !!stationGrant);
check("C3 snapshot đúng scope", Array.isArray(stationGrant.loot) && stationGrant.loot.some((l) => l.type === "POINTS"), JSON.stringify(stationGrant?.loot));
check("C4 không có field nội bộ id/scopeKey trong loot", stationGrant.loot.every((l) => !("id" in l) && !("scopeKey" in l)));

const before = db.prepare("SELECT score FROM Player WHERE id = ?").get(pid).score;
const [o1, o2] = await Promise.all([
  post("/api/chests", { playerId: pid, grantId: stationGrant.grantId }),
  post("/api/chests", { playerId: pid, grantId: stationGrant.grantId }),
]);
const fresh = o1.data.alreadyOpened !== undefined ? [o1, o2] : [o2, o1];
check("C5 double-open: đúng 1 lần thật", fresh.filter((r) => r.data.alreadyOpened === false).length === 1);
const after = db.prepare("SELECT score FROM Player WHERE id = ?").get(pid).score;
const expectedPoints = stationGrant.loot.filter((l) => l.type === "POINTS").reduce((s, l) => s + (l.pointsAmount ?? 0), 0);
check("C6 điểm cộng ĐÚNG một lần (+40)", after - before === expectedPoints, `delta=${after - before} expected=${expectedPoints}`);

const spot = db.prepare("SELECT token FROM PartnerSpot LIMIT 1").get();
const badClaim = await post("/api/chests/claim-partner", { playerId: pid, token: "sai-token-vo-huong-16" });
check("C7 token sai -> 404", badClaim.status === 404);
const claim = await post("/api/chests/claim-partner", { playerId: pid, token: spot.token });
check("C8 claim đúng -> ok", claim.status === 200 && claim.data.ok === true);
const reClaim = await post("/api/chests/claim-partner", { playerId: pid, token: spot.token });
check("C9 claim lại -> alreadyClaimed", reClaim.data.alreadyClaimed === true);
const partnerCount = db.prepare("SELECT COUNT(*) n FROM ChestGrant WHERE playerId = ? AND source = 'PARTNER'").get(pid).n;
check("C10 DB chỉ 1 grant PARTNER", partnerCount === 1);

list = await (await fetch(`${BASE}/api/chests?playerId=${pid}`)).json();
const pg = list.unopened.concat(list.collection).find((g) => g.source === "PARTNER");
check("C11 GET chests redact sourceRef PARTNER", pg && pg.sourceRef === null);

const stationCount = db.prepare("SELECT COUNT(*) n FROM ChestGrant WHERE playerId = ? AND source = 'STATION'").get(pid).n;
check("C12 STATION grant vẫn đúng 1 sau các thao tác", stationCount === 1);

// cleanup
db.prepare("DELETE FROM ChestGrant WHERE playerId = ?").run(pid);
db.prepare("DELETE FROM Answer WHERE playerId = ?").run(pid);
db.prepare("DELETE FROM CheckIn WHERE playerId = ?").run(pid);
db.prepare("DELETE FROM Player WHERE id = ?").run(pid);

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
