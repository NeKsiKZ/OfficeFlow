import { SpaceType } from '../types'
import type { SpaceFilters } from '../spacesApi'

interface SpaceFilterBarProps {
  filters: SpaceFilters
  onChange: (filters: SpaceFilters) => void
}

export function SpaceFilterBar({ filters, onChange }: SpaceFilterBarProps) {
  return (
    <div className="of-material grid grid-cols-1 gap-3 rounded-[20px] p-4 md:grid-cols-4">
      <label className="block space-y-1.5">
        <span className="of-label">Space type</span>
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

      <div className="flex items-end">
        <button
          type="button"
          onClick={() => onChange({})}
          className="of-btn-secondary w-full"
        >
          Clear filters
        </button>
      </div>
    </div>
  )
}
