export const sceneWidth = 4480
export const sceneHeight = 860
export const sceneOffsetX = 1520
const west = -sceneOffsetX
const east = sceneWidth - sceneOffsetX

export type Neighborhood = {
  rain: number
  clear: number
  dusk: number
  time: number
  moving: boolean
  introduce?: number
  drained?: boolean
  supported?: boolean
  action?: { key: 'drainage' | 'pressure' | 'fire'; progress: number; reveal?: number; time?: number }
}

function smooth(value: number) {
  const step = Math.min(1, Math.max(0, value))
  return step * step * (3 - 2 * step)
}

function mix(first: string, second: string, factor: number) {
  const channels = [0, 2, 4].map((offset) => {
    const from = parseInt(first.slice(offset, offset + 2), 16)
    const to = parseInt(second.slice(offset, offset + 2), 16)
    return Math.round(from + (to - from) * factor)
  })
  return 'rgb(' + channels.join(',') + ')'
}

export function drawNeighborhood(ctx: CanvasRenderingContext2D, { rain, clear, dusk, time, moving, introduce, drained, supported, action }: Neighborhood) {
  const ink = '#365556'
  const paper = '#edf3e9'
  const mint = '#6fb2a2'
  const deep = '#1c5a54'
  const weather = rain * (1 - clear)
  const progress = action?.progress ?? 0
  const travel = Math.min(1, Math.max(0, (progress - .22) / .78))
  const applied = smooth(travel)
  const reveal = action ? action.reveal ?? 1 : 0
  const visibility = smooth(reveal)
  const diagnostic = 1 - smooth(reveal / .42)
  const readingVisibility = smooth((reveal - .42) / .58)
  const flowVisibility = visibility * smooth(travel * 5)
  const drainage = action?.key === 'drainage'
  const pressure = action?.key === 'pressure'
  const fire = action?.key === 'fire'
  const fireFlow = fire ? visibility * smooth((progress - .08) / .18) : 0
  const baseLevel = 36 + 42 * rain - 17 * (drained ? 1 : clear) - 17 * dusk
  const level = drainage ? baseLevel + (78 - 17 * applied - baseLevel) * visibility : baseLevel
  const actionTime = action?.time ?? time
  const baseBar = supported ? 3.3 : 3.4 - clear * (1 - dusk) * .8 - dusk * .1
  const bar = pressure ? baseBar + (2.6 + .7 * applied - baseBar) * visibility : baseBar
  const sky = mix('9dc8cc', '263e58', dusk * .85)
  const horizon = mix('edf1dc', 'e6b487', dusk * .65)

  function path(points: number[][], stroke: string, width: number) {
    ctx.beginPath()
    points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y))
    ctx.strokeStyle = stroke
    ctx.lineWidth = width
    ctx.stroke()
  }

  function polygon(points: number[][], fill: string, stroke?: string) {
    ctx.beginPath()
    points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y))
    ctx.closePath()
    ctx.fillStyle = fill
    ctx.fill()
    if (stroke) {
      ctx.lineWidth = 1.6
      ctx.strokeStyle = stroke
      ctx.stroke()
    }
  }

  function rect(x: number, y: number, width: number, height: number, fill: string | CanvasGradient, stroke?: string) {
    ctx.fillStyle = fill
    ctx.fillRect(x, y, width, height)
    if (stroke) {
      ctx.strokeStyle = stroke
      ctx.lineWidth = 1.5
      ctx.strokeRect(x, y, width, height)
    }
  }

  function disc(x: number, y: number, radius: number, fill: string) {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = fill
    ctx.fill()
  }

  function shade(x: number, y: number, toX: number, toY: number, light: string, shadow: string) {
    const gradient = ctx.createLinearGradient(x, y, toX, toY)
    gradient.addColorStop(0, light)
    gradient.addColorStop(1, shadow)
    return gradient
  }

  function label(value: string, x: number, y: number, color = deep) {
    ctx.font = '600 17px "Segoe UI", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillStyle = color
    ctx.fillText(value, x, y)
  }

  function sceneTag(title: string, value: string, x: number, y: number, width: number, accent: string) {
    rect(x + 3, y + 4, width, 48, '#31564b24')
    rect(x, y, width, 48, '#f6faf3', accent)
    rect(x, y, 4, 48, accent)
    ctx.textAlign = 'left'
    ctx.font = '600 12px "Segoe UI", sans-serif'
    ctx.fillStyle = ink
    ctx.fillText(title, x + 12, y + 17)
    ctx.font = '700 19px "Segoe UI", sans-serif'
    ctx.fillStyle = accent
    ctx.fillText(value, x + 12, y + 39)
  }

  const agentIdentity = {
    fire: { title: 'Yangın ajanı', color: '#963f35' },
    pressure: { title: 'Hidrofor ajanı', color: '#215e7b' },
    drainage: { title: 'Atık su ajanı', color: '#226857' },
    chief: { title: 'Şef ajan', color: '#574274' },
  }

  function agentMarker(kind: keyof typeof agentIdentity, value: string, x: number, y: number) {
    const { title, color } = agentIdentity[kind]
    rect(x, y, 128, 32, '#f6faf3', color)
    const cx = x + 16
    const cy = y + 16
    disc(cx, cy, 11, color)
    const white = '#ffffff'
    if (kind === 'chief') {
      path([[cx - 5,cy],[cx,cy - 5],[cx + 5,cy],[cx,cy + 5],[cx - 5,cy]], white, 1.3)
      disc(cx, cy, 2.2, white)
    } else if (kind === 'fire') {
      polygon([[cx - 5,cy + 2],[cx - 2,cy - 3],[cx - 1,cy - 1],[cx + 1,cy - 7],
        [cx + 5,cy - 1],[cx + 5,cy + 3],[cx + 2,cy + 6],[cx - 3,cy + 5]], white)
    } else if (kind === 'pressure') {
      ctx.beginPath()
      ctx.arc(cx, cy + 2, 6, Math.PI, 2 * Math.PI)
      ctx.strokeStyle = white
      ctx.lineWidth = 1.4
      ctx.stroke()
      path([[cx - 1,cy + 2],[cx + 3,cy - 2]], white, 1.6)
    } else {
      for (const offset of [-2, 3]) {
        path([[cx - 6,cy + offset],[cx - 3,cy + offset - 2],[cx,cy + offset],
          [cx + 3,cy + offset - 2],[cx + 6,cy + offset]], white, 1.5)
      }
    }
    ctx.textAlign = 'left'
    ctx.fillStyle = color
    ctx.font = '700 12px "Segoe UI", sans-serif'
    ctx.fillText(title, x + 33, y + 13)
    ctx.fillStyle = ink
    ctx.font = '600 10px "Segoe UI", sans-serif'
    ctx.fillText(value, x + 33, y + 26)
  }

  function agentLink(points: number[][], fraction: number, color: string) {
    ctx.save()
    ctx.setLineDash([5, 4])
    path(points, color, 2)
    ctx.restore()
    const [x, y] = pointOnPipe(points, fraction)
    const [beforeX, beforeY] = pointOnPipe(points, Math.max(0, fraction - .04))
    const angle = Math.atan2(y - beforeY, x - beforeX)
    polygon([[x,y], [x - Math.cos(angle - .52) * 9, y - Math.sin(angle - .52) * 9],
      [x - Math.cos(angle + .52) * 9, y - Math.sin(angle + .52) * 9]], color, '#f7fcf9')
  }

  function assignment(kind: 'pressure' | 'drainage' | 'fire', instruction: string,
    chief: number[], agent: number[], route: number[][]) {
    const command = Math.min(1, progress / .22)
    agentLink(route, .12 + command * .77, agentIdentity.chief.color)
    agentMarker('chief', instruction, chief[0], chief[1])
    agentMarker(kind, command >= 1 ? 'Görev alındı' : 'Talimat geliyor', agent[0], agent[1])
  }

  function tree(x: number, y: number, size: number, shrub: string) {
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(size / 60, size / 60)
    path([[0, 0], [-2, -42], [-10, -72]], '#665e4d', 4)
    path([[-1, -34], [13, -53], [20, -61]], '#665e4d', 2.3)
    for (const [dx, dy, radius] of [[-16,-63,20],[16,-57,21],[1,-53,24],[-3,-79,23],[19,-75,14],[-24,-76,12]]) {
      disc(dx, dy, radius, shrub)
    }
    for (const [dx, dy, radius] of [[-22,-70,11],[-6,-84,14],[13,-76,13],[-5,-64,13],[23,-57,11]]) {
      disc(dx, dy, radius, '#ffffff18')
    }
    ctx.restore()
  }

  function railing(x: number, y: number, width: number) {
    rect(x - 2, y + 12, width + 4, 3, '#79968d')
    for (let post = 0; post <= 5; post++) {
      const left = x + width * post / 5
      path([[left,y],[left,y + 12]], '#5c7b74', 1)
    }
    path([[x,y],[x + width,y]], '#3f6860', 1.7)
  }

  function planter(x: number, y: number, width: number, color: string) {
    rect(x, y, width, 7, '#9aa79b', '#6d8577')
    for (let index = 0; index < Math.floor(width / 8); index++) {
      disc(x + 4 + index * 8, y - 2 - index % 3, 4 + index % 3, color)
    }
  }

  function pipe(points: number[][], width: number, color = '#789e98') {
    path(points, '#405f5d', width + 2)
    path(points, color, width)
    path(points.map(([x, y]) => [x - width * .18, y - width * .18]), '#f6ffed6c', Math.max(1, width * .19))
  }

  function positionOnPipe(points: number[][], fraction: number) {
    const segments = points.slice(1).map(([x, y], index) =>
      Math.hypot(x - points[index][0], y - points[index][1]))
    let distance = fraction * segments.reduce((sum, length) => sum + length, 0)
    for (const [index, length] of segments.entries()) {
      if (length && distance <= length) {
        const [x, y] = points[index]
        const [endX, endY] = points[index + 1]
        return { index, point: [x + (endX - x) * distance / length, y + (endY - y) * distance / length] }
      }
      distance -= length
    }
    return { index: points.length - 2, point: points[points.length - 1] }
  }

  function pointOnPipe(points: number[][], fraction: number) {
    return positionOnPipe(points, fraction).point
  }

  function flow(points: number[][], color: string) {
    path(points, color, 3.5)
    for (let index = 0; index < 7; index++) {
      const fraction = ((moving ? actionTime * .62 : .04) + index / 7) % 1
      const [x, y] = pointOnPipe(points, fraction)
      if (moving) disc(x, y, 3.2, '#f6fff2')
      else {
        const [nextX, nextY] = pointOnPipe(points, Math.min(1, fraction + .01))
        const angle = Math.atan2(nextY - y, nextX - x)
        path([
          [x - Math.cos(angle - .65) * 5, y - Math.sin(angle - .65) * 5],
          [x, y],
          [x - Math.cos(angle + .65) * 5, y - Math.sin(angle + .65) * 5],
        ], '#f6fff2', 1.7)
      }
    }
  }

  function valve(x: number, y: number, color: string) {
    polygon([[x - 6,y - 4],[x + 6,y + 4],[x + 6,y - 4],[x - 6,y + 4]], color, '#4c6866')
    path([[x,y],[x,y - 7],[x + 5,y - 7]], '#405f5d', 1.5)
  }

  function gauge(x: number, y: number, angle: number) {
    disc(x, y, 8, '#486968')
    disc(x, y, 6.2, '#f5f7e9')
    path([[x,y],[x + Math.cos(angle) * 4,y + Math.sin(angle) * 4]], '#b77a5e', 1.4)
    disc(x, y, 1.2, ink)
  }

  function cabinet(x: number, y: number, width: number, color: string, alert = false) {
    rect(x + 3, y + 4, width, 47, '#b2c7bb')
    rect(x, y, width, 47, color, '#4b6967')
    rect(x + 5, y + 7, width - 10, 14, '#3e6663', '#718c81')
    rect(x + 7, y + 9, width - 14, 10, alert ? '#eab397' : '#abc7a6')
    path([[x+9,y+15],[x+13,y+15],[x+16,y+12],[x+19,y+15],[x+width-8,y+15]], alert ? '#a55239' : '#4d7663', 1)
    disc(x + 8, y + 30, 2.5, alert ? '#b8583c' : '#80a887')
    disc(x + 14, y + 30, 2, '#e2c798')
    rect(x + width - 6, y + 28, 2, 8, '#486562')
    path([[x + 5,y + 38],[x + width - 5,y + 38]], '#819991', 1)
  }

  function verticalPump(x: number, floor: number, color: string, size = 1, running = 0) {
    ctx.save()
    ctx.translate(x, floor)
    ctx.scale(size, size)
    rect(-10, -55, 20, 40, shade(-10,-55,10,-15,'#b7cdc1','#6b8f87'), '#4f7771')
    rect(-12, -65, 24, 19, color, '#3c645f')
    rect(-9, -69, 18, 4, '#a4c4b4', '#4c7269')
    for (const y of [-47,-39,-31,-23]) rect(-11,y,22,2,'#d6e3d7', '#789b92')
    rect(-14, -15, 28, 12, color, '#3c645f')
    rect(-16, -3, 32, 3, '#546f68')
    rect(-11, -64, 22, 4, mix('345c5c', 'c2efb1', running))
    if (running) {
      ctx.globalAlpha = running
      const offset = moving ? (actionTime * 40) % 19 : 8
      path([[-8,-61 + offset],[8,-61 + offset]], '#e6f7ca', 2)
    }
    ctx.restore()
  }

  function apartment(x: number, y: number, w: number, h: number, wall: string, right: string, rows: number, columns: number, main = false) {
    const depth = main ? 74 : 28
    const tilt = main ? 34 : 14
    polygon([[x,y],[x + depth,y - tilt],[x + w + depth,y - tilt],[x + w,y]], '#d8e3d8', ink)
    polygon([[x + w,y],[x + w + depth,y - tilt],[x + w + depth,y + h - tilt],[x + w,y + h]], right, ink)
    rect(x, y, w, h, shade(x,y,x + w,y + h,wall,main ? '#bccabe' : right), ink)
    rect(x, y, w, main ? 6 : 4, '#e8eee3', '#78988a')
    const roofEdge = x + w * .13
    const equipmentY = y - tilt - (main ? 11 : 4)
    rect(roofEdge, equipmentY, main ? 61 : 28, main ? 27 : 13, '#ccdacf', '#69867e')
    rect(roofEdge - 2, equipmentY - 3, main ? 66 : 32, 4, '#e0e9dd', '#69867e')
    if (main) {
      const aerial = x + w * .68
      path([[aerial,y - 10],[aerial,y - 63],[aerial + 19,y - 63]], '#576d67', 1.7)
      path([[aerial - 12,y - 51],[aerial + 19,y - 51]], '#576d67', 1.2)
      for (let column = 1; column < columns; column++) {
        const joint = x + column * (w / columns)
        path([[joint,y + 7],[joint,y + h - 1]], '#819b8a66', 1)
      }
    }
    const pitchX = w / columns
    const pitchY = (h - (main ? 29 : 12)) / rows

    for (let row = 0; row < rows; row++) {
      const sill = y + (row + 1) * pitchY
      path([[x,sill],[x + w,sill],[x + w + depth,sill - tilt]], main ? '#8ba89b' : '#96aaa0', 1)
      if (main) path([[x,sill + 3],[x + w,sill + 3]], '#f4f5ebaa', 1.2)
      for (let column = 0; column < columns; column++) {
        const lit = main && (row + 2 * column) % 5 < dusk * 4
        const waterUse = main && (row * 1.5 + column * 2) / 12 < clear * (1 - dusk * .6)
        const left = x + column * pitchX + pitchX * .19
        const top = y + row * pitchY + pitchY * .22
        const glassW = pitchX * .62
        const glassH = pitchY * .55
        rect(left - 2, top - 2, glassW + 5, glassH + 5, '#eef1e7')
        rect(left, top, glassW, glassH, lit ? '#efcc8b' : waterUse ? '#7cb4a8' : '#93b9c1', '#597d7e')
        polygon([[left+3,top+3],[left+glassW*.4,top+3],[left+glassW*.24,top+glassH-3],[left+3,top+glassH-3]], '#e5f1eb5e')
        path([[left + glassW * .49,top + 1],[left + glassW * .49,top + glassH - 1]], '#dce9df', 1.5)
        rect(left - 3, top + glassH + 1, glassW + 6, 2.8, '#78968d')
        if (main) {
          const detail = (row * 3 + column) % 5
          if (detail === 0 || detail === 3) {
            polygon([[left+glassW-3,top+1],[left+glassW*.62,top+1],[left+glassW*.73,top+glassH-2],[left+glassW-3,top+glassH-2]], '#e5e5d3ae')
          }
          if (column === 0 || column === 2 || (column === 4 && row > 1)) {
            railing(left - 4, top + glassH - 5, glassW + 9)
            if (detail === 1 || detail === 4) planter(left + glassW * .69, top + glassH + 3, 15, '#637f61')
          }
        }
      }
      if (main) {
        const sideTop = y + row * pitchY + 14
        polygon([[x + w + 15,sideTop],[x + w + 52,sideTop - 17],[x + w + 52,sideTop + 3],[x + w + 15,sideTop + 20]], '#8baca9', '#63857e')
        path([[x + w + 34,sideTop - 8],[x + w + 34,sideTop + 11]], '#d7e8e0', 1.4)
      }
    }
    if (main) {
      const entrance = x + w * .44
      const floor = y + h
      rect(entrance - 9, floor - 37, 71, 37, '#7e9c91', ink)
      rect(entrance - 3, floor - 29, 59, 29, dusk > .3 ? '#e4d2a4' : '#a1bfba', '#527c72')
      path([[entrance + 25,floor - 29],[entrance + 25,floor]], '#396960', 1.5)
      path([[entrance + 20,floor - 17],[entrance + 20,floor - 12]], '#e8f1e6', 1.7)
      path([[entrance + 30,floor - 17],[entrance + 30,floor - 12]], '#e8f1e6', 1.7)
      rect(entrance - 14, floor - 39, 81, 5, '#dfebe0', '#637f73')
      planter(x + 31, floor - 10, 44, '#739479')
      planter(x + w - 84, floor - 10, 48, '#739479')
    }
  }

  ctx.clearRect(0, 0, sceneWidth, sceneHeight)
  ctx.save()
  ctx.translate(sceneOffsetX, 0)
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  const skyFill = ctx.createLinearGradient(0, 0, 0, 435)
  skyFill.addColorStop(0, sky)
  skyFill.addColorStop(1, horizon)
  ctx.fillStyle = skyFill
  ctx.fillRect(west, 0, sceneWidth, 448)

  const sunX = 306 - dusk * 96
  const sunY = 107 + dusk * 183
  ctx.globalAlpha = .64 * (1 - weather) + clear * .36
  disc(sunX, sunY, 42, '#f5d89e')
  ctx.globalAlpha = 1
  for (let i = 0; i < 10; i++) {
    const x = west + ((i * 413 + 132 + time * (moving ? 4 : 0)) % (sceneWidth + 180)) - 80
    const y = 76 + i % 3 * 42
    const cloud = mix('eef2e9', '738f99', weather * .70 + dusk * .18)
    ctx.globalAlpha = .36 + weather * .44
    ctx.beginPath()
    ctx.moveTo(x - 82, y + 18)
    ctx.bezierCurveTo(x - 67, y, x - 48, y - 1, x - 30, y + 3)
    ctx.bezierCurveTo(x - 36, y - 28, x + 13, y - 43, x + 34, y - 14)
    ctx.bezierCurveTo(x + 55, y - 15, x + 67, y - 5, x + 73, y + 6)
    ctx.bezierCurveTo(x + 105, y + 3, x + 127, y + 14, x + 124, y + 21)
    ctx.bezierCurveTo(x + 84, y + 29, x - 62, y + 28, x - 82, y + 18)
    ctx.fillStyle = cloud
    ctx.fill()
    ctx.globalAlpha = 1
  }

  // Backdrop and street remain the same place as the weather and light change.
  for (let i = 0; i < 34; i++) {
    const h = 42 + (i * 53 % 111)
    const x = west + i * 119 - 25
    rect(x, 384 - h, 95 + i % 3 * 5, h, mix('a8c5bc', '687e83', dusk * .78))
    rect(x + 20, 381 - h, 55, h, mix('bad1c6', '819292', dusk * .70))
    for (let row = 0; row < 3; row++) rect(x + 28, 397 - h + row * 23, 32, 4, '#c7d7c9')
  }
  polygon([[west,369],[-630,380],[0,386],[309,365],[542,392],[811,369],[1130,382],[1440,361],[2055,377],[east,363],[east,455],[west,455]], '#b4cabe')
  apartment(-1050, 239, 192, 184, '#d0ddd0', '#aebeb2', 4, 4)
  apartment(-795, 285, 176, 136, '#e0dbcb', '#b8b9a9', 3, 4)
  apartment(-548, 208, 214, 214, '#d7e2db', '#abbeb5', 5, 5)
  apartment(-270, 272, 174, 149, '#d6d9c6', '#b7beae', 4, 4)
  apartment(52, 247, 181, 175, '#d8d5bd', '#b7b7a2', 4, 4)
  apartment(271, 279, 168, 140, '#d7e0d4', '#b8cbc1', 3, 4)
  apartment(1142, 238, 187, 176, '#d3d9c7', '#acbbae', 4, 4)
  apartment(1377, 292, 142, 115, '#d9ded0', '#acbbae', 3, 3)
  apartment(1592, 219, 232, 202, '#e5e1d1', '#acbcae', 5, 5)
  apartment(1902, 277, 167, 145, '#ceddd3', '#a6b9af', 3, 4)
  apartment(2158, 240, 205, 182, '#d9decd', '#b8bfae', 4, 5)
  apartment(2427, 283, 160, 137, '#d7e3d8', '#a5bcb1', 3, 4)
  rect(west, 421, sceneWidth, 25, '#e6ece0')
  path([[west,425],[east,425]], '#a4b5a6', 1)
  for (let x = west + 9; x < east; x += 26) path([[x,427],[x - 8,445]], '#bac9b9', 1)
  rect(west, 446, sceneWidth, 56, mix('91a9a6', '657889', dusk * .65))
  rect(west, 502, sceneWidth, 15, '#c8d6ce')
  rect(west, 502, sceneWidth, 3, '#e8ede0')
  for (let x = west; x < east; x += 33) path([[x,503],[x + 4,513]], '#9bafa5', .9)
  if (weather > .14) {
    ctx.globalAlpha = weather * .5
    for (let i = 0; i < 30; i++) {
      const x = west + (i * 139 + 48) % sceneWidth
      const y = 452 + i % 6 * 8
      path([[x,y],[x + 28 + i % 4 * 6,y]], '#dcebe080', 2.5)
    }
    ctx.globalAlpha = 1
  }
  for (let x = west; x < east; x += 84) rect(x, 470, 44, 3, '#e7ede1')
  for (let x = 181; x < 280; x += 15) rect(x, 453, 7, 41, '#dde8df')
  rect(west, 517, sceneWidth, 343, '#aebeb3')
  polygon([[west,517],[east,517],[east,727],[2070,750],[1440,729],[1180,742],[864,712],[579,745],[291,699],[0,728],[-580,749],[west,701]], '#b7c4b7')
  polygon([[west,731],[-630,746],[0,736],[389,702],[580,751],[865,723],[1240,755],[1440,741],[1970,768],[east,731],[east,860],[west,860]], '#a3b8ae')
  for (let i = 0; i < 56; i++) {
    const x = west + (i * 133.6 + 17) % sceneWidth
    const y = 574 + (i * 71.3 % 260)
    path([[x,y],[x + 21,y - 5],[x + 42,y - 4]], '#8da99b', 1)
  }
  for (let i = 0; i < 50; i++) {
    const x = west + (i * 153.9 + 34) % sceneWidth
    const y = 547 + i * 53.7 % 279
    polygon([[x,y],[x + 7,y - 4],[x + 12,y],[x + 8,y + 4],[x + 3,y + 3]], i % 3 ? '#94ab9e' : '#c3d0c1')
  }
  path([[1166,511],[1166,527],[1192,553],[1192,621]], '#586e65', 8)
  path([[1166,511],[1166,527],[1192,553],[1192,621]], '#a9c2b3', 4)
  rect(1154, 506, 24, 7, '#59776b')
  for (let col = 0; col < 4; col++) rect(1157 + col * 5, 508, 2, 3, '#b7cfbe')
  tree(375, 443, 56, '#779e86')
  tree(474, 444, 43, '#8cad87')
  tree(1084, 447, 65, '#779d89')
  tree(1363, 442, 57, '#739783')
  for (const [x, size] of [[-1116,72],[-837,56],[-585,64],[-302,48],[-81,70],[1535,57],[1865,75],[2110,55],[2410,61],[2585,78]]) {
    tree(x, 440, size, '#739582')
    planter(x + 15, 437, 46, '#6d9277')
  }
  apartment(548, 189, 467, 254, '#e9e9d9', '#b4c8bc', 4, 5, true)
  rect(532, 443, 551, 6, '#edf0e2')
  rect(746, 389, 57, 15, '#e4ece0', '#8cab9e')
  label('A BLOK', 774, 402)
  planter(305, 438, 61, '#779b75')
  planter(1118, 437, 100, '#7c9b7a')
  rect(1241, 427, 47, 4, '#6f8b78', '#597466')
  rect(1242, 417, 46, 4, '#8f9e7d', '#6a846c')
  path([[1246,420],[1246,437],[1279,437],[1279,420]], '#627a69', 2)

  function lamp(x: number) {
    path([[x,447],[x,380],[x + 16,369],[x + 24,369]], '#556c6b', 3)
    polygon([[x + 16,368],[x + 32,368],[x + 29,373],[x + 18,373]], '#6c8783')
    if (dusk > .15) disc(x + 24,369,7,'#f6dfa9')
  }
  ;[-963, -685, -385, -125, 114, 494, 1095, 1347, 1553, 1873, 2140, 2463].forEach(lamp)

  const vanX = moving ? west + (time * 36 + 1516) % (sceneWidth + 90) - 75 : 283
  rect(vanX + 2, 480, 62, 3, '#4c6662')
  rect(vanX, 458, 64, 21, '#326966', '#244d4e')
  polygon([[vanX + 9,458],[vanX + 20,445],[vanX + 46,445],[vanX + 55,458]], '#e3ede7', ink)
  polygon([[vanX + 14,456],[vanX + 21,447],[vanX + 33,447],[vanX + 33,456]], '#89afb5')
  polygon([[vanX + 37,447],[vanX + 45,447],[vanX + 51,456],[vanX + 37,456]], '#89afb5')
  rect(vanX + 62, 462, 4, 5, '#f1dcad')
  for (const x of [vanX + 13, vanX + 50]) {
    disc(x,480,6.5,'#30484b')
    disc(x,480,2.5,'#a9bfba')
  }

  for (let index = 0; index < 4; index++) {
    const x = 413 + (index * 58 + time * (moving ? 16 : 0)) % 417
    const y = 452 + index % 2 * 3
    ctx.globalAlpha = index === 0 ? 1 : .2 + clear * .8
    disc(x,y - 15,3,'#4c5c51')
    path([[x,y - 11],[x,y - 4],[x - 4,y],[x,y - 4],[x + 4,y]], index % 2 ? '#9e7768' : '#466b65', 2.8)
    if (weather > .3) path([[x - 7,y - 17],[x - 4,y - 20],[x + 3,y - 20],[x + 7,y - 17]], '#538f89', 2.5)
    ctx.globalAlpha = 1
  }

  rect(542, 525, 679, 231, shade(542,525,542,756,'#e2eae0','#b0c4b8'), ink)
  polygon([[542,525],[593,506],[1269,506],[1221,525]], '#9aafa4', ink)
  polygon([[1221,525],[1269,506],[1269,730],[1221,756]], '#97aca3', ink)
  rect(451, 572, 81, 151, '#c5d5d0', '#5a7d79')
  rect(459, 582, 65, 130, shade(459,582,524,712,'#e0ece8','#9ab8b3'), '#698d84')
  const reserve = 632
  polygon([
    [459,reserve + 1],[472,reserve - 1],[488,reserve + 1],[504,reserve - 1],[524,reserve + 1],
    [524,712],[459,712],
  ], '#80aeb2')
  path([[460,670],[522,670]], '#5b7f83', 1)
  for (let step = 0; step < 8; step++) {
    const y = 585 + step * 18
    path([[530,y],[544,y]], '#637d74', 1.2)
  }
  path([[530,577],[530,719]], '#637d74', 1.4)
  path([[544,577],[544,719]], '#637d74', 1.4)
  pipe([[523,696],[563,696],[563,678],[636,678]], 7)
  ctx.font = '700 10px "Segoe UI", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = deep
  ctx.fillText('YANGIN REZERVİ', 492, 605)
  rect(562, 550, 639, 176, shade(562,550,562,726,'#e8eee3','#cbd8cb'), '#789b8d')
  rect(562, 550, 639, 12, '#a6bab0')
  rect(562, 699, 639, 27, '#a6bcaf')
  rect(562, 725, 639, 7, '#dce7da', '#8fac9e')
  for (let col = 0; col < 8; col++) {
    const x = 580 + col * 83
    path([[x,563],[x,698]], '#b5c8bb', 1)
  }
  for (const y of [617,673]) path([[562,y],[1201,y]], '#b4c8ba', 1)
  for (let col = 0; col < 11; col++) {
    const x = 581 + col * 55
    path([[x,700],[x + 16,724]], '#819d91', 1)
  }
  for (const x of [767, 954, 1118]) {
    rect(x, 554, 11, 146, '#bbcdbf')
    rect(x, 554, 3, 146, '#e2eadf')
    rect(x + 9, 554, 2, 146, '#8da99b')
  }
  for (const x of [633, 846, 1024]) {
    path([[x,551],[x,563],[x+60,563],[x+60,551]], '#778f83', 1.2)
    rect(x, 561, 60, 5, '#eff3de', '#9eb1a1')
  }

  const fireColor = mix('ab5947', 'bd4e39', dusk)
  const boosterColor = mix('567e91', '387f9c', clear * (1 - dusk))
  const drainColor = mix('719f89', '527d66', weather)
  pipe([[574,581],[622,581],[622,620],[689,620],[689,657],[743,657]], 8, fireColor)
  pipe([[794,597],[794,582],[921,582],[921,625]], 8, boosterColor)
  pipe([[974,654],[974,579],[1134,579],[1134,627],[1168,627]], 8, drainColor)
  for (const [x,y] of [[622,601],[794,590],[890,582],[974,620],[1134,611]]) {
    rect(x - 3, y - 5, 6, 10, '#9fbdb1','#5e8278')
  }
  path([[687,618],[687,607]], '#58726a', 2)
  gauge(687, 604, dusk * 1.7 - 1.3)
  path([[904,581],[904,574]], '#58726a', 2)
  gauge(904, 573, -2.45 + (bar - 2.6) * 2.45)
  // Valves belong to the pipework, below every label drawn later.
  valve(649, 620, '#bc6656')
  valve(831, 582, '#79afbe')
  valve(1028, 579, '#88bc9e')

  rect(628, 681, 119, 11, '#d2ddd1', '#6e8f81')
  rect(638, 650, 53, 28, shade(638,650,638,678,'#b3c9b7','#73958a'), '#50776d')
  for (let rib = 0; rib < 5; rib++) rect(643 + rib * 8, 650, 2, 26, '#d9e7d7', '#809f91')
  rect(689, 658, 16, 12, '#9bb8ab', '#527970')
  disc(714, 663, 17, '#52776e')
  disc(714, 663, 13, fireColor)
  disc(714, 663, 5, paper)
  if (fireFlow) {
    ctx.globalAlpha = fireFlow
    const angle = (moving ? actionTime : .3) * 11
    path([[714 - Math.cos(angle) * 9,663 - Math.sin(angle) * 9],
      [714 + Math.cos(angle) * 9,663 + Math.sin(angle) * 9]], '#fff0dc', 2.6)
    ctx.globalAlpha = 1
  }
  rect(713, 676, 18, 5, '#6f9086')
  cabinet(580, 620, 34, '#b98d7d', dusk > .43)
  label('Yangın seti', 686, 719)

  rect(788, 681, 144, 11, '#d1dcd0', '#6f8f81')
  pipe([[793,674],[923,674]], 6, boosterColor)
  for (const x of [810, 853, 896]) {
    pipe([[x,628],[x,611],[916,611]], 4.2, boosterColor)
    verticalPump(x, 680, boosterColor, .79, pressure && x === 853 ? flowVisibility : 0)
  }
  cabinet(916, 623, 29, '#9fbabc')
  label('Hidrofor', 863, 719)

  rect(987, 681, 122, 11, '#d1dcd0', '#6f8f81')
  for (const x of [1010, 1064]) {
    pipe([[x,639],[x,613],[1105,613],[1105,580]], 5, drainColor)
    verticalPump(x, 680, drainColor, .70, drainage && x === 1064 ? flowVisibility : 0)
  }
  cabinet(1086, 628, 30, '#a8bfad')
  label('Atık su', 1046, 719)

  const activeFlow = [
    { x: 622, y: 586, intensity: dusk * (1 - visibility) },
    { x: 853, y: 614, intensity: clear * (1 - dusk) * (1 - visibility) },
    { x: 1134, y: 584, intensity: weather * (1 - visibility) },
  ]
  for (const { x, y, intensity } of activeFlow) {
    if (intensity < .09) continue
    ctx.globalAlpha = intensity
    for (let drop = 0; drop < 3; drop++) disc(x, y + (time * 33 + drop * 11) % 33, 2.55, '#e2ffe5')
    ctx.globalAlpha = 1
  }

  rect(1138, 592, 58, 151, '#aec5b9', ink)
  rect(1143, 595, 48, 143, shade(1143,592,1191,592,'#e2eee4','#aac4ba'), ink)
  const waterY = 702 - level * 1.13
  const drainBottom = 733
  const shaftFloor = Math.max(waterY + 11, drainBottom - 6)
  path([[1169,625],[1169,shaftFloor]], '#8ba89b', 2.2)
  rect(1164, shaftFloor - 8, 10, 10, '#507e72', '#446c62')
  polygon([
    ...Array.from({ length: 11 }, (_, i) => [1148 + i * 4, waterY + Math.sin(i * .75 + time * 3) * 1.5]),
    [1188,drainBottom],[1148,drainBottom],
  ], '#5ba898c9')
  for (let scale = 0; scale < 6; scale++) {
    const y = 601 + scale * 17
    path([[1144,y],[1150 + (scale % 2) * 4,y]], '#567d72', 1.2)
  }
  path([[1150,646],[1187,646]], '#537f72', 1.2)
  path([[1151,waterY + 2],[1162,waterY + 3],[1174,waterY + 1],[1187,waterY + 2]], '#c9e9d9', 1.5)
  label('Kuyu', 1168, 754)

  if (weather > .13) {
    ctx.globalAlpha = Math.min(1, weather * 1.65)
    path([[1166,511],[1166,527],[1192,553],[1192,621]], '#3a8f81', 3.2)
    for (let drop = 0; drop < 4; drop++) {
      const travel = (time * 67 + drop * 28) % 118
      const x = 1166 + Math.min(26, Math.max(0, travel - 16))
      disc(x, 511 + travel * .92, 2.55, '#cff5e4')
    }
    if (!drainage || diagnostic > 0) {
      if (drainage) ctx.globalAlpha *= diagnostic
      path([[1189,waterY],[1210,waterY],[1210,625],[1217,625]], '#2b7d71', 2)
      sceneTag('Drenaj kuyusu', '%' + Math.round(level), 1217, 602, 111, '#126755')
    }
    ctx.globalAlpha = 1
  }

  if (clear > .04 && dusk < .95 && (!pressure || diagnostic > 0)) {
    const pressureDrop = Math.max(0, (3.4 - bar) / .8)
    ctx.globalAlpha = Math.min(1, clear * 1.9) * (1 - dusk * .9) * (pressure ? diagnostic : 1)
    rect(566, 236, 212, 104, '#f3f7ee', '#688e83')
    rect(583, 283, 177, 10, '#d4e9de')
    path([[583,293],[760,293]], '#7da696', 1.2)
    path([[583,288],[626,288],[667,288],[715,288 + 14 * pressureDrop],[759,288 + 30 * pressureDrop]], '#267a6c', 3)
    disc(759, 288 + 30 * pressureDrop, 4.3, '#1d7565')
    label('Üst kat · ' + bar.toFixed(1).replace('.', ',') + ' bar', 671,264)
    ctx.globalAlpha = 1
  }

  if (dusk > .27) {
    ctx.globalAlpha = Math.max(0, (dusk - .27) / .73)
    const driftTime = moving ? time : .3
    for (let i = 0; i < 8; i++) {
      const lift = (driftTime * 27 + i * 16) % 118
      disc(967 + lift * .31, 291 - lift, 8 + lift * .094, 'rgba(83,94,97,.34)')
    }
    rect(967,275,29,4,'#b46244')
    if (!fire || diagnostic > 0) {
      ctx.save()
      if (fire) ctx.globalAlpha *= diagnostic
      path([[594,641],[615,641],[615,612],[630,612]], '#a95d46', 2)
      sceneTag('Yangın paneli', 'Alarm', 630, 587, 115, '#93513b')
      ctx.restore()
    }
    path([[982,263],[1006,263],[1018,246]], '#a95d46', 2)
    sceneTag('A Blok', 'Duman', 1018, 216, 102, '#93513b')
    ctx.globalAlpha = 1
  }


  if (introduce) {
    ctx.globalAlpha = introduce
    const agents = [
      ['fire', 'Panel durumu', 576, 836],
      ['pressure', 'Basınç', 781, 872],
      ['drainage', 'Kuyu seviyesi', 1002, 907],
    ] as const
    for (const [kind, reading, x, to] of agents) {
      const anchor = x + 64
      const signal = [[anchor,541],[anchor,533],[to,533],[to,520]].filter(([x, y], i, points) =>
        i === 0 || x !== points[i - 1][0] || y !== points[i - 1][1])
      agentLink(signal, moving ? .1 + ((time * .48 + x / 10) % 1) * .82 : .82, agentIdentity[kind].color)
      agentMarker(kind, reading, x, 541)
    }
    agentMarker('chief', 'Ölçümleri toplar', 805, 488)
    ctx.globalAlpha = 1
  }

  if (drainage && visibility > 0) {
    const suction = [[1169,723],[1169,692],[1064,692],[1064,672]]
    const outlet = [[1064,639],[1064,613],[1105,613],[1105,579],[1134,579],[1134,523],[1299,523]]
    ctx.globalAlpha = visibility
    pipe(suction, 6, '#719f89')
    pipe(outlet, 7, '#719f89')
    if (flowVisibility) {
      ctx.globalAlpha = flowVisibility
      flow(suction, '#278c70')
      flow(outlet, '#278c70')
    }
    ctx.globalAlpha = readingVisibility
    path([[1190,waterY],[1211,waterY],[1211,626],[1220,626]], '#126755', 2)
    sceneTag('Kuyu seviyesi', '%' + Math.round(level), 1220, 602, 116, '#126755')
    label('Tahliye hattı', 1240, 517)
    ctx.globalAlpha = visibility
    assignment('drainage', 'Tahliyeyi uygula', [1180,550], [990,548],
      [[1180,565],[1146,565],[1146,564],[1118,564]])
  }

  if (pressure && visibility > 0) {
    const riser = [[853,628],[853,611],[921,611],[921,582],[903,582],[903,260],[774,260]]
    const { index, point } = positionOnPipe(riser, smooth(Math.min(1, reveal / .85)))
    const visibleRiser = [...riser.slice(0, index + 1), point]
    ctx.globalAlpha = visibility
    pipe(visibleRiser, 6, '#567e91')
    for (const y of [309, 356]) {
      const branch = smooth((y - point[1]) / 35)
      if (branch > 0) pipe([[903,y],[903 - 40 * branch,y]], 4, '#567e91')
    }
    if (flowVisibility) {
      ctx.globalAlpha = flowVisibility
      flow(visibleRiser, '#217da5')
    }
    ctx.globalAlpha = visibility * smooth((535 - point[1]) / 40)
    gauge(903, 535, -2.45 + (bar - 2.6) * 2.45)
    ctx.globalAlpha = readingVisibility
    sceneTag('Üst kat basıncı', bar.toFixed(1).replace('.', ',') + ' bar', 615, 236, 155, '#215d77')
    label('Üst kat hattı', 825, 248, '#215d77')
    ctx.globalAlpha = visibility
    assignment('pressure', 'Desteği uygula', [640,521], [779,553],
      [[704,553],[704,569],[779,569]])
  }

  if (fire && visibility > 0) {
    const supply = [[523,696],[563,696],[563,678],[636,678],[636,663],[714,663],[714,657],[689,657],[689,620],[622,620],[622,581],[574,581]]
    if (fireFlow) {
      ctx.globalAlpha = fireFlow
      flow(supply, '#ad523b')
    }
    ctx.globalAlpha = visibility
    const alarmReading = [[594,638],[558,638],[558,571],[578,571]]
    agentLink(alarmReading, .85, '#963f35')
    const notification = [[706,578],[741,578],[741,566],[839,566]]
    agentLink(notification, .12 + travel * .78, '#1a6755')
    assignment('fire', 'Alarmı ilet', [729,510], [578,555],
      [[729,525],[717,525],[717,560],[706,560]])
    label('Yerel panel', 591, 689, '#923d33')
    ctx.globalAlpha = readingVisibility
    sceneTag('Teknik ekip', progress >= 1 ? 'Teslim edildi' : travel > 0 ? 'İletiliyor' : 'Sırada', 733, 594, 149, '#1a6755')
    rect(839, 546, 30, 42, '#1e6556', '#164a42')
    rect(843, 551, 22, 28, '#e3f5e6')
    if (progress >= 1) path([[847,566],[852,570],[861,559]], '#218067', 2.8)
    else path([[849,560],[859,560],[859,566],[849,566],[849,560]], '#256d60', 1.4)
    disc(854, 584, 1.5, '#daefe0')
  }

  ctx.globalAlpha = weather * .8
  for (let i = 0; i < 220; i++) {
    const x = west + (i * 197.3 + 41) % sceneWidth
    const y = (i * 73.4 + time * (moving ? 227 + i % 7 * 18 : 0)) % 439
    path([[x,y],[x - 6,Math.min(445,y + 15 + i % 5)]], '#e2f5f1', 1.4)
  }
  ctx.restore()
}
