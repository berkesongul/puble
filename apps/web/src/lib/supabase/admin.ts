import { createClient } from "@supabase/supabase-js";
import { ApiError } from "@/lib/backend/http";

export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new ApiError(503, "Supabase servis rolü yapılandırılmamış.", "ADMIN_NOT_CONFIGURED");
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
