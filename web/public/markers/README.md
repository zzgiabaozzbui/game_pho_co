# Marker đối tác (workshop)

1. Chọn ảnh poster đặc trưng của workshop (đủ nét, tương phản cao, ≥ 300×300px).
2. Vào MindAR compiler: https://hiukim.github.io/mind-ar-js-doc/tools/compile
   → upload ảnh → xuất file `.mind`.
3. Đặt file vào thư mục này với tên `workshop.mind` (đè file mẫu nếu có).
   - Nếu quét lỗi ngay lúc start trên môi trường chặn blob-worker (CSP): copy thêm 2 file `controller.worker.prod.js`, `compiler.worker.prod.js` vào gốc `public/`.
4. In poster ra đặt tại quầy; IN THÊM QR dẫn tới `<domain>/partner?t=<token>`
   (lấy token ở trang /admin tab Rương — có nút tạo QR sẵn).
5. Test: mở `/partner?t=<token>` trên điện thoại (HTTPS), bấm Quét, chỉa vào poster.
