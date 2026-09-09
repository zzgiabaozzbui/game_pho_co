# Landing-3 Parallax & Scroll-Reveal — Design

## Mục tiêu
Thêm chiều sâu chuyển động cho `/landing-3` (web/src/app/landing-3/page.tsx) qua:
1. Hiệu ứng parallax (nhiều lớp di chuyển khác tốc độ khi scroll).
2. Scroll-reveal animation (fade + slide-up khi phần tử vào viewport).

Không thêm dependency mới. Không parallax nội dung chữ (tránh chóng mặt/giảm đọc được). Tôn trọng `prefers-reduced-motion: reduce`.

## Asset
Dùng ảnh có sẵn trong `public/landing-3/`:
- `pho-co-bg.jpg` — nền hero, lớp chậm nhất.
- `decor-fan.png`, `decor-carp.png`, `decor-horse.png` — icon tiền cảnh, lớp nhanh hơn.
- Không cần asset mới. Nếu sau này có ảnh tách lớp thật (sky/roofline/street), thả vào `public/landing-3/` và wire thêm — ngoài phạm vi spec này.

## Kiến trúc

### 1. `useParallaxScroll` (hook, file mới `web/src/app/landing-3/hooks/useParallaxScroll.ts`)
- 1 scroll listener toàn trang, dùng `requestAnimationFrame` để throttle.
- Ghi giá trị scrollY vào CSS custom property `--scroll-y` trên `document.documentElement` (KHÔNG setState → không re-render React tree).
- Kiểm tra `window.matchMedia('(prefers-reduced-motion: reduce)')`: nếu true, không gắn listener, `--scroll-y` giữ nguyên 0.
- Cleanup listener khi unmount.

### 2. `ParallaxLayer` (component, file mới `web/src/app/landing-3/components/ParallaxLayer.tsx`)
- Props: `speed: number` (hệ số, âm/dương), `className?`, `children`.
- Dùng ref, style `transform: translate3d(0, calc(var(--scroll-y, 0px) * ${speed}), 0)` áp qua inline style (CSS var tính bằng calc trực tiếp trong JSX style, không cần JS mỗi frame).
- `will-change: transform` để tối ưu compositing.

### 3. `useInView` + `Reveal` (file mới `web/src/app/landing-3/hooks/useInView.ts`, `web/src/app/landing-3/components/Reveal.tsx`)
- `useInView`: IntersectionObserver, `threshold: 0.15`, `rootMargin: "0px 0px -10% 0px"`, trigger 1 lần rồi unobserve (không lặp lại khi cuộn lên xuống).
- `Reveal`: wrapper div, nhận `delayMs?` (stagger), class chuyển từ `opacity-0 translate-y-4` → `opacity-100 translate-y-0` khi `inView`, transition CSS (300–500ms, ease-out).
- Nếu `prefers-reduced-motion: reduce`: bỏ qua transition, hiện ngay lập tức (opacity-100 từ đầu).

## Áp dụng vào page.tsx / CloudBackground.tsx

| Khu vực | Hiệu ứng |
|---|---|
| Hero `pho-co-bg.jpg` | `ParallaxLayer speed={0.15}` bọc ảnh nền |
| Hero decor icon (fan/carp/horse mới thêm, rải quanh hero) | `ParallaxLayer speed={0.4 / 0.55 / 0.35}` mỗi icon khác tốc độ |
| `CloudBackground.tsx` — 4 cụm `MayNhuY` | Mỗi cụm bọc `ParallaxLayer` với speed riêng: 0.10, 0.20, 0.15, 0.25 (đối xứng trái/phải khác nhau nhẹ) |
| Section "Ý Nghĩa Dự Án" — 3 pillar card | `Reveal` stagger delayMs = index * 100 |
| Section "Roadmap" — 4 card giai đoạn | `Reveal` stagger delayMs = index * 100, card cha (khung bo viền lớn) `Reveal` không delay |
| Section "Tinh Hoa" (relics grid) | `Reveal` stagger delayMs = index * 80 (grid đông hơn, delay ngắn hơn) |
| Section "Quy Trình Chơi" — 3 bước | `Reveal` stagger delayMs = index * 100 |
| Section CTA cuối | `Reveal` không stagger (1 khối) |
| Tiêu đề mỗi section (h2 + badge + mô tả) | `Reveal` không stagger, trigger sớm hơn nội dung bên dưới |

Card báu vật giữ nguyên hover-scale hiện có (không đụng), chỉ bọc thêm Reveal ở mức container.

## Rủi ro & giới hạn
- Ảnh hero là 1 lớp phẳng — "tách lớp" ở đây là thêm icon trang trí chuyển động nhanh hơn nền, không phải tách pixel thật từ `pho-co-bg.jpg`. Nếu cần chiều sâu thật (sky/roofline riêng), cần asset PNG trong suốt mới — ghi chú TODO, không làm trong spec này.
- Parallax dùng CSS var + transform, không dùng `position: fixed` → an toàn với mobile Safari (tránh bug fixed-background quen thuộc).
- Không dùng thư viện (framer-motion...) — xác nhận `package.json` hiện chưa có, giữ đúng.

## Test / Verify
- Chạy dev server, mở `/landing-3`, cuộn qua tất cả section — quan sát bằng mắt (không có unit test cho hiệu ứng thị giác).
- Test `prefers-reduced-motion: reduce` qua `resize_window` colorScheme hoặc DevTools rendering emulation — xác nhận không còn transform theo scroll, Reveal hiện ngay.
- Kiểm tra không giật lag khi cuộn nhanh (throttle rAF hoạt động đúng).
