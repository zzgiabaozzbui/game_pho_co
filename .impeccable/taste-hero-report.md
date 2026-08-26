# Taste Hero Report — Identity Phố cổ cho trang chủ `/`

Branch: `feat/ui-hero-taste` · Date: 2026-08-26
Scope: #1 priority từ critique (hero không có nhận diện Hà Nội) + #4 (treasure CTA vô nghĩa) + icon semantics + OG metadata.

## Design Read

> Reading this as: **heritage premium-consumer mobile PWA landing for travelers**, with an **"bản đồ kho báu × nhật ký du hành"** language, leaning toward the project's own token world (paper/ink/son/gold/clay + Fraunces/Be Vietnam Pro) và inline SVG vẽ bằng code — zero new dependencies.

## Dials

| Dial | Value | Lý do |
|---|---|---|
| DESIGN_VARIANCE | 6 | Heritage consumer có tiết chế; single-column max-w-md giữ nguyên |
| MOTION_INTENSITY | 3 | DESIGN.md cấm motion vô ích → strip tĩnh 100%, chỉ hover/active states |
| VISUAL_DENSITY | 3 | Art-gallery nhẹ; strip là khoảng thở duy nhất thêm vào |

## Motif chọn (evaluate rồi pick)

Chọn gộp **2 motif mạnh nhất thành MỘT band authored** duy nhất:

1. **Skyline mái ngói phố cổ** (mạnh về *place identity*): 2 lớp — lớp xa màu `line`, lớp gần silhouette `timber` gồm nhà ống gác dốc, nhà trần parapet + trụ cột, nhịp cao thấp có chủ đích.
2. **Route motif** (mạnh về *product meaning*): đường chấm `clay-deep` (dot-chain) có halo `paper` để nổi trên cả nền giấy lẫn mái tối, chạy từ điểm xuất phát (vòng tròn bản đồ) vượt các đỉnh mái lên đỉnh đồi, kết thúc bằng **rương kho báu gold** với radial glow vàng (echo đúng vocabulary `chest-glow` của hệ thống).

Bỏ motif la bàn/medallion sau eyebrow (yếu nhất khi đứng một mình; hero đã có badge tile).

**Chi tiết giữ signature:** baseline "đường phố" của skyline chính là **lattice-divider** (pattern gold 8px/8px, 4px cao) — chi tiết được critique khen không mất đi mà nhập vào trong tranh.

## Deliverables

- **A. Hero identity**: `HeroScene` — SVG inline ~2KB, `viewBox 0 0 400 84`, `preserveAspectRatio="xMidYMax meet"`, height cố định 76px mọi viewport (không méo, không crop). Chỉ dùng token CSS vars (`--color-*`), không hex mới.
- **B. Treasure gate**: fetch `/api/chests?playerId=` đúng 1 lần khi có pid (pattern fetch-on-mount chuẩn app); ≥1 rương → link `/treasure` + badge vàng đếm rương chưa mở (`chest.unopenedBadge` semantics); ngược lại → chip muted viền đứt + Lock + `home.treasure_locked`.
- **C. Icon**: `KeyRound` → `Compass` (lucide sẵn, tránh trùng ngữ nghĩa mã khôi phục; MapPin đã bị chip step_go dùng).
- **D. OG metadata**: `openGraph` block trong `layout.tsx` — type/siteName/locale `vi_VN` + alternate `en_US`, title/description giữ nguyên giá trị cũ.

## Dict keys mới (VI+EN)

- `home.hero_scene_alt` — aria-label cho tranh hero
- `home.treasure_locked` — VI "Rương đầu tiên đang chờ ở cuối tuyến" / EN "Your first chest awaits at the end of the route"

## Perf & a11y notes

- Trọng lượng thêm: **~2.0KB markup** inline SVG (không asset, không request ngoài, offline-first OK), 0 deps mới, 0 globals.css change.
- Chiều cao thêm tại 360×640: **+32px net** (header mt 10→8 −8px; bỏ divider mt-8+4px; thêm strip 76px) — dưới trần 120px, CTA son vẫn neo đáy qua `mt-auto`.
- Motion: **0 animation mới** — tĩnh hoàn toàn, an toàn reduced-motion mặc định; không loop nào.
- A11y: svg `role="img"` + aria-label song ngữ; Lock trang trí `aria-hidden`; contrast dot-route clay-deep trên giấy đạt AA large; badge gold/timber chỉ mang số bổ trợ.
- Son vẫn chỉ xuất hiện đúng 1 vùng (CTA chính) — The Son Speaks Once Rule giữ nguyên; gold = kho báu, clay-deep = tuyến/địa điểm, line/timber = kiến trúc (đúng Seal Roles Rule).
- Không đụng StationFlow/play/treasure/admin.

## Verify

- `npm run lint` ✓ · `npm run typecheck` ✓ · `npm run test` 43/43 ✓ · `npm run build` ✓ (warning photo-route có sẵn từ trước, không phải thay đổi này)
- Detector: `node detect.mjs --json src/app/page.tsx src/app/layout.tsx` → **[] (zero findings)**

## Commits

- `4971dee` feat(ui): hero ban do kho bau - identity pho co ha noi (taste)
- `98fd066` feat(ui): og share metadata cho trang chu (vi_VN)

## Concerns / sự cố quy trình

- ⚠️ Agent khác đã checkout nhánh `fix/chest-renderer-minors` trong cùng working tree giữa chừng — 2 commit đầu landed nhầm nhánh đó. Đã xử lý: cherry-pick về `feat/ui-hero-taste` và reset `fix/chest-renderer-minors` về đúng tip thật (`8959518`). Cây hiện sạch, đang đứng trên nhánh đúng.
- Teaser hiển thị trong lúc fetch chests (~100ms đầu với returning player) — chấp nhận như progressive disclosure, cùng pattern với các trang khác.
- Số đếm rương chưa mở lấy trực tiếp từ `unopenedCount` trả về của API, không thêm endpoint.
