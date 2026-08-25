# Feature Specification: MVP Truy tìm kho báu văn hóa Phố cổ Hà Nội

**Feature Branch**: `001-mvp-treasure-hunt`
**Created**: 2026-08-25
**Status**: Draft
**Input**: Web app du khách khám phá 36 phố phường qua hành trình truy tìm kho báu; check-in GPS+QR (ảnh duyệt tay fallback); tự do thứ tự điểm đến, giải đố nhận gợi ý trạm kế; đích là workshop đối tác.

## User Scenarios & Testing

### User Story 1 - Xem bản đồ và bắt đầu hành trình (P1)
Du khách mở web, thấy bản đồ phố cổ với cả 36 trạm mở sẵn (tự do thứ tự), bấm bắt đầu → nhận playerId ẩn danh.
**Why this priority**: không có entry point thì không có gì để demo.
**Independent Test**: mở `/`, bấm "Bắt đầu" → chuyển `/play`, thấy bản đồ 36 trạm.
1. **Given** chưa có phiên, **When** bấm Bắt đầu, **Then** tạo player mới và mọi trạm ở trạng thái current.
2. **Given** player có tiến trình, **When** quay lại web, **Then** tiếp tục tại trạm đang dở (localStorage giữ playerId).

### User Story 2 - Check-in tại trạm bằng GPS hoặc QR (P1)
Tại địa điểm, người chơi check-in: (a) GPS trong bán kính trạm, hoặc (b) quét QR tại địa điểm (URL chứa token). Đúng → trạng thái checked-in, câu đố mở.
**Why this priority**: đây là cơ chế mở khóa trạm, cốt lõi gameplay.
**Independent Test**: gọi check-in với tọa độ trong bán kính → thành công; ngoài bán kính → từ chối kèm khoảng cách; token sai → từ chối.
1. **Given** trạm active, **When** gửi GPS cách tâm ≤ radius, **Then** check-in APPROVED.
2. **Given** trạm active, **When** GPS sai nhưng token QR đúng, **Then** check-in APPROVED (QR tin hơn GPS).
3. **Given** GPS sai + không token, **When** submit, **Then** báo lỗi khoảng cách, gợi ý dùng ảnh.

### User Story 3 - Check-in fallback bằng ảnh + human review (P2)
Khi GPS/QR không khả dụng: chụp/upload ảnh đặc trưng địa điểm → vào hàng chờ; admin duyệt → trạm mở. Người chơi thấy trạng thái "đang chờ Người Giữ Kho Báu".
**Why this priority**: cần cho địa điểm không đặt được QR/GPS nhiễu, nhưng không chặn P1-P2.
**Independent Test**: upload JPEG hợp lệ → CheckIn PENDING; admin approve → trạm mở.
1. **Given** check-in GPS thất bại, **When** upload ảnh ≤ 8MB JPEG/PNG, **Then** tạo CheckIn PENDING kèm ảnh.
2. **Given** CheckIn PENDING, **When** admin reject kèm ghi chú, **Then** người chơi thấy lý do và chụp lại được.

### User Story 4 - Giải đố nhận gợi ý sang trạm kế (P1)
Sau check-in, câu hỏi vi/en hiện ra (trắc nghiệm). Đúng → hiện lời chúc mừng; gợi ý (vi/en) chỉ tới trạm kế là tham khảo — mọi trạm vốn đã mở — và chỉ hiện khi người chơi bấm xem, lần đầu trừ 20 điểm (sàn 50đ/trạm). Sai → được thử lại, trừ điểm nhẹ. Server chỉ trả question/options cho trạm đã check-in được duyệt.
**Why this priority**: phần "khám phá" của game, phân biệt với app check-in thường.
**Independent Test**: trả lời đúng index → station completed + cộng điểm; bấm xem gợi ý → hiện gợi ý, lần đầu −20đ; đáp án sai → rejected.
1. **Given** đã check-in, **When** chọn đúng đáp án, **Then** hoàn thành trạm, cộng điểm; nút xem gợi ý trạm kế xuất hiện.
2. **Given** đã check-in, **When** chọn sai, **Then** thông báo sai, cho thử lại.

### User Story 5 - Đích kho báu văn hóa (P3)
Hoàn tất trạm 36 → trang "Kho báu văn hóa": điểm tổng, huy hiệu, giới thiệu workshop đối tác (placeholder).
**Why this priority**: payoff cảm xúc, không chặn core loop.
**Independent Test**: hoàn thành 36 trạm → `/treasure` mở, hiển thị tổng điểm.
1. **Given** đủ 36 trạm completed, **When** mở `/play`, **Then** nút tới Kho báu sáng lên.

