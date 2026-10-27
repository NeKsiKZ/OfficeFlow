import type { SpaceType } from '../spaces/types'
import type { AdditionalService } from './types'

export interface ServiceFilters {
  name?: string
  spaceType?: SpaceType
  minPrice?: number
  maxPrice?: number
}

export function filterServices(
  services: AdditionalService[],
  filters: ServiceFilters,
): AdditionalService[] {
  const nameQuery = filters.name?.trim().toLowerCase()

  return services.filter((service) => {
    if (nameQuery && !service.name.toLowerCase().includes(nameQuery)) {
      return false
    }

    if (
      filters.spaceType != null &&
      !service.applicableSpaceTypes.includes(filters.spaceType)
    ) {
      return false
    }

    if (filters.minPrice != null && service.price < filters.minPrice) {
      return false
    }

    if (filters.maxPrice != null && service.price > filters.maxPrice) {
      return false
    }

    return true
  })
}
