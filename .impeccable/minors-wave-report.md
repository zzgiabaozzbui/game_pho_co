# Minors Wave Report — fix/ui-deferred-minors (2026-08-26)

**Branch:** `fix/ui-deferred-minors` off main (`000e3ec`), worked in isolated git worktree
`C:\Users\Admins\AppData\Local\Temp\opencode\wt-ui-minors` (shared checkout was busy with another
agent's uncommitted huong-dan changes on forbidden files).
**Commits:** `437c47e` clipboard guard · `f8082a1` minors cleanup.

## Fixes delivered (10/10)

1. **Clipboard guard ×2 parity debt** — NEW `web/src/lib/clipboard.ts`
   (`copyToClipboard(text): Promise<boolean>`; false khi thiếu `navigator.clipboard`/insecure;
   silent-fail). Home recovery `copyCode` + treasure share fallback dùng chung, giữ nguyên
   confirmation "copied" 2s điều khiển bởi boolean trả về.
2. **Treasure double hero-in** — gate bằng state mới `chestsSettled`: animation class chỉ thêm sau
   lần fetch chests đầu tiên settle; `key` cũng chỉ đổi sealed/revealed sau khi settled → không còn
   hai lần scale-in liên tiếp khi FINAL holder mount.
3. **Keyframes → globals.css** — `.treasure-hero-in` + keyframes + gate
   `prefers-reduced-motion: reduce` chuyển vào globals.css; inline `<style>` trong treasure bỏ.
4. **StationFlow remount leak** — `<ChestReveal key={queue[0].grantId}>` như play/page.tsx đã làm.
5. **SuccessPanel deps** — `[nextSlug, treasure]` → `[treasure]`. Chọn `treasure` vì nó là cờ ngữ
   nghĩa của panel (đích cuối vs trạm kế); bất biến `treasure === !nextSlug` giữ bởi call site nên
   reset vẫn đúng lúc duy nhất cần.
6. **revealHint unhandled rejection** — thêm `catch { setRevealedHint(null); }` (no-op thực tế vì
   nút hint chỉ hiện khi chưa có hint) quanh fetch; `finally` reset busy giữ nguyên. Không string mới
   để surface lỗi (cấm theo ràng buộc).
7. **Header fold /play** — center header 3 dòng → 2 dòng: dòng 1 tên app, dòng 2
   `t("play.progress_compact", {done,total,score})` + badge lucide `Gift` ×count inline khi có rương
   (thay badge text `chest.unopened_badge` cũ).
8. **Rail naming collision** — không có heading nào dùng chữ "chip" trong markup ⇒ thêm caption
   `t("play.route_legend")` ("Tuyến của bạn") phía trên hàng legend dots, style eyebrow nhỏ đồng bộ.
9. **Workshop card reorder /treasure** — collection grid tách thành biến `collectionSection`, render
   GIỮA stats và workshop card trong nhánh completedAll; workshop giữ dưới cùng khu celebration với
   contact line. Trạng thái locked vẫn thấy collection ở cuối như cũ (render độc lập, không nhân đôi).
10. **X consumes final chest** — ChestReveal nhận prop additive `sealedAction?: ReactNode` render
    ngay dưới "tap to open" CHỈ khi chưa mở. Treasure truyền nút `btn-primary` với
    `t("treasure.open_now")` gọi thẳng `openFinal`; X/backdrop hành xử như trước. `notice` thường
    không đủ vì nó render cả sau khi mở — nên chọn prop riêng cho trạng thái sealed.

## Checks

- `npm run lint` ✅ (0 warning, --max-warnings=0)
- `npm run typecheck` ✅ (sau `npx prisma generate` — worktree mới thiếu `src/generated/` bị git-ignore)
- `npm run test` ✅ 7 files / 44 tests passed
- Detector ONCE: `node ../.opencode/skills/impeccable/scripts/detect.mjs --json src/app/page.tsx src/app/treasure/page.tsx src/components/StationFlow.tsx` → `[]` (exit 0), không finding mới từ diff
- Build: SKIP theo đề bài

## Constraints audit

- Zero new user-facing strings — chỉ dùng 3 keys pre-add trên main
  (`play.progress_compact`, `play.route_legend`, `treasure.open_now`) + keys có sẵn; VI/EN mirror
  sẵn trong dictionaries. `chest.unopened_badge` hết nơi dùng nhưng key giữ nguyên trong dict.
- Reduced-motion gate giữ nguyên cho `.treasure-hero-in`.
- Zero dependency mới; không đụng `dictionaries.ts`.

## Deviations / concerns

- **File ownership:** danh sách file được giao thiếu `web/src/app/play/page.tsx` nhưng fixes #7/#8
  chỉ tồn tại ở đó (header 3 dòng + rail nằm trong play/page.tsx) ⇒ đã sửa file này, kèm
  `ChestReveal.tsx` (prop additive bắt buộc cho #10 vì `notice` render cả sau khi mở). Nếu agent
  khác cũng được giao play/page.tsx hoặc ChestReveal thì cần merge thủ công.
- Fix #10: nút `open_now` gọi `openFinal` (POST CAS + đóng overlay) thay vì ceremony tap-to-open nội
  bộ — đúng chữ đề bài; loot hiển thị sau trong collection.
- Worktree tạm vẫn còn tại `%TEMP%\opencode\wt-ui-minors` (junction node_modules) — có thể dọn bằng
  `git worktree remove` sau khi merge branch.
