import { useEffect, useRef, useState } from 'react'
import { onFrame, reducedMotion, scrollToY } from './motion'
import { cues, presentationSeconds } from './story'

const clamp = (value: number) => Math.max(0, Math.min(1, value))
const ease = (value: number) => value * value * (3 - 2 * value)

function measure() {
  const header = document.querySelector('header')
  const top = header?.getBoundingClientRect().height ?? 0
  return cues.map((cue) => {
    const node = document.getElementById(cue.id)
    const start = node ? node.getBoundingClientRect().top + window.scrollY - top : 0
    return { start: Math.max(0, start), travel: cue.motion && node ? Math.max(0, node.offsetHeight - window.innerHeight + top) : 0 }
  })
}

export function usePresentation() {
  const checkpoint = useRef({ time: 0, scroll: 0, transitioning: false })
  const [playing, setPlaying] = useState(false)
  const [second, setSecond] = useState<number | null>(null)

  useEffect(() => {
    if (!playing) return

    let positions = measure()
    const reduced = reducedMotion
    const prior = checkpoint.current
    const scroll = window.scrollY
    const current = Math.max(0, positions.findLastIndex((position) => position.start <= scroll + 5))
    const cue = cues[current]
    const next = cues[current + 1]?.start ?? presentationSeconds
    const motionPosition = positions[current]
    const manualTime = cue.start + (motionPosition.travel > 0
      ? clamp((scroll - motionPosition.start) / motionPosition.travel) * (next - cue.start - 2)
      : 0)
    const resumesCheckpoint = Math.abs(prior.scroll - scroll) < 8
    const resume = resumesCheckpoint ? prior.time : manualTime
    const initial = resume >= presentationSeconds ? 0 : resume
    const started = performance.now()
    const wallStarted = Date.now()
    let finished = false

    function advance(now: number) {
      if (finished) return
      const elapsed = Math.max(0, now - started, Date.now() - wallStarted)
      const time = Math.min(presentationSeconds, initial + elapsed / 1000)
      const index = cues.findLastIndex((entry) => entry.start <= time)
      const active = cues[index]
      const location = positions[index]
      const previous = positions[index - 1]
      const since = time - active.start
      const duration = (cues[index + 1]?.start ?? presentationSeconds) - active.start
      const transitioning = since < 1.75 && previous && !reduced.matches &&
        (initial < active.start || (resumesCheckpoint && prior.transitioning))
      const goal = transitioning
        ? previous.start + previous.travel + (location.start - previous.start - previous.travel) * ease(clamp(since / 1.75))
        : location.start + (reduced.matches ? 0 : location.travel * ease(clamp((since - 1.75) / Math.max(1, duration - 3.75))))
      if (Math.abs(window.scrollY - goal) >= 1) scrollToY(goal)

      checkpoint.current = { time, scroll: window.scrollY, transitioning: Boolean(transitioning) }
      const whole = Math.floor(time)
      setSecond((previousSecond) => previousSecond === whole ? previousSecond : whole)

      if (time >= presentationSeconds) {
        finished = true
        setPlaying(false)
      }
    }

    function pause() { setPlaying(false) }
    function pauseOnPointer(event: PointerEvent) {
      const target = event.target
      if (!(target instanceof Element) || target.closest('.presentation-toggle')) return
      if (event.pointerType === 'touch' || target.closest('a,button,summary')) pause()
    }
    function pauseOnKey(event: KeyboardEvent) {
      if (event.defaultPrevented || (event.target instanceof Element && event.target.closest('.presentation-toggle') &&
        [' ', 'Enter'].includes(event.key))) return
      if (['ArrowDown', 'ArrowUp', 'End', 'Home', 'PageDown', 'PageUp', ' ', 'Tab'].includes(event.key)) pause()
    }
    function resize() { positions = measure() }

    const layout = new ResizeObserver(resize)
    for (const { id } of cues) {
      const section = document.getElementById(id)
      if (section) layout.observe(section)
    }
    const stop = onFrame(advance, 1)
    window.addEventListener('wheel', pause, { passive: true })
    window.addEventListener('pointerdown', pauseOnPointer)
    window.addEventListener('keydown', pauseOnKey)
    window.addEventListener('resize', resize)
    return () => {
      layout.disconnect()
      stop()
      window.removeEventListener('wheel', pause)
      window.removeEventListener('pointerdown', pauseOnPointer)
      window.removeEventListener('keydown', pauseOnKey)
      window.removeEventListener('resize', resize)
    }
  }, [playing])

  function toggle() {
    if (playing) {
      scrollToY(checkpoint.current.scroll)
    }
    setPlaying(!playing)
  }

  return { playing, second, toggle, pause: () => setPlaying(false) }
}
