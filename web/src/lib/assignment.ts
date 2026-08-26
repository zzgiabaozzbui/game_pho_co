import { PrismaClient } from "@/generated/prisma/client";

export interface AssignResult {
  assignmentId: number;
  partnerId: number;
  partnerName: string;
  partnerAddress: string | null;
  partnerDescription: string | null;
  partnerGoogleMapsUrl: string | null;
  workshopTaskId: number | null;
  task: {
    id: number;
    instructionVi: string;
    instructionEn: string;
    photoReqsVi: string;
    photoReqsEn: string;
    quizQuestionVi: string | null;
    quizQuestionEn: string | null;
    quizOptions: { vi: string; en: string }[] | null;
    quizCorrectIndex: number | null;
    rewardPoints: number;
  } | null;
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
    partnerAddress: partner.address ?? null,
    partnerDescription: partner.description ?? null,
    partnerGoogleMapsUrl: partner.googleMapsUrl ?? null,
    workshopTaskId: task?.id ?? null,
    task: task
      ? {
          id: task.id,
          instructionVi: task.instructionVi,
          instructionEn: task.instructionEn,
          photoReqsVi: task.photoReqsVi,
          photoReqsEn: task.photoReqsEn,
          quizQuestionVi: task.quizQuestionVi,
          quizQuestionEn: task.quizQuestionEn,
          quizOptions: task.quizOptionsJson
            ? (JSON.parse(task.quizOptionsJson) as { vi: string; en: string }[])
            : null,
          quizCorrectIndex: task.quizCorrectIndex,
          rewardPoints: task.rewardPoints,
        }
      : null,
  };
}
