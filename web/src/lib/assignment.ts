import { PrismaClient } from "@/generated/prisma/client";

interface AssignmentResult {
  assignmentId: number;
  partnerId: number;
  partner: {
    id: number;
    name: string;
    address: string | null;
    phone: string | null;
    description: string | null;
    googleMapsUrl: string | null;
  };
  task: {
    id: number;
    instructionVi: string;
    instructionEn: string;
    photoReqsVi: string;
    photoReqsEn: string;
    quizQuestionVi: string | null;
    quizQuestionEn: string | null;
    quizOptionsJson: string | null;
    quizCorrectIndex: number | null;
    rewardPoints: number;
  } | null;
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
    partner: {
      id: partner.id,
      name: partner.name,
      address: partner.address,
      phone: partner.phone,
      description: partner.description,
      googleMapsUrl: partner.googleMapsUrl,
    },
    task: task
      ? {
          id: task.id,
          instructionVi: task.instructionVi,
          instructionEn: task.instructionEn,
          photoReqsVi: task.photoReqsVi,
          photoReqsEn: task.photoReqsEn,
          quizQuestionVi: task.quizQuestionVi,
          quizQuestionEn: task.quizQuestionEn,
          quizOptionsJson: task.quizOptionsJson,
          quizCorrectIndex: task.quizCorrectIndex,
          rewardPoints: task.rewardPoints,
        }
      : null,
  };
}
