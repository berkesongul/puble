"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createDemoSession, DEMO_USER } from "@/lib/demo-auth";
import styles from "./auth.module.css";

type Mode = "login" | "signup";

function SparkIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c.5 5.8 4.2 9.5 10 10-5.8.5-9.5 4.2-10 10-.5-5.8-4.2-9.5-10-10 5.8-.5 9.5-4.2 10-10Z" /></svg>;
}

export function AuthScreen({ initialMode }: { initialMode: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setError("");
    window.history.replaceState(null, "", `/auth?mode=${nextMode}`);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "signup" && name.trim().length < 2) {
      setError("Çalışma alanın için adını yazmalısın.");
      return;
    }
    if (!email.includes("@") || password.length < 6) {
      setError("Geçerli bir e-posta ve en az 6 karakterli şifre kullan.");
      return;
    }

    createDemoSession(mode === "signup" ? name : email.split("@")[0], email);
    router.push("/panel");
  }

  function enterDemo() {
    createDemoSession(DEMO_USER.name, DEMO_USER.email);
    router.push("/panel");
  }

  return (
    <main className={styles.page}>
      <section className={styles.formSide}>
        <Link className={styles.brand} href="/" aria-label="Puble ana sayfa">
          <Image src="/assets/Main Logo.svg" alt="Puble" width={381} height={126} priority unoptimized />
        </Link>

        <div className={styles.formWrap}>
          <div className={styles.eyebrow}><span /> Sosyal çalışma alanın</div>
          <h1>{mode === "login" ? "Tekrar hoş geldin." : "Akışını tek yerde kur."}</h1>
          <p>{mode === "login" ? "Mesajların, içeriklerin ve planın kaldığın yerde." : "Hesabını oluştur; iletişimden yayına bütün sosyal medya işini tek akışta yönet."}</p>

          <div className={styles.tabs} role="tablist" aria-label="Hesap işlemleri">
            <button type="button" role="tab" aria-selected={mode === "login"} onClick={() => changeMode("login")}>Giriş yap</button>
            <button type="button" role="tab" aria-selected={mode === "signup"} onClick={() => changeMode("signup")}>Hesap oluştur</button>
          </div>

          <form className={styles.form} onSubmit={submit}>
            {mode === "signup" ? <label>Ad soyad<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Adın ve soyadın" required /></label> : null}
            <label>E-posta<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="sen@markan.com" required /></label>
            <label>Şifre<span className={styles.labelRow}><small>En az 6 karakter</small></span><input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="••••••••" minLength={6} required /></label>
            {error ? <p className={styles.error} role="alert">{error}</p> : null}
            <button className={styles.primaryButton} type="submit">{mode === "login" ? "Çalışma alanına gir" : "Ücretsiz hesabını oluştur"}<span>→</span></button>
          </form>

          <div className={styles.or}><span />veya<span /></div>
          <button className={styles.demoButton} type="button" onClick={enterDemo}><SparkIcon /> Demo hesabıyla keşfet</button>
          <small className={styles.demoNote}>Startup Weekend demosu · Kart bilgisi gerekmez</small>
        </div>
      </section>

      <section className={styles.visualSide} aria-label="Puble ürün akışı">
        <div className={styles.visualGrid} />
        <div className={styles.visualCopy}><span>TEK PANEL · DÖRT AKIŞ</span><h2>Konuşmadan<br /><em>yayına.</em></h2><p>Bağla, iletişim kur, üret ve planla. Puble bütün akışı senin için bir arada tutar.</p></div>
        <div className={styles.flowCard}>
          <div className={styles.flowTop}><span>Bugünün akışı</span><b>4 adım</b></div>
          <div className={styles.step}><i>01</i><div><b>Gelen mesajı yanıtla</b><small>Inbox · Mira Studio</small></div><span>✓</span></div>
          <div className={styles.step}><i>02</i><div><b>Metni profesyonelleştir</b><small>Marka tonu · Kurumsal</small></div><span>✓</span></div>
          <div className={`${styles.step} ${styles.activeStep}`}><i>03</i><div><b>İçerik fırsatını onayla</b><small>13 Ekim · Teaser</small></div><span>→</span></div>
          <div className={styles.step}><i>04</i><div><b>Editörde tamamla</b><small>Gradient Reel Pack</small></div><span>+</span></div>
        </div>
        <div className={styles.glow} />
      </section>
    </main>
  );
}

export function AuthQueryScreen() {
  const searchParams = useSearchParams();
  return <AuthScreen initialMode={searchParams.get("mode") === "signup" ? "signup" : "login"} />;
}
