import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

// One requestAnimationFrame loop for the whole page. Lenis advances first,
// then every task in `order`, so the presentation can move the page before
// the scene reads the layout in the same frame.

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

// Same heuristic itumantar uses: touch-first or few cores gets the lighter path.
export const lowPower = window.matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency || 8) <= 4

// Pacing for every scroll-driven change, in one place. A beat change runs in
// order: the old card fades out, the camera glides, then the new card fades in.
export const pace = {
  scrollLerp: .09,       // higher = shorter glide after the wheel stops
  wheelMultiplier: .55,  // distance per wheel or trackpad step
  cardOut: 260,          // ms for a full fade out
  cardIn: 460,           // ms for a full fade in
  cardFadeDistance: .26, // share of the viewport scrolled while a card fades with scroll
  cardWaitMax: 700,      // ms a card waits for the camera before fading in anyway
  cameraSmoothing: .3,   // s, critically damped camera glide (settles in about 1 s)
  cameraSettled: 24,     // px left to travel when the camera counts as arrived
  weather: 650,          // ms for rain, sun and dusk to catch up with scroll
  dwellRoom: 16,         // px a pinned card needs to spare inside the viewport
}

// Critically damped approach (Unity's SmoothDamp): starts gently, never overshoots.
export function glide(current: number, target: number, velocity: number, smoothing: number, seconds: number): [number, number] {
  const omega = 2 / smoothing
  const x = omega * seconds
  const decay = 1 / (1 + x + .48 * x * x + .235 * x * x * x)
  const change = current - target
  const temp = (velocity + omega * change) * seconds
  return [target + (change + temp) * decay, (velocity - omega * temp) * decay]
}

type Task = { order: number; run: (time: number) => void }

const tasks: Task[] = []
let lenis: Lenis | null = null
let frame = 0

function tick(time: number) {
  lenis?.raf(time)
  for (const task of [...tasks]) task.run(time)
  frame = tasks.length || lenis ? requestAnimationFrame(tick) : 0
}

function wake() {
  if (!frame) frame = requestAnimationFrame(tick)
}

export function onFrame(run: Task['run'], order = 0) {
  const task = { order, run }
  tasks.push(task)
  tasks.sort((first, second) => first.order - second.order)
  wake()
  return () => {
    const index = tasks.indexOf(task)
    if (index >= 0) tasks.splice(index, 1)
  }
}

function syncLenis() {
  if (reducedMotion.matches) {
    lenis?.destroy()
    lenis = null
    return
  }
  if (lenis) return
  lenis = new Lenis({ autoRaf: false, lerp: pace.scrollLerp, wheelMultiplier: pace.wheelMultiplier, anchors: false })
  wake()
}

function headerOffset() {
  return document.querySelector('header')?.getBoundingClientRect().height ?? 0
}

export function scrollToY(top: number) {
  if (lenis) lenis.scrollTo(top, { immediate: true, force: true })
  else window.scrollTo({ top, behavior: 'instant' })
}

export function elementTop(element: Element) {
  const margin = parseFloat(getComputedStyle(element).scrollMarginTop) || 0
  return Math.max(0, element.getBoundingClientRect().top + window.scrollY - (margin || headerOffset()))
}

export function scrollToElement(element: Element, immediate = false) {
  const top = elementTop(element)
  if (lenis && !immediate) lenis.scrollTo(top, { duration: 1.1, force: true })
  else scrollToY(top)
}

// In-page links glide through Lenis instead of the browser's own smooth scroll,
// so both use the same easing and the presentation sees one scroll source.
function onAnchorClick(event: MouseEvent) {
  if (!lenis || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return
  const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null
  const hash = link?.getAttribute('href')
  if (!hash || hash === '#') return
  const target = document.getElementById(decodeURIComponent(hash.slice(1)))
  if (!target) return

  event.preventDefault()
  history.pushState(null, '', hash)
  scrollToElement(target)
  if (target.hasAttribute('tabindex') || target.matches('a,button,input,select,textarea,summary')) {
    target.focus({ preventScroll: true })
  }
}

syncLenis()
reducedMotion.addEventListener('change', syncLenis)
document.addEventListener('click', onAnchorClick)
