import { useMemo, useState } from 'react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { LoadingBlock, StatusBlock } from '../../../components/ui/StatusBlock'
import { useSpaces } from '../hooks/useSpaces'
import type { SpaceFilters } from '../spacesApi'
import type { Space } from '../types'
import { OfficeMap } from './OfficeMap'
import { SpaceDetailsPanel } from './SpaceDetailsPanel'
import { SpaceFilterBar } from './SpaceFilterBar'
import { SpaceList } from './SpaceList'
import {
  SpacesViewSwitcher,
  type SpacesViewMode,
} from './SpacesViewSwitcher'

export function SpacesPage() {
  const [view, setView] = useState<SpacesViewMode>('map')
  const [filters, setFilters] = useState<SpaceFilters>({})
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null)
  const { spaces, isLoading, error, refetch } = useSpaces(filters)

  const listSpaces = useMemo(
    () => spaces.filter((space) => space.isActive),
    [spaces],
  )

  const showWorkspace =
    !isLoading &&
    !error &&
    ((view === 'map' && spaces.length > 0) ||
      (view === 'list' && listSpaces.length > 0))

  function handleViewChange(next: SpacesViewMode) {
    setView(next)
    setSelectedSpace(null)
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Spaces"
        description={
          view === 'map'
            ? 'Switch floors (−2…2), filter spaces, then press a desk, room, or parking spot to reserve.'
            : 'Browse available spaces as a list — price, area, and capacity — then select one to reserve.'
        }
        action={
          <SpacesViewSwitcher value={view} onChange={handleViewChange} />
        }
      />

      <div className="of-enter-delayed">
        <SpaceFilterBar filters={filters} onChange={setFilters} />
      </div>

      {isLoading ? (
        <LoadingBlock
          label={
            view === 'map' ? 'Loading office map...' : 'Loading spaces...'
          }
        />
      ) : null}

      {error ? (
        <StatusBlock
          tone="error"
          title="Could not load spaces"
          action={
            <button type="button" onClick={refetch} className="of-btn-primary">
              Try again
            </button>
          }
        >
          {error}
        </StatusBlock>
      ) : null}

      {!isLoading && !error && view === 'map' && spaces.length === 0 ? (
        <StatusBlock>No spaces match the selected filters.</StatusBlock>
      ) : null}

      {!isLoading && !error && view === 'list' && listSpaces.length === 0 ? (
        <StatusBlock>
          No available spaces match the selected filters.
        </StatusBlock>
      ) : null}

      {showWorkspace ? (
        <div className="of-enter-delayed grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-start">
          <div className="min-w-0">
            {view === 'map' ? (
              <OfficeMap
                spaces={spaces}
                selectedSpace={selectedSpace}
                onSelect={setSelectedSpace}
              />
            ) : (
              <SpaceList
                spaces={listSpaces}
                selectedSpaceId={selectedSpace?.id}
                onSelect={setSelectedSpace}
              />
            )}
          </div>

          <SpaceDetailsPanel
            space={selectedSpace}
            onClose={() => setSelectedSpace(null)}
          />
        </div>
      ) : null}
    </section>
  )
}
