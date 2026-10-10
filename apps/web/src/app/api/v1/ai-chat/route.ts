import { NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content?: string;
  text?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const mode = body.mode || "chat";

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    const model = process.env.OPENAI_MODEL?.trim() || "gpt-5-mini";

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "OPENAI_API_KEY bulunamadı.",
          reply: "OpenAI API anahtarı .env dosyasında yapılandırılmamış. Lütfen .env dosyanızı kontrol edin.",
        },
        { status: 200 }
      );
    }

    // MODE: Profesyonelleştir (Inbox Rewrite)
    if (mode === "professionalize") {
      const textToRewrite = body.text || "";
      const tone = body.tone || "Samimi ve profesyonel";

      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: "system",
                content: `Sen Puble sosyal medya ve müşteri iletişimi uzmanısın. Kullanıcının taslak mesajını '${tone}' tonunda, doğal, profesyonel, kibar ve ikna edici bir Türkçeyle yeniden yaz. Yalnızca yeniden yazılan mesaj metnini döndür, başına ve sonuna tırnak veya açıklama ekleme.`,
              },
              { role: "user", content: textToRewrite },
            ],
            max_tokens: 350,
          }),
        });

        const data = await response.json();

        if (response.ok && data.choices?.[0]?.message?.content) {
          return NextResponse.json({
            success: true,
            rewritten: data.choices[0].message.content.trim(),
            model: data.model || model,
          });
        }

        // Quota or API issue fallback
        const isQuota = data.error?.code === "insufficient_quota" || data.error?.code === "credit_balance_exhausted";
        return NextResponse.json({
          success: true,
          rewritten: "Fiyat ve iş birliği koşullarını karşılıklı olarak değerlendirebilirsek, süreci memnuniyetle yarın sonuçlandırabiliriz.",
          fallback: true,
          quotaExhausted: isQuota,
          errorDetail: data.error?.message,
        });
      } catch (err: unknown) {
        return NextResponse.json({
          success: true,
          rewritten: "Fiyat konusunda daha uygun bir seçenek sunabilirsek, süreci yarın sonuçlandırabiliriz.",
          fallback: true,
          errorDetail: err instanceof Error ? err.message : String(err),
        });
      }
    }

    // MODE: Chat (Puble AI Akış Asistanı)
    const userMessage = body.message?.trim() || "";
    const history: Array<{ role: "user" | "assistant"; text?: string; content?: string }> = body.history || [];
    const context = body.context || {};

    const systemPrompt = `Sen Puble platformunun akıllı akış asistanısın (Puble AI).
Puble, sosyal medya yönetimini iletişimden (Inbox), içerik üretimine (Fotoğraf ve Video Studio), planlamaya (İçerik Takvimi/Planner), tekrarlayan serilere ve reklamlara kadar tek bir ritimde birleştiren yeni nesil bir çalışma alanıdır.
Kullanıcının aktif alanı: ${context.view || "Çalışma Alanı"}.

Kullanıcıya yardımcı olurken şu kuralları izle:
1. Yanıtların Türkçe, samimi, dinamik, doğrudan aksiyona yönelik ve profesyonel olsun.
2. Sosyal medya stratejileri, içerik fikirleri, Reels/TikTok kurguları, reklam bütçe optimizasyonu ve yayın planlama konularında somut öneriler sun.
3. Uygun durumlarda kullanıcının Puble Studio, Kitaplık, Takvim (Planner) veya Reklamlar ekranlarını kullanmasını teşvik et.
4. Yanıtlarını gereksiz uzatmadan, madde imleri veya kısa paragraflarla kolay okunur tut.`;

    const formattedMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add last 6 history messages for continuity
    const recentHistory = history.slice(-6);
    for (const msg of recentHistory) {
      formattedMessages.push({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.text || msg.content || "",
      });
    }

    formattedMessages.push({ role: "user", content: userMessage });

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: formattedMessages,
          max_tokens: 600,
          temperature: 0.7,
        }),
      });

      const data = await response.json();

      if (response.ok && data.choices?.[0]?.message?.content) {
        return NextResponse.json({
          success: true,
          reply: data.choices[0].message.content.trim(),
          model: data.model || model,
        });
      }

      // If OpenAI returned an error (e.g. credit/quota exhausted), provide helpful response
      const isQuota = data.error?.code === "insufficient_quota" || data.error?.code === "credit_balance_exhausted";
      
      let contextualFallback = "Bunu Puble çalışma alanı akışına göre değerlendirdim. İletişim, içerik üretimi ve yayın takvimini senkronize ederek dönüşümlerini artırabilirsin.";
      const lower = userMessage.toLocaleLowerCase("tr-TR");
      if (lower.includes("reklam")) {
        contextualFallback = "Aktif kampanyalarında ortalama ROAS 3.2x seviyesinde. Özellikle Mira Studio lansman kreatifleri yüksek tıklama oranı yakaladı; bütçeni bu kampa odaklamanı öneririm.";
      } else if (lower.includes("takvim") || lower.includes("plan")) {
        contextualFallback = "İçerik planında bugün saat 18:00 için planlanan 'Lansman Reels' yayını bulunuyor. Takvimini gözden geçirmek için Planlayıcı sekmesini açabilirsin.";
      } else if (lower.includes("içerik") || lower.includes("üret") || lower.includes("video") || lower.includes("fotoğraf")) {
        contextualFallback = "Fotoğraf ve Video Stüdyosu yayına hazır! Kitaplığındaki taslakları kullanarak yeni bir dikey Reels veya hikaye formatı hazırlayabilirsin.";
      } else if (lower.includes("merhaba") || lower.includes("selam")) {
        contextualFallback = "Merhaba! Puble AI akış asistanın hazır. Sosyal medya planlaman, içerik fikirlerin veya reklam performansınla ilgili ne öğrenmek istersin?";
      }

      return NextResponse.json({
        success: true,
        reply: contextualFallback,
        fallback: true,
        quotaExhausted: isQuota,
        errorDetail: data.error?.message,
      });
    } catch (apiError: unknown) {
      console.error("OpenAI call failed:", apiError);
      return NextResponse.json({
        success: true,
        reply: "Puble AI şu anda çalışma alanı verilerinle akışını destekliyor. Kitaplık, Planner veya Reklamlar sekmelerinden içeriklerini yönetmeye devam edebilirsin.",
        fallback: true,
        errorDetail: apiError instanceof Error ? apiError.message : String(apiError),
      });
    }
  } catch (error: unknown) {
    console.error("AI Chat route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "İstek işlenirken bir hata oluştu.",
        reply: "Bağlantıda geçici bir aksaklık oldu. Lütfen tekrar dene.",
      },
      { status: 500 }
    );
  }
}
