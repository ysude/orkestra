import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { ArrowDown, Building2, Diamond, Flame, Gauge, GitMerge, RotateCcw, Waves } from 'lucide-react'
import { pumps } from './content'
import { BuildingCase } from './JuryEvidence'
import { glide, lowPower, onFrame, pace, reducedMotion, scrollToElement } from './motion'
import { depthLayers, drawNeighborhood, sceneHeight, sceneOffsetX, sceneWidth } from './Neighborhood'
import type { DepthLayer, Neighborhood } from './Neighborhood'
import { cues, scenarios } from './story'
import type { CameraPoint } from './story'

type Event = typeof scenarios[number]

const icons = { fire: Flame, pressure: Gauge, drainage: Waves }
const clamp = (value: number) => Math.max(0, Math.min(1, value))
const ease = (value: number) => value * value * (3 - 2 * value)
const overview: CameraPoint = [838, 447, 1, [440, 117, 1281, 768]]
const introductionCamera: CameraPoint = [869, 523, 1, [440, 231, 1297, 758]]
const closingCameras: Partial<Record<string, CameraPoint>> = {
  gorunumler: [810, 440, .95, [475, 183, 1270, 755]],
  pilot: [1065, 421, .92, [520, 183, 1535, 756]],
}
const sceneResolution = .9
const layerNames = Object.keys(depthLayers) as DepthLayer[]
// A Blok's centre: depth layers line up with the main drawing when it is centred.
const parallaxAnchor = 781 + sceneOffsetX
const closingBeat = cues.findIndex(({ id }) => id === 'yapay-zeka') - 1

// The scene reports its mood to the page so the interface follows the story.
type SceneMood = 'calm' | 'rain' | 'clear' | 'alarm'
const browserColors: Record<SceneMood, string> = { calm: '#14363a', rain: '#2f5367', clear: '#1f5f86', alarm: '#8f3a2b' }
const actionDuration = 4200
const agentRoles = {
  fire: { title: 'Yangın ajanı', text: 'Hazırlık ve alarm durumunu salt okunur izler. Yerel yangın paneli kendi kontrolünü sürdürür.' },
  pressure: { title: 'Hidrofor ajanı', text: 'Üst kat basıncını binanın geçmişiyle karşılaştırır ve ihtiyaç varsa basınç desteği önerir.' },
  drainage: { title: 'Atık su ajanı', text: 'Benzer yağışlarda kuyunun olağan seviyesini geçmişten öğrenir, sapmayı bildirir.' },
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
    <p className="motion-story">Pompa dairesindeki üç sistem kendi durumunu bildiriyor. Aynı gün içinde sağanak, basınç düşüşü ve yangın alarmı geldiğinde bina ekibinin hangi işe önce bakacağını birlikte izleyelim.</p>
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
  return <section className="illustrated-beat agent-introduction" id="ajanlar" aria-labelledby="agents-title" data-caption-side="left">
    <StillScene />
    <div className="beat-pin"><div className="story-panel illustrated-card intro-card">
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
    </div></div>
  </section>
}

