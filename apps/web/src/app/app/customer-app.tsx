"use client";

import Image from "next/image";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { clearDemoSession } from "@/lib/demo-auth";
import styles from "./customer-app.module.css";
import aiStyles from "./customer-ai.module.css";
import { demoBootstrap, demoMessages } from "./demo-data";

type View = "overview" | "inbox" | "posts" | "library" | "planner" | "series" | "ads" | "analytics" | "social" | "settings";
export type Row = Record<string, unknown> & { id: string };
export type Bootstrap = {
  user: { id: string; email: string; full_name: string; avatar_url?: string; locale: string };
  workspace: { id: string; name: string; slug: string; plan: string };
  role: string;
  conversations: Row[]; posts: Row[]; assets: Row[]; opportunities: Row[]; series: Row[];
  campaigns: Row[]; notifications: Row[]; accounts: Row[]; analytics: Row[];
  brand: Record<string, unknown>; usage: Record<string, unknown> | null;
  creators: Row[]; followed_creator_ids: string[];
};

const nav: Array<[View, string, string]> = [
  ["overview", "Ana panel", "⌂"], ["inbox", "Gelen Kutusu", "●"], ["posts", "Puble editor", "◆"],
  ["library", "Kitaplık", "▦"], ["planner", "Puble Planlayıcı", "▣"], ["series", "Seriler", "≋"],
  ["ads", "Reklamlar", "◎"], ["analytics", "Analitik", "⌁"], ["social", "Kreatörler", "✦"], ["settings", "Ayarlar", "⚙"],
];

const titles: Record<View, [string, string]> = {
  overview: ["Bugünün akışı", "İletişimden yayına bütün işlerin tek ritimde."], inbox: ["Gelen kutusu", "Bağlı kanallarındaki gerçek konuşmalar."],
  posts: ["İçerik editörü", "Taslağını üret, kanalları seç ve yayına hazırla."], library: ["Kitaplık", "Çalışma alanına yüklenen görsel ve videolar."],
  planner: ["İçerik planı", "Fırsatları onayla, gönderileri planla ve yayınla."], series: ["Seriler", "Tekrarlayan içerik ritimlerini yönet."],
  ads: ["Reklamlar", "Kampanya bütçesi ve performansını yönet."], analytics: ["Analitik", "Kanalların büyümesini kalıcı veriden izle."],
  social: ["Kreatörler", "İş birliği için creator ağını keşfet."], settings: ["Ayarlar", "Marka hafızası, hesaplar ve çalışma alanı."],
};

type ApiClient = <T>(path: string, init?: RequestInit) => Promise<T>;

async function liveApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  if (response.status === 204) return undefined as T;
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error?.message || "İşlem başarısız oldu.");
  return payload.data as T;
}

const ApiContext = createContext<ApiClient>(liveApi);
function useApi() { return useContext(ApiContext); }

function value(row: Row, key: string, fallback = "—") { const item = row[key]; return typeof item === "string" || typeof item === "number" ? String(item) : fallback; }
function date(value: unknown) { return typeof value === "string" ? new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "—"; }

