import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowDown, Droplets, Flame, Gauge, GitMerge, Waves } from 'lucide-react'
import { pumps } from './content'

export const presentationSeconds = 180

const clamp = (value: number) => Math.max(0, Math.min(1, value))
const ease = (value: number) => value * value * (3 - 2 * value)
const pumpIcons = { fire: Flame, pressure: Gauge, drainage: Waves }

export function usePresentation() {
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return
    const ending = document.getElementById('kanvas')
    if (!ending) return

    const finish = window.scrollY + ending.getBoundingClientRect().top - 76
    const origin = window.scrollY >= finish - 4 ? 0 : window.scrollY
    const remaining = Math.max(1, presentationSeconds * 1000 * (finish - origin) / finish)
    const started = performance.now()
    let frame = 0

    function advance(now: number) {
      const progress = clamp((now - started) / remaining)
      window.scrollTo({ top: origin + (finish - origin) * progress, behavior: 'instant' })
      if (progress < 1) frame = requestAnimationFrame(advance)
      else setPlaying(false)
    }

    function pause() { setPlaying(false) }
    function pauseOnPointer(event: PointerEvent) {
      const target = event.target
      if (target instanceof Element && target.closest('.presentation-toggle')) return
      if (event.pointerType === 'touch' || (target instanceof Element && target.closest('a,button,summary'))) pause()
    }
    function pauseOnKey(event: KeyboardEvent) {
      if (['ArrowDown', 'ArrowUp', 'End', 'Home', 'PageDown', 'PageUp', ' '].includes(event.key)) pause()
    }

    frame = requestAnimationFrame(advance)
    window.addEventListener('wheel', pause, { passive: true })
    window.addEventListener('pointerdown', pauseOnPointer)
    window.addEventListener('keydown', pauseOnKey)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('wheel', pause)
      window.removeEventListener('pointerdown', pauseOnPointer)
      window.removeEventListener('keydown', pauseOnKey)
    }
  }, [playing])

  return { playing, toggle: () => setPlaying((current) => !current), pause: () => setPlaying(false) }
}

