export interface CreateReservationPayload {
  spaceId: string
  tenantId: string
  startTime: string
  endTime: string
}

export interface CreateReservationResult {
  reservationId: string
  spaceId: string
  tenantId: string
  startTimeUtc: string
  endTimeUtc: string
  totalCostAmount: number
  currency: string
  status: number
}

export const ReservationStatus = {
  Pending: 1,
  Confirmed: 2,
  Rejected: 3,
  Cancelled: 4,
  Completed: 5,
} as const

export type ReservationStatus =
  (typeof ReservationStatus)[keyof typeof ReservationStatus]

export interface Reservation {
  id: string
  tenantId: string
  spaceId: string
  spaceName: string
  spaceType: number
  startTimeUtc: string
  endTimeUtc: string
  totalCostAmount: number
  currency: string
  status: ReservationStatus
  createdAtUtc: string
  notes: string | null
}

export function getReservationStatusLabel(status: ReservationStatus): string {
  switch (status) {
    case ReservationStatus.Pending:
      return 'Pending'
    case ReservationStatus.Confirmed:
      return 'Confirmed'
    case ReservationStatus.Rejected:
      return 'Rejected'
    case ReservationStatus.Cancelled:
      return 'Cancelled'
    case ReservationStatus.Completed:
      return 'Completed'
    default:
      return 'Unknown'
  }
}
