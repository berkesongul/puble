"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type SiteLanguage = "tr" | "en" | "es" | "fr" | "ar";

export const languageNames: Record<SiteLanguage, string> = {
  tr: "Türkçe",
  en: "English",
  es: "Español",
  fr: "Français",
  ar: "العربية",
};

const baseCopy = {
  product: "Ürün",
  how: "Nasıl çalışır?",
  creator: "Creator",
  pricing: "Pricing",
  corporate: "Kurumsal",
  kvkk: "KVKK",
  login: "Giriş yap",
  signup: "Hesap oluştur",
  panel: "Panele git",
  logout: "Çıkış yap",
  eyebrow: "Sosyal çalışma alanın",
  heroA: "Sosyal medyayı",
  heroB: " yönetmekten fazlası.",
  lead: "Mesajlarını yönet, içeriğini üret ve konuşmalarından otomatik bir yayın planı çıkar. Hepsi tek bir akışta.",
  discover: "Puble'ı keşfet",
  seeHow: "Nasıl çalıştığını gör",
  flowA: "Tek panel. Dört akış.",
  flowB: "Tek alışkanlık.",
  productA: "Senin tonun.",
  productB: "Markanın dili.",
  plannerA: "Bir konuşma,",
  plannerB: "bir aylık fırsat.",
  creatorA: "Keşfet. Takip et.",
  creatorB: "Birlikte üret.",
  pricingA: "Akışın büyüdükçe",
  pricingB: "Puble da büyür.",
  early: "ERKEN ERİŞİM FİYATLARI",
  language: "Dil seç",
};

export const copy: Record<SiteLanguage, typeof baseCopy> = {
  tr: baseCopy,
  en: baseCopy,
  es: baseCopy,
  fr: baseCopy,
  ar: baseCopy,
};

export function triggerGoogleTranslate(lang: SiteLanguage) {
  if (typeof window === "undefined") return;

  const hostname = window.location.hostname;
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";

  // Set / clear googtrans cookies for Google Translate widget
  if (lang === "tr") {
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname};`;
    if (!isLocal) {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${hostname};`;
    }
    document.cookie = "googtrans=/tr/tr; path=/;";
  } else {
    const val = `/tr/${lang}`;
    document.cookie = `googtrans=${val}; path=/;`;
    document.cookie = `googtrans=${val}; path=/; domain=${hostname};`;
    if (!isLocal) {
      document.cookie = `googtrans=${val}; path=/; domain=.${hostname};`;
    }
  }

  // Set lang and dir on html root
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

  // Dispatch change on Google Translate combo element
  const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (select) {
    if (lang === "tr") {
      const hasTrOption = Boolean(select.querySelector('option[value="tr"]'));
      select.value = hasTrOption ? "tr" : "";
      select.dispatchEvent(new Event("change"));

      window.setTimeout(() => {
        if (document.querySelector("font[color]") || document.querySelector(".goog-text-highlight")) {
          window.location.reload();
        }
      }, 250);
    } else {
      select.value = lang;
      select.dispatchEvent(new Event("change"));
    }
  } else {
    // If widget combo is not ready yet, reload so the googtrans cookie activates on load
    window.location.reload();
  }
}

const LanguageContext = createContext<{
  language: SiteLanguage;
  setLanguage: (language: SiteLanguage) => void;
}>({
  language: "tr",
  setLanguage: () => undefined,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SiteLanguage>("tr");

  useEffect(() => {
    let saved = localStorage.getItem("puble-language") as SiteLanguage | null;
    if (!saved) {
      const match = document.cookie.match(/googtrans=\/tr\/([a-z]{2})/);
      if (match && match[1] in languageNames) {
        saved = match[1] as SiteLanguage;
      }
    }
    if (saved && saved in languageNames) {
      setLanguageState(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
    }
  }, []);

  function setLanguage(next: SiteLanguage) {
    setLanguageState(next);
    localStorage.setItem("puble-language", next);
    triggerGoogleTranslate(next);
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useSiteLanguage() {
  return useContext(LanguageContext);
}
