# Kế hoạch: Landing Page 6 — dịch ngược toàn bộ kprverse.com

> Mục tiêu: dựng `web/src/app/landing-6/` đạt độ trung thực cao nhất so với https://kprverse.com/
> — bố cục, typography, hiệu ứng, logic chuyển động, âm thanh — nhưng **toàn bộ nội dung và art thay bằng
> thế giới "Phở Cổ"**. Đây là bản kế thừa và thay thế `landing-5`.
>
> **Phiên làm việc mới chỉ cần đọc file này là nối lại được.** Không cần lịch sử chat.

---

## 0. Bối cảnh & khác biệt so với landing-5

Đã có sẵn trong repo:

| Tài nguyên | Vị trí | Dùng được gì |
| :--- | :--- | :--- |
| Phân tích dịch ngược | `docs/kprverse-analysis.md` | Cấu trúc 8 chương, bảng animation, typography |
| Log tài sản | `docs/missing-assets.md` | Đường dẫn CDN đã verify, danh sách 403/404 |
| Clone cộng đồng | `kprverse-ali/` (Next 14 + GSAP) | Khung DOM/typography chương đầu |
| Bản dựng hiện có | `web/src/app/landing-5/` (3341 dòng) | Cấu trúc component, i18n data, HackyText, Preloader |
| Audio synth | `web/src/app/landing-4/components/AudioSynthesizer.ts` | WebAudio thuần, không cần file nhạc |

**3 khiếm khuyết của landing-5 mà landing-6 phải sửa:**

1. **Hotlink CDN kprverse.com** (`landing-5/assets.ts`) — vừa vi phạm bản quyền, vừa vỡ layout nếu họ chặn referrer. Landing-6 dùng 100% asset local trong `web/public/landing-6/`.
2. **Không có scroll choreography thật** — landing-5 là DOM tĩnh + reveal. Bản gốc là scrollytelling pin/scrub liên tục (Lenis + ScrollTrigger).
3. **Không có lớp WebGL** — thiếu 3D card bám xuyên suốt và shader chữ emblem, vốn là xương sống thị giác của bản gốc.

---

## 1. Quyết định kỹ thuật (chốt trước khi code)

| Hạng mục | Bản gốc KPR | Landing-6 dùng | Lý do |
| :--- | :--- | :--- | :--- |
| Smooth scroll | Nuxt custom | `lenis` (~3KB) | Không thể giả bằng CSS; rẻ |
| Pin / scrub | GSAP ScrollTrigger | `gsap` + ScrollTrigger | 8 section pin có scrub — tự viết là tự sát |
| 3D card + emblem | Three.js + KTX2 | `three` (đã có v0.185) thuần, **không** thêm R3F | Chỉ 1 mesh card + 1 plane shader; thêm 2 dep là thừa |
| Âm thanh | Howler.js + file nhạc | `AudioSynthesizer.ts` (WebAudio, tự tổng hợp) | Không cần asset nhạc bản quyền; đã có sẵn trong repo |
| Keyframe parallax | `2ndlayer.ae.json` (After Effects) | JSON keyframe tự viết, cùng schema | Không dùng data của họ |
| Texture | KTX2 GPU | WebP + PNG local | Không cần transcoder |
| Font | JetBrains Mono + Inter | `next/font` — JetBrains Mono + Inter (OFL, free) | Đúng license |

**Dep cần thêm:** `lenis`, `gsap`. Chỉ 2. Không thêm gì khác.

---

## 2. Cấu trúc thư mục đích