export function Journey({ children }: { children: ReactNode }) {
  const journey = useRef<HTMLDivElement>(null)
  const world = useRef<HTMLDivElement>(null)
  const weather = useRef<HTMLCanvasElement>(null)
  const rainScene = useRef<HTMLElement>(null)
  const agents = useRef<HTMLElement>(null)
  const readout = useRef<HTMLOutputElement>(null)

  useEffect(() => {
    const root = journey.current
    const scene = world.current
    const canvas = weather.current
    const ctx = canvas?.getContext('2d')
    if (!root || !scene || !canvas || !ctx) return

    const context = ctx
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const width = canvas.width
    const height = canvas.height
    let frame = 0
    let camera = 0
    let water = 0
    let signals = 0
    let inView = true

    function render(now: number) {
      if (!root || !scene) return

      const viewport = window.innerHeight
      const origin = root.getBoundingClientRect().top
      const rainTop = rainScene.current?.getBoundingClientRect().top ?? viewport
      const agentTop = agents.current?.getBoundingClientRect().top ?? viewport
      const descent = ease(clamp((-origin + viewport * .08) / (viewport * 1.2)))
      const rise = ease(clamp((viewport * .94 - rainTop) / (viewport * .95)))
      const coordination = ease(clamp((viewport * .9 - agentTop) / (viewport * .56)))

      camera += (descent - camera) * .17
      water += (rise - water) * .12
      signals += (coordination - signals) * .16

      if (reduced.matches) {
        camera = descent
        water = rise
        signals = coordination
      }

      scene.style.setProperty('--descent', camera.toFixed(4))
      scene.style.setProperty('--water', water.toFixed(4))
      scene.style.setProperty('--signals', signals.toFixed(4))

      const percent = '%' + Math.round(36 + water * 42)
      if (readout.current && readout.current.textContent !== percent) readout.current.textContent = percent

      context.clearRect(0, 0, width, height)
      context.lineCap = 'round'
      if (!reduced.matches) {
        const time = now * .001
        const count = Math.floor(64 + water * 81)
        context.lineWidth = 1
        context.strokeStyle = 'rgba(230, 250, 254, .57)'
        context.beginPath()
        for (let index = 0; index < count; index++) {
          const x = (index * 137.47 + 19) % width
          const y = (index * 47.39 + time * (275 + index % 9 * 28)) % 536
          context.moveTo(x, y)
          context.lineTo(x - 3, Math.min(536, y + 12 + index % 14))
        }
        context.stroke()

        if (signals > .01) {
          const sources = [607, 878, 1177]
          const target = 1250
          context.strokeStyle = 'rgba(132, 255, 224,' + signals * .7 + ')'
          context.lineWidth = 2
          for (const source of sources) {
            context.beginPath()
            context.moveTo(source, 714)
            context.lineTo(source, 639)
            context.lineTo(target, 639)
            context.stroke()

            const distance = 75 + target - source
            const offset = source * .009
            for (let dot = 0; dot < 3; dot++) {
              const position = (time * 103 + offset + dot * distance / 3) % distance
              const x = source + Math.max(0, position - 75)
              const y = 714 - Math.min(position, 75)
              context.beginPath()
              context.arc(x, y, 4, 0, Math.PI * 2)
              context.fillStyle = 'rgba(196,255,239,' + signals + ')'
              context.fill()
            }
          }
        }
      }
      if (inView && !reduced.matches) frame = requestAnimationFrame(render)
    }

    function refresh() {
      cancelAnimationFrame(frame)
      if (inView) frame = requestAnimationFrame(render)
    }

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      refresh()
    })
    observer.observe(root)
    window.addEventListener('scroll', refresh, { passive: true })
    window.addEventListener('resize', refresh)
    reduced.addEventListener('change', refresh)
    refresh()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', refresh)
      window.removeEventListener('resize', refresh)
      reduced.removeEventListener('change', refresh)
    }
  }, [])

  return <div className="journey" ref={journey} id="baslangic">
    <div className="environment" aria-hidden="true">
      <div className="world" ref={world}>
        <img src="/orkestra-kesit.jpg" alt="" fetchPriority="high" width="1536" height="1024" />
        <div className="well-water" />
        <canvas width={1536} height={1024} ref={weather} />
        <span className="world-label label-fire">Yangın</span>
        <span className="world-label label-pressure">Hidrofor</span>
        <span className="world-label label-drainage">Atık su</span>
        <span className="world-label label-coordinator">Şef ajan</span>
      </div>
    </div>
    <div className="journey-content">
      <section className="journey-chapter introduction" aria-labelledby="introduction-title">
        <div className="shell">
          <p className="eyebrow">Water AI Hackathon · Prometheus</p>
          <h1 id="introduction-title">Orkestra</h1>
          <div className="opening-note">
            <h2>Yağmur başladığında bodrumda ne oluyor?</h2>
            <p>Yangın, hidrofor ve atık su pompaları ayrı çalışıyor. Orkestra, her birinin ölçümünü birleştirerek binanın su durumunu ortaya çıkarıyor.</p>
            <a className="journey-link" href="#saganak">Bodruma in <ArrowDown size={16} /></a>
          </div>
        </div>
      </section>
      <section className="journey-chapter story-chapter" id="saganak" ref={rainScene} aria-labelledby="weather-title">
        <div className="shell">
          <article className="story-note">
            <p className="eyebrow"><Droplets size={16} /> A Blok · Sağanak · Örnek olay</p>
            <h2 id="weather-title">Yağmur suyu kuyuda birikiyor.</h2>
            <p>Yağmur hızlanıyor. Bodrumdaki atık su kuyusu dolmaya başlıyor. Orkestra, seviyeyi bu binanın geçmişinde aynı saatlerde görülen %35–50 aralığıyla karşılaştırıyor.</p>
            <div className="story-readout"><span>Kuyu seviyesi</span><output ref={readout} aria-live="off">%36</output></div>
            <p>Kuyu %78’e ulaştığında atık su ajanı sapmayı şef ajana bildiriyor. Binanın diğer iki sisteminin durumu da aynı anda değerlendiriliyor.</p>
          </article>
        </div>
      </section>
      <section className="journey-chapter story-chapter agent-chapter" id="ortak-karar" ref={agents} aria-labelledby="agent-title">
        <div className="shell">
          <article className="story-note">
            <p className="eyebrow"><GitMerge size={16} /> Dijital ikiz · Örnek olay</p>
            <h2 id="agent-title">Üç pompa, tek değerlendirme.</h2>
            <p>Pompa ajanları kendi ölçümlerini ve geçmişlerini takip ediyor. Şef ajan, ayrı bulguların aynı bina için ne anlama geldiğini birleştiriyor.</p>
            <ul className="agent-evidence">
              {pumps.map((pump) => {
                const Icon = pumpIcons[pump.type]
                return <li key={pump.id} className={pump.type}>
                  <Icon size={18} /><div><strong>{pump.name} · {pump.reading}</strong><p>{pump.observation}</p></div>
                </li>
              })}
            </ul>
            <div className="story-result"><strong>Teknisyene öneri</strong><p>Kuyuyu ve şamandırayı kontrol edin. Örnek olayda hidrofor basıncı olağan aralıkta, yangın paneli hazır.</p></div>
          </article>
        </div>
      </section>
      {children}
    </div>
  </div>
}
