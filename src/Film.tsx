import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { ArrowDown, Building2, Diamond, Flame, Gauge, GitMerge, RotateCcw, Waves } from 'lucide-react'
import { pumps } from './content'
import { drawNeighborhood, sceneHeight, sceneOffsetX, sceneWidth } from './Neighborhood'
import type { Neighborhood } from './Neighborhood'
import { scenarios } from './story'
import type { CameraPoint } from './story'

type Event = typeof scenarios[number]

const icons = { fire: Flame, pressure: Gauge, drainage: Waves }
const clamp = (value: number) => Math.max(0, Math.min(1, value))
const ease = (value: number) => value * value * (3 - 2 * value)
const overview: CameraPoint = [838, 447, 1, [440, 117, 1281, 768]]
const introductionCamera: CameraPoint = [869, 523, 1, [440, 231, 1297, 758]]
const sceneResolution = .9
const actionDuration = 4200
const agentRoles = {
  fire: { title: 'Yangın ajanı', text: 'Hazırlık ve alarm durumunu salt okunur izler. Yerel yangın paneli kendi kontrolünü sürdürür.' },
  pressure: { title: 'Hidrofor ajanı', text: 'Üst kat basıncını binanın geçmişiyle karşılaştırır ve ihtiyaç varsa basınç desteği önerir.' },
  drainage: { title: 'Atık su ajanı', text: 'Kuyu seviyesini izler, olağan aralığın dışına çıkınca drenaj incelemesi önerir.' },
}

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

