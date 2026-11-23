# Orkestra

Orkestra, yangın, hidrofor ve atık su pompalarının ölçümlerini bina ölçeğinde birleştiren çok ajanlı yönetim konseptidir. Aynı 2B bina kesiti boyunca yağmur, kuyudaki su seviyesi ve ajan sinyalleri canlanır. Örnek ekranlar temsili veri kullanır.

## Yerel kurulum

Node.js 22 ile proje klasöründe çalıştırın.

    npm ci
    npm run dev
    npm run build

Geliştirme sunucusu varsayılan olarak http://localhost:5173 adresinde açılır. Windows PowerShell yürütme ilkesi npm betiğini engellerse npm.cmd kullanın. Üretim dosyaları dist klasörüne yazılır.

## 180 saniyelik jüri akışı

Sunumu oynat, açılıştan Proje Fikri Kanvası’na kadar yaklaşık üç dakikada ilerler. Kaydırma ve bağlantılarla manuel sunum da yapılabilir. Otomatik oynatma sırasında etkileşim sunumu duraklatır.

| Süre | Anlatım |
| --- | --- |
| 0–30 sn | **Sokak.** Yağmur hızlanıyor. Bu binada yangın, hidrofor ve atık su sistemleri farklı görevler üstleniyor. Üç ayrı sinyali bir araya getirdiğimizde binada gerçekten ne olduğunu görebiliyoruz. |
| 30–70 sn | **Bodrum.** Yağmur suyu kuyuda birikiyor. Atık su ajanı, seviyeyi bu binanın olağan yüzde 35–50 aralığıyla karşılaştırıyor. Kuyu yüzde 78’e çıkınca bulguyu şef ajana iletiyor. |
| 70–110 sn | **Ajanlar.** Hidrofor basıncı olağan aralıkta, yangın paneli hazır. Dijital ikiz bu ölçümleri aynı bina bağlamına yerleştiriyor. Şef ajan kuyunun ve şamandıranın kontrolünü öneriyor. |
| 110–145 sn | **Arayüzler.** Yönetici özet ve bildirim tercihlerini, teknisyen ölçüm geçmişini, Wilo filo durumunu görüyor. Sakin görünümünü açın ve örnek su kesintisi sorusunu gösterin. |
| 145–180 sn | **Pilot.** Mevcut Wilo bağlantısından salt okunur veriyle tek binada başlayın. Aynı olaylarda sabit eşik, bağımsız ajanlar ve şef ajanı karşılaştırın. Erken uyarı süresi, yanlış alarm ve plansız pompa olaylarını izleyin. Kanvas sekiz jüri sorusunun ayrıntılarını içerir. |

Film.tsx ortak bina sahnesini ve hareketleri, film.css kamera yerleşimini, content.ts ise örnek ölçümleri ve jüri kanvasını içerir. Görsel renkler Wilo’nun petrol yeşili ve açık nötrlerinden esinlenir.

## Görsel

ImageGen ile üretilen çağdaş mimari kesit public/orkestra-kesit.jpg dosyasındadır. Yağmur, kuyu suyu ve sinyal parçacıkları site içinde hareket eder.

> A pristine, modern premium architectural cutaway illustration for an interactive corporate water engineering website. Wide landscape 3:2 image, straight-on front sectional elevation with subtle precise 3D depth. Professional contemporary architectural studio rendering with crisp solid material surfaces and accurate straight thin architectural lines, graphic editorial realism, no photography. Absolutely NO paper grain, vintage, watercolor, sepia, scratch, paper collage, cartoon, comic, rounded toy geometry, black outlines or illustration frame. Visually alive from clear rainy urban daylight, reflective clean surfaces, deep petroleum teal shadows, vivid but restrained aquamarine water, fresh green trees, pale cool grey concrete and white architecture. One continuous ground line at exactly 53 percent of image height. Above ground: light blue-grey clouded sky and a modern four-storey apartment block in the right half, other softer contemporary city blocks in far background, leave the left quarter visually calm. Below ground: an open-section utility room taking up right 72 percent, with three separate realistic industrial green pump assemblies, connected metallic pipes, detailed professional engineered structure. At image right edge a visible deep straight vertical drainage well at x=91 to 97 percent, with still water LOW near the bottom at y=92 percent. Keep the cutaway ground level horizontal, the basement ceiling at y=55 percent, and the pump room floor at y=86 percent. Contemporary serious brand illustration with steel, petrol teal, controlled water-green accents and lively clean lighting. Edge to edge, little margin. No labels, no text, no logos, no UI, no arrows.
