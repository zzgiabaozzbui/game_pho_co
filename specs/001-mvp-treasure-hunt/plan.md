# Implementation Plan: MVP Truy tìm kho báu Phố cổ

**Branch**: `001-mvp-treasure-hunt` | **Date**: 2026-08-25

## Summary
Web PWA Next.js App Router + TypeScript + Tailwind; Prisma ORM; MySQL prod / SQLite dev (provider portable). Leaflet+OSM cho bản đồ. i18n tự viết nhẹ (dictionary + context). QR sinh PNG server-side (qrcode). Ảnh upload vào `web/uploads/`. Admin bảo vệ bằng mật khẩu env + HMAC-signed cookie.

## Structure
```
web/
  prisma/schema.prisma      # Station, Player, CheckIn
  prisma/seed.ts            # 36 trạm vi/en
  src/lib/                  # geo.ts game.ts i18n auth.ts db.ts validators.ts
  src/app/api/              # session state checkin answer admin qr uploads
  src/app/(player)/         # landing, play (map), station/[slug], treasure
  src/app/admin/            # login, stations, reviews, qr-sheet
  public/                   # manifest, sw.js, icons
specs/001-mvp-treasure-hunt/
docker-compose.yml           # MySQL 8 cho môi trường có Docker
```

## Data Model
- Station: id, slug unique, orderIndex unique int, nameVi/En, storyVi/En, questionVi/En, options JSON [{vi,en}], correctIndex, hintVi/En, lat, lng, radiusM default 100, qrToken unique, isActive.
- Player: id uuid string PK, score, completedCount, createdAt.
- CheckIn: id, playerId FK, stationId FK, method GPS|QR|PHOTO, status APPROVED|PENDING|REJECTED, lat?, lng?, distanceM?, photoPath?, reviewNote?, timestamps.

Progression = station orderIndex so với set trạm đã APPROVED-checkin + answered-correct của player (lưu gọn: Player.completedCount + CheckIn records; đáp án đúng ghi CheckIn? → tách bảng AnswerEvent? Giữ tối giản: AnswerEvent lưu trong CheckIn? Không — dùng bảng PlayerStation? Quyết định: bảng `Answer` riêng: playerId+stationId unique, isCorrect, attempts.)

## Risks
- GPS nhà cao tầng sai số → radius mặc định 120m + chỉnh qua admin.
- next/leaflet SSR → dynamic import ssr:false.
- SQLite↔MySQL khác biệt → tránh kiểu đặc thù, JSON lưu TEXT.

## Verification
- vitest unit: geo/game/answer/auth.
- `npm run build` = typecheck gate; eslint.
- E2E tay theo SC-001 trên mobile thật (docs hướng dẫn).
