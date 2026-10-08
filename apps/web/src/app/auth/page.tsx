import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthQueryScreen, AuthScreen } from "./auth-screen";

export const metadata: Metadata = {
  title: "Giriş yap | Puble",
  description: "Puble çalışma alanına giriş yap veya yeni hesabını oluştur.",
};

export default function AuthPage() {
  return <Suspense fallback={<AuthScreen initialMode="login" />}><AuthQueryScreen /></Suspense>;
}
