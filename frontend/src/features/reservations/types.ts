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
