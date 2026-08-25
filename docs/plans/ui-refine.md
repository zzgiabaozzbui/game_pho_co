# Kế hoạch: Tinh chỉnh UI "Phố cổ ấm" (heritage)

> Trạng thái cập nhật tại chỗ. Repo không phải git repo nên không commit được — file này là nguồn nối phiên.

## Quyết định đã duyệt (2026-08-25)

- Hướng thẩm mỹ: **Phố cổ ấm - heritage** (nền giấy #FAF7F2, son đỏ #B4432F, nâu gỗ #2D1B12, vàng đồng #C9962B).
- Phạm vi: người chơi + /admin.
- Typography: Fraunces (display) + Be Vietnam Pro (body) qua `next/font/google` (tự host, PWA offline OK).
- Icon: lucide-react thay emoji.
- Không đổi logic/gameplay/API; bổ sung i18n key cho chuỗi cứng lộ ra.

## Tasks

| # | Task | Trạng thái |
|---|------|-----------|
| 1 | Tokens màu + utilities trong `globals.css` (`@theme`) | DONE |
| 2 | `layout.tsx`: fonts + themeColor `#2d1b12` | DONE |
| 3 | Trang chủ `/`: logo mark KeyRound, thẻ luật giấy, CTA son | DONE |
| 4 | `/play`: header gỗ, sheet ngà, chips tokens mới, i18n hóa chuỗi cứng | DONE |
| 5 | `GameMap.tsx`: màu Circle theo status mới + popup i18n | DONE |
| 6 | `StationFlow.tsx`: tabs check-in, option chọn viền son, success panel xanh ngọc, icons | DONE |
| 7 | `/treasure`: gradient nâu gỗ→than, glow gold | DONE |
| 8 | `/admin`: ăn theo tokens (header gỗ, button son) | DONE |
| 9 | `npm run lint` + `typecheck` + `test` (17/17) pass | DONE |
| 10 | Smoke test các route qua dev server (5 route đều 200) | DONE |
| 11 | ECC `code-reviewer` review toàn bộ diff | DONE |

## Vòng 2: fix findings từ ECC code-reviewer

| Finding | Mức | Trạng thái |
|---------|-----|-----------|
| treasure.done dùng thay chuỗi cứng chúc mừng | MAJOR | DONE |
| i18n "Workshop trải nghiệm văn hóa" (`treasure.workshop`) | MAJOR | DONE |
| i18n "Rương kho báu" (`cta.treasure_short`) | MAJOR | DONE |
| i18n trạm không tồn tại (`station.not_found`) | MAJOR | DONE |
| i18n ảnh quá lớn (`photo.too_large`) | MAJOR | DONE |
| Token `--color-clay-deep` #7c4a12 cho text nền sáng (WCAG AA) | MAJOR | DONE |
| manifest.webmanifest theme/background color mới | MINOR | DONE |
| Bỏ opacity /70 trên text-ink-soft (contrast) | MINOR | DONE |
| Eyebrow trang chủ qua key `home.location` + clay-deep | MINOR | DONE |
| File input ảnh `sr-only` thay `hidden` (keyboard) | MINOR | DONE |
| `document.documentElement.lang` theo lang (i18n.tsx) | MINOR | DONE |

## Findings cố tình bỏ qua (kèm lý do)

- `maximumScale: 1` (layout): pre-existing, chặn zoom vô ý khi chơi map; cân nhắc riêng nếu cần a11y zoom.
- `const visible = stations`, `nameVi.replace("Phố ", "")`, mũi tên "→" dạng text: pre-existing logic/cosmetic, ngoài phạm vi restyle.
- Hex map trong GameMap + gradient hex trong treasure: chấp nhận theo plan (SVG path không ăn Tailwind class).
- Double cast `state.total as unknown as number`: NIT, cần sửa type StateDTO — để dành dịp khác.

## Ghi chú kỹ thuật

- Tailwind v4: token khai trong `@theme { --color-* }` → sinh class `bg-paper`, `text-ink`, `ring-line`...
- Font qua CSS variable: `--font-sans` = Be Vietnam Pro, thêm `--font-display` = Fraunces → class `font-display`.
- Màu map (Leaflet Circle) cần hex trực tiếp vì SVG path không ăn class Tailwind.
- Kết quả cuối: lint ✓, typecheck ✓, test 17/17 ✓, 5 route HTTP 200 ✓.
