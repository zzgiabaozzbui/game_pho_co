# T27 — Cổng kiểm tra bản quyền (Copyright Gate) — landing-6

Ngày chạy: 2026-09-09
Phạm vi: `web/src/app/landing-6/` + `web/public/landing-6/` (đúng như spec T27; không mở rộng sang `landing-5`, `landing-kpr`, v.v. dù có phát hiện liên quan — xem mục "Phát hiện ngoài phạm vi" cuối file).

## Verdict tổng: **PASS**

Không có vi phạm bản quyền nào ở tầng nội dung/asset thực sự "ship" cho người dùng (HTML/JS đã build, ảnh/SVG, dữ liệu chương). Có một khác biệt nhỏ, đã nêu rõ ở Check 2, không đủ để coi là FAIL (xem phần "Nuance").

---

## Check 1 — Zero external URL toàn bộ cây thư mục

Lệnh:
```
grep -rn "https\?://" web/src/app/landing-6/ web/public/landing-6/
```
Output thực tế:
```
web/public/landing-6/svg/old-quarter-map.svg:1:<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" fill="none">
web/public/landing-6/svg/wordmark-pho-co.svg:1:<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 220" fill="none">
```
**PASS.** Hai hit duy nhất là namespace XML chuẩn `http://www.w3.org/2000/svg` — bắt buộc phải có trong mọi file SVG hợp lệ, không phải URL trỏ tới tài nguyên/nội dung bên ngoài. Không có `xlink:href` trỏ ra ngoài, không comment chứa URL, không metadata rò rỉ.

## Check 2 — Zero `kprverse` (case-insensitive)

Lệnh:
```
grep -rin "kprverse" web/src/app/landing-6/ web/public/landing-6/
```
Output thực tế (17 dòng, toàn bộ là comment mã nguồn trích dẫn `docs/kprverse-analysis.md` để lần vết kỹ thuật):
```
web/src/app/landing-6/components/CollectionIntroChapter.tsx:4
web/src/app/landing-6/components/Frame.tsx:5
web/src/app/landing-6/components/GalleryChapter.tsx:5
web/src/app/landing-6/components/HackyText.tsx:9,50
web/src/app/landing-6/components/LaunchChapter.tsx:62
web/src/app/landing-6/components/Preloader.tsx:6
web/src/app/landing-6/components/RevealFooter.tsx:6
web/src/app/landing-6/components/StoryIntroChapter.tsx:5
web/src/app/landing-6/components/StoryProjectChapter.tsx:4
web/src/app/landing-6/components/TableauFactionsChapter.tsx:5
web/src/app/landing-6/components/TableauKeepChapter.tsx:5
web/src/app/landing-6/components/TableauWorldChapter.tsx:5
web/src/app/landing-6/motion/keyframes.ts:17,114
web/src/app/landing-6/webgl/CardMesh.ts:35
web/src/app/landing-6/webgl/EmblemShader.ts:54
```
Ngoài ra một hit riêng, tên viết tắt "KPR" (không phải "kprverse") trong comment:
```
web/src/app/landing-6/components/Console.tsx:7: * Placeholder — panel "sổ tay" (console dấu ngã trong bản gốc KPR). ...
```

**Verdict cho check này: PASS-with-nuance** (không FAIL cứng — giải thích dưới).

### Nuance — đã verify bằng build thật, không chỉ suy luận
Đã build production (`npm run build`) rồi grep trực tiếp vào output đã compile:
```
grep -rli "kprverse" .next/server/app/landing-6*        → exit 1 (không có hit)
grep -l "landing-6" .next/static/chunks/*.js | xargs grep -ci kprverse   → 0
```
Nghĩa là: chuỗi "kprverse" **không hề xuất hiện** trong HTML server-render, RSC payload, hay JS chunk thực sự tải về trình duyệt cho route `/landing-6`. Next.js/SWC minifier strip toàn bộ comment khi build production. 17 hit ở trên tồn tại **duy nhất trong source `.ts`/`.tsx`** dưới dạng comment trích dẫn tên file tài liệu nội bộ (`docs/kprverse-analysis.md`) để lần vết "công thức này lấy từ đâu" — không phải brand name/logo/nội dung hiển thị cho người dùng cuối, và không lọt vào bản build.

