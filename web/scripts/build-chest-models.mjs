import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
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
  { key: "common", colorHex: "#9a3b2b" },
  { key: "gold", colorHex: "#c9962b" },
  { key: "epic", colorHex: "#b3122e" },
  { key: "grand", colorHex: "#1f5c46" },
];

const BUDGET_GLB_KB = 150;
const BUDGET_USDZ_KB = 200;
const BUDGET_TOTAL_KB = 1024;

const GOLD_HEX = 0xf0c33c;
const VELVET_HEX = 0x7e1220;
const GEM_COLORS = [
  { color: 0xd81b4a }, // ruby
  { color: 0x1fae55 }, // emerald
  { color: 0x2b5fb8 }, // sapphire
];

// Toàn bộ hình học đi qua put(): bake transform vào geometry rồi gom theo
// (group, material). Merge cuối làm số mesh xuất ra đếm bằng ngón tay — USDZ
// tính overhead theo prim nên ~90 mesh rời đã đẩy file vượt ngân sách 3 lần.
// USDZ viết điểm/pháp tuyến dạng văn bản nên số lẻ dài ("0.46499999999999997")
// đốt ngân sách vô ích — làm tròn 3 số thập phân (độ chính xác dưới milimet).
function quantize(g, digits = 3) {
  const f = Math.pow(10, digits);
  const attr = g.attributes.normal;
  if (attr) {
    for (let i = 0; i < attr.count; i++) {
      let x = attr.getX(i), y = attr.getY(i), z = attr.getZ(i);
      const len = Math.hypot(x, y, z) || 1;
      x = Math.round((x / len) * f) / f;
      y = Math.round((y / len) * f) / f;
      z = Math.round((z / len) * f) / f;
      attr.setXYZ(i, x, y, z);
    }
  }
  const pos = g.attributes.position;
  for (let i = 0; i < pos.array.length; i++) {
    pos.array[i] = Math.round(pos.array[i] * f) / f;
  }
  return g;
}

// OctahedronGeometry không có index — hàn vertex để merge được với phần còn lại.
const weldedOctahedron = (r) => quantize(mergeVertices(new THREE.OctahedronGeometry(r, 0)));

