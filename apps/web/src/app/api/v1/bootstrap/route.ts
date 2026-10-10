import { requireWorkspace } from "@/lib/backend/auth";
import { ApiError, jsonError, jsonOk } from "@/lib/backend/http";
import { connection } from "next/server";

export async function GET() {
  await connection();
  try {
    const { supabase, workspaceId, user, workspace, role } = await requireWorkspace();
    const [profile, conversations, posts, assets, opportunities, series, campaigns, notifications, accounts, analytics, brand, usage, creators, follows] = await Promise.all([
      supabase.from("profiles").select("full_name, avatar_url, locale").eq("id", user.id).single(),
      supabase.from("conversations").select("*").eq("workspace_id", workspaceId).order("last_message_at", { ascending: false }).limit(30),
      supabase.from("posts").select("*").eq("workspace_id", workspaceId).order("updated_at", { ascending: false }).limit(50),
      supabase.from("media_assets").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(50),
      supabase.from("content_opportunities").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(30),
      supabase.from("series").select("*").eq("workspace_id", workspaceId).order("updated_at", { ascending: false }).limit(30),
      supabase.from("campaigns").select("*").eq("workspace_id", workspaceId).order("updated_at", { ascending: false }).limit(30),
      supabase.from("notifications").select("*").eq("workspace_id", workspaceId).or(`user_id.is.null,user_id.eq.${user.id}`).order("created_at", { ascending: false }).limit(30),
      supabase.from("social_accounts").select("id, provider, display_name, external_account_id, status, metadata, last_synced_at, created_at").eq("workspace_id", workspaceId).order("created_at"),
      supabase.from("analytics_daily").select("day, impressions, reach, engagements, followers, clicks, social_account_id").eq("workspace_id", workspaceId).order("day", { ascending: false }).limit(90),
      supabase.from("brand_profiles").select("*").eq("workspace_id", workspaceId).single(),
      supabase.from("usage_counters").select("*").eq("workspace_id", workspaceId).order("period_start", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("creator_profiles").select("*, creator_templates(*)").order("follower_count", { ascending: false }).limit(30),
      supabase.from("creator_follows").select("creator_id").eq("workspace_id", workspaceId),
    ]);
    const failed = [profile, conversations, posts, assets, opportunities, series, campaigns, notifications, accounts, analytics, brand, usage, creators, follows].find((result) => result.error);
    if (failed?.error) throw new ApiError(500, "Çalışma alanı verileri yüklenemedi.");
    return jsonOk({
      user: { id: user.id, email: user.email, ...profile.data }, workspace, role,
      conversations: conversations.data, posts: posts.data, assets: assets.data,
      opportunities: opportunities.data, series: series.data, campaigns: campaigns.data,
      notifications: notifications.data, accounts: accounts.data, analytics: analytics.data,
      brand: brand.data, usage: usage.data,
      creators: creators.data, followed_creator_ids: follows.data?.map((item) => item.creator_id) ?? [],
    });
  } catch (error) { return jsonError(error); }
}
