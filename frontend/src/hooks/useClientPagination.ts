import { useEffect, useMemo, useState } from 'react'
import {
  getPageSlice,
  PAGE_SIZE,
  type PageSlice,
} from '../lib/pagination'

interface UseClientPaginationResult<T> extends PageSlice<T> {
  setPage: (page: number) => void
  goNext: () => void
  goPrev: () => void
  canGoNext: boolean
  canGoPrev: boolean
}

export function useClientPagination<T>(
  items: readonly T[],
  pageSize: number = PAGE_SIZE,
): UseClientPaginationResult<T> {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [items])

  const slice = useMemo(
    () => getPageSlice(items, page, pageSize),
    [items, page, pageSize],
  )

  useEffect(() => {
    if (slice.page !== page) {
      setPage(slice.page)
    }
  }, [slice.page, page])

  return {
    ...slice,
    setPage,
    goNext: () => setPage((current) => current + 1),
    goPrev: () => setPage((current) => current - 1),
    canGoNext: slice.page < slice.totalPages,
    canGoPrev: slice.page > 1,
  }
}
