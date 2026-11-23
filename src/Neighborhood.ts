export const sceneWidth = 1440
export const sceneHeight = 860

export type Neighborhood = {
  rain: number
  clear: number
  dusk: number
  time: number
  moving: boolean
}

function mix(first: string, second: string, factor: number) {
  const channels = [0, 2, 4].map((offset) => {
    const from = parseInt(first.slice(offset, offset + 2), 16)
    const to = parseInt(second.slice(offset, offset + 2), 16)
    return Math.round(from + (to - from) * factor)
  })
  return 'rgb(' + channels.join(',') + ')'
}

export function drawNeighborhood(ctx: CanvasRenderingContext2D, { rain, clear, dusk, time, moving }: Neighborhood) {
  const ink = '#365556'
  const paper = '#edf3e9'
  const mint = '#6fb2a2'
  const deep = '#1c5a54'
  const weather = rain * (1 - clear)
  const level = 36 + 42 * rain - 17 * clear - 17 * dusk
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

  function rect(x: number, y: number, width: number, height: number, fill: string, stroke?: string) {
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

  function label(value: string, x: number, y: number, color = deep) {
    ctx.font = '600 17px "Segoe UI", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillStyle = color
    ctx.fillText(value, x, y)
  }

  function tree(x: number, y: number, size: number, shrub: string) {
    path([[x, y], [x, y - size * .8], [x - size * .24, y - size]], '#655e48', Math.max(2, size * .065))
    disc(x - size * .25, y - size, size * .34, shrub)
    disc(x + size * .25, y - size * .97, size * .32, shrub)
    disc(x, y - size * 1.25, size * .39, shrub)
    path([[x,y - size * .55], [x + size * .35,y - size]], '#456f63', 1.5)
  }

  function apartment(x: number, y: number, w: number, h: number, wall: string, right: string, rows: number, columns: number, main = false) {
    const depth = main ? 74 : 28
    const tilt = main ? 34 : 14
    polygon([[x,y],[x + depth,y - tilt],[x + w + depth,y - tilt],[x + w,y]], '#d8e3d8', ink)
    polygon([[x + w,y],[x + w + depth,y - tilt],[x + w + depth,y + h - tilt],[x + w,y + h]], right, ink)
    rect(x, y, w, h, wall, ink)
    const pitchX = w / columns
    const pitchY = (h - (main ? 29 : 12)) / rows

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const lit = main && (row + 2 * column) % 5 < dusk * 4
        const waterUse = main && (row * 1.5 + column * 2) / 12 < clear * (1 - dusk * .6)
        const left = x + column * pitchX + pitchX * .19
        const top = y + row * pitchY + pitchY * .22
        rect(left, top, pitchX * .62, pitchY * .55, lit ? '#ffd99a' : waterUse ? '#79b9aa' : '#a9cbd0', '#608285')
        if (main) {
          path([[left + pitchX * .3, top],[left + pitchX * .3, top + pitchY * .55]], '#789d9f', 1)
          path([[left + 5,top + pitchY * .39],[left + 14,top + 5]], '#eaf8f4', 1.65)
          path([[left - 4,top + pitchY * .68],[left + pitchX * .67,top + pitchY * .68]], '#6b8a83', 2)
        }
      }
      if (main) path([[x + w,y + row * pitchY + pitchY * .86],[x + w + depth,y + row * pitchY + pitchY * .86 - tilt]], '#779a90', 1)
    }
    if (main) {
      rect(x + w * .46, y + h - 37, 49, 37, '#a5bdb3', ink)
      path([[x + w * .46 + 25,y + h - 37],[x + w * .46 + 25,y + h]], ink, 1.3)
    }
  }

  ctx.clearRect(0, 0, sceneWidth, sceneHeight)
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  const skyFill = ctx.createLinearGradient(0, 0, 0, 435)
  skyFill.addColorStop(0, sky)
  skyFill.addColorStop(1, horizon)
  rect(0, 0, sceneWidth, 448, '#edf4e8')
  ctx.fillStyle = skyFill
  ctx.fillRect(0, 0, sceneWidth, 448)

  const sunX = 306 - dusk * 96
  const sunY = 107 + dusk * 183
  ctx.globalAlpha = .64 * (1 - weather) + clear * .36
  disc(sunX, sunY, 42, '#f5d89e')
  ctx.globalAlpha = 1
  for (let i = 0; i < 5; i++) {
    const x = ((i * 327 + 132 + time * (moving ? 4 : 0)) % 1660) - 80
    const y = 76 + i % 3 * 42
    const cloud = mix('eef2e9', '738f99', weather * .70 + dusk * .18)
    ctx.globalAlpha = .36 + weather * .44
    const lobes = [[-31,y + 5,28],[0,y - 5,39],[36,y + 5,29],[63,y + 13,19]]
    lobes.forEach(([dx, cy, r]) => disc(x + dx, cy, r, cloud))
    ctx.globalAlpha = 1
  }

  // Backdrop and street remain the same place as the weather and light change.
  for (let i = 0; i < 13; i++) {
    const h = 42 + (i * 53 % 111)
    const x = i * 119 - 25
    rect(x, 384 - h, 95 + i % 3 * 5, h, mix('a8c5bc', '687e83', dusk * .78))
    rect(x + 20, 381 - h, 55, h, mix('bad1c6', '819292', dusk * .70))
    for (let row = 0; row < 3; row++) rect(x + 28, 397 - h + row * 23, 32, 4, '#c7d7c9')
  }
  polygon([[0,386],[309,365],[542,392],[811,369],[1130,382],[1440,361],[1440,455],[0,455]], '#b4cabe')
  apartment(52, 247, 181, 175, '#d8d5bd', '#b7b7a2', 4, 4)
  apartment(271, 279, 168, 140, '#d7e0d4', '#b8cbc1', 3, 4)
  apartment(1142, 238, 187, 176, '#d3d9c7', '#acbbae', 4, 4)
  apartment(1377, 292, 142, 115, '#d9ded0', '#acbbae', 3, 3)
  rect(0, 421, sceneWidth, 25, '#e6ece0')
  rect(0, 446, sceneWidth, 56, mix('91a9a6', '657889', dusk * .65))
  rect(0, 502, sceneWidth, 15, '#c8d6ce')
  for (let x = -16; x < sceneWidth; x += 84) rect(x, 470, 44, 3, '#e7ede1')
  for (let x = 181; x < 280; x += 15) rect(x, 453, 7, 41, '#dde8df')
  rect(0, 517, sceneWidth, 343, '#aebeb3')
  polygon([[0,517],[1440,517],[1440,729],[1180,742],[864,712],[579,745],[291,699],[0,728]], '#b7c4b7')
  polygon([[0,736],[389,702],[580,751],[865,723],[1240,755],[1440,741],[1440,860],[0,860]], '#a3b8ae')
  for (let i = 0; i < 23; i++) {
    const x = (i * 133.6 + 17) % 1439
    const y = 574 + (i * 71.3 % 260)
    path([[x,y],[x + 21,y - 5],[x + 42,y - 4]], '#8da99b', 1)
  }
  tree(375, 443, 56, '#779e86')
  tree(474, 444, 43, '#8cad87')
  tree(1084, 447, 65, '#779d89')
  tree(1363, 442, 57, '#739783')
  apartment(548, 189, 467, 254, '#e9e9d9', '#b4c8bc', 4, 5, true)
  rect(532, 443, 551, 6, '#edf0e2')
  label('A BLOK', 808, 437)

  function lamp(x: number) {
    path([[x,447],[x,380],[x + 16,369],[x + 24,369]], '#556c6b', 3)
    if (dusk > .15) disc(x + 24,369,7,'#f6dfa9')
  }
  ;[114, 494, 1095, 1347].forEach(lamp)

  const vanX = moving ? (time * 36 + 316) % 1635 - 100 : 283
  rect(vanX, 460, 55, 19, '#365e65')
  polygon([[vanX + 8,460],[vanX + 19,446],[vanX + 43,446],[vanX + 51,460]], '#e3ede7', ink)
  disc(vanX + 11,481,5,'#364f52')
  disc(vanX + 43,481,5,'#364f52')

  for (let index = 0; index < 4; index++) {
    const x = 413 + (index * 58 + time * (moving ? 16 : 0)) % 417
    const y = 452 + index % 2 * 3
    ctx.globalAlpha = index === 0 ? 1 : .2 + clear * .8
    disc(x,y - 15,3,'#4c5c51')
    path([[x,y - 11],[x,y - 4],[x - 4,y],[x,y - 4],[x + 4,y]], index % 2 ? '#9e7768' : '#466b65', 2.8)
    if (weather > .3) path([[x - 7,y - 17],[x - 4,y - 20],[x + 3,y - 20],[x + 7,y - 17]], '#538f89', 2.5)
    ctx.globalAlpha = 1
  }

  rect(542, 525, 679, 231, '#e2eae0', ink)
  polygon([[542,525],[593,506],[1269,506],[1221,525]], '#a7bdb2', ink)
  polygon([[1221,525],[1269,506],[1269,730],[1221,756]], '#a6bdb1', ink)
  rect(562, 552, 639, 174, '#f1f4ea', '#9bb7aa')
  path([[574,580],[1192,580]], '#bfd0c7', 13)
  path([[574,580],[1192,580]], '#548b80', 4)
  const positions = [690, 862, 1040]
  const names = ['Yangın', 'Hidrofor', 'Atık su']
  const emphasis = [dusk, clear * (1 - dusk), rain * (1 - clear)]
  positions.forEach((x, index) => {
    path([[x,583],[x,633]], '#9dbcb1', 13)
    path([[x,583],[x,635]], mix('619489', '158373', emphasis[index]), 4)
    rect(x - 45,681,91,7,'#9fbbb0')
    rect(x - 35,647,69,23,'#acc7bc',ink)
    disc(x,650,24,mix('8cb7a9', '2a8b79', emphasis[index]))
    disc(x,650,12,paper)
    label(names[index],x,714)
    if (moving && emphasis[index] > .12) {
      disc(x, 584 + ((time * 39 + index * 11) % 47), 3, '#b2eccf')
    }
  })

  rect(1147, 596, 42, 111, '#e5eee4', ink)
  const waterY = 702 - level * 1.13
  polygon([
    ...Array.from({ length: 11 }, (_, i) => [1148 + i * 4, waterY + Math.sin(i * .75 + time * 3) * 1.5]),
    [1188,705],[1148,705],
  ], '#6bb1a7')
  path([[1148,646],[1188,646]], '#597f70', 1.2)

  if (clear > .04 && dusk < .95) {
    const pressure = clear * (1 - dusk)
    ctx.globalAlpha = Math.min(1, clear * 1.9) * (1 - dusk * .9)
    rect(572, 87, 191, 79, '#f3f7ee', '#85a498')
    path([[587,133],[622,133],[657,135],[692,134 + 11 * pressure],[748,134 + 21 * pressure]], '#368d7e', 2.5)
    label('Üst kat basıncı', 667,115)
    ctx.globalAlpha = 1
  }

  rect(576, 623, 37, 64, '#e4eeea',ink)
  rect(583, 633, 23, 18, '#c4ddd2')
  disc(594,642,4,dusk > .43 ? '#b7543d' : mint)
  if (dusk > .27) {
    ctx.globalAlpha = Math.max(0, (dusk - .27) / .73)
    const driftTime = moving ? time : .3
    for (let i = 0; i < 8; i++) {
      const lift = (driftTime * 27 + i * 16) % 118
      disc(967 + lift * .31, 291 - lift, 8 + lift * .094, 'rgba(83,94,97,.34)')
    }
    rect(967,275,29,4,'#b46244')
    path([[594,624],[594,609],[650,609]], '#a95d46', 2)
    ctx.globalAlpha = 1
  }

  ctx.globalAlpha = weather * .8
  for (let i = 0; i < 98; i++) {
    const x = (i * 197.3 + 41) % sceneWidth
    const y = (i * 73.4 + time * (moving ? 227 + i % 7 * 18 : 0)) % 439
    path([[x,y],[x - 6,Math.min(445,y + 15 + i % 5)]], '#e2f5f1', 1.4)
  }
  ctx.globalAlpha = 1
}
