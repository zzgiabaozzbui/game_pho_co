# T04 — Kiểm kê asset landing-6

Nguồn: `web/src/app/landing-6/assets.ts` (40 asset khai báo) đối chiếu
`web/src/app/landing-6/landing-6.data.ts` (nội dung từng chương) và
`web/src/app/landing-6/components/Frame.tsx` (đã build ở T07 — chỉ dùng nút
chữ, không tham chiếu icon nào, nên không cần thêm entry icon).

Cột **Source**: `procedural` (sinh lúc runtime/build, không cần file nghệ
thuật) · `reuse:<path>` (asset có sẵn trong repo) · `new-art` (cần vẽ/chụp/quay
mới, ngoài phạm vi task này).

| Path (từ assets.ts) | Chương | Mô tả | Format/kích thước đích | Source | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `images/hero/emblem-pho-diffuse.webp` | hero | Mặt nạ chữ "PHỞ" trắng/đen cho `EmblemShader` (T10) | webp 1024×1024 | procedural — **đã sản xuất** | P0 |
| `images/hero/emblem-pho-gradient.webp` | hero | Dải gradient map (đen→nâu→vàng brass→trắng ấm) tra màu cho emblem shader | webp 256×16 | procedural — **đã sản xuất** | P0 |
| `images/common/noise.webp` | hero (+ dùng chung) | Noise hạt mịn phủ lên emblem/HUD cho đỡ phẳng | webp 512×512 | procedural — **đã sản xuất** | P1 |
| `images/story-intro/teaser-poster.webp` | storyIntro | Poster tĩnh cho video teaser game, cảnh gánh phở sáng sớm | webp 1600×900 | hand-drawn SVG → webp — **đã sản xuất** | P0 |
| `videos/teaser-1080.mp4` | storyIntro | Video trailer giới thiệu game, 01:48 (khớp `videoDuration`) | mp4 1920×1080 | new-art (video, ngoài phạm vi — không có công cụ quay/dựng) | P1 |
| `images/story-intro/side-media.webp` | storyIntro | Ảnh/minh hoạ phụ cạnh khối trailer (lưới bất đối xứng 3 khối, T14) | webp 900×1200 | hand-drawn SVG → webp — **đã sản xuất** | P1 |
| `videos/topo-loop.mp4` | storyProject | Video loop hoạ tiết địa hình/toạ độ nền — hiệu ứng topographic | mp4 loop, vuông hoặc 16:9 | new-art (video, ngoài phạm vi — không có công cụ quay/dựng) | P2 |
| `sprites/keeper-sheet.webp` | storyProject | Nhân vật "người giữ lửa" — **thay thế bằng 1 ảnh tĩnh** (không phải spritesheet hoạt hình thật, xem ghi chú Nhật ký `landing-6.md`) | webp 1600×900 | hand-drawn SVG → webp — **đã sản xuất** (static, KHÔNG phải sprite động) | P1 |
| `svg/old-quarter-map.svg` | storyProject | Bản đồ cách điệu phố cổ (lưới đường trừu tượng, chấm toạ độ `N 21°01.7 / E 105°51.2`) | svg 800×600 | procedural — **đã sản xuất** | P1 |
| `images/collection/chest-front.webp` | collectionIntro | Mặt trước rương (card lật T16) | webp vuông ~800×800 | reuse:`web/public/models/chest-*.glb` — xem quyết định bên dưới | P1 |
| `images/collection/chest-back.webp` | collectionIntro | Mặt sau rương (card lật, mặt thông số) | webp vuông ~800×800 | reuse:`web/public/models/chest-*.glb` — xem quyết định bên dưới | P1 |
| `images/gallery/banh-pho.webp` | gallery | Card nguyên liệu: Bánh phở | webp 480×720 (2:3) | hand-drawn SVG → webp — **đã sản xuất** | P0 |
| `images/gallery/nuoc-dung.webp` | gallery | Card nguyên liệu: Nước dùng | webp 480×720 (2:3) | hand-drawn SVG → webp — **đã sản xuất** | P0 |
| `images/gallery/que.webp` | gallery | Card nguyên liệu: Quế | webp 480×720 (2:3) | hand-drawn SVG → webp — **đã sản xuất** | P0 |
| `images/gallery/hoi.webp` | gallery | Card nguyên liệu: Hoa hồi | webp 480×720 (2:3) | hand-drawn SVG → webp — **đã sản xuất** | P0 |
| `images/gallery/gung-nuong.webp` | gallery | Card nguyên liệu: Gừng nướng | webp 480×720 (2:3) | hand-drawn SVG → webp — **đã sản xuất** | P0 |
| `images/gallery/hanh.webp` | gallery | Card nguyên liệu: Hành | webp 480×720 (2:3) | hand-drawn SVG → webp — **đã sản xuất** | P0 |
| `images/gallery/gau.webp` | gallery | Card nguyên liệu: Gầu | webp 480×720 (2:3) | hand-drawn SVG → webp — **đã sản xuất** | P0 |
| `images/gallery/chin.webp` | gallery | Card nguyên liệu: Nạm chín | webp 480×720 (2:3) | hand-drawn SVG → webp — **đã sản xuất** | P0 |
| `images/gallery/tai.webp` | gallery | Card nguyên liệu: Thịt tái | webp 480×720 (2:3) | hand-drawn SVG → webp — **đã sản xuất** | P0 |
| `images/gallery/thao-qua.webp` | gallery | Card nguyên liệu: Thảo quả | webp 480×720 (2:3) | hand-drawn SVG → webp — **đã sản xuất** | P0 |
| `images/gallery/mam.webp` | gallery | Card nguyên liệu: Nước mắm | webp 480×720 (2:3) | hand-drawn SVG → webp — **đã sản xuất** | P0 |
| `images/gallery/chanh-ot.webp` | gallery | Card nguyên liệu: Chanh ớt | webp 480×720 (2:3) | hand-drawn SVG → webp — **đã sản xuất** | P0 |
| `images/tableau-keep/00-sky.webp` | tableauKeep | Lớp xa nhất: bầu trời/hậu cảnh Gánh Phở Cổ | webp 1600×1600 | hand-drawn SVG → webp — **đã sản xuất** | P0 |
| `images/tableau-keep/01-facade.webp` | tableauKeep | Lớp mặt tiền phố | webp 1900×700 (khớp tỉ lệ `bandFacade`) | hand-drawn SVG → webp — **đã sản xuất** | P0 |
| `images/tableau-keep/02-cart.webp` | tableauKeep | Lớp gánh phở (chủ thể chính) | webp 1600×760 (khớp tỉ lệ `bandCart`) | hand-drawn SVG → webp — **đã sản xuất** | P0 |
| `images/tableau-keep/03-stove.webp` | tableauKeep | Lớp bếp lò/nồi nước dùng, cận cảnh | webp 1200×800 (khớp tỉ lệ `bandStove`) | hand-drawn SVG → webp — **đã sản xuất** | P0 |
| `images/tableau-keep/04-steam.webp` | tableauKeep | Lớp khói/hơi nước, gần camera nhất | webp 1700×600, có alpha thật | hand-drawn SVG → webp — **đã sản xuất** | P1 |
| `images/tableau-factions/bac.webp` | tableauFactions | Cảnh minh hoạ Phở Bắc (nước trong, vị thanh — bát tối giản, ít garnish) | webp 1000×1300 | hand-drawn SVG → webp — **đã sản xuất** | P0 |
| `images/tableau-factions/nam.webp` | tableauFactions | Cảnh minh hoạ Phở Nam (rau sống, tương đen — bát đậm, nhiều garnish) | webp 1000×1300 | hand-drawn SVG → webp — **đã sản xuất** | P0 |
| `images/tableau-factions/scan.webp` | tableauFactions | Texture quét năng lượng ngăn giữa hai phe (đường quét ngang, fade 2 đầu) | webp tile 256×256 | procedural — **đã sản xuất** (T04, KHÔNG động vào lần này) | P1 |
| `images/tableau-world/00-sky-night.webp` | tableauWorld | Lớp bầu trời đêm | webp 1600×1600 | hand-drawn SVG → webp — **đã sản xuất** | P0 |
| `images/tableau-world/01-rooftops.webp` | tableauWorld | Lớp mái nhà phố cổ | webp 1900×560 (khớp tỉ lệ `bandRooftops`) | hand-drawn SVG → webp — **đã sản xuất** | P0 |
| `images/tableau-world/02-street.webp` | tableauWorld | Lớp mặt phố | webp 1700×680 (khớp tỉ lệ `bandStreet`) | hand-drawn SVG → webp — **đã sản xuất** | P0 |
| `images/tableau-world/03-neon.webp` | tableauWorld | Lớp biển hiệu/đèn neon, gần camera nhất | webp 1700×650 (khớp tỉ lệ `bandNeon`), có alpha thật | hand-drawn SVG → webp — **đã sản xuất** | P1 |
| `images/launch/card-01.webp` | launch | Card rương xoè quạt #1 (rương đóng — "chưa mở") | webp 480×720 (2:3) | hand-drawn SVG → webp — **đã sản xuất**, xem ghi chú | P1 |
| `images/launch/card-02.webp` | launch | Card rương xoè quạt #2 (rương mở, xu/đá quý tràn ra — "phần thưởng") | webp 480×720 (2:3) | hand-drawn SVG → webp — **đã sản xuất**, xem ghi chú | P1 |
| `images/launch/card-03.webp` | launch | Card rương xoè quạt #3 (huy hiệu bát phở bốc khói — "chính trò chơi là phần thưởng") | webp 480×720 (2:3) | hand-drawn SVG → webp — **đã sản xuất**, xem ghi chú | P1 |
| `images/launch/qr-chest.webp` | launch | QR code dẫn tới link chơi/nhận rương | webp 640×640, module đen/trắng | procedural, sinh bằng lib `qrcode` (không phải SVG vẽ tay) — **đã sản xuất**, xem ghi chú | P1 |
| `svg/wordmark-pho-co.svg` | footer | Wordmark "PHỞ CỔ" khổ lớn cho RevealFooter | svg 1200×220 | procedural — **đã sản xuất** | P1 |

