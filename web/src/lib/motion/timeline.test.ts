import { describe, expect, it, vi, beforeEach } from "vitest";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createChapter } from "./timeline";

describe("createChapter", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("mặc định pin: true và end tính theo +=scrubVh*100%", () => {
    const spy = vi.spyOn(ScrollTrigger, "create").mockReturnValue({
      kill: vi.fn(),
    } as unknown as ScrollTrigger);

    const el = {} as Element;
    createChapter(el, { scrubVh: 2 });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger: el,
        pin: true,
        start: "top top",
        end: "+=200%",
        scrub: true,
      }),
    );
  });

  it("khi pin: false thì end là 'bottom top' và pin là false", () => {
    const spy = vi.spyOn(ScrollTrigger, "create").mockReturnValue({
      kill: vi.fn(),
    } as unknown as ScrollTrigger);

    const el = {} as Element;
    createChapter(el, { pin: false });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger: el,
        pin: false,
        end: "bottom top",
        scrub: true,
      }),
    );
  });
});
