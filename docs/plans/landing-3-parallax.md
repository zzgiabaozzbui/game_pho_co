# Kế hoạch triển khai: Landing-3 Parallax & Scroll-Reveal

> Nguồn sự thật duy nhất: `docs/superpowers/specs/2026-09-09-landing-3-parallax-design.md`  
> Mục tiêu: Tái sử dụng engine motion của `/landing-6` thành module chia sẻ `@/lib/motion/`, thêm parallax nhiều lớp toàn trang và scroll-reveal cho `/landing-3`. Đảm bảo `/landing-6` giữ nguyên 100% hành vi, 0 regression.

---

## 1. Bảng tiến độ thực thi

| Phần | Nội dung chính | Files bị sửa / tạo mới | Điều kiện Verify | Trạng thái | Commit SHA |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phần 1** | Migration `landing-6/motion/` → `web/src/lib/motion/` | Move 5 files sang `src/lib/motion/`; cập nhật 32 imports trên 17 files `landing-6/**` | `tsc --noEmit` sạch; `next build` sạch; grep 0 import cũ; `/landing-6` giữ nguyên preloader, 4 tableau pins, menu, bottom rail, console | `DONE` | `cdfc40d` |
| **Phần 2** | Thêm option `pin?: boolean` vào `createChapter()` | `web/src/lib/motion/timeline.ts`, `web/src/lib/motion/timeline.test.ts` | Default `pin: true`; khi `pin: false` thì `end: "bottom top"`; Vitest pass; `tsc` + `next build` sạch | `DONE` | `a01cbf3` |
| **Phần 3** | Wire engine vào `/landing-3` | `web/src/app/landing-3/page.tsx` | `initScrollEngine()` mount / unmount sạch; chuyển 5 anchor links sang `scrollToChapter(id)`; cuộn mượt không giật; `tsc` + `next build` sạch | `DONE` | `1fe6edf` |
| **Phần 4** | Parallax nhiều lớp toàn trang | `web/src/app/landing-3/page.tsx`, `web/src/app/landing-3/components/CloudBackground.tsx` | Parallax hero bọc ngoài `<img>`; scale-110+ không lộ mép; 3 decor icons đúng speed, góc, không đè nút; 4 mây theo section gần nhất; không scroll ngang; `tsc` + `next build` sạch | `DONE` | `dbcef3c` |
| **Phần 5** | Scroll-reveal dùng `useReveal` | `web/src/app/landing-3/components/Reveal.tsx`, `web/src/app/landing-3/page.tsx` | Stagger đúng nhịp bảng spec; reveal chạy đúng 1 lần; không đè hover scale relics; `tsc` + `next build` sạch | `TODO` | - |
| **Phần 6** | Guard reduced-motion | `web/src/app/globals.css` | `.animate-boomerang { animation: none; }` trong media query; degrade sạch khi bật reduced-motion; `tsc` + `next build` sạch | `TODO` | - |

---

## 2. Chi tiết từng phần

### Phần 1 — Migration `landing-6/motion/` → `web/src/lib/motion/`
- **Mục tiêu**: Nâng cấp module motion từ local của landing-6 thành shared module `@/lib/motion/`.
- **Files chuyển đổi**:
  - `web/src/app/landing-6/motion/timeline.ts` → `web/src/lib/motion/timeline.ts`
  - `web/src/app/landing-6/motion/useReveal.ts` → `web/src/lib/motion/useReveal.ts`
  - `web/src/app/landing-6/motion/useScrollProgress.ts` → `web/src/lib/motion/useScrollProgress.ts`
  - `web/src/app/landing-6/motion/keyframes.ts` → `web/src/lib/motion/keyframes.ts`
  - `web/src/app/landing-6/motion/useFocusTrap.ts` → `web/src/lib/motion/useFocusTrap.ts`
- **Files cập nhật import (17 files, 32 statements)**:
  - `components/CollectionIntroChapter.tsx` (2)
  - `page.tsx` (2)
  - `webgl/Stage.tsx` (1)
  - `components/Frame.tsx` (2)
  - `components/HackyText.tsx` (1)
  - `components/HeroChapter.tsx` (2)
  - `components/Console.tsx` (1)
  - `components/GalleryChapter.tsx` (4)
  - `components/LaunchChapter.tsx` (2)
  - `components/Menu.tsx` (1)
  - `components/Preloader.tsx` (1)
  - `components/RevealFooter.tsx` (1)
  - `components/StoryIntroChapter.tsx` (1)
  - `components/StoryProjectChapter.tsx` (2)
  - `components/TableauKeepChapter.tsx` (3)
  - `components/TableauFactionsChapter.tsx` (3)
  - `components/TableauWorldChapter.tsx` (3)
- **Tiêu chuẩn verify**:
  - `git grep "motion/" web/src/app/landing-6/` không còn kết quả import nào.
  - `cd web && npx tsc --noEmit` exit 0.
  - `cd web && npx next build` exit 0.
  - Mở `/landing-6` xác nhận preloader, pin 4 chương tableau, menu, bottom rail, Console còn nguyên.

### Phần 2 — Thêm `pin?: boolean` vào `createChapter()`
- **Mục tiêu**: Cho phép scrub progress mà không pin (phù hợp dòng chảy bình thường của landing-3).
- **Files**:
  - `web/src/lib/motion/timeline.ts`
  - `web/src/lib/motion/timeline.test.ts` (check chạy được)
