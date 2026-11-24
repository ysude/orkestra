import { StrictMode, useEffect, useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Activity, ArrowRight, AudioLines, Bell, Building2, Check,
  ChevronRight, Database, Droplet, FlaskConical, Layers3, Menu, Pause, Play,
  ShieldCheck, Target, Timer, Users, Wrench, X,
} from 'lucide-react'
import { pumps, roles, team, telemetry } from './content'
import type { Role } from './content'
import { Journey } from './Film'
import { JuryCard } from './JuryCard'
import { DecisionLogic } from './JuryEvidence'
import { usePresentation } from './presentation'
import { presentationSeconds, scenarios } from './story'
import './styles.css'
import './comic.css'
import './film.css'

const roleIcons = { manager: Building2, technician: Wrench, resident: Bell, wilo: Layers3 }

function Brand() {
  return <a className="brand" href="#baslangic" aria-label="Orkestra ana sayfa">
    <span className="brand-icon"><AudioLines size={22} strokeWidth={2.5} /></span>
    Orkestra<span className="brand-period">.</span>
  </a>
}

const clock = (seconds: number) => Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0')

function Header({ presentation }: { presentation: ReturnType<typeof usePresentation> }) {
  const [open, setOpen] = useState(false)
  const started = presentation.second !== null && presentation.second < presentationSeconds

  function closeMenu() {
    setOpen(false)
    presentation.pause()
  }

  return <header className="site-header">
    <div className="shell header-inner">
      <Brand />
      <button className="menu-button" type="button" aria-expanded={open} aria-controls="navigation"
        aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'} onClick={() => setOpen(!open)}>
        {open ? <X size={23} /> : <Menu size={23} />}
      </button>
      <nav id="navigation" className={open ? 'nav open' : 'nav'} aria-label="Ana menü">
        <a href="#baslangic" onClick={closeMenu}>Hikâye</a>
        <a href="#ajanlar" onClick={closeMenu}>Ajanlar</a>
        {scenarios.map((event) => <a key={event.id} href={'#' + event.id} onClick={closeMenu}>{event.id === 'saganak' ? 'Atık su' : event.id === 'hidrofor' ? 'Hidrofor' : 'Yangın'}</a>)}
        <a href="#gorunumler" onClick={closeMenu}>Arayüzler</a>
        <a href="#pilot" onClick={closeMenu}>Pilot ve ilk test</a>
      </nav>
      <button type="button" aria-pressed={presentation.playing} className="presentation-toggle" onClick={presentation.toggle}>
        {presentation.playing ? <Pause size={16} /> : <Play size={16} />}
        {presentation.playing ? 'Duraklat' : presentation.second === presentationSeconds ? 'Baştan oynat' : started ? 'Devam et' : 'Sunumu oynat'}
        {started && <span className="presentation-time">{clock(presentation.second ?? 0)} / {clock(presentationSeconds)}</span>}
      </button>
    </div>
    <div className="presentation-progress" hidden={presentation.second === null} aria-hidden="true"
      style={{ '--progress': (presentation.second ?? 0) / presentationSeconds } as CSSProperties} />
  </header>
}

function Manager() {
  const [daily, setDaily] = useState(true)

  return <>
    <div className="panel-alert"><Droplet size={21} /><div><strong>Mahalle günü · Yangın alarmı öncelikli</strong><span>A Blok · 19.10 · Günün olay kaydı</span></div></div>
    <div className="panel-stats">
      {pumps.map((pump) => <div key={pump.id}><span>{pump.name}</span><strong>{scenarios[2].readings.find(({ pump: type }) => type === pump.type)?.value}</strong><small>{pump.type === "fire" ? "Öncelikli uyarı" : "Olağan aralıkta"}</small></div>)}
    </div>
    <div className="panel-block preference">
      <div><strong>Günlük özet bildirimi</strong><span>Bildirim tercihi örneği</span></div>
      <button type="button" role="switch" aria-label="Günlük özet bildirimi" aria-checked={daily}
        className="switch" onClick={() => setDaily(!daily)}><span /></button>
    </div>
  </>
}

