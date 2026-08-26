# Hệ thống Đối tác & Thử thách Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm hệ thống quản lý đối tác (workshop, bảo tàng), thử thách (quiz/workshop), phân phối khách round-robin, và upload/duyệt ảnh workshop.

**Architecture:** Prisma schema mở rộng (Partner, StationPartner, WorkshopTask, GuestAssignment) → pure-engine assignment trong `src/lib/assignment.ts` → API CRUD partner/challenge + assignment + workshop submit → Admin UI 2 tab mới (Đối tác, Thử thách) + sửa 2 tab cũ (Trạm, Duyệt ảnh) → Client-side workshop flow trong StationFlow.

**Tech Stack:** Next.js 16 App Router · Prisma 7 (SQLite dev, kiểu portable) · Zod validators · Tailwind v4 · vitest.

**Spec:** `docs/superpowers/specs/2026-08-27-partner-challenge-system-design.md`

## Global Constraints

- Schema Prisma CHỈ dùng kiểu portable (String/Int/Float/Boolean/DateTime) — không Json type.
- Cấm chuỗi cứng tiếng Việt trong JSX người chơi — mọi chuỗi mới phải thêm cả VI + EN vào `src/lib/dictionaries.ts`.
- POST mới phải đi qua `rateLimit()` từ `src/lib/rate-limit.ts`.
- PrismaClient bắt buộc truyền driver adapter (xem `src/lib/db.ts` — đã có, tái dùng).
- Lint: `npm run lint` · Typecheck: `npm run typecheck` · Test: `npm run test` (trong `web/`).
- Lệnh test 1 file: `npx vitest run src/lib/<file>.test.ts` (trong `web/`).
- `DATABASE_URL="file:./dev.db"` resolve theo cwd `web/`.

---

## File Map

### Tạo mới
| File | Trách nhiệm |
|---|---|
| `src/lib/assignment.ts` | Round-robin engine — pure function, testable |
| `src/lib/assignment.test.ts` | Unit test cho assignment logic |
| `src/app/api/admin/partners/route.ts` | GET + POST partner |
| `src/app/api/admin/partners/[id]/route.ts` | PUT + DELETE partner |
| `src/app/api/admin/challenges/route.ts` | GET + POST workshop task |
| `src/app/api/admin/challenges/[id]/route.ts` | PUT + DELETE workshop task |
| `src/app/api/assign/route.ts` | POST — guest request assignment |
| `src/app/api/workshop/submit/route.ts` | POST — guest upload ảnh workshop |

### Sửa
| File | Thay đổi |
|---|---|
| `prisma/schema.prisma` | Thêm Partner, StationPartner, WorkshopTask, GuestAssignment; sửa Station |
| `prisma/seed.ts` | Thêm sample partners + workshop tasks |
| `src/lib/validators.ts` | Thêm schemas mới |
| `src/lib/dictionaries.ts` | Thêm chuỗi vi/en |
| `src/lib/state.ts` | Mở rộng StateDTO cho workshop |
| `src/app/api/state/route.ts` | Thêm challengeType + assignment vào response |
| `src/app/api/admin/stations/route.ts` | POST thêm trạm mới |
| `src/app/api/admin/stations/[id]/route.ts` | DELETE soft trạm |
| `src/app/api/admin/reviews/route.ts` | Mở rộng cho workshop photos |
| `src/app/admin/page.tsx` | Thêm 2 tab mới + sửa StationsTab + ReviewsTab |
| `src/app/play/station/[slug]/station-flow.tsx` | Thêm workshop flow |

---

### Task 1: Prisma Schema + Regenerate

**Files:**
- Modify: `web/prisma/schema.prisma`

**Interfaces:**
- Produces: models `Partner`, `StationPartner`, `WorkshopTask`, `GuestAssignment`; field `Station.challengeType String @default("QUIZ")`

- [ ] **Step 1: Thêm models mới vào schema.prisma**

Thêm vào cuối file (sau model DropRule):

```prisma
// ===== Hệ thống Đối tác & Thử thách (spec 2026-08-27) =====

model Partner {
  id            Int      @id @default(autoincrement())
  name          String
  phone         String?
  address       String?
  description   String?
  googleMapsUrl String?
  lat           Float?
  lng           Float?
  imageUrl      String?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  stationPartners  StationPartner[]
  workshopTasks    WorkshopTask[]
  guestAssignments GuestAssignment[]
}

model StationPartner {
  id        Int     @id @default(autoincrement())
  stationId Int
  partnerId Int
  station   Station @relation(fields: [stationId], references: [id])
  partner   Partner @relation(fields: [partnerId], references: [id])

  @@unique([stationId, partnerId])
}

model WorkshopTask {
  id               Int      @id @default(autoincrement())
  partnerId        Int
  stationId        Int
  instructionVi    String
  instructionEn    String
  photoReqsVi      String
  photoReqsEn      String
  quizQuestionVi   String?
  quizQuestionEn   String?
  quizOptionsJson  String?
  quizCorrectIndex Int?
  rewardPoints     Int      @default(50)
  sortOrder        Int      @default(0)
  createdAt        DateTime @default(now())

  partner          Partner   @relation(fields: [partnerId], references: [id])
  guestAssignments GuestAssignment[]
}

model GuestAssignment {
  id             Int       @id @default(autoincrement())
  guestId        String
  stationId      Int
  partnerId      Int
  workshopTaskId Int?
  assignedAt     DateTime  @default(now())
  completedAt    DateTime?
  status         String    @default("ASSIGNED")
  photoPath      String?
  reviewNote     String?
  reviewedBy     String?
  reviewedAt     DateTime?

  station      Station      @relation(fields: [stationId], references: [id])
  partner      Partner      @relation(fields: [partnerId], references: [id])
  workshopTask WorkshopTask? @relation(fields: [workshopTaskId], references: [id])

  @@index([stationId, partnerId])
  @@index([guestId, stationId])
}
```

- [ ] **Step 2: Thêm challengeType vào Station**

Trong model Station, thêm 1 dòng sau `hintEn`:

```prisma
  challengeType String   @default("QUIZ") // "QUIZ" | "WORKSHOP"
```

Và thêm relation vào relations section:

```prisma
  stationPartners  StationPartner[]
  workshopTasks    WorkshopTask[]
```

- [ ] **Step 3: Regenerate Prisma client**

Run: `npx prisma generate` (trong `web/`)
Expected: "Generated Prisma Client"

- [ ] **Step 4: Push schema to dev DB**

Run: `npx prisma db push` (trong `web/`)
Expected: "The database is now in sync with your Prisma schema"

- [ ] **Step 5: Verify lint + typecheck**

Run: `npm run lint && npm run typecheck` (trong `web/`)
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add web/prisma/schema.prisma
git commit -m "feat(schema): add Partner, StationPartner, WorkshopTask, GuestAssignment models"
```

---

### Task 2: Validators

**Files:**
- Modify: `web/src/lib/validators.ts`

**Interfaces:**
- Produces: `partnerCreateSchema`, `partnerUpdateSchema`, `workshopTaskCreateSchema`, `workshopTaskUpdateSchema`, `stationCreateSchema`, `stationDeleteSchema`, `assignRequestSchema`, `workshopSubmitSchema`

- [ ] **Step 1: Đọc validators hiện tại**

Đọc `web/src/lib/validators.ts` để hiểu pattern现有的 Zod schemas.

- [ ] **Step 2: Thêm Partner validators**

Thêm vào cuối file:

```typescript
// ===== Partner =====
export const partnerCreateSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().max(30).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  googleMapsUrl: z.string().url().max(2000).optional().nullable(),
  lat: z.number().min(-90).max(90).optional().nullable(),
  lng: z.number().min(-180).max(180).optional().nullable(),
  imageUrl: z.string().max(2000).optional().nullable(),
});