function createDemoClient(
  setData: Dispatch<SetStateAction<Bootstrap | null>>,
  messages: Record<string, Row[]>,
): ApiClient {
  return async function demoApi<T>(path: string, init?: RequestInit): Promise<T> {
    const method = init?.method ?? "GET";
    const body = init?.body ? JSON.parse(String(init.body)) as Record<string, unknown> : {};
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const messageMatch = path.match(/^\/api\/v1\/conversations\/([^/]+)\/messages$/);

    if (messageMatch) {
      const conversationId = messageMatch[1];
      if (method === "GET") return structuredClone(messages[conversationId] ?? []) as T;
      const row: Row = { id, direction: body.direction ?? "outbound", body: body.body, created_at: now };
      messages[conversationId] = [...(messages[conversationId] ?? []), row];
      setData((current) => current ? { ...current, conversations: current.conversations.map((item) => item.id === conversationId ? { ...item, last_message_preview: body.body, last_message_at: now, unread_count: 0 } : item) } : current);
      return row as T;
    }

    if (path === "/api/v1/actions") {
      const action = body.action;
      if (action === "professionalize") return { text: `Merhaba, ${String(body.text).replace(/\s+/g, " ").trim()} Süreci birlikte en uygun şekilde sonuçlandırabiliriz.` } as T;
      if (action === "assistant_chat") return { reply: "Demo çalışma alanında 3 aktif sohbet, 2 içerik fırsatı ve yaklaşan bir lansman gönderisi bulunuyor. Öncelikle planlayıcıdaki fırsatları değerlendirebilirsin.", suggested_view: "planner" } as T;
      if (action === "extract_opportunities") {
        const opportunity: Row = { id, conversation_id: body.conversation_id, title: "Konuşmadan yeni içerik", description: "Mesaj akışından çıkarılan demo içerik fırsatı.", suggested_at: "2026-10-16T15:00:00.000Z", channel_keys: ["instagram"], status: "suggested", created_at: now };
        setData((current) => current ? { ...current, opportunities: [opportunity, ...current.opportunities] } : current);
        return [opportunity] as T;
      }
      if (action === "accept_opportunity") {
        const post: Row = { id, title: "Onaylanan içerik fırsatı", body: "Konuşmadan takvime eklenen demo gönderisi.", channel_keys: ["instagram"], status: "scheduled", scheduled_at: "2026-10-16T15:00:00.000Z", updated_at: now };
        setData((current) => {
          if (!current) return current;
          const opportunity = current.opportunities.find((item) => item.id === body.opportunity_id);
          const resolvedPost = { ...post, title: opportunity?.title ?? post.title, body: opportunity?.description ?? post.body, channel_keys: opportunity?.channel_keys ?? post.channel_keys, scheduled_at: opportunity?.suggested_at ?? post.scheduled_at };
          return { ...current, posts: [resolvedPost, ...current.posts], opportunities: current.opportunities.map((item) => item.id === body.opportunity_id ? { ...item, status: "accepted" } : item) };
        });
        return post as T;
      }
      if (action === "schedule_post") {
        let updated: Row | undefined;
        setData((current) => current ? { ...current, posts: current.posts.map((item) => item.id === body.post_id ? (updated = { ...item, status: "scheduled", scheduled_at: body.scheduled_at, updated_at: now }) : item) } : current);
        return updated as T;
      }
      if (action === "publish_post") {
        let updated: Row | undefined;
        setData((current) => current ? { ...current, posts: current.posts.map((item) => item.id === body.post_id ? (updated = { ...item, status: "publishing", updated_at: now }) : item) } : current);
        return updated as T;
      }
      return { updated: true } as T;
    }

    const resourceMatch = path.match(/^\/api\/v1\/resources\/(posts|assets|series|ads)$/);
    if (resourceMatch && method === "POST") {
      const row: Row = { id, ...body, created_at: now, updated_at: now };
      const key = ({ posts: "posts", assets: "assets", series: "series", ads: "campaigns" } as const)[resourceMatch[1] as "posts" | "assets" | "series" | "ads"];
      setData((current) => current ? { ...current, [key]: [row, ...current[key]] } : current);
      return row as T;
    }

    if (path === "/api/v1/uploads") return { path: `demo/${id}-${String(body.filename ?? "asset")}`, token: "demo" } as T;
    if (path === "/api/v1/social-accounts" && method === "POST") {
      const account: Row = { id, provider: body.provider, display_name: body.display_name, status: "connected", created_at: now };
      setData((current) => current ? { ...current, accounts: [account, ...current.accounts] } : current);
      return account as T;
    }
    const accountMatch = path.match(/^\/api\/v1\/social-accounts\/([^/]+)$/);
    if (accountMatch && method === "DELETE") {
      setData((current) => current ? { ...current, accounts: current.accounts.filter((item) => item.id !== accountMatch[1]) } : current);
      return undefined as T;
    }
    const creatorMatch = path.match(/^\/api\/v1\/creators\/([^/]+)\/follow$/);
    if (creatorMatch) {
      setData((current) => current ? { ...current, followed_creator_ids: method === "DELETE" ? current.followed_creator_ids.filter((item) => item !== creatorMatch[1]) : [...new Set([...current.followed_creator_ids, creatorMatch[1]])] } : current);
      return { following: method !== "DELETE" } as T;
    }
    if (path === "/api/v1/settings" && method === "PATCH") {
      setData((current) => current ? { ...current, workspace: body.workspace_name ? { ...current.workspace, name: String(body.workspace_name) } : current.workspace, brand: body.brand ? { ...current.brand, ...(body.brand as Record<string, unknown>) } : current.brand } : current);
      return { updated: true } as T;
    }
    if (path === "/api/v1/bootstrap") return structuredClone(demoBootstrap) as T;
    throw new Error("Bu demo işlemi henüz desteklenmiyor.");
  };
}

