import {
  CAMPUS_FLOORS,
  formatFloorLabel,
  type CampusFloor,
} from '../floors'

interface FloorSwitcherProps {
  value: CampusFloor
  onChange: (floor: CampusFloor) => void
  occupiedFloors?: number[]
}

export function FloorSwitcher({
  value,
  onChange,
  occupiedFloors = [],
}: FloorSwitcherProps) {
  const occupied = new Set(occupiedFloors)

  return (
    <div
      className="of-material flex flex-wrap items-center gap-3 rounded-[18px] px-3 py-2.5"
      role="group"
      aria-label="Floor selection"
    >
      <div className="min-w-0">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-400">
          Floor
        </p>
        <p className="of-caption mt-0.5 truncate">{formatFloorLabel(value)}</p>
      </div>

      {/* Segmented control — denser material for wayfinding */}
      <div className="ml-auto flex flex-wrap gap-0.5 rounded-[14px] bg-[color:var(--of-fill)] p-1">
        {CAMPUS_FLOORS.map((floor) => {
          const isActive = value === floor
          const hasSpaces = occupied.has(floor)

          return (
            <button
              key={floor}
              type="button"
              onClick={() => onChange(floor)}
              className={[
                'of-btn relative min-w-[2.5rem] rounded-[10px] px-2.5 py-1.5 text-[0.8125rem] font-semibold tracking-[-0.01em]',
                isActive
                  ? 'bg-[color:var(--of-bg-solid)] text-ink-900 shadow-sm'
                  : 'text-ink-500',
              ].join(' ')}
              aria-pressed={isActive}
              title={
                hasSpaces
                  ? formatFloorLabel(floor)
                  : `${formatFloorLabel(floor)} (empty — ready for future layout)`
              }
            >
              {floor}
              {hasSpaces ? (
                <span
                  className={[
                    'absolute right-1 top-1 h-1.5 w-1.5 rounded-full',
                    isActive ? 'bg-brand-600' : 'bg-brand-500/80',
                  ].join(' ')}
                  aria-hidden
                />
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
