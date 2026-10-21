import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { USDZExporter } from "three/examples/jsm/exporters/USDZExporter.js";

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
  { key: "common", colorHex: "#a60e29" }, // Royal Crimson Red
  { key: "gold", colorHex: "#bd1432" },   // Imperial Ruby Crimson
  { key: "epic", colorHex: "#7a0c3b" },   // Royal Velvet Wine
  { key: "grand", colorHex: "#1a5e43" },  // Imperial Jade Green
];

const BUDGET_GLB_KB = 150;
const BUDGET_USDZ_KB = 200;
const BUDGET_TOTAL_KB = 1024;

const GOLD_COLOR = 0xf5b800;
const VELVET_COLOR = 0x820618;
const STEEL_COLOR = 0xdde6f0;
const RUBY_COLOR = 0xd91438;
const SAPPHIRE_COLOR = 0x1b55c8;
const EMERALD_COLOR = 0x16a34a;
const PEARL_COLOR = 0xfdfaf2;
const DARK_COLOR = 0x22140a;

function quantize(g, digits = 2) {
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

const weldedOctahedron = (r) => quantize(mergeVertices(new THREE.OctahedronGeometry(r, 0)));

function buildChest(panelColorHex) {
  const parts = [];
  const put = (groupName, mat, geo, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => {
    const g = geo.clone();
    g.deleteAttribute("uv");
    g.applyMatrix4(
      new THREE.Matrix4().compose(
        new THREE.Vector3(x, y, z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
        new THREE.Vector3(1, 1, 1)
      )
    );
    parts.push({ groupName, mat, geo: quantize(g) });
  };

  // ---- Materials --------------------------------------------------------
  const goldMat = new THREE.MeshStandardMaterial({
    color: GOLD_COLOR,
    roughness: 0.22,
    metalness: 0.88,
    emissive: 0x221704,
  });

  const panelMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(panelColorHex),
    roughness: 0.45,
    metalness: 0.08,
  });

  const velvetMat = new THREE.MeshStandardMaterial({
    color: VELVET_COLOR,
    roughness: 0.85,
    metalness: 0.0,
  });
  const velvetDouble = velvetMat.clone();
  velvetDouble.side = THREE.DoubleSide;

  const steelMat = new THREE.MeshStandardMaterial({
    color: STEEL_COLOR,
    roughness: 0.18,
    metalness: 0.95,
  });

  const rubyMat = new THREE.MeshStandardMaterial({
    color: RUBY_COLOR,
    roughness: 0.15,
    metalness: 0.25,
    emissive: 0x4a000a,
    emissiveIntensity: 0.35,
  });

  const sapphireMat = new THREE.MeshStandardMaterial({
    color: SAPPHIRE_COLOR,
    roughness: 0.12,
    metalness: 0.3,
    emissive: 0x081e66,
    emissiveIntensity: 0.4,
  });

  const emeraldMat = new THREE.MeshStandardMaterial({
    color: EMERALD_COLOR,
    roughness: 0.15,
    metalness: 0.25,
    emissive: 0x043810,
    emissiveIntensity: 0.35,
  });

  const pearlMat = new THREE.MeshStandardMaterial({
    color: PEARL_COLOR,
    roughness: 0.22,
    metalness: 0.06,
  });

  const darkMat = new THREE.MeshStandardMaterial({
    color: DARK_COLOR,
    roughness: 0.5,
    metalness: 0.3,
  });

  // =========================================================================
  // 1. BASE STRUCTURE (Hollow Chest Box with Outer Trims & Inset Panels)
  // =========================================================================

  // Inner cavity bottom
  put("base", velvetMat, new THREE.BoxGeometry(0.92, 0.04, 0.58), 0, 0.12, 0);

  // Outer Crimson Panels (Recessed)
  const frontPanelGeo = new THREE.BoxGeometry(0.40, 0.40, 0.015);
  put("base", panelMat, frontPanelGeo, -0.24, 0.29, 0.345);
  put("base", panelMat, frontPanelGeo, 0.24, 0.29, 0.345);
  put("base", panelMat, new THREE.BoxGeometry(0.88, 0.40, 0.015), 0, 0.29, -0.345);

  const sidePanelGeo = new THREE.BoxGeometry(0.015, 0.40, 0.24);
  put("base", panelMat, sidePanelGeo, -0.495, 0.29, -0.14);
  put("base", panelMat, sidePanelGeo, -0.495, 0.29, 0.14);
  put("base", panelMat, sidePanelGeo, 0.495, 0.29, -0.14);
  put("base", panelMat, sidePanelGeo, 0.495, 0.29, 0.14);

  // Gold Heavy Corner Pillars (4 corners)
  const cornerPostGeo = new THREE.BoxGeometry(0.08, 0.48, 0.08);
  for (const x of [-0.47, 0.47]) {
    for (const z of [-0.32, 0.32]) {
      put("base", goldMat, cornerPostGeo, x, 0.29, z);
    }
  }

  // Top Rim Gold Lip (at y = 0.52)
  put("base", goldMat, new THREE.BoxGeometry(1.04, 0.05, 0.06), 0, 0.52, 0.33);
  put("base", goldMat, new THREE.BoxGeometry(1.04, 0.05, 0.06), 0, 0.52, -0.33);
  put("base", goldMat, new THREE.BoxGeometry(0.06, 0.05, 0.64), -0.48, 0.52, 0);
  put("base", goldMat, new THREE.BoxGeometry(0.06, 0.05, 0.64), 0.48, 0.52, 0);

  // Bottom Base Gold Skirting (at y = 0.065)
  put("base", goldMat, new THREE.BoxGeometry(1.04, 0.05, 0.05), 0, 0.065, 0.34);
  put("base", goldMat, new THREE.BoxGeometry(1.04, 0.05, 0.05), 0, 0.065, -0.34);
  put("base", goldMat, new THREE.BoxGeometry(0.05, 0.05, 0.66), -0.485, 0.065, 0);
  put("base", goldMat, new THREE.BoxGeometry(0.05, 0.05, 0.66), 0.485, 0.065, 0);

  // Center Vertical Gold Dividers
  put("base", goldMat, new THREE.BoxGeometry(0.06, 0.42, 0.04), 0, 0.29, 0.345);
  put("base", goldMat, new THREE.BoxGeometry(0.04, 0.42, 0.06), -0.49, 0.29, 0);
  put("base", goldMat, new THREE.BoxGeometry(0.04, 0.42, 0.06), 0.49, 0.29, 0);

  // Royal Scalloped/Curved Gold Feet
  const footBaseGeo = new THREE.BoxGeometry(0.12, 0.06, 0.12);
  for (const x of [-0.45, 0.45]) {
    for (const z of [-0.30, 0.30]) {
      put("base", goldMat, footBaseGeo, x, 0.02, z);
    }
  }

  // Ruby Gem Studs along the Gold Frame
  const rubyStudGeo = weldedOctahedron(0.016);
  const frontStudX = [-0.47, -0.47, -0.47, 0, 0, 0, 0.47, 0.47, 0.47];
  const frontStudY = [0.44, 0.29, 0.14, 0.44, 0.29, 0.14, 0.44, 0.29, 0.14];
  for (let i = 0; i < frontStudX.length; i++) {
    put("base", rubyMat, rubyStudGeo, frontStudX[i], frontStudY[i], 0.365);
  }
  for (const x of [-0.24, 0.24]) {
    put("base", rubyMat, rubyStudGeo, x, 0.52, 0.358);
  }

  // Ornate Gold Lock Escutcheon Plate
  put("base", goldMat, new THREE.BoxGeometry(0.16, 0.18, 0.03), 0, 0.38, 0.365);
  put("base", darkMat, new THREE.BoxGeometry(0.02, 0.06, 0.015), 0, 0.38, 0.38);

  // =========================================================================
  // 2. TREASURE INSIDE THE CHEST (Mound, Coins, Crown, Sword, Cross, Gems)
  // =========================================================================

  // Mounded Base of Gold Treasure
  put("base", goldMat, new THREE.CylinderGeometry(0.44, 0.46, 0.26, 6), 0, 0.38, 0);

  // 3D Gold Coins
  const coinGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.015, 6);
  const coinPlacements = [
    [0.0, 0.53, 0.06, 0.15, 0.2, 0.1],
    [-0.12, 0.54, 0.12, -0.2, 0.4, -0.15],
    [0.14, 0.535, 0.08, 0.1, -0.3, 0.25],
    [-0.24, 0.525, 0.15, 0.3, 0.2, -0.1],
    [0.26, 0.52, 0.14, -0.25, -0.4, 0.18],
    [0.05, 0.56, -0.05, -0.1, 0.15, 0.05],
    [-0.18, 0.55, -0.02, 0.2, -0.2, 0.1],
    [0.20, 0.545, -0.04, -0.15, 0.3, -0.2],

    // Front Rim Overflow
    [-0.38, 0.525, 0.31, 0.6, 0.2, -0.3],
    [-0.22, 0.535, 0.33, 0.7, -0.15, 0.2],
    [-0.08, 0.545, 0.35, 0.5, 0.3, -0.1],
    [0.08, 0.54, 0.36, 0.55, -0.25, 0.15],
    [0.22, 0.53, 0.34, 0.65, 0.2, -0.25],
    [0.36, 0.515, 0.30, 0.8, -0.3, 0.3],

    // Floor Spilled Coins
    [-0.22, 0.015, 0.46, 0.05, 0.5, 0.0],
    [-0.05, 0.015, 0.48, 0.1, -0.3, 0.05],
    [0.15, 0.015, 0.47, 0.08, 0.2, 0.02],
    [0.30, 0.015, 0.44, -0.1, -0.6, 0.05],
  ];

  for (const [x, y, z, rx, ry, rz] of coinPlacements) {
    put("base", goldMat, coinGeo, x, y, z, rx, ry, rz);
  }

  // Gold Bullion Bars
  const barGeo = new THREE.BoxGeometry(0.18, 0.05, 0.08);
  put("base", goldMat, barGeo, -0.28, 0.54, 0.02, 0.1, 0.4, 0.15);
  put("base", goldMat, barGeo, -0.25, 0.58, 0.04, 0.05, 0.25, 0.1);
  put("base", goldMat, barGeo, -0.42, 0.025, 0.42, 0, 0.6, 0);
  put("base", goldMat, barGeo, 0.15, 0.025, 0.52, 0, -0.45, 0);

  // --- Royal Crown ---
  const crownRingGeo = new THREE.CylinderGeometry(0.11, 0.13, 0.06, 6, 1, true);
  const crownBaseX = 0.02, crownBaseY = 0.62, crownBaseZ = 0.10;
  const crownRotX = 0.25, crownRotY = -0.3, crownRotZ = 0.15;
  put("base", goldMat, crownRingGeo, crownBaseX, crownBaseY, crownBaseZ, crownRotX, crownRotY, crownRotZ);

  const crownPeakGeo = new THREE.ConeGeometry(0.025, 0.07, 4);
  const crownGemGeo = weldedOctahedron(0.015);
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const px = Math.cos(angle) * 0.12;
    const pz = Math.sin(angle) * 0.12;
    const peakVec = new THREE.Vector3(px, 0.05, pz).applyEuler(
      new THREE.Euler(crownRotX, crownRotY, crownRotZ)
    );
    put(
      "base",
      goldMat,
      crownPeakGeo,
      crownBaseX + peakVec.x,
      crownBaseY + peakVec.y,
      crownBaseZ + peakVec.z,
      crownRotX,
      crownRotY + angle,
      crownRotZ
    );
    const gemM = i % 2 === 0 ? rubyMat : sapphireMat;
    put(
      "base",
      gemM,
      crownGemGeo,
      crownBaseX + peakVec.x * 0.9,
      crownBaseY + peakVec.y * 0.9,
      crownBaseZ + peakVec.z * 0.9
    );
  }

  // --- Jeweled Sword / Dagger ---
  const bladeGeo = new THREE.BoxGeometry(0.035, 0.36, 0.01);
  const swordX = 0.28, swordY = 0.68, swordZ = 0.04;
  const swordRotX = -0.35, swordRotY = 0.2, swordRotZ = -0.55;
  put("base", steelMat, bladeGeo, swordX - 0.06, swordY - 0.08, swordZ, swordRotX, swordRotY, swordRotZ);

  const guardGeo = new THREE.BoxGeometry(0.12, 0.025, 0.035);
  put("base", goldMat, guardGeo, swordX, swordY + 0.06, swordZ, swordRotX, swordRotY, swordRotZ);

  const gripGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.10, 4);
  put("base", sapphireMat, gripGeo, swordX + 0.04, swordY + 0.11, swordZ, swordRotX, swordRotY, swordRotZ);

  const pommelGeo = weldedOctahedron(0.024);
  put("base", rubyMat, pommelGeo, swordX + 0.08, swordY + 0.17, swordZ, swordRotX, swordRotY, swordRotZ);

  // --- Ornate Golden Cross ---
  const crossVerticalGeo = new THREE.BoxGeometry(0.04, 0.28, 0.03);
  const crossHorizontalGeo = new THREE.BoxGeometry(0.18, 0.04, 0.03);
  const crossX = -0.30, crossY = 0.66, crossZ = 0.08;
  const crossRotX = 0.15, crossRotY = 0.35, crossRotZ = 0.25;
  put("base", goldMat, crossVerticalGeo, crossX, crossY, crossZ, crossRotX, crossRotY, crossRotZ);
  put("base", goldMat, crossHorizontalGeo, crossX, crossY + 0.04, crossZ, crossRotX, crossRotY, crossRotZ);
  put("base", rubyMat, weldedOctahedron(0.026), crossX, crossY + 0.04, crossZ + 0.02, crossRotX, crossRotY, crossRotZ);

  // --- Sapphire Crystal Cluster ---
  const crystalPrismGeo = new THREE.ConeGeometry(0.032, 0.18, 4);
  const crystalPrismGeo2 = new THREE.ConeGeometry(0.026, 0.14, 4);
  const sClustX = 0.14, sClustY = 0.58, sClustZ = 0.16;
  put("base", sapphireMat, crystalPrismGeo, sClustX, sClustY + 0.06, sClustZ, 0.15, 0.2, -0.1);
  put("base", sapphireMat, crystalPrismGeo2, sClustX + 0.035, sClustY + 0.04, sClustZ - 0.02, -0.2, 0.6, 0.3);

  // --- Ruby Crystal Cluster ---
  const rClustX = -0.38, rClustY = 0.54, rClustZ = 0.18;
  put("base", rubyMat, crystalPrismGeo, rClustX, rClustY + 0.05, rClustZ, -0.2, -0.3, 0.4);
  put("base", rubyMat, crystalPrismGeo2, rClustX + 0.03, rClustY + 0.03, rClustZ + 0.03, 0.1, 0.5, 0.2);

  // Loose Cut Gemstones
  put("base", rubyMat, weldedOctahedron(0.032), -0.08, 0.55, 0.25, 0.3, 0.5, 0.1);
  put("base", sapphireMat, weldedOctahedron(0.03), 0.06, 0.56, 0.22, 0.2, -0.4, 0.5);
  put("base", emeraldMat, weldedOctahedron(0.034), -0.18, 0.54, 0.22, -0.3, 0.2, 0.4);
  put("base", emeraldMat, weldedOctahedron(0.028), 0.32, 0.53, 0.20, 0.5, -0.3, 0.2);

  // --- Royal Pearl Necklaces ---
  const pearlSphereGeo = weldedOctahedron(0.016);
  for (let i = 0; i <= 9; i++) {
    const t = i / 9;
    let px, py, pz;
    if (t < 0.35) {
      const subT = t / 0.35;
      px = -0.05 + 0.05 * subT;
      py = 0.56 - 0.04 * subT;
      pz = 0.28 + 0.08 * subT;
    } else {
      const subT = (t - 0.35) / 0.65;
      const angle = subT * Math.PI;
      px = 0.0 + 0.10 * Math.cos(angle);
      py = 0.52 - 0.24 * Math.sin(angle);
      pz = 0.365;
    }
    put("base", pearlMat, pearlSphereGeo, px, py, pz);
  }

  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    const px = -0.35 + 0.12 * Math.cos(angle);
    const pz = 0.50 + 0.08 * Math.sin(angle);
    put("base", pearlMat, pearlSphereGeo, px, 0.012, pz);
  }

  // --- Ornate Golden Key ---
  const keyStemGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.20, 4);
  const keyX = -0.22, keyY = 0.015, keyZ = 0.52;
  put("base", goldMat, keyStemGeo, keyX, keyY, keyZ, Math.PI / 2, 0, 0.45);
  put("base", sapphireMat, weldedOctahedron(0.024), keyX - 0.07, keyY, keyZ - 0.07);
  put("base", goldMat, new THREE.BoxGeometry(0.03, 0.04, 0.015), keyX + 0.07, keyY, keyZ + 0.07, 0, 0.45, 0);

  // =========================================================================
  // 3. LID STRUCTURE (Arched Vault with Royal Velvet Lining & Gold Ribs)
  // =========================================================================

  const vaultOuterGeo = new THREE.CylinderGeometry(
    0.35, 0.35, 1.04, 8, 1, false, Math.PI / 2, Math.PI
  );
  vaultOuterGeo.rotateX(Math.PI / 2);
  vaultOuterGeo.rotateY(Math.PI / 2);
  put("lid", panelMat, vaultOuterGeo, 0, 0, 0.33);

  const vaultInnerGeo = new THREE.CylinderGeometry(
    0.335, 0.335, 1.00, 8, 1, false, Math.PI / 2, Math.PI
  );
  vaultInnerGeo.rotateX(Math.PI / 2);
  vaultInnerGeo.rotateY(Math.PI / 2);
  put("lid", velvetDouble, vaultInnerGeo, 0, 0, 0.33);

  const endCapGeo = new THREE.CircleGeometry(0.35, 6, 0, Math.PI);
  endCapGeo.rotateY(-Math.PI / 2);
  put("lid", panelMat, endCapGeo, -0.52, 0, 0.33);
  const endCapRightGeo = new THREE.CircleGeometry(0.35, 6, 0, Math.PI);
  endCapRightGeo.rotateY(Math.PI / 2);
  put("lid", panelMat, endCapRightGeo, 0.52, 0, 0.33);

  put("lid", velvetMat, endCapGeo, -0.505, 0, 0.33);
  put("lid", velvetMat, endCapRightGeo, 0.505, 0, 0.33);

  put("lid", goldMat, new THREE.BoxGeometry(1.06, 0.05, 0.05), 0, 0.015, 0.67);
  put("lid", goldMat, new THREE.BoxGeometry(1.06, 0.05, 0.05), 0, 0.015, -0.01);
  put("lid", goldMat, new THREE.BoxGeometry(0.05, 0.05, 0.68), -0.52, 0.015, 0.33);
  put("lid", goldMat, new THREE.BoxGeometry(0.05, 0.05, 0.68), 0.52, 0.015, 0.33);

  const hoopGeo = new THREE.TorusGeometry(0.355, 0.02, 3, 6, Math.PI);
  hoopGeo.rotateY(Math.PI / 2);

  for (const x of [-0.42, 0, 0.42]) {
    put("lid", goldMat, hoopGeo, x, 0, 0.33);

    for (const deg of [45, 90, 135]) {
      const rad = (deg * Math.PI) / 180;
      const sy = 0.355 * Math.sin(rad);
      const sz = 0.33 - 0.355 * Math.cos(rad);
      put("lid", rubyMat, rubyStudGeo, x, sy, sz);
    }
  }

  for (let i = 0; i <= 7; i++) {
    const t = i / 7;
    const angle = t * Math.PI;
    const px = 0.22 + 0.12 * Math.cos(angle);
    const py = 0.18 - 0.22 * Math.sin(angle);
    const pz = 0.30;
    put("lid", pearlMat, pearlSphereGeo, px, py, pz);
  }

  put("lid", goldMat, new THREE.BoxGeometry(0.12, 0.08, 0.04), 0, 0.01, 0.685);
  put("lid", rubyMat, weldedOctahedron(0.022), 0, 0.01, 0.71);

  // =========================================================================
  // 4. MERGE BY (GROUP, MATERIAL)
  // =========================================================================
  const groups = {
    base: new THREE.Group(),
    lid: new THREE.Group(),
  };
  groups.base.name = "base";
  groups.lid.name = "lid";
  groups.lid.position.set(0, 0.52, -0.33);

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
  const orig = Number.prototype.toPrecision;
  Number.prototype.toPrecision = function (precision) {
    const s = orig.call(this, precision);
    return s.includes("e") || s.includes("E") ? s : String(Number(s));
  };
  try {
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
