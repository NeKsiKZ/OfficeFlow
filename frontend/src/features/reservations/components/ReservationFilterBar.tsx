import { ReservationStatus } from '../types'
import type { ReservationFilters } from '../filterReservations'

interface ReservationFilterBarProps {
  filters: ReservationFilters
  onChange: (filters: ReservationFilters) => void
}

export function ReservationFilterBar({
  filters,
  onChange,
}: ReservationFilterBarProps) {
  return (
    <div className="of-material grid grid-cols-1 gap-3 rounded-[20px] p-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      <label className="block space-y-1.5">
        <span className="of-label">Name</span>
        <input
          type="search"
          placeholder="Space name"
          value={filters.name ?? ''}
          onChange={(event) => {
            const value = event.target.value
            onChange({
              ...filters,
              name: value === '' ? undefined : value,
            })
          }}
          className="of-field"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="of-label">From date</span>
        <input
          type="date"
          value={filters.dateFrom ?? ''}
          onChange={(event) => {
            const value = event.target.value
            onChange({
              ...filters,
              dateFrom: value === '' ? undefined : value,
            })
          }}
          className="of-field"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="of-label">To date</span>
        <input
          type="date"
          value={filters.dateTo ?? ''}
          onChange={(event) => {
            const value = event.target.value
            onChange({
              ...filters,
              dateTo: value === '' ? undefined : value,
            })
          }}
          className="of-field"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="of-label">Min price</span>
        <input
          type="number"
          min={0}
          step="0.01"
          placeholder="0"
          value={filters.minPrice ?? ''}
          onChange={(event) => {
            const value = event.target.value
            onChange({
              ...filters,
              minPrice: value === '' ? undefined : Number(value),
            })
          }}
          className="of-field"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="of-label">Max price</span>
        <input
          type="number"
          min={0}
          step="0.01"
          placeholder="Any"
          value={filters.maxPrice ?? ''}
          onChange={(event) => {
            const value = event.target.value
            onChange({
              ...filters,
              maxPrice: value === '' ? undefined : Number(value),
            })
          }}
          className="of-field"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="of-label">Status</span>
        <select
          value={filters.status ?? ''}
          onChange={(event) => {
            const value = event.target.value
            onChange({
              ...filters,
              status:
                value === ''
                  ? undefined
                  : (Number(value) as ReservationStatus),
            })
          }}
          className="of-field"
        >
          <option value="">All statuses</option>
          <option value={ReservationStatus.Pending}>Pending</option>
          <option value={ReservationStatus.Confirmed}>Confirmed</option>
          <option value={ReservationStatus.Cancelled}>Cancelled</option>
          <option value={ReservationStatus.Completed}>Completed</option>
        </select>
      </label>

      <div className="block space-y-1.5">
        <span className="of-label invisible select-none" aria-hidden="true">
          Clear
        </span>
        <button
          type="button"
          onClick={() => onChange({})}
          className="of-btn-field"
        >
          Clear filters
        </button>
      </div>
    </div>
  )
}