export const partnerUpdateSchema = partnerCreateSchema.partial().extend({
  id: z.number().int().positive(),
});

export const partnerDeleteSchema = z.object({
  id: z.number().int().positive(),
});
```

- [ ] **Step 3: Thêm WorkshopTask validators**

```typescript
// ===== WorkshopTask =====
export const workshopTaskCreateSchema = z.object({
  partnerId: z.number().int().positive(),
  stationId: z.number().int().positive(),
  instructionVi: z.string().min(1).max(500),
  instructionEn: z.string().min(1).max(500),
  photoReqsVi: z.string().min(1).max(500),
  photoReqsEn: z.string().min(1).max(500),
  quizQuestionVi: z.string().max(500).optional().nullable(),
  quizQuestionEn: z.string().max(500).optional().nullable(),
  quizOptionsJson: z.string().max(2000).optional().nullable(),
  quizCorrectIndex: z.number().int().min(0).optional().nullable(),
  rewardPoints: z.number().int().positive().default(50),
  sortOrder: z.number().int().min(0).default(0),
});

export const workshopTaskUpdateSchema = workshopTaskCreateSchema.partial().extend({
  id: z.number().int().positive(),
});

export const workshopTaskDeleteSchema = z.object({
  id: z.number().int().positive(),
});
```

- [ ] **Step 4: Thêm Station create/delete + Assignment validators**

```typescript
// ===== Station (mở rộng) =====
export const stationCreateSchema = z.object({
  slug: z.string().min(1).max(100),
  orderIndex: z.number().int().min(0),
  nameVi: z.string().min(1).max(200),
  nameEn: z.string().min(1).max(200),
  storyVi: z.string().default(""),
  storyEn: z.string().default(""),
  questionVi: z.string().default(""),
  questionEn: z.string().default(""),
  optionsJson: z.string().default("[]"),
  correctIndex: z.number().int().min(0).default(0),
  hintVi: z.string().default(""),
  hintEn: z.string().default(""),
  challengeType: z.enum(["QUIZ", "WORKSHOP"]).default("QUIZ"),
  lat: z.number(),
  lng: z.number(),
  radiusM: z.number().int().positive().default(120),
  qrToken: z.string().min(1).max(100),
});

export const stationDeleteSchema = z.object({
  id: z.number().int().positive(),
});

// ===== Assignment =====
export const assignRequestSchema = z.object({
  guestId: z.string().uuid(),
  stationId: z.number().int().positive(),
});

export const workshopSubmitSchema = z.object({
  guestId: z.string().uuid(),
  assignmentId: z.number().int().positive(),
  quizAnswer: z.number().int().min(0).optional(),
});
```

- [ ] **Step 5: Verify lint + typecheck**

Run: `npm run lint && npm run typecheck` (trong `web/`)
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add web/src/lib/validators.ts
git commit -m "feat(validators): add partner, workshop task, station create, assignment schemas"
```

---

### Task 3: Dictionary strings

**Files:**
- Modify: `web/src/lib/dictionaries.ts`

**Interfaces:**
- Produces: dictionary keys cho partner, challenge, assignment UI

- [ ] **Step 1: Thêm keys vào dictionary vi**

Trong object `vi`, thêm:

```typescript
// Partner
"partner.title": "Đối tác",
"partner.add": "Thêm đối tác",
"partner.edit": "Sửa đối tác",
"partner.name": "Tên đối tác",
"partner.phone": "Số điện thoại",
"partner.address": "Địa chỉ",
"partner.description": "Mô tả",
"partner.google_maps": "Link Google Maps",
"partner.lat": "Vĩ độ",
"partner.lng": "Kinh độ",
"partner.image": "Ảnh đại diện",
"partner.active": "Đang hoạt động",
"partner.inactive": "Ngừng hoạt động",
"partner.no_partners": "Chưa có đối tác nào",
"partner.confirm_delete": "Xóa đối tác này?",

// Challenge / Workshop
"challenge.title": "Thử thách",
"challenge.add": "Thêm nhiệm vụ",
"challenge.edit": "Sửa nhiệm vụ",
"challenge.type_quiz": "Câu hỏi",
"challenge.type_workshop": "Trải nghiệm workshop",
"challenge.instruction_vi": "Hướng dẫn (VI)",
"challenge.instruction_en": "Hướng dẫn (EN)",
"challenge.photo_reqs_vi": "Yêu cầu ảnh (VI)",
"challenge.photo_reqs_en": "Yêu cầu ảnh (EN)",
"challenge.quiz_question_vi": "Câu hỏi tuỳ chọn (VI)",
"challenge.quiz_question_en": "Câu hỏi tuỳ chọn (EN)",
"challenge.quiz_toggle": "Có câu hỏi bổ sung",
"challenge.reward_points": "Điểm thưởng",
"challenge.sort_order": "Thứ tự",
"challenge.no_tasks": "Chưa có nhiệm vụ nào",
"challenge.confirm_delete": "Xóa nhiệm vụ này?",
"challenge.select_partner": "Chọn đối tác",

// Assignment
"assign.assigned_to": "Bạn được giao đến",
"assign.go_to": "Đến",
"assign.task": "Thực hiện",
"assign.upload_photo": "Upload ảnh",
"assign.submit": "Gửi",
"assign.pending_review": "Đang chờ duyệt",
"assign.rejected": "Ảnh bị từ chối",
"assign.completed": "Hoàn thành",

// Station extensions
"station.new": "Thêm trạm mới",
"station.delete": "Xóa trạm",
"station.challenge_type": "Loại thử thách",
"station.select_partners": "Chọn đối tác",

// Reviews
"review.type_checkin": "Check-in",
"review.type_workshop": "Workshop",
"review.workshop_partner": "Đối tác",
"review.workshop_task": "Nhiệm vụ",
```

- [ ] **Step 2: Thêm keys vào dictionary en**

Trong object `en`, thêm:

```typescript
// Partner
"partner.title": "Partners",
"partner.add": "Add Partner",
"partner.edit": "Edit Partner",
"partner.name": "Partner Name",
"partner.phone": "Phone",
"partner.address": "Address",
"partner.description": "Description",
"partner.google_maps": "Google Maps Link",
"partner.lat": "Latitude",
"partner.lng": "Longitude",
"partner.image": "Avatar",
"partner.active": "Active",
"partner.inactive": "Inactive",
"partner.no_partners": "No partners yet",
"partner.confirm_delete": "Delete this partner?",

// Challenge / Workshop
"challenge.title": "Challenges",
"challenge.add": "Add Task",
"challenge.edit": "Edit Task",
"challenge.type_quiz": "Quiz",
"challenge.type_workshop": "Workshop Experience",
"challenge.instruction_vi": "Instruction (VI)",
"challenge.instruction_en": "Instruction (EN)",
"challenge.photo_reqs_vi": "Photo Requirements (VI)",
"challenge.photo_reqs_en": "Photo Requirements (EN)",
"challenge.quiz_question_vi": "Optional Question (VI)",
"challenge.quiz_question_en": "Optional Question (EN)",
"challenge.quiz_toggle": "Has follow-up question",
"challenge.reward_points": "Reward Points",
"challenge.sort_order": "Sort Order",
"challenge.no_tasks": "No tasks yet",
"challenge.confirm_delete": "Delete this task?",
"challenge.select_partner": "Select Partner",

// Assignment
"assign.assigned_to": "You are assigned to",
"assign.go_to": "Go to",
"assign.task": "Task",
"assign.upload_photo": "Upload Photo",
"assign.submit": "Submit",
"assign.pending_review": "Pending Review",
"assign.rejected": "Photo Rejected",
"assign.completed": "Completed",

// Station extensions
"station.new": "Add New Station",
"station.delete": "Delete Station",
"station.challenge_type": "Challenge Type",
"station.select_partners": "Select Partners",

// Reviews
"review.type_checkin": "Check-in",
"review.type_workshop": "Workshop",
"review.workshop_partner": "Partner",
"review.workshop_task": "Task",
```