## Tổng kết

- **Tổng: 40 asset** khai báo trong `assets.ts`.
- **Procedural: 6** — sản xuất xong trong task này, path đã thêm vào `READY`:
  `images/common/noise.webp`, `images/hero/emblem-pho-gradient.webp`,
  `images/hero/emblem-pho-diffuse.webp`, `images/tableau-factions/scan.webp`,
  `svg/old-quarter-map.svg`, `svg/wordmark-pho-co.svg`.
  (`images/launch/qr-chest.webp` cũng là procedural về bản chất — QR luôn
  sinh lúc runtime — nhưng **chưa sản xuất**: chưa có URL đích thật và việc tự
  viết encoder QR không "đơn giản" theo tiêu chí task này; xem quyết định bên
  dưới. Không tính vào con số 6 đã xong.)
- **Reuse: 2** (`chest-front.webp`, `chest-back.webp`) — từ
  `web/public/models/chest-*.glb` đã có trong repo (4 rương: common/epic/gold/grand).
  Không tái sản xuất ngay vì cần bake ảnh tĩnh từ model 3D (yêu cầu render
  headless, không có sẵn công cụ trong phiên này) — xem quyết định bên dưới.
- **New-art sản xuất xong (task T-assets-2): 15** — 12 card nguyên liệu
  gallery + 3 card launch fan, xem log ngày 2026-09-09 trong `landing-6.md`
  cho phương pháp (SVG vẽ tay → rasterize webp bằng `sharp`, không dùng
  render 3D/glb như phương án (a) ở "Quyết định không có trong spec" bên
  dưới đã gợi ý — xem cập nhật mục 1).
