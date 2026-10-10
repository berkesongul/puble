import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./kvkk.module.css";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni | Puble",
  description: "Puble kişisel verilerin işlenmesine ilişkin demo aydınlatma metni.",
};

const dataGroups = [
  ["Kimlik ve iletişim", "Ad, soyad, e-posta adresi ve kullanıcı tarafından sağlanan iletişim bilgileri."],
  ["Hesap ve çalışma alanı", "Profil, marka tercihleri, bildirim ayarları ve çalışma alanı yapılandırmaları."],
  ["İçerik ve kullanım", "Taslak gönderiler, üretilen içerikler, planlama seçimleri ve özellik kullanım bilgileri."],
  ["Bağlantı bilgileri", "Kullanıcının sosyal kanal bağlantısı için girdiği yapılandırma alanları. Demo alanına gerçek API anahtarı girilmemelidir."],
] as const;

const rights = [
  "Kişisel verilerinizin işlenip işlenmediğini öğrenme ve işlenmişse buna ilişkin bilgi isteme,",
  "Verilerin işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,",
  "Verilerin aktarıldığı yurt içindeki veya yurt dışındaki üçüncü kişileri bilme,",
  "Eksik veya yanlış işlenen verilerin düzeltilmesini; şartları varsa silinmesini ya da yok edilmesini isteme,",
  "Düzeltme, silme veya yok etme işlemlerinin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,",
  "Münhasıran otomatik sistemlerle analiz sonucu aleyhinize bir sonuca itiraz etme ve kanuna aykırı işleme nedeniyle zararın giderilmesini talep etme.",
] as const;

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16 10H5m4-5-5 5 5 5" /></svg>;
}

