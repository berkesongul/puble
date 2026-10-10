import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import styles from "./kurumsal.module.css";

export const metadata: Metadata = {
  title: "Kurumsal & Marka Kimliği | Puble",
  description:
    "Puble kurumsal bilgileri, vizyonu, misyonu, 4 temel akışı, resmi logosu, amblemi ve marka tasarım sistemi.",
};

const socialPlatforms = [
  { name: "Instagram", icon: "/assets/app_icons/instagram.png" },
  { name: "LinkedIn", icon: "/assets/app_icons/linkedin.png" },
  { name: "X", icon: "/assets/app_icons/x.png" },
  { name: "TikTok", icon: "/assets/app_icons/tiktok.png" },
  { name: "Threads", icon: "/assets/app_icons/threads.png" },
  { name: "YouTube", icon: "/assets/app_icons/youtube.png" },
  { name: "Bluesky", icon: "/assets/app_icons/bluesky.png" },
  { name: "Pinterest", icon: "/assets/app_icons/pinterest.png" },
];

const brandColors = [
  {
    name: "Deep Blue",
    hex: "#0002A1",
    desc: "Güven, odak ve derinlik. Kurumsal zemin ve ana marka tonumuz.",
    bg: "#0002A1",
  },
  {
    name: "Indigo",
    hex: "#332FD0",
    desc: "Hız, akış ve verimlilik. Aktif elementler ve geçişler.",
    bg: "#332FD0",
  },
  {
    name: "Purple",
    hex: "#836FFF",
    desc: "Yaratıcılık, Puble AI asistanı ve Creator ekosistemi.",
    bg: "#836FFF",
  },
  {
    name: "Neon Mint",
    hex: "#15F5BA",
    desc: "Fırsat, canlılık ve büyüme. Vurgu butonları ve onaylar.",
    bg: "#15F5BA",
  },
];

