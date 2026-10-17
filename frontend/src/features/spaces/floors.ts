/** Campus floors available in the map switcher (manager layout editor later). */
export const CAMPUS_FLOORS = [-2, -1, 0, 1, 2] as const

export type CampusFloor = (typeof CAMPUS_FLOORS)[number]

export const DEFAULT_CAMPUS_FLOOR: CampusFloor = 1

export function formatFloorLabel(floor: number): string {
  if (floor === 0) {
    return '0 · Ground'
  }

  if (floor < 0) {
    return `${floor} · Basement`
  }

  return `${floor} · Floor`
}

export function isCampusFloor(value: number): value is CampusFloor {
  return (CAMPUS_FLOORS as readonly number[]).includes(value)
}