- [ ] **Step 3: Verify typecheck** (TypeScript enforced completeness)

Run: `npm run typecheck` (trong `web/`)
Expected: PASS — missing keys sẽ lỗi type

- [ ] **Step 4: Commit**

```bash
git add web/src/lib/dictionaries.ts
git commit -m "feat(i18n): add partner, challenge, assignment dictionary keys"
```

---

### Task 4: Round-Robin Assignment Engine

**Files:**
- Create: `web/src/lib/assignment.ts`
- Create: `web/src/lib/assignment.test.ts`

**Interfaces:**
- Consumes: Prisma db instance, stationId (Int), guestId (String)
- Produces: `assignPartner(db, stationId, guestId)` → `{ assignmentId, partner, task }` or `null`

- [ ] **Step 1: Viết test cho round-robin logic**

```typescript
// web/src/lib/assignment.test.ts
import { describe, it, expect } from "vitest";
import { assignPartner } from "./assignment";

// Mock db — dùng in-memory hoặc mock pattern từ project
describe("assignPartner", () => {
  it("returns null for QUIZ station (no partners)", async () => {
    // Station with no partners → fallback to QUIZ behavior
    const db = {
      station: { findUnique: async () => ({ id: 1, challengeType: "QUIZ" }) },
      stationPartner: { findMany: async () => [] },
      guestAssignment: { findFirst: async () => null, create: async () => ({}), count: async () => 0, groupBy: async () => [] },
    };
    const result = await assignPartner(db as any, 1, "guest-uuid");
    expect(result).toBeNull();
  });

  it("returns existing assignment if guest already assigned", async () => {
    const existing = { id: 10, partnerId: 2, workshopTask: { id: 5 }, partner: { id: 2, name: "P2" } };
    const db = {
      station: { findUnique: async () => ({ id: 1, challengeType: "WORKSHOP" }) },
      stationPartner: { findMany: async () => [{ partnerId: 1 }, { partnerId: 2 }] },
      guestAssignment: {
        findFirst: async () => existing,
        create: async () => ({}),
        count: async () => 0,
        groupBy: async () => [],
      },
    };
    const result = await assignPartner(db as any, 1, "guest-uuid");
    expect(result?.assignmentId).toBe(10);
  });

  it("picks partner with fewest assignments", async () => {
    const db = {
      station: { findUnique: async () => ({ id: 1, challengeType: "WORKSHOP" }) },
      stationPartner: { findMany: async () => [{ partnerId: 1 }, { partnerId: 2 }] },
      guestAssignment: {
        findFirst: async () => null,
        create: async () => ({ id: 20, partnerId: 1 }),
        count: async () => 0,
        groupBy: async () => [
          { partnerId: 1, _count: { id: 5 } },
          { partnerId: 2, _count: { id: 3 } },
        ],
      },
      workshopTask: { findFirst: async () => ({ id: 100 }) },
    };
    const result = await assignPartner(db as any, 1, "guest-uuid");
    expect(result?.partnerId).toBe(2); // fewer assignments
  });
});
```

- [ ] **Step 2: Run test — cần fail**

Run: `npx vitest run src/lib/assignment.test.ts` (trong `web/`)
Expected: FAIL — `assignPartner` chưa tồn tại

- [ ] **Step 3: Implement assignment engine**

```typescript
// web/src/lib/assignment.ts
import { PrismaClient } from "@/generated/prisma";

interface AssignmentResult {
  assignmentId: number;
  partnerId: number;
  partner: { id: number; name: string; address: string | null; phone: string | null; description: string | null; googleMapsUrl: string | null };
  task: { id: number; instructionVi: string; instructionEn: string; photoReqsVi: string; photoReqsEn: string; quizQuestionVi: string | null; quizQuestionEn: string | null; quizOptionsJson: string | null; quizCorrectIndex: number | null; rewardPoints: number } | null;
}

export async function assignPartner(
  db: PrismaClient,
  stationId: number,
  guestId: string
): Promise<AssignmentResult | null> {
  // 1. Check station type
  const station = await db.station.findUnique({ where: { id: stationId } });
  if (!station || station.challengeType !== "WORKSHOP") return null;

  // 2. Check existing assignment
  const existing = await db.guestAssignment.findFirst({
    where: { guestId, stationId },
    include: { partner: true, workshopTask: true },
  });
  if (existing) {
    return {
      assignmentId: existing.id,
      partnerId: existing.partnerId,
      partner: existing.partner,
      task: existing.workshopTask,
    };
  }

  // 3. Get partners for this station
  const partners = await db.stationPartner.findMany({
    where: { stationId },
    orderBy: { partnerId: "asc" },
  });
  if (partners.length === 0) return null;

  // 4. Count assignments per partner
  const counts = await db.guestAssignment.groupBy({
    by: ["partnerId"],
    where: {
      stationId,
      status: { in: ["ASSIGNED", "COMPLETED"] },
    },
    _count: { id: true },
  });

  const countMap = new Map<number, number>();
  for (const c of counts) {
    countMap.set(c.partnerId, c._count.id);
  }

  // 5. Pick partner with fewest assignments (ties → lowest id)
  let bestPartnerId = partners[0].partnerId;
  let bestCount = countMap.get(bestPartnerId) ?? 0;
  for (const p of partners.slice(1)) {
    const cnt = countMap.get(p.partnerId) ?? 0;
    if (cnt < bestCount) {
      bestPartnerId = p.partnerId;
      bestCount = cnt;
    }
  }

  // 6. Get a workshop task for this partner+station
  const task = await db.workshopTask.findFirst({
    where: { partnerId: bestPartnerId, stationId },
    orderBy: { sortOrder: "asc" },
  });

  // 7. Create assignment
  const assignment = await db.guestAssignment.create({
    data: {
      guestId,
      stationId,
      partnerId: bestPartnerId,
      workshopTaskId: task?.id ?? null,
    },
  });

  // 8. Fetch partner info
  const partner = await db.partner.findUnique({ where: { id: bestPartnerId } });
  if (!partner) return null;

  return {
    assignmentId: assignment.id,
    partnerId: bestPartnerId,
    partner: { id: partner.id, name: partner.name, address: partner.address, phone: partner.phone, description: partner.description, googleMapsUrl: partner.googleMapsUrl },
    task: task ? {
      id: task.id, instructionVi: task.instructionVi, instructionEn: task.instructionEn,
      photoReqsVi: task.photoReqsVi, photoReqsEn: task.photoReqsEn,
      quizQuestionVi: task.quizQuestionVi, quizQuestionEn: task.quizQuestionEn,
      quizOptionsJson: task.quizOptionsJson, quizCorrectIndex: task.quizCorrectIndex,
      rewardPoints: task.rewardPoints,
    } : null,
  };
}
```

- [ ] **Step 4: Run test — cần pass**

Run: `npx vitest run src/lib/assignment.test.ts` (trong `web/`)
Expected: PASS

- [ ] **Step 5: Verify lint + typecheck**

