import { SpaceType, type Space } from './types'

export interface MapPlacement {
  space: Space
  leftPercent: number
  topPercent: number
  widthPercent: number
  heightPercent: number
}

/**
 * Derives a schematic floor-plan layout from API data
 * (no persisted coordinates yet): rooms on edges, desks in the open center, parking at the bottom.
 */
export function buildMapPlacements(spaces: Space[]): MapPlacement[] {
  const rooms = spaces.filter((space) => space.type === SpaceType.Room)
  const desks = spaces.filter((space) => space.type === SpaceType.Desk)
  const parking = spaces.filter((space) => space.type === SpaceType.ParkingSpace)

  return [
    ...placeRooms(rooms),
    ...placeDesks(desks),
    ...placeParking(parking),
  ]
}

function placeRooms(rooms: Space[]): MapPlacement[] {
  if (rooms.length === 0) {
    return []
  }

  return rooms.map((space, index) => {
    const side = index % 4
    const slot = Math.floor(index / 4)
    const slotOffset = 12 + slot * 18

    switch (side) {
      case 0: // top edge
        return {
          space,
          leftPercent: Math.min(slotOffset, 70),
          topPercent: 4,
          widthPercent: 16,
          heightPercent: 14,
        }
      case 1: // right edge
        return {
          space,
          leftPercent: 80,
          topPercent: Math.min(slotOffset, 58),
          widthPercent: 16,
          heightPercent: 14,
        }
      case 2: // bottom edge (above parking strip)
        return {
          space,
          leftPercent: Math.min(slotOffset, 70),
          topPercent: 62,
          widthPercent: 16,
          heightPercent: 12,
        }
      default: // left edge
        return {
          space,
          leftPercent: 4,
          topPercent: Math.min(slotOffset, 58),
          widthPercent: 16,
          heightPercent: 14,
        }
    }
  })
}

function placeDesks(desks: Space[]): MapPlacement[] {
  if (desks.length === 0) {
    return []
  }

  const columns = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(desks.length))))
  const cellWidth = 10
  const cellHeight = 9
  const gapX = 3
  const gapY = 3
  const gridWidth = columns * cellWidth + (columns - 1) * gapX
  const rows = Math.ceil(desks.length / columns)
  const gridHeight = rows * cellHeight + (rows - 1) * gapY
  const startLeft = 50 - gridWidth / 2
  const startTop = 28 - gridHeight / 2

  return desks.map((space, index) => {
    const col = index % columns
    const row = Math.floor(index / columns)

    return {
      space,
      leftPercent: startLeft + col * (cellWidth + gapX),
      topPercent: Math.max(22, startTop + row * (cellHeight + gapY)),
      widthPercent: cellWidth,
      heightPercent: cellHeight,
    }
  })
}

function placeParking(parking: Space[]): MapPlacement[] {
  if (parking.length === 0) {
    return []
  }

  const width = Math.min(12, 80 / parking.length)
  const totalWidth = parking.length * width
  const startLeft = 50 - totalWidth / 2

  return parking.map((space, index) => ({
    space,
    leftPercent: startLeft + index * width,
    topPercent: 80,
    widthPercent: width - 1,
    heightPercent: 12,
  }))
}
