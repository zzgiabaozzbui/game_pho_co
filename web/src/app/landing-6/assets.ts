/**
 * Bản đồ asset của landing-6 — nguồn sự thật duy nhất về đường dẫn.
 *
 * ═══ LUẬT CỨNG ═══════════════════════════════════════════════════════════
 * KHÔNG BAO GIỜ có URL ngoài trong file này. Mọi path phải bắt đầu bằng
 * `/landing-6/` (trỏ tới `web/public/landing-6/`). Một URL bên thứ ba ở đây
 * là vi phạm bản quyền và làm rớt cổng kiểm tra T27 — đó chính là khiếm
 * khuyết của `landing-5/assets.ts` mà bản này sinh ra để thay thế.
 * ═════════════════════════════════════════════════════════════════════════
 *
 * T04 kiểm kê xong (`docs/plans/landing-6-assets.md`): 6 asset procedural đã
 * sản xuất và thêm vào READY bên dưới; phần còn lại (new-art: ảnh/video minh
 * hoạ, chest render 2D) chưa tồn tại — `resolveAsset()` trả PLACEHOLDER cho
 * tới khi từng file được thêm và path được thêm vào READY.
 */

export const PLACEHOLDER = "__placeholder__" as const;

/**
 * Path của asset đã thực sự nằm trong `web/public`. Thêm path vào đây NGAY khi
 * file được commit — quên là component vẫn vẽ ô rỗng dù ảnh đã có.
 */
const READY: ReadonlySet<string> = new Set<string>([
  // T04 — procedural, sản xuất ngay (xem docs/plans/landing-6-assets.md).
  "/landing-6/images/common/noise.webp",
  "/landing-6/images/hero/emblem-pho-gradient.webp",
  "/landing-6/images/hero/emblem-pho-diffuse.webp",
  "/landing-6/images/tableau-factions/scan.webp",
  "/landing-6/svg/old-quarter-map.svg",
  "/landing-6/svg/wordmark-pho-co.svg",
]);

/** PLACEHOLDER nếu file chưa tồn tại, ngược lại trả chính path đó. */
export function resolveAsset(path: string): string | typeof PLACEHOLDER {
  return READY.has(path) ? path : PLACEHOLDER;
}

/** Nhãn cho ô placeholder: lấy tên file, bỏ đuôi. */
export function assetLabel(path: string): string {
  return path.split("/").pop()?.replace(/\.[^.]+$/, "") ?? path;
}

/** Nhóm theo chương, khớp id trong `landing-6.data.ts`. */
export const assets = {
  hero: {
    emblemDiffuse: "/landing-6/images/hero/emblem-pho-diffuse.webp",
    emblemGradient: "/landing-6/images/hero/emblem-pho-gradient.webp",
    noise: "/landing-6/images/common/noise.webp",
  },
  storyIntro: {
    teaserPoster: "/landing-6/images/story-intro/teaser-poster.webp",
    teaserVideo: "/landing-6/videos/teaser-1080.mp4",
    sideMedia: "/landing-6/images/story-intro/side-media.webp",
  },
  storyProject: {
    topoVideo: "/landing-6/videos/topo-loop.mp4",
    keeperSprite: "/landing-6/sprites/keeper-sheet.webp",
    mapOldQuarter: "/landing-6/svg/old-quarter-map.svg",
  },
  collectionIntro: {
    chestFront: "/landing-6/images/collection/chest-front.webp",
    chestBack: "/landing-6/images/collection/chest-back.webp",
  },
  /** 12 card nguyên liệu, id khớp `gallery.cards[].id`. */
  gallery: {
    cards: {
      "banh-pho": "/landing-6/images/gallery/banh-pho.webp",
      "nuoc-dung": "/landing-6/images/gallery/nuoc-dung.webp",
      que: "/landing-6/images/gallery/que.webp",
      hoi: "/landing-6/images/gallery/hoi.webp",
      "gung-nuong": "/landing-6/images/gallery/gung-nuong.webp",
      hanh: "/landing-6/images/gallery/hanh.webp",
      gau: "/landing-6/images/gallery/gau.webp",
      chin: "/landing-6/images/gallery/chin.webp",
      tai: "/landing-6/images/gallery/tai.webp",
      "thao-qua": "/landing-6/images/gallery/thao-qua.webp",
      mam: "/landing-6/images/gallery/mam.webp",
      "chanh-ot": "/landing-6/images/gallery/chanh-ot.webp",
    },
  },
  /** Tableau là multiplane — mỗi lớp một file, thứ tự từ xa tới gần. */
  tableauKeep: {
    layers: [
      "/landing-6/images/tableau-keep/00-sky.webp",
      "/landing-6/images/tableau-keep/01-facade.webp",
      "/landing-6/images/tableau-keep/02-cart.webp",
      "/landing-6/images/tableau-keep/03-stove.webp",
      "/landing-6/images/tableau-keep/04-steam.webp",
    ],
  },
  tableauFactions: {
    bac: "/landing-6/images/tableau-factions/bac.webp",
    nam: "/landing-6/images/tableau-factions/nam.webp",
    scanline: "/landing-6/images/tableau-factions/scan.webp",
  },
  tableauWorld: {
    layers: [
      "/landing-6/images/tableau-world/00-sky-night.webp",
      "/landing-6/images/tableau-world/01-rooftops.webp",
      "/landing-6/images/tableau-world/02-street.webp",
      "/landing-6/images/tableau-world/03-neon.webp",
    ],
  },
  launch: {
    fanCards: [
      "/landing-6/images/launch/card-01.webp",
      "/landing-6/images/launch/card-02.webp",
      "/landing-6/images/launch/card-03.webp",
    ],
    qr: "/landing-6/images/launch/qr-chest.webp",
  },
  footer: {
    wordmark: "/landing-6/svg/wordmark-pho-co.svg",
  },
} as const;
