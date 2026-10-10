# Puble müşteri backend'i

`/panel` Startup Weekend demo yüzeyidir ve tarayıcı içi test verileriyle çalışır. `/app` ise bu backend'e bağlı gerçek müşteri çalışma alanıdır.

## Kurulum

1. Bir Supabase projesi oluşturun.
2. `supabase/migrations/20261010000100_initial_backend.sql` migration'ını Supabase SQL Editor veya CLI ile uygulayın.
3. `apps/web/.env.example` dosyasını `apps/web/.env.local` olarak kopyalayıp değerleri doldurun.
4. `PUBLE_CREDENTIALS_SECRET` için en az 32 karakterlik, rastgele ve yalnızca sunucuda tutulan bir değer kullanın.
5. AI akışları için `OPENAI_API_KEY` tanımlayın. Anahtar yoksa müşteri paneli sahte sonuç üretmez; açıklayıcı bir yapılandırma hatası döndürür.
6. `pnpm dev:web` ile uygulamayı başlatın.

`SUPABASE_SERVICE_ROLE_KEY`, `PUBLE_CREDENTIALS_SECRET` ve `OPENAI_API_KEY` hiçbir zaman `NEXT_PUBLIC_` öneki taşımamalı veya istemciye gönderilmemelidir.

## Veri ve güvenlik modeli

- Supabase Auth e-posta/şifre oturumlarını yönetir.
- Yeni kullanıcı trigger'ı profil, çalışma alanı, owner üyeliği, marka hafızası, bildirim tercihleri ve kullanım sayacını atomik olarak oluşturur.
- Ürün kayıtlarının tamamı `workspace_id` ile ayrılır ve PostgreSQL Row Level Security ile korunur.
- API, istemciden `workspace_id` kabul etmez; çalışma alanını doğrulanmış oturum üyeliğinden çözer.
- Sosyal platform kimlik bilgileri AES-256-GCM ile şifrelenir ve kullanıcı RLS erişimi bulunmayan `social_account_secrets` tablosunda saklanır.
- Medya dosyaları private `workspace-media` bucket'ına, workspace/user önekli signed upload URL ile yüklenir.
- Kritik mutasyonlar `audit_logs` tablosuna yazılır.

## API yüzeyi

- `GET /api/v1/bootstrap`: müşteri panelinin çalışma alanı özeti
- `GET|POST /api/v1/resources/:resource`: posts, assets, series, ads, notifications, conversations, opportunities
- `PATCH|DELETE /api/v1/resources/:resource/:id`: workspace kontrollü güncelleme/silme
- `GET|POST /api/v1/conversations/:id/messages`: konuşma mesajları
- `GET|POST /api/v1/social-accounts`: bağlı hesaplar ve güvenli credential kasası
- `DELETE /api/v1/social-accounts/:id`: bağlantıyı ve secret'ı birlikte kaldırma
- `GET|PATCH /api/v1/settings`: workspace, marka hafızası, bildirim ve kullanım ayarları
- `POST /api/v1/actions`: profesyonelleştir, konuşmadan fırsat çıkar, fırsatı gönderiye çevir, planla, yayın kuyruğuna al, bildirimleri okundu işaretle
- `POST /api/v1/uploads`: private medya için tek kullanımlık signed upload
- `POST|DELETE /api/v1/creators/:id/follow`: creator takip durumu
- `POST /api/internal/scheduler`: `CRON_SECRET` korumalı planlı gönderi kuyruğu üretimi

## Harici platform sınırı

Gönderiyi `publishing` durumuna almak kalıcı yayın kuyruğunu oluşturur. Instagram, Threads, LinkedIn ve diğer platformlarda gerçek paylaşım yapabilmek için her platformun onaylı OAuth uygulaması, izin kapsamları, webhook doğrulaması ve provider worker'ı ayrıca yapılandırılmalıdır. Bu kimlik bilgileri olmadan backend dış platforma gönderi atmış gibi davranmaz.

## Kontroller

```bash
pnpm --filter web test
pnpm --filter web lint
pnpm --filter web build
```
