import type { Metadata } from "next";
import { PanelApp } from "./panel-app";

export const metadata: Metadata = {
  title: "Çalışma alanı | Puble",
  description: "Puble sosyal medya yönetim paneli.",
};

export default function PanelPage() {
  return <PanelApp />;
}
