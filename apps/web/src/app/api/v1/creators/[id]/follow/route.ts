import { z } from "zod";
import { requireWorkspace } from "@/lib/backend/auth";
import { ApiError, jsonError, jsonOk } from "@/lib/backend/http";

export async function POST(_request: Request, context: RouteContext<"/api/v1/creators/[id]/follow">) {
  try {
    const { id: rawId } = await context.params;
    const creatorId = z.string().uuid().parse(rawId);
    const { supabase, workspaceId, user } = await requireWorkspace();
    const { data: creator } = await supabase.from("creator_profiles").select("id").eq("id", creatorId).maybeSingle();
    if (!creator) throw new ApiError(404, "Kreatör bulunamadı.", "NOT_FOUND");
    const { error } = await supabase.from("creator_follows").upsert({ workspace_id: workspaceId, creator_id: creatorId, followed_by: user.id });
    if (error) throw new ApiError(400, "Kreatör takip edilemedi.");
    return jsonOk({ following: true });
  } catch (error) { return jsonError(error); }
}

export async function DELETE(_request: Request, context: RouteContext<"/api/v1/creators/[id]/follow">) {
  try {
    const { id: rawId } = await context.params;
    const creatorId = z.string().uuid().parse(rawId);
    const { supabase, workspaceId } = await requireWorkspace();
    const { error } = await supabase.from("creator_follows").delete().eq("workspace_id", workspaceId).eq("creator_id", creatorId);
    if (error) throw new ApiError(400, "Takip kaldırılamadı.");
    return new Response(null, { status: 204 });
  } catch (error) { return jsonError(error); }
}