export function CustomerApp({ mode = "live" }: { mode?: "live" | "demo" }) {
  const router = useRouter();
  const [view, setView] = useState<View>("overview");
  const [data, setData] = useState<Bootstrap | null>(() => mode === "demo" ? structuredClone(demoBootstrap) : null);
  const [loading, setLoading] = useState(mode === "live");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [composer, setComposer] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [demoMessageStore] = useState<Record<string, Row[]>>(() => structuredClone(demoMessages));
  const client = useMemo<ApiClient>(() => mode === "demo" ? createDemoClient(setData, demoMessageStore) : liveApi, [mode, demoMessageStore]);

  const reload = useCallback(async () => {
    if (mode === "demo") return;
    try { setError(""); setData(await liveApi<Bootstrap>("/api/v1/bootstrap")); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Veriler yüklenemedi."); }
    finally { setLoading(false); }
  }, [mode]);
  useEffect(() => {
    if (mode === "demo") return;
    liveApi<Bootstrap>("/api/v1/bootstrap")
      .then(setData)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Veriler yüklenemedi."))
      .finally(() => setLoading(false));
  }, [mode]);
  function done(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2600); if (mode === "live") void reload(); }
  async function signOut() { if (mode === "demo") clearDemoSession(); else await createBrowserSupabaseClient().auth.signOut(); router.push("/"); router.refresh(); }

  if (loading) return <main className={styles.loading}><span /><p>Çalışma alanın yükleniyor…</p></main>;
  if (error || !data) return <main className={styles.setup}><div><span>BAĞLANTI HATASI</span><h1>Çalışma alanı açılamadı.</h1><p>{error}</p><button onClick={() => { setLoading(true); void reload(); }}>Tekrar dene</button></div></main>;
  const initials = (data.user.full_name || data.user.email).split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  return <ApiContext.Provider value={client}><main className={styles.shell}>
    <aside className={styles.sidebar}>
      <Link href="/" className={styles.logo}><Image src="/UI/UX/puble_dashboard_icon.png" alt="Puble" width={636} height={136} priority /></Link>
      <nav>{nav.map(([id, label, icon]) => <button key={id} className={view === id ? styles.active : ""} onClick={() => setView(id)}><i>{icon}</i><span>{label}</span>{id === "inbox" && Number(data.conversations.reduce((sum, row) => sum + Number(row.unread_count || 0), 0)) > 0 ? <em>{data.conversations.reduce((sum, row) => sum + Number(row.unread_count || 0), 0)}</em> : null}</button>)}</nav>
      <div className={styles.sideBottom}><div className={styles.plan}><span>{data.workspace.plan.toUpperCase()} PLAN</span><b>{Number(data.usage?.active_conversations || 0)} aktif sohbet</b><small>{Number(data.usage?.ai_requests || 0)} AI kullanımı</small></div></div>
    </aside>
    <section className={styles.main}>
      <header className={styles.topbar}><div className={styles.search}>⌕ <span>İçerik, konuşma veya seri ara…</span></div><button className={styles.bell} onClick={() => setView("overview")}>♢<i>{data.notifications.filter((item) => !item.read_at).length}</i></button><div className={styles.profile}><span>{initials}</span><div><b>{data.user.full_name || "Puble kullanıcısı"}</b><small>{data.workspace.name}</small></div><button onClick={signOut}>Çıkış</button></div></header>
      <div className={styles.content}><div className={styles.pageTitle}><span>WORKSPACE · {data.workspace.plan.toUpperCase()}</span><h1>{titles[view][0]}</h1><p>{titles[view][1]}</p></div>
        {view === "overview" && <Overview data={data} onGo={setView} />}
        {view === "inbox" && <Inbox rows={data.conversations} done={done} />}
        {view === "posts" && <Posts rows={data.posts} openComposer={() => setComposer(true)} done={done} />}
        {view === "library" && <Library rows={data.assets} done={done} />}
        {view === "planner" && <Planner posts={data.posts} opportunities={data.opportunities} done={done} />}
        {view === "series" && <ResourceSection resource="series" rows={data.series} done={done} fields={["name","description","cadence"]} />}
        {view === "ads" && <ResourceSection resource="ads" rows={data.campaigns} done={done} fields={["name","provider","budget"]} />}
        {view === "analytics" && <Analytics rows={data.analytics} />}
        {view === "social" && <Creators rows={data.creators} followed={data.followed_creator_ids} done={done} />}
        {view === "settings" && <Settings data={data} done={done} />}
      </div>
    </section>
    {composer ? <Composer close={() => setComposer(false)} done={(message) => { setComposer(false); done(message); }} /> : null}
    <WorkspaceAI open={aiOpen} toggle={() => setAiOpen((value) => !value)} navigate={(next) => { setView(next); setAiOpen(false); }} />
    {toast ? <div className={styles.toast}>{toast}</div> : null}
  </main></ApiContext.Provider>;
}