Run: `npm run lint && npm run typecheck` (trong `web/`)
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add web/src/lib/assignment.ts web/src/lib/assignment.test.ts
git commit -m "feat(assignment): round-robin partner distribution engine with tests"
```

---

### Task 5: Seed Data

**Files:**
- Modify: `web/prisma/seed.ts`

**Interfaces:**
- Consumes: PrismaClient
- Produces: 3 sample partners, 2 station-partner links, 2 workshop tasks

- [ ] **Step 1: Thêm sample partners vào seed**

Trong `seed.ts`, sau phần seed ChestLoot, thêm:

```typescript
// ===== Sample Partners =====
const partners = [
  {
    name: "Xưởng Gỗ Sơn Son",
    phone: "0912 345 678",
    address: "42 Hàng Mã, Hoàn Kiếm, Hà Nội",
    description: "Trải nghiệm nghệ thuật sơn son thếp vàng trên gỗ truyền thống",
    lat: 21.0345,
    lng: 105.8522,
  },
  {
    name: "Bảo tàng Lịch sử Hà Nội",
    phone: "024 3825 2853",
    address: "216 Trần Quang Khải, Hoàn Kiếm, Hà Nội",
    description: "Khám phá lịch sử Hà Nội qua các hiện vật và trưng bày",
    lat: 21.0287,
    lng: 105.8522,
  },
  {
    name: "Workshop Giấy Dó",
    phone: "0987 654 321",
    address: "11 Hàng Bông, Hoàn Kiếm, Hà Nội",
    description: "Tự tay làm giấy dó truyền thống và viết thư pháp",
    lat: 21.0285,
    lng: 105.8482,
  },
];

for (const p of partners) {
  await db.partner.upsert({
    where: { id: 1 }, // fallback
    create: p,
    update: {},
  });
}

// Note: partner upsert cần chạy bằng raw hoặc loop createIfNotExist
// vì partner không có unique field ngoài id.
// DùngfindFirst + create pattern:
for (const pData of partners) {
  const existing = await db.partner.findFirst({ where: { name: pData.name } });
  if (!existing) {
    await db.partner.create({ data: pData });
  }
}
```

- [ ] **Step 2: Thêm sample station-partner links + workshop tasks**

```typescript
// ===== Sample Station-Partner Links =====
const hangMa = await db.station.findUnique({ where: { slug: "hang-ma" } });
const xuongGo = await db.partner.findFirst({ where: { name: "Xưởng Gỗ Sơn Son" } });
const giayDo = await db.partner.findFirst({ where: { name: "Workshop Giấy Dó" } });

if (hangMa && xuongGo) {
  await db.stationPartner.upsert({
    where: { stationId_partnerId: { stationId: hangMa.id, partnerId: xuongGo.id } },
    create: { stationId: hangMa.id, partnerId: xuongGo.id },
    update: {},
  });
}

if (hangMa && giayDo) {
  await db.stationPartner.upsert({
    where: { stationId_partnerId: { stationId: hangMa.id, partnerId: giayDo.id } },
    create: { stationId: hangMa.id, partnerId: giayDo.id },
    update: {},
  });
}

// ===== Sample Workshop Tasks =====
if (xuongGo && hangMa) {
  const existingTask = await db.workshopTask.findFirst({
    where: { partnerId: xuongGo.id, stationId: hangMa.id },
  });
  if (!existingTask) {
    await db.workshopTask.create({
      data: {
        partnerId: xuongGo.id,
        stationId: hangMa.id,
        instructionVi: "Đến xưởng và trải nghiệm kỹ thuật sơn son thếp vàng trên một món đồ gỗ nhỏ",
        instructionEn: "Visit the workshop and experience gold-leaf lacquer technique on a small wooden item",
        photoReqsVi: "1 ảnh chụp bạn đang thực hành sơn + 1 ảnh sản phẩm hoàn thành",
        photoReqsEn: "1 photo of you practicing lacquer + 1 photo of the finished product",
        quizQuestionVi: "Bạn vừa học kỹ thuật nào?",
        quizQuestionEn: "Which technique did you just learn?",
        quizOptionsJson: JSON.stringify([
          { vi: "Sơn son thếp vàng", en: "Gold-leaf lacquer" },
          { vi: "Gỗ khảm trai", en: "Mother-of-pearl inlay" },
          { vi: "Đúc đồng", en: "Bronze casting" },
        ]),
        quizCorrectIndex: 0,
        rewardPoints: 75,
      },
    });
  }
}
```

- [ ] **Step 3: Chạy seed**

Run: `npm run db:seed` (trong `web/`)
Expected: Seed thành công,partner + tasks mới xuất hiện trong DB

- [ ] **Step 4: Verify**

Run: `npx prisma studio` (trong `web/) hoặc kiểm tra qua admin API
Expected: Partner và WorkshopTask có dữ liệu mẫu

- [ ] **Step 5: Commit**

```bash
git add web/prisma/seed.ts
git commit -m "feat(seed): add sample partners, station-partner links, and workshop tasks"
```

---

### Task 6: Partner CRUD API

**Files:**
- Create: `web/src/app/api/admin/partners/route.ts`
- Create: `web/src/app/api/admin/partners/[id]/route.ts`

**Interfaces:**
- Consumes: `partnerCreateSchema`, `partnerUpdateSchema`, `partnerDeleteSchema` từ validators
- Produces: GET/POST `/api/admin/partners`, PUT/DELETE `/api/admin/partners/[id]`

- [ ] **Step 1: Tạo GET + POST /api/admin/partners**

Tạo file `web/src/app/api/admin/partners/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { partnerCreateSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const partners = await db.partner.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(partners);
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const rl = await rateLimit(req, { windowMs: 60_000, max: 30 });
  if (!rl.ok) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const body = await req.json();
  const parsed = partnerCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const partner = await db.partner.create({ data: parsed.data });
  return NextResponse.json(partner, { status: 201 });
}
```

- [ ] **Step 2: Tạo PUT + DELETE /api/admin/partners/[id]**

Tạo file `web/src/app/api/admin/partners/[id]/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { partnerUpdateSchema, partnerDeleteSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const rl = await rateLimit(req, { windowMs: 60_000, max: 30 });
  if (!rl.ok) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const { id } = await params;
  const body = await req.json();
  const parsed = partnerUpdateSchema.safeParse({ ...body, id: Number(id) });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { id: _, ...data } = parsed.data;
  const partner = await db.partner.update({ where: { id: Number(id) }, data });
  return NextResponse.json(partner);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const rl = await rateLimit(req, { windowMs: 60_000, max: 10 });
  if (!rl.ok) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const { id } = await params;
  const numId = Number(id);

  // Check if partner has active assignments
  const activeCount = await db.guestAssignment.count({
    where: { partnerId: numId, status: { in: ["ASSIGNED", "COMPLETED"] } },
  });
  if (activeCount > 0) {
    // Soft delete — just deactivate
    await db.partner.update({ where: { id: numId }, data: { isActive: false } });
    return NextResponse.json({ deactivated: true, activeCount });
  }

  // Hard delete if no active assignments
  await db.stationPartner.deleteMany({ where: { partnerId: numId } });
  await db.workshopTask.deleteMany({ where: { partnerId: numId } });
  await db.partner.delete({ where: { id: numId } });
  return NextResponse.json({ deleted: true });
}
```

- [ ] **Step 3: Verify lint + typecheck**

