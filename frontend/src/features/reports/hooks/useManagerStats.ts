import { useCallback, useEffect, useState } from 'react'
import { fetchManagerStats } from '../reportsApi'
import type { ManagerStats, ManagerStatsFilters } from '../types'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Could not load manager statistics.'
}

export function useManagerStats(filters: ManagerStatsFilters = {}) {
  const [stats, setStats] = useState<ManagerStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fromUtc = filters.fromUtc
  const toUtc = filters.toUtc

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchManagerStats({ fromUtc, toUtc })
      setStats(data)
    } catch (err) {
      setStats(null)
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [fromUtc, toUtc])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { stats, isLoading, error, refetch }
}
