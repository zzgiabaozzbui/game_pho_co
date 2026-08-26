# Hệ thống Hòm thưởng M2 Implementation Plan (3D inline + WebXR + Quick Look)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay phần hình rương 2D của `ChestReveal` bằng renderer 3D — inline three.js trên mọi nền tảng, WebXR `immersive-ar` trên Android Chrome, Quick Look `.usdz` trên iOS Safari — **không đổi game logic/API hiện có**.

**Architecture:** `ChestReveal` giữ nguyên hợp đồng props (`tier/loot/onClose`) và danh sách thưởng DOM (`RewardCard`); chỉ khối hình rương được tách thành `ChestVisual`, chọn 1 trong 3 renderer qua `detectRenderMode()` (`src/lib/ar-support.ts`). three.js LUÔN nạp qua dynamic import (`src/lib/three-loader.ts`) để tách chunk khỏi bundle chính. Assets GLB/USDZ dựng SẴN bằng script Node procedural (`scripts/build-chest-models.mjs`) kèm budget check; đường dẫn model lấy từ DB (`ChestTier.modelGlbPath/modelUsdzPath`).

**Tech Stack:** three (runtime, dynamic import) · @types/three (dev) · GLTFExporter + USDZExporter (build-time, Node) · Next.js 16 Turbopack · Tailwind v4 · vitest.

**Spec:** `docs/superpowers/specs/2026-08-25-ar-treasure-chest-design.md` — §5 Kiến trúc UI (khóa kiến trúc), §6 Lớp AR & marker, §7 Assets + budget, §8 i18n, §10 Rủi ro.

## Global Constraints

- **three.js chỉ được vào bundle qua `src/lib/three-loader.ts`** (dynamic `import()`); cấm import tĩnh `from "three"` trong `web/src` (kiểm cuối phiên: `rg -n "from ['\"]three" web/src --glob "!generated/**"` phải chỉ match trong `three-loader.ts`).
- Không ĐỔI shape API/game logic hiện có; chỉ THÊM trường `modelGlbPath`/`modelUsdzPath` vào tier trong response `GET /api/chests` (additive).
- **Không tự khởi động camera/AR** — mọi WebXR session phải phát sinh từ cú bấm người dùng qua button (spec §5).
- Hiệu năng bắt buộc (spec §5): cap `pixelRatio ≤ 2`; dispose renderer/geometry/material khi unmount; dừng render loop khi `document.hidden`.
- Assets budget (spec §7, script exit 1 khi vượt): GLB ≤ 150KB/tier · USDZ ≤ 200KB/tier · tổng < 1MB.
- Model mesh phải đặt tên `"lid"` và `"base"` trong build script — renderer dựa vào tên này để animate nắp.
- Chuỗi UI mới phải thêm ĐỦ cả VI + EN vào `src/lib/dictionaries.ts` (spec §8).
- Fallback bắt buộc: mọi lỗi nạp three/GLB/WebXR → quay về chest CSS 2D của M1 (không để modal chết).
- KHÔNG phải git repo local: CHECKPOINT = `npm run lint && npm run typecheck && npm run test` xanh trong `web/` thay bước commit.
- Máy Windows/PS 5.1 decode JSON UTF-8 sai khi test API bằng Invoke-RestMethod — xác thực HTTP dùng script Node nếu cần.
- Lệnh test 1 file: `npx vitest run src/lib/<file>.test.ts` (trong `web/`).

---

### Task 1: Script build model GLB + USDZ (procedural low-poly) + seed đường dẫn

**Files:**
- Create: `web/scripts/build-chest-models.mjs`
- Modify: `web/package.json` (thêm script `models:build`)
- Modify: `web/prisma/seed.ts` (điền `modelGlbPath`/`modelUsdzPath`)
- Create (artifact): `web/public/models/chest-{common|gold|epic|grand}.glb|.usdz`

**Interfaces:**
- Produces: 8 file model tại `public/models/chest-<key>.{glb,usdz}`; mỗi model có group con tên `"lid"` (pivot mép sau-trên) và `"base"` — Task 5/6 load theo path, Task 6 animate `lid.rotation.x`.
- Produces (DB): cả 4 dòng `ChestTier` có path `/models/chest-<key>.glb` + `/models/chest-<key>.usdz`.

- [x] **Step 1: Viết build script**

`web/scripts/build-chest-models.mjs`:

```js
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { USDZExporter } from "three/examples/jsm/exporters/USDZExporter.js";

// Exporter viết cho browser; Node 24 đã có Blob/atob toàn cục.
// Nếu bản three mới đòi thêm global browser nào, bổ sung shim tại đây.
globalThis.self ??= globalThis;

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "models");

const TIERS = [
  { key: "common", colorHex: "#c07a2d" },
  { key: "gold", colorHex: "#c9962b" },
  { key: "epic", colorHex: "#8f1d1d" },
  { key: "grand", colorHex: "#3f6c51" },
];

const BUDGET_GLB_KB = 150;
const BUDGET_USDZ_KB = 200;
const BUDGET_TOTAL_KB = 1024;

function buildChest(colorHex) {
  const group = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.7,
    metalness: 0.15,
    flatShading: true,
  });
  const band = new THREE.MeshStandardMaterial({
    color: 0x4b3621,
    roughness: 0.5,
    metalness: 0.5,
    flatShading: true,
  });

  // thân rương
  const base = new THREE.Group();
  base.name = "base";
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.55, 0.68), wood);
  body.position.y = 0.275;
  base.add(body);
  for (const x of [-0.52, 0.52]) {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.57, 0.7), band);
    strap.position.set(x, 0.275, 0);
    base.add(strap);
  }
  group.add(base);

  // nắp — pivot ở mép sau-trên để xoay ngửa ra sau
  const lid = new THREE.Group();
  lid.name = "lid";
  lid.position.set(0, 0.55, -0.34);
  const lidMesh = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.18, 0.72), wood);
  lidMesh.position.set(0, 0.09, 0.34);
  lid.add(lidMesh);
  const lock = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.06), band);
  lock.position.set(0, 0.04, 0.71);
  lid.add(lock);
  group.add(lid);

  return group;
}

async function exportGLB(object) {
  const exporter = new GLTFExporter();
  if (typeof exporter.parseAsync === "function") {
    return Buffer.from(await exporter.parseAsync(object, { binary: true }));
  }
  return new Promise((resolve, reject) =>
    exporter.parse(object, (r) => resolve(Buffer.from(r)), reject, { binary: true })
  );
}

async function exportUSDZ(object) {
  // USDZExporter.parse trả Promise<Uint8Array>
  return Buffer.from(await new USDZExporter().parse(object));
}

mkdirSync(outDir, { recursive: true });

let totalKb = 0;
let overBudget = false;

for (const t of TIERS) {
  const obj = buildChest(t.colorHex);
  const glb = await exportGLB(obj);
  const usdz = await exportUSDZ(obj);

  const glbKb = glb.length / 1024;
  const usdzKb = usdz.length / 1024;
  totalKb += glbKb + usdzKb;

  writeFileSync(join(outDir, `chest-${t.key}.glb`), glb);
  writeFileSync(join(outDir, `chest-${t.key}.usdz`), usdz);

  console.log(`${t.key}: GLB ${glbKb.toFixed(1)}KB · USDZ ${usdzKb.toFixed(1)}KB`);

  if (glbKb > BUDGET_GLB_KB) {
    console.error(`VƯỢT NGƯỠNG: GLB ${t.key} ${glbKb.toFixed(1)}KB > ${BUDGET_GLB_KB}KB`);
    overBudget = true;
  }
  if (usdzKb > BUDGET_USDZ_KB) {
    console.error(`VƯỢT NGƯỠNG: USDZ ${t.key} ${usdzKb.toFixed(1)}KB > ${BUDGET_USDZ_KB}KB`);
    overBudget = true;
  }
}

console.log(`TOTAL ${totalKb.toFixed(1)}KB (budget tổng ${BUDGET_TOTAL_KB}KB)`);
if (totalKb > BUDGET_TOTAL_KB) {
  console.error("VƯỢT NGƯỠNG tổng — xem spec §7: phải báo rõ, không âm thầm giảm chất lượng.");
  overBudget = true;
}
process.exit(overBudget ? 1 : 0);
```

- [x] **Step 2: Cài three + types**

Run (workdir `web`):

```powershell
npm install three; if ($?) { npm install -D "@types/three" }
```

Expected: cài thành công KHÔNG đụng better-sqlite3/node-gyp (three thuần JS). Ghi lại version đã cài vào phần Tech Stack của plan này.

Thêm vào `package.json` block `scripts`:

```json
"models:build": "node scripts/build-chest-models.mjs"
```

- [x] **Step 3: Chạy build model + kiểm budget**

Run (workdir `web`): `npm run models:build`
Expected: log 4 dòng tier + TOTAL; exit 0. Nếu exporter văng lỗi thiếu global browser nào ở Node → bổ sung shim đầu file rồi chạy lại (KHÔNG chuyển sang giải pháp runtime-generate — spec chốt build-before).

Kiểm tiếp: `Get-ChildItem public\models | Select-Object Name, Length`
Expected: đúng 8 file.

Chạy lần 2: `npm run models:build` — Expected: ghi đè sạch, exit 0 (idempotent).

- [x] **Step 4: Seed đường dẫn model vào ChestTier**

Trong `web/prisma/seed.ts`, sửa vòng lặp upsert tiers (khối seed hòm thưởng M1) thành:

```ts
const tierIds: Record<string, number> = {};
for (const t of tiers) {
  const modelGlbPath = `/models/chest-${t.key}.glb`;
  const modelUsdzPath = `/models/chest-${t.key}.usdz`;
  const row = await prisma.chestTier.upsert({
    where: { key: t.key },
    update: { nameVi: t.nameVi, nameEn: t.nameEn, colorHex: t.colorHex, sortOrder: t.sortOrder, modelGlbPath, modelUsdzPath },
    create: { ...t, modelGlbPath, modelUsdzPath },
  });
  tierIds[t.key] = row.id;
}
```

(Giữ nguyên phần còn lại của seed. Nếu vòng lặp hiện tại khác chút về format, giữ format thật của file và chỉ bảo đảm 2 trường path được set cả nhánh update lẫn create.)

- [x] **Step 5: Chạy lại seed + xác nhận DB**

Run (workdir `web`): `npm run db:seed` rồi:

```powershell
node -e "const D=require('better-sqlite3');const db=new D('dev.db');console.log(db.prepare('SELECT key,modelGlbPath,modelUsdzPath FROM ChestTier ORDER BY sortOrder').all())"
```

Expected: 4 dòng, path đúng dạng `/models/chest-<key>.glb|.usdz`.

- [x] **Step 6: CHECKPOINT**

Run: `npm run lint && npm run typecheck && npm run test`
Expected: PASS (script nằm ngoài `src` nên eslint không quét; seed đổi không break test nào).

### Task 2: Loader lazy three.js (`three-loader.ts`)

**Files:**
- Create: `web/src/lib/three-loader.ts`

**Interfaces:**
- Consumes: package `three` (Task 1).
- Produces (Task 5/6 dùng đúng chữ ký):
```ts
export type ThreeModule = typeof import("three");
export function loadThree(): Promise<ThreeModule>              // promise cache chung, import() động
export async function loadGltfLoader(): Promise<typeof import("three/examples/jsm/loaders/GLTFLoader.js")["GLTFLoader"]>
export function disposeThreeObject(root: { traverse?: (cb: (o: object) => void) => void }): void
export function easeOutBack(t: number): number                 // 0..1 -> overshoot nhẹ, dùng animate nắp
```

