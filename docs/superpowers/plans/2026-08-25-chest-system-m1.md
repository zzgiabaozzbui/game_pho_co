# Hệ thống Hòm thưởng M1 Implementation Plan

> **TRẠNG THÁI: ✅ SHIPPED 2026-08-26** — 14/14 task hoàn tất, checkpoint cuối xanh (`lint` + `typecheck` + `test` 38/38, E2E API Task 14 ALL PASS). Plan giữ vai trò hồ sơ; M2 nằm ở `2026-08-26-chest-system-m2.md`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Engine rơi rương nhiều cấp (cố định/DROP có pity/thành tích/FINAL) + API + admin + UI mở rương 2D, hoàn chỉnh KHÔNG dùng three.js.

**Architecture:** Pure engine trong `src/lib/chests.ts` (injectable RNG, unit-test được) → service DB `src/lib/chest-grants.ts` (grant idempotent qua unique + P2002, loot snapshot lúc grant) → 3 route người chơi + route admin → UI `ChestReveal` 2D gắn vào StationFlow/Treasure/Play.

**Tech Stack:** Next.js 16 App Router · Prisma 7 (SQLite dev, kiểu portable) · zod validators hiện có · Tailwind v4 · vitest.

**Spec:** `docs/superpowers/specs/2026-08-25-ar-treasure-chest-design.md`

## Global Constraints

- Schema Prisma CHỈ dùng kiểu portable (String/Int/Float/Boolean/DateTime) — không Json, quan hệ khai dạng scalar id (Int?) không tạo relation attribute.
- Cấm chuỗi cứng tiếng Việt trong JSX người chơi — mọi chuỗi mới phải thêm cả VI + EN vào `src/lib/dictionaries.ts`.
- Không import ba/three.js ở bất kỳ file nào của M1 (kiểm bằng `grep -r "three" web/src` cuối phiên).
- POST mới phải đi qua `rateLimit()` từ `src/lib/rate-limit.ts`.
- PrismaClient bắt buộc truyền driver adapter (xem `src/lib/db.ts` — đã có, tái dùng).
- Máy Windows/PS 5.1: decode JSON UTF-8 sai khi test API bằng Invoke-RestMethod → mọi xác thực HTTP dùng script Node (fetch).
- KHÔNG phải git repo: thay bước commit bằng CHECKPOINT = `npm run lint && npm run typecheck && npm run test` xanh trong `web/`.
- Mật khẩu/tokens không bao giờ log. `DATABASE_URL="file:./dev.db"` resolve theo cwd `web/`.
- Lệnh test 1 file: `npx vitest run src/lib/<file>.test.ts` (trong `web/`).

---

### Task 1: Schema Prisma + regenerate

**Files:**
- Modify: `web/prisma/schema.prisma` (append models; thêm cột vào Player/Station)

**Interfaces:**
- Produces: bảng `ChestTier`, `ChestLoot`, `ChestGrant`, `PartnerSpot`, `DropRule`; cột `Player.chestPityCount Int @default(0)`; cột `Station.chestTierId Int?`. Các task sau truy vấn đúng tên field này.

- [x] **Step 1: Append schema**

Thêm vào cuối `schema.prisma` (giữ nguyên phần còn lại):

```prisma
// ===== Hòm thưởng (spec 2026-08-25-ar-treasure-chest-design.md) =====

model ChestTier {
  id            Int    @id @default(autoincrement())
  key           String @unique // common | gold | epic | grand
  nameVi        String
  nameEn        String
  colorHex      String
  modelGlbPath  String @default("")
  modelUsdzPath String @default("")
  sortOrder     Int    @default(0)
}

model ChestLoot {
  id           Int    @id @default(autoincrement())
  scopeKey     String // vd: station:hang-bac | achievement:stations_6 | final | partner
  type         String // POINTS | STORY | IMAGE | VIDEO
  pointsAmount Int?
  storyVi      String?
  storyEn      String?
  imagePath    String?
  youtubeUrl   String?
  sortOrder    Int    @default(0)

  @@index([scopeKey])
}

model ChestGrant {
  id               Int       @id @default(autoincrement())
  playerId         String
  source           String // STATION | DROP | ACHIEVEMENT | FINAL | PARTNER
  sourceRef        String
  tierId           Int
  lootSnapshotJson String
  createdAt        DateTime  @default(now())
  openedAt         DateTime?

  @@unique([playerId, source, sourceRef])
  @@index([playerId, openedAt])
}

model PartnerSpot {
  id    Int    @id @default(autoincrement())
  key   String @unique
  token String @unique
}

model DropRule {
  id        Int    @id @default(autoincrement())
  chancePct Int
  tierKey   String
  weight    Int
}
```

Sửa model `Player` thêm 1 dòng vào danh sách field: `chestPityCount Int @default(0)`.
Sửa model `Station` thêm: `chestTierId Int?`.

- [x] **Step 2: Push + generate**

Run (workdir `web`): `npx prisma db push` rồi `npx prisma generate`
Expected: "Your database is now in sync", generate thành công không lỗi type.

- [x] **Step 3: CHECKPOINT**

Run: `npm run typecheck`
Expected: PASS (schema mới chưa ai dùng, không break gì).

### Task 2: Seed dữ liệu mặc định

**Files:**
- Modify: `web/prisma/seed.ts` (append khối seed mới, làm theo pattern upsert sẵn có của file)

**Interfaces:**
- Consumes: models Task 1.
- Produces: 4 dòng `ChestTier` (common/gold/epic/grand), 1 cấu hình `DropRule` (chancePct 30; weights common 70 / gold 25 / epic 5), `PartnerSpot{key:"workshop", token:<random 32 hex>}`, loot mẫu cho scope `final`, `partner`, `achievement:*`, `station:hang-bac`; cả 36 Station có `chestTierId` = id tier common.

- [x] **Step 1: Append seed**

Cuối `seed.ts` thêm (dùng cùng client/prisma mà file đang export):

