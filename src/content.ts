export type Pump = {
  id: string
  name: string
  type: 'fire' | 'pressure' | 'drainage'
  signal: string
  baseline: string
  observation: string
  reading: string
  status: string
}

export const pumps: Pump[] = [
  {
    id: 'Y-01', name: 'Yangın', type: 'fire', signal: 'Panel durumu',
    baseline: 'Hazır', observation: 'Panel hazır. Yangın rezervi korunuyor.',
    reading: 'Hazır', status: 'Salt okunur',
  },
  {
    id: 'H-01', name: 'Hidrofor', type: 'pressure', signal: 'Hat basıncı',
    baseline: '3,2–3,6 bar', observation: 'Basınç binanın olağan aralığında.',
    reading: '3,4 bar', status: 'Normal',
  },
  {
    id: 'A-01', name: 'Atık su', type: 'drainage', signal: 'Kuyu seviyesi',
    baseline: '%35–50', observation: 'Seviye benzer saatlerdeki olağan aralığın üzerine çıktı.',
    reading: '%78', status: 'Yükseliyor',
  },
]

export const roles = [
  { id: 'manager', name: 'Yönetici', heading: 'Binanın durumu tek bakışta.', description: 'Olayın önceliğini, hangi sistemlerin etkilendiğini ve hangi bildirimlerin açık olduğunu görün.' },
  { id: 'technician', name: 'Teknisyen', heading: 'Ölçümden kontrol listesine.', description: 'Alarmı başlatan değişimi geçmiş ölçümlerle karşılaştırın ve saha kontrolü için bir başlangıç noktası alın.' },
  { id: 'resident', name: 'Sakin', heading: 'Su durumunu cebinden öğren.', description: 'Binayı ilgilendiren bir bildirim alın ve tesisat ayrıntılarına girmeden su durumunu sorun.' },
  { id: 'wilo', name: 'Wilo', heading: 'Filoda nereye bakmalı?', description: 'Birden çok binadaki olayları ve veri bağlantısı durumunu tek filo görünümünde inceleyin.' },
] as const

export type Role = typeof roles[number]['id']

export const telemetry = [
  { time: '17.40', level: 36 },
  { time: '17.45', level: 42 },
  { time: '17.50', level: 50 },
  { time: '17.55', level: 63 },
  { time: '18.00', level: 78 },
]
export const canvasAnswers = [
  {
    question: 'Problem',
    answer: 'Konut sitelerinde yangın, kullanım suyu ve drenaj pompaları farklı kontrolörlerle çalışır. Sağanak sırasında kuyu seviyesinin yükseldiğini görmek, tek başına binanın su hizmetinin veya yangın hazırlığının etkilenip etkilenmediğini göstermez.',
    note: 'Temsili olayda kuyu %36’dan %78’e yükselirken hidrofor 3,4 bar ve yangın paneli hazır durumda. Bu üç sinyalin sahada birlikte kaydedilip kaydedilebildiği pilotta doğrulanacak.',
  },
  {
    question: 'Hedef kullanıcı ve ihtiyaç',
    answer: 'İlk kullanıcı, bir konut sitesinin yöneticisi ve teknik ekibidir. Yönetici olayın kimleri etkilediğini, teknisyen hangi ölçümü kontrol edeceğini bilmek ister. Sakin hizmet durumunu öğrenir. Wilo ekibi bina gruplarını izler.',
  },
  {
    question: 'Mevcut yaklaşım ve eksikliği',
    answer: 'Teknik ekip kontrolör ekranları, yerel eşik alarmları ve mevcut Wilo izleme araçlarıyla cihaz durumuna bakar. Bina ölçeğindeki ortak olayı ve sakinlere iletilecek açıklamayı ekip bir araya getirir.',
    note: 'Wilo Smart Connect mevcut cihaz verisini uzaktan izlemeyi sağlar. Orkestra, erişilebilir Wilo verisinden ortak olay özeti ve rol bazlı bildirim üretmeyi hedefler.',
  },
  {
    question: 'Çözüm önerisi',
    answer: 'Sağanakta Orkestra, üç pompa ajanının bulgularını tek olayda birleştirir. Yönetici özeti webde görür, teknisyen ölçüm geçmişinden kontrole başlar, sakin bildirimle birlikte su durumunu sorar. Tercihler role ve binaya göre ayarlanır.',
  },
  {
    question: 'Yapay zekânın rolü',
    answer: 'Her pompa ajanı kendi geçmişinden olağan davranışı öğrenerek sabit eşiklerin kaçırabileceği sapmaları arar. Şef ajan dijital ikiz üzerinde bulguları ilişkilendirir. LLM, MCP üzerinden yetkili ölçümleri okuyarak açıklama sunar. RL, stratejileri yalnızca dijital ikizde karşılaştırmak için planlanır.',
  },
  {
    question: 'Veri ve uygulanabilirlik',
    answer: 'İlk deneyde örnek kuyu seviyesi, hidrofor basıncı ve yangın paneli durumu kullanılır. İlk pilot için mevcut Wilo bağlantısından yetkili, salt okunur erişim, zaman damgalı ölçüm ve alarm geçmişi ile olayları yeniden oynatan bir simülasyon ortamı gerekir.',
    note: 'Örnek veri hazır. Gerçek bina verisi, model uyumu ve erişim izni Wilo ile doğrulanacak.',
  },
  {
    question: 'Beklenen su etkisi',
    answer: 'Drenaj sorunu erken fark edildiğinde taşkın ve su hizmeti kesintisine yol açan plansız olayların azalması beklenir. Ana gösterge bina başına aylık plansız pompa olayıdır. Taşkın ve su kesintisi bu sayımda ayrı olay türleri olarak kaydedilir. Erken uyarı süresi ve yanlış alarm sayısı da izlenir.',
  },
  {
    question: 'İlk test',
    answer: 'Varsayım, aynı olay kayıtlarında şef ajanın üç ölçümü birlikte değerlendirerek daha erken ve daha isabetli uyarı verebilmesidir. Hackathon testinde yağmur, normal çalışma ve hatalı sensör senaryoları aynı girdilerle oynatılır. Sabit eşik, bağımsız ajanlar ve şef ajanlı yaklaşım için ilk uyarı zamanı ve yanlış alarm sayısı kaydedilir.',
    note: 'Geçme koşulu, yanlış alarmları artırmadan uyarı süresini iyileştirmektir. Yangın paneli salt okunur kalır.',
  },
]

export const team = [
  { name: 'Gökdeniz Kuruca', role: 'Makine öğrenmesi / Backend' },
  { name: 'Burak Emre Polat', role: 'Makine öğrenmesi / Backend' },
  { name: 'Sude Yıldırım', role: 'Frontend' },
  { name: 'Bilge Bostanbaşı', role: 'Mobil' },
]