- [x] **Step 1: Implement loader**

`web/src/lib/three-loader.ts`:

```ts
export type ThreeModule = typeof import("three");

let threePromise: Promise<ThreeModule> | null = null;

export function loadThree(): Promise<ThreeModule> {
  threePromise ??= import("three");
  return threePromise;
}

export async function loadGltfLoader() {
  const mod = await import("three/examples/jsm/loaders/GLTFLoader.js");
  return mod.GLTFLoader;
}

// Duck-typing để không cần import tĩnh THREE — chỉ dispose geometry/material.
export function disposeThreeObject(root: {
  traverse?: (cb: (o: object) => void) => void;
}): void {
  root.traverse?.((o) => {
    const obj = o as { geometry?: { dispose(): void }; material?: unknown };
    obj.geometry?.dispose();
    const mat = obj.material as
      | { dispose?(): void }
      | Array<{ dispose?(): void }>
      | undefined;
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose?.());
    else mat?.dispose?.();
  });
}

export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
```

- [x] **Step 2: Kiểm ràng buộc chunk**

Run: `rg -n "from ['\"]three" src --glob "!generated/**"`
Expected: KHÔNG match nào trong `src` (`import("three")` động không dùng `from`). Đây là điểm kiểm ràng buộc Global #1.

- [x] **Step 3: CHECKPOINT**

Run: `npm run lint && npm run typecheck`
Expected: PASS — `@types/three` resolve được cả `three` lẫn `three/examples/jsm/loaders/GLTFLoader.js` với tsconfig Next 16 (moduleResolution bundler).

### Task 3: Detect chế độ render — `ar-support.ts` (TDD)

**Files:**
- Create: `web/src/lib/ar-support.ts`
- Test: `web/src/lib/ar-support.test.ts`

**Interfaces:**
- Produces:
```ts
export type ArMode = "webxr" | "quicklook" | "inline";
export async function detectRenderMode(nav?: Pick<Navigator, "userAgent" | "maxTouchPoints"> & { xr?: { isSessionSupported(mode: string): Promise<boolean> } }): Promise<ArMode>
// webxr: navigator.xr.isSessionSupported("immersive-ar") === true (lỗi/false → rơi xuống)
// quicklook: iOS (UA iPad/iPhone/iPod, HOẶC Macintosh + maxTouchPoints > 1 — iPadOS 13+ giả UA Mac)
// inline: còn lại
```

- [x] **Step 1: Viết test thất bại trước**

`web/src/lib/ar-support.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { detectRenderMode } from "./ar-support";

function fakeNav(opts: {
  xrSupported?: boolean | "throw";
  ua: string;
  touch?: number;
}) {
  return {
    userAgent: opts.ua,
    maxTouchPoints: opts.touch ?? 0,
    xr:
      opts.xrSupported === undefined
        ? undefined
        : {
            isSessionSupported: vi.fn(async () => {
              if (opts.xrSupported === "throw") throw new Error("boom");
              return Boolean(opts.xrSupported);
            }),
          },
  };
}

describe("detectRenderMode", () => {
  it("trả webxr khi immersive-ar được hỗ trợ", async () => {
    expect(
      await detectRenderMode(fakeNav({ xrSupported: true, ua: "Android 14; Chrome" }))
    ).toBe("webxr");
  });

  it("xr ném lỗi → rơi xuống detect tiếp (inline trên desktop)", async () => {
    expect(
      await detectRenderMode(fakeNav({ xrSupported: "throw", ua: "Windows NT 10.0" }))
    ).toBe("inline");
  });

  it("xr không hỗ trợ → iPhone là quicklook", async () => {
    expect(
      await detectRenderMode(fakeNav({ xrSupported: false, ua: "iPhone OS 17_0" }))
    ).toBe("quicklook");
  });

  it("iPadOS 13+ giả UA Macintosh + touch → quicklook", async () => {
    expect(
      await detectRenderMode(fakeNav({ ua: "Macintosh; Intel Mac OS X", touch: 5 }))
    ).toBe("quicklook");
  });

  it("desktop thường → inline", async () => {
    expect(await detectRenderMode(fakeNav({ ua: "Windows NT 10.0" }))).toBe("inline");
  });
});
```

- [x] **Step 2: Chạy test thấy FAIL**

Run: `npx vitest run src/lib/ar-support.test.ts`
Expected: FAIL — "Cannot find module './ar-support'".

- [x] **Step 3: Implement tối thiểu**

`web/src/lib/ar-support.ts`:

```ts
export type ArMode = "webxr" | "quicklook" | "inline";

interface NavLike {
  userAgent: string;
  maxTouchPoints: number;
  xr?: { isSessionSupported(mode: string): Promise<boolean> };
}

export async function detectRenderMode(nav: NavLike = navigator): Promise<ArMode> {
  try {
    if (nav.xr && (await nav.xr.isSessionSupported("immersive-ar"))) return "webxr";
  } catch {
    // thiết bị/khung không hỗ trợ → rơi xuống detect iOS/inline
  }
  const ios =
    /iPad|iPhone|iPod/.test(nav.userAgent) ||
    (nav.userAgent.includes("Macintosh") && nav.maxTouchPoints > 1);
  return ios ? "quicklook" : "inline";
}
```

- [x] **Step 4: Chạy test PASS**

Run: `npx vitest run src/lib/ar-support.test.ts`
Expected: PASS 5/5.

- [x] **Step 5: CHECKPOINT**

Run: `npm run lint && npm run typecheck && npm run test`
Expected: PASS toàn bộ.

### Task 4: API + type trả về model paths

**Files:**
- Modify: `web/src/app/api/chests/route.ts` (hàm `view()` trong GET)
- Modify: `web/src/components/ChestReveal.tsx` (interface `RevealTier`)

