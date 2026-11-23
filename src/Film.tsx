import { useEffect, useRef } from 'react'
import { ArrowDown, Building2, Flame, Gauge, GitMerge, Waves } from 'lucide-react'
import { pumps } from './content'
import { drawNeighborhood, sceneHeight, sceneWidth } from './Neighborhood'
import { scenarios } from './story'
import type { CameraPoint } from './story'

type Event = typeof scenarios[number]

const icons = { fire: Flame, pressure: Gauge, drainage: Waves }
const clamp = (value: number) => Math.max(0, Math.min(1, value))
const ease = (value: number) => value * value * (3 - 2 * value)
const overview: CameraPoint = [880, 447, 1.03, [523, 117, 1281, 768]]

function interpolateCamera(from: CameraPoint, to: CameraPoint, weight: number): CameraPoint {
  const mix = (start: number, end: number) => start + (end - start) * weight
  return [
    mix(from[0], to[0]), mix(from[1], to[1]), mix(from[2], to[2]),
    [
      mix(from[3][0], to[3][0]), mix(from[3][1], to[3][1]),
      mix(from[3][2], to[3][2]), mix(from[3][3], to[3][3]),
    ],
  ]
}

function frameAxis(center: number, start: number, end: number, viewport: number, canvas: number, scale: number, inset: number) {
  if (canvas * scale <= viewport) return (viewport - canvas * scale) / 2

  const min = Math.max(viewport - canvas * scale, inset - start * scale)
  const max = Math.min(0, viewport - inset - end * scale)
  return Math.max(min, Math.min(max, viewport / 2 - center * scale))
}

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
  return <div className="motion-copy">
    <div>
      <p className="eyebrow"><Building2 size={16} /> A Blok · Günün başlangıcı</p>
      <h2>Üç pompa, üç ayrı ekran.</h2>
    </div>
    <div className="scene-explanation">
      <p className="motion-story">Yangın, hidrofor ve atık su pompaları ayrı kontrolörlerle çalışıyor. Uyumlu kurulumlarda Wilo Smart Connect cihazları uzaktan görünür kılıyor. Binanın ortak durumunu ekip, ayrı uyarılardan çıkarıyor.</p>
      <p className="motion-story">Yönetici durumu, teknisyen sorunun kaynağını, sakin su hizmetinin etkilenip etkilenmediğini bilmek istiyor. Orkestra bu bulguları şef ajanla birleştiriyor.</p>
    </div>
  </div>
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
  return <div className={'motion-copy layout-' + event.placement}>
    <div>
      <p className="eyebrow">A Blok · {event.time} · {event.label}</p>
      <h2>{event.title}</h2>
    </div>
    <div className="scene-explanation">
        <p className="motion-story">{event.story}</p>
        <div className="motion-reading">
          <span>{event.measure} · Örnek veri</span>
          <strong>{event.initial} <span aria-hidden="true">→</span> {event.final}</strong>
          <small>{event.baseline}</small>
        </div>
    </div>
  </div>
}

function Incident() {
  const section = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const viewfinder = useRef<HTMLDivElement>(null)
  const plate = useRef<HTMLDivElement>(null)
  const captions = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const root = section.current
    const graphic = stage.current
    const view = viewfinder.current
    const drawing = plate.current
    const captionRail = captions.current
    const context = canvas.current?.getContext('2d')
    if (!root || !graphic || !view || !drawing || !captionRail || !context) return

    const notes = scenarios.map((event) => document.getElementById(event.id))
    const decisions = scenarios.map((event) => document.getElementById(event.decisionId))
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let visible = false
    let lastDraw = -Infinity
    let activeCaption = -1
    let captionsCovered = false

    function draw(time: number) {
      if (!graphic || !context || !view || !drawing || !captionRail) return
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
        const focus = Math.max(...decisionFocus)
        const [rain, clear, dusk] = progress
        let camera = overview
        scenarios.forEach(({ camera: [from, to] }, index) => {
          const beat = progress[index]
          const entry = ease(clamp(beat / .32))
          const pan = ease(clamp((beat - .20) / .73))
          camera = interpolateCamera(camera, interpolateCamera(from, to, pan), entry)
        })
        const [x, y, zoom, [left, top, right, bottom]] = camera
        const width = view.clientWidth
        const height = view.clientHeight
        const inset = Math.min(14, width * .025, height * .04)
        const scale = Math.min(
          Math.max(width / sceneWidth, height / sceneHeight) * zoom,
          (width - 2 * inset) / (right - left),
          (height - 2 * inset) / (bottom - top),
        )
        const translateX = frameAxis(x, left, right, width, sceneWidth, scale, inset)
        const translateY = frameAxis(y, top, bottom, height, sceneHeight, scale, inset)
        drawing.style.transform = reduced.matches ? '' : 'translate3d(' + translateX + 'px,' + translateY + 'px,0) scale(' + scale + ')'

        const nextCaption = notes.findLastIndex((node) => distance(node) <= viewport * .38) + 1
        if (nextCaption !== activeCaption) {
          activeCaption = nextCaption
          Array.from(captionRail.children).forEach((caption, index) => {
            caption.classList.toggle('is-current', index === activeCaption)
            caption.setAttribute('aria-hidden', String(index !== activeCaption))
          })
        }
        if (captionsCovered !== (focus > .55)) {
          captionsCovered = focus > .55
          captionRail.setAttribute('aria-hidden', String(captionsCovered))
        }

        drawNeighborhood(context, reduced.matches
          ? { rain: 0, clear: 0, dusk: 0, time: 0, moving: false }
          : { rain, clear, dusk, time: time / 1000, moving: true })
        graphic.style.setProperty('--focus', String(focus))
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
    <div className="incident-stage" ref={stage}>
      <div className="incident-viewfinder" ref={viewfinder} role="img"
        aria-label="Sokak, komşu binalar, park, araçlar ve A Blok’un üç pompalı bodrumunu gösteren mahalle kesiti">
        <div className="incident-plate" ref={plate}><canvas ref={canvas} width={sceneWidth} height={sceneHeight} aria-hidden="true" /></div>
      </div>
      <div className="scene-captions" ref={captions}>
        <div className="scene-caption is-current"><Context /></div>
        {scenarios.map((event) => <div className="scene-caption" key={event.id} aria-hidden="true"><IncidentNote event={event} /></div>)}
      </div>
    </div>
    <div className="incident-story">
      <section className="incident-note context-note" id="ihtiyac" aria-label="Günün başlangıcı">
        <div className="static-caption shell"><Context /></div>
      </section>
      {scenarios.map((event) => <div key={event.id}>
        <section className="incident-note" id={event.id} aria-label={event.title}>
          <div className="static-caption shell"><IncidentNote event={event} /></div>
        </section>
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
