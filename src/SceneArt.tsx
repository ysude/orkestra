import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

type Illustration = 'hero' | 'room' | 'storm' | 'coordination'

const ink = '#202019'
const paper = '#fff2d7'
const lime = '#ddf548'
const blue = '#7ee8f4'
const pink = '#fa8fb7'
const orange = '#ff794b'

function paint(ctx: CanvasRenderingContext2D, scene: Illustration, time: number, progress: number) {
  const width = 840
  const height = 620
  const pulse = (Math.sin(time * 2.6) + 1) * .5

  function polygon(points: number[][], fill: string, stroke = ink, line = 4) {
    ctx.beginPath()
    points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y))
    ctx.closePath()
    ctx.fillStyle = fill
    ctx.fill()
    if (line) {
      ctx.lineWidth = line
      ctx.strokeStyle = stroke
      ctx.stroke()
    }
  }

  function rectangle(x: number, y: number, w: number, h: number, fill: string, line = 4) {
    polygon([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], fill, ink, line)
  }

  function circle(x: number, y: number, radius: number, fill: string, line = 4) {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = fill
    ctx.fill()
    if (line) {
      ctx.lineWidth = line
      ctx.strokeStyle = ink
      ctx.stroke()
    }
  }

  function path(points: number[][], color = ink, size = 4, dash: number[] = [], offset = 0) {
    ctx.beginPath()
    points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y))
    ctx.lineWidth = size
    ctx.strokeStyle = color
    ctx.setLineDash(dash)
    ctx.lineDashOffset = offset
    ctx.stroke()
    ctx.setLineDash([])
  }

  function text(value: string, x: number, y: number, size: number, color = ink) {
    ctx.font = '900 ' + size + 'px "Segoe UI", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = color
    ctx.fillText(value, x, y)
  }

  function burst(x: number, y: number, outer: number, inner: number, fill: string, spin = 0) {
    const points = Array.from({ length: 24 }, (_, index) => {
      const angle = index * Math.PI / 12 + spin
      const r = index % 2 ? inner : outer
      return [x + Math.cos(angle) * r, y + Math.sin(angle) * r]
    })
    polygon(points, fill)
  }

  function dots(x: number, y: number, w: number, h: number, color = ink) {
    for (let row = 0; row < h / 12; row++) {
      for (let column = 0; column < w / 12; column++) {
        circle(x + column * 12 + (row % 2) * 5, y + row * 12, 1.25, color, 0)
      }
    }
  }

  function pipes(points: number[][], fill: string, animated = true) {
    path(points, ink, 22)
    path(points, fill, 14)
    if (animated) path(points, paper, 4, [9, 19], -time * 48)
  }

  function pump(x: number, y: number, fill: string, label: string) {
    rectangle(x - 52, y + 35, 104, 13, ink, 0)
    rectangle(x - 42, y + 4, 84, 28, ink)
    circle(x, y, 32, fill)
    circle(x, y, 15, paper)
    const angle = time * 2.3
    for (let index = 0; index < 3; index++) {
      const a = angle + index * 2 * Math.PI / 3
      path([[x, y], [x + Math.cos(a) * 11, y + Math.sin(a) * 11]], ink, 3)
    }
    text(label, x, y + 75, 21)
  }

  function apartment(x: number, y: number) {
    ctx.save()
    ctx.translate(x, y)
    polygon([[44, 27], [124, -17], [453, -17], [374, 27]], paper)
    polygon([[374, 27], [453, -17], [452, 285], [372, 327]], orange)
    polygon([[44, 27], [374, 27], [372, 327], [44, 327]], paper)
    polygon([[28, 32], [375, 32], [463, -16], [463, -32], [379, 15], [28, 15]], ink)
    for (let floor = 0; floor < 4; floor++) {
      const top = 52 + floor * 60
      for (let bay = 0; bay < 4; bay++) {
        const left = 63 + bay * 75
        rectangle(left, top, 55, 38, (floor + bay) % 3 === 0 ? lime : blue)
        path([[left + 25, top], [left + 25, top + 38]], ink, 2)
        path([[left + 4, top + 27], [left + 17, top + 11]], paper, 3)
      }
      path([[43, top + 45], [374, top + 45], [449, top + 5]], ink, 3)
      polygon([[389, top - 5], [436, top - 31], [436, top + 5], [389, top + 30]], blue)
    }
    rectangle(186, 281, 55, 46, pink)
    path([[213, 281], [213, 327]], ink, 3)
    path([[329, -28], [329, -58], [357, -58], [357, -30]], ink, 7)
    ctx.restore()
  }

  function basement(x: number, y: number) {
    ctx.save()
    ctx.translate(x, y)
    polygon([[0, 39], [74, 0], [505, 0], [431, 39]], ink)
    polygon([[431, 39], [505, 0], [505, 153], [431, 192]], '#785b47')
    rectangle(0, 39, 431, 153, '#fff1cc')
    dots(10, 48, 414, 130, '#e4a876')
    pipes([[52, 73], [381, 73]], blue)
    pipes([[87, 73], [87, 111]], orange)
    pipes([[217, 73], [217, 111]], blue)
    pipes([[347, 73], [347, 111]], lime)
    ;[orange, blue, lime].forEach((color, index) => {
      const a = 87 + index * 130
      rectangle(a - 31, 140, 62, 10, ink, 0)
      circle(a, 114, 24, color)
      circle(a, 114, 9, paper)
      text(['Y', 'H', 'A'][index], a, 168, 19)
    })
    ctx.restore()
  }

  function hero() {
    const floating = Math.sin(time * 1.6) * 5
    circle(428, 283, 242, '#ffbfda')
    for (let ray = 0; ray < 15; ray++) {
      const angle = ray * Math.PI / 7.5 + .13
      const distance = 275 + ray % 3 * 15
      path([[420 + Math.cos(angle) * distance, 300 + Math.sin(angle) * distance],
        [420 + Math.cos(angle) * (distance + 52), 300 + Math.sin(angle) * (distance + 52)]], ink, ray % 2 ? 3 : 5)
    }
    dots(95, 94, 655, 450, '#e96a9c')
    for (let drop = 0; drop < 30; drop++) {
      const x = 19 + drop * 109 % 795
      const y = (drop * 53 + time * (43 + drop % 4 * 13)) % 650
      path([[x + 13, y - 23], [x, y]], '#d8d0ff9c', 3)
    }
    ctx.save()
    ctx.translate(0, floating)
    apartment(160, 83)
    basement(159, 385)
    ctx.restore()
    burst(708, 144, 86 + pulse * 4, 65, lime, .06)
    text('SU', 708, 144, 42)
    burst(106, 428, 55, 37, blue, -.1)
    burst(692, 503, 64, 48, orange, .1)
    path([[685, 501], [696, 486], [705, 502], [694, 519], [685, 501]], ink, 4)
  }

  function room() {
    dots(45, 42, 750, 535, '#ee8c59')
    polygon([[76, 133], [202, 67], [714, 67], [768, 133], [768, 492], [650, 546], [76, 546]], ink)
    polygon([[77, 134], [202, 68], [714, 68], [768, 134]], '#ff794b')
    rectangle(76, 134, 574, 412, paper)
    polygon([[650, 134], [768, 134], [768, 492], [650, 546]], '#cb7255')
    dots(102, 161, 524, 300, '#dcaf86')
    pipes([[139, 245], [139, 209], [580, 209], [580, 266]], blue)
    pipes([[185, 210], [185, 341]], orange)
    pipes([[361, 210], [361, 341]], blue)
    pipes([[537, 210], [537, 341]], lime)
    pump(185, 386, orange, 'YANGIN')
    pump(361, 386, blue, 'HİDROFOR')
    pump(537, 386, lime, 'ATIK SU')
    path([[103, 494], [626, 494]], ink, 3)
    burst(700, 112, 57, 40, lime, .08)
    text('B1', 700, 112, 29)
  }

  function storm() {
    dots(45, 44, 746, 537, '#4bb9cc')
    for (let i = 0; i < 38; i++) {
      const x = 28 + (i * 53 % 777)
      const y = (i * 89 + time * (72 + i % 3 * 18)) % 650 - 30
      path([[x + 10, y - 20], [x, y]], '#3da6bf', 2)
    }
    polygon([[81, 119], [166, 63], [417, 63], [471, 119], [471, 480], [409, 545], [81, 545]], ink)
    rectangle(81, 119, 328, 426, paper)
    polygon([[409, 119], [471, 119], [471, 480], [409, 545]], '#259db6')
    const level = 347 - progress * 104 - pulse * 5
    const waves = Array.from({ length: 27 }, (_, index) => {
      const x = 102 + index * 11
      return [x, level + 9 * Math.sin(index * .58 - time * 4)]
    })
    polygon([...waves, [388, 513], [102, 513]], '#36bbde')
    path([[103, 348], [388, 348]], paper, 4, [13, 8])
    text('OLAĞAN', 172, 370, 20, ink)
    for (let tick = 0; tick < 7; tick++) path([[357, 171 + tick * 42], [385, 171 + tick * 42]], ink, 3)
    for (let bubble = 0; bubble < 9; bubble++) {
      const y = 505 - ((bubble * 37 + time * 33) % 242)
      circle(120 + (bubble * 53 % 215), y, 4 + bubble % 5, '#b7f5ff', 0)
    }
    burst(638, 202, 119, 97, lime, -.08)
    text('%' + Math.round(48 + progress * 30), 638, 196, 64)
    text('KUYU SEVİYESİ', 638, 239, 19)
    rectangle(514, 359, 244, 122, paper)
    path([[535, 455], [738, 455]], ink, 2)
    path([[539, 439], [572, 433], [606, 421], [641, 407], [686, 388], [728, 377]], ink, 5)
    circle(728, 377, 8 + pulse * 2, orange)
  }

  function coordination() {
    dots(55, 51, 736, 518, '#a48cde')
    const points = [[137, 157], [137, 308], [137, 459]]
    const names = ['YANGIN', 'HİDROFOR', 'ATIK SU']
    const fills = [orange, blue, lime]
    points.forEach(([x, y], index) => {
      const route = [[x + 52, y], [280 + index * 27, y], [280 + index * 27, 308], [382, 308]]
      pipes(route, fills[index], progress >= .15 + index * .18)
      circle(x, y, 53, fills[index])
      text(['Y', 'H', 'A'][index], x, y, 41)
      text(names[index], x, y + 74, 19)
    })
    pipes([[483, 308], [636, 308]], pink, progress >= .7)
    burst(431, 308, 105 + pulse * 3, 84, paper, -.08)
    text('ŞEF', 431, 301, 48)
    text('AJAN', 431, 343, 24)
    polygon([[600, 220], [763, 220], [763, 386], [626, 386], [626, 416], [600, 386]], lime)
    path([[628, 274], [641, 289], [665, 254]], ink, 8)
    text('KONTROL', 680, 317, 24)
    text('ÖNERİSİ', 680, 345, 24)
  }

  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.clearRect(0, 0, width, height)
  const draw = { hero, room, storm, coordination }
  draw[scene]()
}

type ArtProps = {
  scene: Illustration
  scrollPosition?: RefObject<number>
  shotIndex?: number
  playing?: boolean
}

export function SceneArt({ scene, scrollPosition, shotIndex = 0, playing = true }: ArtProps) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const element = canvas.current
    const ctx = element?.getContext('2d')
    if (!element || !ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let visible = true
    const render = (time: number) => {
      const sceneProgress = scrollPosition && !reduced.matches
        ? Math.max(0, Math.min(1, (scrollPosition.current - shotIndex + .67) / .66))
        : 1
      paint(ctx, scene, reduced.matches ? 0 : time / 1000, sceneProgress)
      if (visible && playing && !reduced.matches) frame = requestAnimationFrame(render)
    }

    function update() {
      cancelAnimationFrame(frame)
      render(performance.now())
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) update()
      else cancelAnimationFrame(frame)
    })
    observer.observe(element)
    reduced.addEventListener('change', update)
    update()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      reduced.removeEventListener('change', update)
    }
  }, [scene, scrollPosition, shotIndex, playing])

  return <canvas className="illustration" ref={canvas} width={840} height={620} aria-hidden="true" />
}
