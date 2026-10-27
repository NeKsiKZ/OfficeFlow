import { SpaceType, type Space } from './types'

export interface ManageSpaceFilters {
  type?: SpaceType
  minPrice?: number
  maxPrice?: number
  isActive?: boolean
}

export function getSpaceListPrice(space: Space): number | null {
  if (space.type === SpaceType.Room) {
    return space.monthlySubscriptionRate
  }

  return space.hourlyRate
}

export function filterSpaces(
  spaces: Space[],
  filters: ManageSpaceFilters,
): Space[] {
  return spaces.filter((space) => {
    if (filters.type != null && space.type !== filters.type) {
      return false
    }

    if (filters.isActive != null && space.isActive !== filters.isActive) {
      return false
    }

    const price = getSpaceListPrice(space)
    if (price == null) {
      return filters.minPrice == null && filters.maxPrice == null
    }

    if (filters.minPrice != null && price < filters.minPrice) {
      return false
    }

    if (filters.maxPrice != null && price > filters.maxPrice) {
      return false
    }

    return true
  })
}