```ts
const tiers = [
  { key: "common", nameVi: "Rương Thường", nameEn: "Common Chest", colorHex: "#c07a2d", sortOrder: 1 },
  { key: "gold", nameVi: "Rương Vàng", nameEn: "Gold Chest", colorHex: "#c9962b", sortOrder: 2 },
  { key: "epic", nameVi: "Rương Huyền Bí", nameEn: "Epic Chest", colorHex: "#8f1d1d", sortOrder: 3 },
  { key: "grand", nameVi: "Kho Báu Văn Hóa", nameEn: "Grand Treasure", colorHex: "#3f6c51", sortOrder: 4 },
];
const tierIds: Record<string, number> = {};
for (const t of tiers) {
  const row = await prisma.chestTier.upsert({
    where: { key: t.key },
    update: { nameVi: t.nameVi, nameEn: t.nameEn, colorHex: t.colorHex, sortOrder: t.sortOrder },
    create: t,
  });
  tierIds[t.key] = row.id;
}

await prisma.dropRule.deleteMany();
await prisma.dropRule.createMany({
  data: [
    { chancePct: 30, tierKey: "common", weight: 70 },
    { chancePct: 30, tierKey: "gold", weight: 25 },
    { chancePct: 30, tierKey: "epic", weight: 5 },
  ],
});

const partnerToken = randomBytes(24).toString("hex");
await prisma.partnerSpot.upsert({
  where: { key: "workshop" },
  update: {},
  create: { key: "workshop", token: partnerToken },
});
console.log("PartnerSpot token (lưu lại):", partnerToken);

const loots: Array<{
  scopeKey: string; type: string; pointsAmount?: number;
  storyVi?: string; storyEn?: string; youtubeUrl?: string; sortOrder: number;
}> = [
  { scopeKey: "final", type: "POINTS", pointsAmount: 300, sortOrder: 1 },
  { scopeKey: "final", type: "STORY", storyVi: "Bạn đã mở kho báu văn hóa Phố cổ Hà Nội!", storyEn: "You have unlocked the Old Quarter cultural treasure!", sortOrder: 2 },
  { scopeKey: "final", type: "VIDEO", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", sortOrder: 3 },
  { scopeKey: "partner", type: "POINTS", pointsAmount: 150, sortOrder: 1 },
  { scopeKey: "partner", type: "STORY", storyVi: "Quà riêng từ workshop đối tác.", storyEn: "A gift from our partner workshop.", sortOrder: 2 },
  { scopeKey: "achievement:stations_6", type: "POINTS", pointsAmount: 50, sortOrder: 1 },
  { scopeKey: "achievement:stations_6", type: "STORY", storyVi: "Đã khám phá 6 phố phường!", storyEn: "Six streets explored!", sortOrder: 2 },
  { scopeKey: "achievement:stations_18", type: "POINTS", pointsAmount: 100, sortOrder: 1 },
  { scopeKey: "achievement:stations_18", type: "STORY", storyVi: "Nửa chặng đường Phố cổ!", storyEn: "Halfway through the Old Quarter!", sortOrder: 2 },
  { scopeKey: "achievement:perfect_5", type: "POINTS", pointsAmount: 80, sortOrder: 1 },
  { scopeKey: "achievement:perfect_5", type: "STORY", storyVi: "5 trạm liền giải đúng ngay lần đầu!", storyEn: "Five stations solved on the first try!", sortOrder: 2 },
  { scopeKey: "achievement:score_2000", type: "POINTS", pointsAmount: 120, sortOrder: 1 },
  { scopeKey: "achievement:score_2000", type: "STORY", storyVi: "Nhà thám hiểm điểm cao!", storyEn: "High-scoring explorer!", sortOrder: 2 },
  { scopeKey: "station:hang-bac", type: "POINTS", pointsAmount: 40, sortOrder: 1 },
  { scopeKey: "station:hang-bac", type: "STORY", storyVi: "Kỷ niệm phố Hàng Bạc.", storyEn: "A memory of Silver Street.", sortOrder: 2 },
];
for (const l of loots) {
  await prisma.chestLoot.create({ data: l });
}

await prisma.station.updateMany({ data: { chestTierId: tierIds["common"] } });
```

Nếu `seed.ts` chưa import `randomBytes`: thêm `import { randomBytes } from "crypto";`.

- [x] **Step 2: Chạy seed**

Run: `npm run db:seed`
Expected: thành công, log ra token PartnerSpot (copy lại vào `.env` mới: `PARTNER_TOKEN=<token>` để E2E dùng; KHÔNG commit giá trị nào cả vì không có git).

- [x] **Step 3: Xác nhận dữ liệu**

Run: `node -e "const D=require('better-sqlite3');const db=new D('dev.db');console.log(db.prepare('SELECT COUNT(*) n FROM ChestTier').get(), db.prepare('SELECT COUNT(*) n FROM ChestLoot').get(), db.prepare('SELECT COUNT(*) n FROM Station WHERE chestTierId IS NOT NULL').get())"`
Expected: `{n:4} {n:15} {n:36}`.

### Task 3: Pure engine `src/lib/chests.ts` (TDD)

**Files:**
- Create: `web/src/lib/chests.ts`
- Test: `web/src/lib/chests.test.ts`

**Interfaces:**
- Produces (task 4+ dùng đúng chữ ký):
```ts
export const PITY_THRESHOLD: number = 10;
export interface DropRollResult { won: boolean; tierKey: string | null }
export function rollDrop(chancePct: number, weights: Record<string, number>, pityCount: number, rand?: () => number): DropRollResult
export function nextPityCount(current: number, tierKey: string | null): number
export interface PlayerStats { solvedCount: number; perfectStreak: number; score: number }
export const ACHIEVEMENT_RULES: ReadonlyArray<{ key: string; tierKey: string; minSolved?: number; minPerfectStreak?: number; minScore?: number }>
export function evaluateAchievements(stats: PlayerStats): string[]
export interface LootRow { type: string; pointsAmount?: number | null; storyVi?: string | null; storyEn?: string | null; imagePath?: string | null; youtubeUrl?: string | null; sortOrder?: number | null }
export function snapshotLoot(rows: LootRow[]): string
export function totalPointsFromSnapshot(snapshotJson: string): number
```

- [x] **Step 1: Viết test thất bại trước**

