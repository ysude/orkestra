import type { Pump } from './content'

type Reading = { pump: Pump['type']; value: string; baseline: string; finding: string }

type CameraBounds = readonly [left: number, top: number, right: number, bottom: number]
export type CameraPoint = readonly [x: number, y: number, zoom: number, subject: CameraBounds]

type Scenario = {
  id: string
  decisionId: string
  key: Pump['type']
  label: string
  time: string
  title: string
  story: string
  measure: string
  initial: string
  final: string
  baseline: string
  placement: 'left' | 'right' | 'bottom'
  camera: readonly [start: CameraPoint, end: CameraPoint]
  readings: Reading[]
  // Numeric state of the pump room for the 3D view, matching `readings`.
  room: { level: number; bar: number; alarm: boolean }
  priority: string
  action: string
  reason: string
  execution: { id: string; title: string; camera: CameraPoint; start: string; running: string; result: string; metric: string; before: string; after: string }
}

export const scenarios: Scenario[] = [
  {
    id: 'saganak', decisionId: 'ortak-karar', key: 'drainage', label: 'Sağanak', time: '16.20',
    title: 'Yağmur bodruma kadar ulaşıyor.',
    story: 'Sağanak bodrumdaki drenaj kuyusunu dolduruyor. Atık su ajanı, taşma yaşanmadan seviyenin benzer yağışlarda görülen aralığı aştığını fark ediyor.',
    measure: 'Kuyu seviyesi', initial: '%36', final: '%78', baseline: 'Olağan aralık %35–50',
    placement: 'left', camera: [
      [1045, 405, 1.02, [964, 240, 1220, 549]],
      [1123, 586, 1.13, [1040, 501, 1334, 735]],
    ],
    readings: [
      { pump: 'fire', value: 'Hazır', baseline: 'Beklenen: hazır', finding: 'Yangın paneli hazır.' },
      { pump: 'pressure', value: '3,4 bar', baseline: 'Olağan: 3,2–3,6 bar', finding: 'Kullanım suyu basıncı olağan.' },
      { pump: 'drainage', value: '%78', baseline: 'Olağan: %35–50', finding: 'Kuyu seviyesi geçmişteki üst sınırı aştı.' },
    ],
    room: { level: 78, bar: 3.4, alarm: false },
    priority: 'Drenaj incelemesi',
    action: 'Drenaj kaydı aç ve kontrollü tahliye iste.',
    reason: 'Kuyu seviyesi %78’e çıktı. Hidrofor ve yangın paneli olağan durumda.',
    execution: {
      id: 'tahliye', title: 'Atık su pompası kuyuyu boşaltıyor.',
      camera: [1174, 604, 1.06, [963, 493, 1348, 756]],
      start: 'Bakım kaydı açıldı, kontrollü tahliye onaya gönderildi.',
      running: 'Teknisyen onayladı. Dijital ikizde tahliye uygulanıyor.',
      result: 'Kuyu seviyesi düştü. Şamandıra incelemesi bakım kaydında açık.',
      metric: 'Kuyu seviyesi', before: '%78', after: '%61',
    },
  },
  {
    id: 'hidrofor', decisionId: 'hidrofor-karar', key: 'pressure', label: 'Eve dönüş', time: '17.10',
    title: 'Hava açıyor. Bina yeniden doluyor.',
    story: 'Sakinler eve döndükçe su kullanımı artıyor. Kuyu seviyesi gerilerken hidrofor ajanı, üst kat basıncının bu saatlerdeki olağan aralığın altına düştüğünü görüyor.',
    measure: 'Üst kat basıncı', initial: '3,4 bar', final: '2,6 bar', baseline: 'Olağan aralık 3,2–3,6 bar',
    placement: 'right', camera: [
      [835, 435, 1.02, [697, 330, 980, 475]],
      [722, 332, 1.10, [554, 223, 790, 354]],
    ],
    readings: [
      { pump: 'fire', value: 'Hazır', baseline: 'Beklenen: hazır', finding: 'Yangın panelinde uyarı yok.' },
      { pump: 'pressure', value: '2,6 bar', baseline: 'Olağan: 3,2–3,6 bar', finding: 'Eve dönüş saatinde basınç olağan aralığın altına indi.' },
      { pump: 'drainage', value: '%61', baseline: 'Olağan: %35–50', finding: 'Kuyu geriliyor. Önceki drenaj incelemesi açık.' },
    ],
    room: { level: 61, bar: 2.6, alarm: false },
    priority: 'Hizmet kontrolü',
    action: 'Hidrofor için geçici basınç desteğini onaya gönder.',
    reason: 'Drenaj toparlanıyor. Üst kat basıncı düşerken diğer pompalarda müdahale gerektiren bir sapma yok.',
    execution: {
      id: 'basinc-destegi', title: 'Hidrofor üst katlara su basıyor.',
      camera: [789, 467, 1.06, [590, 224, 949, 719]],
      start: 'Üst kat basınç desteği için ayrı onay kaydı açıldı.',
      running: 'Teknisyen onayladı. Geçici destek dijital ikizde uygulanıyor.',
      result: 'Üst kat basıncı olağan aralığa döndü. Drenaj kaydı korundu.',
      metric: 'Üst kat basıncı', before: '2,6 bar', after: '3,3 bar',
    },
  },
  {
    id: 'yangin', decisionId: 'yangin-karar', key: 'fire', label: 'Akşam uyarısı', time: '19.10',
    title: 'Akşam, yangın panelinden alarm geliyor.',
    story: 'Gün batarken binanın bir katında duman beliriyor. Yerel yangın paneli alarm bildiriyor. Ajan bu bilgiyi salt okunur izliyor ve şef ajana aktarıyor.',
    measure: 'Yerel yangın paneli', initial: 'Hazır', final: 'Yangın alarmı', baseline: 'Yerel kontrol panelde',
    placement: 'bottom', camera: [
      [925, 305, 1.04, [946, 154, 1127, 317]],
      [706, 560, 1.12, [565, 572, 755, 699]],
    ],
    readings: [
      { pump: 'fire', value: 'Yangın alarmı', baseline: 'Önceki durum: hazır', finding: 'Yerel panel alarm durumuna geçti.' },
      { pump: 'pressure', value: '3,3 bar', baseline: 'Olağan: 3,2–3,6 bar', finding: 'Kullanım suyu basıncı olağan aralığa döndü.' },
      { pump: 'drainage', value: '%44', baseline: 'Olağan: %35–50', finding: 'Kuyu seviyesi olağan aralığa döndü.' },
    ],
    room: { level: 44, bar: 3.3, alarm: true },
    priority: 'Öncelikli bildirim',
    action: 'Yerel yangın alarmını bakım bildirimlerinin önüne al.',
    reason: 'Şef ajan alarmı teknik ekibe yönlendirir. Yangın sisteminin denetimi yerel panelde kalır.',
    execution: {
      id: 'alarm-iletimi', title: 'Yangın paneli seti çalıştırıyor.',
      camera: [671, 597, 1.06, [442, 506, 896, 730]],
      start: 'Öncelikli alarm kaydı açıldı.',
      running: 'Örnek bildirim teknik ekibin ekranına iletiliyor.',
      result: 'Teknik ekip bildirimi aldı. Pompaların yerel kumandasına komut gönderilmedi.',
      metric: 'Alarm bildirimi', before: 'Sırada', after: 'Teslim edildi',
    },
  },
]

