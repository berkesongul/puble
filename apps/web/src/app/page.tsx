"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { copy, useSiteLanguage } from "@/components/site-language";

const flows = [
  { number: "01", title: "Connect", eyebrow: "Hesaplarını bağla", text: "Tüm sosyal kanallarını tek bir çalışma alanında buluştur.", color: "blue" },
  { number: "02", title: "Communicate", eyebrow: "Konuşmaları yönet", text: "Mesajlarını tek gelen kutusundan yönet, AI ile profesyonelleştir.", color: "indigo" },
  { number: "03", title: "Create", eyebrow: "İçeriğini üret", text: "Temel editör, akıllı düzenleme ve Creator template'leriyle üret.", color: "purple" },
  { number: "04", title: "Plan", eyebrow: "Takvimi doldur", text: "Konuşmalarından içerik fırsatları çıkar, doğru ana planla.", color: "mint" },
] as const;

const creators = [
  { handle: "@studioform", pack: "Gradient Reel Pack", tone: "blue", initials: "ST", hasBadge: true },
  { handle: "@mira.design", pack: "Launch Story Kit", tone: "mint", initials: "MI", hasBadge: false },
  { handle: "@mira.design", pack: "Launch Story Kit", tone: "purple", initials: "MI", hasBadge: false },
] as const;

const plans = [
  { name: "FREE PLAN", slug: "free", price: "0", description: "Üretmeye başlamak için ihtiyacın olan temel araçlar.", cta: "Ücretsiz Başla", groups: [
    { title: "İletişim", items: ["Ücretsiz sosyal hesap bağlantısı", "5 aktif sohbet", "Sohbet başına 50 AI kullanımı", "Mesajları Profesyonelleştir"] },
    { title: "İçerik ve planlama", items: ["Temel içerik editörü", "Kullanıma hazır şablonlar", "Otomatik içerik takvimi"] },
    { title: "Keşif ve analiz", items: ["Creator keşfi ve takip", "Temel performans analizleri"] },
  ] },
  { name: "CREATOR", slug: "creator", price: "149", description: "Düzenli üretim için daha fazla kapasite.", cta: "Creator’a Geç", groups: [
    { title: "İletişim", items: ["Ücretsiz sosyal hesap bağlantısı", "30 aktif sohbet", "Sohbet başına 100 AI kullanımı", "Mesajları Profesyonelleştir"] },
    { title: "İçerik ve planlama", items: ["Temel içerik editörü", "Kullanıma hazır şablonlar", "Otomatik içerik takvimi"] },
    { title: "Keşif ve analiz", items: ["Creator keşfi ve takip", "Gelişmiş performans analizleri"] },
  ] },
  { name: "PRO", slug: "pro", price: "299", description: "Profesyonel üretim ve müşteri yönetimi bir arada.", cta: "Pro’ya Geç", groups: [
    { title: "İletişim ve yönetim", items: ["Ücretsiz sosyal hesap bağlantısı", "70 aktif sohbet", "Sohbet başına 150 AI kullanımı", "Mesajları Profesyonelleştir", "Ekip ve müşteri yönetimi"] },
    { title: "İçerik ve otomasyon", items: ["Temel editör ve şablonlar", "Sınırlı AI düzenleme kapasitesi", "Gelişmiş AI otomasyonları", "Otomatik içerik takvimi", "4K dışa aktarma"] },
    { title: "Keşif ve analiz", items: ["Creator keşfi ve takip", "İleri performans analizleri"] },
  ] },
  { name: "STUDIO", slug: "studio", price: "699", description: "Ajanslar ve çok markalı operasyonlar için sınırsız akış.", cta: "Studio’ya Geç", groups: [
    { title: "İletişim ve yönetim", items: ["Ücretsiz sosyal hesap bağlantısı", "Sınırsız aktif sohbet", "Sohbet başına 200 AI kullanımı", "Mesajları Profesyonelleştir", "Ekip ve müşteri yönetimi"] },
    { title: "İçerik ve otomasyon", items: ["Temel editör ve şablonlar", "Sınırsız AI düzenleme kapasitesi*", "Gelişmiş AI otomasyonları", "Otomatik içerik takvimi", "4K dışa aktarma"] },
    { title: "Keşif ve analiz", items: ["Creator keşfi ve takip", "İleri performans analizleri"] },
  ], note: "*AI düzenlemede adil kullanım koşulları geçerlidir." },
] as const;

