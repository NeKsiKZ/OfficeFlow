import axios from 'axios'
import { useEffect, useState } from 'react'
import { fetchSpaces, type SpaceFilters } from '../spacesApi'
import type { Space } from '../types'

interface UseSpacesResult {
  spaces: Space[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ERR_NETWORK') {
      return 'Cannot reach the API. Make sure the backend is running on http://localhost:5154.'
    }

    return error.response?.data?.message ?? error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Failed to load spaces from the API.'
}

export function useSpaces(filters: SpaceFilters = {}): UseSpacesResult {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let isActive = true

    async function loadSpaces() {
      setIsLoading(true)
      setError(null)

      try {
        const data = await fetchSpaces(filters)
        if (isActive) {
          setSpaces(data)
        }
      } catch (err) {
        if (isActive) {
          setError(getErrorMessage(err))
          setSpaces([])
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadSpaces()

    return () => {
      isActive = false
    }
  }, [filters.type, filters.minPrice, filters.maxPrice, reloadToken])

  return {
    spaces,
    isLoading,
    error,
    refetch: () => setReloadToken((token) => token + 1),
  }
}
