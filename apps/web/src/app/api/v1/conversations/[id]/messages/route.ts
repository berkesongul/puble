import { z } from "zod";
import { requireWorkspace } from "@/lib/backend/auth";
import { ApiError, jsonCreated, jsonError, jsonOk, readJson } from "@/lib/backend/http";
import { messageSchema } from "@/lib/backend/schemas";

export async function GET(_request: Request, context: RouteContext<"/api/v1/conversations/[id]/messages">) {
  try {
    const { id: rawId } = await context.params;
    const id = z.string().uuid().parse(rawId);
    const { supabase, workspaceId } = await requireWorkspace();
    const { data, error } = await supabase.from("messages").select("*").eq("workspace_id", workspaceId).eq("conversation_id", id).order("created_at", { ascending: true }).limit(200);
    if (error) throw new ApiError(500, "Mesajlar okunamadı.");
    return jsonOk(data);
  } catch (error) { return jsonError(error); }
}

export async function POST(request: Request, context: RouteContext<"/api/v1/conversations/[id]/messages">) {
  try {
    const { id: rawId } = await context.params;
    const id = z.string().uuid().parse(rawId);
    const { supabase, workspaceId, user } = await requireWorkspace();
    const body = messageSchema.parse(await readJson(request));
    const { data: conversation } = await supabase.from("conversations").select("id").eq("id", id).eq("workspace_id", workspaceId).maybeSingle();
    if (!conversation) throw new ApiError(404, "Konuşma bulunamadı.", "NOT_FOUND");
    const { data, error } = await supabase.from("messages").insert({ ...body, workspace_id: workspaceId, conversation_id: id, sender_id: body.direction === "outbound" ? user.id : null }).select("*").single();
    if (error) throw new ApiError(400, "Mesaj gönderilemedi.");
    await supabase.from("conversations").update({ last_message_preview: body.body.slice(0, 180), last_message_at: data.created_at, unread_count: body.direction === "outbound" ? 0 : 1 }).eq("id", id).eq("workspace_id", workspaceId);
    return jsonCreated(data);
  } catch (error) { return jsonError(error); }
}