- **New-art sản xuất xong (task T-assets-3, cùng ngày): 14** — 9 lớp tableau
  (5 `tableauKeep` + 4 `tableauWorld`), 2 cảnh `tableauFactions`
  (`bac`/`nam`), 2 ảnh `storyIntro` (`teaser-poster`/`side-media`), 1 ảnh
  `storyProject.keeperSprite` (thay thế TĨNH, không phải spritesheet động —
  xem ghi chú Nhật ký `landing-6.md`). Cùng phương pháp SVG vẽ tay → `sharp`.
  Cộng thêm `images/launch/qr-chest.webp` sinh bằng lib `qrcode` (không phải
  vẽ tay) → **15 file mới** trong đợt này.
- **New-art còn cần: 2** — chỉ còn 2 file **video**, ngoài khả năng của agent
  (không có công cụ quay/dựng phim, chỉ có SVG vẽ tay + `sharp`):
  1. `videos/teaser-1080.mp4` — video trailer 01:48
  2. `videos/topo-loop.mp4` — video loop topographic

## Quyết định không có trong spec

1. **Rương (`chestFront`/`chestBack`) và 3 card launch fan**: repo đã có 4 model
   3D rương thật (`web/public/models/chest-{common,epic,gold,grand}.glb`) dùng
   cho game chính. `assets.ts` của landing-6 lại xin ảnh 2D webp (chest lật
   mặt trước/sau, card xoè quạt). Có hai hướng hợp lý cho T16/T21 sau này —
   **chưa chốt, để task thực thi chương đó quyết** (cập nhật: 3 `launch/
   card-*.webp` đã sản xuất bằng phương án (c) dưới đây; `chestFront`/
   `chestBack` của `collectionIntro` vẫn để ngỏ (a)/(b)):
   - (c) **[Đã dùng cho 3 launch card]** Không bake glb (không có công cụ
     render headless three.js sẵn sàng trong phiên T-assets-2, và việc thêm
     một script bake mới ngoài phạm vi được giao — chỉ được phép vẽ SVG tay
     + `sharp`), mà vẽ tay 3 motif rương/thưởng gốc bằng SVG cùng hệ thống
     ngôn ngữ thị giác của `ChestVisual.tsx` (vàng brass, rương đóng/mở, xu
     + đá quý) nhưng không sao chép hình học của glb — giữ nhất quán *chủ
     đề* (rương kho báu) mà không nhất quán *hình khối chính xác* với model
     3D. Nếu sau này cần khớp render 3D 100%, quay lại (a).
   - (a) Bake ảnh tĩnh từ chính glb có sẵn (three.js offscreen render, giống
     `scripts/build-chest-models.mjs` đã làm cho việc build model — không cần
     dep mới, ba.js đã có sẵn) → giữ đúng rương thật của game, nhất quán;
     hoặc
   - (b) T16/T21 đổi cách tiếp cận, render trực tiếp glb bằng `<CardMesh>`/
     three.js runtime thay vì webp tĩnh — khi đó 2 asset `chestFront/Back` và
     3 `launch/card-*` có thể bị loại khỏi `assets.ts` (xoá field), không cần
     ảnh 2D nữa.
   Tạm đánh dấu `reuse` (không phải `new-art`) vì nguồn 3D đã có sẵn, chỉ thiếu
   bước bake — không phải một họa sĩ cần vẽ từ đầu.
