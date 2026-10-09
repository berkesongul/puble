"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { AUTH_EVENT, SESSION_KEY, clearDemoSession, type DemoUser } from "@/lib/demo-auth";
import styles from "./panel.module.css";

type View = "overview" | "inbox" | "editor" | "planner" | "social" | "settings";

const navItems: { id: View; label: string; icon: string }[] = [
  { id: "overview", label: "Ana panel", icon: "⌂" },
  { id: "inbox", label: "Gelen Kutusu", icon: "●" },
  { id: "editor", label: "puble editor", icon: "◆" },
  { id: "planner", label: "puble planlayıcı", icon: "▣" },
  { id: "social", label: "Sosyal Kreatörs", icon: "✦" },
  { id: "settings", label: "Ayarlar", icon: "⚙" },
];

const viewCopy: Record<View, { eyebrow: string; title: string; text: string }> = {
  overview: { eyebrow: "ÇALIŞMA ALANI", title: "Bugünün akışı", text: "İletişimden yayına bütün işlerin tek ritimde." },
  inbox: { eyebrow: "COMMUNICATE", title: "Gelen kutusu", text: "Tüm hesaplarındaki konuşmalar tek yerde." },
  editor: { eyebrow: "CREATE", title: "İçerik editörü", text: "Template seç, markana uyarla ve yayına hazırla." },
  planner: { eyebrow: "PLAN", title: "İçerik planı", text: "Konuşmalardan çıkan fırsatları takvimine taşı." },
  social: { eyebrow: "DISCOVER", title: "Creator Social", text: "Üreticileri ve özgün template paketlerini keşfet." },
  settings: { eyebrow: "WORKSPACE", title: "Ayarlar", text: "Çalışma alanını, marka hafızanı ve kullanım tercihlerini yönet." },
};

function SparkIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c.5 5.8 4.2 9.5 10 10-5.8.5-9.5 4.2-10 10-.5-5.8-4.2-9.5-10-10 5.8-.5 9.5-4.2 10-10Z" /></svg>;
}

export function PanelApp() {
  const router = useRouter();
  const serializedUser = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener(AUTH_EVENT, onStoreChange);
      window.addEventListener("storage", onStoreChange);
      return () => {
        window.removeEventListener(AUTH_EVENT, onStoreChange);
        window.removeEventListener("storage", onStoreChange);
      };
    },
    () => window.localStorage.getItem(SESSION_KEY),
    () => undefined,
  );
  const user = useMemo(() => {
    if (!serializedUser) return null;
    try { return JSON.parse(serializedUser) as DemoUser; } catch { return null; }
  }, [serializedUser]);
  const [view, setView] = useState<View>("overview");
  const [draft, setDraft] = useState("abi fiyatı biraz düşürürsek yarın hallederiz");
  const [sent, setSent] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [planned, setPlanned] = useState(false);
  const [following, setFollowing] = useState<string[]>(["@studioform"]);

  useEffect(() => {
    if (serializedUser === null) router.replace("/auth?mode=login");
  }, [router, serializedUser]);

  if (serializedUser === undefined || !user) {
    return <main className={styles.loading}><span /><p>Çalışma alanın hazırlanıyor…</p></main>;
  }

  function signOut() {
    clearDemoSession();
    router.push("/");
  }

  function professionalize() {
    setDraft("Fiyat konusunda daha uygun bir seçenek sunabilirsek, süreci yarın sonuçlandırabiliriz.");
    setSent(false);
  }

  function toggleFollow(handle: string) {
    setFollowing((items) => items.includes(handle) ? items.filter((item) => item !== handle) : [...items, handle]);
  }

  return (
    <main className={styles.app}>
      <aside className={styles.sidebar}>
        <Link className={styles.logo} href="/" aria-label="Puble ana sayfa"><Image src="/assets/Main Logo.svg" alt="Puble" width={381} height={126} priority unoptimized /></Link>
        <nav aria-label="Panel navigasyonu">
          {navItems.map((item) => <button className={view === item.id ? styles.activeNav : ""} key={item.id} type="button" onClick={() => setView(item.id)}><i>{item.icon}</i><span>{item.label}</span>{item.id === "inbox" ? <em>12</em> : null}</button>)}
        </nav>
        <div className={styles.sidebarBottom}>
          <div className={styles.planCard}><span>FREE PLAN</span><b>3 / 5 aktif sohbet</b><i><u /></i><small>2 slot kullanılabilir</small></div>
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <div className={styles.search}><span>⌕</span><input aria-label="Panelde ara" placeholder="Mesaj, içerik veya creator ara…" /><kbd>⌘ K</kbd></div>
          <button className={styles.notification} type="button" aria-label="Bildirimler">♢<i /></button>
          <div className={styles.user}><span>{user.initials}</span><div><b>{user.name}</b><small>{user.email}</small></div><button type="button" onClick={signOut}>Çıkış</button></div>
        </header>

        <div className={styles.content}>
          <div className={styles.pageHead}><div><span>{viewCopy[view].eyebrow}</span><h1>{viewCopy[view].title}</h1><p>{viewCopy[view].text}</p></div>{view !== "settings" ? <div className={styles.headActions}><span><i /> 3 hesap bağlı</span><button type="button">+ Yeni oluştur</button></div> : <div className={styles.settingsStatus}><i /> Demo çalışma alanı</div>}</div>
          {view === "overview" ? <Overview onOpen={setView} /> : null}
          {view === "inbox" ? <Inbox draft={draft} sent={sent} onDraft={setDraft} onProfessionalize={professionalize} onSend={() => setSent(true)} /> : null}
          {view === "editor" ? <Editor selected={selectedTemplate} onSelect={setSelectedTemplate} /> : null}
          {view === "planner" ? <Planner planned={planned} onPlan={() => setPlanned(true)} /> : null}
          {view === "social" ? <Social following={following} onFollow={toggleFollow} onUse={() => setView("editor")} /> : null}
          {view === "settings" ? <Settings user={user} /> : null}
        </div>
      </section>
    </main>
  );
}

