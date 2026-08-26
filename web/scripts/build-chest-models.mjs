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
globalThis.FileReader ??= class FileReader {
  readAsArrayBuffer(blob) {
    blob
      .arrayBuffer()
      .then((buf) => {
        this.result = buf;
        this.onloadend?.();
      })
      .catch((err) => {
        console.error("[impeccable-shim] FileReader blob-read failed:", err);
        this.error = err;
        this.onerror?.();
        this.onloadend?.();
      });
  }
  readAsDataURL(blob) {
    blob
      .arrayBuffer()
      .then((buf) => {
        const mime = blob.type || "application/octet-stream";
        this.result = `data:${mime};base64,${Buffer.from(buf).toString("base64")}`;
        this.onloadend?.();
      })
      .catch((err) => {
        console.error("[impeccable-shim] FileReader blob-read failed:", err);
        this.error = err;
        this.onerror?.();
        this.onloadend?.();
      });
  }
};

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

const GOLD_HEX = 0xd4af37;
const GEM_COLORS = [0xc21f3a, 0x2f8f5b, 0x2b5fb8];

function addBox(parent, mat, w, h, d, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}

function buildChest(colorHex) {
  const group = new THREE.Group();

  const wood = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.55,
    metalness: 0.1,
    flatShading: true,
  });
  const shellWood = wood.clone();
  shellWood.side = THREE.DoubleSide;
  const gold = new THREE.MeshStandardMaterial({
    color: GOLD_HEX,
    roughness: 0.35,
    metalness: 0.7,
    flatShading: true,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x2a1a10,
    roughness: 0.6,
    metalness: 0.2,
    flatShading: true,
  });

  const base = new THREE.Group();
  base.name = "base";
  addBox(base, wood, 1.0, 0.55, 0.68, 0, 0.275, 0);

  for (const x of [-0.465, 0.465]) {
    for (const z of [-0.305, 0.305]) {
      addBox(base, gold, 0.07, 0.56, 0.07, x, 0.275, z);
    }
  }

  addBox(base, gold, 1.04, 0.05, 0.03, 0, 0.525, 0.34);
  addBox(base, gold, 1.04, 0.05, 0.03, 0, 0.045, 0.34);

  const rivetGeo = new THREE.SphereGeometry(0.02, 6, 5);
  for (const y of [0.525, 0.045]) {
    for (const x of [-0.33, -0.11, 0.11, 0.33]) {
      const rivet = new THREE.Mesh(rivetGeo, gold);
      rivet.position.set(x, y, 0.355);
      base.add(rivet);
    }
  }

  addBox(base, gold, 0.18, 0.2, 0.05, 0, 0.4, 0.352);
  addBox(base, dark, 0.04, 0.07, 0.02, 0, 0.41, 0.379);

  for (const x of [-0.42, 0.42]) {
    for (const z of [-0.28, 0.28]) {
      addBox(base, gold, 0.09, 0.06, 0.09, x, -0.03, z);
    }
  }

  const coinGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.015, 12);
  const coins = [
    [-0.3, 0.56, 0.4, 1.35, 0.2, 0.15],
    [-0.12, 0.58, 0.42, 1.5, -0.3, -0.2],
    [0.08, 0.57, 0.41, 1.4, 0.5, 0.3],
    [0.26, 0.555, 0.4, 1.55, -0.15, 0.4],
    [0.4, 0.53, 0.38, 1.3, 0.1, -0.5],
    [-0.44, 0.52, 0.36, 1.45, -0.4, 0.2],
  ];
  for (const [x, y, z, rx, ry, rz] of coins) {
    const coin = new THREE.Mesh(coinGeo, gold);
    coin.position.set(x, y, z);
    coin.rotation.set(rx, ry, rz);
    base.add(coin);
  }

  const gemGeo = new THREE.OctahedronGeometry(0.045, 0);
  const gems = [
    [-0.02, 0.565, 0.44, 0.3, 0.4],
    [0.17, 0.55, 0.445, -0.2, 0.8],
    [-0.2, 0.555, 0.445, 0.5, -0.6],
  ];
  gems.forEach(([x, y, z, rx, rz], i) => {
    const gemMat = new THREE.MeshStandardMaterial({
      color: GEM_COLORS[i % GEM_COLORS.length],
      roughness: 0.25,
      metalness: 0.3,
      flatShading: true,
    });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    gem.position.set(x, y, z);
    gem.rotation.set(rx, 0, rz);
    base.add(gem);
  });

  group.add(base);

  const lid = new THREE.Group();
  lid.name = "lid";
  lid.position.set(0, 0.55, -0.34);

  const vaultGeo = new THREE.CylinderGeometry(
    0.36, 0.36, 1.02, 14, 1, false, Math.PI / 2, Math.PI
  );
  vaultGeo.rotateX(Math.PI / 2);
  vaultGeo.rotateY(Math.PI / 2);
  const vault = new THREE.Mesh(vaultGeo, shellWood);
  vault.position.set(0, 0, 0.34);
  lid.add(vault);

  addBox(lid, wood, 1.02, 0.06, 0.72, 0, -0.01, 0.34);

  const hoopGeo = new THREE.TorusGeometry(0.365, 0.02, 6, 12, Math.PI);
  hoopGeo.rotateY(Math.PI / 2);
  for (const x of [-0.3, 0.3]) {
    const hoop = new THREE.Mesh(hoopGeo, gold);
    hoop.position.set(x, 0, 0.34);
    lid.add(hoop);
  }

  addBox(lid, gold, 1.06, 0.06, 0.05, 0, 0, 0.7);

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
  // USDZExporter.parseAsync trả Promise<Uint8Array> (parse là bản callback)
  return Buffer.from(await new USDZExporter().parseAsync(object));
}

mkdirSync(outDir, { recursive: true });

let totalKb = 0;
let overBudget = false;

for (const t of TIERS) {
  const obj = buildChest(t.colorHex);
  const glb = await exportGLB(obj);

  // USDZ không diễn đạt được DoubleSide — ép FrontSide SAU khi export GLB
  // (GLB giữ DoubleSide cho lòng vòm nắp; thứ tự này không được đổi)
  obj.traverse((o) => {
    if (o.isMesh && o.material && o.material.side !== THREE.FrontSide) {
      o.material.side = THREE.FrontSide;
    }
  });
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
