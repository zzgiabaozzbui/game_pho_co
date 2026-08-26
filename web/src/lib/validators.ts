import { z } from "zod";

export const playerIdSchema = z.string().uuid();

export const gpsCheckinSchema = z.object({
  playerId: playerIdSchema,
  slug: z.string().min(1).max(64),
  method: z.literal("GPS"),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const qrCheckinSchema = z.object({
  playerId: playerIdSchema,
  slug: z.string().min(1).max(64),
  method: z.literal("QR"),
  token: z.string().min(8).max(64),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const answerActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("answer"),
    playerId: playerIdSchema,
    slug: z.string().min(1).max(64),
    choice: z.number().int().min(0).max(9),
  }),
  z.object({
    action: z.literal("hint"),
    playerId: playerIdSchema,
    slug: z.string().min(1).max(64),
  }),
]);

const optionSchema = z
  .array(z.object({ vi: z.string().min(1), en: z.string().min(1) }))
  .min(2)
  .max(6);

export const stationUpdateSchema = z.object({
  slug: z.string().min(1).max(64),
  nameVi: z.string().min(1).max(120),
  nameEn: z.string().min(1).max(120),
  storyVi: z.string().min(1).max(4000),
  storyEn: z.string().min(1).max(4000),
  questionVi: z.string().min(1).max(1000),
  questionEn: z.string().min(1).max(1000),
  options: optionSchema,
  correctIndex: z.number().int().min(0).max(5),
  hintVi: z.string().min(1).max(2000),
  hintEn: z.string().min(1).max(2000),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radiusM: z.number().int().min(20).max(2000),
  orderIndex: z.number().int().min(1).max(999),
  isActive: z.boolean(),
  chestTierId: z.number().int().nullable().optional(),
});

export const chestPatchSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("tier"),
    id: z.number().int(),
    nameVi: z.string().min(1),
    nameEn: z.string().min(1),
    colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    modelGlbPath: z.string().regex(/^\/[A-Za-z0-9._/-]+$/, "site-relative path only"),
    modelUsdzPath: z.string().regex(/^\/[A-Za-z0-9._/-]+$/, "site-relative path only"),
  }),
  z.object({
    kind: z.literal("loot-create"),
    scopeKey: z.string().min(1),
    type: z.enum(["POINTS", "STORY", "IMAGE", "VIDEO"]),
    pointsAmount: z.number().int().optional(),
    storyVi: z.string().optional(),
    storyEn: z.string().optional(),
    imagePath: z.string().optional(),
    youtubeUrl: z
      .string()
      .regex(/^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//, "youtube link only")
      .optional(),
    sortOrder: z.number().int().default(0),
  }),
  z.object({ kind: z.literal("loot-delete"), id: z.number().int() }),
  z.object({
    kind: z.literal("loot-update"),
    id: z.number().int(),
    scopeKey: z.string().min(1).optional(),
    type: z.enum(["POINTS", "STORY", "IMAGE", "VIDEO"]).optional(),
    pointsAmount: z.number().int().optional(),
    storyVi: z.string().optional(),
    storyEn: z.string().optional(),
    imagePath: z.string().optional(),
    youtubeUrl: z
      .string()
      .regex(/^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//, "youtube link only")
      .optional(),
    sortOrder: z.number().int().optional(),
  }),
  z.object({
    kind: z.literal("drop-rule"),
    chancePct: z.number().int().min(0).max(100),
    rules: z.array(z.object({ tierKey: z.string(), weight: z.number().int().min(0) })).min(1),
  }),
  z.object({ kind: z.literal("regenerate_partner_token") }),
]);

export const reviewDecisionSchema = z.object({
  checkInId: z.number().int().positive(),
  approve: z.boolean(),
  note: z.string().max(500).optional(),
});

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
