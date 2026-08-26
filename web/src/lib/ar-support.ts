export type ArMode = "webxr" | "quicklook" | "inline";

interface NavLike {
  userAgent: string;
  maxTouchPoints: number;
  xr?: { isSessionSupported(mode: string): Promise<boolean> };
}

export async function detectRenderMode(nav: NavLike = navigator): Promise<ArMode> {
  try {
    if (nav.xr && (await nav.xr.isSessionSupported("immersive-ar"))) return "webxr";
  } catch {
    // thiết bị/khung không hỗ trợ → rơi xuống detect iOS/inline
  }
  const ios =
    /iPad|iPhone|iPod/.test(nav.userAgent) ||
    (nav.userAgent.includes("Macintosh") && nav.maxTouchPoints > 1);
  return ios ? "quicklook" : "inline";
}