```
web/src/app/landing-6/
├── page.tsx                       # Orchestrator: Lenis + ScrollTrigger timeline chủ
├── landing-6.data.ts              # Toàn bộ copy vi/en — 0 chuỗi hardcode trong component
├── assets.ts                      # Map asset LOCAL (/landing-6/...) — cấm URL ngoài
├── motion/
│   ├── timeline.ts                # Định nghĩa scroll timeline tổng, mốc pin từng chương
│   ├── keyframes.json             # Keyframe (x,y,scale,opacity) cho tableau multiplane
│   └── useScrollProgress.ts       # Hook đọc progress toàn cục cho HUD/số chương
├── webgl/
│   ├── Stage.tsx                  # <canvas> three.js bám fixed, z-index 1
│   ├── CardMesh.ts                # Card 3D bám xuyên suốt: scale/pos/rotate theo progress
│   ├── EmblemShader.ts            # Chữ emblem: diffuse map + gradient map + noise
│   └── shaders/                   # .glsl vert/frag
└── components/
    ├── Preloader.tsx              # Telemetry + cổng cho phép audio
    ├── Frame.tsx                  # HUD ngoài: top bar, left rail, bottom rail
    ├── Menu.tsx  Console.tsx      # Overlay menu + console dấu ngã
    ├── HackyText.tsx              # Scramble glyph (port từ landing-5)
    ├── S1Landing.tsx … S9Launch.tsx   # 9 khối nội dung
    └── RevealFooter.tsx           # Footer fixed z-0, main scroll trượt qua để lộ

web/public/landing-6/
├── images/  videos/  svg/  sprites/   # 100% art Phở Cổ, không có gì từ kprverse
```

---

## 3. Ánh xạ nội dung: KPR → Phở Cổ

| Chương | KPR gốc | Phở Cổ |
| :--- | :--- | :--- |
| Hero | KEEP / PROTECT / REIMAGINE | GIỮ GÌN / BẢO VỆ / TÁI HIỆN |
| Emblem 3D | chữ "KPR" | chữ "PHỞ" |
| Story Intro | trailer Keepers | trailer game Phở Cổ |
| Story Project | strapline + toạ độ Tokyo | strapline người giữ lửa + toạ độ Hà Nội `N 21°01.7 / E 105°51.2` |
| Collection Intro | counter 10,000 NFT | counter số công thức / số rương |
| Gallery | 12 card nhân vật | 12 card nguyên liệu / món |
| Tableau 001 | The Keep (xanh lam) | Gánh Phở Cổ — bếp lò, nồi nước dùng |
| Tableau 002 | Factions (đỏ vs lam) | Hai trường phái — Phở Bắc vs Phở Nam |
| Tableau 003 | The World (neon) | Phố cổ Hà Nội về đêm |
| Launch | CTA gia nhập | VÀO CHƠI / QUÉT QR NHẬN RƯƠNG |

Bảng màu: giữ nguyên **cấu trúc** tương phản của gốc (nền `#000`, một accent điểm nhấn, HUD 1px `#ffffff20`),
đổi accent lime `#c0fb50` sang tông ấm phở cổ (chốt ở T03).

---

## 4. Bảng công việc

Quy ước trạng thái: `TODO` / `DOING` / `DONE + <sha>`.
**Xong mỗi task: cập nhật bảng này + commit file này.**

### Giai đoạn A — Dịch ngược & chuẩn bị

| # | Task | Đầu ra | Trạng thái |
| :--- | :--- | :--- | :--- |
| T01 | Chụp lại kprverse.com bằng Playwright: screenshot 9 khối ở 3 breakpoint (390/768/1440), ghi scroll offset từng mốc pin | `docs/plans/landing-6-refs/*.png` + `scroll-map.md` | DONE 677579c |
| T02 | Đo thông số động: thời lượng scrub từng section, easing, độ trễ damping của card, tốc độ scramble | thêm mục "Motion Spec" vào `docs/kprverse-analysis.md` | DONE 677579c |
| T03 | Chốt design token Phở Cổ: palette, thang typography, spacing, độ dày border HUD | `landing-6/tokens.css` | DONE 1cb9ad3 |
| T04 | Kiểm kê asset: liệt kê từng asset cần, ai làm (art mới / tái dùng từ game / procedural) | `docs/plans/landing-6-assets.md` | DONE c760e3b |

### Giai đoạn B — Nền tảng