2. **QR `launch/qr-chest.webp`**: bản chất một QR code luôn được sinh ra từ
   URL đích (không phải ảnh tĩnh có sẵn) — đúng nghĩa `procedural`. T04/T21
   để ngỏ vì (a) chưa có URL thật, (b) chưa muốn thêm dep mới. **Sản xuất
   xong ở task T-assets-3** dùng `qrcode` (dep có sẵn trong `package.json`,
   đã dùng ở `api/qr/[slug]/route.ts` và `admin/page.tsx` — không thêm dep
   mới). **Target URL: `NEXT_PUBLIC_BASE_URL` + `/`** (đọc từ `web/.env`,
   cùng convention `api/qr/[slug]/route.ts` dùng) — dev value hiện tại là
   `http://localhost:3000/`, đây là **placeholder có chủ đích, cần người sở
   hữu domain marketing thật cập nhật `NEXT_PUBLIC_BASE_URL` rồi chạy lại
   script sinh trước khi lên production**; không có URL marketing riêng nào
   khác trong repo để trỏ tới, và `/` là nơi "hành trình truy tìm kho báu"
   thật sự bắt đầu (metadata `web/src/app/layout.tsx`). Render: module đen
   trên nền trắng (KHÔNG theo dark theme của trang — QR cần độ tương phản
   thật để quét được, ưu tiên quét được hơn đồng bộ màu), quiet-zone margin=3
   modules, `errorCorrectionLevel: M`, lưu `.webp` bằng `sharp({lossless:true})`
   để không mất độ nét module (không nén lossy làm rối các ô vuông nhỏ).
3. **Icon Frame.tsx**: đã kiểm tra `components/Frame.tsx`, `Menu.tsx`,
   `Console.tsx` (T07) — toàn bộ nút dùng nhãn chữ (`content.frame.audioOn`,
   `.menu`, `.console`, `.close`...), không tham chiếu icon SVG nào. Không
   cần thêm asset icon nào vào `assets.ts`.
4. **Noise texture** ra khá thưa (hạt mịn rải rác trên nền đen) chứ không dày
   đặc như noise ảnh thường thấy — chủ đích: dùng phủ nhẹ lên emblem/HUD ở
   opacity thấp, dày quá sẽ lấn nội dung. Nếu component dùng thấy cần noise
   đậm hơn, quay lại chỉnh baseFrequency trong script sinh (không lưu trong
   repo, có thể viết lại từ `docs/plans/landing-6-assets.md` này).
