import { useEffect, useRef } from 'react'
import { ArrowDown, Building2, Flame, Gauge, GitMerge, Waves } from 'lucide-react'
import { pumps } from './content'
import { drawNeighborhood, sceneHeight, sceneWidth } from './Neighborhood'
import { scenarios } from './story'

type Event = typeof scenarios[number]

const icons = { fire: Flame, pressure: Gauge, drainage: Waves }
const clamp = (value: number) => Math.max(0, Math.min(1, value))
const ease = (value: number) => value * value * (3 - 2 * value)

function Opening() {
  return <section className="opening" id="baslangic" aria-labelledby="opening-title">
    <div className="opening-mark" aria-hidden="true"><span /><span /><span /></div>
    <div className="shell opening-inner">
      <p className="eyebrow">Water AI Hackathon</p>
      <h1 id="opening-title">Orkestra<span>.</span></h1>
      <p className="opening-subtitle">Bir binanın suyla geçen günü.</p>
      <div className="opening-meta">
        <div><span>Takım</span><strong>Prometheus</strong></div>
        <a className="opening-link" href="#ihtiyac">Mahalleye in <ArrowDown size={18} /></a>
      </div>
    </div>
  </section>
}

function Context() {
  return <section className="context-note incident-note layout-left" id="ihtiyac" aria-labelledby="ihtiyac-title">
    <div className="shell">
      <div className="motion-copy">
        <p className="eyebrow"><Building2 size={16} /> A Blok · Günün başlangıcı</p>
        <h2 id="ihtiyac-title">Üç pompa, üç ayrı ekran.</h2>
        <p className="motion-story">Yangın, hidrofor ve atık su pompaları ayrı kontrolörlerle çalışıyor. Uyumlu kurulumlarda Wilo Smart Connect cihazları uzaktan görünür kılıyor. Binanın ortak durumunu bugün ekip, ayrı uyarılardan çıkarıyor.</p>
        <p className="motion-story">Yönetici ne olduğunu, teknisyen nereden başlayacağını, sakin ise su hizmetinin etkilenip etkilenmediğini bilmek istiyor.</p>
        <p className="context-bridge">Orkestra, her pompanın geçmişini öğrenen ajanların bulgularını şef ajanla birleştiriyor.</p>
      </div>
    </div>
  </section>
}


function Decision({ event }: { event: Event }) {
  const chapter = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = chapter.current
    if (!section) return

    const observer = new IntersectionObserver(([entry]) => {
      section.classList.toggle('in-view', entry.isIntersecting)
    }, { threshold: .3 })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return <section ref={chapter} className="section fixed-screen decision-screen" id={event.decisionId} aria-labelledby={event.decisionId + '-title'}>
    <div className="shell">
      <p className="eyebrow">{event.label} · Pompa odası · Örnek veri</p>
      <h2 id={event.decisionId + '-title'}>Şef ajan neye dayanıyor?</h2>
      <div className="pump-network">
        {event.readings.map((reading) => {
          const pump = pumps.find(({ type }) => type === reading.pump)
          if (!pump) return null

          const Icon = icons[pump.type]
          return <article key={pump.id} className={'network-pump ' + (pump.type === event.key ? 'focus-pump' : '')}>
            <div className="network-pump-title"><Icon size={20} /><h3>{pump.name}</h3></div>
            <strong>{reading.value}</strong>
            <small>{reading.baseline}</small>
            <p>{reading.finding}</p>
          </article>
        })}
      </div>
      <div className="network-lines" aria-hidden="true">{event.readings.map(({ pump }) => <span key={pump} />)}</div>
      <article className="conductor">
        <div className="conductor-heading"><GitMerge size={23} /><h3>Şef ajan</h3><span>{event.priority}</span></div>
        <strong>{event.action}</strong>
        <p>{event.reason}</p>
      </article>
    </div>
  </section>
}