| # | Task | Đầu ra | Trạng thái |
| :--- | :--- | :--- | :--- |
| T05 | `npm i lenis gsap`; wrapper Lenis + ScrollTrigger, tôn trọng `prefers-reduced-motion` | package.json + `motion/timeline.ts` | DONE bafd382 |
| T06 | Khung route `landing-6/page.tsx` + `landing-6.data.ts` (vi/en) + `assets.ts` local-only | route chạy được, trống | DONE 62c8759 |
| T07 | `Frame.tsx` HUD ngoài: top bar, left rail progress, bottom rail — bám fixed qua mọi chương | HUD hoạt động | DONE 392897e |
| T08 | `Preloader.tsx`: đếm % tải thật (preload asset), telemetry, cổng audio 2 lựa chọn | preloader hoạt động | DONE 1610776 |

### Giai đoạn C — Lớp WebGL

| # | Task | Đầu ra | Trạng thái |
| :--- | :--- | :--- | :--- |
| T09 | `Stage.tsx`: canvas three.js fixed z-1, resize handler, render loop dừng khi tab ẩn | canvas trống chạy 60fps | DONE 1b439b6 |
| T10 | `EmblemShader.ts`: chữ "PHỞ" với diffuse + gradient map + noise, phản ứng con trỏ | emblem hero | DONE 1b439b6 |
| T11 | `CardMesh.ts`: card 3D bám xuyên suốt, `MathUtils.damp` theo con trỏ, scale/pos/rotate 180° do scroll lái | card bay đúng quỹ đạo qua các chương | DONE 1b439b6 |
| T12 | Fallback không WebGL / máy yếu: ảnh tĩnh thay canvas | degrade an toàn | DONE 1b439b6 |

### Giai đoạn D — Các chương

| # | Task | Đầu ra | Trạng thái |
| :--- | :--- | :--- | :--- |
| T13 | S1 Hero: 3 chữ lớn, HackyText, scroll indicator | | TODO |
| T14 | S2 Story Intro: lưới bất đối xứng 3 khối, video teaser hover, border thập tự | | TODO |
| T15 | S3 Story Project: 4 hàng tactical, toạ độ Hà Nội, terminal telemetry, sprite nhân vật | | TODO |
| T16 | S4 Collection Intro: counter odometer, measurement HUD, card lật mặt sau | | TODO |
| T17 | S5 Gallery: track 12 card parallax ngang, tilt 3D khi hover, modal chi tiết | | TODO |
| T18 | S6 Tableau 001 Gánh Phở: multiplane parallax lái bằng `keyframes.json` | | TODO |
| T19 | S7 Tableau 002 Hai trường phái: nhị nguyên màu, scan năng lượng | | TODO |
| T20 | S8 Tableau 003 Phố cổ đêm + drag/orbit desktop, tap-and-hold mobile | | TODO |
| T21 | S9 Launch: 3 card xoè quạt, CTA, countdown | | TODO |
| T22 | `RevealFooter.tsx`: cơ chế fixed z-0 + `margin-bottom`, wordmark SVG khổ lớn | | TODO |

### Giai đoạn E — Âm thanh & hoàn thiện

| # | Task | Đầu ra | Trạng thái |
| :--- | :--- | :--- | :--- |
| T23 | Lớp audio: ambient synth nền + SFX hover/click/chuyển chương, fade theo chương, nhớ lựa chọn mute | mở rộng `AudioSynthesizer` | TODO |
| T24 | Responsive: dựng lại timeline cho mobile (bỏ pin nặng, rút gọn tableau) | 390/768/1440 đều đúng | TODO |
| T25 | Hiệu năng: lazy-load theo chương, `content-visibility`, giới hạn DPR canvas, mục tiêu LCP < 2.5s trên 4G | báo cáo Lighthouse | TODO |
| T26 | A11y: `prefers-reduced-motion` tắt scrub/parallax, focus order, alt text, tab được toàn bộ CTA | | TODO |
| T27 | Kiểm tra bản quyền: grep toàn bộ landing-6 đảm bảo 0 URL `kprverse.com`, 0 asset của họ | script check | TODO |
| T28 | So sánh cuối với ảnh tham chiếu T01, chỉnh sai lệch | | TODO |

---

