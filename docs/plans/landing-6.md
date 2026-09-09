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
| T01 | Chụp lại kprverse.com bằng Playwright: screenshot 9 khối ở 3 breakpoint (390/768/1440), ghi scroll offset từng mốc pin | `docs/plans/landing-6-refs/*.png` + `scroll-map.md` | TODO |
| T02 | Đo thông số động: thời lượng scrub từng section, easing, độ trễ damping của card, tốc độ scramble | thêm mục "Motion Spec" vào `docs/kprverse-analysis.md` | TODO |
| T03 | Chốt design token Phở Cổ: palette, thang typography, spacing, độ dày border HUD | `landing-6/tokens.css` | DONE 1cb9ad3 |
| T04 | Kiểm kê asset: liệt kê từng asset cần, ai làm (art mới / tái dùng từ game / procedural) | `docs/plans/landing-6-assets.md` | TODO |

### Giai đoạn B — Nền tảng

| # | Task | Đầu ra | Trạng thái |
| :--- | :--- | :--- | :--- |
| T05 | `npm i lenis gsap`; wrapper Lenis + ScrollTrigger, tôn trọng `prefers-reduced-motion` | package.json + `motion/timeline.ts` | DONE bafd382 |
| T06 | Khung route `landing-6/page.tsx` + `landing-6.data.ts` (vi/en) + `assets.ts` local-only | route chạy được, trống | DONE 62c8759 |
| T07 | `Frame.tsx` HUD ngoài: top bar, left rail progress, bottom rail — bám fixed qua mọi chương | HUD hoạt động | TODO |
| T08 | `Preloader.tsx`: đếm % tải thật (preload asset), telemetry, cổng audio 2 lựa chọn | preloader hoạt động | TODO |

### Giai đoạn C — Lớp WebGL

| # | Task | Đầu ra | Trạng thái |
| :--- | :--- | :--- | :--- |
| T09 | `Stage.tsx`: canvas three.js fixed z-1, resize handler, render loop dừng khi tab ẩn | canvas trống chạy 60fps | TODO |
| T10 | `EmblemShader.ts`: chữ "PHỞ" với diffuse + gradient map + noise, phản ứng con trỏ | emblem hero | TODO |
| T11 | `CardMesh.ts`: card 3D bám xuyên suốt, `MathUtils.damp` theo con trỏ, scale/pos/rotate 180° do scroll lái | card bay đúng quỹ đạo qua các chương | TODO |
| T12 | Fallback không WebGL / máy yếu: ảnh tĩnh thay canvas | degrade an toàn | TODO |

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
