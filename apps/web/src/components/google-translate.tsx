"use client";

import Script from "next/script";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

export function GoogleTranslateScript() {
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
