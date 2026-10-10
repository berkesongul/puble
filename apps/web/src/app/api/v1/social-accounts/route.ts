import { requireWorkspace } from "@/lib/backend/auth";
import { encryptCredential } from "@/lib/backend/crypto";
import { ApiError, jsonCreated, jsonError, jsonOk, readJson } from "@/lib/backend/http";
import { socialAccountSchema } from "@/lib/backend/schemas";
import { connection } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const publicColumns = "id, provider, display_name, external_account_id, status, metadata, last_synced_at, created_at, updated_at";

export async function GET() {
  await connection();
  try {
    const { supabase, workspaceId } = await requireWorkspace();
    const { data, error } = await supabase.from("social_accounts").select(publicColumns).eq("workspace_id", workspaceId).order("created_at");
    if (error) throw new ApiError(500, "Bağlı hesaplar okunamadı.");
    return jsonOk(data);
  } catch (error) { return jsonError(error); }
}

export async function POST(request: Request) {
  try {
    const { supabase, workspaceId, user } = await requireWorkspace();
    const body = socialAccountSchema.parse(await readJson(request));
    const { credential, ...safe } = body;
    const admin = createAdminSupabaseClient();
    const { data, error } = await supabase.from("social_accounts").insert({ ...safe, workspace_id: workspaceId }).select(publicColumns).single();
    if (error) throw new ApiError(400, "Sosyal hesap bağlanamadı.");
    const { error: secretError } = await admin.from("social_account_secrets").insert({ social_account_id: data.id, credentials_ciphertext: encryptCredential(credential) });
    if (secretError) {
      await supabase.from("social_accounts").delete().eq("id", data.id).eq("workspace_id", workspaceId);
      throw new ApiError(500, "Hesap anahtarı güvenli kasaya yazılamadı.");
    }
    await supabase.from("audit_logs").insert({ workspace_id: workspaceId, actor_id: user.id, action: "connect", entity_type: "social_account", entity_id: data.id, metadata: { provider: body.provider } });
    return jsonCreated(data);
  } catch (error) { return jsonError(error); }
}
