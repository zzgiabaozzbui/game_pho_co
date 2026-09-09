# Landing-3 Parallax & Scroll-Reveal — Design

## Mục tiêu
Thêm chiều sâu chuyển động cho `/landing-3` ([web/src/app/landing-3/page.tsx](../../../web/src/app/landing-3/page.tsx)):
1. Parallax nhiều lớp, **toàn trang** (mọi section, không chỉ hero).
2. Scroll-reveal (fade + slide-up) khi phần tử vào viewport.

Không parallax nội dung chữ (giảm đọc được, dễ chóng mặt). Tôn trọng `prefers-reduced-motion: reduce`.

## Quyết định kỹ thuật: dùng lại engine của landing-6

Bản spec đầu đề nghị tự viết rAF scroll listener, dựa trên tiền đề sai ("repo chưa có thư viện parallax"). Tiền đề đó sai: `gsap ^3.15.0` + `lenis ^1.3.26` **đã là dependency** và landing-6 đã wire đầy đủ. Tự viết lại = trùng lặp.

Tệ hơn, cơ chế bản đầu (nhân `speed` với scrollY tuyệt đối) **vỡ với mọi section dưới fold**: ở scroll 6000px, layer speed 0.15 dịch 900px và bay khỏi container. Parallax cần progress **0..1 tương đối vị trí section trong viewport**, đúng cái `createChapter()` + `parallaxTransform()` của landing-6 đã giải.

Chốt: dùng **full engine landing-6** (gồm Lenis smooth-scroll) và **nâng `motion/` thành shared** tại `src/lib/motion/`.

## Phần 1 — Migration: `landing-6/motion/` → `src/lib/motion/`

Thuần cơ học, không đổi logic. Rủi ro là regression trên landing-6 (trang đang chạy), nên tách thành bước riêng, verify xong mới làm phần 2.

- Di chuyển cả 5 file, giữ nguyên nội dung: `timeline.ts`, `useReveal.ts`, `useScrollProgress.ts`, `keyframes.ts`, `useFocusTrap.ts`.
- `useFocusTrap.ts` là a11y chứ không phải motion, nhưng vẫn move cùng để diff thuần là một phép di chuyển thư mục. Không tách, không refactor.
- `keyframes.ts` chứa lẫn phần generic (`ParallaxLayer`, `parallaxTransform`) và data riêng landing-6 (`tableauKeepKeyframes`, `tableauFactionsKeyframes`, `tableauWorldKeyframes`). Move nguyên file, **không tách**. Keyframes của landing-3 nằm ở file riêng trong `landing-3/`, chỉ import `type ParallaxLayer` + `parallaxTransform` từ shared.
- Cập nhật 22 import site trên 17 file landing-6: `./motion/x` và `../motion/x` → `@/lib/motion/x` (alias `@/*` đã dùng sẵn trong repo).
- Verify: `tsc --noEmit` sạch, `next build` sạch, mở `/landing-6` xác nhận pin/scrub/preloader/menu còn nguyên hành vi.

## Phần 2 — Thêm option `pin` cho `createChapter()`

`createChapter()` hiện luôn `pin: true`. Landing-3 cần scrub progress **mà không pin** (trang giữ layout dòng chảy bình thường, không dựng section dính màn hình như landing-6).

Thêm `pin?: boolean` vào `ChapterOptions`, default `true`. Landing-6 không đổi một dòng nào ở call site; landing-3 truyền `pin: false`. Khi `pin: false` thì `end` tính theo chiều cao thật của section (`"bottom top"`) thay vì `+=scrubVh*100%`, vì không có pin thì scrubVh vô nghĩa.

Nhánh reduced-motion của `createChapter()` giữ nguyên: bắn `onProgress(1)` một lần khi section vào — layer đứng ở trạng thái cuối, không kẹt ở progress 0.

## Phần 3 — Wire engine vào landing-3

Trong `page.tsx`: gọi `initScrollEngine()` trong effect lúc mount, `destroy()` khi unmount (React 19 strict mode mount effect 2 lần — leak là 2 Lenis giành nhau scroll position).

**Bắt buộc kèm theo: sửa 5 anchor link.** Lenis chiếm quyền cuộn native, nên `href="#id"` bị rAF loop của Lenis ghi đè lại vị trí cũ ngay frame sau → link chết. Phải đi qua `scrollToChapter(id)`:
- 4 link nav header: `#y-nghia-du-an`, `#dinh-huong-phat-trien`, `#tinh-hoa`, `#quy-trinh-choi`
- 1 link "Cuộn xuống tìm hiểu ý nghĩa" ở đáy hero

Đây là hệ quả trực tiếp của việc chọn full engine, không phải việc tùy chọn.

## Phần 4 — Layer parallax

### Asset
Dùng ảnh có sẵn trong `public/landing-3/`: `pho-co-bg.jpg` (nền hero), `decor-fan.png`, `decor-carp.png`, `decor-horse.png` (tiền cảnh — landing-3 hiện chưa dùng 3 file này). Không cần asset mới.

Lưu ý phạm vi: đây là **thêm lớp trang trí chuyển động khác tốc độ**, không phải tách pixel thật từ `pho-co-bg.jpg` thành sky/roofline/street. Muốn chiều sâu thật cần bộ PNG trong suốt tách sẵn — ngoài phạm vi spec này. Nếu sau có asset đó, thả vào `public/landing-3/` rồi khai thêm layer.

### Hero
| Layer | speed | Ghi chú |
|---|---|---|
| `pho-co-bg.jpg` | 0.06 | Lớp xa nhất |
| `decor-horse.png` | 0.35 | Góc dưới-trái |
| `decor-fan.png` | 0.45 | Góc trên-phải |
| `decor-carp.png` | 0.55 | Góc dưới-phải, gần nhất |