function Overview({ data, onGo }: { data: Bootstrap; onGo: (view: View) => void }) {
  const scheduled = data.posts.filter((item) => item.status === "scheduled").length;
  return <><section className={styles.hero}><div><span>CANLI ÇALIŞMA ALANI</span><h2>{data.opportunities.length ? `${data.opportunities.length} içerik fırsatı seni bekliyor.` : "İlk içerik akışını oluşturmaya hazırsın."}</h2><p>Gelen mesajlardan yayın takvimine uzanan tüm veriler artık çalışma alanına kalıcı olarak kaydediliyor.</p><button onClick={() => onGo(data.opportunities.length ? "planner" : "inbox")}>Akışı sürdür →</button></div><Image src="/assets/Amblem.svg" alt="" width={170} height={240} /></section><div className={styles.metrics}>{[["Aktif sohbet", data.conversations.filter((x) => x.status === "active").length], ["Planlanan", scheduled], ["Kitaplık", data.assets.length], ["Bağlı kanal", data.accounts.length]].map(([label, count]) => <article key={label}><span>{label}</span><b>{count}</b><small>Canlı veri</small></article>)}</div><div className={styles.twoCol}><List title="Son konuşmalar" rows={data.conversations.slice(0, 5)} primary="participant_name" secondary="last_message_preview" empty="Henüz konuşma yok." /><List title="Yaklaşan içerikler" rows={data.posts.filter((x) => x.status === "scheduled").slice(0, 5)} primary="title" secondary="scheduled_at" empty="Planlanmış içerik yok." /></div></>;
}

function List({ title, rows, primary, secondary, empty }: { title: string; rows: Row[]; primary: string; secondary: string; empty: string }) { return <section className={styles.card}><div className={styles.cardHead}><h3>{title}</h3><span>{rows.length}</span></div>{rows.length ? rows.map((row) => <article className={styles.listRow} key={row.id}><i>{value(row, primary).slice(0, 2).toUpperCase()}</i><div><b>{value(row, primary)}</b><small>{secondary.includes("_at") ? date(row[secondary]) : value(row, secondary)}</small></div></article>) : <Empty text={empty} />}</section>; }

function Inbox({ rows, done }: { rows: Row[]; done: (message: string) => void }) {
  const api = useApi();
  const [selected, setSelected] = useState(rows[0]?.id ?? ""); const [messages, setMessages] = useState<Row[]>([]); const [draft, setDraft] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { if (selected) void api<Row[]>(`/api/v1/conversations/${selected}/messages`).then(setMessages); }, [selected, api]);
  async function send() { if (!draft.trim()) return; setBusy(true); try { const message = await api<Row>(`/api/v1/conversations/${selected}/messages`, { method: "POST", body: JSON.stringify({ body: draft }) }); setMessages((items) => [...items, message]); setDraft(""); done("Mesaj gönderildi"); } finally { setBusy(false); } }
  async function polish() { if (!draft.trim()) return; setBusy(true); try { const result = await api<{ text: string }>("/api/v1/actions", { method: "POST", body: JSON.stringify({ action: "professionalize", text: draft }) }); setDraft(result.text); } catch (e) { done(e instanceof Error ? e.message : "AI işlemi başarısız"); } finally { setBusy(false); } }
  async function extract() { const transcript = messages.map((m) => `${m.direction}: ${m.body}`).join("\n"); if (!transcript) return; setBusy(true); try { const result = await api<Row[]>("/api/v1/actions", { method: "POST", body: JSON.stringify({ action: "extract_opportunities", conversation_id: selected, transcript }) }); done(`${result.length} içerik fırsatı oluşturuldu`); } catch (e) { done(e instanceof Error ? e.message : "AI işlemi başarısız"); } finally { setBusy(false); } }
  return <section className={styles.inbox}><aside>{rows.length ? rows.map((row) => <button className={selected === row.id ? styles.selected : ""} key={row.id} onClick={() => setSelected(row.id)}><i>{value(row,"participant_name").slice(0,2)}</i><div><b>{value(row,"participant_name")}</b><small>{value(row,"last_message_preview","Yeni konuşma")}</small></div></button>) : <Empty text="Bağlı hesaplarından konuşmalar geldiğinde burada görünecek." />}</aside><div className={styles.chat}>{selected ? <><div className={styles.chatHead}><b>{value(rows.find((x) => x.id === selected) || rows[0], "participant_name")}</b><button onClick={extract} disabled={busy}>✦ Konuşmadan takvim çıkar</button></div><div className={styles.messages}>{messages.map((message) => <p className={message.direction === "outbound" ? styles.outbound : ""} key={message.id}>{value(message,"body")}<time>{date(message.created_at)}</time></p>)}</div><div className={styles.compose}><textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Yanıtını yaz…" /><div><button onClick={polish} disabled={busy}>✦ Profesyonelleştir</button><button onClick={send} disabled={busy || !draft.trim()}>Gönder →</button></div></div></> : <Empty text="Bir konuşma seç veya sosyal hesap bağla." />}</div></section>;
}

