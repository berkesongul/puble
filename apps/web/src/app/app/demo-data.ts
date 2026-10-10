import type { Bootstrap, Row } from "./customer-app";

export const demoMessages: Record<string, Row[]> = {
  "10000000-0000-4000-8000-000000000001": [
    { id: "20000000-0000-4000-8000-000000000001", direction: "inbound", body: "Yeni koleksiyonumuz 15 Ekim'de çıkıyor. Öncesinde bir teaser hazırlayabilir miyiz?", created_at: "2026-10-10T08:10:00.000Z" },
    { id: "20000000-0000-4000-8000-000000000002", direction: "outbound", body: "Elbette. Lansman öncesi teaser ve çıkış günü için iki aşamalı bir içerik akışı hazırlayabiliriz.", created_at: "2026-10-10T08:14:00.000Z" },
  ],
  "10000000-0000-4000-8000-000000000002": [
    { id: "20000000-0000-4000-8000-000000000003", direction: "inbound", body: "Story paketini ilettim, son kontrolleri yapabilir misiniz?", created_at: "2026-10-10T07:20:00.000Z" },
  ],
};

export const demoBootstrap: Bootstrap = {
  user: { id: "00000000-0000-4000-8000-000000000001", email: "demo@puble.app", full_name: "Pig Puble", locale: "tr" },
  workspace: { id: "00000000-0000-4000-8000-000000000002", name: "Puble Demo Studio", slug: "puble-demo", plan: "pro" },
  role: "owner",
  conversations: [
    { id: "10000000-0000-4000-8000-000000000001", participant_name: "Nira Studio", participant_handle: "@nirastudio", status: "active", unread_count: 2, last_message_preview: "Yeni koleksiyonumuz 15 Ekim'de çıkıyor…", last_message_at: "2026-10-10T08:14:00.000Z" },
    { id: "10000000-0000-4000-8000-000000000002", participant_name: "Studio Form", participant_handle: "@studioform", status: "active", unread_count: 1, last_message_preview: "Story paketini ilettim.", last_message_at: "2026-10-10T07:20:00.000Z" },
    { id: "10000000-0000-4000-8000-000000000003", participant_name: "Motion Lab", participant_handle: "@motionlab", status: "active", unread_count: 0, last_message_preview: "TikTok versiyonu da hazır.", last_message_at: "2026-10-09T16:40:00.000Z" },
  ],
  posts: [
    { id: "30000000-0000-4000-8000-000000000001", title: "Yeni koleksiyon teaser", body: "Yeni akış çok yakında. Takipte kalın ✦", status: "scheduled", scheduled_at: "2026-10-13T15:00:00.000Z", updated_at: "2026-10-10T08:30:00.000Z", channel_keys: ["instagram", "tiktok"] },
    { id: "30000000-0000-4000-8000-000000000002", title: "Haftalık üretim notları", body: "Daha az dağınıklık, daha çok üretim.", status: "draft", updated_at: "2026-10-10T07:00:00.000Z", channel_keys: ["linkedin"] },
    { id: "30000000-0000-4000-8000-000000000003", title: "Creator Spotlight", body: "Bu haftanın üreticisi: Studio Form", status: "published", published_at: "2026-10-09T17:00:00.000Z", updated_at: "2026-10-09T17:00:00.000Z", channel_keys: ["instagram"] },
  ],
  assets: [
    { id: "40000000-0000-4000-8000-000000000001", title: "Lansman Kapak", kind: "image", bytes: 1824000, created_at: "2026-10-10T08:00:00.000Z" },
    { id: "40000000-0000-4000-8000-000000000002", title: "Gradient Reel", kind: "video", bytes: 12800000, created_at: "2026-10-09T15:20:00.000Z" },
    { id: "40000000-0000-4000-8000-000000000003", title: "Creator Spotlight", kind: "image", bytes: 940000, created_at: "2026-10-08T12:15:00.000Z" },
  ],
  opportunities: [
    { id: "50000000-0000-4000-8000-000000000001", conversation_id: "10000000-0000-4000-8000-000000000001", title: "Lansman Reels", description: "Yeni koleksiyon için çıkış günü Reels içeriği.", suggested_at: "2026-10-15T15:00:00.000Z", channel_keys: ["instagram", "tiktok"], status: "suggested" },
    { id: "50000000-0000-4000-8000-000000000002", conversation_id: "10000000-0000-4000-8000-000000000002", title: "Story Paket Duyurusu", description: "Hazırlanan story paketinin duyurusu.", suggested_at: "2026-10-12T10:00:00.000Z", channel_keys: ["instagram"], status: "suggested" },
  ],
  series: [
    { id: "60000000-0000-4000-8000-000000000001", name: "Pazartesi İlhamı", description: "Haftaya yaratıcı bir fikirle başla.", cadence: "weekly", active: true, next_run_at: "2026-10-12T06:30:00.000Z" },
    { id: "60000000-0000-4000-8000-000000000002", name: "Creator Radar", description: "Haftanın yükselen üreticileri.", cadence: "weekly", active: true, next_run_at: "2026-10-16T09:00:00.000Z" },
  ],
  campaigns: [
    { id: "70000000-0000-4000-8000-000000000001", name: "Koleksiyon Lansmanı", provider: "instagram", status: "active", budget: 4500, currency: "TRY", starts_at: "2026-10-08T00:00:00.000Z", metrics: { roas: 3.2 } },
    { id: "70000000-0000-4000-8000-000000000002", name: "Creator Awareness", provider: "tiktok", status: "draft", budget: 2200, currency: "TRY", starts_at: "2026-10-15T00:00:00.000Z" },
  ],
  notifications: [
    { id: "80000000-0000-4000-8000-000000000001", category: "ai", title: "Yeni AI içerik fırsatı", body: "Nira Studio konuşmasından fırsat çıkarıldı.", created_at: "2026-10-10T08:20:00.000Z", read_at: null },
    { id: "80000000-0000-4000-8000-000000000002", category: "inbox", title: "Yeni mesaj", body: "Studio Form sana mesaj gönderdi.", created_at: "2026-10-10T07:20:00.000Z", read_at: null },
    { id: "80000000-0000-4000-8000-000000000003", category: "schedule", title: "Gönderi hazır", body: "Teaser gönderisi planlandı.", created_at: "2026-10-09T18:00:00.000Z", read_at: null },
  ],
  accounts: [
    { id: "90000000-0000-4000-8000-000000000001", provider: "instagram", display_name: "@publeapp", status: "connected" },
    { id: "90000000-0000-4000-8000-000000000002", provider: "linkedin", display_name: "Puble", status: "connected" },
    { id: "90000000-0000-4000-8000-000000000003", provider: "tiktok", display_name: "@puble", status: "connected" },
    { id: "90000000-0000-4000-8000-000000000004", provider: "youtube", display_name: "Puble Studio", status: "connected" },
  ],
  analytics: Array.from({ length: 14 }, (_, index) => ({
    id: `a0000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    day: `2026-10-${String(index + 1).padStart(2, "0")}`,
    impressions: 3100 + index * 430,
    reach: 1800 + index * 270 + (index % 3) * 420,
    engagements: 190 + index * 24,
    followers: 12140 + index * 38,
    clicks: 80 + index * 9,
  })),
  brand: { tone: "Samimi ve profesyonel", audience: "Küçük işletmeler ve bağımsız creator'lar", description: "Tek panelde iletişimden yayına uzanan üretken sosyal medya çalışma alanı.", preferred_phrases: ["akış", "üret", "kolaylaştır"], avoided_phrases: ["sınırsız garanti", "yapay zeka tarafından yazıldı"], require_calendar_approval: true },
  usage: { active_conversations: 3, ai_requests: 42, storage_bytes: 27800000, published_posts: 18 },
  creators: [
    { id: "b0000000-0000-4000-8000-000000000001", display_name: "Studio Form", handle: "studioform", follower_count: 12400, verified: true },
    { id: "b0000000-0000-4000-8000-000000000002", display_name: "Motion Lab", handle: "motionlab", follower_count: 8900, verified: true },
    { id: "b0000000-0000-4000-8000-000000000003", display_name: "Atelier K", handle: "atelierk", follower_count: 6700, verified: false },
  ],
  followed_creator_ids: ["b0000000-0000-4000-8000-000000000001"],
};
