import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react'
import { SceneArt } from './SceneArt'

const shots = [
  {
    id: 'baslangic', art: 'hero', caption: 'A Blok · 18.00',
    title: 'Yağmur başladı.',
    copy: 'Bir apartmanın su düzeni bodrumdaki üç ayrı sisteme bağlı. Sağanak geldiğinde bina kendi durumunu nasıl anlar?',
  },
  {
    id: 'senaryo', art: 'room', caption: 'Bodrum · Üç pompa sistemi',
    title: 'Aşağıda üç ayrı dünya.',
    copy: 'Yangın seti hazır bekler. Hidrofor dairelere su basar. Atık su pompası kuyuyu boşaltır. Her sistemin kendi ölçümü, geçmişi ve ajanı var.',
  },
  {
    id: 'saganak', art: 'storm', caption: 'Sağanak · Örnek veri',
    title: 'Kuyu yükseliyor.',
    copy: 'Kuyu seviyesi %78’e çıkar. Atık su ajanı, binanın bu saatlerdeki olağan %35–50 aralığından sapmayı fark eder.',
  },
  {
    id: 'ortak-karar', art: 'coordination', caption: 'Şef ajan · Örnek olay',
    title: 'Üç sinyal. Tek karar.',
    copy: 'Hidrofor normal, yangın paneli hazır, kuyu seviyesi yüksek. Şef ajan bunları tek olayda birleştirir ve teknisyene kuyu ile şamandırayı kontrol etmesini önerir.',
  },
] as const

const timelineEnd = 3.45

const clamp = (value: number) => Math.max(0, Math.min(1, value))
const ease = (value: number) => value * value * (3 - 2 * value)

export function Film() {
  const track = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const shotNodes = useRef<(HTMLElement | null)[]>([])
  const position = useRef(0)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const reel = track.current
    const viewport = stage.current
    if (!reel || !viewport) return

    let frame = 0

    function update() {
      if (!reel || !viewport) return

      const distance = reel.offsetHeight - viewport.offsetHeight
      const progress = distance > 0 ? clamp(-reel.getBoundingClientRect().top / distance) : 0
      const current = progress * timelineEnd
      position.current = current
      let selected = 0

      shotNodes.current.forEach((shot, index) => {
        if (!shot) return

        const arrival = index === 0 ? 1 : ease(clamp((current - index + .70) / .58))
        const exit = index === shots.length - 1 ? 0 : ease(clamp((current - index - .38) / .58))
        const alpha = arrival * (1 - exit)
        const travel = index === 0 ? -exit * 38 : (1 - arrival) * 38 - exit * 24
        const camera = index === 0 ? 1 + clamp(current) * .67 : 1 + clamp(current - index) * .19

        if (alpha > .5) selected = index
        shot.style.setProperty('--opacity', String(alpha))
        shot.style.setProperty('--travel', travel + '%')
        shot.style.setProperty('--camera', String(camera))
        shot.style.setProperty('--depth', (1 - arrival) * 24 + '%')
      })

      viewport.style.setProperty('--film-progress', progress + '')
      setActive(selected)
    }

    function schedule() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
    }
  }, [])

  return <section className="film" id="baslangic" ref={track} aria-label="Orkestra sağanak hikâyesi">
    <div className="film-markers" aria-hidden="true">
      {shots.map((shot, index) => <span key={shot.id} id={index === 0 ? undefined : shot.id}
        style={{ top: (index / timelineEnd) * 100 + '%' }} />)}
    </div>
    <div className="film-stage" ref={stage}>
      {shots.map((shot, index) => <article key={shot.id} className={'film-shot film-' + shot.art}
        ref={(element) => { shotNodes.current[index] = element }}>
        <div className="film-art"><SceneArt scene={shot.art} scrollPosition={position}
          shotIndex={index} playing={Math.abs(index - active) <= 1} /></div>
        <div className="film-copy">
          <p className="film-caption">{shot.caption}</p>
          {index === 0 ? <h1>{shot.title}</h1> : <h2>{shot.title}</h2>}
          <p className="film-dialogue">{shot.copy}</p>
        </div>
      </article>)}
      <div className="film-top">
        <a className="film-brand" href="#baslangic" aria-label="Orkestra, hikâyeyi yeniden başlat">Orkestra<span>.</span></a>
        <a className="film-skip" href="#gorunumler">Hikâyeyi geç <ArrowRight size={16} /></a>
      </div>
      <div className="film-controls">
        <nav className="film-nav" aria-label="Hikâye sahneleri">
          {active > 0 && <a className="film-previous" aria-label="Önceki sahne"
            href={'#' + shots[active - 1].id}><ArrowLeft size={18} /></a>}
          {shots.map((shot, index) => <a className="film-step" key={shot.id} href={'#' + shot.id} aria-label={shot.caption}
            aria-current={index === active ? 'step' : undefined} />)}
        </nav>
        <a className="film-next" href={active < shots.length - 1 ? '#' + shots[active + 1].id : '#gorunumler'}>
          {active < shots.length - 1 ? 'Kaydır veya ilerle' : 'Arayüzleri aç'} <ArrowDown size={18} />
        </a>
      </div>
      <div className="film-progress" aria-hidden="true" />
    </div>
  </section>
}
