import {
  AmbientLight, BackSide, BoxGeometry, CircleGeometry, CylinderGeometry, DataTexture, DirectionalLight,
  Group, HemisphereLight, Material, Mesh, MeshBasicMaterial, MeshToonMaterial, NearestFilter, Object3D,
  PerspectiveCamera, RedFormat, Scene, SphereGeometry, Vector3, WebGLRenderer,
} from 'three'
import type { BufferGeometry } from 'three'

// A stylised pump room drawn with toon shading and ink outlines so it sits in
// the same world as the 2D neighbourhood. Built from primitives: Wilo does not
// publish pump models, and primitives keep the bundle and the GPU load small.

export type PumpKind = 'fire' | 'pressure' | 'drainage'
export type RoomState = { focus: PumpKind; level: number; bar: number; alarm: boolean }

const ink = '#365556'
const outline = .035
const colors = {
  floor: '#a6bcaf', wall: '#e2eae0', sideWall: '#d0dcd2', skid: '#d1dcd0',
  fire: '#ab5947', pressure: '#567e91', drainage: '#719f89',
  steel: '#b7cdc1', cabinetFire: '#b98d7d', cabinetPressure: '#9fbabc', cabinetDrain: '#a8bfad',
  water: '#5ba898', reserve: '#80aeb2', glass: '#e6f2ee', paper: '#f6faf3',
}
const accents: Record<PumpKind, string> = { fire: '#a2402f', pressure: '#1f6390', drainage: '#226857' }
const anchorPoints: Record<PumpKind, Vector3> = {
  fire: new Vector3(-3.9, 2.05, 0),
  pressure: new Vector3(.2, 2.55, 0),
  drainage: new Vector3(4.5, 3.05, -.3),
}
const focusX: Record<PumpKind, number> = { fire: -3.6, pressure: .2, drainage: 4.3 }
const wellHeight = 2.6

export function webglAvailable() {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ?? canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true })
    if (!gl) return false
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER))
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)
  } catch {
    return false
  }
}

function toonRamp() {
  const ramp = new DataTexture(new Uint8Array([110, 190, 255]), 3, 1, RedFormat)
  ramp.minFilter = NearestFilter
  ramp.magFilter = NearestFilter
  ramp.needsUpdate = true
  return ramp
}

export class PumpRoom {
  readonly canvas: HTMLCanvasElement
  private renderer: WebGLRenderer
  private scene = new Scene()
  private camera = new PerspectiveCamera(26, 2, .1, 100)
  private ramp = toonRamp()
  private inkMaterial = new MeshBasicMaterial({ color: ink, side: BackSide })
  private materials = new Map<string, MeshToonMaterial>()
  private systems: Record<PumpKind, Group> = { fire: new Group(), pressure: new Group(), drainage: new Group() }
  private water: Mesh
  private needle: Object3D
  private beacon: Mesh
  private beaconMaterial: MeshBasicMaterial
  private halo: Mesh
  private haloMaterial: MeshBasicMaterial
  private impellers: Object3D[] = []
  private particles: { mesh: Mesh; path: Vector3[]; kind: PumpKind; offset: number }[] = []
  private state: RoomState = { focus: 'drainage', level: 50, bar: 3.4, alarm: false }
  private shown = { level: 50, bar: 3.4, focusX: focusX.drainage, alarm: 0 }
  private orbit = 0
  private size = { width: 1, height: 1 }
  private projected = new Vector3()