function buildChest(colorHex) {
  const parts = [];
  const put = (groupName, mat, geo, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => {
    const g = geo.clone();
    g.deleteAttribute("uv"); // không dùng texture — bỏ uv để nhẹ và hàn vertex tốt hơn
    g.applyMatrix4(
      new THREE.Matrix4().compose(
        new THREE.Vector3(x, y, z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
        new THREE.Vector3(1, 1, 1)
      )
    );
    parts.push({ groupName, mat, geo: quantize(g) });
  };

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
    roughness: 0.28,
    metalness: 0.85,
    flatShading: true,
    emissive: 0x1a1206,
  });
  const velvet = new THREE.MeshStandardMaterial({
    color: VELVET_HEX,
    roughness: 0.9,
    metalness: 0,
  });
  const velvetDouble = velvet.clone();
  velvetDouble.side = THREE.DoubleSide;
  const dark = new THREE.MeshStandardMaterial({
    color: 0x2a1a10,
    roughness: 0.6,
    metalness: 0.2,
    flatShading: true,
  });

  // ---- base -------------------------------------------------------------
  // Thân là box thường + nan góc vàng có sẵn: RoundedBox(seg2) tốn ~900 vertex,
  // đẩy USDZ (ASCII) vượt ngân sách — phương án chamfer bằng khung góc được
  // spec chấp nhận thay thế.
  put("base", wood, new THREE.BoxGeometry(1.0, 0.55, 0.68), 0, 0.275, 0);

  const postGeo = new THREE.BoxGeometry(0.07, 0.56, 0.07);
  for (const x of [-0.465, 0.465]) {
    for (const z of [-0.305, 0.305]) {
      put("base", gold, postGeo, x, 0.275, z);
    }
  }

  const edgeGeo = new THREE.BoxGeometry(1.04, 0.05, 0.03);
  put("base", gold, edgeGeo, 0, 0.525, 0.34);
  put("base", gold, edgeGeo, 0, 0.045, 0.34);

  const rivetGeo = new THREE.SphereGeometry(0.02, 5, 4);
  for (const y of [0.525, 0.045]) {
    for (const x of [-0.33, -0.11, 0.11, 0.33]) {
      put("base", gold, rivetGeo, x, y, 0.355);
    }
  }

  // Ổ khóa then: tấm lớn + then đứng + lỗ tròn + 2 đinh tán nhỏ
  put("base", gold, new THREE.BoxGeometry(0.2, 0.24, 0.05), 0, 0.4, 0.352);
  put("base", dark, new THREE.BoxGeometry(0.04, 0.06, 0.02), 0, 0.395, 0.379);
  put(
    "base",
    dark,
    new THREE.CylinderGeometry(0.026, 0.026, 0.012, 12),
    0, 0.442, 0.379,
    Math.PI / 2, 0, 0
  );
  const lockStudGeo = new THREE.SphereGeometry(0.014, 5, 4);
  for (const x of [-0.07, 0.07]) {
    put("base", gold, lockStudGeo, x, 0.485, 0.379);
  }

  const footGeo = new THREE.BoxGeometry(0.09, 0.06, 0.09);
  for (const x of [-0.42, 0.42]) {
    for (const z of [-0.28, 0.28]) {
      put("base", gold, footGeo, x, -0.03, z);
    }
  }

  // Xu tràn ra miệng trước (giữ nguyên từ pass redesign)
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
    put("base", gold, coinGeo, x, y, z, rx, ry, rz);
  }

  const gemGeo = weldedOctahedron(0.045);
  const gems = [
    [-0.02, 0.565, 0.44, 0.3, 0.4],
    [0.17, 0.55, 0.445, -0.2, 0.8],
    [-0.2, 0.555, 0.445, 0.5, -0.6],
  ];
  gems.forEach(([x, y, z, rx, rz], i) => {
    const gemMat = new THREE.MeshStandardMaterial({
      color: GEM_COLORS[i % GEM_COLORS.length].color,
      roughness: 0.25,
      metalness: 0.3,
      flatShading: true,
    });
    put("base", gemMat, gemGeo, x, y, z, rx, 0, rz);
  });

  // Kho báu đắp trong rương: thân nhô vừa phải trên miệng rương (y=0.55,
  // đáy thân gỗ đặc — chôn xuống dưới sẽ vô hình), đỉnh ≤ ~0.67 « đỉnh vòm
  // 0.91 nên lúc đóng nắp vẫn kín hoàn toàn bên trong vòm.
  const pileRadii = [0.06, 0.052, 0.045];
  const coinPileGeos = pileRadii.map(
    (r) => new THREE.CylinderGeometry(r, r, 0.012, 12)
  );
  const coinPile = [
    [-0.3, 0.545, 0.1, 0.1, -0.08, 0],
    [-0.14, 0.552, 0.02, -0.06, 0.09, 1],
    [0.02, 0.548, 0.12, 0.08, 0.05, 2],
    [0.15, 0.558, 0.04, -0.05, -0.07, 0],
    [0.3, 0.545, 0.14, 0.07, 0.06, 1],
    [-0.22, 0.585, 0.18, 0.12, -0.1, 1],
    [-0.04, 0.592, 0.2, -0.09, 0.08, 0],
    [0.1, 0.588, 0.15, 0.06, -0.06, 2],
    [0.24, 0.575, 0.22, -0.08, 0.1, 0],
    [-0.38, 0.535, 0.02, 0.05, -0.05, 1],
    [0.38, 0.54, 0.04, -0.06, 0.07, 2],
    [0.03, 0.615, 0.08, 0.1, 0.12, 0],
    [-0.12, 0.528, -0.08, 0.04, 0.06, 0],
    [0.2, 0.524, -0.1, -0.05, -0.04, 1],
  ];
  for (const [x, y, z, rx, rz, gi] of coinPile) {
    put("base", gold, coinPileGeos[gi], x, y, z, rx, 0, rz);
  }

  const barGeo = new THREE.BoxGeometry(0.16, 0.045, 0.07);
  put("base", gold, barGeo, -0.26, 0.575, -0.1, 0, 0.35, 0.26);
  put("base", gold, barGeo, -0.245, 0.622, -0.09, 0, 0.28, 0.26);

  const clusterGemGeo = weldedOctahedron(0.035);
  const clusters = [
    {
      mat: GEM_COLORS[0],
      at: [-0.33, 0.56, 0.18],
      offsets: [
        [0, 0, 0],
        [0.05, 0.02, 0.03],
        [0.015, -0.005, -0.05],
      ],
    },
    {
      mat: GEM_COLORS[1],
      at: [0.07, 0.59, 0.22],
      offsets: [
        [0, 0, 0],
        [0.045, 0.015, -0.03],
        [-0.04, 0.01, 0.02],
      ],
    },
    {
      mat: GEM_COLORS[2],
      at: [0.32, 0.56, 0.08],
      offsets: [
        [0, 0, 0],
        [0.04, 0.02, 0.04],
      ],
    },
  ];
  for (const { mat, at, offsets } of clusters) {
    const clusterMat = new THREE.MeshStandardMaterial({
      color: mat.color,
      roughness: 0.15,
      metalness: 0.3,
      flatShading: true,
      emissive: mat.color,
      emissiveIntensity: 0.25,
    });
    offsets.forEach(([dx, dy, dz], i) => {
      put(
        "base",
        clusterMat,
        clusterGemGeo,
        at[0] + dx, at[1] + dy, at[2] + dz,
        i * 0.9, i * 0.7, i * 0.5
      );
    });
  }

  // Chuỗi ngọc trai vắt qua mép trước đống xu
  const pearlGeo = new THREE.SphereGeometry(0.018, 5, 3);
  const pearlMat = new THREE.MeshStandardMaterial({
    color: 0xf5efe6,
    roughness: 0.25,
    metalness: 0,
  });
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const dip = Math.sin(Math.PI * t);
    put("base", pearlMat, pearlGeo, -0.15 + 0.3 * t, 0.605 - 0.055 * dip, 0.225 + 0.1 * dip);
  }

  // ---- lid --------------------------------------------------------------
  const vaultGeo = new THREE.CylinderGeometry(
    0.36, 0.36, 1.02, 24, 1, false, Math.PI / 2, Math.PI
  );
  vaultGeo.rotateX(Math.PI / 2);
  vaultGeo.rotateY(Math.PI / 2);
  put("lid", shellWood, vaultGeo, 0, 0, 0.34);

  // Lòng nhung đỏ: vòm lót sát mặt trong + tấm đáy nắp (thấy khi mở nắp)
  const vaultInnerGeo = new THREE.CylinderGeometry(
    0.345, 0.345, 0.98, 24, 1, false, Math.PI / 2, Math.PI
  );
  vaultInnerGeo.rotateX(Math.PI / 2);
  vaultInnerGeo.rotateY(Math.PI / 2);
  put("lid", velvetDouble, vaultInnerGeo, 0, 0, 0.34);

  put("lid", wood, new THREE.BoxGeometry(1.02, 0.06, 0.72), 0, -0.01, 0.34);
  put("lid", velvet, new THREE.BoxGeometry(0.94, 0.02, 0.62), 0, -0.045, 0.34);

  const hoopGeo = new THREE.TorusGeometry(0.365, 0.02, 4, 8, Math.PI);
  hoopGeo.rotateY(Math.PI / 2);
  const hoopStudGeo = new THREE.SphereGeometry(0.022, 5, 3);
  for (const x of [-0.32, 0, 0.32]) {
    put("lid", gold, hoopGeo, x, 0, 0.34);
    for (const deg of [45, 75, 105, 135]) {
      const a = (deg * Math.PI) / 180;
      put("lid", gold, hoopStudGeo, x, 0.365 * Math.sin(a), 0.34 - 0.365 * Math.cos(a));
    }
  }

  put("lid", gold, new THREE.BoxGeometry(1.06, 0.06, 0.05), 0, 0, 0.7);

  // ---- merge theo (group, material) --------------------------------------
  const groups = {
    base: new THREE.Group(),
    lid: new THREE.Group(),
  };
  groups.base.name = "base";
  groups.lid.name = "lid";
  groups.lid.position.set(0, 0.55, -0.34);

  const buckets = new Map();
  for (const p of parts) {
    const key = `${p.groupName}:${p.mat.uuid}`;
    if (!buckets.has(key)) buckets.set(key, { groupName: p.groupName, mat: p.mat, geos: [] });
    buckets.get(key).geos.push(p.geo);
  }
  for (const { groupName, mat, geos } of buckets.values()) {
    const merged =
      geos.length === 1 ? geos[0] : mergeVertices(mergeGeometries(geos, false), 1e-4);
    groups[groupName].add(new THREE.Mesh(merged, mat));
  }

  const group = new THREE.Group();
  group.add(groups.base);
  group.add(groups.lid);
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
  // USDZExporter viết số qua toPrecision(7) mà không cắt số 0 đuôi
  // ("0.545" thành "0.5450000") — đội size ASCII ~40%. Bọc tạm bản ghi
  // trim-zero quanh lúc xuất (giá trị giữ nguyên, chỉ rút gọn chuỗi).
  const orig = Number.prototype.toPrecision;
  Number.prototype.toPrecision = function (precision) {
    const s = orig.call(this, precision);
    return s.includes("e") || s.includes("E") ? s : String(Number(s));
  };
  try {
    // USDZExporter.parseAsync trả Promise<Uint8Array> (parse là bản callback)
    return Buffer.from(await new USDZExporter().parseAsync(object));
  } finally {
    Number.prototype.toPrecision = orig;
  }
}

mkdirSync(outDir, { recursive: true });

let totalKb = 0;
let overBudget = false;

for (const t of TIERS) {
  const obj = buildChest(t.colorHex);
  const glb = await exportGLB(obj);

  // USDZ không diễn đạt được DoubleSide — ép FrontSide SAU khi export GLB
  // (GLB giữ DoubleSide cho lòng vòm nắp; thứ tự này không được đổi).
  // USDZ cũng viết pháp tuyến dạng văn bản (đắt nhất file) — bỏ trước khi
  // xuất: viewer AR sẽ shade phẳng, trùng đúng thẩm mỹ flatShading của model.
  obj.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    if (o.material.side !== THREE.FrontSide) o.material.side = THREE.FrontSide;
    if (o.geometry.attributes.normal) o.geometry.deleteAttribute("normal");
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