function frameAxis(center: number, subjectStart: number, subjectEnd: number,
  safeStart: number, safeEnd: number, viewport: number, canvas: number, scale: number, inset: number) {
  const subjectMin = safeStart + inset - subjectStart * scale
  const subjectMax = safeEnd - inset - subjectEnd * scale
  const remaining = viewport - canvas * scale
  const worldMin = Math.min(0, remaining)
  const worldMax = Math.max(0, remaining)
  const min = Math.max(worldMin, subjectMin)
  const max = Math.min(worldMax, subjectMax)
  const desired = (safeStart + safeEnd) / 2 - center * scale
  if (min <= max) return Math.max(min, Math.min(max, desired))
  return Math.max(subjectMin, Math.min(subjectMax, desired))
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

function sceneWeather(index: number): [number, number, number] {
  return [index >= 0 ? 1 : 0, index >= 1 ? 1 : 0, index >= 2 ? 1 : 0]
}

function StillScene({ event }: { event?: Event }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [left, top, right, bottom] = (event?.execution.camera ?? introductionCamera)[3]

  useEffect(() => {
    const context = canvas.current?.getContext('2d')
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    function draw() {
      if (!context || !preference.matches) return
      context.setTransform(1, 0, 0, 1, -(sceneOffsetX + left), -top)
      const [rain, clear, dusk] = sceneWeather(event ? scenarios.indexOf(event) : -1)
      drawNeighborhood(context, {
        rain, clear, dusk, time: 0, moving: false,
        introduce: event ? 0 : 1, action: event && { key: event.key, progress: 1 },
      })
    }
    draw()
    preference.addEventListener('change', draw)
    return () => preference.removeEventListener('change', draw)
  }, [event, left, top])

  return <canvas className="still-scene" ref={canvas} width={right - left} height={bottom - top} aria-hidden="true" />
}

function AgentIntroduction() {
  return <section className="illustrated-beat agent-introduction" id="ajanlar" aria-labelledby="agents-title">
    <StillScene />
    <div className="story-panel illustrated-card intro-card">
      <p className="eyebrow">A Blok · Pompa odası</p>
      <h2 id="agents-title">Dört ajan, tek bina.</h2>
      <div className="intro-systems">
        {pumps.map((pump) => {
          const Icon = icons[pump.type]
          const role = agentRoles[pump.type]
          return <article key={pump.id} data-pump={pump.type}>
            <h3><Icon size={17} />{role.title}</h3><p>{role.text}</p>
          </article>
        })}
        <article data-pump="chief"><h3><Diamond size={17} />Şef ajan</h3><p>Ölçümleri birleştirir, görevleri ilgili ajana iletir ve sonucu takip eder.</p></article>
      </div>
    </div>
  </section>
}

function ActionScene({ event, phase, replay }: { event: Event; phase: number; replay: () => void }) {
  const { execution } = event
  const steps = [execution.start, execution.running, execution.result]
  const side = event.key === 'drainage' ? 'left' : 'right'

  return <section className={'illustrated-beat action-scene action-' + side} id={execution.id} aria-labelledby={execution.id + '-title'} data-phase={phase}>
    <StillScene event={event} />
    <div className="story-panel illustrated-card action-card motion-copy">
      <div>
        <p className="eyebrow">Şef → {agentRoles[event.key].title} · Dijital ikiz</p>
        <h2 id={execution.id + '-title'}>{execution.title}</h2>
      </div>
      <p className="motion-story action-live" aria-live="polite">{steps[phase]}</p>
      <p className="motion-story static-result">{execution.result}</p>
      <div className="motion-reading">
        <span>{execution.metric} · Örnek veri</span>
        <strong className="action-live">{phase === 2 ? execution.after : execution.before}</strong>
        <strong className="static-result">{execution.after}</strong>
      </div>
      <button type="button" className="action-replay" onClick={replay}><RotateCcw size={15} /> Tekrar oynat</button>
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
    <div className="shell story-panel">
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
  return <div className="motion-copy">
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

function Incident({ playing }: { playing: boolean }) {
  const section = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const viewfinder = useRef<HTMLDivElement>(null)
  const plate = useRef<HTMLDivElement>(null)
  const captions = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const presentationPlaying = useRef(playing)
  const restart = useRef<string | null>(null)
  const [actionPhases, setActionPhases] = useState(() => scenarios.map(() => 0))

  useEffect(() => { presentationPlaying.current = playing }, [playing])

  useEffect(() => {
    const root = section.current
    const graphic = stage.current
    const view = viewfinder.current
    const drawing = plate.current
    const captionRail = captions.current
    const context = canvas.current?.getContext('2d')
    if (!root || !graphic || !view || !drawing || !captionRail || !context) return
    context.setTransform(sceneResolution, 0, 0, sceneResolution, 0, 0)

    const notes = scenarios.map((event) => document.getElementById(event.id))
    const intro = document.getElementById('ajanlar')
    const decisions = scenarios.map((event) => document.getElementById(event.decisionId))
    const actions = scenarios.map((event) => document.getElementById(event.execution.id))
    const beats = [
      { node: document.getElementById('ihtiyac'), panel: captionRail.children[0], side: 'left' },
      { node: intro, panel: intro?.querySelector('.story-panel'), side: 'left' },
      ...scenarios.flatMap((event, index) => [
        { node: notes[index], panel: captionRail.children[index + 1], side: event.placement },
        { node: decisions[index], panel: decisions[index]?.querySelector('.story-panel'), side: null },
        { node: actions[index], panel: actions[index]?.querySelector('.story-panel'), side: event.key === 'drainage' ? 'left' : 'right' },
      ]),
    ]
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const stacked = window.matchMedia('(max-width: 767px)')
    let frame = 0
    let visible = false
    let lastDraw = -Infinity
    let needsDraw = true
    let displayedBeat = -1
    let panelOpacity = 0
    let rendered: [number, number, number] | null = null
    let actionIndex = -1
    let phase = 0
    let elapsed = 0
    let timedAction = false

    function draw(time: number) {
      frame = 0
      if (!graphic || !context || !view || !drawing || !captionRail) return
      if (needsDraw || time - lastDraw >= 27 || time < lastDraw || reduced.matches) {
        const header = document.querySelector('header')?.offsetHeight ?? 0
        const viewport = window.innerHeight - header
        const distance = (node: HTMLElement | null) => (node?.getBoundingClientRect().top ?? 0) - header
        const delta = time - lastDraw
        const reference = viewport * .44
        const edges = beats.map(({ node }) => {
          const top = distance(node)
          return Math.min(reference - top, top + (node?.offsetHeight ?? 0) - reference)
        })
        const desiredBeat = edges.findIndex((edge) => edge >= 0)
        const desiredOpacity = desiredBeat < 0 ? 0
          : ease(clamp((edges[desiredBeat] - viewport * .035) / Math.min(130, viewport * .24)))

        if (!reduced.matches) {
          if (panelOpacity === 0) displayedBeat = desiredBeat
          const target = displayedBeat === desiredBeat ? desiredOpacity : 0
          const step = Math.min(45, Math.max(0, delta)) / (target < panelOpacity ? 165 : 265)
          panelOpacity += Math.sign(target - panelOpacity) * Math.min(Math.abs(target - panelOpacity), step)
        }
        beats.forEach(({ panel }, index) => {
          if (!(panel instanceof HTMLElement)) return
          const showing = !reduced.matches && index === displayedBeat && panelOpacity > .001
          panel.style.setProperty('--panel-opacity', showing ? String(ease(panelOpacity)) : '0')
          panel.toggleAttribute('data-visible', showing)
          panel.inert = !reduced.matches && !showing
        })

        const subject = beats[desiredBeat]?.node
        const shown = beats[displayedBeat]
        const focus = shown?.side === null ? ease(panelOpacity) : 0
        const progress = notes.map((node) => {
          const span = Math.max(viewport * .66, (node?.offsetHeight ?? viewport) - viewport * .63)
          return ease(clamp((viewport * .24 - distance(node)) / span))
        })

        const [rain, clear, dusk] = progress
        const introducing = subject === intro
        const actionCamera = actions.findIndex((node) => node === subject)
        const nextAction = actions.findIndex((node) => node === shown?.node && distance(node) <= viewport * .13)
        const event = scenarios[nextAction]
        const repeat = event && restart.current === event.execution.id
        const changedAction = nextAction !== actionIndex
        if (changedAction || repeat) {
          actionIndex = nextAction
          elapsed = 0
          timedAction = !repeat && presentationPlaying.current
          if (repeat) restart.current = null
        } else if (event) {
          if (presentationPlaying.current) timedAction = true
          if (!timedAction || presentationPlaying.current) elapsed += Math.max(0, time - lastDraw)
        }
        const actionProgress = reduced.matches ? 1 : clamp(elapsed / actionDuration)
        const nextPhase = event ? actionProgress >= 1 ? 2 : actionProgress >= .22 ? 1 : 0 : 0
        if (phase !== nextPhase || changedAction) {
          phase = nextPhase
          if (event) setActionPhases((previous) => previous.map((step, index) => index === nextAction ? nextPhase : step))
        }
        graphic.classList.toggle('has-illustrated-card', introducing || actionCamera >= 0)

        let camera = overview
        scenarios.forEach(({ camera: [from, to] }, index) => {
          const beat = progress[index]
          const entry = ease(clamp(beat / .32))
          const pan = ease(clamp((beat - .20) / .73))
          camera = interpolateCamera(camera, interpolateCamera(from, to, pan), entry)
        })
        if (introducing) camera = introductionCamera
        else if (actionCamera >= 0) camera = scenarios[actionCamera].execution.camera
        const [x, y, zoom, [left, top, right, bottom]] = camera
        if (reduced.matches) {
          drawing.style.transform = ''
          rendered = null
        } else {
          const bounds = view.getBoundingClientRect()
          const width = bounds.width
          const height = bounds.height
          const framing = beats[desiredBeat]
          const card = framing?.side && framing.panel?.getBoundingClientRect()
          const leftCard = framing?.side === 'left'
          const safeLeft = !stacked.matches && card && leftCard ? card.right - bounds.left + 12 : 0
          const safeRight = !stacked.matches && card && !leftCard ? card.left - bounds.left - 12 : width
          const safeBottom = stacked.matches && card ? Math.max(1, card.top - bounds.top - 10) : height
          const safeWidth = Math.max(1, safeRight - safeLeft)
          const inset = Math.min(14, safeWidth * .025, safeBottom * .04)
          const scale = Math.min(
            Math.max(safeWidth / sceneWidth, safeBottom / sceneHeight) * zoom,
            (safeWidth - 2 * inset) / (right - left),
            (safeBottom - 2 * inset) / (bottom - top),
          )
          const translateX = frameAxis(x + sceneOffsetX, left + sceneOffsetX, right + sceneOffsetX, safeLeft, safeRight, width, sceneWidth, scale, inset)
          const translateY = frameAxis(y, top, bottom, 0, safeBottom, height, sceneHeight, scale, inset)
          const blend = 1 - Math.exp(-Math.max(0, delta) / 170)
          rendered = rendered
            ? [
              rendered[0] + (translateX - rendered[0]) * blend,
              rendered[1] + (translateY - rendered[1]) * blend,
              rendered[2] + (scale - rendered[2]) * blend,
            ]
            : [translateX, translateY, scale]
          drawing.style.transform = 'translate3d(' + rendered[0] + 'px,' + rendered[1] + 'px,0) scale(' + rendered[2] + ')'
        }

        const state: Neighborhood = { rain, clear, dusk, time: time / 1000, moving: true }
        if (event) [state.rain, state.clear, state.dusk] = sceneWeather(nextAction)
        const afterDrainage = actions[0] && distance(actions[0]) < -actions[0].offsetHeight * .25
        state.drained = Boolean(afterDrainage && nextAction !== 0)
        const afterSupport = actions[1] && distance(actions[1]) < -actions[1].offsetHeight * .25
        state.supported = Boolean(afterSupport && nextAction !== 1)
        state.introduce = shown?.node === intro ? ease(panelOpacity) : 0
        state.action = event && { key: event.key, progress: actionProgress, time: elapsed / 1000 }
        drawNeighborhood(context, reduced.matches
          ? { rain: 0, clear: 0, dusk: 0, time: 0, moving: false }
          : state)
        graphic.style.setProperty('--focus', String(focus))
        needsDraw = false
        lastDraw = time
      }
      if (visible && !reduced.matches) frame = requestAnimationFrame(draw)
    }

    function refresh() {
      needsDraw = true
      if (!frame) frame = requestAnimationFrame(draw)
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
        <div className="incident-plate" style={{ '--world-width': sceneWidth + 'px' } as CSSProperties} ref={plate}>
          <canvas ref={canvas} width={sceneWidth * sceneResolution} height={sceneHeight * sceneResolution} aria-hidden="true" />
        </div>
      </div>
      <div className="scene-captions" ref={captions}>
        <div className="story-panel scene-caption caption-overview"><Context /></div>
        {scenarios.map((event) => <div className={'story-panel scene-caption caption-' + event.placement} key={event.id}><IncidentNote event={event} /></div>)}
      </div>
    </div>
    <div className="incident-story">
      <section className="incident-note context-note" id="ihtiyac" aria-label="Günün başlangıcı">
        <div className="static-caption shell"><Context /></div>
      </section>
      <AgentIntroduction />
      {scenarios.map((event, index) => <div key={event.id}>
        <section className="incident-note" id={event.id} aria-label={event.title}>
          <div className="static-caption shell"><IncidentNote event={event} /></div>
        </section>
        <Decision event={event} />
        <ActionScene event={event} phase={actionPhases[index]}
          replay={() => {
            restart.current = event.execution.id
            document.getElementById(event.execution.id)?.scrollIntoView({ block: 'start', behavior: 'instant' })
          }} />
      </div>)}
    </div>
  </div>
}

export function Journey({ playing }: { playing: boolean }) {
  return <>
    <Opening />
    <Incident playing={playing} />
  </>
}
