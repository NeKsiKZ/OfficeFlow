import {
  colorsForSpaceType,
  type CampusMapPalette,
} from './campusMapPalette'
import { formatFloorLabel, type CampusFloor } from './floors'
import type { MapPlacement, MapZone } from './mapLayout'
import { SpaceType } from './types'

/** Apple-like hit padding around interactive tiles (points). */
export const MAP_HIT_PADDING = 10

export interface CampusMapDrawState {
  width: number
  height: number
  floor: CampusFloor
  zones: MapZone[]
  placements: MapPlacement[]
  palette: CampusMapPalette
  hoveredId: string | null
  selectedId: string | null
  pressedId: string | null
  /** 0–1 content opacity for floor cross-fade */
  contentOpacity: number
  /** Animated hover lift 0–1 */
  hoverAmount: number
  /** Animated press amount 0–1 */
  pressAmount: number
  reduceMotion: boolean
}

function pctX(width: number, leftPercent: number): number {
  return (leftPercent / 100) * width
}

function pctY(height: number, topPercent: number): number {
  return (topPercent / 100) * height
}

function pctW(width: number, widthPercent: number): number {
  return (widthPercent / 100) * width
}

function pctH(height: number, heightPercent: number): number {
  return (heightPercent / 100) * height
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function drawFloorBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  floor: CampusFloor,
  palette: CampusMapPalette,
): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  if (floor === 0) {
    gradient.addColorStop(0, palette.outdoor)
    gradient.addColorStop(1, palette.floorAlt)
  } else {
    gradient.addColorStop(0, palette.floor)
    gradient.addColorStop(1, palette.floorAlt)
  }
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.save()
  ctx.strokeStyle = palette.floorGrid
  ctx.lineWidth = 1
  const step = Math.max(20, Math.round(width / 44))
  for (let x = step; x < width; x += step) {
    ctx.beginPath()
    ctx.moveTo(x + 0.5, 0)
    ctx.lineTo(x + 0.5, height)
    ctx.stroke()
  }
  for (let y = step; y < height; y += step) {
    ctx.beginPath()
    ctx.moveTo(0, y + 0.5)
    ctx.lineTo(width, y + 0.5)
    ctx.stroke()
  }
  ctx.restore()

  const vignette = ctx.createRadialGradient(
    width * 0.5,
    height * 0.42,
    Math.min(width, height) * 0.18,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.75,
  )
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(0,0,0,0.07)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, width, height)
}

function drawBuilding(
  ctx: CanvasRenderingContext2D,
  zone: MapZone,
  width: number,
  height: number,
  palette: CampusMapPalette,
): void {
  const x = pctX(width, zone.leftPercent)
  const y = pctY(height, zone.topPercent)
  const w = pctW(width, zone.widthPercent)
  const h = pctH(height, zone.heightPercent)

  // Depth shadow (thicker material)
  ctx.save()
  ctx.shadowColor = palette.buildingShadow
  ctx.shadowBlur = 22
  ctx.shadowOffsetY = 8
  roundRectPath(ctx, x, y, w, h, 16)
  const fill = ctx.createLinearGradient(x, y, x, y + h)
  fill.addColorStop(0, palette.buildingFill)
  fill.addColorStop(1, palette.buildingFillBottom)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.restore()

  // Outer wall
  roundRectPath(ctx, x, y, w, h, 16)
  ctx.strokeStyle = palette.buildingStroke
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Specular top edge — light catching the material
  ctx.save()
  ctx.beginPath()
  roundRectPath(ctx, x + 1, y + 1, w - 2, h - 2, 15)
  ctx.clip()
  const sheen = ctx.createLinearGradient(x, y, x, y + 28)
  sheen.addColorStop(0, palette.buildingHighlight)
  sheen.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = sheen
  ctx.fillRect(x, y, w, 28)
  ctx.restore()

  // Inner wall
  roundRectPath(ctx, x + 6, y + 6, w - 12, h - 12, 12)
  ctx.strokeStyle = palette.buildingStroke
  ctx.globalAlpha = 0.28
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.globalAlpha = 1

  drawZoneLabel(ctx, zone.label, x + 14, y + 18, palette.label)
}

