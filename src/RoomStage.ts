import { lowPower, onFrame, reducedMotion } from './motion'
import type { PumpKind, PumpRoom, RoomState } from './PumpRoom3D'

// Shares one WebGL pump room between the three decision screens. The canvas
// moves into whichever screen is on view; three.js loads only once a screen is
// near, and never on low-power devices, with reduced motion or without WebGL.
// Without it the screens keep their plain card layout.

type Slot = { element: HTMLElement; section: HTMLElement; state: RoomState }

const slots = new Set<Slot>()
const wideEnough = window.matchMedia('(min-width: 768px) and (min-height: 600px)')
let room: PumpRoom | null = null
let loading = false
let failed = false
let active: Slot | null = null
let stopFrames: (() => void) | null = null
let last = 0

function allowed() {
  return !failed && !lowPower && !reducedMotion.matches && wideEnough.matches
}

function setLive(live: boolean) {
  for (const slot of slots) slot.element.classList.toggle('room-live', live)
}

async function load() {
  loading = true
  try {
    const module = await import('./PumpRoom3D')
    if (!module.webglAvailable()) throw new Error('WebGL unavailable')
    room = new module.PumpRoom()
    room.canvas.addEventListener('webglcontextlost', () => {
      failed = true
      detach()
    })
    if (allowed()) setLive(true)
  } catch {
    failed = true
  } finally {
    loading = false
  }
}

function detach() {
  room?.canvas.remove()
  active = null
  setLive(false)
}

function frame(time: number) {
  if (!slots.size) return
  if (!allowed()) {
    if (active || room?.canvas.isConnected) detach()
    return
  }
  const header = document.querySelector('header')?.offsetHeight ?? 0
  const viewport = window.innerHeight
  let best: Slot | null = null
  let bestShare = 0
  let near = false
  for (const slot of slots) {
    const box = slot.section.getBoundingClientRect()
    if (box.bottom > -viewport && box.top < viewport * 2) near = true
    const share = Math.min(box.bottom, viewport) - Math.max(box.top, header)
    if (share > bestShare) {
      bestShare = share
      best = slot
    }
  }
  if (!room) {
    if (near && !loading && !failed) void load()
    return
  }
  if (!best || bestShare <= 0) return
  if (!best.element.classList.contains('room-live')) setLive(true)
  if (active !== best) {
    active = best
    best.element.prepend(room.canvas)
    room.setState(best.state)
  }

  const box = best.section.getBoundingClientRect()
  const travel = Math.max(1, box.height - (viewport - header))
  room.setOrbit(Math.max(-1, Math.min(1, ((header - box.top) / travel) * 2 - 1)))
  room.resize(best.element.clientWidth, best.element.clientHeight)
  const delta = last ? Math.min(.1, (time - last) / 1000) : 0
  last = time
  room.render(time / 1000, delta)

  placeLabels(best.element, room.anchors())
}

// Labels sit above their anchors; neighbours are pushed apart sideways so the
// cards never overlap, while each stem keeps pointing at its own pump.
function placeLabels(slot: HTMLElement, anchors: Record<PumpKind, { x: number; y: number }>) {
  const gap = 10
  const width = slot.clientWidth
  const labels = (Object.entries(anchors) as [PumpKind, { x: number; y: number }][]).flatMap(([kind, point]) => {
    const element = slot.querySelector<HTMLElement>('[data-pump="' + kind + '"]')
    return element ? [{ element, point, half: element.offsetWidth / 2, x: point.x }] : []
  }).sort((first, second) => first.point.x - second.point.x)
  for (let pass = 0; pass < 4; pass++) {
    for (let index = 1; index < labels.length; index++) {
      const left = labels[index - 1]
      const right = labels[index]
      const overlap = left.x + left.half + gap - (right.x - right.half)
      if (overlap > 0) {
        left.x -= overlap / 2
        right.x += overlap / 2
      }
    }
    for (const label of labels) label.x = Math.max(label.half, Math.min(width - label.half, label.x))
  }
  for (const { element, point, x } of labels) {
    element.style.setProperty('--card-x', x.toFixed(1) + 'px')
    element.style.setProperty('--anchor-y', point.y.toFixed(1) + 'px')
    element.style.setProperty('--stem-offset', (point.x - x).toFixed(1) + 'px')
  }
}

export function registerRoomSlot(element: HTMLElement, section: HTMLElement, state: RoomState) {
  const slot = { element, section, state }
  slots.add(slot)
  if (room && allowed()) element.classList.add('room-live')
  stopFrames ??= onFrame(frame, 3)
  return () => {
    slots.delete(slot)
    if (active === slot) {
      room?.canvas.remove()
      active = null
    }
    element.classList.remove('room-live')
    if (!slots.size) {
      stopFrames?.()
      stopFrames = null
    }
  }
}
