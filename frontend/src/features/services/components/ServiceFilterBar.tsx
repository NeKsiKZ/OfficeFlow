import { SpaceType } from '../../spaces/types'
import type { ServiceFilters } from '../filterServices'

interface ServiceFilterBarProps {
  filters: ServiceFilters
  onChange: (filters: ServiceFilters) => void
}

export function ServiceFilterBar({
  filters,
  onChange,
}: ServiceFilterBarProps) {
  return (
    <div className="of-material grid grid-cols-1 gap-3 rounded-[20px] p-4 sm:grid-cols-2 lg:grid-cols-5">
      <label className="block space-y-1.5">
        <span className="of-label">Name</span>
        <input
          type="search"
          placeholder="Service name"
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
        <span className="of-label">Space type</span>
        <select
          value={filters.spaceType ?? ''}
          onChange={(event) => {
            const value = event.target.value
            onChange({
              ...filters,
              spaceType:
                value === '' ? undefined : (Number(value) as SpaceType),
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
