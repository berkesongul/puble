"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AUTH_EVENT, clearDemoSession, readDemoSession, type DemoUser } from "@/lib/demo-auth";
import { copy, languageNames, useSiteLanguage, type SiteLanguage } from "@/components/site-language";

function ChevronIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4" /></svg>;
}

export function SiteHeader() {
  const { language, setLanguage } = useSiteLanguage();
  const text = copy[language];
  const [user, setUser] = useState<DemoUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const syncSession = () => setUser(readDemoSession());
    syncSession();
    window.addEventListener(AUTH_EVENT, syncSession);
    window.addEventListener("storage", syncSession);
    return () => {
      window.removeEventListener(AUTH_EVENT, syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  useEffect(() => {
    const syncScroll = () => setScrolled(window.scrollY > 24);
    syncScroll();
    window.addEventListener("scroll", syncScroll, { passive: true });
    return () => window.removeEventListener("scroll", syncScroll);
  }, []);

  function signOut() {
    clearDemoSession();
    setMenuOpen(false);
  }

  return (
    <header className={`site-header${scrolled ? " site-header-scrolled" : ""}`}>
      <div className="shell nav-shell">
        <Link className="brand" href="/#top" aria-label="Puble">
          <Image src="/assets/Main Logo.svg" alt="Puble" width={381} height={126} priority unoptimized />
        </Link>
        <nav aria-label="Main navigation">
          <a href="#product">{text.product}</a><a href="#flow">{text.how}</a><a href="#creators">{text.creator}</a><a href="#pricing">{text.pricing}</a><a href="#corporate">{text.corporate}</a>
        </nav>
        <label className="language-select"><span className="sr-only">{text.language}</span><b aria-hidden="true">◎</b><select value={language} onChange={(event) => setLanguage(event.target.value as SiteLanguage)}>{Object.entries(languageNames).map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label>
        {user ? (
          <div className="nav-profile">
            <button className="profile-trigger" type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
              <span>{user.initials}</span><span className="profile-trigger-copy"><b>{user.name}</b><small>Free workspace</small></span><ChevronIcon />
            </button>
            {menuOpen ? (
              <div className="profile-dropdown">
                <div><b>{user.name}</b><small>{user.email}</small></div>
                <Link href="/panel" onClick={() => setMenuOpen(false)}>{text.panel} <span>→</span></Link>
                <button type="button" onClick={signOut}>{text.logout}</button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="nav-auth">
            <Link className="nav-login" href="/auth?mode=login">{text.login}</Link>
            <Link className="button button-small button-dark" href="/auth?mode=signup">{text.signup}</Link>
          </div>
        )}
      </div>
    </header>
  );
}
