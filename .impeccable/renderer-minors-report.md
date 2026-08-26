# M2 minor-findings cleanup — chest 3D renderers

- **Branch:** `fix/chest-renderer-minors` (off `main` @ `8959518`)
- **Commit:** `7347ca7` — `fix(m2-minors): cascade texture dispose + forceContextLoss + cache doi xung + log shim`
- **Date:** 2026-08-26

## Fixes applied (4/4)

1. **Texture cascade dispose** (`web/src/lib/three-loader.ts`) — `disposeThreeObject` now disposes known texture slots per material (single or array): `map, normalMap, roughnessMap, metalnessMap, aoMap, emissiveMap, alphaMap, specularMap, envMap`, each guarded `?.dispose?.()`. Zero static THREE imports (duck-typed via `Disposable & Partial<Record<slot, Disposable>>`). Comment updated to reflect new behavior.
2. **`forceContextLoss?.()` on every teardown path** — InlineThreeRenderer: interim teardown fn (pre-load), disposed-after-gltf early return, and main teardown; WebXRRenderer: disposed-race after `setSession`, `teardownStartup`, `finish`. All optional-chained for version safety.
3. **`loadGltfLoader` cache symmetry** (`three-loader.ts`) — module-level promise cache mirrors `loadThree`: `.catch → gltfPromise = null → rethrow`, so a failed GLTFLoader chunk fetch retries on next call instead of caching the rejection forever. Public shape unchanged (still resolves the `GLTFLoader` class).
4. **FileReader shim root-cause logging** (`web/scripts/build-chest-models.mjs`) — both error paths (`readAsArrayBuffer`, `readAsDataURL`) now log `console.error("[impeccable-shim] FileReader blob-read failed:", err)` before `onloadend`.

## Checks

| Check | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` (--max-warnings=0) | PASS |
| `npm run test` (vitest full suite) | PASS — 43/43 across 6 files |
| Targeted: `ar-support` / `game` / `chests` tests | green (included in full run: 5 + 14 + 8) |
| Static-import scan (`import ... from "three"` in web/src) | CLEAN — no matches |

`npm run build` intentionally skipped per coordination protocol (controller runs it at merge).

## Incident note (branch race)

First commit (`cca529f`) landed on `feat/ui-hero-taste` because a concurrent agent switched branches in the shared worktree between checkout and commit. Repaired without data loss: verified tracked-tree clean + target files identical between `main` and `98fd066`, then `git reset --hard HEAD~1` restored `feat/ui-hero-taste` to its tip, and the commit was cherry-picked onto this branch as `7347ca7`. Untracked files of the other agent were never touched.

## Fix round 1 (review feedback)

- **Commit:** `36dae65` — `fix(m2-minors): guard material-less node trong disposeThreeObject + test hồi quy`
- **Critical fixed:** `disposeThreeObject` threw TypeError on material-less nodes (root/Group/Lights → `[undefined]`), aborting teardown before `renderer.dispose()`/`forceContextLoss()` and, in WebXR `finish()`, before `onOpened()`. Restored the material-level optional guard while keeping the texture cascade (`mat?.dispose?.()` + `mat?.[slot]?.dispose?.()`).
- **Regression test:** new `web/src/lib/three-loader.test.ts` — fake root whose traverse feeds `{}` (no material) and `{material: {dispose: spy, map: {dispose: spy}}}`; asserts no throw + material & slot disposes called. Node env, no three dependency.
- **Checks:** typecheck PASS / lint PASS / vitest 44/44 PASS (7 files incl. new one). Static-import scan unaffected (no static `import ... from "three"`).
