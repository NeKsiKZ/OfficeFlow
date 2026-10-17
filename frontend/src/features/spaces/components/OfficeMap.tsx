import { useMemo, useState } from 'react'
import { buildMapPlacements } from '../mapLayout'
import { SpaceType, type Space } from '../types'
import { SpaceDetailsPanel } from './SpaceDetailsPanel'

interface OfficeMapProps {
  spaces: Space[]
}

export function OfficeMap({ spaces }: OfficeMapProps) {
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null)
  const placements = useMemo(() => buildMapPlacements(spaces), [spaces])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <Legend swatch="bg-sky-100 border-sky-400" label="Desk" />
        <Legend swatch="bg-amber-100 border-amber-500" label="Room" />
        <Legend swatch="bg-stone-200 border-stone-500" label="Parking" />
        <span className="of-caption">Press a space to open details</span>
      </div>

      <div
        className="relative aspect-[16/10] w-full overflow-hidden rounded-[22px] border border-ink-200/80 bg-[#ebe8e1] shadow-material"
        style={{
          backgroundImage:
            'linear-gradient(rgba(60,60,67,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(60,60,67,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        role="application"
        aria-label="Interactive office floor map"
      >
        <div className="pointer-events-none absolute inset-[18%] rounded-2xl border border-dashed border-ink-400/30 bg-white/25" />
        <p className="pointer-events-none absolute left-1/2 top-[48%] -translate-x-1/2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">
          Open office
        </p>
        <p className="pointer-events-none absolute bottom-[6%] left-1/2 -translate-x-1/2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">
          Parking
        </p>

        {placements.map((placement) => {
          const isSelected = selectedSpace?.id === placement.space.id
          const inactive = !placement.space.isActive

          return (
            <button
              key={placement.space.id}
              type="button"
              title={placement.space.name}
              onClick={() => setSelectedSpace(placement.space)}
              className={[
                'of-map-tile border-2 shadow-sm',
                'hover:z-20 hover:scale-[1.03] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
                getTypeStyles(placement.space.type),
                isSelected
                  ? 'z-20 scale-[1.04] border-brand-700 shadow-md ring-2 ring-brand-500/40'
                  : '',
                inactive ? 'opacity-45' : '',
              ].join(' ')}
              style={{
                left: `${placement.leftPercent}%`,
                top: `${placement.topPercent}%`,
                width: `${placement.widthPercent}%`,
                height: `${placement.heightPercent}%`,
              }}
            >
              <span className="line-clamp-2 text-[10px] font-semibold leading-tight tracking-[-0.01em] text-ink-900 sm:text-xs">
                {placement.space.name}
              </span>
              <span className="mt-0.5 hidden text-[9px] font-medium uppercase tracking-[0.06em] text-ink-500 sm:block">
                {placement.space.code}
              </span>
            </button>
          )
        })}
      </div>

      <SpaceDetailsPanel
        space={selectedSpace}
        onClose={() => setSelectedSpace(null)}
      />
    </div>
  )
}

function getTypeStyles(type: SpaceType): string {
  switch (type) {
    case SpaceType.Desk:
      return 'border-sky-400 bg-sky-100/95 hover:border-sky-600 hover:bg-sky-200'
    case SpaceType.Room:
      return 'border-amber-500 bg-amber-100/95 hover:border-amber-700 hover:bg-amber-200'
    case SpaceType.ParkingSpace:
      return 'border-stone-500 bg-stone-200/95 hover:border-stone-700 hover:bg-stone-300'
    default:
      return 'border-stone-400 bg-white'
  }
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="of-caption inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-[4px] border ${swatch}`} />
      {label}
    </span>
  )
}
