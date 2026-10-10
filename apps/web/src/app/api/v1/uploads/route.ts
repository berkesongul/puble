import { z } from "zod";
import { requireWorkspace } from "@/lib/backend/auth";
import { ApiError, jsonError, jsonOk, readJson } from "@/lib/backend/http";

const schema = z.object({ filename: z.string().trim().min(1).max(180).regex(/^[a-zA-Z0-9._-]+$/), mime_type: z.enum(["image/jpeg","image/png","image/webp","image/gif","video/mp4","video/webm","application/pdf"]) });

export async function POST(request: Request) {
  try {
    const { supabase, workspaceId, user } = await requireWorkspace();
    const body = schema.parse(await readJson(request));
    const path = `${workspaceId}/${user.id}/${crypto.randomUUID()}-${body.filename}`;
    const { data, error } = await supabase.storage.from("workspace-media").createSignedUploadUrl(path);
    if (error) throw new ApiError(400, "Yükleme bağlantısı oluşturulamadı.");
    return jsonOk({ path, token: data.token, signed_url: data.signedUrl, mime_type: body.mime_type });
  } catch (error) { return jsonError(error); }
}
