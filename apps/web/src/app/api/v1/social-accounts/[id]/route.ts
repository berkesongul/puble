import { z } from "zod";
import { requireWorkspace } from "@/lib/backend/auth";
import { ApiError, jsonError } from "@/lib/backend/http";

export async function DELETE(_request: Request, context: RouteContext<"/api/v1/social-accounts/[id]">) {
  try {
    const { id: rawId } = await context.params;
    const id = z.string().uuid().parse(rawId);
    const { supabase, workspaceId, user } = await requireWorkspace();
    const { data, error } = await supabase.from("social_accounts").delete().eq("id", id).eq("workspace_id", workspaceId).select("id").maybeSingle();
    if (error) throw new ApiError(400, "Hesap bağlantısı kaldırılamadı.");
    if (!data) throw new ApiError(404, "Bağlantı bulunamadı.", "NOT_FOUND");
    await supabase.from("audit_logs").insert({ workspace_id: workspaceId, actor_id: user.id, action: "disconnect", entity_type: "social_account", entity_id: id });
    return new Response(null, { status: 204 });
  } catch (error) { return jsonError(error); }
}