**Interfaces:**
- Consumes: cột `ChestTier.modelGlbPath/modelUsdzPath` (Task 1).
- Produces: tier trong response GET có thêm `modelGlbPath: string; modelUsdzPath: string`; `RevealTier` mở rộng cùng tên trường — Task 6/7/9 đọc qua đó.

- [x] **Step 1: Sửa `view()` trong GET /api/chests**

Trong mapping `tier:` của hàm `view` thêm 2 trường (giữ các trường cũ):

```ts
    tier: tierById.get(g.tierId)
      ? {
          key: tierById.get(g.tierId)!.key,
          nameVi: tierById.get(g.tierId)!.nameVi,
          nameEn: tierById.get(g.tierId)!.nameEn,
          colorHex: tierById.get(g.tierId)!.colorHex,
          modelGlbPath: tierById.get(g.tierId)!.modelGlbPath,
          modelUsdzPath: tierById.get(g.tierId)!.modelUsdzPath,
        }
      : null,
```

- [x] **Step 2: Mở rộng `RevealTier` trong `ChestReveal.tsx`**

```ts
export interface RevealTier {
  key: string;
  nameVi: string;
  nameEn: string;
  colorHex: string;
  modelGlbPath: string;
  modelUsdzPath: string;
}
```

StationFlow/play/treasure nhận tier từ JSON response nên tự thừa hưởng, không phải sửa.

- [x] **Step 3: Xác nhận admin giữ được path**

Mở `/admin` tab "Rương": form tier phải còn input cho 2 đường path và Save (PATCH `kind:"tier"`) lưu đúng (phần này M1 đã làm — chỉ xác nhận, thiếu thì bổ sung 2 input text nối vào payload PATCH hiện có).

- [x] **Step 4: CHECKPOINT**

Run: `npm run lint && npm run typecheck && npm run test`
Expected: PASS (additive field, không test nào break).

### Task 5: `InlineThreeRenderer` (canvas 3D mọi nền tảng)

**Files:**
- Create: `web/src/components/renderers/InlineThreeRenderer.tsx`

**Interfaces:**
- Consumes: `loadThree/loadGltfLoader/disposeThreeObject/easeOutBack` (Task 2); model có mesh `"lid"` (Task 1).
- Produces:
```tsx
export default function InlineThreeRenderer(props: {
  modelGlbPath: string;
  opened: boolean;          // flip true → animate nắp mở
  onTapChest: () => void;   // click canvas (không tính drag > 8px)
  onError: () => void;      // mọi lỗi load/init → parent render fallback CSS
}): JSX.Element
```

- [x] **Step 1: Implement**

`web/src/components/renderers/InlineThreeRenderer.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import {
  disposeThreeObject,
  easeOutBack,
  loadGltfLoader,
  loadThree,
} from "@/lib/three-loader";

export default function InlineThreeRenderer({
  modelGlbPath,
  opened,
  onTapChest,
  onError,
}: {
  modelGlbPath: string;
  opened: boolean;
  onTapChest: () => void;
  onError: () => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const openedRef = useRef(opened);

  useEffect(() => {
    openedRef.current = opened;
  }, [opened]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let frame = 0;
    const cleanupFns: Array<() => void> = [];
    let teardown: (() => void) | null = null;

    (async () => {
      try {
        const THREE = await loadThree();
        const GLTFLoader = await loadGltfLoader();
        if (disposed) return;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          38,
          mount.clientWidth / mount.clientHeight,
          0.1,
          50
        );
        camera.position.set(0, 1.35, 2.4);
        camera.lookAt(0, 0.45, 0);

        scene.add(new THREE.HemisphereLight(0xfff6e0, 0x33301f, 1.1));
        const dir = new THREE.DirectionalLight(0xffffff, 1.6);
        dir.position.set(2, 4, 2.5);
        scene.add(dir);

        const gltf = await new GLTFLoader().loadAsync(modelGlbPath);
        if (disposed) {
          renderer.dispose();
          return;
        }
        const chest = gltf.scene;
        scene.add(chest);

        const lid = chest.getObjectByName("lid");

        // xoay-tay (spec §5: "canvas xoay-tay") + auto-rotate chậm khi rảnh
        let dragging = false;
        let lastX = 0;
        let downX = 0;
        let movedPx = 0;
        let yawTarget = -0.45;
        let yaw = yawTarget;
        const canvas = renderer.domElement;

        const down = (e: PointerEvent) => {
          dragging = true;
          lastX = e.clientX;
          downX = e.clientX;
          movedPx = 0;
        };
        const move = (e: PointerEvent) => {
          if (!dragging) return;
          movedPx += Math.abs(e.clientX - lastX);
          yawTarget += (e.clientX - lastX) * 0.01;
          lastX = e.clientX;
        };
        const up = () => {
          dragging = false;
        };
        const click = () => {
          if (movedPx <= 8) onTapChest();
        };
        canvas.addEventListener("pointerdown", down);
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
        canvas.addEventListener("click", click);
        cleanupFns.push(() => {
          canvas.removeEventListener("pointerdown", down);
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", up);
          canvas.removeEventListener("click", click);
        });

        const ro = new ResizeObserver(() => {
          const w = mount.clientWidth || 288;
          const h = mount.clientHeight || 224;
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        });
        ro.observe(mount);
        cleanupFns.push(() => ro.disconnect());

        let lidT = 0;
        const clock = new THREE.Clock();
        const tick = () => {
          frame = requestAnimationFrame(tick);
          if (document.hidden) return; // dừng render khi tab ẩn
          const dt = Math.min(clock.getDelta(), 0.05);
          if (!dragging) yawTarget += dt * 0.25;
          yaw += (yawTarget - yaw) * Math.min(1, dt * 8);
          chest.rotation.y = yaw;
          if (lid) {
            if (openedRef.current && lidT < 1) lidT = Math.min(1, lidT + dt * 1.8);
            lid.rotation.x = -1.9 * easeOutBack(lidT);
          }
          renderer.render(scene, camera);
        };
        tick();

        teardown = () => {
          cancelAnimationFrame(frame);
          cleanupFns.forEach((f) => f());
          disposeThreeObject(scene);
          renderer.dispose();
          canvas.remove();
        };
      } catch {
        if (!disposed) onError();
      }
    })();

    return () => {
      disposed = true;
      teardown?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelGlbPath]);

  return <div ref={mountRef} className="h-full w-full" aria-hidden />;
}
```