## 5. Ranh giới bản quyền (bắt buộc)

- Được sao chép: **kỹ thuật** — bố cục, thứ tự chương, đường cong chuyển động, cấu trúc HUD, cảm giác tương tác.
- **Không** được đưa vào bản ship: ảnh, video, model, spritesheet, file keyframe AE, logo, tên thương hiệu, tên nhân vật/phe của KPR.
- Trong lúc dev có thể mở site gốc để canh khung, nhưng T27 là cổng chặn — không qua T27 thì không merge.

---

## 6. Nhật ký

| Ngày | Việc |
| :--- | :--- |
| 2026-09-09 | Tạo kế hoạch. Chưa bắt đầu code. |
| 2026-09-09 | Tách nhánh `feat/landing-6` từ `main` (working tree bẩn được giữ nguyên, không đụng vào). |
| 2026-09-09 | T03 xong. Accent gold `#e8b64a` (nâng từ `--color-gold` của game cho nổi trên nền đen); nhị nguyên Bắc `#5da37a` / Nam `#d9583f`. Token scope trong `.l6` để không rò sang theme giấy sáng ở `globals.css`. **Nợ:** `tokens.css` tham chiếu `--font-jetbrains-mono` chưa tồn tại — T06 phải nạp font này qua `next/font`, trước đó rơi về fallback mono hệ thống. |
| 2026-09-09 | T05 xong ở `bafd382` nhưng phiên đó quên cập nhật bảng — nay đã đánh dấu lại. |
| 2026-09-09 | T06 xong. `layout.tsx` nạp JetBrains Mono qua `next/font` (subset `vietnamese` **có** thật, đã xác nhận dải U+1EA0 trong CSS build) → trả nợ `--font-jetbrains-mono` mà T03 để lại. `page.tsx` mới là vỏ: 9 `<section>` lấy tiêu đề từ `menu.items` của data — T13–T22 thay ruột, giữ nguyên `id`. Đã đo tại runtime: strict-mode double-mount **không** rò Lenis (bộ đếm instance = 1). `assets.ts` khai toàn bộ path `/landing-6/...`, 0 URL ngoài; chưa file nào tồn tại nên `READY` rỗng và `resolveAsset()` luôn trả `PLACEHOLDER` — T04 kiểm kê xong thì nhớ **thêm path vào `READY`**, không thì art có rồi vẫn hiện ô trống. |
| 2026-09-09 | T07 xong ở `392897e`. `Frame.tsx` mount ngay sibling `<main>` trong `page.tsx`, wrapper `position:fixed; pointer-events:none`, chỉ bật `pointer-events:auto` trên từng nút/pill — không chặn scroll/click vùng trống, đã test thủ công (click xuyên qua HUD tới nội dung bên dưới OK). **"Chương đang active" lấy từ IntersectionObserver** (`motion/useScrollProgress.ts` → `useActiveChapter(CHAPTER_IDS)`), KHÔNG suy từ `onGlobalProgress()` — lý do: mỗi chương pin một `scrubVh` khác nhau (xem `createChapter()` T05, và nhật ký T01/T02 bên dưới về kiến trúc 1-pin-toàn-trang khả dĩ) nên % progress toàn cục không chia đều theo chương, còn IntersectionObserver đọc thẳng vị trí DOM luôn đúng bất kể ai đang pin. **T09–T22 (chọn nội dung/asset theo chương) và T23 (fade audio theo chương) nên gọi lại `useActiveChapter`/`useGlobalProgress` này thay vì tự viết lại.** Bottom rail + Menu nhảy chương qua `scrollToChapter()` (mới, `motion/timeline.ts`) — dùng `lenis.scrollTo()` khi Lenis đang chạy, rơi về `scrollIntoView` native khi reduced-motion/chưa init; **không** dùng thẳng `el.scrollIntoView()` vì raf loop của Lenis ghi đè lại vị trí ngay khung hình sau, nút bấm sẽ không có tác dụng gì (bug thật, bắt được lúc test thủ công, đã sửa). **Bug thật thứ hai bắt được lúc test:** `gsap.registerPlugin(ScrollTrigger)` trước đó chỉ chạy bên trong `initScrollEngine()`; do React chạy effect con trước effect cha, hook của `Frame` (con) gọi `onGlobalProgress()` trước khi effect của `page.tsx` (cha) kịp gọi `initScrollEngine()`, plugin chưa đăng ký → `ScrollTrigger.create()` crash `_context is not a function`. Sửa bằng cách đăng ký plugin ở module scope của `timeline.ts` — bất kỳ ai import module này từ giờ đều an toàn bất kể thứ tự mount. **Giới hạn môi trường test đã gặp:** trình duyệt tự động (Claude Browser pane) trong phiên này **không bắn `requestAnimationFrame` khi tab không active/hiển thị** (đo được: vòng lặp rAF trần chạy 0 lần trong 1s) — nên không thể xác nhận bằng mắt animation mượt của Lenis/marker chạy trong phiên đó; đã xác nhận logic đúng bằng cách gọi `lenis.scrollTo(id, {immediate:true})` trực tiếp (scrollY nhảy đúng offset của chương đích) và bằng `npx tsc --noEmit` + `npm run build` sạch. Audio toggle (cờ local, chưa có `AudioSynthesizer`) và Menu/Console overlay (mở/đóng, danh sách 9 chương) đã xác nhận qua DOM/read_page — hoạt động đúng. Console.tsx chỉ có 1 dòng placeholder (`frame.consolePlaceholder`, thêm vào data.ts, không bịa nội dung telemetry). |
| 2026-09-09 | **Quyết định:** giữ nguyên kiến trúc pin-riêng-từng-chương của T05 (`createChapter()` gọi 9 lần), KHÔNG đổi sang 1-pin-toàn-trang như bản gốc. Lý do: đơn giản hơn để giao việc song song cho nhiều agent (mỗi chương tự chứa, không phụ thuộc lẫn nhau qua một progress toàn cục chia nhỏ), và 1-pin-toàn-trang là chi tiết triển khai nội bộ của họ chứ không phải cảm giác người dùng cảm nhận được — mục tiêu là giống cảm giác, không phải giống mã nguồn. T09/T11 (card 3D xuyên suốt) vẫn cần đọc `onGlobalProgress()` để card biết đang ở đâu trong toàn hành trình, độc lập với việc từng chương pin kiểu gì. |
| 2026-09-09 | T04 xong ở `c760e3b`. Kiểm kê đủ **40 asset** trong `assets.ts`: **6 procedural** đã sản xuất ngay (noise, emblem gradient + diffuse map, scanline tableau-factions, bản đồ phố cổ cách điệu, wordmark — tất cả SVG tự vẽ, noise/gradient/diffuse/scanline rasterize bằng `sharp` đã có sẵn trong `node_modules` — transitive dep của Next, không thêm vào `package.json`, dùng one-off qua script tạm rồi xoá, không phải runtime dep); **2 reuse** (`chestFront`/`chestBack` — từ 4 model glb rương đã có ở `web/public/models/`, chưa bake ảnh tĩnh vì cần render headless three.js, để ngỏ cho T16/T21 chọn bake hay chuyển hẳn sang render 3D runtime); **31 new-art còn cần** — đây là số chặn thật cho Giai đoạn D: 12 card nguyên liệu, 9 lớp multiplane của 2 tableau (keep 5 + world 4), 2 cảnh tableau-factions (bắc/nam), 1 poster + 1 side-media + 1 spritesheet nhân vật cho storyIntro/storyProject, 2 video (teaser 01:48, topo loop), 3 card launch xoè quạt. QR `launch/qr-chest.webp` về bản chất là procedural (luôn sinh từ URL thật lúc runtime) nhưng chưa sản xuất — chưa có URL đích và viết QR encoder tay không "đơn giản", để T21 quyết định có thêm lib QR (cần duyệt dep mới) hay tự viết khi đã chốt URL. Chi tiết đầy đủ, bảng 40 dòng, và các quyết định không có trong spec: `docs/plans/landing-6-assets.md`. |
| 2026-09-09 | T08 xong ở `1610776`. `Preloader.tsx`: tiến độ = số việc thật đã xong / tổng số việc, KHÔNG phải timer giả. Việc = `document.fonts.ready` (luôn tính 1) + mỗi path trong `assets.ts` mà `resolveAsset()` trả về khác `PLACEHOLDER` (đi qua `new Image()`, video `.mp4` bị bỏ qua có chủ đích — xem comment `ponytail:` trong file, để lại cho T14/T15 nếu UX sau này cần chờ video giải mã). Hiện tại `READY` trong `assets.ts` rỗng (T04 kiểm kê xong nhưng chưa file nào thật sự nằm trong `public/`) nên tổng việc = 1, tiến độ chỉ ăn theo `fonts.ready` — đúng như spec: "không có gì thật để chờ thì không giả vờ có". Khi các task art sau này thêm path vào `READY`, component tự động nặng thêm việc cần chờ mà không phải sửa gì ở đây. Dòng telemetry (`preloader.lines`, 6 dòng) chia đều theo % tiến độ (`floor(progress/100 * 6)`). **Sàn tối thiểu:** `FIRST_PAINT_FLOOR_MS = 500`, áp dụng CHỈ khi đây là lần vào đầu tiên của phiên (`sessionStorage['l6-preloader-seen']` chưa có) VÀ không giảm chuyển động — trần đặt tên rõ trong code, không phải số bịa để "cho có vẻ cinematic": mục đích chỉ là tránh preloader chớp nhoáng 1 khung hình ở lần vào đầu. Các lần cuộn lại trong cùng phiên (SPA nav, hoặc F5 giữa phiên) không bị sàn này, và reduced-motion cũng bỏ qua nó lẫn bỏ luôn hiệu ứng flicker CSS của pretitle (`.flicker` chỉ gắn class khi `!reduced`) — thanh tiến độ + text vẫn giữ nguyên chức năng dưới reduced motion, chỉ mất phần trang trí. **Audio gate ↔ nút audio của Frame:** `page.tsx` giữ 2 state riêng — `entered` (gate qua preloader chưa) và `audioEnabled` (lựa chọn ban đầu ở cổng audio). `audioEnabled` được seed vào `data-l6-audio-seed` trên `<main>` — đây là chỗ neo cho T23 đọc để quyết định ambient có tự phát ngay không. Nút audio cục bộ trong `Frame.tsx` (`audioOn`, đang là cờ ponytail chưa nối `AudioSynthesizer` thật) là một state ĐỘC LẬP mà người dùng bấm để bật/tắt sau khi đã vào trang — không tự động đồng bộ với `audioEnabled` ở bước này vì `Frame` chưa nhận prop nào cho việc đó. Để lại đúng 1 việc rõ ràng cho T23: khi có `AudioSynthesizer` thật, khởi tạo `audioOn` ban đầu của `Frame` = `audioEnabled` (qua prop mới) thay vì luôn `false`, để lựa chọn ở cổng vào không bị "quên" ngay khi trang hiện ra. Verify: `npx tsc --noEmit` sạch, `npm run build` qua (route `/landing-6` vẫn prerender static, cảnh báo build hiện tại chỉ liên quan `api/checkin/photo`, không phải landing-6), và test tay qua dev server (tab trình duyệt mới, không dính console log tồn đọng của tab cũ): preloader hiện đúng nhãn/dòng, `document.body.style.overflow` = `hidden` khi preloader còn che, bấm "CÓ, MỞ TIẾNG" → preloader biến mất, `overflow` trả về rỗng, `<main data-l6-audio-seed="true">`, `Frame` (brand "PHỞ CỔ", HUD, bottom rail) hiện đúng như trước (không hồi quy so với T07). |
| 2026-09-09 | T01+T02 xong ở `677579c`. Site để lộ `window.scroller` (GSAP ScrollSmoother sống) nên scroll range của cả 9 khối đọc được chính xác qua `ScrollTrigger.getAll()`, không phải áng chừng bằng mắt. **Phát hiện quan trọng, đổi kiến trúc:** bản gốc chỉ có **1 pin duy nhất** cho cả trang (`.the-frame`, scrub suốt 15510px), không phải pin riêng từng chương như giả định ban đầu ở §2.3 và như `createChapter()` của T05 đang implement (pin+scrub theo từng section riêng lẻ). 9 "chương" chỉ là spacer cao 0 điều khiển một stage sticky độc nhất. **T09 (Stage.tsx) và T13–T22 phải xem lại:** nhiều khả năng đúng hơn nếu dùng **một `createChapter`/pin bao ngoài toàn trang**, còn từng section là sub-progress cắt ra từ progress toàn cục, thay vì gọi `createChapter()` 9 lần. Ngân sách scroll (đơn vị vh, giống nhau mọi breakpoint): hero 1.0 / narrative 1.5 / stat 1.2 / **mỗi tableau 2.7** / launch 1.5 — hơn nửa ngân sách cuộn dồn cho 3 tableau. Scramble chữ: đúng 1 ký tự mỗi khung hình, chỉ chữ cái hoa/thường, không số/ký hiệu (sửa lại bảng §3 vốn đoán `A-Z0-9#$@%`). Toàn bộ tween scrub dùng `ease: none` — easing nằm ở việc Lenis/ScrollSmoother làm mượt scroll input, không phải ở tween. **Site gốc không có `prefers-reduced-motion` nào cả** — ta vẫn giữ nguyên yêu cầu tôn trọng nó, đây là cải tiến chủ động chứ không phải parity. Card 3D + 3 tableau là WebGL thuần (Three.js r150), không đọc được scene từ ngoài nên tốc độ parallax từng lớp / damping con trỏ vẫn là ước lượng, đánh dấu `(est.)` trong `docs/kprverse-analysis.md` §6. Chi tiết đầy đủ xem `docs/kprverse-analysis.md` §6 và `docs/plans/landing-6-refs/scroll-map.md`. |
| 2026-09-09 | T09-T12 xong ở `1b439b6`. **Kiến trúc giữ nguyên per-chapter pin** (như quyết định đã chốt ở dòng trên, KHÔNG chuyển sang 1-pin-toàn-trang dù T01/T02 phát hiện bản gốc dùng cách đó) — `Stage`/`CardMesh` chỉ cần `onGlobalProgress()`, độc lập với việc từng chương pin kiểu gì, nên không bị ảnh hưởng bởi phát hiện đó. **API đăng ký của `Stage.tsx`:** một mesh factory trả về `StageObject = { object3D, update(ctx), dispose() }` (type định nghĩa ở `EmblemShader.ts`, dùng chung cho `CardMesh.ts`); `ctx: FrameContext = { dt, elapsed, pointer: {x,y} (NDC thô, mỗi mesh tự damp), progress (0..1 toàn cục) }`. Stage tạo mảng `objects`, add hết vào scene, mỗi khung hình gọi `update()` trên từng cái rồi `renderer.render()` — không có event bus/context provider vì chỉ 2 mesh, cả hai chỉ cần "tick + đọc input chung". **T13-T22 cần điều khiển card từ chương riêng KHÔNG cần API mới của Stage** — `CardMesh.ts` đã export sẵn `setCardHidden(hidden: boolean)` (module-level flag, không phải React prop/context, vì factory của CardMesh chạy 1 lần ngoài React) — chương nào cần ẩn card (vd tableau có nội dung WebGL riêng) thì gọi hàm đó trong effect + cleanup, không đụng vào `Stage.tsx`. **Keyframe card** (`CardMesh.ts` KEYFRAMES, 9 mốc ~0.111 progress/mốc): hero centered lớn (p=0) → storyIntro/storyProject nhỏ lệch phải/trái (p=.111/.222) → collectionIntro xoay 180° "lật mặt sau" khớp ý T16 (p=.333) → gallery thu nhỏ dạt qua 1 bên nhường chỗ track 12 card (p=.444) → 3 tableau scale≈0 ẩn hẳn vì mỗi tableau là scene WebGL riêng, card không nên đè lên (p=.556/.667/.778) → launch trở lại gần thẳng đứng cạnh CTA (p=1.0). Nội suy tuyến tính giữa 2 mốc kề nhau (`ease: none`, khớp phát hiện ở dòng T01/T02 trên — bản gốc cũng không easing trên tween, easing nằm ở smooth-scroll). Đây là "good-faith equivalent" theo đúng yêu cầu spec, KHÔNG phải số đo thật — §6.5 của phân tích đã xác nhận số thật không đo được (canvas không lộ scene ra `window`). **Quyết định GLSL:** shader viết inline template string trong `EmblemShader.ts` (đánh dấu bằng comment `/* glsl */`), KHÔNG tách file `.glsl` riêng — `next.config.ts` không có raw/glsl loader nào (đã kiểm tra, chỉ có `images.remotePatterns`), và T09-T12 không được đụng gì ngoài `landing-6/`; thêm loader là sửa config ngoài phạm vi cho lợi ích nhỏ (2 shader ngắn). **Card material:** mặt = `--l6-surface-2`, viền = `--l6-accent` (đọc runtime qua `getComputedStyle`, fallback hex hardcode nếu SSR/thiếu var) — chọn tối + viền vàng thay vì ngược lại vì viền sáng trên nền tối dễ đọc hình khối 3D hơn. **Còn nợ, rõ ràng cho các task sau:** (1) card đang box phẳng màu + wireframe, điểm swap texture thật đã đánh dấu bằng comment `↓↓↓ real-texture swap point ↓↓↓` trong `CardMesh.ts` — chờ T04's chest bake (`assets.ts` `collectionIntro.chestFront/chestBack`, hiện reuse-pending-bake); (2) `EmblemShader.ts` đã tự xử lý nhánh PLACEHOLDER (flat accent plane) dù hôm nay cả 2 texture đều thật — nhánh đó chưa được test bằng mắt vì chưa có cách nào ép `resolveAsset()` trả PLACEHOLDER cho asset đã READY; (3) hero layout hiện để emblem plane và card cùng centered ở progress=0 nên card che phần lớn emblem — đây là vấn đề bố cục của T13 (Hero content), không sửa ở đây vì T09-T12 chỉ dựng lớp WebGL, không dàn trang. **Verify:** `npx tsc --noEmit` sạch; `npm run build` qua, `/landing-6` vẫn prerender static, cảnh báo build hiện tại chỉ liên quan `api/checkin/photo` (không phải landing-6, như các lần trước); test tay qua dev server (tab mới, 0 console error): canvas hiện đúng z-order dưới HUD/content, click xuyên preloader → emblem + card cả hai hiện, đổi viewport desktop→mobile→desktop canvas resize đúng tỉ lệ không méo/kẹt kích thước cũ, điều hướng rời trang rồi quay lại không có warning "quá nhiều WebGL context" hay lỗi console nào (dispose chạy sạch). **Giới hạn môi trường lặp lại từ T07:** đã đo trực tiếp bằng `requestAnimationFrame` trần trong cùng harness (Claude Browser pane) — 0 lần gọi trong 800ms dù tab đang "visible"/"active" theo `document.visibilityState` — nên KHÔNG thể tận mắt xác nhận vòng lặp rAF của Stage tick đều hay việc `visibilitychange` dừng/tiếp tục nó bằng phép đo runtime trong phiên này; đã bù bằng đọc kỹ lại logic dispose/cancelAnimationFrame trong code (guard `rafId` 0/non-zero, `reduced` tắt hẳn nhánh visibilitychange) — không phát hiện leak. Reduced-motion cũng không emulate được qua công cụ hiện có trong harness này (không có nút giả lập `prefers-reduced-motion` như `resize_window` có cho màu); xác nhận nhánh đó bằng đọc code: `reduced` tính 1 lần khi mount, nếu true gọi `renderFrame(0)` đúng 1 lần rồi không bao giờ `requestAnimationFrame` được gọi. |
