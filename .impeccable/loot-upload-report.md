# Loot Image Upload — Report

## Status: DONE

## Branch: `feat/loot-image-upload`

## Commit: `275f1f0` — `feat(admin): upload anh loot cho ruong + preview`

## Checks
- `npm run lint` — 0 warnings, 0 errors
- `npm run typecheck` — clean
- `npm run test` — 44 tests passed (7 files)

## What was created

### API: `web/src/app/api/admin/chest-loot/upload/route.ts`
- `POST /api/admin/chest-loot/upload` — FormData `file` field
- Auth: `isAdminRequest(req)` (same cookie-based admin check as other admin routes)
- Validation: MIME whitelist (jpg/png/webp/gif), 5MB max, filename sanitization (strip path, reject `..` or `/`)
- Storage: `web/public/images/loot/{timestamp}-{random4hex}.{ext}`
- Returns: `{ path: "/images/loot/{filename}" }`
- Error codes: 403 forbidden, 400 bad request, 500 write error

### UI: `web/src/app/admin/page.tsx` — ChestsTab
- Added `uploading` state + `uploadLootImage()` handler (client-side 5MB check before upload)
- Replaced `imagePath` text input in "Thêm loot mới" with:
  - File picker button → upload via `POST /api/admin/chest-loot/upload`
  - 128×128 thumbnail preview when `imagePath` is set
  - "Path thủ công" text input below preview for manual override
  - Loading indicator while uploading
  - Error/success toast via existing `msg` state
- Added inline 32×32 thumbnail in loot list (next to loot info) when `l.imagePath` is set
- No new dependencies — native `fetch` + `FormData`

## Concerns
- `web/public/images/loot/` directory is created on first upload (`mkdir recursive`). It's git-ignored since `web/public/` contains generated/static assets. Ensure deploy pipeline includes the directory or it's created at runtime.
- No cleanup of orphaned images on loot-delete. Low priority — admin manual task.
