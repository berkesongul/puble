import { createClient } from "@supabase/supabase-js";
import { ApiError } from "@/lib/backend/http";
import { getSupabaseConfig } from "./config";

export function createAdminSupabaseClient() {
  const { url } = getSupabaseConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceRoleKey) {
    throw new ApiError(503, "Supabase servis rolü yapılandırılmamış.", "ADMIN_NOT_CONFIGURED");
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
