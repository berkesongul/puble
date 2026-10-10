import { afterEach, describe, expect, it } from "vitest";
import { decryptCredential, encryptCredential } from "./crypto";

describe("credential encryption", () => {
  const previous = process.env.PUBLE_CREDENTIALS_SECRET;
  afterEach(() => { process.env.PUBLE_CREDENTIALS_SECRET = previous; });

  it("round-trips without exposing plaintext", () => {
    process.env.PUBLE_CREDENTIALS_SECRET = "test-secret-that-is-definitely-longer-than-32-characters";
    const plaintext = "provider-access-token";
    const encrypted = encryptCredential(plaintext);
    expect(encrypted).not.toContain(plaintext);
    expect(decryptCredential(encrypted)).toBe(plaintext);
  });

  it("requires a strong server secret", () => {
    process.env.PUBLE_CREDENTIALS_SECRET = "short";
    expect(() => encryptCredential("secret-token")).toThrow(/yapılandırılmamış/);
  });
});
