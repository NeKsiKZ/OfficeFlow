import axiosClient from '../../api/axiosClient'
import type { ManagerStats, ManagerStatsFilters } from './types'

export async function fetchManagerStats(
  filters: ManagerStatsFilters = {},
): Promise<ManagerStats> {
  const response = await axiosClient.get<ManagerStats>('/reports/stats', {
    params: {
      fromUtc: filters.fromUtc,
      toUtc: filters.toUtc,
    },
  })

  return response.data
}