const creditPacks = [
  { tag: "Biraz daha üret", credits: "100 AI kredisi", price: "49 TL", cta: "Satın Al", featured: false },
  { tag: "Biraz daha üret", credits: "250 AI kredisi", price: "99 TL", cta: "Satın Al", featured: false },
  { tag: "Biraz daha üret", credits: "500 AI kredisi", price: "179 TL", cta: "Satın Al", featured: true },
] as const;

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5" /></svg>;
}

function SparkIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c.5 5.8 4.2 9.5 10 10-5.8.5-9.5 4.2-10 10-.5-5.8-4.2-9.5-10-10 5.8-.5 9.5-4.2 10-10Z" /></svg>;
}

function CalendarIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v3m10-3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v12H4V7a2 2 0 0 1 2-2Z" /><path d="m9 14 2 2 4-4" /></svg>;
}

type AnalyticsPeriod = "30 gün" | "90 gün" | "12 ay";

const analyticsChartData: Record<AnalyticsPeriod, {
  kpis: { label: string; trend: string; value: string; sub: string }[];
  trendSubtitle: string;
  bars: { organic: number; ads: number; date?: string }[];
  bestPost: { reach: string; engagement: string };
}> = {
  "30 gün": {
    kpis: [
      { label: "Toplam erişim", trend: "↗ %21.8", value: "593.4K", sub: "Önceki döneme göre" },
      { label: "Etkileşim", trend: "↗ %14.2", value: "42.8K", sub: "Beğeni, yorum ve paylaşım" },
      { label: "Yeni takipçi", trend: "↗ %18.6", value: "+3,284", sub: "Tüm kanallar" },
      { label: "Ort. etkileşim", trend: "↗ %0.8", value: "%6.3", sub: "Sektör ortalaması %3.9" },
    ],
    trendSubtitle: "Son 30 günde toplam erişim 593 binin üzerine çıktı.",
    bars: [
      { organic: 24, ads: 18, date: "1 Eki" },
      { organic: 34, ads: 24 },
      { organic: 26, ads: 22 },
      { organic: 40, ads: 28, date: "8 Eki" },
      { organic: 38, ads: 26 },
      { organic: 46, ads: 34 },
      { organic: 42, ads: 32, date: "15 Eki" },
      { organic: 52, ads: 38 },
      { organic: 44, ads: 30 },
      { organic: 58, ads: 42, date: "22 Eki" },
      { organic: 50, ads: 38 },
      { organic: 66, ads: 48, date: "30 Eki" },
    ],
    bestPost: { reach: "84.2K", engagement: "%9.4" },
  },
  "90 gün": {
    kpis: [
      { label: "Toplam erişim", trend: "↗ %34.2", value: "1.42M", sub: "Önceki döneme göre" },
      { label: "Etkileşim", trend: "↗ %22.4", value: "118.5K", sub: "Beğeni, yorum ve paylaşım" },
      { label: "Yeni takipçi", trend: "↗ %29.1", value: "+9,840", sub: "Tüm kanallar" },
      { label: "Ort. etkileşim", trend: "↗ %1.4", value: "%6.8", sub: "Sektör ortalaması %3.9" },
    ],
    trendSubtitle: "Son 90 günde toplam erişim 1.4 milyonun üzerine çıktı.",
    bars: [
      { organic: 30, ads: 22, date: "1 Ağu" },
      { organic: 38, ads: 26 },
      { organic: 32, ads: 24 },
      { organic: 44, ads: 30, date: "20 Ağu" },
      { organic: 42, ads: 28 },
      { organic: 50, ads: 36 },
      { organic: 48, ads: 34, date: "10 Eyl" },
      { organic: 56, ads: 40 },
      { organic: 52, ads: 36 },
      { organic: 62, ads: 46, date: "1 Eki" },
      { organic: 58, ads: 42 },
      { organic: 72, ads: 52, date: "30 Eki" },
    ],
    bestPost: { reach: "192K", engagement: "%11.2" },
  },
  "12 ay": {
    kpis: [
      { label: "Toplam erişim", trend: "↗ %82.0", value: "5.8M", sub: "Önceki döneme göre" },
      { label: "Etkileşim", trend: "↗ %64.5", value: "480K", sub: "Beğeni, yorum ve paylaşım" },
      { label: "Yeni takipçi", trend: "↗ %74.3", value: "+41.2K", sub: "Tüm kanallar" },
      { label: "Ort. etkileşim", trend: "↗ %2.1", value: "%7.2", sub: "Sektör ortalaması %3.9" },
    ],
    trendSubtitle: "Son 12 ayda organik ve reklam büyümeleri hız kesmedi.",
    bars: [
      { organic: 22, ads: 16, date: "Kas" },
      { organic: 28, ads: 20 },
      { organic: 32, ads: 24 },
      { organic: 38, ads: 26, date: "Şub" },
      { organic: 42, ads: 30 },
      { organic: 48, ads: 34 },
      { organic: 52, ads: 38, date: "May" },
      { organic: 58, ads: 42 },
      { organic: 62, ads: 44 },
      { organic: 68, ads: 48, date: "Ağu" },
      { organic: 72, ads: 50 },
      { organic: 80, ads: 56, date: "Eki" },
    ],
    bestPost: { reach: "640K", engagement: "%12.8" },
  },
};