function Overview({ onOpen }: { onOpen: (view: View) => void }) {
  return <div className={styles.overview}>
    <section className={styles.heroCard}><div><span>GÜNÜN ODAĞI</span><h2>Mira Studio lansman akışını tamamla.</h2><p>Konuşmadan 4 içerik fırsatı çıkardık. İlk teaser yarın yayına hazır olabilir.</p><button type="button" onClick={() => onOpen("planner")}>Akışı sürdür <b>→</b></button></div><div className={styles.heroOrb}><Image src="/assets/Amblem.svg" alt="" width={266} height={408} priority unoptimized /></div></section>
    <section className={styles.stats}>
      <article><span>Aktif sohbet</span><b>3<small>/ 5</small></b><i className={styles.purpleLine}><u /></i><em>2 slot uygun</em></article>
      <article><span>Bu hafta içerik</span><b>12</b><i className={styles.mintLine}><u /></i><em>8&apos;i yayına hazır</em></article>
      <article><span>AI kullanımı</span><b>64<small>/ 150</small></b><i className={styles.blueLine}><u /></i><em>Bu sohbet dönemi</em></article>
      <article><span>Bağlı hesap</span><b>3</b><div className={styles.accountDots}><i>ig</i><i>tt</i><i>in</i></div><em>Tümü aktif</em></article>
    </section>
    <section className={styles.overviewGrid}>
      <div className={styles.inboxPreview}><div className={styles.cardHead}><div><span>INBOX</span><h3>Yanıt bekleyenler</h3></div><button type="button" onClick={() => onOpen("inbox")}>Tümünü gör →</button></div>{[["MS", "Mira Studio", "Lansman tarihini netleştirdik…", "2 dk"], ["SF", "Studio Form", "Story paketini ilettim.", "1 sa"], ["ML", "Motion Lab", "TikTok versiyonu da hazır.", "3 sa"]].map((row, index) => <button className={index === 0 ? styles.previewActive : ""} type="button" onClick={() => onOpen("inbox")} key={row[1]}><i>{row[0]}</i><div><b>{row[1]}</b><small>{row[2]}</small></div><time>{row[3]}</time></button>)}</div>
      <div className={styles.flowPreview}><div className={styles.cardHead}><div><span>AKIŞ</span><h3>Bugünün planı</h3></div><button type="button" onClick={() => onOpen("planner")}>Takvim →</button></div>{[["09:30", "Teaser son kontrol", "Instagram", "done"], ["14:00", "Mira Studio yanıtı", "Inbox", "now"], ["18:00", "Lansman reels", "Instagram + TikTok", ""]].map((row) => <div className={styles.flowEvent} key={row[0]}><time>{row[0]}</time><i className={row[3] ? styles[row[3]] : ""} /><div><b>{row[1]}</b><small>{row[2]}</small></div><span>{row[3] === "done" ? "✓" : row[3] === "now" ? "→" : ""}</span></div>)}</div>
    </section>
  </div>;
}

