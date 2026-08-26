---
target: trang chu /
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
timestamp: 2026-08-26T04-53-37Z
slug: web-src-app-page-tsx
---
# Design Critique — Trang chủ `/` (web/src/app/page.tsx)

Method: dual-agent (A: design-review · B: detect.mjs CLI)

## Design Health Score: 26/40 — Acceptable

| # | Heuristic | Score | Key issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | start() fail im lặng trên 3G yếu |
| 2 | Match System / Real World | 3 | Luật GPS trước, product là check-in ảnh |
| 3 | User Control and Freedom | 3 | Recover `<details>` reversible |
| 4 | Consistency and Standards | 3 | EN đổi brand "Old Quarter Treasure", mất "Phố cổ" |
| 5 | Error Prevention | 3 | Recover disable đến khi đủ input |
| 6 | Recognition Rather Than Recall | 2 | Không có hình ảnh 36 phố/bản đồ/rương |
| 7 | Flexibility and Efficiency | 2 | Returning player thấy y nguyên trang đầu |
| 8 | Aesthetic and Minimalist Design | 3 | Khối luật dày đặc |
| 9 | Error Recovery | 2 | start() fail không message |
| 10 | Help and Documentation | 3 | Card luật = micro-docs đạt |

## Design Specificity Verdict

Category-interchangeable composition wearing heritage tokens. Palette mang chất Hà Nội (son #b4432f, timber/gold, paper-noise, Fraunces + Be Vietnam Pro) nhưng bố cục là onboarding skeleton chung chung; icon duy nhất KeyRound (đọc nhầm "login"); zero imagery về route/chest — hai signature system vô hình. Detector: 1 finding duy nhất (bounce-easing tại .chest-lid globals.css:117) = back-out overshoot cố ý của reveal M2 → giữ nguyên, ghi làm motion rule.

## What's Working

1. Token system chuẩn chất sơn mài & gỗ, không kitsch; lattice-divider craft detail.
2. Recovery-code UX chu đáo: clipboard + confirm 2s + framing trung thực.
3. Mobile hygiene: min-h-dvh, safe-area-inset, max-w-md, CTA trong thumb zone.

## Priority Issues

- **[P1] start() silent failure** (page.tsx:32–34): catch reset busy, không error/retry. Fix: message + retry như applyRecover. → harden
- **[P1] Hero thiếu Hanoi identity**: thêm strip mái ngói/phố cổ hoặc motif tuyến; badge "36 phố phường". → bolder
- **[P1] Rules wall ~600px đẩy CTA dưới fold 360×640**: nén 3 icon-chips (Đến nơi → Check-in → Giải đố nhận rương), full rules vào sheet, auto-collapse khi hasSession. → distill
- **[P2] Treasure CTA vô nghĩa với người mới**: gate theo unopenedCount>0 hoặc teaser khóa. → clarify
- **[P2] Continue-flicker hasSession init false**: lazy init localStorage/skeleton. → polish

## Persona Red Flags

- Casey: start() im lặng · clipboard nuốt lỗi · CTA dưới fold · đọc luật giữa phố.
- Jordan: pill EN bé · "Rương kho báu" jargon pre-context · không ảnh xác nhận đúng chỗ.
- Riley: no-JS trắng trang ("use client") · thiếu aria-busy · mã truncate không expand.

## Minor Observations

KeyRound đụng nghĩa recovery bên dưới → đổi MapPin/Treasure · jade/clay unused trên surface · marker:text-son đẹp, scale up · thiếu OG metadata share preview.