Run: `npm run lint && npm run typecheck` (trong `web/`)
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add web/src/app/api/admin/partners/
git commit -m "feat(api): partner CRUD endpoints"
```

---

### Task 7: Workshop Task CRUD API

**Files:**
- Create: `web/src/app/api/admin/challenges/route.ts`
- Create: `web/src/app/api/admin/challenges/[id]/route.ts`

**Interfaces:**
- Consumes: `workshopTaskCreateSchema`, `workshopTaskUpdateSchema`, `workshopTaskDeleteSchema`
- Produces: GET/POST `/api/admin/challenges`, PUT/DELETE `/api/admin/challenges/[id]`

- [ ] **Step 1: Tạo GET + POST /api/admin/challenges**

```typescript
// web/src/app/api/admin/challenges/route.ts
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { workshopTaskCreateSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const partnerId = searchParams.get("partnerId");

  const where = partnerId ? { partnerId: Number(partnerId) } : {};
  const tasks = await db.workshopTask.findMany({
    where,
    include: { partner: { select: { id: true, name: true } } },
    orderBy: [{ stationId: "asc" }, { sortOrder: "asc" }],
  });
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const rl = await rateLimit(req, { windowMs: 60_000, max: 30 });
  if (!rl.ok) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const body = await req.json();
  const parsed = workshopTaskCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const task = await db.workshopTask.create({ data: parsed.data });
  return NextResponse.json(task, { status: 201 });
}
```

- [ ] **Step 2: Tạo PUT + DELETE /api/admin/challenges/[id]**

```typescript
// web/src/app/api/admin/challenges/[id]/route.ts
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { workshopTaskUpdateSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const rl = await rateLimit(req, { windowMs: 60_000, max: 30 });
  if (!rl.ok) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const { id } = await params;
  const body = await req.json();
  const parsed = workshopTaskUpdateSchema.safeParse({ ...body, id: Number(id) });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { id: _, ...data } = parsed.data;
  const task = await db.workshopTask.update({ where: { id: Number(id) }, data });
  return NextResponse.json(task);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const rl = await rateLimit(req, { windowMs: 60_000, max: 10 });
  if (!rl.ok) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const { id } = await params;
  await db.workshopTask.delete({ where: { id: Number(id) } });
  return NextResponse.json({ deleted: true });
}
```

- [ ] **Step 3: Verify lint + typecheck**

Run: `npm run lint && npm run typecheck` (trong `web/`)
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add web/src/app/api/admin/challenges/
git commit -m "feat(api): workshop task CRUD endpoints"
```

---

### Task 8: Station CRUD Extensions

**Files:**
- Modify: `web/src/app/api/admin/stations/route.ts` — thêm POST
- Create: `web/src/app/api/admin/stations/[id]/route.ts` — DELETE soft

**Interfaces:**
- Consumes: `stationCreateSchema`, `stationDeleteSchema` từ validators
- Produces: POST `/api/admin/stations`, DELETE `/api/admin/stations/[id]`

- [ ] **Step 1: Đọc stations route hiện tại**

Đọc `web/src/app/api/admin/stations/route.ts` để hiểu pattern (GET + PUT hiện có).

- [ ] **Step 2: Thêm POST vào stations/route.ts**

Trong file hiện tại, thêm export function POST:

```typescript
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const rl = await rateLimit(req, { windowMs: 60_000, max: 10 });
  if (!rl.ok) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const body = await req.json();
  const parsed = stationCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Check uniqueness
  const existingSlug = await db.station.findUnique({ where: { slug: parsed.data.slug } });
  if (existingSlug) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }
  const existingOrder = await db.station.findUnique({ where: { orderIndex: parsed.data.orderIndex } });
  if (existingOrder) {
    return NextResponse.json({ error: "Order index already exists" }, { status: 409 });
  }

  const station = await db.station.create({ data: parsed.data });
  return NextResponse.json(station, { status: 201 });
}
```

- [ ] **Step 3: Tạo DELETE /api/admin/stations/[id]**

```typescript
// web/src/app/api/admin/stations/[id]/route.ts
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const rl = await rateLimit(req, { windowMs: 60_000, max: 10 });
  if (!rl.ok) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const { id } = await params;
  const numId = Number(id);

  // Soft delete — chỉ tắt isActive
  await db.station.update({ where: { id: numId }, data: { isActive: false } });
  return NextResponse.json({ deactivated: true });
}
```

- [ ] **Step 4: Verify lint + typecheck**

Run: `npm run lint && npm run typecheck` (trong `web/`)
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/app/api/admin/stations/
git commit -m "feat(api): station create + soft delete endpoints"
```

---

### Task 9: Assignment API + Workshop Submit API

**Files:**
- Create: `web/src/app/api/assign/route.ts`
- Create: `web/src/app/api/workshop/submit/route.ts`

**Interfaces:**
- Consumes: `assignPartner()` từ `src/lib/assignment.ts`, `assignRequestSchema`, `workshopSubmitSchema`
- Produces: POST `/api/assign`, POST `/api/workshop/submit`

- [ ] **Step 1: Tạo POST /api/assign**

```typescript
// web/src/app/api/assign/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assignPartner } from "@/lib/assignment";
import { assignRequestSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rl = await rateLimit(req, { windowMs: 60_000, max: 30 });
  if (!rl.ok) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const body = await req.json();
  const parsed = assignRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await assignPartner(db, parsed.data.stationId, parsed.data.guestId);
  if (!result) {
    return NextResponse.json({ error: "No partners available for this station" }, { status: 404 });
  }

  return NextResponse.json(result);
}
```

- [ ] **Step 2: Tạo POST /api/workshop/submit**

```typescript
// web/src/app/api/workshop/submit/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workshopSubmitSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rl = await rateLimit(req, { windowMs: 60_000, max: 10 });
  if (!rl.ok) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const body = await req.formData();
  const guestId = body.get("guestId") as string;
  const assignmentId = Number(body.get("assignmentId"));
  const quizAnswer = body.get("quizAnswer") ? Number(body.get("quizAnswer")) : undefined;
  const photo = body.get("photo") as File | null;

  const parsed = workshopSubmitSchema.safeParse({ guestId, assignmentId, quizAnswer });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Verify assignment exists and belongs to guest
  const assignment = await db.guestAssignment.findFirst({
    where: { id: assignmentId, guestId },
  });
  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }
  if (assignment.status !== "ASSIGNED") {
    return NextResponse.json({ error: "Assignment already submitted" }, { status: 409 });
  }

  // Save photo (tái dùng pattern từ checkin/photo)
  let photoPath: string | null = null;
  if (photo && photo.size > 0) {
    const bytes = await photo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `workshop-${assignmentId}-${Date.now()}.jpg`;
    // Save to public/uploads or similar (theo pattern hiện tại)
    const fs = await import("fs/promises");
    const path = await import("path");
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), buffer);
    photoPath = `/uploads/${filename}`;
  }

  // Update assignment
  await db.guestAssignment.update({
    where: { id: assignmentId },
    data: {
      status: "COMPLETED",
      photoPath,
      completedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true, assignmentId });
}
```

- [ ] **Step 3: Verify lint + typecheck**

Run: `npm run lint && npm run typecheck` (trong `web/`)
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add web/src/app/api/assign/ web/src/app/api/workshop/submit/
git commit -m "feat(api): assignment + workshop submit endpoints"
```

---

### Task 10: Reviews API Extension

**Files:**
- Modify: `web/src/app/api/admin/reviews/route.ts`

**Interfaces:**
- Consumes: GuestAssignment model
- Produces: GET response bao gồm cả workshop photos

- [ ] **Step 1: Đọc reviews route hiện tại**

Đọc `web/src/app/api/admin/reviews/route.ts`.

- [ ] **Step 2: Mở rộng GET để bao gồm workshop photos**

Trong GET handler, sau khi query CheckIn PENDING, thêm query GuestAssignment PENDING:

```typescript
// Workshop photos pending review
const pendingWorkshop = await db.guestAssignment.findMany({
  where: { status: "COMPLETED", photoPath: { not: null } },
  include: {
    partner: { select: { name: true } },
    workshopTask: { select: { instructionVi: true, instructionEn: true } },
    station: { select: { nameVi: true, nameEn: true, slug: true } },
  },
  orderBy: { assignedAt: "asc" },
});

// Mergeboth into response
const allPending = [
  ...pending.map(c => ({ ...c, type: "checkin" })),
  ...pendingWorkshop.map(a => ({ ...a, type: "workshop" })),
];
```

- [ ] **Step 3: Mở rộng POST (review decision) cho workshop**

Trong POST handler, thêm case cho `workshop` type:

