# Play surface fix report — `fix/play-p0p1`

Ngày: 2026-08-26 · Nền: `main` @ `52370bb` · Phạm vi: Surface 1 `/play` (critique 2026-08-26T06-29-01Z)

## Commits (branch `fix/play-p0p1`)

| SHA | Message | Nội dung |
|---|---|---|
| `910a126` | fix(play): mac dinh tab photo + xac nhan truoc khi tieu diem goi y | Fix #1 + #2 (`StationFlow.tsx`) |
| `a954219` | fix(play): mo ruong cho xac nhan POST + legend mau chip | Fix #3 + #4 (`play/page.tsx`, `ChestReveal.tsx` additive) |
| `0d7d870` | fix(play): ap dung harden mo ruong cho StationFlow + guard revealHint | Fix #3 cho `StationFlow.tsx` (bị sót ở a954219) + Minor #3 |

## Fixes

### #1 [P0] Panel check-in rỗng khi mới đến trạm
- Bỏ state `"choose"` khỏi union `Mode` → default `mode="photo"` (photo = cơ chế chủ đạo theo AGENTS.md).
- Tab active được đánh dấu sẵn bằng logic `mode === tb.id` có trước — giờ luôn có đúng một tab sáng.
- Không còn nhánh rơi ra ngoài cả 3 tab → không còn card kem trắng trơn.

### #2 [P0] Hint −20đ không confirm
- `SuccessPanel`: bấm "Xem gợi ý (−20 điểm)" (đã label giá từ trước) → hiện **confirm strip inline** (không dùng browser confirm):
  - `hint.confirm_title` + 2 nút: `hint.confirm_yes` (chạy tiếp logic spend `revealHint()` cũ) / `hint.confirm_no` (gỡ strip).
- Style quiet ink-on-cream: nền cream + ring line, chữ ink; nút Yes fill `ink-strong` (không đụng son — panel đã jade, giữ đúng Son Speaks Once; CTA son duy nhất màn hình vẫn là nút trạm kế/treasure).
- Reset `confirmingHint` khi đổi trạm (`useEffect [nextSlug, treasure]`) và ngay trước khi gọi spend.

### #3 [P1] POST mở rương bị nuốt lỗi ("badge hồn ma")
- **Sửa lại claim sai ở phiên bản trước của report này:** tại `a954219` hardening chỉ thực sự có mặt trong `play/page.tsx`; `StationFlow.tsx` vẫn còn pattern cũ `setQueue(slice(1))` + fire-and-forget. Lý do: khi tách 2 commit theo message chỉ định, bản full của StationFlow không được copy lại vào working tree sau commit 1 — report cũ tuyên bố "cả hai file" là SAI.
- Hardening đầy đủ cho **cả hai file** (play/page.tsx từ a954219; StationFlow.tsx từ commit round-1): onClose **không** dequeue nữa — giữ overlay mounted ở trạng thái opened/loot, fire `POST /api/chests` (CAS idempotent, đã xác minh route), chỉ dequeue khi response OK rồi mới `load()`.
- Phase state `"idle" | "pending" | "failed"`; chặn double-fire khi pending. Nếu fail: render `play.chest_open_failed` (wine-soft/wine) + nút Retry **bên trong overlay**, retry tới khi thành công mới rời đi. Offline-retry của Riley chạy đúng: fail → retry khi có mạng → dequeue. StationFlow reset phase theo slug.
- `ChestReveal.tsx`: chỉ mở rộng **additive** prop tùy chọn `notice?: React.ReactNode` render dưới danh sách loot. Consumer khác (treasure) không truyền → không đổi hành vi.

### #4 [P1] Legend màu chip
- Một caption row nhỏ trên rail chip trong `/play`: 3 item dot tròn + label `play.legend_solved/current/locked`.
- Màu dot khớp chính xác màu chip thực tế (đọc code `StationChip`, không phóng tác): solved = `bg-jade`, current/pending = `bg-clay`, chưa đến = `bg-son`. Ink-soft text, không thêm vùng son CTA (dot 8px chỉ phản chiếu trạng thái chip hiện có).

## Constraints check

- Son Speaks Once: mỗi màn vẫn đúng 1 vùng son CTA; legend/error dùng jade-clay-son-dot / wine / ink theo vai trò con dấu.
- Motion: chỉ thêm `transition-colors` (~150ms) trên nút confirm/retry — không transform, prefers-reduced-motion không bị ảnh hưởng.
- Riley guard: revisit trạm đã giải (confirm hint reset theo slug/nextSlug), offline retry chest (phase failed giữ overlay + retry), pending-photo, QR thiếu token — không đổi behavior nào ngoài 4 fix.
- Không rename rail, không fold header, KHÔNG đụng dictionaries/treasure/RewardCard/ChestVisual (trừ prop additive được phép).
- Chỉ stage 3 file của mình; `treasure/page.tsx` + `RewardCard.tsx` của agent song song không bị kéo vào commit.

## Verify

- `npm run lint` ✓ (0 warning, --max-warnings=0)
- `npm run typecheck` ✓
- `npm run test` ✓ (7 files, 44 tests passed)
- Detector: `node ../.opencode/skills/impeccable/scripts/detect.mjs --json src/components/StationFlow.tsx src/app/play/page.tsx` → `[]`, exit 0 (không finding mới). Build bỏ qua theo chỉ định (controller chạy ở merge).

## Fix round 1 (review verdict: Needs fixes)

- **Important #1 (đúng):** `a954219` thiếu hardening chest-POST trong `StationFlow.tsx`; report cũ claim sai "cả hai file" — đã sửa §#3 ở trên. Round-1 mirror đúng pattern openPhase/confirmChestOpen/notice của play/page sang StationFlow (state + reset theo slug + onClose guard pending + notice wine/retry trong overlay, dequeue chỉ sau POST OK).
- **Minor #3:** thêm guard re-entry `if (busy) return;` đầu `revealHint` (khớp `submitAnswer`).
- Verify round-1: lint ✓ · typecheck ✓ · 44 tests ✓ · detector `[]` exit 0.

## Concerns

1. **Commit lệch nhánh do workspace chia sẻ**: commit đầu tiên (`903a363`, cùng nội dung `910a126`) lừa landed trên `fix/treasure-p1` vì agent treasure đã checkout branch đó giữa chừng. Tôi KHÔNG rewrite branch đang bị agent khác checkout (rác race) — đã cherry-pick sang `fix/play-p0p1`. Khi merge cả hai branch vào main, git dedupe tự nhiên (cùng content, không conflict); PR treasure sẽ thấy 1 commit fix(play) thừa, vô hại.
2. Overlay mở rương khi người chơi bấm X **trước khi** tap-open: POST vẫn chạy (giữ semantics cũ = đóng là tiêu thụ); nếu POST fail lúc này overlay đứng ở trạng thái chest đóng + notice retry thay vì loot-visible — hiếm, chấp nhận được, vẫn không mất loot (grant chỉ mở sau confirm).
3. `StationFlow` ChestReveal không có `key={grantId}` (khác play page) — hành vi reuse instance giữ nguyên từ trước, nằm ngoài phạm vi.
