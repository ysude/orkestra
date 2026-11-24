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

const span = (duration: number) => Math.max(1, duration - transition - hold)

function measure() {
  const header = document.querySelector('header')
  const top = header?.getBoundingClientRect().height ?? 0
  const viewport = Math.max(1, window.innerHeight - top)
  return cues.map(({ id }) => {
    const node = document.getElementById(id)
    const start = node ? node.getBoundingClientRect().top + window.scrollY - top : 0
    const pin = node?.hasAttribute('data-dwell') ? node.querySelector<HTMLElement>(':scope > .beat-pin') : null
    const height = Math.max(1, pin?.offsetHeight ?? node?.offsetHeight ?? 0)
    const travel = Math.max(0, (node?.offsetHeight ?? 0) - viewport)
    return { start: Math.max(0, start), height, travel, pages: Math.max(1, Math.ceil(travel / viewport)) }
  })
}

function schedule(positions: ReturnType<typeof measure>) {
  const extraSeconds = presentationSeconds - cues.reduce((total, cue) => total + cue.minimumSeconds, 0)
  const totalHeight = positions.slice(1).reduce((total, position) => total + position.height, 0)
  let minimumStart = 0
  let height = 0

  return cues.map((cue, index) => {
    // Round cumulative time so the extra seconds add up to the exact total.
    const start = minimumStart + Math.round(extraSeconds * height / totalHeight)
    minimumStart += cue.minimumSeconds
    if (index > 0) height += positions[index].height
    return start
  })
}

type Playback = { second: number; section: string; sectionProgress: number }

export function usePresentation() {
  const checkpoint = useRef({ time: 0, scroll: 0, transitioning: false, skipOpening: false })
  const timeline = useRef<number[] | null>(null)
  const [playing, setPlaying] = useState(false)
  const [playback, setPlayback] = useState<Playback | null>(null)

  useEffect(() => {
    if (!playing) return

    let positions = measure()
    const reduced = reducedMotion
    const prior = checkpoint.current
    const scroll = window.scrollY
    const restart = prior.time >= presentationSeconds
    // Changing tabs or resizing changes scroll positions; the running clock keeps its schedule.
    if (!timeline.current || restart) timeline.current = schedule(positions)
    const starts = timeline.current
    const duration = (index: number) => (starts[index + 1] ?? presentationSeconds) - starts[index]
    const current = Math.max(0, positions.findLastIndex((position) => position.start <= scroll + 5))
    const motionPosition = positions[current]
    const manualTime = starts[current] + (current > 0 && motionPosition.travel > 0
      ? transition + unease(clamp((scroll - motionPosition.start) / motionPosition.travel)) * span(duration(current))
      : 0)
    const resumesCheckpoint = Math.abs(prior.scroll - scroll) < 8
    const skipOpening = restart || (resumesCheckpoint && prior.skipOpening)
    const initial = restart ? 0 : resumesCheckpoint ? prior.time : manualTime
    const started = performance.now()
    const wallStarted = Date.now()
    let finished = false

    function advance(now: number) {
      if (finished) return
      const elapsed = Math.max(0, now - started, Date.now() - wallStarted)
      const time = Math.min(presentationSeconds, initial + elapsed / 1000)
      const index = Math.max(skipOpening ? 1 : 0, starts.findLastIndex((start) => start <= time))
      const location = positions[index]
      const previous = positions[index - 1]
      const since = Math.max(0, time - starts[index])
      const transitioning = since < transition && previous && !reduced.matches &&
        !(skipOpening && index === 1) && (initial < starts[index] || (resumesCheckpoint && prior.transitioning))
      const progress = clamp((since - transition) / span(duration(index)))
      const travelProgress = reduced.matches ? Math.floor(progress * location.pages) / location.pages : ease(progress)
      const scheduled = transitioning
        ? previous.start + previous.travel + (location.start - previous.start - previous.travel) * ease(clamp(since / transition))
        : location.start + location.travel * travelProgress
      // Starting away from the scheduled spot glides there instead of jumping.
      const arrival = resumesCheckpoint || restart || reduced.matches ? 1 : ease(clamp(elapsed / 1000 / settle))
      const goal = scroll + (scheduled - scroll) * arrival
      if (Math.abs(window.scrollY - goal) >= 1) scrollToY(goal)

      checkpoint.current = { time, scroll: window.scrollY, transitioning: Boolean(transitioning), skipOpening }
      const whole = Math.floor(time)
      setPlayback((previousPlayback) => previousPlayback?.second === whole ? previousPlayback : {
        second: whole,
        section: cues[index].id,
        sectionProgress: clamp((whole - starts[index]) / duration(index)),
      })

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

  return { playing, second: playback?.second ?? null, playback, toggle, pause: () => setPlaying(false) }
}