```typescript
if (body.type === "workshop") {
  // body = { assignmentId, approve, note? }
  const assignment = await db.guestAssignment.update({
    where: { id: body.assignmentId },
    data: {
      status: body.approve ? "COMPLETED" : "REJECTED",
      reviewNote: body.note ?? null,
      reviewedAt: new Date(),
    },
  });

  // If approved, award points
  if (body.approve) {
    // TODO: award points via chest engine hoặc trực tiếp
    // Tạm thời cộng điểm trực tiếp
    const task = assignment.workshopTaskId
      ? await db.workshopTask.findUnique({ where: { id: assignment.workshopTaskId } })
      : null;
    if (task) {
      await db.player.update({
        where: { id: assignment.guestId },
        data: { score: { increment: task.rewardPoints } },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Verify lint + typecheck**

Run: `npm run lint && npm run typecheck` (trong `web/`)
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/app/api/admin/reviews/route.ts
git commit -m "feat(api): extend reviews to include workshop photo submissions"
```

---

### Task 11: State API Extension

**Files:**
- Modify: `web/src/lib/state.ts`

**Interfaces:**
- Consumes: Station.challengeType, GuestAssignment
- Produces: StateDTO includes `challengeType` per station

- [ ] **Step 1: Đọc state.ts hiện tại**

Đọc `web/src/lib/state.ts`.

- [ ] **Step 2: Thêm challengeType vào StationDTO**

Trong type `StationDTO`, thêm:

```typescript
challengeType: "QUIZ" | "WORKSHOP";
```

Trong `buildState`, thêm vào DTO build:

```typescript
challengeType: station.challengeType as "QUIZ" | "WORKSHOP",
```

- [ ] **Step 3: Verify lint + typecheck**