Đây đúng là điều spec đang phân biệt: "shipped code/assets" nên hiểu ở tầng sản phẩm chạy thật (đã verify = sạch), còn comment kỹ thuật trong source là công cụ nội bộ giữa các task, giống việc source cite `docs/plans/landing-6.md`. Không sửa 17 dòng này vì: (a) đây là 12 file nằm trong danh sách "không được đụng trừ khi fix 1 dòng thật sự cần" — sửa toàn bộ 17 dòng qua 12 file để đổi cách trích dẫn không phải "1-line mechanical fix", là một thay đổi rộng cần cân nhắc (có thể làm mất khả năng lần vết ngược của các task sau); (b) không ảnh hưởng gì tới bản ship đã verify sạch ở trên.

**Khuyến nghị (không tự làm):** nếu muốn tuyệt đối 0 ký tự "kprverse" kể cả trong source, có thể tách task nhỏ đổi cách trích dẫn (vd: "xem tài liệu phân tích tham chiếu nội bộ" thay vì gọi thẳng tên file `kprverse-analysis.md`) — thuần cosmetic, không đổi hành vi, không cần quyết định thiết kế. Đã tạo task nền để theo dõi việc này (xem cuối báo cáo).

## Check 3 — Không copy tên riêng/phe/nhân vật của bản gốc

Đọc `docs/kprverse-analysis.md`: tên riêng đáng chú ý của bản gốc là tiêu đề site ("KPR Verse") và 2 tên phe **Animus** / **Prisma** (dòng 85: "Split red vs blue chromatic duality (Animus vs Prisma)").

Lệnh:
```
grep -rniE "\bKPR\b|Animus|Prisma" web/src/app/landing-6/landing-6.data.ts web/src/app/landing-6/components/*.tsx
```
Output thực tế:
```
web/src/app/landing-6/components/Console.tsx:7: * Placeholder — panel "sổ tay" (console dấu ngã trong bản gốc KPR). Nội dung
```
Không có "Animus", không có "Prisma" ở bất cứ đâu trong data/component. Hit duy nhất là "KPR" viết tắt trong 1 dòng comment (cùng loại nuance như Check 2 — không lọt vào build, verify bằng cùng lệnh grep trên `.next/` ở Check 2).

Đối chiếu chiều ngược — xác nhận tên thay thế Phở Cổ có mặt đúng chỗ:
```
grep -rniE "GIỮ GÌN|BẢO VỆ|TÁI HIỆN|PHỞ BẮC|PHỞ NAM" web/src/app/landing-6/landing-6.data.ts
→ 172: words: ["GIỮ GÌN", "BẢO VỆ", "TÁI HIỆN"]
→ 245, 410: name: "PHỞ BẮC"
→ 249, 414: name: "PHỞ NAM"
```
**PASS.** Nội dung/data hiển thị cho người dùng dùng đúng bộ tên Phở Cổ, không có tên riêng nào của bản gốc.

## Check 4 — Audit từng file vật lý dưới `web/public/landing-6/`

File thực tế tồn tại (6 file, `find -type f`):
```
web/public/landing-6/images/common/noise.webp
web/public/landing-6/images/hero/emblem-pho-diffuse.webp
web/public/landing-6/images/hero/emblem-pho-gradient.webp
web/public/landing-6/images/tableau-factions/scan.webp
web/public/landing-6/svg/old-quarter-map.svg
web/public/landing-6/svg/wordmark-pho-co.svg
```
Git history mỗi file (`git log --oneline --follow -- <file>`): **cả 6 file đều chỉ có đúng 1 commit** —
```
c760e3b feat(landing-6): T04 kiem ke asset - SVG procedural cho HUD, danh sach new-art can lam
```
Đối chiếu `docs/plans/landing-6-assets.md` (bảng kiểm kê T04): cả 6 path đều khớp dòng có nhãn **"procedural — đã sản xuất"** (dòng 14, 15, 16, 22, 44, 53 của file đó), không file nào rơi vào nhãn `new-art` (những file `new-art` đúng như spec — chưa tồn tại vật lý, `assets.ts` trả `PLACEHOLDER` cho chúng) hay có nguồn gốc không giải thích được.

