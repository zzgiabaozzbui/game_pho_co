# Thiết kế: Hệ thống Đối tác & Thử thách

- Ngày: 2026-08-27
- Trạng thái: Đã duyệt thiết kế qua hội thoại
- Remote: https://github.com/zzgiabaozzbui/game_pho_co (branch `main`)

## 1. Mục tiêu & phạm vi

Game truy tìm kho báu Phố cổ mở rộng sang **trải nghiệm thực tế tại các đối tác** (workshop, bảo tàng, điểm trải nghiệm văn hóa). Du khách không chỉ trả lời câu hỏi mà còn đến tận nơi, thực hiện nhiệm vụ, chụp ảnh xác nhận.

**Yêu cầu:**
- CRUD Đối tác (Partner): tên, SĐT, địa chỉ, mô tả, link Google Maps, toạ độ, ảnh
- CRUD Nhiệm vụ Workshop (WorkshopTask): hướng dẫn, yêu cầu ảnh, câu hỏi tuỳ chọn
- Thêm/Sửa/Xóa trạm (Station) — bao gồm chọn loại thử thách
- Phân phối khách round-robin cho nhiều đối tác cùng địa điểm
- Upload ảnh workshop + admin duyệt
- Song ngữ vi/en

## 2. Dữ liệu (Prisma, chỉ kiểu portable)

### 2.1 Station — sửa đổi

```prisma
model Station {
  id            Int      @id @default(autoincrement())
  slug          String   @unique
  orderIndex    Int      @unique
  nameVi        String
  nameEn        String
  storyVi       String
  storyEn       String
  // Quiz fields (giữ nguyên backward compat, dùng khi challengeType = QUIZ)
  questionVi    String   @default("")
  questionEn    String   @default("")
  optionsJson   String   @default("[]")   // JSON: [{vi, en}, ...]
  correctIndex  Int      @default(0)
  hintVi        String
  hintEn        String
  // === THÊM MỚI ===
  challengeType String   @default("QUIZ") // "QUIZ" | "WORKSHOP"
  lat           Float
  lng           Float
  radiusM       Int      @default(120)
  chestTierId   Int?
  qrToken       String   @unique
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  checkIns           CheckIn[]
  answers            Answer[]
  stationPartners    StationPartner[]
  workshopTasks      WorkshopTask[]
}
```

### 2.2 Partner — mới

```prisma
model Partner {
  id            Int      @id @default(autoincrement())
  name          String                     // "Xưởng Gỗ Sơn Son"
  phone         String?                    // SĐT liên hệ
  address       String?                    // Địa chỉ cụ thể
  description   String?                    // Mô tả ngắn
  googleMapsUrl String?                    // Link Google Maps
  lat           Float?                     // Toạ độ (dùng cho bản đồ)
  lng           Float?
  imageUrl      String?                    // Ảnh đại diện
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  stationPartners    StationPartner[]
  workshopTasks      WorkshopTask[]
  guestAssignments   GuestAssignment[]
}
```

### 2.3 StationPartner — mới (bảng liên kết)

```prisma
model StationPartner {
  id        Int     @id @default(autoincrement())
  stationId Int
  partnerId Int
  station   Station @relation(fields: [stationId], references: [id])
  partner   Partner @relation(fields: [partnerId], references: [id])

  @@unique([stationId, partnerId])
}
```

### 2.4 WorkshopTask — mới

```prisma
model WorkshopTask {
  id              Int      @id @default(autoincrement())
  partnerId       Int
  stationId       Int      // query nhanh theo station
  instructionVi   String   // "Chụp ảnh bạn đang gấp giấy dó"
  instructionEn   String
  photoReqsVi     String   // "1 ảnh chính diện, thấy rõ sản phẩm"
  photoReqsEn     String
  quizQuestionVi  String?  // Câu hỏi tuỳ chọn (admin bật/tắt)
  quizQuestionEn  String?
  quizOptionsJson String?  // JSON: [{vi, en}, ...] (nếu có quiz)
  quizCorrectIndex Int?
  rewardPoints    Int      @default(50)
  sortOrder       Int      @default(0)
  createdAt       DateTime @default(now())

  partner          Partner   @relation(fields: [partnerId], references: [id])
  guestAssignments GuestAssignment[]
}
```

