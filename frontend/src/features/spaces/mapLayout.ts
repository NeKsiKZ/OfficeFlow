import type { CampusFloor } from './floors'
import { SpaceType, type Space } from './types'

export interface MapPlacement {
  space: Space
  leftPercent: number
  topPercent: number
  widthPercent: number
  heightPercent: number
}

export interface MapZone {
  id: string
  label: string
  leftPercent: number
  topPercent: number
  widthPercent: number
  heightPercent: number
  kind: 'building' | 'parking'
}

/** Floor 1 — indoor campus: cabinets + open office. */
const FLOOR_1_ZONES: MapZone[] = [
  {
    id: 'building-cabinets',
    label: 'Cabinets',
    leftPercent: 3,
    topPercent: 8,
    widthPercent: 40,
    heightPercent: 78,
    kind: 'building',
  },
  {
    id: 'building-open-office',
    label: 'Open office',
    leftPercent: 47,
    topPercent: 8,
    widthPercent: 50,
    heightPercent: 78,
    kind: 'building',
  },
]

/** Floor 0 — outdoor / ground parking. */
const FLOOR_0_ZONES: MapZone[] = [
  {
    id: 'outdoor-parking',
    label: 'Outdoor parking',
    leftPercent: 8,
    topPercent: 28,
    widthPercent: 84,
    heightPercent: 44,
    kind: 'parking',
  },
]

export function getCampusZonesForFloor(floor: CampusFloor): MapZone[] {
  if (floor === 1) {
    return FLOOR_1_ZONES
  }

  if (floor === 0) {
    return FLOOR_0_ZONES
  }

  // Empty floors reserved for future manager layout customization.
  return []
}

export function buildMapPlacements(
  spaces: Space[],
  floor: CampusFloor,
): MapPlacement[] {
  const onFloor = spaces.filter((space) => space.floorNumber === floor)

  if (floor === 1) {
    const rooms = onFloor.filter((space) => space.type === SpaceType.Room)
    const desks = onFloor.filter((space) => space.type === SpaceType.Desk)
    return [
      ...placeRoomsInCabinetBuilding(rooms),
      ...placeDesksInOpenOffice(desks),
    ]
  }

  if (floor === 0) {
    const parking = onFloor.filter(
      (space) => space.type === SpaceType.ParkingSpace,
    )
    return placeOutdoorParking(parking)
  }

  return []
}

function placeRoomsInCabinetBuilding(rooms: Space[]): MapPlacement[] {
  const building = FLOOR_1_ZONES[0]
  const padX = 3
  const padY = 10
  const gap = 2.5
  const innerLeft = building.leftPercent + padX
  const innerTop = building.topPercent + padY
  const innerWidth = building.widthPercent - padX * 2
  const innerHeight = building.heightPercent - padY - 4
  const slotWidth = (innerWidth - gap) / 2

  return rooms.slice(0, 2).map((space, index) => ({
    space,
    leftPercent: innerLeft + index * (slotWidth + gap),
    topPercent: innerTop,
    widthPercent: slotWidth,
    heightPercent: innerHeight,
  }))
}

function placeDesksInOpenOffice(desks: Space[]): MapPlacement[] {
  const building = FLOOR_1_ZONES[1]
  const padX = 4
  const padY = 11
  const gapX = 2
  const gapY = 2.5
  const columns = 3
  const cellWidth =
    (building.widthPercent - padX * 2 - gapX * (columns - 1)) / columns
  const cellHeight = 18
  const startLeft = building.leftPercent + padX
  const startTop = building.topPercent + padY

  return desks.slice(0, 5).map((space, index) => {
    const col = index % columns
    const row = Math.floor(index / columns)

    return {
      space,
      leftPercent: startLeft + col * (cellWidth + gapX),
      topPercent: startTop + row * (cellHeight + gapY),
      widthPercent: cellWidth,
      heightPercent: cellHeight,
    }
  })
}

function placeOutdoorParking(parking: Space[]): MapPlacement[] {
  const zone = FLOOR_0_ZONES[0]
  const padX = 3
  const padY = 9
  const gap = 2
  const count = Math.min(4, Math.max(1, parking.length))
  const slotWidth = (zone.widthPercent - padX * 2 - gap * (count - 1)) / count
  const startLeft = zone.leftPercent + padX
  const top = zone.topPercent + padY
  const height = zone.heightPercent - padY - 4

  return parking.slice(0, 4).map((space, index) => ({
    space,
    leftPercent: startLeft + index * (slotWidth + gap),
    topPercent: top,
    widthPercent: slotWidth,
    heightPercent: height,
  }))
}
