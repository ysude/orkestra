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
  priority: string
  action: string
  reason: string
}

export const scenarios: Scenario[] = [
  {
    id: 'saganak', decisionId: 'ortak-karar', key: 'drainage', label: 'Sağanak', time: '16.20',
    title: 'Yağmur bodruma kadar ulaşıyor.',
    story: 'Sokak boşalırken su drenaj kuyusunda birikiyor. Atık su ajanı, seviyenin bu binada benzer saatlerde görülen aralığı geçtiğini fark ediyor.',
    measure: 'Kuyu seviyesi', initial: '%36', final: '%78', baseline: 'Olağan aralık %35–50',
    placement: 'left', camera: [
      [1045, 405, 1.27, [964, 240, 1220, 549]],
      [1158, 620, 1.62, [1040, 501, 1334, 735]],
    ],
    readings: [
      { pump: 'fire', value: 'Hazır', baseline: 'Beklenen: hazır', finding: 'Yangın paneli hazır.' },
      { pump: 'pressure', value: '3,4 bar', baseline: 'Olağan: 3,2–3,6 bar', finding: 'Kullanım suyu basıncı olağan.' },
      { pump: 'drainage', value: '%78', baseline: 'Olağan: %35–50', finding: 'Kuyu seviyesi geçmişteki üst sınırı aştı.' },
    ],
    priority: 'Drenaj incelemesi',
    action: 'Kuyu ve şamandıra için bakım bildirimi oluştur.',
    reason: 'Sapma drenajda. Diğer iki sistemin ölçümü olağan. Şef ajan, teknisyene olayın ölçüm geçmişini iletiyor.',
  },
  {
    id: 'hidrofor', decisionId: 'hidrofor-karar', key: 'pressure', label: 'Eve dönüş', time: '17.10',
    title: 'Hava açıyor. Bina yeniden doluyor.',
    story: 'Sakinler eve döndükçe su kullanımı artıyor. Kuyu seviyesi gerilerken hidrofor ajanı, üst kat basıncının bu saatlerdeki olağan aralığın altına düştüğünü görüyor.',
    measure: 'Üst kat basıncı', initial: '3,4 bar', final: '2,6 bar', baseline: 'Olağan aralık 3,2–3,6 bar',
    placement: 'right', camera: [
      [835, 435, 1.29, [697, 330, 980, 475]],
      [685, 290, 1.52, [554, 223, 790, 354]],
    ],
    readings: [
      { pump: 'fire', value: 'Hazır', baseline: 'Beklenen: hazır', finding: 'Yangın panelinde uyarı yok.' },
      { pump: 'pressure', value: '2,6 bar', baseline: 'Olağan: 3,2–3,6 bar', finding: 'Eve dönüş saatinde basınç olağan aralığın altına indi.' },
      { pump: 'drainage', value: '%61', baseline: 'Olağan: %35–50', finding: 'Kuyu geriliyor. Önceki drenaj incelemesi açık.' },
    ],
    priority: 'Hizmet kontrolü',
    action: 'Hidrofor beslemesini ve üst kat basıncını kontrol et.',
    reason: 'Şef ajan, azalan kuyu seviyesini ve basınç düşüşünü ayrı bulgular olarak izliyor. Hidrofor kontrolü için ayrı bildirim açarken drenaj kaydını koruyor.',
  },
  {
    id: 'yangin', decisionId: 'yangin-karar', key: 'fire', label: 'Akşam uyarısı', time: '19.10',
    title: 'Akşam, yangın panelinden alarm geliyor.',
    story: 'Gün batarken binanın bir katında duman beliriyor. Yerel yangın paneli alarm bildiriyor. Ajan bu bilgiyi salt okunur izliyor ve şef ajana aktarıyor.',
    measure: 'Yerel yangın paneli', initial: 'Hazır', final: 'Yangın alarmı', baseline: 'Yerel kontrol panelde',
    placement: 'bottom', camera: [
      [981, 280, 1.45, [946, 154, 1127, 317]],
      [613, 624, 1.61, [565, 572, 755, 699]],
    ],
    readings: [
      { pump: 'fire', value: 'Yangın alarmı', baseline: 'Önceki durum: hazır', finding: 'Yerel panel alarm durumuna geçti.' },
      { pump: 'pressure', value: '3,3 bar', baseline: 'Olağan: 3,2–3,6 bar', finding: 'Kullanım suyu basıncı olağan aralığa döndü.' },
      { pump: 'drainage', value: '%44', baseline: 'Olağan: %35–50', finding: 'Kuyu seviyesi olağan aralığa döndü.' },
    ],
    priority: 'Öncelikli bildirim',
    action: 'Yerel yangın panelinin alarmını teknik ekibe öncelikli ilet.',
    reason: 'Şef ajan, yangın alarmını günün bakım bildirimlerinin önüne alıyor. Yangın sisteminin denetimi ve müdahale akışı yerel panelde kalıyor.',
  },
]

export const presentationSeconds = 195

export const cues = [
  { id: 'baslangic', start: 0 },
  { id: 'ihtiyac', start: 13 },
  { id: scenarios[0].id, start: 30, motion: true },
  { id: scenarios[0].decisionId, start: 51 },
  { id: scenarios[1].id, start: 64, motion: true },
  { id: scenarios[1].decisionId, start: 88 },
  { id: scenarios[2].id, start: 100, motion: true },
  { id: scenarios[2].decisionId, start: 123 },
  { id: 'gorunumler', start: 138 },
  { id: 'pilot', start: 164 },
]
