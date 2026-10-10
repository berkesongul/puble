import { z } from "zod";
import { requireWorkspace } from "@/lib/backend/auth";
import { ApiError, jsonError, jsonOk, readJson } from "@/lib/backend/http";
import { resourceConfig, resourceSchemas, type ResourceName } from "@/lib/backend/schemas";

function resolveResource(value: string): ResourceName {
  if (!(value in resourceConfig)) throw new ApiError(404, "Kaynak bulunamadı.", "NOT_FOUND");
  return value as ResourceName;
}

export async function PATCH(request: Request, context: RouteContext<"/api/v1/resources/[resource]/[id]">) {
  try {
    const { resource: rawResource, id: rawId } = await context.params;
    const resource = resolveResource(rawResource);
    const id = z.string().uuid().parse(rawId);
    const { supabase, workspaceId, user } = await requireWorkspace();
    const body = resourceSchemas[resource].partial().parse(await readJson(request));
    if (Object.keys(body).length === 0) throw new ApiError(422, "Güncellenecek alan yok.");
    const { data, error } = await supabase.from(resourceConfig[resource].table).update(body).eq("id", id).eq("workspace_id", workspaceId).select("*").maybeSingle();
    if (error) throw new ApiError(400, "Kayıt güncellenemedi.");
    if (!data) throw new ApiError(404, "Kayıt bulunamadı.", "NOT_FOUND");
    await supabase.from("audit_logs").insert({ workspace_id: workspaceId, actor_id: user.id, action: "update", entity_type: resource, entity_id: id });
    return jsonOk(data);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext<"/api/v1/resources/[resource]/[id]">) {
  try {
    const { resource: rawResource, id: rawId } = await context.params;
    const resource = resolveResource(rawResource);
    const id = z.string().uuid().parse(rawId);
    const { supabase, workspaceId, user } = await requireWorkspace();
    const { data, error } = await supabase.from(resourceConfig[resource].table).delete().eq("id", id).eq("workspace_id", workspaceId).select("id").maybeSingle();
    if (error) throw new ApiError(400, "Kayıt silinemedi.");
    if (!data) throw new ApiError(404, "Kayıt bulunamadı.", "NOT_FOUND");
    await supabase.from("audit_logs").insert({ workspace_id: workspaceId, actor_id: user.id, action: "delete", entity_type: resource, entity_id: id });
    return new Response(null, { status: 204 });
  } catch (error) {
    return jsonError(error);
  }
}
