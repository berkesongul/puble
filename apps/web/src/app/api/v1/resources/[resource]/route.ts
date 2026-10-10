import { z } from "zod";
import { requireWorkspace } from "@/lib/backend/auth";
import { ApiError, jsonCreated, jsonError, jsonOk, readJson } from "@/lib/backend/http";
import { resourceConfig, resourceSchemas, type ResourceName } from "@/lib/backend/schemas";

function resolveResource(value: string): ResourceName {
  if (!(value in resourceConfig)) throw new ApiError(404, "Kaynak bulunamadı.", "NOT_FOUND");
  return value as ResourceName;
}

export async function GET(request: Request, context: RouteContext<"/api/v1/resources/[resource]">) {
  try {
    const { resource: rawResource } = await context.params;
    const resource = resolveResource(rawResource);
    const { supabase, workspaceId } = await requireWorkspace();
    const url = new URL(request.url);
    const limit = z.coerce.number().int().min(1).max(100).catch(50).parse(url.searchParams.get("limit") ?? 50);
    const { table, order } = resourceConfig[resource];
    let query = supabase.from(table).select("*").eq("workspace_id", workspaceId);
    const status = url.searchParams.get("status");
    if (status) query = query.eq("status", status);
    const { data, error } = await query.order(order, { ascending: false }).limit(limit);
    if (error) throw new ApiError(500, "Kayıtlar okunamadı.");
    return jsonOk(data);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, context: RouteContext<"/api/v1/resources/[resource]">) {
  try {
    const { resource: rawResource } = await context.params;
    const resource = resolveResource(rawResource);
    const { supabase, workspaceId, user } = await requireWorkspace();
    const body = resourceSchemas[resource].parse(await readJson(request));
    const { table } = resourceConfig[resource];
    const payload: Record<string, unknown> = { ...body, workspace_id: workspaceId };
    if (resource === "posts") payload.author_id = user.id;
    if (resource === "assets") payload.created_by = user.id;
    const { data, error } = await supabase.from(table).insert(payload).select("*").single();
    if (error) throw new ApiError(400, "Kayıt oluşturulamadı.", "DATABASE_WRITE_FAILED");
    await supabase.from("audit_logs").insert({ workspace_id: workspaceId, actor_id: user.id, action: "create", entity_type: resource, entity_id: data.id });
    return jsonCreated(data);
  } catch (error) {
    return jsonError(error);
  }
}
