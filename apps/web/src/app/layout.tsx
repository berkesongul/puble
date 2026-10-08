import type { Metadata } from "next";
import { Sulphur_Point } from "next/font/google";
import "./globals.css";

const sulphurPoint = Sulphur_Point({
  variable: "--font-sulphur",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "Puble - Sosyal medyayı yönetmekten fazlası",
  description:
    "Mesajlarını yönet, içerik üret, AI ile profesyonelleştir ve konuşmalarından otomatik içerik takvimi çıkar.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={sulphurPoint.variable} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