`web/src/lib/chests.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  evaluateAchievements,
  nextPityCount,
  rollDrop,
  snapshotLoot,
  totalPointsFromSnapshot,
  PITY_THRESHOLD,
} from "./chests";

describe("rollDrop", () => {
  it("misses entirely when rand below chance boundary", () => {
    const r = rollDrop(30, { common: 70 }, 0, () => 0.29);
    expect(r.won).toBe(false);
    expect(r.tierKey).toBe(null);
  });

  it("wins and picks weighted tier", () => {
    const seq = [0.35, 0.9]; // 0.35 < 0.30? NO -> dùng 0.25 để thắng; chỉnh bên dưới
    const r = rollDrop(30, { common: 70, gold: 25, epic: 5 }, 0, makeSeq([0.25, 0.98]));
    expect(r.won).toBe(true);
    expect(r.tierKey).toBe("common"); // roll thứ 2 = 0.98 -> nằm đoạn common
  });
});
```

Chuẩn hóa hợp đồng RNG (ghi rõ trong implementation): gọi `rand()` lần 1 quyết định thắng/thua (thắng khi `< chancePct/100`); nếu thắng gọi lần 2 chọn tier theo cumulative weight với keys sort alphabetically. Test helper:

```ts
function makeSeq(values: number[]) {
  let i = 0;
  return () => values[i++ % values.length];
}
```

Các case khác phải có:

```ts
it("forces epic+ when pity reached threshold", () => {
  const r = rollDrop(30, { common: 70, gold: 25, epic: 5 }, PITY_THRESHOLD, makeSeq([0.99, 0.99]));
  expect(r.won).toBe(true);
  expect(r.tierKey).toBe("epic");
});

describe("nextPityCount", () => {
  it("resets on epic or grand win", () => {
    expect(nextPityCount(9, "epic")).toBe(0);
    expect(nextPityCount(9, "grand")).toBe(0);
  });
  it("increments otherwise (win low tier or miss)", () => {
    expect(nextPityCount(3, "gold")).toBe(4);
    expect(nextPityCount(3, null)).toBe(4);
  });
});

describe("evaluateAchievements", () => {
  it("returns crossed thresholds only", () => {
    expect(evaluateAchievements({ solvedCount: 0, perfectStreak: 0, score: 0 })).toEqual([]);
    expect(evaluateAchievements({ solvedCount: 7, perfectStreak: 0, score: 0 })).toEqual(["stations_6"]);
    expect(
      evaluateAchievements({ solvedCount: 20, perfectStreak: 5, score: 2500 }).sort()
    ).toEqual(["perfect_5", "score_2000", "stations_18", "stations_6"].sort());
  });
});

describe("snapshotLoot / totalPointsFromSnapshot", () => {
  it("round-trips and sums POINTS", () => {
    const snap = snapshotLoot([
      { type: "STORY", storyVi: "a", sortOrder: 2 },
      { type: "POINTS", pointsAmount: 40, sortOrder: 1 },
    ]);
    expect(totalPointsFromSnapshot(snap)).toBe(40);
    expect(JSON.parse(snap)[0].type).toBe("POINTS"); // sort theo sortOrder
  });
});
```

(Lưu ý: xóa hằng `seq` không dùng ở test mẫu trên — giữ file sạch lint `--max-warnings=0`.)

- [x] **Step 2: Chạy test thấy FAIL**

Run: `npx vitest run src/lib/chests.test.ts`
Expected: FAIL "Cannot find module './chests'".

- [x] **Step 3: Implement tối thiểu**

`web/src/lib/chests.ts`:

```ts
export const PITY_THRESHOLD = 10;

export interface DropRollResult {
  won: boolean;
  tierKey: string | null;
}

function pickWeighted(weights: Record<string, number>, roll: number): string {
  const keys = Object.keys(weights).sort();
  const total = keys.reduce((sum, k) => sum + weights[k], 0) || 1;
  let acc = roll * total;
  for (const k of keys) {
    acc -= weights[k];
    if (acc < 0) return k;
  }
  return keys[keys.length - 1];
}

export function rollDrop(
  chancePct: number,
  weights: Record<string, number>,
  pityCount: number,
  rand: () => number = Math.random
): DropRollResult {
  const keys = Object.keys(weights).sort();
  if (keys.length === 0) return { won: false, tierKey: null };
  if (pityCount >= PITY_THRESHOLD) {
    const rarest = keys.filter((k) => k === "epic" || k === "grand").sort().pop();
    return { won: true, tierKey: rarest ?? keys[keys.length - 1] };
  }
  if (rand() >= chancePct / 100) return { won: false, tierKey: null };
  return { won: true, tierKey: pickWeighted(weights, rand()) };
}

export function nextPityCount(current: number, tierKey: string | null): number {
  return tierKey === "epic" || tierKey === "grand" ? 0 : current + 1;
}

export interface PlayerStats {
  solvedCount: number;
  perfectStreak: number;
  score: number;
}

export const ACHIEVEMENT_RULES = [
  { key: "stations_6", tierKey: "common", minSolved: 6 },
  { key: "stations_18", tierKey: "gold", minSolved: 18 },
  { key: "perfect_5", tierKey: "gold", minPerfectStreak: 5 },
  { key: "score_2000", tierKey: "epic", minScore: 2000 },
] as const;

export function evaluateAchievements(stats: PlayerStats): string[] {
  return ACHIEVEMENT_RULES.filter(
    (r) =>
      (r.minSolved === undefined || stats.solvedCount >= r.minSolved) &&
      (r.minPerfectStreak === undefined ||
        stats.perfectStreak >= r.minPerfectStreak) &&
      (r.minScore === undefined || stats.score >= r.minScore)
  ).map((r) => r.key);
}

export interface LootRow {
  type: string;
  pointsAmount?: number | null;
  storyVi?: string | null;
  storyEn?: string | null;
  imagePath?: string | null;
  youtubeUrl?: string | null;
  sortOrder?: number | null;
}

export function snapshotLoot(rows: LootRow[]): string {
  const clean = rows
    .map(({ type, pointsAmount, storyVi, storyEn, imagePath, youtubeUrl }) =>
      Object.fromEntries(
        Object.entries({
          type,
          pointsAmount,
          storyVi,
          storyEn,
          imagePath,
          youtubeUrl,
        }).filter(([, v]) => v !== null && v !== undefined)
      )
    )
    .sort((a, b) => Number(a.type === "POINTS") - Number(b.type === "POINTS"));
  void clean;
  const ordered = [...rows].sort(
    (a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99)
  );
  return JSON.stringify(
    ordered.map(({ sortOrder: _s, ...rest }) =>
      Object.fromEntries(Object.entries(rest).filter(([, v]) => v != null))
    )
  );
}

export function totalPointsFromSnapshot(snapshotJson: string): number {
  const rows = JSON.parse(snapshotJson) as LootRow[];
  return rows.reduce(
    (sum, r) => sum + (r.type === "POINTS" ? r.pointsAmount ?? 0 : 0),
    0
  );
}
```

