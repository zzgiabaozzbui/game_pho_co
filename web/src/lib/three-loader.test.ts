import { describe, expect, it, vi } from "vitest";
import { disposeThreeObject } from "./three-loader";

describe("disposeThreeObject", () => {
  it("không ném với node thiếu material và vẫn dispose material + texture slots", () => {
    const materialDispose = vi.fn();
    const mapDispose = vi.fn();
    const nodes: object[] = [
      {},
      {
        material: { dispose: materialDispose, map: { dispose: mapDispose } },
      },
    ];
    const root = { traverse: (cb: (o: object) => void) => nodes.forEach(cb) };

    expect(() => disposeThreeObject(root)).not.toThrow();
    expect(materialDispose).toHaveBeenCalledTimes(1);
    expect(mapDispose).toHaveBeenCalledTimes(1);
  });
});
