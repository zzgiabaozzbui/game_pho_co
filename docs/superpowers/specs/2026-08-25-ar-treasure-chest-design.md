# Thiết kế: Hệ thống Hòm thưởng & AR (Rương kho báu)

- Ngày: 2026-08-25 · Cập nhật tiến độ: 2026-08-26
- Trạng thái: Đã duyệt thiết kế qua hội thoại (Phần 1–4 + các điểm khóa của người duyệt)
- Tiến độ: **M1 ĐÃ SHIP 2026-08-26** — 14/14 task plan M1 `[x]`, checkpoint cuối xanh (lint/typecheck/vitest 38/38 tests + E2E API Task 14). **M2 code-DONE + merged vào main 2026-08-26** (plan: `docs/superpowers/plans/2026-08-26-chest-system-m2.md`; final review sạch sau fix wave XSS/loading/cache) — **nghiệm thu vận hành chờ checklist thiết bị thật** (plan Task 9 Step 4: Android WebXR / iOS Quick Look / PWA, cần HTTPS) trước khi tuyên bố SHIP. · **M3 code-DONE 2026-08-26** — nghiệm thu vận hành chờ compile marker + checklist thiết bị thật (plan M3 Task 8 PENDING-HUMAN).
- Remote chính thức: https://github.com/zzgiabaozzbui/game_pho_co — repo git hoạt động từ 2026-08-26 (branch `main`); các plan M1 giữ quy ước CHECKPOINT vì viết trước khi có git. File spec là nguồn sự thật cho writing-plans.

## 1. Mục tiêu & phạm vi

Game truy tìm kho báu Phố cổ thêm hệ thống **hòm thưởng nhiều cấp** với phần thưởng đa loại (điểm / câu chuyện vi-en / ảnh upload / video YouTube), trải trên 3 mặt nền trong CÙNG một dự án:

| Mốc | Nội dung | Ràng buộc nghiệm thu |
|-----|----------|----------------------|
| **M1** ✅ ship 2026-08-26 | Engine rơi rương + API + admin + UI mở 2D | Hoàn chỉnh **không phụ thuộc three.js** |
| **M2** ✅ code-done 2026-08-26 | 3D inline + WebXR Android + Quick Look iOS | ChestReveal thay renderer, không đổi game logic |
| **M3** ✅ code-done 2026-08-26 | Quét marker MindAR tại điểm đối tác | MindAR tách hoàn toàn khỏi engine chest |

Quyết định đã chốt với chủ sản phẩm: làm trọn 3 mốc; ảnh tự quản (upload), video dùng link YouTube; cả 3 cơ chế rơi (cố định theo trạm, ngẫu nhiên có pity, thành tích); mở ngay tại chỗ (không túi đồ); phương án kỹ thuật B (WebXR hybrid).

## 2. Dữ liệu (Prisma, chỉ kiểu portable: String/Int/Float/Boolean/DateTime)

```
ChestTier   id, key(unique: common|gold|epic|grand), nameVi, nameEn,
            colorHex, modelGlbPath, modelUsdzPath, sortOrder
ChestLoot   id, scopeKey(indexed), type(POINTS|STORY|IMAGE|VIDEO),
            pointsAmount?, storyVi?, storyEn?, imagePath?, youtubeUrl?, sortOrder
ChestGrant  id, playerId, source(STATION|DROP|ACHIEVEMENT|FINAL|PARTNER),
            sourceRef, tierId, lootSnapshotJson(String), createdAt, openedAt?
            @@unique([playerId, source, sourceRef])
Player      +(chestPityCount Int @default 0)
Station     +(chestTierId Int?)           // gán cấp rương cố định, admin sửa
PartnerSpot id, key(unique), token(unique, random 32+ bytes)   // seed 1 dòng
DropRule    id, chancePct Int, tierKey String, weight Int      // cấu hình admin
```

