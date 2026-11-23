# Orkestra

Prometheus takımının Water AI Hackathon projesi. Orkestra, farklı pompa sistemlerinin ölçümlerini bina ölçeğinde birleştiren bir yönetim konsepti. Sunumdaki olaylar, ölçümler, asistan yanıtları ve bildirimler temsilidir.

## Yerel kurulum

Node.js 22 ile proje klasöründe çalıştırın.

    npm ci
    npm run dev
    npm run build

Geliştirme sunucusu varsayılan olarak http://localhost:5173 adresinde çalışır. Windows PowerShell yürütme ilkesi npm betiğini engellerse npm.cmd kullanın.

## 195 saniyelik jüri akışı

Sunumu oynat, açılıştan pilot ekranının sonuna kadar ilerler. Sunumu duraklatıp kaydırabilir veya üst menüden ilgili bölüme geçebilirsiniz. Baştan oynat, kapanıştan sonra sunumu yeniden başlatır.

| Süre | Sunum |
| --- | --- |
| 00–13 sn | **Orkestra ve Prometheus.** Aynı apartmanın üç pompası farklı görevler yapıyor. Yöneticiye, teknisyene ve sakine bu sistemlerin birlikte ne söylediğini anlatıyoruz. |
| 13–30 sn | **Mahalle.** Teknisyen bugün cihaz ekranlarına, eşik alarmlarına ve uygun kurulumlarda Wilo Smart Connect’e bakıyor. Birden fazla cihazdan gelen bulguları ekip bir araya getiriyor. |
| 30–64 sn | **16.20 · Sağanak.** Kuyu yüzde 36’dan 78’e yükseliyor. Atık su ajanı, seviyeyi binanın yüzde 35–50 aralığıyla karşılaştırıyor. Şef ajan, diğer sistemler olağan durumdayken drenaj incelemesi açıyor. |
| 64–100 sn | **17.10 · Eve dönüş.** Hava açıyor, sakinler dönüyor ve su kullanımı artıyor. Kuyu seviyesi gerilerken üst kat basıncı 2,6 bara düşüyor. Şef ajan, hidrofor kontrolünü ayrı bildiriyor ve drenaj kaydını koruyor. |
| 100–138 sn | **19.10 · Akşam alarmı.** Duman görülüyor ve yerel panel alarm bildiriyor. Diğer iki ölçüm olağan aralığa dönüyor. Şef ajan panel alarmını bakım bildirimlerinin önüne alıyor. Yerel kontrol panelde kalıyor. |
| 138–164 sn | **Kullanıcı görünümleri.** Önce yönetici günün olay kaydını görüyor, ardından sakin örnek bildirimi ve su kesintisi sorusunun yanıtını açıyor. Teknisyen ve Wilo sekmeleri manuel olarak da incelenebilir. |
| 164–195 sn | **Pilot.** Uygun mevcut Wilo bağlantısından salt okunur erişimle tek binada başlayın. Aynı kayıtları sabit eşik, bağımsız ajanlar ve şef ajanla oynatın. Yanlış alarmı artırmadan erken uyarı süresini iyileştirmeyi hedefleyin. |

## Sekiz jüri sorusunun akıştaki karşılığı

| Soru | Sahne |
| --- | --- |
| Problem | Mahallede açılan ilk anlatım ve sağanak örneği |
| Hedef kullanıcı ve ihtiyaç | Mahalle anlatımı ve kullanıcı görünümleri |
| Mevcut yaklaşım ve eksikliği | Kontrolör, eşik alarmı ve Wilo Smart Connect anlatımı |
| Çözüm | Üç olay ve üç pompa odası değerlendirmesi |
| Yapay zekânın rolü | Geçmişle karşılaştırma, şef ajanın gerekçeleri ve pilotun ürün mimarisi |
| Veri ve uygulanabilirlik | Temsili ölçümler, pilot veri ihtiyacı ve Wilo erişim doğrulaması |
| Beklenen su etkisi | Pilot ekranındaki erken uyarı, yanlış alarm ve plansız olay ölçütleri |
| İlk test | Aynı olay kayıtlarında üç yöntemin karşılaştırması ve başarı ölçütü |

Mahalle, tek Canvas kompozisyonu olarak çizilir. Olaylar boyunca hava, aydınlatma ve kamera değişir. Pompa odası değerlendirmeleri mahalle sahnesinin üzerinde açılır. Hareket azaltma tercihi açıkken mahalle çizimi ve anlatım sabit görünür.
