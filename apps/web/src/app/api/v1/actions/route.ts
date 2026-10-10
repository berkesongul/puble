import { z } from "zod";
import { requireWorkspace } from "@/lib/backend/auth";
import { ApiError, jsonCreated, jsonError, jsonOk, readJson } from "@/lib/backend/http";
import { generateStructured } from "@/lib/backend/openai";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("professionalize"), text: z.string().trim().min(1).max(10000) }),
  z.object({ action: z.literal("extract_opportunities"), conversation_id: z.string().uuid(), transcript: z.string().trim().min(1).max(30000) }),
  z.object({ action: z.literal("accept_opportunity"), opportunity_id: z.string().uuid() }),
  z.object({ action: z.literal("schedule_post"), post_id: z.string().uuid(), scheduled_at: z.string().datetime({ offset: true }) }),
  z.object({ action: z.literal("publish_post"), post_id: z.string().uuid() }),
  z.object({ action: z.literal("mark_all_notifications_read") }),
  z.object({ action: z.literal("assistant_chat"), message: z.string().trim().min(1).max(4000), history: z.array(z.object({ role: z.enum(["user","assistant"]), text: z.string().max(4000) })).max(20).default([]) }),
]);

async function incrementAiUsage(supabase: Awaited<ReturnType<typeof requireWorkspace>>["supabase"], workspaceId: string) {
  const periodStart = new Date();
  periodStart.setUTCDate(1);
  const date = periodStart.toISOString().slice(0, 10);
  const { data } = await supabase.from("usage_counters").select("ai_requests").eq("workspace_id", workspaceId).eq("period_start", date).maybeSingle();
  await supabase.from("usage_counters").upsert({ workspace_id: workspaceId, period_start: date, ai_requests: (data?.ai_requests ?? 0) + 1 }, { onConflict: "workspace_id,period_start" });
}

