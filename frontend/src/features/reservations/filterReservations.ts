import type { Reservation, ReservationStatus } from './types'

export interface ReservationFilters {
  name?: string
  dateFrom?: string
  dateTo?: string
  minPrice?: number
  maxPrice?: number
  status?: ReservationStatus
}

function startOfDayUtc(dateOnly: string): Date {
  return new Date(`${dateOnly}T00:00:00.000Z`)
}

function endOfDayUtc(dateOnly: string): Date {
  return new Date(`${dateOnly}T23:59:59.999Z`)
}

export function filterReservations(
  reservations: Reservation[],
  filters: ReservationFilters,
): Reservation[] {
  const nameQuery = filters.name?.trim().toLowerCase()

  return reservations.filter((reservation) => {
    if (
      nameQuery &&
      !reservation.spaceName.toLowerCase().includes(nameQuery)
    ) {
      return false
    }

    if (filters.status != null && reservation.status !== filters.status) {
      return false
    }

    if (
      filters.minPrice != null &&
      reservation.totalCostAmount < filters.minPrice
    ) {
      return false
    }

    if (
      filters.maxPrice != null &&
      reservation.totalCostAmount > filters.maxPrice
    ) {
      return false
    }

    const start = new Date(reservation.startTimeUtc)
    const end = new Date(reservation.endTimeUtc)

    if (filters.dateFrom) {
      const from = startOfDayUtc(filters.dateFrom)
      if (end < from) {
        return false
      }
    }

    if (filters.dateTo) {
      const to = endOfDayUtc(filters.dateTo)
      if (start > to) {
        return false
      }
    }

    return true
  })
}
