"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore, type FormEvent } from "react";
import { AUTH_EVENT, SESSION_KEY, clearDemoSession, readDemoSession, type DemoUser } from "@/lib/demo-auth";
import styles from "./panel.module.css";

type View = "overview" | "inbox" | "editor" | "library" | "planner" | "series" | "ads" | "analytics" | "social" | "settings";

type LibraryItem = {
  id: number;
  title: string;
  type: "image" | "video";
  format: string;
  date: string;
  tone: "purple" | "mint" | "blue" | "dark";
};

const initialLibrary: LibraryItem[] = [
  { id: 1, title: "Puble Studio · Lansman", type: "image", format: "1080 × 1350", date: "Bugün, 14:24", tone: "purple" },
  { id: 2, title: "Akışını yenile", type: "video", format: "1080 × 1920", date: "Bugün, 12:10", tone: "blue" },
  { id: 3, title: "Yeni koleksiyon", type: "image", format: "1080 × 1080", date: "Dün, 18:40", tone: "mint" },
  { id: 4, title: "Gradient Reel", type: "video", format: "1080 × 1920", date: "7 Eki, 16:12", tone: "dark" },
  { id: 5, title: "İlk hafta indirimi", type: "image", format: "1080 × 1350", date: "6 Eki, 10:05", tone: "blue" },
  { id: 6, title: "Creator Spotlight", type: "image", format: "1080 × 1080", date: "4 Eki, 19:30", tone: "purple" },
];

const navItems: { id: View; label: string; icon: string; iconSrc?: string }[] = [
  { id: "overview", label: "Ana panel", icon: "⌂", iconSrc: "/UI/UX/ana_akis.svg" },
  { id: "inbox", label: "Gelen Kutusu", icon: "●", iconSrc: "/UI/UX/gelen_kutusu.svg" },
  { id: "editor", label: "Puble editor", icon: "◆" },
  { id: "library", label: "Kitaplık", icon: "▦" },
  { id: "planner", label: "Puble Planlayıcı", icon: "▣" },
  { id: "series", label: "Seriler", icon: "≋" },
  { id: "ads", label: "Reklamlar", icon: "◎" },
  { id: "analytics", label: "Analitik", icon: "⌁" },
  { id: "social", label: "Kreatörler", icon: "✦" },
  { id: "settings", label: "Ayarlar", icon: "⚙" },
];