export const presentationSeconds = 150
export const roleViewsStart = 115
export const pilotStart = 128

export const cues: { id: string; start: number; label: string; motion?: boolean }[] = [
  { id: 'baslangic', start: 0, label: 'Başlangıç' },
  { id: 'ihtiyac', start: 1, label: 'Günün başlangıcı' },
  { id: 'bina-sorunu', start: 8, label: 'Problem', motion: true },
  { id: 'ajanlar', start: 17, label: 'Dört ajan' },
  { id: scenarios[0].id, start: 23, label: 'Sağanak', motion: true },
  { id: scenarios[0].decisionId, start: 37, label: 'Şefin kararı' },
  { id: scenarios[0].execution.id, start: 43, label: 'Tahliye' },
  { id: scenarios[1].id, start: 50, label: 'Eve dönüş', motion: true },
  { id: scenarios[1].decisionId, start: 64, label: 'Şefin kararı' },
  { id: scenarios[1].execution.id, start: 70, label: 'Basınç desteği' },
  { id: scenarios[2].id, start: 77, label: 'Akşam alarmı', motion: true },
  { id: scenarios[2].decisionId, start: 93, label: 'Şefin kararı' },
  { id: scenarios[2].execution.id, start: 99, label: 'Alarm iletimi' },
  { id: 'yapay-zeka', start: 106, label: 'Yapay zekânın rolü', motion: true },
  { id: 'gorunumler', start: roleViewsStart, label: 'Arayüzler', motion: true },
  { id: 'pilot', start: pilotStart, label: 'Pilot', motion: true },
]
