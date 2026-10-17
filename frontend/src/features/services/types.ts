import { getSpaceTypeLabel, SpaceType } from '../spaces/types'

export interface AdditionalService {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  applicableSpaceTypes: SpaceType[]
}

export interface CreateServicePayload {
  name: string
  price: number
  applicableSpaceTypes: SpaceType[]
  description?: string | null
  currency?: string
}

export interface CreateServiceResult {
  serviceId: string
  name: string
  price: number
  currency: string
  applicableSpaceTypes: SpaceType[]
}

export const ALL_SPACE_TYPES: SpaceType[] = [
  SpaceType.Desk,
  SpaceType.Room,
  SpaceType.ParkingSpace,
]

export function formatServicePrice(
  service: AdditionalService,
  options?: { perMonth?: boolean },
): string {
  const base = `${service.price.toFixed(2)} ${service.currency}`
  return options?.perMonth ? `${base} / month` : base
}

export function formatApplicableSpaceTypes(service: AdditionalService): string {
  if (!service.applicableSpaceTypes?.length) {
    return '—'
  }

  return service.applicableSpaceTypes
    .map((type) => getSpaceTypeLabel(type))
    .join(', ')
}

export function serviceAppliesToSpace(
  service: AdditionalService,
  spaceType: SpaceType,
): boolean {
  return service.applicableSpaceTypes.includes(spaceType)
}
