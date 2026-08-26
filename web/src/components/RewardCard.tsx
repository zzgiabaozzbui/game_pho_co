"use client";

import { Gift, PlayCircle, ScrollText } from "lucide-react";
import { useLang } from "@/lib/i18n";

export interface RevealLoot {
  type: string;
  pointsAmount?: number;
  storyVi?: string;
  storyEn?: string;
  imagePath?: string;
  youtubeUrl?: string;
}

export default function RewardCard({ item }: { item: RevealLoot }) {
  const { t, lang } = useLang();
  return (
    <li className="rounded-xl bg-cream px-4 py-3 text-sm shadow-lg ring-1 ring-line">
      {item.type === "POINTS" && (
        <span className="flex items-center gap-2 font-bold text-jade-deep">
          <Gift className="h-4 w-4 shrink-0" />
          {t("chest.reward_points", { points: item.pointsAmount ?? 0 })}
        </span>
      )}
      {item.type === "STORY" && (
        <span className="flex items-start gap-2 text-ink">
          <ScrollText className="mt-0.5 h-4 w-4 shrink-0 text-clay-deep" />
          <span className="italic leading-relaxed">
            {lang === "vi" ? item.storyVi : item.storyEn}
          </span>
        </span>
      )}
      {item.type === "VIDEO" && item.youtubeUrl && (
        <a
          href={item.youtubeUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 font-semibold text-son hover:underline"
        >
          <PlayCircle className="h-4 w-4 shrink-0" />
          {t("chest.watch_video")}
        </a>
      )}
      {item.type === "IMAGE" && item.imagePath && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={`/api/uploads/${item.imagePath}`}
          alt=""
          loading="lazy"
          decoding="async"
          className="max-h-48 w-full rounded-lg object-contain"
        />
      )}
    </li>
  );
}
