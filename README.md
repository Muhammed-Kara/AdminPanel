# Nova Admin — Vue

Vue 3, TypeScript, Vite ve shadcn-vue yaklaşımıyla hazırlanmış modern bir yönetim paneli. Proje, [Rekl0w/shadcn-admin-panel](https://github.com/Rekl0w/shadcn-admin-panel) deposunun katman ayrımı ve arayüz yaklaşımı incelenerek Vue ekosistemine uyarlanmıştır.

## Özellikler

- Dummy JSON doğrulamalı giriş ve korumalı rotalar
- Dashboard istatistikleri, gelir grafiği ve son siparişler
- Aranabilir kullanıcı, ürün ve sipariş tabloları
- Açık/koyu tema ve Türkçe/İngilizce dil desteği
- Masaüstü, tablet ve mobil uyumlu sidebar düzeni
- Pinia, Vue Router, TanStack Vue Query, vue-i18n ve Zod

## Demo hesabı

```text
E-posta: admin@example.com
Şifre: password
```

## Çalıştırma

Node.js 20.19+ veya 22.12+ gereklidir.

```bash
npm install
npm run dev
```

Kontroller:

```bash
npm run lint
npm run build
```

## Mimari

```text
src/
├── components/
│   ├── layout/       # Sidebar, header ve admin kabuğu
│   └── ui/           # Tekrar kullanılabilir temel bileşenler
├── data/             # Dummy JSON dosyaları
├── i18n/             # Dil kurulumu ve çeviriler
├── pages/            # Route seviyesindeki sayfalar
├── router/           # Route tanımları ve auth guard
├── service/dummy/    # JSON veri erişim katmanı
├── store/            # Pinia auth ve tema store'ları
└── types/            # Ortak TypeScript modelleri
```

Yeni dummy veri eklerken veriyi `src/data` altında tutun ve sayfaya doğrudan import etmek yerine `src/service/dummy/dummy-service.ts` üzerinden erişin. Proje içi geliştirme kuralları için `AGENTS.md` dosyasına bakın.