function Inbox({ draft, sent, onDraft, onProfessionalize, onSend }: { draft: string; sent: boolean; onDraft: (value: string) => void; onProfessionalize: () => void; onSend: () => void }) {
  return <section className={styles.inbox}>
    <div className={styles.conversations}><div className={styles.filterRow}><button type="button">Tümü <b>12</b></button><button type="button">Okunmamış</button></div>{[["MS", "Mira Studio", "Lansman tarihini netleştirdik…", "14:02"], ["SF", "Studio Form", "Story paketini ilettim.", "12:48"], ["ML", "Motion Lab", "TikTok versiyonu da hazır.", "11:20"], ["AK", "Atelier K", "Teklifi inceleme fırsatınız…", "Dün"]].map((row, index) => <button className={index === 0 ? styles.selectedConversation : ""} type="button" key={row[1]}><i>{row[0]}</i><div><b>{row[1]}</b><small>{row[2]}</small></div><time>{row[3]}</time></button>)}</div>
    <div className={styles.chat}><div className={styles.chatHead}><div><i>MS</i><span><b>Mira Studio</b><small><u /> Instagram · Aktif</small></span></div><button type="button">•••</button></div><div className={styles.messages}><div className={styles.inMessage}>Merhaba! Yeni ürünümüz 15 Ekim&apos;de çıkıyor. Lansman için nasıl ilerleyelim?<time>13:48</time></div><div className={styles.outMessage}>Harika! İki gün önce teaser, lansman günü de reel paylaşabiliriz.<time>13:55 ✓✓</time></div><div className={styles.aiCard}><SparkIcon /><div><b>4 içerik fırsatı bulduk</b><small>Konuşmadaki tarihlerden otomatik çıkarıldı.</small></div><button type="button">Görüntüle</button></div>{sent ? <div className={styles.outMessage}>{draft}<time>Şimdi ✓</time></div> : null}</div><div className={styles.composerBox}><textarea aria-label="Mesaj" value={draft} onChange={(event) => onDraft(event.target.value)} /><div><button type="button" onClick={onProfessionalize}><SparkIcon /> Profesyonelleştir</button><span>⌘ Enter</span><button className={styles.sendButton} type="button" onClick={onSend}>Gönder ↑</button></div></div></div>
    <aside className={styles.contact}><div className={styles.contactAvatar}>MS</div><h3>Mira Studio</h3><p>@mirastudio · Instagram</p><div className={styles.contactStat}><span>Aktif sohbet</span><b>23 / 100 AI</b></div><h4>Konuşmadan çıkanlar</h4><button type="button"><span>13 Eki</span><div><b>Teaser paylaşımı</b><small>Planner&apos;a eklendi</small></div><i>✓</i></button><button type="button"><span>15 Eki</span><div><b>Lansman reels</b><small>Onay bekliyor</small></div><i>+</i></button></aside>
  </section>;
}

