# Orkestra

Prometheus takımının Water AI Hackathon projesi. Orkestra, farklı pompa sistemlerinin ölçümlerini bina ölçeğinde birleştiren bir yönetim konsepti. Sunumdaki olaylar, ölçümler, asistan yanıtları ve bildirimler temsilidir.

## Künye

| Alan | Bilgi |
| --- | --- |
| Proje adı | Orkestra |
| Takım adı | Prometheus |
| Çalışma alanı | Bina pompa sistemleri |

## Takım

| Üye | Rol |
| --- | --- |
| Gökdeniz Kuruca | Makine öğrenmesi / Backend |
| Burak Emre Polat | Makine öğrenmesi / Backend |
| Sude Yıldırım | Frontend / Mobil |
| Bilge Bostanbaşı | Mobil / Frontend |

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

## GitHub Pages

`main` dalına her push'ta `.github/workflows/pages.yml` projeyi derleyip GitHub Pages'e yayınlar; Actions sekmesinden elle de çalıştırılabilir. İlk kurulumda depo ayarlarında **Settings → Pages → Source: GitHub Actions** seçilmelidir. Sunum https://ysude.github.io/wilo/ adresinde açılır.

## 3 dakikalık jüri akışı

Sunumu oynat, açılışı geçip doğrudan mahalleye iner ve pilot ekranının sonuna kadar ilerler. Sunumu duraklatıp kaydırabilir veya üst menüden ilgili bölüme geçebilirsiniz. Baştan oynat, kapanıştan sonra sunumu mahalleden yeniden başlatır.

Oynatma başladığında bölümlerin sayfadaki yüksekliği ölçülür. Ek 22 saniye mahalleden itibaren bölümlere yükseklikleriyle orantılı olarak dağıtılır. Bu nedenle bölüm geçişleri ekran boyutuna göre değişebilir. Tam akış 180 saniyedir.

| En az süre | Sunum |
| --- | --- |
| 1 sn | **Orkestra ve Prometheus.** Açılış bir an görünür ve sunum mahalleye iner. Tanıtımı mahalle sahnesinde yapın: aynı apartmanın üç pompası farklı görevler yapıyor, yöneticiye, teknisyene ve sakine bu sistemlerin birlikte ne söylediğini anlatıyoruz. |
| 7 sn | **Mahalle.** Bir binada üç sistemin aynı gün verdiği uyarıları tanıtın. |
| 17 sn | **Problem ve bugün.** Üç sistemin ayrı alarmlarını, sahadan üç görüşmeyi (site yöneticisi, bakım teknisyeni, su idaresi saha sorumlusu) ve ortak depo veya jeneratör olduğunda doğan koordinasyon ihtiyacını gösterin. |
| 6 sn | **Dört ajan.** Şef ajan koordinasyonu üstleniyor. Yangın, hidrofor ve atık su ajanları kendi ölçümlerini ve önerilerini paylaşıyor. |
| 27 sn | **16.20 · Sağanak.** Kuyu yüzde 36’dan 78’e yükseliyor. Şef drenaj kaydı açıyor ve kontrollü tahliyeyi onaya gönderiyor. Örnek onaydan sonra kuyu seviyesi yüzde 61’e iniyor. |
| 27 sn | **17.10 · Eve dönüş.** Su kullanımı artıyor ve üst kat basıncı 2,6 bara düşüyor. Şefin onaya gönderdiği geçici destek dijital ikizde uygulanıyor ve ölçüm 3,3 bara çıkıyor. |
| 29 sn | **19.10 · Akşam alarmı.** Duman görülüyor ve yerel panel alarm bildiriyor. Şef alarm kaydını önceliklendiriyor ve örnek bildirimin teknik ekibe teslim edildiğini gösteriyor. Yerel kontrol panelde kalıyor. |
| 9 sn | **Yapay zekânın rolü.** Anomali modeli, dijital ikiz, Şef ve asistanın ayrı görevlerini gösterin. |
| 16 sn | **Kullanıcı görünümleri.** Yönetici günün olay kaydını görüyor, teknisyen ölçüm geçmişini ve bakım kaydını açıyor, sakin su kesintisi sorusunun yanıtını alıyor, Wilo filo görünümünü izliyor. |
| 19 sn | **Pilot kapanışı.** Salt okunur saha verisini, 30 test senaryosunu ve ana göstergeyi anlatın. Ana gösterge bina başına aylık plansız pompa olayıdır. |

## Sekiz jüri sorusunun akıştaki karşılığı

| Soru | Sahne |
| --- | --- |
| Problem | Problem tanımı (ayrı alarmlar, ortak yorum katmanı yok, sakine yansıyan sonuç), sahadan üç görüşme, üç sistemin riskleri, ortak kaynaklar ve Wilo drenaj rehberi |
| Hedef kullanıcı ve ihtiyaç | Uyarıyı önceliklendiren yönetici ve ilk saha kontrolünü seçen teknisyen |
| Mevcut yaklaşım ve eksikliği | Ayrı cihaz alarmlarını ve ekranlarını elle karşılaştırma. Eksik kalan: eşik alarmı geç gelir ve sistemler arası etkiyi göstermez |
| Çözüm | Olay anında webde öncelik ve ölçüme dayalı kontrol önerisi, sakine mobil bilgi. Bu sayede tek öncelik listesi ve doğru kontrol listesiyle saha ziyareti |
| Yapay zekânın rolü | Sabit eşiğe göre farkı, anomali tespiti, dijital ikiz, şef koordinasyonu ve LLM açıklaması. Son karar yetkili kişide |
| Veri ve uygulanabilirlik | Temsili kayıtlar mevcut, zaman damgalı saha geçmişi ve yetkili Wilo erişimi doğrulanacak |
| Beklenen su etkisi | Bina başına aylık plansız pompa olayı. Daha kısa kesinti, daha az taşma ve baskın, korunan yangın rezervi |
| İlk test | Eğitim dışında tutulan 30 senaryoda üç yöntem, erken uyarı ve yangın rezervi kontrolü |

Mahalle, geniş bir Canvas kompozisyonu olarak çizilir. Ajanlar aynı bina kesitinde tanıtılır. Her pompa odası değerlendirmesinden sonra kamera uygulamaya döner. Hareket azaltma tercihinde uygulama sonuçları aynı ekipman üzerinde sabit olarak gösterilir.
