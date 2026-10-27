import { SpaceType } from '../types'
import type { ManageSpaceFilters } from '../filterSpaces'

interface ManageSpaceFilterBarProps {
  filters: ManageSpaceFilters
  onChange: (filters: ManageSpaceFilters) => void
}

export function ManageSpaceFilterBar({
  filters,
  onChange,
}: ManageSpaceFilterBarProps) {
  return (
    <div className="of-material grid grid-cols-1 gap-3 rounded-[20px] p-4 sm:grid-cols-2 lg:grid-cols-5">
      <label className="block space-y-1.5">
        <span className="of-label">Type</span>
        <select
          value={filters.type ?? ''}
          onChange={(event) => {
            const value = event.target.value
            onChange({
              ...filters,
              type: value === '' ? undefined : (Number(value) as SpaceType),
            })
          }}
          className="of-field"
        >
          <option value="">All types</option>
          <option value={SpaceType.Desk}>Desk</option>
          <option value={SpaceType.Room}>Room</option>
          <option value={SpaceType.ParkingSpace}>Parking</option>
        </select>
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
          value={
            filters.isActive === undefined
              ? ''
              : filters.isActive
                ? 'active'
                : 'inactive'
          }
          onChange={(event) => {
            const value = event.target.value
            onChange({
              ...filters,
              isActive:
                value === ''
                  ? undefined
                  : value === 'active',
            })
          }}
          className="of-field"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
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
