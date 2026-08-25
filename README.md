# Kho báu Phố cổ — Old Quarter Treasure

Web app (PWA) cho du khách khám phá lịch sử và giá trị văn hóa **36 phố phường Hà Nội** qua hành
trình truy tìm kho báu: mỗi phố là một **trạm**, đến nơi thì **check-in** (GPS / QR / ảnh duyệt tay),
giải **câu đố văn hóa** để nhận **gợi ý** sang trạm kế, hoàn thành cả tuyến để mở rương
**kho báu văn hóa** tại workshop đối tác.

> Spec chi tiết: `specs/001-mvp-treasure-hunt/` · Nguyên tắc dự án: `.specify/memory/constitution.md`

## Tính năng MVP

- Bản đồ 36 trạm mở sẵn — du khách tự do chọn thứ tự điểm đến (Leaflet + OpenStreetMap, không cần API key)
- Check-in 3 tầng: **GPS geofence** → **QR tại địa điểm** (mở thẳng trang trạm kèm token) →
  **ảnh + human review** khi hai cách trên không khả dụng
- Câu đố trắc nghiệm song ngữ, tính điểm (100đ/trạm, trừ điểm trả sai/xem gợi ý, sàn 50đ)
- i18n Việt/Anh toàn bộ giao diện người chơi, nhớ lựa chọn theo máy
- Admin: sửa toàn bộ nội dung trạm (vi/en, tọa độ, bán kính, câu hỏi, gợi ý…),
  duyệt hàng chờ ảnh, in bảng mã QR cho 36 địa điểm
- PWA: manifest + service worker + trang offline

## Chạy máy local (dev)

Yêu cầu: Node.js ≥ 20.9. Không cần cài MySQL — dev dùng SQLite qua driver adapter.

```powershell
cd web
npm install                # tự chạy prisma generate (postinstall)
copy .env.example .env     # sửa ADMIN_PASSWORD + SESSION_SECRET
npm run db:seed            # tạo DB + nạp 36 trạm mẫu
npm run dev                # http://localhost:3000
```

- Người chơi: `/` → `/play`
- Quản trị: `/admin` (mật khẩu trong `ADMIN_PASSWORD`)

## Lệnh chính

| Lệnh                  | Việc                                            |
| --------------------- | ----------------------------------------------- |
| `npm run dev`         | Dev server (Turbopack)                          |
| `npm run build`       | Build production (chạy kèm typecheck)           |
| `npm run lint`        | ESLint (flat config)                            |
| `npm run typecheck`   | `tsc --noEmit`                                  |
| `npm run test`        | Vitest (unit test logic geo/game/auth)          |
| `npm run db:push`     | Đồng bộ schema vào DB                           |
| `npm run db:seed`     | Push + seed 36 trạm                             |
| `npx prisma studio`   | GUI xem/sửa DB                                  |

Chạy 1 test riêng: `npx vitest run src/lib/game.test.ts`

## Kiến trúc

```
web/
├── prisma/schema.prisma     # Station, Player, CheckIn, Answer
│   └── seed.ts              # nội dung 36 phố phường (vi/en) — nguồn dữ liệu gốc
├── src/lib/
│   ├── geo.ts               # haversine (pure, có test)
│   ├── game.ts              # luật trạng thái trạm (tự do thứ tự) + tính điểm (pure, có test)
│   ├── auth.ts              # HMAC token cookie admin (có test)
│   ├── validators.ts        # zod schemas cho mọi API
│   ├── state.ts             # build state người chơi (ẩn đúng trường theo trạng thái)
│   ├── dictionaries.ts      # chuỗi UI vi/en
│   ├── i18n.tsx             # LanguageProvider/useLang
│   └── db.ts                # PrismaClient + adapter (SQLite dev / MySQL prod)
├── src/app/api/             # session · state · checkin(+photo) · answer · qr/[slug] · admin/*
├── src/app/(trang chơi)     # / · /play · /station/[slug] · /treasure
├── src/app/admin/           # dashboard: trạm · duyệt ảnh · in QR
└── public/                  # manifest, sw.js, icons, offline.html
```

Luật tiến trình: mọi trạm mở ngay từ đầu, tự do thứ tự; trạm hoàn thành = check-in APPROVED **và** giải đúng đố.
Hint "gợi ý trạm kế" chỉ trả về sau khi giải xong (server-side, không thể inspect sớm) và chỉ mang tính tham khảo.

## MySQL production

1. `docker compose up -d` ở repo root (hoặc dùng MySQL managed).
2. Sửa `web/prisma/schema.prisma`: `provider = "sqlite"` → `"mysql"`.
3. Đổi `DATABASE_URL` sang dạng `mysql://user:pass@host:3306/game_phoco`.
4. `npm run db:push && npm run db:seed` rồi `npm run build && npm run start`.

Schema cố tình chỉ dùng kiểu portable (String/Int/Float/Boolean/DateTime) để chuyển đổi không phải sửa model.

## Vận hành

- **Địa điểm & QR**: in từ `/admin` tab "In mã QR", dán tại địa điểm. Mã chứa URL
  `/station/<slug>?token=<qrToken>` — quét bằng máy ảnh là vào thẳng màn hình check-in.
- **Duyệt ảnh**: `/admin` tab "Duyệt ảnh" — chấp nhận sẽ mở trạm cho người chơi ngay.
- **Tọa độ**: seed là tâm gần đúng của từng phố; nếu GPS lệch do nhà cao tầng, chỉnh
  `lat/lng/radiusM` trực tiếp trong admin.
- **Ra mắt thật**: bắt buộc HTTPS (camera + geolocation); đặt `NEXT_PUBLIC_BASE_URL`
  đúng domain trước khi in QR.

## Trạng thái & việc tiếp theo

- [x] Core loop dọc đủ 36 trạm (map → check-in → đố → hint → kho báu)
- [x] Admin CRUD + duyệt ảnh + in QR
- [ ] Pilot 3–5 phố gần trung tâm để kiểm chứng gameplay trên mobile thật
- [ ] AI vision xác minh ảnh (tùy chọn, phase sau — constitution cấm phụ thuộc dịch vụ AI trả phí ở MVP)
- [ ] Bảo mật nâng cao: rate limit API, chống spam upload
- [ ] `npm audit`: 3 cảnh báo high nằm ở Prisma CLI (dev-only, chưa có bản vá; không ảnh hưởng runtime)

## Quy ước thuật ngữ

*trạm* (station = 1 phố) · *gợi ý* (hint sang trạm kế) · *check-in* · *tuyến* (route) · *kho báu* (đích cuối).