Hai ràng buộc bắt buộc:

**Headroom scale.** Img hiện có `scale-105` — chỉ ~34px dư trên ảnh cao 680px, layer 0.06 ăn hết trong vài trăm px scroll rồi lộ mép. Nâng lên `scale-110` tối thiểu và kiểm chứng: `headroom_px = (scale - 1) × height` phải ≥ `|max_translate|` của layer đó.

**Không áp transform trực tiếp lên `<img>` hero.** [globals.css:159](../../../web/src/app/globals.css:159) `@keyframes boomerang-bg` animate `transform` vô hạn trên đúng element đó. CSS animation thắng inline style ở property đang animate → parallax sẽ chết im lặng, không báo lỗi. Transform parallax phải nằm trên **element bọc ngoài**, animation boomerang giữ trên `<img>` bên trong.

**Ràng buộc decor icon.** Hero đã có h1 ở giữa (z-10) và nút PLAY ở đáy (z-20). 3 icon decor phải: `pointer-events-none`, opacity thấp (0.12–0.2), chỉ đặt ở góc, z-index dưới nội dung. Không được đè vùng nút chơi.

### CloudBackground
4 cụm `MayNhuY` hiện có ([CloudBackground.tsx](../../../web/src/app/landing-3/components/CloudBackground.tsx)) giữ nguyên vị trí, gán speed lệch nhau: 0.10 / 0.20 / 0.15 / 0.25. Container cha đã có `overflow-hidden` nên translate bị clip đúng ý, không sinh scroll ngang.

Vì wrapper này trải dài nhiều section, mỗi cụm mây lấy progress theo **section gần nó nhất** (không phải progress toàn cục) — nếu không thì lại tái hiện đúng lỗi của bản spec đầu.

### Section dưới
Parallax nhẹ chỉ trên trang trí nền của Roadmap / Relics / CTA (speed ≤ 0.15). Nội dung chữ và card đứng yên.

## Phần 5 — Scroll-reveal

Dùng `useReveal` sẵn có (one-shot, tự disconnect, đã xử lý reduced-motion). Không viết hook mới.

Wrapper `Reveal` trong `landing-3/components/`: `opacity-0 translate-y-4` → `opacity-100 translate-y-0`, transition 300–500ms ease-out, nhận `delayMs` để stagger.

| Khu vực | Stagger |
|---|---|
| Tiêu đề mỗi section (badge + h2 + mô tả) | không |
| 3 pillar card "Ý Nghĩa" | index × 100ms |
| 4 card Roadmap | index × 100ms (khung cha reveal trước, không delay) |
| Grid relics | index × 80ms (grid đông hơn nên delay ngắn hơn) |
| 3 bước Gameplay | index × 100ms |
| CTA cuối | không (1 khối) |

Card relics giữ nguyên hover-scale hiện có; `Reveal` bọc ở mức container nên không stack transform với hover.

## Phần 6 — Reduced motion

Engine đã tự degrade (không Lenis, không pin, không scrub). Cần thêm 1 việc:

`.animate-boomerang` **chưa có guard** — block `@media (prefers-reduced-motion: reduce)` ở [globals.css:150](../../../web/src/app/globals.css:150) chỉ cover `treasure-hero-in` và `chest-*`. Hero vẫn animate transform 20s vô hạn. Thêm `.animate-boomerang { animation: none; }` vào block đó. Fix 1 dòng, nằm trong phạm vi vì spec này tuyên bố trang tuân thủ reduced-motion.

## Rủi ro

**Singleton engine khi client-side nav.** `timeline.ts` giữ `activeLenis` ở module scope, và `destroy()` gọi `ScrollTrigger.getAll().forEach(kill)` — kill **toàn bộ** trigger global, kể cả của trang khác. Điều hướng client-side landing-6 ↔ landing-3 có thể chồng mount/unmount và giết trigger của trang vừa vào. Guard `if (activeLenis === lenis)` xử lý đúng phần Lenis, nhưng phần ScrollTrigger thì không. Phải test đúng đường đi này, không chỉ hard-reload từng trang.

**Lenis đổi cảm giác cuộn toàn trang landing-3.** Đây là thay đổi hành vi có chủ ý (đã chốt), không phải tác dụng phụ. Nếu thấy nặng trên mobile thì hạ `touchMultiplier` — sửa ở `initScrollEngine()`, và lưu ý sửa ở đó ảnh hưởng cả landing-6.

## Verify

- `tsc --noEmit` + `next build` sạch sau **mỗi** phần (đặc biệt sau migration).
- `/landing-6` còn nguyên hành vi: preloader, pin 4 chương tableau, menu, bottom rail, Console.
- `/landing-3`: cuộn hết trang, kiểm mép ảnh hero không lộ, không scroll ngang, 5 anchor link nhảy đúng, reveal chạy 1 lần.
- Client-side nav landing-6 → landing-3 → landing-6: scroll không chết ở cả 3 chặng.
- Reduced motion: **không** emulate được bằng Browser pane (`resize_window` `colorScheme` chỉ đổi `prefers-color-scheme`). Test bằng DevTools Rendering → "Emulate prefers-reduced-motion", hoặc lật tạm điều kiện trong `prefersReducedMotion()`.
- Không có unit test cho hiệu ứng thị giác; `pin: false` thêm ở phần 2 là logic nhánh → để lại 1 check chạy được cho `createChapter()` (option default giữ `pin: true`).

## Ghi chú
Plan thực thi (task đánh số + trạng thái) đi vào `docs/plans/landing-3-parallax.md` theo convention repo (landing-6 dùng `docs/plans/landing-6.md`).
