export const SpaceType = {
  Desk: 1,
  Room: 2,
  ParkingSpace: 3,
} as const

export type SpaceType = (typeof SpaceType)[keyof typeof SpaceType]

export interface Space {
  id: string
  name: string
  code: string
  type: SpaceType
  isActive: boolean
  description: string | null
  hourlyRate: number | null
  monthlySubscriptionRate: number | null
  currency: string | null
  areaSquareMeters: number | null
  capacity: number | null
  spotNumber: string | null
  floor: string | null
  zone: string | null
  level: string | null
  /** Campus map floor index (−2 … 2 today; manager layout editor later). */
  floorNumber: number
}

export function getSpaceTypeLabel(type: SpaceType): string {
  switch (type) {
    case SpaceType.Desk:
      return 'Desk'
    case SpaceType.Room:
      return 'Room'
    case SpaceType.ParkingSpace:
      return 'Parking'
    default:
      return 'Unknown'
  }
}

export function formatSpaceRate(space: Space): string {
  const currency = space.currency ?? 'PLN'

  if (space.type === SpaceType.Room && space.monthlySubscriptionRate != null) {
    return `${space.monthlySubscriptionRate.toFixed(2)} ${currency} / month`
  }

  if (space.hourlyRate != null) {
    return `${space.hourlyRate.toFixed(2)} ${currency} / hour`
  }

  return 'Rate unavailable'
}