Dọn biến `clean`/`void clean` thừa nếu lint báo (chỉ giữ logic `ordered`). Ưu tiên bản sạch:

```ts
export function snapshotLoot(rows: LootRow[]): string {
  const ordered = [...rows].sort(
    (a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99)
  );
  return JSON.stringify(
    ordered.map(({ sortOrder: _s, ...rest }) =>
      Object.fromEntries(Object.entries(rest).filter(([, v]) => v != null))
    )
  );
}
```

- [x] **Step 4: Chạy test PASS**

Run: `npx vitest run src/lib/chests.test.ts`
Expected: PASS toàn bộ.

- [x] **Step 5: CHECKPOINT**

`npm run lint && npm run typecheck && npm run test` — PASS.

### Task 4: Service DB `src/lib/chest-grants.ts`

**Files:**
- Create: `web/src/lib/chest-grants.ts`

**Interfaces:**
- Consumes: `db` từ `./db`; engine Task 3; `snapshotLoot`, `totalPointsFromSnapshot` không dùng ở đây (snapshot do caller truyền).
- Produces:
```ts
export async function grantOnce(p: {
  playerId: string; source: string; sourceRef: string;
  tierId: number; lootScopeKey: string;
}): Promise<number | null>
// trả grantId mới, hoặc null nếu đã tồn tại (exists-check hoặc P2002); tự snapshot loot theo scope.

export async function grantsForAnswer(p: {
  playerId: string; stationSlug: string;
}): Promise<{ created: number }>
// orchestrator: station cố định + DROP (roll/pity/cập nhật Player.chestPityCount) + ACHIEVEMENT + FINAL.
```

- [x] **Step 1: Implement**

```ts
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import {
  evaluateAchievements,
  nextPityCount,
  rollDrop,
  snapshotLoot,
  type LootRow,
} from "@/lib/chests";

async function grantOnceInner(p: {
  playerId: string;
  source: string;
  sourceRef: string;
  tierId: number;
  lootScopeKey: string;
}): Promise<number | null> {
  const existing = await db.chestGrant.findFirst({
    where: { playerId: p.playerId, source: p.source, sourceRef: p.sourceRef },
    select: { id: true },
  });
  if (existing) return null;

  const lootRows = await db.chestLoot.findMany({
    where: { scopeKey: p.lootScopeKey },
  });
  const lootRowsTyped = lootRows as unknown as LootRow[];

  try {
    const grant = await db.chestGrant.create({
      data: {
        playerId: p.playerId,
        source: p.source,
        sourceRef: p.sourceRef,
        tierId: p.tierId,
        lootSnapshotJson: snapshotLoot(lootRowsTyped),
      },
      select: { id: true },
    });
    return grant.id;
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") return null;
    throw e;
  }
}

export async function grantOnce(p: {
  playerId: string;
  source: string;
  sourceRef: string;
  tierId: number;
  lootScopeKey: string;
}) {
  return grantOnceInner(p);
}

async function tierIdByKey(key: string): Promise<number> {
  const t = await db.chestTier.findUnique({ where: { key }, select: { id: true } });
  if (!t) throw new Error(`missing tier ${key}`);
  return t.id;
}

export async function grantsForAnswer(p: {
  playerId: string;
  stationSlug: string;
}) {
  let created = 0;

  const station = await db.station.findUnique({
    where: { slug: p.stationSlug },
    select: { chestTierId: true },
  });
  if (station?.chestTierId) {
    const g = await grantOnceInner({
      playerId: p.playerId,
      source: "STATION",
      sourceRef: p.stationSlug,
      tierId: station.chestTierId,
      lootScopeKey: `station:${p.stationSlug}`,
    });
    if (g) created++;
  }

  const rules = await db.dropRule.findMany();
  if (rules.length > 0) {
    const chancePct = rules[0].chancePct;
    const weights: Record<string, number> = {};
    for (const r of rules) weights[r.tierKey] = r.weight;
    const player = await db.player.findUniqueOrThrow({
      where: { id: p.playerId },
      select: { chestPityCount: true },
    });
    const roll = rollDrop(chancePct, weights, player.chestPityCount);
    if (roll.won && roll.tierKey) {
      const g = await grantOnceInner({
        playerId: p.playerId,
        source: "DROP",
        sourceRef: `drop:${randomUUID()}`,
        tierId: await tierIdByKey(roll.tierKey),
        lootScopeKey: "drop",
      });
      if (g) created++;
      await db.player.update({
        where: { id: p.playerId },
        data: { chestPityCount: nextPityCount(player.chestPityCount, roll.tierKey) },
      });
    } else {
      await db.player.update({
        where: { id: p.playerId },
        data: { chestPityCount: nextPityCount(player.chestPityCount, null) },
      });
    }
  }

  const [solvedCount, answers] = await Promise.all([
    db.answer.count({ where: { playerId: p.playerId, solved: true } }),
    db.answer.findMany({
      where: { playerId: p.playerId },
      select: { attempts: true, solved: true },
    }),
  ]);
  const player = await db.player.findUniqueOrThrow({
    where: { id: p.playerId },
    select: { score: true },
  });
  const perfectStreak = computePerfectStreak(answers);
  const achieved = evaluateAchievements({
    solvedCount,
    perfectStreak,
    score: player.score,
  });
  for (const key of achieved) {
    const rule = await import("@/lib/chests").then((m) =>
      m.ACHIEVEMENT_RULES.find((r) => r.key === key)!
    );
    const g = await grantOnceInner({
      playerId: p.playerId,
      source: "ACHIEVEMENT",
      sourceRef: key,
      tierId: await tierIdByKey(rule.tierKey),
      lootScopeKey: `achievement:${key}`,
    });
    if (g) created++;
  }

  const totalActive = await db.station.count({ where: { isActive: true } });
  if (solvedCount >= totalActive && totalActive > 0) {
    const g = await grantOnceInner({
      playerId: p.playerId,
      source: "FINAL",
      sourceRef: "final",
      tierId: await tierIdByKey("grand"),
      lootScopeKey: "final",
    });
    if (g) created++;
  }

  return { created };
}

function computePerfectStreak(
  answers: Array<{ attempts: number; solved: boolean }>
): number {
  let best = 0;
  let cur = 0;
  for (const a of answers) {
    if (a.solved && a.attempts === 1) {
      cur += 1;
      best = Math.max(best, cur);
    } else if (a.solved) {
      cur = 0;
    }
  }
  return best;
}
```