function Posts({ rows, openComposer, done }: { rows: Row[]; openComposer: () => void; done: (message: string) => void }) { const api = useApi(); async function publish(id: string) { try { await api("/api/v1/actions", { method: "POST", body: JSON.stringify({ action: "publish_post", post_id: id }) }); done("Gönderi yayın kuyruğuna alındı"); } catch (e) { done(e instanceof Error ? e.message : "İşlem başarısız"); } } return <section className={styles.card}><div className={styles.cardHead}><h3>İçerikler</h3><button onClick={openComposer}>+ Yeni gönderi</button></div>{rows.length ? <div className={styles.table}>{rows.map((row) => <article key={row.id}><div><b>{value(row,"title")}</b><small>{value(row,"body").slice(0,100)}</small></div><span>{value(row,"status")}</span><time>{date(row.scheduled_at || row.updated_at)}</time><button onClick={() => publish(row.id)} disabled={row.status === "publishing" || row.status === "published"}>Paylaş</button></article>)}</div> : <Empty text="Henüz içerik yok. İlk gönderini oluştur." />}</section>; }

function Library({ rows, done }: { rows: Row[]; done: (message: string) => void }) { const api = useApi(); const [busy, setBusy] = useState(false); async function upload(file: File) { setBusy(true); try { const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g,"-"); const signed = await api<{ path: string; token: string }>("/api/v1/uploads", { method: "POST", body: JSON.stringify({ filename: safeName, mime_type: file.type }) }); if (signed.token !== "demo") { const supabase = createBrowserSupabaseClient(); const { error } = await supabase.storage.from("workspace-media").uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type }); if (error) throw error; } await api("/api/v1/resources/assets", { method: "POST", body: JSON.stringify({ title: file.name, kind: file.type.startsWith("video/") ? "video" : file.type === "application/pdf" ? "document" : "image", storage_path: signed.path, mime_type: file.type, bytes: file.size }) }); done("Dosya kitaplığa eklendi"); } catch (e) { done(e instanceof Error ? e.message : "Yükleme başarısız"); } finally { setBusy(false); } } return <><label className={styles.upload}><input type="file" accept="image/*,video/mp4,video/webm,application/pdf" disabled={busy} onChange={(e) => { const file = e.target.files?.[0]; if (file) void upload(file); }} /><b>{busy ? "Yükleniyor…" : "+ Dosya yükle"}</b><span>100 MB&apos;a kadar görsel, video veya PDF</span></label><div className={styles.assetGrid}>{rows.map((row) => <article key={row.id}><div>{row.kind === "video" ? "▶" : row.kind === "document" ? "PDF" : "▧"}</div><b>{value(row,"title")}</b><small>{Math.round(Number(row.bytes || 0) / 1024)} KB · {date(row.created_at)}</small></article>)}</div>{!rows.length ? <Empty text="Kitaplığın boş. İlk dosyanı yükle." /> : null}</> }

function Planner({ posts, opportunities, done }: { posts: Row[]; opportunities: Row[]; done: (message: string) => void }) { const api = useApi(); async function accept(id: string) { try { await api("/api/v1/actions", { method: "POST", body: JSON.stringify({ action: "accept_opportunity", opportunity_id: id }) }); done("Fırsat takvime eklendi"); } catch (e) { done(e instanceof Error ? e.message : "İşlem başarısız"); } } return <div className={styles.twoCol}><section className={styles.card}><div className={styles.cardHead}><h3>AI fırsatları</h3><span>{opportunities.length}</span></div>{opportunities.filter((x) => x.status === "suggested").map((row) => <article className={styles.opportunity} key={row.id}><span>✦ KONUŞMADAN</span><h4>{value(row,"title")}</h4><p>{value(row,"description")}</p><small>{date(row.suggested_at)}</small><button onClick={() => accept(row.id)}>Takvime ekle →</button></article>)}{!opportunities.length ? <Empty text="Konuşmalardan çıkarılan fırsatlar burada görünür." /> : null}</section><List title="Yayın takvimi" rows={posts.filter((x) => x.status === "scheduled")} primary="title" secondary="scheduled_at" empty="Henüz planlanmış gönderi yok." /></div>; }

