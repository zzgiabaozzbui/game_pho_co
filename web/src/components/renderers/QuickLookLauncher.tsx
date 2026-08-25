"use client";

import { Box } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function QuickLookLauncher({
  modelUsdzPath,
}: {
  modelUsdzPath: string;
}) {
  const { t } = useLang();
  if (!modelUsdzPath) return null;
  return (
    <a
      href={modelUsdzPath}
      rel="ar"
      className="flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-bold text-timber shadow-lg active:scale-95"
    >
      <Box className="h-4 w-4" />
      {t("ar.quick_look")}
    </a>
  );
}