Ghi chú thiết kế (đã duyệt trong spec): `computePerfectStreak` đếm chuỗi dài nhất các trạm solved với attempts===1 (thứ tự theo thời gian tạo Answer không lưu — chấp nhận xấp xỉ theo tập hợp, đủ cho luật v1).

- [x] **Step 2: Loot scope `drop`**

Seed Task 2 cần thêm loot cho scope `drop` (sửa Task 2 nếu chưa): `{ scopeKey: "drop", type: "POINTS", pointsAmount: 30, sortOrder: 1 }` và một STORY ngắn. Chạy lại `npm run db:seed` — lưu ý `createMany` loot có thể nhân đôi nếu chạy lại: bọc khối loot bằng `if ((await prisma.chestLoot.count()) === 0)`.

- [x] **Step 3: CHECKPOINT**

`npm run lint && npm run typecheck` — PASS.

### Task 5: Validators + API `/api/chests` (GET)

**Files:**
- Modify: `web/src/lib/validators.ts` (thêm schemas)
- Create: `web/src/app/api/chests/route.ts`

**Interfaces:**
- Produces: `GET /api/chests?playerId=` → `200 {unopened: [{grantId, source, sourceRef, tier:{key,nameVi,nameEn,colorHex}, loot: object[], createdAt}], collection: [{grantId, tier:{...}, loot, openedAt}], unopenedCount}`; 400/404 như state route.

- [x] **Step 1: Thêm validator**

Trong `validators.ts` thêm:

```ts
export const chestOpenSchema = z.object({
  playerId: playerIdSchema,
  grantId: z.number().int().positive(),
});

export const partnerClaimSchema = z.object({
  playerId: playerIdSchema,
  token: z.string().min(16).max(128),
  lat: z.number().optional(),
  lng: z.number().optional(),
});
```

- [x] **Step 2: Route**

`web/src/app/api/chests/route.ts`:

```ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { playerIdSchema } from "@/lib/validators";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const rl = rateLimit(`chests-read:${clientIp(req)}`, { limit: 60, windowMs: 60_000 });
  if (!rl.ok)
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } });

  const url = new URL(req.url);
  const parsed = playerIdSchema.safeParse(url.searchParams.get("playerId"));
  if (!parsed.success)
    return NextResponse.json({ error: "bad player" }, { status: 400 });

  const grants = await db.chestGrant.findMany({
    where: { playerId: parsed.data },
    orderBy: { createdAt: "asc" },
  });
  const tierIds = [...new Set(grants.map((g) => g.tierId))];
  const tiers = await db.chestTier.findMany({ where: { id: { in: tierIds } } });
  const tierById = new Map(tiers.map((t) => [t.id, t]));

  const view = (g: (typeof grants)[number]) => ({
    grantId: g.id,
    source: g.source,
    sourceRef: g.sourceRef,
    tier: tierById.get(g.tierId)
      ? {
          key: tierById.get(g.tierId)!.key,
          nameVi: tierById.get(g.tierId)!.nameVi,
          nameEn: tierById.get(g.tierId)!.nameEn,
          colorHex: tierById.get(g.tierId)!.colorHex,
        }
      : null,
    loot: JSON.parse(g.lootSnapshotJson) as object[],
    createdAt: g.createdAt,
  });

  const unopened = grants.filter((g) => !g.openedAt).map(view);
  const collection = grants
    .filter((g) => g.openedAt)
    .map((g) => ({ ...view(g), openedAt: g.openedAt }));

  return NextResponse.json({
    unopened,
    collection,
    unopenedCount: unopened.length,
  });
}
```

- [x] **Step 3: CHECKPOINT**

`npm run lint && npm run typecheck` — PASS.

### Task 6: API `POST /api/chests/open` (CAS)

**Files:**
- Modify: `web/src/app/api/chests/route.ts` (thêm handler POST)

**Interfaces:**
- Consumes: `chestOpenSchema`, `totalPointsFromSnapshot` (Task 3).
- Produces: `POST {playerId, grantId}` → `200 {loot, tier}` khi lần đầu mở (điểm POINTS cộng đúng 1 lần); `200 {alreadyOpened:true, loot, tier}` nếu mở lại; 404 grant không thuộc player.

- [x] **Step 1: Implement POST**

Append vào `route.ts`:

```ts
export async function POST(req: Request) {
  const rl = rateLimit(`chests-open:${clientIp(req)}`, { limit: 30, windowMs: 60_000 });
  if (!rl.ok)
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } });

  const body = await req.json().catch(() => null);
  const parsed = chestOpenSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });

  const grant = await db.chestGrant.findUnique({ where: { id: parsed.data.grantId } });
  if (!grant || grant.playerId !== parsed.data.playerId)
    return NextResponse.json({ error: "unknown grant" }, { status: 404 });

  const claimed = await db.chestGrant.updateMany({
    where: { id: grant.id, openedAt: null },
    data: { openedAt: new Date() },
  });

  if (claimed.count > 0) {
    const points = totalPointsFromSnapshot(grant.lootSnapshotJson);
    if (points > 0) {
      await db.$transaction([
        db.player.update({ where: { id: grant.playerId }, data: { score: { increment: points } } }),
      ]);
    }
  }

  const tier = await db.chestTier.findUnique({ where: { id: grant.tierId } });
  return NextResponse.json({
    alreadyOpened: claimed.count === 0,
    loot: JSON.parse(grant.lootSnapshotJson),
    tier: tier ? { key: tier.key, nameVi: tier.nameVi, nameEn: tier.nameEn, colorHex: tier.colorHex } : null,
  });
}
```

