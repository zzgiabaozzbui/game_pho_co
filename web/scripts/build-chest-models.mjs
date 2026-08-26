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
  // USDZExporter.parseAsync trả Promise<Uint8Array> (parse là bản callback)
  return Buffer.from(await new USDZExporter().parseAsync(object));
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
