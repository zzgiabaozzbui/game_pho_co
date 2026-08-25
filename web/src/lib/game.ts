export type StationStatus = "completed" | "checked_in" | "current";

export interface StationRef {
  slug: string;
  orderIndex: number;
}

export interface PlayerFlags {
  approvedSlugs: ReadonlySet<string>;
  solvedSlugs: ReadonlySet<string>;
}

/**
 * Luật tự do thứ tự: mọi trạm đều mở ngay từ đầu, du khách đến bất kỳ đâu trước.
 * completed = đã check-in (APPROVED) VÀ giải đúng đố; checked_in = mới check-in;
 * current = chưa check-in. Chuỗi gợi ý theo thứ tự chỉ mang tính tham khảo.
 */
export function computeStatuses<T extends StationRef>(
  stations: readonly T[],
  flags: PlayerFlags
): Map<string, StationStatus> {
  const result = new Map<string, StationStatus>();
  for (const s of stations) {
    const approved = flags.approvedSlugs.has(s.slug);
    const solved = flags.solvedSlugs.has(s.slug);
    if (approved && solved) result.set(s.slug, "completed");
    else if (approved) result.set(s.slug, "checked_in");
    else result.set(s.slug, "current");
  }
  return result;
}

export const BASE_POINTS = 100;
export const WRONG_ATTEMPT_PENALTY = 10;
export const HINT_PENALTY = 20;
export const MIN_POINTS = 50;

/** Điểm một trạm: 100 − phạt trả sai − phạt xem gợi ý, sàn 50. */
export function stationPoints(attempts: number, hintsUsed: number): number {
  let p = BASE_POINTS - attempts * WRONG_ATTEMPT_PENALTY;
  if (hintsUsed > 0) p -= HINT_PENALTY;
  return Math.max(MIN_POINTS, p);
}

/** Số điểm thực bị trừ khi lần đầu xem gợi ý, giữ contribution trạm không xuống dưới sàn 50. */
export function hintDeduction(attempts: number): number {
  return Math.min(
    HINT_PENALTY,
    Math.max(0, stationPoints(attempts, 0) - MIN_POINTS)
  );
}
