import { PrismaClient } from "@/generated/prisma/client";

export interface AssignResult {
  assignmentId: number;
  partnerId: number;
  partnerName: string;
  workshopTaskId: number | null;
}

export async function assignPartner(
  db: PrismaClient,
  stationId: number,
  guestId: string
): Promise<AssignResult | null> {
  const links = await db.stationPartner.findMany({
    where: { stationId },
    include: { partner: true },
  });

  if (links.length === 0) return null;

  const link = links[Math.floor(Math.random() * links.length)];
  const partner = link.partner;

  const task = await db.workshopTask.findFirst({
    where: { partnerId: partner.id, stationId },
    orderBy: { sortOrder: "asc" },
  });

  const assignment = await db.guestAssignment.create({
    data: {
      guestId,
      stationId,
      partnerId: partner.id,
      workshopTaskId: task?.id ?? null,
      status: "ASSIGNED",
    },
  });

  return {
    assignmentId: assignment.id,
    partnerId: partner.id,
    partnerName: partner.name,
    workshopTaskId: task?.id ?? null,
  };
}
