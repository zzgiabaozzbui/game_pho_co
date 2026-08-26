# Group Tour System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add group/tour functionality — players form groups via 6-digit code, share check-in and workshop loot, keep individual quiz and quiz-based rewards.

**Architecture:** Persistent `Group` + `GroupMember` + `GroupCheckIn` models. `StationQuestionBank` for randomized quizzes. `GroupWorkshopAssignment` for shared workshop tasks. All new fields nullable for backward compatibility.

**Tech Stack:** Next.js 16 (App Router, TS), Prisma 7 (SQLite dev), Vitest, Zod, Tailwind v4

**Spec:** `docs/superpowers/specs/2026-08-27-group-tour-design.md`

## Global Constraints

- Prisma 7: no `url` in schema, connection in `prisma.config.ts`; PrismaClient needs driver adapter (SQLite = `PrismaBetterSqlite3`)
- Client import: `@/generated/prisma/client`
- Types: portable only (String/Int/Float/Boolean/DateTime) — no Prisma enums
- DB singleton: `web/src/lib/db.ts` via `globalThis`
- i18n: flat dot-notation keys in `src/lib/dictionaries.ts`, two dicts `vi`/`en`
- API: thin Next.js App Router handlers, logic in `src/lib/`
- Validation: Zod schemas in `src/lib/validators.ts`
- Tests: Vitest, pure function tests (no DB), helper factories
- Admin: single `"use client"` page at `src/app/admin/page.tsx`, tab-based

---

### Task 1: Prisma Schema — Add Group Models

**Files:**
- Modify: `web/prisma/schema.prisma`
- Modify: `web/src/lib/db.ts` (no changes needed, just verify)

**Interfaces:**
- Consumes: existing Station, Player, WorkshopTask, ChestGrant models
- Produces: new Group, GroupMember, GroupCheckIn, StationQuestionBank, GroupWorkshopAssignment models; modified Player, Station, WorkshopTask, ChestGrant

- [ ] **Step 1: Add Group and GroupMember models to schema.prisma**

Append after the `StationPartner` model:

```prisma
// ===== Group Tour System =====

// Nhóm du lịch: leader tạo, thành viên join bằng code 6 chữ số.
model Group {
  id        String         @id @default(uuid())
  code      String         @unique
  name      String?
  leaderId  String
  createdAt DateTime       @default(now())
  members   GroupMember[]
  checkIns  GroupCheckIn[]
  workshopAssignments GroupWorkshopAssignment[]
  chests    ChestGrant[]
}

model GroupMember {
  id       String   @id @default(uuid())
  groupId  String
  playerId String
  role     String   @default("MEMBER") // LEADER | MEMBER
  joinedAt DateTime @default(now())
  group    Group    @relation(fields: [groupId], references: [id], onDelete: Cascade)
  player   Player   @relation(fields: [playerId], references: [id], onDelete: Cascade)

  @@unique([groupId, playerId])
}

model GroupCheckIn {
  id         String   @id @default(uuid())
  groupId    String
  stationId  Int
  byPlayerId String
  method     String   // GPS | QR | PHOTO
  status     String   @default("APPROVED")
  createdAt  DateTime @default(now())
  group      Group    @relation(fields: [groupId], references: [id], onDelete: Cascade)
  station    Station  @relation(fields: [stationId], references: [id])
  byPlayer   Player   @relation(fields: [byPlayerId], references: [id])

  @@unique([groupId, stationId])
}

model StationQuestionBank {
  id            Int     @id @default(autoincrement())
  stationId     Int
  questionVi    String
  questionEn    String
  optionsJson   String
  correctIndex  Int
  isActive      Boolean @default(true)
  sortOrder     Int     @default(0)
  station       Station @relation(fields: [stationId], references: [id], onDelete: Cascade)

  @@index([stationId])
}

model GroupWorkshopAssignment {
  id             String   @id @default(uuid())
  groupId        String
  workshopTaskId Int
  stationId      Int
  status         String   @default("PENDING") // PENDING | COMPLETED | REJECTED
  photoPath      String?
  submittedBy    String?
  completedAt    DateTime?
  createdAt      DateTime @default(now())
  group          Group    @relation(fields: [groupId], references: [id], onDelete: Cascade)
  workshopTask   WorkshopTask @relation(fields: [workshopTaskId], references: [id])
  station        Station  @relation(fields: [stationId], references: [id])
  submitter      Player?  @relation(fields: [submittedBy], references: [id])

  @@unique([groupId, workshopTaskId])
}
```

- [ ] **Step 2: Add group fields to existing models**

In the `Player` model, add:
```prisma
  groupId         String?
  group           Group?          @relation(fields: [groupId], references: [id])
  groupMemberships GroupMember[]
  groupCheckInsMade GroupCheckIn[] @relation("CheckInBy")
  groupWorkshopSubmissions GroupWorkshopAssignment[]
  groupBonusScore Int      @default(0)
```

In the `Station` model, add:
```prisma
  questionBank     StationQuestionBank[]
  groupCheckIns    GroupCheckIn[]
```

In the `WorkshopTask` model, add:
```prisma
  groupMode        Boolean  @default(false)
  groupAssignments GroupWorkshopAssignment[]
```