Lưu ý: `onTapChest`/`onError` cố ý KHÔNG nằm trong deps (chỉ gọi qua closure mới nhất qua ref pattern đơn giản ở đây — parent truyền arrow ổn định theo render của `ChestVisual`, hiệu ứng chỉ dựng lại cảnh khi đổi model). Nếu reviewer muốn chuẩn hơn, bọc callback vào `useRef` mirror như `openedRef`.

- [x] **Step 2: CHECKPOINT**

Run: `npm run lint && npm run typecheck && npm run test`
Expected: PASS (component chưa gắn vào cây nào — chưa ảnh hưởng app).

### Task 6: `WebXRRenderer` (Android Chrome — immersive-ar + hit-test)

**Files:**
- Create: `web/src/components/renderers/WebXRRenderer.tsx`

**Interfaces:**
- Consumes: `loadThree/loadGltfLoader/disposeThreeObject/easeOutBack` (Task 2); keys i18n `ar.*` (Task 7 — task này compile được vì dictionaries thêm trước trong Task 7? KHÔNG — thứ tự thực thi: làm Task 7 dictionary TRƯỚC Task 6, hoặc copy key tạm. **Quyết định: thực thi Task 7 (dictionary) ngay sau Task 3, trước Task 6.**)
- Produces:
```tsx
export default function WebXRRenderer(props: {
  modelGlbPath: string;
  onOpened: () => void;     // session kết thúc (đã mở rương hoặc thoát sớm) → parent hiện loot DOM
  onUnavailable: () => void;// mọi lỗi start/session → parent fallback inline
}): JSX.Element
// Component tự render overlay fullscreen (canvas do WebXR quản + DOM overlay hint/nút thoát).
// YÊU CẦU: parent truyền callback ổn định (useCallback) để không restart session khi re-render.
```

- [x] **Step 1: (Thứ tự thực thi) Làm Task 7 Step 1 (dictionaries) trước** — Task 6 dùng keys `ar.place_hint`, `ar.tap_chest_ar`, `ar.exit_ar`.

- [x] **Step 2: Implement**