function Editor({ selected, onSelect }: { selected: number; onSelect: (index: number) => void }) {
  const templates = ["Gradient Reel", "Bold Launch", "Soft Product"];
  return <section className={styles.editor}>
    <aside className={styles.editorTools}><div className={styles.toolTabs}><button type="button" className={styles.toolActive}>Template</button><button type="button">Medya</button><button type="button">Metin</button></div><label>Template&apos;lerde ara<input placeholder="Ara…" /></label><div className={styles.templateGrid}>{templates.map((name, index) => <button className={selected === index ? styles.selectedTemplate : ""} type="button" onClick={() => onSelect(index)} key={name}><i className={styles[`template${index}`]}><span>puble</span></i><b>{name}</b><small>1080 × 1350</small></button>)}</div></aside>
    <div className={styles.canvasArea}><div className={styles.canvasTop}><span>1080 × 1350 · Instagram Post</span><div><button type="button">−</button><em>72%</em><button type="button">+</button></div></div><div className={`${styles.artboard} ${styles[`artboard${selected}`]}`}><span>15 / 10</span><div><small>YENİ KOLEKSİYON</small><h2>akışını<br />yenile.</h2><p>Mira Studio · FW26</p></div><Image src="/assets/Amblem.svg" alt="" width={266} height={408} unoptimized /></div><p>Değişiklikler otomatik kaydedildi</p></div>
    <aside className={styles.properties}><h3>Tasarım</h3><label>Marka adı<input defaultValue="Mira Studio" /></label><label>Başlık<textarea defaultValue={"akışını\nyenile."} /></label><span>Marka renkleri</span><div className={styles.colorRow}><button type="button" /><button type="button" /><button type="button" /><button type="button" /></div><label>Format<select defaultValue="post"><option value="post">Instagram Post</option><option value="story">Story / Reel</option></select></label><button className={styles.exportButton} type="button">Dışa aktar <span>→</span></button></aside>
  </section>;
}

function Planner({ planned, onPlan }: { planned: boolean; onPlan: () => void }) {
  return <section className={styles.planner}>
    <div className={styles.calendar}><div className={styles.calendarHead}><button type="button">‹</button><h3>Ekim 2026</h3><button type="button">›</button><span /><button type="button">Ay</button><button type="button">Hafta</button></div><div className={styles.weekdays}>{["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day) => <b key={day}>{day}</b>)}</div><div className={styles.days}>{Array.from({ length: 35 }, (_, index) => { const day = index - 2; return <div className={`${day === 8 ? styles.today : ""} ${day < 1 || day > 31 ? styles.mutedDay : ""}`} key={index}><span>{day < 1 ? 30 + day : day > 31 ? day - 31 : day}</span>{day === 6 ? <i className={styles.eventPurple}>Story seti</i> : null}{day === 8 ? <i className={styles.eventMint}>Mira yanıt</i> : null}{day === 13 ? <i className={styles.eventBlue}>Teaser</i> : null}{day === 15 ? <><i className={styles.eventPurple}>Lansman</i>{planned ? <i className={styles.eventMint}>Reels yayını</i> : null}</> : null}{day === 22 ? <i className={styles.eventBlue}>Kampanya</i> : null}</div>; })}</div></div>
    <aside className={styles.opportunities}><div><span>AI FIRSATLARI</span><b>3 yeni</b></div><h3>Konuşmadan takvime</h3><p>Mesajlarındaki tarihlerden ve ihtiyaçlardan öneriler oluşturduk.</p><article><SparkIcon /><small>Mira Studio konuşmasından</small><h4>Lansman Reels</h4><p>15 Ekim · 18:00<br />Instagram + TikTok</p><button type="button" onClick={onPlan}>{planned ? "Takvime eklendi ✓" : "Takvime ekle →"}</button></article><article><SparkIcon /><small>Atelier K konuşmasından</small><h4>İlk hafta indirimi</h4><p>18 Ekim · Tüm kanallar</p><button type="button">İncele →</button></article></aside>
  </section>;
}

function Social({ following, onFollow, onUse }: { following: string[]; onFollow: (handle: string) => void; onUse: () => void }) {
  const creators = [["SF", "@studioform", "Gradient Reel Pack", "12.4K", "purple"], ["MD", "@mira.design", "Launch Story Kit", "8.7K", "mint"], ["ML", "@motionlab", "Minimal Motion Set", "21.3K", "blue"]];
  return <section className={styles.social}><div className={styles.socialFeatured}><div><span>HAFTANIN CREATOR&apos;I</span><h2>@studioform</h2><p>Markalar için hareketli, cesur ve kullanıma hazır sosyal medya sistemleri.</p><div><b>24<small>template</small></b><b>12.4K<small>takipçi</small></b></div><button type="button" onClick={() => onFollow("@studioform")}>{following.includes("@studioform") ? "Takip ediliyor ✓" : "Takip et +"}</button></div><div className={styles.featuredVisual}><Image src="/assets/Amblem.svg" alt="Puble amblemi" width={266} height={408} unoptimized /><span>NEW<br />FLOW</span></div></div><div className={styles.creatorTitle}><div><span>KEŞFET</span><h3>Trend template paketleri</h3></div><button type="button">Tümünü gör →</button></div><div className={styles.creatorCards}>{creators.map((creator) => <article key={creator[1]}><div className={`${styles.creatorArt} ${styles[creator[4]]}`}><span>{creator[0]}</span><em>CREATOR</em></div><div className={styles.creatorMeta}><i>{creator[0]}</i><div><span>{creator[1]}</span><b>{creator[2]}</b><small>{creator[3]} takipçi</small></div><button type="button" onClick={() => onFollow(creator[1])}>{following.includes(creator[1]) ? "✓" : "+"}</button></div><button className={styles.useTemplate} type="button" onClick={onUse}>Template&apos;i kullan →</button></article>)}</div></section>;
}

type SettingsTab = "profile" | "accounts" | "brand" | "notifications" | "usage" | "security";

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return <button className={`${styles.toggle} ${checked ? styles.toggleOn : ""}`} type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange}><span /></button>;
}

