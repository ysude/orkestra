import { StrictMode, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Activity, ArrowDown, ArrowRight, AudioLines, Bell, Building2, Check,
  ChevronRight, Droplet, Flame, Gauge, GitMerge, Layers3, Menu, Radio,
  ShieldCheck, Target, Timer, Waves, Wrench, X,
} from 'lucide-react'
import { canvasAnswers, pumps, roles, scenes, team, telemetry } from './content'
import type { Role, Scene } from './content'
import { SceneArt } from './SceneArt'
import './styles.css'
import './comic.css'

const icons = { fire: Flame, pressure: Gauge, drainage: Waves }
const roleIcons = { manager: Building2, technician: Wrench, resident: Bell, wilo: Layers3 }

function Brand() {
  return <a className="brand" href="#baslangic" aria-label="Orkestra ana sayfa">
    <span className="brand-icon"><AudioLines size={22} strokeWidth={2.5} /></span>
    Orkestra<span className="brand-period">.</span>
  </a>
}

function Header() {
  const [open, setOpen] = useState(false)

  return <header className="site-header">
    <div className="shell header-inner">
      <Brand />
      <button className="menu-button" type="button" aria-expanded={open} aria-controls="navigation"
        aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'} onClick={() => setOpen(!open)}>
        {open ? <X size={23} /> : <Menu size={23} />}
      </button>
      <nav id="navigation" className={open ? 'nav open' : 'nav'} aria-label="Ana menü">
        <a href="#senaryo" onClick={() => setOpen(false)}>Senaryo</a>
        <a href="#gorunumler" onClick={() => setOpen(false)}>Arayüzler</a>
        <a href="#kanvas" onClick={() => setOpen(false)}>Proje kanvası</a>
      </nav>
      <a className="header-action" href="#gorunumler">Arayüzleri incele <ArrowRight size={16} /></a>
    </div>
  </header>
}

function Hero() {
  return <section className="hero" aria-labelledby="hero-title">
    <div className="shell hero-grid">
      <div className="hero-copy">
        <p className="eyebrow"><span className="signal" /> Binalar için akıllı pompa yönetimi</p>
        <h1 id="hero-title"><span>Her pompa</span><span>ayrı.</span><em>Karar ortak.</em></h1>
        <p className="hero-description">Yangın, hidrofor ve atık su sistemleri farklı işler yapar. Orkestra, üçünün verisini bir araya getirip binanın su durumunu gösterir.</p>
        <div className="hero-actions">
          <a className="button primary" href="#senaryo">Bodruma in <ArrowDown size={18} /></a>
          <a className="text-link" href="#gorunumler">Hikâyeyi geç <ChevronRight size={17} /></a>
        </div>
      </div>
      <figure className="hero-figure">
        <SceneArt scene="hero" />
        <figcaption><span><Building2 size={16} /> Apartman ve pompa odası</span><span>Dijital ikiz konsepti</span></figcaption>
      </figure>
    </div>
  </section>
}

function Scenario() {
  const [active, setActive] = useState<Scene>('room')
  const stepRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    let frame = 0

    function readScene() {
      const readingLine = Math.min(260, window.innerHeight * .34)
      const current = stepRefs.current.findLastIndex(
        (element) => element && element.getBoundingClientRect().top <= readingLine,
      )
      setActive(scenes[Math.max(0, current)].id)
    }

    function onScroll() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(readScene)
    }

    readScene()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  return <section className="section story" aria-labelledby="story-title">
    <div className="shell">
      <p className="eyebrow" id="senaryo"><span className="signal" /> Sağanak senaryosu</p>
      <h2 id="story-title">Bodrumda ne oluyor?</h2>
      <p className="section-lead">Bir sağanak başladığında üç ajan kendi sistemini izler. Şef ajan, bulguları bina ölçeğinde birleştirir.</p>
      <div className="story-layout">
        <div className="scene-display" data-active={active}>
          <div className="scene-top"><span><Radio size={16} /> A Blok · Pompa odası</span><span className="example">Örnek veri</span></div>
          <div className="scene-art" key={active}><SceneArt scene={active} /></div>
          <nav className="scene-nav" aria-label="Senaryo sahneleri">
            {scenes.map((scene) => <a key={scene.id} href={'#sahne-' + scene.id}
              aria-current={active === scene.id ? 'step' : undefined}>{scene.label}</a>)}
          </nav>
          <div className="scene-sensors" aria-hidden="true">
            {pumps.map((pump) => {
              const Icon = icons[pump.type]
              return <span className={'sensor ' + pump.type} key={pump.id}>
                <Icon size={18} /><span>{pump.name}</span>
              </span>
            })}
          </div>
          <div className="scene-footer"><GitMerge size={17} /> Şef ajan<span>{active === 'coordination' ? 'Kontrol önerisi hazır' : 'Veriler izleniyor'}</span></div>
        </div>
        <div className="story-steps">
          {scenes.map((scene, index) => <article className="story-step" id={'sahne-' + scene.id} data-scene={scene.id}
            ref={(element) => { stepRefs.current[index] = element }} key={scene.id}>
            <div className="mobile-scene"><SceneArt scene={scene.id} /></div>
            <p className="eyebrow">{scene.label}</p>
            <h3>{scene.title}</h3>
            <p>{scene.description}</p>
          </article>)}
        </div>
      </div>
      <div className="pump-grid" aria-label="Örnek pompa ölçümleri">
        {pumps.map((pump) => {
          const Icon = icons[pump.type]
          return <article className={'pump-card ' + pump.type} key={pump.id}>
            <div className="pump-top"><span className="pump-icon"><Icon size={21} /></span><span>{pump.id}</span></div>
            <h3>{pump.name}</h3>
            <p className="reading">{pump.reading}</p>
            <dl>
              <div><dt>Ölçüm</dt><dd>{pump.signal}</dd></div>
              <div><dt>Olağan durum</dt><dd>{pump.baseline}</dd></div>
            </dl>
            <p className="observation">{pump.observation}</p>
          </article>
        })}
      </div>
    </div>
  </section>
}

