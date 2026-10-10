import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: { code: "UNAUTHORIZED", message: "Yetkisiz istek." } }, { status: 401 });
  }
  const supabase = createAdminSupabaseClient();
  const now = new Date().toISOString();
  const { data: posts, error } = await supabase.from("posts").select("id, workspace_id, channel_keys").eq("status", "scheduled").lte("scheduled_at", now).limit(100);
  if (error) return Response.json({ error: { code: "DATABASE_ERROR", message: "Planlı gönderiler okunamadı." } }, { status: 500 });
  let queued = 0;
  for (const post of posts ?? []) {
    if (!post.channel_keys?.length) {
      await supabase.from("posts").update({ status: "failed", metadata: { publish_error: "NO_CHANNEL" } }).eq("id", post.id);
      continue;
    }
    const { data: accounts } = await supabase.from("social_accounts").select("id, provider").eq("workspace_id", post.workspace_id).eq("status", "connected").in("provider", post.channel_keys ?? []);
    if (!accounts?.length) {
      await supabase.from("posts").update({ status: "failed", metadata: { publish_error: "NO_CONNECTED_CHANNEL" } }).eq("id", post.id);
      continue;
    }
    const { error: queueError } = await supabase.from("publication_jobs").upsert(accounts.map((account) => ({ workspace_id: post.workspace_id, post_id: post.id, social_account_id: account.id, status: "queued", next_attempt_at: now })), { onConflict: "post_id,social_account_id" });
    if (!queueError) {
      await supabase.from("posts").update({ status: "publishing" }).eq("id", post.id).eq("status", "scheduled");
      queued += accounts.length;
    }
  }
  return Response.json({ data: { scanned: posts?.length ?? 0, queued } });
}