function Technician() {
  return <>
    <div className="panel-block"><strong>Kuyu seviyesi · Bugün 16.00–19.10</strong>
      <ol className="telemetry">
        {telemetry.map(({ time, level }) => <li key={time}>
          <span>%{level}</span><div className="bar-track"><span style={{ height: level + '%' }} /></div><span>{time}</span>
        </li>)}
      </ol>
    </div>
    <div className="panel-alert"><Bell size={21} /><div><strong>19.10 · Yangın alarmı bildirimi teslim edildi</strong><span>Kontrol yerel panelde. Kuyu %44 ile olağan aralığa döndü.</span></div></div>
    <div className="panel-alert"><Wrench size={21} /><div><strong>Açık bakım kaydı · Kuyu ve şamandıra kontrolü</strong><span>16.20’de seviye %78’e çıktı, olağan aralık %35–50.</span></div></div>
  </>
}

function Resident({ showAnswer }: { showAnswer: boolean | null }) {
  const [answer, setAnswer] = useState(false)
  useEffect(() => { if (showAnswer !== null) setAnswer(showAnswer) }, [showAnswer])
  return <div className="phone">
    <div className="phone-top"><span>19.10</span><span>Orkestra</span></div>
    <div className="phone-notification"><Bell size={16} /><div><strong>Bina bildirimi</strong><span>Eve dönüşte görülen basınç düşüşünden sonra su basıncı olağan aralığa döndü.</span></div></div>
    <button className="question" type="button" aria-expanded={answer} aria-controls="assistant-answer"
      onClick={() => setAnswer(!answer)}>Binada su kesintisi var mı? <ChevronRight size={15} /></button>
    <p id="assistant-answer" className="answer" hidden={!answer}>Son ölçümde su kesintisi görünmüyor. Son hidrofor ölçümü olağan aralıkta, 3,3 bar. Daha önceki drenaj incelemesi olay geçmişinde duruyor.</p>
  </div>
}

function Fleet() {
  return <>
    <div className="panel-stats">
      <div><span>İzlenen bina</span><strong>3</strong></div>
      <div><span>Telemetri gelen</span><strong>2</strong></div>
      <div><span>Açık olay</span><strong>1</strong></div>
    </div>
    <ul className="fleet">
      <li><Building2 size={17} /><strong>A Blok</strong><span>Yangın alarmı</span></li>
      <li><Building2 size={17} /><strong>B Blok</strong><span>Normal</span></li>
      <li><Building2 size={17} /><strong>C Blok</strong><span>Telemetri bekleniyor</span></li>
    </ul>
  </>
}

// Fractions of the role section's allotted time.
const roleSchedule: { at: number; role: Role }[] = [
  { at: 0, role: 'manager' },
  { at: 4 / 16, role: 'technician' },
  { at: 7 / 16, role: 'resident' },
  { at: 12 / 16, role: 'wilo' },
]
const residentAnswer = 9 / 16

