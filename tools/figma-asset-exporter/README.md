# Puble Asset Exporter

Bu Figma eklentisi, varsayılan olarak `AI Implemention` sayfasındaki assetleri klasör yapısını koruyarak ZIP halinde indirir. Figma MCP veya REST API kullanmaz; açık Figma dosyasının içinde çalışır.

## Figma dosyası düzeni

- Sayfadaki her üst seviye Section, Frame, Group veya Component Set bir klasördür.
- Bu kapsayıcıların doğrudan çocukları ayrı asset dosyalarıdır.
- Üst seviyedeki bağımsız katmanlar `ungrouped/` klasörüne gider.
- Nokta (`.`) ile başlayan veya görünmez katmanlar dışa aktarılmaz.
- Tekrarlanan dosya adlarına `-2`, `-3` gibi ekler verilir.

Örnek:

```text
AI Implemention
  Logos
    Logo Primary
    Logo Mono
  Icons
    Inbox
    Calendar
```

ZIP çıktısı:

```text
Logos/Logo Primary.svg
Logos/Logo Mono.svg
Icons/Inbox.svg
Icons/Calendar.svg
assets-manifest.json
```

## Kurulum

Depo kökünde:

```bash
pnpm install
pnpm build:figma
```

Figma Desktop içinde:

1. `Plugins > Development > Import plugin from manifest...` menüsünü açın.
2. Bu klasördeki `manifest.json` dosyasını seçin.
3. `Plugins > Development > Puble Asset Exporter` ile çalıştırın.

## Kullanım

1. Sayfa adını kontrol edin.
2. SVG veya PNG seçin.
3. `Yeniden tara` ile klasör ve asset sayılarını doğrulayın.
4. `Assetleri indir` ile ZIP dosyasını oluşturun.

SVG export sırasında metinler görsel tutarlılık için outline'a çevrilir. PNG için 1x-4x ölçek seçilebilir.
