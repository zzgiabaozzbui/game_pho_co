---
name: Phố Cổ Hà Nội — Truy tìm Kho báu
description: PWA du lịch khám phá 36 phố phường Hà Nội bằng check-in ảnh, giải đố và rương kho báu 3D
colors:
  paper: "#faf7f2"
  cream: "#fffdf9"
  line: "#e8e2d9"
  ink: "#292524"
  ink-strong: "#1c1917"
  ink-soft: "#78716c"
  son: "#b4432f"
  son-deep: "#96351f"
  son-soft: "#f7e8e4"
  timber: "#2d1b12"
  timber-line: "#4a3320"
  gold: "#c9962b"
  gold-soft: "#f6ecd7"
  jade: "#3f6c51"
  jade-deep: "#2f5340"
  jade-soft: "#ebf2ed"
  clay: "#c07a2d"
  clay-deep: "#7c4a12"
  clay-soft: "#f8efe0"
  wine: "#8f1d1d"
  wine-soft: "#f7eaea"
typography:
  display:
    fontFamily: "Fraunces, Georgia, 'Times New Roman', serif"
    fontWeight: 700
  body:
    fontFamily: "'Be Vietnam Pro', ui-sans-serif, system-ui, sans-serif"
rounded:
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.son}"
    textColor: "{colors.paper}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  header-bar:
    backgroundColor: "{colors.timber}"
    textColor: "{colors.paper}"
---

# Design System: Phố Cổ Hà Nội — Truy tìm Kho báu

## Overview

**Creative North Star: "Bản đồ kho báu × Nhật ký du hành"**

Hệ thống thị giác lai hai chất: **bản đồ phiêu lưu** (la bàn, tuyến đường, dấu ấn khám phá — năng lượng game) và **nhật ký du hành** (giấy dó ấm, mực tàu, con dấu — sự riêng tư của một hành trình cá nhân). Người chơi phải *cảm thấy đang đi giữa phố cổ*, không phải đọc một brochure. Nền luôn là giấy (`paper` + texture `paper-noise`), mực là `ink`; màu sắc chỉ xuất hiện như **con dấu trên nhật ký**: sơn son cho hành động, vàng đồng cho phần thưởng, ngọc bích cho tiến trình — mỗi màu là một loại dấu, không trộn lẫn vai trò.

Mật độ thông tin thấp–trung bình, tối ưu điện thoại một tay (single column, max-w-md, thumb zone). Song ngữ vi/en là citizen hạng nhất — không có chuỗi nào sống ngoài từ điển.

**Key Characteristics:**
- Giấy ấm + mực đậm, tương phản dịu nhưng chữ luôn rõ
- Màu mang vai trò con dấu: son = làm, gold = thưởng, jade = tiến trình, wine = lỗi
- Chữ display serif Fraunces tạo chất "biên niên", thân Be Vietnam Pro hiện đại dễ đọc
- Motion tiết chế: ease-out mượt everywhere, overshoot chỉ dành cho nắp rương

## Colors

Palette đất: giấy, mực, sơn son, gỗ lim, vàng đồng, ngọc bích, đất nung, rượu vang — tất cả đều trầm, chưa bao giờ neon.

