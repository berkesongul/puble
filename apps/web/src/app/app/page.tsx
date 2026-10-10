import { redirect } from "next/navigation";
import { connection } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CustomerApp } from "./customer-app";
import styles from "./customer-app.module.css";

export const instant = false;

export default async function AppPage() {
  await connection();
  if (!isSupabaseConfigured()) {
    return <main className={styles.setup}><div><span>BACKEND SETUP</span><h1>Müşteri paneli yapılandırma bekliyor.</h1><p><code>apps/web/.env.example</code> dosyasındaki değerleri tanımla ve Supabase migration&apos;ını uygula. Demo paneli etkilenmeden çalışmaya devam ediyor.</p><a href="/panel">Demo paneline dön →</a></div></main>;
  }
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth?mode=login");
  return <CustomerApp />;
}