export default function KurumsalPage() {
  return (
    <div className={styles.page}>
      {/* Unified Site Header with brand navigation, language picker & auth */}
      <SiteHeader />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroGlowMint} />
        <div className={styles.heroGlowPurple} />

        <div className={`${styles.shell} ${styles.heroGrid}`}>
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              <span>HAKKIMIZDA · KURUMSAL</span>
            </div>
            <h1>
              Sosyal medyayı <span>yönetmekten fazlası.</span>
            </h1>
            <p className={styles.heroLead}>
              Puble; mesajlaşmayı, zengin içerik üretimini, AI ile profesyonelleştirmeyi, konuşmalardan otomatik takvim çıkarmayı ve Creator ekosistemini tek bir çatı altında toplayan yeni nesil sosyal çalışma alanıdır.
            </p>
            <div className={styles.heroMeta}>
              <span>Techstars Startup Weekend Urla</span>
              <span>Create. Manage. Connect.</span>
              <span>İzmir, Türkiye</span>
            </div>
            <div className={styles.heroActions}>
              <Link className={styles.primaryCta} href="/panel">
                <span>✦</span> Panele Başla
              </Link>
              <a className={styles.secondaryCta} href="#vizyon-misyon">
                Vizyon & Akışı İncele ↓
              </a>
            </div>
          </div>

          {/* Hero Brand Showcase Stage */}
          <div className={styles.heroStage}>
            <div className={styles.brandStageCard}>
              <div className={styles.stageWatermark} aria-hidden="true">
                <Image src="/assets/Amblem.svg" alt="" width={220} height={337} unoptimized />
              </div>

              <div className={styles.stageHeader}>
                <div className={styles.stageLogo}>
                  <Image src="/assets/Main Logo.svg" alt="Puble" width={381} height={126} priority unoptimized />
                </div>
                <div className={styles.stageAiBadge}>
                  <Image src="/UI/UX/publeai.svg" alt="" width={15} height={16} unoptimized />
                  <span>Puble AI Studio</span>
                </div>
              </div>

              <div className={styles.stageEmblemRow}>
                <div className={styles.stageEmblemWrap}>
                  <Image src="/assets/Amblem.svg" alt="Puble Amblem" width={90} height={138} unoptimized />
                </div>
                <div className={styles.stageTagline}>
                  <b>Create. Manage. Connect.</b>
                  <span>Dağınık araçları tek bir sezgisel çalışma standardında birleştiren tasarım dili.</span>
                </div>
              </div>

              <div className={styles.stageGradientBar} title="Puble 4-Stop Gradient" />

              <div className={styles.stageStatsGrid}>
                <div className={styles.stageStat}>
                  <b>12</b>
                  <small>Sosyal Kanal</small>
                </div>
                <div className={styles.stageStat}>
                  <b>4</b>
                  <small>Temel Akış</small>
                </div>
                <div className={styles.stageStat}>
                  <b>Urla &apos;26</b>
                  <small>Girişim Ruhu</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout with Sticky Subnav */}
      <div className={`${styles.shell} ${styles.layout}`}>
        <aside className={styles.navigation} aria-label="Sayfa içi gezinme">
          <div className={styles.navHeader}>
            <Image src="/UI/UX/publeai.svg" alt="" width={16} height={17} unoptimized />
            <strong>İçindekiler</strong>
          </div>
          <a href="#vizyon-misyon">01 · Vizyon & Misyon</a>
          <a href="#dort-akis">02 · Dört Temel Akış</a>
          <a href="#marka-kimligi">03 · Marka Varlıkları & Kimlik</a>
          <a href="#degerlerimiz">04 · Değerlerimiz & İlkelerimiz</a>
          <a href="#hikayemiz">05 · Hikayemiz & Urla</a>
          <a href="#iletisim">06 · İletişim & Kurumsal</a>
        </aside>

        <article className={styles.content}>
          {/* Highlight Banner */}
          <div className={styles.highlightBox}>
            <div className={styles.highlightWatermark} aria-hidden="true">
              <Image src="/assets/Amblem.svg" alt="" width={140} height={215} unoptimized />
            </div>
            <div className={styles.highlightIcon}>
              <Image src="/UI/UX/publeai.svg" alt="" width={28} height={30} unoptimized />
            </div>
            <div>
              <strong>Tek panel. Dört akış. Tek alışkanlık.</strong>
              <p>
                Sosyal medya yönetimi bugün birbirine yabancı araçlara bölünmüş durumda: bir yanda mesajlaşma bildirimleri, diğer yanda ağır tasarım editörleri, ayrı takvim yazılımları ve keşif platformları. Puble tüm bu dağınıklığı ortadan kaldırarak günlük üretimi tek bir doğal ritimde toplar.
              </p>
            </div>
          </div>

          {/* 01 · Vizyon & Misyon */}
          <section id="vizyon-misyon">
            <span className={styles.index}>01</span>
            <h2>Vizyon & Misyon</h2>
            <p>
              Puble, sosyal medyada varlık gösteren bağımsız kreatörlerden butik ajanslara ve işletmelere kadar herkesin dijital sesini güçlendirmek için kuruldu.
            </p>

            <div className={styles.visionMissionGrid}>
              <article className={styles.vmCard}>
                <div className={styles.vmCardIcon}>
                  <Image src="/UI/icons/marka-hafizasi.svg" alt="" width={24} height={24} unoptimized />
                </div>
                <h3>Vizyonumuz</h3>
                <p>
                  Sosyal medyada varlık gösteren üreticilerin ve markaların, onlarca farklı yazılım arasında vakit kaybetmeden tek ekrandan tüm dijital iletişimini yönettiği global çalışma standardı olmak.
                </p>
              </article>

              <article className={styles.vmCard}>
                <div className={styles.vmCardIcon}>
                  <Image src="/UI/icons/ai-firsat.svg" alt="" width={24} height={24} unoptimized />
                </div>
                <h3>Misyonumuz</h3>
                <p>
                  Günlük müşteri konuşmalarını doğrudan içerik fırsatlarına ve yayın takvimine dönüştürmek; yapay zekayı karmaşık bir teknoloji değil, akışın içinde tek dokunuşla çalışan görünmez ve güvenilir bir profesyonelleştirme ortağı olarak sunmaktır.
                </p>
              </article>
            </div>
          </section>

          {/* 02 · Dört Temel Akış */}
          <section id="dort-akis">
            <span className={styles.index}>02</span>
            <h2>Dört Temel Akış</h2>
            <p>
              Puble mimarisi, bir sosyal medya yöneticisinin günlük rutinindeki dört kritik evreyi birbirine bağlayan kesintisiz bir döngüdür:
            </p>

            <div className={styles.pillarsGrid}>
              {/* Pillar 1: Connect */}
              <article className={styles.pillarCard}>
                <div className={styles.pillarTop}>
                  <span className={styles.pillarBadge}>01 · Connect</span>
                </div>
                <h3>Hesapları Bağla</h3>
                <p>Instagram, LinkedIn, X, TikTok, YouTube ve Threads dahil 12 platformu tek güvenli çalışma merkezinde toplayın.</p>
                <div className={styles.pillarVisual}>
                  <div className={styles.channelMiniGrid} aria-label="Bağlı kanallar">
                    {socialPlatforms.map((p) => (
                      <div className={styles.channelIconChip} key={p.name} title={p.name}>
                        <Image src={p.icon} alt={p.name} width={18} height={18} unoptimized />
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              {/* Pillar 2: Communicate */}
              <article className={styles.pillarCard}>
                <div className={styles.pillarTop}>
                  <span className={styles.pillarBadge}>02 · Communicate</span>
                </div>
                <h3>Tek Gelen Kutusu</h3>
                <p>Tüm kanallardan gelen mesajları tek gelen kutusunda yönetin; müşteri yanıtlarını tek tıkla profesyonelleştirin.</p>
                <div className={styles.pillarVisual}>
                  <div className={styles.inboxVisualSnippet}>
                    <div className={styles.inboxSnippetPill}>
                      <Image src="/UI/UX/gelen_kutusu.svg" alt="" width={16} height={16} unoptimized />
                      <span>Gelen Kutusu (12)</span>
                    </div>
                    <span className={styles.inboxProBtn}>
                      <Image src="/UI/chat_box/profesyonellestir.svg" alt="" width={12} height={12} unoptimized />
                      ✦ Profesyonelleştir
                    </span>
                  </div>
                </div>
              </article>

              {/* Pillar 3: Create */}
              <article className={styles.pillarCard}>
                <div className={styles.pillarTop}>
                  <span className={styles.pillarBadge}>03 · Create</span>
                </div>
                <h3>Puble Studio & Üretim</h3>
                <p>Fotoğraf ve video stüdyosu, CapCut stili zaman çizelgesi, hazır Creator şablonları ve Puble AI asistanı ile üretin.</p>
                <div className={styles.pillarVisual}>
                  <div className={styles.studioSnippetPill}>
                    <Image src="/UI/icons/kitaplik.svg" alt="" width={18} height={18} unoptimized />
                    <span>Fotoğraf & Video Editörü</span>
                    <span>✦ AI Destekli</span>
                  </div>
                </div>
              </article>

              {/* Pillar 4: Plan */}
              <article className={styles.pillarCard}>
                <div className={styles.pillarTop}>
                  <span className={styles.pillarBadge}>04 · Plan</span>
                </div>
                <h3>Konuşmadan Takvime</h3>
                <p>Sohbetlerde geçen ürün tarihleri ve duyurulardan otomatik içerik fırsatları çıkarıp takviminize işleyin.</p>
                <div className={styles.pillarVisual}>
                  <div className={styles.plannerSnippetPill}>
                    <Image src="/UI/icons/yaklasan-yayin.svg" alt="" width={18} height={18} unoptimized />
                    <span>Otomatik İçerik Takvimi</span>
                    <span>Bugün 18:00</span>
                  </div>
                </div>
              </article>
            </div>
          </section>

          {/* 03 · Marka Kimliği & Varlıkları (New dedicated showcase) */}
          <section id="marka-kimligi" className={styles.assetsSection}>
            <span className={styles.index}>03</span>
            <h2>Marka Varlıkları & Tasarım Dili</h2>
            <p>
              Puble marka kimliği; çeviklik, yüksek odak, yaratıcılık ve modern teknoloji dengesi üzerine inşa edilmiştir.
            </p>

            <div className={styles.brandAssetsGrid}>
              {/* The Rabbit Emblem */}
              <article className={styles.emblemCard}>
                <div className={styles.emblemCardGlow} />
                <div className={styles.emblemCardInner}>
                  <div className={styles.emblemVisualBox}>
                    <Image src="/assets/Amblem.svg" alt="Puble Amblem" width={90} height={138} unoptimized />
                  </div>
                  <div className={styles.emblemInfo}>
                    <h3>Puble Amblemi</h3>
                    <p>
                      Tavşan formundaki imza amblemimiz; çeviklik, yüksek hız, kesintisiz uyanıklık ve sosyal iletişimin dinamik doğasını temsil eder.
                    </p>
                    <div className={styles.emblemBadgeRow}>
                      <span>Çevik & Hızlı</span>
                      <span>Özgün Form</span>
                      <span>İmza Sembol</span>
                    </div>
                  </div>
                </div>
              </article>

              {/* Main Logo Card */}
              <article className={styles.logoCard}>
                <div className={styles.logoCardTop}>
                  <h3>Puble Ana Logosu</h3>
                  <p>
                    Koyu ve açık arka planlarda yüksek okunabilirlik ve modern estetik sunan resmi Puble tipografik logosu.
                  </p>
                </div>
                <div className={styles.logoVisualBox}>
                  <div className={styles.logoBoxDark} title="Koyu Zemin Logo">
                    <Image src="/assets/Main Logo.svg" alt="Puble Logo Koyu" width={180} height={60} unoptimized />
                  </div>
                  <div className={styles.logoBoxLight} title="Açık Zemin Logo">
                    <Image src="/assets/Main Logo.svg" alt="Puble Logo Açık" width={180} height={60} unoptimized />
                  </div>
                </div>
                <div className={styles.logoTagline}>Create. Manage. Connect.</div>
              </article>
            </div>

            {/* Official Color Spectrum */}
            <h3 style={{ margin: "36px 0 12px", fontSize: "19px", fontWeight: 700, color: "#161520" }}>
              Resmi Renk Spektrumu & Degrade
            </h3>
            <p style={{ margin: "0 0 18px", color: "#666475", fontSize: "13.5px" }}>
              Puble tasarım dili, derin uzay mavisinden neon mint ışıltısına uzanan 4-duraklı özel spektrum ile canlanır:
            </p>

            <div className={styles.paletteGrid}>
              {brandColors.map((color) => (
                <div className={styles.colorCard} key={color.hex}>
                  <div className={styles.colorSwatch} style={{ background: color.bg }} />
                  <strong>{color.name}</strong>
                  <code>{color.hex}</code>
                  <small>{color.desc}</small>
                </div>
              ))}
            </div>

            {/* Press Kit Quick Access */}
            <div className={styles.pressKitRow}>
              <div className={styles.pressKitInfo}>
                <strong>Resmi Marka & Basın Kiti</strong>
                <span>Yüksek çözünürlüklü vektör logolar, amblem varyasyonları ve renk rehberi.</span>
              </div>
              <div className={styles.pressKitButtons}>
                <a className={styles.assetDownloadBtn} href="/assets/Main Logo.svg" target="_blank" rel="noreferrer">
                  Logo (SVG) ↗
                </a>
                <a className={styles.assetDownloadBtn} href="/assets/Amblem.svg" target="_blank" rel="noreferrer">
                  Amblem (SVG) ↗
                </a>
              </div>
            </div>
          </section>

          {/* 04 · Değerlerimiz & İlkelerimiz */}
          <section id="degerlerimiz">
            <span className={styles.index}>04</span>
            <h2>Değerlerimiz & İlkelerimiz</h2>
            <p>
              Puble ürününü geliştirirken taviz vermediğimiz temel prensipler:
            </p>

            <div className={styles.valuesGrid}>
              <div className={styles.valueCard}>
                <div className={styles.valueHeader}>
                  <div className={styles.valueIcon}>
                    <Image src="/UI/UX/publeai.svg" alt="" width={20} height={21} unoptimized />
                  </div>
                  <h3>Görünmez ve Doğal AI</h3>
                </div>
                <p>
                  Kullanıcıyı karmaşık ve soğuk prompt pencerelerine mahkûm etmeyiz. Yapay zeka, akışın içinde tek dokunuşla çalışan sessiz bir yardımcıdır; içeriklerinize yapay etiketler yapıştırmaz.
                </p>
              </div>

              <div className={styles.valueCard}>
                <div className={styles.valueHeader}>
                  <div className={styles.valueIcon}>
                    <Image src="/UI/icons/ayarlar-calisma-alani.svg" alt="" width={20} height={20} unoptimized />
                  </div>
                  <h3>Daha Az Dağınıklık, Daha Çok Üretim</h3>
                </div>
                <p>
                  Onlarca sekme arasında kaybolmaya son. Yazma, yanıtlama, düzenleme, planlama ve analiz aynı çalışma ritminde akar.
                </p>
              </div>

              <div className={styles.valueCard}>
                <div className={styles.valueHeader}>
                  <div className={styles.valueIcon}>
                    <Image src="/UI/icons/kitaplik.svg" alt="" width={20} height={20} unoptimized />
                  </div>
                  <h3>Creator Ekosistemi</h3>
                </div>
                <p>
                  Kreatörler sadece ürünün son kullanıcısı değil, şablonlarını ve deneyimlerini paylaşarak topluluğu büyüten gerçek ekosistem ortaklarımızdır.
                </p>
              </div>

              <div className={styles.valueCard}>
                <div className={styles.valueHeader}>
                  <div className={styles.valueIcon}>
                    <Image src="/UI/icons/security.svg" alt="" width={20} height={20} unoptimized />
                  </div>
                  <h3>Kullanıcı Kontrolü ve Güvenlik</h3>
                </div>
                <p>
                  Hiçbir gönderi sizin nihai onayınız olmadan yayınlanmaz. AI yalnızca önerir; kararı, yaratıcı dokunuşu ve son sözü her zaman siz söylersiniz.
                </p>
              </div>
            </div>
          </section>

          {/* 05 · Hikayemiz & Urla */}
          <section id="hikayemiz">
            <span className={styles.index}>05</span>
            <h2>Hikayemiz & Urla</h2>
            <div className={styles.storyCard}>
              <div className={styles.storyEmblemWatermark} aria-hidden="true">
                <Image src="/assets/Amblem.svg" alt="" width={260} height={398} unoptimized />
              </div>
              <div className={styles.storyBubblesWatermark} aria-hidden="true">
                <Image src="/UI/UX/inbox_bubbles.svg" alt="" width={200} height={120} unoptimized />
              </div>

              <span className={styles.storyTag}>Techstars Startup Weekend Urla 2026</span>
              <h3>
                Urla&apos;da doğan, <span>dünyaya açılan sosyal çalışma alanı.</span>
              </h3>
              <p>
                Puble, Ege&apos;nin inovasyon ve girişimcilik merkezi Urla&apos;da düzenlenen Techstars Startup Weekend maratonunda doğdu. Farklı disiplinlerden gelen geliştiriciler ve tasarımcılar olarak, sosyal medya yönetimindeki en temel sorunun “araç çokluğu ve dağınıklık” olduğunu fark ettik.
              </p>
              <p>
                Küçük bir işletme sahibinin müşterisine yazdığı bir mesajdan nasıl anında içerik çıkarabileceğini, bir bağımsız üreticinin şablonlarını nasıl daha verimli kullanabileceğini tek bir deneyimde modelledik. Puble, bu tutkunun ve topluluk ruhunun bir ürünüdür.
              </p>

              <div className={styles.storyMetrics}>
                <div className={styles.storyMetricItem}>
                  <b>1 Ekosistem</b>
                  <small>Tek bir çatı altında</small>
                </div>
                <div className={styles.storyMetricItem}>
                  <b>12 Platform</b>
                  <small>Doğrudan bağlantı</small>
                </div>
                <div className={styles.storyMetricItem}>
                  <b>4 Akış</b>
                  <small>Connect, Chat, Create, Plan</small>
                </div>
                <div className={styles.storyMetricItem}>
                  <b>Urla 2026</b>
                  <small>Doğuş hikayesi</small>
                </div>
              </div>
            </div>
          </section>

          {/* 06 · İletişim & Kurumsal Bağlantılar */}
          <section id="iletisim">
            <span className={styles.index}>06</span>
            <h2>İletişim & Kurumsal Bağlantılar</h2>
            <p>
              Ekibimizle tanışmak, iş birliği geliştirmek veya erken erişim hakkında bilgi almak için bizimle iletişime geçebilirsiniz.
            </p>
            <div className={styles.contactGrid}>
              <article className={styles.contactCard}>
                <div className={styles.contactIconBox}>
                  <Image src="/UI/icons/e-posta-ozet.svg" alt="" width={20} height={20} unoptimized />
                </div>
                <span>Genel İletişim</span>
                <strong>Merhaba Deyin</strong>
                <p>Sorularınız, geri bildirimleriniz ve kurumsal talepleriniz için.</p>
                <a href="mailto:contact@puble.app">contact@puble.app →</a>
              </article>

              <article className={styles.contactCard}>
                <div className={styles.contactIconBox}>
                  <Image src="/UI/icons/bagli-hesaplar.svg" alt="" width={20} height={20} unoptimized />
                </div>
                <span>Creator & Ortaklık</span>
                <strong>İş Birlikleri</strong>
                <p>Şablon üreticisi olmak ve partnerlik fırsatlarını konuşmak için.</p>
                <a href="mailto:creators@puble.app">creators@puble.app →</a>
              </article>

              <article className={styles.contactCard}>
                <div className={styles.contactIconBox}>
                  <Image src="/UI/icons/plan-ve-kullanim.svg" alt="" width={20} height={20} unoptimized />
                </div>
                <span>Basın & Yatırım</span>
                <strong>Basın Kiti</strong>
                <p>Görsel materyaller, logo paketi ve yatırımcı sunumları için.</p>
                <a href="mailto:press@puble.app">press@puble.app →</a>
              </article>
            </div>
          </section>
        </article>
      </div>

      {/* Pre-Footer Final CTA with Emblem watermark */}
      <section className={styles.finalCta}>
        <div className={styles.ctaGridPattern} />
        <div className={`${styles.shell} ${styles.ctaContent}`}>
          <div className={styles.ctaWatermark} aria-hidden="true">
            <Image src="/assets/Amblem.svg" alt="" width={210} height={322} unoptimized />
          </div>
          <span className={styles.ctaTag}>PUBLE İLE TANIŞ</span>
          <h2>
            Daha az yönet.<br />
            <span>Daha çok üret.</span>
          </h2>
          <p>Yeni nesil sosyal çalışma alanının ilk kullanıcıları arasında yerini al.</p>
          <div className={styles.ctaButtons}>
            <Link className={styles.ctaBtnPrimary} href="/panel">
              Panele Git →
            </Link>
            <Link className={styles.ctaBtnSecondary} href="/auth?mode=signup">
              Ücretsiz Hesap Oluştur
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={`${styles.shell} ${styles.footerInner}`}>
          <div className={styles.footerBrand}>
            <Image src="/assets/Main Logo.svg" alt="Puble" width={381} height={126} unoptimized />
            <p>Create. Manage. Connect.</p>
          </div>
          <div className={styles.footerLinks}>
            <Link href="/#product">Ürün</Link>
            <Link href="/#flow">Akış</Link>
            <Link href="/#creators">Creator</Link>
            <Link href="/#pricing">Pricing</Link>
            <Link href="/kurumsal">Kurumsal</Link>
            <Link href="/kvkk">KVKK</Link>
          </div>
          <p>© 2026 Puble. Sosyal medyayı yönetmekten fazlası.</p>
        </div>
      </footer>
    </div>
  );
}