function ResourceSection({ resource, rows, fields, done }: { resource: "series" | "ads"; rows: Row[]; fields: string[]; done: (message: string) => void }) { const api = useApi(); const [open, setOpen] = useState(false); async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); const payload = resource === "series" ? { name: form.get("name"), description: form.get("description"), cadence: form.get("cadence"), channel_keys: [] } : { name: form.get("name"), provider: form.get("provider"), budget: Number(form.get("budget")), currency: "TRY", status: "draft" }; try { await api(`/api/v1/resources/${resource}`, { method: "POST", body: JSON.stringify(payload) }); setOpen(false); done(resource === "series" ? "Seri oluşturuldu" : "Kampanya oluşturuldu"); } catch (e) { done(e instanceof Error ? e.message : "İşlem başarısız"); } } return <section className={styles.card}><div className={styles.cardHead}><h3>{resource === "series" ? "İçerik serileri" : "Reklam kampanyaları"}</h3><button onClick={() => setOpen(!open)}>+ Oluştur</button></div>{open ? <form className={styles.inlineForm} onSubmit={submit}>{fields.map((field) => field === "cadence" ? <select key={field} name={field} defaultValue="weekly"><option value="daily">Günlük</option><option value="weekly">Haftalık</option><option value="monthly">Aylık</option></select> : <input key={field} name={field} type={field === "budget" ? "number" : "text"} placeholder={field} required={field !== "description"} />)}<button>Kaydet</button></form> : null}<div className={styles.table}>{rows.map((row) => <article key={row.id}><div><b>{value(row,"name")}</b><small>{value(row, resource === "series" ? "description" : "provider")}</small></div><span>{value(row, resource === "series" ? "cadence" : "status")}</span><time>{date(row.next_run_at || row.starts_at || row.created_at)}</time></article>)}</div>{!rows.length ? <Empty text="Henüz kayıt yok." /> : null}</section>; }

function Analytics({ rows }: { rows: Row[] }) { const totals = useMemo(() => rows.reduce((acc, row) => ({ impressions: acc.impressions + Number(row.impressions || 0), reach: acc.reach + Number(row.reach || 0), engagements: acc.engagements + Number(row.engagements || 0), followers: Math.max(acc.followers, Number(row.followers || 0)) }), { impressions: 0, reach: 0, engagements: 0, followers: 0 }), [rows]); const max = Math.max(...rows.map((r) => Number(r.reach || 0)), 1); return <><div className={styles.metrics}>{Object.entries(totals).map(([key, count]) => <article key={key}><span>{({impressions:"Gösterim",reach:"Erişim",engagements:"Etkileşim",followers:"Takipçi"} as Record<string,string>)[key]}</span><b>{count.toLocaleString("tr-TR")}</b><small>Seçili dönem</small></article>)}</div><section className={styles.chart}><div className={styles.cardHead}><h3>Günlük erişim</h3><span>{rows.length} gün</span></div><div>{rows.slice().reverse().map((row) => <i key={row.id} style={{ height: `${Math.max(5, Number(row.reach || 0) / max * 100)}%` }} title={`${row.day}: ${row.reach}`} />)}</div>{!rows.length ? <Empty text="Hesaplar senkronize olduğunda analitik verileri burada görünecek." /> : null}</section></>; }

function Creators({ rows, followed, done }: { rows: Row[]; followed: string[]; done: (message: string) => void }) { const api = useApi(); async function toggle(id:string){const active=followed.includes(id);try{await api(`/api/v1/creators/${id}/follow`,{method:active?"DELETE":"POST"});done(active?"Takip bırakıldı":"Kreatör takip ediliyor");}catch(e){done(e instanceof Error?e.message:"İşlem başarısız");}} return <><section className={styles.hero}><div><span>CREATOR NETWORK</span><h2>Doğru üreticiyle, doğru içerik ritmini kur.</h2><p>Kreatörleri takip et, yayınladıkları şablonları incele ve içerik akışına taşı.</p></div><Image src="/assets/Amblem.svg" alt="" width={170} height={240} /></section><div className={styles.assetGrid}>{rows.map(row=><article key={row.id}><div>✦</div><b>{value(row,"display_name")}</b><small>@{value(row,"handle")} · {Number(row.follower_count||0).toLocaleString("tr-TR")} takipçi</small><button onClick={()=>toggle(row.id)}>{followed.includes(row.id)?"Takibi bırak":"Takip et +"}</button></article>)}</div>{!rows.length?<Empty text="Kreatör kataloğu henüz yayınlanmadı."/>:null}</>; }