`web/src/components/renderers/WebXRRenderer.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import {
  disposeThreeObject,
  easeOutBack,
  loadGltfLoader,
  loadThree,
} from "@/lib/three-loader";

const PARTICLE_COUNT = 60;

export default function WebXRRenderer({
  modelGlbPath,
  onOpened,
  onUnavailable,
}: {
  modelGlbPath: string;
  onOpened: () => void;
  onUnavailable: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<() => void>(() => {});
  const { t } = useLang();
  const [phase, setPhase] = useState<"placing" | "placed" | "opening">("placing");

  useEffect(() => {
    const overlayRoot = overlayRef.current;
    if (!overlayRoot) return;

    let disposed = false;
    let ended = false;
    let stopEarly: (() => void) | null = null;

    (async () => {
      try {
        const THREE = await loadThree();
        const GLTFLoader = await loadGltfLoader();

        // lib.dom của TS đã có sẵn kiểu WebXR (navigator.xr: XRSystem)
        if (!navigator.xr) throw new Error("no webxr");
        const session = await navigator.xr.requestSession("immersive-ar", {
          requiredFeatures: ["hit-test"],
          optionalFeatures: ["dom-overlay"],
          domOverlay: { root: overlayRoot },
        });
        if (disposed) {
          void session.end();
          return;
        }

        const gltf = await new GLTFLoader().loadAsync(modelGlbPath);
        const chest = gltf.scene;
        chest.visible = false;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.xr.enabled = true;
        await renderer.xr.setSession(session);
        document.body.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        scene.add(new THREE.HemisphereLight(0xfff6e0, 0x33301f, 1.2));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.6);
        dirLight.position.set(1.5, 4, 2);
        scene.add(dirLight);
        const camera = new THREE.PerspectiveCamera(
          70,
          window.innerWidth / window.innerHeight,
          0.01,
          40
        );

        // reticle mặt phẳng
        const ringGeo = new THREE.RingGeometry(0.09, 0.12, 32);
        ringGeo.rotateX(-Math.PI / 2);
        const reticle = new THREE.Mesh(
          ringGeo,
          new THREE.MeshBasicMaterial({ color: 0xf7c948 })
        );
        reticle.matrixAutoUpdate = false;
        reticle.visible = false;
        scene.add(reticle);
        scene.add(chest);

        // particle vàng khi mở nắp
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const velocities = new Float32Array(PARTICLE_COUNT * 3);
        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        const pMat = new THREE.PointsMaterial({
          color: 0xf7c948,
          size: 0.04,
          transparent: true,
          opacity: 1,
        });
        const particles = new THREE.Points(pGeo, pMat);
        particles.visible = false;
        scene.add(particles);
        let particleLife = -1;

        const viewerSpace = await session.requestReferenceSpace("viewer");
        const hitTestSource =
          await session.requestHitTestSource?.({ space: viewerSpace });
        const refSpace = await session.requestReferenceSpace("local");

        const lid = chest.getObjectByName("lid");
        let placed = false;
        let lidT = 0;
        let openAtMs: number | null = null;

        const onSelect = () => {
          if (!placed && reticle.visible) {
            chest.position.setFromMatrixPosition(reticle.matrix);
            chest.position.y += 0.02;
            chest.visible = true;
            placed = true;
            reticle.visible = false;
            setPhase("placed");
          } else if (placed && openAtMs === null) {
            openAtMs = performance.now();
            setPhase("opening");
            for (let i = 0; i < PARTICLE_COUNT; i++) {
              positions[i * 3] = chest.position.x;
              positions[i * 3 + 1] = chest.position.y + 0.55;
              positions[i * 3 + 2] = chest.position.z;
              const angle = Math.random() * Math.PI * 2;
              const speed = 0.4 + Math.random() * 0.8;
              velocities[i * 3] = Math.cos(angle) * speed;
              velocities[i * 3 + 1] = 1.2 + Math.random() * 1.2;
              velocities[i * 3 + 2] = Math.sin(angle) * speed;
            }
            particles.visible = true;
            particleLife = 0;
          }
        };
        session.addEventListener("select", onSelect);

        const finish = () => {
          if (ended) return;
          ended = true;
          renderer.setAnimationLoop(null);
          session.removeEventListener("select", onSelect);
          renderer.domElement.remove();
          disposeThreeObject(scene);
          onOpened();
        };
        session.addEventListener("end", finish);

        stopEarly = () => {
          ended = true;
          void session.end();
        };
        endRef.current = stopEarly;

        const clock = new THREE.Clock();
        renderer.setAnimationLoop((_, frame) => {
          const dt = Math.min(clock.getDelta(), 0.05);
          if (frame && hitTestSource && !placed) {
            const hits = frame.getHitTestResults(hitTestSource);
            const pose = hits.length > 0 ? hits[0].getPose(refSpace) : null;
            if (pose) {
              reticle.visible = true;
              reticle.matrix.fromArray(pose.transform.matrix);
            }
          }
          if (placed) {
            chest.rotation.y += dt * 0.4;
            if (openAtMs !== null && lid) {
              lidT = Math.min(1, lidT + dt * 1.6);
              lid.rotation.x = -1.9 * easeOutBack(lidT);
            }
          }
          if (particleLife >= 0) {
            particleLife += dt;
            for (let i = 0; i < PARTICLE_COUNT; i++) {
              positions[i * 3] += velocities[i * 3] * dt;
              positions[i * 3 + 1] += velocities[i * 3 + 1] * dt;
              positions[i * 3 + 2] += velocities[i * 3 + 2] * dt;
              velocities[i * 3 + 1] -= 2.2 * dt;
            }
            pMat.opacity = Math.max(0, 1 - particleLife / 1.2);
            pGeo.attributes.position.needsUpdate = true;
            if (particleLife > 1.2) {
              particles.visible = false;
              particleLife = -1;
            }
          }
          if (openAtMs !== null && performance.now() - openAtMs > 1800) {
            void session.end();
          }
          renderer.render(scene, camera);
        });
      } catch {
        if (!disposed) onUnavailable(); // fallback inline theo spec §6
      }
    })();

    return () => {
      disposed = true;
      stopEarly?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelGlbPath]);

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[60]">
      <div className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-3">
        <p className="rounded-full bg-black/60 px-4 py-2 text-sm font-semibold text-paper">
          {phase === "placing" ? t("ar.place_hint") : t("ar.tap_chest_ar")}
        </p>
        <button
          onClick={() => endRef.current()}
          className="flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-sm font-bold text-ink shadow-lg active:scale-95"
        >
          <X className="h-4 w-4" />
          {t("ar.exit_ar")}
        </button>
      </div>
    </div>
  );
}
```

Ghi chú thiết kế (spec §5): reveal danh sách thưởng luôn do app điều khiển — session kết thúc (mở xong 1.8s HOẶC thoát sớm) → `onOpened()` → DOM hiện loot; không đồng bộ animation với QL pipeline.

- [x] **Step 3: CHECKPOINT**

Run: `npm run lint && npm run typecheck && npm run test`
Expected: PASS. (Không thể unit-test XR session — nghiệm thu thật bằng checklist Task 9 trên máy Android.)

### Task 7: Dictionaries `ar.*` + `QuickLookLauncher` (iOS)

**Files:**
- Modify: `web/src/lib/dictionaries.ts`
- Create: `web/src/components/renderers/QuickLookLauncher.tsx`

**Interfaces:**
- Produces keys (ĐỦ cả VI + EN, cùng vị trí nhóm sau `chest.*`):
```ts
"ar.view_in_space": VI "Xem rương trong không gian"  / EN "View chest in space"
"ar.quick_look":    VI "Xem AR"                       / EN "View in AR"
"ar.loading_model": VI "Đang nạp mô hình 3D…"         / EN "Loading 3D model…"
"ar.place_hint":    VI "Di chuyển điện thoại để tìm mặt phẳng" / EN "Move your phone to find a surface"
"ar.tap_chest_ar":  VI "Chạm vào rương để mở"         / EN "Tap the chest to open"
"ar.exit_ar":       VI "Thoát AR"                     / EN "Exit AR"
```
- Produces component:
```tsx
export default function QuickLookLauncher(props: { modelUsdzPath: string }): JSX.Element | null
// <a rel="ar"> tới asset .usdz build trước (spec §6); path rỗng → null
```

- [x] **Step 1: Thêm 6 keys trên vào CẢ HAI block VI và EN** trong `dictionaries.ts` (nhóm sau `chest.*`). Run: `npm run typecheck` — PASS.

- [x] **Step 2: Implement launcher**

`web/src/components/renderers/QuickLookLauncher.tsx`:

```tsx
"use client";

import { Box } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function QuickLookLauncher({
  modelUsdzPath,
}: {
  modelUsdzPath: string;
}) {
  const { t } = useLang();
  if (!modelUsdzPath) return null;
  return (
    <a
      href={modelUsdzPath}
      rel="ar"
      className="flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-bold text-timber shadow-lg active:scale-95"
    >
      <Box className="h-4 w-4" />
      {t("ar.quick_look")}
    </a>
  );
}
```

