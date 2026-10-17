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
      <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
        <Legend swatch="bg-sky-100 border-sky-400" label="Desk" />
        <Legend swatch="bg-amber-100 border-amber-500" label="Room" />
        <Legend swatch="bg-stone-200 border-stone-500" label="Parking" />
        <span>Click a space to view details and reserve</span>
      </div>

      <div
        className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border-[6px] border-stone-700 bg-[#ebe6dc] shadow-inner"
        style={{
          backgroundImage:
            'linear-gradient(rgba(120,113,108,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(120,113,108,0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        role="application"
        aria-label="Interactive office floor map"
      >
        {/* Corridor / open office silhouette */}
        <div className="pointer-events-none absolute inset-[18%] rounded-lg border border-dashed border-stone-400/50 bg-white/20" />
        <p className="pointer-events-none absolute left-1/2 top-[48%] -translate-x-1/2 text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">
          Open office
        </p>
        <p className="pointer-events-none absolute bottom-[6%] left-1/2 -translate-x-1/2 text-[10px] font-medium uppercase tracking-[0.2em] text-stone-500">
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
                'absolute flex flex-col items-center justify-center overflow-hidden rounded-md border-2 px-1 text-center shadow-sm transition duration-150',
                'hover:z-20 hover:scale-[1.04] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
                getTypeStyles(placement.space.type),
                isSelected
                  ? 'z-20 scale-[1.05] border-brand-700 ring-2 ring-brand-500/50'
                  : '',
                inactive ? 'opacity-50' : '',
              ].join(' ')}
              style={{
                left: `${placement.leftPercent}%`,
                top: `${placement.topPercent}%`,
                width: `${placement.widthPercent}%`,
                height: `${placement.heightPercent}%`,
              }}
            >
              <span className="line-clamp-2 text-[10px] font-semibold leading-tight text-stone-800 sm:text-xs">
                {placement.space.name}
              </span>
              <span className="mt-0.5 hidden text-[9px] uppercase tracking-wide text-stone-500 sm:block">
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
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-sm border ${swatch}`} />
      {label}
    </span>
  )
}
