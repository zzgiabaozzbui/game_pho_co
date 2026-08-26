# Group Tour System Design

**Date**: 2026-08-27
**Status**: Approved
**Scope**: Persistent group model with shared check-in, individual quiz, shared workshop loot

---

## Overview

Add group/tour functionality to the game. Players form groups via a 6-digit code, move together through stations, share workshop tasks and loot, but keep individual quiz and quiz-based rewards.

### Core Behaviors

1. Leader creates group → receives 6-digit code → shares with members
2. Any member can check-in at a station → whole group gets check-in
3. Quiz questions randomized from question bank per station (group members get different questions)
4. Workshop tasks done together → shared workshop loot
5. Quiz drops/loot remain individual
6. No limit on group size

---

## Data Model

### New Models

```prisma
model Group {
  id        String         @id @default(uuid())
  code      String         @unique    // 6-digit code, auto-generated
  name      String?                     // optional group name
  leaderId  String
  createdAt DateTime       @default(now())
  members   GroupMember[]
  checkIns  GroupCheckIn[]
  workshopAssignments GroupWorkshopAssignment[]
  chests    ChestGrant[]              // group-sourced chests
}

model GroupMember {
  id        String   @id @default(uuid())
  groupId   String
  playerId  String
  role      String   @default("MEMBER") // "LEADER" | "MEMBER"
  joinedAt  DateTime @default(now())
  group     Group    @relation(fields: [groupId], references: [id], onDelete: Cascade)
  player    Player   @relation(fields: [playerId], references: [id], onDelete: Cascade)

  @@unique([groupId, playerId])
}

model GroupCheckIn {
  id          String   @id @default(uuid())
  groupId     String
  stationId   String
  byPlayerId  String              // who performed the check-in
  method      String              // "GPS" | "QR" | "PHOTO"
  status      String   @default("APPROVED") // "APPROVED" | "PENDING" | "REJECTED"
  createdAt   DateTime @default(now())
  group       Group    @relation(fields: [groupId], references: [id], onDelete: Cascade)
  station     Station  @relation(fields: [stationId], references: [id])
  byPlayer    Player   @relation(fields: [byPlayerId], references: [id])

  @@unique([groupId, stationId])
}

model StationQuestionBank {
  id            String  @id @default(uuid())
  stationId     String
  questionVi    String
  questionEn    String
  optionsJson   String                // JSON string: [{vi, en}]
  correctIndex  Int
  isActive      Boolean @default(true)
  sortOrder     Int     @default(0)
  station       Station @relation(fields: [stationId], references: [id], onDelete: Cascade)

  @@index([stationId])
}

model GroupWorkshopAssignment {
  id              String   @id @default(uuid())
  groupId         String
  workshopTaskId  String
  stationId       String
  status          String   @default("PENDING") // "PENDING" | "COMPLETED" | "REJECTED"
  photoPath       String?
  submittedBy     String?                     // playerId who submitted
  completedAt     DateTime?
  createdAt       DateTime @default(now())
  group           Group    @relation(fields: [groupId], references: [id], onDelete: Cascade)
  workshopTask    WorkshopTask @relation(fields: [workshopTaskId], references: [id])
  station         Station  @relation(fields: [stationId], references: [id])
  submitter       Player?  @relation(fields: [submittedBy], references: [id])

  @@unique([groupId, workshopTaskId])
}
```

### Modified Models

**Player** — add nullable group reference:
```prisma
model Player {
  // ... existing fields ...
  groupId         String?
  group           Group?   @relation(fields: [groupId], references: [id])
  groupMemberships GroupMember[]
  groupCheckInsMade GroupCheckIn[]  @relation("CheckInBy")
  groupBonusScore Int      @default(0) // total score from group workshops
}
```

**Station** — add question bank relation:
```prisma
model Station {
  // ... existing fields ...
  questionBank    StationQuestionBank[]
  groupCheckIns   GroupCheckIn[]
}
```

**WorkshopTask** — add group mode:
```prisma
model WorkshopTask {
  // ... existing fields ...
  groupMode       Boolean  @default(false)
  groupAssignments GroupWorkshopAssignment[]
}
```

**ChestGrant** — add optional group reference:
```prisma
model ChestGrant {
  // ... existing fields ...
  groupId         String?
  group           Group?   @relation(fields: [groupId], references: [id])
}
```

---

## API Design

### New Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/group/create` | Create group, returns `{groupId, code}` |
| POST | `/api/group/join` | Join group via `{code}`, adds GroupMember |
| GET | `/api/group/state` | Group state: members, check-ins, workshop status |
| POST | `/api/group/checkin` | Check-in for group `{stationId, method}` |
| POST | `/api/group/workshop/submit` | Submit workshop task for group |
| DELETE | `/api/group/leave` | Leave group (member only, not leader) |
| DELETE | `/api/group/disband` | Disband group (leader only) |

### Modified Endpoints

**GET /api/state** — add group fields:
```json
{
  "player": { "id", "score", "groupId", "groupName", "groupMembers": [...] },
  "stations": [...],
  "groupCheckIns": ["station-slug-1", "station-slug-2"]
}
```

**POST /api/checkin** — if player has groupId, also create GroupCheckIn

**POST /api/answer** — if groupMode workshop, chest grant includes groupId

**GET /api/chests** — returns both individual and group chests

---

## Quiz Bank Mechanism

1. Each station can have multiple questions in `StationQuestionBank`
2. Fallback: if bank is empty → use `Station.question` (backward compatible)
3. Random pick: deterministic seed = `hash(playerId + stationId + day)` → same player gets same question per day, but different players in same group get different questions
4. Individual attempt tracking via existing `Answer` model
5. Score formula unchanged: `100 - attempts*10 - (20 if hint)`, floor 50

### Admin UI

- New admin tab "Question Bank" at `/admin`
- CRUD operations per station
- Preview random pick before deploy

---

## Workshop Flow (Group Mode)

1. Player arrives at station with `challengeType=WORKSHOP`
2. If player has `groupId` and GroupCheckIn exists → create `GroupWorkshopAssignment`
3. Any member can submit workshop task (photo + quiz answer)
4. On completion:
   - WorkshopTask.rewardPoints added to each member's `groupBonusScore`
   - `ChestGrant(source=WORKSHOP, groupId)` created for the group
   - All members see the workshop chest in their collection

---

## Rewards & Loot Differentiation

| Source | Scope | Per | How received |
|--------|-------|-----|--------------|
| Quiz (STATION) | Individual | Player | Individual chest |
| Random drop (DROP) | Individual | Player | Individual chest |
| Achievement | Individual | Player | Individual chest |
| Workshop | Group | Group | Group chest (all members) |
| Final treasure | Group | Group | Group chest (all members) |

### Group Chest Mechanics

- `ChestGrant` with `groupId` set → belongs to group
- Opening: any member can open → loot snapshot saved → all members see it
- Individual drops continue to work independently of group status

---

## Backward Compatibility

- Player without group → all existing behavior unchanged
- Station without question bank → uses original `Station.question`
- WorkshopTask with `groupMode=false` → existing individual GuestAssignment flow
- Database migration: all new fields are nullable or have defaults

---

## Migration Strategy

1. Create new tables (Group, GroupMember, GroupCheckIn, StationQuestionBank, GroupWorkshopAssignment)
2. Add nullable fields to existing tables (Player.groupId, ChestGrant.groupId, WorkshopTask.groupMode)
3. No data loss — all changes are additive