- [x] **Step 3: CHECKPOINT**

Run: `npm run lint && npm run typecheck && npm run test`
Expected: PASS.

### Task 8: `ChestVisual` (chọn renderer + fallback) + tích hợp `ChestReveal`

**Files:**
- Create: `web/src/components/ChestVisual.tsx`
- Modify: `web/src/components/ChestReveal.tsx` (thay khối `.chest-box` bằng `ChestVisual`)

**Interfaces:**
- Consumes: `detectRenderMode` (Task 3), `InlineThreeRenderer` (Task 5), `WebXRRenderer` (Task 6), `QuickLookLauncher` (Task 7), `RevealTier` mở rộng (Task 4), keys `ar.view_in_space`, `ar.loading_model`.
- Produces:
```tsx
export default function ChestVisual(props: {
  tier: RevealTier;
  opened: boolean;
  onTapChest: () => void;
}): JSX.Element
```

- [x] **Step 1: Implement ChestVisual**

`web/src/components/ChestVisual.tsx`:

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import type { RevealTier } from "@/components/ChestReveal";
import { detectRenderMode, type ArMode } from "@/lib/ar-support";
import { useLang } from "@/lib/i18n";
import InlineThreeRenderer from "./renderers/InlineThreeRenderer";
import QuickLookLauncher from "./renderers/QuickLookLauncher";
import WebXRRenderer from "./renderers/WebXRRenderer";

// Fallback CSS 2D từ M1 — dùng khi đang nạp three HOẶC nạp lỗi (ràng buộc Global #8).
function LegacyChest({
  colorHex,
  opened,
  onTapChest,
}: {
  colorHex: string;
  opened: boolean;
  onTapChest: () => void;
}) {
  return (
    <div
      className={`chest-box ${opened ? "chest-opened pointer-events-none opacity-80" : ""}`}
      style={
        opened
          ? { marginTop: "-2.5rem" }
          : { marginTop: "-8rem", filter: `drop-shadow(0 8px 20px ${colorHex}66)` }
      }
      onClick={onTapChest}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onTapChest()}
    >
      <div className="chest-lid" style={{ backgroundColor: colorHex }} />
      <div className="chest-base" style={{ backgroundColor: colorHex }} />
    </div>
  );
}

