import { StrictMode, useEffect, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Activity, ArrowRight, AudioLines, Bell, Building2, Check,
  ChevronRight, Droplet, Layers3, Menu, Pause, Play,
  ShieldCheck, Target, Timer, Wrench, X,
} from 'lucide-react'
import { pumps, roles, team, telemetry } from './content'
import type { Role } from './content'
import { Journey } from './Film'
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

function Header({ presentation }: { presentation: ReturnType<typeof usePresentation> }) {
  const [open, setOpen] = useState(false)

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
        {presentation.playing ? 'Duraklat' : presentation.second === presentationSeconds ? 'Baştan oynat' : 'Sunumu oynat'}
      </button>
    </div>
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
    <div className="panel-block"><strong>Kuyu seviyesi · Son 20 dakika</strong>
      <ol className="telemetry">
        {telemetry.map(({ time, level }) => <li key={time}>
          <span>%{level}</span><div className="bar-track"><span style={{ height: level + '%' }} /></div><span>{time}</span>
        </li>)}
      </ol>
    </div>
    <div className="panel-alert"><Wrench size={21} /><div><strong>Kuyu ve şamandıra kontrolü önerildi</strong><span>Seviye %78, olağan aralık %35–50.</span></div></div>
  </>
}

function Resident({ showAnswer }: { showAnswer: boolean }) {
  const [answer, setAnswer] = useState(false)
  useEffect(() => { if (showAnswer) setAnswer(true) }, [showAnswer])
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

function RoleViews({ presentation }: { presentation: ReturnType<typeof usePresentation> }) {
  const [selected, setSelected] = useState<Role>('manager')
  const second = presentation.second
  const playing = presentation.playing
  const showAnswer = playing && second !== null && second >= 152 && second < 164

  useEffect(() => {
    if (!playing || second === null || second < 138 || second >= 164) return
    setSelected(second >= 150 ? 'resident' : 'manager')
  }, [playing, second])

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

  return <section className="section fixed-screen role-section" id="gorunumler" tabIndex={-1} aria-labelledby="role-title">
    <div className="shell">
      <p className="eyebrow"><span className="signal" /> Web ve mobil</p>
      <h2 id="role-title">Aynı gün, dört kullanıcı.</h2>
      <p className="section-lead">Yönetici günün olay kaydını webde izler. Sakin, mobil bildirim ve örnek asistan yanıtıyla su hizmetinin durumunu öğrenir.</p>
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
  { title: 'Plansız pompa olayları', detail: 'Bina başına aylık plansız olay sayısı.', icon: Activity },
]

function Pilot() {
  return <section className="section fixed-screen pilot" id="pilot" aria-labelledby="pilot-title">
    <div className="shell">
      <p className="eyebrow"><span className="signal" /> İlk Wilo pilotu</p>
      <div className="pilot-intro">
        <h2 id="pilot-title">Bir binada başla.<br />Şehre kadar ölçekle.</h2>
        <p className="section-lead">Orkestra, mevcut Wilo kontrol ve bağlantı altyapısına ortak bir bina görünümü ekler. Uygun mevcut bağlantısı olan tek binada ek donanımsız, salt okunur bir pilotla başlar.</p>
      </div>
      <div className="pilot-strip"><ShieldCheck size={22} /><p>Model uyumu ve veri erişimi Wilo ile doğrulanır. Yangın paneli kendi kontrolünü sürdürür.</p><a href="https://wilo.com/za/en/Solutions-Finder/Connectivity/Remote-access/">Wilo Smart Connect <ArrowRight size={16} /></a></div>
      <div className="pilot-plan">
        <article><h3>Veri ve saha doğrulaması</h3><p>Demoda kuyu seviyesi, hidrofor basıncı ve yangın paneli durumu temsili. Pilotta zaman damgalı ölçüm ile alarm geçmişi ve yetkili veri erişimi gerekir. Kullanılabilir veri noktaları Wilo ile model bazında doğrulanır.</p></article>
        <article><h3>İlk test</h3><p>Sağanak, eve dönüşte basınç düşüşü ve akşam alarmı kayıtlarını aynı zaman damgalarıyla sabit eşik, bağımsız ajanlar ve şef ajanla oynatırız. Normal çalışma kayıtlarında yanlış alarmı karşılaştırırız.</p></article>
      </div>
      <p className="pilot-goal"><strong>Başarı ölçütü:</strong> Yanlış alarmı artırmadan daha erken uyarı. Sahada hedef, taşkın ve su kesintisi gibi plansız olayları azaltmak.</p>
      <div className="metric-grid">
        {metrics.map(({ title, detail, icon: Icon }) => <article key={title}><Icon size={24} /><h4>{title}</h4><p>{detail}</p></article>)}
      </div>
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
      <Journey />
      <RoleViews presentation={presentation} />
      <Pilot />
    </main>
    <footer className="site-footer"><div className="shell footer-inner"><Brand /><p>Prometheus · {team.map(({ name }) => name).join(" · ")}</p></div></footer>
  </>
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
