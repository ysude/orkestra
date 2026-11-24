import { useEffect, useRef, useState } from 'react'
import { onFrame, reducedMotion, scrollToY } from './motion'
import { cues, presentationSeconds } from './story'

const clamp = (value: number) => Math.max(0, Math.min(1, value))
const ease = (value: number) => value * value * (3 - 2 * value)

const transition = 2.2 // s gliding from one beat to the next
const hold = 2         // s held still at the end of a beat that moves
const settle = .9      // s gliding from where the reader was to where the presentation is

// Inverse of `ease`, to turn a scroll position back into presentation time.
function unease(value: number) {
  let low = 0
  let high = 1
  for (let step = 0; step < 14; step++) {
    const middle = (low + high) / 2
    if (ease(middle) < value) low = middle
    else high = middle
  }
  return (low + high) / 2
}

const span = (index: number) => Math.max(1, (cues[index + 1]?.start ?? presentationSeconds) - cues[index].start - transition - hold)

function measure() {
  const header = document.querySelector('header')
  const top = header?.getBoundingClientRect().height ?? 0
  return cues.map((cue) => {
    const node = document.getElementById(cue.id)
    const start = node ? node.getBoundingClientRect().top + window.scrollY - top : 0
    // Beats that move, and beats with a pinned card, are scrolled through rather than parked at their top.
    const moves = node && (cue.motion || node.hasAttribute('data-dwell'))
    return { start: Math.max(0, start), travel: moves ? Math.max(0, node.offsetHeight - window.innerHeight + top) : 0 }
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
    const motionPosition = positions[current]
    const manualTime = cue.start + (motionPosition.travel > 0
      ? transition + unease(clamp((scroll - motionPosition.start) / motionPosition.travel)) * span(current)
      : 0)
    const resumesCheckpoint = Math.abs(prior.scroll - scroll) < 8
    const resume = resumesCheckpoint ? prior.time : manualTime
    // Starting over skips the title and opens straight on the neighbourhood.
    const restart = resume >= presentationSeconds
    const initial = restart ? cues[1].start : resume
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
      const transitioning = since < transition && previous && !reduced.matches &&
        (initial < active.start || (resumesCheckpoint && prior.transitioning))
      const scheduled = transitioning
        ? previous.start + previous.travel + (location.start - previous.start - previous.travel) * ease(clamp(since / transition))
        : location.start + (reduced.matches ? 0 : location.travel * ease(clamp((since - transition) / span(index))))
      // Starting away from the scheduled spot glides there instead of jumping.
      const arrival = resumesCheckpoint || restart || reduced.matches ? 1 : ease(clamp(elapsed / 1000 / settle))
      const goal = scroll + (scheduled - scroll) * arrival
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