function ActionScene({ event, phase, replay }: { event: Event; phase: number; replay: () => void }) {
  const { execution } = event
  const steps = [execution.start, execution.running, execution.result]
  const side = event.key === 'drainage' ? 'left' : 'right'

  return <section className={'illustrated-beat action-scene action-' + side} id={execution.id} aria-labelledby={execution.id + '-title'} data-caption-side={side} data-phase={phase}>
    <StillScene event={event} />
    <div className="beat-pin"><div className="story-panel illustrated-card action-card motion-copy">
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
    </div></div>
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
    <div className="beat-pin"><div className="shell story-panel">
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
    </div></div>
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

function DepthPlate({ name, plate, canvas }: { name: DepthLayer; plate: (node: HTMLDivElement | null) => void; canvas: (node: HTMLCanvasElement | null) => void }) {
  const { resolution } = depthLayers[name]
  return <div className="incident-plate" data-layer={name} style={{ '--world-width': sceneWidth + 'px' } as CSSProperties} ref={plate}>
    <canvas ref={canvas} width={sceneWidth * resolution} height={sceneHeight * resolution} aria-hidden="true" />
  </div>
}

function Incident({ playing, children }: { playing: boolean; children: ReactNode }) {
  const section = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const viewfinder = useRef<HTMLDivElement>(null)
  const plate = useRef<HTMLDivElement>(null)
  const captions = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const layerPlates = useRef<Partial<Record<DepthLayer, HTMLDivElement | null>>>({})
  const layerCanvases = useRef<Partial<Record<DepthLayer, HTMLCanvasElement | null>>>({})
  const [layered] = useState(() => !lowPower)
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
    const layerContexts: Partial<Record<DepthLayer, CanvasRenderingContext2D>> = {}
    for (const name of layerNames) {
      const layer = layerCanvases.current[name]?.getContext('2d')
      if (!layer) continue
      const { resolution } = depthLayers[name]
      layer.setTransform(resolution, 0, 0, resolution, 0, 0)
      layerContexts[name] = layer
    }
    const hasLayers = Object.keys(layerContexts).length > 0
    const keepMid = new Set<DepthLayer>(['mid'])
    let midReady = false
    let mood: SceneMood | null = null
    const browserColor = document.querySelector('meta[name="theme-color"]')

    const notes = scenarios.map((event) => document.getElementById(event.id))
    const intro = document.getElementById('ajanlar')
    const actions = scenarios.map((event) => document.getElementById(event.execution.id))
    const captionsById = new Map([
      ['ihtiyac', { panel: captionRail.children[0], side: 'left' }],
      ...scenarios.map((event, index) => [event.id, { panel: captionRail.children[index + 1], side: event.placement }] as const),
    ] as const)
    const beats = cues.slice(1).map(({ id }) => {
      const node = document.getElementById(id)
      const floating = captionsById.get(id)
      return {
        node,
        panel: floating?.panel ?? node?.querySelector('.story-panel'),
        side: floating?.side ?? node?.dataset.captionSide ?? null,
        closingCamera: closingCameras[id],
        still: node?.classList.contains('static-beat') ?? false,
      }
    })
    const reduced = reducedMotion
    const stacked = window.matchMedia('(max-width: 767px)')

    // Beats whose card fits on screen get extra scroll room with the card pinned,
    // so the story holds still for a moment before the next change.
    const pinned = beats.flatMap(({ node, panel }) => {
      const pin = node?.querySelector(':scope > .beat-pin')
      return node && pin && panel instanceof HTMLElement ? [{ node, panel }] : []
    })
    function updateDwell() {
      const header = document.querySelector('header')?.offsetHeight ?? 0
      const room = window.innerHeight - header - 2 * pace.dwellRoom
      for (const { node, panel } of pinned) {
        node.toggleAttribute('data-dwell', !reduced.matches && panel.offsetHeight <= room)
      }
      needsDraw = true
    }
    const panelSizes = new ResizeObserver(updateDwell)
    for (const { panel } of pinned) panelSizes.observe(panel)
    let visible = false
    let lastDraw = -Infinity
    let needsDraw = true
    let displayedBeat = -1
    let panelOpacity = 0
    let rendered: [number, number, number] | null = null
    let cameraVelocity: [number, number, number] = [0, 0, 0]
    let cameraArrived = true
    let cardWaitStarted = 0
    let actionIndex = -1
    let phase = 0
    let elapsed = 0
    let timedAction = false
    let drawingAction: Neighborhood['action']
    let weatherState: [number, number, number] | undefined

    function draw(time: number) {
      if (!needsDraw && (!visible || reduced.matches)) return
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
          : ease(clamp((edges[desiredBeat] - viewport * .035) / (viewport * pace.cardFadeDistance)))

        if (!reduced.matches) {
          if (panelOpacity === 0 && displayedBeat !== desiredBeat) {
            displayedBeat = desiredBeat
            cardWaitStarted = time
          }
          // A new card waits until the camera has reached its subject.
          const cameraReady = panelOpacity > 0 || cameraArrived || time - cardWaitStarted > pace.cardWaitMax
          const target = displayedBeat === desiredBeat && cameraReady ? desiredOpacity : 0
          const step = Math.min(45, Math.max(0, delta)) / (target < panelOpacity ? pace.cardOut : pace.cardIn)
          panelOpacity += Math.sign(target - panelOpacity) * Math.min(Math.abs(target - panelOpacity), step)
        }
        beats.forEach(({ panel }, index) => {
          if (!(panel instanceof HTMLElement)) return
          const showing = !reduced.matches && index === displayedBeat && panelOpacity > .001
          panel.style.setProperty('--panel-opacity', showing ? String(ease(panelOpacity)) : '0')
          panel.style.setProperty('--panel-offset', showing ? (1 - ease(panelOpacity)) * 16 + 'px' : '16px')
          panel.toggleAttribute('data-visible', showing)
          panel.inert = !reduced.matches && !showing
        })

        const subject = beats[desiredBeat]?.node
        const shown = beats[displayedBeat]
        const focus = shown?.side === null ? ease(panelOpacity) * (shown.closingCamera && !shown.still ? .94 : 1) : 0
        const progress = notes.map((node) => {
          const span = Math.max(viewport * .66, (node?.offsetHeight ?? viewport) - viewport * .63)
          return ease(clamp((viewport * .24 - distance(node)) / span))
        })

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
        const closingCamera = beats[desiredBeat]?.closingCamera
        if (closingCamera) camera = closingCamera
        else if (introducing) camera = introductionCamera
        else if (actionCamera >= 0) camera = scenarios[actionCamera].execution.camera
        const [x, y, zoom, [left, top, right, bottom]] = camera
        if (reduced.matches) {
          drawing.style.transform = ''
          for (const name of layerNames) layerPlates.current[name]?.style.removeProperty('transform')
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
          const goal: [number, number, number] = [translateX, translateY, scale]
          if (rendered) {
            const seconds = Math.min(.05, Math.max(0, delta) / 1000)
            const previous = rendered
            const moved = goal.map((value, axis) => glide(previous[axis], value, cameraVelocity[axis], pace.cameraSmoothing, seconds))
            rendered = [moved[0][0], moved[1][0], moved[2][0]]
            cameraVelocity = [moved[0][1], moved[1][1], moved[2][1]]
          } else rendered = goal
          // Distance left, in screen pixels, including what the zoom still has to do.
          const remaining = Math.hypot(goal[0] - rendered[0], goal[1] - rendered[1]) + Math.abs(goal[2] - rendered[2]) * width
          cameraArrived = remaining < pace.cameraSettled
          const [renderedX, renderedY, renderedScale] = rendered
          drawing.style.transform = 'translate3d(' + renderedX + 'px,' + renderedY + 'px,0) scale(' + renderedScale + ')'
          // Layers further back trail the camera, the rain layer leads it.
          const centre = (width / 2 - renderedX) / renderedScale
          for (const name of layerNames) {
            const layerPlate = layerPlates.current[name]
            if (!layerPlate) continue
            const shift = (centre - parallaxAnchor) * (1 - depthLayers[name].parallax) * renderedScale
            layerPlate.style.transform = 'translate3d(' + (renderedX + shift) + 'px,' + renderedY + 'px,0) scale(' + renderedScale + ')'
          }
        }

        const visualAction = scenarios[actionCamera]
        const fadeStep = Math.min(55, Math.max(0, delta))
        if (!drawingAction && visualAction) {
          drawingAction = { key: visualAction.key, progress: 0, reveal: 0, time: 0 }
        }
        if (drawingAction) {
          if (drawingAction.key === visualAction?.key) {
            drawingAction.reveal = clamp((drawingAction.reveal ?? 0) + fadeStep / 760)
            drawingAction.progress = actionIndex === actionCamera ? actionProgress : 0
            drawingAction.time = actionIndex === actionCamera ? elapsed / 1000 : 0
          } else {
            drawingAction.reveal = clamp((drawingAction.reveal ?? 0) - fadeStep / 590)
            if (drawingAction.reveal === 0) drawingAction = undefined
          }
        }
        const weatherBlend = 1 - Math.exp(-Math.max(0, delta) / pace.weather)
        weatherState = [
          (weatherState?.[0] ?? progress[0]) * (1 - weatherBlend) + progress[0] * weatherBlend,
          (weatherState?.[1] ?? progress[1]) * (1 - weatherBlend) + progress[1] * weatherBlend,
          (weatherState?.[2] ?? progress[2]) * (1 - weatherBlend) + progress[2] * weatherBlend,
        ]
        const [rain, clear, dusk] = weatherState
        const nextMood: SceneMood = desiredBeat < 0 || desiredBeat >= closingBeat ? 'calm'
          : dusk > .45 ? 'alarm' : clear > .45 ? 'clear' : rain > .45 ? 'rain' : 'calm'
        if (nextMood !== mood) {
          mood = nextMood
          document.documentElement.dataset.scene = mood
          browserColor?.setAttribute('content', browserColors[mood])
        }
        const state: Neighborhood = { rain, clear, dusk, time: time / 1000, moving: focus < .999 || !shown?.still }
        const afterDrainage = actions[0] && distance(actions[0]) < -actions[0].offsetHeight * .25
        state.drained = Boolean(afterDrainage)
        const afterSupport = actions[1] && distance(actions[1]) < -actions[1].offsetHeight * .25
        state.supported = Boolean(afterSupport)
        state.introduce = shown?.node === intro ? ease(panelOpacity) : 0
        state.action = drawingAction
        if (reduced.matches) drawNeighborhood(context, { rain: 0, clear: 0, dusk: 0, time: 0, moving: false })
        else if (hasLayers) {
          // The neighbouring blocks never change, so the mid layer is drawn once.
          drawNeighborhood({ main: context, ...layerContexts, keep: midReady ? keepMid : undefined }, state)
          midReady = true
        } else drawNeighborhood(context, state)
        graphic.style.setProperty('--focus', String(focus))
        needsDraw = false
        lastDraw = time
      }
    }

    function refresh() {
      needsDraw = true
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      refresh()
    })
    observer.observe(root)
    window.addEventListener('scroll', refresh, { passive: true })
    window.addEventListener('resize', refresh)
    window.addEventListener('resize', updateDwell)
    reduced.addEventListener('change', refresh)
    reduced.addEventListener('change', updateDwell)
    const stop = onFrame(draw, 2)

    return () => {
      observer.disconnect()
      panelSizes.disconnect()
      window.removeEventListener('resize', updateDwell)
      reduced.removeEventListener('change', updateDwell)
      stop()
      delete document.documentElement.dataset.scene
      browserColor?.setAttribute('content', browserColors.calm)
      window.removeEventListener('scroll', refresh)
      window.removeEventListener('resize', refresh)
      reduced.removeEventListener('change', refresh)
    }
  }, [])

  return <div className="incident" ref={section} aria-label="A Blok · Aynı mahallede bir gün">
    <div className="incident-stage" ref={stage}>
      <div className="incident-viewfinder" ref={viewfinder} role="img"
        aria-label="Sokak, komşu binalar, park, araçlar ve A Blok’un üç pompalı bodrumunu gösteren mahalle kesiti">
        {layered && layerNames.filter((name) => name !== 'front').map((name) => <DepthPlate key={name} name={name}
          plate={(node) => { layerPlates.current[name] = node }} canvas={(node) => { layerCanvases.current[name] = node }} />)}
        <div className="incident-plate" style={{ '--world-width': sceneWidth + 'px' } as CSSProperties} ref={plate}>
          <canvas ref={canvas} width={sceneWidth * sceneResolution} height={sceneHeight * sceneResolution} aria-hidden="true" />
        </div>
        {layered && <DepthPlate name="front"
          plate={(node) => { layerPlates.current.front = node }} canvas={(node) => { layerCanvases.current.front = node }} />}
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
      <BuildingCase />
      <AgentIntroduction />
      {scenarios.map((event, index) => <div key={event.id}>
        <section className="incident-note" id={event.id} aria-label={event.title}>
          <div className="static-caption shell"><IncidentNote event={event} /></div>
        </section>
        <Decision event={event} />
        <ActionScene event={event} phase={actionPhases[index]}
          replay={() => {
            restart.current = event.execution.id
            const scene = document.getElementById(event.execution.id)
            if (scene) scrollToElement(scene, true)
          }} />
      </div>)}
      {children}
    </div>
  </div>
}

export function Journey({ playing, children }: { playing: boolean; children: ReactNode }) {
  return <>
    <Opening />
    <Incident playing={playing}>{children}</Incident>
  </>
}
