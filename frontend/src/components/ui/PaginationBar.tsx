interface PaginationBarProps {
  page: number
  totalPages: number
  totalItems: number
  from: number
  to: number
  canGoPrev: boolean
  canGoNext: boolean
  onPrev: () => void
  onNext: () => void
}

export function PaginationBar({
  page,
  totalPages,
  totalItems,
  from,
  to,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
}: PaginationBarProps) {
  if (totalItems === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1">
      <p className="of-caption">
        Showing {from}–{to} of {totalItems}
        {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : null}
      </p>

      {totalPages > 1 ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrev}
            disabled={!canGoPrev}
            className="of-btn-secondary"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext}
            className="of-btn-secondary"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  )
}
