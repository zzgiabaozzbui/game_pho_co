import { describe, expect, it } from "vitest";
import { createAdminToken, checkPassword, verifyAdminToken } from "./auth";

describe("admin token", () => {
  it("round-trips valid token", () => {
    const t = createAdminToken("s3cret");
    expect(verifyAdminToken(t, "s3cret")).toBe(true);
  });

  it("rejects wrong secret", () => {
    const t = createAdminToken("s3cret");
    expect(verifyAdminToken(t, "other")).toBe(false);
  });

  it("rejects tampered payload", () => {
    const t = createAdminToken("s3cret");
    const [exp] = t.split(".");
    expect(verifyAdminToken(`${exp}.deadbeef`, "s3cret")).toBe(false);
  });

  it("rejects expired token", () => {
    const past = Date.now() - 13 * 60 * 60 * 1000;
    const t = createAdminToken("s3cret", past);
    expect(verifyAdminToken(t, "s3cret")).toBe(false);
  });

  it("rejects garbage", () => {
    expect(verifyAdminToken("", "s3cret")).toBe(false);
    expect(verifyAdminToken("abc", "s3cret")).toBe(false);
    expect(verifyAdminToken("x.y.z", "s3cret")).toBe(false);
  });
});

describe("checkPassword", () => {
  it("accepts exact match", () => {
    expect(checkPassword("giau-co", "giau-co")).toBe(true);
  });

  it("rejects different password and length", () => {
    expect(checkPassword("wrong", "giau-co")).toBe(false);
    expect(checkPassword("abc", "abcd")).toBe(false);
  });
});
