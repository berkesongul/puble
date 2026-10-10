import { ApiError } from "./http";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function requireWorkspace() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new ApiError(401, "Oturum açmanız gerekiyor.", "UNAUTHENTICATED");
  }

  const { data: membership, error } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, workspaces(id, name, slug, plan)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw new ApiError(500, "Çalışma alanı okunamadı.");
  if (!membership) {
    throw new ApiError(403, "Bu kullanıcıya bağlı çalışma alanı yok.", "NO_WORKSPACE");
  }

  return {
    supabase,
    user,
    workspaceId: membership.workspace_id as string,
    role: membership.role as string,
    workspace: membership.workspaces,
  };
}

