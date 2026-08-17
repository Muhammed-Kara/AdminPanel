# Proje Talimatlari

- Mevcut Vue 3, TypeScript, Vite ve shadcn-vue mimarisini koru.
- Sayfalari `src/pages`, ortak bilesenleri `src/components`, layout bilesenlerini `src/components/layout` altinda tut.
- Dummy verileri yalnizca `src/data/*.json` dosyalarinda sakla; sayfa bilesenlerine sabit veri dizileri ekleme.
- Veri erisimini `src/service/dummy` katmani uzerinden yap.
- Kimlik dogrulamayi Pinia store ve Vue Router route guard ile yonet.
- Kullaniciya gorunen metinlerde mevcut vue-i18n yapisini kullan.
- Tema tokenlarini ve `components/ui` taban bilesenlerini gereksiz yere degistirme.
- Arayuzlerde oncelikle `src/components/ui` altindaki shadcn-vue bilesenlerini kullan; uygun bir bilesen yoksa shadcn-vue yapisina uygun olarak bu katmana ekle.
- Sayfa ve layout dosyalarinda tekrar eden ham buton, kart, rozet ve avatar stilleri olusturma.
- Yapıyı bozmadan yap; yeni ozellikleri mevcut katmanlara yerlestir.
- Degisikliklerden sonra `npm run lint` ve `npm run build` calistir.
