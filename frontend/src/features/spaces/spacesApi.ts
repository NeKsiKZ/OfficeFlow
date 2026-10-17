import axiosClient from '../../api/axiosClient'
import type { Space, SpaceType } from './types'

export async function fetchSpaces(type?: SpaceType): Promise<Space[]> {
  const response = await axiosClient.get<Space[]>('/spaces', {
    params: type != null ? { type } : undefined,
  })

  return response.data
}