function Manager() {
  const [daily, setDaily] = useState(true)

  return <>
    <div className="panel-alert"><Droplet size={21} /><div><strong>Atık su seviyesi yükseliyor</strong><span>A Blok · Bugün 18.00 · Bakım takibi</span></div></div>
    <div className="panel-stats">
      {pumps.map((pump) => <div key={pump.id}><span>{pump.name}</span><strong>{pump.reading}</strong><small>{pump.status}</small></div>)}
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

function Resident() {
  const [answer, setAnswer] = useState(false)
  return <div className="phone">
    <div className="phone-top"><span>18.05</span><span>Orkestra</span></div>
    <div className="phone-notification"><Bell size={16} /><div><strong>Bina bildirimi</strong><span>Sağanak nedeniyle teknik ekip kuyu durumunu inceliyor.</span></div></div>
    <button className="question" type="button" aria-expanded={answer} aria-controls="assistant-answer"
      onClick={() => setAnswer(!answer)}>Binada su kesintisi var mı? <ChevronRight size={15} /></button>
    <p id="assistant-answer" className="answer" hidden={!answer}>Bu örnek olayda su kesintisi görünmüyor. Hidrofor basıncı olağan aralıkta. Teknik ekip atık su kuyusunu kontrol ediyor.</p>
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
      <li><Building2 size={17} /><strong>A Blok</strong><span>Atık su uyarısı</span></li>
      <li><Building2 size={17} /><strong>B Blok</strong><span>Normal</span></li>
      <li><Building2 size={17} /><strong>C Blok</strong><span>Telemetri bekleniyor</span></li>
    </ul>
  </>
}

function RoleViews() {
  const [selected, setSelected] = useState<Role>('manager')

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

  return <section className="section role-section" id="gorunumler" tabIndex={-1} aria-labelledby="role-title">
    <div className="shell">
      <p className="eyebrow"><span className="signal" /> Web ve mobil</p>
      <h2 id="role-title">Aynı olay, dört kullanıcı.</h2>
      <p className="section-lead">Herkes kendi işi için gerekli bilgiyi görür.</p>
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
              {role.id === 'resident' && <Resident />}
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
  return <section className="section pilot" id="pilot" aria-labelledby="pilot-title">
    <div className="shell">
      <p className="eyebrow"><span className="signal" /> İlk Wilo pilotu</p>
      <div className="pilot-intro">
        <h2 id="pilot-title">Bir binada başla.<br />Şehre kadar ölçekle.</h2>
        <p className="section-lead">Orkestra, mevcut Wilo kontrol ve bağlantı altyapısına ortak bir bina görünümü ekler. Uygun mevcut bağlantısı olan tek binada ek donanımsız, salt okunur bir pilotla başlar.</p>
      </div>
      <div className="pilot-strip"><ShieldCheck size={22} /><p>Model uyumu ve veri erişimi Wilo ile doğrulanır. Yangın paneli kendi kontrolünü sürdürür.</p><a href="https://wilo.com/za/en/Solutions-Finder/Connectivity/Remote-access/">Wilo Smart Connect <ArrowRight size={16} /></a></div>
      <h3 className="metric-heading">Pilotta neyi ölçeceğiz?</h3>
      <p className="comparison">Aynı olay kayıtlarında sabit eşik, bağımsız ajanlar ve şef ajanlı yaklaşım karşılaştırılır.</p>
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

function ProjectCanvas() {
  return <section className="section project-canvas" id="kanvas" aria-labelledby="canvas-title">
    <div className="shell">
      <p className="eyebrow"><span className="signal" /> Water AI Hackathon</p>
      <h2 id="canvas-title">Proje Fikri Kanvası</h2>
      <dl className="canvas-identity">
        <div><dt>Proje adı</dt><dd>Orkestra</dd></div>
        <div><dt>Takım</dt><dd>Prometheus</dd></div>
        <div><dt>Çalışma alanı</dt><dd>Binalar · Su yönetimi</dd></div>
      </dl>
      <div className="answers">
        {canvasAnswers.map(({ question, answer, note }, index) => <article className="answer-card" key={question}>
          <h3><span>{String(index + 1).padStart(2, '0')}</span>{question}</h3>
          <p>{answer}</p>
          {note && <p className="answer-note">{note}</p>}
        </article>)}
      </div>
      <h3 className="team-title">Takım üyeleri</h3>
      <ul className="team-list">
        {team.map(({ name, role }) => <li key={name}><strong>{name}</strong><span>{role}</span></li>)}
      </ul>
    </div>
  </section>
}

function App() {
  return <>
    <a className="skip-link" href="#icerik">İçeriğe geç</a>
    <div id="baslangic" />
    <Header />
    <main id="icerik" tabIndex={-1}>
      <Hero />
      <Scenario />
      <RoleViews />
      <Pilot />
      <ProjectCanvas />
    </main>
    <footer className="site-footer"><div className="shell footer-inner"><Brand /><p>Wilo için çok ajanlı pompa yönetimi konsepti</p></div></footer>
  </>
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