export default function Home() {
  return <HomeContent />;
}

function HomeContent() {
  const { language } = useSiteLanguage();
  const text = copy[language];
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [analyticsPeriod, setAnalyticsPeriod] = useState<AnalyticsPeriod>("30 gün");

  const currentAnalytics = analyticsChartData[analyticsPeriod];

  useEffect(() => {
    const selectors = [
      ".flow-section .section-heading > *", ".flow-card",
      ".feature-demo", ".feature-copy > *",
      ".planner-copy > *", ".timeline-card",
      ".creator-section .section-heading > *", ".creator-card", ".creator-studio-showcase",
      ".pricing-heading > *", ".pricing-billing-toggle-wrap", ".price-card", ".pricing-note", ".credit-pack-card",
      ".final-cta .cta-content > *", ".footer-grid > *",
    ];
    const elements = selectors.flatMap((selector) => Array.from(document.querySelectorAll<HTMLElement>(selector)));
    const uniqueElements = [...new Set(elements)];
    uniqueElements.forEach((element, index) => {
      element.classList.add("scroll-reveal", index % 2 === 0 ? "reveal-left" : "reveal-right");
      element.style.setProperty("--reveal-delay", `${(index % 4) * 70}ms`);
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("reveal-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
    uniqueElements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <main>
      <a className="skip-link" href="#content">İçeriğe geç</a>

      <SiteHeader />

      <section className="hero hero-fade" id="top">
        <div className="hero-orb hero-orb-one" /><div className="hero-orb hero-orb-two" />
        <div className="shell hero-grid" id="content">
          <div className="hero-copy hero-reveal-left">
            <div className="eyebrow"><span className="eyebrow-dot" />{text.eyebrow}</div>
            <h1>{text.heroA}<span>{text.heroB}</span></h1>
            <p className="hero-lead">{text.lead}</p>
            <div className="hero-actions">
              <a className="button button-mint" href="#product">{text.discover} <ArrowIcon /></a>
              <a className="text-link" href="#flow">{text.seeHow}</a>
            </div>
            <div className="hero-proof" aria-label="Puble ürün özellikleri">
              <span>Tek gelen kutusu</span><span>AI içerik akışı</span><span>Creator ekosistemi</span>
            </div>
          </div>

          <div className="product-stage hero-reveal-right" aria-label="Puble analitik görünümü">
            <div className="stage-grid" />
            <div className="analytics-dashboard-window">
              {/* Header */}
              <div className="analytics-header">
                <div className="analytics-title-group">
                  <span className="analytics-tag">MEASURE</span>
                  <h2 className="analytics-title">Analitik</h2>
                  <p className="analytics-subtitle">Tüm kanallarının büyümesini, erişimini ve etkileşimini tek görünümde izle.</p>
                </div>
                <div className="analytics-header-actions">
                  <div className="analytics-accounts-badge">
                    <span className="analytics-pulse-dot" />
                    <span>3 hesap bağlı</span>
                  </div>
                  <Link href="/panel" className="analytics-btn-create">
                    + Yeni oluştur
                  </Link>
                </div>
              </div>

              {/* Toolbar */}
              <div className="analytics-toolbar">
                <div className="analytics-time-pills">
                  {(["30 gün", "90 gün", "12 ay"] as const).map((period) => (
                    <button
                      key={period}
                      type="button"
                      className={`analytics-pill ${analyticsPeriod === period ? "active" : ""}`}
                      onClick={() => setAnalyticsPeriod(period)}
                    >
                      {period}
                    </button>
                  ))}
                </div>
                <button type="button" className="analytics-btn-download">
                  <span className="download-arrow">↓</span> Raporu indir
                </button>
              </div>

              {/* 4 Stat Cards */}
              <div className="analytics-kpi-grid">
                {currentAnalytics.kpis.map((kpi, idx) => (
                  <div className="analytics-kpi-card" key={idx}>
                    <div className="kpi-top">
                      <span className="kpi-label">{kpi.label}</span>
                      <span className="kpi-trend">{kpi.trend}</span>
                    </div>
                    <div className="kpi-value">{kpi.value}</div>
                    <div className="kpi-sub">{kpi.sub}</div>
                  </div>
                ))}
              </div>

              {/* Main Lower Section */}
              <div className="analytics-main-grid">
                {/* Left: Trend Card */}
                <div className="analytics-trend-card">
                  <div className="trend-card-header">
                    <div>
                      <span className="trend-tag">ERİŞİM TRENDİ</span>
                      <h3 className="trend-title">Kanalların birlikte büyüyor.</h3>
                      <p className="trend-subtitle">{currentAnalytics.trendSubtitle}</p>
                    </div>
                    <div className="trend-legend">
                      <span className="legend-item">
                        <i className="legend-dot dot-organic" /> Organik
                      </span>
                      <span className="legend-item">
                        <i className="legend-dot dot-ads" /> Reklam
                      </span>
                    </div>
                  </div>

                  <div className="trend-chart-area">
                    <div className="trend-bars-container">
                      {currentAnalytics.bars.map((bar, idx) => (
                        <div className="trend-bar-col" key={idx}>
                          <div
                            className="trend-bar-stack"
                            title={`${bar.date || ''}: ${bar.organic}K Organik, ${bar.ads}K Reklam`}
                          >
                            <div className="bar-segment bar-organic" style={{ height: `${bar.organic}px` }} />
                            <div className="bar-segment bar-ads" style={{ height: `${bar.ads}px` }} />
                          </div>
                          <span className="bar-date-label">{bar.date || ""}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Best Content Card */}
                <div className="analytics-top-post-card">
                  <span className="top-post-tag">EN İYİ İÇERİK</span>

                  <div className="top-post-preview">
                    <div className="top-post-glow" />
                    <div className="top-post-preview-content">
                      <span className="preview-heading">akışını</span>
                      <span className="preview-heading">yenile.</span>
                      <span className="preview-sub">REELS · 18 EKİM</span>
                    </div>
                  </div>

                  <h4 className="top-post-title">Mira Studio lansman reels</h4>

                  <div className="top-post-stats">
                    <div className="post-stat-item">
                      <span className="stat-val">{currentAnalytics.bestPost.reach}</span>
                      <span className="stat-lbl">Erişim</span>
                    </div>
                    <div className="post-stat-item">
                      <span className="stat-val">{currentAnalytics.bestPost.engagement}</span>
                      <span className="stat-lbl">Etkileşim</span>
                    </div>
                  </div>

                  <Link href="/panel" className="top-post-view-btn">
                    İçeriği görüntüle →
                  </Link>
                </div>
              </div>

              {/* Floating Puble AI Star Badge */}
              <div className="analytics-floating-ai-trigger" title="Puble AI Asistanı">
                <span className="ai-badge-count">1</span>
                <SparkIcon />
              </div>
            </div>
          </div>
        </div>
        <div className="hero-marquee hero-reveal-up" aria-hidden="true"><span>CONNECT</span><i>✦</i><span>COMMUNICATE</span><i>✦</i><span>CREATE</span><i>✦</i><span>PLAN</span></div>
      </section>

      <section className="flow-section" id="flow">
        <div className="shell">
          <div className="section-heading split-heading">
            <div><span className="section-index">01 / FLOW</span><h2>{text.flowA}<br />{text.flowB}</h2></div>
            <p>Dağınık araçlar arasında geçiş yapmayı bırak. İletişimden yayına kadar bütün sosyal medya işini aynı ritimde ilerlet.</p>
          </div>
          <div className="flow-grid">
            {flows.map((flow) => (
              <article className={`flow-card ${flow.color}`} key={flow.number}>
                <div className="flow-top"><span>{flow.number}</span><i /></div>
                <div><small>{flow.title}</small><h3>{flow.eyebrow}</h3><p>{flow.text}</p></div>
                <span className="flow-arrow"><ArrowIcon /></span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="feature-section" id="product">
        <div className="shell feature-grid">
          <div className="feature-demo professional-demo">
            <div className="demo-label"><SparkIcon /> Akışın içinde görünmez AI</div>
            <div className="message-card raw-message"><small>Sen yazdın</small><p>abi fiyatı biraz düşürürsek yarın hallederiz</p></div>
            <div className="transform-row"><span /><b><SparkIcon /> Profesyonelleştir</b><span /></div>
            <div className="message-card polished-message"><small>Gönderime hazır</small><p>Fiyat konusunda daha uygun bir seçenek sunabilirsek, süreci yarın sonuçlandırabiliriz.</p><div><span>Kurumsal</span><span>Net</span><span>Samimi</span></div></div>
          </div>
          <div className="feature-copy">
            <span className="section-index">02 / AI</span><h2>{text.productA}<br />{text.productB}</h2>
            <p>Nasıl yazarsan yaz, Puble mesajını tek dokunuşla profesyonel ve güven veren bir dile dönüştürür.</p>
            <ul><li><i>✓</i> Ayrı bir AI ekranı yok</li><li><i>✓</i> Göndermeden önce tam kontrol</li><li><i>✓</i> Her kanalda tutarlı marka dili</li></ul>
          </div>
        </div>
      </section>

      <section className="planner-section">
        <div className="shell planner-grid">
          <div className="planner-copy">
            <span className="section-index light">03 / PLAN</span><h2>{text.plannerA}<br />{text.plannerB}</h2>
            <p>Puble; tarihler, lansmanlar ve kampanyalar arasında bağlantı kurar. İçerik fırsatlarını bulur, sen onaylayınca takvimine ekler.</p>
            <a className="button button-white" href="#waitlist">Akışı deneyimle <ArrowIcon /></a>
          </div>
          <div className="timeline-card">
            <div className="timeline-head"><span>Ekim içerik planı</span><em>4 fırsat</em></div>
            <div className="timeline-item"><time><b>13</b>Eki</time><span className="timeline-line purple" /><div><small>TEASER</small><b>Lansman yaklaşıyor</b><em>Instagram · 18:00</em></div><i>✓</i></div>
            <div className="timeline-item"><time><b>15</b>Eki</time><span className="timeline-line mint" /><div><small>LANSMAN</small><b>Yeni ürün yayında</b><em>Instagram + TikTok</em></div><i>✓</i></div>
            <div className="timeline-item"><time><b>18</b>Eki</time><span className="timeline-line blue" /><div><small>KAMPANYA</small><b>İlk hafta indirimi</b><em>Tüm kanallar</em></div><i>+</i></div>
            <div className="timeline-source"><SparkIcon /><span>“Ürün 15 Ekim&apos;de çıkıyor.” konuşmasından oluşturuldu.</span></div>
          </div>
        </div>
      </section>

      <section className="creator-section" id="creators">
        <div className="shell">
          <div className="section-heading split-heading">
            <div><span className="section-index">04 / SOCIAL</span><h2>{text.creatorA}<br />{text.creatorB}</h2></div>
            <p>Creator ekosistemindeki özgün template&apos;leri keşfet ve tek dokunuşla kendi editörüne taşı.</p>
          </div>
          <div className="creator-layout">
            <div className="creator-list">
              {creators.map((creator, index) => (
                <article className="creator-card" key={index}>
                  <div className="creator-card-left">
                    <div className={`creator-avatar-wrap ${creator.tone}`}>
                      <span className="creator-avatar-initials">{creator.initials}</span>
                      {creator.hasBadge && <span className="creator-avatar-badge" />}
                    </div>
                    <div className="creator-card-info">
                      <span className="creator-handle">{creator.handle}</span>
                      <h3 className="creator-pack">{creator.pack}</h3>
                    </div>
                  </div>
                  <div className="creator-card-right">
                    <Link href="/panel" className="creator-use-btn">
                      Template&apos;i kullan
                    </Link>
                    <span className="creator-hashtag">#creator</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="creator-studio-showcase">
              <div className="studio-cover-banner">
                <div className="studio-cover-overlay" />
              </div>

              <div className="studio-profile-bar">
                <div className="studio-profile-left">
                  <div className="studio-avatar">PU</div>
                  <div className="studio-meta">
                    <h3 className="studio-brand-title">Puble <b>STUDIO</b></h3>
                    <p className="studio-stats">24 Template · 1,569 Takipçi</p>
                  </div>
                </div>
                <Link href="/panel" className="studio-follow-btn">
                  Takip Et
                </Link>
              </div>

              <div className="studio-palette-grid">
                <div className="palette-tile tile-mint" />
                <div className="palette-tile tile-purple" />
                <div className="palette-tile tile-deepblue" />
                <div className="palette-tile tile-purple" />
                <div className="palette-tile tile-deepblue" />
                <div className="palette-tile tile-mint" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing-section" id="pricing">
        <div className="shell">
          <h2 className="sr-only">{text.pricingA} {text.pricingB}</h2>

          <div className="pricing-billing-toggle-wrap">
            <div className="pricing-billing-toggle" role="group" aria-label="Faturalandırma periyodu">
              <button
                type="button"
                className={`pricing-billing-tab ${billingPeriod === "monthly" ? "active" : ""}`}
                onClick={() => setBillingPeriod("monthly")}
              >
                Aylık
              </button>
              <button
                type="button"
                className={`pricing-billing-tab ${billingPeriod === "yearly" ? "active" : ""}`}
                onClick={() => setBillingPeriod("yearly")}
              >
                <span>Yıllık</span>
                <span className="pricing-discount-badge">%20 İndirim</span>
              </button>
            </div>
          </div>

          <div className="pricing-grid">
            {plans.map((plan) => (
              <article className={`price-card price-card-${plan.slug}`} key={plan.name}>
                <div className="price-card-head"><span>{plan.name}</span><p>{plan.description}</p></div>
                <a href="/auth?mode=signup">{plan.cta}</a>
                <div className="price">
                  <div className="price-content">
                    {billingPeriod === "yearly" && plan.price !== "0" ? (
                      <span className="price-old">{plan.price} TL</span>
                    ) : (
                      <span className="price-old price-old-spacer" aria-hidden="true" />
                    )}
                    <div className="price-main">
                      <b>
                        {billingPeriod === "yearly" && plan.price !== "0"
                          ? `${Math.round(Number(plan.price) * 0.8)} TL`
                          : `${plan.price} TL`}
                      </b>
                      <span>/ay</span>
                    </div>
                  </div>
                </div>
                <div className="price-groups">{plan.groups.map((group) => <section key={group.title}>
                  <h3><i>✓</i>{group.title}</h3>
                  <ul>{group.items.map((feature) => <li key={feature}>{feature}</li>)}</ul>
                </section>)}</div>
                {"note" in plan ? <small className="price-note">{plan.note}</small> : null}
              </article>
            ))}
          </div>

          <div className="credit-packs-grid" aria-label="Ek AI kredi paketleri">
            {creditPacks.map((pack) => (
              <article className={`credit-pack-card ${pack.featured ? "credit-pack-featured" : ""}`} key={pack.credits}>
                <div className="credit-pack-watermark" aria-hidden="true">
                  <Image src="/assets/Amblem.svg" alt="" width={120} height={160} unoptimized />
                </div>
                <div className="credit-pack-content">
                  <span className="credit-pack-tag">{pack.tag}</span>
                  <h3 className="credit-pack-title">{pack.credits}</h3>
                  <div className="credit-pack-bottom">
                    <b className="credit-pack-price">{pack.price}</b>
                    <a className="credit-pack-btn" href="/auth?mode=signup">{pack.cta}</a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p className="pricing-note">Fiyatlar lansman öncesi taslaktır; kullanıcı görüşmeleri ve kullanım maliyetlerine göre güncellenebilir.</p>
        </div>
      </section>

      <section className="final-cta" id="waitlist">
        <div className="cta-grid" />
        <div className="shell cta-content">
          <Image src="/assets/Amblem.svg" alt="" width={266} height={408} unoptimized />
          <span className="section-index light">PUBLE İLE TANIŞ</span><h2>Daha az yönet.<br /><span>Daha çok üret.</span></h2>
          <p>Yeni nesil sosyal çalışma alanının ilk kullanıcıları arasında yerini al.</p>
          <form className="waitlist-form"><label className="sr-only" htmlFor="email">E-posta adresi</label><input id="email" type="email" placeholder="E-posta adresin" /><button type="submit">Listeye katıl <ArrowIcon /></button></form>
          <small>Spam yok. Sadece lansman ve erken erişim haberleri.</small>
        </div>
      </section>

      <footer className="site-footer" id="corporate">
        <div className="shell footer-grid">
          <div><Image src="/assets/Main Logo.svg" alt="Puble" width={381} height={126} unoptimized /><p>Create. Manage. Connect.</p></div>
          <div className="footer-links">
            <Link href="/#product">Ürün</Link>
            <Link href="/#flow">Akış</Link>
            <Link href="/#creators">Creator</Link>
            <Link href="/#pricing">Pricing</Link>
            <Link href="/kurumsal">Kurumsal</Link>
            <Link href="/kvkk">{text.kvkk}</Link>
          </div>
          <p>© 2026 Puble. Sosyal medyayı yönetmekten fazlası.</p>
        </div>
      </footer>
    </main>
  );
}
