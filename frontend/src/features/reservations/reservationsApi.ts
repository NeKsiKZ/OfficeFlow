import axiosClient from '../../api/axiosClient'
import type { CreateReservationPayload, CreateReservationResult } from './types'

export async function createReservation(
  payload: CreateReservationPayload,
): Promise<CreateReservationResult> {
  const response = await axiosClient.post<CreateReservationResult>(
    '/reservations',
    payload,
  )

  return response.data
}
