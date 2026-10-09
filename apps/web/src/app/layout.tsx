import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Puble - Sosyal medyayı yönetmekten fazlası",
  description:
    "Mesajlarını yönet, içerik üret, AI ile profesyonelleştir ve konuşmalarından otomatik içerik takvimi çıkar.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={poppins.variable} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