export async function POST(request: Request) {
  try {
    const context = await requireWorkspace();
    const { supabase, workspaceId, user } = context;
    const body = actionSchema.parse(await readJson(request));

    if (body.action === "professionalize") {
      const { data: brand } = await supabase.from("brand_profiles").select("tone, audience, description, preferred_phrases, avoided_phrases").eq("workspace_id", workspaceId).single();
      const result = await generateStructured<{ text: string }>({
        instructions: "Kullanıcının metnini anlamını değiştirmeden, doğal ve profesyonel Türkçeyle yeniden yaz. Yalnızca istenen JSON'u üret.",
        input: `Marka hafızası: ${JSON.stringify(brand)}\n\nMetin: ${body.text}`,
        name: "professionalized_message",
        schema: { type: "object", additionalProperties: false, properties: { text: { type: "string" } }, required: ["text"] },
      });
      await incrementAiUsage(supabase, workspaceId);
      return jsonOk(result);
    }

    if (body.action === "assistant_chat") {
      const [{ data: brand }, { data: posts }, { data: conversations }] = await Promise.all([
        supabase.from("brand_profiles").select("tone, audience, description").eq("workspace_id", workspaceId).single(),
        supabase.from("posts").select("title, status, scheduled_at").eq("workspace_id", workspaceId).order("updated_at", { ascending: false }).limit(20),
        supabase.from("conversations").select("participant_name, status, last_message_preview").eq("workspace_id", workspaceId).order("last_message_at", { ascending: false }).limit(20),
      ]);
      const result = await generateStructured<{ reply: string; suggested_view: string | null }>({
        instructions: "Puble çalışma alanı asistanısın. Yalnızca verilen çalışma alanı bağlamına dayan; veri uydurma. Kısa, uygulanabilir Türkçe yanıt ver. Uygunsa kullanıcının açacağı panel görünümünü öner.",
        input: JSON.stringify({ brand, posts, conversations, history: body.history, message: body.message }),
        name: "workspace_assistant_reply",
        schema: { type: "object", additionalProperties: false, properties: { reply: { type: "string" }, suggested_view: { anyOf: [{ type: "string", enum: ["overview","inbox","posts","library","planner","series","ads","analytics","social","settings"] }, { type: "null" }] } }, required: ["reply","suggested_view"] },
      });
      await incrementAiUsage(supabase, workspaceId);
      return jsonOk(result);
    }

    if (body.action === "extract_opportunities") {
      const { data: conversation } = await supabase.from("conversations").select("id").eq("id", body.conversation_id).eq("workspace_id", workspaceId).maybeSingle();
      if (!conversation) throw new ApiError(404, "Konuşma bulunamadı.", "NOT_FOUND");
      const result = await generateStructured<{ opportunities: Array<{ title: string; description: string; suggested_at: string | null; channel_keys: string[] }> }>({
        instructions: "Sosyal medya konuşmasındaki gerçek tarih, kampanya, lansman ve içerik ihtiyaçlarından uygulanabilir içerik fırsatları çıkar. Tarih yoksa suggested_at null olsun. Uydurma bilgi ekleme.",
        input: body.transcript,
        name: "content_opportunities",
        schema: { type: "object", additionalProperties: false, properties: { opportunities: { type: "array", items: { type: "object", additionalProperties: false, properties: { title: { type: "string" }, description: { type: "string" }, suggested_at: { anyOf: [{ type: "string", format: "date-time" }, { type: "null" }] }, channel_keys: { type: "array", items: { type: "string" } } }, required: ["title", "description", "suggested_at", "channel_keys"] } } }, required: ["opportunities"] },
      });
      const rows = result.opportunities.map((item) => ({ ...item, workspace_id: workspaceId, conversation_id: body.conversation_id }));
      const { data, error } = rows.length ? await supabase.from("content_opportunities").insert(rows).select("*") : { data: [], error: null };
      if (error) throw new ApiError(400, "İçerik fırsatları kaydedilemedi.");
      await incrementAiUsage(supabase, workspaceId);
      return jsonCreated(data);
    }

    if (body.action === "accept_opportunity") {
      const { data: opportunity } = await supabase.from("content_opportunities").select("*").eq("id", body.opportunity_id).eq("workspace_id", workspaceId).maybeSingle();
      if (!opportunity) throw new ApiError(404, "Fırsat bulunamadı.", "NOT_FOUND");
      const { data: post, error } = await supabase.from("posts").insert({ workspace_id: workspaceId, author_id: user.id, opportunity_id: opportunity.id, title: opportunity.title, body: opportunity.description, channel_keys: opportunity.channel_keys, scheduled_at: opportunity.suggested_at, status: opportunity.suggested_at ? "scheduled" : "draft" }).select("*").single();
      if (error) throw new ApiError(400, "Fırsat gönderiye dönüştürülemedi.");
      await supabase.from("content_opportunities").update({ status: "accepted" }).eq("id", opportunity.id).eq("workspace_id", workspaceId);
      return jsonCreated(post);
    }

    if (body.action === "schedule_post") {
      if (new Date(body.scheduled_at).getTime() <= Date.now()) throw new ApiError(422, "Planlama tarihi gelecekte olmalı.");
      const { data, error } = await supabase.from("posts").update({ status: "scheduled", scheduled_at: body.scheduled_at }).eq("id", body.post_id).eq("workspace_id", workspaceId).select("*").maybeSingle();
      if (error || !data) throw new ApiError(error ? 400 : 404, error ? "Gönderi planlanamadı." : "Gönderi bulunamadı.");
      return jsonOk(data);
    }

    if (body.action === "publish_post") {
      const { data: existing } = await supabase.from("posts").select("*").eq("id", body.post_id).eq("workspace_id", workspaceId).maybeSingle();
      if (!existing) throw new ApiError(404, "Gönderi bulunamadı.", "NOT_FOUND");
      if (!existing.channel_keys?.length) throw new ApiError(422, "Yayınlamak için en az bir kanal seçmelisiniz.", "NO_CHANNEL");
      const { data: accounts } = await supabase.from("social_accounts").select("id, provider").eq("workspace_id", workspaceId).eq("status", "connected").in("provider", existing.channel_keys ?? []);
      if (!accounts?.length) throw new ApiError(422, "Seçili kanallar için bağlı hesap bulunamadı.", "NO_CONNECTED_CHANNEL");
      const { data, error } = await supabase.from("posts").update({ status: "publishing", scheduled_at: null }).eq("id", body.post_id).eq("workspace_id", workspaceId).select("*").single();
      if (error) throw new ApiError(400, "Gönderi yayın kuyruğuna alınamadı.");
      const { error: queueError } = await supabase.from("publication_jobs").upsert(accounts.map((account) => ({ workspace_id: workspaceId, post_id: body.post_id, social_account_id: account.id, status: "queued", attempts: 0, next_attempt_at: new Date().toISOString() })), { onConflict: "post_id,social_account_id" });
      if (queueError) {
        await supabase.from("posts").update({ status: "draft" }).eq("id", body.post_id).eq("workspace_id", workspaceId);
        throw new ApiError(400, "Yayın işleri oluşturulamadı.");
      }
      await supabase.from("notifications").insert({ workspace_id: workspaceId, user_id: user.id, category: "schedule", title: "Gönderi yayın kuyruğunda", body: data.title, target: "planner" });
      return jsonOk(data);
    }

    const now = new Date().toISOString();
    const { error } = await supabase.from("notifications").update({ read_at: now }).eq("workspace_id", workspaceId).or(`user_id.is.null,user_id.eq.${user.id}`).is("read_at", null);
    if (error) throw new ApiError(400, "Bildirimler güncellenemedi.");
    return jsonOk({ read_at: now });
  } catch (error) { return jsonError(error); }
}
