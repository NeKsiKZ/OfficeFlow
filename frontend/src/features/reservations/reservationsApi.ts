import axiosClient from '../../api/axiosClient'
import type {
  CreateReservationPayload,
  CreateReservationResult,
  Reservation,
} from './types'

export async function createReservation(
  payload: CreateReservationPayload,
): Promise<CreateReservationResult> {
  const response = await axiosClient.post<CreateReservationResult>(
    '/reservations',
    payload,
  )

  return response.data
}

export async function fetchReservationsByTenant(
  tenantId: string,
): Promise<Reservation[]> {
  const response = await axiosClient.get<Reservation[]>('/reservations', {
    params: { tenantId },
  })

  return response.data
}

export async function fetchAllReservations(): Promise<Reservation[]> {
  const response = await axiosClient.get<Reservation[]>('/reservations')
  return response.data
}

export async function confirmReservation(id: string): Promise<void> {
  await axiosClient.post(`/reservations/${id}/confirm`)
}

export async function cancelReservation(id: string): Promise<void> {
  await axiosClient.post(`/reservations/${id}/cancel`)
}