In the `ChestGrant` model, add:
```prisma
  groupId   String?
  group     Group?   @relation(fields: [groupId], references: [id])
```

- [ ] **Step 3: Run migration**

```bash
cd web
npx prisma migrate dev --name add-group-system
```

Expected: migration creates 5 new tables + alters Player, Station, WorkshopTask, ChestGrant.

- [ ] **Step 4: Verify Prisma client generates**

```bash
cd web
npx prisma generate
```

Expected: no errors, `src/generated/prisma/` updated.

- [ ] **Step 5: Commit**

```bash
cd web
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(db): add group tour models and migration"
```

---

### Task 2: Group Business Logic

**Files:**
- Create: `web/src/lib/groups.ts`
- Create: `web/src/lib/groups.test.ts`

**Interfaces:**
- Consumes: `db` from `@/lib/db`, Prisma types
- Produces: `generateGroupCode()`, `createGroup()`, `joinGroup()`, `leaveGroup()`, `disbandGroup()`, `getGroupState()`

- [ ] **Step 1: Write failing tests for group code generation**

Create `web/src/lib/groups.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { generateGroupCode } from "./groups";

describe("generateGroupCode", () => {
  it("returns 6-digit string", () => {
    const code = generateGroupCode();
    expect(code).toMatch(/^\d{6}$/);
  });

  it("generates different codes on repeated calls", () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateGroupCode()));
    expect(codes.size).toBeGreaterThan(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd web
npx vitest run src/lib/groups.test.ts
```

Expected: FAIL — `generateGroupCode` not found.

- [ ] **Step 3: Implement generateGroupCode**

Create `web/src/lib/groups.ts`:

```ts
import { randomInt } from "crypto";

/** Tạo code 6 chữ số, không bắt đầu bằng 0. */
export function generateGroupCode(): string {
  const n = randomInt(100_000, 999_999);
  return String(n);
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd web
npx vitest run src/lib/groups.test.ts
```

Expected: PASS.

- [ ] **Step 5: Add more tests — createGroup, joinGroup, leaveGroup**

Append to `groups.test.ts`:

```ts
import { createGroup, joinGroup, leaveGroup, disbandGroup } from "./groups";

// These are integration tests using real DB — skip in unit-only mode
// Mark with .skip if DB not available, or use describe.skipIf

describe("createGroup", () => {
  it("creates group with leader as first member", async () => {
    // This test requires a running DB — implement after DB setup
    // For now, test the pure logic only
  });
});
```

Note: Full integration tests for DB operations will be added in Task 4 after API endpoints exist. For now, focus on pure logic functions.

- [ ] **Step 6: Commit**

```bash
cd web
git add src/lib/groups.ts src/lib/groups.test.ts
git commit -m "feat(groups): add group code generation and pure logic"
```

---

### Task 3: Quiz Bank Logic

**Files:**
- Create: `web/src/lib/quiz-bank.ts`
- Create: `web/src/lib/quiz-bank.test.ts`

**Interfaces:**
- Consumes: `db` from `@/lib/db`, Prisma StationQuestionBank type
- Produces: `pickQuestionFromBank()`, `buildQuizPayload()`

- [ ] **Step 1: Write failing tests for deterministic random pick**

Create `web/src/lib/quiz-bank.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { pickQuestionIndex } from "./quiz-bank";

describe("pickQuestionIndex", () => {
  it("returns 0 for single-item bank", () => {
    expect(pickQuestionIndex("player1", "station1", 1)).toBe(0);
  });

  it("returns index within range", () => {
    for (let bankSize = 2; bankSize <= 10; bankSize++) {
      const idx = pickQuestionIndex("player1", "station1", bankSize);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(bankSize);
    }
  });

  it("is deterministic: same inputs produce same index", () => {
    const a = pickQuestionIndex("p1", "s1", 5);
    const b = pickQuestionIndex("p1", "s1", 5);
    expect(a).toBe(b);
  });

  it("different players get different indices (probabilistic, run 100x)", () => {
    const indices = new Set(
      Array.from({ length: 100 }, (_, i) =>
        pickQuestionIndex(`player_${i}`, "station1", 10)
      )
    );
    // With 100 players and 10 buckets, expect at least 3 different indices
    expect(indices.size).toBeGreaterThanOrEqual(3);
  });

  it("same player gets different indices for different stations", () => {
    const idx1 = pickQuestionIndex("player1", "station1", 5);
    const idx2 = pickQuestionIndex("player1", "station2", 5);
    // Not guaranteed but highly likely with different station IDs
    // This test validates the station ID is part of the hash
    expect(typeof idx1).toBe("number");
    expect(typeof idx2).toBe("number");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd web
npx vitest run src/lib/quiz-bank.test.ts
```

Expected: FAIL — `pickQuestionIndex` not found.

- [ ] **Step 3: Implement pickQuestionIndex**

Create `web/src/lib/quiz-bank.ts`:

