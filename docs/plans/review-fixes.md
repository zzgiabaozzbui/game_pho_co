# Kế hoạch: vá các issue còn lại từ code review (phiên 2026-08-25)

> Lưu ý: thư mục KHÔNG phải git repo → không commit được; cập nhật trạng thái ngay trong file này.
> Nguồn: báo cáo code-review ECC + audit thiết bị cùng ngày.

## Trạng thái: TODO / DOING / DONE

| # | Task | File chính | Trạng thái |
|---|------|-----------|------------|
| 1 | Viết file kế hoạch | docs/plans/review-fixes.md | DONE |
| 2 | Rate limiter dùng chung + unit test | web/src/lib/rate-limit.ts (+ .test.ts) | DONE |
| 3 | Áp rate limit: /api/session, /api/checkin/photo, /api/admin/session | 3 route tương ứng | DONE |
| 4 | Fail-fast khi thiếu SESSION_SECRET ở admin login | api/admin/session/route.ts | DONE (thiếu secret → login trả 401, không cấp token vô dụng) |
| 5 | Uploads dir qua env (UPLOADS_DIR), dùng chung giữa ghi (photo) và đọc (uploads/[name]) | api/checkin/photo/route.ts, api/uploads/[name]/route.ts, lib/storage.ts mới | DONE |
| 6 | Dockerfile/compose: ENV UPLOADS_DIR=/data/uploads (volume /data có sẵn) | web/Dockerfile (compose không cần — ENV đã baked trong image) | DONE |
| 7 | Mã khôi phục tiến trình: nhập playerId trên trang chủ để resume; hiện mã + nút copy khi đã có session | src/app/page.tsx, src/lib/client.ts, dictionaries.ts | DONE |
| 8 | Chạy lint + typecheck + test | — | DONE (lint ✓ typecheck ✓ 30/30 tests) |
| 9 | Kiểm chứng E2E qua dev server (resume hoạt động, upload ghi đúng thư mục mới) | script tạm .e2e-verify.mjs (đã xóa) | DONE — 8/8 PASS |
| 10 | Dọn dẹp + tổng hợp báo cáo | — | DONE |

## Phát hiện thêm khi E2E (đã vá)

- `/api/session` cũ: gửi playerId rác → **tạo player mới im lặng** (nguy cơ người chơi tưởng đã khôi phục mà nhận session trắng). Đã sửa: mã sai format → 400 `invalid_player_id`; mã đúng format nhưng không tồn tại → 404 `unknown_player`. Bù lại `ensureSession()` phía client tự heal 1 lần không gửi mã khi localStorage stale (trường hợp DB bị reset).
- Rate limit là in-memory per instance: restart server = reset bucket; đủ dùng cho quy mô hiện tại.

## Quyết định thiết kế đã chốt

- Rate limit: fixed-window in-memory per IP (`x-forwarded-for` đầu tiên), giới hạn: session 20/5ph, photo 12/10ph, admin-login 5/15ph; trả 429 + Retry-After. Store injectable để unit test.
- Mã khôi phục MVP: dùng thẳng playerId (UUID) làm mã — không đổi schema; gõ tay bất tiện nhưng copy/paste là đủ cho MVP. Path nâng cấp sau: cột `recoverCode` ngắn riêng.
- Story giữ public (teaser bản đồ); chỉ question/options/hint được gate (đã làm ở phiên trước).

---

# VÒNG 2 — fix nốt các issue MINOR + high-value từ audit thiết bị

| # | Task | File | Trạng thái |
|---|------|------|------------|
| 11 | Lỗi mạng ở trang trạm hiện đúng lỗi + nút thử lại (không nhầm "không tìm thấy") | StationFlow.tsx | DONE (errorState 3 trạng thái) |
| 12 | Hết alert() → thông báo inline chung cho cả 3 kiểu check-in | StationFlow.tsx | DONE (checkinMsg, tự clear khi đổi tab/trạm) |
| 13 | Tab check-in đạt chuẩn chạm ≥44px | StationFlow.tsx | DONE (min-h-[44px]) |
| 14 | Bỏ `maximumScale: 1` (cho phép pinch-zoom, WCAG 1.4.4) | layout.tsx | DONE |
| 15 | Ưu tiên trạng thái: completed > checked_in > pending | StationFlow.tsx | DONE |
| 16 | Chip trạm trên /play theo ngôn ngữ đang chọn | play/page.tsx | DONE |
| 17 | Race giải đố: CAS updateMany `solved:false` → cộng điểm đúng 1 lần | api/answer/route.ts | DONE |
| 18 | Race gợi ý: CAS `hintsUsed:0` | api/answer/route.ts | DONE |
| 19 | Race ảnh PENDING: updateMany-first trong $transaction | api/checkin/photo/route.ts | DONE |
| 20 | Queue duyệt: take 200 + trả `totalPending`, admin hiện banner khi còn tồn | api/admin/reviews/route.ts, admin/page.tsx | DONE |
| 21 | Kiểm chứng: lint/typecheck/test ✓ 30/30 + E2E race ALL PASS (2 đáp án đồng thời chỉ +100 một lần; 3 upload song song chỉ 1 dòng PENDING) | — | DONE |

Lưu ý còn lại (đã ghi nhận, không sửa): race photo-PENDING dùng transaction — SQLite serialize writes nên chặn triệt để; nếu chuyển MySQL prod thì 2 request cực hiếm vẫn có thể lọt qua vì interactive transaction không khóa range — cân nhắc unique index riêng khi migrate. QR token tĩnh: rủi ro đã chấp nhận theo spec Edge Cases.
