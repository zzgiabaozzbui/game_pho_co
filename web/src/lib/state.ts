import { db } from "@/lib/db";
import { computeStatuses, type StationStatus } from "@/lib/game";

export interface StationDTO {
  slug: string;
  orderIndex: number;
  nameVi: string;
  nameEn: string;
  lat: number;
  lng: number;
  radiusM: number;
  status: StationStatus;
  hasPendingPhoto: boolean;
  rejectedNote?: string;
  storyVi?: string;
  storyEn?: string;
  questionVi?: string;
  questionEn?: string;
  options?: { vi: string; en: string }[];
}

export interface StateDTO {
  playerId: string;
  score: number;
  done: number;
  total: number;
  completedAll: boolean;
  stations: StationDTO[];
}

export async function buildState(playerId: string): Promise<StateDTO | null> {
  const player = await db.player.findUnique({ where: { id: playerId } });
  if (!player) return null;

  const [stations, checkIns, answers] = await Promise.all([
    db.station.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: "asc" },
    }),
    db.checkIn.findMany({
      where: { playerId },
      select: { stationId: true, status: true, reviewNote: true },
    }),
    db.answer.findMany({
      where: { playerId, solved: true },
      select: { stationId: true },
    }),
  ]);

  const idToSlug = new Map(stations.map((s) => [s.id, s.slug] as const));
  const approvedSlugs = new Set(
    checkIns.filter((c) => c.status === "APPROVED").map((c) => idToSlug.get(c.stationId)!).filter(Boolean)
  );
  const solvedSlugs = new Set(
    answers.map((a) => idToSlug.get(a.stationId)!).filter(Boolean)
  );
  const pendingSlugs = new Set(
    checkIns.filter((c) => c.status === "PENDING").map((c) => idToSlug.get(c.stationId)!).filter(Boolean)
  );
  const lastRejection = new Map<string, string>();
  for (const c of checkIns) {
    if (c.status === "REJECTED") {
      const slug = idToSlug.get(c.stationId);
      if (slug) lastRejection.set(slug, c.reviewNote ?? "");
    }
  }

  const statuses = computeStatuses(stations, {
    approvedSlugs,
    solvedSlugs,
  });

  const dtoStations: StationDTO[] = stations.map((s) => {
    const status = statuses.get(s.slug) ?? "current";
    return {
      slug: s.slug,
      orderIndex: s.orderIndex,
      nameVi: s.nameVi,
      nameEn: s.nameEn,
      lat: s.lat,
      lng: s.lng,
      radiusM: s.radiusM,
      status,
      hasPendingPhoto: pendingSlugs.has(s.slug),
      ...(status === "current" &&
      !pendingSlugs.has(s.slug) &&
      lastRejection.has(s.slug)
        ? { rejectedNote: lastRejection.get(s.slug) }
        : {}),
      storyVi: s.storyVi,
      storyEn: s.storyEn,
      ...(approvedSlugs.has(s.slug)
        ? {
            questionVi: s.questionVi,
            questionEn: s.questionEn,
            options: JSON.parse(s.optionsJson) as { vi: string; en: string }[],
          }
        : {}),
    };
  });

  const done = [...statuses.values()].filter((x) => x === "completed").length;

  return {
    playerId,
    score: player.score,
    done,
    total: stations.length,
    completedAll: done > 0 && done === stations.length,
    stations: dtoStations,
  };
}