function IncidentNote({ event }: { event: Event }) {
  return <section id={event.id} className={'incident-note layout-' + event.placement}
    aria-labelledby={event.id + '-title'}>
    <div className="shell">
      <div className="motion-copy">
        <p className="eyebrow">A Blok · {event.time} · {event.label}</p>
        <h2 id={event.id + '-title'}>{event.title}</h2>
        <p className="motion-story">{event.story}</p>
        <div className="motion-reading">
          <span>{event.measure} · Örnek veri</span>
          <strong>{event.initial} <span aria-hidden="true">→</span> {event.final}</strong>
          <small>{event.baseline}</small>
        </div>
      </div>
    </div>
  </section>
}

function Incident() {
  const section = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const root = section.current
    const graphic = stage.current
    const context = canvas.current?.getContext('2d')
    if (!root || !graphic || !context) return

    const notes = scenarios.map((event) => document.getElementById(event.id))
    const decisions = scenarios.map((event) => document.getElementById(event.decisionId))
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let visible = false
    let lastDraw = -Infinity

    function draw(time: number) {
      if (!graphic || !context) return
      if (time - lastDraw >= 27 || reduced.matches) {
        const header = document.querySelector('header')?.offsetHeight ?? 0
        const viewport = window.innerHeight - header
        const distance = (node: HTMLElement | null) => (node?.getBoundingClientRect().top ?? 0) - header
        const progress = notes.map((node) => {
          const span = Math.max(viewport * .66, (node?.offsetHeight ?? viewport) - viewport * .63)
          return ease(clamp((viewport * .24 - distance(node)) / span))
        })

        const decisionFocus = decisions.map((node) => {
          const top = distance(node)
          const height = node?.offsetHeight ?? viewport
          return ease(clamp((viewport * .58 - top) / (viewport * .50))) *
            ease(clamp((top + height - viewport * .33) / (viewport * .57)))
        })
        const [rain, clear, dusk] = progress
        let x = 0
        let y = 0
        let zoom = 1
        scenarios.forEach(({ camera }, index) => {
          const weight = progress[index]
          x += (camera[0] - x) * weight
          y += (camera[1] - y) * weight
          zoom += (camera[2] - zoom) * weight
        })

        drawNeighborhood(context, reduced.matches
          ? { rain: 0, clear: 0, dusk: 0, time: 0, moving: false }
          : { rain, clear, dusk, time: time / 1000, moving: true })
        graphic.style.setProperty('--pan-x', x + 'px')
        graphic.style.setProperty('--pan-y', y + 'px')
        graphic.style.setProperty('--zoom', String(zoom))
        graphic.style.setProperty('--mobile-pan', (-12 - rain * 19 + clear * 16 - dusk * 4) + '%')
        graphic.style.setProperty('--focus', String(Math.max(...decisionFocus)))
        lastDraw = time
      }
      if (visible && !reduced.matches) frame = requestAnimationFrame(draw)
    }

    function refresh() {
      cancelAnimationFrame(frame)
      if (visible) frame = requestAnimationFrame(draw)
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      refresh()
    })
    observer.observe(root)
    window.addEventListener('scroll', refresh, { passive: true })
    window.addEventListener('resize', refresh)
    reduced.addEventListener('change', refresh)
    frame = requestAnimationFrame(draw)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', refresh)
      window.removeEventListener('resize', refresh)
      reduced.removeEventListener('change', refresh)
    }
  }, [])

  return <div className="incident" ref={section} aria-label="A Blok · Aynı mahallede bir gün">
    <div className="incident-stage" ref={stage} role="img"
      aria-label="Sokak, komşu binalar, park, araçlar ve A Blok’un üç pompalı bodrumunu gösteren mahalle kesiti">
      <div className="incident-plate"><canvas ref={canvas} width={sceneWidth} height={sceneHeight} aria-hidden="true" /></div>
    </div>
    <div className="incident-story">
      <Context />
      {scenarios.map((event) => <div key={event.id}>
        <IncidentNote event={event} />
        <Decision event={event} />
      </div>)}
    </div>
  </div>
}

export function Journey() {
  return <>
    <Opening />
    <Incident />
  </>
}