Run: `npm run lint && npm run typecheck` (trong `web/`)
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add web/src/lib/state.ts
git commit -m "feat(state): include challengeType in station DTO"
```

---

### Task 12: Admin UI — PartnersTab

**Files:**
- Modify: `web/src/app/admin/page.tsx`

**Interfaces:**
- Consumes: `/api/admin/partners` API
- Produces: PartnersTab component with CRUD form

- [ ] **Step 1: Thêm tab "Đối tác" vào admin page**

Trong type `Tab`, thêm `"partners"`:

```typescript
type Tab = "stations" | "reviews" | "qr" | "chests" | "partners" | "challenges";
```

Thêm vào tab bar tuple array:

```typescript
["partners", "Đối tác"],
["challenges", "Thử thách"],
```

Thêm conditional render:

```typescript
{tab === "partners" && <PartnersTab />}
{tab === "challenges" && <ChallengesTab />}
```

- [ ] **Step 2: Implement PartnersTab component**

Trong cùng file, thêm component:

```typescript
function PartnersTab() {
  const [partners, setPartners] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/admin/partners").then(r => r.json()).then(setPartners);
  }, []);

  const handleSave = async (data: any) => {
    if (editing) {
      await fetch(`/api/admin/partners/${editing.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/admin/partners", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    setShowForm(false);
    setEditing(null);
    fetch("/api/admin/partners").then(r => r.json()).then(setPartners);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa đối tác này?")) return;
    await fetch(`/api/admin/partners/${id}`, { method: "DELETE" });
    fetch("/api/admin/partners").then(r => r.json()).then(setPartners);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Đối tác</h3>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="rounded-lg bg-son px-3 py-1.5 text-sm font-semibold text-cream">
          + Thêm đối tác
        </button>
      </div>

      {/* Form modal — đơn giản: input fields cho tên, SĐT, địa chỉ, mô tả, Maps URL, lat, lng */}
      {showForm && (
        <PartnerForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {/* Danh sách */}
      <div className="space-y-2">
        {partners.map(p => (
          <div key={p.id} className="flex items-center justify-between rounded-xl border border-line/40 bg-white/60 p-3">
            <div>
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm text-ink-soft">{p.address}</div>
              <div className="text-sm text-ink-soft">{p.phone}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(p); setShowForm(true); }}
                className="text-sm text-son underline">Sửa</button>
              <button onClick={() => handleDelete(p.id)}
                className="text-sm text-red-600 underline">Xóa</button>
            </div>
          </div>
        ))}
        {partners.length === 0 && <p className="text-ink-soft">Chưa có đối tác nào</p>}
      </div>
    </div>
  );
}

function PartnerForm({ initial, onSave, onCancel }: { initial: any | null; onSave: (d: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState(initial ?? { name: "", phone: "", address: "", description: "", googleMapsUrl: "", lat: "", lng: "" });
  return (
    <div className="rounded-xl border border-line/40 bg-white p-4 space-y-3">
      <input placeholder="Tên đối tác *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
      <input placeholder="Số điện thoại" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
      <input placeholder="Địa chỉ" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
      <textarea placeholder="Mô tả" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
      <input placeholder="Link Google Maps" value={form.googleMapsUrl} onChange={e => setForm({ ...form, googleMapsUrl: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
      <div className="flex gap-2">
        <input placeholder="Vĩ độ" value={form.lat} onChange={e => setForm({ ...form, lat: e.target.value })} className="flex-1 rounded-lg border px-3 py-2" />
        <input placeholder="Kinh độ" value={form.lng} onChange={e => setForm({ ...form, lng: e.target.value })} className="flex-1 rounded-lg border px-3 py-2" />
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave({ ...form, lat: form.lat ? Number(form.lat) : null, lng: form.lng ? Number(form.lng) : null })}
          className="rounded-lg bg-son px-4 py-2 text-sm font-semibold text-cream">Lưu</button>
        <button onClick={onCancel} className="rounded-lg border px-4 py-2 text-sm">Hủy</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify lint + typecheck**

Run: `npm run lint && npm run typecheck` (trong `web/`)
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add web/src/app/admin/page.tsx
git commit -m "feat(admin): add PartnersTab with CRUD form"
```

---

### Task 13: Admin UI — ChallengesTab

**Files:**
- Modify: `web/src/app/admin/page.tsx`

**Interfaces:**
- Consumes: `/api/admin/challenges` API, `/api/admin/partners` API
- Produces: ChallengesTab component

- [ ] **Step 1: Implement ChallengesTab component**

```typescript
function ChallengesTab() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [filterPartner, setFilterPartner] = useState<string>("");
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/admin/partners").then(r => r.json()).then(setPartners);
  }, []);

  useEffect(() => {
    const url = filterPartner ? `/api/admin/challenges?partnerId=${filterPartner}` : "/api/admin/challenges";
    fetch(url).then(r => r.json()).then(setTasks);
  }, [filterPartner]);

  const handleSave = async (data: any) => {
    if (editing) {
      await fetch(`/api/admin/challenges/${editing.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/admin/challenges", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    setShowForm(false);
    setEditing(null);
    const url = filterPartner ? `/api/admin/challenges?partnerId=${filterPartner}` : "/api/admin/challenges";
    fetch(url).then(r => r.json()).then(setTasks);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa nhiệm vụ này?")) return;
    await fetch(`/api/admin/challenges/${id}`, { method: "DELETE" });
    const url = filterPartner ? `/api/admin/challenges?partnerId=${filterPartner}` : "/api/admin/challenges";
    fetch(url).then(r => r.json()).then(setTasks);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Nhiệm vụ Workshop</h3>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="rounded-lg bg-son px-3 py-1.5 text-sm font-semibold text-cream">
          + Thêm nhiệm vụ
        </button>
      </div>

      {/* Filter */}
      <select value={filterPartner} onChange={e => setFilterPartner(e.target.value)}
        className="rounded-lg border px-3 py-2 text-sm">
        <option value="">Tất cả đối tác</option>
        {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>

      {showForm && (
        <ChallengeForm
          partners={partners}
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      <div className="space-y-2">
        {tasks.map(t => (
          <div key={t.id} className="flex items-center justify-between rounded-xl border border-line/40 bg-white/60 p-3">
            <div>
              <div className="font-semibold">{t.partner?.name}</div>
              <div className="text-sm text-ink-soft">{t.instructionVi}</div>
              <div className="text-xs text-ink-soft">+{t.rewardPoints} điểm</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(t); setShowForm(true); }}
                className="text-sm text-son underline">Sửa</button>
              <button onClick={() => handleDelete(t.id)}
                className="text-sm text-red-600 underline">Xóa</button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-ink-soft">Chưa có nhiệm vụ nào</p>}
      </div>
    </div>
  );
}

function ChallengeForm({ partners, initial, onSave, onCancel }: { partners: any[]; initial: any | null; onSave: (d: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState(initial ?? {
    partnerId: "", stationId: "",
    instructionVi: "", instructionEn: "",
    photoReqsVi: "", photoReqsEn: "",
    hasQuiz: false, quizQuestionVi: "", quizQuestionEn: "",
    quizOptions: [{ vi: "", en: "" }, { vi: "", en: "" }, { vi: "", en: "" }],
    quizCorrectIndex: 0,
    rewardPoints: 50, sortOrder: 0,
  });

  return (
    <div className="rounded-xl border border-line/40 bg-white p-4 space-y-3">
      <select value={form.partnerId} onChange={e => setForm({ ...form, partnerId: Number(e.target.value) })} className="w-full rounded-lg border px-3 py-2">
        <option value="">Chọn đối tác *</option>
        {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <input placeholder="Station ID" value={form.stationId} onChange={e => setForm({ ...form, stationId: Number(e.target.value) })} className="w-full rounded-lg border px-3 py-2" />
      <textarea placeholder="Hướng dẫn (VI) *" value={form.instructionVi} onChange={e => setForm({ ...form, instructionVi: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
      <textarea placeholder="Hướng dẫn (EN) *" value={form.instructionEn} onChange={e => setForm({ ...form, instructionEn: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
      <input placeholder="Yêu cầu ảnh (VI) *" value={form.photoReqsVi} onChange={e => setForm({ ...form, photoReqsVi: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
      <input placeholder="Yêu cầu ảnh (EN) *" value={form.photoReqsEn} onChange={e => setForm({ ...form, photoReqsEn: e.target.value })} className="w-full rounded-lg border px-3 py-2" />

      {/* Quiz toggle */}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.hasQuiz} onChange={e => setForm({ ...form, hasQuiz: e.target.checked })} />
        Có câu hỏi bổ sung
      </label>

      {form.hasQuiz && (
        <>
          <input placeholder="Câu hỏi (VI)" value={form.quizQuestionVi} onChange={e => setForm({ ...form, quizQuestionVi: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
          <input placeholder="Câu hỏi (EN)" value={form.quizQuestionEn} onChange={e => setForm({ ...form, quizQuestionEn: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
          {form.quizOptions.map((opt: any, i: number) => (
            <div key={i} className="flex gap-2">
              <input placeholder={`Đáp án ${i + 1} (VI)`} value={opt.vi} onChange={e => {
                const opts = [...form.quizOptions]; opts[i] = { ...opts[i], vi: e.target.value }; setForm({ ...form, quizOptions: opts });
              }} className="flex-1 rounded-lg border px-3 py-2" />
              <input placeholder={`Đáp án ${i + 1} (EN)`} value={opt.en} onChange={e => {
                const opts = [...form.quizOptions]; opts[i] = { ...opts[i], en: e.target.value }; setForm({ ...form, quizOptions: opts });
              }} className="flex-1 rounded-lg border px-3 py-2" />
            </div>
          ))}
          <select value={form.quizCorrectIndex} onChange={e => setForm({ ...form, quizCorrectIndex: Number(e.target.value) })} className="w-full rounded-lg border px-3 py-2">
            {form.quizOptions.map((_: any, i: number) => <option key={i} value={i}>Đáp án {i + 1} đúng</option>)}
          </select>
        </>
      )}

      <input type="number" placeholder="Điểm thưởng" value={form.rewardPoints} onChange={e => setForm({ ...form, rewardPoints: Number(e.target.value) })} className="w-full rounded-lg border px-3 py-2" />

      <div className="flex gap-2">
        <button onClick={() => onSave({
          ...form,
          quizOptionsJson: form.hasQuiz ? JSON.stringify(form.quizOptions) : null,
          quizCorrectIndex: form.hasQuiz ? form.quizCorrectIndex : null,
          quizQuestionVi: form.hasQuiz ? form.quizQuestionVi : null,
          quizQuestionEn: form.hasQuiz ? form.quizQuestionEn : null,
        })}
          className="rounded-lg bg-son px-4 py-2 text-sm font-semibold text-cream">Lưu</button>
        <button onClick={onCancel} className="rounded-lg border px-4 py-2 text-sm">Hủy</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify lint + typecheck**

Run: `npm run lint && npm run typecheck` (trong `web/`)
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add web/src/app/admin/page.tsx
git commit -m "feat(admin): add ChallengesTab with workshop task CRUD form"
```

---

### Task 14: Admin UI — Station Tab Extensions

**Files:**
- Modify: `web/src/app/admin/page.tsx` (StationsTab component)

**Interfaces:**
- Consumes: challengeType field, partner list
- Produces: StationsTab mở rộng với challengeType picker + partner picker + add/delete

- [ ] **Step 1: Đọc StationsTab hiện tại**

Đọc StationsTab trong admin page để hiểu form hiện tại.

- [ ] **Step 2: Thêm challengeType dropdown vào StationsTab form**

Trong StationsTab, sau field `orderIndex`, thêm:

```tsx
<div>
  <label className="text-sm font-medium">Loại thử thách</label>
  <select
    value={station.challengeType ?? "QUIZ"}
    onChange={e => setStation({ ...station, challengeType: e.target.value })}
    className="w-full rounded-lg border px-3 py-2"
  >
    <option value="QUIZ">Câu hỏi (Quiz)</option>
    <option value="WORKSHOP">Trải nghiệm Workshop</option>
  </select>
</div>
```

- [ ] **Step 3: Hiển thị partner picker khi WORKSHOP**

```tsx
{station.challengeType === "WORKSHOP" && (
  <div>
    <label className="text-sm font-medium">Đối tác tại trạm này</label>
    <PartnerPicker stationId={station.id} />
  </div>
)}
```

Thêm component `PartnerPicker`:

```tsx
function PartnerPicker({ stationId }: { stationId: number }) {
  const [allPartners, setAllPartners] = useState<any[]>([]);
  const [linked, setLinked] = useState<number[]>([]);

  useEffect(() => {
    fetch("/api/admin/partners").then(r => r.json()).then(setAllPartners);
    // Fetch current links
    fetch(`/api/admin/stations/${stationId}/partners`).then(r => r.json()).then(d => setLinked(d.map((sp: any) => sp.partnerId)));
  }, [stationId]);

  const toggle = async (partnerId: number) => {
    const next = linked.includes(partnerId)
      ? linked.filter(id => id !== partnerId)
      : [...linked, partnerId];
    setLinked(next);
    // Save — PUT station với partnerIds
    await fetch(`/api/admin/stations/${stationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partnerIds: next }),
    });
  };

  return (
    <div className="space-y-1">
      {allPartners.map(p => (
        <label key={p.id} className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={linked.includes(p.id)} onChange={() => toggle(p.id)} />
          {p.name}
        </label>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Thêm nút "Thêm trạm mới" + "Xóa trạm"**

Trong StationsTab toolbar, thêm:

```tsx
<button onClick={() => { /* Reset form to empty, show "Save New" button */ }}
  className="rounded-lg bg-son px-3 py-1.5 text-sm font-semibold text-cream">
  + Thêm trạm
</button>

{station.id && (
  <button onClick={async () => {
    if (!confirm("Xóa trạm này?")) return;
    await fetch(`/api/admin/stations/${station.id}`, { method: "DELETE" });
    location.reload();
  }}
    className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600">
    Xóa trạm
  </button>
)}
```

- [ ] **Step 5: Verify lint + typecheck**

Run: `npm run lint && npm run typecheck` (trong `web/`)
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add web/src/app/admin/page.tsx
git commit -m "feat(admin): extend StationsTab with challenge type, partner picker, add/delete"
```

---

### Task 15: Admin UI — Reviews Extension

**Files:**
- Modify: `web/src/app/admin/page.tsx` (ReviewsTab component)

**Interfaces:**
- Consumes: Extended reviews API (workshop + checkin)
- Produces: ReviewsTab hiển thị cả 2 loại với tag phân biệt

- [ ] **Step 1: Đọc ReviewsTab hiện tại**

Đọc ReviewsTab trong admin page.

- [ ] **Step 2: Mở rộng ReviewsTab để hiển thị workshop photos**

Trong ReviewsTab, sửa response processing để xử lý cả `type: "checkin"` và `type: "workshop"`:

```tsx
// Tag phân biệt
{item.type === "workshop" && (
  <span className="rounded-full bg-jade/20 px-2 py-0.5 text-xs font-semibold text-jade">
    Workshop
  </span>
)}
{item.type === "checkin" && (
  <span className="rounded-full bg-son/20 px-2 py-0.5 text-xs font-semibold text-son">
    Check-in
  </span>
)}
```

Thêm hiển thị cho workshop:

```tsx
{item.type === "workshop" && (
  <div className="text-sm text-ink-soft">
    <div>Đối tác: {item.partner?.name}</div>
    <div>Nhiệm vụ: {item.workshopTask?.instructionVi}</div>
  </div>
)}
```

Sửa action handler để phân biệt 2 type khi approve/reject.

- [ ] **Step 3: Verify lint + typecheck**

Run: `npm run lint && npm run typecheck` (trong `web/`)
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add web/src/app/admin/page.tsx
git commit -m "feat(admin): extend ReviewsTab to show workshop photos with type tags"
```

---

### Task 16: Client-side Workshop Flow

**Files:**
- Modify: `web/src/app/play/station/[slug]/station-flow.tsx`

**Interfaces:**
- Consumes: `challengeType` từ StateDTO, `/api/assign`, `/api/workshop/submit`
- Produces: Workshop flow UI trong StationFlow

- [ ] **Step 1: Đọc StationFlow hiện tại**

Đọc `web/src/app/play/station/[slug]/station-flow.tsx` để hiểu flow hiện tại.

- [ ] **Step 2: Thêm workshop branch vào StationFlow**

Trong StationFlow, sau khi xác định station status, thêm branch:

```tsx
// Nếu WORKSHOP và chưa có assignment → gọi assign
useEffect(() => {
  if (station.challengeType === "WORKSHOP" && station.status !== "completed") {
    fetch("/api/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestId: playerId, stationId: station.id }),
    }).then(r => r.json()).then(setAssignment);
  }
}, [station.challengeType, station.status]);
```

Hiển thị workshop UI:

```tsx
{station.challengeType === "WORKSHOP" && assignment && (
  <div className="space-y-4 rounded-2xl bg-cream/40 p-4">
    <h3 className="font-semibold text-ink-strong">Trải nghiệm tại {assignment.partner.name}</h3>
    {assignment.partner.address && <p className="text-sm">{assignment.partner.address}</p>}
    {assignment.task && (
      <>
        <p>{assignment.task.instructionVi}</p>
        <p className="text-sm text-ink-soft">Yêu cầu: {assignment.task.photoReqsVi}</p>

        {/* Upload form */}
        <input type="file" accept="image/*" onChange={e => setWorkshopPhoto(e.target.files?.[0])} />

        {/* Optional quiz */}
        {assignment.task.quizQuestionVi && (
          <div>
            <p className="font-medium">{assignment.task.quizQuestionVi}</p>
            {JSON.parse(assignment.task.quizOptionsJson || "[]").map((opt: any, i: number) => (
              <label key={i} className="flex items-center gap-2">
                <input type="radio" name="quiz" value={i} onChange={() => setQuizAnswer(i)} />
                {opt.vi}
              </label>
            ))}
          </div>
        )}

        <button onClick={handleSubmitWorkshop} disabled={!workshopPhoto}
          className="rounded-xl bg-son px-4 py-2 text-sm font-semibold text-cream disabled:opacity-50">
          Gửi
        </button>
      </>
    )}
  </div>
)}
```

- [ ] **Step 3: Implement handleSubmitWorkshop**

```tsx
const handleSubmitWorkshop = async () => {
  const fd = new FormData();
  fd.append("guestId", playerId);
  fd.append("assignmentId", String(assignment.assignmentId));
  if (workshopPhoto) fd.append("photo", workshopPhoto);
  if (quizAnswer !== undefined) fd.append("quizAnswer", String(quizAnswer));

  const res = await fetch("/api/workshop/submit", { method: "POST", body: fd });
  if (res.ok) {
    setWorkshopSubmitted(true);
  }
};
```

- [ ] **Step 4: Verify lint + typecheck**

Run: `npm run lint && npm run typecheck` (trong `web/`)
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/app/play/station/[slug]/station-flow.tsx
git commit -m "feat(play): add workshop flow with assignment, upload, and optional quiz"
```

---

### Task 17: Integration Tests

**Files:**
- Create: `web/src/lib/__tests__/partner-api.test.ts` (hoặc theo pattern test hiện tại)

**Interfaces:**
- Consumes: All APIs đã tạo
- Produces: Test coverage cho partner CRUD, workshop CRUD, assignment, workshop submit

- [ ] **Step 1: Viết test cho Partner CRUD API**

```typescript
// Test partner API endpoints
// Pattern: dùng fetch trực tiếp hoặc supertest theo project pattern
describe("Partner API", () => {
  it("GET /api/admin/partners returns list", async () => { /* ... */ });
  it("POST /api/admin/partners creates partner", async () => { /* ... */ });
  it("PUT /api/admin/partners/:id updates partner", async () => { /* ... */ });
  it("DELETE /api/admin/partners/:id soft-deletes when active assignments", async () => { /* ... */ });
});
```

- [ ] **Step 2: Viết test cho Assignment flow**

```typescript
describe("Assignment", () => {
  it("assigns partner with fewest assignments", async () => { /* ... */ });
  it("returns existing assignment for repeat guest", async () => { /* ... */ });
  it("returns null for QUIZ station", async () => { /* ... */ });
});
```

- [ ] **Step 3: Chạy test**

Run: `npm run test` (trong `web/`)
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add web/src/lib/__tests__/
git commit -m "test: add integration tests for partner, challenge, assignment APIs"
```

---

### Task 18: Final Verification

**Files:**
- None (verification only)

- [ ] **Step 1: Lint**

Run: `npm run lint` (trong `web/`)
Expected: PASS

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck` (trong `web/`)
Expected: PASS

- [ ] **Step 3: Full test suite**

Run: `npm run test` (trong `web/`)
Expected: PASS

- [ ] **Step 4: Seed DB**

Run: `npm run db:seed` (trong `web/`)
Expected: Seed thành công với partners + tasks mới

- [ ] **Step 5: Dev server smoke test**

Run: `npm run dev` (trong `web/`)
- Mở `/admin` → kiểm tra tab "Đối tác" có load được
- Kiểm tra tab "Thử thách" có load được
- Kiểm tra tab "Trạm" có challengeType dropdown
- Test thêm/sửa/xóa partner
- Test thêm/sửa/xóa workshop task

- [ ] **Step 6: CHECKPOINT — commitment**

```bash
npm run lint && npm run typecheck && npm run test
```

Tất cả PASS → Sẵn sàng merge.