Import bổ sung đầu file: `totalPointsFromSnapshot` từ `@/lib/chests`, `chestOpenSchema` từ `@/lib/validators`.

- [x] **Step 2: CHECKPOINT**

`npm run lint && npm run typecheck` — PASS.

### Task 7: Gắn engine vào `/api/answer`

**Files:**
- Modify: `web/src/app/api/answer/route.ts` (nhánh giải đúng vừa claim)

**Interfaces:**
- Consumes: `grantsForAnswer` (Task 4).
- Produces: response giải đúng thêm trường `newChests: number`.

- [x] **Step 1: Sửa nhánh claim thành công**

Trong `answer/route.ts`, sau block `if (claimed.count > 0)` (block cộng điểm CAS đã có từ phiên trước — nằm trong nhánh `input.action === "answer"` khi đúng), ngay sau `await db.player.update(... increment ...)`:

```ts
      const { created } = await grantsForAnswer({
        playerId: player.id,
        stationSlug: station.slug,
      });
```

và thêm `newChests: created` vào JSON response trả về của nhánh này. Import đầu file: `import { grantsForAnswer } from "@/lib/chest-grants";`.

KHÔNG gọi grantsForAnswer ở nhánh lost-race (`claimed.count === 0`) — request thắng cuộc đã lo.

- [x] **Step 2: CHECKPOINT**

`npm run lint && npm run typecheck && npm run test` — PASS (test cũ answer không bị đổi shape gây fail).

### Task 8: API `POST /api/chests/claim-partner`

**Files:**
- Create: `web/src/app/api/chests/claim-partner/route.ts`

**Interfaces:**
- Consumes: `partnerClaimSchema`, `grantOnce` (Task 4), `PartnerSpot` (Task 2).
- Produces: `200 {ok:true, grantId}` (lần đầu) · `200 {ok:true, alreadyClaimed:true}` (claim lại) · `404 {error:"invalid_token"}` · 429 rate-limited (10/phút/IP).

- [x] **Step 1: Implement**

```ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { partnerClaimSchema } from "@/lib/validators";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { grantOnce } from "@/lib/chest-grants";

export async function POST(req: Request) {
  const rl = rateLimit(`partner-claim:${clientIp(req)}`, { limit: 10, windowMs: 60_000 });
  if (!rl.ok)
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } });

  const body = await req.json().catch(() => null);
  const parsed = partnerClaimSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });

  const spot = await db.partnerSpot.findUnique({ where: { token: parsed.data.token } });
  if (!spot)
    return NextResponse.json({ error: "invalid_token" }, { status: 404 });

  const tier = await db.chestTier.findUnique({ where: { key: "epic" } });
  if (!tier)
    return NextResponse.json({ error: "server_misconfigured" }, { status: 503 });

  const grantId = await grantOnce({
    playerId: parsed.data.playerId,
    source: "PARTNER",
    sourceRef: spot.token,
    tierId: tier.id,
    lootScopeKey: "partner",
  });

  return NextResponse.json({
    ok: true,
    grantId: grantId ?? null,
    alreadyClaimed: grantId === null,
  });
}
```

(GPS lat/lng nhận vào nhưng v1 chỉ log phục vụ vận hành — anti-cheat mềm theo spec Edge Cases.)

- [x] **Step 2: CHECKPOINT**

`npm run lint && npm run typecheck` — PASS.

### Task 9: Dictionaries vi/en

**Files:**
- Modify: `web/src/lib/dictionaries.ts`

**Interfaces:**
- Produces: keys dùng ở Task 10–12 (phải có ĐỦ cả hai block):

VI block:
```ts
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
"chest.watch_video": "Xem video",
```

EN block (cùng keys):
```ts
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
"chest.watch_video": "Watch video",
```

- [x] **Step 1: Insert** cả hai block đúng vị trí (sau nhóm `home.*`). Run CHECKPOINT typecheck — PASS.

### Task 10: Component `ChestReveal` (2D)

**Files:**
- Create: `web/src/components/ChestReveal.tsx`
- Modify: `web/src/app/globals.css` (animation)

**Interfaces:**
- Consumes: dictionary keys Task 9; `useLang()`.
- Produces:
```tsx
export interface RevealTier { key: string; nameVi: string; nameEn: string; colorHex: string }
export interface RevealLoot { type: string; pointsAmount?: number; storyVi?: string; storyEn?: string; imagePath?: string; youtubeUrl?: string }
export default function ChestReveal(props: {
  tier: RevealTier;
  loot: RevealLoot[];
  onClose: () => void;
}): JSX.Element
// Overlay full-screen; click rương → animation mở (CSS class .chest-opened) → render loot cards; nút đóng.
```

- [x] **Step 1: CSS**

`globals.css` append:

```css
.chest-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: rgb(28 25 23 / 85%);
  backdrop-filter: blur(4px);
  padding: 1.5rem;
}

.chest-box {
  width: 140px;
  height: 110px;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s;
}
.chest-box:hover { transform: scale(1.05); }

.chest-lid {
  position: absolute;
  inset: 0 0 auto 0;
  height: 45%;
  border-radius: 12px 12px 4px 4px;
  transform-origin: top center;
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: inset 0 -4px 0 rgb(0 0 0 / 18%);
}
.chest-opened .chest-lid { transform: rotateX(120deg); }

.chest-base {
  position: absolute;
  inset: 55% 0 0 0;
  border-radius: 4px 4px 12px 12px;
  box-shadow: inset 0 4px 0 rgb(0 0 0 / 18%);
}

@keyframes chest-glow {
  0% { opacity: 0.4; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1.15); }
}
.chest-glow {
  width: 180px; height: 180px; border-radius: 9999px;
  background: radial-gradient(circle, rgb(201 150 43 / 45%), transparent 65%);
  animation: chest-glow 0.9s ease-out forwards;
}
```

- [x] **Step 2: Component**

