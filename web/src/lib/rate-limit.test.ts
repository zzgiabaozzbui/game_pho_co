import { describe, expect, it } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  it("allows calls up to the limit inside one window", () => {
    const t = 1_000_000;
    for (let i = 0; i < 5; i++) {
      expect(rateLimit("a", { limit: 5, windowMs: 60_000 }, t).ok).toBe(true);
    }
  });

  it("blocks beyond the limit and reports retry-after", () => {
    const t = 1_000_000;
    for (let i = 0; i < 3; i++) {
      rateLimit("b", { limit: 3, windowMs: 60_000 }, t);
    }
    const blocked = rateLimit("b", { limit: 3, windowMs: 60_000 }, t + 1_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBe(59);
  });

  it("opens a fresh window once the previous one expires", () => {
    const t = 2_000_000;
    for (let i = 0; i < 2; i++) {
      rateLimit("c", { limit: 2, windowMs: 10_000 }, t);
    }
    expect(rateLimit("c", { limit: 2, windowMs: 10_000 }, t + 9_999).ok).toBe(
      false
    );
    expect(rateLimit("c", { limit: 2, windowMs: 10_000 }, t + 10_000).ok).toBe(
      true
    );
  });

  it("isolates different keys", () => {
    const t = 3_000_000;
    rateLimit("d1", { limit: 1, windowMs: 60_000 }, t);
    expect(rateLimit("d1", { limit: 1, windowMs: 60_000 }, t).ok).toBe(false);
    expect(rateLimit("d2", { limit: 1, windowMs: 60_000 }, t).ok).toBe(true);
  });
});
