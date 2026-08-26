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
