export type ThreeModule = typeof import("three");

let threePromise: Promise<ThreeModule> | null = null;

export function loadThree(): Promise<ThreeModule> {
  threePromise ??= import("three").catch((e: unknown) => {
    threePromise = null;
    throw e;
  });
  return threePromise;
}

type GltfLoader = typeof import("three/examples/jsm/loaders/GLTFLoader.js")["GLTFLoader"];

let gltfPromise: Promise<GltfLoader> | null = null;

export function loadGltfLoader(): Promise<GltfLoader> {
  gltfPromise ??= import("three/examples/jsm/loaders/GLTFLoader.js")
    .then((mod) => mod.GLTFLoader)
    .catch((e: unknown) => {
      gltfPromise = null;
      throw e;
    });
  return gltfPromise;
}

// Duck-typing để không cần import tĩnh THREE — dispose geometry/material + texture slots.
const TEXTURE_SLOTS = [
  "map",
  "normalMap",
  "roughnessMap",
  "metalnessMap",
  "aoMap",
  "emissiveMap",
  "alphaMap",
  "specularMap",
  "envMap",
] as const;

type Disposable = { dispose?(): void };

export function disposeThreeObject(root: {
  traverse?: (cb: (o: object) => void) => void;
}): void {
  root.traverse?.((o) => {
    const obj = o as { geometry?: Disposable; material?: unknown };
    obj.geometry?.dispose?.();
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach((raw) => {
      const mat = raw as Disposable &
        Partial<Record<(typeof TEXTURE_SLOTS)[number], Disposable>>;
      mat.dispose?.();
      TEXTURE_SLOTS.forEach((slot) => {
        mat[slot]?.dispose?.();
      });
    });
  });
}

export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
