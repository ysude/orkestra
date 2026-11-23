# Orkestra

Prometheus takımının Water AI Hackathon projesi. Orkestra, farklı pompa sistemlerinin ölçümlerini bina ölçeğinde birleştiren bir yönetim konsepti. Sunumdaki olaylar, ölçümler, asistan yanıtları ve bildirimler temsilidir.

## Yerel kurulum

Node.js 22 ile proje klasöründe çalıştırın.

    npm ci
    npm run dev
    npm run build

Geliştirme sunucusu varsayılan olarak http://localhost:5173 adresinde çalışır. Windows PowerShell yürütme ilkesi npm betiğini engellerse npm.cmd kullanın.

## Docker ile çalıştırma

Proje klasöründe imajı oluşturup konteyneri başlatın.

```sh
docker build -t orkestra .
docker run --rm -p 127.0.0.1:8080:80 orkestra
```

Sunumu http://localhost:8080 adresinden açın. İmaj, Node.js 22 ile derlenen statik dosyaları Nginx üzerinden sunar.

## 195 saniyelik jüri akışı

Sunumu oynat, açılıştan pilot ekranının sonuna kadar ilerler. Sunumu duraklatıp kaydırabilir veya üst menüden ilgili bölüme geçebilirsiniz. Baştan oynat, kapanıştan sonra sunumu yeniden başlatır.

| Süre | Sunum |
| --- | --- |
| 00–13 sn | **Orkestra ve Prometheus.** Aynı apartmanın üç pompası farklı görevler yapıyor. Yöneticiye, teknisyene ve sakine bu sistemlerin birlikte ne söylediğini anlatıyoruz. |
| 13–21 sn | **Mahalle.** Bir binada üç sistemin aynı gün verdiği uyarıları tanıtın. |
| 21–31 sn | **Problem ve bugün.** Üç sistemin ayrı alarmlarını ve ortak depo veya jeneratör olduğunda doğan koordinasyon ihtiyacını gösterin. |
| 31–38 sn | **Dört ajan.** Şef ajan koordinasyonu üstleniyor. Yangın, hidrofor ve atık su ajanları kendi ölçümlerini ve önerilerini paylaşıyor. |
| 38–68 sn | **16.20 · Sağanak.** Kuyu yüzde 36’dan 78’e yükseliyor. Şef drenaj kaydı açıyor ve kontrollü tahliyeyi onaya gönderiyor. Örnek onaydan sonra kuyu seviyesi yüzde 61’e iniyor. |
| 68–100 sn | **17.10 · Eve dönüş.** Su kullanımı artıyor ve üst kat basıncı 2,6 bara düşüyor. Şefin onaya gönderdiği geçici destek dijital ikizde uygulanıyor ve ölçüm 3,3 bara çıkıyor. |
| 100–138 sn | **19.10 · Akşam alarmı.** Duman görülüyor ve yerel panel alarm bildiriyor. Şef alarm kaydını önceliklendiriyor ve örnek bildirimin teknik ekibe teslim edildiğini gösteriyor. Yerel kontrol panelde kalıyor. |
| 138–149 sn | **Yapay zekânın rolü.** Anomali modeli, dijital ikiz, Şef ve asistanın ayrı görevlerini gösterin. |
| 149–164 sn | **Kullanıcı görünümleri.** Önce yönetici günün olay kaydını görüyor, ardından sakin su kesintisi sorusunun yanıtını açıyor. Teknisyen ve Wilo sekmeleri manuel olarak da incelenebilir. |
| 164–195 sn | **Pilot kapanışı.** Salt okunur saha verisini, 30 test senaryosunu ve ana göstergeyi anlatın. Ana gösterge bina başına aylık plansız pompa olayıdır. |

## Sekiz jüri sorusunun akıştaki karşılığı

| Soru | Sahne |
| --- | --- |
| Problem | Sabit problem sahnesinde üç sistemin riskleri, ortak kaynaklar ve Wilo drenaj rehberi |
| Hedef kullanıcı ve ihtiyaç | Uyarıyı önceliklendiren yönetici ve ilk saha kontrolünü seçen teknisyen |
| Mevcut yaklaşım ve eksikliği | Ayrı cihaz alarmlarını ve ekranlarını elle karşılaştırma |
| Çözüm | Olay anında webde öncelik ve ölçüme dayalı kontrol önerisi, sakine mobil bilgi |
| Yapay zekânın rolü | Sabit model sahnesinde anomali tespiti, dijital ikiz, şef koordinasyonu ve LLM açıklaması |
| Veri ve uygulanabilirlik | Temsili kayıtlar mevcut, zaman damgalı saha geçmişi ve yetkili Wilo erişimi doğrulanacak |
| Beklenen su etkisi | Bina başına aylık plansız pompa olayı |
| İlk test | Eğitim dışında tutulan 30 senaryoda üç yöntem, erken uyarı ve yangın rezervi kontrolü |

Mahalle, geniş bir Canvas kompozisyonu olarak çizilir. Ajanlar aynı bina kesitinde tanıtılır. Her pompa odası değerlendirmesinden sonra kamera uygulamaya döner. Tahliye 61. saniyede, hidrofor desteği 92. saniyede ve yangın alarmı iletimi 130. saniyede başlar. Hareket azaltma tercihinde uygulama sonuçları aynı ekipman üzerinde sabit olarak gösterilir.