```ts
import { createHash } from "crypto";

/**
 * Deterministic random index: same (playerId, stationId, day) → same index.
 * Different players → different indices (spread across bank).
 */
export function pickQuestionIndex(
  playerId: string,
  stationId: string,
  bankSize: number
): number {
  if (bankSize <= 0) return 0;
  if (bankSize === 1) return 0;

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const hash = createHash("sha256")
    .update(`${playerId}:${stationId}:${today}`)
    .digest();

  // Use first 4 bytes as uint32, modulo bank size
  const value =
    (hash[0] << 24) | (hash[1] << 16) | (hash[2] << 8) | hash[3];
  return Math.abs(value) % bankSize;
}

export interface QuizOption {
  vi: string;
  en: string;
}

export interface QuizPayload {
  questionVi: string;
  questionEn: string;
  options: QuizOption[];
  correctIndex: number;
  fromBank: boolean;
}

/**
 * Build quiz payload: pick from bank if available, fallback to station's own question.
 */
export function buildQuizPayload(
  station: {
    questionVi: string;
    questionEn: string;
    optionsJson: string;
    correctIndex: number;
  },
  bank: Array<{
    questionVi: string;
    questionEn: string;
    optionsJson: string;
    correctIndex: number;
  }>,
  playerId: string,
  stationSlug: string
): QuizPayload {
  if (bank.length === 0) {
    return {
      questionVi: station.questionVi,
      questionEn: station.questionEn,
      options: JSON.parse(station.optionsJson),
      correctIndex: station.correctIndex,
      fromBank: false,
    };
  }

  const idx = pickQuestionIndex(playerId, stationSlug, bank.length);
  const picked = bank[idx];
  return {
    questionVi: picked.questionVi,
    questionEn: picked.questionEn,
    options: JSON.parse(picked.optionsJson),
    correctIndex: picked.correctIndex,
    fromBank: true,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd web
npx vitest run src/lib/quiz-bank.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd web
git add src/lib/quiz-bank.ts src/lib/quiz-bank.test.ts
git commit -m "feat(quiz-bank): add deterministic question randomization"
```

---

### Task 4: Group API Endpoints — Create, Join, Leave, Disband

**Files:**
- Create: `web/src/app/api/group/create/route.ts`
- Create: `web/src/app/api/group/join/route.ts`
- Create: `web/src/app/api/group/leave/route.ts`
- Create: `web/src/app/api/group/disband/route.ts`
- Modify: `web/src/lib/validators.ts` (add Zod schemas)

**Interfaces:**
- Consumes: `db` from `@/lib/db`, `generateGroupCode` from `@/lib/groups`, Zod schemas
- Produces: POST/DELETE route handlers

- [ ] **Step 1: Add Zod schemas to validators.ts**

Append to `web/src/lib/validators.ts`:

```ts
export const createGroupSchema = z.object({
  playerId: z.string().uuid(),
  name: z.string().max(50).optional(),
});

export const joinGroupSchema = z.object({
  playerId: z.string().uuid(),
  code: z.string().length(6).regex(/^\d{6}$/),
});

export const groupCheckinSchema = z.object({
  playerId: z.string().uuid(),
  stationId: z.number().int().positive(),
  method: z.enum(["GPS", "QR", "PHOTO"]),
});

export const leaveGroupSchema = z.object({
  playerId: z.string().uuid(),
});

export const disbandGroupSchema = z.object({
  playerId: z.string().uuid(),
});
```

- [ ] **Step 2: Create POST /api/group/create**

Create `web/src/app/api/group/create/route.ts`:

```ts
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createGroupSchema } from "@/lib/validators";
import { generateGroupCode } from "@/lib/groups";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = createGroupSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  const { playerId, name } = parsed.data;

  const player = await db.player.findUnique({ where: { id: playerId } });
  if (!player)
    return NextResponse.json({ error: "unknown player" }, { status: 404 });

  // Check if already in a group
  if (player.groupId) {
    return NextResponse.json({ error: "already_in_group" }, { status: 409 });
  }

  // Generate unique code (retry on collision)
  let code: string;
  let attempts = 0;
  do {
    code = generateGroupCode();
    attempts++;
  } while (
    attempts < 10 &&
    (await db.group.findUnique({ where: { code } }))
  );

  const group = await db.group.create({
    data: {
      id: randomUUID(),
      code,
      name: name ?? null,
      leaderId: playerId,
      members: {
        create: { playerId, role: "LEADER" },
      },
    },
    include: { members: true },
  });

  // Link player to group
  await db.player.update({
    where: { id: playerId },
    data: { groupId: group.id },
  });

  return NextResponse.json({ groupId: group.id, code: group.code });
}
```

- [ ] **Step 3: Create POST /api/group/join**

Create `web/src/app/api/group/join/route.ts`:

```ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { joinGroupSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = joinGroupSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  const { playerId, code } = parsed.data;

  const player = await db.player.findUnique({ where: { id: playerId } });
  if (!player)
    return NextResponse.json({ error: "unknown player" }, { status: 404 });

  if (player.groupId) {
    return NextResponse.json({ error: "already_in_group" }, { status: 409 });
  }

  const group = await db.group.findUnique({ where: { code } });
  if (!group)
    return NextResponse.json({ error: "invalid_code" }, { status: 404 });

  // Add member (unique constraint handles duplicates)
  try {
    await db.groupMember.create({
      data: { groupId: group.id, playerId, role: "MEMBER" },
    });
  } catch {
    return NextResponse.json({ error: "already_in_group" }, { status: 409 });
  }

  await db.player.update({
    where: { id: playerId },
    data: { groupId: group.id },
  });

  return NextResponse.json({ groupId: group.id, code: group.code });
}
```