function drawParkingLot(
  ctx: CanvasRenderingContext2D,
  zone: MapZone,
  width: number,
  height: number,
  palette: CampusMapPalette,
): void {
  const x = pctX(width, zone.leftPercent)
  const y = pctY(height, zone.topPercent)
  const w = pctW(width, zone.widthPercent)
  const h = pctH(height, zone.heightPercent)

  roundRectPath(ctx, x, y, w, h, 14)
  ctx.fillStyle = palette.parkingLotFill
  ctx.fill()
  ctx.setLineDash([6, 5])
  ctx.strokeStyle = palette.parkingLotStroke
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.setLineDash([])

  drawZoneLabel(ctx, zone.label, x + 14, y + 18, palette.label)
}

function drawZoneLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
): void {
  ctx.save()
  ctx.fillStyle = color
  // Slight positive tracking feel via spaced uppercase + weight
  ctx.font =
    '650 10px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText(text.toUpperCase(), x, y)
  ctx.restore()
}

function drawDeskGlyph(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  stroke: string,
): void {
  const deskW = Math.min(w * 0.55, 36)
  const deskH = Math.min(h * 0.2, 11)
  const deskX = x + (w - deskW) / 2
  const deskY = y + h * 0.26
  roundRectPath(ctx, deskX, deskY, deskW, deskH, 3)
  ctx.strokeStyle = stroke
  ctx.globalAlpha = 0.5
  ctx.lineWidth = 1.2
  ctx.stroke()
  ctx.globalAlpha = 1

  const chairW = deskW * 0.34
  const chairX = x + (w - chairW) / 2
  const chairY = deskY + deskH + 4
  roundRectPath(ctx, chairX, chairY, chairW, 4.5, 2)
  ctx.stroke()
}