### 2.5 GuestAssignment — mới

```prisma
model GuestAssignment {
  id             Int       @id @default(autoincrement())
  guestId        String    // playerId
  stationId      Int
  partnerId      Int
  workshopTaskId Int?
  assignedAt     DateTime  @default(now())
  completedAt    DateTime?
  status         String    @default("ASSIGNED") // ASSIGNED | COMPLETED | REJECTED
  photoPath      String?   // Ảnh upload từ workshop
  reviewNote     String?
  reviewedBy     String?
  reviewedAt     DateTime?

  station      Station      @relation(fields: [stationId], references: [id])
  partner      Partner      @relation(fields: [partnerId], references: [id])
  workshopTask WorkshopTask? @relation(fields: [workshopTaskId], references: [id])

  @@index([stationId, partnerId])
  @@index([guestId, stationId])
}
```

## 3. Luồng chơi

### 3.1 Trạm类型 QUIZ (giữ nguyên hiện tại)

```
Check-in (GPS/QR/Photo) → Story → Quiz → Giảiđố → Gợi ý sang trạm kế
```

### 3.2 Trạm类型 WORKSHOP (mới)

```
Khách mở trạm S
      ↓
Hệ thống tìm partner ít nhất tại S (round-robin)
      ↓
Tạo GuestAssignment(guest, S, partner)
      ↓
Hiển thị:
  - "Đến [Tên Partner] — [Địa chỉ]"
  - "Thực hiện: [Hướng dẫn task]"
  - "Upload ảnh: [Yêu cầu ảnh]"
      ↓
Khách đến nơi → upload ảnh
      ↓
Nếu partner có quizQuestion → hiện câu hỏi → khách trả lời
      ↓
Gửi lên → Chờ admin duyệt
      ↓
Admin duyệt:
  - Approved → +điểm, completedAt = now, gợi ý sang trạm kế
  - Rejected → reviewNote hiển thị cho khách, giữ nguyên assignment
```

### 3.3 Check-in cho workshop

Workshop trạm KHÔNG cần check-in photo/QR/GPS riêng. Việc upload ảnh workshop chính là xác nhận có mặt.

- Nếu trạm workshop đang ở trạng thái ASSIGNED → hiện hướng dẫn + nút upload
- Upload ảnh → chuyển trạng thái sang PENDING (chờ admin duyệt)
- Admin duyệt tại tab "Duyet anh" (mở rộng cho cả workshop photos)

## 4. Thuật toán phân phối khách (Round-Robin)

```
Khi guest G mở station S (challengeType = WORKSHOP):
  1. Lấy danh sách partner của S, sắp xếp theo id ASC
  2. Query: mỗi partner đếm số assignment có status IN (ASSIGNED, COMPLETED)
  3. Chọn partner có số lượng nhỏ nhất
  4. Nếu bằng nhau → partner có id nhỏ nhất (deterministic)
  5. Tạo GuestAssignment(guestId=G, stationId=S, partnerId=chosen)
  6. Trả về partner info + workshop task cho client hiển thị

Quy tắc:
  - Mỗi guest chỉ DUY NHẤT 1 assignment tại mỗi station
  - Nếu guest đã có assignment tại S → trả về assignment cũ (không tạo mới)
  - Round-robin chỉ tính trên tổng số assignment (không phân biệt status)
```

## 5. Admin UI

### 5.1 Tabs hiện tại (sửa đổi)

**Tab "Trạm" (StationsTab) — mở rộng:**
- Thêm: dropdown "Loại thử thách" (QUIZ / WORKSHOP)
- Nếu QUIZ: giữ nguyên form quiz hiện tại (question, options, correctIndex)
- Nếu WORKSHOP: hiển thị multi-select picker chọn partner (có thể gán nhiều)
- Thêm nút "Thêm trạm mới" (form trống, cần chọn slug + orderIndex)
- Thêm nút "Xóa trạm" (soft delete = tắt isActive, KHÔNG xóa dữ liệu)