function Settings({ data, done }: { data: Bootstrap; done: (message: string) => void }) { const [tab, setTab] = useState<"brand"|"accounts"|"workspace">("brand"); return <div className={styles.settings}><aside>{[["brand","Marka Hafızası"],["accounts","Bağlı Hesaplar"],["workspace","Çalışma Alanı"]].map(([id,label]) => <button className={tab === id ? styles.selected : ""} key={id} onClick={() => setTab(id as typeof tab)}>{label}</button>)}</aside><section className={styles.card}>{tab === "brand" ? <BrandForm brand={data.brand} done={done} /> : tab === "accounts" ? <Accounts accounts={data.accounts} done={done} /> : <WorkspaceForm workspace={data.workspace} done={done} />}</section></div>; }

function BrandForm({ brand, done }: { brand: Record<string, unknown>; done: (message: string) => void }) { const api = useApi(); async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const f = new FormData(e.currentTarget); try { await api("/api/v1/settings", { method: "PATCH", body: JSON.stringify({ brand: { tone: f.get("tone"), audience: f.get("audience"), description: f.get("description"), preferred_phrases: String(f.get("preferred")||"").split(",").map(x=>x.trim()).filter(Boolean), avoided_phrases: String(f.get("avoided")||"").split(",").map(x=>x.trim()).filter(Boolean), require_calendar_approval: f.get("approval") === "on" } }) }); done("Marka hafızası kaydedildi"); } catch(e) { done(e instanceof Error ? e.message : "Kaydedilemedi"); } } return <form className={styles.settingsForm} onSubmit={submit}><h3>Marka Hafızası</h3><label>Marka tonu<input name="tone" defaultValue={String(brand.tone || "")} /></label><label>Hedef kitle<input name="audience" defaultValue={String(brand.audience || "")} /></label><label>Markayı tanımla<textarea name="description" defaultValue={String(brand.description || "")} /></label><label>Kullanılacak ifadeler<input name="preferred" defaultValue={Array.isArray(brand.preferred_phrases) ? brand.preferred_phrases.join(", ") : ""} /></label><label>Kaçınılacak ifadeler<input name="avoided" defaultValue={Array.isArray(brand.avoided_phrases) ? brand.avoided_phrases.join(", ") : ""} /></label><label className={styles.check}><input name="approval" type="checkbox" defaultChecked={Boolean(brand.require_calendar_approval)} /> Takvime eklemeden önce onay iste</label><button>Değişiklikleri kaydet</button></form>; }

const providers = ["instagram","threads","linkedin","facebook","bluesky","substack","youtube","tiktok","mastodon","pinterest","google_business","twitter"];
function Accounts({ accounts, done }: { accounts: Row[]; done: (message: string) => void }) { const api = useApi(); const [provider,setProvider]=useState("instagram"); async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);try{await api("/api/v1/social-accounts",{method:"POST",body:JSON.stringify({provider,display_name:f.get("display_name"),credential:f.get("credential")})});e.currentTarget.reset();done("Sosyal hesap güvenli biçimde bağlandı");}catch(e){done(e instanceof Error?e.message:"Bağlanamadı");}} async function remove(id:string){try{await api(`/api/v1/social-accounts/${id}`,{method:"DELETE"});done("Bağlantı kaldırıldı");}catch(e){done(e instanceof Error?e.message:"Kaldırılamadı");}} return <div><h3>Bağlı Hesaplar</h3><div className={styles.accountGrid}>{accounts.map(a=><article key={a.id}><b>{value(a,"display_name")}</b><span>{value(a,"provider")} · {value(a,"status")}</span><button onClick={()=>remove(a.id)}>Kaldır</button></article>)}</div><form className={styles.inlineForm} onSubmit={submit}><select value={provider} onChange={e=>setProvider(e.target.value)}>{providers.map(p=><option key={p}>{p}</option>)}</select><input name="display_name" placeholder="Hesap adı" required/><input name="credential" type="password" placeholder="Access token / API key" minLength={8} required/><button>Güvenli bağla</button></form><p className={styles.hint}>Kimlik bilgisi AES-256-GCM ile şifrelenir; API cevaplarında hiçbir zaman geri gönderilmez.</p></div>; }
function WorkspaceForm({workspace,done}:{workspace:Bootstrap["workspace"];done:(m:string)=>void}){const api = useApi();async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);try{await api("/api/v1/settings",{method:"PATCH",body:JSON.stringify({workspace_name:f.get("name")})});done("Çalışma alanı güncellendi");}catch(e){done(e instanceof Error?e.message:"Kaydedilemedi");}}return <form className={styles.settingsForm} onSubmit={submit}><h3>Çalışma Alanı</h3><label>Ad<input name="name" defaultValue={workspace.name}/></label><label>Plan<input disabled value={workspace.plan}/></label><button>Kaydet</button></form>}

