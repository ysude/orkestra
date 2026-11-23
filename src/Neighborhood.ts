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

  function verticalPump(x: number, floor: number, color: string, size = 1) {
    ctx.save()
    ctx.translate(x, floor)
    ctx.scale(size, size)
    rect(-10, -55, 20, 40, shade(-10,-55,10,-15,'#b7cdc1','#6b8f87'), '#4f7771')
    rect(-12, -65, 24, 19, color, '#3c645f')
    rect(-9, -69, 18, 4, '#a4c4b4', '#4c7269')
    for (const y of [-47,-39,-31,-23]) rect(-11,y,22,2,'#d6e3d7', '#789b92')
    rect(-14, -15, 28, 12, color, '#3c645f')
    rect(-16, -3, 32, 3, '#546f68')
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
  path([[0,425],[1440,425]], '#a4b5a6', 1)
  for (let x = 9; x < sceneWidth; x += 26) path([[x,427],[x - 8,445]], '#bac9b9', 1)
  rect(0, 446, sceneWidth, 56, mix('91a9a6', '657889', dusk * .65))
  rect(0, 502, sceneWidth, 15, '#c8d6ce')
  rect(0, 502, sceneWidth, 3, '#e8ede0')
  for (let x = 0; x < sceneWidth; x += 33) path([[x,503],[x + 4,513]], '#9bafa5', .9)
  if (weather > .14) {
    ctx.globalAlpha = weather * .5
    for (let i = 0; i < 14; i++) {
      const x = (i * 139 + 48) % sceneWidth
      const y = 452 + i % 6 * 8
      path([[x,y],[x + 28 + i % 4 * 6,y]], '#dcebe080', 2.5)
    }
    ctx.globalAlpha = 1
  }
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
  for (let i = 0; i < 26; i++) {
    const x = (i * 153.9 + 34) % sceneWidth
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
  ;[114, 494, 1095, 1347].forEach(lamp)

  const vanX = moving ? (time * 36 + 316) % 1635 - 100 : 283
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

  const fireColor = mix('a68672', 'bd6047', dusk)
  const boosterColor = mix('6e999c', '4d9398', clear * (1 - dusk))
  const drainColor = mix('719f89', '548f79', weather)
  pipe([[574,581],[622,581],[622,620],[689,620],[689,657],[743,657]], 8, fireColor)
  pipe([[794,597],[794,582],[921,582],[921,625]], 8, boosterColor)
  pipe([[974,654],[974,579],[1134,579],[1134,627],[1168,627]], 8, drainColor)
  for (const [x,y] of [[622,601],[794,590],[890,582],[974,620],[1134,611]]) {
    rect(x - 3, y - 5, 6, 10, '#9fbdb1','#5e8278')
  }
  path([[687,618],[687,607]], '#58726a', 2)
  gauge(687, 604, dusk * 1.7 - 1.3)
  path([[904,581],[904,574]], '#58726a', 2)
  gauge(904, 573, -.7 - clear * (1 - dusk) * 1.2)

  rect(628, 681, 119, 11, '#d2ddd1', '#6e8f81')
  rect(638, 650, 53, 28, shade(638,650,638,678,'#b3c9b7','#73958a'), '#50776d')
  for (let rib = 0; rib < 5; rib++) rect(643 + rib * 8, 650, 2, 26, '#d9e7d7', '#809f91')
  rect(689, 658, 16, 12, '#9bb8ab', '#527970')
  disc(714, 663, 17, '#52776e')
  disc(714, 663, 13, fireColor)
  disc(714, 663, 5, paper)
  rect(713, 676, 18, 5, '#6f9086')
  cabinet(580, 620, 34, '#b98d7d', dusk > .43)
  label('Yangın seti', 686, 719)

  rect(788, 681, 144, 11, '#d1dcd0', '#6f8f81')
  pipe([[793,674],[923,674]], 6, boosterColor)
  for (const x of [810, 853, 896]) {
    pipe([[x,628],[x,611],[916,611]], 4.2, boosterColor)
    verticalPump(x, 680, boosterColor, .79)
  }
  cabinet(916, 623, 29, '#9fbabc')
  label('Hidrofor', 863, 719)

  rect(987, 681, 122, 11, '#d1dcd0', '#6f8f81')
  for (const x of [1010, 1064]) {
    pipe([[x,639],[x,613],[1105,613],[1105,580]], 5, drainColor)
    verticalPump(x, 680, drainColor, .70)
  }
  cabinet(1086, 628, 30, '#a8bfad')
  label('Atık su', 1046, 719)

  const activeFlow = [
    { x: 622, y: 586, intensity: dusk },
    { x: 853, y: 614, intensity: clear * (1 - dusk) },
    { x: 1134, y: 584, intensity: weather },
  ]
  for (const { x, y, intensity } of activeFlow) {
    if (intensity < .09) continue
    ctx.globalAlpha = intensity
    for (let drop = 0; drop < 3; drop++) disc(x, y + (time * 33 + drop * 11) % 33, 2.55, '#e2ffe5')
    ctx.globalAlpha = 1
  }

  rect(1143, 592, 48, 117, shade(1143,592,1191,592,'#e2eee4','#aac4ba'), ink)
  const waterY = 702 - level * 1.13
  polygon([
    ...Array.from({ length: 11 }, (_, i) => [1148 + i * 4, waterY + Math.sin(i * .75 + time * 3) * 1.5]),
    [1188,705],[1148,705],
  ], '#6bb1a7')
  for (let scale = 0; scale < 6; scale++) {
    const y = 601 + scale * 17
    path([[1144,y],[1150 + (scale % 2) * 4,y]], '#567d72', 1.2)
  }
  path([[1150,646],[1187,646]], '#537f72', 1.2)
  path([[1151,waterY + 2],[1162,waterY + 3],[1174,waterY + 1],[1187,waterY + 2]], '#c9e9d9', 1.5)
  label('Kuyu', 1168, 719)

  if (weather > .13) {
    ctx.globalAlpha = Math.min(1, weather * 1.65)
    path([[1166,511],[1166,527],[1192,553],[1192,621]], '#3a8f81', 3.2)
    for (let drop = 0; drop < 4; drop++) {
      const travel = (time * 67 + drop * 28) % 118
      const x = 1166 + Math.min(26, Math.max(0, travel - 16))
      disc(x, 511 + travel * .92, 2.55, '#cff5e4')
    }
    path([[1189,waterY],[1210,waterY],[1210,625],[1217,625]], '#2b7d71', 2)
    sceneTag('Drenaj kuyusu', '%' + Math.round(level), 1217, 602, 111, '#126755')
    ctx.globalAlpha = 1
  }

  if (clear > .04 && dusk < .95) {
    const pressure = clear * (1 - dusk)
    ctx.globalAlpha = Math.min(1, clear * 1.9) * (1 - dusk * .9)
    rect(566, 236, 212, 104, '#f3f7ee', '#688e83')
    rect(583, 283, 177, 10, '#d4e9de')
    path([[583,293],[760,293]], '#7da696', 1.2)
    path([[583,288],[626,288],[667,288],[715,288 + 14 * pressure],[759,288 + 30 * pressure]], '#267a6c', 3)
    disc(759, 288 + 30 * pressure, 4.3, '#1d7565')
    const bar = (3.4 - pressure * .8).toFixed(1).replace('.', ',')
    label('Üst kat · ' + bar + ' bar', 671,264)
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
    path([[594,641],[615,641],[615,612],[630,612]], '#a95d46', 2)
    sceneTag('Yangın paneli', 'Alarm', 630, 587, 115, '#93513b')
    path([[982,263],[1006,263],[1018,246]], '#a95d46', 2)
    sceneTag('A Blok', 'Duman', 1018, 216, 102, '#93513b')
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
