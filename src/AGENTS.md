# Admin Panel Gelistirme Talimatlari

## Temel ilke

- Yapıyı bozmadan yap.
- Mevcut Vue 3, TypeScript, Vite, Pinia, Vue Router, vue-i18n, TanStack Query ve shadcn-vue mimarisini koru.
- Yeni bir özellik eklerken mevcut katmanları genişlet; aynı işi yapan paralel bir yapı kurma.

## Klasor ve sorumluluklar

- Sayfa bileşenlerini `src/pages` altında tut.
- Ortak bileşenleri `src/components`, layout bileşenlerini `src/components/layout` altında tut.
- shadcn-vue tabanlı UI primitive bileşenlerini `src/components/ui` altında tut.
- Pinia store dosyalarını `src/store`, router kurallarını `src/router` altında tut.
- Kullanıcıya gösterilen dummy verileri yalnızca `src/data/*.json` dosyalarında sakla.
- Dummy veriye erişimi ve çalışma zamanı CRUD işlemlerini `src/service/dummy` katmanından geçir.
- TypeScript veri sözleşmelerini `src/types` altında tanımla.

## UI ve tema

- Ham buton, kart, input, rozet, avatar, dialog veya toast üretmeden önce `src/components/ui` altındaki shadcn-vue bileşenlerini kullan.
- Uygun bileşen yoksa shadcn-vue yapısına uyumlu, tekrar kullanılabilir bir UI primitive ekle.
- Açık ve karanlık temayı aynı CSS tokenları üzerinden yönet; bileşen içine sabit tema rengi gömme.
- Tema rengi ve köşe yumuşaklığı gibi tercihler `useThemeStore` üzerinden uygulanmalı ve kalıcı olmalı.
- `--background`, `--surface`, `--surface-soft`, `--foreground`, `--muted`, `--border`, `--primary` ve `--radius` tokenlarını koru.
- Masaüstü ve mobil kırılımlarda taşma, kesilme ve erişilemeyen aksiyon bırakma.

## Veri ve durum

- Sayfa bileşenlerine sabit dummy veri dizileri ekleme.
- Kimlik doğrulamayı Pinia auth store ve Vue Router route guard ile yönet.
- Sunucu/dummy servis verilerini TanStack Query üzerinden oku; mutation sonrasında ilgili query anahtarını yenile.
- Ekleme, düzenleme ve silme sonucunu kullanıcıya shadcn-vue Sonner toastı ile bildir.
- Silme işleminde onay penceresi göster; kullanıcı onayı olmadan kaydı kaldırma.

## Metin ve erişilebilirlik

- Kullanıcıya görünen bütün metinleri mevcut `vue-i18n` yapısından al.
- Türkçe ve İngilizce locale dosyalarını birlikte güncelle.
- İkon-only butonlara açıklayıcı `aria-label`, seçim kontrollerine `aria-pressed` veya uygun form etiketi ekle.
- Dialog, menü ve form kontrollerini klavye ve ekran okuyucu kullanımına uygun tut.

## Degisiklik guvenligi

- İlgisiz dosyaları ve kullanıcı değişikliklerini değiştirme veya geri alma.
- Backend/API sözleşmesi ekleme; bu proje dummy frontend olarak kalmalı.
- `node_modules`, `dist`, yerel ortam ve gizli anahtar dosyalarını repoya ekleme.
- Mevcut tema tokenlarını veya UI primitive API'lerini zorunlu olmadıkça kırma.

## Dogrulama

- Her değişiklikten sonra `npm run lint` ve `npm run build` çalıştır.
- Görsel değişikliklerde açık ve karanlık temayı tarayıcıda doğrula.
- Etkileşimli değişikliklerde ilgili kullanıcı akışını çalıştır; yalnızca kaynak kontrolüyle tamamlandı deme.
- Tarayıcı konsolunda hata ve uyarı bulunmadığını kontrol et.
