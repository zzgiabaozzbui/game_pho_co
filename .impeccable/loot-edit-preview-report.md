# Loot Edit + Chest Preview — Report

**Branch:** `feat/loot-edit-preview` (off `main`)
**Commit:** `80b637a` — `feat(admin): sua loot + xem truoc ruong trong admin`

## Changes

### A. API: `loot-update` kind
- `validators.ts`: Added `loot-update` discriminated union variant (all fields optional except `id`)
- `route.ts`: Added `case "loot-update"` — destructures `id`, spreads remaining fields into `db.chestLoot.update`

### B. Admin UI: Loot editing
- `editingLoot` state (`LootRow | null`) + `editingLootForm` state for form fields
- "Sửa" button on each loot row → populates edit form with current values
- Edit form above "Thêm loot mới": scopeKey, type, pointsAmount, sortOrder, storyVi, storyEn, youtubeUrl, imagePath (with upload widget), sortOrder
- "Lưu" → `patch({ kind: "loot-update", id, ...fields })`, "Hủy" → clears editingLoot
- Upload widget reused via `uploadLootImageEdit` (writes to `editingLootForm.imagePath`)

### C. Admin UI: Chest preview
- "Xem trước" button on each tier section header
- Full-screen overlay (z-50, dark backdrop) with `ChestReveal`
- Mock `RevealTier` constructed from tier row data
- Mock loot: first 4 items from `data.loot` mapped to `RevealLoot`
- Closes on backdrop click AND Escape key (via `useEffect` keydown listener)
- No CTA buttons — admin-only demo mode

## Verification
- `npm run lint` — clean (0 errors, 0 warnings)
- `npm run typecheck` — clean
- `npm run test` — 44/44 passed (7 suites)
- Detector: no issues (admin UI, operate mode)

## Files Modified
1. `web/src/lib/validators.ts` — +15 lines
2. `web/src/app/api/admin/chests/route.ts` — +6 lines
3. `web/src/app/admin/page.tsx` — +180 lines, -9 lines

## Concerns
- Preview uses first 4 loot items as demo (not filtered by tier scopeKey) — acceptable for admin preview
- `editingLootForm` uses string values for numeric fields (pointsAmount, sortOrder) to match existing `newLoot` pattern
