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
