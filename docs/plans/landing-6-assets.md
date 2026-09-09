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
| `images/story-intro/teaser-poster.webp` | storyIntro | Poster tĩnh cho video teaser game, cảnh gánh phở sáng sớm | webp 16:9 ~1600×900 | new-art | P0 |
| `videos/teaser-1080.mp4` | storyIntro | Video trailer giới thiệu game, 01:48 (khớp `videoDuration`) | mp4 1920×1080 | new-art | P1 |
| `images/story-intro/side-media.webp` | storyIntro | Ảnh/minh hoạ phụ cạnh khối trailer (lưới bất đối xứng 3 khối, T14) | webp dọc ~900×1200 | new-art | P1 |
| `videos/topo-loop.mp4` | storyProject | Video loop hoạ tiết địa hình/toạ độ nền — hiệu ứng topographic | mp4 loop, vuông hoặc 16:9 | new-art | P2 |
| `sprites/keeper-sheet.webp` | storyProject | Spritesheet nhân vật "người giữ lửa" cho khối tactical | webp spritesheet | new-art | P1 |
| `svg/old-quarter-map.svg` | storyProject | Bản đồ cách điệu phố cổ (lưới đường trừu tượng, chấm toạ độ `N 21°01.7 / E 105°51.2`) | svg 800×600 | procedural — **đã sản xuất** | P1 |
| `images/collection/chest-front.webp` | collectionIntro | Mặt trước rương (card lật T16) | webp vuông ~800×800 | reuse:`web/public/models/chest-*.glb` — xem quyết định bên dưới | P1 |
| `images/collection/chest-back.webp` | collectionIntro | Mặt sau rương (card lật, mặt thông số) | webp vuông ~800×800 | reuse:`web/public/models/chest-*.glb` — xem quyết định bên dưới | P1 |
| `images/gallery/banh-pho.webp` | gallery | Card nguyên liệu: Bánh phở | webp vuông ~800×800 | new-art | P0 |
| `images/gallery/nuoc-dung.webp` | gallery | Card nguyên liệu: Nước dùng | webp vuông ~800×800 | new-art | P0 |
| `images/gallery/que.webp` | gallery | Card nguyên liệu: Quế | webp vuông ~800×800 | new-art | P0 |
| `images/gallery/hoi.webp` | gallery | Card nguyên liệu: Hoa hồi | webp vuông ~800×800 | new-art | P0 |
| `images/gallery/gung-nuong.webp` | gallery | Card nguyên liệu: Gừng nướng | webp vuông ~800×800 | new-art | P0 |
| `images/gallery/hanh.webp` | gallery | Card nguyên liệu: Hành | webp vuông ~800×800 | new-art | P0 |
| `images/gallery/gau.webp` | gallery | Card nguyên liệu: Gầu | webp vuông ~800×800 | new-art | P0 |
| `images/gallery/chin.webp` | gallery | Card nguyên liệu: Nạm chín | webp vuông ~800×800 | new-art | P0 |
| `images/gallery/tai.webp` | gallery | Card nguyên liệu: Thịt tái | webp vuông ~800×800 | new-art | P0 |
| `images/gallery/thao-qua.webp` | gallery | Card nguyên liệu: Thảo quả | webp vuông ~800×800 | new-art | P0 |
| `images/gallery/mam.webp` | gallery | Card nguyên liệu: Nước mắm | webp vuông ~800×800 | new-art | P0 |
| `images/gallery/chanh-ot.webp` | gallery | Card nguyên liệu: Chanh ớt | webp vuông ~800×800 | new-art | P0 |
| `images/tableau-keep/00-sky.webp` | tableauKeep | Lớp xa nhất: bầu trời/hậu cảnh Gánh Phở Cổ | webp multiplane, cùng khung hình các lớp khác | new-art | P0 |
| `images/tableau-keep/01-facade.webp` | tableauKeep | Lớp mặt tiền phố | webp multiplane | new-art | P0 |
| `images/tableau-keep/02-cart.webp` | tableauKeep | Lớp gánh phở (chủ thể chính) | webp multiplane | new-art | P0 |
| `images/tableau-keep/03-stove.webp` | tableauKeep | Lớp bếp lò/nồi nước dùng, cận cảnh | webp multiplane | new-art | P0 |
| `images/tableau-keep/04-steam.webp` | tableauKeep | Lớp khói/hơi nước, gần camera nhất | webp multiplane, có alpha | new-art | P1 |
| `images/tableau-factions/bac.webp` | tableauFactions | Cảnh minh hoạ Phở Bắc (nước trong, vị thanh) | webp | new-art | P0 |
| `images/tableau-factions/nam.webp` | tableauFactions | Cảnh minh hoạ Phở Nam (rau sống, tương đen) | webp | new-art | P0 |
| `images/tableau-factions/scan.webp` | tableauFactions | Texture quét năng lượng ngăn giữa hai phe (đường quét ngang, fade 2 đầu) | webp tile 256×256 | procedural — **đã sản xuất** | P1 |
| `images/tableau-world/00-sky-night.webp` | tableauWorld | Lớp bầu trời đêm | webp multiplane | new-art | P0 |
| `images/tableau-world/01-rooftops.webp` | tableauWorld | Lớp mái nhà phố cổ | webp multiplane | new-art | P0 |
| `images/tableau-world/02-street.webp` | tableauWorld | Lớp mặt phố | webp multiplane | new-art | P0 |
| `images/tableau-world/03-neon.webp` | tableauWorld | Lớp biển hiệu/đèn neon, gần camera nhất | webp multiplane, có alpha | new-art | P1 |
| `images/launch/card-01.webp` | launch | Card rương xoè quạt #1 | webp | new-art — có thể tái dùng render chest 3D làm nguồn, xem ghi chú | P1 |
| `images/launch/card-02.webp` | launch | Card rương xoè quạt #2 | webp | new-art — như trên | P1 |
| `images/launch/card-03.webp` | launch | Card rương xoè quạt #3 | webp | new-art — như trên | P1 |
| `images/launch/qr-chest.webp` | launch | QR code dẫn tới link chơi/nhận rương | webp | procedural (QR luôn sinh runtime từ URL thật) — **chưa sản xuất**, xem ghi chú | P1 |
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
- **New-art còn cần: 31** — đây là con số quan trọng nhất cho việc lên kế hoạch
  các task tiếp theo (Giai đoạn D). Danh sách đầy đủ:
  1. `images/story-intro/teaser-poster.webp` — poster video teaser
  2. `videos/teaser-1080.mp4` — video trailer 01:48
  3. `images/story-intro/side-media.webp` — ảnh phụ storyIntro
  4. `videos/topo-loop.mp4` — video loop topographic
  5. `sprites/keeper-sheet.webp` — spritesheet nhân vật người giữ lửa
  6-17. 12 card nguyên liệu (`images/gallery/*.webp`): banh-pho, nuoc-dung,
     que, hoi, gung-nuong, hanh, gau, chin, tai, thao-qua, mam, chanh-ot
  18-22. 5 lớp `images/tableau-keep/00..04-*.webp` (sky/facade/cart/stove/steam)
  23-24. 2 cảnh `images/tableau-factions/bac.webp`, `nam.webp`
  25-28. 4 lớp `images/tableau-world/00..03-*.webp` (sky-night/rooftops/street/neon)
  29-31. 3 card `images/launch/card-01..03.webp`