function drawSpaceTile(
  ctx: CanvasRenderingContext2D,
  placement: MapPlacement,
  width: number,
  height: number,
  palette: CampusMapPalette,
  hovered: boolean,
  selected: boolean,
  pressed: boolean,
  hoverAmount: number,
  pressAmount: number,
  reduceMotion: boolean,
): void {
  const x = pctX(width, placement.leftPercent)
  const y = pctY(height, placement.topPercent)
  const w = pctW(width, placement.widthPercent)
  const h = pctH(height, placement.heightPercent)
  const colors = colorsForSpaceType(placement.space.type, palette)
  const inactive = !placement.space.isActive

  let scale = 1
  if (!reduceMotion) {
    if (pressed) {
      scale = 1 - 0.03 * pressAmount // → 0.97
    } else if (hovered) {
      scale = 1 + 0.025 * hoverAmount
    } else if (selected) {
      scale = 1.02
    }
  }

  ctx.save()
  if (inactive) {
    ctx.globalAlpha = palette.inactiveAlpha
  }

  const cx = x + w / 2
  const cy = y + h / 2
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)
  ctx.translate(-cx, -cy)

  if (hovered && hoverAmount > 0.01) {
    roundRectPath(ctx, x - 4, y - 4, w + 8, h + 8, 13)
    ctx.fillStyle = colors.hover
    ctx.globalAlpha = (inactive ? palette.inactiveAlpha : 1) * hoverAmount
    ctx.fill()
    ctx.globalAlpha = inactive ? palette.inactiveAlpha : 1
  }

  if (selected) {
    roundRectPath(ctx, x - 5, y - 5, w + 10, h + 10, 14)
    ctx.strokeStyle = palette.selectedGlow
    ctx.lineWidth = 6
    ctx.stroke()
    roundRectPath(ctx, x - 3, y - 3, w + 6, h + 6, 12)
    ctx.strokeStyle = palette.selectedRing
    ctx.lineWidth = 2
    ctx.stroke()
  }

  roundRectPath(ctx, x, y, w, h, 11)
  const tileFill = ctx.createLinearGradient(x, y, x, y + h)
  tileFill.addColorStop(0, colors.fill)
  tileFill.addColorStop(1, colors.fill)
  ctx.fillStyle = tileFill
  ctx.fill()

  // Top highlight on tile (material catch light)
  ctx.save()
  ctx.beginPath()
  roundRectPath(ctx, x + 1, y + 1, w - 2, h - 2, 10)
  ctx.clip()
  const tileSheen = ctx.createLinearGradient(x, y, x, y + 16)
  tileSheen.addColorStop(0, 'rgba(255,255,255,0.35)')
  tileSheen.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = tileSheen
  ctx.fillRect(x, y, w, 16)
  ctx.restore()

  ctx.strokeStyle = selected ? palette.selectedRing : colors.stroke
  ctx.lineWidth = selected ? 2 : 1.5
  ctx.stroke()

  if (placement.space.type === SpaceType.Desk && h > 36) {
    drawDeskGlyph(ctx, x, y, w, h, colors.stroke)
  }

  if (placement.space.type === SpaceType.ParkingSpace) {
    ctx.beginPath()
    ctx.moveTo(x + w * 0.5, y + h * 0.2)
    ctx.lineTo(x + w * 0.36, y + h * 0.36)
    ctx.lineTo(x + w * 0.64, y + h * 0.36)
    ctx.closePath()
    ctx.fillStyle = colors.stroke
    ctx.globalAlpha = 0.3 * (inactive ? palette.inactiveAlpha : 1)
    ctx.fill()
    ctx.globalAlpha = inactive ? palette.inactiveAlpha : 1
  }

  // Vibrancy-ish labels: heavier weight, higher contrast
  const nameSize = w < 70 ? 9.5 : 11.5
  ctx.fillStyle = palette.ink
  ctx.font = `650 ${nameSize}px ui-sans-serif, system-ui, -apple-system, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const nameY =
    placement.space.type === SpaceType.Desk && h > 36 ? y + h * 0.7 : y + h * 0.44
  const maxChars = Math.max(6, Math.floor(w / (nameSize * 0.55)))
  const name =
    placement.space.name.length > maxChars
      ? `${placement.space.name.slice(0, maxChars - 1)}…`
      : placement.space.name
  ctx.fillText(name, x + w / 2, nameY)

  if (h > 42 && w > 50) {
    ctx.fillStyle = palette.mutedLabel
    ctx.font =
      '600 9px ui-sans-serif, system-ui, -apple-system, sans-serif'
    ctx.fillText(placement.space.code, x + w / 2, nameY + nameSize + 3)
  }

  ctx.restore()
}

function drawEmptyFloorMessage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  floor: CampusFloor,
  palette: CampusMapPalette,
): void {
  ctx.save()
  ctx.fillStyle = palette.emptyInk
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font =
    '600 15px ui-sans-serif, system-ui, -apple-system, sans-serif'
  ctx.fillText(
    `No spaces on ${formatFloorLabel(floor)} yet.`,
    width / 2,
    height / 2 - 10,
  )
  ctx.font =
    '500 12px ui-sans-serif, system-ui, -apple-system, sans-serif'
  ctx.globalAlpha = 0.72
  ctx.fillText(
    'Managers will be able to arrange this floor later.',
    width / 2,
    height / 2 + 14,
  )
  ctx.restore()
}

export function drawCampusMap(
  ctx: CanvasRenderingContext2D,
  state: CampusMapDrawState,
): void {
  const {
    width,
    height,
    floor,
    zones,
    placements,
    palette,
    hoveredId,
    selectedId,
    pressedId,
    contentOpacity,
    hoverAmount,
    pressAmount,
    reduceMotion,
  } = state

  ctx.clearRect(0, 0, width, height)
  drawFloorBackground(ctx, width, height, floor, palette)

  ctx.save()
  ctx.globalAlpha = contentOpacity

  for (const zone of zones) {
    if (zone.kind === 'building') {
      drawBuilding(ctx, zone, width, height, palette)
    } else {
      drawParkingLot(ctx, zone, width, height, palette)
    }
  }

  if (placements.length === 0) {
    drawEmptyFloorMessage(ctx, width, height, floor, palette)
    ctx.restore()
    return
  }

  for (const placement of placements) {
    const id = placement.space.id
    drawSpaceTile(
      ctx,
      placement,
      width,
      height,
      palette,
      id === hoveredId,
      id === selectedId,
      id === pressedId,
      id === hoveredId ? hoverAmount : 0,
      id === pressedId ? pressAmount : 0,
      reduceMotion,
    )
  }

  ctx.restore()
}

export function hitTestPlacement(
  placements: MapPlacement[],
  width: number,
  height: number,
  clientX: number,
  clientY: number,
  padding: number = MAP_HIT_PADDING,
): MapPlacement | null {
  for (let i = placements.length - 1; i >= 0; i -= 1) {
    const placement = placements[i]
    const x = pctX(width, placement.leftPercent) - padding
    const y = pctY(height, placement.topPercent) - padding
    const w = pctW(width, placement.widthPercent) + padding * 2
    const h = pctH(height, placement.heightPercent) + padding * 2

    if (
      clientX >= x &&
      clientX <= x + w &&
      clientY >= y &&
      clientY <= y + h
    ) {
      return placement
    }
  }

  return null
}
