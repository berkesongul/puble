"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AUTH_EVENT, clearDemoSession, readDemoSession, type DemoUser } from "@/lib/demo-auth";

function ChevronIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4" /></svg>;
}

export function SiteHeader() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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

  function signOut() {
    clearDemoSession();
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="shell nav-shell">
        <Link className="brand" href="/#top" aria-label="Puble ana sayfa">
          <Image src="/assets/Main Logo.svg" alt="Puble" width={381} height={126} priority unoptimized />
        </Link>
        <nav aria-label="Ana navigasyon">
          <a href="#product">Ürün</a><a href="#flow">Nasıl çalışır?</a><a href="#creators">Creator</a>
        </nav>
        {user ? (
          <div className="nav-profile">
            <button className="profile-trigger" type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
              <span>{user.initials}</span><span className="profile-trigger-copy"><b>{user.name}</b><small>Free workspace</small></span><ChevronIcon />
            </button>
            {menuOpen ? (
              <div className="profile-dropdown">
                <div><b>{user.name}</b><small>{user.email}</small></div>
                <Link href="/panel" onClick={() => setMenuOpen(false)}>Panele git <span>→</span></Link>
                <button type="button" onClick={signOut}>Çıkış yap</button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="nav-auth">
            <Link className="nav-login" href="/auth?mode=login">Giriş yap</Link>
            <Link className="button button-small button-dark" href="/auth?mode=signup">Hesap oluştur</Link>
          </div>
        )}
      </div>
    </header>
  );
}
