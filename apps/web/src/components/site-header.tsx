"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AUTH_EVENT, clearDemoSession, readDemoSession, type DemoUser } from "@/lib/demo-auth";
import { copy, languageNames, languageFlags, useSiteLanguage, type SiteLanguage } from "@/components/site-language";

function ChevronIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4" /></svg>;
}

export function SiteHeader() {
  const { language, setLanguage } = useSiteLanguage();
  const text = copy[language];
  const [user, setUser] = useState<DemoUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
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

  useEffect(() => {
    if (!langOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".language-dropdown-wrapper")) {
        setLangOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLangOpen(false);
    };
    window.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [langOpen]);

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
          <Link href="/#product">{text.product}</Link>
          <Link href="/#flow">{text.how}</Link>
          <Link href="/#creators">{text.creator}</Link>
          <Link href="/#pricing">{text.pricing}</Link>
          <Link href="/kurumsal">{text.corporate}</Link>
        </nav>
        <div className="language-dropdown-wrapper notranslate" translate="no">
          <button
            type="button"
            className="language-trigger notranslate"
            aria-expanded={langOpen}
            aria-haspopup="listbox"
            aria-label={text.language}
            onClick={() => setLangOpen((prev) => !prev)}
            translate="no"
          >
            <span className="language-trigger-flag notranslate" translate="no" aria-hidden="true">
              {languageFlags[language]}
            </span>
            <span className="notranslate" translate="no">{languageNames[language]}</span>
            <svg className={`language-chevron ${langOpen ? "language-chevron-open" : ""}`} viewBox="0 0 20 20" aria-hidden="true">
              <path d="m6 8 4 4 4-4" />
            </svg>
          </button>

          {langOpen ? (
            <div className="language-menu notranslate" role="listbox" aria-label={text.language} translate="no">
              {Object.entries(languageNames).map(([code, name]) => {
                const isSelected = language === code;
                return (
                  <button
                    type="button"
                    key={code}
                    className={`language-option notranslate ${isSelected ? "language-option-selected" : ""}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setLanguage(code as SiteLanguage);
                      setLangOpen(false);
                    }}
                    translate="no"
                  >
                    <div className="language-option-left notranslate" translate="no">
                      <span className="language-flag notranslate" translate="no" aria-hidden="true">
                        {languageFlags[code as SiteLanguage]}
                      </span>
                      <span className="language-option-name notranslate" translate="no">{name}</span>
                    </div>
                    {isSelected ? <span className="language-option-check">✓</span> : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
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