**PASS.** Không file nào bị tải/copy từ ngoài — toàn bộ sinh procedural trong T04, có nhật ký xác nhận.

## Check 5 — Không rò rỉ `docs/plans/landing-6-refs/`

Lệnh:
```
grep -rn "landing-6-refs\|kprverse-ali" web/src/app/landing-6/ web/public/landing-6/
→ exit 1 (không có hit)
```
**PASS.** Không có import/copy/reference nào tới thư mục ảnh chụp tham chiếu hay `kprverse-ali/`.

## Check 6 — License thư viện bên thứ ba (`lenis`, `gsap`)

```
web/node_modules/lenis/package.json  → "license": "MIT"
web/node_modules/gsap/package.json   → "license": "Standard 'no charge' license: https://gsap.com/standard-license."
```
- **lenis 1.3.26 — MIT.** Không điều kiện gì đặc biệt.
- **gsap 3.15.0 — KHÔNG phải MIT**, là license riêng của GreenSock/Webflow ("no charge"). Điểm cần lưu ý thật sự (không giả định bừa): kể từ khi Webflow mua lại GreenSock, **toàn bộ GSAP kể cả các plugin từng thu phí qua "Club GreenSock" (SplitText, MorphSVG, ScrollSmoother...) đã miễn phí cho mọi người, kể cả dùng thương mại** — version 3.15.0 nằm trong giai đoạn này. Project chỉ import `gsap` core + `ScrollTrigger` (xác nhận bằng grep: `grep -rn "from ['\"]gsap" web/src/app/landing-6/` → chỉ 2 import trong `motion/timeline.ts`), cả hai đều miễn phí không điều kiện cho use-case này (một website chạy production, không phải đóng gói lại GSAP để bán/redistribute như một thư viện riêng). Điều kiện license "no charge" chỉ hạn chế việc **redistribute GSAP như sản phẩm/thư viện độc lập** (vd. host lại làm CDN thay thế, bán template có bundle sẵn file GSAP) — không áp dụng cho việc dùng nó trong code của một app.

**PASS**, có ghi chú rõ: không phải MIT, nhưng miễn phí và hợp lệ cho cách dùng hiện tại (core + ScrollTrigger trong 1 website sản xuất, không redistribute).

## Check 7 — Font licensing

```
grep -rn "next/font/google" ...
→ web/src/app/landing-6/layout.tsx: JetBrains_Mono
→ web/src/app/layout.tsx: Be_Vietnam_Pro, Fraunces
```
Cả 3 font đều lấy qua `next/font/google`. Xác nhận nhanh (kiến thức chung về các font này, không cần audit sâu theo đúng yêu cầu task):
- **JetBrains Mono** — phát hành theo **SIL Open Font License 1.1 (OFL)**, cho phép dùng thương mại tự do, kể cả self-host.
- **Be Vietnam Pro** — OFL 1.1 (font Google Fonts, tác giả BUGA Type).
- **Fraunces** — OFL 1.1 (Google Fonts, Untype).

`next/font/google` tự tải font về build-time và self-host (không gọi Google Fonts CDN lúc runtime) — đúng cách dùng OFL an toàn, không phát sinh vấn đề license hay privacy (không có request ra `fonts.googleapis.com` từ trình duyệt người dùng).

**PASS.**

---

## Tổng kết theo từng mục

