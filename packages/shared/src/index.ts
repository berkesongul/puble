export type SocialProvider = "mock" | "instagram";

export type ContentOpportunity = {
  id: string;
  title: string;
  platform: string;
  scheduledAt: string | null;
  sourceConversationId: string;
};