### User Story 6 - Admin quản trị nội dung & duyệt ảnh (P2)
Admin đăng nhập bằng mật khẩu env, sửa nội dung trạm (vi/en, tọa độ, radius, câu hỏi, đáp án, hint, token), xem/xuất QR từng trạm, duyệt queue ảnh.
**Why this priority**: chủ sở hữu tự soạn/sửa nội dung 36 trạm không cần dev.
**Independent Test**: đăng nhập sai → chặn; sửa nameEn → lưu DB, UI người chơi phản ánh ngay.
1. **Given** mật khẩu đúng, **When** login, **Then** cookie admin hợp lệ, vào dashboard.
2. **Given** CheckIn PENDING, **When** approve, **Then** player liên quan được mở trạm.

### Edge Cases
- Từ chối quyền GPS / trình duyệt không hỗ trợ → hiển thị hướng dẫn + đẩy sang QR/ảnh.
- QR bị chụp màn hình lan truyền: token chỉ hợp lệ khi đi kèm GPS trong bán kính rộng hơn (anti-cheat mềm) HOẶC chấp nhận rủi ro ở MVP (cấu hình được).
- Ảnh quá lớn/sai định dạng → từ chối rõ ràng.
- Người chơi xoá localStorage → mất playerId (chấp nhận MVP; không yêu cầu account).
- Hai thiết bị cùng playerId → state cuối cùng thắng (last-write).

## Requirements

- **FR-001**: Dữ liệu 36 trạm nạp từ seed (TS data file) gồm: slug, thứ tự, tên/story/question/hint vi+en, đáp án, tọa độ, radius, qrToken.
- **FR-002**: API session/state trả về tiến trình + danh sách trạm theo trạng thái (current/checked-in/completed — mọi trạm mở ngay từ đầu, không còn locked); story công khai làm teaser, question/options chỉ trả cho trạm đã APPROVED.
- **FR-003**: Check-in GPS: haversine server-side, so radius trạm; ghi log lat/lng/distance.
- **FR-004**: Check-in QR: validate qrToken của trạm; URL QR dạng `/station/{slug}?token=...`.
- **FR-005**: Check-in ảnh: upload multipart, kiểm tra loại/kích thước, lưu `uploads/`, tạo CheckIn PENDING.
- **FR-006**: Answer API: chấm đáp án, cập nhật progress/score; endpoint `action: "hint"` trả gợi ý sang trạm kế khi được yêu cầu (lần đầu −20đ, clamp giữ sàn 50đ/trạm; tham khảo).
- **FR-007**: Admin: login (env password, HMAC cookie), CRUD trạm, review queue (approve/reject + note), trang in QR (PNG server-generated).
- **FR-008**: i18n vi/en client-side (dictionary + context), mặc định vi, nhớ lựa chọn.
- **FR-009**: PWA manifest + service worker + icon; HTTPS requirement ghi trong docs.
- **FR-010**: Tiến trình player persist theo playerId; không có tài khoản ở MVP.

### Key Entities
- **Station (trạm)**: 1 phố phường; thứ tự tuyến; nội dung song ngữ; geo; qrToken.
- **Player**: ẩn danh, UUID, currentStationIndex, score, startedAt/completedAt.
- **CheckIn**: phương thức (GPS|QR|PHOTO), trạng thái (APPROVED|PENDING|REJECTED), bằng chứng (lat/lng/distance/photoPath), note reviewer.

## Success Criteria

- **SC-001**: Pilot 3–5 trạm chơi trọn vẹn trên điện thoại thật (GPS + QR + ảnh) không lỗi chặn.
- **SC-002**: Toàn bộ chuỗi 36 trạm chạy được end-to-end bằng dữ liệu seed.
- **SC-003**: Chi phí vận hành MVP = 0 USD dịch vụ bên thứ ba trả phí.
- **SC-004**: Admin đổi nội dung trạm trong < 1 phút/phạm và có hiệu lực tức thời.
- **SC-005**: Lighthouse mobile ≥ 85 cho trang chơi (perf), i18n vi/en đầy đủ mọi màn hình người chơi.

## Assumptions
- Du khách có smartphone có camera + GPS + internet 4G; chấp nhận chia sẻ vị trí.
- Human review không realtime; SLA duyệt do vận hành quyết định (mặc định vài giờ).
- Tọa độ seed là gần đúng (nếu GPS lệch, tăng radius qua admin).
- Account/email, bảng xếp hạng, AI vision: ngoài phạm vi MVP.