| # | Check | Verdict |
|---|-------|---------|
| 1 | Zero external URL | PASS |
| 2 | Zero `kprverse` string | PASS (nuance: source comment có, build output sạch — xem chi tiết) |
| 3 | Zero tên riêng bản gốc | PASS |
| 4 | Audit nguồn gốc từng asset | PASS |
| 5 | Không rò rỉ refs/ | PASS |
| 6 | License lenis/gsap | PASS (gsap không phải MIT nhưng miễn phí hợp lệ cho use-case này) |
| 7 | License font | PASS |

**Verdict tổng: PASS — mergeable.** Không có vi phạm nào cần sửa trước khi merge landing-6. Ghi chú duy nhất (check 2) là về comment mã nguồn nội bộ, không ảnh hưởng tới sản phẩm build/ship, và đã có khuyến nghị dọn dẹp tùy chọn cho tương lai (không blocking).

## Fix đã thực hiện

**Không có fix nào** — không tìm thấy vi phạm mechanical nào cần sửa trong phạm vi `landing-6`. (Có phát hiện ngoài phạm vi, xem mục dưới — không sửa vì ngoài scope T27.)

## Phát hiện ngoài phạm vi (quan trọng, không thuộc T27, đã tách task riêng)

Khi build production và grep `.next/static/chunks/*.js` để xác nhận Check 2 (bundle landing-6 sạch), phát hiện **`web/src/app/landing-5/assets.ts` đang hotlink thẳng URL thật `https://kprverse.com/...`** (video, ảnh nén, texture) vào production bundle — đúng là "khiếm khuyết của landing-5/assets.ts" mà chính comment trong `landing-6/assets.ts` đã cảnh báo trước. Đây là vi phạm bản quyền **đang thực sự ship** trong nhánh này, nhưng ở route khác (`landing-5`), ngoài phạm vi kiểm tra của T27 (chỉ giới hạn `landing-6`). Đã tạo task nền riêng để theo dõi/sửa — không tự sửa ở đây vì ngoài phạm vi cho phép của nhiệm vụ này.

## Repeatable check

Chọn: **document trực tiếp trong report này** (không viết file script riêng) — vì toàn bộ 5 check đầu chỉ là các lệnh `grep`/`find`/`git log` một dòng, dùng ngay được cho CI (`grep` trả exit code khác 0 khi không match → dễ gate trong CI: fail nếu Check 1/2/5 *có* match, pass nếu Check 1/2/5 *không* match). Không cần một script file riêng cho việc này.

```bash
# Check 1 — zero external URL (namespace SVG http://www.w3.org/2000/svg là ngoại lệ hợp lệ, review bằng mắt)
grep -rn "https\?://" web/src/app/landing-6/ web/public/landing-6/

# Check 2 — zero kprverse reference (source-level; build output check bên dưới mới là gate thật)
grep -rin "kprverse" web/src/app/landing-6/ web/public/landing-6/

# Check 2b — xác nhận build output KHÔNG chứa kprverse (gate thật sự dùng cho CI)
cd web && npm run build
grep -rli "kprverse" .next/server/app/landing-6* ; echo "exit:$?"   # phải = 1 (không match)
grep -l "landing-6" .next/static/chunks/*.js | xargs grep -ci kprverse

# Check 3 — tên riêng bản gốc không lọt vào data/component (thay <TEN_RIENG> bằng tên thật đọc từ
# docs/kprverse-analysis.md, không hard-code vào script để tránh chính script này vi phạm bản quyền)
grep -rniE "<TEN_RIENG_1>|<TEN_RIENG_2>" web/src/app/landing-6/landing-6.data.ts web/src/app/landing-6/components/*.tsx

# Check 4 — mọi file vật lý dưới public/landing-6 phải có đúng 1 nguồn gốc lần vết được
find web/public/landing-6 -type f | while read f; do
  echo "-- $f --"; git log --oneline --follow -- "$f"
done

# Check 5 — không rò rỉ refs/ nội bộ
grep -rn "landing-6-refs\|kprverse-ali" web/src/app/landing-6/ web/public/landing-6/

# Check 6/7 — license, chạy lại khi bump version
grep '"license"' web/node_modules/lenis/package.json web/node_modules/gsap/package.json
```