```tsx
"use client";

import { useState } from "react";
import { Gift, PlayCircle, ScrollText, X } from "lucide-react";
import { useLang } from "@/lib/i18n";

export interface RevealTier {
  key: string;
  nameVi: string;
  nameEn: string;
  colorHex: string;
}
export interface RevealLoot {
  type: string;
  pointsAmount?: number;
  storyVi?: string;
  storyEn?: string;
  imagePath?: string;
  youtubeUrl?: string;
}

export default function ChestReveal({
  tier,
  loot,
  onClose,
}: {
  tier: RevealTier;
  loot: RevealLoot[];
  onClose: () => void;
}) {
  const { t, lang } = useLang();
  const [opened, setOpened] = useState(false);

  return (
    <div className="chest-overlay">
      <button
        onClick={onClose}
        aria-label="close"
        className="absolute right-4 top-4 rounded-full border border-paper/30 p-2 text-paper/80 hover:text-paper"
      >
        <X className="h-5 w-5" />
      </button>
      <p className="font-display text-lg font-black text-gold">{t("chest.title")}</p>

      {!opened ? (
        <>
          <div className="chest-glow" />
          <div
            className="chest-box -mt-32"
            onClick={() => setOpened(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setOpened(true)}
            style={{ filter: `drop-shadow(0 8px 20px ${tier.colorHex}66)` }}
          >
            <div className="chest-lid" style={{ backgroundColor: tier.colorHex }} />
            <div className="chest-base" style={{ backgroundColor: tier.colorHex }} />
          </div>
          <p className="text-sm font-semibold text-paper/90">{t("chest.tap_to_open")}</p>
        </>
      ) : (
        <>
          <div className="chest-box chest-opened -mt-10 pointer-events-none opacity-80">
            <div className="chest-lid" style={{ backgroundColor: tier.colorHex }} />
            <div className="chest-base" style={{ backgroundColor: tier.colorHex }} />
          </div>
          <ul className="mt-2 flex w-full max-w-sm flex-col gap-2">
            {loot.map((item, i) => (
              <li key={i} className="rounded-xl bg-cream px-4 py-3 text-sm shadow-lg ring-1 ring-line">
                {item.type === "POINTS" && (
                  <span className="flex items-center gap-2 font-bold text-jade-deep">
                    <Gift className="h-4 w-4 shrink-0" />
                    {t("chest.reward_points", { points: item.pointsAmount ?? 0 })}
                  </span>
                )}
                {item.type === "STORY" && (
                  <span className="flex items-start gap-2 text-ink">
                    <ScrollText className="mt-0.5 h-4 w-4 shrink-0 text-clay-deep" />
                    <span className="italic leading-relaxed">
                      {lang === "vi" ? item.storyVi : item.storyEn}
                    </span>
                  </span>
                )}
                {item.type === "VIDEO" && item.youtubeUrl && (
                  <a
                    href={item.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 font-semibold text-son hover:underline"
                  >
                    <PlayCircle className="h-4 w-4 shrink-0" />
                    {t("chest.watch_video")}
                  </a>
                )}
                {item.type === "IMAGE" && item.imagePath && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={`/api/uploads/${item.imagePath}`} alt="" className="max-h-48 w-full rounded-lg object-contain" />
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
```

- [x] **Step 3: CHECKPOINT** — `npm run lint && npm run typecheck` PASS (component chưa gắn, không ảnh hưởng app).

### Task 11: Gắn ChestReveal vào StationFlow + badge /play

**Files:**
- Modify: `web/src/components/StationFlow.tsx`, `web/src/app/play/page.tsx`

**Interfaces:**
- Consumes: `GET /api/chests`, `POST /api/chests/open`, ChestReveal (Task 10), key `chest.unopened_badge`.

- [x] **Step 1: StationFlow**

Thêm state `queue: {grantId, tier, loot}[]` (kiểu từ response GET). Trong `submitAnswer` sau `data.correct` và sau `await load()`:

```ts
        const res2 = await fetch(`/api/chests?playerId=${state!.playerId}`);
        if (res2.ok) {
          const data2 = await res2.json();
          setQueue(data2.unopened ?? []);
        }
```

Render cuối Shell (trước đóng `</main>` nội dung): nếu `queue.length > 0` lấy phần tử đầu:

```tsx
      {queue.length > 0 && queue[0].tier && (
        <ChestReveal
          tier={queue[0].tier}
          loot={queue[0].loot}
          onClose={async () => {
            await fetch("/api/chests/open", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ playerId: state!.playerId, grantId: queue[0].grantId }),
            });
            setQueue((q) => q.slice(1));
            await load();
          }}
        />
      )}
```

(Open gọi khi đóng = điểm đã cộng phía server bất kể UI.)

- [x] **Step 2: Badge /play**

Trong `play/page.tsx` thêm fetch `GET /api/chests` trong `load()` (sau setState), state `unopenedCount`; hiển thị cạnh progress ở header: `{unopenedCount > 0 && <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-timber">{t("chest.unopened_badge", { count: unopenedCount })}</span>}`.

- [x] **Step 3: CHECKPOINT** — lint/typecheck/test + `npx vitest run src/lib/game.test.ts` PASS.

### Task 12: Treasure — nghi thức FINAL + bộ sưu tập

**Files:**
- Modify: `web/src/app/treasure/page.tsx`

**Interfaces:**Consumes GET/POST chests như Task 11; keys `chest.final_title`, `chest.collection_title`, `chest.empty_collection`.

- [x] **Step 1:** Sau khi `state.completedAll`, fetch `/api/chests`: nếu có unopened grant `source==="FINAL"` → render `ChestReveal` tương tự Task 11 (onClose gọi open rồi reload). Thêm section "collection" liệt kê `collection[]`: card màu tier + loot POINTS/STORY/VIDEO link/IMAGE img (y hệt markup loot-card của ChestReveal, tái dùng bằng cách extract sub-component `RewardCard` từ Task 10 sang file riêng `web/src/components/RewardCard.tsx` và ChestReveal import lại).

- [x] **Step 2: CHECKPOINT** — lint/typecheck/test PASS.

### Task 13: Admin — API + tab "Rương"