function RoleViews({ presentation }: { presentation: ReturnType<typeof usePresentation> }) {
  const [selected, setSelected] = useState<Role>('manager')
  const { playing, playback } = presentation
  const progress = playing && playback?.section === 'gorunumler' ? playback.sectionProgress : null
  const showAnswer = progress === null ? null : progress >= residentAnswer

  useEffect(() => {
    if (progress === null) return
    setSelected(roleSchedule.findLast(({ at }) => at <= progress)?.role ?? 'manager')
  }, [progress])

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = roles.length - 1
    const targets: Record<string, number> = {
      ArrowLeft: (index + last) % roles.length,
      ArrowRight: (index + 1) % roles.length,
      Home: 0,
      End: last,
    }
    const next = targets[event.key]
    if (next === undefined) return

    event.preventDefault()
    const role = roles[next]
    setSelected(role.id)
    document.getElementById('tab-' + role.id)?.focus()
  }

  return <section className="section fixed-screen closing-beat role-section" id="gorunumler" tabIndex={-1} aria-labelledby="role-title">
    <div className="shell story-panel">
      <p className="eyebrow"><span className="signal" /> Web ve mobil</p>
      <h2 id="role-title">Aynı gün, dört kullanıcı.</h2>
      <div className="jury-grid">
        <JuryCard title="Hedef kullanıcı ve ihtiyaç">
          <p><strong>Site yöneticisi</strong> şikâyet geldiğinde hangi sistemin etkilendiğini anlamak ister. <strong>Teknisyen</strong> üç paneli dolaşmadan sahaya neyle gideceğini ve nereden başlayacağını bilmek ister.</p>
        </JuryCard>
        <JuryCard title="Çözüm önerisi">
          <p>Orkestra mevcut kontrolörlerden okur ve önerileri önce dijital ikizde dener. Yönetici olay anında gerekçeyi değerlendirir, teknisyen sahaya gitmeden kontrol listesini açar. Sakin soru sorar, Wilo örnek filo görünümünü izler.</p>
          <p><strong>Bu sayede</strong> ekip üç ekranı karşılaştırmak yerine tek bir öncelik listesiyle çalışır ve sahaya ilk seferde doğru kontrol listesiyle gider.</p>
        </JuryCard>
      </div>
      <div className="role-tabs" role="tablist" aria-label="Kullanıcı görünümleri">
        {roles.map((role, index) => {
          const Icon = roleIcons[role.id]
          return <button type="button" role="tab" id={'tab-' + role.id} key={role.id}
            aria-selected={selected === role.id} aria-controls={'panel-' + role.id}
            tabIndex={selected === role.id ? 0 : -1} onClick={() => setSelected(role.id)}
            onKeyDown={(event) => onTabKey(event, index)}><Icon size={18} />{role.name}</button>
        })}
      </div>
      {roles.map((role) => <div key={role.id} role="tabpanel" className="role-panel"
        id={'panel-' + role.id} aria-labelledby={'tab-' + role.id} hidden={role.id !== selected}
        tabIndex={0}>
        <>
          <div className="role-copy"><h3>{role.heading}</h3><p>{role.description}</p></div>
          <div className="dashboard">
            <div className="dashboard-top"><span><Activity size={17} /> {role.name} görünümü</span><span className="example">Örnek veri</span></div>
            <div className="dashboard-body">
              {role.id === 'manager' && <Manager />}
              {role.id === 'technician' && <Technician />}
              {role.id === 'resident' && <Resident showAnswer={showAnswer} />}
              {role.id === 'wilo' && <Fleet />}
            </div>
          </div>
        </>
      </div>)}
    </div>
  </section>
}

const metrics = [
  { title: 'Erken uyarı süresi', detail: 'Uyarı ile doğrulanan olay arasındaki dakika.', icon: Timer },
  { title: 'Yanlış alarm sayısı', detail: 'Kontrolde sorun bulunmayan uyarılar.', icon: Target },
  { title: 'Yangın rezervi ihlali', detail: 'Simülasyon kabul koşulu, her senaryoda sıfır ihlal.', icon: ShieldCheck },
]

