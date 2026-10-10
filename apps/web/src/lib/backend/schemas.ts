import { z } from "zod";

const nullableDate = z.string().datetime({ offset: true }).nullable().optional();
const metadata = z.record(z.string(), z.unknown()).default({});

export const resourceSchemas = {
  posts: z.object({
    title: z.string().trim().min(1).max(160),
    body: z.string().trim().max(10000).default(""),
    status: z.enum(["draft", "scheduled", "publishing", "published", "failed"]).default("draft"),
    scheduled_at: nullableDate,
    channel_keys: z.array(z.string().min(1).max(40)).max(12).default([]),
    metadata,
  }),
  assets: z.object({
    title: z.string().trim().min(1).max(160),
    kind: z.enum(["image", "video", "document"]),
    storage_path: z.string().trim().min(1).max(1000),
    mime_type: z.string().trim().min(1).max(120),
    bytes: z.number().int().nonnegative().max(2_000_000_000),
    width: z.number().int().positive().nullable().optional(),
    height: z.number().int().positive().nullable().optional(),
    metadata,
  }),
  series: z.object({
    name: z.string().trim().min(1).max(160),
    description: z.string().trim().max(2000).default(""),
    cadence: z.enum(["daily", "weekly", "biweekly", "monthly", "custom"]),
    channel_keys: z.array(z.string().min(1).max(40)).max(12).default([]),
    next_run_at: nullableDate,
    active: z.boolean().default(true),
    metadata,
  }),
  ads: z.object({
    name: z.string().trim().min(1).max(160),
    provider: z.string().trim().min(1).max(40),
    status: z.enum(["draft", "active", "paused", "completed"]).default("draft"),
    budget: z.number().nonnegative().max(100_000_000).default(0),
    currency: z.string().length(3).default("TRY"),
    starts_at: nullableDate,
    ends_at: nullableDate,
    metrics: metadata,
  }),
  notifications: z.object({
    category: z.enum(["ai", "inbox", "schedule", "series", "system"]),
    title: z.string().trim().min(1).max(160),
    body: z.string().trim().max(1000).default(""),
    read_at: nullableDate,
    target: z.string().trim().max(120).nullable().optional(),
    metadata,
  }),
  conversations: z.object({
    social_account_id: z.string().uuid().nullable().optional(),
    external_id: z.string().trim().max(255).nullable().optional(),
    participant_name: z.string().trim().min(1).max(160),
    participant_handle: z.string().trim().max(160).default(""),
    participant_avatar_url: z.string().url().nullable().optional(),
    status: z.enum(["active", "archived", "spam"]).default("active"),
    metadata,
  }),
  opportunities: z.object({
    conversation_id: z.string().uuid().nullable().optional(),
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().max(2000).default(""),
    suggested_at: nullableDate,
    channel_keys: z.array(z.string().min(1).max(40)).max(12).default([]),
    status: z.enum(["suggested", "accepted", "dismissed"]).default("suggested"),
    metadata,
  }),
} as const;

export type ResourceName = keyof typeof resourceSchemas;

export const resourceConfig: Record<ResourceName, { table: string; order: string }> = {
  posts: { table: "posts", order: "updated_at" },
  assets: { table: "media_assets", order: "created_at" },
  series: { table: "series", order: "updated_at" },
  ads: { table: "campaigns", order: "updated_at" },
  notifications: { table: "notifications", order: "created_at" },
  conversations: { table: "conversations", order: "last_message_at" },
  opportunities: { table: "content_opportunities", order: "created_at" },
};

export const messageSchema = z.object({
  body: z.string().trim().min(1).max(10000),
  direction: z.enum(["inbound", "outbound"]).default("outbound"),
  kind: z.enum(["text", "image", "video", "file"]).default("text"),
  metadata,
});

export const socialAccountSchema = z.object({
  provider: z.enum(["instagram", "threads", "linkedin", "facebook", "bluesky", "substack", "youtube", "tiktok", "mastodon", "pinterest", "google_business", "twitter"]),
  display_name: z.string().trim().min(1).max(160),
  external_account_id: z.string().trim().max(255).nullable().optional(),
  credential: z.string().trim().min(8).max(10000),
  metadata,
});

export const workspaceSettingsSchema = z.object({
  workspace_name: z.string().trim().min(2).max(120).optional(),
  brand: z.object({
    tone: z.string().trim().max(120),
    audience: z.string().trim().max(500),
    description: z.string().trim().max(3000),
    preferred_phrases: z.array(z.string().trim().max(120)).max(40),
    avoided_phrases: z.array(z.string().trim().max(120)).max(40),
    require_calendar_approval: z.boolean(),
  }).optional(),
  notifications: z.object({
    email: z.boolean(),
    browser: z.boolean(),
    ai_opportunities: z.boolean(),
    publishing: z.boolean(),
  }).optional(),
});