### Quy ước idempotency
- `sourceRef` phân biệt theo nguồn: `STATION` = slug trạm · `ACHIEVEMENT` = key luật · `FINAL` = `"final"` · `PARTNER` = token · `DROP` = `drop:<uuid>` (mỗi lần roll một ref).
- Unique `(playerId, source, sourceRef)` bảo đảm **retry / race không nhân đôi** bất kỳ nguồn nào; tạo grant bằng exists-check + bắt P2002 (pattern CAS đã kiểm chứng trong dự án).
- **Loot khóa lúc grant**: khi tạo `ChestGrant`, resolve danh sách `ChestLoot` theo scope và chụp thành `lootSnapshotJson`. Admin sửa loot sau đó không đổi phần thưởng đã rơi (audit được).
- **Pity chỉ áp dụng DROP**: `chestPityCount` tăng khi một lượt DROP không ra Epic+; ra Epic+ hoặc đạt ngưỡng 10 thì lần roll tiếp theo ép Epic+ rồi reset. Cố định/thành tích/FINAL/PARTNER không đụng pity.
- Trạm có `chestTierId` null = **không có rương cố định** (vẫn tham gia DROP/achievement bình thường). Seed mặc định gán common cho cả 36 trạm + loot mẫu để chạy được nội dung ngay từ đầu.

### Luật thành tích v1 (key cố định trong code, nội dung loot vẫn do admin soạn)
`stations_6`→common · `stations_18`→gold · `perfect_5` (5 trạm liên tiếp giải đúng ngay lần đầu)→gold · `score_2000`→epic. Hoàn thành 36/36 đi qua grant `FINAL` (grand) chứ không qua achievement.

## 3. Engine & luồng

```
ANSWER đúng
 ├─ cộng điểm (atomic, như hiện tại)
 ├─ STATION grant (theo Station.chestTierId, nếu có)
 ├─ DROP engine: roll chancePct → chọn tier theo weight → áp pity
 ├─ ACHIEVEMENT engine: đánh giá các key v1
 └─ tạo ChestGrant(s) — loot snapshot tại đây
        ▼
GET /api/chests          (rương chưa mở + bộ sưu tập)
        ▼
POST /api/chests/open    (CAS openedAt null→now; POINTS cộng đúng 1 lần)
```

Hoàn thành 36/36 → grant `FINAL`. Claim đối tác → grant `PARTNER` (Epic).

## 4. API

| Endpoint | Ghi chú |
|----------|---------|
| `GET /api/chests?playerId=` | pending (chưa mở) + tổng đã mở + unopenedCount |
| `POST /api/chests/open` `{playerId, grantId}` | CAS; trả loot + tier meta |
| `POST /api/chests/claim-partner` `{playerId, token, lat?, lng?}` | validate token → check đã claim → tạo Epic grant; idempotent |
| `/api/admin/chests/*` | CRUD tier (tên/màu/model path), loot theo scope, DropRule, gán tier trạm, xem/regenerate token PartnerSpot |

Bảo mật: giữ mô hình anonymous-playerId như toàn bộ API hiện có (playerId là bearer secret ở MVP — ghi nhận upgrade path: session thật nếu cần). Token PARTNER là **random high-entropy ≥32 byte**, không phải ID đoán được. Rate-limit các POST mới bằng `lib/rate-limit` (open ~30/phút/IP, claim ~10/phút/IP).

## 5. Kiến trúc UI — ChestReveal tách renderer (khóa kiến trúc)

```
ChestReveal (component độc lập renderer; nhận grant/tier/loot)
 ├── InlineThreeRenderer  // mọi nền tảng: canvas xoay-tay, nắp rương animate mở
 ├── WebXRRenderer        // Android Chrome: immersive-ar + hit-test
 └── QuickLookLauncher    // iOS Safari: <a rel="ar"> tới .usdz
```

