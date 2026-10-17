import axiosClient from '../../api/axiosClient'
import type {
  AdditionalService,
  CreateServicePayload,
  CreateServiceResult,
} from './types'

export async function fetchServices(): Promise<AdditionalService[]> {
  const response = await axiosClient.get<AdditionalService[]>('/services')
  return response.data
}

export async function createService(
  payload: CreateServicePayload,
): Promise<CreateServiceResult> {
  const response = await axiosClient.post<CreateServiceResult>(
    '/services',
    payload,
  )
  return response.data
}

export async function deleteService(id: string): Promise<void> {
  await axiosClient.delete(`/services/${id}`)
}