function Settings({ user }: { user: DemoUser }) {
  const [tab, setTab] = useState<SettingsTab>("brand");
  const [tone, setTone] = useState("Samimi ve profesyonel");
  const [approvalRequired, setApprovalRequired] = useState(true);
  const [connected, setConnected] = useState({ instagram: true, tiktok: true, linkedin: true });
  const [notifications, setNotifications] = useState({ message: true, approval: true, publish: true, failed: true, opportunity: true, email: false });
  const [saved, setSaved] = useState(false);

  const tabs: { id: SettingsTab; icon: string; label: string; description: string }[] = [
    { id: "profile", icon: "○", label: "Profil ve çalışma alanı", description: "Kimlik ve marka bilgileri" },
    { id: "accounts", icon: "↗", label: "Bağlı hesaplar", description: "Sosyal kanal bağlantıları" },
    { id: "brand", icon: "✦", label: "Marka Hafızası", description: "AI tonu ve marka kuralları" },
    { id: "notifications", icon: "◇", label: "Bildirimler", description: "Uyarı ve e-posta tercihleri" },
    { id: "usage", icon: "▤", label: "Plan ve kullanım", description: "Kota ve paket bilgileri" },
    { id: "security", icon: "⌾", label: "Güvenlik", description: "Hesap ve oturumlar" },
  ];

  function saveSettings() {
    window.localStorage.setItem("puble.demo.settings", JSON.stringify({ tone, approvalRequired, connected, notifications }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return <section className={styles.settings}>
    <aside className={styles.settingsNav}>
      <span>AYARLAR</span>
      {tabs.map((item) => <button className={tab === item.id ? styles.activeSetting : ""} type="button" key={item.id} onClick={() => setTab(item.id)}><i>{item.icon}</i><div><b>{item.label}</b><small>{item.description}</small></div><em>›</em></button>)}
      <div className={styles.settingsHelp}><i>?</i><div><b>Yardıma mı ihtiyacın var?</b><small>Puble destek merkezine göz at.</small></div></div>
    </aside>

    <div className={styles.settingsPanel}>
      {tab === "profile" ? <div className={styles.settingPage}>
        <SettingTitle eyebrow="HESABIM" title="Profil ve çalışma alanı" text="Puble içinde görünen kimliğini ve çalışma alanı bilgilerini düzenle." />
        <div className={styles.profileSetting}><span>{user.initials}</span><div><b>Profil fotoğrafı</b><small>JPG veya PNG · En fazla 2 MB</small></div><button type="button">Fotoğrafı değiştir</button></div>
        <div className={styles.formGrid}><label>Ad soyad<input defaultValue={user.name} /></label><label>E-posta<input defaultValue={user.email} type="email" /></label><label>Çalışma alanı adı<input defaultValue="Puble Demo Workspace" /></label><label>Sektör<select defaultValue="creative"><option value="creative">Yaratıcı endüstriler</option><option value="retail">Perakende</option><option value="agency">Ajans</option></select></label><label className={styles.fullField}>Kısa marka açıklaması<textarea defaultValue="Sosyal medya yönetimini iletişimden yayına tek akışta birleştiren üretken çalışma alanı." /></label><label>Varsayılan dil<select defaultValue="tr"><option value="tr">Türkçe</option><option value="en">English</option></select></label><label>Saat dilimi<select defaultValue="istanbul"><option value="istanbul">İstanbul · GMT+3</option><option value="london">London · GMT+0</option></select></label></div>
      </div> : null}

      {tab === "accounts" ? <div className={styles.settingPage}>
        <SettingTitle eyebrow="CONNECT" title="Bağlı hesaplar" text="Mesajları toplamak ve içerik yayınlamak için sosyal hesaplarını yönet." />
        <div className={styles.accountList}>{[
          { key: "instagram" as const, icon: "ig", name: "Instagram", handle: "@puble.app", color: "purple" },
          { key: "tiktok" as const, icon: "tt", name: "TikTok", handle: "@publeapp", color: "dark" },
          { key: "linkedin" as const, icon: "in", name: "LinkedIn", handle: "Puble", color: "blue" },
        ].map((account) => <article key={account.key}><i className={styles[account.color]}>{account.icon}</i><div><b>{account.name}</b><small>{account.handle}</small></div><span className={connected[account.key] ? styles.connected : styles.disconnected}><u />{connected[account.key] ? "Bağlı" : "Bağlantı kesildi"}</span><button type="button" onClick={() => setConnected((items) => ({ ...items, [account.key]: !items[account.key] }))}>{connected[account.key] ? "Yönet" : "Yeniden bağla"}</button></article>)}</div>
        <button className={styles.outlineButton} type="button">+ Yeni sosyal hesap bağla</button>
        <div className={styles.settingNotice}><SparkIcon /><div><b>MockSocialProvider aktif</b><small>Startup Weekend demosu harici API onayına ihtiyaç duymadan güvenli demo verileri kullanıyor.</small></div></div>
      </div> : null}

      {tab === "brand" ? <div className={styles.settingPage}>
        <SettingTitle eyebrow="AI + MARKA" title="Marka Hafızası" text="Puble bu bilgileri Inbox yanıtlarında, Profesyonelleştir&apos;de ve Editor metinlerinde kullanır." badge="ÖNERİLEN" />
        <div className={styles.memoryBanner}><SparkIcon /><div><b>Tek bir marka sesi, bütün akışlarda.</b><p>Buradaki kurallar mesajından içeriğine kadar Puble&apos;ın ürettiği her metne uygulanır.</p></div><span>AI AKTİF</span></div>
        <div className={styles.formGrid}><label>Marka tonu<select value={tone} onChange={(event) => setTone(event.target.value)}><option>Samimi ve profesyonel</option><option>Kurumsal ve net</option><option>Enerjik ve genç</option><option>Minimal ve sakin</option></select></label><label>Hedef kitle<input defaultValue="Küçük işletmeler ve bağımsız creator'lar" /></label><label className={styles.fullField}>Markayı tanımla<textarea defaultValue="Teknoloji odaklı ama soğuk değil; profesyonel ama kurumsal değil. Kullanıcıyı üretmeye ve bir sonraki adıma teşvik eder." /></label><label className={styles.fullField}>Kullanılacak ifadeler<textarea defaultValue="Akış, üret, birlikte, kolaylaştır, tek çalışma alanı" /></label><label className={styles.fullField}>Kaçınılacak ifadeler<textarea defaultValue="Abi, kanka, yapay zekâ tarafından yazıldı, sınırsız garanti" /></label><label className={styles.fullField}>Örnek marka metni<textarea defaultValue="Daha az yönet. Daha çok üret. Mesajından yayın planına bütün sosyal medya akışın Puble'da." /></label></div>
        <div className={styles.switchRow}><div><b>Takvime eklemeden önce onay iste</b><small>AI içerik fırsatları otomatik yayınlanmaz; önce senden onay alınır.</small></div><Toggle checked={approvalRequired} onChange={() => setApprovalRequired((value) => !value)} label="Takvim önerileri için onay iste" /></div>
      </div> : null}

      {tab === "notifications" ? <div className={styles.settingPage}>
        <SettingTitle eyebrow="UYARILAR" title="Bildirim tercihleri" text="Hangi gelişmelerden, hangi kanalda haberdar olmak istediğini seç." />
        <div className={styles.notificationList}>{[
          ["message", "Yeni mesaj", "Bağlı hesaplarına yeni mesaj geldiğinde"],
          ["approval", "İçerik onayı", "Bir taslak veya fırsat onay beklediğinde"],
          ["publish", "Yaklaşan yayın", "Planlanan içerikten 30 dakika önce"],
          ["failed", "Başarısız yayın", "Bir içerik yayınlanamadığında"],
          ["opportunity", "AI içerik fırsatları", "Konuşmalardan yeni bir fırsat çıkarıldığında"],
          ["email", "E-posta özeti", "Haftalık performans ve yapılacaklar özeti"],
        ].map(([key, title, text]) => <div key={key}><i>{key === "message" ? "●" : key === "opportunity" ? "✦" : "◇"}</i><div><b>{title}</b><small>{text}</small></div><Toggle checked={notifications[key as keyof typeof notifications]} onChange={() => setNotifications((items) => ({ ...items, [key]: !items[key as keyof typeof items] }))} label={`${title} bildirimi`} /></div>)}</div>
      </div> : null}

      {tab === "usage" ? <div className={styles.settingPage}>
        <SettingTitle eyebrow="FREE PLAN" title="Plan ve kullanım" text="Çalışma alanının kapasitesini ve mevcut paketini görüntüle." />
        <div className={styles.currentPlan}><div><span>MEVCUT PAKET</span><h3>Free</h3><p>Temel sosyal medya akışını ücretsiz kullan.</p></div><button type="button">Paketleri karşılaştır →</button></div>
        <div className={styles.usageGrid}><UsageCard title="Aktif sohbet" value="3 / 5" percent={60} note="2 slot kullanılabilir" color="purple" /><UsageCard title="AI / sohbet" value="64 / 150" percent={43} note="Bu kullanım dönemi" color="blue" /><UsageCard title="Bağlı hesap" value="3" percent={75} note="Instagram · TikTok · LinkedIn" color="mint" /><UsageCard title="Depolama" value="1.2 / 5 GB" percent={24} note="3.8 GB kullanılabilir" color="dark" /></div>
        <div className={styles.planFeatures}><h3>Paketine dahil</h3><div><span>✓ Tek gelen kutusu</span><span>✓ Profesyonelleştir</span><span>✓ Otomatik içerik takvimi</span><span>✓ Temel editör</span><span>✓ Creator keşfi</span><span>✓ 5 aktif sohbet</span></div></div>
      </div> : null}

      {tab === "security" ? <div className={styles.settingPage}>
        <SettingTitle eyebrow="HESAP" title="Güvenlik" text="Giriş bilgilerini ve açık oturumlarını kontrol et." />
        <div className={styles.securityList}><article><div><b>E-posta adresi</b><small>{user.email}</small></div><button type="button">Değiştir</button></article><article><div><b>Şifre</b><small>Son değişiklik: Demo hesabı</small></div><button type="button">Şifre değiştir</button></article><article><div><b>Aktif oturum</b><small>Bu cihaz · İstanbul, Türkiye · Şimdi</small></div><span>AKTİF</span></article></div>
        <div className={styles.dangerZone}><div><b>Hesabı sil</b><small>Hesabın ve çalışma alanı verilerin kalıcı olarak silinir.</small></div><button type="button">Hesabı sil</button></div>
      </div> : null}

      {tab !== "usage" && tab !== "security" ? <div className={styles.settingsFooter}><span>{saved ? "Değişiklikler kaydedildi ✓" : "Değişikliklerin yalnızca bu demo tarayıcısında saklanır."}</span><button type="button" onClick={saveSettings}>Değişiklikleri kaydet</button></div> : null}
    </div>
  </section>;
}

function SettingTitle({ eyebrow, title, text, badge }: { eyebrow: string; title: string; text: string; badge?: string }) {
  return <div className={styles.settingTitle}><span>{eyebrow}</span><div><h2>{title}</h2>{badge ? <em>{badge}</em> : null}</div><p>{text}</p></div>;
}

function UsageCard({ title, value, percent, note, color }: { title: string; value: string; percent: number; note: string; color: string }) {
  return <article><span>{title}</span><b>{value}</b><i><u className={styles[color]} style={{ width: `${percent}%` }} /></i><small>{note}</small></article>;
}
