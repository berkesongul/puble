import { ApiError } from "./http";

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{ content?: Array<{ type?: string; text?: string; refusal?: string }> }>;
};

function extractText(response: OpenAIResponse) {
  if (response.output_text) return response.output_text;
  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "refusal") throw new ApiError(422, content.refusal || "AI isteği reddetti.", "AI_REFUSAL");
      if (content.text) return content.text;
    }
  }
  throw new ApiError(502, "AI yanıtı boş döndü.", "AI_EMPTY_RESPONSE");
}

export async function generateStructured<T>({
  instructions,
  input,
  name,
  schema,
}: {
  instructions: string;
  input: string;
  name: string;
  schema: Record<string, unknown>;
}): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new ApiError(503, "OpenAI API anahtarı yapılandırılmamış.", "AI_NOT_CONFIGURED");
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      instructions,
      input,
      text: { format: { type: "json_schema", name, strict: true, schema } },
      max_output_tokens: 1200,
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    console.error("OpenAI request failed", response.status, await response.text());
    throw new ApiError(502, "AI servisine şu anda ulaşılamıyor.", "AI_UPSTREAM_ERROR");
  }
  const parsed = (await response.json()) as OpenAIResponse;
  try {
    return JSON.parse(extractText(parsed)) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(502, "AI yanıtı işlenemedi.", "AI_INVALID_RESPONSE");
  }
}