- Game logic chỉ biết `ChestGrant → ChestReveal`; renderer được chọn theo platform detect.
- **Không tự khởi động camera/AR** khi mở modal — WebXR session chỉ start sau cú bấm người dùng qua `navigator.xr.isSessionSupported('immersive-ar')`.
- Phân định rõ: **AR placement là cross-platform**; **reveal animation do app điều khiển** — Quick Look có pipeline riêng nên trên iOS reveal (danh sách thưởng) diễn ra trước/sau Quick Look, không giả định đồng bộ animation.
- Hiệu năng: lazy-load chunk three.js chỉ khi cần; cap pixelRatio ≤2; dispose renderer khi đóng overlay; dừng render loop khi tab ẩn.
- Vị trí gắn: panel thành công trạm (station/drop/achievement) · `/treasure` (FINAL + lưới bộ sưu tập) · badge chưa mở ở header `/play` (modal hàng đợi nếu lỡ thoát app) · `/partner`.

## 6. Lớp AR & marker

- **WebXR Android**: session `immersive-ar` + hit-test → đặt rương lên mặt phẳng → tap rương → nắp bật + particle vàng. Fallback tự động về InlineThreeRenderer khi thiết bị/không HTTPS không hỗ trợ.
- **iOS Quick Look**: `<a rel="ar">` trỏ tới **asset .usdz build trước** (không generate runtime).
- **MindAR (M3)**: trang `/partner` riêng biệt; quét target `.mind` (sinh từ hình in bằng MindAR compiler — việc in ấn thuộc vận hành đối tác) → gọi `claim-partner` → tái dùng đúng ChestReveal. MindAR không biết gì về tier/drop/pity. Lib + target được service worker cache để chịu wifi yếu.

## 7. Assets

- Build script Node (three.js) dựng model procedural low-poly 4 cấp, xuất song song: `GLTFExporter → public/models/chest-{tier}.glb` và `USDZExporter → public/models/chest-{tier}.usdz`.
- **Budget mục tiêu (có check lúc build, cảnh báo/fail khi vượt): GLB mỗi tier ≤150KB · USDZ mỗi tier ≤200KB · tổng mục tiêu <1MB.** Vượt ngưỡng phải báo rõ, không âm thầm giảm chất lượng.
- Thay model designer sau này = thay file + cập nhật đường dẫn trong admin tier.

## 8. i18n & nội dung

- Toàn bộ chuỗi UI mới qua `dictionaries.ts` vi/en — cấm chuỗi cứng tiếng Việt trong JSX người chơi.
- Seed mặc định: 4 tier, DropRule mẫu (30%, trọng số lệch common), loot placeholder vi/en cho `final`/`partner`/mẫu 1 trạm + 1 achievement, 1 YouTube mẫu, 1 PartnerSpot.
- Admin tab mới "Rương": tier · loot theo scope · DropRule · gán tier từng trạm · quản lý PartnerSpot. Ảnh thưởng upload tái dùng pipeline magic-bytes + `UPLOADS_DIR` (giới hạn 5MB).

## 9. Kiểm thử

- **Unit**: engine rơi (weight/pity reset-ép/khóa-loot-snapshot), phát hiện achievement, CAS open idempotent, unique grant chống retry.
- **E2E API**: solve → đúng số/lọai grant; double-open race chỉ cộng điểm 1 lần; retry answer không nhân đôi achievement; claim-partner chỉ 1 lần/người chơi.
- **Thủ công theo mốc**: M1 chạy trọn không three.js · M2 checklist iPhone Safari (Quick Look) + Android Chrome (WebXR) + PWA standalone · M3 quét marker thật tại chỗ thiếu sáng.

## 10. Rủi ro ghi nhận

HTTPS bắt buộc cho camera/WebXR (trùng điều kiện PWA sẵn có) · WebXR phụ thuộc phiên bản Android → luôn có fallback inline · YouTube cần mạng · USDZ thường phình hơn GLB → budget check · mô hình playerId bearer chấp nhận rủi ro theo spec MVP (Edge Cases đã ghi).
