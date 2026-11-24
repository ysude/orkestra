import { onFrame, reducedMotion } from './motion'

// Phone tilt as two CSS variables on <html>, --tilt-x and --tilt-y, each -1…1.
// Opt-in: iOS only allows device orientation after a tap, and nobody should get
// a moving page they did not ask for.

type OrientationWithPermission = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> }

export const canTilt = 'DeviceOrientationEvent' in window && window.matchMedia('(pointer: coarse)').matches

const range = 22 // degrees from the resting angle that count as a full tilt
const target = { x: 0, y: 0 }
const shown = { x: 0, y: 0 }
let neutral: { beta: number; gamma: number } | null = null
let stopFrames: (() => void) | null = null

const clamp = (value: number) => Math.max(-1, Math.min(1, value))

function onOrientation(event: DeviceOrientationEvent) {
  if (event.beta === null || event.gamma === null) return
  neutral ??= { beta: event.beta, gamma: event.gamma }
  target.x = clamp((event.gamma - neutral.gamma) / range)
  target.y = clamp((event.beta - neutral.beta) / range)
}

function frame() {
  const root = document.documentElement
  const still = reducedMotion.matches
  shown.x += ((still ? 0 : target.x) - shown.x) * .12
  shown.y += ((still ? 0 : target.y) - shown.y) * .12
  root.style.setProperty('--tilt-x', shown.x.toFixed(3))
  root.style.setProperty('--tilt-y', shown.y.toFixed(3))
}

export async function enableTilt() {
  const orientation = DeviceOrientationEvent as OrientationWithPermission
  if (orientation.requestPermission && await orientation.requestPermission() !== 'granted') return false
  neutral = null
  window.addEventListener('deviceorientation', onOrientation)
  stopFrames ??= onFrame(frame, 4)
  return true
}

export function disableTilt() {
  window.removeEventListener('deviceorientation', onOrientation)
  target.x = target.y = 0
  stopFrames?.()
  stopFrames = null
  document.documentElement.style.removeProperty('--tilt-x')
  document.documentElement.style.removeProperty('--tilt-y')
}