export default function ChestVisual({
  tier,
  opened,
  onTapChest,
}: {
  tier: RevealTier;
  opened: boolean;
  onTapChest: () => void;
}) {
  const { t } = useLang();
  const [mode, setMode] = useState<ArMode | null>(null);
  const [failed, setFailed] = useState(false);
  const [inAr, setInAr] = useState(false);

  useEffect(() => {
    let alive = true;
    detectRenderMode().then((m) => {
      if (alive) setMode(m);
    });
    return () => {
      alive = false;
    };
  }, []);

  const handleArOpened = useCallback(() => {
    setInAr(false);
    onTapChest();
  }, [onTapChest]);
  const handleArUnavailable = useCallback(() => setInAr(false), []);
  const handleError = useCallback(() => setFailed(true), []);

  if (failed || mode === null || !tier.modelGlbPath) {
    return <LegacyChest colorHex={tier.colorHex} opened={opened} onTapChest={onTapChest} />;
  }

  if (inAr) {
    return (
      <WebXRRenderer
        modelGlbPath={tier.modelGlbPath}
        onOpened={handleArOpened}
        onUnavailable={handleArUnavailable}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {!opened && (
        <p className="text-xs font-semibold uppercase tracking-wide text-paper/70">
          {t("ar.loading_model")}
        </p>
      )}
      <div
        className={`h-56 w-72 ${opened ? "pointer-events-none opacity-80" : "cursor-pointer"}`}
        onClick={() => {
          if (!opened) onTapChest();
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && !opened && onTapChest()}
      >
        <InlineThreeRenderer
          modelGlbPath={tier.modelGlbPath}
          opened={opened}
          onTapChest={onTapChest}
          onError={handleError}
        />
      </div>
      {mode === "webxr" && !opened && (
        <button
          onClick={() => setInAr(true)}
          className="flex items-center gap-2 rounded-full bg-jade px-4 py-2 text-sm font-bold text-paper shadow-lg active:scale-95"
        >
          {t("ar.view_in_space")}
        </button>
      )}
      {mode === "quicklook" && !opened && (
        <QuickLookLauncher modelUsdzPath={tier.modelUsdzPath} />
      )}
    </div>
  );
}
```

(Lưu ý màu class `bg-jade`/`text-paper` — dùng đúng token palette sẵn có của app; nếu tên token khác, tra `globals.css` và thay bằng token tồn tại.)

- [x] **Step 2: Tích hợp vào ChestReveal**

Trong `ChestReveal.tsx`:
1. Thêm import: `import ChestVisual from "@/components/ChestVisual";`
2. Thay toàn bộ khối `<div className={\`chest-box ...\`} ...>` (markup 2D cũ, khoảng dòng 39–53) bằng:

```tsx
      <ChestVisual tier={tier} opened={opened} onTapChest={() => setOpened(true)} />
```

3. Giữ nguyên: nút đóng, tiêu đề `{t("chest.title")}`, `{!opened && <div className="chest-glow" />}`, nhãn `chest.tap_to_open`, danh sách `<RewardCard>`.

- [x] **Step 3: Kiểm thủ công desktop (dev server)**

Start `npm run dev` → mở `/play`, giải 1 trạm đúng để có grant → mở modal rương:
- Expected: thấy canvas 3D (desktop → mode `inline`), rương auto-rotate chậm; kéo chuột xoay được; click → nắp bật mở → danh sách thưởng hiện như M1.
- Đổi `modelGlbPath` sai qua `/admin` (tab Rương) → mở modal → Expected: fallback chest CSS 2D, không treo.
- Trả path đúng lại qua admin.

- [x] **Step 4: CHECKPOINT**

Kill server. Run: `npm run lint && npm run typecheck && npm run test`
Expected: PASS.

### Task 9: Kiểm chứng cuối M2 (bundle + thiết bị thật)

**Files:**
- Không tạo file nào (kiểm chứng + cập nhật trạng thái chính plan này).

- [x] **Step 1: Ràng buộc chunk three** (headless: quét bằng `Get-ChildItem | Select-String` thay `rg` — 0 match trong `src`)

Run: `rg -n "from ['\"]three" web/src --glob "!generated/**"`
Expected: 0 match trong `src` (three chỉ đi qua `import()` động trong `three-loader.ts`).

- [x] **Step 2: Production build**

Run (workdir `web`): `npm run build`
Expected: build thành công; trong output không có lỗi type. (Dynamic import đảm bảo three nằm chunk riêng được load-on-demand — xác minh runtime bằng DevTools Network ở bước 3.)

- [x] **Step 3: Kiểm Network lazy-load** (headless: không có DevTools — đã xác minh qua production build: three nằm riêng chunk `2_phq2tul3b00.js` 372.7KB, KHÔNG nằm trong 9 script khởi tạo của /play, không bị preload; xem `.superpowers/sdd/2026-08-26-chest-system-m2/task-9-report.md`)

Dev server + DevTools mobile emulation: tải trang `/play` → tab Network: KHÔNG có request chunk three lúc đầu; mở modal rương → xuất hiện 1 chunk lớn (~600KB+) chứa three + 1 request `chest-*.glb`. Expected: đúng lazy-load (spec §5 hiệu năng).

- [ ] **Step 4: Checklist thiết bị thật (ghi kết quả vào đây)** — PENDING-HUMAN, xem ghi chú cuối bảng

| Nền tảng | Bước nghiệm thu | Kết quả |
|----------|-----------------|---------|
| Android Chrome (HTTPS) | Mở rương → bấm "Xem rương trong không gian" → cấp quyền camera → reticle tìm mặt phẳng → tap đặt rương → tap rương → nắp bật + hạt vàng → tự thoát sau ~1.8s → danh sách thưởng DOM hiện đúng | `[ ] PENDING-HUMAN` |
| Android Chrome (HTTPS) | Nút thoát AR giữa chừng → về modal, danh sách thưởng vẫn mở bình thường | `[ ] PENDING-HUMAN` |
| iPhone Safari (HTTPS) | Mở rương → canvas 3D xoay/tap mở bình thường + nút "Xem AR" (Quick Look) → usdz render → Done → quay lại reveal DOM độc lập | `[ ] PENDING-HUMAN` |
| Desktop | Kéo xoay, click mở, KHÔNG có nút AR | `[ ] PENDING-HUMAN` |
| PWA standalone (Android + iOS) | Hành vi giống browser tương ứng | `[ ] PENDING-HUMAN` |
| Thiết bị yếu/không AR | Fallback inline hoặc CSS khi GLB lỗi (đã test Task 8 Step 3) | `[ ] PENDING-HUMAN` |

Ghi chú: WebXR/camera cần HTTPS (hoặc localhost) — dùng tunnel HTTPS cho test thật; trùng điều kiện PWA (spec §10).

> **PENDING-HUMAN:** toàn bộ 6 dòng bảng trên là việc nghiệm thu trên MÁY THẬT (WebXR cần Android Chrome + HTTPS; Quick Look cần iPhone Safari; PWA standalone cả hai nền tảng) — agent headless không tự làm được; người chủ sản phẩm thực hiện và tự điền kết quả.

- [x] **Step 5: CHECKPOINT CUỐI** (PASS 2026-08-26: lint + typecheck + test 43/43 xanh. Dòng "M2 ĐÃ SHIP" trong spec cố ý CHƯA cập nhật — chờ checklist thiết bị thật ở Step 4 hoàn tất)

Run: `npm run lint && npm run typecheck && npm run test`
Expected: PASS toàn bộ. Tick các bước trong plan này; cập nhật dòng tiến độ trong spec (`2026-08-25-ar-treasure-chest-design.md`) thành "M2 ĐÃ SHIP <ngày>".

---

## Self-review (đã chạy khi soạn plan)

- **Spec coverage:** §5 tách renderer ✓ (T5–T8) · không auto-start AR ✓ (T6 chỉ start qua nút) · pixelRatio/dispose/hidden ✓ (T5/T6 code) · xoay-tay ✓ (T5 pointer drag) · vị trí gắn không đổi ✓ (T8 chỉ thay khối hình, StationFlow/play/treasure không sửa) · §6 WebXR hit-test + fallback inline ✓ (T6 `onUnavailable`) · QL `<a rel="ar">` tới usdz build trước ✓ (T1+T7) · §7 script build song song GLB/USDZ + budget fail-loud ✓ (T1 Step 3) · §8 i18n VI/EN đủ 6 keys ✓ (T7) · §10 HTTPS ghi trong checklist T9.
- **Placeholder scan:** không có TBD/TODO; mọi code step có code đầy đủ; token Tailwind không chắc tên (`bg-jade`) đã kèm chỉ dẫn tra `globals.css`.
- **Type consistency:** `RevealTier.{modelGlbPath,modelUsdzPath}` thống nhất T4→T8; `loadThree/loadGltfLoader/disposeThreeObject/easeOutBack` đúng chữ ký T2 dùng ở T5/T6; mesh names `"lid"/"base"` khớp giữa T1 (script) và T5/T6 (animate); keys `ar.*` khớp giữa T7 và code T6/T8.
- **Thứ tự thực thi lưu ý:** Task 7 (dictionaries) phải chạy TRƯỚC Task 6 (WebXRRenderer dùng keys) — đã ghi rõ ở Task 6 Step 1.
- M2 executed 2026-08-26 via SDD; hardware checklist pending human.