- **Yêu cầu kỹ thuật**:
  - Thêm `pin?: boolean` vào `ChapterOptions`, mặc định `true`.
  - Khi `pin: false`: `end: "bottom top"`, `pin: false`, `pinSpacing: false`.
  - Khi `pin: true` (hoặc undefined): giữ nguyên hành vi cũ (`end: "+=${scrubVh * 100}%"`, `pin: true`).
  - Giữ nguyên nhánh `prefersReducedMotion()`.
- **Tiêu chuẩn verify**:
  - Unit test `npx vitest run src/lib/motion/timeline.test.ts` pass.
  - `cd web && npx tsc --noEmit` exit 0.
  - `cd web && npx next build` exit 0.

### Phần 3 — Wire engine vào `/landing-3`
- **Mục tiêu**: Bật smooth-scroll Lenis và đồng bộ vị trí scroll cho landing-3.
- **Files**:
  - `web/src/app/landing-3/page.tsx`
- **Yêu cầu kỹ thuật**:
  - `useEffect`: gọi `const { destroy } = initScrollEngine(); return () => destroy();`.
  - Sửa 5 anchor link chuyển sang gọi `scrollToChapter(id)`:
    - Nav header: `#y-nghia-du-an`, `#dinh-huong-phat-trien`, `#tinh-hoa`, `#quy-trinh-choi`.
    - Hero bottom: `#y-nghia-du-an`.
- **Tiêu chuẩn verify**:
  - Click 5 anchor link cuộn mượt đến đúng vị trí, không bị Lenis ghi đè giật về vị trí cũ.
  - `cd web && npx tsc --noEmit` exit 0.
  - `cd web && npx next build` exit 0.

### Phần 4 — Layer parallax toàn trang
- **Mục tiêu**: Thêm chiều sâu thị giác đa lớp cho Hero, CloudBackground và các section bên dưới.
- **Files**:
  - `web/src/app/landing-3/page.tsx`
  - `web/src/app/landing-3/components/CloudBackground.tsx`
- **Yêu cầu kỹ thuật**:
  - Hero layer speeds: `pho-co-bg.jpg` (0.06), `decor-horse.png` (0.35, góc dưới-trái), `decor-fan.png` (0.45, góc trên-phải), `decor-carp.png` (0.55, góc dưới-phải).
  - Wrapper bọc ngoài thẻ `<img>` nhận parallax transform; `<img>` giữ nguyên `animate-boomerang` và nâng lên `scale-110+` đảm bảo headroom: `headroom_px = (scale - 1) * height >= |max_translate|`.
  - 3 decor icon: `pointer-events-none`, opacity 0.12–0.2, z-index dưới text/buttons.
  - CloudBackground: 4 cụm `MayNhuY` gán speed `0.10` / `0.20` / `0.15` / `0.25`, bám theo progress của section gần nhất (`createChapter({ pin: false })`).
  - Section dưới (Roadmap, Relics, CTA): parallax trang trí nền nhẹ `speed <= 0.15`, text/cards đứng yên.
- **Tiêu chuẩn verify**:
  - Kiểm tra ở cả 375px và 1440px không lộ mép ảnh hero khi cuộn.
  - Không sinh thanh cuộn ngang (horizontal scrollbar).
  - `cd web && npx tsc --noEmit` exit 0.
  - `cd web && npx next build` exit 0.

### Phần 5 — Scroll-reveal
- **Mục tiêu**: Bổ sung hiệu ứng xuất hiện khi cuộn vào viewport cho các nội dung chính.
- **Files**:
  - `web/src/app/landing-3/components/Reveal.tsx`
  - `web/src/app/landing-3/page.tsx`
- **Yêu cầu kỹ thuật**:
  - Tái sử dụng `useReveal` từ `@/lib/motion/useReveal`.
  - Stagger theo spec:
    - Section headers: không delay.
    - 3 cards Ý Nghĩa: `index * 100ms`.
    - 4 cards Roadmap: `index * 100ms` (container không delay).
    - Grid relics: `index * 80ms`.
    - 3 bước Gameplay: `index * 100ms`.
    - CTA block: không delay.
  - Card relics giữ nguyên hover-scale hiện có (Reveal bọc ngoài).
- **Tiêu chuẩn verify**:
  - Các phần tử fade + slide-up 1 lần duy nhất khi chạm viewport.
  - `cd web && npx tsc --noEmit` exit 0.
  - `cd web && npx next build` exit 0.

### Phần 6 — Guard reduced-motion
- **Mục tiêu**: Tôn trọng cấu hình trợ năng giảm chuyển động của hệ điều hành.
- **Files**:
  - `web/src/app/globals.css`
- **Yêu cầu kỹ thuật**:
  - Thêm `.animate-boomerang { animation: none; }` vào `@media (prefers-reduced-motion: reduce)`.
- **Tiêu chuẩn verify**:
  - Bật prefers-reduced-motion: không có hoạt ảnh boomerang xoay/zoom liên tục, parallax/reveal degrade về trạng thái hiển thị đầy đủ ngay lập tức.
  - `cd web && npx tsc --noEmit` exit 0.
  - `cd web && npx next build` exit 0.

---

## 3. Nhật ký kiểm tra cuối kỳ (Final Checklist)
- [ ] `/landing-6`: pin/scrub/menu/preloader không regression.
- [ ] `/landing-3` 375px và 1440px: cuộn hết trang, mép ảnh hero không lộ, không scroll ngang, 5 anchor links nhảy đúng, reveal chạy 1 lần.
- [ ] Điều hướng client-side: `/landing-6` → `/landing-3` → `/landing-6`: scroll không chết ở cả 3 chặng.
- [ ] Reduced motion: verify hoạt động đúng.
