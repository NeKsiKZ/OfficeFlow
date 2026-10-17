import { useMemo, useState } from 'react'
import {
  DEFAULT_CAMPUS_FLOOR,
  formatFloorLabel,
  type CampusFloor,
} from '../floors'
import { buildMapPlacements, getCampusZonesForFloor } from '../mapLayout'
import type { Space } from '../types'
import { CampusMapCanvas } from './CampusMapCanvas'
import { FloorSwitcher } from './FloorSwitcher'
import { SpaceDetailsPanel } from './SpaceDetailsPanel'

interface OfficeMapProps {
  spaces: Space[]
}

export function OfficeMap({ spaces }: OfficeMapProps) {
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null)
  const [floor, setFloor] = useState<CampusFloor>(DEFAULT_CAMPUS_FLOOR)

  const occupiedFloors = useMemo(
    () => [...new Set(spaces.map((space) => space.floorNumber))],
    [spaces],
  )

  const zones = useMemo(() => getCampusZonesForFloor(floor), [floor])
  const placements = useMemo(
    () => buildMapPlacements(spaces, floor),
    [spaces, floor],
  )

  function handleFloorChange(next: CampusFloor) {
    setFloor(next)
    setSelectedSpace(null)
  }

  return (
    <div className="space-y-4">
      <FloorSwitcher
        value={floor}
        onChange={handleFloorChange}
        occupiedFloors={occupiedFloors}
      />

      <div className="flex flex-wrap items-center gap-4">
        <Legend swatch="of-map-tile--desk" label="Desk" />
        <Legend swatch="of-map-tile--room" label="Room" />
        <Legend swatch="of-map-tile--parking" label="Parking" />
        <span className="of-caption">
          {floor === 1
            ? '2 cabinet rooms · 5 open-office desks'
            : floor === 0
              ? '4 outdoor parking spots'
              : 'Empty floor — layout customization coming later'}
        </span>
      </div>

      <CampusMapCanvas
        floor={floor}
        zones={zones}
        placements={placements}
        selectedSpace={selectedSpace}
        onSelect={setSelectedSpace}
        ariaLabel={`Interactive office map, ${formatFloorLabel(floor)}`}
      />

      <SpaceDetailsPanel
        space={selectedSpace}
        onClose={() => setSelectedSpace(null)}
      />
    </div>
  )
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="of-caption inline-flex items-center gap-1.5">
      <span className={`inline-block h-2.5 w-2.5 rounded-[4px] border ${swatch}`} />
      {label}
    </span>
  )
}
