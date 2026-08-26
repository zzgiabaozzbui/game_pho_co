import { describe, it, expect, vi } from "vitest";
import { assignPartner } from "./assignment";
import { PrismaClient } from "@/generated/prisma/client";

function mockDb(overrides: Record<string, unknown> = {}): PrismaClient {
  return {
    station: {
      findUnique: overrides.stationFindUnique ?? vi.fn().mockResolvedValue(null),
    },
    stationPartner: {
      findMany: overrides.stationPartnerFindMany ?? vi.fn().mockResolvedValue([]),
    },
    guestAssignment: {
      findFirst: overrides.guestAssignmentFindFirst ?? vi.fn().mockResolvedValue(null),
      create: overrides.guestAssignmentCreate ?? vi.fn().mockResolvedValue({ id: 1 }),
      groupBy: overrides.guestAssignmentGroupBy ?? vi.fn().mockResolvedValue([]),
    },
    workshopTask: {
      findFirst: overrides.workshopTaskFindFirst ?? vi.fn().mockResolvedValue(null),
    },
    partner: {
      findUnique: overrides.partnerFindUnique ?? vi.fn().mockResolvedValue(null),
    },
  } as unknown as PrismaClient;
}

describe("assignPartner", () => {
  it("returns null for QUIZ station", async () => {
    const db = mockDb({
      stationFindUnique: vi.fn().mockResolvedValue({ id: 1, challengeType: "QUIZ" }),
    });
    const result = await assignPartner(db, 1, "guest-uuid");
    expect(result).toBeNull();
  });

  it("returns null when station has no partners", async () => {
    const db = mockDb({
      stationFindUnique: vi.fn().mockResolvedValue({ id: 1, challengeType: "WORKSHOP" }),
      stationPartnerFindMany: vi.fn().mockResolvedValue([]),
    });
    const result = await assignPartner(db, 1, "guest-uuid");
    expect(result).toBeNull();
  });

  it("returns existing assignment if guest already assigned", async () => {
    const existing = {
      id: 10,
      partnerId: 2,
      partner: { id: 2, name: "P2", address: null, phone: null, description: null, googleMapsUrl: null },
      workshopTask: null,
    };
    const db = mockDb({
      stationFindUnique: vi.fn().mockResolvedValue({ id: 1, challengeType: "WORKSHOP" }),
      guestAssignmentFindFirst: vi.fn().mockResolvedValue(existing),
    });
    const result = await assignPartner(db, 1, "guest-uuid");
    expect(result?.assignmentId).toBe(10);
    expect(result?.partnerId).toBe(2);
  });

  it("picks partner with fewest assignments", async () => {
    const db = mockDb({
      stationFindUnique: vi.fn().mockResolvedValue({ id: 1, challengeType: "WORKSHOP" }),
      stationPartnerFindMany: vi.fn().mockResolvedValue([{ partnerId: 1 }, { partnerId: 2 }]),
      guestAssignmentGroupBy: vi.fn().mockResolvedValue([
        { partnerId: 1, _count: { id: 5 } },
        { partnerId: 2, _count: { id: 3 } },
      ]),
      guestAssignmentCreate: vi.fn().mockResolvedValue({ id: 20 }),
      partnerFindUnique: vi.fn().mockResolvedValue({ id: 2, name: "P2", address: null, phone: null, description: null, googleMapsUrl: null }),
    });
    const result = await assignPartner(db, 1, "guest-uuid");
    expect(result?.partnerId).toBe(2);
    expect(result?.assignmentId).toBe(20);
  });

  it("picks lowest id when assignment counts are equal", async () => {
    const db = mockDb({
      stationFindUnique: vi.fn().mockResolvedValue({ id: 1, challengeType: "WORKSHOP" }),
      stationPartnerFindMany: vi.fn().mockResolvedValue([{ partnerId: 1 }, { partnerId: 2 }]),
      guestAssignmentGroupBy: vi.fn().mockResolvedValue([
        { partnerId: 1, _count: { id: 3 } },
        { partnerId: 2, _count: { id: 3 } },
      ]),
      guestAssignmentCreate: vi.fn().mockResolvedValue({ id: 30 }),
      partnerFindUnique: vi.fn().mockResolvedValue({ id: 1, name: "P1", address: null, phone: null, description: null, googleMapsUrl: null }),
    });
    const result = await assignPartner(db, 1, "guest-uuid");
    expect(result?.partnerId).toBe(1);
  });
});
