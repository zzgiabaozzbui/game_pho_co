# Tasks: MVP Truy tìm kho báu Phố cổ

## Phase 1 — Nền móng
- [x] T1.1 Scaffold Next.js TS Tailwind tại `web/`
- [x] T1.2 Prisma schema + client + env (SQLite dev, MySQL compose)
- [x] T1.3 lib: geo.ts (haversine) — test trước
- [x] T1.4 lib: game.ts progression/answer — test trước
- [x] T1.5 lib: auth.ts HMAC cookie admin — test trước
- [x] T1.6 lib: i18n dictionaries vi/en

## Phase 2 — Core loop dọc
- [x] T2.1 Seed 36 trạm (nội dung lịch sử vi/en)
- [x] T2.2 API session/state
- [x] T2.3 API checkin gps|qr|photo + upload handler
- [x] T2.4 API answer + unlock
- [x] T2.5 UI bản đồ `/play` (Leaflet dynamic)
- [x] T2.6 UI trạm `/station/[slug]` (3 cách check-in → đố → hint)
- [x] T2.7 UI landing + treasure + LanguageSwitcher

## Phase 3 — Admin & PWA
- [x] T3.1 Admin login + layout bảo vệ
- [x] T3.2 CRUD trạm + form song ngữ
- [x] T3.3 Queue duyệt ảnh approve/reject
- [x] T3.4 Trang in QR (PNG server)
- [x] T3.5 manifest + sw.js + icons + offline page

## Phase 4 — Chất lượng
- [x] T4.1 eslint/typecheck/build xanh
- [x] T4.2 vitest xanh (geo, game, auth)
- [x] T4.3 README vận hành + cập nhật AGENTS.md