  constructor() {
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
    this.renderer.setClearColor(0x000000, 0)
    this.canvas = this.renderer.domElement
    this.canvas.setAttribute('aria-hidden', 'true')
    this.canvas.className = 'pump-room-canvas'

    this.scene.add(new HemisphereLight('#ffffff', '#93ad9f', 1.5))
    this.scene.add(new AmbientLight('#ffffff', .35))
    const sun = new DirectionalLight('#fff4e2', 2.1)
    sun.position.set(4, 9, 8)
    this.scene.add(sun)

    this.buildRoom()
    this.buildFire()
    this.buildPressure()
    const well = this.buildDrainage()
    this.water = well.water
    this.needle = this.buildGauge()
    this.beaconMaterial = new MeshBasicMaterial({ color: '#d4503a', transparent: true })
    this.beacon = new Mesh(new SphereGeometry(.13, 16, 12), this.beaconMaterial)
    this.beacon.position.set(-4.6, 2.05, -1.75)
    this.scene.add(this.beacon)
    this.haloMaterial = new MeshBasicMaterial({ color: accents.drainage, transparent: true, opacity: .28, depthWrite: false })
    this.halo = new Mesh(new CircleGeometry(1, 48), this.haloMaterial)
    this.halo.rotation.x = -Math.PI / 2
    this.halo.position.y = .012
    this.scene.add(this.halo)
    for (const system of Object.values(this.systems)) this.scene.add(system)
  }

  private toon(color: string) {
    let material = this.materials.get(color)
    if (!material) {
      material = new MeshToonMaterial({ color, gradientMap: this.ramp })
      this.materials.set(color, material)
    }
    return material
  }

  // A mesh plus a slightly larger back-face shell in ink: the comic outline.
  private solid(geometry: BufferGeometry, hull: BufferGeometry | null, color: string, parent: Object3D, at: [number, number, number]) {
    const mesh: Mesh<BufferGeometry, Material> = new Mesh(geometry, this.toon(color))
    mesh.position.set(...at)
    if (hull) mesh.add(new Mesh(hull, this.inkMaterial))
    parent.add(mesh)
    return mesh
  }

  private box(width: number, height: number, depth: number, color: string, parent: Object3D, at: [number, number, number], lined = true) {
    return this.solid(new BoxGeometry(width, height, depth),
      lined ? new BoxGeometry(width + outline, height + outline, depth + outline) : null, color, parent, at)
  }

  private cylinder(radius: number, height: number, color: string, parent: Object3D, at: [number, number, number], segments = 28) {
    return this.solid(new CylinderGeometry(radius, radius, height, segments),
      new CylinderGeometry(radius + outline / 2, radius + outline / 2, height + outline, segments), color, parent, at)
  }

