# Orkestra

Orkestra, yangın, hidrofor ve atık su pompalarının ölçümlerini bina ölçeğinde birleştiren çok ajanlı yönetim konseptidir. Bu Türkçe sunum sitesi, tek bir sağanak senaryosunu ve aynı olay için dört örnek kullanıcı görünümünü içerir. Bütün ölçümler temsilidir.

## Yerel kurulum

Node.js 22 ile proje klasöründe çalıştırın.

    npm ci
    npm run dev
    npm run build

Geliştirme sunucusu varsayılan olarak http://localhost:5173 adresinde açılır. Windows PowerShell yürütme ilkesi npm betiğini engellerse komutlarda npm yerine npm.cmd kullanın. Üretim dosyaları dist klasörüne yazılır.

## 135 saniyelik jüri akışı

Kronometreyi ilk cümlede başlatın. Kaydırma ve sekme geçişlerini süreye dahil edin. Kabul aralığı 120–150 saniye.

| Süre | Ekran ve sunum metni |
| --- | --- |
| 0–20 sn | **Açılış.** Bir apartmanın bodrumunda üç ayrı pompa sistemi çalışıyor. Yangın seti hazır bekliyor, hidrofor dairelere su basıncı sağlıyor, atık su pompası kuyuyu boşaltıyor. Orkestra bu sistemlerin verisini birleştirip binada neler olduğunu tek ekranda gösteriyor. Açılışta kısa bir duraklamadan sonra kaydırarak bodruma inin. |
| 20–65 sn | **Senaryo.** Sağanak başladığında kuyu seviyesi yüzde 78’e çıkıyor. Atık su ajanı bunu aynı saatlerdeki olağan yüzde 35–50 aralığıyla karşılaştırıyor ve sapmayı işaretliyor. Hidrofor ajanı, 3,4 bar ölçülen basıncın olağan aralıkta olduğunu görüyor. Yangın ajanı panelin hazır olduğunu bildiriyor. Dijital ikiz bu sinyalleri aynı bina bağlamına yerleştiriyor. Şef ajan üç bulguyu birleştirip teknisyene kuyu ve şamandıra kontrolü öneriyor. Böylece ekip hangi ölçümün değiştiğini ve nereden başlayacağını görüyor. |
| 65–100 sn | **Arayüzler.** Yönetici açık olayı, sistemlerin durumunu ve bildirim tercihini web panelinden görüyor. **Sakin** sekmesini açın. Sakin, teknik ekibin kuyuyu incelediğini telefondan öğreniyor. **Binada su kesintisi var mı?** sorusunu açın. Örnek yanıt, hidroforun olağan çalıştığını söylüyor. Teknisyen ölçüm geçmişine ve öneriye, Wilo ise bina grubu görünümüne erişebilecek. |
| 100–135 sn | **Pilot.** Uygun bir Wilo kurulumunda mevcut kontrol altyapısından salt okunur veri alarak başlamak istiyoruz. İlk adım model uyumunu ve gerekli verilere erişimi doğrulamak. Aynı olay kayıtlarında sabit eşiği, bağımsız ajanları ve şef ajanlı yaklaşımı karşılaştıracağız. Erken uyarı süresini, yanlış alarmları ve bina başına plansız pompa olaylarını ölçeceğiz. Yeni pompalar ve bina grupları eklendikçe ortak görünüm tek binadan siteye ve şehir ölçeğine genişleyebilir. |

## 24 Kasım akşamı devri

- Çalışan ilk sürüm main dalında. Son düzenlemeler için buradan polish dalını açın.
- Tam ekran hikâye ve kaydırma zaman çizelgesi src/Film.tsx ile src/film.css içinde. Canvas çizimleri src/SceneArt.tsx içinde. Pompa ve rol verileriyle kanvas yanıtları src/content.ts içinde.
- Son görsel turda 390 px telefonda kahraman görselini, sağanak sahnesine geçişi ve sakin ekranını inceleyin. 1440 px genişlikte sahne vurgularını ve klavyeyle rol sekmelerini doğrulayın. Hareket azaltma ayarında içeriği yeniden kontrol edin.
- Prova sırasında sahne ve sekme geçişlerini kronometreyle ölçün. Son derleme çalışınca polish değişikliklerini main dalına birleştirin.

## Görsel anlatım

Dört özgün 2B sahne, masaüstünde ve telefonda aynı sabit ekranı kullanır. Kaydırma kamerayı bodruma indirir, kuyu seviyesini yükseltir ve şef ajana giden sinyalleri sıraya koyar. Sahne düğmeleriyle ileri veya geri gidilebilir. Hareket azaltma tercihi açıkken çizimler sabit ve dikey sırada sunulur.

Jüri akışının ardından Proje Fikri Kanvası sekiz sorunun yanıtını ve ekip bilgilerini gösterir. Saha verisi ve entegrasyon doğrulaması pilot adımları olarak işaretlenmiştir.