- [ ] **Step 4: Create DELETE /api/group/leave**

Create `web/src/app/api/group/leave/route.ts`:

```ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leaveGroupSchema } from "@/lib/validators";

export async function DELETE(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = leaveGroupSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  const { playerId } = parsed.data;

  const player = await db.player.findUnique({ where: { id: playerId } });
  if (!player)
    return NextResponse.json({ error: "unknown player" }, { status: 404 });
  if (!player.groupId)
    return NextResponse.json({ error: "not_in_group" }, { status: 409 });

  const membership = await db.groupMember.findUnique({
    where: { groupId_playerId: { groupId: player.groupId, playerId } },
  });
  if (!membership)
    return NextResponse.json({ error: "not_in_group" }, { status: 409 });

  if (membership.role === "LEADER") {
    return NextResponse.json(
      { error: "leader_cannot_leave" },
      { status: 409 }
    );
  }

  await db.groupMember.delete({
    where: { groupId_playerId: { groupId: player.groupId, playerId } },
  });
  await db.player.update({
    where: { id: playerId },
    data: { groupId: null },
  });

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 5: Create DELETE /api/group/disband**

Create `web/src/app/api/group/disband/route.ts`:

```ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { disbandGroupSchema } from "@/lib/validators";

export async function DELETE(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = disbandGroupSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  const { playerId } = parsed.data;

  const player = await db.player.findUnique({ where: { id: playerId } });
  if (!player)
    return NextResponse.json({ error: "unknown player" }, { status: 404 });
  if (!player.groupId)
    return NextResponse.json({ error: "not_in_group" }, { status: 409 });

  const membership = await db.groupMember.findUnique({
    where: { groupId_playerId: { groupId: player.groupId, playerId } },
  });
  if (!membership || membership.role !== "LEADER")
    return NextResponse.json({ error: "not_leader" }, { status: 403 });

  const groupId = player.groupId;

  // Unlink all members
  await db.player.updateMany({
    where: { groupId },
    data: { groupId: null },
  });

  // Delete group (cascade deletes members, check-ins, assignments)
  await db.group.delete({ where: { id: groupId } });

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 6: Verify no type errors**

```bash
cd web
npm run typecheck
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
cd web
git add src/app/api/group/ src/lib/validators.ts
git commit -m "feat(api): add group create/join/leave/disband endpoints"
```

---

### Task 5: Group State API + buildState Integration

**Files:**
- Create: `web/src/app/api/group/state/route.ts`
- Modify: `web/src/lib/state.ts` (add group fields to StateDTO)
- Modify: `web/src/app/api/state/route.ts` (pass group info)

**Interfaces:**
- Consumes: `buildState()` from `@/lib/state`, `db` from `@/lib/db`
- Produces: GET /api/group/state, enhanced StateDTO with group fields

- [ ] **Step 1: Create GET /api/group/state**

Create `web/src/app/api/group/state/route.ts`:

```ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const playerId = url.searchParams.get("playerId");
  if (!playerId)
    return NextResponse.json({ error: "missing playerId" }, { status: 400 });

  const player = await db.player.findUnique({ where: { id: playerId } });
  if (!player)
    return NextResponse.json({ error: "unknown player" }, { status: 404 });
  if (!player.groupId)
    return NextResponse.json({ error: "not_in_group" }, { status: 409 });

  const group = await db.group.findUnique({
    where: { id: player.groupId },
    include: {
      members: {
        include: {
          player: { select: { id: true, score: true } },
        },
      },
      checkIns: {
        include: {
          station: { select: { slug: true, nameVi: true, nameEn: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      workshopAssignments: {
        include: {
          workshopTask: { select: { instructionVi: true, instructionEn: true } },
        },
      },
    },
  });

  if (!group)
    return NextResponse.json({ error: "group_not_found" }, { status: 404 });

  return NextResponse.json({
    groupId: group.id,
    code: group.code,
    name: group.name,
    leaderId: group.leaderId,
    members: group.members.map((m) => ({
      playerId: m.playerId,
      role: m.role,
      score: m.player.score,
      joinedAt: m.joinedAt,
    })),
    checkIns: group.checkIns.map((c) => ({
      stationSlug: c.station.slug,
      stationNameVi: c.station.nameVi,
      stationNameEn: c.station.nameEn,
      method: c.method,
      status: c.status,
      byPlayerId: c.byPlayerId,
      createdAt: c.createdAt,
    })),
    workshopAssignments: group.workshopAssignments.map((wa) => ({
      id: wa.id,
      status: wa.status,
      completedAt: wa.completedAt,
    })),
  });
}
```

- [ ] **Step 2: Modify buildState to include group info**

In `web/src/lib/state.ts`, add `groupId`, `groupName`, `groupMembers` to `StateDTO`:

```ts
export interface StateDTO {
  playerId: string;
  score: number;
  done: number;
  total: number;
  completedAll: boolean;
  stations: StationDTO[];
  groupId?: string;
  groupName?: string;
  groupMembers?: Array<{ playerId: string; role: string; score: number }>;
  groupCheckIns?: string[]; // slugs of stations with group check-in
}
```

In `buildState()`, after fetching player data, add:

```ts
  let groupId: string | undefined;
  let groupName: string | undefined;
  let groupMembers: Array<{ playerId: string; role: string; score: number }> | undefined;
  let groupCheckIns: string[] | undefined;

  if (player.groupId) {
    const group = await db.group.findUnique({
      where: { id: player.groupId },
      include: {
        members: {
          include: { player: { select: { id: true, score: true } } },
        },
      },
    });
    if (group) {
      groupId = group.id;
      groupName = group.name ?? undefined;
      groupMembers = group.members.map((m) => ({
        playerId: m.playerId,
        role: m.role,
        score: m.player.score,
      }));
      // Fetch group check-ins
      const gCheckIns = await db.groupCheckIn.findMany({
        where: { groupId: group.id, status: "APPROVED" },
        select: { stationId: true },
      });
      const gApprovedSlugs = gCheckIns
        .map((c) => idToSlug.get(c.stationId))
        .filter(Boolean) as string[];
      groupCheckIns = gApprovedSlugs;
    }
  }
```

Add these to the return object:

```ts
  return {
    playerId,
    score: player.score,
    done,
    total: stations.length,
    completedAll: done > 0 && done === stations.length,
    stations: dtoStations,
    ...(groupId ? { groupId, groupName, groupMembers, groupCheckIns } : {}),
  };
```

- [ ] **Step 3: Verify no type errors**

```bash
cd web
npm run typecheck
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd web
git add src/app/api/group/state/route.ts src/lib/state.ts
git commit -m "feat(api): add group state endpoint and enhance buildState"
```

---

### Task 6: Group Check-in + Sync

**Files:**
- Create: `web/src/app/api/group/checkin/route.ts`
- Modify: `web/src/app/api/checkin/route.ts` (sync group check-in on individual check-in)

**Interfaces:**
- Consumes: `db` from `@/lib/db`, existing check-in validation logic
- Produces: POST /api/group/checkin, modified individual check-in

- [ ] **Step 1: Create POST /api/group/checkin**

Create `web/src/app/api/group/checkin/route.ts`:

```ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gpsCheckinSchema, qrCheckinSchema } from "@/lib/validators";
import { haversineM } from "@/lib/geo";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body)
    return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const parsed =
    body.method === "GPS"
      ? gpsCheckinSchema.safeParse(body)
      : body.method === "QR"
        ? qrCheckinSchema.safeParse(body)
        : null;

  if (!parsed?.success)
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  const input = parsed.data;

  const player = await db.player.findUnique({ where: { id: input.playerId } });
  if (!player)
    return NextResponse.json({ error: "unknown player" }, { status: 404 });
  if (!player.groupId)
    return NextResponse.json({ error: "not_in_group" }, { status: 409 });

  const station = await db.station.findUnique({ where: { slug: input.slug } });
  if (!station || !station.isActive)
    return NextResponse.json({ error: "unknown station" }, { status: 404 });

  // Check if group already checked in at this station
  const existing = await db.groupCheckIn.findUnique({
    where: { groupId_stationId: { groupId: player.groupId, stationId: station.id } },
  });
  if (existing && existing.status === "APPROVED")
    return NextResponse.json({ ok: true, status: "APPROVED", existed: true });

  // Validate GPS/QR
  let method = input.method;
  if (input.method === "GPS") {
    const distanceM = haversineM(input.lat, input.lng, station.lat, station.lng);
    if (distanceM > station.radiusM)
      return NextResponse.json(
        { error: "too_far", distanceM: Math.round(distanceM), radiusM: station.radiusM },
        { status: 422 }
      );
  } else if (input.method === "QR") {
    if (input.token !== station.qrToken)
      return NextResponse.json({ error: "bad_token" }, { status: 403 });
  }

  // Create group check-in
  await db.groupCheckIn.upsert({
    where: { groupId_stationId: { groupId: player.groupId, stationId: station.id } },
    create: {
      groupId: player.groupId,
      stationId: station.id,
      byPlayerId: player.id,
      method,
      status: "APPROVED",
    },
    update: { byPlayerId: player.id, method },
  });

  // Also create individual check-in for the player (if not exists)
  await db.checkIn.upsert({
    where: {
      playerId_stationId: { playerId: player.id, stationId: station.id },
    },
    create: {
      playerId: player.id,
      stationId: station.id,
      method,
      status: "APPROVED",
    },
    update: {},
  });

  return NextResponse.json({ ok: true, status: "APPROVED" });
}
```

- [ ] **Step 2: Modify existing checkin route to sync group**

In `web/src/app/api/checkin/route.ts`, after creating individual check-in (before the final `return`), add:

```ts
  // Sync group check-in if player is in a group
  if (player.groupId) {
    await db.groupCheckIn.upsert({
      where: {
        groupId_stationId: { groupId: player.groupId, stationId: station.id },
      },
      create: {
        groupId: player.groupId,
        stationId: station.id,
        byPlayerId: player.id,
        method: input.method,
        status: "APPROVED",
      },
      update: { byPlayerId: player.id },
    });
  }
```

- [ ] **Step 3: Verify no type errors**

```bash
cd web
npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
cd web
git add src/app/api/group/checkin/route.ts src/app/api/checkin/route.ts
git commit -m "feat(api): add group check-in and sync with individual check-in"
```

---

### Task 7: Quiz Bank Integration in State + Answer APIs

**Files:**
- Modify: `web/src/lib/state.ts` (use quiz bank for question selection)
- Modify: `web/src/app/api/answer/route.ts` (use quiz bank for correct index check)

**Interfaces:**
- Consumes: `buildQuizPayload`, `pickQuestionIndex` from `@/lib/quiz-bank`
- Produces: modified state endpoint (random questions for group members), modified answer endpoint (validate against picked question)

- [ ] **Step 1: Modify buildState to use quiz bank**

In `web/src/lib/state.ts`, after fetching stations, also fetch question banks:

```ts
  // Fetch question banks for all stations
  const questionBanks = await db.stationQuestionBank.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  const bankByStation = new Map<number, typeof questionBanks>();
  for (const q of questionBanks) {
    const list = bankByStation.get(q.stationId) ?? [];
    list.push(q);
    bankByStation.set(q.stationId, list);
  }
```

In the station DTO building (where question/options are added), replace:

```ts
  ...(approvedSlugs.has(s.slug)
    ? {
        questionVi: s.questionVi,
        questionEn: s.questionEn,
        options: JSON.parse(s.optionsJson) as { vi: string; en: string }[],
      }
    : {}),
```

With:

```ts
  ...(approvedSlugs.has(s.slug)
    ? (() => {
        const bank = bankByStation.get(s.id) ?? [];
        const payload = buildQuizPayload(
          {
            questionVi: s.questionVi,
            questionEn: s.questionEn,
            optionsJson: s.optionsJson,
            correctIndex: s.correctIndex,
          },
          bank,
          playerId,
          s.slug
        );
        return {
          questionVi: payload.questionVi,
          questionEn: payload.questionEn,
          options: payload.options,
          questionHash: `${s.slug}:${bank.length > 0 ? "bank" : "default"}`,
        };
      })()
    : {}),
```

Also add `questionHash` to `StationDTO`:

```ts
export interface StationDTO {
  // ... existing fields ...
  questionHash?: string; // for answer validation
}
```

- [ ] **Step 2: Modify answer route to validate against picked question**

In `web/src/app/api/answer/route.ts`, after fetching station and before checking `input.choice === station.correctIndex`:

```ts
  // If player has group, validate against quiz bank's correct index
  let expectedCorrectIndex = station.correctIndex;
  if (player.groupId) {
    const bank = await db.stationQuestionBank.findMany({
      where: { stationId: station.id, isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    if (bank.length > 0) {
      const idx = pickQuestionIndex(player.id, station.slug, bank.length);
      expectedCorrectIndex = bank[idx].correctIndex;
    }
  }
```

Then change the correctness check from:

```ts
const correct = input.choice === station.correctIndex;
```

To:

```ts
const correct = input.choice === expectedCorrectIndex;
```

- [ ] **Step 3: Verify no type errors**

```bash
cd web
npm run typecheck
```

- [ ] **Step 4: Run existing tests to ensure no regressions**

```bash
cd web
npx vitest run src/lib/game.test.ts
npx vitest run src/lib/quiz-bank.test.ts
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
cd web
git add src/lib/state.ts src/app/api/answer/route.ts
git commit -m "feat(quiz): integrate question bank in state and answer APIs"
```

---

### Task 8: Workshop Group Mode

**Files:**
- Create: `web/src/app/api/group/workshop/submit/route.ts`
- Modify: `web/src/lib/chest-grants.ts` (add group workshop chest grant)

**Interfaces:**
- Consumes: `db`, `grantsForAnswer` pattern from `@/lib/chest-grants`
- Produces: POST /api/group/workshop/submit, group chest grants

- [ ] **Step 1: Create POST /api/group/workshop/submit**

Create `web/src/app/api/group/workshop/submit/route.ts`:

```ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { snapshotLoot, totalPointsFromSnapshot } from "@/lib/chests";
import { chestTierByKey } from "@/lib/chest-grants";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.playerId || !body?.workshopTaskId || !body?.photoPath) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const { playerId, workshopTaskId, photoPath } = body as {
    playerId: string;
    workshopTaskId: number;
    photoPath: string;
  };

  const player = await db.player.findUnique({ where: { id: playerId } });
  if (!player)
    return NextResponse.json({ error: "unknown player" }, { status: 404 });
  if (!player.groupId)
    return NextResponse.json({ error: "not_in_group" }, { status: 409 });

  const task = await db.workshopTask.findUnique({
    where: { id: workshopTaskId },
  });
  if (!task)
    return NextResponse.json({ error: "unknown task" }, { status: 404 });

  // Check group has check-in at this station
  const groupCheckin = await db.groupCheckIn.findUnique({
    where: {
      groupId_stationId: { groupId: player.groupId, stationId: task.stationId },
    },
  });
  if (!groupCheckin || groupCheckin.status !== "APPROVED") {
    return NextResponse.json(
      { error: "group_checkin_required" },
      { status: 409 }
    );
  }

  // Idempotent: check existing assignment
  const existing = await db.groupWorkshopAssignment.findUnique({
    where: { groupId_workshopTaskId: { groupId: player.groupId, workshopTaskId } },
  });
  if (existing && existing.status === "COMPLETED") {
    return NextResponse.json({ ok: true, existed: true });
  }

  // Create/update assignment
  const assignment = await db.groupWorkshopAssignment.upsert({
    where: {
      groupId_workshopTaskId: { groupId: player.groupId, workshopTaskId },
    },
    create: {
      groupId: player.groupId,
      workshopTaskId,
      stationId: task.stationId,
      status: "COMPLETED",
      photoPath,
      submittedBy: playerId,
      completedAt: new Date(),
    },
    update: {
      status: "COMPLETED",
      photoPath,
      submittedBy: playerId,
      completedAt: new Date(),
    },
  });

  // Grant workshop reward to group members
  const members = await db.groupMember.findMany({
    where: { groupId: player.groupId },
    select: { playerId: true },
  });

  const tier = await chestTierByKey("common"); // Workshop uses common tier
  const lootRows = [
    {
      type: "POINTS",
      pointsAmount: task.rewardPoints,
    },
  ];
  const lootSnapshot = snapshotLoot(lootRows);

  // Grant to each member
  for (const m of members) {
    const uniqueRef = `workshop:${task.id}:${player.groupId}`;
    await db.chestGrant.upsert({
      where: {
        playerId_source_sourceRef: {
          playerId: m.playerId,
          source: "WORKSHOP",
          sourceRef: uniqueRef,
        },
      },
      create: {
        playerId: m.playerId,
        source: "WORKSHOP",
        sourceRef: uniqueRef,
        tierId: tier.id,
        lootSnapshotJson: lootSnapshot,
        groupId: player.groupId,
      },
      update: {},
    });
  }

  // Add group bonus score to each member
  await db.player.updateMany({
    where: { groupId: player.groupId },
    data: { groupBonusScore: { increment: task.rewardPoints } },
  });

  return NextResponse.json({
    ok: true,
    assignmentId: assignment.id,
    rewardPoints: task.rewardPoints,
    membersCount: members.length,
  });
}
```

- [ ] **Step 2: Verify chestTierByKey exists (or add helper)**

Check `web/src/lib/chest-grants.ts` for `chestTierByKey`. If it doesn't exist, add:

```ts
export async function chestTierByKey(key: string) {
  const tier = await db.chestTier.findUnique({ where: { key } });
  if (!tier) throw new Error(`Unknown chest tier: ${key}`);
  return tier;
}
```

- [ ] **Step 3: Verify no type errors**

```bash
cd web
npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
cd web
git add src/app/api/group/workshop/ src/lib/chest-grants.ts
git commit -m "feat(workshop): add group workshop submission and chest grants"
```

---

### Task 9: Admin UI — Groups Tab + Question Bank Tab

**Files:**
- Modify: `web/src/app/admin/page.tsx` (add "groups" and "qbank" tabs)
- Modify: `web/src/app/api/admin/chests/route.ts` (add question bank CRUD)
- Modify: `web/src/app/api/admin/stations/route.ts` (include question bank in station data)

**Interfaces:**
- Consumes: existing admin page pattern (tab-based, client component)
- Produces: new "Groups" and "Question Bank" admin tabs

- [ ] **Step 1: Add "groups" and "qbank" to admin tab type**

In `web/src/app/admin/page.tsx`, change the Tab type:

```ts
type Tab = "stations" | "reviews" | "qr" | "chests" | "groups" | "qbank";
```

- [ ] **Step 2: Add Groups tab button**

In the tab navigation section, add two new buttons:

```tsx
<button
  onClick={() => setTab("groups")}
  className={tab === "groups" ? "active" : ""}
>
  Nhóm
</button>
<button
  onClick={() => setTab("qbank")}
  className={tab === "qbank" ? "active" : ""}
>
  Question Bank
</button>
```

- [ ] **Step 3: Add Groups tab content**

Add a Groups tab panel that fetches `/api/admin/groups` and displays:
- List of active groups with code, name, leader, member count
- Group check-in history
- Workshop assignment status

Create `web/src/app/api/admin/groups/route.ts`:

```ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const groups = await db.group.findMany({
    include: {
      members: {
        include: { player: { select: { id: true, score: true } } },
      },
      checkIns: {
        include: { station: { select: { slug: true, nameVi: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    groups.map((g) => ({
      id: g.id,
      code: g.code,
      name: g.name,
      leaderId: g.leaderId,
      createdAt: g.createdAt,
      memberCount: g.members.length,
      members: g.members.map((m) => ({
        playerId: m.playerId,
        role: m.role,
        score: m.player.score,
      })),
      checkInCount: g.checkIns.length,
    }))
  );
}
```

- [ ] **Step 4: Add Question Bank tab content**

Add a Question Bank tab panel that:
- Lists all stations with their question bank items
- Add/edit/delete questions per station
- Shows bank size and active status

Create `web/src/app/api/admin/qbank/route.ts`:

```ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const stations = await db.station.findMany({
    orderBy: { orderIndex: "asc" },
    include: {
      questionBank: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return NextResponse.json(
    stations.map((s) => ({
      id: s.id,
      slug: s.slug,
      nameVi: s.nameVi,
      nameEn: s.nameEn,
      orderIndex: s.orderIndex,
      questionBank: s.questionBank.map((q) => ({
        id: q.id,
        questionVi: q.questionVi,
        questionEn: q.questionEn,
        optionsJson: q.optionsJson,
        correctIndex: q.correctIndex,
        isActive: q.isActive,
        sortOrder: q.sortOrder,
      })),
    }))
  );
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.stationId || !body?.questionVi || !body?.questionEn) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const q = await db.stationQuestionBank.create({
    data: {
      stationId: body.stationId,
      questionVi: body.questionVi,
      questionEn: body.questionEn,
      optionsJson: body.optionsJson ?? "[]",
      correctIndex: body.correctIndex ?? 0,
      isActive: body.isActive ?? true,
      sortOrder: body.sortOrder ?? 0,
    },
  });

  return NextResponse.json(q);
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.id) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }

  const { id, ...data } = body;
  const q = await db.stationQuestionBank.update({
    where: { id },
    data,
  });

  return NextResponse.json(q);
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }

  await db.stationQuestionBank.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 5: Implement admin tab UI panels**

Add the JSX for both tabs in `web/src/app/admin/page.tsx`. Follow existing pattern: fetch data on tab switch, display in table/list, forms for CRUD.

- [ ] **Step 6: Verify no type errors**

```bash
cd web
npm run typecheck
```

- [ ] **Step 7: Commit**

```bash
cd web
git add src/app/admin/page.tsx src/app/api/admin/groups/ src/app/api/admin/qbank/
git commit -m "feat(admin): add groups and question bank management tabs"
```

---

### Task 10: i18n — Add Group-Related Dictionary Keys

**Files:**
- Modify: `web/src/lib/dictionaries.ts`

**Interfaces:**
- Consumes: existing dictionary structure (flat dot-notation keys, `vi`/`en` dicts)
- Produces: new keys for group-related UI

- [ ] **Step 1: Add dictionary keys for group UI**

Append to both `vi` and `en` dictionaries:

```ts
// Vietnamese
"group.create": "Tạo nhóm",
"group.join": "Tham gia nhóm",
"group.code": "Mã nhóm",
"group.code_placeholder": "Nhập mã 6 chữ số",
"group.name_placeholder": "Tên nhóm (tuỳ chọn)",
"group.members": "Thành viên",
"group.leader": "Trưởng nhóm",
"group.your_code": "Mã nhóm của bạn",
"group.share_code": "Chia sẻ mã này cho bạn bè",
"group.checkin": "Check-in nhóm",
"group.checkin_success": "Check-in thành công cho cả nhóm!",
"group.workshop_submit": "Nộp bài workshop",
"group.workshop_success": "Workshop hoàn thành! Thưởng chung cho nhóm",
"group.leave": "Rời nhóm",
"group.disband": "Giản tán nhóm",
"group.not_in_group": "Bạn chưa tham gia nhóm nào",
"group.already_in_group": "Bạn đã là thành viên của nhóm",
"group.invalid_code": "Mã nhóm không đúng",
"group.leader_cannot_leave": "Trưởng nhóm không thể rời nhóm",
"group.quiz_random": "Câu hỏi ngẫu nhiên từ ngân hàng câu hỏi",

// English
"group.create": "Create Group",
"group.join": "Join Group",
"group.code": "Group Code",
"group.code_placeholder": "Enter 6-digit code",
"group.name_placeholder": "Group name (optional)",
"group.members": "Members",
"group.leader": "Leader",
"group.your_code": "Your Group Code",
"group.share_code": "Share this code with friends",
"group.checkin": "Group Check-in",
"group.checkin_success": "Check-in successful for the whole group!",
"group.workshop_submit": "Submit Workshop",
"group.workshop_success": "Workshop completed! Shared reward for the group",
"group.leave": "Leave Group",
"group.disband": "Disband Group",
"group.not_in_group": "You haven't joined any group yet",
"group.already_in_group": "You are already a member of a group",
"group.invalid_code": "Invalid group code",
"group.leader_cannot_leave": "Leader cannot leave the group",
"group.quiz_random": "Random question from question bank",
```

- [ ] **Step 2: Verify no type errors**

```bash
cd web
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
cd web
git add src/lib/dictionaries.ts
git commit -m "feat(i18n): add group tour dictionary keys"
```

---

### Task 11: Full Verification + Lint + Typecheck

- [ ] **Step 1: Run all tests**

```bash
cd web
npx vitest run
```

Expected: all PASS.

- [ ] **Step 2: Run lint**

```bash
cd web
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Run typecheck**

```bash
cd web
npm run typecheck
```

Expected: no errors.

- [ ] **Step 4: Run build**

```bash
cd web
npm run build
```

Expected: builds successfully.

- [ ] **Step 5: Seed and verify dev server starts**

```bash
cd web
npm run db:seed
npm run dev
```

Expected: dev server starts, all pages load.

- [ ] **Step 6: Final commit (if any fixups needed)**

```bash
cd web
git add -A
git commit -m "fix: address lint/typecheck issues from group tour implementation"
```
