import axiosClient from '../../api/axiosClient'
import type { Space, SpaceType } from './types'

export interface SpaceFilters {
  type?: SpaceType
  minPrice?: number
  maxPrice?: number
}

export interface CreateSpacePayload {
  name: string
  code: string
  type: SpaceType
  hourlyRate?: number | null
  monthlySubscriptionRate?: number | null
  areaSquareMeters?: number | null
  capacity?: number | null
  spotNumber?: string | null
  currency?: string
}

export interface CreateSpaceResult {
  spaceId: string
  name: string
  code: string
  type: SpaceType
}

export async function fetchSpaces(filters: SpaceFilters = {}): Promise<Space[]> {
  const response = await axiosClient.get<Space[]>('/spaces', {
    params: {
      type: filters.type,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
    },
  })

  return response.data
}

export async function createSpace(
  payload: CreateSpacePayload,
): Promise<CreateSpaceResult> {
  const response = await axiosClient.post<CreateSpaceResult>('/spaces', payload)
  return response.data
}

export async function deleteSpace(id: string): Promise<void> {
  await axiosClient.delete(`/spaces/${id}`)
}
