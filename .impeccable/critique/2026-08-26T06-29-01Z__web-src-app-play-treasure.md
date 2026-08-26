---
target: play + treasure surfaces
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 4
timestamp: 2026-08-26T06-29-01Z
slug: web-src-app-play-treasure
---
# Design Critique — /play (play/page.tsx + StationFlow.tsx) & /treasure (treasure/page.tsx)

Method: dual-agent (A: design-review · B: detect.mjs CLI scoped)

## SURFACE 1: /play — Score 27/40 (Acceptable)

Specificity: AUTHORED (street-name stripping, status eyebrow, 52dvh map) với một lỗ hổng generic: khối check-in là segmented form stock, thiếu khoảnh khắc "con dấu".

Heuristics: Visibility 3 · RealWorld 3 · Control 2 · Consistency 3 · Prevention 2 · Recognition 2 · Flexibility 4 · Minimalism 3 · Recovery 3 · Help 2

Top issues:
- [P0] Empty check-in card khi mới arrival (StationFlow mode="choose" không match branch nào) → default tab photo theo product intent → onboard
- [P0] Hint −20đ không disclosure, không confirm → label giá + one-tap confirm → clarify
- [P1] Chest close nuốt lỗi POST (fire-and-forget) — badge "hồn ma" trên 3G → giữ overlay opened tới khi POST confirm → harden
- [P1] Chip color legend thiếu ("● đã giải ● đang làm ● chưa đến") → clarify
- [P2] Header dày 3 dòng → fold badge vào progress line → distill

Personas: Casey ✓ targets/photo-downscale; Jordan lost ở trạm 1 (empty panel + màu vô nghĩa); Riley: station 0 options = nút submit disabled vĩnh viễn không message.

Cross-surface: home dạy Camera step-2 nhưng play mặc định tab GPS (mâu thuẫn); "chip" hai nghĩa (step-chip vs station-chip) → đổi tên rail thành "tuyến"; lattice/paper-noise vắng mặt giữa hành trình.

## SURFACE 2: /treasure — Score 26/40 (Acceptable)

Specificity: AUTHORED ATMOSPHERE (vault room timber + gold halo — đẹp nhất app), INTERCHANGEABLE CEREMONY (nghi thức outsourced cho modal; hex cứng #1f130c/#14100d vi phạm DESIGN.md; gold làm CTA fill vi phạm Seal Roles).

Heuristics: Visibility 3 · RealWorld 3 · Control 2 (X consumes chest) · Consistency 2 · Prevention 3 · Recognition 3 · Efficiency 3 · Minimalism 3 · Recovery 2 · Help 2

Top issues:
- [P1] Fetch fail render thành "collection rỗng" — nói dối người sưu tầm (catch→setCollection([])) → error flag + retry + giữ grid cuối → harden
- [P1] Post-ceremony flatness: modal đóng về grid text tĩnh kết bằng link gạch chân → trophy scale-in + lattice + journey stats + share stamp → animate+delight
- [P1] Gold-as-CTA vi phạm Seal Roles → btn-primary son cho "Về bản đồ", gold chỉ cho reward frame → clarify
- [P2] Collection chìm dưới workshop card → reorder + tier-count chips → layout
- [P3] X của modal tiêu thụ rương FINAL (onClose=openFinal) → pre-open state có nút "Mở kho báu" rõ → clarify

Personas: Casey — RewardCard images eager-load, cần loading="lazy" cho 20+ chests 3G; Jordan — "workshop" thiếu microcopy "show this screen at the shop"; offline = fake-empty bug + không retry.

## Detector (B)

CLEAN exit 0 ([] trên play/treasure/StationFlow). Coverage gaps: runtime hydration/CAS races, WebXR fallbacks, api/chests + admin + engine ngoài phạm vi scan.

## Cross-surface synthesis

Home sáng giấy ↔ treasure tối gỗ = ngày ↔ đêm nghi thức — chủ ý và tốt. Vòng lặp chưa khép: vocabulary step-chips của home nên echo lại ở treasure ("36/36 · con dấu thu được").
