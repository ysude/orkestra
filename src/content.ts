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
  { id: 'manager', name: 'Yönetici', heading: 'Binanın durumu tek bakışta.', description: 'Uyarı geldiğinde web panelinden önceliği belirleyin ve saha kontrolünü teknik ekiple planlayın.' },
  { id: 'technician', name: 'Teknisyen', heading: 'Ölçümden kontrol listesine.', description: 'Bildirimdeki ölçüm geçmişini açın ve ilk saha kontrolünü kuyu ile şamandıraya yöneltin.' },
  { id: 'resident', name: 'Sakin', heading: 'Su durumunu cebinden öğren.', description: 'Binayı ilgilendiren bir bildirim alın ve tesisat ayrıntılarına girmeden su durumunu sorun.' },
  { id: 'wilo', name: 'Wilo', heading: 'Filoda nereye bakmalı?', description: 'Birden çok binadaki olayları ve veri bağlantısı durumunu tek filo görünümünde inceleyin.' },
] as const

export type Role = typeof roles[number]['id']

export const telemetry = [
  { time: '16.00', level: 36 },
  { time: '16.20', level: 78 },
  { time: '16.40', level: 61 },
  { time: '18.00', level: 52 },
  { time: '19.10', level: 44 },
]
export const team = [
  { name: 'Gökdeniz Kuruca', role: 'Makine öğrenmesi / Backend' },
  { name: 'Burak Emre Polat', role: 'Makine öğrenmesi / Backend' },
  { name: 'Sude Yıldırım', role: 'Frontend / Mobil' },
  { name: 'Bilge Bostanbaşı', role: 'Mobil / Frontend' },
]

export const interviews = [
  {
    id: 'yonetici', name: 'Ayşe', role: 'Site yöneticisi', context: 'İstanbul · 120 daireli site',
    quote: 'Hidroforun bozulduğunu genelde sakinlerin WhatsApp grubundan öğreniyorum. Üç sistemin üç ayrı servisi var. Hangisine önce bakılacağına ben karar vermek zorundayım.',
    finding: 'Arıza sakin şikâyetiyle fark ediliyor, önceliği belirleyen yok.',
  },
  {
    id: 'teknisyen', name: 'Murat', role: 'Pompa bakım teknisyeni', context: 'Yetkili servis · Haftada 15+ bina',
    quote: 'Sahaya ne bulacağımı bilmeden gidiyorum. Şamandıra arızası çoğu zaman bodrum su dolunca anlaşılıyor. Jokey pompasının sık çalıştığını da kimse fark etmiyor.',
    finding: 'Teknisyenin elinde ölçüm geçmişi yok, erken işaretler kaçıyor.',
  },
  {
    id: 'idare', name: 'Kemal', role: 'Su idaresi saha sorumlusu', context: 'Sağanakta bodrum baskını çağrıları',
    quote: 'Sağanakta gelen bodrum baskını çağrılarının önemli kısmında sorun binanın kendi pompasında. Bakımı yapılmamış ya da şamandırası takılı kalmış.',
    finding: 'Bina içindeki pompa arızası kamu ekiplerine yük oluyor.',
  },
] as const