const viewCopy: Record<View, { eyebrow: string; title: string; text: string }> = {
  overview: { eyebrow: "ÇALIŞMA ALANI", title: "Bugünün akışı", text: "İletişimden yayına bütün işlerin tek ritimde." },
  inbox: { eyebrow: "COMMUNICATE", title: "Gelen kutusu", text: "Tüm hesaplarındaki konuşmalar tek yerde." },
  editor: { eyebrow: "CREATE", title: "İçerik editörü", text: "Template seç, markana uyarla ve yayına hazırla." },
  library: { eyebrow: "ASSET LIBRARY", title: "Kitaplık", text: "Editörde ürettiğin görsel ve videoların tek galeride." },
  planner: { eyebrow: "PLAN", title: "İçerik planı", text: "Konuşmalardan çıkan fırsatları takvimine taşı." },
  series: { eyebrow: "REPEAT", title: "Seriler", text: "Tekrarlayan içerik formatlarını planla, üret ve düzenli yayınla." },
  ads: { eyebrow: "GROW", title: "Reklamlar", text: "Kampanyalarını, kreatiflerini ve performansını tek yerden yönet." },
  analytics: { eyebrow: "MEASURE", title: "Analitik", text: "Tüm kanallarının büyümesini, erişimini ve etkileşimini tek görünümde izle." },
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
    return readDemoSession();
  }, [serializedUser]);
  const [view, setView] = useState<View>("overview");
  const [draft, setDraft] = useState("abi fiyatı biraz düşürürsek yarın hallederiz");
  const [sent, setSent] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [planned, setPlanned] = useState(false);
  const [following, setFollowing] = useState<string[]>(["@studioform"]);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>(initialLibrary);
  const [planOpen, setPlanOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    if (serializedUser === null) router.replace("/auth?mode=login");
  }, [router, serializedUser]);

  useEffect(() => {
    if (!planOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPlanOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [planOpen]);

  useEffect(() => {
    if (!composerOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setComposerOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [composerOpen]);

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

  function saveEditorOutput() {
    const names = ["Gradient Reel", "Bold Launch", "Soft Product"];
    setLibraryItems((items) => [{ id: Date.now(), title: names[selectedTemplate], type: selectedTemplate === 1 ? "video" : "image", format: selectedTemplate === 1 ? "1080 × 1920" : "1080 × 1350", date: "Şimdi", tone: selectedTemplate === 2 ? "mint" : selectedTemplate === 1 ? "dark" : "purple" }, ...items]);
    setView("library");
  }

  return (
    <main className={styles.app}>
      <aside className={styles.sidebar}>
        <Link className={styles.logo} href="/" aria-label="Puble ana sayfa"><Image src="/UI/UX/puble_dashboard_icon.png" alt="Puble" width={636} height={136} priority /></Link>
        <nav aria-label="Panel navigasyonu">
          {navItems.map((item) => <button className={view === item.id ? styles.activeNav : ""} key={item.id} type="button" onClick={() => setView(item.id)}><i>{item.iconSrc ? <Image className={styles.navIcon} src={item.iconSrc} alt="" width={28} height={31} unoptimized /> : item.icon}</i><span>{item.label}</span>{item.id === "inbox" ? <em>12</em> : null}</button>)}
        </nav>
        <div className={styles.sidebarBottom}>
          <button className={styles.createPostTrigger} type="button" onClick={() => setComposerOpen(true)} aria-label="Yeni gönderi oluştur"><span>+</span><b>Gönderi oluştur</b></button>
          <button className={styles.planCard} type="button" onClick={() => setPlanOpen(true)} aria-label="Plan kullanım detaylarını aç"><span>FREE PLAN</span><b>3 / 5 aktif sohbet</b><i><u /></i><small>2 slot kullanılabilir</small><em aria-hidden="true">↗</em></button>
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
          {view === "editor" ? <Editor selected={selectedTemplate} onSelect={setSelectedTemplate} onExport={saveEditorOutput} /> : null}
          {view === "library" ? <Library items={libraryItems} onEdit={() => setView("editor")} /> : null}
          {view === "planner" ? <Planner planned={planned} onPlan={() => setPlanned(true)} /> : null}
          {view === "series" ? <Series /> : null}
          {view === "ads" ? <Ads /> : null}
          {view === "analytics" ? <Analytics /> : null}
          {view === "social" ? <Social following={following} onFollow={toggleFollow} onUse={() => setView("editor")} /> : null}
          {view === "settings" ? <Settings user={user} /> : null}
        </div>
      </section>
      {planOpen ? <PlanUsageModal onClose={() => setPlanOpen(false)} onPlans={() => { setPlanOpen(false); setView("settings"); }} /> : null}
      {composerOpen ? <PostComposerModal onClose={() => setComposerOpen(false)} /> : null}
      <AIChat open={aiOpen} onToggle={() => setAiOpen((open) => !open)} onClose={() => setAiOpen(false)} onNavigate={setView} />
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

function Editor({ selected, onSelect, onExport }: { selected: number; onSelect: (index: number) => void; onExport: () => void }) {
  const templates = ["Gradient Reel", "Bold Launch", "Soft Product"];
  return <section className={styles.editor}>
    <aside className={styles.editorTools}><div className={styles.toolTabs}><button type="button" className={styles.toolActive}>Template</button><button type="button">Medya</button><button type="button">Metin</button></div><label>Template&apos;lerde ara<input placeholder="Ara…" /></label><div className={styles.templateGrid}>{templates.map((name, index) => <button className={selected === index ? styles.selectedTemplate : ""} type="button" onClick={() => onSelect(index)} key={name}><i className={styles[`template${index}`]}><span>puble</span></i><b>{name}</b><small>1080 × 1350</small></button>)}</div></aside>
    <div className={styles.canvasArea}><div className={styles.canvasTop}><span>1080 × 1350 · Instagram Post</span><div><button type="button">−</button><em>72%</em><button type="button">+</button></div></div><div className={`${styles.artboard} ${styles[`artboard${selected}`]}`}><span>15 / 10</span><div><small>YENİ KOLEKSİYON</small><h2>akışını<br />yenile.</h2><p>Mira Studio · FW26</p></div><Image src="/assets/Amblem.svg" alt="" width={266} height={408} unoptimized /></div><p>Değişiklikler otomatik kaydedildi</p></div>
    <aside className={styles.properties}><h3>Tasarım</h3><label>Marka adı<input defaultValue="Mira Studio" /></label><label>Başlık<textarea defaultValue={"akışını\nyenile."} /></label><span>Marka renkleri</span><div className={styles.colorRow}><button type="button" /><button type="button" /><button type="button" /><button type="button" /></div><label>Format<select defaultValue="post"><option value="post">Instagram Post</option><option value="story">Story / Reel</option></select></label><button className={styles.exportButton} type="button" onClick={onExport}>Kitaplığa kaydet <span>→</span></button></aside>
  </section>;
}

function Planner({ planned, onPlan }: { planned: boolean; onPlan: () => void }) {
  return <section className={styles.planner}>
    <div className={styles.calendar}><div className={styles.calendarHead}><button type="button">‹</button><h3>Ekim 2026</h3><button type="button">›</button><span /><button type="button">Ay</button><button type="button">Hafta</button></div><div className={styles.weekdays}>{["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day) => <b key={day}>{day}</b>)}</div><div className={styles.days}>{Array.from({ length: 35 }, (_, index) => { const day = index - 2; return <div className={`${day === 8 ? styles.today : ""} ${day < 1 || day > 31 ? styles.mutedDay : ""}`} key={index}><span>{day < 1 ? 30 + day : day > 31 ? day - 31 : day}</span>{day === 6 ? <i className={styles.eventPurple}>Story seti</i> : null}{day === 8 ? <i className={styles.eventMint}>Mira yanıt</i> : null}{day === 13 ? <i className={styles.eventBlue}>Teaser</i> : null}{day === 15 ? <><i className={styles.eventPurple}>Lansman</i>{planned ? <i className={styles.eventMint}>Reels yayını</i> : null}</> : null}{day === 22 ? <i className={styles.eventBlue}>Kampanya</i> : null}</div>; })}</div></div>
    <aside className={styles.opportunities}><div><span>AI FIRSATLARI</span><b>3 yeni</b></div><h3>Konuşmadan takvime</h3><p>Mesajlarındaki tarihlerden ve ihtiyaçlardan öneriler oluşturduk.</p><article><SparkIcon /><small>Mira Studio konuşmasından</small><h4>Lansman Reels</h4><p>15 Ekim · 18:00<br />Instagram + TikTok</p><button type="button" onClick={onPlan}>{planned ? "Takvime eklendi ✓" : "Takvime ekle →"}</button></article><article><SparkIcon /><small>Atelier K konuşmasından</small><h4>İlk hafta indirimi</h4><p>18 Ekim · Tüm kanallar</p><button type="button">İncele →</button></article></aside>
  </section>;
}

function Library({ items, onEdit }: { items: LibraryItem[]; onEdit: () => void }) {
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [selected, setSelected] = useState<number | null>(null);
  const visibleItems = filter === "all" ? items : items.filter((item) => item.type === filter);

  return <section className={styles.library}>
    <div className={styles.libraryBar}>
      <div className={styles.libraryFilters}><button className={filter === "all" ? styles.activeFilter : ""} type="button" onClick={() => setFilter("all")}>Tümü <b>{items.length}</b></button><button className={filter === "image" ? styles.activeFilter : ""} type="button" onClick={() => setFilter("image")}>Görseller</button><button className={filter === "video" ? styles.activeFilter : ""} type="button" onClick={() => setFilter("video")}>Videolar</button></div>
      <div className={styles.libraryTools}><label><span>⌕</span><input aria-label="Kitaplıkta ara" placeholder="Dosyalarda ara…" /></label><button type="button">⇅ Son eklenen</button><button type="button">+ Medya yükle</button></div>
    </div>
    <div className={styles.librarySummary}><div><span>BU AY</span><h3>Üretim galerisi</h3></div><p><b>{items.length}</b> içerik · <b>1.2 GB</b> kullanılıyor</p></div>
    <div className={styles.libraryGrid}>{visibleItems.map((item) => <article className={selected === item.id ? styles.selectedAsset : ""} key={item.id} onClick={() => setSelected(item.id)}>
      <div className={`${styles.assetPreview} ${styles[item.tone]}`}><span>puble</span><div><small>{item.type === "video" ? "MOTION / REEL" : "SOCIAL POST"}</small><b>{item.title}</b></div>{item.type === "video" ? <i>▶</i> : null}<button type="button" aria-label={`${item.title} seçenekleri`}>•••</button></div>
      <div className={styles.assetMeta}><div><b>{item.title}</b><small>{item.type === "video" ? "Video" : "Görsel"} · {item.format}</small></div><time>{item.date}</time></div>
      <div className={styles.assetActions}><button type="button" onClick={(event) => { event.stopPropagation(); onEdit(); }}>Editörde aç</button><button type="button">↓</button></div>
    </article>)}</div>
    {visibleItems.length === 0 ? <div className={styles.emptyLibrary}><span>▦</span><h3>Henüz içerik yok</h3><p>Editörde ürettiğin içerikler burada görünecek.</p><button type="button" onClick={onEdit}>Editöre git →</button></div> : null}
  </section>;
}

function Ads() {
  const [campaigns, setCampaigns] = useState([
    { id: 1, name: "Mira Studio · Lansman", channel: "Instagram + Facebook", status: true, budget: "₺3.200", spent: "₺1.840", result: "428 tıklama", roas: "3.4x" },
    { id: 2, name: "Creator Paketleri", channel: "TikTok", status: true, budget: "₺1.500", spent: "₺620", result: "96 kayıt", roas: "2.8x" },
    { id: 3, name: "Marka Bilinirliği", channel: "LinkedIn", status: false, budget: "₺2.000", spent: "₺2.000", result: "84K gösterim", roas: "—" },
  ]);

  function toggleCampaign(id: number) {
    setCampaigns((items) => items.map((item) => item.id === id ? { ...item, status: !item.status } : item));
  }

  return <section className={styles.ads}>
    <div className={styles.adsHero}><div><span>REKLAM MERKEZİ</span><h2>Organik akışından<br />reklama, tek adımda.</h2><p>Kitaplığındaki kreatifleri kampanyaya dönüştür; bütçeyi ve sonuçları kanallar arasında izle.</p><button type="button">+ Kampanya oluştur</button></div><div className={styles.adsOrbit}><span>ROAS</span><b>3.2x</b><small>Son 30 gün</small><i>↗ %18.4</i></div></div>
    <div className={styles.adStats}><article><span>Toplam harcama</span><b>₺4.460</b><small>₺6.700 bütçe</small><i><u style={{ width: "67%" }} /></i></article><article><span>Gösterim</span><b>184.2K</b><small>Önceki döneme göre</small><em>↗ %24</em></article><article><span>Sonuç</span><b>524</b><small>Tıklama + kayıt</small><em>↗ %12</em></article><article><span>Aktif kampanya</span><b>{campaigns.filter((item) => item.status).length}</b><small>{campaigns.length} kampanyadan</small><em className={styles.liveStatus}>● YAYINDA</em></article></div>
    <div className={styles.campaigns}><div className={styles.campaignHead}><div><span>KAMPANYALAR</span><h3>Tüm reklamlar</h3></div><div><button type="button">Son 30 gün⌄</button><button type="button">Filtrele</button></div></div>
      <div className={styles.campaignTable}><div className={styles.tableLabels}><span>KAMPANYA</span><span>DURUM</span><span>BÜTÇE</span><span>HARCAMA</span><span>SONUÇ</span><span>ROAS</span><span /></div>{campaigns.map((campaign, index) => <article key={campaign.id}><div><i className={index === 0 ? styles.purple : index === 1 ? styles.dark : styles.blue}>{index === 1 ? "tt" : index === 2 ? "in" : "ig"}</i><span><b>{campaign.name}</b><small>{campaign.channel}</small></span></div><div><Toggle checked={campaign.status} onChange={() => toggleCampaign(campaign.id)} label={`${campaign.name} kampanyasını ${campaign.status ? "durdur" : "başlat"}`} /><small>{campaign.status ? "Aktif" : "Duraklatıldı"}</small></div><b>{campaign.budget}</b><span>{campaign.spent}</span><span>{campaign.result}</span><strong>{campaign.roas}</strong><button type="button">•••</button></article>)}</div>
    </div>
  </section>;
}

function Series() {
  const [activeSeries, setActiveSeries] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: false });
  const series = [
    { id: 1, title: "Haftanın Sosyal İpucu", category: "Eğitici seri", cadence: "Her Salı · 11:00", channels: "Instagram · LinkedIn", published: 8, total: 12, next: "14 Ekim", tone: "purple" },
    { id: 2, title: "Creator Spotlight", category: "Topluluk serisi", cadence: "Her Perşembe · 18:00", channels: "Instagram · TikTok", published: 5, total: 10, next: "16 Ekim", tone: "blue" },
    { id: 3, title: "Puble ile 1 Dakika", category: "Video serisi", cadence: "İki haftada bir", channels: "YouTube · TikTok", published: 3, total: 8, next: "Taslak", tone: "dark" },
  ];

  return <section className={styles.seriesPage}>
    <div className={styles.seriesHero}><div><span>İÇERİK SİSTEMİ</span><h2>Bir kez kurgula.<br />Düzenli üret.</h2><p>Tekrarlayan formatlarını seri haline getir; Puble sıradaki konuyu, taslağı ve yayın zamanını senin için takip etsin.</p><button type="button">+ Yeni seri oluştur</button></div><div className={styles.seriesLoop}><i>01</i><i>02</i><i>03</i><span>↻</span><b>3 aktif seri</b><small>16 içerik yayında</small></div></div>
    <div className={styles.seriesSummary}><article><span>Aktif seri</span><b>{Object.values(activeSeries).filter(Boolean).length}</b><small>3 seriden</small></article><article><span>Bu ay yayın</span><b>11</b><small>4 içerik sırada</small></article><article><span>Ort. devamlılık</span><b>%86</b><small>↗ %12 artış</small></article><article><span>Toplam erişim</span><b>284K</b><small>Seri içeriklerinden</small></article></div>
    <div className={styles.seriesSectionHead}><div><span>SERİLERİN</span><h3>İçerik ritimleri</h3></div><div><button className={styles.activeSeriesFilter} type="button">Tümü</button><button type="button">Aktif</button><button type="button">Taslak</button></div></div>
    <div className={styles.seriesGrid}>{series.map((item) => <article key={item.id} className={styles.seriesCard}>
      <div className={`${styles.seriesCover} ${styles[item.tone]}`}><span>{item.category}</span><b>{item.title}</b><i>0{item.id}</i></div>
      <div className={styles.seriesCardBody}><div className={styles.seriesCardTitle}><div><b>{item.title}</b><small>{item.channels}</small></div><Toggle checked={activeSeries[item.id]} onChange={() => setActiveSeries((items) => ({ ...items, [item.id]: !items[item.id] }))} label={`${item.title} serisini ${activeSeries[item.id] ? "durdur" : "başlat"}`} /></div><div className={styles.seriesSchedule}><span><small>YAYIN RİTMİ</small><b>{item.cadence}</b></span><span><small>SIRADAKİ</small><b>{item.next}</b></span></div><div className={styles.seriesProgress}><div><span>Seri ilerlemesi</span><b>{item.published} / {item.total}</b></div><i><u style={{ width: `${item.published / item.total * 100}%` }} /></i></div><div className={styles.seriesActions}><button type="button">Seriyi aç</button><button type="button">•••</button></div></div>
    </article>)}</div>
  </section>;
}

function Analytics() {
  const channels = [
    { icon: "ig", name: "Instagram", followers: "24.8K", reach: "186K", engagement: "%6.8", growth: "+%18.4", tone: "purple" },
    { icon: "tt", name: "TikTok", followers: "18.2K", reach: "241K", engagement: "%8.1", growth: "+%24.7", tone: "dark" },
    { icon: "in", name: "LinkedIn", followers: "8.6K", reach: "74K", engagement: "%4.9", growth: "+%9.2", tone: "blue" },
    { icon: "yt", name: "YouTube", followers: "6.1K", reach: "92K", engagement: "%5.4", growth: "+%12.6", tone: "mint" },
  ];
  const bars = [48, 63, 55, 78, 71, 89, 82, 96, 84, 108, 101, 122];

  return <section className={styles.analytics}>
    <div className={styles.analyticsToolbar}><div><button className={styles.activeRange} type="button">30 gün</button><button type="button">90 gün</button><button type="button">12 ay</button></div><button type="button">↓ Raporu indir</button></div>
    <div className={styles.analyticsStats}><article><span>Toplam erişim</span><b>593.4K</b><em>↗ %21.8</em><small>Önceki döneme göre</small></article><article><span>Etkileşim</span><b>42.8K</b><em>↗ %14.2</em><small>Beğeni, yorum ve paylaşım</small></article><article><span>Yeni takipçi</span><b>+3,284</b><em>↗ %18.6</em><small>Tüm kanallar</small></article><article><span>Ort. etkileşim</span><b>%6.3</b><em>↗ %0.8</em><small>Sektör ortalaması %3.9</small></article></div>
    <div className={styles.analyticsGrid}>
      <article className={styles.reachChart}><div><span>ERİŞİM TRENDİ</span><h3>Kanalların birlikte büyüyor.</h3><p>Son 30 günde toplam erişim 593 binin üzerine çıktı.</p></div><div className={styles.chartLegend}><span><i /> Organik</span><span><i /> Reklam</span></div><div className={styles.barChart}>{bars.map((height, index) => <i key={index} style={{ height }}><u style={{ height: `${Math.max(18, height * .36)}px` }} /></i>)}</div><div className={styles.chartAxis}><span>1 Eki</span><span>8 Eki</span><span>15 Eki</span><span>22 Eki</span><span>30 Eki</span></div></article>
      <article className={styles.topContent}><span>EN İYİ İÇERİK</span><div className={styles.topContentVisual}><b>akışını<br />yenile.</b><small>REELS · 18 EKİM</small></div><h3>Mira Studio lansman reels</h3><div><span><b>84.2K</b><small>Erişim</small></span><span><b>%9.4</b><small>Etkileşim</small></span></div><button type="button">İçeriği görüntüle →</button></article>
    </div>
    <div className={styles.channelAnalytics}><div className={styles.channelAnalyticsHead}><div><span>KANAL PERFORMANSI</span><h3>Tüm hesaplar</h3></div><button type="button">Karşılaştır ⇅</button></div><div className={styles.channelRows}><div className={styles.channelLabels}><span>KANAL</span><span>TAKİPÇİ</span><span>ERİŞİM</span><span>ETKİLEŞİM</span><span>BÜYÜME</span></div>{channels.map((channel) => <article key={channel.name}><div><i className={styles[channel.tone]}>{channel.icon}</i><b>{channel.name}</b></div><span>{channel.followers}</span><span>{channel.reach}</span><span>{channel.engagement}</span><em>{channel.growth}</em></article>)}</div></div>
  </section>;
}

function PostComposerModal({ onClose }: { onClose: () => void }) {
  const channels = [{ id: "instagram", icon: "ig", name: "Instagram" }, { id: "facebook", icon: "fb", name: "Facebook" }, { id: "linkedin", icon: "in", name: "LinkedIn" }, { id: "tiktok", icon: "tt", name: "TikTok" }, { id: "youtube", icon: "yt", name: "YouTube" }, { id: "threads", icon: "th", name: "Threads" }, { id: "bluesky", icon: "bs", name: "BlueSky" }, { id: "pinterest", icon: "pi", name: "Pinterest" }];
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["instagram"]);
  const [postText, setPostText] = useState("");
  const [hasMedia, setHasMedia] = useState(false);
  const [feedback, setFeedback] = useState("");

  function toggleChannel(id: string) {
    setSelectedChannels((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  }

  function complete(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(""), 2200);
  }

  return <div className={styles.composerBackdrop} role="presentation">
    <section className={styles.postComposer} role="dialog" aria-modal="true" aria-labelledby="post-composer-title">
      <header className={styles.postComposerHead}><div><h2 id="post-composer-title">Gönderi oluştur</h2><button type="button">◇ Etiketler⌄</button></div><nav><button type="button">▤ Şablonlar</button><button type="button">✦ AI Asistan</button><button className={styles.previewActive} type="button">◉ Önizleme</button><button type="button" aria-label="Tam ekran">↗</button><button type="button" onClick={onClose} aria-label="Gönderi penceresini kapat">×</button></nav></header>
      <div className={styles.postComposerBody}>
        <div className={styles.postEditorPane}>
          <div className={styles.channelPicker} aria-label="Paylaşım kanalları">{channels.map((channel) => <button className={selectedChannels.includes(channel.id) ? styles.selectedChannel : ""} type="button" key={channel.id} onClick={() => toggleChannel(channel.id)} aria-pressed={selectedChannels.includes(channel.id)} title={channel.name}><span>{channel.icon}</span><small>{channel.name}</small></button>)}</div>
          <div className={styles.postTextArea}><textarea value={postText} onChange={(event) => setPostText(event.target.value)} placeholder="Bir şeyler yaz veya şablonlardan ilham al…" maxLength={2200} /><div className={styles.mediaDrop}><input type="file" accept="image/*,video/*" onChange={(event) => setHasMedia(Boolean(event.target.files?.length))} aria-label="Gönderiye medya ekle" /><span>{hasMedia ? "✓" : "▧"}</span><b>{hasMedia ? "Medya eklendi" : "Sürükleyip bırak"}</b><small>{hasMedia ? "Dosya önizlemeye hazır" : "veya dosya seç"}</small></div><div className={styles.postTools}><button type="button">＋⌄</button><button type="button">☺</button><button type="button">#</button><span>{postText.length} / 2200</span></div></div>
        </div>
        <aside className={styles.postPreviewPane}><div className={styles.previewTitle}><h3>Gönderi önizlemesi</h3><span>ⓘ</span></div>{postText || hasMedia ? <div className={styles.socialPostPreview}><div><i>BÖ</i><span><b>Puble</b><small>{selectedChannels.length || 0} kanalda yayınlanacak</small></span><em>•••</em></div><p>{postText || "Gönderi metnin burada görünecek."}</p>{hasMedia ? <div className={styles.previewMedia}><SparkIcon /><b>Medya önizlemesi</b></div> : null}<footer><span>♡</span><span>◇</span><span>↗</span></footer></div> : <div className={styles.emptyPostPreview}><SparkIcon /><div><i /><i /><i /></div><p>Gönderinin önizlemesini burada göreceksin.</p><small>Bir kanal seçip içeriğini yazmaya başla.</small></div>}</aside>
      </div>
      <footer className={styles.postComposerFoot}><button type="button" onClick={() => complete("Taslak kaydedildi")}>Taslağı kaydet</button><div>{feedback ? <span>{feedback}</span> : null}<button type="button" onClick={() => complete("Gönderi planlandı")}>Planla</button><button type="button" onClick={() => complete("Gönderi paylaşım kuyruğuna alındı")}>Paylaş</button></div></footer>
    </section>
  </div>;
}

function PlanUsageModal({ onClose, onPlans }: { onClose: () => void; onPlans: () => void }) {
  return <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className={styles.planModal} role="dialog" aria-modal="true" aria-labelledby="plan-modal-title">
      <div className={styles.modalHead}><div><span>FREE PLAN</span><h2 id="plan-modal-title">Plan kullanım detayları</h2><p>10 Ekim – 9 Kasım kullanım dönemi</p></div><button type="button" onClick={onClose} aria-label="Pencereyi kapat">×</button></div>
      <div className={styles.modalPlan}><div><span>MEVCUT PAKET</span><b>Free</b><small>Temel sosyal medya akışını ücretsiz kullan.</small></div><button type="button" onClick={onPlans}>Planı yükselt ↗</button></div>
      <div className={styles.modalUsage}>
        <article><div><span>Aktif sohbet</span><b>3 <small>/ 5</small></b></div><i><u className={styles.purple} style={{ width: "60%" }} /></i><p><strong>2 slot</strong> kullanılabilir. Arşivlenen sohbet slotu yeniden açılır.</p></article>
        <article><div><span>AI mesaj kullanımı</span><b>64 <small>/ 150</small></b></div><i><u className={styles.blue} style={{ width: "43%" }} /></i><p><strong>86 kullanım</strong> kaldı. Kota her sohbet için ayrı hesaplanır.</p></article>
        <article><div><span>Bağlı sosyal hesap</span><b>3 <small>/ 4</small></b></div><i><u className={styles.mint} style={{ width: "75%" }} /></i><p>Instagram, TikTok ve LinkedIn aktif. <strong>1 hesap</strong> daha bağlanabilir.</p></article>
        <article><div><span>Medya depolama</span><b>1.2 <small>/ 5 GB</small></b></div><i><u className={styles.dark} style={{ width: "24%" }} /></i><p>Kitaplık için <strong>3.8 GB</strong> depolama alanın kaldı.</p></article>
      </div>
      <div className={styles.modalIncluded}><div><span>PAKETİNE DAHİL</span><b>Free ile kullanabildiklerin</b></div><ul><li>✓ Tek gelen kutusu</li><li>✓ Profesyonelleştir</li><li>✓ İçerik planlayıcı</li><li>✓ Temel editör</li><li>✓ Creator keşfi</li><li>✓ Reklam performans takibi</li></ul></div>
      <div className={styles.modalFoot}><span>Sonraki yenilenme: <b>9 Kasım 2026</b></span><button type="button" onClick={onClose}>Tamam</button></div>
    </section>
  </div>;
}

type AIMessage = { id: number; role: "assistant" | "user"; text: string };

function AIChat({ open, onToggle, onClose, onNavigate }: { open: boolean; onToggle: () => void; onClose: () => void; onNavigate: (view: View) => void }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<AIMessage[]>([
    { id: 1, role: "assistant", text: "Merhaba! Bugünkü sosyal medya akışında sana nasıl yardımcı olabilirim?" },
  ]);

  function answerFor(message: string) {
    const normalized = message.toLocaleLowerCase("tr-TR");
    if (normalized.includes("reklam")) return "Aktif kampanyalarında toplam ROAS 3.2x. Mira Studio lansman reklamı en iyi performansı gösteriyor.";
    if (normalized.includes("takvim") || normalized.includes("plan")) return "Takviminde bugün 18:00 için Lansman Reels içeriği var. İstersen Planner ekranına geçebilirsin.";
    if (normalized.includes("içerik") || normalized.includes("üret")) return "Kitaplığında 7 içerik bulunuyor. Gradient Reel taslağını editörde geliştirmeyi öneriyorum.";
    return "Bunu Puble akışına göre analiz ettim. Mesajlar, Kitaplık, Planner ve Reklamlar verilerini birlikte kullanarak sana yardımcı olabilirim.";
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    const stamp = Date.now();
    setMessages((items) => [...items, { id: stamp, role: "user", text }, { id: stamp + 1, role: "assistant", text: answerFor(text) }]);
    setInput("");
  }

  function addPrompt(text: string) {
    const stamp = Date.now();
    setMessages((items) => [...items, { id: stamp, role: "user", text }, { id: stamp + 1, role: "assistant", text: answerFor(text) }]);
  }

  return <div className={styles.aiChatRoot}>
    {open ? <section className={styles.aiChat} role="dialog" aria-modal="false" aria-labelledby="ai-chat-title">
      <header className={styles.aiChatHead}><div className={styles.aiAvatar}><SparkIcon /></div><div><span>PUBLE AI</span><h2 id="ai-chat-title">Akış asistanın</h2><small><i /> Çevrimiçi</small></div><button type="button" onClick={onClose} aria-label="AI sohbetini kapat">×</button></header>
      <div className={styles.aiContext}><span>Bu çalışma alanını kullanıyor</span><div><i>●</i> Inbox <i>▦</i> Kitaplık <i>▣</i> Planner</div></div>
      <div className={styles.aiMessages}>{messages.map((message) => <div className={message.role === "user" ? styles.aiUserMessage : styles.aiAssistantMessage} key={message.id}>{message.role === "assistant" ? <span><SparkIcon /></span> : null}<p>{message.text}</p></div>)}</div>
      {messages.length < 4 ? <div className={styles.aiPrompts}><button type="button" onClick={() => addPrompt("Bugünkü içerik planımı özetle")}>Bugünkü planı özetle</button><button type="button" onClick={() => addPrompt("Reklam performansım nasıl?")}>Reklam performansı</button><button type="button" onClick={() => { onNavigate("editor"); onClose(); }}>Yeni içerik üret →</button></div> : null}
      <form className={styles.aiComposer} onSubmit={sendMessage}><label><textarea aria-label="Puble AI mesajı" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Puble AI'a bir şey sor…" rows={2} /><span>⌘ Enter</span></label><button type="submit" aria-label="AI mesajını gönder">↑</button></form>
      <footer><SparkIcon /> Yanıtlar çalışma alanındaki demo verilerinden üretilir.</footer>
    </section> : null}
    <button className={`${styles.aiBubble} ${open ? styles.aiBubbleOpen : ""}`} type="button" aria-label={open ? "AI sohbetini kapat" : "Puble AI sohbetini aç"} aria-expanded={open} onClick={onToggle}><span className={styles.aiBubbleIcon}><SparkIcon /></span><span className={styles.aiBubbleLabel}><b>Puble AI</b><small>Bir şey sor</small></span>{!open ? <i>1</i> : <em>×</em>}</button>
  </div>;
}

function Social({ following, onFollow, onUse }: { following: string[]; onFollow: (handle: string) => void; onUse: () => void }) {
  const creators = [["SF", "@studioform", "Gradient Reel Pack", "12.4K", "purple"], ["MD", "@mira.design", "Launch Story Kit", "8.7K", "mint"], ["ML", "@motionlab", "Minimal Motion Set", "21.3K", "blue"]];
  return <section className={styles.social}><div className={styles.socialFeatured}><div><span>HAFTANIN CREATOR&apos;I</span><h2>@studioform</h2><p>Markalar için hareketli, cesur ve kullanıma hazır sosyal medya sistemleri.</p><div><b>24<small>template</small></b><b>12.4K<small>takipçi</small></b></div><button type="button" onClick={() => onFollow("@studioform")}>{following.includes("@studioform") ? "Takip ediliyor ✓" : "Takip et +"}</button></div><div className={styles.featuredVisual}><Image src="/assets/Amblem.svg" alt="Puble amblemi" width={266} height={408} unoptimized /><span>NEW<br />FLOW</span></div></div><div className={styles.creatorTitle}><div><span>KEŞFET</span><h3>Trend template paketleri</h3></div><button type="button">Tümünü gör →</button></div><div className={styles.creatorCards}>{creators.map((creator) => <article key={creator[1]}><div className={`${styles.creatorArt} ${styles[creator[4]]}`}><span>{creator[0]}</span><em>CREATOR</em></div><div className={styles.creatorMeta}><i>{creator[0]}</i><div><span>{creator[1]}</span><b>{creator[2]}</b><small>{creator[3]} takipçi</small></div><button type="button" onClick={() => onFollow(creator[1])}>{following.includes(creator[1]) ? "✓" : "+"}</button></div><button className={styles.useTemplate} type="button" onClick={onUse}>Template&apos;i kullan →</button></article>)}</div></section>;
}

type SettingsTab = "profile" | "accounts" | "brand" | "notifications" | "usage" | "security";

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return <button className={`${styles.toggle} ${checked ? styles.toggleOn : ""}`} type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange}><span /></button>;
}

const socialPlatforms = [
  { key: "instagram", icon: "ig", name: "Instagram", detail: "Meta Graph API", color: "purple" },
  { key: "threads", icon: "th", name: "Threads", detail: "Threads API", color: "dark" },
  { key: "linkedin", icon: "in", name: "LinkedIn", detail: "LinkedIn Marketing API", color: "blue" },
  { key: "facebook", icon: "fb", name: "Facebook", detail: "Meta Graph API", color: "blue" },
  { key: "bluesky", icon: "bs", name: "BlueSky", detail: "AT Protocol", color: "mint" },
  { key: "substack", icon: "su", name: "Substack", detail: "Publication API", color: "dark" },
  { key: "youtube", icon: "yt", name: "YouTube", detail: "YouTube Data API", color: "purple" },
  { key: "tiktok", icon: "tt", name: "TikTok", detail: "TikTok for Developers", color: "dark" },
  { key: "mastodon", icon: "ma", name: "Mastodon", detail: "Mastodon REST API", color: "blue" },
  { key: "pinterest", icon: "pi", name: "Pinterest", detail: "Pinterest API", color: "purple" },
  { key: "googleBusiness", icon: "gb", name: "Google Business", detail: "Business Profile API", color: "mint" },
  { key: "twitter", icon: "x", name: "Twitter / X", detail: "X API", color: "dark" },
] as const;

function Settings({ user }: { user: DemoUser }) {
  const [tab, setTab] = useState<SettingsTab>("brand");
  const [tone, setTone] = useState("Samimi ve profesyonel");
  const [approvalRequired, setApprovalRequired] = useState(true);
  const [connected, setConnected] = useState<Record<string, boolean>>({ instagram: true, tiktok: true, linkedin: true });
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
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
        <SettingTitle eyebrow="CONNECT" title="Bağlı hesaplar" text="Desteklenen sosyal ağların API anahtarlarını ekle ve bağlantı durumlarını yönet." />
        <div className={styles.apiSecurityNote}><span>⌾</span><div><b>Anahtar güvenliği</b><p>Bu demo alanlara yazılan anahtarları kalıcı olarak saklamaz. Production&apos;da anahtarlar şifrelenmiş sunucu secret&apos;ları olarak tutulmalıdır.</p></div></div>
        <div className={styles.integrationGrid}>{socialPlatforms.map((account) => <article key={account.key}>
          <div className={styles.integrationHead}><i className={styles[account.color]}>{account.icon}</i><div><b>{account.name}</b><small>{account.detail}</small></div><span className={connected[account.key] ? styles.connected : styles.disconnected}><u />{connected[account.key] ? "Bağlı" : "Bağlı değil"}</span></div>
          <label>API Key / Access Token<div><input type="password" autoComplete="off" value={apiKeys[account.key] ?? ""} onChange={(event) => setApiKeys((items) => ({ ...items, [account.key]: event.target.value }))} placeholder={`${account.name} anahtarını gir`} /><button type="button" disabled={!apiKeys[account.key]} onClick={() => setConnected((items) => ({ ...items, [account.key]: true }))}>{connected[account.key] ? "Güncelle" : "Bağla"}</button></div></label>
        </article>)}</div>
        <div className={styles.settingNotice}><SparkIcon /><div><b>MockSocialProvider aktif</b><small>Gerçek sağlayıcı bağlantıları tamamlanana kadar güvenli demo verileri kullanılmaya devam eder.</small></div></div>
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
