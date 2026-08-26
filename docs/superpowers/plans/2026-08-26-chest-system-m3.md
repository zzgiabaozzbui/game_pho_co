# Hệ thống Hòm thưởng M3 Implementation Plan (MindAR quét marker tại điểm đối tác)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development (khuyên dùng) hoặc superpowers:executing-plans. Steps dùng checkbox (`- [ ]`).

**Goal:** Trang `/partner` cho du khách quét marker in tại workshop đối tác bằng MindAR → nhận diện thành công → claim rương Epic (tái dùng `claim-partner`) → mở bằng đúng `ChestReveal`. MindAR tách hoàn toàn khỏi engine chest (spec §1/§6).

**Architecture:** Trang client độc lập `/partner` nhận token từ tham số `?t=` (QR in cạnh poster — ruling #M3-1). MindAR nạp qua **script-injection từ `/vendor/mindar/`** (file tĩnh, SW cache được — ruling #M3-2), KHÔNG qua bundler. Quét thấy target → đóng camera → gọi POST `/api/chests/claim-partner` với token → GET chests lấy grant PARTNER → render `ChestReveal` chuẩn (3D inline như M2). Camera fail/thiếu HTTPS/thiếu `.mind` → fallback nút claim thủ công + thông báo thân thiện.

**Tech Stack:** mind-ar ^1.2.5 (script tĩnh, không qua bundler) · existing three-loader/ChestReveal · qrcode ^1.5.4 (admin QR) · Next 16 · vitest.

**Spec:** `docs/superpowers/specs/2026-08-25-ar-treasure-chest-design.md` §6 (Lớp AR & marker), §4 (API claim-partner), §9 (nghiệm thu: quét marker thật nơi thiếu sáng).

## Global Constraints

- **MindAR tách hoàn toàn khỏi engine chest** (spec §1): thư viện mind-ar CHỈ được tham chiếu trong `web/src/app/partner/**` và `web/public/vendor/mindar/` — kiểm cuối: `Get-ChildItem web\src -Recurse -Include *.ts,*.tsx | Select-String "mind"` chỉ match file trong `app/partner/`.
- Token PARTNER KHÔNG bao giờ nằm trong JS bundle/log (chỉ qua URL `?t=` do QR in tại quầy cung cấp; không log token vào console/report).
- Camera CHỈ khởi động sau cú bấm người dùng (giống WebXR rule); HTTPS bắt buộc cho getUserMedia.
- Không đổi API hiện có; thêm duy nhất `GET /api/partner/config` (thông tin công khai: key + đường dẫn target, KHÔNG chứa token).
- Chuỗi UI mới qua `dictionaries.ts` ĐỦ VI+EN; cấm tiếng Việt cứng trong JSX người chơi.
- SW cache bump version (`pc36-v2`); thêm cache-first cho `/vendor/mindar/` + `/markers/` (spec §6: chịu wifi yếu).
- File `.mind` do vận hành đối tác compile từ hình in (MindAR compiler web tool) — app PHẢI chạy được (thân thiện) khi file chưa có: hiển thị trạng thái "chưa cấu hình marker" kèm hướng dẫn, nút claim thủ công vẫn hoạt động.
- Checkpoint = `npm run lint ; npm run typecheck ; npm run test ; npm run build` xanh trong `web/` rồi mới commit (PS 5.1: không có `&&`; `rg` → Select-String).

---

### Task 1: Deps mind-ar + assets tĩnh + hướng dẫn ops

**Files:**
- Modify: `web/package.json` (+`mind-ar`)
- Create (artifact): `web/public/vendor/mindar/*` (copy từ node_modules)
- Create: `web/public/markers/README.md`

**Interfaces:**
- Produces: `public/vendor/mindar/mindar-image-three.prod.js` (+ các file .wasm mà nó nạp) — URL tĩnh ổn định để SW cache và script-injection.
- Produces: global `window.MINDAR.IMAGE.MindARThree` sau khi inject script (UMD build).

- [ ] **Step 1: Cài + copy**

Run (workdir `web`):

```powershell
npm install mind-ar; if ($?) { New-Item -ItemType Directory -Force -Path "public\vendor\mindar" | Out-Null; Copy-Item node_modules\mind-ar\dist\mindar-image-three.prod.js public\vendor\mindar\; Copy-Item node_modules\mind-ar\dist\mindar-image*.wasm public\vendor\mindar\ 2>$null }
```

Sau copy: `Get-ChildItem public\vendor\mindar | Select-Object Name,Length` — ghi lại danh sách. Nếu prod js nạp thêm asset nào khác lúc runtime (xem chuỗi `locateFile`/fetch trong file), copy bổ sung cùng thư mục.

- [ ] **Step 2: Hướng dẫn ops**

`web/public/markers/README.md`:

```markdown
# Marker đối tác (workshop)

1. Chọn ảnh poster đặc trưng của workshop (đủ nét, tương phản cao, ≥ 300×300px).
2. Vào MindAR compiler: https://hiukim.github.io/mind-ar-js-doc/tools/compile
   → upload ảnh → xuất file `.mind`.
3. Đặt file vào thư mục này với tên `workshop.mind` (đè file mẫu nếu có).
4. In poster ra đặt tại quầy; IN THÊM QR dẫn tới `<domain>/partner?t=<token>`
   (lấy token ở trang /admin tab Rương — có nút tạo QR sẵn).
5. Test: mở `/partner?t=<token>` trên điện thoại (HTTPS), bấm Quét, chĩa vào poster.
```

- [ ] **Step 3: CHECKPOINT** — lint/typecheck/test/build xanh (assets ngoài src không ảnh hưởng).

### Task 2: Schema + seed `PartnerSpot.mindTargetPath`

**Files:**
- Modify: `web/prisma/schema.prisma`, `web/prisma/seed.ts`

**Interfaces:**
- Produces: cột `PartnerSpot.mindTargetPath String @default("/markers/workshop.mind")` — Task 3 đọc, Task 5 tiêu thụ.

- [ ] **Step 1:** Sửa model `PartnerSpot` thêm field trên. Run `npx prisma db push` (workdir web) — sync OK.
- [ ] **Step 2:** Seed: khối upsert PartnerSpot thêm `mindTargetPath` vào cả update lẫn create:
```ts
update: { mindTargetPath: "/markers/workshop.mind" },
create: { key: "workshop", token: partnerToken, mindTargetPath: "/markers/workshop.mind" },
```
Chạy `npm run db:seed`; xác minh:
```powershell
node -e "const D=require('better-sqlite3');console.log(new D('dev.db').prepare('SELECT key,mindTargetPath FROM PartnerSpot').all())"
```
- [ ] **Step 3: CHECKPOINT** — lint/typecheck/test xanh.

### Task 3: API `GET /api/partner/config`

**Files:**
- Create: `web/src/app/api/partner/config/route.ts`

**Interfaces:**
- Produces: `200 {key: string, mindTargetPath: string}` (findFirst PartnerSpot) · `404 {error:"not_configured"}` nếu chưa seed · rateLimit 60/phút/IP. KHÔNG trả token.

- [ ] **Step 1: Implement** (pattern y hệt route chests GET — import `db`, `clientIp, rateLimit` từ `@/lib/rate-limit`):
```ts
export async function GET(req: Request) {
  const rl = rateLimit(`partner-config:${clientIp(req)}`, { limit: 60, windowMs: 60_000 });
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } });
  const spot = await db.partnerSpot.findFirst();
  if (!spot) return NextResponse.json({ error: "not_configured" }, { status: 404 });
  return NextResponse.json({ key: spot.key, mindTargetPath: spot.mindTargetPath });
}
```
- [ ] **Step 2: CHECKPOINT** — lint/typecheck/test xanh.

### Task 4: Dictionaries `partner.*`

**Files:**
- Modify: `web/src/lib/dictionaries.ts` (nhóm sau `ar.*`)

- [ ] Thêm ĐỦ cả VI + EN:
```
partner.title            VI "Quà tặng từ đối tác"            EN "Partner gift"
partner.subtitle         VI "Quét marker tại quầy workshop để nhận rương Huyền Bí" EN "Scan the marker at the workshop counter to receive an Epic chest"
partner.missing_token    VI "Mở trang này qua mã QR in tại quầy đối tác." EN "Open this page via the QR code printed at the partner counter."
partner.start_scan       VI "Bắt đầu quét"                    EN "Start scanning"
partner.stop_scan        VI "Dừng quét"                       EN "Stop scanning"
partner.scanning_hint    VI "Chĩa camera vào poster marker"    EN "Point your camera at the marker poster"
partner.found            VI "Đã nhận diện marker!"             EN "Marker recognized!"
partner.claiming         VI "Đang nhận quà…"                   EN "Claiming your gift…"
partner.already          VI "Bạn đã nhận quà này rồi — xem bộ sưu tập." EN "You already claimed this gift — see your collection."
partner.manual_claim     VI "Nhận quà thủ công"                EN "Claim manually"
partner.camera_error     VI "Không mở được camera. Hãy dùng nút nhận thủ công bên dưới." EN "Camera unavailable. Use the manual claim button below."
partner.marker_missing   VI "Chưa cấu hình marker — liên hệ quản trị." EN "Marker not configured — contact the admin."
partner.to_collection    VI "Xem bộ sưu tập"                   EN "View collection"
```
- [ ] CHECKPOINT typecheck PASS (parity VI/EN do DictKey bảo đảm).

### Task 5: Trang `/partner`

**Files:**
- Create: `web/src/app/partner/page.tsx`

**Interfaces:**
- Consumes: keys Task 4; `GET /api/partner/config`; `POST /api/chests/claim-partner`; `ChestReveal` + types; `useLang`.
- State machine: `need-token → idle → loading-lib → scanning → found→claiming → done(reveal)|already | error(camera|lib) | marker-missing`.
- Script-injection loader (tránh bundler hoàn toàn — ruling #M3-2):
```ts
function loadMindArScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).MINDAR?.IMAGE?.MindARThree) return resolve();
    const s = document.createElement("script");
    s.src = "/vendor/mindar/mindar-image-three.prod.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("mindar-load-failed"));
    document.head.appendChild(s);
  });
}
```
- Luồng chính (code khung — implementer giữ đúng hợp đồng):
```tsx
// ?t= đọc một lần qua useSearchParams (Next 16: Promise — await trong Suspense wrapper hoặc dùng useEffect với window.location.search để tránh boundary)
const token = useMemo(() => new URLSearchParams(window.location.search).get("t") ?? "", []);
const validShape = /^[a-f0-9]{32,128}$/.test(token); // hex từ randomBytes(24).toString("hex") = 48 ký tự
// BẮT ĐẦU QUÉT (button user-gesture):
// 1. await loadMindArScript()
// 2. fetch /api/partner/config -> { mindTargetPath }; HEAD fetch file -> 404 thì set markerMissing (vẫn cho claim thủ công)
// 3. const mindarThree = new window.MINDAR.IMAGE.MindARThree({ container: ref.current, imageTarget: mindTargetPath, uiLoading: "no", uiScanning: "no", uiError: "no" });
//    await mindarThree.start();
//    const anchor = mindarThree.addAnchor(0);
//    anchor.onTargetFound = () => { setPhase("found"); void navigator.vibrate?.(80); stopScan(); void doClaim(); };
//    render loop: mindarThree.renderer.setAnimationLoop(() => { mindarThree.update(); });
// stopScan(): mindarThree.stop(); renderer.setAnimationLoop(null); video tracks stop; xóa canvas con trong container.
// doClaim(): POST /api/chests/claim-partner {playerId, token, lat?, lng?}
//   - ok:true & !alreadyClaimed -> GET /api/chests -> tìm grant PARTNER chưa mở -> setReveal(grant) (render <ChestReveal tier loot onClose={refresh+đóng}/>)
//   - alreadyClaimed -> phase "already"
// playerId: tái dùng cơ chế lưu localStorage hiện có của app (xem src/lib/storage.ts / client.ts — pattern giống StationFlow dùng; KHÔNG tự chế mới).
// Fallback: nút partner.manual_claim LUÔN hiện (khi đủ token) -> doClaim() trực tiếp.
// Camera/lib error -> phase error + partner.camera_error.
// Thiếu token/shape sai -> partner.missing_token.
```
- Cleanup nghiêm ngặt: unmount phải stop camera + hủy animation loop (pattern dispose như InlineThreeRenderer).

- [ ] Step 1 implement · Step 2 smoke: dev server → `/partner` (không token) hiện thông báo; `/?t=sai` hiện missing_token; `/partner?t=<48hex>` hiện nút quét + nút thủ công (KHÔNG bấm quét trong môi trường không cam — chỉ xác nhận UI states render). Kill server.
- [ ] Step 3 CHECKPOINT — lint/typecheck/test/build xanh.

### Task 6: SW cache + điểm khám phá

**Files:**
- Modify: `web/public/sw.js`, `web/src/app/treasure/page.tsx`

- [ ] **Step 1 sw.js:** đổi `CACHE = "pc36-v2"`; thêm điều kiện runtime-cache (song song khối `_next/static/`) cho:
```js
if (url.pathname.startsWith("/vendor/mindar/") || url.pathname.startsWith("/markers/")) {
  // cache-first như khối _next/static hiện có
}
```
- [ ] **Step 2 treasure CTA:** cạnh phần partner hiện có (line ~151 `t("treasure.partner")`), biến thành Link tới `/partner` (kiểm markup thật rồi sửa tối thiểu; thêm class hover).
- [ ] Step 3 CHECKPOINT + build xanh.

### Task 7: Admin QR token

**Files:**
- Modify: `web/src/app/admin/page.tsx` (khối partnerSpot ~line 760)

- [ ] Dynamic import `qrcode` (đã có deps) khi bấm nút "QR": sinh dataURL cho `${location.origin}/partner?t=${token}` render `<img>` + ghi chú "in QR dán cạnh poster marker". Admin là tiếng Việt cứng được.
- [ ] CHECKPOINT — lint/typecheck/test/build xanh, commit.

### Task 8: Kiểm chứng cuối + cập nhật tài liệu

- [ ] E2E mở rộng `scripts/e2e-du-khach.mjs` thêm S10: GET `/api/partner/config` → 200 `{key:"workshop", mindTargetPath}`; `/partner` → 200; `/vendor/mindar/mindar-image-three.prod.js` → 200; chạy lại ALL PASS. Commit chung thay đổi.
- [ ] Ràng buộc cô lập: `Get-ChildItem web\src -Recurse -Include *.ts,*.tsx | Select-String "mind-ar|MINDAR"` → CHỈ match trong `app/partner/`.
- [ ] Tick checkbox Task 1–8 trong plan này; PENDING-HUMAN bảng dưới.
- [ ] Cập nhật: spec dòng tiến độ (M3 code-DONE, nghiệm thu chờ thiết bị) + AGENTS.md (status M3 + cách test `/partner`).
- [ ] CHECKPOINT CUỐI đầy đủ.

## Checklist PENDING-HUMAN (nghiệm thu vận hành — điều kiện SHIP M3)

| Hạng mục | Bước | Kết quả |
|---|---|---|
| Compile marker | Ops làm theo `public/markers/README.md` → `workshop.mind` tồn tại | `[ ]` |
| Android Chrome (HTTPS) | Quét poster thật → found → Epic chest → ChestReveal 3D | `[ ]` |
| iOS Safari (HTTPS) | Như trên (getUserMedia + reveal) | `[ ]` |
| Thiếu sáng tại quầy | Quét vẫn nhận diện được (spec §9) — thử giảm đèn | `[ ]` |
| Offline yếu | Lần 2 tải /partner dùng cache SW (airplane toggle sau lần đầu) | `[ ]` |
| Camera bị từ chối | Fallback nút thủ công hoạt động | `[ ]` |

## Self-review

- Spec coverage §6: trang riêng ✓(T5) · .mind prebuilt + in ấn thuộc ops ✓(T1 README/T2 path) · gọi claim-partner tái sử dụng ✓(T5 doClaim) · tái dùng ChestReveal ✓ · tách khỏi engine chest ✓(constraint + T8 grep) · SW cache lib+target ✓(T6) · §9 thiếu sáng ✓(PENDING-HUMAN).
- Type consistency: `mindTargetPath` T2↔T3↔T5; keys `partner.*` T4↔T5; token shape regex khớp seed randomBytes(24).toString("hex")=48.
- Placeholder scan: không TBD; mọi step có code/lệnh cụ thể.
