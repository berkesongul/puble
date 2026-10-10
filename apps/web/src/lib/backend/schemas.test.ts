import { describe, expect, it } from "vitest";
import { messageSchema, resourceSchemas, socialAccountSchema, workspaceSettingsSchema } from "./schemas";

describe("backend validation contracts", () => {
  it("accepts a schedulable post", () => {
    const result = resourceSchemas.posts.parse({ title: "Lansman", body: "Hazırız", channel_keys: ["instagram"] });
    expect(result.status).toBe("draft");
    expect(result.channel_keys).toEqual(["instagram"]);
  });

  it("rejects unknown social providers", () => {
    expect(() => socialAccountSchema.parse({ provider: "unknown", display_name: "X", credential: "12345678" })).toThrow();
  });

  it("rejects empty messages and unsafe oversized settings", () => {
    expect(() => messageSchema.parse({ body: "  " })).toThrow();
    expect(() => workspaceSettingsSchema.parse({ workspace_name: "x" })).toThrow();
  });
});