**Tab "Duyet anh" (ReviewsTab) — mở rộng:**
- Hiển thị CẢ check-in photos VÀ workshop photos
- Phân biệt bằng tag: [Check-in] / [Workshop]
- Workshop photos hiển thị thêm: tên partner, hướng dẫn task, kết quả quiz (nếu có)

### 5.2 Tabs mới

**Tab "Đối tác" (PartnersTab):**
- Danh sách partner (bảng): tên, SĐT, địa chỉ, trạng thái active/inactive
- Nút "Thêm đối tác" → form modal/panel:
  - Tên (bắt buộc)
  - Số điện thoại
  - Địa chỉ
  - Mô tả
  - Link Google Maps
  - Toạ độ (lat, lng) — tự điền nếu paste link Maps, hoặc nhập tay
  - Ảnh đại diện (upload)
- Nút "Sửa" → mở form với dữ liệu cũ
- Nút "Xóa" → xác nhận, kiểm tra liên kết (nếu partner đang có assignment → chỉ ẩn, không xóa cứng)
- Toggle active/inactive

**Tab "Thử thách" (ChallengesTab):**
- Filter: chọn partner (hoặc "Tất cả")
- Danh sách workshop tasks theo partner
- Nút "Thêm nhiệm vụ" → form:
  - Chọn đối tác (dropdown, bắt buộc)
  - Hướng dẫn (VI, EN)
  - Yêu cầu ảnh (VI, EN)
  - Câu hỏi tuỳ chọn: toggle Bật/Tắt
    - Nếu bật: hiện trường câu hỏi + các đáp án + chọn đáp án đúng
  - Điểm thưởng (mặc định 50)
  - Thứ tự hiển thị
- Nút "Sửa" → mở form với dữ liệu cũ
- Nút "Xóa" → xác nhận

### 5.3 API mới

| Endpoint | Method | Chức năng |
|---|---|---|
| `/api/admin/partners` | GET | Danh sách partner |
| `/api/admin/partners` | POST | Thêm partner |
| `/api/admin/partners/[id]` | PUT | Sửa partner |
| `/api/admin/partners/[id]` | DELETE | Xóa/ẩn partner |
| `/api/admin/challenges` | GET | Danh sách workshop tasks (filter partnerId) |
| `/api/admin/challenges` | POST | Thêm workshop task |
| `/api/admin/challenges/[id]` | PUT | Sửa workshop task |
| `/api/admin/challenges/[id]` | DELETE | Xóa workshop task |
| `/api/admin/stations` | POST | Thêm trạm mới |
| `/api/admin/stations/[id]` | DELETE | Soft delete trạm |
| `/api/assign` | POST | Guest request assignment (trả về partner + task) |
| `/api/workshop/submit` | POST | Guest upload ảnh workshop + quiz answer |
| `/api/admin/reviews` | GET | Mở rộng: thêm workshop photos vào danh sách |

### 5.4 Validators mới (src/lib/validators.ts)

```typescript
// Partner
partnerCreateSchema = { name: string(1-200), phone?: string, address?: string,
  description?: string, googleMapsUrl?: string, lat?: number, lng?: number,
  imageUrl?: string }
partnerUpdateSchema = { id: positiveInt, ...partnerCreateSchema (all optional) }

// WorkshopTask
workshopTaskCreateSchema = { partnerId: positiveInt, stationId: positiveInt,
  instructionVi: string(1-500), instructionEn: string(1-500),
  photoReqsVi: string(1-500), photoReqsEn: string(1-500),
  quizQuestionVi?: string, quizQuestionEn?: string,
  quizOptionsJson?: string, quizCorrectIndex?: number,
  rewardPoints: positiveInt, sortOrder: int }
workshopTaskUpdateSchema = { id: positiveInt, ...all fields optional }

// Station (mở rộng)
stationCreateSchema = { slug: string, orderIndex: int, nameVi: string,
  nameEn: string, challengeType: "QUIZ" | "WORKSHOP", ... }
stationDeleteSchema = { id: positiveInt }

// GuestAssignment
assignSchema = { guestId: uuid, stationId: positiveInt }

// Workshop submission
workshopSubmitSchema = { guestId: uuid, assignmentId: positiveInt,
  photo: file, quizAnswer?: int }
```