## Quyết định không có trong spec

1. **Rương (`chestFront`/`chestBack`) và 3 card launch fan**: repo đã có 4 model
   3D rương thật (`web/public/models/chest-{common,epic,gold,grand}.glb`) dùng
   cho game chính. `assets.ts` của landing-6 lại xin ảnh 2D webp (chest lật
   mặt trước/sau, card xoè quạt). Có hai hướng hợp lý cho T16/T21 sau này —
   **chưa chốt, để task thực thi chương đó quyết**:
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
   URL đích (không phải ảnh tĩnh có sẵn) — đúng nghĩa `procedural`. Nhưng
   không sản xuất ngay trong T04 vì (a) chưa có URL thật để mã hoá, (b) viết
   encoder QR tay không phải "một dòng" và dự án chưa có QR lib nào cài sẵn —
   thêm dep mới ngoài phạm vi cho phép. Để T21 quyết định: hoặc thêm 1 lib QR
   nhỏ (cần duyệt dep mới) hoặc sinh SVG QR thủ công lúc đó khi đã có URL.
3. **Icon Frame.tsx**: đã kiểm tra `components/Frame.tsx`, `Menu.tsx`,
   `Console.tsx` (T07) — toàn bộ nút dùng nhãn chữ (`content.frame.audioOn`,
   `.menu`, `.console`, `.close`...), không tham chiếu icon SVG nào. Không
   cần thêm asset icon nào vào `assets.ts`.
4. **Noise texture** ra khá thưa (hạt mịn rải rác trên nền đen) chứ không dày
   đặc như noise ảnh thường thấy — chủ đích: dùng phủ nhẹ lên emblem/HUD ở
   opacity thấp, dày quá sẽ lấn nội dung. Nếu component dùng thấy cần noise
   đậm hơn, quay lại chỉnh baseFrequency trong script sinh (không lưu trong
   repo, có thể viết lại từ `docs/plans/landing-6-assets.md` này).