**Files:**
- Create: `web/src/app/api/admin/chests/route.ts` (GET tổng hợp + PATCH từng phần)
- Modify: `web/src/app/admin/page.tsx` (tab mới), `web/src/app/api/admin/stations/route.ts` (nhận `chestTierId`)

**Interfaces:**
- Produces: `GET /api/admin/chests` → `{tiers, loot, dropRules, partnerSpot:{key,token}}` (admin-auth như reviews); `PATCH` body `{kind:"tier"|"loot"|"dropRule"|"regenerate_partner_token", payload...}`; station form thêm select `chestTierId` (null = không rương).

- [x] **Step 1: Route admin**

```ts
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest } from "@/lib/auth";
import { z } from "zod";

const patchSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("tier"), id: z.number().int(), nameVi: z.string().min(1), nameEn: z.string().min(1), colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/), modelGlbPath: z.string(), modelUsdzPath: z.string() }),
  z.object({ kind: z.literal("loot-create"), scopeKey: z.string().min(1), type: z.enum(["POINTS","STORY","IMAGE","VIDEO"]), pointsAmount: z.number().int().optional(), storyVi: z.string().optional(), storyEn: z.string().optional(), imagePath: z.string().optional(), youtubeUrl: z.string().url().optional(), sortOrder: z.number().int().default(0) }),
  z.object({ kind: z.literal("loot-delete"), id: z.number().int() }),
  z.object({ kind: z.literal("drop-rule"), chancePct: z.number().int().min(0).max(100), rules: z.array(z.object({ tierKey: z.string(), weight: z.number().int().min(0) })).min(1) }),
  z.object({ kind: z.literal("regenerate_partner_token") }),
]);

export async function GET(req: Request) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const [tiers, loot, dropRules, partnerSpot] = await Promise.all([
    db.chestTier.findMany({ orderBy: { sortOrder: "asc" } }),
    db.chestLoot.findMany({ orderBy: [{ scopeKey: "asc" }, { sortOrder: "asc" }] }),
    db.dropRule.findMany(),
    db.partnerSpot.findFirst(),
  ]);
  return NextResponse.json({ tiers, loot, dropRules, partnerSpot });
}

export async function PATCH(req: Request) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  const d = parsed.data;
  if (d.kind === "tier") {
    await db.chestTier.update({ where: { id: d.id }, data: { nameVi: d.nameVi, nameEn: d.nameEn, colorHex: d.colorHex, modelGlbPath: d.modelGlbPath, modelUsdzPath: d.modelUsdzPath } });
  } else if (d.kind === "loot-create") {
    await db.chestLoot.create({ data: d });
  } else if (d.kind === "loot-delete") {
    await db.chestLoot.delete({ where: { id: d.id } });
  } else if (d.kind === "drop-rule") {
    await db.$transaction([
      db.dropRule.deleteMany(),
      db.dropRule.createMany({ data: d.rules.map((r) => ({ chancePct: d.chancePct, tierKey: r.tierKey, weight: r.weight })) }),
    ]);
  } else {
    await db.partnerSpot.update({ where: { key: (await db.partnerSpot.findFirstOrThrow()).key }, data: { token: randomBytes(24).toString("hex") } });
  }
  return NextResponse.json({ ok: true });
}
```

- [x] **Step 2: Stations admin nhận chestTierId** — trong `api/admin/stations/route.ts` mở rộng schema update/create với `chestTierId: z.number().int().nullable().optional()` và map vào data. Tab "Rương" trong `admin/page.tsx`: bảng tiers editable đơn giản (input name/color/path + Save gọi PATCH kind=tier), danh sách loot theo scope với nút xóa + form thêm, form drop-rule (chance + 3 weight), nút regenerate token + hiển thị token hiện tại. Copy admin UI là tiếng Việt cứng được (không áp luật i18n người chơi).

- [x] **Step 3: CHECKPOINT** — lint/typecheck/test PASS.

### Task 14: E2E kiểm chứng M1

**Files:**
- Create (tạm): `web/.e2e-chests.mjs` — xóa sau khi chạy

- [x] **Step 1: Script**

Node script (pattern như các lần trước — fetch + better-sqlite3):
1. POST session → pid
2. DB insert CheckIn APPROVED cho `hang-bac`
3. POST answer đúng → assert `newChests >= 1` (ít nhất STATION; DROP có thể trượt/ăn)
4. GET /api/chests → assert unopened chứa source STATION ref hang-bac; snapshot loot đúng scope
5. POST open ×2 song song → assert đúng 1 response `alreadyOpened:false`; điểm player tăng ĐÚNG `pointsAmount` của snapshot một lần
6. Claim partner sai token → 404; đúng token → 200; claim lại → alreadyClaimed true; DB COUNT PARTNER grant = 1
7. Retry answer (gọi lại answer đúng) → COUNT grant STATION vẫn = 1 (unique hoạt động)
8. In ALL PASS / FAILURES; cleanup player + grants + checkins.

- [x] **Step 2: Chạy** — start dev server (pattern Start-Process đã quen), `$env:PORT=3000; node .e2e-chests.mjs`. Expected: ALL PASS.

- [x] **Step 3: Kiểm tra cấm three.js** — Run: `rg -i "three" src --glob "!generated/**"` Expected: không match trong file M1 (ngoại lệ comment).

- [x] **Step 4: CHECKPOINT CUỐI** — kill server, xóa script, `npm run lint && npm run typecheck && npm run test` PASS. Cập nhật trạng thái vào file kế hoạch này (`- [x]`).

---

## Self-review đã chạy khi soạn plan

- Spec coverage §2–§9 (M1): schema ✓(T1) seed ✓(T2) engine+pity+achievement+snapshot ✓(T3–4) API chests/open/claim ✓(T5–6,8) tích hợp answer+FINAL ✓(T7) admin ✓(T13) i18n ✓(T9) UI reveal/badge/collection ✓(T10–12) E2E ✓(T14). M2/M3 (three.js/WebXR/QuickLook/MindAR/assets) cố ý ngoài phạm vi plan này — sẽ có plan riêng.
- Type consistency: `grantOnce`/`grantsForAnswer`/`RevealTier`/`RevealLoot`/keys dictionary dùng thống nhất giữa các task.
- Placeholder scan: không còn TBD/TODO.