export default function KvkkPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.logo} href="/" aria-label="Puble ana sayfa">
            <Image src="/assets/Main Logo.svg" alt="Puble" width={381} height={126} priority unoptimized />
          </Link>
          <Link className={styles.backButton} href="/"><ArrowIcon /> Ana sayfaya dön</Link>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.shell}>
          <span className={styles.eyebrow}>HUKUKİ METİNLER · KVKK</span>
          <h1>KVKK Aydınlatma Metni</h1>
          <p>Puble deneyiminde kişisel verilerin hangi çerçevede ele alındığını anlaşılır ve şeffaf biçimde açıklayan demo metni.</p>
          <div className={styles.heroMeta}>
            <span>Demo taslağı</span>
            <time dateTime="2026-10-10">Son güncelleme: 10 Ekim 2026</time>
          </div>
        </div>
      </section>

      <div className={`${styles.shell} ${styles.layout}`}>
        <aside className={styles.navigation} aria-label="Sayfa içeriği">
          <strong>İçindekiler</strong>
          <a href="#veri-sorumlusu">01 · Veri sorumlusu</a>
          <a href="#veriler">02 · İşlenen veriler</a>
          <a href="#amaclar">03 · İşleme amaçları</a>
          <a href="#toplama">04 · Toplama ve hukuki sebep</a>
          <a href="#aktarim">05 · Veri aktarımı</a>
          <a href="#saklama">06 · Saklama ve güvenlik</a>
          <a href="#haklar">07 · Haklarınız</a>
          <a href="#basvuru">08 · Başvuru</a>
        </aside>

        <article className={styles.content}>
          <div className={styles.notice}>
            <span>!</span>
            <div><strong>Yayın öncesi tamamlanması gereken taslak</strong><p>Bu sayfa Startup Weekend demosu için hazırlanmıştır. Veri sorumlusunun tüzel kişiliği, iletişim kanalları, üretim altyapısı ve veri envanteri kesinleştiğinde bir hukuk uzmanı tarafından güncellenmeli ve doğrulanmalıdır.</p></div>
          </div>

          <section id="veri-sorumlusu">
            <span className={styles.index}>01</span><h2>Veri sorumlusu</h2>
            <p>6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu, ürünün üretim sürümünü işletmek üzere kurulacak Puble tüzel kişiliği olacaktır. Ticaret unvanı, adresi, MERSİS bilgisi ve resmi iletişim kanalı şirket kuruluşundan sonra bu alana eklenecektir.</p>
            <div className={styles.placeholder}><b>Üretim öncesi doldurulacak alan</b><span>Unvan · adres · MERSİS/VKN · KVKK başvuru e-postası</span></div>
          </section>

          <section id="veriler">
            <span className={styles.index}>02</span><h2>İşlenebilecek kişisel veriler</h2>
            <p>Hizmetin kullanılan özelliğine göre aşağıdaki veri grupları gündeme gelebilir. Nihai kapsam, üretim veri envanteri tamamlandığında daraltılacak ve güncellenecektir.</p>
            <div className={styles.dataGrid}>{dataGroups.map(([title, text]) => <div key={title}><strong>{title}</strong><p>{text}</p></div>)}</div>
          </section>

          <section id="amaclar">
            <span className={styles.index}>03</span><h2>İşleme amaçları</h2>
            <p>Kişisel veriler; hesap ve çalışma alanını oluşturmak, içerik üretme ve planlama özelliklerini sunmak, kullanıcı tercihlerini uygulamak, destek taleplerini yanıtlamak, hizmet güvenliğini sağlamak ve kullanıcının açıkça talep ettiği sosyal kanal bağlantılarını kurmak amaçlarıyla işlenebilir.</p>
            <p>Veriler, burada belirtilen amaçlarla bağdaşmayan bir amaç için kullanılmamalı; ürün yayına alınmadan önce her veri alanı için gereklilik ve ölçülülük değerlendirmesi yapılmalıdır.</p>
          </section>

          <section id="toplama">
            <span className={styles.index}>04</span><h2>Toplama yöntemi ve hukuki sebep</h2>
            <p>Veriler; kullanıcının web veya mobil uygulamadaki formlara bilgi girmesi, içerik oluşturması, tercih belirlemesi ve ilgili özelliği kullanması yoluyla elektronik ortamda toplanabilir.</p>
            <p>Üretim sürümünde her işleme faaliyeti için KVKK’nın 5. ve gerektiğinde 6. maddesindeki uygun hukuki sebep ayrıca eşleştirilecektir. Bu demo metni, henüz tamamlanmamış ürün akışları için hukuki sebep varsayımı yapmaz.</p>
          </section>

          <section id="aktarim">
            <span className={styles.index}>05</span><h2>Verilerin aktarılması</h2>
            <p>Mevcut yarışma demosu gerçek sosyal ağ bağlantısı veya üretim amaçlı veri aktarımı sunmaz. Üretim sürümünde barındırma, kimlik doğrulama, yapay zekâ ve sosyal ağ sağlayıcıları kullanılacaksa alıcı grupları, aktarım amaçları ve yurt dışı aktarım mekanizmaları hizmet devreye alınmadan önce açıkça belirtilecektir.</p>
          </section>

          <section id="saklama">
            <span className={styles.index}>06</span><h2>Saklama, silme ve güvenlik</h2>
            <p>Demo oturumu tarayıcıda geçici olarak saklanır ve parola kaydedilmez. Demo alanlarına gerçek parola, API anahtarı, müşteri verisi veya gizli içerik girilmemelidir. Üretim sürümünde saklama süreleri işleme amacı ve yasal yükümlülüklerle sınırlı tutulacak; süre sonunda veriler mevzuata uygun biçimde silinecek, yok edilecek veya anonim hâle getirilecektir.</p>
          </section>

          <section id="haklar">
            <span className={styles.index}>07</span><h2>KVKK kapsamındaki haklarınız</h2>
            <p>KVKK’nın 11. maddesi kapsamında veri sorumlusuna başvurarak:</p>
            <ul>{rights.map((right) => <li key={right}>{right}</li>)}</ul>
          </section>

          <section id="basvuru">
            <span className={styles.index}>08</span><h2>Başvuru yöntemi</h2>
            <p>İlgili kişi başvuruları, Puble’ın tüzel kişiliği ve resmi iletişim kanalı belirlendiğinde kimlik doğrulamaya elverişli bir yöntemle kabul edilecektir. Başvuru kanalının ilanından önce bu demo üzerinden KVKK başvurusu alınmamaktadır.</p>
            <div className={styles.placeholder}><b>Yayın öncesi eklenecek</b><span>KVKK başvuru adresi ve başvuru usulü</span></div>
          </section>

          <div className={styles.officialLink}>
            <div><strong>Resmî bilgi kaynağı</strong><p>Aydınlatma yükümlülüğünün kapsamını Kişisel Verileri Koruma Kurumu üzerinden inceleyebilirsiniz.</p></div>
            <a href="https://www.kvkk.gov.tr/Icerik/2033/Aydinlatma-Yukumlulugu-" target="_blank" rel="noreferrer">KVKK’ya git ↗</a>
          </div>
        </article>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div><Image src="/assets/Main Logo.svg" alt="Puble" width={381} height={126} unoptimized /><p>Create. Manage. Connect.</p></div>
          <Link href="/">Ana sayfa</Link>
          <p>© 2026 Puble. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </main>
  );
}