### Primary
- **Son (Sơn đỏ)** (#b4432f, deep #96351f, soft #f7e8e4): HÀNH ĐỘNG CHÍNH duy nhất — CTA bắt đầu/nộp bài/con dấu thành công. Đặt tên từ sơn son truyền thống.

### Secondary
- **Vàng đồng** (#c9962b, soft #f6ecd7): phần thưởng, rương, badge điểm số. Không dùng cho CTA.
- **Ngọc bích** (#3f6c51, deep #2f5340, soft #ebf2ed): tiến trình hoàn thành, trạng thái tích cực.
- **Đất nung** (#c07a2d, deep #7c4a12, soft #f8efe0): accent phụ liên quan địa điểm/gợi ý.

### Tertiary
- **Rượu vang** (#8f1d1d, soft #f7eaea): lỗi và mất mát (điểm trừ). Chỉ dùng đúng ngữ cảnh này.

### Neutral
- **Giấy** (#faf7f2) / **Kem** (#fffdf9): nền chính / nền bề mặt nâng.
- **Mực** (#292524 / #1c1917 / #78716c): chữ chính / chữ đậm tiêu đề / chữ phụ.
- **Đường mực nhạt** (#e8e2d9): viền, divider.
- **Gỗ lim** (#2d1b12, line #4a3320): header bar tối, footer nghi thức.

### Named Rules
**The Son Speaks Once Rule.** Mỗi màn hình có TỐI ĐA một vùng son — đó là hành động quan trọng nhất. Nếu hai thứ cùng son, một trong hai phải đổi vai.

**The Seal Roles Rule.** Gold/jade/wine là con dấu vai trò (thưởng/tiến trình/lỗi), không phải trang trí. Không dùng jade vì "đẹp".

## Typography

**Display Font:** Fraunces (fallback Georgia, Times New Roman, serif)
**Body Font:** Be Vietnam Pro (fallback ui-sans-serif, system-ui)

**Character:** Fraunces old-style serif cho tiêu đề tạo cảm giác biên niên ký/Hồ sơ di tích; Be Vietnam Pro hỗ trợ tiếng Việt hoàn chỉnh cho thân bài. Cặp đôi này là "chữ khắc trên bia + chữ viết trong sổ".

### Hierarchy
- **Display** (Fraunces 700): tiêu đề hero, tên trạm phố.
- **Headline** (Fraunces 600–700): tiêu đề section.
- **Title** (Be Vietnam Pro 600–700): tiêu đề card, câu hỏi đố.
- **Body** (400–500): nội dung, max-width ~65ch.
- **Label** (600–700, tracking-wide, uppercase cho eyebrow): nhãn, badge.

### Named Rules
**The Biên Niên Rule.** Tiêu đề kể chuyện di sản → Fraunces. Text thao tác → Be Vietnam Pro. Không đảo ngược.

## Layout

Single column mobile-first, container `max-w-md`, căn giữa. Nhịp spacing theo scale Tailwind (base 4px; nhóm nội dung cách nhau 16–24px, section 32px+). Header bar timber cao cố định có safe-area-inset-top; nội dung chính có `min-h-dvh` và padding `env(safe-area-inset-bottom)` — CTA chính thường neo đáy vùng ngón tay bằng `mt-auto`. Bản đồ Leaflet full-width bên trong container, popup bo góc 0.75rem.

## Elevation & Depth

Phẳng-lifted nhẹ: nền phân tầng bằng màu (paper → cream → white-ish) chứ không dựa bóng. Bóng chỉ xuất hiện có chủ đích: bóng đổ màu (colored shadow) dưới CTA son, bóng inset trên nắp rương, blur backdrop cho overlay modal. Không dùng bóng xám lớn kiểu Material.

### Shadow Vocabulary
- **CTA lift** (`box-shadow: 0 10px 20px -8px rgb(180 67 47 / 45%)`): dưới btn-primary, bóng màu son tạo cảm giác con dấu nổi.
- **Chest inner** (`inset 0 ±4px rgb(0 0 0 / 18%)`): khối gỗ rương có chiều dày.
- **Overlay veil** (`rgb(28 25 23 / 85%) + blur(4px)`): màn mở rương — nghi lễ, cắt hết thế giới ngoài.

## Shapes

Bo tròn vừa phải, ngôn ngữ "đá mài mềm": nút 1rem, card 0.75rem, đầu rương 12px→4px (nắp dày hơn thân). Divider đặc trưng `lattice-divider`: dải 4px gạch vàng đồng lặp cách 16px — hoạ tiết cửa sổ nhà cổ, dùng để ngăn section nghi thức. Texture giấy fractalNoise 3.5% opacity phủ nền full-bleed.

## Components

### Buttons
- **Shape:** bo 1rem, không border.
- **Primary:** nền son, chữ paper, padding 12×24, weight 700; hover → son-deep; có colored shadow.
- **Secondary/Ghost:** nền cream + ring line, chữ ink; dùng cho thao tác phụ.

### Cards / Containers
- **Corner Style:** 0.75rem.
- **Background:** cream trên nền paper, ring 1px line.
- **Internal Padding:** 16px.

### Signature: Rương kho báu (chest-box)

Nắp vòm nửa trụ (barrel lid), thân gỗ màu tier (colorHex từ DB): common #9a3b2b (gỗ hồng mạc đỏ), gold #c9962b, epic #b3122e (son đậm), grand #1f5c46 (ngọc bích đậm). **Anatomy chung mọi tier:** trim vàng đồng sáng (#f0c33c) gồm nan góc dọc, nan ngang, đinh tán, 3 vòng sườn nắp kèm đinh tán chấm, ổ khóa then có lỗ khóa, chân đế; thân giữ màu tier — vàng đồng là trim phổ quát, không đổi theo tier. Lòng nắp lót **nhung đỏ #7e1220** và miệng rương đắp **kho báu bên trong** (đống xu vàng, thỏi vàng, cụm đá ruby/emerald/sapphire, chuỗi ngọc trai vắt mép) — hiện ra khi mở nắp; thêm vài xu vàng và đá quý tràn quanh miệng rương (tất cả bake sẵn trong model GLB và SVG fallback); 2D mở bằng rotate(-100deg) quanh mép sau nắp. Glow tròn vàng radial phía sau lúc chưa mở — nghi thức trước phần thưởng.

### Navigation
Header timber chữ paper; tab/pill active nền gold hoặc son tùy ngữ cảnh; safe-area-aware.

## Do's and Don'ts

### Do:
- **Do** dùng đúng token @theme trong globals.css — không hardcode hex mới.
- **Do** giữ motion ease-out mượt cho UI thường; **overshoot `cubic-bezier(0.34, 1.56, 0.64, 1)` dành riêng cho nắp rương** (The Chest Overshoot Rule) — đây là khoảnh khắc vui duy nhất được phép nảy.
- **Do** đưa yếu tố tuyến đường/bản đồ/phố cổ vào surface entry (North Star "Bản đồ") và giọng văn nhật ký cho phần thưởng/story (North Star "Nhật ký").
- **Do** test cả VI và EN trước khi ship.

### Don't:
- **Don't** dùng gradient tím-xanh, glassmorphism, neon dark-mode — anti-reference tuyệt đối.
- **Don't** để hai CTA son cùng màn hình.
- **Don't** hiển thị mã UUID/playerId nơi người chơi mới nhìn lần đầu mà không kèm giải thích.
