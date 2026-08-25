# Game Phố cổ — Constitution

## Core Principles

### I. Nội dung là dữ liệu, không phải code
Mọi trạm/câu hỏi/gợi ý sống trong DB nạp từ file seed có cấu trúc; admin UI là kênh sửa chuẩn. Không nhét chuỗi nội dung vào component.

### II. Song ngữ bắt buộc vi/en
Mọi chuỗi người chơi thấy phải đi qua dictionary i18n hoặc trường `*Vi`/`*En` trong data. Cấm chuỗi cứng tiếng Việt trong JSX người chơi.

### III. Check-in không phụ thuộc dịch vụ trả phí
MVP: GPS geofence + QR token; ảnh + human review là fallback. AI vision chỉ là nâng cấp tương lai tùy chọn. Không thêm API key dịch vụ trả phí nào vào luồng chơi.

### IV. Tự do thứ tự là luật game
Mọi trạm mở ngay từ đầu — du khách có thể đến bất kỳ địa điểm nào trước. Trạng thái trạm: completed = check-in APPROVED **và** giải đúng; checked_in = mới check-in; còn lại current. Logic trạng thái nằm ở một module thuần (pure function) và phải có unit test. Chuỗi gợi ý theo số thứ tự chỉ mang tính tham khảo, không khóa gì.

### V. Test-first cho logic thuần
Geo distance, answer validation, progression, auth token: viết test trước khi implement (vitest). UI/API được bảo vệ bằng typecheck + build.

### VI. Mobile-first PWA
Mọi màn hình người chơi thiết kế cho điện thoại cầm tay ngoài trời; manifest + SW bắt buộc; camera/geo qua HTTPS.

## Additional Constraints

- Stack: Next.js (App Router, TypeScript) + Prisma + MySQL (prod target); dev local dùng SQLite vì máy không có MySQL/Docker — schema chỉ dùng kiểu portable để chuyển đổi 1 dòng provider.
- Bản đồ: Leaflet + OpenStreetMap tiles (free, không key).
- Ảnh check-in lưu filesystem `web/uploads/`, phục vụ qua API route.
- Secret qua env (`ADMIN_PASSWORD`, `SESSION_SECRET`), `.env` không commit.
- Thuật ngữ chuẩn: *trạm*, *gợi ý*, *check-in*, *tuyến*, *kho báu*.

## Development Workflow & Quality Gates

- Feature đi theo Spec Kit: specify → clarify → plan → tasks → thực thi TDD (Superpowers). Đừng chạy `/speckit.implement` khi đã dùng Superpowers.
- Trước merge: `/code-review` + `/security`; feature lớn thêm `/verify`.
- Sửa hành vi app → cập nhật spec tương ứng.
- Việc < 30 phút, < 3 file: làm trực tiếp, bỏ quy trình.

**Version**: 1.0.0 | **Ratified**: 2026-08-25 | **Last Amended**: 2026-08-25