function Composer({ close, done }: { close: () => void; done: (message: string) => void }) {
  const api = useApi();
  const [busy,setBusy]=useState(false);
  const [body,setBody]=useState("");
  const [minDate] = useState(() => new Date(Date.now()+60000).toISOString().slice(0,16));
  async function polish(){if(!body.trim())return;setBusy(true);try{const result=await api<{text:string}>("/api/v1/actions",{method:"POST",body:JSON.stringify({action:"professionalize",text:body})});setBody(result.text);}catch(e){done(e instanceof Error?e.message:"AI işlemi başarısız");}finally{setBusy(false);}}
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);const f=new FormData(e.currentTarget);const scheduled=String(f.get("scheduled_at")||"");try{const post=await api<Row>("/api/v1/resources/posts",{method:"POST",body:JSON.stringify({title:f.get("title"),body,channel_keys:f.getAll("channels"),status:"draft"})});if(scheduled)await api("/api/v1/actions",{method:"POST",body:JSON.stringify({action:"schedule_post",post_id:post.id,scheduled_at:new Date(scheduled).toISOString()})});done(scheduled?"Gönderi planlandı":"Taslak kaydedildi");}catch(e){done(e instanceof Error?e.message:"Kaydedilemedi");}finally{setBusy(false);}}
  return <div className={styles.modal}><form onSubmit={submit}><header><div><span>CREATE</span><h2>Gönderi oluştur</h2></div><button type="button" onClick={close}>×</button></header><label>Başlık<input name="title" maxLength={160} required /></label><label>Gönderi metni<textarea name="body" rows={9} value={body} onChange={e=>setBody(e.target.value)} /></label><button type="button" onClick={polish} disabled={busy||!body.trim()}>✦ AI ile profesyonelleştir</button><fieldset><legend>Kanallar</legend>{providers.map(p=><label key={p}><input type="checkbox" name="channels" value={p}/>{p}</label>)}</fieldset><label>Planlama tarihi<input type="datetime-local" name="scheduled_at" min={minDate}/></label><footer><button type="button" onClick={close}>Vazgeç</button><button disabled={busy}>{busy?"Kaydediliyor…":"Kaydet / Planla"}</button></footer></form></div>;
}
function Empty({ text }: { text: string }) { return <div className={styles.empty}><span>✦</span><p>{text}</p></div>; }

function WorkspaceAI({ open, toggle, navigate }: { open: boolean; toggle: () => void; navigate: (view: View) => void }) {
  const api = useApi();
  const [messages,setMessages]=useState<Array<{role:"user"|"assistant";text:string;suggested_view?:View|null}>>([]);
  const [draft,setDraft]=useState(""); const [busy,setBusy]=useState(false);
  async function send(){if(!draft.trim()||busy)return;const message=draft.trim();const history=messages.map(({role,text})=>({role,text}));setMessages(items=>[...items,{role:"user",text:message}]);setDraft("");setBusy(true);try{const result=await api<{reply:string;suggested_view:View|null}>("/api/v1/actions",{method:"POST",body:JSON.stringify({action:"assistant_chat",message,history})});setMessages(items=>[...items,{role:"assistant",text:result.reply,suggested_view:result.suggested_view}]);}catch(e){setMessages(items=>[...items,{role:"assistant",text:e instanceof Error?e.message:"AI yanıt veremedi."}]);}finally{setBusy(false);}}
  return <><button className={aiStyles.aiBubble} onClick={toggle} aria-expanded={open}><Image src="/UI/UX/publeai.svg" alt="" width={28} height={30}/><span>Puble AI</span></button>{open?<section className={aiStyles.aiPanel}><header><Image src="/UI/UX/publeai.svg" alt="Puble AI" width={27} height={30}/><div><b>Puble AI</b><small>Çalışma alanı asistanın</small></div><button onClick={toggle}>×</button></header><div className={aiStyles.aiMessages}>{messages.length?messages.map((m,i)=><article className={m.role==="user"?aiStyles.aiUser:""} key={i}><p>{m.text}</p>{m.suggested_view?<button onClick={()=>navigate(m.suggested_view!)}>İlgili alanı aç →</button>:null}</article>):<Empty text="Planını, içeriklerini veya konuşmalarını sor."/>}{busy?<span>Yanıt hazırlanıyor…</span>:null}</div><footer><input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")void send();}} placeholder="Bir şey sor…"/><button onClick={send} disabled={busy}>→</button></footer></section>:null}</>;
}
