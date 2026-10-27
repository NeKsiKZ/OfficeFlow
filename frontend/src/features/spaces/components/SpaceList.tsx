import { PaginationBar } from '../../../components/ui/PaginationBar'
import { useClientPagination } from '../../../hooks/useClientPagination'
import {
  getSpaceTypeLabel,
  SpaceType,
  type Space,
} from '../types'

interface SpaceListProps {
  spaces: Space[]
  selectedSpaceId?: string | null
  onSelect: (space: Space) => void
}

function formatFloorShort(floor: number): string {
  if (floor === 0) {
    return 'Ground'
  }

  if (floor < 0) {
    return `B${Math.abs(floor)}`
  }

  return `Floor ${floor}`
}

function getRateParts(space: Space): { amount: string; unit: string } | null {
  const currency = space.currency ?? 'PLN'

  if (space.type === SpaceType.Room && space.monthlySubscriptionRate != null) {
    return {
      amount: space.monthlySubscriptionRate.toFixed(2),
      unit: `${currency} / month`,
    }
  }

  if (space.hourlyRate != null) {
    return {
      amount: space.hourlyRate.toFixed(2),
      unit: `${currency} / hour`,
    }
  }

  return null
}

function TypeBadge({ type }: { type: Space['type'] }) {
  return (
    <span className="inline-flex rounded-pill bg-[color:var(--of-fill)] px-2.5 py-1 text-[0.75rem] font-medium tracking-[0.01em] text-ink-600">
      {getSpaceTypeLabel(type)}
    </span>
  )
}

function EmptyCell() {
  return <span className="text-ink-400/40">–</span>
}

function thClass(align: 'left' | 'right' = 'left'): string {
  return [
    'px-4 py-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-ink-400',
    align === 'right' ? 'text-right' : 'text-left',
  ].join(' ')
}

function tdClass(align: 'left' | 'right' = 'left'): string {
  return [
    'px-4 py-3 align-middle',
    align === 'right' ? 'text-right' : 'text-left',
  ].join(' ')
}

export function SpaceList({
  spaces,
  selectedSpaceId,
  onSelect,
}: SpaceListProps) {
  const pagination = useClientPagination(spaces)

  return (
    <div className="space-y-3">
      <div className="of-surface of-enter-delayed overflow-x-auto">
        <table className="min-w-full text-[0.875rem]">
          <thead>
            <tr className="border-b border-[color:var(--of-separator)]">
              <th className={thClass()}>Space</th>
              <th className={thClass()}>Type</th>
              <th className={thClass()}>Floor</th>
              <th className={thClass('right')}>Price</th>
              <th className={thClass('right')}>Area</th>
              <th className={thClass('right')}>Capacity</th>
              <th className={thClass()}>Spot</th>
            </tr>
          </thead>
          <tbody>
            {pagination.items.map((space) => {
              const isSelected = selectedSpaceId === space.id
              const rate = getRateParts(space)
              const isRoom = space.type === SpaceType.Room
              const isParking = space.type === SpaceType.ParkingSpace

              return (
                <tr
                  key={space.id}
                  className={[
                    'of-row cursor-pointer border-b border-[color:var(--of-separator)] last:border-b-0',
                    isSelected ? 'bg-brand-50/35' : '',
                  ].join(' ')}
                  onClick={() => onSelect(space)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onSelect(space)
                    }
                  }}
                  tabIndex={0}
                  aria-selected={isSelected}
                >
                  <td className={tdClass()}>
                    <p className="font-semibold tracking-[-0.015em] text-ink-900">
                      {space.name}
                    </p>
                    <p className="of-caption mt-0.5 font-normal tracking-[0.02em]">
                      {space.code}
                    </p>
                  </td>

                  <td className={tdClass()}>
                    <TypeBadge type={space.type} />
                  </td>

                  <td className={`${tdClass()} text-ink-600`}>
                    {formatFloorShort(space.floorNumber)}
                  </td>

                  <td className={tdClass('right')}>
                    {rate ? (
                      <div className="leading-tight">
                        <p className="font-semibold tabular-nums tracking-[-0.01em] text-brand-700">
                          {rate.amount}
                        </p>
                        <p className="of-caption mt-0.5 font-normal">
                          {rate.unit}
                        </p>
                      </div>
                    ) : (
                      <EmptyCell />
                    )}
                  </td>

                  <td
                    className={`${tdClass('right')} tabular-nums text-ink-700`}
                  >
                    {isRoom && space.areaSquareMeters != null ? (
                      <>
                        {space.areaSquareMeters}
                        <span className="of-caption ml-1 font-normal">m²</span>
                      </>
                    ) : (
                      <EmptyCell />
                    )}
                  </td>

                  <td
                    className={`${tdClass('right')} tabular-nums text-ink-700`}
                  >
                    {isRoom && space.capacity != null ? (
                      <>
                        {space.capacity}
                        <span className="of-caption ml-1 font-normal">
                          seats
                        </span>
                      </>
                    ) : (
                      <EmptyCell />
                    )}
                  </td>

                  <td className={`${tdClass()} text-ink-700`}>
                    {isParking && space.spotNumber ? (
                      <span className="font-medium tracking-[-0.01em]">
                        {space.spotNumber}
                      </span>
                    ) : (
                      <EmptyCell />
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <PaginationBar
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        from={pagination.from}
        to={pagination.to}
        canGoPrev={pagination.canGoPrev}
        canGoNext={pagination.canGoNext}
        onPrev={pagination.goPrev}
        onNext={pagination.goNext}
      />
    </div>
  )
}
