export const PAGE_SIZE = 50

export interface PageSlice<T> {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  from: number
  to: number
}

export function getPageSlice<T>(
  items: readonly T[],
  page: number,
  pageSize: number = PAGE_SIZE,
): PageSlice<T> {
  const totalItems = items.length
  const totalPages =
    totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize)
  const safePage =
    totalPages === 0 ? 1 : Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize
  const pageItems = items.slice(start, start + pageSize)

  return {
    items: pageItems,
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    from: totalItems === 0 ? 0 : start + 1,
    to: totalItems === 0 ? 0 : start + pageItems.length,
  }
}
