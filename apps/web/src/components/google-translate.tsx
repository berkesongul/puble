"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

export function GoogleTranslateScript() {
  useEffect(() => {
    const hideBanner = () => {
      if (document.body.style.top && document.body.style.top !== "0px") {
        document.body.style.top = "0px";
      }
      const bannerElements = document.querySelectorAll<HTMLElement>(
        ".VIpgJd-ZVi9od-ORHb-OEVmcd, .goog-te-banner-frame, body > .skiptranslate, iframe[id*=':1.container'], iframe[class*='goog-te']"
      );
      bannerElements.forEach((el) => {
        el.style.setProperty("display", "none", "important");
        el.style.setProperty("visibility", "hidden", "important");
        el.style.setProperty("height", "0px", "important");
        el.style.setProperty("opacity", "0", "important");
      });
    };

    hideBanner();
    const observer = new MutationObserver(hideBanner);
    observer.observe(document.body, { attributes: true, childList: true });

    return () => observer.disconnect();
  }, []);
  return (
    <>
      <div
        id="google_translate_element"
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -9999,
          left: -9999,
          width: 0,
          height: 0,
          opacity: 0,
          pointerEvents: "none",
        }}
      />
      <Script
        id="google-translate-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.googleTranslateElementInit = function() {
              if (window.google && window.google.translate) {
                new window.google.translate.TranslateElement({
                  pageLanguage: 'tr',
                  includedLanguages: 'tr,en,es,fr,ar',
                  autoDisplay: false
                }, 'google_translate_element');
              }
            };
          `,
        }}
      />
      <Script
        id="google-translate-core"
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  );
}