  // Straight pipe runs between points, with a joint at every bend.
  private pipe(points: [number, number, number][], radius: number, color: string, parent: Object3D) {
    for (let index = 1; index < points.length; index++) {
      const from = new Vector3(...points[index - 1])
      const to = new Vector3(...points[index])
      const length = from.distanceTo(to)
      const segment = this.cylinder(radius, length, color, parent, [0, 0, 0], 14)
      segment.position.copy(from).add(to).multiplyScalar(.5)
      segment.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), to.clone().sub(from).normalize())
      this.cylinder(radius * 1.25, radius * 2.2, color, parent, points[index], 14)
    }
  }

  private verticalPump(x: number, z: number, color: string, parent: Object3D) {
    this.box(.62, .14, .62, '#546f68', parent, [x, .07, z])
    this.cylinder(.22, .95, colors.steel, parent, [x, .62, z])
    for (const y of [.36, .52, .68, .84]) this.cylinder(.235, .035, '#d6e3d7', parent, [x, y, z])
    this.cylinder(.27, .42, color, parent, [x, 1.31, z])
    const cap = this.cylinder(.2, .08, '#a4c4b4', parent, [x, 1.56, z])
    const fan = new Mesh(new BoxGeometry(.32, .025, .05), new MeshBasicMaterial({ color: '#e6f7ca' }))
    fan.position.y = .05
    cap.add(fan)
    this.impellers.push(fan)
    return cap
  }

  private buildRoom() {
    const room = new Group()
    this.box(13.4, .2, 6.2, colors.floor, room, [0, -.1, 0])
    this.box(13.4, 4.1, .2, colors.wall, room, [0, 1.95, -3.1])
    this.box(.2, 4.1, 6.2, colors.sideWall, room, [-6.8, 1.95, 0])
    for (const x of [-1.95, 2.25]) this.box(.12, 3.9, .14, '#bbcdbf', room, [x, 1.95, -2.95], false)
    for (const x of [-5.4, -3, -.6, 1.8, 4.2]) this.box(.9, .06, .05, '#eff3de', room, [x, 3.6, -2.98], false)
    this.box(13.4, .3, .04, '#a6bcaf', room, [0, .15, -2.99], false)
    this.scene.add(room)
  }

  private buildFire() {
    const fire = this.systems.fire
    const tank = this.solid(new CylinderGeometry(.82, .82, 2.7, 32), null,
      colors.glass, fire, [-5.75, 1.35, -1.6])
    tank.material = new MeshBasicMaterial({ color: colors.glass, transparent: true, opacity: .45, depthWrite: false })
    this.cylinder(.78, 1.7, colors.reserve, fire, [-5.75, .86, -1.6])
    this.box(1.5, .22, 1, colors.skid, fire, [-3.7, .11, .2])
    this.cylinder(.36, 1.15, '#b3c9b7', fire, [-4, .62, .2]).rotation.z = Math.PI / 2
    for (const x of [-4.4, -4.15, -3.9, -3.65]) {
      this.cylinder(.385, .04, '#d9e7d7', fire, [x, .62, .2]).rotation.z = Math.PI / 2
    }
    const volute = this.cylinder(.5, .34, colors.fire, fire, [-3.15, .62, .2])
    volute.rotation.x = Math.PI / 2
    const hub = new Mesh(new CircleGeometry(.18, 24), new MeshBasicMaterial({ color: colors.paper }))
    hub.position.set(-3.15, .62, .375)
    fire.add(hub)
    const impeller = new Mesh(new BoxGeometry(.3, .04, .01), new MeshBasicMaterial({ color: colors.fire }))
    impeller.position.set(-3.15, .62, .385)
    fire.add(impeller)
    this.impellers.push(impeller)
    this.box(.72, 1.15, .36, colors.cabinetFire, fire, [-4.6, 1.35, -1.75])
    this.pipe([[-5, .5, -1.6], [-4.6, .5, -1.1], [-4.6, .62, .2]], .09, colors.fire, fire)
    this.pipe([[-3.15, .62, .45], [-3.15, 1.5, .45], [-3.15, 1.5, -2.7], [-3.15, 3.7, -2.7]], .09, colors.fire, fire)
    this.particles.push(...this.flowAlong([[-5, .5, -1.6], [-4.6, .5, -1.1], [-4.6, .62, .2], [-3.15, .62, .45], [-3.15, 1.5, .45], [-3.15, 1.5, -2.7], [-3.15, 3.7, -2.7]], 'fire'))
  }

  private buildPressure() {
    const pressure = this.systems.pressure
    this.box(3.1, .16, 1.2, colors.skid, pressure, [0, .08, .1])
    for (const x of [-.9, 0, .9]) {
      this.verticalPump(x, .1, colors.pressure, pressure)
      this.pipe([[x, 1.56, .1], [x, 1.95, .1]], .07, colors.pressure, pressure)
    }
    this.pipe([[-1.2, 1.95, .1], [1.55, 1.95, .1], [1.55, 1.95, -2.6], [1.55, 3.8, -2.6]], .1, colors.pressure, pressure)
    this.pipe([[-1.2, .3, .7], [1.3, .3, .7]], .1, colors.pressure, pressure)
    const vessel = this.cylinder(.34, .9, colors.cabinetPressure, pressure, [1.85, .75, -.9])
    this.solid(new SphereGeometry(.34, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), null, colors.cabinetPressure, vessel, [0, .45, 0])
    this.box(.6, 1, .32, colors.cabinetPressure, pressure, [-1.55, 1.3, -1.5])
    this.particles.push(...this.flowAlong([[0, 1.56, .1], [0, 1.95, .1], [1.55, 1.95, .1], [1.55, 1.95, -2.6], [1.55, 3.8, -2.6]], 'pressure'))
  }

  private buildGauge() {
    const pressure = this.systems.pressure
    const face = this.cylinder(.24, .06, '#486968', pressure, [1.55, 2.35, .2])
    face.rotation.x = Math.PI / 2
    const dial = new Mesh(new CircleGeometry(.2, 32), new MeshBasicMaterial({ color: '#f5f7e9' }))
    dial.position.set(1.55, 2.35, .235)
    pressure.add(dial)
    const pivot = new Group()
    pivot.position.set(1.55, 2.35, .24)
    const needle = new Mesh(new BoxGeometry(.03, .17, .01), new MeshBasicMaterial({ color: '#b77a5e' }))
    needle.position.y = .075
    pivot.add(needle)
    pressure.add(pivot)
    this.pipe([[1.55, 1.95, .1], [1.55, 2.2, .1]], .035, '#58726a', pressure)
    return pivot
  }

  private buildDrainage() {
    const drainage = this.systems.drainage
    this.box(2.2, .16, 1.1, colors.skid, drainage, [3.4, .08, .1])
    for (const x of [2.9, 3.9]) {
      this.verticalPump(x, .1, colors.drainage, drainage)
      this.pipe([[x, 1.56, .1], [x, 2.1, .1], [4.75, 2.1, .1]], .08, colors.drainage, drainage)
    }
    const wellX = 5.45
    const shell = this.solid(new BoxGeometry(1.2, wellHeight, 1.2), new BoxGeometry(1.2 + outline, wellHeight + outline, 1.2 + outline),
      colors.glass, drainage, [wellX, wellHeight / 2, -.3])
    shell.material = new MeshBasicMaterial({ color: colors.glass, transparent: true, opacity: .4, depthWrite: false })
    // Normal range ends at 50 %: a band on the well shows where.
    for (const [width, depth, dx, dz] of [[1.26, .04, 0, .61], [1.26, .04, 0, -.61], [.04, 1.26, .61, 0], [.04, 1.26, -.61, 0]]) {
      this.box(width, .04, depth, '#c98a5a', drainage, [wellX + dx, wellHeight * .5, -.3 + dz], false)
    }
    const water = new Mesh(new BoxGeometry(1.12, 1, 1.12), new MeshBasicMaterial({ color: colors.water, transparent: true, opacity: .85 }))
    water.position.set(wellX, .5, -.3)
    drainage.add(water)
    this.pipe([[4.75, 2.1, .1], [4.75, 3.4, .1], [4.75, 3.4, -2.7]], .09, colors.drainage, drainage)
    this.box(.6, 1, .32, colors.cabinetDrain, drainage, [2.2, 1.3, -1.5])
    this.particles.push(...this.flowAlong([[wellX, .3, -.3], [3.9, .3, .55], [3.9, 1.56, .1], [3.9, 2.1, .1], [4.75, 2.1, .1], [4.75, 3.4, .1], [4.75, 3.4, -2.7]], 'drainage'))
    return { water }
  }

  private flowAlong(points: [number, number, number][], kind: PumpKind) {
    const path = points.map((point) => new Vector3(...point))
    const material = new MeshBasicMaterial({ color: '#f6fff2', transparent: true, opacity: 0 })
    return Array.from({ length: 9 }, (_, index) => {
      const mesh = new Mesh(new SphereGeometry(.055, 10, 8), material)
      this.scene.add(mesh)
      return { mesh, path, kind, offset: index / 9 }
    })
  }

  private pointOn(path: Vector3[], fraction: number, target: Vector3) {
    const lengths = path.slice(1).map((point, index) => point.distanceTo(path[index]))
    let distance = fraction * lengths.reduce((sum, length) => sum + length, 0)
    for (const [index, length] of lengths.entries()) {
      if (distance <= length) return target.copy(path[index]).lerp(path[index + 1], length ? distance / length : 0)
      distance -= length
    }
    return target.copy(path[path.length - 1])
  }

  setState(state: RoomState) {
    this.state = state
    this.haloMaterial.color.set(accents[state.focus])
  }

  // -1…1: how far the reader has scrolled through the beat; turns the camera.
  setOrbit(orbit: number) {
    this.orbit = orbit
  }

  resize(width: number, height: number) {
    if (width === this.size.width && height === this.size.height) return
    this.size = { width: Math.max(1, width), height: Math.max(1, height) }
    this.renderer.setSize(this.size.width, this.size.height, false)
    this.camera.aspect = this.size.width / this.size.height
    this.camera.updateProjectionMatrix()
  }

  render(seconds: number, delta: number) {
    const ease = 1 - Math.exp(-delta / .45)
    const { state, shown } = this
    shown.level += (state.level - shown.level) * ease
    shown.bar += (state.bar - shown.bar) * ease
    shown.focusX += (focusX[state.focus] - shown.focusX) * ease
    shown.alarm += ((state.alarm ? 1 : 0) - shown.alarm) * ease

    const fill = Math.max(.02, wellHeight * .96 * shown.level / 100)
    this.water.scale.y = fill
    this.water.position.y = fill / 2 + .02
    this.needle.rotation.z = 2.2 - (shown.bar - 2.4) * 1.9
    this.beaconMaterial.color.set(shown.alarm > .5 ? '#e0533a' : '#7c9a8a')
    this.beaconMaterial.opacity = .55 + .45 * shown.alarm * (.5 + .5 * Math.sin(seconds * 7))
    this.beacon.scale.setScalar(1 + .35 * shown.alarm * (.5 + .5 * Math.sin(seconds * 7)))
    this.halo.position.x = shown.focusX
    this.halo.scale.setScalar(1.75 + .08 * Math.sin(seconds * 2.4))

    for (const impeller of this.impellers) impeller.rotation.y += delta * 9
    for (const particle of this.particles) {
      const running = particle.kind === state.focus
      const material = particle.mesh.material as MeshBasicMaterial
      material.opacity += ((running ? .95 : 0) - material.opacity) * ease
      particle.mesh.visible = material.opacity > .02
      if (particle.mesh.visible) this.pointOn(particle.path, (seconds * .22 + particle.offset) % 1, particle.mesh.position)
    }

    // Frame the room: fit its width, lean toward the focused system, turn with scroll.
    const aspect = this.camera.aspect
    const vertical = (this.camera.fov / 2) * Math.PI / 180
    const horizontal = Math.atan(Math.tan(vertical) * aspect)
    // Whole room in view with a margin, like a model on a table.
    const distance = Math.max(8.4 / Math.tan(horizontal), 3.9 / Math.tan(vertical))
    const angle = this.orbit * .2 + shown.focusX * .015
    const target = new Vector3(shown.focusX * .12, 1.25, -.3)
    this.camera.position.set(target.x + Math.sin(angle) * distance * .92, target.y + distance * .4, target.z + Math.cos(angle) * distance * .92)
    this.camera.lookAt(target)
    this.renderer.render(this.scene, this.camera)
  }

  // Screen position of each system's label anchor, in canvas pixels.
  anchors() {
    const result = {} as Record<PumpKind, { x: number; y: number }>
    for (const kind of Object.keys(anchorPoints) as PumpKind[]) {
      this.projected.copy(anchorPoints[kind]).project(this.camera)
      result[kind] = {
        x: (this.projected.x * .5 + .5) * this.size.width,
        y: (-this.projected.y * .5 + .5) * this.size.height,
      }
    }
    return result
  }

  dispose() {
    this.scene.traverse((node) => {
      const mesh = node as Mesh
      mesh.geometry?.dispose()
      const material = mesh.material as Material | Material[] | undefined
      if (Array.isArray(material)) material.forEach((entry) => entry.dispose())
      else material?.dispose()
    })
    this.ramp.dispose()
    this.renderer.dispose()
    this.canvas.remove()
  }
}
