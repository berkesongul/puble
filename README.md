# Puble

Puble, sosyal medya iletişimini, içerik üretimini ve planlamayı tek çalışma alanında birleştiren web ve mobil uygulamadır.

## Proje yapısı

```text
apps/
  web/       Next.js web uygulaması ve sunucu endpoint'leri
  mobile/    Expo / React Native mobil uygulaması
packages/
  shared/    Web ve mobil tarafından paylaşılan TypeScript tipleri
tools/
  figma-asset-exporter/  Figma assetlerini klasörlü ZIP olarak çıkaran yerel eklenti
```

## Başlangıç

Bağımlılıkları kurmak için:

```bash
pnpm install
```

Web uygulaması:

```bash
pnpm dev:web
```

Expo geliştirme sunucusu:

```bash
pnpm dev:mobile
```

Mobil uygulamayı belirli bir hedefte açmak için:

```bash
pnpm mobile:ios
pnpm mobile:android
pnpm mobile:web
```

Figma asset exporter eklentisini derlemek için:

```bash
pnpm build:figma
```

## Doğrulama

```bash
pnpm check
```

Ürün kararları ve marka bağlamı için [`PROJECT_MEMORY.md`](./PROJECT_MEMORY.md) dosyasını kullanın.
