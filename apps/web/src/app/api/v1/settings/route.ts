import { requireWorkspace } from "@/lib/backend/auth";
import { ApiError, jsonError, jsonOk, readJson } from "@/lib/backend/http";
import { workspaceSettingsSchema } from "@/lib/backend/schemas";
import { connection } from "next/server";

export async function GET() {
  await connection();
  try {
    const { supabase, workspaceId, user, workspace, role } = await requireWorkspace();
    const [{ data: profile }, { data: brand }, { data: notifications }, { data: usage }] = await Promise.all([
      supabase.from("profiles").select("full_name, avatar_url, locale").eq("id", user.id).single(),
      supabase.from("brand_profiles").select("*").eq("workspace_id", workspaceId).single(),
      supabase.from("notification_preferences").select("*").eq("workspace_id", workspaceId).single(),
      supabase.from("usage_counters").select("*").eq("workspace_id", workspaceId).order("period_start", { ascending: false }).limit(1).maybeSingle(),
    ]);
    return jsonOk({ profile, workspace, role, brand, notifications, usage });
  } catch (error) { return jsonError(error); }
}

export async function PATCH(request: Request) {
  try {
    const { supabase, workspaceId, user, role } = await requireWorkspace();
    const body = workspaceSettingsSchema.parse(await readJson(request));
    if (body.workspace_name) {
      if (!['owner','admin'].includes(role)) throw new ApiError(403, "Çalışma alanı adını yalnızca yöneticiler değiştirebilir.");
      const { error } = await supabase.from("workspaces").update({ name: body.workspace_name }).eq("id", workspaceId);
      if (error) throw new ApiError(400, "Çalışma alanı güncellenemedi.");
    }
    if (body.brand) {
      const { error } = await supabase.from("brand_profiles").update({ ...body.brand, updated_by: user.id }).eq("workspace_id", workspaceId);
      if (error) throw new ApiError(400, "Marka hafızası güncellenemedi.");
    }
    if (body.notifications) {
      const { error } = await supabase.from("notification_preferences").update(body.notifications).eq("workspace_id", workspaceId);
      if (error) throw new ApiError(400, "Bildirim tercihleri güncellenemedi.");
    }
    await supabase.from("audit_logs").insert({ workspace_id: workspaceId, actor_id: user.id, action: "update", entity_type: "settings", metadata: { fields: Object.keys(body) } });
    return jsonOk({ updated: true });
  } catch (error) { return jsonError(error); }
}