## 6. Seed data

```typescript
// Sample partners (3 đối tác mẫu)
Partner { name: "Xưởng Gỗ Sơn Son", address: "42 Hàng Mã", ... }
Partner { name: "Bảo tàng Lịch sử", address: "216 Trần Quang Khải", ... }
Partner { name: "Workshop Giấy Dó", address: "11 Hàng Bông", ... }

// Sample station-partner links
StationPartner { station: "hang-ma", partner: "Xưởng Gỗ Sơn Son" }
StationPartner { station: "hang-ma", partner: "Workshop Giấy Dó" }
StationPartner { station: "tran-quang-khai", partner: "Bảo tàng Lịch sử" }

// Sample workshop tasks
WorkshopTask { partner: "Xưởng Gỗ Sơn Son", instruction: "Chụp ảnh bạn đang sơn một món đồ gỗ", ... }
```

## 7. Xử lý ngoại lệ

- **WORKSHOP station không có partner nào**: fallback sang hành vi QUIZ (hiện câu hỏi từ Station fields). log warning cho admin.
- **Guest mở trạm WORKSHOP đã có assignment**: trả về assignment cũ (không tạo mới, không đổi partner).
- **Partner bị xóa/ẩn khi đang có assignment ASSIGNED**: assignment giữ nguyên, hiển thị partner name từ snapshot (không mất dữ liệu).
- **WorkshopTask bị xóa khi đang có assignment**: assignment giữ nguyên workshopTaskId, hiển thị hướng dẫn từ snapshot.

### 7.1 Client-side routing

Khi client nhận station từ `/api/state`:
- Nếu `challengeType = "QUIZ"` → hiển thị flow hiện tại (check-in → story → quiz)
- Nếu `challengeType = "WORKSHOP"` → gọi `POST /api/assign` để lấy assignment → hiển thị workshop flow
- Client cần biết `challengeType` để render đúng UI

## 8. Quy tắc backward compatibility

- **Quiz stations giữ nguyên**: các trạm hiện tại (challengeType = QUIZ mặc định) hoạt động y hệt cũ, không cần migration dữ liệu
- **PartnerSpot hiện tại**: giữ nguyên, KHÔNG xóa. PartnerSpot là model riêng cho MindAR marker. Partner mới là model riêng cho workshop system. Hai hệ thống độc lập.
- **Seed hiện tại**: seed 36 trạm giữ nguyên, chỉ thêm sample partners + workshop tasks cho demo

## 9. Testing

- Unit test: round-robin assignment logic, validator schemas
- Integration test: API partner CRUD, workshop task CRUD, assignment flow
- E2E: guest mở workshop station → thấy hướng dẫn → upload ảnh → admin duyệt

## 10. Files thay đổi

### Tạo mới
- `web/src/app/api/admin/partners/route.ts`
- `web/src/app/api/admin/partners/[id]/route.ts`
- `web/src/app/api/admin/challenges/route.ts`
- `web/src/app/api/admin/challenges/[id]/route.ts`
- `web/src/app/api/assign/route.ts`
- `web/src/app/api/workshop/submit/route.ts`
- `web/src/lib/assignment.ts` (round-robin logic)

### Sửa
- `web/prisma/schema.prisma`
- `web/prisma/seed.ts`
- `web/src/app/admin/page.tsx`
- `web/src/app/api/admin/stations/route.ts` (POST thêm trạm)
- `web/src/app/api/admin/stations/[id]/route.ts` (DELETE soft)
- `web/src/app/api/admin/reviews/route.ts` (mở rộng workshop)
- `web/src/app/api/state/route.ts` (thêm assignment logic)
- `web/src/lib/validators.ts`
- `web/src/lib/dictionaries.ts` (thêm chuỗi vi/en mới)
