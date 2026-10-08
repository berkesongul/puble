import Image from "next/image";
import { SiteHeader } from "@/components/site-header";

const flows = [
  { number: "01", title: "Connect", eyebrow: "Hesaplarını bağla", text: "Tüm sosyal kanallarını tek bir çalışma alanında buluştur.", color: "blue" },
  { number: "02", title: "Communicate", eyebrow: "Konuşmaları yönet", text: "Mesajlarını tek gelen kutusundan yönet, AI ile profesyonelleştir.", color: "indigo" },
  { number: "03", title: "Create", eyebrow: "İçeriğini üret", text: "Temel editör, akıllı düzenleme ve Creator template'leriyle üret.", color: "purple" },
  { number: "04", title: "Plan", eyebrow: "Takvimi doldur", text: "Konuşmalarından içerik fırsatları çıkar, doğru ana planla.", color: "mint" },
] as const;

const creators = [
  { handle: "@studioform", pack: "Gradient Reel Pack", tone: "purple" },
  { handle: "@mira.design", pack: "Launch Story Kit", tone: "mint" },
  { handle: "@motionlab", pack: "Minimal Motion Set", tone: "blue" },
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

export default function Home() {
  return (
    <main>
      <a className="skip-link" href="#content">İçeriğe geç</a>

      <SiteHeader />

      <section className="hero" id="top">
        <div className="hero-orb hero-orb-one" /><div className="hero-orb hero-orb-two" />
        <div className="shell hero-grid" id="content">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" />Sosyal çalışma alanın</div>
            <h1>Sosyal medyayı<span> yönetmekten fazlası.</span></h1>
            <p className="hero-lead">Mesajlarını yönet, içeriğini üret ve konuşmalarından otomatik bir yayın planı çıkar. Hepsi tek bir akışta.</p>
            <div className="hero-actions">
              <a className="button button-mint" href="#product">Puble&apos;ı keşfet <ArrowIcon /></a>
              <a className="text-link" href="#flow">Nasıl çalıştığını gör</a>
            </div>
            <div className="hero-proof" aria-label="Puble ürün özellikleri">
              <span>Tek gelen kutusu</span><span>AI içerik akışı</span><span>Creator ekosistemi</span>
            </div>
          </div>

          <div className="product-stage" aria-label="Puble ürün önizlemesi">
            <div className="stage-grid" />
            <div className="app-window">
              <div className="app-topbar">
                <span className="mini-logo">puble</span><div className="window-dots"><i /><i /><i /></div><span className="avatar">BK</span>
              </div>
              <div className="app-body">
                <aside className="app-sidebar">
                  <span className="side-active"><i>●</i> Inbox</span><span><i>◆</i> Editor</span><span><i>▣</i> Planner</span><span><i>✦</i> Social</span><span className="side-bottom"><i>⚙</i> Ayarlar</span>
                </aside>
                <div className="conversation-list">
                  <div className="list-heading"><b>Gelen kutusu</b><em>12</em></div>
                  <div className="conversation active"><span className="conversation-avatar purple">MS</span><div><b>Mira Studio</b><small>Lansman tarihi netleşti...</small></div><time>14:02</time></div>
                  <div className="conversation"><span className="conversation-avatar mint">SF</span><div><b>Studio Form</b><small>Story paketini ilettim.</small></div><time>12:48</time></div>
                  <div className="conversation"><span className="conversation-avatar blue">ML</span><div><b>Motion Lab</b><small>Videoyu TikTok&apos;a da...</small></div><time>11:20</time></div>
                </div>
                <div className="chat-panel">
                  <div className="chat-heading"><div><b>Mira Studio</b><small>Instagram · Aktif</small></div><button aria-label="Daha fazla seçenek">•••</button></div>
                  <div className="messages">
                    <div className="bubble bubble-in">Yeni ürün 15 Ekim&apos;de çıkıyor.</div>
                    <div className="bubble bubble-out">Harika! İki gün önce teaser paylaşalım.</div>
                    <div className="ai-suggestion"><span><SparkIcon /></span><div><b>4 içerik fırsatı bulduk</b><small>Takvimine eklemeye hazır.</small></div><button>Görüntüle</button></div>
                  </div>
                  <div className="composer"><span>Mesajını yaz...</span><button><SparkIcon /> Profesyonelleştir</button><i>➤</i></div>
                </div>
              </div>
            </div>
            <div className="floating-card floating-calendar"><span className="floating-icon"><CalendarIcon /></span><div><small>Takvime eklendi</small><b>13 Ekim · 18:00</b><em>Instagram + TikTok</em></div></div>
            <div className="floating-card floating-social"><span className="live-dot" /><div><small>Bağlı hesaplar</small><b>Instagram · TikTok · LinkedIn</b></div></div>
          </div>
        </div>
        <div className="hero-marquee" aria-hidden="true"><span>CONNECT</span><i>✦</i><span>COMMUNICATE</span><i>✦</i><span>CREATE</span><i>✦</i><span>PLAN</span></div>
      </section>

      <section className="flow-section" id="flow">
        <div className="shell">
          <div className="section-heading split-heading">
            <div><span className="section-index">01 / TEK AKIŞ</span><h2>Tek panel. Dört akış.<br />Tek alışkanlık.</h2></div>
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
            <span className="section-index">02 / PROFESYONELLEŞTİR</span><h2>Senin tonun.<br />Markanın dili.</h2>
            <p>Nasıl yazarsan yaz, Puble mesajını tek dokunuşla profesyonel ve güven veren bir dile dönüştürür.</p>
            <ul><li><i>✓</i> Ayrı bir AI ekranı yok</li><li><i>✓</i> Göndermeden önce tam kontrol</li><li><i>✓</i> Her kanalda tutarlı marka dili</li></ul>
          </div>
        </div>
      </section>

      <section className="planner-section">
        <div className="shell planner-grid">
          <div className="planner-copy">
            <span className="section-index light">03 / KONUŞMADAN TAKVİME</span><h2>Bir konuşma,<br />bir aylık fırsat.</h2>
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
            <div><span className="section-index">04 / SOCIAL</span><h2>Keşfet. Takip et.<br />Birlikte üret.</h2></div>
            <p>Creator ekosistemindeki özgün template&apos;leri keşfet ve tek dokunuşla kendi editörüne taşı.</p>
          </div>
          <div className="creator-layout">
            <div className="creator-list">
              {creators.map((creator, index) => (
                <article className="creator-row" key={creator.handle}>
                  <span className={`creator-avatar ${creator.tone}`}>{creator.handle.slice(1, 3).toUpperCase()}</span>
                  <div><small>{creator.handle}</small><b>{creator.pack}</b></div><em>CREATOR</em><button>Template&apos;i kullan <ArrowIcon /></button><span className="creator-number">0{index + 1}</span>
                </article>
              ))}
            </div>
            <div className="creator-profile">
              <div className="profile-cover"><Image src="/assets/Amblem.svg" alt="Puble amblemi" width={266} height={408} unoptimized /></div>
              <div className="profile-body"><span className="profile-avatar">SF</span><div><small>@studioform</small><b>24 template · 12.4K takipçi</b></div><button>Takip et</button></div>
              <div className="profile-swatches"><i /><i /><i /></div>
            </div>
          </div>
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

      <footer className="site-footer">
        <div className="shell footer-grid">
          <div><Image src="/assets/Main Logo.svg" alt="Puble" width={381} height={126} unoptimized /><p>Create. Manage. Connect.</p></div>
          <div className="footer-links"><a href="#product">Ürün</a><a href="#flow">Akış</a><a href="#creators">Creator</a></div>
          <p>© 2026 Puble. Sosyal medyayı yönetmekten fazlası.</p>
        </div>
      </footer>
    </main>
  );
}
