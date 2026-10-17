import axiosClient from '../../api/axiosClient'
import type { Tenant } from './types'

export async function getTenants(): Promise<Tenant[]> {
  const response = await axiosClient.get<Tenant[]>('/tenants')
  return response.data
}