function Pilot() {
  return <section className="section fixed-screen closing-beat static-beat pilot" id="pilot" aria-labelledby="pilot-title">
    <div className="shell story-panel">
      <p className="eyebrow"><span className="signal" /> İlk Wilo pilotu</p>
      <div className="pilot-intro">
        <h2 id="pilot-title">Bir binada başla.<br />Şehre kadar ölçekle.</h2>
        <p className="section-lead">Pilot, uyumlu bir Wilo kurulumunda salt okunur veriyle ve ek donanım olmadan başlar. Ekip önerileri gölge modda değerlendirir.</p>
      </div>
      <div className="jury-grid pilot-evidence">
        <JuryCard title="Veri ve uygulanabilirlik" icon={<Database size={18} />}>
          <dl className="pilot-data">
            <div><dt>Elimizde</dt><dd>Dijital ikiz demosu ve temsili kayıtlar.</dd></div>
            <div><dt>Aday kaynaklar</dt><dd>Hava, kesinti duyuruları ve üretici kılavuzları.</dd></div>
            <div><dt>Wilo ile doğrulanacak</dt><dd>Anonim saha geçmişi, basınç ve devir, yangın paneli ve jokey durumu, kuyu sinyalleri. Veri çıkışları ve salt okunur erişim izni.</dd></div>
          </dl>
        </JuryCard>
        <JuryCard title="İlk test" id="ilk-test" icon={<FlaskConical size={18} />}>
          <p>Varsayımımız, ölçümlerin erken uyarıya yetmesi ve ortak kararın plansız olayları azaltması.</p>
          <div className="pilot-trials">
            <strong>30 senaryo · Eğitim dışında</strong>
            <ul aria-label="Test senaryolarının dağılımı">
              <li><strong>10</strong> Arıza</li>
              <li><strong>10</strong> Dış olay</li>
              <li><strong>10</strong> Normal gün</li>
            </ul>
          </div>
          <p>Tek sanal binada aynı kayıtları <strong>sabit eşik, bağımsız ajanlar ve Şef ajan</strong> ile oynatacağız.</p>
          <p>Erken uyarıyı, yanlış alarmları ve Şef’in plansız olaylara etkisini ölçeceğiz. Bildirimin doğru aksiyona yönlendirip yönlendirmediğini üç yönetici veya teknisyenle sınayacağız.</p>
        </JuryCard>
        <JuryCard title="Beklenen su etkisi" id="su-etkisi" icon={<Droplet size={18} />}>
          <div className="pilot-impact">
            <div><span>Ana gösterge</span><p><strong>Bina başına aylık plansız pompa olayı</strong></p><p>Sapma erken yakalanırsa su kesintisi kısalır, kuyu taşması ve bodrum baskını azalır, yangın rezervi korunur.</p></div>
            <div>
              <ul aria-label="Sayılacak olay örnekleri">
                <li>Hizmeti etkileyen basınç düşüşü</li><li>Su baskını</li><li>Plansız arıza</li><li>Kaçırılan yangın testi</li>
              </ul>
              <p>Bu olayları azaltmayı hedefliyoruz. Kazanım ilk testten sonra raporlanacak.</p>
            </div>
          </div>
        </JuryCard>
      </div>
      <div className="pilot-strip"><ShieldCheck size={22} /><p>Uyumlu modeller Wilo ile doğrulanacak. Yangın paneli kendi kontrolünü sürdürür.</p><a href="https://wilo.com/za/en/Solutions-Finder/Connectivity/Remote-access/" hrefLang="en">Wilo Smart Connect (EN) <ArrowRight size={16} /></a></div>
      <div className="metric-grid">
        {metrics.map(({ title, detail, icon: Icon }) => <article key={title}><Icon size={24} /><h3>{title}</h3><p>{detail}</p></article>)}
      </div>
      <JuryCard title="Takım · Prometheus" id="takim" icon={<Users size={18} />}>
        <p className="team-meta">Proje: <strong>Orkestra</strong> · Çalışma alanı: <strong>Bina pompa sistemleri</strong></p>
        <table className="team-roles">
          <thead><tr><th scope="col">Üye</th><th scope="col">Rol</th></tr></thead>
          <tbody>{team.map(({ name, role }) => <tr key={name}><th scope="row">{name}</th><td>{role}</td></tr>)}</tbody>
        </table>
      </JuryCard>
      <details className="roadmap">
        <summary><span><Layers3 size={20} /> Ürün mimarisi ve yol haritası</span><ChevronRight size={18} /></summary>
        <div className="roadmap-body">
          <p>Her pompa ajanı kendi zaman serisini öğrenir. Dijital ikiz, pompa ölçümlerini binanın depo, kuyu ve basınç bilgisiyle bir araya getirir. Şef ajan ortak olay özeti ve gerekçeli öneri üretir.</p>
          <ul>
            <li><Check size={16} /> <span><strong>ML:</strong> Geçmiş veriden normal davranışı öğrenip sapmayı işaretler.</span></li>
            <li><Check size={16} /> <span><strong>LLM ve MCP:</strong> Asistan, yetkili salt okunur veri araçlarını kullanarak role uygun açıklama sunar.</span></li>
            <li><Check size={16} /> <span><strong>RL:</strong> Alternatif stratejiler dijital ikizde karşılaştırılır.</span></li>
          </ul>
          <p>Bir sonraki aşama canlı veri entegrasyonu, gerçek LLM, push bildirimleri ve ayrı mobil uygulamayı kapsar. Cihaz komutları ayrıca değerlendirilir. Yeni pompa türleri ve bina gruplarıyla görünüm siteye ve şehre genişler.</p>
        </div>
      </details>
    </div>
  </section>
}

function App() {
  const presentation = usePresentation()
  return <>
    <a className="skip-link" href="#icerik">İçeriğe geç</a>
    <main id="icerik" tabIndex={-1}>
      <Header presentation={presentation} />
      <Journey playing={presentation.playing}>
        <DecisionLogic />
        <RoleViews presentation={presentation} />
        <Pilot />
      </Journey>
    </main>
    <footer className="site-footer"><div className="shell footer-inner"><Brand /><div className="footer-team"><strong>Prometheus</strong><ul>{team.map(({ name, role }) => <li key={name}>{name} <span>{role}</span></li>)}</ul></div></div></footer>
  </>
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
