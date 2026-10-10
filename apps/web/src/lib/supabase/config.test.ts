import { afterEach, describe, expect, it } from "vitest";
import { getSupabaseConfig } from "./config";

describe("Supabase environment normalization", () => {
  const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const previousKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = previousKey;
  });

  it("removes REST paths and whitespace from copied dashboard values", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = " https://project.supabase.co/rest/v1/ ";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = " key-value ";
    expect(getSupabaseConfig()).toEqual({ url: "https://project.supabase.co", anonKey: "key-value" });
  });

  it("accepts the canonical project URL", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "key-value";
    expect(getSupabaseConfig().url).toBe("https://project.supabase.co");
  });
});
